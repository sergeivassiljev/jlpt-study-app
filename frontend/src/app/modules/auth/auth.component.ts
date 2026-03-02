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
    <div class="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div class="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow p-6">
        <h1 class="text-2xl font-bold text-slate-900 mb-2">Sign In</h1>
        <p class="text-slate-600 mb-6">Use your account to access your vocabulary and reviews.</p>

        <div class="flex gap-2 mb-4">
          <button
            type="button"
            (click)="mode = 'login'"
            [class]="mode === 'login' ? 'bg-blue-600 text-white px-3 py-2 rounded-lg font-medium' : 'bg-slate-200 text-slate-700 px-3 py-2 rounded-lg font-medium'"
          >
            Login
          </button>
          <button
            type="button"
            (click)="mode = 'register'"
            [class]="mode === 'register' ? 'bg-blue-600 text-white px-3 py-2 rounded-lg font-medium' : 'bg-slate-200 text-slate-700 px-3 py-2 rounded-lg font-medium'"
          >
            Register
          </button>
        </div>

        <form (ngSubmit)="submit()" class="space-y-4">
          <div>
            <label class="block text-sm text-slate-700 mb-1">Email</label>
            <input
              [(ngModel)]="email"
              name="email"
              type="email"
              required
              class="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label class="block text-sm text-slate-700 mb-1">Password</label>
            <input
              [(ngModel)]="password"
              name="password"
              type="password"
              required
              minlength="8"
              class="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="At least 8 characters"
            />
          </div>

          <p *ngIf="errorMessage" class="text-red-600 text-sm">{{ errorMessage }}</p>

          <button
            type="submit"
            [disabled]="loading || !email.trim() || password.length < 8"
            class="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Please wait...' : (mode === 'login' ? 'Login' : 'Create account') }}
          </button>
        </form>
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
    private readonly router: Router,
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
