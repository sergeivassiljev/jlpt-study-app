import { Routes } from '@angular/router';
import { BookListComponent } from './modules/books/book-list.component';
import { BookReaderComponent } from './modules/books/book-reader.component';
import { VocabularyListComponent } from './modules/vocabulary/vocabulary-list.component';
import { FlashcardReviewComponent } from './modules/flashcards/flashcard-review.component';
import { KanjiGridComponent } from './modules/kanji/kanji-grid.component';
import { GrammarListComponent } from './modules/grammar/grammar-list.component';
import { AuthComponent } from './modules/auth/auth.component';
import { WordsComponent } from './modules/words/words.component';
import { KanaComponent } from './modules/kana/kana.component';
import { KanaHiraganaComponent } from './modules/kana/kana-hiragana.component';
import { KanaKatakanaComponent } from './modules/kana/kana-katakana.component';
import { KanaTypingComponent } from './modules/kana/kana-typing.component';
import { HomeComponent } from './pages/home/home.component';
import { AdminComponent } from './modules/admin/admin.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'auth', component: AuthComponent },
  
  // Admin
  { path: 'admin', component: AdminComponent, canActivate: [authGuard] },
  
  // Books
  { path: 'books', component: BookListComponent, canActivate: [authGuard] },
  { path: 'books/:bookId/:chapterId', component: BookReaderComponent, canActivate: [authGuard] },
  
  // Vocabulary
  { path: 'vocabulary', component: VocabularyListComponent, canActivate: [authGuard] },

  // Words
  { path: 'words', component: WordsComponent, canActivate: [authGuard] },
  
  // Flashcards (SRS Review)
  { path: 'review', component: FlashcardReviewComponent, canActivate: [authGuard] },
  
  // Kanji
  { path: 'kanji', component: KanjiGridComponent, canActivate: [authGuard] },
  
  // Grammar
  { path: 'grammar', component: GrammarListComponent, canActivate: [authGuard] },
  
  // Kana Learning
  { path: 'kana', component: KanaComponent, canActivate: [authGuard] },
  { path: 'kana/hiragana', component: KanaHiraganaComponent, canActivate: [authGuard] },
  { path: 'kana/katakana', component: KanaKatakanaComponent, canActivate: [authGuard] },
  { path: 'kana/typing', component: KanaTypingComponent, canActivate: [authGuard] },
  
  { path: '**', redirectTo: '/books' }
];
