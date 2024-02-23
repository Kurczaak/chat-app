import { RoomEntity } from 'src/chat/model/room.entity';
import {
  BeforeInsert,
  Column,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Entity } from 'typeorm/decorator/entity/Entity';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ select: false })
  password: string;

  @Column({ unique: true })
  email: string;

  created: Date;

  updated: Date;

  @ManyToMany(() => RoomEntity, (room) => room.users)
  rooms: RoomEntity[];

  @BeforeInsert()
  emailToLoweCase() {
    this.email = this.email.toLowerCase();
  }
}
