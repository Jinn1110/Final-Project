import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Device, DeviceDocument } from './schemas/device.schema';
import { CreateDeviceDto } from './dto/create-device.dto';
import {
  JammingStatus,
  SpoofingStatus,
} from '../common/enums/device-status.enum';

@Injectable()
export class DevicesService {
  constructor(
    @InjectModel(Device.name)
    private readonly deviceModel: Model<DeviceDocument>,
  ) {}

  // Tạo device mới
  async createDevice(createDto: CreateDeviceDto): Promise<Device> {
    const device = new this.deviceModel({
      device_id: createDto.device_id,
      name: createDto.name,
      metadata: createDto.metadata ?? {},
      spoofingStatus: SpoofingStatus.NONE,
      jammingStatus: JammingStatus.NONE,
    });
    return device.save();
  }

  // Lấy tất cả device
  async findAll(): Promise<Device[]> {
    return this.deviceModel.find().lean();
  }

  // Lấy device theo device_id
  async findOneByDeviceId(deviceId: string): Promise<Device | null> {
    return this.deviceModel.findOne({ device_id: deviceId }).lean();
  }

  // Cập nhật device (chỉ name hoặc metadata)
  async updateDevice(
    deviceId: string,
    update: Partial<{ name: string; metadata: Record<string, any> }>,
  ): Promise<Device | null> {
    return this.deviceModel
      .findOneAndUpdate(
        { device_id: deviceId },
        { $set: update },
        { new: true },
      )
      .lean();
  }

  // Cập nhật last known GNSS khi ingest track mới
  async updateLastKnownGNSS(
    deviceId: string,
    update: Partial<{
      latitude: number;
      longitude: number;
      sats?: number;
      cn0?: number;
      spoofingStatus?: SpoofingStatus;
      jammingStatus?: JammingStatus;
      total_quality?: number;
      gps_quality?: number;
      gal_quality?: number;
      glo_quality?: number;
      bds_quality?: number;
      last_seen: Date;
    }>,
  ): Promise<Device | null> {
    return this.deviceModel
      .findOneAndUpdate(
        { device_id: deviceId },
        { $set: update },
        { new: true, upsert: true }, // upsert: tạo device nếu chưa tồn tại
      )
      .lean();
  }
}
