import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class LessonTopicsQueryDto {
  @IsIn(['N5', 'N4', 'N3', 'N2', 'N1'])
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
}

export class DailyLessonQueryDto {
  @IsIn(['N5', 'N4', 'N3', 'N2', 'N1'])
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

  @IsString()
  topic: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

export class TopicLessonWordsQueryDto {
  @IsIn(['N5', 'N4', 'N3', 'N2', 'N1'])
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

  @IsString()
  topic: string;

  @Type(() => Number)
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  lessonOrder: number;
}
