import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ThemeService, Theme } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen transition-colors duration-300 bg-light-bg dark:bg-dark-bg text-light-paragraph dark:text-dark-paragraph">
      
      <!-- Header with Theme Toggle -->
      <header class="container mx-auto px-4 py-6">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <span class="text-3xl">📚</span>
            <span class="text-2xl font-bold text-primary dark:text-primary-dark">日本語学習</span>
          </div>
          <button (click)="toggleTheme()"
                  class="text-2xl transition hover:opacity-80"
                  [title]="currentTheme === 'dark' ? 'Light Mode' : 'Dark Mode'">
            {{ currentTheme === 'dark' ? '☀️' : '🌙' }}
          </button>
        </div>
      </header>

      <!-- Hero Section -->
      <div class="container mx-auto px-4 py-20 text-center">
        <h1 class="text-6xl font-bold mb-6 transition-colors text-light-headline dark:text-dark-headline">
          Master Japanese<br>Through Reading
        </h1>
        <p class="text-xl mb-12 max-w-2xl mx-auto transition-colors text-light-paragraph dark:text-dark-paragraph">
          Learn Japanese naturally with context-based reading, spaced repetition flashcards, and focused study tools. Start your N5 journey today.
        </p>
        
        <div class="flex gap-4 justify-center">
          <button (click)="goToAuth('register')"
                  class="bg-light-button dark:bg-dark-button hover:opacity-90 text-white font-bold py-4 px-8 rounded-lg text-lg transition transform hover:scale-105 shadow-lg">
            Get Started Free
          </button>
          <button (click)="goToAuth('login')"
                  class="bg-light-bg dark:bg-dark-bg border-2 border-primary text-light-headline dark:text-dark-headline hover:opacity-80 font-bold py-4 px-8 rounded-lg text-lg transition">
            Sign In
          </button>
        </div>
      </div>

      <!-- Features Section -->
      <div class="container mx-auto px-4 py-16">
        <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          
          <!-- Feature 1 -->
          <div class="p-8 rounded-xl shadow-lg border border-secondary dark:border-success bg-white dark:bg-slate-800 transition-colors">
            <div class="text-5xl mb-4">📖</div>
            <h3 class="text-2xl font-bold mb-3 text-primary dark:text-primary-dark">
              Read Real Content
            </h3>
            <p class="text-light-paragraph dark:text-dark-paragraph transition-colors">
              Practice with authentic Japanese books and stories. Learn vocabulary in context, not isolation.
            </p>
          </div>

          <!-- Feature 2 -->
          <div class="p-8 rounded-xl shadow-lg border border-secondary dark:border-success bg-white dark:bg-slate-800 transition-colors">
            <div class="text-5xl mb-4">🎴</div>
            <h3 class="text-2xl font-bold mb-3 text-primary dark:text-primary-dark">
              Spaced Repetition
            </h3>
            <p class="text-light-paragraph dark:text-dark-paragraph transition-colors">
              Our SRS system schedules reviews at optimal intervals. Remember more with less effort.
            </p>
          </div>

          <!-- Feature 3 -->
          <div class="p-8 rounded-xl shadow-lg border border-secondary dark:border-success bg-white dark:bg-slate-800 transition-colors">
            <div class="text-5xl mb-4">🍅</div>
            <h3 class="text-2xl font-bold mb-3 text-primary dark:text-primary-dark">
              Focused Study
            </h3>
            <p class="text-light-paragraph dark:text-dark-paragraph transition-colors">
              Built-in Pomodoro timer keeps you focused. Track your progress and build study streaks.
            </p>
          </div>

        </div>
      </div>

      <!-- Study Resources Section -->
      <div class="container mx-auto px-4 py-16">
        <div class="max-w-4xl mx-auto p-12 rounded-2xl shadow-xl border border-secondary dark:border-success bg-white dark:bg-slate-800 transition-colors">
          <h2 class="text-4xl font-bold mb-8 text-center text-light-headline dark:text-dark-headline">
            Everything You Need for N5
          </h2>
          
          <div class="grid md:grid-cols-2 gap-6">
            <div class="flex items-start gap-3">
              <span class="text-2xl">📝</span>
              <div>
                <h4 class="font-bold mb-1 text-light-headline dark:text-dark-headline">Vocabulary Builder</h4>
                <p class="text-sm text-light-paragraph dark:text-dark-paragraph">Save words with furigana and example sentences</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <span class="text-2xl">漢字</span>
              <div>
                <h4 class="font-bold mb-1 text-light-headline dark:text-dark-headline">N5 Kanji Grid</h4>
                <p class="text-sm text-light-paragraph dark:text-dark-paragraph">Master all essential kanji with readings and meanings</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <span class="text-2xl">📚</span>
              <div>
                <h4 class="font-bold mb-1 text-light-headline dark:text-dark-headline">Grammar Patterns</h4>
                <p class="text-sm text-light-paragraph dark:text-dark-paragraph">Learn N5 grammar with clear explanations and examples</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <span class="text-2xl">📖</span>
              <div>
                <h4 class="font-bold mb-1 text-light-headline dark:text-dark-headline">Reading Practice</h4>
                <p class="text-sm text-light-paragraph dark:text-dark-paragraph">Click-to-save vocabulary while reading stories</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="container mx-auto px-4 py-20 text-center">
        <h2 class="text-4xl font-bold mb-6 text-light-headline dark:text-dark-headline">
          Ready to Start Learning?
        </h2>
        <p class="text-xl mb-8 text-light-paragraph dark:text-dark-paragraph">
          Join students mastering Japanese through immersive reading.
        </p>
        <button (click)="goToAuth('register')"
                class="bg-light-button dark:bg-dark-button hover:opacity-90 text-white font-bold py-4 px-12 rounded-lg text-lg transition transform hover:scale-105 shadow-lg">
          Create Free Account
        </button>
      </div>

      <!-- Footer -->
      <footer class="py-6 transition-colors duration-300 border-t border-secondary dark:border-success bg-light-bg dark:bg-slate-900 text-light-paragraph dark:text-dark-paragraph">
        <div class="container mx-auto px-4 text-center">
          <p>Learn Japanese through reading • Minimalist • Systematic • Deep Learning</p>
          <p class="text-sm mt-2">Spaced Repetition SRS • N5 Focus • Real Context</p>
        </div>
      </footer>
    </div>
  `,
  styles: []
})
export class HomeComponent implements OnInit {
  currentTheme: Theme = 'light';

  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Redirect if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/books']);
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
