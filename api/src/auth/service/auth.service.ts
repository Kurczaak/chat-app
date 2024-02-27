import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserI } from 'src/user/model/user.interface';
var bcrypt = require('bcryptjs');

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async generateJWT(user: UserI): Promise<string> {
    return await this.jwtService.signAsync({ user });
  }

  async comparePasswords(
    attemptPassword: string,
    storedPasswordHash: string
  ): Promise<boolean> {
    return await bcrypt.compareSync(attemptPassword, storedPasswordHash);
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }

  async verifyJwt(jwt: string): Promise<any> {
    return await this.jwtService.verifyAsync(jwt);
  }
}
