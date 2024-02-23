import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserI } from 'src/user/model/user.interface';
var bcrypt = require('bcryptjs');

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async generateJWT(user: UserI): Promise<string> {
    return this.jwtService.signAsync({ user });
  }

  async validatePassword(
    attemptPassword: string,
    storedPasswordHash: string
  ): Promise<boolean> {
    return bcrypt.compareSync(attemptPassword, storedPasswordHash);
  }

  hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  verifyJwt(jwt: string): Promise<any> {
    return this.jwtService.verifyAsync(jwt);
  }
}
