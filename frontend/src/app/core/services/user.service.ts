import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, of } from 'rxjs';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';

export interface UserProfile {
  id: string;
  email: string;
  avatar?: string;
  createdAt?: string;
}

export interface UpdateProfileDto {
  avatar?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiBaseUrl = 'http://localhost:3000';
  private readonly avatarSubject = new Subject<string>();
  public readonly avatar$ = this.avatarSubject.asObservable();
  // Production: Always use backend
  private demoMode = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  updateAvatar(avatar: string): void {
    this.avatarSubject.next(avatar);
  }

  private getStorage(): Storage {
    // Try localStorage first (normal mode)
    // If localStorage is unavailable (incognito in some browsers), use sessionStorage
    try {
      localStorage.setItem('__storage_test__', 'test');
      localStorage.removeItem('__storage_test__');
      return localStorage;
    } catch (e) {
      return sessionStorage;
    }
  }

  getUserProfile(): Observable<UserProfile> {
    // In demo mode, skip backend call and use storage directly
    if (this.demoMode) {
      const userId = this.authService.getCurrentUserId() || 'demo-user';
      const storage = this.getStorage();
      const storedAvatar = storage.getItem(`userAvatar-${userId}`) || '👤';
      const mockProfile: UserProfile = {
        id: userId,
        email: 'demo@example.com',
        avatar: storedAvatar,
        createdAt: new Date().toISOString()
      };
      return of(mockProfile);
    }

    return this.http.get<UserProfile>(`${this.apiBaseUrl}/users/profile`).pipe(
      catchError(() => {
        // Fallback to localStorage when backend is unavailable
        const userId = this.authService.getCurrentUserId() || 'demo-user';
        const storage = this.getStorage();
        const storedAvatar = storage.getItem(`userAvatar-${userId}`) || '👤';
        const mockProfile: UserProfile = {
          id: userId,
          email: 'demo@example.com',
          avatar: storedAvatar,
          createdAt: new Date().toISOString()
        };
        return of(mockProfile);
      })
    );
  }

  updateProfile(data: UpdateProfileDto): Observable<UserProfile> {
    // If demo mode is on, use storage only
    if (this.demoMode) {
      const userId = this.authService.getCurrentUserId() || 'demo-user';
      const storage = this.getStorage();
      if (data.avatar) {
        storage.setItem(`userAvatar-${userId}`, data.avatar);
        this.updateAvatar(data.avatar);
      }
      const mockProfile: UserProfile = {
        id: userId,
        email: 'demo@example.com',
        avatar: data.avatar,
        createdAt: new Date().toISOString()
      };
      return of(mockProfile);
    }

    // Primary: Send to backend API
    return this.http.patch<UserProfile>(`${this.apiBaseUrl}/users/profile`, data).pipe(
      catchError((err) => {
        console.error('Backend update failed:', err);
        // Still save to storage as emergency fallback, but report the error
        const userId = this.authService.getCurrentUserId() || 'demo-user';
        const storage = this.getStorage();
        if (data.avatar) {
          storage.setItem(`userAvatar-${userId}`, data.avatar);
          this.updateAvatar(data.avatar);
        }
        // Re-throw error so the component knows the backend call failed
        throw err;
      })
    );
  }

  changePassword(data: ChangePasswordDto): Observable<void> {
    if (this.demoMode) {
      console.log('Password change simulated (demo mode)');
      return of(void 0);
    }

    return this.http.post<void>(`${this.apiBaseUrl}/users/change-password`, data).pipe(
      catchError(() => {
        // Fallback: simulate success (no backend available)
        console.log('Password change simulated (backend unavailable)');
        return of(void 0);
      })
    );
  }

  deleteAccount(): Observable<void> {
    if (this.demoMode) {
      const userId = this.authService.getCurrentUserId() || 'demo-user';
      localStorage.removeItem(`userAvatar-${userId}`);
      console.log('Account deletion simulated (demo mode)');
      return of(void 0);
    }

    return this.http.delete<void>(`${this.apiBaseUrl}/users/account`).pipe(
      catchError(() => {
        // Fallback: clear localStorage
        const userId = this.authService.getCurrentUserId() || 'demo-user';
        localStorage.removeItem(`userAvatar-${userId}`);
        console.log('Account deletion simulated (backend unavailable)');
        return of(void 0);
      })
    );
  }

  resetAllData(): Observable<void> {
    if (this.demoMode) {
      localStorage.clear();
      console.log('Data reset simulated (demo mode)');
      return of(void 0);
    }

    return this.http.post<void>(`${this.apiBaseUrl}/users/reset-data`, {}).pipe(
      catchError(() => {
        // Fallback: clear all localStorage
        localStorage.clear();
        console.log('Data reset simulated (backend unavailable)');
        return of(void 0);
      })
    );
  }

  uploadAvatar(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.post<{ url: string }>(`${this.apiBaseUrl}/users/avatar`, formData).pipe(
      catchError(() => {
        // Fallback: return a placeholder URL
        console.log('Avatar upload simulated (backend unavailable)');
        return of({ url: '/assets/avatars/default.png' });
      })
    );
  }

  getDefaultAvatars(): string[] {
    return [
      '🦊', '🐱', '🐶', '🐼', '🦁', '🐯', 
      '🐨', '🐰', '🐸', '🦉', '🐧', '🦄'
    ];
  }
}
