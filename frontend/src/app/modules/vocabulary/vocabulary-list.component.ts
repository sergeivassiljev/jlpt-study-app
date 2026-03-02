import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VocabularyService } from '../../core/services/vocabulary.service';
import { SrsService } from '../../core/services/srs.service';
import { BookService } from '../../core/services/book.service';
import { ThemeService, Theme } from '../../core/services/theme.service';
import { VocabularyItem, Word } from '../../core/models/index';

@Component({
  selector: 'app-vocabulary-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div [ngClass]="currentTheme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'" 
         class="min-h-screen transition-colors duration-300">
      <div class="container mx-auto px-4 py-8">
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 [ngClass]="currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'" 
                class="text-4xl font-bold mb-2 transition-colors">
              My Vocabulary
            </h1>
            <p [ngClass]="currentTheme === 'dark' ? 'text-slate-400' : 'text-slate-600'" 
               class="transition-colors">
              {{ vocabulary.length }} / 10,000 words saved
              <span *ngIf="vocabulary.length >= 10000" class="text-red-500 font-semibold ml-2">
                (Limit reached)
              </span>
            </p>
          </div>
          <!-- View Mode Toggle -->
          <div class="flex gap-2">
            <button (click)="viewMode = 'list'"
                    [ngClass]="viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : (currentTheme === 'dark' ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-200 text-slate-800 hover:bg-slate-300')"
                    class="px-3 py-2 rounded-lg transition font-medium"
                    title="List view">
              ≡ List
            </button>
            <button (click)="viewMode = 'card'"
                    [ngClass]="viewMode === 'card'
                      ? 'bg-blue-600 text-white'
                      : (currentTheme === 'dark' ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-200 text-slate-800 hover:bg-slate-300')"
                    class="px-3 py-2 rounded-lg transition font-medium"
                    title="Card view">
              ⊞ Card
            </button>
          </div>
        </div>

        <!-- Search Input -->
        <div class="mb-6">
          <input [(ngModel)]="searchTerm"
                 [ngClass]="currentTheme === 'dark' 
                   ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-400' 
                   : 'bg-white border-slate-200 text-slate-800 placeholder-slate-500'"
                 class="w-full rounded-lg px-4 py-2 border transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                 placeholder="🔍 Search vocabulary...">
        </div>

        <!-- Filters -->
        <div class="flex gap-4 mb-8">
          <button (click)="filter = 'all'" 
                  [ngClass]="filter === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : (currentTheme === 'dark' ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-200 text-slate-800 hover:bg-slate-300')"
                  class="px-4 py-2 rounded-lg transition font-medium">
            All ({{ vocabulary.length }})
          </button>
          <button (click)="filter = 'new'"
                  [ngClass]="filter === 'new'
                    ? 'bg-yellow-600 text-white'
                    : (currentTheme === 'dark' ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-200 text-slate-800 hover:bg-slate-300')"
                  class="px-4 py-2 rounded-lg transition font-medium">
            New ({{ newCount }})
          </button>
          <button (click)="filter = 'reviewed'"
                  [ngClass]="filter === 'reviewed'
                    ? 'bg-green-600 text-white'
                    : (currentTheme === 'dark' ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-200 text-slate-800 hover:bg-slate-300')"
                  class="px-4 py-2 rounded-lg transition font-medium">
            Reviewed ({{ reviewedCount }})
          </button>
        </div>

        <div class="mb-4">
          <button (click)="toggleAddWordForm()"
                  [ngClass]="showAddWordForm
                    ? (currentTheme === 'dark' ? 'bg-slate-700 text-slate-100 hover:bg-slate-600' : 'bg-slate-300 text-slate-900 hover:bg-slate-400')
                    : 'bg-green-600 text-white hover:bg-green-700'"
                  class="px-4 py-2 rounded-lg transition font-semibold">
            {{ showAddWordForm ? '✖ Hide Form' : '➕ Add New Word' }}
          </button>
        </div>

        <!-- Add Custom Vocabulary -->
        <div *ngIf="showAddWordForm"
             [ngClass]="currentTheme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'"
             class="rounded-lg shadow p-6 border mb-8">
          <h2 [ngClass]="currentTheme === 'dark' ? 'text-slate-100' : 'text-slate-800'"
              class="text-xl font-bold mb-4 transition-colors">
            Add Your Own Word
          </h2>
          <p [ngClass]="currentTheme === 'dark' ? 'text-slate-400' : 'text-slate-600'"
             class="text-sm mb-4 transition-colors">
            Add kanji, kana-only words, or any term you want to study.
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input [(ngModel)]="customWordText"
                   [ngClass]="currentTheme === 'dark' 
                     ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400' 
                     : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-500'"
                   class="rounded-lg px-3 py-2 border transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                   placeholder="Word (e.g. ねこ / 猫) *">
            <input [(ngModel)]="customWordReading"
                   [ngClass]="currentTheme === 'dark' 
                     ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400' 
                     : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-500'"
                   class="rounded-lg px-3 py-2 border transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                   placeholder="Reading (optional if kana-only)">
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input [(ngModel)]="customWordMeaning"
                   [ngClass]="currentTheme === 'dark' 
                     ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400' 
                     : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-500'"
                   class="rounded-lg px-3 py-2 border transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                   placeholder="Meaning in English *">
            <input [(ngModel)]="customPartOfSpeech"
                   [ngClass]="currentTheme === 'dark' 
                     ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400' 
                     : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-500'"
                   class="rounded-lg px-3 py-2 border transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                   placeholder="Part of speech (optional)">
          </div>

          <textarea [(ngModel)]="customExampleSentence"
                    rows="2"
                    [ngClass]="currentTheme === 'dark' 
                      ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400' 
                      : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-500'"
                    class="w-full rounded-lg px-3 py-2 border transition focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                    placeholder="Example sentence (optional)"></textarea>

          <div class="flex items-center gap-3">
            <button (click)="addCustomWord()"
                    [disabled]="!customWordText.trim() || !customWordMeaning.trim() || vocabulary.length >= 10000"
                    class="px-4 py-2 rounded-lg transition font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
              ➕ Add Word
            </button>
            <p *ngIf="customWordAddedMessage"
               [ngClass]="currentTheme === 'dark' ? 'text-green-400' : 'text-green-700'"
               class="text-sm transition-colors">
              {{ customWordAddedMessage }}
            </p>
            <p *ngIf="customWordErrorMessage"
               [ngClass]="currentTheme === 'dark' ? 'text-red-400' : 'text-red-600'"
               class="text-sm transition-colors">
              {{ customWordErrorMessage }}
            </p>
          </div>
        </div>

        <!-- View: List -->
        <div *ngIf="viewMode === 'list' && filteredVocabulary.length > 0" class="space-y-3">
          <div *ngFor="let item of filteredVocabulary"
               [ngClass]="currentTheme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'"
               class="rounded-lg shadow hover:shadow-lg transition p-6 border">
            <div class="flex justify-between items-start gap-4">
              <div class="flex-1">
                <h3 [ngClass]="currentTheme === 'dark' ? 'text-slate-100' : 'text-slate-800'" 
                    class="text-2xl font-bold transition-colors">
                  {{ item.word.text }}
                </h3>
                <p [ngClass]="currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'" 
                   class="text-lg mb-2 transition-colors">
                  {{ item.word.reading }}
                </p>
                <p [ngClass]="currentTheme === 'dark' ? 'text-slate-400' : 'text-slate-600'" 
                   class="mb-2 transition-colors">
                  {{ item.word.meaning }}
                </p>
                <p *ngIf="!isFromBook(item.exampleSentence)"
                   [ngClass]="currentTheme === 'dark' ? 'text-slate-500' : 'text-slate-500'" 
                   class="text-sm transition-colors">
                  {{ item.exampleSentence }}
                </p>
                <p *ngIf="isFromBook(item.exampleSentence)"
                   class="text-sm">
                  <span [ngClass]="currentTheme === 'dark' ? 'text-slate-500' : 'text-slate-500'">From: </span>
                  <button (click)="navigateToBook(item.exampleSentence)"
                          [ngClass]="currentTheme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'"
                          class="underline transition-colors cursor-pointer">
                    {{ getBookInfo(item.exampleSentence)?.bookTitle }} - {{ getBookInfo(item.exampleSentence)?.chapterTitle }}
                  </button>
                </p>
              </div>
              <div class="flex items-center gap-3 whitespace-nowrap">
                <span [ngClass]="item.reviewed 
                        ? (currentTheme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')
                        : (currentTheme === 'dark' ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800')"
                      class="inline-block px-3 py-1 rounded-full text-sm font-semibold transition-colors">
                  {{ item.reviewed ? 'Reviewed' : 'New' }}
                </span>
                <button (click)="scheduleForReview(item.id)"
                        [ngClass]="currentTheme === 'dark' 
                          ? 'bg-blue-900 text-blue-200 hover:bg-blue-800' 
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'"
                        class="px-3 py-1 rounded-lg transition font-medium text-sm"
                        title="Review this word now">
                  ⚡ Review Now
                </button>
                <button (click)="confirmDelete(item.id)"
                        [ngClass]="currentTheme === 'dark' 
                          ? 'bg-red-900 text-red-200 hover:bg-red-800' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'"
                        class="px-3 py-1 rounded-lg transition font-medium text-sm">
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- View: Card Grid -->
        <div *ngIf="viewMode === 'card' && filteredVocabulary.length > 0" 
             class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div *ngFor="let item of filteredVocabulary"
               [ngClass]="currentTheme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'"
               class="rounded-lg shadow hover:shadow-lg transition p-6 border flex flex-col">
            <div class="flex-1">
              <h3 [ngClass]="currentTheme === 'dark' ? 'text-slate-100' : 'text-slate-800'" 
                  class="text-2xl font-bold transition-colors mb-2">
                {{ item.word.text }}
              </h3>
              <p [ngClass]="currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'" 
                 class="text-base mb-3 transition-colors">
                {{ item.word.reading }}
              </p>
              <p [ngClass]="currentTheme === 'dark' ? 'text-slate-400' : 'text-slate-600'" 
                 class="mb-3 transition-colors">
                {{ item.word.meaning }}
              </p>
              <p *ngIf="!isFromBook(item.exampleSentence)"
                 [ngClass]="currentTheme === 'dark' ? 'text-slate-500' : 'text-slate-500'" 
                 class="text-sm mb-4 transition-colors">
                {{ item.exampleSentence }}
              </p>
              <p *ngIf="isFromBook(item.exampleSentence)"
                 class="text-sm mb-4">
                <span [ngClass]="currentTheme === 'dark' ? 'text-slate-500' : 'text-slate-500'">From: </span>
                <button (click)="navigateToBook(item.exampleSentence)"
                        [ngClass]="currentTheme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'"
                        class="underline transition-colors cursor-pointer">
                  {{ getBookInfo(item.exampleSentence)?.bookTitle }} - {{ getBookInfo(item.exampleSentence)?.chapterTitle }}
                </button>
              </p>
            </div>
            <div class="flex items-center gap-2 pt-4 border-t"
                 [ngClass]="currentTheme === 'dark' ? 'border-slate-700' : 'border-slate-200'">
              <span [ngClass]="item.reviewed 
                      ? (currentTheme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')
                      : (currentTheme === 'dark' ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800')"
                    class="inline-block px-2 py-1 rounded text-xs font-semibold transition-colors">
                {{ item.reviewed ? 'Reviewed' : 'New' }}
              </span>
              <button (click)="scheduleForReview(item.id)"
                      [ngClass]="currentTheme === 'dark' 
                        ? 'bg-blue-900 text-blue-200 hover:bg-blue-800' 
                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200'"
                      class="ml-auto px-2 py-1 rounded transition font-medium text-sm"
                      title="Review this word now">
                ⚡
              </button>
              <button (click)="confirmDelete(item.id)"
                      [ngClass]="currentTheme === 'dark' 
                        ? 'bg-red-900 text-red-200 hover:bg-red-800' 
                        : 'bg-red-100 text-red-800 hover:bg-red-200'"
                      class="px-2 py-1 rounded transition font-medium text-sm">
                🗑️
              </button>
            </div>
          </div>
        </div>

        <div *ngIf="filteredVocabulary.length === 0" class="text-center py-12">
          <p [ngClass]="currentTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'" 
             class="text-lg transition-colors">
            {{ searchTerm ? 'No vocabulary matches your search' : 'No vocabulary to show' }}
          </p>
        </div>

        <!-- Delete Confirmation Modal -->
        <div *ngIf="showDeleteConfirm"
             [ngClass]="currentTheme === 'dark' ? 'bg-black/50' : 'bg-black/30'"
             class="fixed inset-0 flex items-center justify-center z-50 transition-all">
          <div [ngClass]="currentTheme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'"
               class="rounded-lg shadow-2xl p-6 max-w-sm border">
            <h2 [ngClass]="currentTheme === 'dark' ? 'text-slate-100' : 'text-slate-800'"
                class="text-2xl font-bold mb-4 transition-colors">
              Delete Word?
            </h2>
            <p [ngClass]="currentTheme === 'dark' ? 'text-slate-300' : 'text-slate-600'"
               class="mb-6 transition-colors">
              Are you sure you want to delete "{{ getWordToDelete()?.word?.text }}"? This action cannot be undone.
            </p>
            <div class="flex gap-4">
              <button (click)="deleteWord()"
                      class="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg transition font-medium hover:bg-red-700">
                Delete
              </button>
              <button (click)="cancelDelete()"
                      [ngClass]="currentTheme === 'dark' 
                        ? 'bg-slate-700 text-slate-100 hover:bg-slate-600'
                        : 'bg-slate-200 text-slate-800 hover:bg-slate-300'"
                      class="flex-1 px-4 py-2 rounded-lg transition font-medium">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class VocabularyListComponent implements OnInit {
  vocabulary: VocabularyItem[] = [];
  filter: 'all' | 'new' | 'reviewed' = 'all';
  viewMode: 'list' | 'card' = 'list';
  searchTerm: string = '';
  customWordText: string = '';
  customWordReading: string = '';
  customWordMeaning: string = '';
  customPartOfSpeech: string = '';
  customExampleSentence: string = '';
  customWordAddedMessage: string = '';
  customWordErrorMessage: string = '';
  showAddWordForm: boolean = false;
  currentTheme: Theme = 'light';
  showDeleteConfirm: boolean = false;
  deleteConfirmId: string | null = null;
  books: any[] = [];

  get newCount(): number {
    return this.vocabulary.filter(v => !v.reviewed).length;
  }

  get reviewedCount(): number {
    return this.vocabulary.filter(v => v.reviewed).length;
  }

  get filteredVocabulary(): VocabularyItem[] {
    let result = this.vocabulary;

    // Apply status filter
    if (this.filter === 'new') {
      result = result.filter(v => !v.reviewed);
    } else if (this.filter === 'reviewed') {
      result = result.filter(v => v.reviewed);
    }

    // Apply search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(v => 
        v.word.text.toLowerCase().includes(term) ||
        v.word.reading.toLowerCase().includes(term) ||
        v.word.meaning.toLowerCase().includes(term) ||
        v.exampleSentence.toLowerCase().includes(term)
      );
    }

    return result;
  }

  constructor(
    private vocabularyService: VocabularyService,
    private srsService: SrsService,
    private bookService: BookService,
    private router: Router,
    private themeService: ThemeService
  ) { }

  ngOnInit(): void {
    // Subscribe to theme changes
    this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });

    this.vocabularyService.vocabulary$.subscribe(vocab => {
      this.vocabulary = vocab;
    });

    this.bookService.getBooks().subscribe(books => {
      this.books = books;
    });
  }

  confirmDelete(vocabularyId: string): void {
    this.deleteConfirmId = vocabularyId;
    this.showDeleteConfirm = true;
  }

  deleteWord(): void {
    if (this.deleteConfirmId) {
      this.vocabularyService.deleteWord(this.deleteConfirmId);
      this.showDeleteConfirm = false;
      this.deleteConfirmId = null;
    }
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deleteConfirmId = null;
  }

  scheduleForReview(vocabularyId: string): void {
    this.vocabularyService.scheduleForImmediateReview(vocabularyId);
    this.srsService.scheduleFlashcardForImmediateReview(vocabularyId);
  }

  getWordToDelete(): VocabularyItem | undefined {
    if (!this.deleteConfirmId) return undefined;
    return this.vocabulary.find(v => v.id === this.deleteConfirmId);
  }

  isFromBook(exampleSentence: string): boolean {
    return exampleSentence.startsWith('From:');
  }

  getBookInfo(exampleSentence: string): { bookTitle: string; chapterTitle: string } | null {
    if (!this.isFromBook(exampleSentence)) return null;
    const parts = exampleSentence.replace('From: ', '').split(' - ');
    if (parts.length === 2) {
      return { bookTitle: parts[0].trim(), chapterTitle: parts[1].trim() };
    }
    return null;
  }

  navigateToBook(exampleSentence: string): void {
    const bookInfo = this.getBookInfo(exampleSentence);
    if (!bookInfo) return;

    const book = this.books.find(b => b.title === bookInfo.bookTitle);
    if (book) {
      const chapters = this.bookService.getChapters(book.id);
      const chapter = chapters.find(c => c.title === bookInfo.chapterTitle);
      if (chapter) {
        this.router.navigate(['/books', book.id, chapter.id]);
      }
    }
  }

  toggleAddWordForm(): void {
    this.showAddWordForm = !this.showAddWordForm;
  }

  addCustomWord(): void {
    const text = this.customWordText.trim();
    const meaning = this.customWordMeaning.trim();

    if (!text || !meaning) {
      return;
    }

    // Clear previous messages
    this.customWordAddedMessage = '';
    this.customWordErrorMessage = '';

    const word: Word = {
      id: `word-custom-${Date.now()}`,
      text,
      reading: this.customWordReading.trim() || text,
      meaning,
      partOfSpeech: this.customPartOfSpeech.trim() || 'custom'
    };

    const exampleSentence = this.customExampleSentence.trim() || `Added manually: ${text}`;
    
    this.vocabularyService.addWord(word, exampleSentence).subscribe({
      next: () => {
        this.customWordText = '';
        this.customWordReading = '';
        this.customWordMeaning = '';
        this.customPartOfSpeech = '';
        this.customExampleSentence = '';
        this.customWordAddedMessage = `Added "${word.text}" to your vocabulary`;
        this.showAddWordForm = false;

        setTimeout(() => {
          this.customWordAddedMessage = '';
        }, 2500);
      },
      error: (err: any) => {
        if (err.error) {
          this.customWordErrorMessage = err.error;
        } else {
          this.customWordErrorMessage = 'Failed to add word. Please try again.';
        }

        setTimeout(() => {
          this.customWordErrorMessage = '';
        }, 5000);
      }
    });
  }
}
