import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DevicesModule } from './devices/devices.module';
import { TracksModule } from './tracks/tracks.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SocketModule } from './socket/socket.module';
import { TrackRtcmModule } from './tracksRtcm/track-rtcm.module';
import { WarningModule } from './warning/warning.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    AuthModule,
    DevicesModule,
    TracksModule,
    TrackRtcmModule,
    SocketModule,
    WarningModule,
    MailModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
