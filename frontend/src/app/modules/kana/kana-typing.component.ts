import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { KanaService, Kana } from '../../core/services/kana.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

type PracticeMode = 'hiragana' | 'katakana' | 'mixed' | 'custom';
type PracticeDirection = 'kana-to-romaji' | 'romaji-to-kana' | 'mixed-direction';
type QuestionDirection = 'kana-to-romaji' | 'romaji-to-kana';
type AppState = 'selection' | 'session-size' | 'practice' | 'session-end';
type SessionAttempt = { kanaId: number; character: string; romaji: string; type: 'hiragana' | 'katakana'; isCorrect: boolean; responseTime: number };

@Component({
  selector: 'app-kana-typing',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="themed-page min-h-screen bg-light-bg dark:bg-dark-bg">
      <div class="container mx-auto max-w-6xl px-4 py-8">
        <!-- Header -->
        <div class="mb-8 rounded-3xl border border-secondary/20 dark:border-success/20 bg-white/90 dark:bg-slate-900/90 p-6 sm:p-8 shadow-md">
          <div class="flex items-center gap-4 mb-4 flex-wrap">
            <a routerLink="/kana"
               class="px-4 py-2 bg-light-bg dark:bg-slate-800 hover:bg-primary hover:text-white text-light-headline dark:text-dark-headline rounded-lg transition font-medium border border-secondary/25 dark:border-success/25">
              ← Back
            </a>
            <h1 class="text-3xl sm:text-4xl font-bold text-light-headline dark:text-dark-headline">
              ⌨️ Typing Practice
            </h1>
          </div>
          <p class="text-light-paragraph dark:text-dark-paragraph">
            {{ state === 'selection' ? 'Select a practice mode and answer direction' : 'Answer each question to continue' }}
          </p>
        </div>

        <ng-container *ngIf="state === 'selection'">
          <!-- Mode Selection Buttons -->
          <div class="mb-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              <button
                (click)="selectMode('hiragana')"
                [class.border-primary]="selectedMode === 'hiragana'"
                [class.ring-2]="selectedMode === 'hiragana'"
                [class.ring-primary]="selectedMode === 'hiragana'"
                [class.bg-primary]="selectedMode === 'hiragana'"
                [class.text-white]="selectedMode === 'hiragana'"
                class="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg hover:shadow-xl border-2 border-transparent hover:border-primary transition font-medium text-lg">
                <div class="text-4xl mb-2">ひらがな</div>
                <div [class.text-light-headline]="selectedMode !== 'hiragana'" [class.dark:text-dark-headline]="selectedMode !== 'hiragana'">Hiragana</div>
                <div [class.text-light-paragraph]="selectedMode !== 'hiragana'" [class.dark:text-dark-paragraph]="selectedMode !== 'hiragana'" class="text-sm mt-1">46 characters</div>
              </button>
              <button
                (click)="selectMode('katakana')"
                [class.border-primary]="selectedMode === 'katakana'"
                [class.ring-2]="selectedMode === 'katakana'"
                [class.ring-primary]="selectedMode === 'katakana'"
                [class.bg-primary]="selectedMode === 'katakana'"
                [class.text-white]="selectedMode === 'katakana'"
                class="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg hover:shadow-xl border-2 border-transparent hover:border-primary transition font-medium text-lg">
                <div class="text-4xl mb-2">カタカナ</div>
                <div [class.text-light-headline]="selectedMode !== 'katakana'" [class.dark:text-dark-headline]="selectedMode !== 'katakana'">Katakana</div>
                <div [class.text-light-paragraph]="selectedMode !== 'katakana'" [class.dark:text-dark-paragraph]="selectedMode !== 'katakana'" class="text-sm mt-1">46 characters</div>
              </button>
              <button
                (click)="selectMode('mixed')"
                [class.border-primary]="selectedMode === 'mixed'"
                [class.ring-2]="selectedMode === 'mixed'"
                [class.ring-primary]="selectedMode === 'mixed'"
                [class.bg-primary]="selectedMode === 'mixed'"
                [class.text-white]="selectedMode === 'mixed'"
                class="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg hover:shadow-xl border-2 border-transparent hover:border-primary transition font-medium text-lg">
                <div class="text-4xl mb-2">🔀</div>
                <div [class.text-light-headline]="selectedMode !== 'mixed'" [class.dark:text-dark-headline]="selectedMode !== 'mixed'">Mixed</div>
                <div [class.text-light-paragraph]="selectedMode !== 'mixed'" [class.dark:text-dark-paragraph]="selectedMode !== 'mixed'" class="text-sm mt-1">Both scripts</div>
              </button>
              <button
                (click)="selectMode('custom')"
                [class.border-primary]="selectedMode === 'custom'"
                [class.ring-2]="selectedMode === 'custom'"
                [class.ring-primary]="selectedMode === 'custom'"
                [class.bg-primary]="selectedMode === 'custom'"
                [class.text-white]="selectedMode === 'custom'"
                class="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg hover:shadow-xl border-2 border-transparent hover:border-primary transition font-medium text-lg">
                <div class="text-4xl mb-2">✓</div>
                <div [class.text-light-headline]="selectedMode !== 'custom'" [class.dark:text-dark-headline]="selectedMode !== 'custom'">Custom</div>
                <div [class.text-light-paragraph]="selectedMode !== 'custom'" [class.dark:text-dark-paragraph]="selectedMode !== 'custom'" class="text-sm mt-1">Pick your own</div>
                <div *ngIf="customSelectedKana.length > 0" class="text-sm mt-1 opacity-90">{{ customSelectedKana.length }} selected</div>
              </button>
            </div>
          </div>

          <!-- Custom Selection Modal -->
          <div *ngIf="isCustomModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div class="w-full max-w-5xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-h-[90vh] overflow-hidden">
              <div class="flex items-center justify-between px-6 py-4 border-b border-secondary dark:border-slate-700">
                <h3 class="text-xl font-bold text-light-headline dark:text-dark-headline">Custom Practice Selection</h3>
                <button
                  (click)="closeCustomModal()"
                  class="px-3 py-1 rounded-lg bg-light-surface dark:bg-slate-700 text-light-headline dark:text-dark-headline hover:opacity-90 transition">
                  ✕
                </button>
              </div>

              <div class="px-6 py-4">
                <div class="flex gap-2 mb-4">
                  <button
                    (click)="customTab = 'hiragana'"
                    [class.bg-primary]="customTab === 'hiragana'"
                    [class.text-white]="customTab === 'hiragana'"
                    [class.bg-light-surface]="customTab !== 'hiragana'"
                    [class.dark:bg-slate-700]="customTab !== 'hiragana'"
                    class="px-4 py-2 rounded-lg transition font-medium">
                    ひらがな
                  </button>
                  <button
                    (click)="customTab = 'katakana'"
                    [class.bg-primary]="customTab === 'katakana'"
                    [class.text-white]="customTab === 'katakana'"
                    [class.bg-light-surface]="customTab !== 'katakana'"
                    [class.dark:bg-slate-700]="customTab !== 'katakana'"
                    class="px-4 py-2 rounded-lg transition font-medium">
                    カタカナ
                  </button>
                </div>

                <div class="flex flex-wrap items-center gap-2 mb-4">
                  <button
                    (click)="toggleCustomByType(true, customTab)"
                    class="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition text-sm font-medium">
                    Select All Visible
                  </button>
                  <button
                    (click)="toggleCustomByType(false, customTab)"
                    class="px-4 py-2 bg-light-surface dark:bg-slate-700 text-light-headline dark:text-dark-headline rounded-lg hover:opacity-90 transition text-sm font-medium">
                    Deselect All Visible
                  </button>
                  <span class="ml-auto text-sm text-light-paragraph dark:text-dark-paragraph">{{ customSelectedKana.length }} selected total</span>
                </div>

                <div class="max-h-[55vh] overflow-y-auto pr-1">
                  <div class="grid grid-cols-5 md:grid-cols-10 gap-2">
                    <button
                      *ngFor="let kana of (customTab === 'hiragana' ? customHiraganaKana : customKatakanaKana)"
                      (click)="toggleCustomKana(kana)"
                      [class.bg-primary]="isCustomKanaSelected(kana)"
                      [class.text-white]="isCustomKanaSelected(kana)"
                      [class.ring-2]="isCustomKanaSelected(kana)"
                      [class.ring-primary]="isCustomKanaSelected(kana)"
                      [class.bg-light-surface]="!isCustomKanaSelected(kana)"
                      [class.dark:bg-slate-700]="!isCustomKanaSelected(kana)"
                      class="aspect-square flex flex-col items-center justify-center p-2 rounded-lg border-2 border-secondary dark:border-slate-600 transition hover:scale-105">
                      <span class="font-bold text-lg">{{ kana.character }}</span>
                      <span class="text-xs opacity-60">{{ kana.romaji }}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div class="px-6 py-4 border-t border-secondary dark:border-slate-700 flex justify-end">
                <button
                  (click)="closeCustomModal()"
                  class="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition font-medium">
                  Done
                </button>
              </div>
            </div>
          </div>

          <!-- Direction Selection -->
          <div class="mb-8 max-w-3xl mx-auto">
            <h3 class="text-lg font-bold text-light-headline dark:text-dark-headline mb-3 text-center">Answer Direction</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                (click)="selectDirection('kana-to-romaji')"
                [class.bg-primary]="selectedDirection === 'kana-to-romaji'"
                [class.text-white]="selectedDirection === 'kana-to-romaji'"
                [class.ring-2]="selectedDirection === 'kana-to-romaji'"
                [class.ring-primary]="selectedDirection === 'kana-to-romaji'"
                [class.bg-white]="selectedDirection !== 'kana-to-romaji'"
                [class.dark:bg-slate-800]="selectedDirection !== 'kana-to-romaji'"
                class="p-4 rounded-lg border-2 border-transparent text-light-headline dark:text-dark-headline shadow transition font-medium hover:border-primary">
                Kana -> Romaji
              </button>
              <button
                (click)="selectDirection('romaji-to-kana')"
                [class.bg-primary]="selectedDirection === 'romaji-to-kana'"
                [class.text-white]="selectedDirection === 'romaji-to-kana'"
                [class.ring-2]="selectedDirection === 'romaji-to-kana'"
                [class.ring-primary]="selectedDirection === 'romaji-to-kana'"
                [class.bg-white]="selectedDirection !== 'romaji-to-kana'"
                [class.dark:bg-slate-800]="selectedDirection !== 'romaji-to-kana'"
                class="p-4 rounded-lg border-2 border-transparent text-light-headline dark:text-dark-headline shadow transition font-medium hover:border-primary">
                Romaji -> Kana
              </button>
              <button
                (click)="selectDirection('mixed-direction')"
                [class.bg-primary]="selectedDirection === 'mixed-direction'"
                [class.text-white]="selectedDirection === 'mixed-direction'"
                [class.ring-2]="selectedDirection === 'mixed-direction'"
                [class.ring-primary]="selectedDirection === 'mixed-direction'"
                [class.bg-white]="selectedDirection !== 'mixed-direction'"
                [class.dark:bg-slate-800]="selectedDirection !== 'mixed-direction'"
                class="p-4 rounded-lg border-2 border-transparent text-light-headline dark:text-dark-headline shadow transition font-medium hover:border-primary">
                Mixed
              </button>
            </div>
          </div>

          <!-- Play Button -->
          <div class="text-center">
            <button
              (click)="startPractice()"
              [disabled]="!selectedMode || (selectedMode === 'custom' && customSelectedKana.length === 0)"
              class="px-8 py-4 bg-primary hover:opacity-90 text-white rounded-lg transition font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed">
              ▶ {{ selectedMode ? 'Start ' + getModeLabel() + ' (' + getSelectedDirectionLabel() + ')' : 'Start Practice' }}
            </button>
          </div>
        </ng-container>

        <!-- SESSION SIZE SELECTION STATE -->
        <ng-container *ngIf="state === 'session-size'">
          <div class="max-w-3xl mx-auto">
            <h2 class="text-3xl font-bold text-light-headline dark:text-dark-headline mb-8 text-center">
              How many questions?
            </h2>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <button
                (click)="selectSessionSize(10)"
                [class.bg-primary]="sessionSize === 10"
                [class.text-white]="sessionSize === 10"
                [class.ring-2]="sessionSize === 10"
                [class.ring-primary]="sessionSize === 10"
                class="p-6 rounded-lg bg-white dark:bg-slate-800 border-2 border-secondary dark:border-slate-700 hover:border-primary transition shadow-lg font-bold text-xl">
                10
              </button>
              <button
                (click)="selectSessionSize(20)"
                [class.bg-primary]="sessionSize === 20"
                [class.text-white]="sessionSize === 20"
                [class.ring-2]="sessionSize === 20"
                [class.ring-primary]="sessionSize === 20"
                class="p-6 rounded-lg bg-white dark:bg-slate-800 border-2 border-secondary dark:border-slate-700 hover:border-primary transition shadow-lg font-bold text-xl">
                20
              </button>
              <button
                (click)="selectSessionSize(30)"
                [class.bg-primary]="sessionSize === 30"
                [class.text-white]="sessionSize === 30"
                [class.ring-2]="sessionSize === 30"
                [class.ring-primary]="sessionSize === 30"
                class="p-6 rounded-lg bg-white dark:bg-slate-800 border-2 border-secondary dark:border-slate-700 hover:border-primary transition shadow-lg font-bold text-xl">
                30
              </button>
              <button
                (click)="openCustomSessionSize()"
                [class.bg-primary]="sessionSize > 30"
                [class.text-white]="sessionSize > 30"
                [class.ring-2]="sessionSize > 30"
                [class.ring-primary]="sessionSize > 30"
                class="p-6 rounded-lg bg-white dark:bg-slate-800 border-2 border-secondary dark:border-slate-700 hover:border-primary transition shadow-lg font-bold text-xl">
                Custom
              </button>
            </div>

            <!-- Custom Session Size Input -->
            <div *ngIf="showCustomSessionSize" class="mb-8 max-w-md mx-auto">
              <div class="flex items-center gap-4 justify-center">
                <!-- Decrement Button -->
                <button
                  (click)="decrementCustomSession()"
                  [disabled]="customSessionInput <= 1"
                  class="w-14 h-14 flex items-center justify-center rounded-lg bg-light-surface dark:bg-slate-700 hover:bg-primary hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition shadow-lg">
                  <span class="text-2xl font-bold">−</span>
                </button>

                <!-- Display Value -->
                <div class="flex flex-col items-center">
                  <div class="text-5xl font-bold text-primary">{{ customSessionInput }}</div>
                  <div class="text-sm text-light-paragraph dark:text-dark-paragraph mt-1">Questions</div>
                </div>

                <!-- Increment Button -->
                <button
                  (click)="incrementCustomSession()"
                  [disabled]="customSessionInput >= 100"
                  class="w-14 h-14 flex items-center justify-center rounded-lg bg-light-surface dark:bg-slate-700 hover:bg-primary hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition shadow-lg">
                  <span class="text-2xl font-bold">+</span>
                </button>
              </div>

              <!-- Confirm Button -->
              <div class="mt-6 flex gap-2">
                <button
                  (click)="showCustomSessionSize = false"
                  class="flex-1 px-4 py-3 bg-light-surface dark:bg-slate-700 text-light-headline dark:text-dark-headline rounded-lg hover:opacity-90 transition font-medium">
                  Cancel
                </button>
                <button
                  (click)="selectSessionSize(customSessionInput)"
                  class="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition font-medium">
                  Confirm
                </button>
              </div>
            </div>

            <!-- Info Text -->
            <div class="text-center mb-8">
              <p *ngIf="sessionSize > 0" class="text-lg text-light-paragraph dark:text-dark-paragraph">
                Selected: <span class="font-bold text-primary">{{ sessionSize }} questions</span>
              </p>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-4 justify-center">
              <button
                (click)="backToSelection()"
                class="px-8 py-3 bg-light-surface dark:bg-slate-700 text-light-headline dark:text-dark-headline rounded-lg hover:opacity-90 transition font-medium">
                ← Back
              </button>
              <button
                (click)="startPracticeSession()"
                [disabled]="sessionSize === 0"
                class="px-8 py-3 bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition font-medium text-lg">
                ▶ Start Session
              </button>
            </div>
          </div>
        </ng-container>

        <!-- PRACTICE STATE -->
        <ng-container *ngIf="state === 'practice'">
          <!-- Progress Bar -->
          <div class="mb-6 max-w-3xl mx-auto">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-light-headline dark:text-dark-headline">
                Question {{ currentSessionIndex + 1 }} of {{ sessionSize }}
              </span>
              <span class="text-sm font-medium text-light-paragraph dark:text-dark-paragraph">
                {{ stats.correct }} ✓ · {{ stats.incorrect }} ✗
              </span>
            </div>
            <div class="w-full h-2 bg-light-surface dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                class="h-full bg-primary transition-all duration-300"
                [style.width.%]="(currentSessionIndex / sessionSize) * 100">
              </div>
            </div>
          </div>

          <!-- Practice Mode Info -->
          <div class="mb-6 text-center">
            <div class="inline-block px-4 py-2 bg-light-surface dark:bg-slate-700 rounded-lg">
              <span class="font-medium text-light-headline dark:text-dark-headline">
                {{ getModeLabel() }} · {{ getSelectedDirectionLabel() }}
                <span *ngIf="selectedMode === 'custom'">({{ customSelectedKana.length }} kana)</span>
              </span>
            </div>
          </div>

          <!-- Practice Area -->
          <div class="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-lg max-w-2xl mx-auto">
            <div *ngIf="loading$ | async" class="text-center py-8">
              <app-loading-spinner [size]="48" message="Loading practice data..."></app-loading-spinner>
            </div>

            <div *ngIf="!(loading$ | async) && currentKana" class="text-center">
              <div class="text-sm text-light-paragraph dark:text-dark-paragraph mb-3">
                {{ isKanaToRomajiQuestion() ? 'Kana -> Romaji' : 'Romaji -> Kana' }}
              </div>

              <!-- Question Display -->
              <div class="text-9xl font-bold text-primary mb-8 min-h-48 flex items-center justify-center">
                {{ isKanaToRomajiQuestion() ? currentKana.character : currentKana.romaji }}
              </div>

              <!-- Kana -> Romaji Input -->
              <div *ngIf="isKanaToRomajiQuestion()" class="mb-6">
                <input
                  #answerInput
                  [(ngModel)]="userAnswer"
                  (keyup.enter)="checkAnswer()"
                  [disabled]="showingResult"
                  type="text"
                  placeholder="Type the romaji..."
                  class="w-full px-6 py-4 rounded-lg border-2 border-secondary dark:border-slate-600 bg-white dark:bg-slate-700 text-light-headline dark:text-dark-headline focus:outline-none focus:ring-2 focus:ring-primary text-center text-2xl font-medium"
                  autofocus>
              </div>

              <!-- Romaji -> Kana Choices -->
              <div *ngIf="!isKanaToRomajiQuestion()" class="mb-6">
                <p class="text-light-paragraph dark:text-dark-paragraph mb-4">Select the correct kana:</p>
                <div class="grid grid-cols-2 gap-4 max-w-xl mx-auto">
                  <button
                    *ngFor="let option of answerOptions; let i = index"
                    (click)="selectKanaOption(option)"
                    [disabled]="showingResult"
                    [class.bg-primary]="selectedKanaOption?.id === option.id"
                    [class.text-white]="selectedKanaOption?.id === option.id"
                    [class.ring-2]="selectedKanaOption?.id === option.id"
                    [class.ring-primary]="selectedKanaOption?.id === option.id"
                    [class.bg-light-surface]="selectedKanaOption?.id !== option.id"
                    [class.dark:bg-slate-700]="selectedKanaOption?.id !== option.id"
                    class="relative px-6 py-6 rounded-xl hover:bg-primary hover:text-white text-light-headline dark:text-dark-headline shadow-lg transition text-4xl font-bold disabled:opacity-60 disabled:cursor-not-allowed">
                    <span class="absolute top-2 right-3 text-xs opacity-50">{{ i + 1 }}</span>
                    {{ option.character }}
                  </button>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-4 justify-center mb-6">
                <button
                  *ngIf="isKanaToRomajiQuestion()"
                  (click)="checkAnswer()"
                  [disabled]="!userAnswer.trim() || showingResult"
                  class="px-8 py-3 bg-primary hover:opacity-90 text-white rounded-lg transition font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed">
                  Check Answer
                </button>
                <button
                  (click)="skipQuestion()"
                  [disabled]="showingResult"
                  class="px-8 py-3 bg-light-surface dark:bg-slate-700 hover:opacity-90 text-light-headline dark:text-dark-headline rounded-lg transition font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed">
                  Skip
                </button>
                <button
                  (click)="endPractice()"
                  class="px-8 py-3 bg-red-600 hover:opacity-90 text-white rounded-lg transition font-medium text-lg">
                  End Session
                </button>
              </div>

              <!-- Result Feedback -->
              <div *ngIf="result"
                   class="mt-6 p-4 rounded-lg text-lg font-medium"
                   [class.bg-green-100]="result.correct"
                   [class.dark:bg-green-900]="result.correct"
                   [class.text-green-800]="result.correct"
                   [class.dark:text-green-200]="result.correct"
                   [class.bg-red-100]="!result.correct"
                   [class.dark:bg-red-900]="!result.correct"
                   [class.text-red-800]="!result.correct"
                   [class.dark:text-red-200]="!result.correct">
                <div class="flex items-center justify-center gap-2">
                  <span *ngIf="result.correct">✓</span>
                  <span *ngIf="!result.correct">✗</span>
                  <span>{{ result.message }}</span>
                </div>
                <div *ngIf="!result.correct" class="text-sm mt-2 opacity-80">
                  {{ isKanaToRomajiQuestion() ? 'Correct answer: ' + currentKana.romaji : 'Correct answer: ' + currentKana.character + ' (' + currentKana.romaji + ')' }}
                </div>
              </div>

              <!-- Stats -->
              <div class="mt-8 pt-6 border-t border-secondary dark:border-slate-700">
                <div class="flex justify-center gap-8 text-sm">
                  <div class="text-center">
                    <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ stats.correct }}</div>
                    <div class="text-light-paragraph dark:text-dark-paragraph">Correct</div>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-red-600 dark:text-red-400">{{ stats.incorrect }}</div>
                    <div class="text-light-paragraph dark:text-dark-paragraph">Incorrect</div>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-primary">{{ stats.total }}</div>
                    <div class="text-light-paragraph dark:text-dark-paragraph">Total</div>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ getAccuracy().toFixed(1) }}%</div>
                    <div class="text-light-paragraph dark:text-dark-paragraph">Accuracy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ng-container>

        <!-- SESSION END STATE -->
        <ng-container *ngIf="state === 'session-end' && sessionEndStats">
          <div class="max-w-3xl mx-auto">
            <!-- Celebration Header -->
            <div class="text-center mb-12">
              <div class="text-7xl mb-4">🎉</div>
              <h2 class="text-4xl font-bold text-light-headline dark:text-dark-headline mb-2">
                Session Complete!
              </h2>
              <p class="text-lg text-light-paragraph dark:text-dark-paragraph">
                Great work practicing {{ getModeLabel() }}
              </p>
            </div>

            <!-- Stats Card -->
            <div class="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-lg mb-8">
              <!-- Main Stats -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div class="text-center">
                  <div class="text-4xl font-bold text-primary mb-2">{{ sessionEndStats.accuracy.toFixed(1) }}%</div>
                  <div class="text-light-paragraph dark:text-dark-paragraph">Accuracy</div>
                </div>
                <div class="text-center">
                  <div class="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">{{ sessionEndStats.correct }}</div>
                  <div class="text-light-paragraph dark:text-dark-paragraph">Correct</div>
                </div>
                <div class="text-center">
                  <div class="text-4xl font-bold text-red-600 dark:text-red-400 mb-2">{{ sessionEndStats.incorrect }}</div>
                  <div class="text-light-paragraph dark:text-dark-paragraph">Incorrect</div>
                </div>
                <div class="text-center">
                  <div class="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">{{ sessionEndStats.avgResponseTime }}ms</div>
                  <div class="text-light-paragraph dark:text-dark-paragraph">Avg Time</div>
                </div>
              </div>

              <!-- Breakdown -->
              <div class="pt-8 border-t border-secondary dark:border-slate-700">
                <h3 class="font-bold text-light-headline dark:text-dark-headline mb-4">Breakdown</h3>
                <div class="flex flex-wrap gap-4">
                  <div class="flex-1 min-w-[120px] p-4 bg-light-surface dark:bg-slate-700 rounded-lg">
                    <div class="text-2xl font-bold text-green-600 mb-1">🟩</div>
                    <div class="text-light-paragraph dark:text-dark-paragraph text-sm">Strong</div>
                    <div class="text-2xl font-bold text-light-headline dark:text-dark-headline">
                      {{ sessionEndStats.strongCount || 0 }}
                    </div>
                  </div>
                  <div class="flex-1 min-w-[120px] p-4 bg-light-surface dark:bg-slate-700 rounded-lg">
                    <div class="text-2xl font-bold text-yellow-500 mb-1">🟨</div>
                    <div class="text-light-paragraph dark:text-dark-paragraph text-sm">Medium</div>
                    <div class="text-2xl font-bold text-light-headline dark:text-dark-headline">
                      {{ sessionEndStats.mediumCount || 0 }}
                    </div>
                  </div>
                  <div class="flex-1 min-w-[120px] p-4 bg-light-surface dark:bg-slate-700 rounded-lg">
                    <div class="text-2xl font-bold text-red-600 mb-1">🟥</div>
                    <div class="text-light-paragraph dark:text-dark-paragraph text-sm">Weak</div>
                    <div class="text-2xl font-bold text-light-headline dark:text-dark-headline">
                      {{ sessionEndStats.weakCount || 0 }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                (click)="practiceAgain()"
                class="px-8 py-4 bg-primary text-white rounded-lg hover:opacity-90 transition font-bold text-lg flex-1">
                ▶ Practice Again
              </button>
              <button
                (click)="changeDifficulty()"
                class="px-8 py-4 bg-light-surface dark:bg-slate-700 text-light-headline dark:text-dark-headline rounded-lg hover:opacity-90 transition font-medium text-lg flex-1">
                Change Mode
              </button>
              <button
                (click)="backToMenu()"
                class="px-8 py-4 bg-light-surface dark:bg-slate-700 text-light-headline dark:text-dark-headline rounded-lg hover:opacity-90 transition font-medium text-lg flex-1">
                Back to Menu
              </button>
            </div>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: []
})
export class KanaTypingComponent implements OnInit {
  @ViewChild('answerInput') answerInput!: ElementRef<HTMLInputElement>;

