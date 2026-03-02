import { IsIn } from 'class-validator';

export class ReviewFlashcardDto {
  @IsIn(['hard', 'medium', 'easy'])
  difficulty: 'hard' | 'medium' | 'easy';
}
