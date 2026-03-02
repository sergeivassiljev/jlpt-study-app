import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { StudyDataService } from '../study-data/study-data.service';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { UpdateVocabularyReviewDto } from './dto/update-vocabulary-review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUserId } from '../auth/decorators/current-user-id.decorator';

@Controller('vocabulary')
@UseGuards(JwtAuthGuard)
export class VocabularyController {
  constructor(private readonly studyDataService: StudyDataService) {}

  @Get()
  async list(@CurrentUserId() userId: string) {
    return await this.studyDataService.getVocabulary(userId);
  }

  @Post()
  async create(@CurrentUserId() userId: string, @Body() body: CreateVocabularyDto) {
    return await this.studyDataService.addVocabulary(userId, body);
  }

  @Patch(':id/review')
  async updateReview(
    @Param('id') vocabularyId: string,
    @CurrentUserId() userId: string,
    @Body() body: UpdateVocabularyReviewDto,
  ) {
    const updated = await this.studyDataService.updateVocabularyReviewStatus(userId, vocabularyId, body.difficulty);

    if (!updated) {
      throw new NotFoundException(`Vocabulary item not found: ${vocabularyId}`);
    }

    return updated;
  }

  @Patch(':id/schedule-now')
  async scheduleNow(@Param('id') vocabularyId: string, @CurrentUserId() userId: string) {
    const scheduled = await this.studyDataService.scheduleVocabularyForImmediateReview(userId, vocabularyId);

    if (!scheduled) {
      throw new NotFoundException(`Vocabulary item not found: ${vocabularyId}`);
    }

    return scheduled;
  }

  @Delete(':id')
  async remove(@Param('id') vocabularyId: string, @CurrentUserId() userId: string) {
    const deleted = await this.studyDataService.deleteVocabulary(userId, vocabularyId);

    if (!deleted) {
      throw new NotFoundException(`Vocabulary item not found: ${vocabularyId}`);
    }

    return { success: true };
  }
}
