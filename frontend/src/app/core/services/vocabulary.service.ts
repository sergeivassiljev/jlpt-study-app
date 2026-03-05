import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import {
  DailyLessonPayload,
  JLPTLevel,
  StructuredLessonWord,
  TopicProgressSummary,
  VocabularyItem,
  Word,
} from '../models/index';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';

type ApiVocabularyItem = Omit<VocabularyItem, 'dateAdded' | 'nextReviewDate'> & {
  dateAdded: string | Date;
  nextReviewDate: string | Date;
};

type ApiDailyLessonPayload = Omit<DailyLessonPayload, 'words'> & {
  words: StructuredLessonWord[];
};

@Injectable({
  providedIn: 'root'
})
export class VocabularyService {
  private vocabulary: VocabularyItem[] = [];
  private vocabularySubject = new BehaviorSubject<VocabularyItem[]>(this.vocabulary);
  vocabulary$ = this.vocabularySubject.asObservable();
  private readonly apiBaseUrl = 'http://localhost:3000';
  private currentUserId: string | null = null;

  constructor(private http: HttpClient) {
    // Don't load from localStorage on init - wait for user context
    // this.loadFromLocalStorage();
    // this.refreshVocabularyFromApi();
  }

  /** Initialize vocabulary for a specific user */
  initializeForUser(userId: string): void {
    if (this.currentUserId !== userId) {
      this.currentUserId = userId;
      this.vocabulary = [];
      this.loadFromLocalStorage();
      this.refreshVocabularyFromApi();
    }
  }

  /** Clear all vocabulary data (call on logout) */
  clearAll(): void {
    this.currentUserId = null;
    this.vocabulary = [];
    this.vocabularySubject.next([]);
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

  getLessonTopics(level: JLPTLevel): Observable<TopicProgressSummary[]> {
    return this.http.get<TopicProgressSummary[]>(`${this.apiBaseUrl}/vocabulary/lessons/topics`, {
      params: { level },
    }).pipe(
      catchError(() => of([]))
    );
  }

  getDailyLesson(level: JLPTLevel, topic: string, limit: number): Observable<DailyLessonPayload> {
    return this.http.get<ApiDailyLessonPayload>(`${this.apiBaseUrl}/vocabulary/lessons/daily`, {
      params: { level, topic, limit },
    }).pipe(
      map((payload) => ({
        ...payload,
        words: payload.words ?? [],
      })),
      catchError(() => of({
        jlptLevel: level,
        topic,
        dailyLimit: limit,
        words: [],
        remainingWords: 0,
      }))
    );
  }

  getTopicLessonWords(level: JLPTLevel, topic: string, lessonOrder: number): Observable<StructuredLessonWord[]> {
    return this.http.get<StructuredLessonWord[]>(`${this.apiBaseUrl}/vocabulary/lessons/words`, {
      params: { level, topic, lessonOrder },
    }).pipe(
      catchError(() => of([]))
    );
  }

  completeLessonWord(lessonWordId: string, vocabularyId?: string): Observable<{ lessonWordId: string; completedAt: string } | null> {
    return this.http.post<{ lessonWordId: string; completedAt: string }>(
      `${this.apiBaseUrl}/vocabulary/lessons/complete`,
      { lessonWordId, vocabularyId }
    ).pipe(
      catchError(() => of(null))
    );
  }

  addWord(word: Word, exampleSentence: string): Observable<{ success: boolean; error?: string }> {
    return this.http.post<ApiVocabularyItem>(
      `${this.apiBaseUrl}/vocabulary`,
      { word, exampleSentence }
    ).pipe(
      map(() => {
        this.refreshVocabularyFromApi();
        return { success: true };
      }),
      catchError((error: HttpErrorResponse) => {
        // Check if it's a limit error
        if (error.status === 400 && error.error?.message?.includes('Vocabulary limit reached')) {
          return throwError(() => ({ success: false, error: error.error.message }));
        }
        
        // Fallback to local storage on other errors
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
        return of({ success: true });
      })
    );
  }

  updateReviewStatus(vocabularyId: string, difficulty: 'hard' | 'medium' | 'easy'): void {
    this.http.patch<ApiVocabularyItem>(
      `${this.apiBaseUrl}/vocabulary/${vocabularyId}/review`,
      { difficulty }
    ).subscribe({
      next: () => {
        this.refreshVocabularyFromApi();
      },
      error: () => {
        const item = this.vocabulary.find(v => v.id === vocabularyId);
        if (item) {
          item.difficulty = difficulty;
          item.reviewed = true;
          item.reviewCount++;

          const daysToAdd = difficulty === 'hard' ? 1 : difficulty === 'medium' ? 3 : 7;
          item.nextReviewDate = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);

          this.vocabularySubject.next([...this.vocabulary]);
          this.saveToLocalStorage();
        }
      }
    });
  }

  deleteWord(vocabularyId: string): void {
    this.http.delete(
      `${this.apiBaseUrl}/vocabulary/${vocabularyId}`
    ).subscribe({
      next: () => {
        this.refreshVocabularyFromApi();
      },
      error: () => {
        this.vocabulary = this.vocabulary.filter(v => v.id !== vocabularyId);
        this.vocabularySubject.next([...this.vocabulary]);
        this.saveToLocalStorage();
      }
    });
  }

  scheduleForImmediateReview(vocabularyId: string): void {
    this.http.patch<ApiVocabularyItem>(
      `${this.apiBaseUrl}/vocabulary/${vocabularyId}/schedule-now`,
      {}
    ).subscribe({
      next: () => {
        this.refreshVocabularyFromApi();
      },
      error: () => {
        const item = this.vocabulary.find(v => v.id === vocabularyId);
        if (item) {
          item.nextReviewDate = new Date();
          this.vocabularySubject.next([...this.vocabulary]);
          this.saveToLocalStorage();
        }
      }
    });
  }

  refreshVocabularyFromApi(): void {
    this.http.get<ApiVocabularyItem[]>(
      `${this.apiBaseUrl}/vocabulary`
    ).subscribe({
      next: (items) => {
        this.vocabulary = items.map(item => this.normalizeVocabularyItem(item));
        this.vocabularySubject.next([...this.vocabulary]);
        this.saveToLocalStorage();
      },
      error: () => {
        this.vocabularySubject.next([...this.vocabulary]);
      }
    });
  }

  private saveToLocalStorage(): void {
    if (this.currentUserId) {
      const key = `vocabulary_${this.currentUserId}`;
      localStorage.setItem(key, JSON.stringify(this.vocabulary));
    }
  }

  private loadFromLocalStorage(): void {
    if (this.currentUserId) {
      const key = `vocabulary_${this.currentUserId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored) as ApiVocabularyItem[];
        this.vocabulary = parsed.map(item => this.normalizeVocabularyItem(item));
        this.vocabularySubject.next(this.vocabulary);
      }
    }
  }

  private normalizeVocabularyItem(item: ApiVocabularyItem): VocabularyItem {
    return {
      ...item,
      dateAdded: new Date(item.dateAdded),
      nextReviewDate: new Date(item.nextReviewDate)
    };
  }

}
