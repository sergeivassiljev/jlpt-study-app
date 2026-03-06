import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../core/services/book.service';
import { Book } from '../../core/models';

@Component({
  selector: 'app-books-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-5xl mx-auto rounded-3xl transition-colors bg-white/95 dark:bg-slate-900/95 border border-secondary/25 dark:border-success/25 p-6 sm:p-7 shadow-md">
      <p class="text-xs uppercase tracking-[0.16em] font-semibold text-secondary dark:text-success mb-2">Content Library</p>
      <h2 class="text-3xl font-bold transition-colors text-light-headline dark:text-dark-headline">
        Manage Books
      </h2>
      <p class="mt-2 text-sm transition-colors text-light-paragraph dark:text-dark-paragraph">
        Edit metadata, update covers, and remove obsolete books with full control.
      </p>

      <div class="mt-5 mb-6 flex flex-wrap gap-2">
        <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-light-bg/70 dark:bg-slate-800 text-sm text-light-headline dark:text-dark-headline border border-secondary/25 dark:border-success/20">
          <strong>{{ books.length }}</strong> books
        </span>
      </div>

      <div *ngIf="books.length === 0" class="text-center py-12 rounded-2xl border border-dashed border-secondary/35 dark:border-success/30 bg-light-bg/60 dark:bg-slate-800/60 transition-colors text-light-paragraph dark:text-dark-paragraph">
        <p class="font-medium">No books found</p>
        <p class="mt-1 text-sm opacity-80">Create your first book from the Create Book tab.</p>
      </div>

      <div *ngIf="books.length > 0" class="space-y-3">
        <div
          *ngFor="let book of books"
          class="p-4 sm:p-5 rounded-2xl border transition-colors bg-light-bg/70 dark:bg-slate-800 border-secondary/30 dark:border-success/25 hover:border-primary/45"
        >
          <div class="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div class="flex-1">
              <h3 class="text-xl font-bold transition-colors text-light-headline dark:text-dark-headline">
                {{ book.title }}
              </h3>
              <p class="text-sm mt-1 transition-colors text-light-paragraph dark:text-dark-paragraph">
                {{ book.description }}
              </p>
              <p class="text-xs transition-colors text-light-paragraph dark:text-dark-paragraph opacity-80 mt-2">
                <span class="font-semibold">{{ book.level }}</span>
                <span class="mx-1">•</span>
                {{ getChapterCount(book.id) }} chapters
              </p>
            </div>

            <div class="flex gap-2 md:ml-4">
              <button
                (click)="toggleEdit(book)"
                class="px-4 py-2 text-sm font-semibold rounded-lg transition-colors bg-primary hover:opacity-90 text-white"
              >
                {{ editingBookId === book.id ? 'Close' : 'Edit' }}
              </button>
              <button
                (click)="confirmDelete(book.id, book.title)"
                class="px-4 py-2 text-sm font-semibold rounded-lg transition-colors bg-red-600 hover:bg-red-700 text-white"
              >
                🗑️ Delete
              </button>
            </div>
          </div>

          <div
            *ngIf="editingBookId === book.id"
            class="mt-4 pt-4 border-t border-secondary/30 dark:border-success/25"
          >
            <h4 class="font-semibold mb-4 transition-colors text-light-headline dark:text-dark-headline">
              Edit Book
            </h4>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div class="md:col-span-2">
                <label class="block text-sm mb-1.5 transition-colors text-light-paragraph dark:text-dark-paragraph">Title</label>
                <input
                  type="text"
                  [(ngModel)]="editingBook!.title"
                  class="w-full px-3.5 py-2.5 rounded-xl border transition-colors bg-white dark:bg-slate-900 border-secondary/40 dark:border-success/35 text-light-headline dark:text-dark-headline"
                />
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm mb-1.5 transition-colors text-light-paragraph dark:text-dark-paragraph">Description</label>
                <textarea
                  rows="3"
                  [(ngModel)]="editingBook!.description"
                  class="w-full px-3.5 py-2.5 rounded-xl border transition-colors bg-white dark:bg-slate-900 border-secondary/40 dark:border-success/35 text-light-headline dark:text-dark-headline"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm mb-1.5 transition-colors text-light-paragraph dark:text-dark-paragraph">Level</label>
                <select
                  [(ngModel)]="editingBook!.level"
                  class="w-full px-3.5 py-2.5 rounded-xl border transition-colors bg-white dark:bg-slate-900 border-secondary/40 dark:border-success/35 text-light-headline dark:text-dark-headline"
                >
                  <option value="beginner">Beginner</option>
                  <option value="N5">N5</option>
                  <option value="N4">N4</option>
                  <option value="N3">N3</option>
                </select>
              </div>

              <div>
                <label class="block text-sm mb-1.5 transition-colors text-light-paragraph dark:text-dark-paragraph">Chapters Count</label>
                <input
                  type="number"
                  min="0"
                  [(ngModel)]="editingBook!.chaptersCount"
                  class="w-full px-3.5 py-2.5 rounded-xl border transition-colors bg-white dark:bg-slate-900 border-secondary/40 dark:border-success/35 text-light-headline dark:text-dark-headline"
                />
              </div>
            </div>

            <div class="mt-4 rounded-2xl border border-secondary/30 dark:border-success/25 bg-white/70 dark:bg-slate-900/60 p-4">
              <label class="block text-sm font-semibold transition-colors text-light-paragraph dark:text-dark-paragraph mb-2">
                Cover Image
              </label>

              <div class="mb-3 p-3 rounded-xl border border-secondary/35 dark:border-success/30 bg-white dark:bg-slate-900 w-fit">
                <img
                  *ngIf="editingBook?.coverImage"
                  [src]="editingBook!.coverImage"
                  [alt]="editingBook!.title"
                  class="h-28 w-auto object-contain rounded"
                />
                <div
                  *ngIf="!editingBook?.coverImage"
                  class="h-28 w-24 flex items-center justify-center text-3xl"
                >
                  📚
                </div>
              </div>

              <input
                type="file"
                accept="image/*"
                (change)="onCoverImageSelected($event)"
                class="w-full md:w-auto px-3.5 py-2.5 rounded-xl border transition-colors bg-white dark:bg-slate-900 border-secondary/40 dark:border-success/35 text-light-headline dark:text-dark-headline"
              />

              <div class="mt-3 flex flex-wrap gap-2">
                <button
                  (click)="removeCoverImage()"
                  class="px-3 py-1.5 text-sm rounded-lg transition-colors bg-red-600 hover:bg-red-700 text-white"
                >
                  Remove Cover
                </button>
              </div>
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
              <button
                (click)="saveBookChanges()"
                [disabled]="isSavingBook"
                class="px-4 py-2 text-sm font-semibold rounded-lg transition-colors bg-success hover:opacity-90 disabled:opacity-50 text-white"
              >
                {{ isSavingBook ? '🔄 Saving...' : '💾 Save Changes' }}
              </button>
              <button
                (click)="cancelEdit()"
                [disabled]="isSavingBook"
                class="px-4 py-2 text-sm font-semibold rounded-lg transition-colors bg-light-bg dark:bg-slate-800 border border-secondary/35 dark:border-success/30 text-light-paragraph dark:text-dark-paragraph"
              >
                Cancel
              </button>
            </div>

            <p *ngIf="editErrorMessage" class="mt-2 text-sm text-red-600">
              ❌ {{ editErrorMessage }}
            </p>
            <p *ngIf="editSuccessMessage" class="mt-2 text-sm text-green-600">
              ✅ {{ editSuccessMessage }}
            </p>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div
        *ngIf="showDeleteConfirm"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      >
        <div class="bg-white/95 dark:bg-slate-900/95 rounded-2xl p-6 max-w-sm w-full border border-secondary/30 dark:border-success/25 shadow-xl">
          <p class="mb-6 transition-colors text-light-headline dark:text-dark-headline">
            Delete <strong>{{ deleteBookTitle }}</strong> and all its chapters? This cannot be undone.
          </p>
          <div class="flex gap-3 justify-end">
            <button
              (click)="cancelDelete()"
              class="px-4 py-2 rounded-lg transition-colors bg-light-bg dark:bg-slate-800 hover:bg-opacity-80 font-semibold text-light-paragraph dark:text-dark-paragraph"
            >
              Cancel
            </button>
            <button
              (click)="deleteBook()"
              [disabled]="isDeleting"
              class="px-4 py-2 rounded-lg transition-colors bg-red-600 hover:bg-red-700 disabled:opacity-50 font-semibold text-white"
            >
              {{ isDeleting ? '🔄 Deleting...' : '🗑️ Delete' }}
            </button>
          </div>

          <p *ngIf="deleteErrorMessage" class="mt-4 text-red-600 text-sm">
            ❌ {{ deleteErrorMessage }}
          </p>
          <p *ngIf="deleteSuccessMessage" class="mt-4 text-green-600 text-sm">
            ✅ {{ deleteSuccessMessage }}
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class BooksManagementComponent implements OnInit {
  books: Book[] = [];
  showDeleteConfirm = false;
  deleteBookId: string | null = null;
  deleteBookTitle: string = '';
  isDeleting = false;
  deleteErrorMessage = '';
  deleteSuccessMessage = '';
  editingBookId: string | null = null;
  editingBook: Book | null = null;
  isSavingBook = false;
  editErrorMessage = '';
  editSuccessMessage = '';

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.bookService.getBooks().subscribe(books => {
      this.books = books;
    });
  }

  toggleEdit(book: Book): void {
    if (this.editingBookId === book.id) {
      this.cancelEdit();
      return;
    }

    this.editingBookId = book.id;
    this.editingBook = { ...book };
    this.editErrorMessage = '';
    this.editSuccessMessage = '';
  }

  onCoverImageSelected(event: Event): void {
    if (!this.editingBook) {
      return;
    }

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.editErrorMessage = 'Please select a valid image file';
      this.editSuccessMessage = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (this.editingBook) {
        this.editingBook.coverImage = reader.result as string;
      }
      this.editErrorMessage = '';
      this.editSuccessMessage = '';
    };
    reader.onerror = () => {
      this.editErrorMessage = 'Failed to read image file';
      this.editSuccessMessage = '';
    };
    reader.readAsDataURL(file);
  }

  removeCoverImage(): void {
    if (!this.editingBook) {
      return;
    }

    this.editingBook.coverImage = undefined;
    this.editErrorMessage = '';
    this.editSuccessMessage = '';
  }

  saveBookChanges(): void {
    if (!this.editingBook) {
      return;
    }

    if (!this.editingBook.title || !this.editingBook.id) {
      this.editErrorMessage = 'Book title is required';
      this.editSuccessMessage = '';
      return;
    }

    this.isSavingBook = true;
    this.editErrorMessage = '';
    this.editSuccessMessage = '';

    this.bookService.upsertBook(this.editingBook).subscribe({
      next: () => {
        this.editSuccessMessage = 'Book updated successfully';
        this.isSavingBook = false;
        setTimeout(() => {
          this.cancelEdit();
        }, 1200);
      },
      error: (err) => {
        this.editErrorMessage = err.error?.message || 'Failed to update book';
        this.editSuccessMessage = '';
        this.isSavingBook = false;
      }
    });
  }

  cancelEdit(): void {
    this.editingBookId = null;
    this.editingBook = null;
    this.editErrorMessage = '';
    this.editSuccessMessage = '';
    this.isSavingBook = false;
  }

  getChapterCount(bookId: string): number {
    return this.bookService.getChapters(bookId).length;
  }

  confirmDelete(bookId: string, bookTitle: string): void {
    this.deleteBookId = bookId;
    this.deleteBookTitle = bookTitle;
    this.showDeleteConfirm = true;
    this.deleteErrorMessage = '';
    this.deleteSuccessMessage = '';
  }

  deleteBook(): void {
    if (!this.deleteBookId) return;

    this.isDeleting = true;
    const bookId = this.deleteBookId;

    this.bookService.deleteBook(bookId).subscribe({
      next: () => {
        this.deleteSuccessMessage = `${this.deleteBookTitle} deleted successfully`;
        setTimeout(() => {
          this.showDeleteConfirm = false;
          this.isDeleting = false;
          this.deleteBookId = null;
          this.deleteBookTitle = '';
          this.deleteSuccessMessage = '';
        }, 1500);
      },
      error: (err) => {
        this.isDeleting = false;
        this.deleteErrorMessage = err.message || 'Failed to delete book';
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deleteBookId = null;
    this.deleteBookTitle = '';
    this.deleteErrorMessage = '';
    this.deleteSuccessMessage = '';
    this.isDeleting = false;
  }
}
