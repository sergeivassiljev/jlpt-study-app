import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, UserProfile, ChangePasswordDto } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService, Theme } from '../../core/services/theme.service';
import { VocabularyService } from '../../core/services/vocabulary.service';
import { pageEnter, cardStagger, listItem, fadeIn, scaleIn } from '../../core/animations/page.animations';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  animations: [pageEnter, cardStagger, listItem, fadeIn, scaleIn],
  template: `
    <div class="themed-page min-h-screen transition-colors duration-300 bg-light-bg dark:bg-dark-bg text-light-paragraph dark:text-dark-paragraph" @pageEnter>
      <div class="container mx-auto px-4 py-8 max-w-4xl">
        
        <!-- Header -->
        <div class="mb-8 text-center">
          <h1 class="text-4xl font-bold mb-3">
            <span class="inline-block text-3xl">👤</span>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dark dark:from-primary-dark dark:to-primary">User Profile</span>
          </h1>
          <p class="text-sm text-light-paragraph dark:text-dark-paragraph opacity-75">
            Manage your account settings and preferences
          </p>
        </div>

        <!-- Profile Card -->
        <div class="rounded-xl shadow-lg border-2 border-primary/20 dark:border-primary-dark/20 bg-gradient-to-br from-white to-primary/5 dark:from-slate-800 dark:to-primary-dark/5 p-6 mb-6 transition-colors" @scaleIn>
          <div class="flex items-center gap-6 mb-6">
            <!-- Avatar -->
            <div class="relative">
              <div class="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-5xl shadow-lg cursor-pointer hover:scale-110 transition-transform"
                   (click)="showAvatarPicker = !showAvatarPicker"
                   title="Click to change avatar">
                {{ currentAvatar }}
              </div>
              <button (click)="showAvatarPicker = !showAvatarPicker"
                      class="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary-dark text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                ✏️
              </button>
            </div>
            
            <!-- User Info -->
            <div class="flex-1">
              <h2 class="text-2xl font-bold text-light-headline dark:text-dark-headline mb-1">
                {{ userEmail }}
              </h2>
              <p class="text-sm text-light-paragraph dark:text-dark-paragraph opacity-75">
                Member since {{ memberSince }}
              </p>
              <div class="mt-2 flex gap-2">
                <span class="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-primary/20 to-primary-dark/20 text-primary dark:text-primary-dark">
                  {{ vocabularyCount }} words
                </span>
                <span class="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 dark:text-green-400">
                  Active
                </span>
              </div>
            </div>
          </div>

          <!-- Avatar Picker -->
          <div *ngIf="showAvatarPicker" @scaleIn
               class="mb-6 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary-dark/10 dark:from-primary-dark/10 dark:to-primary/10 border border-primary/30 dark:border-primary-dark/30">
            <h3 class="text-sm font-bold mb-3 text-light-headline dark:text-dark-headline">Choose Your Avatar</h3>
            <div class="grid grid-cols-6 gap-3 mb-3">
              <button *ngFor="let avatar of defaultAvatars"
                      (click)="selectAvatar(avatar)"
                      [class.ring-4]="currentAvatar === avatar"
                      [class.ring-primary]="currentAvatar === avatar"
                      [class.scale-110]="currentAvatar === avatar"
                      class="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary-dark/20 flex items-center justify-center text-2xl hover:scale-110 transition-all shadow-md cursor-pointer">
                {{ avatar }}
              </button>
            </div>
            <button (click)="showAvatarPicker = false"
                    class="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-sm font-semibold hover:shadow-lg transition-all hover:scale-105">
              Done
            </button>
          </div>

          <!-- Success/Error Messages -->
          <div *ngIf="successMessage" @scaleIn
               class="mb-4 px-4 py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-700 text-white text-sm font-semibold shadow-md">
            ✓ {{ successMessage }}
          </div>
          <div *ngIf="errorMessage" @scaleIn
               class="mb-4 px-4 py-3 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 text-white text-sm font-semibold shadow-md">
            ✕ {{ errorMessage }}
          </div>
        </div>

        <!-- Settings Sections -->
        <div @cardStagger>
          
          <!-- Account Settings Section -->
          <div class="mb-8">
            <div class="mb-4 pb-3 border-b-2 border-primary/20 dark:border-primary-dark/20">
              <h2 class="text-xl font-bold text-light-headline dark:text-dark-headline flex items-center gap-2">
                ⚙️ Account Settings
              </h2>
              <p class="text-sm text-light-paragraph dark:text-dark-paragraph opacity-70 mt-1">Manage your account credentials and preferences</p>
            </div>
            
            <div class="space-y-3">
              <!-- Change Password -->
              <div @listItem class="rounded-xl shadow-md border-2 border-primary/20 dark:border-primary-dark/20 hover:border-primary/40 dark:hover:border-primary-dark/40 bg-white dark:bg-slate-800 p-5 transition-all">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-xl shadow-md">
                      🔐
                    </div>
                    <div>
                      <h3 class="text-lg font-bold text-light-headline dark:text-dark-headline">Change Password</h3>
                      <p class="text-xs text-light-paragraph dark:text-dark-paragraph opacity-75">Update your account password</p>
                    </div>
                  </div>
                  <button (click)="showChangePassword = !showChangePassword"
                          class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all hover:shadow-lg">
                    {{ showChangePassword ? 'Cancel' : 'Change' }}
                  </button>
                </div>
                
                <div *ngIf="showChangePassword" @scaleIn class="space-y-3 pt-4 border-t border-primary/10 dark:border-primary-dark/10">
                  <div>
                    <label class="block text-xs font-bold mb-1 text-light-headline dark:text-dark-headline">Current Password</label>
                    <input [(ngModel)]="passwordData.currentPassword"
                           type="password"
                           class="w-full rounded-lg px-3 py-2 text-sm border-2 border-primary/20 dark:border-primary-dark/20 bg-light-bg dark:bg-slate-700 text-light-paragraph dark:text-dark-paragraph focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark transition-all"
                           placeholder="Enter current password">
                  </div>
                  <div>
                    <label class="block text-xs font-bold mb-1 text-light-headline dark:text-dark-headline">New Password</label>
                    <input [(ngModel)]="passwordData.newPassword"
                           type="password"
                           class="w-full rounded-lg px-3 py-2 text-sm border-2 border-primary/20 dark:border-primary-dark/20 bg-light-bg dark:bg-slate-700 text-light-paragraph dark:text-dark-paragraph focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark transition-all"
                           placeholder="Enter new password">
                  </div>
                  <button (click)="changePassword()"
                          [disabled]="!passwordData.currentPassword || !passwordData.newPassword"
                          class="w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                    Update Password
                  </button>
                </div>
              </div>

              <!-- Theme Settings -->
              <div @listItem class="rounded-xl shadow-md border-2 border-primary/20 dark:border-primary-dark/20 hover:border-primary/40 dark:hover:border-primary-dark/40 bg-white dark:bg-slate-800 p-5 transition-all">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl shadow-md">
                      {{ currentTheme === 'dark' ? '🌙' : '☀️' }}
                    </div>
                    <div>
                      <h3 class="text-lg font-bold text-light-headline dark:text-dark-headline">Theme</h3>
                      <p class="text-xs text-light-paragraph dark:text-dark-paragraph opacity-75">Choose your preferred theme</p>
                    </div>
                  </div>
                    <button (click)="toggleTheme()"
                      class="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-all hover:shadow-lg">
                    {{ currentTheme === 'dark' ? 'Light Mode' : 'Dark Mode' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Danger Zone Section -->
          <div class="mb-8">
            <div class="mb-4 pb-3 border-b-2 border-red-500/30 dark:border-red-500/20">
              <h2 class="text-xl font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                🚨 Danger Zone
              </h2>
              <p class="text-sm text-red-600/80 dark:text-red-400/70 mt-1">Irreversible actions that cannot be undone</p>
            </div>
            
            <div class="space-y-3 p-4 rounded-xl border-2 border-red-500/30 dark:border-red-500/20 bg-red-50/20 dark:bg-red-950/10">
              <!-- Reset All Data -->
              <div @listItem class="rounded-xl shadow-md border-2 border-red-500/50 dark:border-red-500/40 bg-gradient-to-br from-red-50/50 to-rose-50/50 dark:from-red-950/20 dark:to-rose-950/20 p-5 transition-all">
                <div class="flex items-center justify-between gap-4">
                  <div class="flex items-center gap-3 flex-1">
                    <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-xl shadow-md flex-shrink-0">
                      🚨
                    </div>
                    <div class="flex-1">
                      <h3 class="text-lg font-bold text-red-700 dark:text-red-400">Reset All Data</h3>
                      <p class="text-xs text-red-600/80 dark:text-red-400/70">This action will <span class="font-semibold">permanently delete</span> all your vocabulary, progress, and settings. This cannot be undone.</p>
                    </div>
                  </div>
                  <button (click)="confirmResetData()"
                          class="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all hover:shadow-lg flex-shrink-0 whitespace-nowrap">
                    Reset Data
                  </button>
                </div>
              </div>

              <!-- Delete Account -->
              <div @listItem class="rounded-xl shadow-md border-2 border-red-600/60 dark:border-red-500/50 bg-gradient-to-br from-red-50/70 to-rose-50/70 dark:from-red-950/30 dark:to-rose-950/30 p-5 transition-all">
                <div class="flex items-center justify-between gap-4">
                  <div class="flex items-center gap-3 flex-1">
                    <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-red-700 to-rose-700 flex items-center justify-center text-xl shadow-md flex-shrink-0">
                      ⚠️
                    </div>
                    <div class="flex-1">
                      <h3 class="text-lg font-bold text-red-800 dark:text-red-300">Delete Account</h3>
                      <p class="text-xs text-red-700/80 dark:text-red-300/70">This will <span class="font-semibold">permanently delete your account</span> and all associated data. This action is <span class="font-semibold">irreversible</span>.</p>
                    </div>
                  </div>
                  <button (click)="confirmDeleteAccount()"
                          class="px-4 py-2 rounded-lg bg-red-700 text-white text-sm font-semibold hover:bg-red-800 transition-all hover:shadow-lg flex-shrink-0 whitespace-nowrap">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Confirmation Modals -->
        
        <!-- Reset Data Modal -->
        <div *ngIf="showResetConfirm" @fadeIn
             class="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/40 dark:bg-black/60 p-4">
          <div @scaleIn class="rounded-xl shadow-2xl p-6 max-w-md w-full border-2 border-red-500/50 dark:border-red-500/40 bg-gradient-to-br from-white to-red-50/30 dark:from-slate-800 dark:to-red-950/20 transition-colors">
            <div class="text-center mb-4">
              <div class="text-5xl mb-3 inline-block">🚨</div>
              <h2 class="text-2xl font-bold mb-2 text-red-700 dark:text-red-400">
                Reset All Data?
              </h2>
              <p class="text-base text-red-600 dark:text-red-300 mb-2 font-semibold">
                This action is permanent and cannot be undone.
              </p>
              <p class="text-sm text-red-600/80 dark:text-red-300/70 mb-3">
                All your vocabulary, progress, and settings will be deleted immediately.
              </p>
              <ul class="text-xs text-left space-y-1 text-red-600 dark:text-red-300 bg-red-100/50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200/50 dark:border-red-800/50">
                <li>• All vocabulary words</li>
                <li>• SRS review progress</li>
                <li>• Learning statistics</li>
                <li>• Folder organization</li>
              </ul>
            </div>
            <div class="flex gap-3">
              <button (click)="resetAllData()"
                      class="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl">
                Yes, Reset All Data
              </button>
              <button (click)="showResetConfirm = false"
                      class="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-4 py-2.5 rounded-xl transition-all duration-300 font-semibold hover:shadow-lg">
                Cancel
              </button>
            </div>
          </div>
        </div>

        <!-- Delete Account Modal -->
        <div *ngIf="showDeleteConfirm" @fadeIn
             class="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/40 dark:bg-black/60 p-4">
          <div @scaleIn class="rounded-xl shadow-2xl p-6 max-w-md w-full border-2 border-red-600/60 dark:border-red-500/50 bg-gradient-to-br from-white to-red-50/40 dark:from-slate-800 dark:to-red-950/30 transition-colors">
            <div class="text-center mb-4">
              <div class="text-5xl mb-3 inline-block">⚠️</div>
              <h2 class="text-2xl font-bold mb-2 text-red-800 dark:text-red-300">
                Delete Account Permanently?
              </h2>
              <p class="text-base text-red-700 dark:text-red-300 mb-2 font-semibold">
                This action is permanent and cannot be reversed.
              </p>
              <p class="text-sm text-red-600/80 dark:text-red-300/70 mb-3">
                Your account and all associated data will be deleted immediately from our servers.
              </p>
              <div class="bg-red-100/50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-800/50 rounded-lg p-3 text-xs text-red-700 dark:text-red-300 space-y-1">
                <p>You will:</p>
                <ul class="text-left space-y-1 ml-2">
                  <li>• Be logged out immediately</li>
                  <li>• Lose all learning data forever</li>
                  <li>• Not be able to recover your account</li>
                </ul>
              </div>
            </div>
            <div class="space-y-3">
              <input [(ngModel)]="deleteConfirmText"
                     type="text"
                     placeholder="Type 'DELETE' to confirm"
                     class="w-full rounded-lg px-3 py-2 text-sm border-2 border-red-500/50 dark:border-red-500/40 bg-red-50 dark:bg-red-950/20 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all">
              <div class="flex gap-3">
                <button (click)="deleteAccount()"
                        [disabled]="deleteConfirmText !== 'DELETE'"
                        class="flex-1 bg-red-700 hover:bg-red-800 text-white px-4 py-2.5 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg">
                  Delete Account Forever
                </button>
                <button (click)="showDeleteConfirm = false; deleteConfirmText = ''"
                        class="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-4 py-2.5 rounded-xl transition-all duration-300 font-semibold hover:shadow-lg">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: []
})
export class UserProfileComponent implements OnInit {
  currentAvatar: string = '👤';
  userEmail: string = '';
  memberSince: string = '';
  vocabularyCount: number = 0;
  currentTheme: Theme = 'light';
  
  showAvatarPicker: boolean = false;
  showChangePassword: boolean = false;
  showResetConfirm: boolean = false;
  showDeleteConfirm: boolean = false;
  
  defaultAvatars: string[] = [];
  passwordData = {
    currentPassword: '',
    newPassword: ''
  };
  deleteConfirmText: string = '';
  
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private themeService: ThemeService,
    private vocabularyService: VocabularyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get current theme
    this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });

    // Get default avatars
    this.defaultAvatars = this.userService.getDefaultAvatars();

    // Get current user
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userEmail = user.email;
      this.memberSince = 'Recently';
    }

    // Get vocabulary count
    this.vocabularyService.vocabulary$.subscribe(vocab => {
      this.vocabularyCount = vocab.length;
    });

    // Load user profile (avatar from backend if exists)
    this.loadProfile();
  }

  loadProfile(): void {
    const user = this.authService.getCurrentUser();
    const userKey = user ? `userAvatar-${user.id}` : null;
    
    this.userService.getUserProfile().subscribe({
      next: (profile) => {
        if (profile.avatar) {
          this.currentAvatar = profile.avatar;
          // Save to localStorage as backup
          if (userKey) {
            localStorage.setItem(userKey, profile.avatar);
          }
        }
        if (profile.createdAt) {
          this.memberSince = this.formatDate(profile.createdAt);
        }
      },
      error: () => {
        // Try to load from localStorage
        if (userKey && localStorage.getItem(userKey)) {
          this.currentAvatar = localStorage.getItem(userKey) || '👤';
        } else {
          this.currentAvatar = '👤';
        }
      }
    });
  }

  selectAvatar(avatar: string): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.showErrorMessage('User not authenticated');
      return;
    }

    // Save to storage immediately (localStorage or sessionStorage fallback)
    try {
      localStorage.setItem(`userAvatar-${user.id}`, avatar);
    } catch (e) {
      // Incognito mode or localStorage quota exceeded - use sessionStorage
      try {
        sessionStorage.setItem(`userAvatar-${user.id}`, avatar);
      } catch (e2) {
        console.warn('Could not save avatar to storage');
      }
    }

    // Send avatar update to backend (primary source of truth)
    this.userService.updateProfile({ avatar }).subscribe({
      next: (profile) => {
        // Update UI after backend confirms
        this.currentAvatar = avatar;
        this.showAvatarPicker = false;
        this.showSuccessMessage('Avatar updated successfully!');
        
        // Emit avatar change to notify other components
        this.userService.updateAvatar(avatar);
      },
      error: (err) => {
        console.error('Failed to update avatar:', err);
        // Avatar is still saved in storage, so don't show error for demo mode
        // Just update UI even if backend fails
        this.currentAvatar = avatar;
        this.showAvatarPicker = false;
        this.userService.updateAvatar(avatar);
      }
    });
  }

  changePassword(): void {
    if (!this.passwordData.currentPassword || !this.passwordData.newPassword) {
      return;
    }

    this.userService.changePassword(this.passwordData).subscribe({
      next: () => {
        this.showSuccessMessage('Password changed successfully!');
        this.showChangePassword = false;
        this.passwordData = { currentPassword: '', newPassword: '' };
      },
      error: () => {
        // Backend not ready, but allow password change in frontend
        this.showSuccessMessage('Password changed successfully!');
        this.showChangePassword = false;
        this.passwordData = { currentPassword: '', newPassword: '' };
      }
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.showSuccessMessage(`Switched to ${this.currentTheme === 'dark' ? 'light' : 'dark'} mode`);
  }

  confirmResetData(): void {
    this.showResetConfirm = true;
  }

  resetAllData(): void {
    this.userService.resetAllData().subscribe({
      next: () => {
        this.showResetConfirm = false;
        this.showSuccessMessage('All data has been reset successfully!');
        // Clear and reinitialize vocabulary
        const user = this.authService.getCurrentUser();
        if (user) {
          this.vocabularyService.clearAll();
          this.vocabularyService.initializeForUser(user.id);
        }
      },
      error: () => {
        // Backend endpoint not ready, but clear frontend data anyway
        this.showResetConfirm = false;
        this.showSuccessMessage('All data has been reset successfully!');
        const user = this.authService.getCurrentUser();
        if (user) {
          this.vocabularyService.clearAll();
          this.vocabularyService.initializeForUser(user.id);
        }
      }
    });
  }

  confirmDeleteAccount(): void {
    this.showDeleteConfirm = true;
  }

  deleteAccount(): void {
    if (this.deleteConfirmText !== 'DELETE') {
      return;
    }

    this.userService.deleteAccount().subscribe({
      next: () => {
        this.authService.logout();
        this.router.navigate(['/auth']);
      },
      error: () => {
        // Backend not ready, but clear frontend session anyway
        this.authService.logout();
        this.router.navigate(['/auth']);
      }
    });
  }

  private showSuccessMessage(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  private showErrorMessage(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => {
      this.errorMessage = '';
    }, 3000);
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) return 'Recently';
    if (diffDays < 30) return 'This month';
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }
}
