import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  JammingStatus,
  SpoofingStatus,
} from '../../common/enums/device-status.enum';

export type TrackDocument = HydratedDocument<Track>;

@Schema({ timestamps: false, collection: 'tracks' })
export class Track {
  @Prop({ required: true, index: true })
  device_id: string; // MUST use this consistently everywhere

  @Prop({ required: true, index: true })
  ts: Date;

  @Prop({ required: true })
  lat: number;

  @Prop({ required: true })
  lon: number;

  @Prop()
  alt?: number;

  @Prop()
  fix_type?: string;

  @Prop()
  sats?: number; // số lượng vệ tinh ở thời điểm track

  @Prop()
  cn0?: number;

  @Prop({ enum: SpoofingStatus, default: SpoofingStatus.NONE })
  spoofingStatus: SpoofingStatus;

  @Prop({ enum: JammingStatus, default: JammingStatus.NONE })
  jammingStatus: JammingStatus;

  @Prop({ type: Object })
  payload?: Record<string, any>;

  @Prop()
  total_quality: number; // 0-100

  @Prop()
  gps_quality: number; // %

  @Prop()
  gal_quality: number;

  @Prop()
  glo_quality: number;

  @Prop()
  bds_quality: number;
}

export const TrackSchema = SchemaFactory.createForClass(Track);

// best index pattern cho query realtime + playback
TrackSchema.index({ device_id: 1, ts: -1 });
