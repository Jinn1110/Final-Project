import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Track, TrackDocument } from './schemas/track.schema';

@Injectable()
export class TracksService {
  constructor(
    @InjectModel(Track.name) private trackModel: Model<TrackDocument>,
  ) {}

  // Lấy các track mới nhất theo device
  async getLatestTracks(deviceId: string, limit: number = 100) {
    return this.trackModel
      .find({ device_id: deviceId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
  }

  // Ingest dữ liệu từ HTTP POST
  async ingest(payload: any) {
    // Validate cơ bản
    if (
      !payload.device_id ||
      !payload.timestamp ||
      !payload.location ||
      payload.location.latitude === undefined ||
      payload.location.longitude === undefined
    ) {
      console.warn('Invalid payload, cannot ingest', payload);
      return false;
    }

    const doc: Partial<Track> = {
      device_id: payload.device_id,
      timestamp: new Date(payload.timestamp),
      location: {
        latitude: payload.location.latitude,
        longitude: payload.location.longitude,
      },
      num_sats_used: payload.num_sats_used ?? null,
      dop: payload.dop ?? null,
      time_accuracy: payload.time_accuracy ?? {},
      cn0_total: payload.cn0_total ?? null,
      constellations: payload.constellations ?? [],
      waterfall: payload.waterfall ?? [],
      rf_status: payload.rf_status ?? [],
      position_deviation: payload.position_deviation ?? null,
      posCov: payload.posCov ?? null,
    };

    try {
      await this.trackModel.create(doc);
      return true;
    } catch (err) {
      console.error('Error saving track to DB:', err);
      return false;
    }
  }
}
