import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { CreateUserDto } from 'src/user/model/dto/create-user.dto';
import { LoginUserDto } from 'src/user/model/dto/login-user.dto';
import { UserI } from 'src/user/model/user.interface';

@Injectable()
export class UserHelperService {
  async createUserDtoToUserEntity(
    createUserDto: CreateUserDto
  ): Promise<UserI> {
    return {
      username: createUserDto.username,
      email: createUserDto.email,
      password: createUserDto.password,
    };
  }

  async loginUserDtoToEntity(loginUserDto: LoginUserDto): Promise<UserI> {
    return {
      email: loginUserDto.email,
      password: loginUserDto.password,
    };
  }
}
