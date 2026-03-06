import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  KanaGameService,
  Difficulty,
  KanaMode,
  GameState,
  FallingKana,
  KanaLeaderboardEntry,
  MyKanaLeaderboardEntry,
} from '../../../core/services/kana-game.service';
import { ThemeService, Theme } from '../../../core/services/theme.service';
import { pageEnter, fadeIn, scaleIn } from '../../../core/animations/page.animations';

@Component({
  selector: 'app-kana-ninja',
  standalone: true,
  imports: [CommonModule, FormsModule],
  animations: [pageEnter, fadeIn, scaleIn],
  template: `
    <div class="themed-page min-h-screen transition-colors duration-300 bg-light-bg dark:bg-dark-bg text-light-paragraph dark:text-dark-paragraph" @pageEnter>
      <div class="container mx-auto px-4 py-4 max-w-4xl">
        
        <!-- Header -->
        <div class="mb-4 text-center">
          <h1 class="text-3xl font-bold mb-1">
            <span class="inline-block text-2xl">🥷</span>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dark dark:from-primary-dark dark:to-primary">Kana Ninja Typing</span>
          </h1>
          <p class="text-xs text-light-paragraph dark:text-dark-paragraph opacity-75">
            Type the romaji to cut the flying kana!
          </p>
        </div>

        <!-- Game Not Started -->
        <div *ngIf="!gameState.gameActive && !gameState.gameOver" @scaleIn class="space-y-6">
          <!-- Difficulty Selection -->
          <div class="rounded-xl shadow-lg border-2 border-primary/20 dark:border-primary-dark/20 bg-gradient-to-br from-white to-primary/5 dark:from-slate-800 dark:to-primary-dark/5 p-6">
            <h2 class="text-2xl font-bold mb-4 text-light-headline dark:text-dark-headline">Select Difficulty</h2>
            <div class="grid grid-cols-3 gap-4 mb-6">
              <button *ngFor="let diff of ['easy', 'normal', 'hard']"
                      (click)="setDifficulty(diff)"
                      [class.bg-gradient-to-r]="selectedDifficulty === diff"
                      [class.from-primary]="selectedDifficulty === diff"
                      [class.to-primary-dark]="selectedDifficulty === diff"
                      [class.text-white]="selectedDifficulty === diff"
                      [class.shadow-lg]="selectedDifficulty === diff"
                      [class.scale-105]="selectedDifficulty === diff"
                      class="px-4 py-3 rounded-lg transition-all duration-300 font-semibold text-sm hover:shadow-md border-2 border-primary/20 dark:border-primary-dark/20 bg-white dark:bg-slate-800">
                {{ diff | titlecase }}
              </button>
            </div>

            <h2 class="text-2xl font-bold mb-4 text-light-headline dark:text-dark-headline">Select Kana</h2>
            <div class="grid grid-cols-3 gap-4">
              <button *ngFor="let mode of ['hiragana', 'katakana', 'mixed']"
                      (click)="setMode(mode)"
                      [class.bg-gradient-to-r]="selectedMode === mode"
                      [class.from-primary]="selectedMode === mode"
                      [class.to-primary-dark]="selectedMode === mode"
                      [class.text-white]="selectedMode === mode"
                      [class.shadow-lg]="selectedMode === mode"
                      [class.scale-105]="selectedMode === mode"
                      class="px-4 py-3 rounded-lg transition-all duration-300 font-semibold text-sm hover:shadow-md border-2 border-primary/20 dark:border-primary-dark/20 bg-white dark:bg-slate-800">
                {{ mode | titlecase }}
              </button>
            </div>
          </div>

          <!-- Start Button -->
          <button (click)="startGame()"
                  class="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white text-lg font-bold hover:shadow-lg transition-all hover:scale-105 shadow-lg">
            <span class="inline-block mr-2">▶️</span> Start Game
          </button>

          <!-- Global Leaderboard -->
          <div class="rounded-xl shadow-lg border-2 border-primary/20 dark:border-primary-dark/20 bg-white dark:bg-slate-800 p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-bold text-light-headline dark:text-dark-headline">Global Leaderboard</h3>
              <span *ngIf="myLeaderboardEntry" class="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary dark:bg-primary-dark/10 dark:text-primary-dark">
                Your best: {{ myLeaderboardEntry.bestScore }}
                <span *ngIf="myLeaderboardEntry.rank">(#{{ myLeaderboardEntry.rank }})</span>
              </span>
            </div>

            <div *ngIf="leaderboardEntries.length === 0" class="text-sm opacity-70 py-2">
              No scores yet. Be the first ninja on the board.
            </div>

            <div *ngIf="leaderboardEntries.length > 0" class="space-y-2">
              <div *ngFor="let entry of leaderboardEntries"
                   class="flex items-center justify-between px-3 py-2 rounded-lg"
                   [ngClass]="entry.rank === 1 ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-white dark:bg-slate-700'"
                   [class.ring-2]="entry.isCurrentUser"
                   [class.ring-primary]="entry.isCurrentUser">
                <div class="flex items-center gap-3 min-w-0">
                  <span class="w-7 text-sm font-bold opacity-80">#{{ entry.rank }}</span>
                  <span class="text-sm truncate" [class.font-bold]="entry.isCurrentUser">{{ entry.email }}</span>
                </div>
                <span class="text-sm font-bold text-green-600 dark:text-green-400">{{ entry.bestScore }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Game Over Screen -->
        <div *ngIf="gameState.gameOver" @scaleIn class="text-center">
          <div class="rounded-xl shadow-lg border-2 border-primary/20 dark:border-primary-dark/20 bg-gradient-to-br from-white to-primary/5 dark:from-slate-800 dark:to-primary-dark/5 p-8">
            <h2 class="text-5xl font-bold mb-4 text-light-headline dark:text-dark-headline">Game Over!</h2>
            
            <div class="grid grid-cols-3 gap-4 mb-6 text-center">
              <div class="bg-white dark:bg-slate-700 rounded-lg p-4">
                <p class="text-sm opacity-75 mb-1">Score</p>
                <p class="text-3xl font-bold text-primary dark:text-primary-dark">{{ gameState.score }}</p>
              </div>
              <div class="bg-white dark:bg-slate-700 rounded-lg p-4">
                <p class="text-sm opacity-75 mb-1">Combo</p>
                <p class="text-3xl font-bold text-orange-500">{{ gameState.combo }}</p>
              </div>
              <div class="bg-white dark:bg-slate-700 rounded-lg p-4">
                <p class="text-sm opacity-75 mb-1">High Score</p>
                <p class="text-3xl font-bold text-green-500">{{ gameState.highScore }}</p>
              </div>
            </div>

            <div *ngIf="gameState.score === gameState.highScore && gameState.highScore > 0"
                 class="mb-4 px-4 py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold">
              🎉 New High Score!
            </div>

            <div *ngIf="myLeaderboardEntry?.rank" class="mb-6 px-4 py-2 rounded-lg bg-primary/10 dark:bg-primary-dark/20 text-sm font-semibold text-primary dark:text-primary-dark">
              Global rank: #{{ myLeaderboardEntry?.rank }}
            </div>

            <div class="flex gap-4">
              <button (click)="playAgain()"
                      class="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-primary-dark text-white font-bold hover:shadow-lg transition-all hover:scale-105">
                Play Again
              </button>
              <button (click)="exitToSelection()"
                      class="flex-1 px-6 py-3 rounded-lg bg-white dark:bg-slate-700 text-light-headline dark:text-dark-headline font-bold hover:shadow-lg transition-all hover:scale-105">
                Exit
              </button>
            </div>
          </div>
        </div>

        <!-- Game Active -->
        <div *ngIf="gameState.gameActive" class="space-y-2" (window:keydown)="handleKeyDown($event)">
          <!-- Flight Arena -->
          <div class="rounded-xl shadow-lg border-4 border-primary/30 dark:border-primary-dark/30 bg-white dark:bg-slate-900 overflow-hidden">
            
            <!-- Stats Bar at Top -->
            <div class="grid grid-cols-4 gap-2 p-2 bg-white/50 dark:bg-slate-800/50">
              <div class="text-center">
                <p class="text-xs opacity-75">Score</p>
                <p class="text-lg font-bold text-blue-600 dark:text-blue-400">{{ gameState.score }}</p>
              </div>
              <div class="text-center">
                <p class="text-xs opacity-75">Combo</p>
                <p class="text-lg font-bold text-orange-600 dark:text-orange-400">{{ gameState.combo }}x</p>
              </div>
              <div class="text-center">
                <p class="text-xs opacity-75">Lives</p>
                <p class="text-lg font-bold text-red-600 dark:text-red-400">{{ gameState.lives }}/3</p>
              </div>
              <div class="text-center">
                <p class="text-xs opacity-75">High Score</p>
                <p class="text-lg font-bold text-green-600 dark:text-green-400">{{ gameState.highScore }}</p>
              </div>
            </div>

            <!-- Falling Kana Display -->
            <div class="relative"
                style="height: 420px; max-width: 800px; margin: 0 auto; overflow: hidden;">

              <div *ngFor="let kana of gameState.kanaList; trackBy: trackByKanaId"
                 [style.transform]="kana.renderTransform"
                   [style.width.px]="kana.size"
                   [style.height.px]="kana.size"
                 class="absolute pointer-events-none kana-sprite">
                <div [class.kana-sliced]="kana.sliced"
                     [ngClass]="kana.fruitClass"
                     class="w-full h-full transition-opacity duration-150 flex items-center justify-center rounded-full font-bold shadow-lg select-none kana-fruit"
                     [style.fontSize.px]="kana.size * 0.5"
                     [style.lineHeight]="'1'">
                  {{ kana.character }}
                </div>
              </div>
              
              <!-- Target Indicator (No Answer Hint) -->
              <div *ngIf="!currentKana" class="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div class="text-xl opacity-50 text-center">
                  <p>Waiting for kana...</p>
                </div>
              </div>

              <!-- In-Game Points Notification -->
              <div *ngIf="correctMessage"
                   @fadeIn
                   class="absolute top-2 right-2 px-3 py-1 rounded-lg bg-gradient-to-r from-green-600 to-emerald-700 text-white text-lg font-extrabold shadow-lg pointer-events-none">
                +{{ lastPoints }}
              </div>
            </div>
          </div>

          <!-- Typing Console (separated from arena) -->
          <div class="rounded-xl shadow-lg border-2 border-primary/30 dark:border-primary-dark/30 bg-white dark:bg-slate-800 p-3">
            <div class="flex items-center justify-between mb-1">
              <h3 class="text-xs font-semibold uppercase tracking-wider opacity-80">Typing Console</h3>
              <span class="text-xs opacity-70">Auto-cut on exact match</span>
            </div>
            <div class="max-w-2xl mx-auto">
              <input #gameInput
                     type="text"
                     [(ngModel)]="userInput"
                     (ngModelChange)="onInputChange()"
                     placeholder="Type any romaji to cut..."
                     class="w-full px-4 py-3 text-center text-2xl font-bold rounded-xl border-4 border-primary/40 dark:border-primary-dark/40 bg-white dark:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/50 dark:focus:ring-primary-dark/50 transition-all"
                     [class.border-green-500]="matchingKana !== null"
                     [class.ring-green-500]="matchingKana !== null"
                     autofocus>
              <p class="text-xs mt-1 text-center opacity-75">Watch the arena, then type here to slice.</p>
            </div>

            <!-- Feedback Messages -->
            <div *ngIf="wrongMessage" @fadeIn
                 class="mt-2 px-3 py-1 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 text-white text-center font-bold max-w-md mx-auto text-sm">
              ✕ Wrong! Try again
            </div>
          </div>

          <!-- Controls -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button (click)="toggleSound()"
                    class="px-3 py-2 rounded-lg bg-gradient-to-r text-white text-sm font-bold transition-all hover:shadow-lg"
                    [class.from-emerald-600]="soundEnabled"
                    [class.to-green-700]="soundEnabled"
                    [class.from-slate-600]="!soundEnabled"
                    [class.to-slate-700]="!soundEnabled">
              {{ soundEnabled ? '🔊 Sound On' : '🔇 Sound Off' }}
            </button>
            <button (click)="showHowToPlayManually()"
                    class="px-3 py-2 rounded-lg bg-gradient-to-r from-rose-600 to-red-600 text-white text-sm font-bold hover:shadow-lg transition-all hover:scale-105">
              ❓ How to Play
            </button>
            <button (click)="pauseGame()"
                    class="px-3 py-2 rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 text-white text-sm font-bold hover:shadow-lg transition-all hover:scale-105">
              ⏸ Pause
            </button>
            <button (click)="exitToSelection()"
                    class="px-3 py-2 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 text-white text-sm font-bold hover:shadow-lg transition-all hover:scale-105">
              Exit
            </button>
          </div>
        </div>

        <!-- Pause Modal -->
        <div *ngIf="isPaused && gameState.gameActive"
             @fadeIn
             class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 text-center max-w-md">
            <h2 class="text-3xl font-bold mb-6 text-light-headline dark:text-dark-headline">Game Paused</h2>
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p class="text-sm opacity-75">Score</p>
                <p class="text-2xl font-bold text-primary dark:text-primary-dark">{{ gameState.score }}</p>
              </div>
              <div>
                <p class="text-sm opacity-75">Combo</p>
                <p class="text-2xl font-bold text-orange-500">{{ gameState.combo }}x</p>
              </div>
            </div>
            <button (click)="resumeGame()"
                    class="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-primary-dark text-white font-bold hover:shadow-lg transition-all hover:scale-105 mb-2">
              ▶️ Resume
            </button>
            <button (click)="playAgain()"
                    class="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-green-700 text-white font-bold hover:shadow-lg transition-all hover:scale-105 mb-2">
              🔄 Restart
            </button>
            <button (click)="exitToSelection()"
                    class="w-full px-6 py-3 rounded-lg bg-gray-500 text-white font-bold hover:shadow-lg transition-all hover:scale-105">
              Exit Game
            </button>
          </div>
        </div>

        <!-- How To Play Modal -->
        <div *ngIf="showHowToPlayModal && gameState.gameActive"
             @fadeIn
             class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div class="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 max-w-lg w-full border-2 border-primary/20 dark:border-primary-dark/20">
            <h2 class="text-2xl font-bold mb-4 text-light-headline dark:text-dark-headline">How To Play</h2>
            <div class="space-y-3 text-sm md:text-base text-light-paragraph dark:text-dark-paragraph">
              <p>1. Kana launch from the bottom and fly in an arc.</p>
              <p>2. Watch the arena and type matching romaji in the typing console.</p>
              <p>3. Exact match slices kana automatically and gives points.</p>
              <p>4. Missed kana cost lives. Keep combo for higher score.</p>
            </div>

            <label class="flex items-center gap-2 mt-5 cursor-pointer select-none">
              <input type="checkbox"
                     [(ngModel)]="dontShowHowToPlayAgain"
                     class="w-4 h-4 rounded border-primary/40 text-primary focus:ring-primary/50">
              <span class="text-sm text-light-paragraph dark:text-dark-paragraph">Don't show this message again</span>
            </label>

            <div class="mt-6 flex gap-3">
              <button (click)="closeHowToPlayModal()"
                      class="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-primary to-primary-dark text-white font-bold hover:shadow-lg transition-all">
                Start
              </button>
              <button (click)="exitToSelection()"
                      class="flex-1 px-4 py-3 rounded-lg bg-gray-500 text-white font-bold hover:shadow-lg transition-all">
                Exit
              </button>
            </div>
          </div>
        </div>

        <!-- Countdown Overlay -->
        <div *ngIf="isCountingDown"
             @fadeIn
             class="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div class="text-center">
            <div @scaleIn class="text-9xl font-bold text-white mb-4 animate-pulse">
              {{ countdownDisplay }}
            </div>
            <p class="text-2xl text-white/80 font-semibold">Get Ready!</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .kana-sprite {
      will-change: transform;
      contain: layout paint;
      transform: translate3d(0, 0, 0);
    }

    .kana-fruit {
      position: relative;
      border: 3px solid rgba(255, 255, 255, 0.5);
      overflow: visible;
      color: white;
      font-weight: 900;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      transform-origin: center;
      will-change: transform, opacity;
    }
    
    /* Slash line effect */
    .kana-fruit::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, transparent 30%, rgba(255, 255, 255, 0.9) 50%, transparent 70%);
      opacity: 0;
      border-radius: 50%;
      pointer-events: none;
      z-index: 100;
    }
    
    /* Cutting animation - active state */
    .kana-sliced::after {
      animation: slashCut 0.3s ease-in-out forwards !important;
    }
    
    .kana-sliced {
      animation: cutScale 0.6s ease-out forwards !important;
    }
    
    @keyframes slashCut {
      0% {
        opacity: 0;
        transform: scaleX(0.5);
      }
      40% {
        opacity: 1;
      }
      70% {
        opacity: 1;
      }
      100% {
        opacity: 0;
        transform: scaleX(1);
      }
    }
    
    @keyframes cutScale {
      0% {
        transform: scale(1) rotate(0deg);
      }
      100% {
        transform: scale(0.5) rotate(30deg) translateY(30px);
        opacity: 0;
      }
    }
    
    /* Strawberry - Red/Pink */
    .fruit-strawberry {
      background: radial-gradient(circle at 30% 30%, #ff6b9d, #ff1744);
      box-shadow: 0 2px 8px rgba(255, 23, 68, 0.45), inset -1px -1px 4px rgba(0, 0, 0, 0.2);
    }
    
    .fruit-strawberry::before {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 8px;
      height: 8px;
      background: rgba(255, 255, 255, 0.4);
      border-radius: 50%;
      pointer-events: none;
      z-index: 5;
    }
    
    /* Orange - Orange */
    .fruit-orange {
      background: radial-gradient(circle at 30% 30%, #ffb347, #ff8c00);
      box-shadow: 0 2px 8px rgba(255, 140, 0, 0.45), inset -1px -1px 4px rgba(0, 0, 0, 0.2);
    }
    
    /* Watermelon - Green/Red */
    .fruit-watermelon {
      background: radial-gradient(circle at 30% 30%, #ff6b6b, #c92a2a);
      border-color: #51cf66;
      border-width: 4px;
      box-shadow: 0 2px 8px rgba(201, 42, 42, 0.45), inset -1px -1px 4px rgba(0, 0, 0, 0.2);
    }
    
    /* Teal accent */
    .fruit-grape {
      background: radial-gradient(circle at 30% 30%, #b197fc, #7950f2);
      box-shadow: 0 2px 8px rgba(121, 80, 242, 0.45), inset -1px -1px 4px rgba(0, 0, 0, 0.2);
    }
    
    /* Apple - Red with shine */
    .fruit-apple {
      background: radial-gradient(circle at 30% 30%, #ff8787, #fa5252);
      box-shadow: 0 2px 8px rgba(250, 82, 82, 0.45), inset -1px -1px 4px rgba(0, 0, 0, 0.2);
    }
    
    .fruit-apple::before {
      content: '';
      position: absolute;
      top: 3px;
      left: 8px;
      width: 12px;
      height: 12px;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 50%;
      pointer-events: none;
      z-index: 5;
    }
    
    /* Lemon - Yellow */
    .fruit-lemon {
      background: radial-gradient(circle at 30% 30%, #ffe066, #ffd43b);
      box-shadow: 0 2px 8px rgba(255, 212, 59, 0.45), inset -1px -1px 4px rgba(0, 0, 0, 0.2);
      color: #333;
      text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.5);
    }
    
    /* Blueberry - Deep Blue */
    .fruit-blueberry {
      background: radial-gradient(circle at 30% 30%, #748ffc, #4c6ef5);
      box-shadow: 0 2px 8px rgba(76, 110, 245, 0.45), inset -1px -1px 4px rgba(0, 0, 0, 0.2);
    }
    
    /* Peach - Peach/Pink */
    .fruit-peach {
      background: radial-gradient(circle at 30% 30%, #ffc9c9, #ffa8a8);
      box-shadow: 0 2px 8px rgba(255, 168, 168, 0.45), inset -1px -1px 4px rgba(0, 0, 0, 0.2);
      color: #c92a2a;
    }
  `]
})
export class KanaNinjaComponent implements OnInit, OnDestroy {
  @ViewChild('gameInput') gameInput?: ElementRef;

