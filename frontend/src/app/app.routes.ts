import { Routes } from '@angular/router';
import { BookListComponent } from './modules/books/book-list.component';
import { BookReaderComponent } from './modules/books/book-reader.component';
import { VocabularyListComponent } from './modules/vocabulary/vocabulary-list.component';
import { FlashcardReviewComponent } from './modules/flashcards/flashcard-review.component';
import { KanjiGridComponent } from './modules/kanji/kanji-grid.component';
import { GrammarListComponent } from './modules/grammar/grammar-list.component';

export const routes: Routes = [
  { path: '', redirectTo: '/books', pathMatch: 'full' },
  
  // Books
  { path: 'books', component: BookListComponent },
  { path: 'books/:bookId/:chapterId', component: BookReaderComponent },
  
  // Vocabulary
  { path: 'vocabulary', component: VocabularyListComponent },
  
  // Flashcards (SRS Review)
  { path: 'review', component: FlashcardReviewComponent },
  
  // Kanji
  { path: 'kanji', component: KanjiGridComponent },
  
  // Grammar
  { path: 'grammar', component: GrammarListComponent },
  
  { path: '**', redirectTo: '/books' }
];
