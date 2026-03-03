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
    <div class="max-w-2xl mx-auto p-6 rounded-lg transition-colors bg-white dark:bg-slate-800 border border-secondary dark:border-success">
      <h2 class="text-2xl font-bold mb-6 transition-colors text-light-headline dark:text-dark-headline">Create New Book</h2>

      <form (ngSubmit)="submitBook()" class="space-y-4">
        <!-- Book ID -->
        <div>
          <label class="block text-sm font-semibold transition-colors text-light-paragraph dark:text-dark-paragraph mb-1">
            Book ID (e.g., beginner-3)
          </label>
          <input
            type="text"
            [(ngModel)]="form.id"
            name="id"
            class="w-full px-3 py-2 rounded border transition-colors bg-white dark:bg-slate-700 border-secondary dark:border-success text-light-headline dark:text-dark-headline"
            placeholder="beginner-3"
          />
        </div>

        <!-- Title -->
        <div>
          <label class="block text-sm font-semibold transition-colors text-light-paragraph dark:text-dark-paragraph mb-1">
            Book Title
          </label>
          <input
            type="text"
            [(ngModel)]="form.title"
            name="title"
            class="w-full px-3 py-2 rounded border transition-colors bg-white dark:bg-slate-700 border-secondary dark:border-success text-light-headline dark:text-dark-headline"
            placeholder="新しい物語"
          />
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-semibold transition-colors text-light-paragraph dark:text-dark-paragraph mb-1">
            Description
          </label>
          <textarea
            [(ngModel)]="form.description"
            name="description"
            rows="3"
            class="w-full px-3 py-2 rounded border transition-colors bg-white dark:bg-slate-700 border-secondary dark:border-success text-light-headline dark:text-dark-headline"
            placeholder="Book description..."
          ></textarea>
        </div>

        <!-- Level -->
        <div>
          <label class="block text-sm font-semibold transition-colors text-light-paragraph dark:text-dark-paragraph mb-1">
            JLPT Level
          </label>
          <select
            [(ngModel)]="form.level"
            name="level"
            class="w-full px-3 py-2 rounded border transition-colors bg-white dark:bg-slate-700 border-secondary dark:border-success text-light-headline dark:text-dark-headline"
          >
            <option value="beginner">Beginner</option>
            <option value="N5">N5</option>
            <option value="N4">N4</option>
            <option value="N3">N3</option>
          </select>
        </div>

        <!-- Chapters Count -->
        <div>
          <label class="block text-sm font-semibold transition-colors text-light-paragraph dark:text-dark-paragraph mb-1">
            Number of Chapters
          </label>
          <input
            type="number"
            [(ngModel)]="form.chaptersCount"
            name="chaptersCount"
            min="1"
            class="w-full px-3 py-2 rounded border transition-colors bg-white dark:bg-slate-700 border-secondary dark:border-success text-light-headline dark:text-dark-headline"
          />
        </div>

        <!-- Cover Image -->
        <div>
          <label class="block text-sm font-semibold transition-colors text-light-paragraph dark:text-dark-paragraph mb-1">
            Cover Image
          </label>
          <input
            type="file"
            accept="image/*"
            (change)="onCoverImageSelected($event)"
            class="w-full px-3 py-2 rounded border transition-colors bg-white dark:bg-slate-700 border-secondary dark:border-success text-light-headline dark:text-dark-headline"
          />

          <div *ngIf="coverImagePreview" class="mt-3 p-3 rounded border border-secondary dark:border-success bg-light-bg dark:bg-slate-700">
            <p class="text-xs mb-2 transition-colors text-light-paragraph dark:text-dark-paragraph">Preview</p>
            <img
              [src]="coverImagePreview"
              alt="Cover preview"
              class="h-40 w-auto object-contain rounded"
            />
            <button
              type="button"
              (click)="removeCoverImage()"
              class="mt-3 px-3 py-1 text-sm rounded transition-colors bg-red-600 hover:bg-red-700 text-white"
            >
              Remove Image
            </button>
          </div>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          [disabled]="isSubmitting"
          class="w-full px-4 py-2 bg-success hover:opacity-90 text-white rounded-md transition-all font-medium disabled:opacity-50"
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
  `
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
