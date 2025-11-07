import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  JammingStatus,
  SpoofingStatus,
} from '../../common/enums/device-status.enum';

export type DeviceDocument = HydratedDocument<Device>;

@Schema({ timestamps: true, collection: 'devices' })
export class Device {
  @Prop({ required: true, unique: true })
  device_id: string; // phải nhất quán với Track.device_id

  @Prop()
  device_secret_hash: string; // hash, không lưu plain text

  @Prop({ required: true })
  name: string;

  @Prop({ type: Object })
  metadata: Record<string, any>;

  // last known GNSS fix
  @Prop()
  latitude?: number;

  @Prop()
  longitude?: number;

  @Prop()
  sats?: number;

  @Prop({ enum: SpoofingStatus, default: SpoofingStatus.NONE })
  spoofingStatus: SpoofingStatus;

  @Prop({ enum: JammingStatus, default: JammingStatus.NONE })
  jammingStatus: JammingStatus;

  @Prop({ type: Number, min: 0, max: 60 })
  cn0?: number;

  @Prop()
  last_seen?: Date;

  // optional: tổng hợp chất lượng GNSS từ track
  @Prop()
  total_quality?: number;

  @Prop()
  gps_quality?: number;

  @Prop()
  gal_quality?: number;

  @Prop()
  glo_quality?: number;

  @Prop()
  bds_quality?: number;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

// index device_id để query nhanh
DeviceSchema.index({ device_id: 1 });
