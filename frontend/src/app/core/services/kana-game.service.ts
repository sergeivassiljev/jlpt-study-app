import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { KanaCharacter, HIRAGANA, KATAKANA } from '../data/kana-characters';
import { AuthService } from './auth.service';

export interface FallingKana {
  id: string;
  character: string;
  romaji: string;
  fruitClass?: string;
  renderTransform?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  sliced: boolean;
  spawnTime: number;
  age: number;
  sliceTime?: number;
}

export type Difficulty = 'easy' | 'normal' | 'hard';
export type KanaMode = 'hiragana' | 'katakana' | 'mixed';

export interface GameState {
  score: number;
  combo: number;
  lives: number;
  gameActive: boolean;
  difficulty: Difficulty;
  kanaMode: KanaMode;
  kanaList: FallingKana[];
  highScore: number;
  gameOver: boolean;
}

export interface KanaLeaderboardEntry {
  rank: number;
  userId: string;
  email: string;
  bestScore: number;
  bestScoreAt: string | null;
  isCurrentUser?: boolean;
}

export interface MyKanaLeaderboardEntry {
  userId: string;
  email: string;
  bestScore: number;
  rank: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class KanaGameService {
  private readonly apiBaseUrl = 'http://localhost:3000';
  private readonly soundEnabledStorageKey = 'kanaNinjaSoundEnabled';
  private readonly highScoreStoragePrefix = 'kanaGameHighScore';

  private gameStateSubject = new BehaviorSubject<GameState>({
    score: 0,
    combo: 0,
    lives: 3,
    gameActive: false,
    difficulty: 'normal',
    kanaMode: 'hiragana',
    kanaList: [],
    highScore: this.getHighScore(),
    gameOver: false
  });

  private leaderboardSubject = new BehaviorSubject<KanaLeaderboardEntry[]>([]);
  private myLeaderboardEntrySubject = new BehaviorSubject<MyKanaLeaderboardEntry | null>(null);

  gameState$ = this.gameStateSubject.asObservable();
  leaderboard$ = this.leaderboardSubject.asObservable();
  myLeaderboardEntry$ = this.myLeaderboardEntrySubject.asObservable();

  private gameState = this.gameStateSubject.value;
  private gameLoopInterval: any;
  private spawnInterval: any;
  private nextKanaId = 0;
  private lastUpdateTimestamp = 0;
  private activeAudioContexts = new Set<any>();
  private soundEnabled = true;

  private readonly CANVAS_WIDTH = 800;
  private readonly CANVAS_HEIGHT = 600;
  private readonly PHYSICS_STEP_MS = 30;
  private readonly TARGET_FRAME_MS = 20;

  private difficultySettings = {
    easy: {
      spawnRate: 2800,
      size: 64,
      gravity: 0.1,
      maxKana: 1,
      comboMultiplier: 1,
      launchVelocityMin: 8.5,
      launchVelocityMax: 10,
      horizontalDrift: 0.7,
      maxKanaAge: 18000
    },
    normal: {
      spawnRate: 2100,
      size: 58,
      gravity: 0.14,
      maxKana: 2,
      comboMultiplier: 1.2,
      launchVelocityMin: 9.5,
      launchVelocityMax: 11.5,
      horizontalDrift: 1,
      maxKanaAge: 14000
    },
    hard: {
      spawnRate: 1500,
      size: 52,
      gravity: 0.19,
      maxKana: 3,
      comboMultiplier: 1.5,
      launchVelocityMin: 10.5,
      launchVelocityMax: 12.8,
      horizontalDrift: 1.3,
      maxKanaAge: 11000
    }
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {
    this.loadHighScore();
    this.soundEnabled = this.loadSoundEnabled();

    this.authService.user$.subscribe(() => {
      this.syncUserScopedState();
      this.refreshLeaderboard();
    });

    this.syncUserScopedState();
    this.refreshLeaderboard();
  }

  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    localStorage.setItem(this.soundEnabledStorageKey, String(enabled));

    if (!enabled) {
      this.stopAllSounds();
    }
  }

  isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  refreshLeaderboard(limit = 10): void {
    this.http
      .get<KanaLeaderboardEntry[]>(`${this.apiBaseUrl}/kana/leaderboard?limit=${Math.max(1, Math.floor(limit) || 10)}`)
      .pipe(catchError(() => of([] as KanaLeaderboardEntry[])))
      .subscribe((entries) => {
        const currentUserId = this.authService.getCurrentUserId();
        this.leaderboardSubject.next(
          entries.map((entry) => ({
            ...entry,
            isCurrentUser: currentUserId ? entry.userId === currentUserId : false,
          }))
        );
      });
  }

  initializeGame(difficulty: Difficulty, kanaMode: KanaMode): void {
    this.gameState = {
      score: 0,
      combo: 0,
      lives: 3,
      gameActive: true,
      difficulty,
      kanaMode,
      kanaList: [],
      highScore: this.getHighScore(),
      gameOver: false
    };
    this.gameStateSubject.next(this.gameState);
    this.startGameLoop();
  }

  private startGameLoop(): void {
    this.clearGameLoops();

    // Spawn kana periodically
    this.spawnInterval = setInterval(() => {
      if (this.gameState.gameActive && this.gameState.lives > 0) {
        this.spawnKana();
      }
    }, this.difficultySettings[this.gameState.difficulty].spawnRate);

    this.lastUpdateTimestamp = Date.now();

    // Update game state at higher FPS with time-step scaling.
    this.gameLoopInterval = setInterval(() => {
      if (this.gameState.gameActive && this.gameState.lives > 0) {
        const now = Date.now();
        const deltaMultiplier = Math.min(2.5, (now - this.lastUpdateTimestamp) / this.PHYSICS_STEP_MS);
        this.lastUpdateTimestamp = now;
        this.updateKanaPositions(deltaMultiplier);
      }
    }, this.TARGET_FRAME_MS); // ~50fps
  }

  private spawnKana(): void {
    const settings = this.difficultySettings[this.gameState.difficulty];
    if (this.gameState.kanaList.length >= settings.maxKana) return;

    const kanaCharacters = this.getKanaList();
    if (kanaCharacters.length === 0) return;

    const randomChar = kanaCharacters[Math.floor(Math.random() * kanaCharacters.length)];
    const x = this.CANVAS_WIDTH / 2; // Spawn at center bottom
    const spawnVelocity =
      settings.launchVelocityMin + Math.random() * (settings.launchVelocityMax - settings.launchVelocityMin);

    const id = `kana_${this.nextKanaId++}`;

    const kana: FallingKana = {
      id,
      character: randomChar.character,
      romaji: randomChar.romaji,
      fruitClass: this.getFruitClassForId(id),
      renderTransform: '',
      x,
      y: this.CANVAS_HEIGHT - 60, // Bottom of screen
      vx: (Math.random() - 0.5) * settings.horizontalDrift,
      vy: -spawnVelocity, // Upward velocity
      size: settings.size,
      sliced: false,
      spawnTime: Date.now(),
      age: 0
    };

    kana.renderTransform = this.getRenderTransform(kana);

    this.gameState.kanaList.push(kana);
    this.gameStateSubject.next(this.gameState);
  }

  private updateKanaPositions(deltaMultiplier: number = 1): void {
    if (this.gameState.kanaList.length === 0) {
      return;
    }

    const settings = this.difficultySettings[this.gameState.difficulty];
    const maxKanaAge = settings.maxKanaAge;
    const ANIMATION_DURATION = 600; // Animation duration in ms

    this.gameState.kanaList = this.gameState.kanaList.filter(kana => {
      // Remove sliced kanas only after animation completes
      if (kana.sliced && kana.sliceTime) {
        const timeSinceSlice = Date.now() - kana.sliceTime;
        if (timeSinceSlice > ANIMATION_DURATION) {
          return false; // Remove after animation is done
        }
        return true; // Keep it during animation
      }

      // Calculate age
      kana.age = Date.now() - kana.spawnTime;

      // Remove if too old (timeout)
      if (kana.age > maxKanaAge) {
        this.gameState.lives--;
        this.gameState.combo = 0;
        if (this.gameState.lives <= 0) {
          this.endGame();
        }
        return false;
      }

      // Apply physics
      kana.vy += settings.gravity * deltaMultiplier;
      kana.x += kana.vx * deltaMultiplier;
      kana.y += kana.vy * deltaMultiplier;

      // Bounce off walls
      if (kana.x <= 0 || kana.x + kana.size >= this.CANVAS_WIDTH) {
        kana.vx *= -0.8;
        kana.x = Math.max(0, Math.min(this.CANVAS_WIDTH - kana.size, kana.x));
      }

      // Missed kana: once it falls below the arena, remove immediately.
      if (kana.y > this.CANVAS_HEIGHT + kana.size) {
        this.gameState.lives--;
        this.gameState.combo = 0;
        if (this.gameState.lives <= 0) {
          this.endGame();
        }
        return false;
      }

      kana.renderTransform = this.getRenderTransform(kana);

      return true;
    });

    this.gameStateSubject.next(this.gameState);
  }

  checkAnswer(kanaId: string, userInput: string): boolean {
    const kana = this.gameState.kanaList.find(k => k.id === kanaId);
    if (!kana || kana.sliced) return false;

    // Remove spaces and normalize input
    const input = userInput.trim().toLowerCase();
    const expectedRomaji = kana.romaji.toLowerCase();

    // Check if input matches romaji
    if (input === expectedRomaji) {
      kana.sliced = true;
      kana.sliceTime = Date.now(); // Track when it was sliced
      const settings = this.difficultySettings[this.gameState.difficulty];
      
      // Calculate points based on speed (how early they typed)
      const speedBonus = Math.max(0, 100 - Math.floor(kana.age / 80)); // Bonus for early answers
      const basePoints = 10 + speedBonus;
      const comboBonus = this.gameState.combo * settings.comboMultiplier;
      const points = Math.floor(basePoints + comboBonus);

      this.gameState.score += points;
      this.gameState.combo++;

      // Play success sound
      this.playSliceSound();

      this.gameStateSubject.next(this.gameState);
      return true;
    }

    return false;
  }

  getCurrentKana(): FallingKana | null {
    // Find oldest active kana in O(n) to avoid per-frame sort work.
    let current: FallingKana | null = null;

    for (const kana of this.gameState.kanaList) {
      if (kana.sliced) {
        continue;
      }

      if (!current || kana.spawnTime < current.spawnTime) {
        current = kana;
      }
    }

    return current;
  }

  private getFruitClassForId(id: string): string {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const fruits = [
      'fruit-strawberry',
      'fruit-orange',
      'fruit-watermelon',
      'fruit-grape',
      'fruit-apple',
      'fruit-lemon',
      'fruit-blueberry',
      'fruit-peach'
    ];
    return fruits[hash % fruits.length];
  }

  private getRenderTransform(kana: FallingKana): string {
    const renderX = Math.round(kana.x);
    const renderY = Math.round(kana.y * 0.7);
    return `translate3d(${renderX}px, ${renderY}px, 0)`;
  }

  private endGame(): void {
    this.gameState.gameActive = false;
    this.gameState.gameOver = true;

    if (this.gameState.score > this.gameState.highScore) {
      this.gameState.highScore = this.gameState.score;
      this.saveHighScore(this.gameState.score);
      this.playLevelUpSound();
    } else {
      this.playGameOverSound();
    }

    this.submitBestScore(this.gameState.score);
    this.clearGameLoops();

    this.gameStateSubject.next(this.gameState);
  }

  pauseGame(): void {
    // Keep gameActive true so UI remains on the game screen while paused.
    this.clearGameLoops();
    this.gameStateSubject.next(this.gameState);
  }

  resumeGame(): void {
    // Resume timers and continue the current active session.
    this.startGameLoop();
    this.gameStateSubject.next(this.gameState);
  }

  resetGame(): void {
    this.clearGameLoops();
    this.stopAllSounds();

    this.gameState = {
      score: 0,
      combo: 0,
      lives: 3,
      gameActive: false,
      difficulty: this.gameState.difficulty,
      kanaMode: this.gameState.kanaMode,
      kanaList: [],
      highScore: this.getHighScore(),
      gameOver: false
    };
    this.gameStateSubject.next(this.gameState);
  }

  private clearGameLoops(): void {
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval);
      this.gameLoopInterval = null;
    }
    if (this.spawnInterval) {
      clearInterval(this.spawnInterval);
      this.spawnInterval = null;
    }
  }

  private getKanaList(): KanaCharacter[] {
    switch (this.gameState.kanaMode) {
      case 'hiragana':
        return HIRAGANA;
      case 'katakana':
        return KATAKANA;
      case 'mixed':
        return [...HIRAGANA, ...KATAKANA];
      default:
        return HIRAGANA;
    }
  }

  private saveHighScore(score: number): void {
    localStorage.setItem(this.getHighScoreStorageKey(), score.toString());
  }

  private getHighScore(): number {
    return this.loadHighScore();
  }

  private loadHighScore(): number {
    const saved = localStorage.getItem(this.getHighScoreStorageKey());
    return saved ? parseInt(saved, 10) : 0;
  }

  private syncUserScopedState(): void {
    const highScore = this.getHighScore();
    this.gameState.highScore = highScore;
    this.gameStateSubject.next(this.gameState);

    if (!this.authService.isAuthenticated()) {
      this.myLeaderboardEntrySubject.next(null);
      return;
    }

    this.http
      .get<MyKanaLeaderboardEntry>(`${this.apiBaseUrl}/kana/leaderboard/me`)
      .pipe(catchError(() => of(null)))
      .subscribe((entry) => {
        if (!entry) {
          return;
        }

        this.myLeaderboardEntrySubject.next(entry);
        if (entry.bestScore > highScore) {
          this.gameState.highScore = entry.bestScore;
          this.saveHighScore(entry.bestScore);
          this.gameStateSubject.next(this.gameState);
        }
      });
  }

  private submitBestScore(score: number): void {
    const normalizedScore = Math.max(0, Math.floor(score));
    if (normalizedScore <= 0) {
      return;
    }

    const localHighScore = this.getHighScore();
    if (normalizedScore > localHighScore) {
      this.saveHighScore(normalizedScore);
      this.gameState.highScore = normalizedScore;
    }

    if (!this.authService.isAuthenticated()) {
      this.gameStateSubject.next(this.gameState);
      return;
    }

    this.http
      .post<MyKanaLeaderboardEntry & { isNewRecord: boolean }>(`${this.apiBaseUrl}/kana/leaderboard/score`, {
        score: normalizedScore,
      })
      .pipe(catchError(() => of(null)))
      .subscribe((entry) => {
        if (!entry) {
          this.gameStateSubject.next(this.gameState);
          return;
        }

        this.myLeaderboardEntrySubject.next(entry);
        if (entry.bestScore > this.gameState.highScore) {
          this.gameState.highScore = entry.bestScore;
          this.saveHighScore(entry.bestScore);
        }

        this.gameStateSubject.next(this.gameState);
        this.refreshLeaderboard();
      });
  }

  private getHighScoreStorageKey(): string {
    const authRawUser = localStorage.getItem('auth-user');
    if (!authRawUser) {
      return `${this.highScoreStoragePrefix}-guest`;
    }

    try {
      const parsedUser = JSON.parse(authRawUser) as { id?: string };
      if (parsedUser.id) {
        return `${this.highScoreStoragePrefix}-${parsedUser.id}`;
      }
      return `${this.highScoreStoragePrefix}-guest`;
    } catch {
      return `${this.highScoreStoragePrefix}-guest`;
    }
  }

  private loadSoundEnabled(): boolean {
    const saved = localStorage.getItem(this.soundEnabledStorageKey);
    return saved !== 'false';
  }

  private playSliceSound(): void {
    this.playSound(200, 1000, 0.1);
  }

  private playGameOverSound(): void {
    this.playSound(400, 800, 0.2);
  }

  private playLevelUpSound(): void {
    this.playSound(600, 1200, 0.15);
  }

  private playSound(frequency: number, duration: number, volume: number): void {
    if (!this.soundEnabled) {
      return;
    }

    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        return;
      }

      const audioContext = new AudioContextClass();
      this.activeAudioContexts.add(audioContext);

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration / 1000);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);

      oscillator.onended = () => {
        audioContext.close().catch(() => {
          // Ignore close failures.
        });
        this.activeAudioContexts.delete(audioContext);
      };
    } catch (e) {
      // Web Audio API not supported
    }
  }

  private stopAllSounds(): void {
    this.activeAudioContexts.forEach((audioContext) => {
      audioContext.close().catch(() => {
        // Ignore close failures.
      });
    });
    this.activeAudioContexts.clear();
  }
}
