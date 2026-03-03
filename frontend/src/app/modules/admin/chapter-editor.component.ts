import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RubyConverterService } from '../../core/services/ruby-converter.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface ChapterForm {
  id: string;
  number: number;
  title: string;
  textContent: string; // Raw text with [ruby] notation
}

@Component({
  selector: 'app-chapter-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto p-6">
      <h2 class="text-2xl font-bold mb-6 transition-colors text-light-headline dark:text-dark-headline">Create New Chapter</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Editor Form -->
        <div class="rounded-lg transition-colors bg-white dark:bg-slate-800 border border-secondary dark:border-success p-6">
          <form (ngSubmit)="submitChapter()" class="space-y-4">
            <!-- Book ID -->
            <div>
              <label class="block text-sm font-semibold transition-colors text-light-paragraph dark:text-dark-paragraph mb-1">
                Book ID
              </label>
              <input
                type="text"
                [(ngModel)]="bookId"
                name="bookId"
                class="w-full px-3 py-2 rounded border transition-colors bg-white dark:bg-slate-700 border-secondary dark:border-success text-light-headline dark:text-dark-headline"
                placeholder="beginner-2"
              />
            </div>

            <!-- Chapter ID -->
            <div>
              <label class="block text-sm font-semibold transition-colors text-light-paragraph dark:text-dark-paragraph mb-1">
                Chapter ID
              </label>
              <input
                type="text"
                [(ngModel)]="form.id"
                name="id"
                class="w-full px-3 py-2 rounded border transition-colors bg-white dark:bg-slate-700 border-secondary dark:border-success text-light-headline dark:text-dark-headline"
                placeholder="ch-b2-1"
              />
            </div>

            <!-- Chapter Number -->
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-sm font-semibold transition-colors text-light-paragraph dark:text-dark-paragraph mb-1">
                  Number
                </label>
                <input
                  type="number"
                  [(ngModel)]="form.number"
                  name="number"
                  min="1"
                  class="w-full px-3 py-2 rounded border transition-colors bg-white dark:bg-slate-700 border-secondary dark:border-success text-light-headline dark:text-dark-headline"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold transition-colors text-light-paragraph dark:text-dark-paragraph mb-1">
                  Title
                </label>
                <input
                  type="text"
                  [(ngModel)]="form.title"
                  name="title"
                  class="w-full px-3 py-2 rounded border transition-colors bg-white dark:bg-slate-700 border-secondary dark:border-success text-light-headline dark:text-dark-headline"
                  placeholder="Chapter Title"
                />
              </div>
            </div>

            <!-- Text Content with Ruby Notation -->
            <div>
              <label class="block text-sm font-semibold transition-colors text-light-paragraph dark:text-dark-paragraph mb-1">
                Content (use [reading] notation)
              </label>
              <p class="text-xs text-light-paragraph dark:text-dark-paragraph mb-2">
                Example: 朝[あさ]が来ました。
              </p>
              <textarea
                [(ngModel)]="form.textContent"
                name="textContent"
                (input)="onContentChange()"
                rows="12"
                class="w-full px-3 py-2 rounded border transition-colors bg-white dark:bg-slate-700 border-secondary dark:border-success text-light-headline dark:text-dark-headline font-mono text-sm"
                placeholder="朝[あさ]が来ました。&#10;ゆいさんは七[しち]時[じ]に起[お]きます。"
              ></textarea>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              [disabled]="isSubmitting"
              class="w-full px-4 py-2 bg-success hover:opacity-90 text-white rounded-md transition-all font-medium disabled:opacity-50"
            >
              {{ isSubmitting ? 'Creating...' : 'Create Chapter' }}
            </button>

            <p *ngIf="successMessage" class="text-sm text-green-600 dark:text-green-400">
              {{ successMessage }}
            </p>
            <p *ngIf="errorMessage" class="text-sm text-red-600 dark:text-red-400">
              {{ errorMessage }}
            </p>
          </form>
        </div>

        <!-- Preview Panel -->
        <div class="rounded-lg transition-colors bg-white dark:bg-slate-800 border border-secondary dark:border-success p-6">
          <h3 class="font-bold mb-4 transition-colors text-light-headline dark:text-dark-headline">Preview</h3>
          <div class="space-y-2 max-h-96 overflow-y-auto p-4 rounded transition-colors bg-light-bg dark:bg-slate-700 border border-secondary dark:border-success">
            <div
              *ngFor="let paragraph of previewParagraphs"
              [innerHTML]="paragraph"
              class="mb-4 text-sm leading-relaxed transition-colors text-light-paragraph dark:text-dark-paragraph"
            ></div>
            <p *ngIf="previewParagraphs.length === 0" class="text-xs italic text-light-paragraph dark:text-dark-paragraph">
              Preview will appear here...
            </p>
          </div>
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
export class ChapterEditorComponent implements OnInit {
  bookId = '';
  form: ChapterForm = {
    id: '',
    number: 1,
    title: '',
    textContent: ''
  };

  previewParagraphs: SafeHtml[] = [];
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private rubyConverter: RubyConverterService,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.onContentChange();
  }

  onContentChange(): void {
    const converted = this.rubyConverter.convertTextToChapterContent(this.form.textContent);
    this.previewParagraphs = converted.map(html =>
      this.sanitizer.bypassSecurityTrustHtml(html)
    );
  }

  submitChapter(): void {
    if (!this.bookId || !this.form.id || !this.form.title || !this.form.textContent.trim()) {
      this.errorMessage = 'All fields are required';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const content = this.rubyConverter.convertTextToChapterContent(this.form.textContent);

    const payload = {
      id: this.form.id,
      number: this.form.number,
      title: this.form.title,
      content: content,
      bookId: this.bookId
    };

    this.http.post(`http://localhost:3000/books/${this.bookId}/chapters`, payload).subscribe({
      next: () => {
        this.successMessage = `✅ Chapter created successfully!`;

        // Reset after 2s
        setTimeout(() => {
          this.form = {
            id: '',
            number: 1,
            title: '',
            textContent: ''
          };
          this.successMessage = '';
          this.previewParagraphs = [];
        }, 2000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to create chapter';
        console.error('Error:', err);
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }
}
