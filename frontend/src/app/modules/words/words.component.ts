import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VocabularyService } from '../../core/services/vocabulary.service';
import { ThemeService, Theme } from '../../core/services/theme.service';
import { JLPTLevel, TopicProgressSummary, Word } from '../../core/models/index';

interface WordListItem {
  id: string;
  word: string;
  reading: string;
  translation: string;
  lessonWordId?: string;
  topic?: string;
  lessonOrder?: number;
  wordOrder?: number;
  emoji?: string;
}

interface LessonPlayState {
  topic: string;
  lessonOrder: number;
  words: WordListItem[];
  currentWordIndex: number;
  showReading: boolean;
  showMeaning: boolean;
  learnedWords: Set<string>;
}

interface TestQuestion {
  id: string;
  type: 'word-to-meaning' | 'meaning-to-word';
  lessonWordId: string;
  question: string;
  correctAnswer: string;
  options: string[];
}

interface TestResults {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  passed: boolean;
  answers: Record<string, string>;
}

type WordsViewMode = 'browse' | 'structured' | 'lesson-play' | 'lesson-test';

@Component({
  selector: 'app-words',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen transition-colors duration-300 bg-light-bg dark:bg-dark-bg text-light-paragraph dark:text-dark-paragraph">
      <div class="container mx-auto px-4 py-8 max-w-6xl">
        <h1 class="text-5xl font-bold mb-8 text-center transition-colors text-primary dark:text-primary-dark">
          Words
        </h1>

        <div *ngIf="!selectedLevel" class="mb-8">
          <p class="mb-8 text-center transition-colors text-light-paragraph dark:text-dark-paragraph text-lg">
            Choose a JLPT level to start your journey
          </p>

          <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
            <button *ngFor="let level of jlptLevels"
                    (click)="selectLevel(level)"
                    class="bg-white dark:bg-slate-800 rounded-xl py-8 px-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-primary dark:hover:border-primary-dark group">
              <div class="text-3xl font-bold text-primary dark:text-primary-dark group-hover:scale-110 transition-transform">{{ level }}</div>
            </button>
          </div>
        </div>

        <div *ngIf="selectedLevel" class="mb-6">
          <button (click)="deselectLevel()"
                  class="mb-6 px-4 py-2 rounded-lg text-sm font-medium transition bg-white dark:bg-slate-800 text-light-headline dark:text-dark-headline hover:shadow-md shadow border border-gray-200 dark:border-gray-700">
            &larr; Back to Levels
          </button>

          <div class="text-center mb-8">
            <h2 class="text-4xl font-bold transition-colors text-light-headline dark:text-dark-headline mb-2">
              {{ selectedLevel }} Words
            </h2>
            <span class="text-lg font-medium transition-colors text-light-paragraph dark:text-dark-paragraph opacity-70">
              {{ totalResults }} words available
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button (click)="setViewMode('structured')"
                    class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg transition-all duration-300 border-2 group"
                    [class.border-primary]="viewMode === 'structured'"
                    [class.dark:border-primary-dark]="viewMode === 'structured'"
                    [class.border-transparent]="viewMode !== 'structured'"
                    [class.hover:border-primary]="viewMode !== 'structured'"
                    [class.dark:hover:border-primary-dark]="viewMode !== 'structured'"
                    [class.hover:shadow-2xl]="viewMode !== 'structured'"
                    [class.hover:scale-105]="viewMode !== 'structured'">
              <div class="text-2xl mb-2">📚</div>
              <h3 class="text-xl font-bold transition-colors text-light-headline dark:text-dark-headline mb-1">Structured Lessons</h3>
              <p class="text-sm text-light-paragraph dark:text-dark-paragraph opacity-70">Topic-based learning with tests</p>
            </button>
            <button (click)="setViewMode('browse')"
                    class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg transition-all duration-300 border-2 group"
                    [class.border-primary]="viewMode === 'browse'"
                    [class.dark:border-primary-dark]="viewMode === 'browse'"
                    [class.border-transparent]="viewMode !== 'browse'"
                    [class.hover:border-primary]="viewMode !== 'browse'"
                    [class.dark:hover:border-primary-dark]="viewMode !== 'browse'"
                    [class.hover:shadow-2xl]="viewMode !== 'browse'"
                    [class.hover:scale-105]="viewMode !== 'browse'">
              <div class="text-2xl mb-2">🔍</div>
              <h3 class="text-xl font-bold transition-colors text-light-headline dark:text-dark-headline mb-1">Free Browse</h3>
              <p class="text-sm text-light-paragraph dark:text-dark-paragraph opacity-70">Explore all words freely</p>
            </button>
            <a routerLink="/vocabulary"
               class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary dark:hover:border-primary-dark hover:scale-105 text-center">
              <div class="text-2xl mb-2">📝</div>
              <h3 class="text-xl font-bold transition-colors text-light-headline dark:text-dark-headline mb-1">My Vocabulary</h3>
              <p class="text-sm text-light-paragraph dark:text-dark-paragraph opacity-70">Review saved words</p>
            </a>
          </div>

          <div *ngIf="viewMode === 'structured'" class="space-y-6">
            <div *ngIf="selectedLevel !== 'N5'" class="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg border-2 border-orange-300 dark:border-orange-500 text-center">
              <div class="text-4xl mb-4">🚧</div>
              <h3 class="text-2xl font-bold text-light-headline dark:text-dark-headline mb-2">Coming Soon!</h3>
              <p class="text-light-paragraph dark:text-dark-paragraph">Structured lessons are ready for expansion and currently seeded for N5. You can still use Free Browse for {{ selectedLevel }}.</p>
            </div>

            <div *ngIf="selectedLevel === 'N5'" class="space-y-6">
              <div *ngIf="isLoadingLessonTopics" class="text-center py-8 text-light-paragraph dark:text-dark-paragraph">
                <div class="text-3xl mb-2">⏳</div>
                <p class="text-lg">Loading topics...</p>
              </div>
              <div *ngIf="!isLoadingLessonTopics && lessonTopics.length === 0" class="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg text-center">
                <p class="text-light-paragraph dark:text-dark-paragraph">No structured topics found for this level yet.</p>
              </div>

              <div *ngIf="lessonTopics.length > 0" class="space-y-6">
                <div *ngFor="let topic of lessonTopics" class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary dark:hover:border-primary-dark">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-2xl font-bold text-light-headline dark:text-dark-headline">{{ topic.topic }}</h3>
                    <span class="text-sm px-4 py-2 rounded-full bg-primary dark:bg-primary-dark text-white font-semibold shadow">
                      {{ topic.completedWords }} / {{ topic.totalWords }} completed
                    </span>
                  </div>
                  
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button *ngFor="let lesson of topic.lessons"
                            (click)="startLesson(topic.topic, lesson.lessonOrder); $event.stopPropagation()"
                            [disabled]="!lesson.isUnlocked"
                            [class.opacity-40]="!lesson.isUnlocked"
                            [class.cursor-not-allowed]="!lesson.isUnlocked"
                            class="flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-300 shadow hover:shadow-lg"
                            [ngClass]="lesson.isCompleted ? 'border-success bg-success bg-opacity-10 hover:bg-opacity-20' : 'border-gray-300 dark:border-gray-600 hover:border-primary dark:hover:border-primary-dark hover:scale-105'">
                      <span class="text-lg font-bold">Lesson {{ lesson.lessonOrder }}</span>
                      <span *ngIf="lesson.isCompleted" class="text-sm text-success font-semibold">✓ Completed</span>
                      <span *ngIf="!lesson.isCompleted && lesson.isUnlocked" class="text-sm font-medium text-primary dark:text-primary-dark">
                        ▶ Start
                      </span>
                      <span *ngIf="!lesson.isUnlocked" class="text-sm opacity-50">🔒 Locked</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- LESSON PLAY MODE -->
          <div *ngIf="viewMode === 'lesson-play' && lessonPlayState && getCurrentWord()" class="space-y-6">
            <button (click)="cancelLessonMode()"
                    class="px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-slate-800 text-light-headline dark:text-dark-headline hover:shadow-md shadow border border-gray-200 dark:border-gray-700 transition">
              &larr; Back to Lessons
            </button>

            <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border-2 border-primary dark:border-primary-dark transition-colors">
              <div class="flex justify-between items-center mb-8">
                <h2 class="text-3xl font-bold text-light-headline dark:text-dark-headline">
                  {{ lessonPlayState.topic }} - Lesson {{ lessonPlayState.lessonOrder }}
                </h2>
                <span class="text-base font-semibold opacity-70 bg-light-bg dark:bg-slate-700 px-4 py-2 rounded-full">
                  {{ lessonPlayState.currentWordIndex + 1 }} / {{ lessonPlayState.words.length }}
                </span>
              </div>

              <div class="flex flex-col items-center justify-center gap-8 mb-8 py-8">
                <div class="text-8xl animate-bounce">{{ getCurrentWord()?.emoji }}</div>
                <div class="text-center">
                  <h3 class="text-5xl font-bold text-light-headline dark:text-dark-headline mb-4">
                    {{ getCurrentWord()?.word }}
                  </h3>
                  <p *ngIf="lessonPlayState.showReading" class="text-2xl text-primary dark:text-primary-dark font-semibold">
                    {{ getCurrentWord()?.reading }}
                  </p>
                  <p *ngIf="!lessonPlayState.showReading" class="text-2xl text-light-paragraph dark:text-dark-paragraph opacity-40">
                    (reading hidden)
                  </p>
                </div>

                <div class="flex gap-3">
                  <button (click)="toggleReading()"
                          [title]="lessonPlayState.showReading ? 'Hide reading' : 'Show reading'"
                          class="w-12 h-12 rounded-full text-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 flex items-center justify-center"
                          [class.bg-primary]="lessonPlayState.showReading"
                          [class.dark:bg-primary-dark]="lessonPlayState.showReading"
                          [class.text-white]="lessonPlayState.showReading"
                          [class.border-2]="!lessonPlayState.showReading"
                          [class.border-gray-300]="!lessonPlayState.showReading"
                          [class.dark:border-gray-600]="!lessonPlayState.showReading"
                          [class.hover:border-primary]="!lessonPlayState.showReading"
                          [class.dark:hover:border-primary-dark]="!lessonPlayState.showReading">
                    👁️
                  </button>
                  <button (click)="toggleMeaning()"
                          [title]="lessonPlayState.showMeaning ? 'Hide meaning' : 'Show meaning'"
                          class="w-12 h-12 rounded-full text-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 flex items-center justify-center"
                          [class.bg-primary]="lessonPlayState.showMeaning"
                          [class.dark:bg-primary-dark]="lessonPlayState.showMeaning"
                          [class.text-white]="lessonPlayState.showMeaning"
                          [class.border-2]="!lessonPlayState.showMeaning"
                          [class.border-gray-300]="!lessonPlayState.showMeaning"
                          [class.dark:border-gray-600]="!lessonPlayState.showMeaning"
                          [class.hover:border-primary]="!lessonPlayState.showMeaning"
                          [class.dark:hover:border-primary-dark]="!lessonPlayState.showMeaning">
                    💭
                  </button>
                </div>

                <div *ngIf="lessonPlayState.showMeaning" class="mt-4 p-6 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white shadow-xl text-center text-2xl font-bold animate-fadeIn">
                  {{ getCurrentWord()?.translation }}
                </div>
              </div>

              <div class="flex justify-between items-center gap-4 mb-6">
                <button (click)="previousWord()"
                        [disabled]="lessonPlayState.currentWordIndex === 0"
                        title="Previous word"
                        class="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600 text-xl transition-all hover:border-primary dark:hover:border-primary-dark hover:shadow-lg hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:border-gray-300 dark:disabled:hover:border-gray-600 flex items-center justify-center">
                  ←
                </button>

                <div class="flex gap-2">
                  <button (click)="markWordLearned()"
                          title="Mark as learned"
                          class="px-6 py-2.5 rounded-lg border-2 text-base font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105"
                          [class.bg-success]="isWordLearned(getCurrentWord()!.id)"
                          [class.text-white]="isWordLearned(getCurrentWord()!.id)"
                          [class.border-success]="isWordLearned(getCurrentWord()!.id)"
                          [class.border-gray-300]="!isWordLearned(getCurrentWord()!.id)"
                          [class.dark:border-gray-600]="!isWordLearned(getCurrentWord()!.id)"
                          [class.hover:bg-success]="!isWordLearned(getCurrentWord()!.id)"
                          [class.hover:text-white]="!isWordLearned(getCurrentWord()!.id)"
                          [class.hover:border-success]="!isWordLearned(getCurrentWord()!.id)">
                    {{ isWordLearned(getCurrentWord()!.id) ? '✓' : '📌' }}
                  </button>
                  <button (click)="addFromList(getCurrentWord()!)"
                          [disabled]="savingId === getCurrentWord()!.id"
                          title="Add to vocabulary"
                          class="w-10 h-10 rounded-full border-2 border-primary dark:border-primary-dark text-xl transition-all shadow-lg hover:shadow-xl hover:scale-110 hover:bg-primary dark:hover:bg-primary-dark hover:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center">
                    {{ savingId === getCurrentWord()!.id ? '⏳' : '➕' }}
                  </button>
                  <button (click)="skipWord()"
                          title="Skip this word"
                          class="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600 text-xl transition-all hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-lg hover:scale-110 flex items-center justify-center">
                    ⏭️
                  </button>
                </div>

                <button (click)="nextWord()"
                        [disabled]="lessonPlayState.currentWordIndex >= lessonPlayState.words.length - 1"
                        title="Next word"
                        class="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600 text-xl transition-all hover:border-primary dark:hover:border-primary-dark hover:shadow-lg hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:border-gray-300 dark:disabled:hover:border-gray-600 flex items-center justify-center">
                  →
                </button>
              </div>

              <div class="pt-6 border-t-2 border-gray-200 dark:border-gray-700 space-y-3">
                <!-- Success/Error Messages -->
                <div *ngIf="successById[getCurrentWord()!.id]" class="p-4 rounded-lg bg-green-50 dark:bg-green-900 dark:bg-opacity-20 border-2 border-success animate-fadeIn">
                  <p class="text-success font-semibold text-center">✓ {{ successById[getCurrentWord()!.id] }}</p>
                </div>
                <div *ngIf="errorById[getCurrentWord()!.id]" class="p-4 rounded-lg bg-orange-50 dark:bg-orange-900 dark:bg-opacity-20 border-2 border-orange-400 dark:border-orange-500 animate-fadeIn">
                  <p class="text-orange-600 dark:text-orange-400 font-semibold text-center">⚠️ {{ errorById[getCurrentWord()!.id] }}</p>
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div class="bg-gradient-to-r from-primary to-primary-dark h-3 rounded-full transition-all duration-500"
                           [style.width.%]="(lessonPlayState.learnedWords.size / lessonPlayState.words.length) * 100"></div>
                    </div>
                    <p class="text-sm font-medium opacity-70 mt-2">{{ lessonPlayState.learnedWords.size }} / {{ lessonPlayState.words.length }} words learned</p>
                  </div>
                  <button *ngIf="allWordsLearned()"
                          (click)="startTest()"
                          class="ml-6 px-8 py-3 rounded-xl bg-success text-white font-bold text-base hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:scale-105">
                    ✓ Start Test
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- LESSON TEST MODE -->
          <div *ngIf="viewMode === 'lesson-test'" class="space-y-6">
            <button (click)="reviewWords()"
                    *ngIf="!testResults"
                    class="px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-slate-800 text-light-headline dark:text-dark-headline hover:shadow-md shadow border border-gray-200 dark:border-gray-700 transition">
              &larr; Back to Lesson
            </button>

            <!-- TEST IN PROGRESS -->
            <div *ngIf="!testResults" class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border-2 border-primary dark:border-primary-dark transition-colors">
              <div class="flex justify-between items-center mb-8">
                <h2 class="text-3xl font-bold text-light-headline dark:text-dark-headline">
                  Test: {{ lessonPlayState?.topic }} - Lesson {{ lessonPlayState?.lessonOrder }}
                </h2>
                <span class="text-base font-semibold opacity-70 bg-light-bg dark:bg-slate-700 px-4 py-2 rounded-full">
                  {{ currentTestQuestionIndex + 1 }} / {{ testQuestions.length }}
                </span>
              </div>

              <div class="mb-8">
                <p class="text-base opacity-70 mb-4 font-semibold">
                  {{ getCurrentTestQuestion()?.type === 'word-to-meaning' ? 'What does this reading mean?' : 'Which word means this?' }}
                </p>
                <div class="text-3xl font-bold text-light-headline dark:text-dark-headline p-8 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-xl text-center">
                  {{ getCurrentTestQuestion()?.question }}
                </div>
              </div>

              <div class="space-y-3 mb-8">
                <button *ngFor="let option of getCurrentTestQuestion()?.options"
                        (click)="selectTestAnswer(option)"
                        class="w-full p-4 rounded-xl border-2 text-left transition-all duration-300 font-medium text-lg shadow hover:shadow-lg"
                        [class.bg-primary]="getSelectedAnswer() === option"
                        [class.dark:bg-primary-dark]="getSelectedAnswer() === option"
                        [class.text-white]="getSelectedAnswer() === option"
                        [class.border-primary]="getSelectedAnswer() === option"
                        [class.dark:border-primary-dark]="getSelectedAnswer() === option"
                        [class.scale-105]="getSelectedAnswer() === option"
                        [class.border-gray-300]="getSelectedAnswer() !== option"
                        [class.dark:border-gray-600]="getSelectedAnswer() !== option"
                        [class.hover:border-primary]="getSelectedAnswer() !== option"
                        [class.dark:hover:border-primary-dark]="getSelectedAnswer() !== option"
                        [class.hover:scale-102]="getSelectedAnswer() !== option">
                  {{ option }}
                </button>
              </div>

              <div class="flex justify-between items-center gap-4">
                <button (click)="previousTestQuestion()"
                        [disabled]="currentTestQuestionIndex === 0"
                        class="px-5 py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-base font-medium transition-all hover:border-primary dark:hover:border-primary-dark hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed">
                  &larr; Previous
                </button>

                <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div class="bg-gradient-to-r from-primary to-primary-dark h-3 rounded-full transition-all duration-500"
                       [style.width.%]="((currentTestQuestionIndex + 1) / testQuestions.length) * 100"></div>
                </div>

                <button *ngIf="currentTestQuestionIndex < testQuestions.length - 1"
                        (click)="nextTestQuestion()"
                        class="px-5 py-2.5 rounded-lg border-2 border-primary dark:border-primary-dark text-base font-medium transition-all hover:shadow-lg hover:scale-105">
                  Next &rarr;
                </button>
                <button *ngIf="currentTestQuestionIndex === testQuestions.length - 1"
                        (click)="submitTest()"
                        [disabled]="isSubmittingTest || !getSelectedAnswer()"
                        class="px-8 py-3 rounded-xl bg-success text-white font-bold text-base hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100">
                  {{ isSubmittingTest ? '⏳ Submitting...' : '✓ Submit Test' }}
                </button>
              </div>
            </div>

            <!-- TEST RESULTS -->
            <div *ngIf="testResults" class="rounded-2xl shadow-2xl p-10 border-2 transition-colors"
                 [ngClass]="testResults.passed ? 'border-success bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 dark:bg-opacity-20' : 'border-orange-400 dark:border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900 dark:to-amber-900 dark:bg-opacity-20'">
              <div class="text-center mb-8">
                <div *ngIf="testResults.passed" class="text-8xl mb-6 animate-bounce">🎉</div>
                <div *ngIf="!testResults.passed" class="text-8xl mb-6">📝</div>
                
                <h2 class="text-4xl font-bold mb-4" [ngClass]="testResults.passed ? 'text-success' : 'text-orange-600 dark:text-orange-400'">
                  {{ testResults.passed ? 'Perfect! All Correct!' : 'Almost There!' }}
                </h2>
                
                <div class="text-5xl font-bold text-light-headline dark:text-dark-headline mb-3">
                  {{ testResults.score }}%
                </div>
                
                <p class="text-xl font-semibold opacity-80">
                  {{ testResults.correctAnswers }} of {{ testResults.totalQuestions }} correct
                </p>
              </div>

              <div class="mb-8 p-6 rounded-xl bg-white dark:bg-slate-800 shadow-lg space-y-3">
                <h3 class="font-bold text-xl text-light-headline dark:text-dark-headline mb-4">Review:</h3>
                <div *ngFor="let question of testQuestions" class="text-base border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0">
                  <div class="flex items-start gap-3">
                    <span *ngIf="testResults!.answers[question.id] === question.correctAnswer" class="text-success font-bold text-xl">✓</span>
                    <span *ngIf="testResults!.answers[question.id] !== question.correctAnswer" class="text-orange-600 dark:text-orange-400 font-bold text-xl">✗</span>
                    <div class="flex-1">
                      <p class="font-semibold mb-1">{{ question.question }}</p>
                      <p class="opacity-70 text-sm">Your answer: <span class="font-medium">{{ testResults!.answers[question.id] }}</span></p>
                      <p *ngIf="testResults!.answers[question.id] !== question.correctAnswer" class="text-success opacity-90 text-sm mt-1">Correct: <span class="font-medium">{{ question.correctAnswer }}</span></p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex gap-4">
                <button (click)="reviewWords()"
                        class="flex-1 px-6 py-3 rounded-xl border-2 border-primary dark:border-primary-dark text-base font-semibold transition-all hover:bg-primary dark:hover:bg-primary-dark hover:text-white shadow-lg hover:shadow-xl hover:scale-105">
                  📖 Review Words
                </button>
                <button (click)="retakeTest()"
                        *ngIf="!testResults.passed"
                        class="flex-1 px-6 py-3 rounded-xl bg-primary dark:bg-primary-dark text-white text-base font-semibold transition-all hover:opacity-90 shadow-lg hover:shadow-xl hover:scale-105">
                  🔄 Retake Test
                </button>
                <button (click)="cancelLessonMode()"
                        class="flex-1 px-6 py-3 rounded-xl bg-success text-white text-base font-semibold transition-all hover:opacity-90 shadow-lg hover:shadow-xl hover:scale-105">
                  ✓ Done
                </button>
              </div>
            </div>
          </div>

          <!-- WORD LIST VIEW (browse only) -->
          <ng-container *ngIf="viewMode === 'browse'">
            <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
              <div class="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                <input [(ngModel)]="searchTerm"
                       (input)="onSearchChange()"
                       class="w-full md:max-w-xl rounded-lg px-4 py-3 border-2 border-gray-300 dark:border-gray-600 transition focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-light-bg dark:bg-slate-700 text-light-paragraph dark:text-dark-paragraph placeholder-gray-400 dark:placeholder-gray-500 text-base shadow-sm"
                       placeholder="Search word, reading, translation...">
              </div>
            </div>

            <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors overflow-hidden">
              <div class="divide-y divide-gray-200 dark:divide-gray-700">
                <div *ngFor="let item of paginatedWords"
                     (click)="toggleExpand(item.id)"
                     [class.bg-light-bg]="expandedId === item.id && currentTheme === 'light'"
                     [class.dark:bg-slate-700]="expandedId === item.id"
                     class="px-6 py-4 hover:bg-light-bg dark:hover:bg-slate-700 transition-all cursor-pointer group relative">
                  <div class="flex items-center gap-4 justify-between">
                    <div class="flex-1 min-w-0 flex items-center gap-4">
                      <span *ngIf="item.emoji" class="text-2xl">{{ item.emoji }}</span>
                      <h2 class="text-2xl font-bold transition-colors text-light-headline dark:text-dark-headline">{{ item.word }}</h2>
                      <p class="text-base transition-colors text-primary dark:text-primary-dark font-medium">{{ item.reading }}</p>
                      <span class="text-base transition-colors text-light-paragraph dark:text-dark-paragraph opacity-70">{{ item.translation }}</span>
                    </div>

                    <div class="flex items-center gap-3 flex-shrink-0">
                      <button (click)="addFromList(item); $event.stopPropagation()"
                              [disabled]="savingId === item.id"
                              [title]="savingId === item.id ? 'Adding...' : 'Add to vocabulary'"
                              class="w-9 h-9 rounded-full flex items-center justify-center transition-all border-2 border-primary dark:border-primary-dark text-primary dark:text-primary-dark hover:bg-primary dark:hover:bg-primary-dark hover:text-white hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-transparent disabled:hover:text-primary dark:disabled:hover:text-primary-dark shadow-sm hover:shadow-md">
                        <span class="text-lg leading-none font-bold">{{ savingId === item.id ? '...' : '+' }}</span>
                      </button>
                      <span class="text-xl transition-transform" [class.rotate-180]="expandedId === item.id">▼</span>
                    </div>
                  </div>

                  <div *ngIf="expandedId === item.id"
                       class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-fadeIn"
                       (click)="$event.stopPropagation()">
                    <p *ngIf="successById[item.id]" class="text-sm text-success font-semibold bg-green-50 dark:bg-green-900 dark:bg-opacity-20 px-3 py-2 rounded-lg">
                      ✓ {{ successById[item.id] }}
                    </p>
                    <p *ngIf="errorById[item.id]" class="text-sm text-orange-600 dark:text-orange-400 font-semibold bg-orange-50 dark:bg-orange-900 dark:bg-opacity-20 px-3 py-2 rounded-lg">
                      ⚠️ {{ errorById[item.id] }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="totalPages > 0" class="flex items-center justify-between mt-6 px-6 py-4 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 transition-colors shadow-lg">
              <button (click)="previousPage()"
                      [disabled]="currentPage === 1"
                      class="px-5 py-2.5 rounded-lg transition font-semibold text-base bg-light-bg dark:bg-slate-700 text-light-headline dark:text-dark-headline hover:shadow-md shadow-sm border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed">
                &larr; Previous
              </button>

              <div class="flex items-center gap-3">
                <span class="text-base transition-colors text-light-paragraph dark:text-dark-paragraph font-medium">
                  Page <span class="font-bold text-lg">{{ currentPage }}</span> of <span class="font-bold text-lg">{{ totalPages }}</span>
                </span>
                <span class="text-sm transition-colors text-light-paragraph dark:text-dark-paragraph opacity-70 ml-2">
                  ({{ totalResults }} results)
                </span>
              </div>

              <button (click)="nextPage()"
                      [disabled]="currentPage === totalPages"
                      class="px-5 py-2.5 rounded-lg transition font-semibold text-base bg-light-bg dark:bg-slate-700 text-light-headline dark:text-dark-headline hover:shadow-md shadow-sm border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed">
                Next &rarr;
              </button>
            </div>

            <p *ngIf="filteredWords.length === 0"
               class="text-center py-12 transition-colors text-light-paragraph dark:text-dark-paragraph text-lg">
              No words match your search.
            </p>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-fadeIn {
      animation: fadeIn 0.2s ease-out;
    }

    .rotate-180 {
      transform: rotate(180deg);
    }
  `],
})
export class WordsComponent implements OnInit {
  currentTheme: Theme = 'light';
  searchTerm = '';
  savingId: string | null = null;
  successById: Record<string, string> = {};
  errorById: Record<string, string> = {};
  expandedId: string | null = null;

  jlptLevels: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];
  selectedLevel: JLPTLevel | null = null;

  viewMode: WordsViewMode = 'structured';
  dailyLimitOptions = [5, 10, 15, 20, 30];
  dailyLimit = 10;

  browseWords: WordListItem[] = [];
  structuredWords: WordListItem[] = [];

  lessonTopics: TopicProgressSummary[] = [];
  selectedTopic: string | null = null;
  structuredRemainingWords = 0;
  isLoadingLessonTopics = false;
  isLoadingDailyLesson = false;

  currentPage = 1;
  itemsPerPage = 30;

  // Lesson playback properties
  lessonPlayState: LessonPlayState | null = null;
  
  // Test properties
  testQuestions: TestQuestion[] = [];
  currentTestQuestionIndex = 0;
  testResults: TestResults | null = null;
  userTestAnswers: Record<string, string> = {};
  isSubmittingTest = false;

  get activeWords(): WordListItem[] {
    return this.viewMode === 'structured' ? this.structuredWords : this.browseWords;
  }

  get filteredWords(): WordListItem[] {
    const query = this.searchTerm.trim().toLowerCase();
    if (!query) {
      return this.activeWords;
    }

    return this.activeWords.filter(item =>
      item.word.includes(this.searchTerm.trim()) ||
      item.reading.includes(this.searchTerm.trim()) ||
      item.translation.toLowerCase().includes(query)
    );
  }

  get totalPages(): number {
    return Math.ceil(this.filteredWords.length / this.itemsPerPage);
  }

  get paginatedWords(): WordListItem[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredWords.slice(startIndex, endIndex);
  }

  get totalResults(): number {
    return this.filteredWords.length;
  }

  constructor(
    private vocabularyService: VocabularyService,
    private themeService: ThemeService
  ) {
    this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  ngOnInit(): void {
    // Level selection is triggered by selectLevel method
  }

  selectLevel(level: JLPTLevel): void {
    this.selectedLevel = level;
    this.searchTerm = '';
    this.currentPage = 1;
    this.expandedId = null;
    this.selectedTopic = null;
    this.structuredWords = [];
    this.structuredRemainingWords = 0;

    this.loadWordsFromCSV(level);
    this.loadLessonTopics(level);
  }

  deselectLevel(): void {
    this.selectedLevel = null;
    this.browseWords = [];
    this.structuredWords = [];
    this.lessonTopics = [];
    this.selectedTopic = null;
    this.searchTerm = '';
    this.currentPage = 1;
    this.expandedId = null;
    this.successById = {};
    this.errorById = {};
  }

  setViewMode(mode: WordsViewMode): void {
    this.viewMode = mode;
    this.currentPage = 1;
    this.expandedId = null;
    this.searchTerm = '';

    if (mode === 'structured' && this.selectedLevel === 'N5') {
      if (this.lessonTopics.length === 0) {
        this.loadLessonTopics(this.selectedLevel);
      } else {
        this.ensureTopicSelectionAndLoadDaily();
      }
    }
  }

  private loadWordsFromCSV(level: string): void {
    const csvFile = `assets/${level.toLowerCase()}-words.csv`;
    fetch(csvFile)
      .then(response => response.text())
      .then(csvData => {
        this.parseCSV(csvData);
      })
      .catch(error => {
        console.error(`Error loading CSV file for ${level}:`, error);
        this.browseWords = [];
      });
  }

  private parseCSV(csvData: string): void {
    const lines = csvData.split('\n');
    const words: WordListItem[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = this.parseCSVLine(line);
      if (parts.length >= 3) {
        words.push({
          id: `w-${i}`,
          word: parts[0],
          reading: parts[1],
          translation: parts[2]
        });
      }
    }

    this.browseWords = words;
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim().replace(/^"|"$/g, ''));
    return result;
  }

  private loadLessonTopics(level: JLPTLevel): void {
    this.isLoadingLessonTopics = true;
    this.vocabularyService.getLessonTopics(level).subscribe({
      next: (topics) => {
        this.lessonTopics = topics;
        this.isLoadingLessonTopics = false;

        if (this.viewMode === 'structured' && level === 'N5') {
          this.ensureTopicSelectionAndLoadDaily();
        }
      },
      error: () => {
        this.lessonTopics = [];
        this.isLoadingLessonTopics = false;
      }
    });
  }

  private ensureTopicSelectionAndLoadDaily(): void {
    if (this.selectedLevel !== 'N5') {
      this.selectedTopic = null;
      this.structuredWords = [];
      this.structuredRemainingWords = 0;
      return;
    }

    if (this.lessonTopics.length === 0) {
      this.selectedTopic = null;
      this.structuredWords = [];
      this.structuredRemainingWords = 0;
      return;
    }

    const validTopic = this.selectedTopic && this.lessonTopics.some(t => t.topic === this.selectedTopic);
    if (!validTopic) {
      this.selectedTopic = this.lessonTopics[0].topic;
    }

    if (this.selectedTopic) {
      this.loadDailyLessonForTopic(this.selectedTopic);
    }
  }

  selectTopic(topic: string): void {
    this.selectedTopic = topic;
    this.currentPage = 1;
    this.expandedId = null;
    this.loadDailyLessonForTopic(topic);
  }

  onDailyLimitChange(): void {
    if (this.viewMode === 'structured' && this.selectedTopic) {
      this.currentPage = 1;
      this.expandedId = null;
      this.loadDailyLessonForTopic(this.selectedTopic);
    }
  }

  reloadStructuredData(): void {
    if (!this.selectedLevel) {
      return;
    }

    this.loadLessonTopics(this.selectedLevel);
    if (this.selectedTopic && this.selectedLevel === 'N5') {
      this.loadDailyLessonForTopic(this.selectedTopic);
    }
  }

  private loadDailyLessonForTopic(topic: string): void {
    if (!this.selectedLevel) {
      return;
    }

    this.isLoadingDailyLesson = true;
    this.vocabularyService.getDailyLesson(this.selectedLevel, topic, this.dailyLimit).subscribe({
      next: (payload) => {
        this.structuredWords = payload.words.map((word) => ({
          id: word.id,
          lessonWordId: word.id,
          topic: word.topic,
          lessonOrder: word.lessonOrder,
          wordOrder: word.wordOrder,
          word: word.word,
          reading: word.reading,
          translation: word.meaning,
          emoji: word.emoji,
        }));
        this.structuredRemainingWords = payload.remainingWords;
        this.isLoadingDailyLesson = false;
      },
      error: () => {
        this.structuredWords = [];
        this.structuredRemainingWords = 0;
        this.isLoadingDailyLesson = false;
      }
    });
  }

  getNextLessonLabel(topic: TopicProgressSummary): string {
    const firstIncomplete = topic.lessons.find(lesson => !lesson.isCompleted);
    if (!firstIncomplete) {
      return `Completed (${topic.lessons.length} lessons)`;
    }
    return `Lesson ${firstIncomplete.lessonOrder}`;
  }

  toggleExpand(id: string): void {
    this.expandedId = this.expandedId === id ? null : id;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.expandedId = null;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.expandedId = null;
    }
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.expandedId = null;
  }

  addFromList(item: WordListItem): void {
    this.savingId = item.id;
    this.successById[item.id] = '';
    this.errorById[item.id] = '';

    const word: Word = {
      id: `word-list-${item.id}`,
      text: item.word,
      reading: item.reading,
      meaning: item.translation,
      partOfSpeech: 'word'
    };

    const levelText = this.selectedLevel || 'N5';
    const modeText = this.viewMode === 'structured' && item.topic
      ? `structured lesson (${item.topic} L${item.lessonOrder})`
      : 'word list';
    const exampleSentence = `Learned from ${levelText} ${modeText}`;

    this.vocabularyService.addWord(word, exampleSentence).subscribe({
      next: () => {
        this.successById[item.id] = `Added "${word.text}" to your vocabulary`;
        this.savingId = null;

        if (this.viewMode === 'structured' && item.lessonWordId) {
          this.vocabularyService.completeLessonWord(item.lessonWordId).subscribe(() => {
            if (this.selectedLevel) {
              this.loadLessonTopics(this.selectedLevel);
            }
            if (this.selectedTopic) {
              this.loadDailyLessonForTopic(this.selectedTopic);
            }
          });
        }

        setTimeout(() => {
          this.successById[item.id] = '';
        }, 2500);
      },
      error: (err: { error?: string }) => {
        this.errorById[item.id] = err.error ?? 'Failed to add word. Please try again.';
        this.savingId = null;

        setTimeout(() => {
          this.errorById[item.id] = '';
        }, 5000);
      }
    });
  }

  // Lesson playback methods
  startLesson(topic: string, lessonOrder: number): void {
    if (!this.selectedLevel || this.selectedLevel !== 'N5') {
      return;
    }

    // Fetch lesson words from API
    this.vocabularyService.getTopicLessonWords(this.selectedLevel, topic, lessonOrder).subscribe({
      next: (words) => {
        if (words.length === 0) {
          console.error('No words found for this lesson');
          return;
        }

        const lessonWords: WordListItem[] = words.map((word) => ({
          id: word.id,
          lessonWordId: word.id,
          topic: word.topic,
          lessonOrder: word.lessonOrder,
          wordOrder: word.wordOrder,
          word: word.word,
          reading: word.reading,
          translation: word.meaning,
          emoji: word.emoji,
        }));

        this.lessonPlayState = {
          topic,
          lessonOrder,
          words: lessonWords,
          currentWordIndex: 0,
          showReading: false,
          showMeaning: false,
          learnedWords: new Set()
        };

        this.viewMode = 'lesson-play';
      },
      error: (err) => {
        console.error('Failed to load lesson words:', err);
      }
    });
  }

  cancelLessonMode(): void {
    this.lessonPlayState = null;
    this.viewMode = 'structured';
    this.testQuestions = [];
    this.testResults = null;
    this.userTestAnswers = {};
    this.currentTestQuestionIndex = 0;
  }

  getCurrentWord(): WordListItem | null {
    if (!this.lessonPlayState || this.lessonPlayState.currentWordIndex >= this.lessonPlayState.words.length) {
      return null;
    }
    return this.lessonPlayState.words[this.lessonPlayState.currentWordIndex];
  }

  nextWord(): void {
    if (!this.lessonPlayState) {
      return;
    }

    if (this.lessonPlayState.currentWordIndex < this.lessonPlayState.words.length - 1) {
      this.lessonPlayState.currentWordIndex++;
      this.lessonPlayState.showReading = false;
      this.lessonPlayState.showMeaning = false;
    }
  }

  previousWord(): void {
    if (!this.lessonPlayState) {
      return;
    }

    if (this.lessonPlayState.currentWordIndex > 0) {
      this.lessonPlayState.currentWordIndex--;
      this.lessonPlayState.showReading = false;
      this.lessonPlayState.showMeaning = false;
    }
  }

  toggleReading(): void {
    if (this.lessonPlayState) {
      this.lessonPlayState.showReading = !this.lessonPlayState.showReading;
    }
  }

  toggleMeaning(): void {
    if (this.lessonPlayState) {
      this.lessonPlayState.showMeaning = !this.lessonPlayState.showMeaning;
    }
  }

  isWordLearned(wordId: string): boolean {
    return this.lessonPlayState?.learnedWords.has(wordId) ?? false;
  }

  markWordLearned(): void {
    const currentWord = this.getCurrentWord();
    if (!this.lessonPlayState || !currentWord) {
      return;
    }

    this.lessonPlayState.learnedWords.add(currentWord.id);
    
    // Mark as complete in backend if we have lessonWordId
    if (currentWord.lessonWordId) {
      this.vocabularyService.completeLessonWord(currentWord.lessonWordId).subscribe(() => {
        // Reload lesson topics to reflect progress
        if (this.selectedLevel) {
          this.loadLessonTopics(this.selectedLevel);
        }
      });
    }

    // Move to next word
    this.nextWord();
  }

  skipWord(): void {
    this.nextWord();
  }

  allWordsLearned(): boolean {
    if (!this.lessonPlayState) {
      return false;
    }
    return this.lessonPlayState.learnedWords.size === this.lessonPlayState.words.length;
  }

  // Test methods
  startTest(): void {
    if (!this.lessonPlayState) {
      return;
    }

    this.testQuestions = this.generateTestQuestions();
    this.currentTestQuestionIndex = 0;
    this.userTestAnswers = {};
    this.testResults = null;
    this.viewMode = 'lesson-test';
  }

  generateTestQuestions(): TestQuestion[] {
    if (!this.lessonPlayState) {
      return [];
    }

    const questions: TestQuestion[] = [];
    const words = this.lessonPlayState.words;

    // Alternate between word-to-meaning and meaning-to-word
    words.forEach((word, index) => {
      const type = index % 2 === 0 ? 'word-to-meaning' : 'meaning-to-word';

      if (type === 'word-to-meaning') {
        // Question: what does this reading/word mean?
        // Show ONLY the reading (no emoji, no kanji - pure text challenge)
        const otherMeanings = words
          .filter(w => w.id !== word.id)
          .map(w => w.translation)
          .slice(0, 3);

        const options = [word.translation, ...otherMeanings].sort(() => Math.random() - 0.5);

        questions.push({
          id: `q-${index}`,
          type,
          lessonWordId: word.id,
          question: word.reading,
          correctAnswer: word.translation,
          options
        });
      } else {
        // Question: what word has this meaning?
        const otherWords = words
          .filter(w => w.id !== word.id)
          .map(w => w.word)
          .slice(0, 3);

        const options = [word.word, ...otherWords].sort(() => Math.random() - 0.5);

        questions.push({
          id: `q-${index}`,
          type,
          lessonWordId: word.id,
          question: word.translation,
          correctAnswer: word.word,
          options
        });
      }
    });

    return questions;
  }

  getCurrentTestQuestion(): TestQuestion | null {
    if (this.currentTestQuestionIndex >= this.testQuestions.length) {
      return null;
    }
    return this.testQuestions[this.currentTestQuestionIndex];
  }

  selectTestAnswer(answer: string): void {
    const question = this.getCurrentTestQuestion();
    if (question) {
      this.userTestAnswers[question.id] = answer;
    }
  }

  getSelectedAnswer(): string | null {
    const question = this.getCurrentTestQuestion();
    if (question) {
      return this.userTestAnswers[question.id] ?? null;
    }
    return null;
  }

  nextTestQuestion(): void {
    if (this.currentTestQuestionIndex < this.testQuestions.length - 1) {
      this.currentTestQuestionIndex++;
    }
  }

  previousTestQuestion(): void {
    if (this.currentTestQuestionIndex > 0) {
      this.currentTestQuestionIndex--;
    }
  }

  submitTest(): void {
    this.isSubmittingTest = true;

    let correctAnswers = 0;
    this.testQuestions.forEach(question => {
      const userAnswer = this.userTestAnswers[question.id];
      if (userAnswer === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / this.testQuestions.length) * 100);
    const passed = score === 100; // All answers must be correct

    this.testResults = {
      totalQuestions: this.testQuestions.length,
      correctAnswers,
      score,
      passed,
      answers: this.userTestAnswers
    };

    this.isSubmittingTest = false;
  }

  retakeTest(): void {
    this.testResults = null;
    this.userTestAnswers = {};
    this.currentTestQuestionIndex = 0;
    this.testQuestions = this.generateTestQuestions();
  }

  reviewWords(): void {
    this.viewMode = 'lesson-play';
    this.testResults = null;
    this.userTestAnswers = {};
    this.currentTestQuestionIndex = 0;
    this.testQuestions = [];
    
    if (this.lessonPlayState) {
      this.lessonPlayState.currentWordIndex = 0;
      this.lessonPlayState.showReading = false;
      this.lessonPlayState.showMeaning = false;
    }
  }
}
