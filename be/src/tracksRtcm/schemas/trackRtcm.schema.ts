// src/track-rtcm/schemas/track-rtcm.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TrackRtcmDocument = HydratedDocument<TrackRtcm>;

@Schema({ timestamps: true, collection: 'track_rtcm' })
export class TrackRtcm {
  @Prop({ required: true, index: true })
  deviceId: string;

  @Prop({ required: true })
  timestamp: string; // ISO string của thời gian gửi JSON

  @Prop({ type: { latitude: Number, longitude: Number }, required: true })
  location: {
    latitude: number;
    longitude: number;
  };

  @Prop({ default: 0 })
  total_sats: number;

  @Prop({ default: 0 })
  total_bands: number;

  @Prop({ default: 0 })
  total_signals: number;

  @Prop({ default: 0 })
  avg_cn0_dbhz: number;

  @Prop({ type: Array, default: [] })
  constellations: any[];
}

export const TrackRtcmSchema = SchemaFactory.createForClass(TrackRtcm);
