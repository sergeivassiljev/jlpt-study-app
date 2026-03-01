import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { VocabularyItem, Word } from '../models/index';

@Injectable({
  providedIn: 'root'
})
export class VocabularyService {
  private vocabulary: VocabularyItem[] = [];
  private vocabularySubject = new BehaviorSubject<VocabularyItem[]>(this.vocabulary);
  vocabulary$ = this.vocabularySubject.asObservable();

  constructor() {
    this.loadFromLocalStorage();
  }

  getVocabulary(): Observable<VocabularyItem[]> {
    return this.vocabulary$;
  }

  getNewWords(): VocabularyItem[] {
    return this.vocabulary.filter(v => !v.reviewed);
  }

  getReviewDue(): VocabularyItem[] {
    return this.vocabulary.filter(v => new Date() >= v.nextReviewDate);
  }

  addWord(word: Word, exampleSentence: string): void {
    const id = `vocab-${Date.now()}`;
    const vocabularyItem: VocabularyItem = {
      id,
      word,
      exampleSentence,
      dateAdded: new Date(),
      reviewed: false,
      nextReviewDate: new Date(),
      reviewCount: 0,
      difficulty: 'medium'
    };
    this.vocabulary.push(vocabularyItem);
    this.vocabularySubject.next([...this.vocabulary]);
    this.saveToLocalStorage();
  }

  updateReviewStatus(vocabularyId: string, difficulty: 'hard' | 'medium' | 'easy'): void {
    const item = this.vocabulary.find(v => v.id === vocabularyId);
    if (item) {
      item.difficulty = difficulty;
      item.reviewed = true;
      item.reviewCount++;
      
      // Calculate next review date based on difficulty
      const daysToAdd = difficulty === 'hard' ? 1 : difficulty === 'medium' ? 3 : 7;
      item.nextReviewDate = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);
      
      console.log('✅ Updated vocabulary item:', item);
      this.vocabularySubject.next([...this.vocabulary]);
      this.saveToLocalStorage();
    } else {
      console.warn('❌ Vocabulary item not found with ID:', vocabularyId);
      console.warn('Available IDs:', this.vocabulary.map(v => v.id));
    }
  }

  deleteWord(vocabularyId: string): void {
    this.vocabulary = this.vocabulary.filter(v => v.id !== vocabularyId);
    this.vocabularySubject.next([...this.vocabulary]);
    this.saveToLocalStorage();
  }

  scheduleForImmediateReview(vocabularyId: string): void {
    const item = this.vocabulary.find(v => v.id === vocabularyId);
    if (item) {
      item.nextReviewDate = new Date(); // Set to now so it shows as due immediately
      console.log('⚡ Scheduled for immediate review:', item.word.text);
      this.vocabularySubject.next([...this.vocabulary]);
      this.saveToLocalStorage();
    }
  }

  private saveToLocalStorage(): void {
    localStorage.setItem('vocabulary', JSON.stringify(this.vocabulary));
  }

  private loadFromLocalStorage(): void {
    const stored = localStorage.getItem('vocabulary');
    if (stored) {
      this.vocabulary = JSON.parse(stored);
      this.vocabulary.forEach(v => {
        v.dateAdded = new Date(v.dateAdded);
        v.nextReviewDate = new Date(v.nextReviewDate);
      });
      this.vocabularySubject.next(this.vocabulary);
    }
  }
}