  // State management
  state: AppState = 'selection';
  selectedMode: PracticeMode | null = null;
  
  // Session management
  sessionSize: number = 0;
  currentSessionIndex: number = 0;
  sessionAttempts: SessionAttempt[] = [];
  sessionStartTime: number = 0;
  sessionEndStats: any = null;
  showCustomSessionSize = false;
  customSessionInput: number = 10;
  
  // Practice variables
  currentKana: Kana | null = null;
  userAnswer = '';
  result: { correct: boolean; message: string } | null = null;
  showingResult = false;
  startTime: number = 0;
  loading$ = this.kanaService.loading$;
  awaitingCorrection = false;
  selectedDirection: PracticeDirection = 'kana-to-romaji';
  currentQuestionDirection: QuestionDirection = 'kana-to-romaji';
  answerOptions: Kana[] = [];
  selectedKanaOption: Kana | null = null;

  // Custom selection
  customAvailableKana: Kana[] = [];
  customHiraganaKana: Kana[] = [];
  customKatakanaKana: Kana[] = [];
  customSelectedKana: Kana[] = [];
  isCustomModalOpen = false;
  customTab: 'hiragana' | 'katakana' = 'hiragana';

  stats = {
    correct: 0,
    incorrect: 0,
    total: 0
  };

  constructor(private kanaService: KanaService) {}

