import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SrsService } from '../../core/services/srs.service';
import { VocabularyService } from '../../core/services/vocabulary.service';
import { ThemeService, Theme } from '../../core/services/theme.service';
import { FlashCard, VocabularyItem } from '../../core/models/index';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-flashcard-review',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [ngClass]="currentTheme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'" 
         class="min-h-screen transition-colors duration-300">
      <div class="container mx-auto px-4 py-8">
        <h1 [ngClass]="currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'" 
            class="text-4xl font-bold mb-2 transition-colors">
          Review Flashcards
        </h1>
        <p [ngClass]="currentTheme === 'dark' ? 'text-slate-400' : 'text-slate-600'" 
           class="mb-8 transition-colors">
          {{ reviewDue.length }} cards due for review
        </p>

        <div *ngIf="reviewDue.length > 0">
          <!-- Progress -->
          <div class="mb-8">
            <div class="flex justify-between mb-2">
              <span [ngClass]="currentTheme === 'dark' ? 'text-slate-400' : 'text-slate-600'" 
                    class="transition-colors">
                Card {{ currentIndex + 1 }} / {{ reviewDue.length }}
              </span>
              <span [ngClass]="currentTheme === 'dark' ? 'text-slate-400' : 'text-slate-600'" 
                    class="transition-colors">
                {{ Math.round((currentIndex + 1) / reviewDue.length * 100) }}%
              </span>
            </div>
            <div [ngClass]="currentTheme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'" 
                 class="w-full rounded-full h-2 transition-colors overflow-hidden">
              <div [ngClass]="currentTheme === 'dark' ? 'bg-blue-500' : 'bg-blue-600'" 
                   class="h-2 rounded-full transition-all" 
                   [style.width.%]="((currentIndex + 1) / reviewDue.length) * 100"></div>
            </div>
          </div>

          <!-- Flashcard -->
          <div [ngClass]="currentTheme === 'dark' 
                 ? 'bg-slate-800 border-slate-700 hover:border-slate-600' 
                 : 'bg-white border-slate-200 hover:border-slate-300'"
               class="rounded-lg shadow-lg p-12 mb-8 h-80 flex flex-col justify-center items-center cursor-pointer hover:shadow-2xl transition border"
               (click)="toggleFlip()">
            <div class="text-center w-full">
              <p [ngClass]="currentTheme === 'dark' ? 'text-slate-500' : 'text-slate-500'" 
                 class="text-sm mb-4 transition-colors">
                {{ flipped ? 'Answer' : 'Question' }}
              </p>
              <div class="overflow-hidden">
                <p *ngIf="!flipped" 
                   [ngClass]="currentTheme === 'dark' ? 'text-slate-100' : 'text-slate-800'" 
                   class="text-5xl font-bold transition-all"
                   [style.opacity]="flipped ? '0' : '1'"
                   [style.transform]="flipped ? 'translateY(20px)' : 'translateY(0)'">
                  {{ currentCard?.front }}
                </p>
                <div *ngIf="flipped && currentVocab" 
                     [ngClass]="currentTheme === 'dark' ? 'text-slate-100' : 'text-slate-800'" 
                     class="transition-all"
                     [style.opacity]="flipped ? '1' : '0'"
                     [style.transform]="flipped ? 'translateY(0)' : 'translateY(20px)'">
                  <div class="text-3xl font-semibold">{{ currentVocab.word.reading }}</div>
                  <div class="text-2xl mt-4">{{ currentVocab.word.meaning }}</div>
                  <div [ngClass]="currentTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'" 
                       class="text-sm mt-4 italic transition-colors">
                    {{ currentVocab.exampleSentence }}
                  </div>
                </div>
              </div>
            </div>
            <p [ngClass]="currentTheme === 'dark' ? 'text-slate-500' : 'text-slate-400'" 
               class="text-sm mt-8 transition-colors">
              Click to reveal answer
            </p>
          </div>

          <!-- Review Buttons -->
          <div *ngIf="flipped && currentCard" class="flex gap-4 justify-center">
            <button (click)="reviewCard('hard')"
                    class="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-semibold shadow-md hover:shadow-lg">
              Hard (Tomorrow)
            </button>
            <button (click)="reviewCard('medium')"
                    class="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition font-semibold shadow-md hover:shadow-lg">
              Medium (+3 days)
            </button>
            <button (click)="reviewCard('easy')"
                    class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-semibold shadow-md hover:shadow-lg">
              Easy (+7 days)
            </button>
          </div>
        </div>

        <div *ngIf="reviewDue.length === 0" class="text-center py-12">
          <p [ngClass]="currentTheme === 'dark' ? 'text-slate-300' : 'text-slate-500'" 
             class="text-2xl mb-4 transition-colors">
            🎉 No cards due for review!
          </p>
          <p [ngClass]="currentTheme === 'dark' ? 'text-slate-400' : 'text-slate-400'" 
             class="transition-colors">
            Come back later or add new vocabulary from the reader.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Smooth fade and slide animation for card flip */
    div {
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
  `]
})
export class FlashcardReviewComponent implements OnInit, OnDestroy {
  reviewDue: FlashCard[] = [];
  vocabulary: VocabularyItem[] = [];
  currentIndex = 0;
  flipped = false;
  currentTheme: Theme = 'light';
  Math = Math;
  private subscriptions: Subscription[] = [];

  get currentCard(): FlashCard | undefined {
    return this.reviewDue[this.currentIndex];
  }

  get currentVocab(): VocabularyItem | undefined {
    return this.vocabulary.find(v => v.id === this.currentCard?.vocabularyId);
  }

  constructor(
    private srsService: SrsService,
    private vocabularyService: VocabularyService,
    private themeService: ThemeService
  ) { }

  ngOnInit(): void {
    // Subscribe to theme changes
    this.subscriptions.push(
      this.themeService.theme$.subscribe(theme => {
        this.currentTheme = theme;
      })
    );

    this.srsService.createFlashcardsFromVocabulary();
    
    this.subscriptions.push(
      this.srsService.flashcards$.subscribe(cards => {
        const newReviewDue = cards.filter(c => new Date() >= c.nextReview);
        this.reviewDue = newReviewDue;
        // Reset index if it's out of bounds (happens after reviewing a card)
        if (this.currentIndex >= this.reviewDue.length && this.reviewDue.length > 0) {
          this.currentIndex = 0;
        }
        // Reset flip state when due cards change
        this.flipped = false;
      })
    );

    this.subscriptions.push(
      this.vocabularyService.vocabulary$.subscribe(vocab => {
        this.vocabulary = vocab;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleFlip(): void {
    this.flipped = !this.flipped;
  }

  reviewCard(difficulty: 'hard' | 'medium' | 'easy'): void {
    if (!this.currentCard) {
      console.warn('❌ No current card to review');
      return;
    }
    
    // Capture card data BEFORE any state changes (subscription updates are synchronous)
    const card = this.currentCard;
    const vocabularyId = card?.vocabularyId;
    const cardId = card?.id;
    
    if (!card || !vocabularyId || !cardId) {
      console.warn('❌ Invalid card data:', { card, vocabularyId, cardId });
      return;
    }
    
    console.log('📝 Reviewing card:', {
      cardId: cardId,
      vocabularyId: vocabularyId,
      difficulty
    });
    
    // Update flashcard service (backend also syncs vocabulary review state)
    this.srsService.reviewCard(cardId, difficulty);
  }
}
