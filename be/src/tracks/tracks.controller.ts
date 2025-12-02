import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { TracksService } from './tracks.service';
import { Public } from '../common/decorators/isPublic';

@Controller('tracks')
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  // Lấy dữ liệu mới nhất của một thiết bị
  @Get(':deviceId/latest')
  async getLatest(
    @Param('deviceId') deviceId: string,
    @Query('limit') limit: number = 100,
  ) {
    return this.tracksService.getLatestTracks(deviceId, +limit);
  }

  @Post()
  @Public()
  async createTrack(@Body() payload: any) {
    // Kiểm tra payload cơ bản
    if (!payload.device_id || !payload.timestamp) {
      throw new BadRequestException('Missing device_id or timestamp');
    }
    console.log(payload);

    // Bạn có thể thêm validate chi tiết hơn ở đây nếu muốn

    // Gọi service để lưu vào DB
    return this.tracksService.ingest(payload);
  }
}
