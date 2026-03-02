import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { CreateChapterDto } from './dto/create-chapter.dto';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  async list() {
    return await this.booksService.getBooks();
  }

  @Get(':bookId')
  async getBook(@Param('bookId') bookId: string) {
    const book = await this.booksService.getBook(bookId);
    if (!book) {
      throw new NotFoundException(`Book not found: ${bookId}`);
    }
    return book;
  }

  @Post()
  async createOrUpdateBook(@Body() body: CreateBookDto) {
    return await this.booksService.upsertBook(body);
  }

  @Get(':bookId/chapters')
  async listChapters(@Param('bookId') bookId: string) {
    return await this.booksService.getChapters(bookId);
  }

  @Get(':bookId/chapters/:chapterId')
  async getChapter(@Param('bookId') bookId: string, @Param('chapterId') chapterId: string) {
    const chapter = await this.booksService.getChapter(bookId, chapterId);
    if (!chapter) {
      throw new NotFoundException(`Chapter not found: ${chapterId}`);
    }
    return chapter;
  }

  @Post(':bookId/chapters')
  async createOrUpdateChapter(@Param('bookId') bookId: string, @Body() body: CreateChapterDto) {
    return await this.booksService.upsertChapter({ ...body, bookId });
  }
}
