import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('./modules/auth/auth.component').then(m => m.AuthComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  
  // Admin
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./modules/admin/admin.component').then(m => m.AdminComponent)
  },
  
  // Profile
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./modules/profile/user-profile.component').then(m => m.UserProfileComponent)
  },
  
  // Books
  {
    path: 'books',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./modules/books/book-list.component').then(m => m.BookListComponent)
  },
  {
    path: 'books/:bookId/:chapterId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./modules/books/book-reader.component').then(m => m.BookReaderComponent)
  },
  
  // Vocabulary
  {
    path: 'vocabulary',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./modules/vocabulary/vocabulary-list.component').then(m => m.VocabularyListComponent)
  },

  // Words
  {
    path: 'words',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./modules/words/words.component').then(m => m.WordsComponent)
  },
  
  // Flashcards (SRS Review)
  {
    path: 'review',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./modules/flashcards/flashcard-review.component').then(m => m.FlashcardReviewComponent)
  },
  
  // Kanji
  {
    path: 'kanji',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./modules/kanji/kanji-grid.component').then(m => m.KanjiGridComponent)
  },
  
  // Grammar
  {
    path: 'grammar',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./modules/grammar/grammar-list.component').then(m => m.GrammarListComponent)
  },
  
  // Kana Learning
  {
    path: 'kana',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./modules/kana/kana.component').then(m => m.KanaComponent)
  },
  {
    path: 'kana/hiragana',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./modules/kana/kana-hiragana.component').then(m => m.KanaHiraganaComponent)
  },
  {
    path: 'kana/katakana',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./modules/kana/kana-katakana.component').then(m => m.KanaKatakanaComponent)
  },
  {
    path: 'kana/typing',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./modules/kana/kana-typing.component').then(m => m.KanaTypingComponent)
  },
  
  // Games
  {
    path: 'games',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./modules/games/kana-ninja/kana-ninja.component').then(m => m.KanaNinjaComponent)
  },
  
  { path: '**', redirectTo: '/dashboard' }
];
