import { IsString, IsArray, IsNumber, IsOptional } from 'class-validator';

export class CreateKanjiDto {
  @IsString()
  id: string;

  @IsString()
  character: string;

  @IsString()
  meaning: string;

  @IsArray()
  onyomi: string[];

  @IsArray()
  kunyomi: string[];

  @IsNumber()
  strokeCount: number;

  @IsString()
  level: string;

  @IsArray()
  @IsOptional()
  vocabulary?: string[];

  @IsArray()
  @IsOptional()
  exampleSentences?: string[];
}
