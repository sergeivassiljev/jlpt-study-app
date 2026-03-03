import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VocabularyService } from '../../core/services/vocabulary.service';
import { SrsService } from '../../core/services/srs.service';
import { BookService } from '../../core/services/book.service';
import { FolderService } from '../../core/services/folder.service';
import { ThemeService, Theme } from '../../core/services/theme.service';
import { VocabularyItem, Word, VocabularyFolder } from '../../core/models/index';

@Component({
  selector: 'app-vocabulary-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen transition-colors duration-300 bg-light-bg dark:bg-dark-bg text-light-paragraph dark:text-dark-paragraph">
      <div class="container mx-auto px-4 py-8">
        <div class="flex gap-6">
          <!-- Folder Sidebar -->
          <div class="w-64 flex-shrink-0">
            <div class="rounded-lg shadow border border-secondary dark:border-success bg-white dark:bg-slate-800 p-4 transition-colors sticky top-4">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-bold transition-colors text-light-headline dark:text-dark-headline">📁 Folders</h3>
                <button (click)="toggleCreateFolderForm()"
                        class="text-lg hover:opacity-80 transition"
                        title="Create folder">
                  +
                </button>
              </div>

              <!-- Create Folder Form -->
              <div *ngIf="showCreateFolderForm" class="mb-3 p-3 rounded bg-light-bg dark:bg-slate-700">
                <input [(ngModel)]="newFolderName"
                       class="w-full mb-3 px-2 py-1 text-sm rounded border border-secondary dark:border-success bg-white dark:bg-slate-800"
                       placeholder="Folder name">
                <div class="mb-2">
                  <p class="text-xs font-medium mb-2 text-light-paragraph dark:text-dark-paragraph">Choose color:</p>
                  <div class="grid grid-cols-8 gap-2">
                    <button *ngFor="let color of predefinedColors"
                            (click)="newFolderColor = color"
                            [style.background-color]="color"
                            [class.ring-2]="newFolderColor === color"
                            [class.ring-offset-1]="newFolderColor === color"
                            [class.ring-white]="newFolderColor === color"
                            class="w-6 h-6 rounded-full cursor-pointer hover:scale-110 transition-transform"
                            [title]="color">
                    </button>
                  </div>
                </div>
                <div class="flex gap-1">
                  <button (click)="createFolder()"
                          class="flex-1 px-2 py-1 text-xs rounded bg-success text-white hover:opacity-80">
                    Create
                  </button>
                  <button (click)="toggleCreateFolderForm()"
                          class="flex-1 px-2 py-1 text-xs rounded bg-gray-500 text-white hover:opacity-80">
                    Cancel
                  </button>
                </div>
              </div>

              <!-- All Words -->
              <button (click)="selectFolder(null)"
                      (dragover)="onDragOver($event, null)"
                      (dragleave)="onDragLeave()"
                      (drop)="onDrop($event, null)"
                      [class.bg-primary]="selectedFolderId === null"
                      [class.text-white]="selectedFolderId === null"
                      [class.ring-2]="dragOverFolderId === null && draggedWordId !== null"
                      [class.ring-indigo-500]="dragOverFolderId === null && draggedWordId !== null"
                      class="w-full text-left px-3 py-2 rounded mb-1 hover:bg-light-bg dark:hover:bg-slate-700 transition text-sm">
                All Words ({{ getFolderWordsCount(null) }})
              </button>

              <!-- Folder List -->
              <div *ngFor="let folder of folders" class="mb-1 group relative">
                <button (click)="selectFolder(folder.id)"
                        (dragover)="onDragOver($event, folder.id)"
                        (dragleave)="onDragLeave()"
                        (drop)="onDrop($event, folder.id)"
                        [class.bg-primary]="selectedFolderId === folder.id"
                        [class.text-white]="selectedFolderId === folder.id"
                        [class.ring-2]="dragOverFolderId === folder.id"
                        [class.ring-indigo-500]="dragOverFolderId === folder.id"
                        class="w-full text-left pl-3 pr-10 py-2 rounded hover:bg-light-bg dark:hover:bg-slate-700 transition text-sm flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full flex-shrink-0" [style.backgroundColor]="folder.color"></span>
                  <span class="flex-1 truncate">{{ folder.name }}</span>
                  <span class="text-xs opacity-70">({{ getFolderWordsCount(folder.id) }})</span>
                </button>
                <button (click)="confirmDeleteFolder(folder.id); $event.stopPropagation()"
                        class="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 text-lg px-2 py-1 leading-none"
                        title="Delete folder">
                  ×
                </button>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="flex-1 min-w-0">
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-4xl font-bold mb-2 transition-colors text-primary dark:text-primary-dark">
              My Vocabulary
            </h1>
            <p class="transition-colors text-light-paragraph dark:text-dark-paragraph">
              {{ vocabulary.length }} / 10,000 words saved
              <span *ngIf="vocabulary.length >= 10000" class="text-secondary dark:text-success font-semibold ml-2">
                (Limit reached)
              </span>
            </p>
          </div>
          <!-- View Mode Toggle -->
          <div class="flex gap-2">
            <button (click)="viewMode = 'list'"
                    [ngClass]="viewMode === 'list'
                      ? 'bg-light-button dark:bg-dark-button text-white'
                      : 'bg-light-bg dark:bg-slate-700 text-light-headline dark:text-dark-headline hover:opacity-80'"
                    class="px-3 py-2 rounded-lg transition font-medium"
                    title="List view">
              ≡ List
            </button>
            <button (click)="viewMode = 'card'"
                    [ngClass]="viewMode === 'card'
                      ? 'bg-light-button dark:bg-dark-button text-white'
                      : 'bg-light-bg dark:bg-slate-700 text-light-headline dark:text-dark-headline hover:opacity-80'"
                    class="px-3 py-2 rounded-lg transition font-medium"
                    title="Card view">
              ⊞ Card
            </button>
          </div>
        </div>

        <!-- Search Input -->
        <div class="mb-6">
          <input [(ngModel)]="searchTerm"
                 class="w-full rounded-lg px-4 py-2 border border-secondary dark:border-success transition focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-slate-800 text-light-paragraph dark:text-dark-paragraph placeholder-gray-400 dark:placeholder-gray-500"
                 placeholder="🔍 Search vocabulary...">
        </div>

        <!-- Filters -->
        <div class="flex gap-4 mb-8">
          <button (click)="filter = 'all'" 
                  [ngClass]="filter === 'all' 
                    ? 'bg-light-button dark:bg-dark-button text-white' 
                    : 'bg-light-bg dark:bg-slate-700 text-light-headline dark:text-dark-headline hover:opacity-80'"
                  class="px-4 py-2 rounded-lg transition font-medium">
            All ({{ vocabulary.length }})
          </button>
          <button (click)="filter = 'new'"
                  [ngClass]="filter === 'new'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-light-bg dark:bg-slate-700 text-light-headline dark:text-dark-headline hover:opacity-80'"
                  class="px-4 py-2 rounded-lg transition font-medium">
            New ({{ newCount }})
          </button>
          <button (click)="filter = 'reviewed'"
                  [ngClass]="filter === 'reviewed'
                    ? 'bg-success text-white'
                    : 'bg-light-bg dark:bg-slate-700 text-light-headline dark:text-dark-headline hover:opacity-80'"
                  class="px-4 py-2 rounded-lg transition font-medium">
            Reviewed ({{ reviewedCount }})
          </button>
        </div>

        <div class="mb-4">\n          <button (click)="toggleAddWordForm()"
                  [ngClass]="showAddWordForm
                    ? 'bg-light-bg dark:bg-slate-700 text-light-headline dark:text-dark-headline hover:opacity-80'
                    : 'bg-light-button dark:bg-dark-button text-white hover:opacity-90'"
                  class="px-4 py-2 rounded-lg transition font-semibold">
            {{ showAddWordForm ? '✖ Hide Form' : '➕ Add New Word' }}
          </button>
        </div>

        <!-- Add Custom Vocabulary -->
        <div *ngIf="showAddWordForm"
             class="rounded-lg shadow p-6 border border-secondary dark:border-success mb-8 bg-white dark:bg-slate-800 transition-colors">
          <h2 class="text-xl font-bold mb-4 transition-colors text-light-headline dark:text-dark-headline">
            Add Your Own Word
          </h2>
          <p class="text-sm mb-4 transition-colors text-light-paragraph dark:text-dark-paragraph">
            Add kanji, kana-only words, or any term you want to study.
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input [(ngModel)]="customWordText"
                   class="rounded-lg px-3 py-2 border border-secondary dark:border-success transition focus:outline-none focus:ring-2 focus:ring-primary bg-light-bg dark:bg-slate-700 text-light-paragraph dark:text-dark-paragraph placeholder-gray-400 dark:placeholder-gray-500"
                   placeholder="Word (e.g. ねこ / 猫) *">
            <input [(ngModel)]="customWordReading"
                   class="rounded-lg px-3 py-2 border border-secondary dark:border-success transition focus:outline-none focus:ring-2 focus:ring-primary bg-light-bg dark:bg-slate-700 text-light-paragraph dark:text-dark-paragraph placeholder-gray-400 dark:placeholder-gray-500"
                   placeholder="Reading (optional if kana-only)">
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input [(ngModel)]="customWordMeaning"
                   class="rounded-lg px-3 py-2 border border-secondary dark:border-success transition focus:outline-none focus:ring-2 focus:ring-primary bg-light-bg dark:bg-slate-700 text-light-paragraph dark:text-dark-paragraph placeholder-gray-400 dark:placeholder-gray-500"
                   placeholder="Meaning in English *">
            <input [(ngModel)]="customPartOfSpeech"
                   class="rounded-lg px-3 py-2 border border-secondary dark:border-success transition focus:outline-none focus:ring-2 focus:ring-primary bg-light-bg dark:bg-slate-700 text-light-paragraph dark:text-dark-paragraph placeholder-gray-400 dark:placeholder-gray-500"
                   placeholder="Part of speech (optional)">
          </div>

          <textarea [(ngModel)]="customExampleSentence"
                    rows="2"
                    class="w-full rounded-lg px-3 py-2 border border-secondary dark:border-success transition focus:outline-none focus:ring-2 focus:ring-primary mb-4 bg-light-bg dark:bg-slate-700 text-light-paragraph dark:text-dark-paragraph placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Example sentence (optional)"></textarea>

          <div class="flex items-center gap-3">
            <button (click)="addCustomWord()"
                    [disabled]="!customWordText.trim() || !customWordMeaning.trim() || vocabulary.length >= 10000"
                    class="px-4 py-2 rounded-lg transition font-semibold bg-light-button dark:bg-dark-button text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
              ➕ Add Word
            </button>
            <p *ngIf="customWordAddedMessage"
               class="text-sm transition-colors text-success font-medium">
              {{ customWordAddedMessage }}
            </p>
            <p *ngIf="customWordErrorMessage"
               class="text-sm transition-colors text-secondary dark:text-success font-medium">
              {{ customWordErrorMessage }}
            </p>
          </div>
        </div>

        <!-- View: List -->
        <div *ngIf="viewMode === 'list' && filteredVocabulary.length > 0" class="space-y-3">
          <div *ngFor="let item of filteredVocabulary"
               [class.opacity-50]="draggedWordId === item.id"
               class="rounded-lg shadow hover:shadow-lg transition p-6 border border-secondary dark:border-success bg-white dark:bg-slate-800 transition-colors flex gap-3">
            <!-- Drag Handle -->
            <div [draggable]="true"
                 (dragstart)="onDragStart(item.id, $event)"
                 (dragend)="onDragEnd()"
                 class="flex-shrink-0 cursor-grab active:cursor-grabbing flex items-center justify-center w-8 h-8 rounded hover:bg-light-bg dark:hover:bg-slate-700 transition text-gray-400 hover:text-primary dark:hover:text-primary-dark"
                 title="Drag to move to folder">
              <span class="text-xl">⋮⋮</span>
            </div>
            <div class="flex justify-between items-start gap-4 flex-1">
              <div class="flex-1">
                <h3 class="text-2xl font-bold transition-colors text-light-headline dark:text-dark-headline">
                  {{ item.word.text }}
                </h3>
                <p class="text-lg mb-2 transition-colors text-primary dark:text-primary-dark">
                  {{ item.word.reading }}
                </p>
                <p class="mb-2 transition-colors text-light-paragraph dark:text-dark-paragraph">
                  {{ item.word.meaning }}
                </p>
                <p *ngIf="!isFromBook(item.exampleSentence)"
                   class="text-sm transition-colors text-light-paragraph dark:text-dark-paragraph">
                  {{ item.exampleSentence }}
                </p>
                <p *ngIf="isFromBook(item.exampleSentence)"
                   class="text-sm">
                  <span class="text-light-paragraph dark:text-dark-paragraph">From: </span>
                  <button (click)="navigateToBook(item.exampleSentence)"
                          class="underline transition-colors cursor-pointer text-primary dark:text-primary-dark hover:opacity-80">
                    {{ getBookInfo(item.exampleSentence)?.bookTitle }} - {{ getBookInfo(item.exampleSentence)?.chapterTitle }}
                  </button>
                </p>
              </div>
              <div class="flex items-center gap-3 whitespace-nowrap">
                <span [ngClass]="item.reviewed 
                        ? 'bg-success text-white'
                        : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'"
                      class="inline-block px-3 py-1 rounded-full text-sm font-semibold transition-colors">
                  {{ item.reviewed ? 'Reviewed' : 'New' }}
                </span>
                <button (click)="scheduleForReview(item.id)"
                        class="px-3 py-1 rounded-lg transition font-medium text-sm bg-indigo-600 hover:bg-indigo-700 text-white"
                        title="Review this word now">
                  ⚡ Review Now
                </button>
                <button (click)="confirmDelete(item.id)"
                        class="px-3 py-1 rounded-lg transition font-medium text-sm bg-red-600 hover:bg-red-700 text-white">
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
               [class.opacity-50]="draggedWordId === item.id"
               class="rounded-lg shadow hover:shadow-lg transition p-6 border border-secondary dark:border-success bg-white dark:bg-slate-800 transition-colors flex flex-col relative">
            <!-- Drag Handle -->
            <div [draggable]="true"
                 (dragstart)="onDragStart(item.id, $event)"
                 (dragend)="onDragEnd()"
                 class="absolute top-2 left-2 cursor-grab active:cursor-grabbing flex items-center justify-center w-8 h-8 rounded hover:bg-light-bg dark:hover:bg-slate-700 transition text-gray-400 hover:text-primary dark:hover:text-primary-dark"
                 title="Drag to move to folder">
              <span class="text-xl">⋮⋮</span>
            </div>
            <div class="flex-1 pt-6">
              <h3 class="text-2xl font-bold transition-colors mb-2 text-light-headline dark:text-dark-headline">
                {{ item.word.text }}
              </h3>
              <p class="text-base mb-3 transition-colors text-primary dark:text-primary-dark">
                {{ item.word.reading }}
              </p>
              <p class="mb-3 transition-colors text-light-paragraph dark:text-dark-paragraph">
                {{ item.word.meaning }}
              </p>
              <p *ngIf="!isFromBook(item.exampleSentence)"
                 class="text-sm mb-4 transition-colors text-light-paragraph dark:text-dark-paragraph">
                {{ item.exampleSentence }}
              </p>
              <p *ngIf="isFromBook(item.exampleSentence)"
                 class="text-sm mb-4">
                <span class="text-light-paragraph dark:text-dark-paragraph">From: </span>
                <button (click)="navigateToBook(item.exampleSentence)"
                        class="underline transition-colors cursor-pointer text-primary dark:text-primary-dark hover:opacity-80">
                  {{ getBookInfo(item.exampleSentence)?.bookTitle }}
                </button>
              </p>
            </div>
            <div class="flex items-center gap-2 pt-4 border-t border-secondary dark:border-success">
              <span [ngClass]="item.reviewed 
                      ? 'bg-success text-white'
                      : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'"
                    class="inline-block px-2 py-1 rounded text-xs font-semibold transition-colors">
                {{ item.reviewed ? 'Reviewed' : 'New' }}
              </span>
              <button (click)="scheduleForReview(item.id)"
                      class="ml-auto px-2 py-1 rounded transition font-medium text-sm bg-indigo-600 hover:bg-indigo-700 text-white"
                      title="Review this word now">
                ⚡
              </button>
              <button (click)="confirmDelete(item.id)"
                      class="px-2 py-1 rounded transition font-medium text-sm bg-red-600 hover:bg-red-700 text-white">
                🗑️
              </button>
            </div>
          </div>
        </div>

        <div *ngIf="filteredVocabulary.length === 0" class="text-center py-12">
          <p class="text-lg transition-colors text-light-paragraph dark:text-dark-paragraph">
            {{ searchTerm ? 'No vocabulary matches your search' : 'No vocabulary to show' }}
          </p>
        </div>

        <!-- Delete Confirmation Modal -->
        <div *ngIf="showDeleteConfirm"
             class="fixed inset-0 flex items-center justify-center z-50 transition-all bg-black/30 dark:bg-black/50">
          <div class="rounded-lg shadow-2xl p-6 max-w-sm border border-secondary dark:border-success bg-white dark:bg-slate-800 transition-colors">
            <h2 class="text-2xl font-bold mb-4 transition-colors text-light-headline dark:text-dark-headline">
              Delete Word?
            </h2>
            <p class="mb-6 transition-colors text-light-paragraph dark:text-dark-paragraph">
              Are you sure you want to delete "{{ getWordToDelete()?.word?.text }}"? This action cannot be undone.
            </p>
            <div class="flex gap-4">
              <button (click)="deleteWord()"
                      class="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition font-medium">
                Delete
              </button>
              <button (click)="cancelDelete()"
                      class="flex-1 bg-light-bg dark:bg-slate-700 text-light-headline dark:text-dark-headline px-4 py-2 rounded-lg transition font-medium hover:opacity-80">
                Cancel
              </button>
            </div>
          </div>
        </div>

        <!-- Delete Folder Confirmation Modal -->
        <div *ngIf="showDeleteFolderConfirm"
             class="fixed inset-0 flex items-center justify-center z-50 transition-all bg-black/30 dark:bg-black/50">
          <div class="rounded-lg shadow-2xl p-6 max-w-sm border border-secondary dark:border-success bg-white dark:bg-slate-800 transition-colors">
            <h2 class="text-2xl font-bold mb-4 transition-colors text-light-headline dark:text-dark-headline">
              Delete Folder?
            </h2>
            <p class="mb-6 transition-colors text-light-paragraph dark:text-dark-paragraph">
              Are you sure you want to delete "{{ getFolderToDelete()?.name }}"? Words in this folder will be moved to "No Folder". This action cannot be undone.
            </p>
            <div class="flex gap-4">
              <button (click)="deleteFolder()"
                      class="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition font-medium">
                Delete
              </button>
              <button (click)="cancelDeleteFolder()"
                      class="flex-1 bg-light-bg dark:bg-slate-700 text-light-headline dark:text-dark-headline px-4 py-2 rounded-lg transition font-medium hover:opacity-80">
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
  folders: VocabularyFolder[] = [];
  selectedFolderId: string | null = null;
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
  showDeleteFolderConfirm: boolean = false;
  deleteFolderConfirmId: string | null = null;
  books: any[] = [];
  showCreateFolderForm = false;
  newFolderName = '';
  newFolderColor = '#7c3aed';
  draggedWordId: string | null = null;
  dragOverFolderId: string | null = null;

  predefinedColors = [
    '#7c3aed', // purple
    '#ef4444', // red
    '#f59e0b', // orange
    '#10b981', // green
    '#3b82f6', // blue
    '#ec4899', // pink
    '#eab308', // yellow
    '#14b8a6', // teal
    '#f97316', // deep orange
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#d946ef', // fuchsia
    '#22c55e', // emerald
    '#a855f7', // purple-light
    '#fb923c', // orange-light
    '#38bdf8', // sky
    '#f43f5e', // rose
    '#94a3b8', // slate
  ];

  get newCount(): number {
    return this.vocabulary.filter(v => !v.reviewed).length;
  }

  get reviewedCount(): number {
    return this.vocabulary.filter(v => v.reviewed).length;
  }

  get filteredVocabulary(): VocabularyItem[] {
    let result = this.vocabulary;

    // Apply folder filter
    if (this.selectedFolderId !== null) {
      result = result.filter(v => v.folderId === this.selectedFolderId);
    }

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
    private folderService: FolderService,
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

    this.folderService.folders$.subscribe(folders => {
      this.folders = folders;
    });

    this.folderService.refreshFolders();

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

  selectFolder(folderId: string | null): void {
    this.selectedFolderId = folderId;
  }

  toggleCreateFolderForm(): void {
    this.showCreateFolderForm = !this.showCreateFolderForm;
  }

  createFolder(): void {
    if (!this.newFolderName.trim()) return;

    this.folderService.createFolder(this.newFolderName, this.newFolderColor).subscribe({
      next: () => {
        this.folderService.refreshFolders();
        this.newFolderName = '';
        this.newFolderColor = '#7c3aed';
        this.showCreateFolderForm = false;
      },
      error: (err) => {
        console.error('Failed to create folder:', err);
      }
    });
  }

  confirmDeleteFolder(folderId: string): void {
    this.deleteFolderConfirmId = folderId;
    this.showDeleteFolderConfirm = true;
  }

  deleteFolder(): void {
    if (!this.deleteFolderConfirmId) return;

    this.folderService.deleteFolder(this.deleteFolderConfirmId).subscribe({
      next: () => {
        this.folderService.refreshFolders();
        this.vocabularyService.refreshVocabularyFromApi();
        if (this.selectedFolderId === this.deleteFolderConfirmId) {
          this.selectedFolderId = null;
        }
        this.showDeleteFolderConfirm = false;
        this.deleteFolderConfirmId = null;
      },
      error: (err) => {
        console.error('Failed to delete folder:', err);
        this.showDeleteFolderConfirm = false;
        this.deleteFolderConfirmId = null;
      }
    });
  }

  cancelDeleteFolder(): void {
    this.showDeleteFolderConfirm = false;
    this.deleteFolderConfirmId = null;
  }

  getFolderToDelete(): VocabularyFolder | undefined {
    return this.folders.find(f => f.id === this.deleteFolderConfirmId);
  }

  getFolderName(folderId: string | undefined): string {
    if (!folderId) return 'No Folder';
    const folder = this.folders.find(f => f.id === folderId);
    return folder ? folder.name : 'Unknown';
  }

  getFolderWordsCount(folderId: string | null): number {
    return this.vocabulary.filter(v => v.folderId === folderId).length;
  }

  // Drag and drop methods
  onDragStart(wordId: string, event: DragEvent): void {
    this.draggedWordId = wordId;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', wordId);
      
      // Set the entire word item as the drag image
      const dragHandle = event.target as HTMLElement;
      const wordItem = dragHandle.closest('.rounded-lg') as HTMLElement;
      if (wordItem) {
        // Clone the element to use as drag image
        const dragImage = wordItem.cloneNode(true) as HTMLElement;
        dragImage.style.position = 'absolute';
        dragImage.style.left = '-9999px';
        dragImage.style.width = wordItem.offsetWidth + 'px';
        document.body.appendChild(dragImage);
        
        event.dataTransfer.setDragImage(dragImage, event.offsetX, event.offsetY);
        
        // Clean up the clone after drag starts
        setTimeout(() => {
          document.body.removeChild(dragImage);
        }, 0);
      }
    }
  }

  onDragEnd(): void {
    this.draggedWordId = null;
    this.dragOverFolderId = null;
  }

  onDragOver(event: DragEvent, folderId: string | null): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.dragOverFolderId = folderId;
  }

  onDragLeave(): void {
    this.dragOverFolderId = null;
  }

  onDrop(event: DragEvent, folderId: string | null): void {
    event.preventDefault();
    
    if (this.draggedWordId) {
      this.folderService.moveToFolder(this.draggedWordId, folderId).subscribe({
        next: () => {
          this.vocabularyService.refreshVocabularyFromApi();
          this.folderService.refreshFolders();
          this.draggedWordId = null;
          this.dragOverFolderId = null;
        },
        error: (err) => {
          console.error('Failed to move word:', err);
          this.draggedWordId = null;
          this.dragOverFolderId = null;
        }
      });
    }
  }
}