  gameState: GameState = {
    score: 0,
    combo: 0,
    lives: 3,
    gameActive: false,
    difficulty: 'normal',
    kanaMode: 'hiragana',
    kanaList: [],
    highScore: 0,
    gameOver: false
  };

  selectedDifficulty: Difficulty = 'normal';
  selectedMode: KanaMode = 'hiragana';
  isPaused = false;
  currentTheme: Theme = 'light';
  showHowToPlayModal = false;
  dontShowHowToPlayAgain = false;
  isCountingDown = false;
  countdownNumber: number = 3;
  countdownDisplay: string = '';

  // Typing game properties
  currentKana: FallingKana | null = null;
  userInput: string = '';
  correctMessage: boolean = false;
  wrongMessage: boolean = false;
  lastPoints: number = 0;
  matchingKana: FallingKana | null = null;
  soundEnabled = true;
  leaderboardEntries: KanaLeaderboardEntry[] = [];
  myLeaderboardEntry: MyKanaLeaderboardEntry | null = null;
  private readonly hideHowToPlayStorageKey = 'kanaNinjaHideHowToPlay';
  private howToPlayPausedGame = false;
  
  private feedbackTimeout: any;
  private countdownInterval: any;

  constructor(
    private kanaGameService: KanaGameService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.soundEnabled = this.kanaGameService.isSoundEnabled();

    this.themeService.theme$.subscribe((theme: Theme) => {
      this.currentTheme = theme;
    });

    this.kanaGameService.gameState$.subscribe((state: GameState) => {
      this.gameState = state;
      this.updateCurrentKana();
      
      // Check for game over
      if (state.gameOver) {
        this.userInput = '';
      }
    });

    this.kanaGameService.leaderboard$.subscribe((entries) => {
      this.leaderboardEntries = entries;
    });

    this.kanaGameService.myLeaderboardEntry$.subscribe((entry) => {
      this.myLeaderboardEntry = entry;
    });

    this.kanaGameService.refreshLeaderboard();
  }

