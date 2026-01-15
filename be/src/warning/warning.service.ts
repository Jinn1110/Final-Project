import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateWarningDto } from './dto/create-warning.dto';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { Warning, WarningDocument } from './schemas/warning.chema';

@Injectable()
export class WarningService {
  constructor(
    @InjectModel(Warning.name)
    private warningModel: Model<WarningDocument>,
    private mailService: MailService,
    private usersService: UsersService,
  ) {}

  async create(dto: CreateWarningDto) {
    const warning = await this.warningModel.create(dto);

    const users = await this.usersService.findAll();

    for (const user of users) {
      if (user.email) {
        await this.mailService.sendWarningEmail(user.email, warning);
      }
    }

    return warning;
  }

  async findAll() {
    return this.warningModel.find().sort({ createdAt: -1 }).lean();
  }
}
