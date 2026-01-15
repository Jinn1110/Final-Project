// track-rtcm.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { TrackRtcmService } from './track-rtcm.service';
import { DevicesService } from '../devices/devices.service';
import { Public } from '../common/decorators/isPublic';

@Controller('track-rtcm')
export class TrackRtcmController {
  constructor(
    private readonly trackRtcmService: TrackRtcmService,
    private readonly devicesService: DevicesService,
  ) {}

  // Lấy dữ liệu mới nhất của tất cả thiết bị RTCM
  @Get('latest/all')
  @Public()
  async getLatestAll() {
    return this.trackRtcmService.getLatestForAllDevices?.() || [];
  }

  // Lấy dữ liệu mới nhất của một thiết bị
  @Get(':deviceId/latest')
  @Public()
  async getLatest(
    @Param('deviceId') deviceId: string,
    @Query('limit') limit: string = '1',
  ) {
    await this.validateDevice(deviceId);

    const numLimit = Math.max(1, Math.min(parseInt(limit) || 1, 100));

    return this.trackRtcmService
      .findByDevice(deviceId)
      .then((tracks) => tracks.slice(0, numLimit));
  }

  // Lấy lịch sử dữ liệu theo khoảng thời gian
  @Get(':deviceId/history')
  @Public()
  async getHistory(
    @Param('deviceId') deviceId: string,
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('limit') limit: string = '1000',
  ) {
    if (!start || !end) {
      throw new BadRequestException('Tham số "start" và "end" là bắt buộc');
    }

    await this.validateDevice(deviceId);

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException(
        'Định dạng ngày giờ không hợp lệ (ISO expected)',
      );
    }

    if (startDate > endDate) {
      throw new BadRequestException('start phải nhỏ hơn hoặc bằng end');
    }

    const numLimit = Math.max(1, Math.min(parseInt(limit) || 1000, 5000));

    const tracks = await this.trackRtcmService.findByDevice(deviceId);
    const filtered = tracks.filter(
      (t) =>
        new Date(t.timestamp) >= startDate && new Date(t.timestamp) <= endDate,
    );

    return filtered.slice(0, numLimit);
  }

  // Ingest dữ liệu RTCM từ thiết bị
  @Post()
  @Public()
  async createTrack(@Body() payload: any) {
    if (!payload.deviceId) {
      throw new BadRequestException('Thiếu deviceId');
    }

    const deviceId = payload.deviceId;
    await this.validateDevice(deviceId);

    // Gán timestamp hiện tại khi gửi JSON
    payload.timestamp = new Date().toISOString();

    const savedTrack = await this.trackRtcmService.create(payload);

    if (!savedTrack) {
      throw new BadRequestException('Lưu track RTCM thất bại');
    }

    // Cập nhật lastSeen cho device
    await this.devicesService.updateLastSeen(
      deviceId,
      new Date(payload.timestamp),
    );

    return {
      success: true,
      message: 'Track RTCM ingested successfully',
      data: savedTrack,
    };
  }

  // Validate device
  private async validateDevice(deviceId: string) {
    const device = await this.devicesService.findOneByDeviceId(deviceId);
    if (!device) {
      throw new NotFoundException(`Device "${deviceId}" không tồn tại`);
    }
    return device;
  }
}
