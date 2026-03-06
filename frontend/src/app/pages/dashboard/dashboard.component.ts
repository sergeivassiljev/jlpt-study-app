import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SrsService } from '../../core/services/srs.service';
import { VocabularyService } from '../../core/services/vocabulary.service';

interface DashboardAction {
  icon: string;
  title: string;
  description: string;
  route: string;
  cta: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="relative min-h-full overflow-hidden bg-light-bg dark:bg-dark-bg text-light-paragraph dark:text-dark-paragraph">
      <div class="pointer-events-none absolute inset-0">
        <div class="dashboard-grid absolute inset-0"></div>
        <div class="dashboard-aura dashboard-aura-left"></div>
        <div class="dashboard-aura dashboard-aura-right"></div>
      </div>

      <div class="relative z-10 container mx-auto px-4 py-8 sm:py-10">
        <section class="rounded-3xl border border-secondary/25 dark:border-success/25 bg-white/90 dark:bg-slate-900/90 p-6 sm:p-8 shadow-md">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-secondary dark:text-success">Learning Dashboard</p>
          <div class="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 class="text-3xl sm:text-4xl font-bold text-light-headline dark:text-dark-headline">
                Welcome back, {{ userName }}
              </h1>
              <p class="mt-2 text-sm sm:text-base text-light-paragraph dark:text-dark-paragraph max-w-2xl">
                Pick what you want to study right now: read, review, practice kana, or sharpen grammar and kanji.
              </p>
            </div>
            <a routerLink="/review"
               class="inline-flex items-center justify-center rounded-xl bg-light-button dark:bg-dark-button px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition">
              Start Due Reviews
            </a>
          </div>

          <div class="mt-6 grid gap-3 sm:grid-cols-3">
            <div class="rounded-2xl border border-secondary/20 dark:border-success/20 bg-light-bg/80 dark:bg-slate-800/80 p-4">
              <p class="text-xs uppercase tracking-[0.12em] text-secondary dark:text-success font-semibold">Due Reviews</p>
              <p class="mt-1 text-2xl font-bold text-light-headline dark:text-dark-headline">{{ dueCount }}</p>
              <p class="text-xs mt-1 text-light-paragraph/90 dark:text-dark-paragraph/90">Cards waiting for your next review session</p>
            </div>

            <div class="rounded-2xl border border-secondary/20 dark:border-success/20 bg-light-bg/80 dark:bg-slate-800/80 p-4">
              <p class="text-xs uppercase tracking-[0.12em] text-secondary dark:text-success font-semibold">Saved Vocabulary</p>
              <p class="mt-1 text-2xl font-bold text-light-headline dark:text-dark-headline">{{ vocabularyCount }}</p>
              <p class="text-xs mt-1 text-light-paragraph/90 dark:text-dark-paragraph/90">Words and phrases in your active study bank</p>
            </div>

            <div class="rounded-2xl border border-secondary/20 dark:border-success/20 bg-light-bg/80 dark:bg-slate-800/80 p-4">
              <p class="text-xs uppercase tracking-[0.12em] text-secondary dark:text-success font-semibold">Study Mode</p>
              <p class="mt-1 text-2xl font-bold text-light-headline dark:text-dark-headline">Focused</p>
              <p class="text-xs mt-1 text-light-paragraph/90 dark:text-dark-paragraph/90">Rotate reading, recall, and drills for consistency</p>
            </div>
          </div>
        </section>

        <section class="mt-8">
          <div class="mb-4 flex items-end justify-between">
            <div>
              <p class="text-xs uppercase tracking-[0.16em] text-secondary dark:text-success font-semibold">Quick Navigation</p>
              <h2 class="text-2xl sm:text-3xl font-bold text-light-headline dark:text-dark-headline">Choose your next study action</h2>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <a *ngFor="let action of actions"
               [routerLink]="action.route"
               class="group rounded-2xl border border-secondary/20 dark:border-success/20 bg-white/90 dark:bg-slate-900/90 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition">
              <div class="flex items-center justify-between">
                <span class="text-2xl">{{ action.icon }}</span>
                <span class="text-xs uppercase tracking-[0.12em] text-secondary dark:text-success">Go</span>
              </div>
              <h3 class="mt-3 text-lg font-semibold text-light-headline dark:text-dark-headline">{{ action.title }}</h3>
              <p class="mt-1 text-sm text-light-paragraph dark:text-dark-paragraph">{{ action.description }}</p>
              <p class="mt-4 text-sm font-semibold text-primary dark:text-primary-dark">{{ action.cta }}</p>
            </a>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-grid {
      background-image:
        linear-gradient(to right, rgba(200, 58, 74, 0.05) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(200, 58, 74, 0.05) 1px, transparent 1px);
      background-size: 38px 38px;
      opacity: 0.45;
    }

    .dashboard-aura {
      position: absolute;
      width: 340px;
      height: 340px;
      border-radius: 9999px;
      opacity: 0.2;
      background: radial-gradient(circle at center, currentColor 0%, transparent 70%);
      pointer-events: none;
    }

    .dashboard-aura-left {
      color: #F2A7B8;
      left: -120px;
      top: -100px;
    }

    .dashboard-aura-right {
      color: #E05A47;
      right: -140px;
      bottom: -120px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  dueCount = 0;
  vocabularyCount = 0;
  userName = 'Learner';

  readonly actions: DashboardAction[] = [
    {
      icon: '📖',
      title: 'Read Books',
      description: 'Continue your reading flow and learn vocabulary in context.',
      route: '/books',
      cta: 'Open reading library',
    },
    {
      icon: '🎴',
      title: 'Review Flashcards',
      description: 'Clear due items and strengthen long-term memory with SRS.',
      route: '/review',
      cta: 'Start review session',
    },
    {
      icon: '📝',
      title: 'Vocabulary Bank',
      description: 'Manage saved words, examples, and your active study list.',
      route: '/vocabulary',
      cta: 'Open vocabulary',
    },
    {
      icon: '🔤',
      title: 'Words Practice',
      description: 'Train by topic and JLPT level with structured drills.',
      route: '/words',
      cta: 'Practice words',
    },
    {
      icon: 'あ',
      title: 'Kana Training',
      description: 'Practice hiragana, katakana, and timed typing.',
      route: '/kana',
      cta: 'Train kana',
    },
    {
      icon: '漢字',
      title: 'Kanji Grid',
      description: 'Build kanji familiarity with focused repetition.',
      route: '/kanji',
      cta: 'Study kanji',
    },
    {
      icon: '📚',
      title: 'Grammar',
      description: 'Review key grammar patterns and sentence structures.',
      route: '/grammar',
      cta: 'Open grammar',
    },
    {
      icon: '🥷',
      title: 'Kana Ninja',
      description: 'Use game drills to improve speed and kana recall.',
      route: '/games',
      cta: 'Play now',
    },
    {
      icon: '👤',
      title: 'Profile & Settings',
      description: 'Adjust account settings and study preferences.',
      route: '/profile',
      cta: 'Manage profile',
    },
  ];

  constructor(
    private readonly authService: AuthService,
    private readonly srsService: SrsService,
    private readonly vocabularyService: VocabularyService,
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
      this.userName = user?.email?.split('@')[0] || 'Learner';
    });

    this.srsService.flashcards$.subscribe(() => {
      this.dueCount = this.srsService.getDueCount();
    });

    this.vocabularyService.vocabulary$.subscribe((items) => {
      this.vocabularyCount = items.length;
    });
  }
}