  ngOnDestroy(): void {
    if (this.feedbackTimeout) {
      clearTimeout(this.feedbackTimeout);
    }

    this.clearCountdownTimer();
    // Service is app-scoped, so force cleanup when leaving this page.
    this.kanaGameService.resetGame();
  }

  startGame(): void {
    this.userInput = '';
    this.correctMessage = false;
    this.wrongMessage = false;
    this.matchingKana = null;

    // Always initialize game first to show UI
    this.kanaGameService.initializeGame(this.selectedDifficulty, this.selectedMode);
    // Pause it immediately before countdown/modal
    this.kanaGameService.pauseGame();

    if (this.shouldShowHowToPlay()) {
      this.openHowToPlayModal();
    } else {
      this.startCountdown();
    }
  }

  setDifficulty(diff: string): void {
    this.selectedDifficulty = diff as Difficulty;
  }

  setMode(mode: string): void {
    this.selectedMode = mode as KanaMode;
  }

  toggleSound(): void {
    this.soundEnabled = !this.soundEnabled;
    this.kanaGameService.setSoundEnabled(this.soundEnabled);
  }

  pauseGame(): void {
    this.isPaused = true;
    this.kanaGameService.pauseGame();
  }

  resumeGame(): void {
    this.isPaused = false;
    this.kanaGameService.resumeGame();
    this.gameInput?.nativeElement?.focus();
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (this.showHowToPlayModal && event.key === 'Escape') {
      this.closeHowToPlayModal();
      return;
    }

    // Only handle special keys
    if (event.key === 'Escape') {
      this.pauseGame();
    }
  }

