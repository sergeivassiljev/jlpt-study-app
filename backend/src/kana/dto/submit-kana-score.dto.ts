import { IsInt, Max, Min } from 'class-validator';

export class SubmitKanaScoreDto {
  @IsInt()
  @Min(0)
  @Max(1000000)
  score: number;
}