  ngOnInit(): void {
    this.loadCustomKanaOptions();
  }

  loadCustomKanaOptions(): void {
    this.kanaService.getAllKana().subscribe({
      next: (kana) => {
        this.customAvailableKana = kana;
        this.customHiraganaKana = kana.filter(item => item.type === 'hiragana');
        this.customKatakanaKana = kana.filter(item => item.type === 'katakana');

        // If user already entered practice state while kana was loading, continue once data is ready.
        if (this.state === 'practice' && !this.currentKana) {
          this.loadRandomKana();
        }
      },
      error: (err) => console.error('Error loading kana:', err)
    });
  }

  selectMode(mode: PracticeMode): void {
    this.selectedMode = mode;
    if (mode === 'custom') {
      this.customTab = 'hiragana';
      this.isCustomModalOpen = true;
    } else {
      this.isCustomModalOpen = false;
    }
  }

  selectDirection(direction: PracticeDirection): void {
    this.selectedDirection = direction;
  }

  closeCustomModal(): void {
    this.isCustomModalOpen = false;
  }

  toggleCustomKana(kana: Kana): void {
    const index = this.customSelectedKana.findIndex(k => k.id === kana.id);
    if (index > -1) {
      this.customSelectedKana.splice(index, 1);
    } else {
      this.customSelectedKana.push(kana);
    }
  }

