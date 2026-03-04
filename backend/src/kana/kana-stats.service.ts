import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KanaStats, KanaMasteryLevel } from './kana-stats.entity';

export interface RecordAttemptDto {
  userId: string;
  kanaId: number;
  character: string;
  romaji: string;
  type: 'hiragana' | 'katakana';
  isCorrect: boolean;
  responseTime: number; // in milliseconds
}

export interface UserKanaStatsOverview {
  totalKanaPracticed: number;
  totalAttempts: number;
  overallAccuracy: number;
  avgResponseTime: number;
  strongCount: number;
  mediumCount: number;
  weakCount: number;
  notPracticedCount: number;
}

@Injectable()
export class KanaStatsService {
  constructor(
    @InjectRepository(KanaStats)
    private kanaStatsRepository: Repository<KanaStats>,
  ) {}

  async recordAttempt(dto: RecordAttemptDto): Promise<KanaStats> {
    try {
      console.log('recordAttempt called with:', dto);

      let stats = await this.kanaStatsRepository.findOne({
        where: {
          userId: dto.userId,
          character: dto.character,
          type: dto.type,
        },
      });

      console.log('Found existing stats:', stats ? 'yes' : 'no');

      if (!stats) {
        console.log('Creating new stats record');
        stats = this.kanaStatsRepository.create({
          userId: dto.userId,
          kanaId: dto.kanaId,
          character: dto.character,
          romaji: dto.romaji,
          type: dto.type,
          totalAttempts: 0,
          correctAttempts: 0,
          incorrectAttempts: 0,
          totalResponseTime: 0,
          avgResponseTime: 0,
          accuracy: 0,
          masteryScore: 0,
          masteryLevel: KanaMasteryLevel.NOT_PRACTICED,
        });
      }

      // Guard against undefined/null/NaN numeric fields on newly created records
      stats.totalAttempts = Number.isFinite(Number(stats.totalAttempts)) ? Number(stats.totalAttempts) : 0;
      stats.correctAttempts = Number.isFinite(Number(stats.correctAttempts)) ? Number(stats.correctAttempts) : 0;
      stats.incorrectAttempts = Number.isFinite(Number(stats.incorrectAttempts)) ? Number(stats.incorrectAttempts) : 0;
      stats.totalResponseTime = Number.isFinite(Number(stats.totalResponseTime)) ? Number(stats.totalResponseTime) : 0;
      stats.avgResponseTime = Number.isFinite(Number(stats.avgResponseTime)) ? Number(stats.avgResponseTime) : 0;
      stats.accuracy = Number.isFinite(Number(stats.accuracy)) ? Number(stats.accuracy) : 0;
      stats.masteryScore = Number.isFinite(Number(stats.masteryScore)) ? Number(stats.masteryScore) : 0;

      // Update attempt counts
      stats.totalAttempts += 1;
      if (dto.isCorrect) {
        stats.correctAttempts += 1;
      } else {
        stats.incorrectAttempts += 1;
      }

      // Update response time
      stats.totalResponseTime += dto.responseTime;
      stats.avgResponseTime = stats.totalResponseTime / stats.totalAttempts;

      // Calculate accuracy
      stats.accuracy = (stats.correctAttempts / stats.totalAttempts) * 100;

      // Calculate mastery score and level
      const mastery = this.calculateMastery(
        stats.accuracy,
        stats.avgResponseTime,
        stats.totalAttempts,
      );
      stats.masteryScore = mastery.score;
      stats.masteryLevel = mastery.level;

      stats.lastPracticedAt = new Date();

      console.log('Saving stats:', {
        userId: stats.userId,
        character: stats.character,
        type: stats.type,
        totalAttempts: stats.totalAttempts,
        accuracy: stats.accuracy,
        masteryScore: stats.masteryScore,
        masteryLevel: stats.masteryLevel,
      });

      const saved = await this.kanaStatsRepository.save(stats);
      console.log('Stats saved successfully');
      return saved;
    } catch (error) {
      console.error('Error in recordAttempt:', error);
      throw error;
    }
  }

  async getUserKanaStats(userId: string, type?: 'hiragana' | 'katakana'): Promise<KanaStats[]> {
    const query = this.kanaStatsRepository
      .createQueryBuilder('stats')
      .where('stats.userId = :userId', { userId });

    if (type) {
      query.andWhere('stats.type = :type', { type });
    }

    return await query
      .orderBy('stats.kanaId', 'ASC')
      .getMany();
  }

