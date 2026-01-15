import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Track, TrackDocument } from './schemas/track.schema';
import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class TracksService {
  constructor(
    @InjectModel(Track.name) private readonly trackModel: Model<TrackDocument>,
    private readonly socketGateway: SocketGateway,
  ) {}

  /**
   * Lấy track mới nhất của tất cả thiết bị (1 track/device)
   * Dùng cho Map realtime
   */
  async getLatestForAllDevices() {
    return this.trackModel.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: '$deviceId',
          latest: { $first: '$$ROOT' },
        },
      },
      { $replaceRoot: { newRoot: '$latest' } },
    ]);
  }

  /**
   * Lấy các track mới nhất của một thiết bị
   * @param deviceId - ID thiết bị (chuẩn frontend)
   * @param limit - Số lượng bản ghi (mặc định 1)
   */
  async getLatestTracks(deviceId: string, limit = 1) {
    return this.trackModel
      .find({ deviceId: deviceId }) // query bằng deviceId trong DB
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean()
      .exec();
  }

  /**
   * LẤY LỊCH SỬ TRACK THEO KHOẢNG THỜI GIAN - QUAN TRỌNG CHO CHARTS
   * @param deviceId - ID thiết bị (chuẩn frontend)
   * @param startDate - Date object
   * @param endDate - Date object
   * @param limit - Giới hạn số bản ghi (đã giới hạn an toàn ở controller)
   */
  async getHistory(
    deviceId: string,
    startDate: Date,
    endDate: Date,
    limit = 1000,
  ) {
    return this.trackModel
      .find({
        deviceId: deviceId, // query bằng deviceId
        timestamp: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .sort({ timestamp: 1 }) // tăng dần để dễ xử lý ở frontend
      .limit(limit)
      .lean()
      .exec();
  }

  /**
   * Ingest dữ liệu GNSS track từ thiết bị
   * Frontend gửi deviceId (camelCase)
   * @param payload - Dữ liệu gốc từ thiết bị
   * @returns Track đã lưu hoặc false nếu lỗi
   */
  async ingest(payload: any): Promise<any> {
    // Validate bắt buộc - dùng deviceId từ frontend
    if (
      !payload.deviceId ||
      !payload.timestamp ||
      !payload.location ||
      payload.location.latitude == null ||
      payload.location.longitude == null
    ) {
      console.warn('Invalid payload, cannot ingest:', payload);
      return false;
    }

    const track: Partial<Track> = {
      deviceId: payload.deviceId, // lưu vào DB là deviceId (snake_case)
      timestamp: new Date(payload.timestamp),

      location: {
        latitude: Number(payload.location.latitude),
        longitude: Number(payload.location.longitude),
      },

      num_sats_used: payload.num_sats_used ?? undefined,
      dop: payload.dop ?? undefined,
      time_accuracy: payload.time_accuracy ?? undefined,
      cn0_total: payload.cn0_total ?? undefined,

      constellations: Array.isArray(payload.constellations)
        ? payload.constellations
        : [],

      waterfall: Array.isArray(payload.waterfall) ? payload.waterfall : [],

      rf_status: Array.isArray(payload.rf_status) ? payload.rf_status : [],

      position_deviation: payload.position_deviation ?? undefined,
      posCov: payload.posCov ?? undefined,
    };

    try {
      const savedTrack = await this.trackModel.create(track);

      this.socketGateway.broadcastNewTrack(savedTrack.toObject());
      return savedTrack;
    } catch (err) {
      console.error('Error saving track:', err);
      return false;
    }
  }
}
