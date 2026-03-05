export type ReviewDifficulty = 'hard' | 'medium' | 'easy';

export interface Word {
  id: string;
  text: string;
  reading: string;
  meaning: string;
  partOfSpeech: string;
}

export interface VocabularyItem {
  id: string;
  userId: string;
  word: Word;
  exampleSentence: string;
  dateAdded: string;
  reviewed: boolean;
  nextReviewDate: string;
  reviewCount: number;
  difficulty: ReviewDifficulty;
  folderId?: string;
}

export interface Folder {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: string;
  wordCount: number;
}

export interface FlashcardItem {
  id: string;
  userId: string;
  vocabularyId: string;
  front: string;
  back: string;
  nextReview: string;
  difficulty: ReviewDifficulty;
  interval: number;
  repetitions: number;
}

export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

export interface StructuredLessonWord {
  id: string;
  jlptLevel: JLPTLevel;
  topic: string;
  topics: string[];
  lessonOrder: number;
  wordOrder: number;
  word: string;
  reading: string;
  meaning: string;
  emoji?: string;
  partOfSpeech: string;
  isCompleted: boolean;
}

export interface TopicLessonProgress {
  lessonOrder: number;
  totalWords: number;
  completedWords: number;
  isUnlocked: boolean;
  isCompleted: boolean;
}

export interface TopicProgressSummary {
  topic: string;
  totalWords: number;
  completedWords: number;
  lessons: TopicLessonProgress[];
}

export interface DailyLessonPayload {
  jlptLevel: JLPTLevel;
  topic: string;
  dailyLimit: number;
  words: StructuredLessonWord[];
  remainingWords: number;
}

export type KanaType = 'hiragana' | 'katakana';

export interface Kana {
  id: string;
  character: string;
  romaji: string;
  type: KanaType;
  strokeOrder?: string;
  isDiacritical: boolean;
}

