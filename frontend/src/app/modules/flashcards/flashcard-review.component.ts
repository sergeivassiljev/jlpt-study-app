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
    <div class="min-h-screen transition-colors duration-300 bg-light-bg dark:bg-dark-bg text-light-paragraph dark:text-dark-paragraph">
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-4xl font-bold mb-2 transition-colors text-primary dark:text-primary-dark">
          Review Flashcards
        </h1>
        <p class="mb-8 transition-colors text-light-paragraph dark:text-dark-paragraph">
          {{ reviewDue.length }} cards due for review
        </p>

        <div *ngIf="reviewDue.length > 0">
          <!-- Progress -->
          <div class="mb-8">
            <div class="flex justify-between mb-2">
              <span class="transition-colors text-light-paragraph dark:text-dark-paragraph">
                Card {{ currentIndex + 1 }} / {{ reviewDue.length }}
              </span>
              <span class="transition-colors text-light-paragraph dark:text-dark-paragraph">
                {{ Math.round((currentIndex + 1) / reviewDue.length * 100) }}%
              </span>
            </div>
            <div class="w-full rounded-full h-2 transition-colors overflow-hidden bg-light-accent-tertiary dark:bg-dark-accent-tertiary">
              <div class="h-2 rounded-full transition-all bg-primary dark:bg-primary-dark" 
                   [style.width.%]="((currentIndex + 1) / reviewDue.length) * 100"></div>
            </div>
          </div>

          <!-- Flashcard -->
          <div class="rounded-lg shadow-lg p-12 mb-8 h-80 flex flex-col justify-center items-center cursor-pointer hover:shadow-2xl transition border bg-white dark:bg-dark-accent-tertiary border-secondary dark:border-primary-dark hover:border-primary dark:hover:border-primary-dark"
               (click)="toggleFlip()">
            <div class="text-center w-full">
              <p class="text-sm mb-4 transition-colors text-light-paragraph dark:text-dark-paragraph">
                {{ flipped ? 'Answer' : 'Question' }}
              </p>
              <div class="overflow-hidden">
                <p *ngIf="!flipped" 
                   class="text-5xl font-bold transition-all text-light-headline dark:text-dark-headline"
                   [style.opacity]="flipped ? '0' : '1'"
                   [style.transform]="flipped ? 'translateY(20px)' : 'translateY(0)'">
                  {{ currentCard?.front }}
                </p>
                <div *ngIf="flipped && currentVocab" 
                     class="transition-all text-light-headline dark:text-dark-headline"
                     [style.opacity]="flipped ? '1' : '0'"
                     [style.transform]="flipped ? 'translateY(0)' : 'translateY(20px)'">
                  <div class="text-3xl font-semibold">{{ currentVocab.word.reading }}</div>
                  <div class="text-2xl mt-4">{{ currentVocab.word.meaning }}</div>
                  <div class="text-sm mt-4 italic transition-colors text-light-paragraph dark:text-dark-paragraph">
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
          <p class="text-2xl mb-4 transition-colors text-light-headline dark:text-dark-headline">
            🎉 No cards due for review!
          </p>
          <p class="transition-colors text-light-paragraph dark:text-dark-paragraph">
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
