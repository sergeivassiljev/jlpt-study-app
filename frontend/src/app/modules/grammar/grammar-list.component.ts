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
    <div [ngClass]="currentTheme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'" 
         class="min-h-screen transition-colors duration-300">
      <div class="container mx-auto px-4 py-8">
        <h1 [ngClass]="currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'" 
            class="text-4xl font-bold mb-2 transition-colors">
          N5 Grammar
        </h1>
        <p [ngClass]="currentTheme === 'dark' ? 'text-slate-400' : 'text-slate-600'" 
           class="mb-8 transition-colors">
          Master {{ grammarItems.length }} essential N5 grammar patterns
        </p>

        <div class="space-y-6">
          <div *ngFor="let item of grammarItems; let i = index"
               (click)="expandedId = expandedId === item.id ? undefined : item.id"
               [ngClass]="currentTheme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'"
               class="rounded-lg shadow hover:shadow-lg transition cursor-pointer border">
            
            <!-- Header -->
            <div class="p-6 flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <span [ngClass]="currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'" 
                        class="text-2xl font-bold transition-colors">
                    {{ item.pattern }}
                  </span>
                  <span [ngClass]="currentTheme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'"
                        class="px-3 py-1 rounded-full text-sm transition-colors">
                    {{ item.level }}
                  </span>
                </div>
                <p [ngClass]="currentTheme === 'dark' ? 'text-slate-400' : 'text-slate-600'" 
                   class="transition-colors">
                  {{ item.explanation }}
                </p>
              </div>
              <span [ngClass]="currentTheme === 'dark' ? 'text-slate-500' : 'text-slate-400'" 
                    class="text-2xl transform transition" 
                    [class.rotate-180]="expandedId == item.id">
                ▼
              </span>
            </div>

            <!-- Details -->
            <div *ngIf="expandedId == item.id" 
                 [ngClass]="currentTheme === 'dark' ? 'border-slate-700 bg-slate-700 bg-opacity-50' : 'border-slate-200 bg-slate-50'"
                 class="px-6 pb-6 border-t transition-colors">
              <div class="mb-6">
                <p [ngClass]="currentTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'" 
                   class="text-sm mb-2 transition-colors">
                  Structure
                </p>
                <p [ngClass]="currentTheme === 'dark' ? 'bg-slate-900 text-slate-200' : 'bg-slate-100 text-slate-800'"
                   class="p-3 rounded font-mono text-sm transition-colors">
                  {{ item.structure }}
                </p>
              </div>

              <div>
                <p [ngClass]="currentTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'" 
                   class="text-sm mb-3 transition-colors">
                  Examples
                </p>
                <div class="space-y-4">
                  <div *ngFor="let example of item.examples" 
                       [ngClass]="currentTheme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-200'"
                       class="p-4 rounded border">
                    <p [ngClass]="currentTheme === 'dark' ? 'text-slate-100' : 'text-slate-800'" 
                       class="text-lg font-semibold mb-1 transition-colors">
                      {{ example.japanese }}
                    </p>
                    <p [ngClass]="currentTheme === 'dark' ? 'text-slate-400' : 'text-slate-600'" 
                       class="text-sm mb-2 transition-colors">
                      {{ example.furigana }}
                    </p>
                    <p [ngClass]="currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'" 
                       class="transition-colors">
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
