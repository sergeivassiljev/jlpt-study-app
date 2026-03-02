import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateBookDto {
  @IsString()
  id: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsIn(['beginner', 'N5', 'N4', 'N3'])
  level: 'beginner' | 'N5' | 'N4' | 'N3';

  @IsInt()
  @Min(0)
  chaptersCount: number;

  @IsOptional()
  @IsString()
  coverImage?: string;
}
