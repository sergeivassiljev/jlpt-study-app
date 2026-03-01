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
