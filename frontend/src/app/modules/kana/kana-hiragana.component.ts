import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { KanaService, Kana } from '../../core/services/kana.service';

@Component({
  selector: 'app-kana-hiragana',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-light-bg dark:bg-slate-900 transition-colors p-4">
      <div class="max-w-5xl mx-auto">
        <!-- Header with Navigation -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-4">
              <a routerLink="/kana"
                 class="px-4 py-2 bg-light-surface dark:bg-slate-700 hover:bg-primary hover:text-white text-light-headline dark:text-dark-headline rounded-lg transition font-medium">
                ← Back
              </a>
              <h1 class="text-4xl font-bold text-light-headline dark:text-dark-headline">
                ひらがな Hiragana
              </h1>
            </div>
            <a routerLink="/kana/katakana"
               class="px-4 py-2 bg-light-surface dark:bg-slate-700 hover:bg-primary hover:text-white text-light-headline dark:text-dark-headline rounded-lg transition font-medium">
              Switch to カタカナ →
            </a>
          </div>
          <p class="text-light-paragraph dark:text-dark-paragraph">
            Complete hiragana character chart with romaji pronunciation
          </p>
        </div>

        <!-- Hiragana Table -->
        <div class="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
          <div class="overflow-x-auto">
            <table class="w-full text-center border-collapse">
              <thead>
                <tr class="text-sm text-light-paragraph dark:text-dark-paragraph">
                  <th class="p-2"></th>
                  <th class="p-2">a</th>
                  <th class="p-2">i</th>
                  <th class="p-2">u</th>
                  <th class="p-2">e</th>
                  <th class="p-2">o</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let row of hiraganaChart" class="border-t border-secondary dark:border-slate-700">
                  <td class="p-2 text-sm font-medium text-light-paragraph dark:text-dark-paragraph">{{ row.label }}</td>
                  <td *ngFor="let kana of row.kana" class="p-2">
                    <div *ngIf="kana"
                         class="w-16 h-16 flex flex-col items-center justify-center rounded-lg bg-light-bg dark:bg-slate-700 text-2xl font-medium text-light-headline dark:text-dark-headline">
                      <span>{{ kana.character }}</span>
                      <span class="text-xs opacity-60 mt-1">{{ kana.romaji }}</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class KanaHiraganaComponent implements OnInit {
  loading$ = this.kanaService.loading$;

  hiraganaList: Kana[] = [];
  hiraganaChart: { label: string; kana: (Kana | null)[] }[] = [];

  constructor(private kanaService: KanaService) {}

  ngOnInit(): void {
    this.loadHiragana();
  }

  private loadHiragana(): void {
    this.kanaService.getAllKana('hiragana').subscribe({
      next: (kana) => {
        this.hiraganaList = kana;
        this.hiraganaChart = this.organizeKanaChart(kana);
      },
      error: (err) => console.error('Error loading hiragana:', err)
    });
  }

  private organizeKanaChart(kanaList: Kana[]): { label: string; kana: (Kana | null)[] }[] {
    const rows = [
      { label: '', vowels: ['a', 'i', 'u', 'e', 'o'] },
      { label: 'k', vowels: ['ka', 'ki', 'ku', 'ke', 'ko'] },
      { label: 'g', vowels: ['ga', 'gi', 'gu', 'ge', 'go'] },
      { label: 's', vowels: ['sa', 'shi', 'su', 'se', 'so'] },
      { label: 'z', vowels: ['za', 'ji', 'zu', 'ze', 'zo'] },
      { label: 't', vowels: ['ta', 'chi', 'tsu', 'te', 'to'] },
      { label: 'd', vowels: ['da', 'di', 'du', 'de', 'do'] },
      { label: 'n', vowels: ['na', 'ni', 'nu', 'ne', 'no'] },
      { label: 'h', vowels: ['ha', 'hi', 'fu', 'he', 'ho'] },
      { label: 'b', vowels: ['ba', 'bi', 'bu', 'be', 'bo'] },
      { label: 'p', vowels: ['pa', 'pi', 'pu', 'pe', 'po'] },
      { label: 'm', vowels: ['ma', 'mi', 'mu', 'me', 'mo'] },
      { label: 'y', vowels: ['ya', null, 'yu', null, 'yo'] },
      { label: 'r', vowels: ['ra', 'ri', 'ru', 're', 'ro'] },
      { label: 'w', vowels: ['wa', 'wi', 'we', 'wo', 'n'] },
    ];

    return rows.map(row => ({
      label: row.label,
      kana: row.vowels.map(romaji => {
        if (romaji === null) return null;
        return kanaList.find(k => k.romaji === romaji) || null;
      })
    }));
  }
}
