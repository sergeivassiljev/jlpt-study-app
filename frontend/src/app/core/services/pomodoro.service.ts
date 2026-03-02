import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';

export type PomodoroPhase = 'work' | 'shortBreak' | 'longBreak' | 'idle';
export type TimerState = 'running' | 'paused' | 'idle';

export interface PomodoroState {
  phase: PomodoroPhase;
  state: TimerState;
  timeRemaining: number; // seconds
  completedPomodoros: number;
  totalPomodoros: number;
}

@Injectable({
  providedIn: 'root'
})
export class PomodoroService {
  private readonly WORK_DURATION = 25 * 60; // 25 minutes
  private readonly SHORT_BREAK_DURATION = 5 * 60; // 5 minutes
  private readonly LONG_BREAK_DURATION = 15 * 60; // 15 minutes
  private readonly POMODOROS_UNTIL_LONG_BREAK = 4;

  private timerSubscription?: Subscription;
  
  private stateSubject = new BehaviorSubject<PomodoroState>({
    phase: 'idle',
    state: 'idle',
    timeRemaining: this.WORK_DURATION,
    completedPomodoros: 0,
    totalPomodoros: 0,
  });

  readonly state$ = this.stateSubject.asObservable();

  constructor() {
    this.loadStateFromStorage();
  }

  startWork(): void {
    this.startPhase('work', this.WORK_DURATION);
  }

  startShortBreak(): void {
    this.startPhase('shortBreak', this.SHORT_BREAK_DURATION);
  }

  startLongBreak(): void {
    this.startPhase('longBreak', this.LONG_BREAK_DURATION);
  }

  pause(): void {
    this.timerSubscription?.unsubscribe();
    this.updateState({ state: 'paused' });
  }

  resume(): void {
    if (this.stateSubject.value.state === 'paused') {
      this.startTimer();
    }
  }

  reset(): void {
    this.timerSubscription?.unsubscribe();
    const currentState = this.stateSubject.value;
    const duration = this.getDurationForPhase(currentState.phase);
    this.updateState({
      state: 'idle',
      timeRemaining: duration,
    });
  }

  skip(): void {
    this.completePhase();
  }

  private startPhase(phase: PomodoroPhase, duration: number): void {
    this.timerSubscription?.unsubscribe();
    this.updateState({
      phase,
      state: 'running',
      timeRemaining: duration,
    });
    this.startTimer();
  }

  private startTimer(): void {
    this.updateState({ state: 'running' });
    
    this.timerSubscription = interval(1000).subscribe(() => {
      const currentState = this.stateSubject.value;
      const newTime = currentState.timeRemaining - 1;

      if (newTime <= 0) {
        this.completePhase();
      } else {
        this.updateState({ timeRemaining: newTime });
      }
    });
  }

  private completePhase(): void {
    this.timerSubscription?.unsubscribe();
    const currentState = this.stateSubject.value;

    // Play notification sound
    this.playNotificationSound();

    if (currentState.phase === 'work') {
      // Completed a work session
      const newCompleted = currentState.completedPomodoros + 1;
      const newTotal = currentState.totalPomodoros + 1;
      
      // Determine next phase
      if (newCompleted % this.POMODOROS_UNTIL_LONG_BREAK === 0) {
        // Time for long break
        this.updateState({
          phase: 'longBreak',
          state: 'idle',
          timeRemaining: this.LONG_BREAK_DURATION,
          completedPomodoros: newCompleted,
          totalPomodoros: newTotal,
        });
      } else {
        // Time for short break
        this.updateState({
          phase: 'shortBreak',
          state: 'idle',
          timeRemaining: this.SHORT_BREAK_DURATION,
          completedPomodoros: newCompleted,
          totalPomodoros: newTotal,
        });
      }
    } else {
      // Completed a break - back to work
      this.updateState({
        phase: 'work',
        state: 'idle',
        timeRemaining: this.WORK_DURATION,
      });
    }

    this.saveStateToStorage();
  }

  private getDurationForPhase(phase: PomodoroPhase): number {
    switch (phase) {
      case 'work':
        return this.WORK_DURATION;
      case 'shortBreak':
        return this.SHORT_BREAK_DURATION;
      case 'longBreak':
        return this.LONG_BREAK_DURATION;
      default:
        return this.WORK_DURATION;
    }
  }

  private updateState(partial: Partial<PomodoroState>): void {
    const newState = { ...this.stateSubject.value, ...partial };
    this.stateSubject.next(newState);
    this.saveStateToStorage();
  }

  private playNotificationSound(): void {
    // Create a simple beep sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.log('Audio notification not available');
    }
  }

  private saveStateToStorage(): void {
    localStorage.setItem('pomodoro-state', JSON.stringify(this.stateSubject.value));
  }

  private loadStateFromStorage(): void {
    const stored = localStorage.getItem('pomodoro-state');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Don't restore running state - always start as paused/idle
        if (parsed.state === 'running') {
          parsed.state = 'paused';
        }
        this.stateSubject.next(parsed);
      } catch (error) {
        console.log('Failed to parse stored pomodoro state');
      }
    }
  }

  resetTotalPomodoros(): void {
    this.updateState({
      completedPomodoros: 0,
      totalPomodoros: 0,
    });
  }
}
