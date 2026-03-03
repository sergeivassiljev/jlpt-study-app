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
