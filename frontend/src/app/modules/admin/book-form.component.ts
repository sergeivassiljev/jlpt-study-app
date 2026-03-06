import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface BookForm {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'N5' | 'N4' | 'N3';
  chaptersCount: number;
  coverImage?: string;
}

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-3xl mx-auto rounded-3xl border border-secondary/25 dark:border-success/25 bg-white/95 dark:bg-slate-900/95 p-6 sm:p-8 shadow-md">
      <p class="text-xs uppercase tracking-[0.16em] font-semibold text-secondary dark:text-success mb-2">Create Content</p>
      <h2 class="text-3xl font-bold transition-colors text-light-headline dark:text-dark-headline">Create New Book</h2>
      <p class="mt-2 text-sm transition-colors text-light-paragraph dark:text-dark-paragraph">
        Add a new graded reader and define its metadata before creating chapters.
      </p>

      <form (ngSubmit)="submitBook()" class="mt-6 space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold transition-colors text-light-paragraph dark:text-dark-paragraph mb-1.5">
              Book ID
            </label>
            <input
              type="text"
              [(ngModel)]="form.id"
              name="id"
              class="w-full px-3.5 py-2.5 rounded-xl border transition-colors bg-white dark:bg-slate-800 border-secondary/40 dark:border-success/35 text-light-headline dark:text-dark-headline"
              placeholder="beginner-3"
            />
            <p class="mt-1 text-xs text-light-paragraph/80 dark:text-dark-paragraph/80">Example: beginner-3</p>
          </div>

          <div>
            <label class="block text-sm font-semibold transition-colors text-light-paragraph dark:text-dark-paragraph mb-1.5">
              JLPT Level
            </label>
            <select
              [(ngModel)]="form.level"
              name="level"
              class="w-full px-3.5 py-2.5 rounded-xl border transition-colors bg-white dark:bg-slate-800 border-secondary/40 dark:border-success/35 text-light-headline dark:text-dark-headline"
            >
              <option value="beginner">Beginner</option>
              <option value="N5">N5</option>
              <option value="N4">N4</option>
              <option value="N3">N3</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold transition-colors text-light-paragraph dark:text-dark-paragraph mb-1.5">
            Book Title
          </label>
          <input
            type="text"
            [(ngModel)]="form.title"
            name="title"
            class="w-full px-3.5 py-2.5 rounded-xl border transition-colors bg-white dark:bg-slate-800 border-secondary/40 dark:border-success/35 text-light-headline dark:text-dark-headline"
            placeholder="新しい物語"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold transition-colors text-light-paragraph dark:text-dark-paragraph mb-1.5">
            Description
          </label>
          <textarea
            [(ngModel)]="form.description"
            name="description"
            rows="4"
            class="w-full px-3.5 py-2.5 rounded-xl border transition-colors bg-white dark:bg-slate-800 border-secondary/40 dark:border-success/35 text-light-headline dark:text-dark-headline"
            placeholder="Book description..."
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-semibold transition-colors text-light-paragraph dark:text-dark-paragraph mb-1.5">
            Number of Chapters
          </label>
          <input
            type="number"
            [(ngModel)]="form.chaptersCount"
            name="chaptersCount"
            min="1"
            class="w-full px-3.5 py-2.5 rounded-xl border transition-colors bg-white dark:bg-slate-800 border-secondary/40 dark:border-success/35 text-light-headline dark:text-dark-headline"
          />
        </div>

        <div class="rounded-2xl border border-secondary/30 dark:border-success/25 bg-light-bg/55 dark:bg-slate-800/60 p-4">
          <label class="block text-sm font-semibold transition-colors text-light-paragraph dark:text-dark-paragraph mb-1.5">
            Cover Image
          </label>
          <input
            type="file"
            accept="image/*"
            (change)="onCoverImageSelected($event)"
            class="w-full px-3.5 py-2.5 rounded-xl border transition-colors bg-white dark:bg-slate-900 border-secondary/40 dark:border-success/35 text-light-headline dark:text-dark-headline"
          />

          <div *ngIf="coverImagePreview" class="mt-3 p-3 rounded-xl border border-secondary/35 dark:border-success/30 bg-white dark:bg-slate-900">
            <p class="text-xs mb-2 transition-colors text-light-paragraph dark:text-dark-paragraph">Preview</p>
            <img
              [src]="coverImagePreview"
              alt="Cover preview"
              class="h-44 w-auto object-contain rounded-lg"
            />
            <button
              type="button"
              (click)="removeCoverImage()"
              class="mt-3 px-3 py-1.5 text-sm rounded-lg transition-colors bg-red-600 hover:bg-red-700 text-white"
            >
              Remove Image
            </button>
          </div>
        </div>

        <button
          type="submit"
          [disabled]="isSubmitting"
          class="w-full px-4 py-3 bg-success hover:opacity-90 text-white rounded-xl transition-all font-semibold disabled:opacity-50"
        >
          {{ isSubmitting ? 'Creating...' : 'Create Book' }}
        </button>

        <p *ngIf="successMessage" class="text-sm text-green-600 dark:text-green-400">
          {{ successMessage }}
        </p>
        <p *ngIf="errorMessage" class="text-sm text-red-600 dark:text-red-400">
          {{ errorMessage }}
        </p>
      </form>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class BookFormComponent {
  @Output() bookCreated = new EventEmitter<void>();

  form: BookForm = {
    id: '',
    title: '',
    description: '',
    level: 'beginner',
    chaptersCount: 1
  };

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  coverImagePreview: string | null = null;

  constructor(private http: HttpClient) { }

  onCoverImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Please select a valid image file';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      this.form.coverImage = result;
      this.coverImagePreview = result;
      this.errorMessage = '';
    };
    reader.onerror = () => {
      this.errorMessage = 'Failed to read image file';
    };
    reader.readAsDataURL(file);
  }

  removeCoverImage(): void {
    this.form.coverImage = undefined;
    this.coverImagePreview = null;
  }

  submitBook(): void {
    if (!this.form.id || !this.form.title) {
      this.errorMessage = 'Book ID and Title are required';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http.post('http://localhost:3000/books', this.form).subscribe({
      next: () => {
        this.successMessage = `✅ Book "${this.form.title}" created successfully!`;
        this.bookCreated.emit();
        
        // Reset form
        setTimeout(() => {
          this.form = {
            id: '',
            title: '',
            description: '',
            level: 'beginner',
            chaptersCount: 1
          };
          this.coverImagePreview = null;
          this.successMessage = '';
        }, 2000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to create book';
        console.error('Error:', err);
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }
}
