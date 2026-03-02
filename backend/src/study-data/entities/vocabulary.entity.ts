import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ReviewDifficulty, Word } from '../../types';

@Entity({ name: 'vocabulary_items' })
export class VocabularyEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'simple-json' })
  word: Word;

  @Column({ type: 'text' })
  exampleSentence: string;

  @Column({ type: 'datetime' })
  dateAdded: Date;

  @Column({ default: false })
  reviewed: boolean;

  @Column({ type: 'datetime' })
  nextReviewDate: Date;

  @Column({ default: 0 })
  reviewCount: number;

  @Column({ type: 'text', default: 'medium' })
  difficulty: ReviewDifficulty;
}
