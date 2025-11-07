import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import { Track, TrackSchema } from './schemas/track.schema';
import { TracksController } from './tracks.controller';
import { TracksService } from './tracks.service';
import { DevicesModule } from '../devices/devices.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Track.name, schema: TrackSchema }]),
    DevicesModule,
  ],
  controllers: [TracksController],
  providers: [TracksService],
})
export class TracksModule {}
