// src/track-rtcm/track-rtcm.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TrackRtcmService } from './track-rtcm.service';
import { TrackRtcmController } from './track-rtcm.controller';
import { TrackRtcm, TrackRtcmSchema } from './schemas/trackRtcm.schema';
import { DevicesModule } from '../devices/devices.module';

@Module({
  imports: [
    DevicesModule,
    MongooseModule.forFeature([
      { name: TrackRtcm.name, schema: TrackRtcmSchema },
    ]),
  ],
  controllers: [TrackRtcmController],
  providers: [TrackRtcmService],
})
export class TrackRtcmModule {}