  onInputChange(): void {
    if (!this.userInput.trim()) {
      this.matchingKana = null;
      return;
    }

    // Check if input matches ANY active kana
    const input = this.userInput.trim().toLowerCase();
    const activeKana = this.gameState.kanaList
      .filter((k) => !k.sliced)
      // Only match kana that are still in the visible flight arena.
      .filter((k) => k.y >= -k.size && k.y <= 600 + k.size);
    
    this.matchingKana = activeKana.find(k => k.romaji.toLowerCase() === input) || null;

    // Auto-submit when input matches any kana's romaji
    if (this.matchingKana) {
      this.submitAnswerForKana(this.matchingKana);
    }
  }

  submitAnswerForKana(kana: FallingKana): void {
    if (!kana || !this.userInput.trim()) {
      return;
    }

    const isCorrect = this.kanaGameService.checkAnswer(kana.id, this.userInput);
    
    if (isCorrect) {
      // Animation for correct answer
      this.correctMessage = true;
      this.lastPoints = this.calculatePoints(kana);
      this.userInput = '';
      this.matchingKana = null;
      this.updateCurrentKana();
      
      // Clear feedback after delay
      if (this.feedbackTimeout) {
        clearTimeout(this.feedbackTimeout);
      }
      this.feedbackTimeout = setTimeout(() => {
        this.correctMessage = false;
      }, 1500);
      
      // Focus back to input
      setTimeout(() => {
        this.gameInput?.nativeElement?.focus();
      }, 100);
    } else {
      // Show wrong message
      this.wrongMessage = true;
      // Clear input for retry
      this.userInput = '';
      this.matchingKana = null;
      
      if (this.feedbackTimeout) {
        clearTimeout(this.feedbackTimeout);
      }
      this.feedbackTimeout = setTimeout(() => {
        this.wrongMessage = false;
      }, 1000);
      
      setTimeout(() => {
        this.gameInput?.nativeElement?.focus();
      }, 100);
    }
  }

