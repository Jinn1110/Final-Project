import { Body, Controller, Get, Post } from '@nestjs/common';
import { WarningService } from './warning.service';
import { CreateWarningDto } from './dto/create-warning.dto';

@Controller('warnings')
export class WarningController {
  constructor(private readonly warningService: WarningService) {}

  @Post()
  create(@Body() dto: CreateWarningDto) {
    return this.warningService.create(dto);
  }

  @Get()
  findAll() {
    return this.warningService.findAll();
  }
}
