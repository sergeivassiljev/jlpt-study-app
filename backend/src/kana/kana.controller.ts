import { Body, Controller, DefaultValuePipe, Get, ParseIntPipe, Post, Query, Request, UseGuards } from '@nestjs/common';
import { KanaService } from './kana.service';
import { KanaStatsService, RecordAttemptDto } from './kana-stats.service';
import { RecordKanaAttemptDto } from './dto/record-kana-attempt.dto';
import { RecordKanaSessionDto } from './dto/record-kana-session.dto';
import { SubmitKanaScoreDto } from './dto/submit-kana-score.dto';
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

  // Kana Ninja leaderboard endpoints
  @Get('leaderboard')
  async getLeaderboard(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.kanaStatsService.getLeaderboard(limit);
  }

  @Get('leaderboard/me')
  @UseGuards(JwtAuthGuard)
  async getMyLeaderboardEntry(@Request() req) {
    return this.kanaStatsService.getMyBestScore(req.user.userId);
  }

  @Post('leaderboard/score')
  @UseGuards(JwtAuthGuard)
  async submitScore(@Request() req, @Body() body: SubmitKanaScoreDto) {
    return this.kanaStatsService.submitBestScore(req.user.userId, body.score);
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

  @Post('stats/record-batch')
  @UseGuards(JwtAuthGuard)
  async recordSessionAttempts(
    @Request() req,
    @Body() body: any,
  ) {
    try {
      const userId = req.user?.userId;
      console.log('\n=== BATCH RECORD START ===');
      console.log('Body structure:', {
        hasAttempts: !!body?.attempts,
        attemptsLength: body?.attempts?.length,
        sessionSize: body?.sessionSize,
      });

      if (!userId) {
        console.error('No userId found in request');
        throw new Error('User ID not found in request');
      }

      if (!body || typeof body !== 'object') {
        console.error('Body is not valid object:', typeof body);
        throw new Error('Request body must be an object');
      }

      if (!Array.isArray(body.attempts)) {
        console.error('Attempts is not an array:', typeof body.attempts);
        throw new Error('Attempts must be an array');
      }

      if (body.attempts.length === 0) {
        console.error('Attempts array is empty');
        throw new Error('Attempts array cannot be empty');
      }

      // Validate attempt structure
      console.log('Validating attempt structure...');
      for (let i = 0; i < body.attempts.length; i++) {
        const att = body.attempts[i];
        if (!att || typeof att !== 'object') {
          throw new Error(`Attempt ${i} is not a valid object`);
        }
        const required = ['kanaId', 'character', 'romaji', 'type', 'isCorrect', 'responseTime'];
        for (const field of required) {
          if (!(field in att)) {
            throw new Error(`Attempt ${i} missing required field: ${field}`);
          }
        }
      }

      console.log('All validations passed. Creating RecordAttemptDto array...');
      const attemptDataArray: RecordAttemptDto[] = body.attempts.map((attempt: any, idx: number) => {
        console.log(`  Attempt ${idx}: ${attempt.character}`);
        return {
          userId,
          kanaId: attempt.kanaId,
          character: attempt.character,
          romaji: attempt.romaji,
          type: attempt.type,
          isCorrect: attempt.isCorrect,
          responseTime: attempt.responseTime,
        };
      });

      console.log('Calling recordSessionAttempts with', attemptDataArray.length, 'attempts...');
      const results = await this.kanaStatsService.recordSessionAttempts(userId, attemptDataArray);
      console.log('recordSessionAttempts returned', results.length, 'results');
      
      console.log('=== BATCH RECORD END (SUCCESS) ===\n');
      
      return {
        message: `Successfully recorded ${results.length} attempts`,
        results,
        sessionStats: {
          totalAttempts: body.attempts.length,
          correctAttempts: body.attempts.filter((a: any) => a.isCorrect).length,
          accuracy: body.accuracy || 0,
          avgResponseTime: body.avgResponseTime || 0,
        }
      };
    } catch (error) {
      console.error('\n=== ERROR IN BATCH RECORD ===');
      console.error('Error type:', error?.constructor?.name);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      if (error instanceof Error) {
        console.error('Stack:', error.stack);
      }
      console.error('=== END ERROR ===\n');
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
