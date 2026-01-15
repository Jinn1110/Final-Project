// src/device/device.cleanup.service.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose'; // Đường dẫn đúng tới schema
import { Device } from './schemas/device.schema';

@Injectable()
export class DeviceCleanupService {
  constructor(
    @InjectModel(Device.name) private readonly deviceModel: Model<Device>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCleanup() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await this.deviceModel.deleteMany({
      isDeleted: true,
      deletedAt: { $lt: sevenDaysAgo },
    });

    console.log(`Đã xóa cứng ${result.deletedCount} thiết bị quá 7 ngày`);
  }
}
