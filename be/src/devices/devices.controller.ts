import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Patch,
  NotFoundException,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  // Lấy tất cả thiết bị
  @Get()
  async getAllDevices() {
    return this.devicesService.findAll();
  }

  // Lấy thiết bị theo device_id
  @Get(':deviceId')
  async getDevice(@Param('deviceId') deviceId: string) {
    const device = await this.devicesService.findOneByDeviceId(deviceId);
    if (!device) {
      throw new NotFoundException(`Device ${deviceId} not found`);
    }
    return device;
  }

  // Tạo thiết bị mới
  @Post()
  async createDevice(@Body() createDeviceDto: CreateDeviceDto) {
    return this.devicesService.createDevice(createDeviceDto);
  }

  // Cập nhật metadata hoặc tên thiết bị
  @Patch(':deviceId')
  async updateDevice(
    @Param('deviceId') deviceId: string,
    @Body() update: Partial<{ name: string; metadata: Record<string, any> }>,
  ) {
    const updated = await this.devicesService.updateDevice(deviceId, update);
    if (!updated) {
      throw new NotFoundException(`Device ${deviceId} not found`);
    }
    return updated;
  }
}
