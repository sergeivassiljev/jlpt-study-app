import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Book, Chapter } from '../models/index';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private readonly apiBaseUrl = 'http://localhost:3000';
  private hasAttemptedSeed = false;

  // Runtime state - starts empty, populated from backend only
  private books: Book[] = [];
  private chapters = new Map<string, Chapter[]>();

  // Seed data - only used for initial backend population on first run
  private readonly seedData = this.initializeSeedData();

  private booksSubject = new BehaviorSubject<Book[]>(this.books);
  books$ = this.booksSubject.asObservable();

  constructor(private http: HttpClient) {
    this.syncBooksFromBackend();
  }

  getBooks(): Observable<Book[]> {
    return this.books$;
  }

  getBook(bookId: string): Book | undefined {
    return this.books.find(b => b.id === bookId);
  }

  getChapters(bookId: string): Chapter[] {
    return this.chapters.get(bookId) || [];
  }

  getChapter(bookId: string, chapterId: string): Chapter | undefined {
    const chapters = this.getChapters(bookId);
    return chapters.find(c => c.id === chapterId);
  }

  upsertBook(book: Book): Observable<Book> {
    return new Observable(observer => {
      this.http.post<Book>(`${this.apiBaseUrl}/books`, book).subscribe({
        next: (savedBook) => {
          const existingIndex = this.books.findIndex(existing => existing.id === savedBook.id);

          if (existingIndex >= 0) {
            this.books[existingIndex] = { ...this.books[existingIndex], ...savedBook };
          } else {
            this.books.push(savedBook);
          }

          this.booksSubject.next([...this.books]);
          observer.next(savedBook);
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
        }
      });
    });
  }

  deleteBook(bookId: string): Observable<any> {
    return new Observable(observer => {
      this.http.delete(`${this.apiBaseUrl}/books/${bookId}`).subscribe({
        next: (response) => {
          // Remove from local state
          this.books = this.books.filter(b => b.id !== bookId);
          this.chapters.delete(bookId);
          this.booksSubject.next([...this.books]);
          observer.next(response);
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
        }
      });
    });
  }

  deleteChapter(bookId: string, chapterId: string): Observable<any> {
    return new Observable(observer => {
      this.http.delete(`${this.apiBaseUrl}/books/${bookId}/chapters/${chapterId}`).subscribe({
        next: (response) => {
          // Remove from local state
          const chapters = this.chapters.get(bookId) || [];
          this.chapters.set(bookId, chapters.filter(c => c.id !== chapterId));
          observer.next(response);
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
        }
      });
    });
  }

  private syncBooksFromBackend(): void {
    this.http.get<any[]>(`${this.apiBaseUrl}/books`).subscribe({
      next: (booksWithChapters) => {
        if (!booksWithChapters || booksWithChapters.length === 0) {
          // Backend is empty, seed it with local data
          this.seedBackendFromLocalData();
          return;
        }

        // Backend has data, use it as the single source of truth
        this.books = booksWithChapters.map(b => ({
          id: b.id,
          title: b.title,
          description: b.description,
          level: b.level,
          chaptersCount: b.chaptersCount,
          coverImage: b.coverImage
        }));

        booksWithChapters.forEach(book => {
          if (book.chapters && book.chapters.length > 0) {
            this.chapters.set(book.id, book.chapters);
          }
        });

        this.booksSubject.next([...this.books]);
      },
      error: () => {
        // Backend unavailable, attempt to seed
        this.seedBackendFromLocalData();
      }
    });
  }

  private seedBackendFromLocalData(): void {
    if (this.hasAttemptedSeed) {
      // Already tried seeding, just use what we have from seed data
      this.books = this.seedData.books;
      this.seedData.chapters.forEach((chapters, bookId) => {
        this.chapters.set(bookId, chapters);
      });
      this.booksSubject.next([...this.books]);
      return;
    }

    this.hasAttemptedSeed = true;

    // Post all books from seed data to backend
    const bookRequests = this.seedData.books.map(book =>
      this.http.post(`${this.apiBaseUrl}/books`, book).pipe(catchError(() => of(null)))
    );

    forkJoin(bookRequests).subscribe({
      next: () => {
        // Post all chapters from seed data to backend
        const chapterRequests: Observable<unknown>[] = [];
        this.seedData.chapters.forEach((chapters, bookId) => {
          chapters.forEach(chapter => {
            chapterRequests.push(
              this.http.post(`${this.apiBaseUrl}/books/${bookId}/chapters`, chapter).pipe(
                catchError(() => of(null))
              )
            );
          });
        });

        if (chapterRequests.length === 0) {
          // Re-sync from backend after seeding
          this.syncBooksFromBackend();
          return;
        }

        forkJoin(chapterRequests).subscribe({
          next: () => {
            // After seeding, fetch from backend to ensure consistency
            this.syncBooksFromBackend();
          },
          error: () => {
            // Fall back to seed data if seeding fails
            this.books = this.seedData.books;
            this.seedData.chapters.forEach((chapters, bookId) => {
              this.chapters.set(bookId, chapters);
            });
            this.booksSubject.next([...this.books]);
          }
        });
      },
      error: () => {
        // Seeding failed, fall back to seed data
        this.books = this.seedData.books;
        this.seedData.chapters.forEach((chapters, bookId) => {
          this.chapters.set(bookId, chapters);
        });
        this.booksSubject.next([...this.books]);
      }
    });
  }

  private initializeSeedData(): { books: Book[]; chapters: Map<string, Chapter[]> } {
    // All data now comes from backend - no local seed data
    return { books: [], chapters: new Map() };
  }
}
