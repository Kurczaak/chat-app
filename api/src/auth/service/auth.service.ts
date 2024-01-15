import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable, from } from 'rxjs';
var bcrypt = require('bcryptjs');

@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService) {}

     comparePasswords(attemptPassword: string, storedPasswordHash: string): Observable<boolean>{
        return from( Promise.resolve(bcrypt.compareSync(attemptPassword, storedPasswordHash)));
      }

     hashPassword(password: string): Observable<string>{
        return from<string>(bcrypt.hash(password, 12));
    }
}
