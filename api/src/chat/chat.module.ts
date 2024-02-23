import { Module } from '@nestjs/common';
import { ChatGateway } from './gateway/chat/chat.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { RoomService } from './service/room-service/room/room.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomEntity } from './model/room.entity';

@Module({
  imports: [AuthModule, UserModule, TypeOrmModule.forFeature([RoomEntity])],
  providers: [ChatGateway, RoomService],
})
export class ChatModule {}
