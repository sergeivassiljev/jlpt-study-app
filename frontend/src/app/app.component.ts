import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SrsService } from './core/services/srs.service';
import { VocabularyService } from './core/services/vocabulary.service';
import { ThemeService, Theme } from './core/services/theme.service';
import { AuthService } from './core/services/auth.service';
import { UserService } from './core/services/user.service';
import { PomodoroTimerComponent } from './shared/components/pomodoro-timer/pomodoro-timer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, PomodoroTimerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = '日本語学習';
  dueCount = 0;
  currentTheme: Theme = 'light';
  currentUserEmail: string | null = null;
  currentUserAvatar: string = '👤';
  mobileMenuOpen = false;
  learningDropdownOpen = false;

  constructor(
    private srsService: SrsService,
    private vocabularyService: VocabularyService,
    public themeService: ThemeService,
    private authService: AuthService,
    private userService: UserService,
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

    // Subscribe to avatar changes
    this.userService.avatar$.subscribe(avatar => {
      this.currentUserAvatar = avatar;
    });

    // Initialize user-specific data services when user logs in/out
    this.authService.user$.subscribe((user) => {
      this.currentUserEmail = user?.email ?? null;
      
      if (user) {
        // User logged in - initialize services with user ID
        this.vocabularyService.initializeForUser(user.id);
        this.srsService.initializeForUser(user.id);
        
        // Try to load user profile to get avatar
        this.userService.getUserProfile().subscribe({
          next: (profile) => {
            if (profile.avatar) {
              this.currentUserAvatar = profile.avatar;
            } else {
              // Fallback to localStorage/sessionStorage if profile doesn't have avatar
              let saved = localStorage.getItem(`userAvatar-${user.id}`);
              if (!saved) {
                saved = sessionStorage.getItem(`userAvatar-${user.id}`);
              }
              this.currentUserAvatar = saved || '👤';
            }
          },
          error: () => {
            // Fallback to localStorage/sessionStorage on error
            let saved = localStorage.getItem(`userAvatar-${user.id}`);
            if (!saved) {
              saved = sessionStorage.getItem(`userAvatar-${user.id}`);
            }
            this.currentUserAvatar = saved || '👤';
          }
        });
      } else {
        // User logged out - clear all data
        this.vocabularyService.clearAll();
        this.srsService.clearAll();
        this.currentUserAvatar = '👤';
      }
    });
  }

  ngOnDestroy(): void {
    // Cleanup handled by Angular
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.mobileMenuOpen = false;
    this.authService.logout();
    this.router.navigate(['/']);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
    this.learningDropdownOpen = false;
  }

  toggleLearningDropdown(): void {
    this.learningDropdownOpen = !this.learningDropdownOpen;
  }
}
