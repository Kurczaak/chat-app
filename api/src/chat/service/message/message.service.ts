import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';
import { MessageEntity } from 'src/chat/model/message/message.entity';
import { MessageI as MessageI } from 'src/chat/model/message/message.interface';
import { RoomI } from 'src/chat/model/room/room.interface';
import { FindOptionsUtils } from 'typeorm';
import { Repository } from 'typeorm/repository/Repository';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>
  ) {}

  async create(message: MessageI): Promise<MessageI> {
    return this.messageRepository.save(this.messageRepository.create(message));
  }

  async findMessagesForRoom(
    room: RoomI,
    options: IPaginationOptions
  ): Promise<Pagination<MessageI>> {
    const queryBuilder =
      this.messageRepository.createQueryBuilder('message_entity');

    queryBuilder
      .where('message_entity.roomId = :roomId', { roomId: room.id })
      .leftJoinAndSelect('message_entity.user', 'user')
      .leftJoinAndSelect('message_entity.room', 'room'); // This line is key
    const msgs = await queryBuilder.getMany();
    return paginate<MessageI>(queryBuilder, options);
  }
}