  isCustomKanaSelected(kana: Kana): boolean {
    return this.customSelectedKana.some(k => k.id === kana.id);
  }

  toggleAllCustom(select: boolean): void {
    if (select) {
      this.customSelectedKana = [...this.customAvailableKana];
    } else {
      this.customSelectedKana = [];
    }
  }

  toggleCustomByType(select: boolean, type: 'hiragana' | 'katakana'): void {
    const visibleKana = type === 'hiragana' ? this.customHiraganaKana : this.customKatakanaKana;
    if (select) {
      const selectedIds = new Set(this.customSelectedKana.map(item => item.id));
      const kanaToAdd = visibleKana.filter(item => !selectedIds.has(item.id));
      this.customSelectedKana = [...this.customSelectedKana, ...kanaToAdd];
    } else {
      const visibleIds = new Set(visibleKana.map(item => item.id));
      this.customSelectedKana = this.customSelectedKana.filter(item => !visibleIds.has(item.id));
    }
  }

  startPractice(): void {
    this.state = 'session-size';
    this.sessionSize = 0;
    this.currentSessionIndex = 0;
    this.sessionAttempts = [];
    this.showCustomSessionSize = false;
  }

  selectSessionSize(size: number): void {
    if (size && size > 0 && size <= 100) {
      this.sessionSize = size;
      this.showCustomSessionSize = false;
    }
  }

