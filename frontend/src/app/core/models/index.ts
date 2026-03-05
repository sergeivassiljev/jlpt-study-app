export interface Word {
  id: string;
  text: string;
  reading: string;
  meaning: string;
  partOfSpeech: string;
}

// Book and Reader Models
export interface Book {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'N5' | 'N4' | 'N3';
  chaptersCount: number;
  coverImage?: string;
}

export interface Chapter {
  id: string;
  bookId: string;
  number: number;
  title: string;
  content: string[]; // Array of HTML strings with ruby tags
}

// Vocabulary Models
export interface VocabularyItem {
  id: string;
  word: Word;
  exampleSentence: string;
  dateAdded: Date;
  reviewed: boolean;
  nextReviewDate: Date;
  reviewCount: number;
  difficulty: 'hard' | 'medium' | 'easy';
  folderId?: string;
}

export interface VocabularyFolder {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  wordCount: number;
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

// Flashcard Models
export interface FlashCard {
  id: string;
  vocabularyId: string;
  front: string;
  back: string;
  nextReview: Date;
  difficulty: 'hard' | 'medium' | 'easy';
  interval: number;
  repetitions: number;
}

// Kanji Models
export interface Kanji {
  id: string;
  character: string;
  meaning: string;
  onyomi: string[];
  kunyomi: string[];
  strokeCount: number;
  level: 'N5';
  vocabulary: string[]; // IDs of vocabulary items
  exampleSentences: string[];
}

// Grammar Models
export interface GrammarItem {
  id: string;
  pattern: string;
  explanation: string;
  structure: string;
  examples: GrammarExample[];
  level: 'N5';
}

export interface GrammarExample {
  japanese: string;
  furigana: string;
  english: string;
}

// Kana Models
export interface Kana {
  id: string;
  character: string;
  romaji: string;
  type: 'hiragana' | 'katakana';
  strokeOrder?: string;
  isDiacritical: boolean;
}

