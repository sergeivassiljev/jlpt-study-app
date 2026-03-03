import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BookService } from '../../core/services/book.service';
import { VocabularyService } from '../../core/services/vocabulary.service';
import { ThemeService, Theme } from '../../core/services/theme.service';
import { KanjiService } from '../../core/services/kanji.service';
import { Book, Chapter, Word, Kanji } from '../../core/models/index';

@Component({
  selector: 'app-book-reader',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen transition-colors duration-300 bg-light-bg dark:bg-dark-bg text-light-paragraph dark:text-dark-paragraph"
         *ngIf="book && chapter">

      <div class="max-w-4xl mx-auto px-6 py-12">
        <!-- Header -->
        <div class="mb-10">
          <button (click)="goBack()" 
                  class="mb-8 font-medium text-sm transition-colors uppercase tracking-wide text-light-paragraph dark:text-dark-paragraph hover:text-primary dark:hover:text-primary-dark">
            ← Back to Books
          </button>
          <h1 class="text-5xl font-semibold mb-3 transition-colors text-light-headline dark:text-dark-headline" 
              style="font-family: 'Merriweather', serif;">
            {{ book.title }}
          </h1>
          <h2 class="text-2xl font-light mb-3 transition-colors text-light-paragraph dark:text-dark-paragraph"
              style="font-family: 'Merriweather', serif;">
            {{ chapter.title }}
          </h2>
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p class="text-xs uppercase tracking-widest transition-colors text-light-paragraph dark:text-dark-paragraph">
              Chapter {{ chapter.number }} of {{ totalChapters }}
            </p>
            <div class="w-full md:w-64">
              <div class="flex items-center justify-between mb-1">
                <label for="textSizeSlider" class="text-[11px] font-semibold uppercase tracking-wide transition-colors text-light-paragraph dark:text-dark-paragraph">
                  Text Size
                </label>
                <span class="text-xs font-medium text-primary dark:text-primary-dark">{{ textSizeRem | number:'1.1-1' }}rem</span>
              </div>
              <input
                id="textSizeSlider"
                type="range"
                min="0"
                max="100"
                step="1"
                [(ngModel)]="textSize"
                class="w-full accent-primary dark:accent-primary-dark"
              />
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="w-full h-1 rounded-full mb-12 overflow-hidden transition-colors bg-secondary/20 dark:bg-success/20">
          <div class="h-1 rounded-full transition-all duration-500 bg-gradient-to-r from-primary to-primary-dark" 
               [style.width.%]="(chapter.number / totalChapters) * 100"></div>
        </div>

        <!-- Book Content -->
        <article class="rounded-lg shadow-sm p-20 mb-12 transition-colors bg-white dark:bg-slate-800 border border-secondary dark:border-success relative" 
             style="box-shadow: 0 2px 8px rgba(0,0,0,0.04);"
             [style.--reader-font-size.rem]="textSizeRem"
             #contentContainer
             (click)="onContentClick($event)">
          
          <!-- Floating Navigation Arrows -->
          <div class="absolute top-4 right-4 flex gap-2 z-50 nav-arrows">
            <button *ngIf="chapter.number > 1"
                    (click)="previousChapter()"
                    class="w-12 h-12 flex items-center justify-center rounded-full transition-all bg-white dark:bg-slate-800 border-2 border-primary dark:border-primary-dark shadow-lg hover:shadow-xl hover:scale-110 text-xl font-bold text-primary dark:text-primary-dark"
                    title="Previous Chapter">
              ←
            </button>
            <button *ngIf="chapter.number < totalChapters"
                    (click)="nextChapter()"
                    class="w-12 h-12 flex items-center justify-center rounded-full transition-all bg-white dark:bg-slate-800 border-2 border-primary dark:border-primary-dark shadow-lg hover:shadow-xl hover:scale-110 text-xl font-bold text-primary dark:text-primary-dark"
                    title="Next Chapter">
              →
            </button>
          </div>

          <div *ngFor="let paragraph of chapter.content; let i = index" 
               class="mb-8 last:mb-0">
            <div [innerHTML]="sanitizeHtml(paragraph)" class="book-text"></div>
          </div>

          <!-- Chapter Navigation -->
          <div class="mt-12 pt-8 border-t border-secondary dark:border-success flex gap-4 justify-center">
            <button *ngIf="chapter.number > 1"
                    (click)="previousChapter()"
                    class="px-6 py-2.5 bg-light-button dark:bg-dark-button hover:opacity-90 text-white rounded-md transition-all font-medium text-sm shadow-sm hover:shadow-md">
              ← Previous Chapter
            </button>
            <button *ngIf="chapter.number < totalChapters"
                    (click)="nextChapter()"
                    class="px-6 py-2.5 bg-light-button dark:bg-dark-button hover:opacity-90 text-white rounded-md transition-all font-medium text-sm shadow-sm hover:shadow-md">
              Next Chapter →
            </button>
          </div>
        </article>
      </div>

      <!-- Word Details Modal -->
        <div *ngIf="selectedWord" 
             class="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm transition-colors bg-black/40 dark:bg-black/60"
             (click)="closeWordModal()">
          <div class="rounded-lg shadow-lg p-10 max-w-md w-full mx-4 transition-colors bg-white dark:bg-slate-800 border border-secondary dark:border-success" 
               (click)="$event.stopPropagation()">
            <!-- Close Button -->
            <button (click)="closeWordModal()" 
                    class="float-right text-2xl font-light transition-colors text-light-paragraph dark:text-dark-paragraph hover:text-primary dark:hover:text-primary-dark">
              ×
            </button>
            
            <!-- Word Display -->
            <div class="text-center mb-8 pt-2">
              <div class="text-6xl font-semibold mb-3 transition-colors text-light-headline dark:text-dark-headline">
                {{ selectedWord.kanji }}
              </div>
              <div class="text-2xl mb-2 font-medium transition-colors text-primary dark:text-primary-dark"
                   style="font-family: 'Merriweather', serif;">
                {{ selectedWord.reading }}
              </div>
            </div>

            <!-- Details -->
            <div class="border-t border-b border-secondary dark:border-success py-6 mb-8 space-y-4 transition-colors">
              <div>
                <p class="text-xs font-semibold uppercase tracking-wide mb-1 transition-colors text-light-paragraph dark:text-dark-paragraph">
                  Reading
                </p>
                <p class="text-lg transition-colors text-light-headline dark:text-dark-headline">
                  {{ selectedWord.reading }}
                </p>
              </div>
              <div>
                <p class="text-xs font-semibold uppercase tracking-wide mb-1 transition-colors text-light-paragraph dark:text-dark-paragraph">
                  Meaning
                </p>
                <p class="text-lg transition-colors text-light-headline dark:text-dark-headline">
                  {{ selectedWord.meaning }}
                </p>
              </div>
              <div>
                <p class="text-xs font-semibold uppercase tracking-wide mb-1 transition-colors text-light-paragraph dark:text-dark-paragraph">
                  Type
                </p>
                <p class="text-lg transition-colors text-light-headline dark:text-dark-headline">
                  {{ selectedWord.pos }}
                </p>
              </div>
            </div>

            <!-- Save Actions -->
            <button *ngIf="!showSaveConfirm"
                    (click)="showSaveConfirm = true"
                    class="w-full px-4 py-3 bg-success hover:opacity-90 text-white rounded-md transition-all font-medium shadow-sm hover:shadow-md">
              💾 Save to Vocabulary
            </button>

            <div *ngIf="showSaveConfirm" class="space-y-3">
              <p class="text-sm text-center transition-colors text-light-paragraph dark:text-dark-paragraph">
                Save this word to vocabulary?
              </p>
              <div class="flex gap-2">
                <button (click)="showSaveConfirm = false"
                        class="flex-1 px-4 py-2 rounded-md font-medium transition bg-light-bg dark:bg-slate-700 text-light-headline dark:text-dark-headline hover:opacity-80">
                  Cancel
                </button>
                <button (click)="saveToVocabulary()"
                        class="flex-1 px-4 py-2 bg-success hover:opacity-90 text-white rounded-md transition-all font-medium shadow-sm hover:shadow-md">
                  Confirm Save
                </button>
              </div>
            </div>

            <p *ngIf="saveErrorMessage" class="text-sm text-center mt-3 text-red-600 dark:text-red-400">
              {{ saveErrorMessage }}
            </p>
          </div>
        </div>
    </div>
  `,
  styles: [`
    .nav-arrows {
      opacity: 0.5;
      transition: opacity 0.3s ease, transform 0.2s ease;
    }

    .nav-arrows:hover {
      opacity: 1;
    }

    @media (hover: none) {
      .nav-arrows {
        opacity: 0.8;
      }
    }

    .book-text {
      font-family: 'Merriweather', 'Georgia', serif;
      color: var(--paragraph-color);
      line-height: 2.2;
      font-size: var(--reader-font-size, 2rem);
      font-weight: 400;
      letter-spacing: 0.02em;
    }

    ::ng-deep .book-text p,
    ::ng-deep .book-text span,
    ::ng-deep .book-text div,
    ::ng-deep .book-text ruby,
    ::ng-deep .book-text rb {
      font-size: inherit !important;
      line-height: inherit;
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
      font-size: 0.5em !important;
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
  textSize = 50;
  currentTheme: Theme = 'light';
  selectedWord: { id: string; kanji: string; reading: string; meaning: string; pos: string } | null = null;
  showSaveConfirm = false;
  saveErrorMessage = '';

  private hiddenFurigana = new Set<string>();
  private kanjiByCharacter = new Map<string, Kanji>();

  get textSizeRem(): number {
    const minRem = 1.2;
    const maxRem = 4;
    return minRem + ((maxRem - minRem) * this.textSize) / 100;
  }

  private wordMetadata: { [key: string]: { meaning: string; pos: string } } = {
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
    private themeService: ThemeService,
    private kanjiService: KanjiService
  ) { }

  ngOnInit(): void {
    // Subscribe to theme changes
    this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });

    this.kanjiService.getKanji().subscribe(kanjiList => {
      this.kanjiByCharacter.clear();
      kanjiList.forEach(item => this.kanjiByCharacter.set(item.character, item));
    });

    this.route.paramMap.subscribe(params => {
      const bookId = params.get('bookId');
      const chapterId = params.get('chapterId');

      if (bookId) {
        this.book = this.bookService.getBook(bookId);
        if (this.book) {
          // Get actual chapters instead of relying on metadata
          const chapters = this.bookService.getChapters(bookId);
          this.totalChapters = chapters.length;
          
          if (chapterId) {
            this.chapter = this.bookService.getChapter(bookId, chapterId);
          } else {
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

      const metadata = this.getWordMetadata(kanji);

      this.selectedWord = {
        id: wordId || '',
        kanji: kanji,
        reading: reading,
        meaning: metadata.meaning,
        pos: metadata.pos
      };
      this.showSaveConfirm = false;
      this.saveErrorMessage = '';
    }
  }

  private getWordMetadata(wordText: string): { meaning: string; pos: string } {
    const directMatch = this.wordMetadata[wordText];
    if (directMatch) {
      return directMatch;
    }

    const kanjiChars = Array.from(wordText).filter(char => /[\u4E00-\u9FFF]/.test(char));
    const meaningParts = kanjiChars
      .map(char => this.kanjiByCharacter.get(char)?.meaning)
      .filter((meaning): meaning is string => Boolean(meaning));

    if (meaningParts.length > 0) {
      const uniqueMeanings = Array.from(new Set(meaningParts));
      return {
        meaning: uniqueMeanings.join(' · '),
        pos: kanjiChars.length > 1 ? 'compound' : 'kanji'
      };
    }

    return {
      meaning: 'Unknown',
      pos: 'N/A'
    };
  }

  closeWordModal(): void {
    this.selectedWord = null;
    this.showSaveConfirm = false;
    this.saveErrorMessage = '';
  }

  saveToVocabulary(): void {
    if (!this.selectedWord || !this.chapter || !this.book) return;

    const wordText = this.selectedWord.kanji;
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
    ).subscribe({
      next: () => {
        this.closeWordModal();
      },
      error: (err) => {
        this.saveErrorMessage = `Failed to add "${wordText}" to vocabulary.`;
        console.error('Error adding word:', err);
      }
    });
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