  openCustomSessionSize(): void {
    this.customSessionInput = this.sessionSize > 30 ? this.sessionSize : 10;
    this.showCustomSessionSize = true;
  }

  incrementCustomSession(): void {
    if (this.customSessionInput < 100) {
      this.customSessionInput++;
    }
  }

  decrementCustomSession(): void {
    if (this.customSessionInput > 1) {
      this.customSessionInput--;
    }
  }

  startPracticeSession(): void {
    if (this.sessionSize === 0) return;

    this.state = 'practice';
    this.currentSessionIndex = 0;
    this.sessionAttempts = [];
    this.stats = { correct: 0, incorrect: 0, total: 0 };
    this.awaitingCorrection = false;
    this.answerOptions = [];
    this.sessionStartTime = Date.now();
    this.loadRandomKana();
  }

  backToSelection(): void {
    this.state = 'selection';
    this.sessionSize = 0;
    this.currentSessionIndex = 0;
    this.sessionAttempts = [];
  }

  loadRandomKana(): void {
    this.resetAnswer();
    const pool = this.getCurrentPracticePool();
    if (pool.length === 0) {
      return;
    }

    const candidates = this.currentKana
      ? pool.filter(kana => kana.id !== this.currentKana!.id)
      : pool;

    // If the pool only has one item, allow it to repeat.
    const source = candidates.length > 0 ? candidates : pool;
    const randomKana = source[Math.floor(Math.random() * source.length)];

    if (randomKana) {
      this.currentKana = randomKana;
      this.awaitingCorrection = false;
      this.currentQuestionDirection = this.resolveQuestionDirection();
      this.answerOptions = this.currentQuestionDirection === 'romaji-to-kana'
        ? this.buildKanaOptions(randomKana)
        : [];
      this.startTime = Date.now();
      if (this.isKanaToRomajiQuestion()) {
        setTimeout(() => this.focusInput(), 0);
      }
    }
  }

