import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ReviewDifficulty } from '../../types';

@Entity({ name: 'flashcard_items' })
export class FlashcardEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  userId: string;

  @Column()
  vocabularyId: string;

  @Column({ type: 'text' })
  front: string;

  @Column({ type: 'text' })
  back: string;

  @Column({ type: 'datetime' })
  nextReview: Date;

  @Column({ type: 'text', default: 'medium' })
  difficulty: ReviewDifficulty;

  @Column({ default: 1 })
  interval: number;

  @Column({ default: 0 })
  repetitions: number;
}
