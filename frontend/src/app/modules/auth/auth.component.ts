import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="auth-page relative flex min-h-screen items-center overflow-hidden px-4 py-8 sm:py-12 transition-colors duration-300 bg-light-bg dark:bg-dark-bg">
      <div class="auth-aura auth-aura-left"></div>
      <div class="auth-aura auth-aura-right"></div>
      <div class="auth-floor-glow"></div>

      <div class="relative z-10 mx-auto grid w-full max-w-6xl items-stretch gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section class="rounded-3xl border border-secondary/20 dark:border-success/25 bg-white/90 dark:bg-slate-900/85 p-6 sm:p-8 shadow-md">
          <p class="mb-3 inline-flex items-center gap-2 rounded-full border border-secondary/30 dark:border-success/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-secondary dark:text-success">
            JLPT Study Platform
          </p>
          <h1 class="text-3xl sm:text-4xl font-bold leading-tight text-light-headline dark:text-dark-headline">
            Learn Japanese with a workflow that actually sticks.
          </h1>
          <p class="mt-4 text-sm sm:text-base leading-7 text-light-paragraph dark:text-dark-paragraph">
            Read real material, capture vocabulary, and keep progress moving with SRS review, kana drills, grammar practice, and focused study sessions.
          </p>

          <div class="mt-7 grid gap-3 sm:grid-cols-2">
            <article *ngFor="let item of highlights"
                     class="rounded-2xl border border-secondary/15 dark:border-success/20 bg-light-bg/70 dark:bg-slate-800/75 p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.12em] text-secondary dark:text-success">{{ item.label }}</p>
              <p class="mt-1 text-sm text-light-paragraph dark:text-dark-paragraph">{{ item.value }}</p>
            </article>
          </div>

          <div class="mt-7 rounded-2xl border border-secondary/20 dark:border-success/20 bg-gradient-to-r from-[#dcf4f1] to-[#e9f8f6] dark:from-[#0f252b] dark:to-[#15343a] p-4">
            <p class="text-xs uppercase tracking-[0.14em] font-semibold text-secondary dark:text-success">Study Stack</p>
            <p class="mt-2 text-sm leading-6 text-light-paragraph dark:text-dark-paragraph">
              Books, vocabulary, words, kanji, kana, grammar, flashcard review, and Kana Ninja in one connected loop.
            </p>
          </div>
        </section>

        <section class="rounded-3xl border border-secondary/20 dark:border-success/25 bg-white/95 dark:bg-slate-900/90 p-6 sm:p-8 shadow-md">
          <div class="mb-6">
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-secondary dark:text-success">Account Access</p>
            <h2 class="mt-2 text-2xl font-bold text-light-headline dark:text-dark-headline">
              {{ mode === 'login' ? 'Welcome back' : 'Create your account' }}
            </h2>
            <p class="mt-1 text-sm text-light-paragraph dark:text-dark-paragraph">
              {{ mode === 'login' ? 'Sign in to continue your progress.' : 'Start your Japanese study routine today.' }}
            </p>
          </div>

          <div class="mb-5 grid grid-cols-2 rounded-xl border border-secondary/25 dark:border-success/25 p-1 bg-light-bg/80 dark:bg-slate-800">
            <button
              type="button"
              (click)="setMode('login')"
              [class]="mode === 'login' ? 'rounded-lg bg-light-button dark:bg-dark-button text-white px-3 py-2 text-sm font-semibold' : 'rounded-lg px-3 py-2 text-sm font-semibold text-light-headline dark:text-dark-headline hover:bg-white dark:hover:bg-slate-700'"
            >
              Login
            </button>
            <button
              type="button"
              (click)="setMode('register')"
              [class]="mode === 'register' ? 'rounded-lg bg-light-button dark:bg-dark-button text-white px-3 py-2 text-sm font-semibold' : 'rounded-lg px-3 py-2 text-sm font-semibold text-light-headline dark:text-dark-headline hover:bg-white dark:hover:bg-slate-700'"
            >
              Register
            </button>
          </div>

          <form (ngSubmit)="submit()" class="space-y-4">
            <div>
              <label class="block text-sm text-light-headline dark:text-dark-headline mb-1.5 font-medium">Email</label>
              <input
                [(ngModel)]="email"
                name="email"
                type="email"
                required
                autocomplete="email"
                class="w-full rounded-xl border border-secondary/40 dark:border-success/35 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary bg-light-bg dark:bg-slate-800 text-light-paragraph dark:text-dark-paragraph placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div class="mb-1.5 flex items-center justify-between">
                <label class="block text-sm text-light-headline dark:text-dark-headline font-medium">Password</label>
                <button
                  type="button"
                  (click)="showPassword = !showPassword"
                  class="text-xs font-medium text-secondary dark:text-success hover:opacity-80">
                  {{ showPassword ? 'Hide' : 'Show' }}
                </button>
              </div>
              <input
                [(ngModel)]="password"
                name="password"
                [type]="showPassword ? 'text' : 'password'"
                required
                minlength="8"
                autocomplete="current-password"
                class="w-full rounded-xl border border-secondary/40 dark:border-success/35 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary bg-light-bg dark:bg-slate-800 text-light-paragraph dark:text-dark-paragraph placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="At least 8 characters"
              />
              <p class="mt-1 text-xs text-light-paragraph/80 dark:text-dark-paragraph/80">
                Use at least 8 characters.
              </p>
            </div>

            <p *ngIf="errorMessage" class="rounded-lg border border-red-300/60 dark:border-red-500/40 bg-red-50 dark:bg-red-950/20 px-3 py-2 text-sm font-medium text-red-700 dark:text-red-300">
              {{ errorMessage }}
            </p>

            <button
              type="submit"
              [disabled]="loading || !email.trim() || password.length < 8"
              class="w-full rounded-xl bg-light-button dark:bg-dark-button hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 font-semibold transition flex items-center justify-center gap-2">
              <app-loading-spinner *ngIf="loading" [size]="20" [inline]="true" [minimal]="true"></app-loading-spinner>
              <span>{{ loading ? 'Please wait...' : (mode === 'login' ? 'Login' : 'Create account') }}</span>
            </button>
          </form>

          <div class="mt-5 text-center">
            <button
              type="button"
              (click)="router.navigate(['/'])"
              class="text-sm text-light-paragraph dark:text-dark-paragraph hover:text-primary dark:hover:text-primary-dark transition-colors font-medium">
              Back to Home
            </button>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .auth-aura {
      position: absolute;
      width: 420px;
      height: 420px;
      border-radius: 9999px;
      pointer-events: none;
      opacity: 0.18;
      background: radial-gradient(circle at center, currentColor 0%, transparent 70%);
    }

    .auth-aura-left {
      color: #D14A5A;
      left: -160px;
      top: -140px;
    }

    .auth-aura-right {
      color: #f4a261;
      right: -180px;
      bottom: -120px;
    }

    .auth-floor-glow {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 240px;
      pointer-events: none;
      background:
        radial-gradient(60% 90% at 15% 100%, rgba(244, 162, 97, 0.22) 0%, rgba(244, 162, 97, 0) 70%),
        radial-gradient(60% 90% at 85% 100%, rgba(209, 74, 90, 0.2) 0%, rgba(209, 74, 90, 0) 72%);
    }
  `],
})
export class AuthComponent implements OnInit {
  mode: 'login' | 'register' = 'login';
  email = '';
  password = '';
  showPassword = false;
  loading = false;
  errorMessage = '';
  readonly highlights = [
    { label: 'Reading', value: 'Context-driven chapters and real text practice' },
    { label: 'Retention', value: 'Spaced repetition reviews with due tracking' },
    { label: 'Practice', value: 'Kana typing and game-based reinforcement' },
    { label: 'Consistency', value: 'Built-in focus toolkit for daily study sessions' },
  ];

  constructor(
    private readonly authService: AuthService,
    public readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    // Check for mode query param
    const modeParam = this.route.snapshot.queryParamMap.get('mode');
    if (modeParam === 'register' || modeParam === 'login') {
      this.mode = modeParam;
    }
  }

  setMode(mode: 'login' | 'register'): void {
    this.mode = mode;
    this.errorMessage = '';
  }

  submit(): void {
    this.loading = true;
    this.errorMessage = '';

    const request$ = this.mode === 'login'
      ? this.authService.login(this.email, this.password)
      : this.authService.register(this.email, this.password);

    request$.subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (error: { error?: { message?: string | string[] } }) => {
        const errorMessage = error.error?.message;
        this.errorMessage = Array.isArray(errorMessage)
          ? errorMessage.join(', ')
          : errorMessage ?? 'Authentication failed';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
