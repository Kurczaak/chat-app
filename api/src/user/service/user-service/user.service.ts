import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, Pagination, paginate } from 'nestjs-typeorm-paginate';
import { Observable, from, map, switchMap } from 'rxjs';
import { UserEntity } from 'src/user/model/user.entity';
import { UserI } from 'src/user/model/user.interface';
import { Repository } from 'typeorm';

var bcrypt = require('bcryptjs');

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>
    ){}

    create(newUser: UserI): Observable<UserI>{

        return this.mailExists(newUser.email).pipe(
            switchMap((exists: boolean)=>{
                if(exists){
                    throw new HttpException('Email is laready in use', HttpStatus.CONFLICT);
                }else{
                    return this.hashPassword(newUser.password).pipe(
                        switchMap((passwordHash: string)=>{
                            // overwrite the user password with the hash, to store it in the db
                            newUser.password = passwordHash;
                            return from(this.userRepository.save(newUser)).pipe(
                               switchMap((user: UserI) => this.findOne(user.id))
                            );
                        })
                    );
                }
            })
        );
    }

    findAll(options: IPaginationOptions): Observable<Pagination<UserI>>{
        return from(paginate<UserEntity>(this.userRepository, options));
    }

    // TODO refactor to get JWT
    login(user: UserI): Observable<boolean>{
        return this.findByMail(user.email).pipe(
            switchMap((foundUser: UserI)=>{
                if(!foundUser){
                    throw new HttpException('User not found', HttpStatus.NOT_FOUND);
                }
                return this.comparePasswords(user.password, foundUser.password).pipe(
                    map((passwordsMatch: boolean)=>{
                        if(passwordsMatch){
                            return true;
                        }else{
                            throw new HttpException('Wrong password', HttpStatus.UNAUTHORIZED);
                        }
                    })
                );
            }
        ));
    }


    private comparePasswords(attemptPassword: string, storedPasswordHash: string): Observable<boolean>{
      return from( Promise.resolve(bcrypt.compareSync(attemptPassword, storedPasswordHash)));
    }

    private findByMail(email: string): Observable<UserI>{
        return from(this.userRepository.findOne({where: {email}, select: ['id', 'username', 'password', 'email']}));
    }

    private mailExists(email: string): Observable<boolean>{
        return from(this.userRepository.findOne({ where: { email } })).pipe(
            map((user: UserI) => {
                if(user){
                    return true;
                }else{
                    return false;
                }
            })
        )
    }

    private hashPassword(password: string): Observable<string>{
        return from<string>(bcrypt.hash(password, 12));
    }

    private findOne(id: number): Observable<UserI>{
        return from(this.userRepository.findOne({where: {id}}));
    }
}
