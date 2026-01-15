import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TrackDocument = HydratedDocument<Track>;

@Schema({ timestamps: false, collection: 'tracks' })
export class Track {
  @Prop({ required: true, index: true })
  deviceId: string;

  @Prop({ required: true, index: true })
  timestamp: Date;

  @Prop({ type: { latitude: Number, longitude: Number }, required: true })
  location: {
    latitude: number;
    longitude: number;
  };

  @Prop()
  num_sats_used?: number;

  // DOP object
  @Prop({
    type: {
      gdop: Number,
      pdop: Number,
      tdop: Number,
      vdop: Number,
      hdop: Number,
      ndop: Number,
      edop: Number,
    },
  })
  dop?: {
    gdop?: number;
    pdop?: number;
    tdop?: number;
    vdop?: number;
    hdop?: number;
    ndop?: number;
    edop?: number;
  };

  // Time accuracy per GNSS
  @Prop({ type: Map, of: Number, default: {} })
  time_accuracy?: Map<string, number>;

  @Prop()
  cn0_total?: number;

  @Prop({
    type: [
      {
        name: String,
        num_tracked: Number,
        num_used: Number,
        cn0: Number,
      },
    ],
    default: [],
  })
  constellations: {
    name: string;
    num_tracked: number;
    num_used: number;
    cn0: number;
  }[];

  @Prop({
    type: [
      {
        spectrum: [Number],
        center: Number,
        span: Number,
        resolution: Number,
        gain: Number,
      },
    ],
    default: [],
  })
  waterfall: {
    spectrum: number[];
    center: number;
    span: number;
    resolution: number;
    gain: number;
  }[];

  @Prop({
    type: [
      {
        rf_block: Number,
        agc: Number,
        noise_per_ms: Number,
        jam_indicator: Number,
      },
    ],
    default: [],
  })
  rf_status: {
    rf_block: number;
    agc: number;
    noise_per_ms: number;
    jam_indicator: number;
  }[];

  // Position Deviation
  @Prop({
    type: {
      hAcc: Number,
      vAcc: Number,
    },
  })
  position_deviation?: {
    hAcc: number;
    vAcc: number;
  };

  // PosCovariance
  @Prop({
    type: {
      NN: Number,
      NE: Number,
      ND: Number,
      EE: Number,
      ED: Number,
      DD: Number,
    },
  })
  posCov?: {
    NN: number;
    NE: number;
    ND: number;
    EE: number;
    ED: number;
    DD: number;
  };
}

export const TrackSchema = SchemaFactory.createForClass(Track);

// Index để truy vấn nhanh theo thiết bị & timestamp
TrackSchema.index({ deviceId: 1, timestamp: -1 }); // ← Đổi thành deviceId
