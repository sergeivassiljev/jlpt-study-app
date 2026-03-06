import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GrammarService } from '../../core/services/grammar.service';
import { ThemeService, Theme } from '../../core/services/theme.service';
import { GrammarItem } from '../../core/models/index';

@Component({
  selector: 'app-grammar-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="themed-page min-h-screen transition-colors duration-300 bg-light-bg dark:bg-dark-bg text-light-paragraph dark:text-dark-paragraph">
      <div class="container mx-auto max-w-6xl px-4 py-8">
        <section class="rounded-3xl border border-secondary/20 dark:border-success/20 bg-white/90 dark:bg-slate-900/90 p-6 sm:p-8 shadow-md mb-7">
          <p class="text-xs uppercase tracking-[0.16em] font-semibold text-secondary dark:text-success">Grammar Guide</p>
          <h1 class="mt-2 text-3xl sm:text-4xl font-bold text-light-headline dark:text-dark-headline">N5 Grammar</h1>
          <p class="mt-2 text-sm sm:text-base text-light-paragraph dark:text-dark-paragraph">
            Master {{ grammarItems.length }} essential N5 grammar patterns
          </p>
        </section>

        <div class="space-y-6">
          <div *ngFor="let item of grammarItems; let i = index"
               (click)="expandedId = expandedId === item.id ? undefined : item.id"
               class="rounded-2xl shadow-sm hover:shadow-md transition cursor-pointer border border-secondary/30 dark:border-success/30 bg-white/95 dark:bg-slate-900/90">
            
            <!-- Header -->
            <div class="p-6 flex justify-between items-start gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <span class="text-2xl font-bold transition-colors text-primary dark:text-primary-dark">
                    {{ item.pattern }}
                  </span>
                  <span class="px-3 py-1 rounded-full text-sm transition-colors bg-primary text-white">
                    {{ item.level }}
                  </span>
                </div>
                <p class="transition-colors text-light-paragraph dark:text-dark-paragraph">
                  {{ item.explanation }}
                </p>
              </div>
              <span class="text-2xl transform transition text-light-paragraph dark:text-dark-paragraph" 
                    [class.rotate-180]="expandedId == item.id">
                ▼
              </span>
            </div>

            <!-- Details -->
            <div *ngIf="expandedId == item.id" 
                 class="px-6 pb-6 border-t border-secondary/30 dark:border-success/30 transition-colors bg-light-bg/80 dark:bg-slate-800/80">
              <div class="mb-6">
                <p class="text-sm mb-2 transition-colors text-light-paragraph dark:text-dark-paragraph">
                  Structure
                </p>
                <p class="p-3 rounded-xl font-mono text-sm transition-colors bg-white dark:bg-slate-900 text-light-headline dark:text-dark-headline border border-secondary/35 dark:border-success/35">
                  {{ item.structure }}
                </p>
              </div>

              <div>
                <p class="text-sm mb-3 transition-colors text-light-paragraph dark:text-dark-paragraph">
                  Examples
                </p>
                <div class="space-y-4">
                  <div *ngFor="let example of item.examples" 
                       class="p-4 rounded-xl border border-secondary/30 dark:border-success/30 bg-white dark:bg-slate-900">
                    <p class="text-lg font-semibold mb-1 transition-colors text-light-headline dark:text-dark-headline">
                      {{ example.japanese }}
                    </p>
                    <p class="text-sm mb-2 transition-colors text-light-paragraph dark:text-dark-paragraph">
                      {{ example.furigana }}
                    </p>
                    <p class="transition-colors text-primary dark:text-primary-dark">
                      {{ example.english }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class GrammarListComponent implements OnInit {
  grammarItems: GrammarItem[] = [];
  expandedId: string | undefined;
  currentTheme: Theme = 'light';

  constructor(
    private grammarService: GrammarService,
    private themeService: ThemeService
  ) { }

  ngOnInit(): void {
    // Subscribe to theme changes
    this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });

    this.grammarService.grammar$.subscribe(items => {
      this.grammarItems = items;
    });
  }
}
