export interface SessionAttempt {
  kanaId: number;
  character: string;
  romaji: string;
  type: 'hiragana' | 'katakana';
  isCorrect: boolean;
  responseTime: number;
}

export class RecordKanaSessionDto {
  attempts: SessionAttempt[];
  sessionSize: number;
  accuracy?: number;
  avgResponseTime?: number;
}
