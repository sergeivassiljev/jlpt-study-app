import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyDataService } from './study-data.service';
import { VocabularyEntity } from './entities/vocabulary.entity';
import { FlashcardEntity } from './entities/flashcard.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([VocabularyEntity, FlashcardEntity])],
  providers: [StudyDataService],
  exports: [StudyDataService],
})
export class StudyDataModule {}
