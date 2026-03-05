import { IsOptional, IsString } from 'class-validator';

export class CompleteLessonWordDto {
  @IsString()
  lessonWordId: string;

  @IsOptional()
  @IsString()
  vocabularyId?: string;
}
