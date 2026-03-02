import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PomodoroService, PomodoroState } from '../../../core/services/pomodoro.service';
import { ThemeService, Theme } from '../../../core/services/theme.service';

@Component({
  selector: 'app-pomodoro-timer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="visible" 
         class="fixed bottom-4 right-4 rounded-lg shadow-2xl border z-50 transition-all bg-white dark:bg-slate-800 border-secondary dark:border-success"
         [class.w-80]="!minimized"
         [class.w-16]="minimized">
      
      <!-- Minimized View -->
      <div *ngIf="minimized" 
           (click)="minimized = false"
           class="p-3 cursor-pointer hover:opacity-80 transition">
        <div class="text-center">
          <div class="text-2xl mb-1">🍅</div>
          <div class="text-xs font-mono text-light-paragraph dark:text-dark-paragraph">
            {{ formatTime(pomodoroState.timeRemaining) }}
          </div>
        </div>
      </div>

      <!-- Expanded View -->
      <div *ngIf="!minimized" class="p-4">
        <!-- Header -->
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold flex items-center gap-2 text-light-headline dark:text-dark-headline">
            <span class="text-xl">🍅</span>
            Pomodoro Timer
          </h3>
          <div class="flex gap-1">
            <button (click)="minimized = true"
                    class="text-lg leading-none transition text-light-paragraph dark:text-dark-paragraph hover:text-primary dark:hover:text-primary-dark"
                    title="Minimize">
              _
            </button>
            <button (click)="visible = false"
                    class="text-lg leading-none transition text-light-paragraph dark:text-dark-paragraph hover:text-primary dark:hover:text-primary-dark"
                    title="Close">
              ×
            </button>
          </div>
        </div>

        <!-- Phase Indicator -->
        <div class="text-center mb-4">
          <div [ngClass]="getPhaseColor()"
               class="inline-block px-4 py-2 rounded-full text-sm font-medium transition-colors">
            {{ getPhaseLabel() }}
          </div>
        </div>

        <!-- Timer Display -->
        <div class="text-center mb-6">
          <div class="text-5xl font-mono font-bold transition-colors text-light-headline dark:text-dark-headline">
            {{ formatTime(pomodoroState.timeRemaining) }}
          </div>
          <div class="text-sm mt-2 transition-colors text-light-paragraph dark:text-dark-paragraph">
            {{ pomodoroState.completedPomodoros }} / {{ pomodoroState.completedPomodoros + (4 - (pomodoroState.completedPomodoros % 4)) }} until long break
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="h-2 rounded-full mb-6 overflow-hidden transition-colors bg-secondary/20 dark:bg-success/20">
          <div [ngClass]="getPhaseBarColor()"
               class="h-full transition-all duration-1000"
               [style.width.%]="getProgress()">
          </div>
        </div>

        <!-- Controls -->
        <div class="flex gap-2 mb-4">
          <button *ngIf="pomodoroState.state === 'idle' || pomodoroState.state === 'paused'"
                  (click)="start()"
                  class="flex-1 bg-success hover:opacity-90 text-white font-medium py-2 px-4 rounded-lg transition">
                  {{ pomodoroState.state === 'paused' ? 'Resume' : 'Start' }}
          </button>
          <button *ngIf="pomodoroState.state === 'running'"
                  (click)="pause()"
                  class="flex-1 bg-yellow-600 hover:opacity-90 text-white font-medium py-2 px-4 rounded-lg transition">
            Pause
          </button>
          <button (click)="reset()"
                  class="px-4 py-2 rounded-lg font-medium transition bg-light-bg dark:bg-slate-700 text-light-headline dark:text-dark-headline hover:opacity-80">
            Reset
          </button>
          <button (click)="skip()"
                  class="px-4 py-2 rounded-lg font-medium transition bg-light-bg dark:bg-slate-700 text-light-headline dark:text-dark-headline hover:opacity-80"
                  title="Skip to next phase">
            Skip
          </button>
        </div>

        <!-- Quick Actions -->
        <div class="flex gap-2 text-xs">
          <button (click)="startWork()"
                  class="flex-1 py-1.5 rounded transition font-medium bg-red-600 hover:bg-red-700 text-white">
            Work (25m)
          </button>
          <button (click)="startShortBreak()"
                  class="flex-1 py-1.5 rounded transition font-medium bg-teal-600 hover:bg-teal-700 text-white">
            Break (5m)
          </button>
          <button (click)="startLongBreak()"
                  class="flex-1 py-1.5 rounded transition font-medium bg-violet-600 hover:bg-violet-700 text-white">
            Long (15m)
          </button>
        </div>

        <!-- Stats -->
        <div class="mt-4 p-3 rounded-lg text-center transition-colors bg-light-bg dark:bg-slate-700 text-light-headline dark:text-dark-headline">
          <div class="text-2xl font-bold">{{ pomodoroState.totalPomodoros }}</div>
          <div class="text-xs">Total Pomodoros Today</div>

          <button *ngIf="!showResetStatsConfirm"
                  (click)="showResetStatsConfirm = true"
                  class="text-xs mt-1 transition text-light-paragraph dark:text-dark-paragraph hover:text-primary dark:hover:text-primary-dark">
            Reset Stats
          </button>

          <div *ngIf="showResetStatsConfirm" class="mt-2">
            <p class="text-[11px] mb-2 text-light-paragraph dark:text-dark-paragraph">Reset today’s pomodoro count?</p>
            <div class="flex justify-center gap-2">
              <button (click)="cancelResetStats()"
                      class="px-2 py-1 text-xs rounded transition bg-light-bg dark:bg-slate-600 text-light-headline dark:text-dark-headline hover:opacity-80">
                Cancel
              </button>
              <button (click)="confirmResetStats()"
                      class="px-2 py-1 text-xs rounded transition bg-red-600 hover:bg-red-700 text-white">
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Toggle Button (when hidden) -->
    <button *ngIf="!visible"
            (click)="visible = true"
            class="fixed bottom-4 right-4 w-14 h-14 bg-secondary dark:bg-success hover:opacity-90 text-white rounded-full shadow-lg flex items-center justify-center text-2xl z-50 transition-all hover:scale-110"
            title="Show Pomodoro Timer">
      🍅
    </button>
  `,
  styles: [`
    :host {
      display: contents;
    }
  `]
})
export class PomodoroTimerComponent implements OnInit, OnDestroy {
  pomodoroState!: PomodoroState;
  visible = false;
  minimized = false;
  showResetStatsConfirm = false;
  currentTheme: Theme = 'light';
  
  private subscription = new Subscription();

  constructor(
    private pomodoroService: PomodoroService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.pomodoroService.state$.subscribe(state => {
        this.pomodoroState = state;
      })
    );

    this.subscription.add(
      this.themeService.theme$.subscribe(theme => {
        this.currentTheme = theme;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  start(): void {
    if (this.pomodoroState.state === 'idle') {
      if (this.pomodoroState.phase === 'work') {
        this.pomodoroService.startWork();
      } else if (this.pomodoroState.phase === 'shortBreak') {
        this.pomodoroService.startShortBreak();
      } else if (this.pomodoroState.phase === 'longBreak') {
        this.pomodoroService.startLongBreak();
      } else {
        this.pomodoroService.startWork();
      }
    } else {
      this.pomodoroService.resume();
    }
  }

  pause(): void {
    this.pomodoroService.pause();
  }

  reset(): void {
    this.pomodoroService.reset();
  }

  skip(): void {
    this.pomodoroService.skip();
  }

  startWork(): void {
    this.pomodoroService.startWork();
    this.showResetStatsConfirm = false;
  }

  startShortBreak(): void {
    this.pomodoroService.startShortBreak();
    this.showResetStatsConfirm = false;
  }

  startLongBreak(): void {
    this.pomodoroService.startLongBreak();
    this.showResetStatsConfirm = false;
  }

  cancelResetStats(): void {
    this.showResetStatsConfirm = false;
  }

  confirmResetStats(): void {
    this.pomodoroService.resetTotalPomodoros();
    this.showResetStatsConfirm = false;
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  getPhaseLabel(): string {
    switch (this.pomodoroState.phase) {
      case 'work':
        return '🎯 Focus Time';
      case 'shortBreak':
        return '☕ Short Break';
      case 'longBreak':
        return '🌴 Long Break';
      default:
        return 'Ready to Start';
    }
  }

  getPhaseColor(): string {
    const base = this.pomodoroState.phase === 'work' 
      ? 'bg-red-600 text-white'
      : this.pomodoroState.phase === 'shortBreak'
        ? 'bg-blue-600 text-white'
        : 'bg-purple-600 text-white';
    
    return this.currentTheme === 'dark' 
      ? base
      : base;
  }

  getPhaseBarColor(): string {
    return this.pomodoroState.phase === 'work'
      ? 'bg-red-500'
      : this.pomodoroState.phase === 'shortBreak'
        ? 'bg-blue-500'
        : 'bg-purple-500';
  }

  getProgress(): number {
    const total = this.pomodoroState.phase === 'work'
      ? 25 * 60
      : this.pomodoroState.phase === 'shortBreak'
        ? 5 * 60
        : 15 * 60;
    
    return ((total - this.pomodoroState.timeRemaining) / total) * 100;
  }
}
