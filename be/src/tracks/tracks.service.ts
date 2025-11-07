import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Track, TrackDocument } from './schemas/track.schema';
import { DevicesService } from '../devices/devices.service';
import {
  JammingStatus,
  SpoofingStatus,
} from '../common/enums/device-status.enum';

@Injectable()
export class TracksService {
  constructor(
    @InjectModel(Track.name) private trackModel: Model<TrackDocument>,
    private readonly devicesService: DevicesService,
  ) {}

  // Lấy các track mới nhất theo device
  async getLatestTracks(deviceId: string, limit: number = 100) {
    return this.trackModel
      .find({ device_id: deviceId })
      .sort({ ts: -1 })
      .limit(limit)
      .lean();
  }

  // Ingest dữ liệu từ MQTT
  async ingest(payload: any) {
    if (
      !payload.device_id ||
      !payload.ts ||
      payload.lat === undefined ||
      payload.lon === undefined
    ) {
      console.warn('Invalid payload, cannot ingest', payload);
      return false;
    }

    const doc: Partial<Track> = {
      device_id: payload.device_id,
      ts: new Date(payload.ts),
      lat: payload.lat,
      lon: payload.lon,
      alt: payload.alt,
      fix_type: payload.fix_type,
      sats: payload.sats,
      cn0: payload.cn0,
      spoofingStatus: payload.spoofingStatus ?? SpoofingStatus.NONE,
      jammingStatus: payload.jammingStatus ?? JammingStatus.NONE,
      total_quality: payload.total_quality ?? 0,
      gps_quality: payload.gps_quality ?? 0,
      gal_quality: payload.gal_quality ?? 0,
      glo_quality: payload.glo_quality ?? 0,
      bds_quality: payload.bds_quality ?? 0,
      payload: payload.payload ?? {}, // chỉ lưu phần dữ liệu mở rộng
    };

    // Lưu track vào MongoDB
    await this.trackModel.create(doc);

    // Cập nhật last known GNSS của device
    await this.devicesService.updateLastKnownGNSS(payload.device_id, {
      latitude: payload.lat,
      longitude: payload.lon,
      sats: payload.sats,
      cn0: payload.cn0,
      spoofingStatus: payload.spoofingStatus ?? SpoofingStatus.NONE,
      jammingStatus: payload.jammingStatus ?? JammingStatus.NONE,
      total_quality: payload.total_quality ?? 0,
      gps_quality: payload.gps_quality ?? 0,
      gal_quality: payload.gal_quality ?? 0,
      glo_quality: payload.glo_quality ?? 0,
      bds_quality: payload.bds_quality ?? 0,
      last_seen: new Date(payload.ts),
    });

    return true;
  }
}
