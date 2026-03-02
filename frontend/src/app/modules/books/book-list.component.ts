import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BookService } from '../../core/services/book.service';
import { ThemeService, Theme } from '../../core/services/theme.service';
import { Book } from '../../core/models/index';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen transition-colors duration-300 bg-light-bg dark:bg-dark-bg text-light-paragraph dark:text-dark-paragraph">
      <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <div class="mb-12">
          <h1 class="text-4xl font-bold mb-2 transition-colors text-light-headline dark:text-dark-headline">
            📖 Reading Books
          </h1>
          <p class="transition-colors text-light-paragraph dark:text-dark-paragraph">
            Choose a book to start reading and learning kanji
          </p>
        </div>

        <!-- Books Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let book of books" 
               (click)="selectBook(book)"
               class="rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer p-6 hover:scale-105 border border-secondary dark:border-success bg-white dark:bg-slate-800 hover:border-primary dark:hover:border-primary-dark book-card transition-colors">
            
            <!-- Book Cover -->
            <div class="mb-4 flex justify-center items-center p-3 rounded-xl border border-secondary dark:border-success" 
                 style="height: 200px;">
              <img *ngIf="book.coverImage && book.coverImage.includes('/')"
                   [src]="book.coverImage"
                   [alt]="book.title"
                   class="max-h-full max-w-full object-contain rounded-lg shadow-lg">
              <div *ngIf="!book.coverImage || !book.coverImage.includes('/')" 
                   class="text-6xl">{{ book.coverImage || '📚' }}</div>
            </div>

            <!-- Book Title -->
            <h3 class="text-xl font-bold mb-2 transition-colors text-light-headline dark:text-dark-headline">
              {{ book.title }}
            </h3>

            <!-- Level Badge -->
            <span class="inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3 transition-colors bg-primary text-white">
              {{ book.level }}
            </span>

            <!-- Description with Furigana -->
            <div [innerHTML]="sanitizeHtml(book.description)"
                 class="mb-4 transition-colors text-light-paragraph dark:text-dark-paragraph"
                 style="line-height: 2;">
            </div>

            <!-- Chapters Info -->
            <div class="text-sm transition-colors text-light-paragraph dark:text-dark-paragraph">
              <p>Chapters: {{ book.chaptersCount }}</p>
            </div>

            <!-- Read Button -->
            <button class="mt-4 w-full px-4 py-2 bg-light-button dark:bg-dark-button hover:opacity-90 text-white rounded-lg transition font-semibold shadow-sm hover:shadow-md">
              Start Reading →
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    ruby {
      ruby-position: over;
    }
    
    rt {
      font-size: 0.6em;
      opacity: 0.8;
    }
    
    .book-card {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .book-card:hover {
      box-shadow: 0 20px 40px rgba(59, 130, 246, 0.25), 
                  0 0 30px rgba(59, 130, 246, 0.15);
    }
  `]
})
export class BookListComponent implements OnInit {
  books: Book[] = [];
  currentTheme: Theme = 'light';

  constructor(
    private bookService: BookService,
    private router: Router,
    private themeService: ThemeService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    // Subscribe to theme changes
    this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });

    this.bookService.getBooks().subscribe(books => {
      this.books = books;
    });
  }

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  selectBook(book: Book): void {
    const chapters = this.bookService.getChapters(book.id);
    if (chapters.length > 0) {
      this.router.navigate(['/books', book.id, chapters[0].id]);
    }
  }
}
