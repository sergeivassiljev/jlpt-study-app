import { Controller, Get, Post, Body, Query, Request, UseGuards } from '@nestjs/common';
import { KanaService } from './kana.service';
import { KanaStatsService, RecordAttemptDto } from './kana-stats.service';
import { RecordKanaAttemptDto } from './dto/record-kana-attempt.dto';
import { KanaType } from '../types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('kana')
export class KanaController {
  constructor(
    private readonly kanaService: KanaService,
    private readonly kanaStatsService: KanaStatsService,
  ) {}

  @Get()
  getAllKana(@Query('type') type?: KanaType) {
    if (type) {
      return this.kanaService.getKanaByType(type);
    }
    return this.kanaService.getAllKana();
  }

  @Get('random')
  getRandomKana(
    @Query('type') type?: KanaType,
    @Query('count') count: number = 1,
  ) {
    return this.kanaService.getRandomKana(type, Math.min(count, 50));
  }

  @Get('search')
  searchKana(@Query('q') query: string) {
    if (!query || query.length === 0) {
      return [];
    }
    return this.kanaService.searchKana(query);
  }

  // Stats endpoints
  @Post('stats/record')
  @UseGuards(JwtAuthGuard)
  async recordAttempt(
    @Request() req,
    @Body() body: RecordKanaAttemptDto,
  ) {
    try {
      console.log('Recording attempt:', {
        userId: req.user?.userId,
        body: body
      });

      if (!req.user?.userId) {
        throw new Error('User ID not found in request');
      }

      const attemptData: RecordAttemptDto = {
        userId: req.user.userId,
        kanaId: body.kanaId,
        character: body.character,
        romaji: body.romaji,
        type: body.type,
        isCorrect: body.isCorrect,
        responseTime: body.responseTime,
      };

      console.log('Attempt data to save:', attemptData);
      const result = await this.kanaStatsService.recordAttempt(attemptData);
      console.log('Successfully saved attempt:', result);
      return result;
    } catch (error) {
      console.error('Error recording attempt:', error);
      throw error;
    }
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getUserStats(@Request() req, @Query('type') type?: KanaType) {
    return this.kanaStatsService.getUserKanaStats(req.user.userId, type);
  }

  @Get('stats/overview')
  @UseGuards(JwtAuthGuard)
  async getUserStatsOverview(@Request() req, @Query('type') type?: KanaType) {
    return this.kanaStatsService.getUserStatsOverview(req.user.userId, type);
  }

  @Get('stats/weak')
  @UseGuards(JwtAuthGuard)
  async getWeakKana(@Request() req, @Query('type') type?: KanaType) {
    return this.kanaStatsService.getWeakKana(req.user.userId, type);
  }

  @Post('stats/reset')
  @UseGuards(JwtAuthGuard)
  async resetStats(@Request() req) {
    await this.kanaStatsService.resetUserStats(req.user.userId);
    return { message: 'Stats reset successfully' };
  }
}
