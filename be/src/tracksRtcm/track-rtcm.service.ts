// track-rtcm.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TrackRtcm, TrackRtcmDocument } from './schemas/trackRtcm.schema';
import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class TrackRtcmService {
  constructor(
    @InjectModel(TrackRtcm.name)
    private readonly trackRtcmModel: Model<TrackRtcmDocument>,
    private readonly socketGateway: SocketGateway,
  ) {}

  /**
   * Tạo track RTCM mới
   * @param data - dữ liệu JSON RTCM từ NTRIP
   * Nếu data chưa có location, sẽ tự động thêm mặc định
   */
  async create(data: Partial<TrackRtcm>): Promise<TrackRtcm> {
    // tọa độ mặc định
    const defaultLocation = {
      latitude: 21.0045045,
      longitude: 105.8463395,
    };

    const doc = new this.trackRtcmModel({
      ...data,
      location: data.location || defaultLocation, // thêm mặc định nếu chưa có
      timestamp: new Date(), // timestamp hiện tại
    });

    const saved = await doc.save();
    this.socketGateway.broadcastNewTrack?.(saved.toObject());
    return saved;
  }

  /**
   * Lấy tất cả track
   */
  async findAll(): Promise<TrackRtcm[]> {
    return this.trackRtcmModel.find().sort({ timestamp: -1 }).lean().exec();
  }

  /**
   * Lấy track của 1 thiết bị
   * @param deviceId
   */
  async findByDevice(deviceId: string): Promise<TrackRtcm[]> {
    return this.trackRtcmModel
      .find({ deviceId })
      .sort({ timestamp: -1 })
      .lean()
      .exec();
  }

  /**
   * Lấy track mới nhất của tất cả thiết bị (1 track/device)
   * Dùng cho map realtime
   */
  async getLatestForAllDevices(): Promise<TrackRtcm[]> {
    return this.trackRtcmModel.aggregate([
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
   * @param deviceId - ID thiết bị
   * @param limit - số lượng bản ghi
   */
  async getLatestTracks(deviceId: string, limit = 1): Promise<TrackRtcm[]> {
    return this.trackRtcmModel
      .find({ deviceId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean()
      .exec();
  }

  /**
   * Lấy lịch sử track theo khoảng thời gian
   * @param deviceId
   * @param startDate
   * @param endDate
   * @param limit
   */
  async getHistory(
    deviceId: string,
    startDate: Date,
    endDate: Date,
    limit = 1000,
  ): Promise<TrackRtcm[]> {
    return this.trackRtcmModel
      .find({
        deviceId,
        timestamp: { $gte: startDate, $lte: endDate },
      })
      .sort({ timestamp: 1 })
      .limit(limit)
      .lean()
      .exec();
  }
}
