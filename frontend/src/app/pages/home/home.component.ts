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
    <div [ngClass]="currentTheme === 'dark' ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'"
         class="min-h-screen transition-colors duration-300">
      
      <!-- Header with Theme Toggle -->
      <header class="container mx-auto px-4 py-6">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <span class="text-3xl">📚</span>
            <span [ngClass]="currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'"
                  class="text-2xl font-bold">日本語学習</span>
          </div>
          <button (click)="toggleTheme()"
                  [ngClass]="currentTheme === 'dark' ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-600 hover:text-gray-800'"
                  class="text-2xl transition"
                  [title]="currentTheme === 'dark' ? 'Light Mode' : 'Dark Mode'">
            {{ currentTheme === 'dark' ? '☀️' : '🌙' }}
          </button>
        </div>
      </header>

      <!-- Hero Section -->
      <div class="container mx-auto px-4 py-20 text-center">
        <h1 [ngClass]="currentTheme === 'dark' ? 'text-slate-100' : 'text-slate-900'"
            class="text-6xl font-bold mb-6 transition-colors">
          Master Japanese<br>Through Reading
        </h1>
        <p [ngClass]="currentTheme === 'dark' ? 'text-slate-300' : 'text-slate-600'"
           class="text-xl mb-12 max-w-2xl mx-auto transition-colors">
          Learn Japanese naturally with context-based reading, spaced repetition flashcards, and focused study tools. Start your N5 journey today.
        </p>
        
        <div class="flex gap-4 justify-center">
          <button (click)="goToAuth('register')"
                  class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition transform hover:scale-105 shadow-lg">
            Get Started Free
          </button>
          <button (click)="goToAuth('login')"
                  [ngClass]="currentTheme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-slate-100' : 'bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-300'"
                  class="font-bold py-4 px-8 rounded-lg text-lg transition">
            Sign In
          </button>
        </div>
      </div>

      <!-- Features Section -->
      <div class="container mx-auto px-4 py-16">
        <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          
          <!-- Feature 1 -->
          <div [ngClass]="currentTheme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'"
               class="p-8 rounded-xl shadow-lg border transition-colors">
            <div class="text-5xl mb-4">📖</div>
            <h3 [ngClass]="currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'"
                class="text-2xl font-bold mb-3">
              Read Real Content
            </h3>
            <p [ngClass]="currentTheme === 'dark' ? 'text-slate-300' : 'text-slate-600'"
               class="transition-colors">
              Practice with authentic Japanese books and stories. Learn vocabulary in context, not isolation.
            </p>
          </div>

          <!-- Feature 2 -->
          <div [ngClass]="currentTheme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'"
               class="p-8 rounded-xl shadow-lg border transition-colors">
            <div class="text-5xl mb-4">🎴</div>
            <h3 [ngClass]="currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'"
                class="text-2xl font-bold mb-3">
              Spaced Repetition
            </h3>
            <p [ngClass]="currentTheme === 'dark' ? 'text-slate-300' : 'text-slate-600'"
               class="transition-colors">
              Our SRS system schedules reviews at optimal intervals. Remember more with less effort.
            </p>
          </div>

          <!-- Feature 3 -->
          <div [ngClass]="currentTheme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'"
               class="p-8 rounded-xl shadow-lg border transition-colors">
            <div class="text-5xl mb-4">🍅</div>
            <h3 [ngClass]="currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'"
                class="text-2xl font-bold mb-3">
              Focused Study
            </h3>
            <p [ngClass]="currentTheme === 'dark' ? 'text-slate-300' : 'text-slate-600'"
               class="transition-colors">
              Built-in Pomodoro timer keeps you focused. Track your progress and build study streaks.
            </p>
          </div>

        </div>
      </div>

      <!-- Study Resources Section -->
      <div class="container mx-auto px-4 py-16">
        <div [ngClass]="currentTheme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'"
             class="max-w-4xl mx-auto p-12 rounded-2xl shadow-xl border transition-colors">
          <h2 [ngClass]="currentTheme === 'dark' ? 'text-slate-100' : 'text-slate-900'"
              class="text-4xl font-bold mb-8 text-center">
            Everything You Need for N5
          </h2>
          
          <div class="grid md:grid-cols-2 gap-6">
            <div class="flex items-start gap-3">
              <span class="text-2xl">📝</span>
              <div>
                <h4 [ngClass]="currentTheme === 'dark' ? 'text-slate-200' : 'text-slate-800'"
                    class="font-bold mb-1">Vocabulary Builder</h4>
                <p [ngClass]="currentTheme === 'dark' ? 'text-slate-400' : 'text-slate-600'"
                   class="text-sm">Save words with furigana and example sentences</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <span class="text-2xl">漢字</span>
              <div>
                <h4 [ngClass]="currentTheme === 'dark' ? 'text-slate-200' : 'text-slate-800'"
                    class="font-bold mb-1">N5 Kanji Grid</h4>
                <p [ngClass]="currentTheme === 'dark' ? 'text-slate-400' : 'text-slate-600'"
                   class="text-sm">Master all essential kanji with readings and meanings</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <span class="text-2xl">📚</span>
              <div>
                <h4 [ngClass]="currentTheme === 'dark' ? 'text-slate-200' : 'text-slate-800'"
                    class="font-bold mb-1">Grammar Patterns</h4>
                <p [ngClass]="currentTheme === 'dark' ? 'text-slate-400' : 'text-slate-600'"
                   class="text-sm">Learn N5 grammar with clear explanations and examples</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <span class="text-2xl">📖</span>
              <div>
                <h4 [ngClass]="currentTheme === 'dark' ? 'text-slate-200' : 'text-slate-800'"
                    class="font-bold mb-1">Reading Practice</h4>
                <p [ngClass]="currentTheme === 'dark' ? 'text-slate-400' : 'text-slate-600'"
                   class="text-sm">Click-to-save vocabulary while reading stories</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="container mx-auto px-4 py-20 text-center">
        <h2 [ngClass]="currentTheme === 'dark' ? 'text-slate-100' : 'text-slate-900'"
            class="text-4xl font-bold mb-6">
          Ready to Start Learning?
        </h2>
        <p [ngClass]="currentTheme === 'dark' ? 'text-slate-300' : 'text-slate-600'"
           class="text-xl mb-8">
          Join students mastering Japanese through immersive reading.
        </p>
        <button (click)="goToAuth('register')"
                class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-12 rounded-lg text-lg transition transform hover:scale-105 shadow-lg">
          Create Free Account
        </button>
      </div>

      <!-- Footer -->
      <footer [ngClass]="currentTheme === 'dark' ? 'bg-slate-900 text-slate-400 border-t border-slate-800' : 'bg-gray-900 text-gray-400'"
              class="py-6 transition-colors duration-300">
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
