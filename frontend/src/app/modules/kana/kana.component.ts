import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { KanaService, Kana, KanaStats, UserKanaStatsOverview, KanaMasteryLevel } from '../../core/services/kana.service';

@Component({
  selector: 'app-kana',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-light-bg dark:bg-slate-900 transition-colors p-4">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-12 text-center">
          <h1 class="text-5xl font-bold text-light-headline dark:text-dark-headline mb-4">
            Kana Learning
          </h1>
          <p class="text-lg text-light-paragraph dark:text-dark-paragraph">
            Choose a practice mode to get started
          </p>
        </div>

        <!-- Menu Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <!-- Hiragana Card -->
          <a routerLink="/kana/hiragana"
             class="group bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all hover:scale-105 border-2 border-transparent hover:border-primary cursor-pointer">
            <div class="text-center">
              <div class="text-6xl font-bold text-primary mb-4">
                ひらがな
              </div>
              <h3 class="text-2xl font-bold text-light-headline dark:text-dark-headline mb-2">
                Hiragana Table
              </h3>
              <p class="text-light-paragraph dark:text-dark-paragraph mb-4">
                View the complete hiragana character chart
              </p>
              <div class="flex items-center justify-center gap-2 text-sm text-light-paragraph dark:text-dark-paragraph opacity-70">
                <span>46 characters</span>
              </div>
            </div>
          </a>

          <!-- Katakana Card -->
          <a routerLink="/kana/katakana"
             class="group bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all hover:scale-105 border-2 border-transparent hover:border-primary cursor-pointer">
            <div class="text-center">
              <div class="text-6xl font-bold text-primary mb-4">
                カタカナ
              </div>
              <h3 class="text-2xl font-bold text-light-headline dark:text-dark-headline mb-2">
                Katakana Table
              </h3>
              <p class="text-light-paragraph dark:text-dark-paragraph mb-4">
                View the complete katakana character chart
              </p>
              <div class="flex items-center justify-center gap-2 text-sm text-light-paragraph dark:text-dark-paragraph opacity-70">
                <span>46 characters</span>
              </div>
            </div>
          </a>

          <!-- Typing Practice Card -->
          <a routerLink="/kana/typing"
             class="group bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all hover:scale-105 border-2 border-transparent hover:border-primary cursor-pointer">
            <div class="text-center">
              <div class="text-6xl font-bold text-primary mb-4">
                ⌨️
              </div>
              <h3 class="text-2xl font-bold text-light-headline dark:text-dark-headline mb-2">
                Typing Practice
              </h3>
              <p class="text-light-paragraph dark:text-dark-paragraph mb-4">
                Practice typing romaji for kana characters
              </p>
              <div class="flex items-center justify-center gap-2 text-sm text-light-paragraph dark:text-dark-paragraph opacity-70">
                <span>Interactive</span>
              </div>
            </div>
          </a>
        </div>

        <!-- Statistics Section -->
        <div *ngIf="statsOverview" class="mb-8">
          <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <h2 class="text-2xl font-bold text-light-headline dark:text-dark-headline mb-6">
              📊 Your Progress
            </h2>

            <!-- Overall Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div class="text-center p-4 bg-light-bg dark:bg-slate-700 rounded-lg">
                <div class="text-3xl font-bold text-primary">{{ statsOverview.totalKanaPracticed }}</div>
                <div class="text-sm text-light-paragraph dark:text-dark-paragraph">Practiced</div>
              </div>
              <div class="text-center p-4 bg-light-bg dark:bg-slate-700 rounded-lg">
                <div class="text-3xl font-bold text-green-600">{{ statsOverview.overallAccuracy.toFixed(1) }}%</div>
                <div class="text-sm text-light-paragraph dark:text-dark-paragraph">Accuracy</div>
              </div>
              <div class="text-center p-4 bg-light-bg dark:bg-slate-700 rounded-lg">
                <div class="text-3xl font-bold text-blue-600">{{ (statsOverview.avgResponseTime / 1000).toFixed(1) }}s</div>
                <div class="text-sm text-light-paragraph dark:text-dark-paragraph">Avg Time</div>
              </div>
              <div class="text-center p-4 bg-light-bg dark:bg-slate-700 rounded-lg">
                <div class="text-3xl font-bold text-purple-600">{{ statsOverview.totalAttempts }}</div>
                <div class="text-sm text-light-paragraph dark:text-dark-paragraph">Total Attempts</div>
              </div>
            </div>

            <!-- Mastery Distribution -->
            <div class="flex items-center justify-center gap-6 mb-6 flex-wrap">
              <div class="flex items-center gap-2">
                <span class="text-2xl">🟩</span>
                <span class="font-medium text-green-600">{{ statsOverview.strongCount }} Strong</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-2xl">🟨</span>
                <span class="font-medium text-yellow-600">{{ statsOverview.mediumCount }} Medium</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-2xl">🟥</span>
                <span class="font-medium text-red-600">{{ statsOverview.weakCount }} Weak</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-2xl">⬜</span>
                <span class="font-medium text-light-paragraph dark:text-dark-paragraph">{{ statsOverview.notPracticedCount }} Not Practiced</span>
              </div>
            </div>

            <!-- Mode Toggle -->
            <div class="flex justify-center gap-2 mb-6">
              <button
                (click)="setStatsMode('all')"
                [class.bg-primary]="statsMode === 'all'"
                [class.text-white]="statsMode === 'all'"
                [class.bg-light-surface]="statsMode !== 'all'"
                [class.dark:bg-slate-700]="statsMode !== 'all'"
                class="px-4 py-2 rounded-lg transition font-medium">
                All Kana
              </button>
              <button
                (click)="setStatsMode('hiragana')"
                [class.bg-primary]="statsMode === 'hiragana'"
                [class.text-white]="statsMode === 'hiragana'"
                [class.bg-light-surface]="statsMode !== 'hiragana'"
                [class.dark:bg-slate-700]="statsMode !== 'hiragana'"
                class="px-4 py-2 rounded-lg transition font-medium">
                ひらがな
              </button>
              <button
                (click)="setStatsMode('katakana')"
                [class.bg-primary]="statsMode === 'katakana'"
                [class.text-white]="statsMode === 'katakana'"
                [class.bg-light-surface]="statsMode !== 'katakana'"
                [class.dark:bg-slate-700]="statsMode !== 'katakana'"
                class="px-4 py-2 rounded-lg transition font-medium">
                カタカナ
              </button>
            </div>

            <!-- Kana Grid -->
            <div class="grid grid-cols-5 md:grid-cols-10 gap-2">
              <div *ngFor="let item of displayedKanaGrid"
                   class="relative aspect-square flex flex-col items-center justify-center p-2 rounded-lg bg-light-bg dark:bg-slate-700 border-2 transition-all hover:scale-105 cursor-pointer"
                   [class.border-green-500]="item.masteryLevel === 'strong'"
                   [class.bg-green-50]="item.masteryLevel === 'strong'"
                   [class.dark:bg-green-900]="item.masteryLevel === 'strong'"
                   [class.border-yellow-500]="item.masteryLevel === 'medium'"
                   [class.bg-yellow-50]="item.masteryLevel === 'medium'"
                   [class.dark:bg-yellow-900]="item.masteryLevel === 'medium'"
                   [class.border-red-500]="item.masteryLevel === 'weak'"
                   [class.bg-red-50]="item.masteryLevel === 'weak'"
                   [class.dark:bg-red-900]="item.masteryLevel === 'weak'"
                   [class.border-gray-300]="item.masteryLevel === 'not_practiced'"
                   [class.dark:border-gray-600]="item.masteryLevel === 'not_practiced'"
                   [title]="item.romaji + (item.accuracy !== undefined ? ' - ' + item.accuracy.toFixed(0) + '%' : '')">
                <span class="text-xl md:text-2xl font-bold">{{ item.character }}</span>
                <span class="text-xs opacity-60">{{ item.romaji }}</span>
                <span class="absolute top-1 right-1 text-sm">{{ getMasteryEmoji(item.masteryLevel) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Future Modes (Coming Soon) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Mixed Practice Card (Coming Soon) -->
          <div class="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg border-2 border-secondary dark:border-slate-700 opacity-60 cursor-not-allowed">
            <div class="text-center">
              <div class="text-6xl font-bold text-light-paragraph dark:text-dark-paragraph mb-4">
                あア
              </div>
              <h3 class="text-2xl font-bold text-light-headline dark:text-dark-headline mb-2">
                Mixed Practice
              </h3>
              <p class="text-light-paragraph dark:text-dark-paragraph mb-4">
                Practice both hiragana and katakana together
              </p>
              <div class="inline-block px-3 py-1 bg-secondary dark:bg-slate-700 text-white text-sm rounded-full">
                Coming Soon
              </div>
            </div>
          </div>

          <!-- Matching Game Card (Coming Soon) -->
          <div class="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg border-2 border-secondary dark:border-slate-700 opacity-60 cursor-not-allowed">
            <div class="text-center">
              <div class="text-6xl font-bold text-light-paragraph dark:text-dark-paragraph mb-4">
                🎮
              </div>
              <h3 class="text-2xl font-bold text-light-headline dark:text-dark-headline mb-2">
                Matching Game
              </h3>
              <p class="text-light-paragraph dark:text-dark-paragraph mb-4">
                Match hiragana with katakana characters
              </p>
              <div class="inline-block px-3 py-1 bg-secondary dark:bg-slate-700 text-white text-sm rounded-full">
                Coming Soon
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class KanaComponent implements OnInit {
  statsOverview: UserKanaStatsOverview | null = null;
  kanaStats: KanaStats[] = [];
  allKana: Kana[] = [];
  displayedKanaGrid: Array<{
    character: string;
    romaji: string;
    masteryLevel: KanaMasteryLevel;
    accuracy?: number;
  }> = [];
  statsMode: 'all' | 'hiragana' | 'katakana' = 'all';

  constructor(private kanaService: KanaService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    // Load overview
    const type = this.statsMode === 'all' ? undefined : this.statsMode;
    this.kanaService.getUserStatsOverview(type).subscribe({
      next: (overview) => {
        this.statsOverview = overview;
      },
      error: (err) => console.error('Error loading stats overview:', err)
    });

    // Load detailed stats
    this.kanaService.getUserStats(type).subscribe({
      next: (stats) => {
        this.kanaStats = stats;
        this.loadKanaAndBuildGrid();
      },
      error: (err) => console.error('Error loading stats:', err)
    });
  }

  loadKanaAndBuildGrid(): void {
    const type = this.statsMode === 'all' ? undefined : this.statsMode;
    this.kanaService.getAllKana(type).subscribe({
      next: (kana) => {
        this.allKana = kana;
        this.buildKanaGrid();
      },
      error: (err) => console.error('Error loading kana:', err)
    });
  }

  buildKanaGrid(): void {
    const statsMap = new Map<string, KanaStats>();
    this.kanaStats.forEach(stat => {
      statsMap.set(`${stat.character}|${stat.type}`, stat);
    });

    this.displayedKanaGrid = this.allKana.map(kana => {
      const stat = statsMap.get(`${kana.character}|${kana.type}`);
      return {
        character: kana.character,
        romaji: kana.romaji,
        masteryLevel: stat?.masteryLevel || 'not_practiced',
        accuracy: stat?.accuracy
      };
    });
  }

  setStatsMode(mode: 'all' | 'hiragana' | 'katakana'): void {
    this.statsMode = mode;
    this.loadStats();
  }

  getMasteryEmoji(level: KanaMasteryLevel): string {
    switch (level) {
      case 'strong': return '🟩';
      case 'medium': return '🟨';
      case 'weak': return '🟥';
      case 'not_practiced': return '⬜';
      default: return '⬜';
    }
  }
}
