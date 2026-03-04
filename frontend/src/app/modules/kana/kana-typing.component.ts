import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { KanaService, Kana } from '../../core/services/kana.service';

type PracticeMode = 'hiragana' | 'katakana' | 'mixed' | 'custom';
type AppState = 'selection' | 'practice';

@Component({
  selector: 'app-kana-typing',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-light-bg dark:bg-dark-bg">
      <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center gap-4 mb-4">
            <a routerLink="/kana"
               class="px-4 py-2 bg-light-surface dark:bg-slate-700 hover:bg-primary hover:text-white text-light-headline dark:text-dark-headline rounded-lg transition font-medium">
              ← Back
            </a>
            <h1 class="text-4xl font-bold text-light-headline dark:text-dark-headline">
              ⌨️ Typing Practice
            </h1>
          </div>
          <p class="text-light-paragraph dark:text-dark-paragraph">
            {{ state === 'selection' ? 'Select a practice mode' : 'Type the romaji for each kana' }}
          </p>
        </div>

        <!-- SELECTION STATE -->
        <ng-container *ngIf="state === 'selection'">
          <!-- Mode Selection Buttons -->
          <div class="mb-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              <button
                (click)="selectMode('hiragana')"
                [class.border-primary]="selectedMode === 'hiragana'"
                [class.ring-2]="selectedMode === 'hiragana'"
                [class.ring-primary]="selectedMode === 'hiragana'"
                [class.bg-primary]="selectedMode === 'hiragana'"
                [class.text-white]="selectedMode === 'hiragana'"
                class="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg hover:shadow-xl border-2 border-transparent hover:border-primary transition font-medium text-lg">
                <div class="text-4xl mb-2">ひらがな</div>
                <div [class.text-light-headline]="selectedMode !== 'hiragana'" [class.dark:text-dark-headline]="selectedMode !== 'hiragana'">Hiragana</div>
                <div [class.text-light-paragraph]="selectedMode !== 'hiragana'" [class.dark:text-dark-paragraph]="selectedMode !== 'hiragana'" class="text-sm mt-1">46 characters</div>
              </button>
              <button
                (click)="selectMode('katakana')"
                [class.border-primary]="selectedMode === 'katakana'"
                [class.ring-2]="selectedMode === 'katakana'"
                [class.ring-primary]="selectedMode === 'katakana'"
                [class.bg-primary]="selectedMode === 'katakana'"
                [class.text-white]="selectedMode === 'katakana'"
                class="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg hover:shadow-xl border-2 border-transparent hover:border-primary transition font-medium text-lg">
                <div class="text-4xl mb-2">カタカナ</div>
                <div [class.text-light-headline]="selectedMode !== 'katakana'" [class.dark:text-dark-headline]="selectedMode !== 'katakana'">Katakana</div>
                <div [class.text-light-paragraph]="selectedMode !== 'katakana'" [class.dark:text-dark-paragraph]="selectedMode !== 'katakana'" class="text-sm mt-1">46 characters</div>
              </button>
              <button
                (click)="selectMode('mixed')"
                [class.border-primary]="selectedMode === 'mixed'"
                [class.ring-2]="selectedMode === 'mixed'"
                [class.ring-primary]="selectedMode === 'mixed'"
                [class.bg-primary]="selectedMode === 'mixed'"
                [class.text-white]="selectedMode === 'mixed'"
                class="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg hover:shadow-xl border-2 border-transparent hover:border-primary transition font-medium text-lg">
                <div class="text-4xl mb-2">🔀</div>
                <div [class.text-light-headline]="selectedMode !== 'mixed'" [class.dark:text-dark-headline]="selectedMode !== 'mixed'">Mixed</div>
                <div [class.text-light-paragraph]="selectedMode !== 'mixed'" [class.dark:text-dark-paragraph]="selectedMode !== 'mixed'" class="text-sm mt-1">Both scripts</div>
              </button>
              <button
                (click)="selectMode('custom')"
                [class.border-primary]="selectedMode === 'custom'"
                [class.ring-2]="selectedMode === 'custom'"
                [class.ring-primary]="selectedMode === 'custom'"
                [class.bg-primary]="selectedMode === 'custom'"
                [class.text-white]="selectedMode === 'custom'"
                class="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg hover:shadow-xl border-2 border-transparent hover:border-primary transition font-medium text-lg">
                <div class="text-4xl mb-2">✓</div>
                <div [class.text-light-headline]="selectedMode !== 'custom'" [class.dark:text-dark-headline]="selectedMode !== 'custom'">Custom</div>
                <div [class.text-light-paragraph]="selectedMode !== 'custom'" [class.dark:text-dark-paragraph]="selectedMode !== 'custom'" class="text-sm mt-1">Pick your own</div>
                <div *ngIf="customSelectedKana.length > 0" class="text-sm mt-1 opacity-90">{{ customSelectedKana.length }} selected</div>
              </button>
            </div>
          </div>

          <!-- Custom Selection Modal -->
          <div *ngIf="isCustomModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div class="w-full max-w-5xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-h-[90vh] overflow-hidden">
              <div class="flex items-center justify-between px-6 py-4 border-b border-secondary dark:border-slate-700">
                <h3 class="text-xl font-bold text-light-headline dark:text-dark-headline">Custom Practice Selection</h3>
                <button
                  (click)="closeCustomModal()"
                  class="px-3 py-1 rounded-lg bg-light-surface dark:bg-slate-700 text-light-headline dark:text-dark-headline hover:opacity-90 transition">
                  ✕
                </button>
              </div>

              <div class="px-6 py-4">
                <div class="flex gap-2 mb-4">
                  <button
                    (click)="customTab = 'hiragana'"
                    [class.bg-primary]="customTab === 'hiragana'"
                    [class.text-white]="customTab === 'hiragana'"
                    [class.bg-light-surface]="customTab !== 'hiragana'"
                    [class.dark:bg-slate-700]="customTab !== 'hiragana'"
                    class="px-4 py-2 rounded-lg transition font-medium">
                    ひらがな
                  </button>
                  <button
                    (click)="customTab = 'katakana'"
                    [class.bg-primary]="customTab === 'katakana'"
                    [class.text-white]="customTab === 'katakana'"
                    [class.bg-light-surface]="customTab !== 'katakana'"
                    [class.dark:bg-slate-700]="customTab !== 'katakana'"
                    class="px-4 py-2 rounded-lg transition font-medium">
                    カタカナ
                  </button>
                </div>

                <div class="flex flex-wrap items-center gap-2 mb-4">
                  <button
                    (click)="toggleCustomByType(true, customTab)"
                    class="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition text-sm font-medium">
                    Select All Visible
                  </button>
                  <button
                    (click)="toggleCustomByType(false, customTab)"
                    class="px-4 py-2 bg-light-surface dark:bg-slate-700 text-light-headline dark:text-dark-headline rounded-lg hover:opacity-90 transition text-sm font-medium">
                    Deselect All Visible
                  </button>
                  <span class="ml-auto text-sm text-light-paragraph dark:text-dark-paragraph">{{ customSelectedKana.length }} selected total</span>
                </div>

                <div class="max-h-[55vh] overflow-y-auto pr-1">
                  <div class="grid grid-cols-5 md:grid-cols-10 gap-2">
                    <button
                      *ngFor="let kana of (customTab === 'hiragana' ? customHiraganaKana : customKatakanaKana)"
                      (click)="toggleCustomKana(kana)"
                      [class.bg-primary]="isCustomKanaSelected(kana)"
                      [class.text-white]="isCustomKanaSelected(kana)"
                      [class.ring-2]="isCustomKanaSelected(kana)"
                      [class.ring-primary]="isCustomKanaSelected(kana)"
                      [class.bg-light-surface]="!isCustomKanaSelected(kana)"
                      [class.dark:bg-slate-700]="!isCustomKanaSelected(kana)"
                      class="aspect-square flex flex-col items-center justify-center p-2 rounded-lg border-2 border-secondary dark:border-slate-600 transition hover:scale-105">
                      <span class="font-bold text-lg">{{ kana.character }}</span>
                      <span class="text-xs opacity-60">{{ kana.romaji }}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div class="px-6 py-4 border-t border-secondary dark:border-slate-700 flex justify-end">
                <button
                  (click)="closeCustomModal()"
                  class="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition font-medium">
                  Done
                </button>
              </div>
            </div>
          </div>

          <!-- Play Button -->
          <div class="text-center">
            <button
              (click)="startPractice()"
              [disabled]="!selectedMode || (selectedMode === 'custom' && customSelectedKana.length === 0)"
              class="px-8 py-4 bg-primary hover:opacity-90 text-white rounded-lg transition font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed">
              ▶ {{ selectedMode ? 'Start ' + getModeLabel() + ' Practice' : 'Start Practice' }}
            </button>
          </div>
        </ng-container>

        <!-- PRACTICE STATE -->
        <ng-container *ngIf="state === 'practice'">
          <!-- Practice Mode Info -->
          <div class="mb-6 text-center">
            <div class="inline-block px-4 py-2 bg-light-surface dark:bg-slate-700 rounded-lg">
              <span class="font-medium text-light-headline dark:text-dark-headline">
                {{ getModeLabel() }} 
                <span *ngIf="selectedMode === 'custom'">({{ customSelectedKana.length }} kana)</span>
              </span>
            </div>
          </div>

          <!-- Practice Area -->
          <div class="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-lg max-w-2xl mx-auto">
            <div *ngIf="loading$ | async" class="text-center py-8">
              <p class="text-light-paragraph dark:text-dark-paragraph">Loading...</p>
            </div>

            <div *ngIf="!(loading$ | async) && currentKana" class="text-center">
              <!-- Character Display -->
              <div class="text-9xl font-bold text-primary mb-8 min-h-48 flex items-center justify-center">
                {{ currentKana.character }}
              </div>

              <!-- Input Field -->
              <div class="mb-6">
                <input
                  #answerInput
                  [(ngModel)]="userAnswer"
                  (keyup.enter)="checkAnswer()"
                  [disabled]="showingResult"
                  type="text"
                  placeholder="Type the romaji..."
                  class="w-full px-6 py-4 rounded-lg border-2 border-secondary dark:border-slate-600 bg-white dark:bg-slate-700 text-light-headline dark:text-dark-headline focus:outline-none focus:ring-2 focus:ring-primary text-center text-2xl font-medium"
                  autofocus>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-4 justify-center mb-6">
                <button
                  (click)="checkAnswer()"
                  [disabled]="!userAnswer.trim() || showingResult"
                  class="px-8 py-3 bg-primary hover:opacity-90 text-white rounded-lg transition font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed">
                  Check Answer
                </button>
                <button
                  (click)="skipQuestion()"
                  [disabled]="showingResult"
                  class="px-8 py-3 bg-light-surface dark:bg-slate-700 hover:opacity-90 text-light-headline dark:text-dark-headline rounded-lg transition font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed">
                  Skip
                </button>
                <button
                  (click)="endPractice()"
                  class="px-8 py-3 bg-red-600 hover:opacity-90 text-white rounded-lg transition font-medium text-lg">
                  Exit
                </button>
              </div>

              <!-- Result Feedback -->
              <div *ngIf="result"
                   class="mt-6 p-4 rounded-lg text-lg font-medium"
                   [class.bg-green-100]="result.correct"
                   [class.dark:bg-green-900]="result.correct"
                   [class.text-green-800]="result.correct"
                   [class.dark:text-green-200]="result.correct"
                   [class.bg-red-100]="!result.correct"
                   [class.dark:bg-red-900]="!result.correct"
                   [class.text-red-800]="!result.correct"
                   [class.dark:text-red-200]="!result.correct">
                <div class="flex items-center justify-center gap-2">
                  <span *ngIf="result.correct">✓</span>
                  <span *ngIf="!result.correct">✗</span>
                  <span>{{ result.message }}</span>
                </div>
                <div *ngIf="!result.correct" class="text-sm mt-2 opacity-80">
                  Correct answer: {{ currentKana.romaji }}
                </div>
              </div>

              <!-- Stats -->
              <div class="mt-8 pt-6 border-t border-secondary dark:border-slate-700">
                <div class="flex justify-center gap-8 text-sm">
                  <div class="text-center">
                    <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ stats.correct }}</div>
                    <div class="text-light-paragraph dark:text-dark-paragraph">Correct</div>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-red-600 dark:text-red-400">{{ stats.incorrect }}</div>
                    <div class="text-light-paragraph dark:text-dark-paragraph">Incorrect</div>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-primary">{{ stats.total }}</div>
                    <div class="text-light-paragraph dark:text-dark-paragraph">Total</div>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ getAccuracy().toFixed(1) }}%</div>
                    <div class="text-light-paragraph dark:text-dark-paragraph">Accuracy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: []
})
export class KanaTypingComponent implements OnInit {
  @ViewChild('answerInput') answerInput!: ElementRef<HTMLInputElement>;

