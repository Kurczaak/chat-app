import { OnModuleInit, UnauthorizedException } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { log } from 'console';
import { create } from 'domain';
import { Socket, Server } from 'socket.io';
import { AuthService } from 'src/auth/service/auth.service';
import { ConnectedUserI } from 'src/chat/model/connected-user/connected-user.interface';
import { JoinedRoomI } from 'src/chat/model/joined-room/joined-room.interface';
import { MessageI } from 'src/chat/model/message/message.interface';
import { PageI } from 'src/chat/model/page.interface';
import { RoomI } from 'src/chat/model/room/room.interface';
import { ConnectedUserService } from 'src/chat/service/connected-user/connected-user.service';
import { JoinedRoomService } from 'src/chat/service/joined-room/joined-room.service';
import { MessageService } from 'src/chat/service/message/message.service';
import { RoomService } from 'src/chat/service/room-service/room.service';
import { UserI } from 'src/user/model/user.interface';
import { UserService } from 'src/user/service/user-service/user.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private roomService: RoomService,
    private connectedUserService: ConnectedUserService,
    private joinedRoomService: JoinedRoomService,
    private messageService: MessageService
  ) {}

  async onModuleInit() {
    await this.connectedUserService.deleteAll();
    await this.joinedRoomService.deleteAll();
  }

  @WebSocketServer() server: Server;

  async handleDisconnect(socket: Socket) {
    await this.connectedUserService.deleteBySocketId(socket.id);
    socket.disconnect();
  }

  async handleConnection(socket: Socket) {
    try {
      const decodedToken = await this.authService.verifyJwt(
        socket.handshake.headers.authorization
      );
      const user: UserI = await this.userService.getOne(decodedToken.user.id);
      if (!user) {
        return this.disconnect(socket);
      } else {
        socket.data.user = user;
        const rooms = await this.roomService.getRoomsForUser(user.id, {
          page: 1,
          limit: 10,
        });
        // Save connection to DB
        await this.connectedUserService.create({ socketId: socket.id, user });

        // Only emit rooms to the specific connected client
        return this.server.to(socket.id).emit('rooms', rooms);
      }
    } catch (e) {
      log(e);
      return this.disconnect(socket);
    }
  }

  @SubscribeMessage('createRoom')
  async onCreateRoom(socket: Socket, room: RoomI) {
    const createdRoom: RoomI = await this.roomService.createRoom(
      room,
      socket.data.user
    );
    for (const user of createdRoom.users) {
      const connections: ConnectedUserI[] =
        await this.connectedUserService.findByUser(user);
      const rooms = await this.roomService.getRoomsForUser(user.id, {
        page: 1,
        limit: 10,
      });

      for (const connection of connections) {
        this.server.to(connection.socketId).emit('rooms', rooms);
      }
    }
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any) {
    this.server.emit('message', 'test');
  }

  @SubscribeMessage('paginateRooms')
  async onPaginateRoom(socket: Socket, page: PageI) {
    page.limit = page.limit > 100 ? 100 : page.limit;
    const rooms = await this.roomService.getRoomsForUser(
      socket.data.user.id,
      page
    );
    return this.server.to(socket.id).emit('rooms', rooms);
  }

  @SubscribeMessage('joinRoom')
  async onJoinRoom(socket: Socket, room: RoomI) {
    const messages = await this.messageService.findMessagesForRoom(room, {
      limit: 20,
      page: 1,
    });

    // Save connection to room
    await this.joinedRoomService.create({
      socketId: socket.id,
      user: socket.data.user,
      room,
    });
    // Send last messages from Room to User
    this.server.to(socket.id).emit('messages', messages);
  }

  @SubscribeMessage('leaveRoom')
  async onLeaveRoom(socket: Socket, room: RoomI) {
    // Remove connection from JoinedRooms
    await this.joinedRoomService.deleteBySocketId(socket.id);
    socket.emit('leaveRoom', 'You have left the room');
  }

  @SubscribeMessage('addMessage')
  async onAddMessage(socket: Socket, message: MessageI) {
    const createdMessage: MessageI = await this.messageService.create({
      ...message,
      user: socket.data.user,
    });
    const room: RoomI = await this.roomService.getRoom(createdMessage.room.id);
    const joinedUsers: JoinedRoomI[] =
      await this.joinedRoomService.findByRoom(room);
    // TODO: Send new Message to all joined users of the room (currently online)
  }

  private async disconnect(socket: Socket) {
    socket.emit('Error', new UnauthorizedException());
    socket.disconnect();
  }
}
