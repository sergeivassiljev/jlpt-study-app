import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SrsService } from './core/services/srs.service';
import { VocabularyService } from './core/services/vocabulary.service';
import { ThemeService, Theme } from './core/services/theme.service';
import { AuthService } from './core/services/auth.service';
import { PomodoroTimerComponent } from './shared/components/pomodoro-timer/pomodoro-timer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterModule, CommonModule, PomodoroTimerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = '日本語学習';
  dueCount = 0;
  currentTheme: Theme = 'light';
  currentUserEmail: string | null = null;

  constructor(
    private srsService: SrsService,
    private vocabularyService: VocabularyService,
    public themeService: ThemeService,
    private authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    // Update due count when flashcards change
    this.srsService.flashcards$.subscribe(() => {
      this.dueCount = this.srsService.getDueCount();
    });

    // Subscribe to theme changes
    this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });

    // Initialize user-specific data services when user logs in/out
    this.authService.user$.subscribe((user) => {
      this.currentUserEmail = user?.email ?? null;
      
      if (user) {
        // User logged in - initialize services with user ID
        this.vocabularyService.initializeForUser(user.id);
        this.srsService.initializeForUser(user.id);
      } else {
        // User logged out - clear all data
        this.vocabularyService.clearAll();
        this.srsService.clearAll();
      }
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