  playAgain(): void {
    this.isPaused = false;
    this.kanaGameService.resetGame();
    this.userInput = '';
    this.correctMessage = false;
    this.wrongMessage = false;
    this.matchingKana = null;
    
    // Initialize game to show UI, then pause for countdown
    this.kanaGameService.initializeGame(this.selectedDifficulty, this.selectedMode);
    this.kanaGameService.pauseGame();
    this.startCountdown();
  }

  exitToSelection(): void {
    this.clearCountdownTimer();
    this.isCountingDown = false;
    this.countdownDisplay = '';

    this.kanaGameService.resetGame();
    this.isPaused = false;
    this.showHowToPlayModal = false;
    this.howToPlayPausedGame = false;
    this.userInput = '';
    this.correctMessage = false;
    this.wrongMessage = false;
    this.matchingKana = null;
    this.currentKana = null;
  }

  private shouldShowHowToPlay(): boolean {
    return localStorage.getItem(this.hideHowToPlayStorageKey) !== 'true';
  }

  private openHowToPlayModal(): void {
    this.dontShowHowToPlayAgain = false;
    this.showHowToPlayModal = true;

    if (!this.isPaused) {
      this.kanaGameService.pauseGame();
      this.howToPlayPausedGame = true;
    }
  }

  showHowToPlayManually(): void {
    this.isPaused = true;
    this.dontShowHowToPlayAgain = false;
    this.showHowToPlayModal = true;
    this.kanaGameService.pauseGame();
    this.howToPlayPausedGame = true;
  }

