import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { BookEntity } from './entities/book.entity';
import { ChapterEntity } from './entities/chapter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BookEntity, ChapterEntity])],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
