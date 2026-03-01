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
    <div [ngClass]="currentTheme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'" 
         class="min-h-screen transition-colors duration-300">
      <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <div class="mb-12">
          <h1 [ngClass]="currentTheme === 'dark' ? 'text-slate-100' : 'text-slate-800'" 
              class="text-4xl font-bold mb-2 transition-colors">
            📖 Reading Books
          </h1>
          <p [ngClass]="currentTheme === 'dark' ? 'text-slate-400' : 'text-slate-600'" 
             class="transition-colors">
            Choose a book to start reading and learning kanji
          </p>
        </div>

        <!-- Books Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let book of books" 
               (click)="selectBook(book)"
               [ngClass]="currentTheme === 'dark' 
                 ? 'bg-slate-800 border-slate-700 hover:border-blue-500 hover:shadow-blue-500/50' 
                 : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-blue-400/30'"
               class="rounded-xl shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer p-6 hover:scale-105 border book-card">
            
            <!-- Book Cover -->
            <div class="mb-4 flex justify-center items-center p-3 rounded-xl" 
                 [ngClass]="currentTheme === 'dark' 
                   ? 'bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600' 
                   : 'bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300'"
                 style="height: 200px;">
              <img *ngIf="book.coverImage && book.coverImage.includes('/')"
                   [src]="book.coverImage"
                   [alt]="book.title"
                   class="max-h-full max-w-full object-contain rounded-lg shadow-lg">
              <div *ngIf="!book.coverImage || !book.coverImage.includes('/')" 
                   class="text-6xl">{{ book.coverImage || '📚' }}</div>
            </div>

            <!-- Book Title -->
            <h3 [ngClass]="currentTheme === 'dark' ? 'text-slate-100' : 'text-slate-800'" 
                class="text-xl font-bold mb-2 transition-colors">
              {{ book.title }}
            </h3>

            <!-- Level Badge -->
            <span [ngClass]="currentTheme === 'dark' 
                   ? 'bg-blue-900 text-blue-200' 
                   : 'bg-blue-100 text-blue-800'"
                  class="inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3 transition-colors">
              {{ book.level }}
            </span>

            <!-- Description with Furigana -->
            <div [ngClass]="currentTheme === 'dark' ? 'text-slate-400' : 'text-slate-600'" 
                 [innerHTML]="sanitizeHtml(book.description)"
                 class="mb-4 transition-colors"
                 style="line-height: 2;">
            </div>

            <!-- Chapters Info -->
            <div [ngClass]="currentTheme === 'dark' ? 'text-slate-500' : 'text-slate-500'" 
                 class="text-sm transition-colors">
              <p>Chapters: {{ book.chaptersCount }}</p>
            </div>

            <!-- Read Button -->
            <button class="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold shadow-sm hover:shadow-md">
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
