// src/warning/dto/create-warning.dto.ts
import { IsEnum, IsNotEmpty, IsUrl } from 'class-validator';
import { WarningType } from '../schemas/warning.chema';

export class CreateWarningDto {
  @IsNotEmpty()
  deviceId: string;

  @IsEnum(WarningType)
  type: WarningType;

  @IsUrl()
  imageUrl: string;
}