  async getUserStatsOverview(userId: string, type?: 'hiragana' | 'katakana'): Promise<UserKanaStatsOverview> {
    const stats = await this.getUserKanaStats(userId, type);

    const totalKanaPracticed = stats.filter(s => s.totalAttempts > 0).length;
    const totalAttempts = stats.reduce((sum, s) => sum + s.totalAttempts, 0);
    const totalCorrect = stats.reduce((sum, s) => sum + s.correctAttempts, 0);
    const overallAccuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;
    
    const practicedStats = stats.filter(s => s.totalAttempts > 0);
    const avgResponseTime = practicedStats.length > 0
      ? practicedStats.reduce((sum, s) => sum + s.avgResponseTime, 0) / practicedStats.length
      : 0;

    const strongCount = stats.filter(s => s.masteryLevel === KanaMasteryLevel.STRONG).length;
    const mediumCount = stats.filter(s => s.masteryLevel === KanaMasteryLevel.MEDIUM).length;
    const weakCount = stats.filter(s => s.masteryLevel === KanaMasteryLevel.WEAK).length;
    
    // Calculate not practiced based on type
    const totalKanaCount = type === 'hiragana' ? 46 : type === 'katakana' ? 46 : 92;
    const notPracticedCount = totalKanaCount - totalKanaPracticed;

    return {
      totalKanaPracticed,
      totalAttempts,
      overallAccuracy: Math.round(overallAccuracy * 10) / 10,
      avgResponseTime: Math.round(avgResponseTime),
      strongCount,
      mediumCount,
      weakCount,
      notPracticedCount,
    };
  }

  async getWeakKana(userId: string, type?: 'hiragana' | 'katakana'): Promise<KanaStats[]> {
    const query = this.kanaStatsRepository
      .createQueryBuilder('stats')
      .where('stats.userId = :userId', { userId })
      .andWhere('stats.masteryLevel = :level', { level: KanaMasteryLevel.WEAK });

    if (type) {
      query.andWhere('stats.type = :type', { type });
    }

    return await query
      .orderBy('stats.masteryScore', 'ASC')
      .getMany();
  }

  /**
   * Mastery Algorithm:
   * 
   * Factors:
   * - Accuracy (0-100%): weight 50%
   * - Response Time: weight 30%
   *   - <2s = 100 points
   *   - 2-3s = 80 points
   *   - 3-5s = 50 points
   *   - >5s = 20 points
   * - Attempt Count: weight 20%
   *   - <5 attempts = confidence 0.5
   *   - 5-10 attempts = confidence 0.7
   *   - 10-20 attempts = confidence 0.9
   *   - >20 attempts = confidence 1.0
   * 
   * Mastery Levels:
   * - 🟩 Strong: score >= 75
   * - 🟨 Medium: score >= 50
   * - 🟥 Weak: score < 50
   * - Not practiced: no attempts
   */
  private calculateMastery(
    accuracy: number,
    avgResponseTime: number,
    totalAttempts: number,
  ): { score: number; level: KanaMasteryLevel } {
    if (totalAttempts === 0) {
      return { score: 0, level: KanaMasteryLevel.NOT_PRACTICED };
    }

    // Accuracy component (0-100, weight 50%)
    const accuracyScore = accuracy * 0.5;

    // Response time component (0-100, weight 30%)
    let speedScore = 0;
    const avgSeconds = avgResponseTime / 1000;
    if (avgSeconds < 2) {
      speedScore = 100;
    } else if (avgSeconds < 3) {
      speedScore = 80;
    } else if (avgSeconds < 5) {
      speedScore = 50;
    } else {
      speedScore = 20;
    }
    const speedComponent = speedScore * 0.3;

    // Confidence based on attempt count (0-1, weight 20%)
    let confidence = 0;
    if (totalAttempts < 5) {
      confidence = 0.5;
    } else if (totalAttempts < 10) {
      confidence = 0.7;
    } else if (totalAttempts < 20) {
      confidence = 0.9;
    } else {
      confidence = 1.0;
    }
    const confidenceComponent = confidence * 100 * 0.2;

    // Calculate total mastery score
    const score = Math.round(accuracyScore + speedComponent + confidenceComponent);

    // Determine mastery level
    let level: KanaMasteryLevel;
    if (score >= 75) {
      level = KanaMasteryLevel.STRONG;
    } else if (score >= 50) {
      level = KanaMasteryLevel.MEDIUM;
    } else {
      level = KanaMasteryLevel.WEAK;
    }

    return { score, level };
  }

  async resetUserStats(userId: string): Promise<void> {
    await this.kanaStatsRepository.delete({ userId });
  }
}