  private getCurrentPracticePool(): Kana[] {
    if (this.selectedMode === 'custom') {
      return this.customSelectedKana;
    }
    if (this.selectedMode === 'hiragana') {
      return this.customHiraganaKana;
    }
    if (this.selectedMode === 'katakana') {
      return this.customKatakanaKana;
    }
    if (this.selectedMode === 'mixed') {
      return this.customAvailableKana;
    }
    return [];
  }

  private resolveQuestionDirection(): QuestionDirection {
    if (this.selectedDirection === 'mixed-direction') {
      return Math.random() < 0.5 ? 'kana-to-romaji' : 'romaji-to-kana';
    }
    return this.selectedDirection;
  }

  private buildKanaOptions(correctKana: Kana): Kana[] {
    const practicePool = this.getCurrentPracticePool();
    const sameTypeInPool = this.shuffleKana(
      practicePool.filter(kana => kana.id !== correctKana.id && kana.type === correctKana.type),
    );
    const sameTypeGlobal = this.shuffleKana(
      this.customAvailableKana.filter(kana => kana.id !== correctKana.id && kana.type === correctKana.type),
    );
    const fallbackAny = this.shuffleKana(
      this.customAvailableKana.filter(kana => kana.id !== correctKana.id),
    );

    const distractors: Kana[] = [];
    const seenIds = new Set<string>([correctKana.id]);

    for (const source of [sameTypeInPool, sameTypeGlobal, fallbackAny]) {
      for (const kana of source) {
        if (seenIds.has(kana.id)) {
          continue;
        }
        distractors.push(kana);
        seenIds.add(kana.id);
        if (distractors.length === 3) {
          break;
        }
      }
      if (distractors.length === 3) {
        break;
      }
    }

    return this.shuffleKana([correctKana, ...distractors]);
  }

