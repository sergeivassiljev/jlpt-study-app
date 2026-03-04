import { IsNumber, IsString, IsBoolean, IsEnum } from 'class-validator';

export class RecordKanaAttemptDto {
  @IsNumber()
  kanaId: number;

  @IsString()
  character: string;

  @IsString()
  romaji: string;

  @IsEnum(['hiragana', 'katakana'])
  type: 'hiragana' | 'katakana';

  @IsBoolean()
  isCorrect: boolean;

  @IsNumber()
  responseTime: number;
}