  // State management
  state: AppState = 'selection';
  selectedMode: PracticeMode | null = null;
  
  // Practice variables
  currentKana: Kana | null = null;
  userAnswer = '';
  result: { correct: boolean; message: string } | null = null;
  showingResult = false;
  startTime: number = 0;
  loading$ = this.kanaService.loading$;

  // Custom selection
  customAvailableKana: Kana[] = [];
  customHiraganaKana: Kana[] = [];
  customKatakanaKana: Kana[] = [];
  customSelectedKana: Kana[] = [];
  isCustomModalOpen = false;
  customTab: 'hiragana' | 'katakana' = 'hiragana';

  stats = {
    correct: 0,
    incorrect: 0,
    total: 0
  };

  constructor(private kanaService: KanaService) {}

  ngOnInit(): void {
    this.loadCustomKanaOptions();
  }

  loadCustomKanaOptions(): void {
    this.kanaService.getAllKana().subscribe({
      next: (kana) => {
        this.customAvailableKana = kana;
        this.customHiraganaKana = kana.filter(item => item.type === 'hiragana');
        this.customKatakanaKana = kana.filter(item => item.type === 'katakana');
      },
      error: (err) => console.error('Error loading kana:', err)
    });
  }

  selectMode(mode: PracticeMode): void {
    this.selectedMode = mode;
    if (mode === 'custom') {
      this.customTab = 'hiragana';
      this.isCustomModalOpen = true;
    } else {
      this.isCustomModalOpen = false;
    }
  }

