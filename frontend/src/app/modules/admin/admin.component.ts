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
    <div class="min-h-screen transition-colors duration-300 bg-light-bg dark:bg-dark-bg text-light-paragraph dark:text-dark-paragraph">
      <div class="max-w-7xl mx-auto px-6 py-12">
        <!-- Header -->
        <div class="mb-12">
          <h1 class="text-5xl font-bold mb-3 transition-colors text-light-headline dark:text-dark-headline">
            Admin Panel
          </h1>
          <p class="text-lg transition-colors text-light-paragraph dark:text-dark-paragraph">
            Manage books, chapters, and content
          </p>
        </div>

        <!-- Tabs -->
        <div class="flex gap-4 mb-8 border-b border-secondary dark:border-success overflow-x-auto">
          <button
            (click)="currentTab = 'manage-books'"
            [class.active]="currentTab === 'manage-books'"
            class="px-6 py-3 font-medium transition-all whitespace-nowrap"
            [ngClass]="{
              'text-primary dark:text-primary-dark border-b-2 border-primary dark:border-primary-dark': currentTab === 'manage-books',
              'text-light-paragraph dark:text-dark-paragraph': currentTab !== 'manage-books'
            }"
          >
            📚 Manage Books
          </button>
          <button
            (click)="currentTab = 'create-book'"
            [class.active]="currentTab === 'create-book'"
            class="px-6 py-3 font-medium transition-all whitespace-nowrap"
            [ngClass]="{
              'text-primary dark:text-primary-dark border-b-2 border-primary dark:border-primary-dark': currentTab === 'create-book',
              'text-light-paragraph dark:text-dark-paragraph': currentTab !== 'create-book'
            }"
          >
            ➕ Create Book
          </button>
          <button
            (click)="currentTab = 'create-chapter'"
            [class.active]="currentTab === 'create-chapter'"
            class="px-6 py-3 font-medium transition-all whitespace-nowrap"
            [ngClass]="{
              'text-primary dark:text-primary-dark border-b-2 border-primary dark:border-primary-dark': currentTab === 'create-chapter',
              'text-light-paragraph dark:text-dark-paragraph': currentTab !== 'create-chapter'
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
        <div class="mt-12 p-6 rounded-lg transition-colors bg-light-bg dark:bg-slate-800 border border-secondary dark:border-success">
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
