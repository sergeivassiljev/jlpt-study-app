import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FlashCard } from '../models/index';
import { VocabularyService } from './vocabulary.service';

@Injectable({
  providedIn: 'root'
})
export class SrsService {
  private flashcards: FlashCard[] = [];
  private flashcardsSubject = new BehaviorSubject<FlashCard[]>(this.flashcards);
  flashcards$ = this.flashcardsSubject.asObservable();
  private vocabularySubscription: any;

  constructor(private vocabularyService: VocabularyService) {
    this.loadFromLocalStorage();
  }

  getFlashcardsDue(): Observable<FlashCard[]> {
    return new BehaviorSubject(
      this.flashcards.filter(fc => new Date() >= fc.nextReview)
    ).asObservable();
  }

  createFlashcardsFromVocabulary(): void {
    // Only subscribe once to avoid memory leaks
    if (this.vocabularySubscription) {
      return; // Already subscribed
    }
    
    this.vocabularySubscription = this.vocabularyService.vocabulary$.subscribe(vocab => {
      console.log('📚 Creating flashcards from vocabulary:', vocab.length, 'items');

      const vocabularyIds = new Set(vocab.map(v => v.id));
      const beforeCleanup = this.flashcards.length;
      this.flashcards = this.flashcards.filter(fc => vocabularyIds.has(fc.vocabularyId));
      const removedCount = beforeCleanup - this.flashcards.length;
      if (removedCount > 0) {
        console.log('🧹 Removed orphaned flashcards:', removedCount);
      }

      vocab.forEach(v => {
        if (!this.flashcards.find(fc => fc.vocabularyId === v.id)) {
          const flashcard: FlashCard = {
            id: `fc-${v.id}`,
            vocabularyId: v.id,
            front: v.word.text,
            back: `${v.word.reading} - ${v.word.meaning}`,
            nextReview: new Date(),
            difficulty: 'medium',
            interval: 1,
            repetitions: 0
          };
          console.log('  ✅ Created flashcard:', { vocabularyId: v.id, front: v.word.text });
          this.flashcards.push(flashcard);
        }
      });
      this.flashcardsSubject.next([...this.flashcards]);
      this.saveToLocalStorage();
    });
  }

  ngOnDestroy(): void {
    if (this.vocabularySubscription) {
      this.vocabularySubscription.unsubscribe();
    }
  }

  reviewCard(cardId: string, difficulty: 'hard' | 'medium' | 'easy'): void {
    const card = this.flashcards.find(fc => fc.id === cardId);
    if (card) {
      card.difficulty = difficulty;
      card.repetitions++;
      
      // Simple SRS algorithm
      let interval = card.interval;
      if (difficulty === 'hard') {
        interval = 1;
      } else if (difficulty === 'medium') {
        interval = card.interval * 1.5;
      } else {
        interval = card.interval * 2;
      }
      
      card.interval = Math.max(1, Math.floor(interval));
      card.nextReview = new Date(Date.now() + card.interval * 24 * 60 * 60 * 1000);
      
      this.flashcardsSubject.next([...this.flashcards]);
      this.saveToLocalStorage();
    }
  }

  getDueCount(): number {
    return this.flashcards.filter(fc => new Date() >= fc.nextReview).length;
  }

  scheduleFlashcardForImmediateReview(vocabularyId: string): void {
    const flashcard = this.flashcards.find(fc => fc.vocabularyId === vocabularyId);
    if (flashcard) {
      flashcard.nextReview = new Date(); // Set to now
      console.log('⚡ Flashcard scheduled for immediate review:', flashcard.front);
      this.flashcardsSubject.next([...this.flashcards]);
      this.saveToLocalStorage();
    } else {
      console.warn('⚠️ No flashcard found for vocabulary ID:', vocabularyId);
    }
  }

  private saveToLocalStorage(): void {
    localStorage.setItem('flashcards', JSON.stringify(this.flashcards));
  }

  private loadFromLocalStorage(): void {
    const stored = localStorage.getItem('flashcards');
    if (stored) {
      this.flashcards = JSON.parse(stored);
      this.flashcards.forEach(fc => {
        fc.nextReview = new Date(fc.nextReview);
      });
      this.flashcardsSubject.next(this.flashcards);
    }
  }
}
