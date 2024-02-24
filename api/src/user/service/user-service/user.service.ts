import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';
import { AuthService } from 'src/auth/service/auth.service';
import { UserEntity } from 'src/user/model/user.entity';
import { UserI } from 'src/user/model/user.interface';
import { Like, Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private authService: AuthService
  ) {}

  async create(newUser: UserI): Promise<UserI> {
    try {
      const mailExists: boolean = await this.mailExists(newUser.email);
      const usernameExists: boolean = await this.usernameExists(
        newUser.username
      );
      if (mailExists) {
        throw new HttpException('Email is already in use', HttpStatus.CONFLICT);
      }
      if (usernameExists) {
        throw new HttpException(
          'Username is already in use',
          HttpStatus.CONFLICT
        );
      }
      const passwordHash: string = await this.hashPassword(newUser.password);
      newUser.password = passwordHash;
      const user = await this.userRepository.save(
        this.userRepository.create(newUser)
      );
      return this.findOne(user.id);
    } catch (e) {
      throw new HttpException(
        'Email or username is already in use',
        HttpStatus.CONFLICT
      );
    }
  }

  async findAll(options: IPaginationOptions): Promise<Pagination<UserI>> {
    return paginate<UserEntity>(this.userRepository, options);
  }

  async login(user: UserI): Promise<string> {
    try {
      const foundUser = await this.findByMail(user.email.toLocaleLowerCase());
      if (!foundUser) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      const passwordsMatch = await this.validatePassword(
        user.password,
        foundUser.password
      );
      if (!passwordsMatch) {
        throw new HttpException('Wrong password', HttpStatus.UNAUTHORIZED);
      }

      const payload = await this.getOne(foundUser.id);
      return this.authService.generateJWT(payload);
    } catch (e) {
      throw new HttpException(
        'Wrong login or password',
        HttpStatus.UNAUTHORIZED
      );
    }
  }

  async findAllByUsername(username: string): Promise<UserI[]> {
    return this.userRepository.find({
      where: {
        username: Like(`%${username}%`),
      },
    });
  }

  public async getOne(id: number): Promise<UserI> {
    return this.userRepository.findOneByOrFail({ id: id });
  }

  private async findByMail(email: string): Promise<UserI> {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'username', 'password', 'email'],
    });
  }

  private async mailExists(email: string): Promise<boolean> {
    const user = await this.findByMail(email);
    if (user) {
      return true;
    }
    return false;
  }

  private async usernameExists(username: string): Promise<boolean> {
    return this.userRepository
      .findOneBy({ username: username })
      .then((user: UserI) => {
        if (user) {
          return true;
        } else {
          return false;
        }
      });
  }

  private async findOne(id: number): Promise<UserI> {
    return this.userRepository.findOneBy({ id: id });
  }

  private async validatePassword(password: string, storedPasswordHash: string) {
    return this.authService.comparePasswords(password, storedPasswordHash);
  }

  private async hashPassword(password: string): Promise<string> {
    return this.authService.hashPassword(password);
  }
}
