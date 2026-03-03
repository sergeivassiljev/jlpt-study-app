import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VocabularyService } from '../../core/services/vocabulary.service';
import { ThemeService, Theme } from '../../core/services/theme.service';
import { Word } from '../../core/models/index';

interface WordListItem {
  id: string;
  word: string;
  reading: string;
  translation: string;
}

@Component({
  selector: 'app-words',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen transition-colors duration-300 bg-light-bg dark:bg-dark-bg text-light-paragraph dark:text-dark-paragraph">
      <div class="container mx-auto px-4 py-8 max-w-6xl">
        <h1 class="text-4xl font-bold mb-2 transition-colors text-primary dark:text-primary-dark">
          Words
        </h1>
        
        <!-- Level Selector View -->
        <div *ngIf="!selectedLevel" class="mb-8">
          <p class="mb-6 transition-colors text-light-paragraph dark:text-dark-paragraph text-sm">
            Choose a JLPT level to browse vocabulary for that level.
          </p>

          <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
            <button *ngFor="let level of jlptLevels"
                    (click)="selectLevel(level)"
                    class="py-6 px-4 rounded-lg font-bold text-xl transition-all border-2 border-primary dark:border-primary-dark text-primary dark:text-primary-dark hover:bg-primary dark:hover:bg-primary-dark hover:text-white shadow-md hover:shadow-lg transform hover:scale-105">
              {{ level }}
            </button>
          </div>
        </div>

        <!-- Words List View (shown after level selection) -->
        <div *ngIf="selectedLevel" class="mb-6">
          <button (click)="deselectLevel()"
                  class="mb-4 px-3 py-1.5 rounded text-sm font-medium transition bg-light-bg dark:bg-slate-700 text-light-headline dark:text-dark-headline hover:opacity-80">
            ← Back to Levels
          </button>
          <div class="flex items-center gap-2 mb-4">
            <h2 class="text-2xl font-bold transition-colors text-light-headline dark:text-dark-headline">
              {{ selectedLevel }} Level Words
            </h2>
            <span class="text-sm font-medium transition-colors text-light-paragraph dark:text-dark-paragraph opacity-70">
              ({{ totalResults }} words)
            </span>
          </div>
          <p class="mb-6 transition-colors text-light-paragraph dark:text-dark-paragraph text-sm">
            Click any word to see details. Add words to your personal vocabulary.
          </p>

        <div *ngIf="selectedLevel" class="rounded-lg shadow p-4 border border-secondary dark:border-success mb-4 bg-white dark:bg-slate-800 transition-colors">
          <div class="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <input [(ngModel)]="searchTerm"
                   (input)="onSearchChange()"
                   class="w-full md:max-w-xl rounded-lg px-3 py-2 border border-secondary dark:border-success transition focus:outline-none focus:ring-2 focus:ring-primary bg-light-bg dark:bg-slate-700 text-light-paragraph dark:text-dark-paragraph placeholder-gray-400 dark:placeholder-gray-500"
                   placeholder="Search word, reading, translation...">

            <a routerLink="/vocabulary"
               class="px-4 py-2 rounded-lg transition font-medium bg-light-bg dark:bg-slate-700 text-light-headline dark:text-dark-headline hover:opacity-80 text-center text-sm">
              My Vocabulary
            </a>
          </div>
        </div>

        <div *ngIf="selectedLevel" class="rounded-lg shadow border border-secondary dark:border-success bg-white dark:bg-slate-800 transition-colors overflow-hidden">
          <div class="divide-y divide-secondary dark:divide-success">
            <div *ngFor="let item of paginatedWords"
                 (click)="toggleExpand(item.id)"
                 [class.bg-light-bg]="expandedId === item.id && currentTheme === 'light'"
                 [class.dark:bg-slate-700]="expandedId === item.id"
                 class="px-4 py-2 hover:bg-light-bg dark:hover:bg-slate-700 transition-all cursor-pointer group relative">
              <div class="flex items-center gap-3 justify-between">
                <div class="flex-1 min-w-0 flex items-center gap-3">
                  <h2 class="text-xl font-bold transition-colors text-light-headline dark:text-dark-headline">{{ item.word }}</h2>
                  <p class="text-sm transition-colors text-primary dark:text-primary-dark">{{ item.reading }}</p>
                  <span class="text-sm transition-colors text-light-paragraph dark:text-dark-paragraph opacity-70">{{ item.translation }}</span>
                </div>

                <div class="flex items-center gap-2 flex-shrink-0">
                  <button (click)="addFromList(item); $event.stopPropagation()"
                          [disabled]="savingId === item.id"
                          [title]="savingId === item.id ? 'Adding...' : 'Add to vocabulary'"
                          class="w-7 h-7 rounded-full flex items-center justify-center transition-all border border-primary dark:border-primary-dark text-primary dark:text-primary-dark hover:bg-primary dark:hover:bg-primary-dark hover:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-primary dark:disabled:hover:text-primary-dark">
                    <span class="text-base leading-none">{{ savingId === item.id ? '⏳' : '+' }}</span>
                  </button>
                  <span class="text-lg transition-transform" [class.rotate-180]="expandedId === item.id">▼</span>
                </div>
              </div>

              <!-- Expanded Content -->
              <div *ngIf="expandedId === item.id" 
                   class="mt-3 pt-3 border-t border-secondary dark:border-success animate-fadeIn"
                   (click)="$event.stopPropagation()">
                <p *ngIf="successById[item.id]" class="text-xs text-success font-medium">
                  {{ successById[item.id] }}
                </p>
                <p *ngIf="errorById[item.id]" class="text-xs text-secondary dark:text-success font-medium">
                  {{ errorById[item.id] }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination Controls (only show when level selected) -->
        <div *ngIf="selectedLevel && totalPages > 0" class="flex items-center justify-between mt-6 px-4 py-4 rounded-lg bg-white dark:bg-slate-800 border border-secondary dark:border-success transition-colors">
          <button (click)="previousPage()"
                  [disabled]="currentPage === 1"
                  class="px-4 py-2 rounded-lg transition font-medium text-sm bg-light-bg dark:bg-slate-700 text-light-headline dark:text-dark-headline hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed">
            ← Previous
          </button>

          <div class="flex items-center gap-2">
            <span class="text-sm transition-colors text-light-paragraph dark:text-dark-paragraph">
              Page <span class="font-semibold">{{ currentPage }}</span> of <span class="font-semibold">{{ totalPages }}</span>
            </span>
            <span class="text-xs transition-colors text-light-paragraph dark:text-dark-paragraph opacity-70 ml-2">
              ({{ totalResults }} results)
            </span>
          </div>

          <button (click)="nextPage()"
                  [disabled]="currentPage === totalPages"
                  class="px-4 py-2 rounded-lg transition font-medium text-sm bg-light-bg dark:bg-slate-700 text-light-headline dark:text-dark-headline hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed">
            Next →
          </button>
        </div>

        <p *ngIf="selectedLevel && filteredWords.length === 0"
           class="text-center py-8 transition-colors text-light-paragraph dark:text-dark-paragraph">
          No words match your search.
        </p>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-fadeIn {
      animation: fadeIn 0.2s ease-out;
    }

    .rotate-180 {
      transform: rotate(180deg);
    }
  `],
})
export class WordsComponent implements OnInit {
  currentTheme: Theme = 'light';
  searchTerm = '';
  savingId: string | null = null;
  successById: Record<string, string> = {};
  errorById: Record<string, string> = {};
  expandedId: string | null = null;

  jlptLevels = ['N5', 'N4', 'N3', 'N2', 'N1'];
  selectedLevel: string | null = null;

  words: WordListItem[] = [];
  currentPage = 1;
  itemsPerPage = 30;

  get filteredWords(): WordListItem[] {
    const query = this.searchTerm.trim().toLowerCase();
    if (!query) {
      return this.words;
    }

    return this.words.filter(item =>
      item.word.includes(this.searchTerm.trim()) ||
      item.reading.includes(this.searchTerm.trim()) ||
      item.translation.toLowerCase().includes(query)
    );
  }

  get totalPages(): number {
    return Math.ceil(this.filteredWords.length / this.itemsPerPage);
  }

  get paginatedWords(): WordListItem[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredWords.slice(startIndex, endIndex);
  }

  get totalResults(): number {
    return this.filteredWords.length;
  }

  constructor(
    private vocabularyService: VocabularyService,
    private themeService: ThemeService
  ) {
    this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  ngOnInit(): void {
    // Level selection is triggered by selectLevel method
  }

  selectLevel(level: string): void {
    this.selectedLevel = level;
    this.searchTerm = '';
    this.currentPage = 1;
    this.expandedId = null;
    this.loadWordsFromCSV(level);
  }

  deselectLevel(): void {
    this.selectedLevel = null;
    this.words = [];
    this.searchTerm = '';
    this.currentPage = 1;
    this.expandedId = null;
    this.successById = {};
    this.errorById = {};
  }

  private loadWordsFromCSV(level: string): void {
    const csvFile = `assets/${level.toLowerCase()}-words.csv`;
    fetch(csvFile)
      .then(response => response.text())
      .then(csvData => {
        this.parseCSV(csvData);
      })
      .catch(error => {
        console.error(`Error loading CSV file for ${level}:`, error);
        this.words = [];
      });
  }

  private parseCSV(csvData: string): void {
    const lines = csvData.split('\n');
    const words: WordListItem[] = [];

    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Simple CSV parsing - handle quoted values
      const parts = this.parseCSVLine(line);
      if (parts.length >= 3) {
        words.push({
          id: `w-${i}`,
          word: parts[0],
          reading: parts[1],
          translation: parts[2]
        });
      }
    }

    this.words = words;
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim().replace(/^"|"$/g, ''));
    return result;
  }

  toggleExpand(id: string): void {
    this.expandedId = this.expandedId === id ? null : id;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.expandedId = null;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.expandedId = null;
    }
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.expandedId = null;
  }

  addFromList(item: WordListItem): void {
    this.savingId = item.id;
    this.successById[item.id] = '';
    this.errorById[item.id] = '';

    const word: Word = {
      id: `word-list-${item.id}`,
      text: item.word,
      reading: item.reading,
      meaning: item.translation,
      partOfSpeech: 'word'
    };

    const levelText = this.selectedLevel || 'N5';
    const exampleSentence = `Learned from ${levelText} word list`;

    this.vocabularyService.addWord(word, exampleSentence).subscribe({
      next: () => {
        this.successById[item.id] = `Added "${word.text}" to your vocabulary`;
        this.savingId = null;

        setTimeout(() => {
          this.successById[item.id] = '';
        }, 2500);
      },
      error: (err: { error?: string }) => {
        this.errorById[item.id] = err.error ?? 'Failed to add word. Please try again.';
        this.savingId = null;

        setTimeout(() => {
          this.errorById[item.id] = '';
        }, 5000);
      }
    });
  }
}
