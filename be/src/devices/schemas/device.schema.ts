import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DeviceDocument = Device & Document;

export enum DeviceType {
  RTCM = 'RTCM',
  UBX = 'UBX',
}

@Schema({
  collection: 'devices',
  timestamps: true,
})
export class Device {
  @Prop({
    required: true,
    unique: true,
    trim: true,
  })
  deviceId: string;

  @Prop({
    type: Date,
    default: null,
  })
  lastSeen: Date | null;

  @Prop({
    trim: true,
  })
  owner: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  isDeleted: boolean;

  @Prop({
    type: Date,
    default: null,
  })
  deletedAt: Date | null;

  // Thêm type để biết là RTCM hay UBX
  @Prop({
    type: String,
    enum: DeviceType,
    required: true,
  })
  type: DeviceType;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

// Indexes
DeviceSchema.index({ lastSeen: 1 });
DeviceSchema.index({ owner: 1 });
DeviceSchema.index({ isDeleted: 1 });
DeviceSchema.index({ deviceId: 1, isDeleted: 1 });
DeviceSchema.index({ type: 1 }); // thêm index cho type
