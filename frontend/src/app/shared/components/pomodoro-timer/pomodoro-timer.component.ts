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
         [ngClass]="currentTheme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'"
         class="fixed bottom-4 right-4 rounded-lg shadow-2xl border z-50 transition-all"
         [class.w-80]="!minimized"
         [class.w-16]="minimized">
      
      <!-- Minimized View -->
      <div *ngIf="minimized" 
           (click)="minimized = false"
           class="p-3 cursor-pointer hover:bg-opacity-80 transition">
        <div class="text-center">
          <div class="text-2xl mb-1">🍅</div>
          <div [ngClass]="currentTheme === 'dark' ? 'text-slate-300' : 'text-slate-700'"
               class="text-xs font-mono">
            {{ formatTime(pomodoroState.timeRemaining) }}
          </div>
        </div>
      </div>

      <!-- Expanded View -->
      <div *ngIf="!minimized" class="p-4">
        <!-- Header -->
        <div class="flex justify-between items-center mb-4">
          <h3 [ngClass]="currentTheme === 'dark' ? 'text-slate-200' : 'text-slate-800'"
              class="font-bold flex items-center gap-2">
            <span class="text-xl">🍅</span>
            Pomodoro Timer
          </h3>
          <div class="flex gap-1">
            <button (click)="minimized = true"
                    [ngClass]="currentTheme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'"
                    class="text-lg leading-none transition"
                    title="Minimize">
              _
            </button>
            <button (click)="visible = false"
                    [ngClass]="currentTheme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'"
                    class="text-lg leading-none transition"
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
          <div [ngClass]="currentTheme === 'dark' ? 'text-slate-100' : 'text-slate-900'"
               class="text-5xl font-mono font-bold transition-colors">
            {{ formatTime(pomodoroState.timeRemaining) }}
          </div>
          <div [ngClass]="currentTheme === 'dark' ? 'text-slate-400' : 'text-slate-600'"
               class="text-sm mt-2 transition-colors">
            {{ pomodoroState.completedPomodoros }} / {{ pomodoroState.completedPomodoros + (4 - (pomodoroState.completedPomodoros % 4)) }} until long break
          </div>
        </div>

        <!-- Progress Bar -->
        <div [ngClass]="currentTheme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'"
             class="h-2 rounded-full mb-6 overflow-hidden transition-colors">
          <div [ngClass]="getPhaseBarColor()"
               class="h-full transition-all duration-1000"
               [style.width.%]="getProgress()">
          </div>
        </div>

        <!-- Controls -->
        <div class="flex gap-2 mb-4">
          <button *ngIf="pomodoroState.state === 'idle' || pomodoroState.state === 'paused'"
                  (click)="start()"
                  class="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition">
                  {{ pomodoroState.state === 'paused' ? 'Resume' : 'Start' }}
          </button>
          <button *ngIf="pomodoroState.state === 'running'"
                  (click)="pause()"
                  class="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition">
            Pause
          </button>
          <button (click)="reset()"
                  [ngClass]="currentTheme === 'dark' ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'"
                  class="px-4 py-2 rounded-lg font-medium transition">
            Reset
          </button>
          <button (click)="skip()"
                  [ngClass]="currentTheme === 'dark' ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'"
                  class="px-4 py-2 rounded-lg font-medium transition"
                  title="Skip to next phase">
            Skip
          </button>
        </div>

        <!-- Quick Actions -->
        <div class="flex gap-2 text-xs">
          <button (click)="startWork()"
                  [ngClass]="currentTheme === 'dark' ? 'bg-red-900 hover:bg-red-800 text-red-200' : 'bg-red-100 hover:bg-red-200 text-red-800'"
                  class="flex-1 py-1.5 rounded transition font-medium">
            Work (25m)
          </button>
          <button (click)="startShortBreak()"
                  [ngClass]="currentTheme === 'dark' ? 'bg-blue-900 hover:bg-blue-800 text-blue-200' : 'bg-blue-100 hover:bg-blue-200 text-blue-800'"
                  class="flex-1 py-1.5 rounded transition font-medium">
            Break (5m)
          </button>
          <button (click)="startLongBreak()"
                  [ngClass]="currentTheme === 'dark' ? 'bg-purple-900 hover:bg-purple-800 text-purple-200' : 'bg-purple-100 hover:bg-purple-200 text-purple-800'"
                  class="flex-1 py-1.5 rounded transition font-medium">
            Long (15m)
          </button>
        </div>

        <!-- Stats -->
        <div [ngClass]="currentTheme === 'dark' ? 'bg-slate-700 text-slate-300' : 'bg-slate-50 text-slate-700'"
             class="mt-4 p-3 rounded-lg text-center transition-colors">
          <div class="text-2xl font-bold">{{ pomodoroState.totalPomodoros }}</div>
          <div class="text-xs">Total Pomodoros Today</div>
          <button (click)="resetStats()"
                  [ngClass]="currentTheme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'"
                  class="text-xs mt-1 transition">
            Reset Stats
          </button>
        </div>
      </div>
    </div>

    <!-- Floating Toggle Button (when hidden) -->
    <button *ngIf="!visible"
            (click)="visible = true"
            class="fixed bottom-4 right-4 w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl z-50 transition-all hover:scale-110"
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
  }

  startShortBreak(): void {
    this.pomodoroService.startShortBreak();
  }

  startLongBreak(): void {
    this.pomodoroService.startLongBreak();
  }

  resetStats(): void {
    if (confirm('Reset today\'s pomodoro count?')) {
      this.pomodoroService.resetTotalPomodoros();
    }
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
