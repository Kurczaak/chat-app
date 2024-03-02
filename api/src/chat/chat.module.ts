import { Module } from '@nestjs/common';
import { ChatGateway } from './gateway/chat/chat.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { RoomService } from './service/room-service/room.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomEntity } from './model/room.entity';
import { ConnectedUserService } from './service/connected-user/connected-user.service';
import { ConnectedUserEntity } from './model/connected-user.entity';

@Module({
  imports: [
    AuthModule,
    UserModule,
    TypeOrmModule.forFeature([RoomEntity, ConnectedUserEntity]),
  ],
  providers: [ChatGateway, RoomService, ConnectedUserService],
})
export class ChatModule {}
