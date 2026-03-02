import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWordDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsNotEmpty()
  reading: string;

  @IsString()
  @IsNotEmpty()
  meaning: string;

  @IsString()
  @IsNotEmpty()
  partOfSpeech: string;
}

export class CreateVocabularyDto {
  @ValidateNested()
  @Type(() => CreateWordDto)
  word: CreateWordDto;

  @IsString()
  @IsNotEmpty()
  exampleSentence: string;
}
