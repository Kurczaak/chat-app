import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from '../service/user-service/user.service';
import { Observable, of } from 'rxjs';
import { UserI } from '../model/user.interface';
import { CreateUserDto } from '../model/dto/create-user.dto';
import { LoginUserDto } from '../model/dto/login-user.dto';

@Controller('users')
export class UserController {
    constructor(
        private userService: UserService
    ){}

    @Post()
    create(@Body() createUserDto: CreateUserDto ): Observable<boolean> {
        return of(true);
    }

    @Get()
    findAll(){

    }

    @Post()
    login(@Body() user: LoginUserDto): Observable<boolean>{
        return of(true);
    }
}
