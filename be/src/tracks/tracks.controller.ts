import { Controller, Get, Param, Query } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TracksService } from './tracks.service';

@Controller('tracks')
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  @Get(':deviceId/latest')
  async getLatest(
    @Param('deviceId') deviceId: string,
    @Query('limit') limit: number = 100,
  ) {
    return this.tracksService.getLatestTracks(deviceId, +limit);
  }

  @MessagePattern('gnss/tracks/#')
  async handleTrack(@Payload() data: any) {
    // Nếu MQTT gửi string JSON, parse
    console.log(data);
    const payload = typeof data === 'string' ? JSON.parse(data) : data;

    if (!payload.device_id) {
      console.warn('Invalid track payload, missing device_id', payload);
      return;
    }

    return this.tracksService.ingest(payload);
  }
}
