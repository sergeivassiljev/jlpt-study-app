import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ThemeService, Theme } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';

interface StudyFlowStep {
  step: string;
  title: string;
  description: string;
}

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
  highlights: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="relative flex min-h-full flex-col overflow-hidden transition-colors duration-300 bg-light-bg dark:bg-dark-bg text-light-paragraph dark:text-dark-paragraph">
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div class="home-grid absolute inset-0"></div>
        <div class="home-orb home-orb-a"></div>
        <div class="home-orb home-orb-b"></div>
      </div>

      <header class="relative z-10 container mx-auto px-4 py-6 reveal">
        <div class="flex items-center justify-between rounded-2xl border border-secondary/25 dark:border-success/30 bg-white dark:bg-slate-900 px-4 py-3 shadow-sm">
          <div class="flex items-center gap-3">
            <span class="text-2xl md:text-3xl">日本語</span>
            <div>
              <p class="font-semibold tracking-wide text-light-headline dark:text-dark-headline">JLPT Study App</p>
              <p class="text-xs uppercase tracking-[0.2em] text-secondary dark:text-success">Books • Kana • Review • Games</p>
            </div>
          </div>

          <button (click)="toggleTheme()"
                  class="h-10 w-10 rounded-xl border border-secondary/40 dark:border-success/40 bg-white/80 dark:bg-slate-800/80 text-xl transition hover:scale-105"
                  [title]="currentTheme === 'dark' ? 'Light Mode' : 'Dark Mode'">
            {{ currentTheme === 'dark' ? '☀️' : '🌙' }}
          </button>
        </div>
      </header>

      <main class="relative z-10 container mx-auto flex-1 px-4 pb-16">
        <section class="reveal reveal-delay-1 pt-8 md:pt-14">
          <div class="grid xl:grid-cols-[1.35fr_1fr] gap-8 items-start">
            <div class="rounded-3xl border border-secondary/25 dark:border-success/30 bg-white dark:bg-slate-900 p-6 md:p-10 shadow-md">
              <p class="inline-flex items-center gap-2 text-xs md:text-sm uppercase tracking-[0.2em] text-secondary dark:text-success font-semibold mb-5">
                <span class="h-2 w-2 rounded-full bg-secondary dark:bg-success"></span>
                Updated Learning Hub
              </p>

              <h1 class="text-4xl md:text-6xl leading-tight mb-6 text-light-headline dark:text-dark-headline">
                One place to read,
                <span class="text-primary dark:text-primary-dark">review,</span>
                drill kana,
                and stay consistent.
              </h1>

              <p class="text-base md:text-xl max-w-3xl mb-8 text-light-paragraph dark:text-dark-paragraph">
                Your homepage now reflects the full platform: guided reading, saved words, SRS reviews, kanji and grammar practice,
                kana typing, and game-based repetition in a single study workflow.
              </p>

              <div class="flex flex-col sm:flex-row gap-3 sm:items-center mb-8">
                <button (click)="goToAuth('register')"
                  class="px-7 py-3 rounded-xl text-white font-semibold bg-light-button dark:bg-dark-button shadow-md transition hover:opacity-95">
                  Create Free Account
                </button>
                <button (click)="goToAuth('login')"
                  class="px-7 py-3 rounded-xl font-semibold border-2 border-secondary/65 dark:border-success/65 text-light-headline dark:text-dark-headline transition hover:bg-light-bg dark:hover:bg-slate-800">
                  Sign In
                </button>
              </div>

              <div class="flex flex-wrap gap-2 md:gap-3">
                <span *ngFor="let win of quickWins"
                      class="px-3 py-1.5 rounded-full text-xs md:text-sm border border-secondary/35 dark:border-success/35 bg-light-bg/80 dark:bg-slate-800/70 text-light-paragraph dark:text-dark-paragraph">
                  {{ win }}
                </span>
              </div>
            </div>

            <aside class="reveal reveal-delay-2 rounded-3xl border border-secondary/25 dark:border-success/30 bg-white dark:bg-slate-900 p-6 shadow-md">
              <h2 class="text-xl md:text-2xl mb-5 text-light-headline dark:text-dark-headline">Daily Study Loop</h2>
              <div class="space-y-4">
                <div *ngFor="let step of studyFlow"
                     class="rounded-2xl border border-secondary/20 dark:border-success/25 bg-white dark:bg-slate-800 p-4">
                  <p class="text-xs uppercase tracking-[0.16em] text-secondary dark:text-success mb-1">{{ step.step }}</p>
                  <h3 class="text-base md:text-lg font-semibold text-light-headline dark:text-dark-headline mb-1">{{ step.title }}</h3>
                  <p class="text-sm text-light-paragraph dark:text-dark-paragraph">{{ step.description }}</p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section class="reveal reveal-delay-2 mt-14 md:mt-20">
          <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-secondary dark:text-success font-semibold">Feature Map</p>
              <h2 class="text-3xl md:text-4xl text-light-headline dark:text-dark-headline">Everything now connected in one platform</h2>
            </div>
            <p class="md:max-w-md text-sm md:text-base text-light-paragraph dark:text-dark-paragraph">
              Switch from passive reading to active recall without opening a different app.
            </p>
          </div>

          <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
            <article *ngFor="let card of featureCards"
                     class="group rounded-2xl border border-secondary/20 dark:border-success/25 bg-white dark:bg-slate-900 p-5 transition hover:-translate-y-0.5 hover:shadow-md">
              <div class="flex items-center justify-between mb-3">
                <span class="text-2xl">{{ card.icon }}</span>
                <span class="text-[11px] uppercase tracking-[0.16em] text-secondary dark:text-success">Active</span>
              </div>
              <h3 class="text-lg font-semibold mb-2 text-light-headline dark:text-dark-headline">{{ card.title }}</h3>
              <p class="text-sm mb-3 text-light-paragraph dark:text-dark-paragraph">{{ card.description }}</p>
              <p class="text-xs md:text-sm font-medium text-secondary dark:text-success">{{ card.highlights }}</p>
            </article>
          </div>
        </section>

        <section class="reveal reveal-delay-3 mt-14 md:mt-20">
          <div class="rounded-3xl border border-secondary/25 dark:border-success/30 bg-gradient-to-r from-white/80 to-[#dff3f0]/90 dark:from-slate-900/70 dark:to-[#123a39]/80 p-8 md:p-12">
            <div class="grid lg:grid-cols-[1.2fr_1fr] gap-8 items-center">
              <div>
                <p class="text-xs uppercase tracking-[0.2em] text-secondary dark:text-success font-semibold mb-3">Ready To Start</p>
                <h2 class="text-3xl md:text-5xl leading-tight text-light-headline dark:text-dark-headline mb-4">
                  Build your Japanese habit with one focused dashboard.
                </h2>
                <p class="text-base md:text-lg text-light-paragraph dark:text-dark-paragraph max-w-2xl">
                  Register once, then move through books, saved vocabulary, reviews, and games in a clean loop designed for long-term retention.
                </p>
              </div>

              <div class="flex flex-col gap-3">
                <button (click)="goToAuth('register')"
                        class="w-full px-6 py-3 rounded-xl text-white font-semibold bg-light-button dark:bg-dark-button transition hover:opacity-95">
                  Start Learning Free
                </button>
                <button (click)="goToAuth('login')"
                  class="w-full px-6 py-3 rounded-xl font-semibold border-2 border-secondary/60 dark:border-success/60 text-light-headline dark:text-dark-headline transition hover:bg-light-bg dark:hover:bg-slate-800">
                  Continue Your Progress
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer class="relative z-10 py-10 border-t border-secondary/25 dark:border-success/30 bg-light-bg dark:bg-slate-950">
        <div class="container mx-auto px-4">
          <div class="grid gap-8 md:grid-cols-3">
            <div>
              <h3 class="text-base font-semibold mb-2 text-light-headline dark:text-dark-headline">JLPT Study App</h3>
              <p class="text-sm leading-6 text-light-paragraph dark:text-dark-paragraph">
                A focused learning loop for reading, vocabulary retention, and daily Japanese practice.
              </p>
            </div>

            <div>
              <h4 class="text-sm font-semibold uppercase tracking-wide mb-2 text-secondary dark:text-success">Learning Areas</h4>
              <p class="text-sm leading-6 text-light-paragraph dark:text-dark-paragraph break-words">
                Books, Vocabulary, Words, Kanji, Kana, Grammar, SRS Review, Kana Ninja, and Focus Timer.
              </p>
            </div>

            <div>
              <h4 class="text-sm font-semibold uppercase tracking-wide mb-2 text-secondary dark:text-success">Study Principle</h4>
              <p class="text-sm leading-6 text-light-paragraph dark:text-dark-paragraph">
                Read in context, save useful words, review on schedule, then reinforce with drills.
              </p>
            </div>
          </div>

          <div class="mt-8 pt-4 border-t border-secondary/20 dark:border-success/20 text-center">
            <p class="text-xs text-light-paragraph/90 dark:text-dark-paragraph/90">Read • Learn • Review • Play • Repeat</p>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .home-grid {
      background-image:
        linear-gradient(to right, rgba(200, 58, 74, 0.05) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(200, 58, 74, 0.05) 1px, transparent 1px);
      background-size: 38px 38px;
      opacity: 0.55;
    }

    .home-orb {
      position: absolute;
      border-radius: 9999px;
      opacity: 0.22;
      pointer-events: none;
      background: radial-gradient(circle at center, currentColor 0%, transparent 70%);
    }

    .home-orb-a {
      width: 320px;
      height: 320px;
      color: #F2A7B8;
      top: -90px;
      right: -80px;
    }

    .home-orb-b {
      width: 360px;
      height: 360px;
      color: #E05A47;
      bottom: -140px;
      left: -120px;
    }

    .reveal {
      opacity: 0;
      transform: translateY(18px);
      animation: revealUp 550ms ease forwards;
    }

    .reveal-delay-1 {
      animation-delay: 120ms;
    }

    .reveal-delay-2 {
      animation-delay: 230ms;
    }

    .reveal-delay-3 {
      animation-delay: 320ms;
    }

    @keyframes revealUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .reveal,
      .reveal-delay-1,
      .reveal-delay-2,
      .reveal-delay-3 {
        animation: none;
        opacity: 1;
        transform: none;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  currentTheme: Theme = 'light';
  readonly quickWins: string[] = [
    'Interactive reading with saved words',
    'Kana: Hiragana, Katakana, and Typing',
    'SRS reviews with due counts',
    'Kana Ninja game practice',
    'Built-in Pomodoro focus timer'
  ];

  readonly studyFlow: StudyFlowStep[] = [
    {
      step: 'Step 1',
      title: 'Read In Context',
      description: 'Open graded books, follow chapter by chapter, and capture new words while reading.'
    },
    {
      step: 'Step 2',
      title: 'Organize Vocabulary',
      description: 'Review saved words, readings, and meanings so your deck stays useful and focused.'
    },
    {
      step: 'Step 3',
      title: 'Train Recall',
      description: 'Use flashcard review sessions with spaced repetition to lock long-term memory.'
    },
    {
      step: 'Step 4',
      title: 'Keep Momentum',
      description: 'Rotate into kana typing, grammar, and game drills to stay consistent and motivated.'
    }
  ];

  readonly featureCards: FeatureCard[] = [
    {
      icon: '📖',
      title: 'Books + Reader',
      description: 'Read Japanese content with a clean chapter flow and context-first learning.',
      highlights: 'Guided chapters with focused reading flow'
    },
    {
      icon: '📝',
      title: 'Vocabulary + Words',
      description: 'Track collected vocabulary and manage your active word bank for review.',
      highlights: 'Collect, organize, and revisit useful words'
    },
    {
      icon: '🎴',
      title: 'SRS Flashcards',
      description: 'Jump into due reviews and build memory through spaced repetition cycles.',
      highlights: 'Due-based reviews to strengthen long-term retention'
    },
    {
      icon: '漢字',
      title: 'Kanji Grid',
      description: 'Study kanji in a dedicated grid with structured progress and repeated exposure.',
      highlights: 'Structured kanji practice with repeated exposure'
    },
    {
      icon: 'あ',
      title: 'Kana Mastery',
      description: 'Study hiragana and katakana, then move into timed typing practice.',
      highlights: 'From recognition to fast kana typing confidence'
    },
    {
      icon: '📚',
      title: 'Grammar Reference',
      description: 'Review grammar patterns and examples to strengthen sentence understanding.',
      highlights: 'Clear grammar patterns with practical examples'
    },
    {
      icon: '🥷',
      title: 'Kana Ninja Game',
      description: 'Turn kana recognition into quick reaction drills and high-score attempts.',
      highlights: 'Fast-paced kana drills to build recall speed'
    },
    {
      icon: '🍅',
      title: 'Focus Toolkit',
      description: 'Use the Pomodoro timer and profile settings to keep your study cadence steady.',
      highlights: 'Always-available productivity support'
    },
    {
      icon: '⚙️',
      title: 'Admin Workspace',
      description: 'Maintain content and platform configuration from the integrated admin area.',
      highlights: 'Content and platform controls for management'
    }
  ];

  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Redirect if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  goToAuth(mode: 'login' | 'register'): void {
    this.router.navigate(['/auth'], { queryParams: { mode } });
  }
}
