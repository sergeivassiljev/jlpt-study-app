import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KanjiService } from '../../core/services/kanji.service';
import { VocabularyService } from '../../core/services/vocabulary.service';
import { ThemeService, Theme } from '../../core/services/theme.service';
import { Kanji, Word } from '../../core/models/index';

@Component({
  selector: 'app-kanji-grid',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen transition-colors duration-300 bg-light-bg dark:bg-dark-bg text-light-paragraph dark:text-dark-paragraph">
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-4xl font-bold mb-2 transition-colors text-primary dark:text-primary-dark">
          N5 Kanji
        </h1>
        <p class="mb-8 transition-colors text-light-paragraph dark:text-dark-paragraph">
          Master essential N5 kanji characters ({{ filteredKanji.length }} / {{ allKanji.length }})
        </p>

        <!-- Search Input -->
        <div class="mb-6">
          <input [(ngModel)]="searchQuery" 
                 (input)="filterKanji()"
                 type="text" 
                 placeholder="Search by character or meaning..."
                 class="w-full px-4 py-2 border border-secondary dark:border-success rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-slate-800 text-light-paragraph dark:text-dark-paragraph placeholder-gray-400 dark:placeholder-gray-500">
        </div>

        <!-- Category Filter -->
        <div class="mb-8 flex flex-wrap gap-2">
          <button *ngFor="let category of categories"
                  (click)="toggleCategory(category)"
                  [ngClass]="selectedCategory === category 
                    ? 'bg-light-button dark:bg-dark-button text-white'
                    : 'bg-light-bg dark:bg-slate-700 text-light-headline dark:text-dark-headline border border-secondary dark:border-success hover:opacity-80'"
                  class="px-4 py-2 rounded-full transition font-medium text-sm">
            {{ category }}
          </button>
          <button (click)="clearFilters()"
                  class="px-4 py-2 text-sm transition text-light-paragraph dark:text-dark-paragraph hover:text-primary dark:hover:text-primary-dark">
            Clear All
          </button>
        </div>

        <p *ngIf="filteredKanji.length === 0" 
           class="text-center py-8 text-light-paragraph dark:text-dark-paragraph">
          No kanji found. Try adjusting your search or filters.
        </p>

        <div class="grid grid-cols-3 md:grid-cols-5 gap-3 mb-8">
          <div *ngFor="let k of filteredKanji"
               (click)="selectKanji(k)"
               class="aspect-square rounded-lg shadow hover:shadow-lg transition cursor-pointer flex items-center justify-center group border border-primary-dark bg-white dark:bg-slate-800">
            <div class="text-center">
              <p class="text-5xl font-bold group-hover:scale-110 transition text-primary dark:text-primary-dark">
                {{ k.character }}
              </p>
              <p class="text-xs mt-1 transition-colors text-light-paragraph dark:text-dark-paragraph">
                {{ k.meaning }}
              </p>
            </div>
          </div>
        </div>

        <!-- Kanji Detail Modal -->
        <div *ngIf="selectedKanji" 
             class="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-colors bg-black/40 dark:bg-black/60"
             (click)="selectedKanji = undefined">
          <div class="rounded-lg shadow-xl p-8 max-w-2xl w-full max-h-96 overflow-y-auto border border-primary-dark transition-colors bg-white dark:bg-slate-800"
               (click)="$event.stopPropagation()">
            <div *ngIf="selectedKanji" class="flex justify-between items-start mb-6">
              <p class="text-6xl font-bold transition-colors text-primary dark:text-primary-dark">
                {{ selectedKanji.character }}
              </p>
              <button (click)="selectedKanji = undefined" 
                      class="text-3xl transition-colors text-light-paragraph dark:text-dark-paragraph hover:text-primary dark:hover:text-primary-dark">
                ×
              </button>
            </div>

            <div *ngIf="selectedKanji" class="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p class="text-sm mb-1 transition-colors text-light-paragraph dark:text-dark-paragraph">
                  Meaning
                </p>
                <p class="text-2xl font-semibold transition-colors text-light-headline dark:text-dark-headline">
                  {{ selectedKanji.meaning }}
                </p>
              </div>
              <div>
                <p class="text-sm mb-1 transition-colors text-light-paragraph dark:text-dark-paragraph">
                  Strokes
                </p>
                <p class="text-2xl font-semibold transition-colors text-light-headline dark:text-dark-headline">
                  {{ selectedKanji.strokeCount }}
                </p>
              </div>
            </div>

            <div *ngIf="selectedKanji" class="mb-6">
              <p class="text-sm mb-2 transition-colors text-light-paragraph dark:text-dark-paragraph">
                On'yomi (音読み)
              </p>
              <div class="flex gap-2 flex-wrap">
                <span *ngFor="let onyomi of selectedKanji.onyomi"
                      class="px-3 py-1 rounded-full text-sm font-semibold transition-colors bg-primary text-white">
                  {{ onyomi }}
                </span>
              </div>
            </div>

            <div *ngIf="selectedKanji" class="mb-6">
              <p class="text-sm mb-2 transition-colors text-light-paragraph dark:text-dark-paragraph">
                Kun'yomi (訓読み)
              </p>
              <div class="flex gap-2 flex-wrap">
                <span *ngFor="let kunyomi of selectedKanji.kunyomi"
                      class="px-3 py-1 rounded-full text-sm font-semibold transition-colors bg-success text-white">
                  {{ kunyomi }}
                </span>
              </div>
            </div>

            <div *ngIf="selectedKanji && selectedKanji.exampleSentences.length > 0" class="mb-6">
              <p class="text-sm mb-2 transition-colors text-light-paragraph dark:text-dark-paragraph">
                Example Sentences
              </p>
              <div class="space-y-2">
                <p *ngFor="let sentence of selectedKanji.exampleSentences"
                   class="p-3 rounded transition-colors bg-light-bg dark:bg-slate-700 text-light-paragraph dark:text-dark-paragraph">
                  {{ sentence }}
                </p>
              </div>
            </div>

            <button *ngIf="selectedKanji"
                    (click)="addKanjiToVocabulary(selectedKanji)"
                    class="w-full px-4 py-2 bg-success hover:opacity-90 text-white rounded-lg transition font-semibold shadow-sm hover:shadow-md mt-6">
              ➕ Add to Vocabulary
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class KanjiGridComponent implements OnInit {
  allKanji: Kanji[] = [];
  filteredKanji: Kanji[] = [];
  selectedKanji: Kanji | undefined;
  currentTheme: Theme = 'light';
  
  searchQuery: string = '';
  selectedCategory: string | null = null;
  
  categories: string[] = [
    'Numbers',
    'Days & Time',
    'Colors',
    'People & Family',
    'Food & Nature',
    'Verbs',
    'Places',
    'Actions',
    'Adjectives',
    'Animals'
  ];

  private kanjiCategories: { [key: string]: string[] } = {
    'Numbers': ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '百', '千', '万', '名'],
    'Days & Time': ['日', '月', '火', '水', '木', '金', '土', '時', '間', '朝', '昼', '夜', '春', '夏', '秋', '冬'],
    'Colors': ['黒', '白', '赤', '青'],
    'People & Family': ['人', '男', '女', '子', '友', '父', '母', '兄', '弟', '姉', '妹'],
    'Food & Nature': ['米', '食', '山', '川', '花', '草', '木', '雨', '雪', '風'],
    'Verbs': ['来', '行', '見', '聞', '知', '使', '作', '読', '書', '立', '座'],
    'Places': ['家', '学', '校', '店', '本', '門', '車', '電', '話', '字'],
    'Actions': ['歩', '走', '飛', '泳', '乗', '降', '遊', '投'],
    'Adjectives': ['大', '小', '中', '上', '下', '左', '右', '長', '短', '高', '低', '新', '古', '美', '得'],
    'Animals': ['猫', '犬', '鳥', '魚', '寝', '起']
  };

  constructor(
    private kanjiService: KanjiService,
    private themeService: ThemeService,
    private vocabularyService: VocabularyService
  ) { }

  ngOnInit(): void {
    // Subscribe to theme changes
    this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });

    this.kanjiService.kanji$.subscribe(k => {
      this.allKanji = k;
      this.filterKanji();
    });
  }

  filterKanji(): void {
    let filtered = [...this.allKanji];

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(k => 
        k.character.includes(this.searchQuery) ||
        k.meaning.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (this.selectedCategory) {
      const categoryKanji = this.kanjiCategories[this.selectedCategory] || [];
      filtered = filtered.filter(k => categoryKanji.includes(k.character));
    }

    this.filteredKanji = filtered;
  }

  toggleCategory(category: string): void {
    this.selectedCategory = this.selectedCategory === category ? null : category;
    this.filterKanji();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = null;
    this.filterKanji();
  }

  selectKanji(k: Kanji): void {
    this.selectedKanji = k;
  }

  addKanjiToVocabulary(kanji: Kanji): void {
    const reading = kanji.kunyomi[0] || kanji.onyomi[0] || kanji.character;
    const exampleSentence = kanji.exampleSentences[0] || `${kanji.character}（${reading}）`;
    
    const word: Word = {
      id: `word-${kanji.id}`,
      text: kanji.character,
      reading: reading,
      meaning: kanji.meaning,
      partOfSpeech: 'Kanji'
    };

    this.vocabularyService.addWord(word, exampleSentence).subscribe({
      next: () => {
        console.log('✅ Added kanji to vocabulary:', kanji.character);
        this.selectedKanji = undefined; // Close modal after adding
      },
      error: (err) => {
        console.error('❌ Failed to add kanji to vocabulary:', err);
      }
    });
  }
}
