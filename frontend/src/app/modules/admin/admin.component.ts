import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookFormComponent } from './book-form.component';
import { ChapterEditorComponent } from './chapter-editor.component';
import { BooksManagementComponent } from './books-management.component';

type AdminTab = 'manage-books' | 'create-book' | 'create-chapter';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, BookFormComponent, ChapterEditorComponent, BooksManagementComponent],
  template: `
    <div class="themed-page min-h-screen transition-colors duration-300 bg-light-bg dark:bg-dark-bg text-light-paragraph dark:text-dark-paragraph">
      <div class="max-w-7xl mx-auto px-6 py-12">
        <!-- Header -->
        <div class="mb-10 rounded-3xl border border-secondary/20 dark:border-success/20 bg-white/90 dark:bg-slate-900/90 p-6 sm:p-8 shadow-md">
          <p class="text-xs uppercase tracking-[0.16em] font-semibold text-secondary dark:text-success">Workspace Control</p>
          <h1 class="text-4xl sm:text-5xl font-bold mt-2 mb-2 transition-colors text-light-headline dark:text-dark-headline">
            Admin Panel
          </h1>
          <p class="text-base sm:text-lg transition-colors text-light-paragraph dark:text-dark-paragraph">
            Manage books, chapters, and content
          </p>
        </div>

        <!-- Tabs -->
        <div class="flex gap-3 mb-8 border-b border-secondary/20 dark:border-success/20 overflow-x-auto pb-2">
          <button
            (click)="currentTab = 'manage-books'"
            [class.active]="currentTab === 'manage-books'"
            class="px-5 py-2.5 font-medium transition-all whitespace-nowrap rounded-full border border-secondary/20 dark:border-success/20"
            [ngClass]="{
              'text-white bg-primary dark:bg-primary-dark border-primary dark:border-primary-dark shadow-sm': currentTab === 'manage-books',
              'text-light-paragraph dark:text-dark-paragraph bg-white dark:bg-slate-900': currentTab !== 'manage-books'
            }"
          >
            📚 Manage Books
          </button>
          <button
            (click)="currentTab = 'create-book'"
            [class.active]="currentTab === 'create-book'"
            class="px-5 py-2.5 font-medium transition-all whitespace-nowrap rounded-full border border-secondary/20 dark:border-success/20"
            [ngClass]="{
              'text-white bg-primary dark:bg-primary-dark border-primary dark:border-primary-dark shadow-sm': currentTab === 'create-book',
              'text-light-paragraph dark:text-dark-paragraph bg-white dark:bg-slate-900': currentTab !== 'create-book'
            }"
          >
            ➕ Create Book
          </button>
          <button
            (click)="currentTab = 'create-chapter'"
            [class.active]="currentTab === 'create-chapter'"
            class="px-5 py-2.5 font-medium transition-all whitespace-nowrap rounded-full border border-secondary/20 dark:border-success/20"
            [ngClass]="{
              'text-white bg-primary dark:bg-primary-dark border-primary dark:border-primary-dark shadow-sm': currentTab === 'create-chapter',
              'text-light-paragraph dark:text-dark-paragraph bg-white dark:bg-slate-900': currentTab !== 'create-chapter'
            }"
          >
            📝 Create Chapter
          </button>
        </div>

        <!-- Content -->
        <div>
          <app-books-management
            *ngIf="currentTab === 'manage-books'"
          ></app-books-management>

          <app-book-form
            *ngIf="currentTab === 'create-book'"
            (bookCreated)="onBookCreated()"
          ></app-book-form>

          <app-chapter-editor
            *ngIf="currentTab === 'create-chapter'"
          ></app-chapter-editor>
        </div>

        <!-- Info Box -->
        <div class="mt-12 p-6 rounded-2xl transition-colors bg-white/95 dark:bg-slate-900/95 border border-secondary/25 dark:border-success/25 shadow-sm">
          <h3 class="font-bold mb-3 transition-colors text-light-headline dark:text-dark-headline">💡 Tips:</h3>
          <ul class="space-y-2 text-sm transition-colors text-light-paragraph dark:text-dark-paragraph">
            <li><strong>Ruby Notation:</strong> Use <code class="bg-light-bg dark:bg-slate-700 px-1.5 py-0.5 rounded">kanji[reading]</code> for furigana</li>
            <li><strong>Example:</strong> <code class="bg-light-bg dark:bg-slate-700 px-1.5 py-0.5 rounded">朝[あさ]が来ました。</code></li>
            <li><strong>Multiple Lines:</strong> Each line becomes a separate paragraph</li>
            <li><strong>Preview:</strong> See rendered content in real-time while editing</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    code {
      font-family: 'Monaco', monospace;
      font-size: 0.875em;
    }
  `]
})
export class AdminComponent {
  currentTab: AdminTab = 'manage-books';

  onBookCreated(): void {
    // Switch to create chapter tab after book creation
    setTimeout(() => {
      this.currentTab = 'create-chapter';
    }, 2500);
  }
}
