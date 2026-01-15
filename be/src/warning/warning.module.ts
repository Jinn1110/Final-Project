import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Warning, WarningSchema } from './schemas/warning.chema';
import { WarningController } from './warning.controller';
import { WarningService } from './warning.service';
import { MailModule } from '../mail/mail.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MailModule,
    UsersModule,
    MongooseModule.forFeature([{ name: Warning.name, schema: WarningSchema }]),
  ],
  controllers: [WarningController],
  providers: [WarningService],
})
export class WarningModule {}
