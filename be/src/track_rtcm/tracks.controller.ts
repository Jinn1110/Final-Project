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
import { TracksService } from './tracks.service';
import { DevicesService } from '../devices/devices.service';
import { Public } from '../common/decorators/isPublic';

@Controller('tracks')
export class TracksController {
  constructor(
    private readonly tracksService: TracksService,
    private readonly devicesService: DevicesService,
  ) {}

  // Lấy vị trí mới nhất của tất cả thiết bị (dùng cho Map realtime)
  @Get('latest/all')
  @Public()
  async getLatestAll() {
    return this.tracksService.getLatestForAllDevices();
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

    return this.tracksService.getLatestTracks(deviceId, numLimit);
  }

  // Lấy lịch sử dữ liệu theo khoảng thời gian (QUAN TRỌNG CHO CHARTS)
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

    return this.tracksService.getHistory(
      deviceId,
      startDate,
      endDate,
      numLimit,
    );
  }

  // Ingest dữ liệu track từ thiết bị
  @Post()
  @Public()
  async createTrack(@Body() payload: any) {
    // Frontend gửi deviceId (camelCase)
    if (!payload.deviceId || !payload.timestamp) {
      throw new BadRequestException('Thiếu deviceId hoặc timestamp');
    }

    const deviceId = payload.deviceId;

    await this.validateDevice(deviceId);

    const savedTrack = await this.tracksService.ingest(payload);

    if (!savedTrack) {
      throw new BadRequestException('Lưu track thất bại');
    }

    // Cập nhật lastSeen cho device
    await this.devicesService.updateLastSeen(
      deviceId,
      new Date(payload.timestamp),
    );

    return {
      success: true,
      message: 'Track ingested successfully',
      data: savedTrack,
    };
  }

  // Phương thức riêng để validate device
  private async validateDevice(deviceId: string) {
    const device = await this.devicesService.findOneByDeviceId(deviceId);
    if (!device) {
      throw new NotFoundException(`Device "${deviceId}" không tồn tại`);
    }
    return device;
  }
}
