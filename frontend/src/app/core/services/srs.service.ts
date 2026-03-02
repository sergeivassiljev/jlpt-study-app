import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FlashCard } from '../models/index';
import { VocabularyService } from './vocabulary.service';
import { HttpClient } from '@angular/common/http';

type ApiFlashCard = Omit<FlashCard, 'nextReview'> & {
  nextReview: string | Date;
};

@Injectable({
  providedIn: 'root'
})
export class SrsService {
  private flashcards: FlashCard[] = [];
  private flashcardsSubject = new BehaviorSubject<FlashCard[]>(this.flashcards);
  flashcards$ = this.flashcardsSubject.asObservable();
  private vocabularySubscription: any;
  private readonly apiBaseUrl = 'http://localhost:3000';
  private currentUserId: string | null = null;

  constructor(
    private vocabularyService: VocabularyService,
    private http: HttpClient
  ) {
    // Don't load from localStorage on init - wait for user context
    // this.loadFromLocalStorage();
    // this.refreshFlashcardsFromApi();
  }

  /** Initialize flashcards for a specific user */
  initializeForUser(userId: string): void {
    if (this.currentUserId !== userId) {
      this.currentUserId = userId;
      this.flashcards = [];
      this.loadFromLocalStorage();
      this.refreshFlashcardsFromApi();
    }
  }

  /** Clear all flashcard data (call on logout) */
  clearAll(): void {
    this.currentUserId = null;
    this.flashcards = [];
    this.flashcardsSubject.next([]);
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
      if (vocab.length >= 0) {
        this.refreshFlashcardsFromApi();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.vocabularySubscription) {
      this.vocabularySubscription.unsubscribe();
    }
  }

  reviewCard(cardId: string, difficulty: 'hard' | 'medium' | 'easy'): void {
    this.http.patch<ApiFlashCard>(
      `${this.apiBaseUrl}/flashcards/${cardId}/review`,
      { difficulty }
    ).subscribe({
      next: () => {
        this.refreshFlashcardsFromApi();
        this.vocabularyService.refreshVocabularyFromApi();
      },
      error: () => {
        const card = this.flashcards.find(fc => fc.id === cardId);
        if (card) {
          card.difficulty = difficulty;
          card.repetitions++;

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
    });
  }

  getDueCount(): number {
    return this.flashcards.filter(fc => new Date() >= fc.nextReview).length;
  }

  scheduleFlashcardForImmediateReview(vocabularyId: string): void {
    this.http.patch<ApiFlashCard>(
      `${this.apiBaseUrl}/flashcards/by-vocabulary/${vocabularyId}/schedule-now`,
      {}
    ).subscribe({
      next: () => {
        this.refreshFlashcardsFromApi();
      },
      error: () => {
        const flashcard = this.flashcards.find(fc => fc.vocabularyId === vocabularyId);
        if (flashcard) {
          flashcard.nextReview = new Date();
          this.flashcardsSubject.next([...this.flashcards]);
          this.saveToLocalStorage();
        }
      }
    });
  }

  refreshFlashcardsFromApi(): void {
    this.http.get<ApiFlashCard[]>(
      `${this.apiBaseUrl}/flashcards`
    ).subscribe({
      next: (cards) => {
        this.flashcards = cards.map(card => this.normalizeFlashcard(card));
        this.flashcardsSubject.next([...this.flashcards]);
        this.saveToLocalStorage();
      },
      error: () => {
        this.flashcardsSubject.next([...this.flashcards]);
      }
    });
  }

  private saveToLocalStorage(): void {
    if (this.currentUserId) {
      const key = `flashcards_${this.currentUserId}`;
      localStorage.setItem(key, JSON.stringify(this.flashcards));
    }
  }

  private loadFromLocalStorage(): void {
    if (this.currentUserId) {
      const key = `flashcards_${this.currentUserId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored) as ApiFlashCard[];
        this.flashcards = parsed.map(card => this.normalizeFlashcard(card));
        this.flashcardsSubject.next(this.flashcards);
      }
    }
  }

  private normalizeFlashcard(card: ApiFlashCard): FlashCard {
    return {
      ...card,
      nextReview: new Date(card.nextReview)
    };
  }

}
