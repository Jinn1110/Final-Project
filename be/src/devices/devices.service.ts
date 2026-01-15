// src/devices/devices.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Device, DeviceDocument } from './schemas/device.schema';
import { CreateDeviceDto } from './dto/create-device.dto';

@Injectable()
export class DevicesService {
  constructor(
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
  ) {}

  async findAllDeleted(): Promise<Device[]> {
    return this.deviceModel
      .find({ isDeleted: true })
      .sort({ deletedAt: -1 })
      .lean();
  }

  // Lấy tất cả thiết bị đang hoạt động
  async findAllActive(): Promise<Device[]> {
    return this.deviceModel
      .find({ isDeleted: false })
      .sort({ lastSeen: -1 })
      .lean();
  }

  // Tìm thiết bị theo deviceId (dùng cho TracksController và các nơi khác)
  async findOneByDeviceId(deviceId: string): Promise<Device> {
    const device = await this.deviceModel.findOne({
      deviceId,
      isDeleted: false, // hoặc { isDeleted: { $ne: true } } nếu muốn linh hoạt
    });

    if (!device) {
      throw new NotFoundException(
        `Device với deviceId "${deviceId}" không tồn tại hoặc đã bị xóa`,
      );
    }

    return device;
  }

  // Tạo thiết bị
  async createDevice(dto: CreateDeviceDto, user): Promise<Device> {
    const existing = await this.deviceModel.findOne({ deviceId: dto.deviceId });
    if (existing && !existing.isDeleted) {
      throw new NotFoundException('Device ID đã tồn tại');
    }

    // Nếu đã tồn tại nhưng bị soft delete → có thể khôi phục hoặc báo lỗi tùy yêu cầu
    const device = new this.deviceModel({
      ...dto,
      isDeleted: false,
      deletedAt: null,
      owner: user.username,
    });
    return device.save();
  }

  // Soft delete
  async softDelete(deviceId: string): Promise<void> {
    const result = await this.deviceModel.updateOne(
      { deviceId, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
    );

    if (result.matchedCount === 0) {
      throw new NotFoundException(
        `Không tìm thấy thiết bị "${deviceId}" hoặc đã bị xóa trước đó`,
      );
    }
  }

  // Restore
  async restore(deviceId: string): Promise<void> {
    const result = await this.deviceModel.updateOne(
      { deviceId, isDeleted: true },
      { isDeleted: false, deletedAt: null },
    );

    if (result.matchedCount === 0) {
      throw new NotFoundException(
        `Không thể khôi phục: Thiết bị "${deviceId}" không tồn tại hoặc chưa bị xóa`,
      );
    }
  }
  async updateLastSeen(deviceId: string, timestamp?: Date): Promise<void> {
    const updateData: any = {
      lastSeen: timestamp || new Date(), // Nếu không có timestamp → dùng thời gian server
    };

    const result = await this.deviceModel.updateOne(
      { deviceId, isDeleted: false },
      { $set: updateData },
    );

    if (result.matchedCount === 0) {
      // Không tìm thấy thiết bị active → có thể log warning hoặc bỏ qua
      console.warn(
        `Device ${deviceId} not found or deleted - cannot update lastSeen`,
      );
      // Không throw error vì track vẫn có thể lưu được (thiết bị có thể bị xóa tạm)
    }
  }
}
