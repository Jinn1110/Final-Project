// src/warning/schemas/warning.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WarningDocument = Warning & Document;

export enum WarningType {
  JAMMING = 'jamming',
  SPOOFING = 'spoofing',
}

@Schema({ timestamps: true })
export class Warning {
  @Prop({ required: true })
  deviceId: string;

  @Prop({ required: true, enum: WarningType })
  type: WarningType;

  @Prop({ required: true })
  imageUrl: string;
}

export const WarningSchema = SchemaFactory.createForClass(Warning);
