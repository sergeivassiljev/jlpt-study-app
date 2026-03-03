import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4 transition-colors duration-300 bg-light-bg dark:bg-dark-bg">
      <div class="w-full max-w-md bg-white dark:bg-slate-800 border border-secondary dark:border-success rounded-xl shadow-lg p-6 transition-colors">
        <h1 class="text-2xl font-bold text-light-headline dark:text-dark-headline mb-2">Sign In</h1>
        <p class="text-light-paragraph dark:text-dark-paragraph mb-6">Use your account to access your vocabulary and reviews.</p>

        <div class="flex gap-2 mb-4">
          <button
            type="button"
            (click)="mode = 'login'"
            [class]="mode === 'login' ? 'bg-light-button dark:bg-dark-button text-white px-3 py-2 rounded-lg font-medium' : 'bg-light-bg dark:bg-slate-700 text-light-headline dark:text-dark-headline px-3 py-2 rounded-lg font-medium hover:opacity-80'"
          >
            Login
          </button>
          <button
            type="button"
            (click)="mode = 'register'"
            [class]="mode === 'register' ? 'bg-light-button dark:bg-dark-button text-white px-3 py-2 rounded-lg font-medium' : 'bg-light-bg dark:bg-slate-700 text-light-headline dark:text-dark-headline px-3 py-2 rounded-lg font-medium hover:opacity-80'"
          >
            Register
          </button>
        </div>

        <form (ngSubmit)="submit()" class="space-y-4">
          <div>
            <label class="block text-sm text-light-headline dark:text-dark-headline mb-1 font-medium">Email</label>
            <input
              [(ngModel)]="email"
              name="email"
              type="email"
              required
              class="w-full border border-secondary rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-light-bg dark:bg-slate-700 text-light-paragraph dark:text-dark-paragraph placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label class="block text-sm text-light-headline dark:text-dark-headline mb-1 font-medium">Password</label>
            <input
              [(ngModel)]="password"
              name="password"
              type="password"
              required
              minlength="8"
              class="w-full border border-secondary rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-light-bg dark:bg-slate-700 text-light-paragraph dark:text-dark-paragraph placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="At least 8 characters"
            />
          </div>

          <p *ngIf="errorMessage" class="text-secondary dark:text-success text-sm font-medium">{{ errorMessage }}</p>

          <button
            type="submit"
            [disabled]="loading || !email.trim() || password.length < 8"
            class="w-full bg-light-button dark:bg-dark-button hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg font-semibold transition">
            {{ loading ? 'Please wait...' : (mode === 'login' ? 'Login' : 'Create account') }}
          </button>
        </form>

        <div class="mt-4 text-center">
          <button
            type="button"
            (click)="router.navigate(['/'])"
            class="text-sm text-light-paragraph dark:text-dark-paragraph hover:text-primary dark:hover:text-primary-dark transition-colors font-medium">
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  `,
})
export class AuthComponent implements OnInit {
  mode: 'login' | 'register' = 'login';
  email = '';
  password = '';
  loading = false;
  errorMessage = '';

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

  submit(): void {
    this.loading = true;
    this.errorMessage = '';

    const request$ = this.mode === 'login'
      ? this.authService.login(this.email, this.password)
      : this.authService.register(this.email, this.password);

    request$.subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/books';
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
