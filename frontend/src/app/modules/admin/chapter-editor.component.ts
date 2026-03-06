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
    <div class="max-w-6xl mx-auto">
      <div class="mb-6 rounded-3xl border border-secondary/25 dark:border-success/25 bg-white/95 dark:bg-slate-900/95 p-5 sm:p-6 shadow-sm">
        <p class="text-xs uppercase tracking-[0.16em] font-semibold text-secondary dark:text-success mb-2">Create Content</p>
        <h2 class="text-3xl font-bold transition-colors text-light-headline dark:text-dark-headline">Create New Chapter</h2>
        <p class="mt-2 text-sm transition-colors text-light-paragraph dark:text-dark-paragraph">
          Write chapter text with ruby notation and preview furigana rendering in real time.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="rounded-3xl transition-colors bg-white/95 dark:bg-slate-900/95 border border-secondary/25 dark:border-success/25 p-6 shadow-sm">
          <form (ngSubmit)="submitChapter()" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold transition-colors text-light-paragraph dark:text-dark-paragraph mb-1">
                Book ID
              </label>
              <input
                type="text"
                [(ngModel)]="bookId"
                name="bookId"
                class="w-full px-3.5 py-2.5 rounded-xl border transition-colors bg-white dark:bg-slate-800 border-secondary/40 dark:border-success/35 text-light-headline dark:text-dark-headline"
                placeholder="beginner-2"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold transition-colors text-light-paragraph dark:text-dark-paragraph mb-1">
                Chapter ID
              </label>
              <input
                type="text"
                [(ngModel)]="form.id"
                name="id"
                class="w-full px-3.5 py-2.5 rounded-xl border transition-colors bg-white dark:bg-slate-800 border-secondary/40 dark:border-success/35 text-light-headline dark:text-dark-headline"
                placeholder="ch-b2-1"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-semibold transition-colors text-light-paragraph dark:text-dark-paragraph mb-1">
                  Number
                </label>
                <input
                  type="number"
                  [(ngModel)]="form.number"
                  name="number"
                  min="1"
                  class="w-full px-3.5 py-2.5 rounded-xl border transition-colors bg-white dark:bg-slate-800 border-secondary/40 dark:border-success/35 text-light-headline dark:text-dark-headline"
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
                  class="w-full px-3.5 py-2.5 rounded-xl border transition-colors bg-white dark:bg-slate-800 border-secondary/40 dark:border-success/35 text-light-headline dark:text-dark-headline"
                  placeholder="Chapter Title"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold transition-colors text-light-paragraph dark:text-dark-paragraph mb-1">
                Content (use [reading] notation)
              </label>
              <p class="text-xs text-light-paragraph dark:text-dark-paragraph mb-2 opacity-90">
                Example: 朝[あさ]が来ました。
              </p>
              <textarea
                [(ngModel)]="form.textContent"
                name="textContent"
                (input)="onContentChange()"
                rows="12"
                class="w-full px-3.5 py-2.5 rounded-xl border transition-colors bg-white dark:bg-slate-800 border-secondary/40 dark:border-success/35 text-light-headline dark:text-dark-headline font-mono text-sm leading-relaxed"
                placeholder="朝[あさ]が来ました。&#10;ゆいさんは七[しち]時[じ]に起[お]きます。"
              ></textarea>
            </div>

            <button
              type="submit"
              [disabled]="isSubmitting"
              class="w-full px-4 py-3 bg-success hover:opacity-90 text-white rounded-xl transition-all font-semibold disabled:opacity-50"
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

        <div class="rounded-3xl transition-colors bg-white/95 dark:bg-slate-900/95 border border-secondary/25 dark:border-success/25 p-6 shadow-sm">
          <h3 class="font-bold mb-4 transition-colors text-light-headline dark:text-dark-headline">Preview</h3>
          <div class="space-y-2 max-h-96 overflow-y-auto p-4 rounded-2xl transition-colors bg-light-bg/70 dark:bg-slate-800 border border-secondary/30 dark:border-success/25">
            <div
              *ngFor="let paragraph of previewParagraphs"
              [innerHTML]="paragraph"
              class="mb-4 text-sm leading-relaxed transition-colors text-light-paragraph dark:text-dark-paragraph"
            ></div>
            <p *ngIf="previewParagraphs.length === 0" class="text-xs italic text-light-paragraph dark:text-dark-paragraph">
              Preview will appear here...
            </p>
          </div>

          <div class="mt-4 rounded-xl border border-secondary/30 dark:border-success/25 bg-light-bg/65 dark:bg-slate-800/70 px-3 py-2">
            <p class="text-xs transition-colors text-light-paragraph dark:text-dark-paragraph">
              Tip: each new line in the editor becomes a new paragraph in the chapter.
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
