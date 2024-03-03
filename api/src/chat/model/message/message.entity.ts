import { UserEntity } from 'src/user/model/user.entity';
import {
  Column,
  CreateDateColumn,
  JoinColumn,
  JoinTable,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Entity } from 'typeorm/decorator/entity/Entity';
import { RoomEntity } from '../room/room.entity';

@Entity()
export class MessageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @ManyToOne(() => UserEntity, (user) => user.messages)
  @JoinColumn()
  user: UserEntity;

  @ManyToOne(() => RoomEntity, (room) => room.messages)
  @JoinTable()
  room: RoomEntity;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