  closeHowToPlayModal(): void {
    if (this.dontShowHowToPlayAgain) {
      localStorage.setItem(this.hideHowToPlayStorageKey, 'true');
    }

    this.showHowToPlayModal = false;

    if (this.howToPlayPausedGame) {
      this.howToPlayPausedGame = false;
      
      // If user opened manually during game (isPaused=true), just resume
      if (this.isPaused) {
        this.isPaused = false;
        this.kanaGameService.resumeGame();
        setTimeout(() => {
          this.gameInput?.nativeElement?.focus();
        }, 100);
      } else {
        // Otherwise start countdown (game just started)
        this.startCountdown();
      }
    }
  }

  private startCountdown(): void {
    this.clearCountdownTimer();
    this.isCountingDown = true;
    this.countdownNumber = 3;
    this.updateCountdownDisplay();

    this.countdownInterval = setInterval(() => {
      this.countdownNumber--;
      if (this.countdownNumber > 0) {
        this.updateCountdownDisplay();
      } else {
        this.clearCountdownTimer();
        this.isCountingDown = false;
        this.actuallyStartGame();
      }
    }, 1000);
  }

  private clearCountdownTimer(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  private updateCountdownDisplay(): void {
    const japaneseNumbers: { [key: number]: string } = {
      3: '三',
      2: '二',
      1: '一'
    };
    this.countdownDisplay = japaneseNumbers[this.countdownNumber] || '';
  }

  private actuallyStartGame(): void {
    // Game is already initialized, just resume it
    this.kanaGameService.resumeGame();
    setTimeout(() => {
      this.gameInput?.nativeElement?.focus();
    }, 100);
  }

  // Private helper methods
  private updateCurrentKana(): void {
    this.currentKana = this.kanaGameService.getCurrentKana();
  }

  private calculatePoints(kana: FallingKana): number {
    // Base calculation: 10 points + speed bonus (up to 100)
    const speedBonus = Math.max(0, 100 - Math.floor(kana.age! / 80));
    const basePoints = 10 + speedBonus;
    const comboBonus = this.gameState.combo * 5;
    return basePoints + comboBonus;
  }

  trackByKanaId(_: number, kana: FallingKana): string {
    return kana.id;
  }

}
