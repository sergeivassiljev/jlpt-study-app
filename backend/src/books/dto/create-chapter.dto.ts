import { IsArray, IsInt, IsString, Min } from 'class-validator';

export class CreateChapterDto {
  @IsString()
  id: string;

  @IsString()
  bookId: string;

  @IsInt()
  @Min(1)
  number: number;

  @IsString()
  title: string;

  @IsArray()
  content: string[];
}
