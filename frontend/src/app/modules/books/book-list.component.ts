import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BookService } from '../../core/services/book.service';
import { ThemeService, Theme } from '../../core/services/theme.service';
import { Book } from '../../core/models/index';
import { pageEnter, cardStagger, listItem } from '../../core/animations/page.animations';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule],
  animations: [pageEnter, cardStagger, listItem],
  template: `
    <div class="themed-page min-h-screen transition-colors duration-300 bg-light-bg dark:bg-dark-bg text-light-paragraph dark:text-dark-paragraph" @pageEnter>
      <div class="container mx-auto px-4 py-12 max-w-7xl">
        <!-- Header Section -->
        <div class="mb-10 text-center">
          <h1 class="text-4xl font-bold mb-3">
            <span class="inline-block text-3xl">📖</span>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dark dark:from-primary-dark dark:to-primary">Reading Books</span>
          </h1>
          <p class="text-base text-light-paragraph dark:text-dark-paragraph opacity-75 max-w-2xl mx-auto">
            Immerse yourself in Japanese literature and learning materials. Select a book to start your reading journey and master kanji through meaningful context.
          </p>
        </div>

        <!-- Books Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10" @cardStagger>
          <div *ngFor="let book of books" @listItem
               (click)="selectBook(book)"
               class="group cursor-pointer">
            
            <!-- Card Container -->
            <div class="h-full bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-primary dark:hover:border-primary-dark hover:scale-105 flex flex-col">
              
              <!-- Book Cover with Gradient Overlay -->
              <div class="relative h-48 bg-gradient-to-br from-primary to-primary-dark overflow-hidden flex items-center justify-center">
                <img *ngIf="book.coverImage && book.coverImage.includes('/')"
                     [src]="book.coverImage"
                     [alt]="book.title"
                     class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
                <div *ngIf="!book.coverImage || !book.coverImage.includes('/')" 
                     class="text-6xl group-hover:scale-125 transition-transform duration-300">
                  {{ book.coverImage || '📚' }}
                </div>
                
                <!-- Level Badge Overlay -->
                <div class="absolute top-3 right-3 bg-white dark:bg-slate-900 backdrop-blur rounded-full px-3 py-1.5 shadow-lg">
                  <span class="font-bold text-xs text-primary dark:text-primary-dark">{{ book.level }}</span>
                </div>
              </div>
              
              <!-- Content Section -->
              <div class="p-5 flex-1 flex flex-col">
                <!-- Title -->
                <h3 class="text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary dark:group-hover:text-primary-dark transition-colors text-light-headline dark:text-dark-headline">
                  {{ book.title }}
                </h3>

                <!-- Description -->
                <div [innerHTML]="sanitizeHtml(book.description)"
                     class="mb-4 flex-1 text-sm text-light-paragraph dark:text-dark-paragraph opacity-80 line-clamp-3"
                     style="line-height: 1.6;">
                </div>

                <!-- Stats -->
                <div class="grid grid-cols-2 gap-3 mb-4 p-3 bg-light-bg dark:bg-slate-700 rounded-lg">
                  <div>
                    <p class="text-xs opacity-70 font-semibold">Chapters</p>
                    <p class="text-xl font-bold text-primary dark:text-primary-dark">{{ book.chaptersCount }}</p>
                  </div>
                  <div>
                    <p class="text-xs opacity-70 font-semibold">Level</p>
                    <p class="text-xl font-bold text-primary dark:text-primary-dark">{{ book.level }}</p>
                  </div>
                </div>

                <!-- CTA Button -->
                <button class="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary to-primary-dark text-white font-semibold hover:shadow-lg transition-all duration-300 transform group-hover:scale-105 flex items-center justify-center gap-2 text-sm">
                  <span>Start Reading</span>
                  <span class="text-lg">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="books.length === 0" class="text-center py-12">
          <p class="text-xl text-light-paragraph dark:text-dark-paragraph opacity-60">
            No books available yet. Check back soon!
          </p>
        </div>

        <!-- Learning Tips -->
        <div class="bg-gradient-to-r from-primary to-primary-dark rounded-xl p-6 text-white shadow-xl" @pageEnter>
          <div class="flex items-start gap-4">
            <div class="text-4xl inline-block">💡</div>
            <div>
              <h3 class="text-xl font-bold mb-2">Reading Tips for Maximum Learning</h3>
              <ul class="space-y-1.5 text-sm opacity-90">
                <li class="flex items-center gap-2"><span>✓</span> Start with lower levels and gradually progress</li>
                <li class="flex items-center gap-2"><span>✓</span> Read actively - hover over kanji to learn readings</li>
                <li class="flex items-center gap-2"><span>✓</span> Review vocabulary from completed chapters</li>
                <li class="flex items-center gap-2"><span>✓</span> Combine reading with our vocabulary and kanji modules</li>
              </ul>
            </div>
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
    
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
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
