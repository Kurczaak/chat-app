import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Import the ConfigModule from the appropriate package
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm'; // Import the TypeOrmModule from the appropriate package

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_URL, 
      autoLoadEntities: true,
      synchronize: true,

  
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