  closeCustomModal(): void {
    this.isCustomModalOpen = false;
  }

  toggleCustomKana(kana: Kana): void {
    const index = this.customSelectedKana.findIndex(k => k.id === kana.id);
    if (index > -1) {
      this.customSelectedKana.splice(index, 1);
    } else {
      this.customSelectedKana.push(kana);
    }
  }

  isCustomKanaSelected(kana: Kana): boolean {
    return this.customSelectedKana.some(k => k.id === kana.id);
  }

  toggleAllCustom(select: boolean): void {
    if (select) {
      this.customSelectedKana = [...this.customAvailableKana];
    } else {
      this.customSelectedKana = [];
    }
  }

  toggleCustomByType(select: boolean, type: 'hiragana' | 'katakana'): void {
    const visibleKana = type === 'hiragana' ? this.customHiraganaKana : this.customKatakanaKana;
    if (select) {
      const selectedIds = new Set(this.customSelectedKana.map(item => item.id));
      const kanaToAdd = visibleKana.filter(item => !selectedIds.has(item.id));
      this.customSelectedKana = [...this.customSelectedKana, ...kanaToAdd];
    } else {
      const visibleIds = new Set(visibleKana.map(item => item.id));
      this.customSelectedKana = this.customSelectedKana.filter(item => !visibleIds.has(item.id));
    }
  }

