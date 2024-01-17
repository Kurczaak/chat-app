import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable, from } from 'rxjs';
import { UserI } from 'src/user/model/user.interface';
var bcrypt = require('bcryptjs');

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  generateJWT(user: UserI): Observable<string> {
    return from(this.jwtService.signAsync({ user }));
  }

  comparePasswords(
    attemptPassword: string,
    storedPasswordHash: string
  ): Observable<boolean> {
    return from(
      Promise.resolve(bcrypt.compareSync(attemptPassword, storedPasswordHash))
    );
  }

  hashPassword(password: string): Observable<string> {
    return from<string>(bcrypt.hash(password, 12));
  }
}
