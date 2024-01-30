import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';
import { Observable, from, map, switchMap } from 'rxjs';
import { AuthService } from 'src/auth/service/auth.service';
import { UserEntity } from 'src/user/model/user.entity';
import { UserI } from 'src/user/model/user.interface';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private authService: AuthService
  ) {}

  create(newUser: UserI): Observable<UserI> {
    const mailExists = this.mailExists(newUser.email);
    const usernameExists = this.usernameExists(newUser.username);

    return this.usernameExists(newUser.username).pipe(
      switchMap((exists: boolean) => {
        if (exists) {
          throw new HttpException(
            'Username is laready in use',
            HttpStatus.CONFLICT
          );
        } else {
          return this.mailExists(newUser.email).pipe(
            switchMap((exists: boolean) => {
              if (exists) {
                throw new HttpException(
                  'Email is laready in use',
                  HttpStatus.CONFLICT
                );
              } else {
                return this.authService.hashPassword(newUser.password).pipe(
                  switchMap((passwordHash: string) => {
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
      })
    );
  }

  findAll(options: IPaginationOptions): Observable<Pagination<UserI>> {
    return from(paginate<UserEntity>(this.userRepository, options));
  }

  login(user: UserI): Observable<string> {
    return this.findByMail(user.email).pipe(
      switchMap((foundUser: UserI) => {
        if (!foundUser) {
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        return this.authService
          .validatePassword(user.password, foundUser.password)
          .pipe(
            switchMap((passwordsMatch: boolean) => {
              if (passwordsMatch) {
                return this.findOne(foundUser.id).pipe(
                  switchMap((user: UserI) => this.authService.generateJWT(user))
                );
              } else {
                throw new HttpException(
                  'Wrong password',
                  HttpStatus.UNAUTHORIZED
                );
              }
            })
          );
      })
    );
  }

  private findByMail(email: string): Observable<UserI> {
    return from(
      this.userRepository.findOne({
        where: { email },
        select: ['id', 'username', 'password', 'email'],
      })
    );
  }

  private mailExists(email: string): Observable<boolean> {
    return from(this.userRepository.findOne({ where: { email } })).pipe(
      map((user: UserI) => {
        if (user) {
          return true;
        } else {
          return false;
        }
      })
    );
  }

  private usernameExists(username: string): Observable<boolean> {
    return from(this.userRepository.findOne({ where: { username } })).pipe(
      map((user: UserI) => {
        if (user) {
          return true;
        } else {
          return false;
        }
      })
    );
  }

  private findOne(id: number): Observable<UserI> {
    return from(this.userRepository.findOne({ where: { id } }));
  }
}
