import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Kana {
  id: string;
  character: string;
  romaji: string;
  type: 'hiragana' | 'katakana';
  strokeOrder?: string;
  isDiacritical: boolean;
}

export type KanaMasteryLevel = 'not_practiced' | 'weak' | 'medium' | 'strong';

export interface KanaStats {
  id: number;
  userId: string;
  kanaId: number;
  character: string;
  romaji: string;
  type: 'hiragana' | 'katakana';
  totalAttempts: number;
  correctAttempts: number;
  incorrectAttempts: number;
  avgResponseTime: number;
  accuracy: number;
  masteryScore: number;
  masteryLevel: KanaMasteryLevel;
  lastPracticedAt: Date | null;
}

export interface UserKanaStatsOverview {
  totalKanaPracticed: number;
  totalAttempts: number;
  overallAccuracy: number;
  avgResponseTime: number;
  strongCount: number;
  mediumCount: number;
  weakCount: number;
  notPracticedCount: number;
}

export interface RecordAttemptDto {
  kanaId: number;
  character: string;
  romaji: string;
  type: 'hiragana' | 'katakana';
  isCorrect: boolean;
  responseTime: number;
}

@Injectable({
  providedIn: 'root',
})
export class KanaService {
  private apiUrl = 'http://localhost:3000/kana';
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  getAllKana(type?: 'hiragana' | 'katakana'): Observable<Kana[]> {
    this.loadingSubject.next(true);
    let url = this.apiUrl;
    if (type) {
      url += `?type=${type}`;
    }
    return new Observable(observer => {
      this.http.get<Kana[]>(url).subscribe({
        next: data => {
          observer.next(data);
          observer.complete();
          this.loadingSubject.next(false);
        },
        error: err => {
          observer.error(err);
          this.loadingSubject.next(false);
        }
      });
    });
  }

  getRandomKana(type?: 'hiragana' | 'katakana', count: number = 1): Observable<Kana[]> {
    this.loadingSubject.next(true);
    let url = `${this.apiUrl}/random?count=${count}`;
    if (type) {
      url += `&type=${type}`;
    }
    return new Observable(observer => {
      this.http.get<Kana[]>(url).subscribe({
        next: data => {
          observer.next(data);
          observer.complete();
          this.loadingSubject.next(false);
        },
        error: err => {
          observer.error(err);
          this.loadingSubject.next(false);
        }
      });
    });
  }

  searchKana(query: string): Observable<Kana[]> {
    this.loadingSubject.next(true);
    const url = `${this.apiUrl}/search?q=${encodeURIComponent(query)}`;
    return new Observable(observer => {
      this.http.get<Kana[]>(url).subscribe({
        next: data => {
          observer.next(data);
          observer.complete();
          this.loadingSubject.next(false);
        },
        error: err => {
          observer.error(err);
          this.loadingSubject.next(false);
        }
      });
    });
  }

  // Stats methods
  recordAttempt(attempt: RecordAttemptDto): Observable<KanaStats> {
    return this.http.post<KanaStats>(`${this.apiUrl}/stats/record`, attempt);
  }

  getUserStats(type?: 'hiragana' | 'katakana'): Observable<KanaStats[]> {
    let url = `${this.apiUrl}/stats`;
    if (type) {
      url += `?type=${type}`;
    }
    return this.http.get<KanaStats[]>(url);
  }

  getUserStatsOverview(type?: 'hiragana' | 'katakana'): Observable<UserKanaStatsOverview> {
    let url = `${this.apiUrl}/stats/overview`;
    if (type) {
      url += `?type=${type}`;
    }
    return this.http.get<UserKanaStatsOverview>(url);
  }

  getWeakKana(type?: 'hiragana' | 'katakana'): Observable<KanaStats[]> {
    let url = `${this.apiUrl}/stats/weak`;
    if (type) {
      url += `?type=${type}`;
    }
    return this.http.get<KanaStats[]>(url);
  }

  resetStats(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/stats/reset`, {});
  }
}
