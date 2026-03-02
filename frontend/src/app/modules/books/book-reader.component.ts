import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BookService } from '../../core/services/book.service';
import { VocabularyService } from '../../core/services/vocabulary.service';
import { ThemeService, Theme } from '../../core/services/theme.service';
import { Book, Chapter, Word } from '../../core/models/index';

@Component({
  selector: 'app-book-reader',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div [ngClass]="currentTheme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'" 
         class="min-h-screen transition-colors duration-300"
         *ngIf="book && chapter">
      <div class="max-w-2xl mx-auto px-6 py-12">
        <!-- Header -->
        <div class="mb-10">
          <button (click)="goBack()" 
                  [ngClass]="currentTheme === 'dark' ? 'text-slate-400 hover:text-slate-300' : 'text-slate-600 hover:text-slate-800'"
                  class="mb-8 font-medium text-sm transition-colors uppercase tracking-wide">
            ← Back to Books
          </button>
          <h1 [ngClass]="currentTheme === 'dark' ? 'text-slate-100' : 'text-slate-800'" 
              class="text-5xl font-semibold mb-3 transition-colors" 
              style="font-family: 'Merriweather', serif;">
            {{ book.title }}
          </h1>
          <h2 [ngClass]="currentTheme === 'dark' ? 'text-slate-300' : 'text-slate-700'" 
              class="text-2xl font-light mb-3 transition-colors"
              style="font-family: 'Merriweather', serif;">
            {{ chapter.title }}
          </h2>
          <p [ngClass]="currentTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'" 
             class="text-xs uppercase tracking-widest transition-colors">
            Chapter {{ chapter.number }} of {{ totalChapters }}
          </p>
        </div>

        <!-- Progress Bar -->
        <div [ngClass]="currentTheme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'" 
             class="w-full h-1 rounded-full mb-12 overflow-hidden transition-colors">
          <div [ngClass]="currentTheme === 'dark' ? 'bg-gradient-to-r from-blue-400 to-blue-500' : 'bg-gradient-to-r from-slate-400 to-slate-500'" 
               class="h-1 rounded-full transition-all duration-500" 
               [style.width.%]="(chapter.number / totalChapters) * 100"></div>
        </div>

        <!-- Book Content -->
        <article [ngClass]="currentTheme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'" 
             class="rounded-lg shadow-sm p-16 mb-12 transition-colors"
             style="border: 1px solid; box-shadow: 0 2px 8px rgba(0,0,0,0.04);"
             #contentContainer
             (click)="onContentClick($event)">
          <div *ngFor="let paragraph of chapter.content; let i = index" 
               class="mb-8 last:mb-0">
            <div [innerHTML]="sanitizeHtml(paragraph)" class="book-text"></div>
          </div>
        </article>

        <!-- Navigation -->
        <div class="flex gap-6 justify-center mb-8">
          <button *ngIf="chapter.number > 1"
                  (click)="previousChapter()"
                  [ngClass]="currentTheme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-600 hover:bg-slate-700'"
                  class="px-7 py-3 text-white rounded-md transition-all font-medium shadow-sm hover:shadow-md">
            ← Previous
          </button>
          <button *ngIf="chapter.number < totalChapters"
                  (click)="nextChapter()"
                  [ngClass]="currentTheme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-600 hover:bg-slate-700'"
                  class="px-7 py-3 text-white rounded-md transition-all font-medium shadow-sm hover:shadow-md">
            Next →
          </button>
        </div>

        <!-- Word Details Modal -->
        <div *ngIf="selectedWord" 
             [ngClass]="currentTheme === 'dark' ? 'bg-black bg-opacity-60' : 'bg-black bg-opacity-40'" 
             class="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm transition-colors"
             (click)="selectedWord = null">
          <div [ngClass]="currentTheme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'" 
               class="rounded-lg shadow-lg p-10 max-w-md w-full mx-4 transition-colors"
               style="border: 1px solid;"
               (click)="$event.stopPropagation()">
            <!-- Close Button -->
            <button (click)="selectedWord = null" 
                    [ngClass]="currentTheme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'"
                    class="float-right text-2xl font-light transition-colors">
              ×
            </button>
            
            <!-- Word Display -->
            <div class="text-center mb-8 pt-2">
              <div [ngClass]="currentTheme === 'dark' ? 'text-slate-100' : 'text-slate-800'" 
                   class="text-6xl font-semibold mb-3 transition-colors">
                {{ selectedWord.kanji }}
              </div>
              <div [ngClass]="currentTheme === 'dark' ? 'text-blue-400' : 'text-slate-600'" 
                   class="text-2xl mb-2 font-medium transition-colors"
                   style="font-family: 'Merriweather', serif;">
                {{ selectedWord.reading }}
              </div>
            </div>

            <!-- Details -->
            <div [ngClass]="currentTheme === 'dark' ? 'border-slate-700' : 'border-slate-200'" 
                 class="border-t border-b py-6 mb-8 space-y-4 transition-colors">
              <div>
                <p [ngClass]="currentTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'" 
                   class="text-xs font-semibold uppercase tracking-wide mb-1 transition-colors">
                  Reading
                </p>
                <p [ngClass]="currentTheme === 'dark' ? 'text-slate-100' : 'text-slate-800'" 
                   class="text-lg transition-colors">
                  {{ selectedWord.reading }}
                </p>
              </div>
              <div>
                <p [ngClass]="currentTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'" 
                   class="text-xs font-semibold uppercase tracking-wide mb-1 transition-colors">
                  Meaning
                </p>
                <p [ngClass]="currentTheme === 'dark' ? 'text-slate-100' : 'text-slate-800'" 
                   class="text-lg transition-colors">
                  {{ selectedWord.meaning }}
                </p>
              </div>
              <div>
                <p [ngClass]="currentTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'" 
                   class="text-xs font-semibold uppercase tracking-wide mb-1 transition-colors">
                  Type
                </p>
                <p [ngClass]="currentTheme === 'dark' ? 'text-slate-100' : 'text-slate-800'" 
                   class="text-lg transition-colors">
                  {{ selectedWord.pos }}
                </p>
              </div>
            </div>

            <!-- Save Button -->
            <button (click)="saveToVocabulary()"
                    class="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md transition-all font-medium shadow-sm hover:shadow-md">
              💾 Save to Vocabulary
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .book-text {
      font-family: 'Merriweather', 'Georgia', serif;
      color: #3f3f46;
      line-height: 2.2;
      font-size: 1.5rem;
      font-weight: 400;
      letter-spacing: 0.02em;
    }

    :host-context(.dark) .book-text {
      color: #e4e4e7;
    }

    .book-text p {
      margin: 0;
      text-align: center;
    }

    ::ng-deep ruby {
      position: relative;
      display: inline;
      cursor: pointer;
      margin: 0 1px;
    }

    ::ng-deep ruby rt {
      position: absolute;
      top: -1.2em;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.5em;
      line-height: 1;
      font-weight: 400;
      color: #7c3aed;
      white-space: nowrap;
      text-align: center;
      transition: all 0.2s ease;
      pointer-events: none;
      font-family: 'Merriweather', 'Georgia', serif;
    }

    :host-context(.dark) ::ng-deep ruby rt {
      color: #a78bfa;
    }

    ::ng-deep ruby rb {
      display: inline;
    }

    ::ng-deep ruby[data-word-id] {
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      padding: 2px 4px;
      border-radius: 3px;
    }

    ::ng-deep ruby[data-word-id]:hover {
      background-color: rgba(124, 58, 237, 0.1);
      text-decoration: underline;
      text-decoration-color: rgba(124, 58, 237, 0.3);
      text-underline-offset: 2px;
    }

    :host-context(.dark) ::ng-deep ruby[data-word-id]:hover {
      background-color: rgba(167, 139, 250, 0.15);
      text-decoration-color: rgba(167, 139, 250, 0.4);
    }

    ::ng-deep ruby[data-word-id]:active {
      background-color: rgba(124, 58, 237, 0.15);
    }

    :host-context(.dark) ::ng-deep ruby[data-word-id]:active {
      background-color: rgba(167, 139, 250, 0.2);
    }
  `]
})
export class BookReaderComponent implements OnInit, AfterViewInit {
  @ViewChild('contentContainer') contentContainer?: ElementRef;

  book?: Book;
  chapter?: Chapter;
  totalChapters = 0;
  currentTheme: Theme = 'light';
  selectedWord: { id: string; kanji: string; reading: string; meaning: string; pos: string } | null = null;

  private hiddenFurigana = new Set<string>();

  private kanji: { [key: string]: { meaning: string; pos: string } } = {
    '小': { meaning: 'small', pos: 'kanji' },
    '猫': { meaning: 'cat', pos: 'noun' },
    '名前': { meaning: 'name', pos: 'noun' },
    '白': { meaning: 'white', pos: 'kanji' },
    '目': { meaning: 'eye', pos: 'noun' },
    '大': { meaning: 'big, large', pos: 'kanji' },
    '可愛': { meaning: 'cute, lovely', pos: 'i-adj' },
    '田中': { meaning: 'Tanaka (name)', pos: 'name' },
    '家': { meaning: 'house, home', pos: 'noun' },
    '住': { meaning: 'live, dwell', pos: 'verb' },
    '毎日': { meaning: 'every day', pos: 'adverb' },
    '朝': { meaning: 'morning', pos: 'noun' },
    '起': { meaning: 'wake up, rise', pos: 'verb' },
    '食': { meaning: 'eat, food', pos: 'verb' },
    '魚': { meaning: 'fish', pos: 'noun' },
    '好': { meaning: 'like, love', pos: 'verb' },
    'お昼': { meaning: 'noon, lunch', pos: 'noun' },
    '外': { meaning: 'outside', pos: 'noun' },
    '遊': { meaning: 'play', pos: 'verb' },
    '友達': { meaning: 'friend', pos: 'noun' },
    '犬': { meaning: 'dog', pos: 'noun' },
    '一緒': { meaning: 'together', pos: 'noun' },
    '夜': { meaning: 'night', pos: 'noun' },
    '疲': { meaning: 'tired', pos: 'verb' },
    'ひざ': { meaning: 'knee', pos: 'noun' },
    '上': { meaning: 'top, above', pos: 'noun' },
    '寝': { meaning: 'sleep', pos: 'verb' },
    '幸': { meaning: 'happiness', pos: 'kanji' }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService,
    private vocabularyService: VocabularyService,
    private sanitizer: DomSanitizer,
    private themeService: ThemeService
  ) { }

  ngOnInit(): void {
    // Subscribe to theme changes
    this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });

    this.route.paramMap.subscribe(params => {
      const bookId = params.get('bookId');
      const chapterId = params.get('chapterId');

      if (bookId) {
        this.book = this.bookService.getBook(bookId);
        if (this.book) {
          this.totalChapters = this.book.chaptersCount;
          
          if (chapterId) {
            this.chapter = this.bookService.getChapter(bookId, chapterId);
          } else {
            const chapters = this.bookService.getChapters(bookId);
            this.chapter = chapters[0];
          }
        }
      }
    });
  }

  ngAfterViewInit(): void {
    // Event delegation for ruby clicks
    setTimeout(() => {
      const container = this.contentContainer?.nativeElement;
      if (container) {
        container.addEventListener('click', (event: MouseEvent) => {
          let target = event.target as HTMLElement;
          
          // Handle RT click
          if (target.tagName === 'RT') {
            target = target.parentElement!;
          }
          
          // Find ruby element
          let rubyElement = target.tagName === 'RUBY' ? target : target.closest('ruby');
          
          if (rubyElement && rubyElement.hasAttribute('data-word-id')) {
            event.stopPropagation();
            this.toggleFurigana(rubyElement);
          }
        });
      }
    }, 150);
  }

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private toggleFurigana(rubyElement: HTMLElement): void {
    const wordId = rubyElement.getAttribute('data-word-id');
    if (!wordId) return;

    const rtElement = rubyElement.querySelector('rt') as HTMLElement;
    if (!rtElement) return;

    if (this.hiddenFurigana.has(wordId)) {
      this.hiddenFurigana.delete(wordId);
      rtElement.style.display = 'inline';
    } else {
      this.hiddenFurigana.add(wordId);
      rtElement.style.display = 'none';
    }
  }

  onContentClick(event: Event): void {
    let target = event.target as HTMLElement;
    
    if (target.tagName === 'RT') {
      target = target.parentElement!;
    }
    
    let rubyElement = target.tagName === 'RUBY' ? target : target.closest('ruby');
    
    if (rubyElement && rubyElement.hasAttribute('data-word-id')) {
      const wordId = rubyElement.getAttribute('data-word-id');
      const rtElement = rubyElement.querySelector('rt');
      const kanji = rubyElement.textContent?.replace(rtElement?.textContent || '', '').trim() || '';
      const reading = rtElement?.textContent || '';

      this.selectedWord = {
        id: wordId || '',
        kanji: kanji,
        reading: reading,
        meaning: this.kanji[kanji]?.meaning || 'Unknown',
        pos: this.kanji[kanji]?.pos || 'N/A'
      };
    }
  }

  saveToVocabulary(): void {
    if (!this.selectedWord || !this.chapter || !this.book) return;

    const word = {
      id: this.selectedWord.id,
      text: this.selectedWord.kanji,
      reading: this.selectedWord.reading,
      meaning: this.selectedWord.meaning,
      partOfSpeech: this.selectedWord.pos
    };

    this.vocabularyService.addWord(
      word,
      `From: ${this.book.title} - ${this.chapter.title}`
    );

    alert(`✅ "${this.selectedWord.kanji}" added to vocabulary!`);
    this.selectedWord = null;
  }

  goBack(): void {
    this.router.navigate(['/books']);
  }

  nextChapter(): void {
    if (this.book && this.chapter) {
      const chapters = this.bookService.getChapters(this.book.id);
      const nextIndex = this.chapter.number;
      if (nextIndex < chapters.length) {
        this.router.navigate(['/books', this.book.id, chapters[nextIndex].id]);
      }
    }
  }

  previousChapter(): void {
    if (this.book && this.chapter) {
      const chapters = this.bookService.getChapters(this.book.id);
      const prevIndex = this.chapter.number - 2;
      if (prevIndex >= 0) {
        this.router.navigate(['/books', this.book.id, chapters[prevIndex].id]);
      }
    }
  }
}
