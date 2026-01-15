import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Delete,
  NotFoundException,
  Request,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get('deleted')
  async findAllDeleted() {
    return this.devicesService.findAllDeleted();
  }

  // Lấy danh sách thiết bị đang hoạt động
  @Get('active')
  async findAllActive() {
    return this.devicesService.findAllActive();
  }

  // Tạo thiết bị mới
  @Post()
  async create(@Body() dto: CreateDeviceDto, @Request() req) {
    return this.devicesService.createDevice(dto, req.user);
  }

  // Soft delete thiết bị theo deviceId
  @Delete(':id')
  async softDelete(@Param('id') deviceId: string) {
    await this.devicesService.softDelete(deviceId);
    return { message: 'Device marked as deleted' };
  }

  // Khôi phục thiết bị theo deviceId
  @Patch(':id/restore')
  async restore(@Param('id') deviceId: string) {
    await this.devicesService.restore(deviceId);
    return { message: 'Device restored' };
  }
}
