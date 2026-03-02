import { IsIn } from 'class-validator';

export class UpdateVocabularyReviewDto {
  @IsIn(['hard', 'medium', 'easy'])
  difficulty: 'hard' | 'medium' | 'easy';
}
