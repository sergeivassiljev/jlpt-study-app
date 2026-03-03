import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VocabularyModule } from './vocabulary/vocabulary.module';
import { FlashcardsModule } from './flashcards/flashcards.module';
import { StudyDataModule } from './study-data/study-data.module';
import { VocabularyEntity } from './study-data/entities/vocabulary.entity';
import { FlashcardEntity } from './study-data/entities/flashcard.entity';
import { FolderEntity } from './study-data/entities/folder.entity';
import { BookEntity } from './books/entities/book.entity';
import { ChapterEntity } from './books/entities/chapter.entity';
import { BooksModule } from './books/books.module';
import { KanjiEntity } from './kanji/entities/kanji.entity';
import { KanjiModule } from './kanji/kanji.module';
import { UserEntity } from './auth/entities/user.entity';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data/jlpt-study.sqlite',
      entities: [VocabularyEntity, FlashcardEntity, FolderEntity, BookEntity, ChapterEntity, KanjiEntity, UserEntity],
      synchronize: true,
    }),
    StudyDataModule,
    AuthModule,
    VocabularyModule,
    FlashcardsModule,
    BooksModule,
    KanjiModule,
  ],
})
export class AppModule {}
