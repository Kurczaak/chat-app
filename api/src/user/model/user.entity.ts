import { BeforeInsert, Column, PrimaryGeneratedColumn } from "typeorm";
import { Entity } from "typeorm/decorator/entity/Entity";

@Entity()
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true})
    username: string;

    @Column({select: false})
    password: string;
    
    @Column({ unique: true })
    email: string;

    created: Date;

    updated: Date;

    @BeforeInsert()
    emailToLoweCase() {
        this.email = this.email.toLowerCase();
    }
}