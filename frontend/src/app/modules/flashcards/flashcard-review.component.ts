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
    <div class="themed-page min-h-screen transition-colors duration-300 bg-light-bg dark:bg-dark-bg text-light-paragraph dark:text-dark-paragraph">
      <div class="container mx-auto max-w-5xl px-4 py-8">
        <section class="rounded-3xl border border-secondary/20 dark:border-success/20 bg-white/90 dark:bg-slate-900/90 p-6 sm:p-8 shadow-md mb-7">
          <p class="text-xs uppercase tracking-[0.16em] font-semibold text-secondary dark:text-success">SRS Session</p>
          <h1 class="mt-2 text-3xl sm:text-4xl font-bold text-light-headline dark:text-dark-headline">
            Review Flashcards
          </h1>
          <p class="mt-2 text-sm sm:text-base text-light-paragraph dark:text-dark-paragraph">
            {{ reviewDue.length }} cards are due right now. Keep momentum with focused recall.
          </p>
        </section>

        <div *ngIf="reviewDue.length > 0">
          <!-- Progress -->
          <div class="mb-8 rounded-2xl border border-secondary/20 dark:border-success/20 bg-white/90 dark:bg-slate-900/90 p-4 sm:p-5 shadow-sm">
            <div class="flex justify-between mb-2">
              <span class="text-sm transition-colors text-light-paragraph dark:text-dark-paragraph">
                Card {{ currentIndex + 1 }} / {{ reviewDue.length }}
              </span>
              <span class="text-sm font-semibold transition-colors text-primary dark:text-primary-dark">
                {{ Math.round((currentIndex + 1) / reviewDue.length * 100) }}%
              </span>
            </div>
            <div class="w-full rounded-full h-2.5 transition-colors overflow-hidden bg-light-accent-tertiary dark:bg-dark-accent-tertiary">
              <div class="h-2 rounded-full transition-all bg-primary dark:bg-primary-dark" 
                   [style.width.%]="((currentIndex + 1) / reviewDue.length) * 100"></div>
            </div>
          </div>

          <!-- Flashcard -->
          <div class="rounded-3xl shadow-md p-8 sm:p-12 mb-8 min-h-[22rem] flex flex-col justify-center items-center cursor-pointer transition border bg-white/95 dark:bg-slate-900/95 border-secondary/30 dark:border-success/30 hover:border-primary dark:hover:border-primary-dark"
               (click)="toggleFlip()">
            <div class="text-center w-full">
              <p class="text-xs uppercase tracking-[0.14em] mb-4 transition-colors text-secondary dark:text-success font-semibold">
                {{ flipped ? 'Answer' : 'Question' }}
              </p>
              <div class="overflow-hidden">
                <p *ngIf="!flipped" 
                   class="flip-pane text-5xl sm:text-6xl font-bold text-light-headline dark:text-dark-headline"
                   [style.opacity]="flipped ? '0' : '1'"
                   [style.transform]="flipped ? 'translateY(20px)' : 'translateY(0)'">
                  {{ currentCard?.front }}
                </p>
                <div *ngIf="flipped && currentVocab" 
                     class="flip-pane text-light-headline dark:text-dark-headline"
                     [style.opacity]="flipped ? '1' : '0'"
                     [style.transform]="flipped ? 'translateY(0)' : 'translateY(20px)'">
                  <div class="text-3xl sm:text-4xl font-semibold">{{ currentVocab.word.reading }}</div>
                  <div class="text-2xl sm:text-3xl mt-3">{{ currentVocab.word.meaning }}</div>
                  <div class="text-sm mt-4 italic transition-colors text-light-paragraph dark:text-dark-paragraph max-w-2xl mx-auto">
                    {{ currentVocab.exampleSentence }}
                  </div>
                </div>
              </div>
            </div>
            <p class="text-sm mt-8 transition-colors text-light-paragraph dark:text-dark-paragraph">
              Click to reveal answer
            </p>
          </div>

          <!-- Review Buttons -->
          <div *ngIf="flipped && currentCard" class="grid gap-3 sm:grid-cols-3">
            <button (click)="reviewCard('hard')"
                    class="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition font-semibold shadow-sm hover:shadow-md">
              Hard (Tomorrow)
            </button>
            <button (click)="reviewCard('medium')"
                    class="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl transition font-semibold shadow-sm hover:shadow-md">
              Medium (+3 days)
            </button>
            <button (click)="reviewCard('easy')"
                    class="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition font-semibold shadow-sm hover:shadow-md">
              Easy (+7 days)
            </button>
          </div>
        </div>

        <div *ngIf="reviewDue.length === 0" class="text-center rounded-3xl border border-secondary/20 dark:border-success/20 bg-white/90 dark:bg-slate-900/90 py-16 px-6 shadow-sm">
          <p class="text-2xl mb-4 transition-colors text-light-headline dark:text-dark-headline">
            🎉 No cards due for review!
          </p>
          <p class="transition-colors text-light-paragraph dark:text-dark-paragraph max-w-xl mx-auto">
            Come back later or add new vocabulary from the reader.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .flip-pane {
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
