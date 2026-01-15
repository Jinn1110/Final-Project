import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DeviceDocument = Device & Document;

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
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

DeviceSchema.index({ lastSeen: 1 });
DeviceSchema.index({ owner: 1 });
DeviceSchema.index({ isDeleted: 1 });
DeviceSchema.index({ deviceId: 1, isDeleted: 1 });
