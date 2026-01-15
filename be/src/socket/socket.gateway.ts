// src/socket/socket.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('SocketGateway');

  afterInit() {
    this.logger.log('Socket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Gọi từ TracksService khi có track mới
  broadcastNewTrack(track: any) {
    console.log('>>> BROADCAST ĐÃ ĐƯỢC GỌI!!! Device:', track.deviceId);
    console.log(
      '>>> Số client đang kết nối:',
      this.server.sockets.sockets.size,
    );

    const deviceId = track.deviceId;
    this.server.to(`device_${deviceId}`).emit('newTrack', track);
    this.server.emit('newTrackAll', track); // broadcast toàn bộ
  }

  @SubscribeMessage('subscribeDevice')
  handleSubscribe(
    @MessageBody() deviceId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`device_${deviceId}`);
    this.logger.log(`Client ${client.id} subscribed to device_${deviceId}`);
  }

  @SubscribeMessage('unsubscribeDevice')
  handleUnsubscribe(
    @MessageBody() deviceId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`device_${deviceId}`);
  }
}
