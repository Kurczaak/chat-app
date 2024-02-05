import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AuthService } from 'src/auth/service/auth.service';
import { UserI } from 'src/user/model/user.interface';
import { UserService } from 'src/user/service/user-service/user.service';

export interface RequestModel extends Request {
  user: UserI;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  async use(req: RequestModel, res: Response, next: NextFunction) {
    try {
      const tokenArray: string[] = req.headers.authorization.split(' ');
      // make sure that the user is not deleted, or that props or right changed compared to the time when the jwt was issued
      const decodedToken = await this.authService.verifyJwt(tokenArray[1]);
      const user: UserI = await this.userService.getOne(decodedToken.id);
      if (user) {
        // add the user to the req object, so that we can acccess it later when we need it
        // if it would be here, we would overwrite it
        req.user = user;
        next();
      } else {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
    } catch (e) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }
}
