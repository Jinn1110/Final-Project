// src/device/dto/create-device.dto.ts

import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateDeviceDto {
  @IsString({ message: 'Device ID phải là chuỗi' })
  @IsNotEmpty({ message: 'Device ID không được để trống' })
  deviceId: string;
}
