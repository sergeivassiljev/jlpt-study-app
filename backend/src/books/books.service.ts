import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookEntity } from './entities/book.entity';
import { ChapterEntity } from './entities/chapter.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { CreateChapterDto } from './dto/create-chapter.dto';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(BookEntity)
    private readonly bookRepository: Repository<BookEntity>,
    @InjectRepository(ChapterEntity)
    private readonly chapterRepository: Repository<ChapterEntity>,
  ) {}

  async getBooks(): Promise<any[]> {
    const books = await this.bookRepository.find({ order: { title: 'ASC' } });
    
    // Fetch chapters for each book and include them
    const booksWithChapters = await Promise.all(
      books.map(async (book) => ({
        ...book,
        chapters: await this.chapterRepository.find({
          where: { bookId: book.id },
          order: { number: 'ASC' },
        }),
      }))
    );
    
    return booksWithChapters;
  }

  async getBook(bookId: string): Promise<any | null> {
    const book = await this.bookRepository.findOne({ where: { id: bookId } });
    if (!book) return null;
    
    const chapters = await this.chapterRepository.find({
      where: { bookId },
      order: { number: 'ASC' },
    });
    
    return { ...book, chapters };
  }

  async upsertBook(book: CreateBookDto): Promise<BookEntity> {
    return this.bookRepository.save(book);
  }

  async getChapters(bookId: string): Promise<ChapterEntity[]> {
    return this.chapterRepository.find({
      where: { bookId },
      order: { number: 'ASC' },
    });
  }

  async getChapter(bookId: string, chapterId: string): Promise<ChapterEntity | null> {
    return this.chapterRepository.findOne({ where: { id: chapterId, bookId } });
  }

  async upsertChapter(chapter: CreateChapterDto): Promise<ChapterEntity> {
    return this.chapterRepository.save(chapter);
  }
}