  startPractice(): void {
    this.state = 'practice';
    this.stats = { correct: 0, incorrect: 0, total: 0 };
    this.loadRandomKana();
  }

  loadRandomKana(): void {
    this.resetAnswer();

    if (this.selectedMode === 'custom') {
      // Random from selected kana
      const randomKana = this.customSelectedKana[
        Math.floor(Math.random() * this.customSelectedKana.length)
      ];
      if (randomKana) {
        this.currentKana = randomKana;
        this.startTime = Date.now();
        setTimeout(() => this.focusInput(), 0);
      }
    } else {
      // Load from backend
      this.kanaService.getRandomKana(
        this.selectedMode === 'mixed' ? undefined : this.selectedMode as 'hiragana' | 'katakana',
        1
      ).subscribe({
        next: (kana) => {
          if (kana.length > 0) {
            this.currentKana = kana[0];
            this.startTime = Date.now();
            setTimeout(() => this.focusInput(), 0);
          }
        },
        error: (err) => console.error('Error loading random kana:', err)
      });
    }
  }

  skipQuestion(): void {
    this.loadRandomKana();
  }

  checkAnswer(): void {
    if (!this.userAnswer.trim() || !this.currentKana || this.showingResult) return;

    const responseTime = Date.now() - this.startTime;
    const isCorrect = this.userAnswer.trim().toLowerCase() === this.currentKana.romaji.toLowerCase();

    this.result = {
      correct: isCorrect,
      message: isCorrect ? 'Correct! 🎉' : 'Incorrect'
    };

    this.stats.total++;
    if (isCorrect) {
      this.stats.correct++;
    } else {
      this.stats.incorrect++;
    }

    // Record attempt to backend
    this.kanaService.recordAttempt({
      kanaId: 0, // Not used, character+type is unique key on backend
      character: this.currentKana.character,
      romaji: this.currentKana.romaji,
      type: this.currentKana.type,
      isCorrect,
      responseTime
    }).subscribe({
      error: (err) => console.error('Error recording attempt:', err)
    });

    this.showingResult = true;

    // Auto-advance on correct answer after 600ms
    if (isCorrect) {
      setTimeout(() => {
        this.loadRandomKana();
      }, 600);
    } else {
      // For incorrect answers, wait 1.5 seconds before allowing next question
      setTimeout(() => {
        this.showingResult = false;
        this.focusInput();
      }, 1500);
    }
  }

  endPractice(): void {
    this.state = 'selection';
    this.selectedMode = null;
    this.currentKana = null;
    this.result = null;
    this.stats = { correct: 0, incorrect: 0, total: 0 };
  }

  getModeLabel(): string {
    if (this.selectedMode === 'hiragana') return 'ひらがな Hiragana';
    if (this.selectedMode === 'katakana') return 'カタカナ Katakana';
    if (this.selectedMode === 'mixed') return '🔀 Mixed';
    if (this.selectedMode === 'custom') return '✓ Custom Selection';
    return 'Practice';
  }

  getAccuracy(): number {
    if (this.stats.total === 0) return 0;
    return (this.stats.correct / this.stats.total) * 100;
  }

  private resetAnswer(): void {
    this.userAnswer = '';
    this.result = null;
    this.showingResult = false;
  }

  private focusInput(): void {
    if (this.answerInput) {
      this.answerInput.nativeElement.focus();
    }
  }
}
