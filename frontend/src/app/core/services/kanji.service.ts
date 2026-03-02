import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Kanji } from '../models/index';
import { catchError, forkJoin, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KanjiService {
  private readonly apiBaseUrl = 'http://localhost:3000';
  private hasAttemptedSeed = false;

  private kanjiList: Kanji[] = [];
  private kanjiSubject = new BehaviorSubject<Kanji[]>(this.kanjiList);
  kanji$ = this.kanjiSubject.asObservable();

  constructor(private http: HttpClient) {
    this.syncKanjiFromBackend();
  }

  getKanji(): Observable<Kanji[]> {
    return this.kanji$;
  }

  getKanjiByCharacter(character: string): Kanji | undefined {
    return this.kanjiList.find(k => k.character === character);
  }

  private initializeN5Kanji(): Kanji[] {
    // All data now comes from backend - no local seed data
    return [];
  }

  private syncKanjiFromBackend(): void {
    this.http.get<Kanji[]>(`${this.apiBaseUrl}/kanji`).subscribe({
      next: (kanji) => {
        if (!kanji || kanji.length === 0) {
          this.seedBackendFromLocalData();
          return;
        }

        this.kanjiList = kanji;
        this.kanjiSubject.next([...this.kanjiList]);
      },
      error: () => {
        // Backend unavailable, try to seed it
        this.seedBackendFromLocalData();
      }
    });
  }

  private seedBackendFromLocalData(): void {
    if (this.hasAttemptedSeed) {
      this.kanjiSubject.next([...this.kanjiList]);
      return;
    }

    this.hasAttemptedSeed = true;

    // Use batch endpoint for efficiency
    this.http.post(`${this.apiBaseUrl}/kanji/batch`, this.kanjiList).pipe(
      catchError(() => {
        this.kanjiSubject.next([...this.kanjiList]);
        return of(null);
      })
    ).subscribe({
      next: () => {
        // After seeding, sync from backend
        this.syncKanjiFromBackend();
      },
      error: () => {
        this.kanjiSubject.next([...this.kanjiList]);
      }
    });
  }
}