  private shuffleKana(items: Kana[]): Kana[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  isKanaToRomajiQuestion(): boolean {
    return this.currentQuestionDirection === 'kana-to-romaji';
  }

  skipQuestion(): void {
    this.loadRandomKana();
  }

  selectKanaOption(option: Kana): void {
    if (!this.currentKana || this.showingResult) {
      return;
    }

    // Show visual feedback that option is selected
    this.selectedKanaOption = option;

    const responseTime = Date.now() - this.startTime;
    const isCorrect = option.id === this.currentKana.id;
    this.processAnswer(isCorrect, responseTime);
  }

  checkAnswer(): void {
    if (!this.isKanaToRomajiQuestion() || !this.userAnswer.trim() || !this.currentKana || this.showingResult) {
      return;
    }

    const responseTime = Date.now() - this.startTime;
    const isCorrect = this.userAnswer.trim().toLowerCase() === this.currentKana.romaji.toLowerCase();
    this.processAnswer(isCorrect, responseTime);
  }

  private processAnswer(isCorrect: boolean, responseTime: number): void {
    if (!this.currentKana) {
      return;
    }

    // If user already missed this kana once, require correction but don't affect stats again.
    if (this.awaitingCorrection) {
      this.result = {
        correct: isCorrect,
        message: isCorrect ? 'Correct! Moving to next one.' : 'Select the correct answer to continue'
      };

      if (isCorrect) {
        this.showingResult = true;
        setTimeout(() => {
          this.loadRandomKana();
        }, 600);
      } else {
        this.showingResult = false;
        if (this.isKanaToRomajiQuestion()) {
          this.userAnswer = '';
          setTimeout(() => this.focusInput(), 0);
        }
      }
      return;
    }

    this.result = {
      correct: isCorrect,
      message: isCorrect ? 'Correct! 🎉' : 'Select the correct answer to continue'
    };

    this.stats.total++;
    if (isCorrect) {
      this.stats.correct++;
    } else {
      this.stats.incorrect++;
    }

    // Record to session attempts array instead of sending immediately
    this.sessionAttempts.push({
      kanaId: 0,
      character: this.currentKana.character,
      romaji: this.currentKana.romaji,
      type: this.currentKana.type,
      isCorrect,
      responseTime
    });

    this.showingResult = true;

    if (isCorrect) {
      setTimeout(() => {
        this.currentSessionIndex++;
        
        // Check if session is complete
        if (this.currentSessionIndex >= this.sessionSize) {
          this.finishSession();
        } else {
          this.loadRandomKana();
        }
      }, 600);
    } else {
      this.awaitingCorrection = true;
      this.showingResult = false;
      if (this.isKanaToRomajiQuestion()) {
        this.userAnswer = '';
        setTimeout(() => this.focusInput(), 0);
      }
    }
  }

  endPractice(): void {
    // Cancel current session and go back to selection
    this.state = 'selection';
    this.selectedMode = null;
    this.currentKana = null;
    this.result = null;
    this.awaitingCorrection = false;
    this.currentQuestionDirection = 'kana-to-romaji';
    this.answerOptions = [];
    this.stats = { correct: 0, incorrect: 0, total: 0 };
    this.sessionSize = 0;
    this.currentSessionIndex = 0;
    this.sessionAttempts = [];
    this.sessionEndStats = null;
  }

  private finishSession(): void {
    // Calculate session statistics
    const correct = this.stats.correct;
    const incorrect = this.stats.incorrect;
    const total = this.stats.total;
    const accuracy = total > 0 ? (correct / total) * 100 : 0;
    
    const sessionDuration = Date.now() - this.sessionStartTime;
    const avgResponseTime = this.sessionAttempts.length > 0
      ? Math.round(this.sessionAttempts.reduce((sum, a) => sum + a.responseTime, 0) / this.sessionAttempts.length)
      : 0;

    // Store stats for display
    this.sessionEndStats = {
      correct,
      incorrect,
      total,
      accuracy,
      avgResponseTime,
      sessionDuration,
      strongCount: 0,
      mediumCount: 0,
      weakCount: 0
    };

    // Send batch to backend
    this.kanaService.recordSessionAttempts({
      attempts: this.sessionAttempts,
      sessionSize: this.sessionSize,
      accuracy,
      avgResponseTime
    }).subscribe({
      next: (response: any) => {
        console.log('Session stats recorded:', response.sessionStats);
        
        // Update counts from response if available
        if (response.results) {
          const masteryCounts = { strong: 0, medium: 0, weak: 0 };
          response.results.forEach((result: any) => {
            if (result.masteryLevel === 'strong') masteryCounts.strong++;
            else if (result.masteryLevel === 'medium') masteryCounts.medium++;
            else if (result.masteryLevel === 'weak') masteryCounts.weak++;
          });
          this.sessionEndStats.strongCount = masteryCounts.strong;
          this.sessionEndStats.mediumCount = masteryCounts.medium;
          this.sessionEndStats.weakCount = masteryCounts.weak;
        }

        this.state = 'session-end';
      },
      error: (err) => {
        console.error('Error recording session:', err);
        this.state = 'session-end';
      }
    });
  }

  practiceAgain(): void {
    this.state = 'session-size';
    this.sessionSize = 0;
    this.currentSessionIndex = 0;
    this.sessionAttempts = [];
    this.sessionEndStats = null;
    this.stats = { correct: 0, incorrect: 0, total: 0 };
    this.showCustomSessionSize = false;
  }

  changeDifficulty(): void {
    this.state = 'selection';
    this.selectedMode = null;
    this.sessionSize = 0;
    this.currentSessionIndex = 0;
    this.sessionAttempts = [];
    this.sessionEndStats = null;
    this.stats = { correct: 0, incorrect: 0, total: 0 };
  }

  backToMenu(): void {
    this.state = 'selection';
    this.selectedMode = null;
    this.sessionSize = 0;
    this.currentSessionIndex = 0;
    this.sessionAttempts = [];
    this.sessionEndStats = null;
    this.stats = { correct: 0, incorrect: 0, total: 0 };
  }

  getModeLabel(): string {
    if (this.selectedMode === 'hiragana') return 'ひらがな Hiragana';
    if (this.selectedMode === 'katakana') return 'カタカナ Katakana';
    if (this.selectedMode === 'mixed') return '🔀 Mixed';
    if (this.selectedMode === 'custom') return '✓ Custom Selection';
    return 'Practice';
  }

  getSelectedDirectionLabel(): string {
    if (this.selectedDirection === 'kana-to-romaji') return 'Kana -> Romaji';
    if (this.selectedDirection === 'romaji-to-kana') return 'Romaji -> Kana';
    return 'Mixed Direction';
  }

  getAccuracy(): number {
    if (this.stats.total === 0) return 0;
    return (this.stats.correct / this.stats.total) * 100;
  }

  private resetAnswer(): void {
    this.userAnswer = '';
    this.result = null;
    this.showingResult = false;
    this.selectedKanaOption = null;
  }

  private focusInput(): void {
    if (this.answerInput) {
      this.answerInput.nativeElement.focus();
    }
  }
}
