import { Body, Controller, Get, NotFoundException, Param, Patch, UseGuards } from '@nestjs/common';
import { StudyDataService } from '../study-data/study-data.service';
import { ReviewFlashcardDto } from './dto/review-flashcard.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUserId } from '../auth/decorators/current-user-id.decorator';

@Controller('flashcards')
@UseGuards(JwtAuthGuard)
export class FlashcardsController {
  constructor(private readonly studyDataService: StudyDataService) {}

  @Get()
  async list(@CurrentUserId() userId: string) {
    return await this.studyDataService.getFlashcards(userId);
  }

  @Get('due')
  async due(@CurrentUserId() userId: string) {
    return await this.studyDataService.getDueFlashcards(userId);
  }

  @Patch(':id/review')
  async review(
    @Param('id') flashcardId: string,
    @CurrentUserId() userId: string,
    @Body() body: ReviewFlashcardDto,
  ) {
    const card = await this.studyDataService.reviewFlashcard(userId, flashcardId, body.difficulty);

    if (!card) {
      throw new NotFoundException(`Flashcard not found: ${flashcardId}`);
    }

    return card;
  }

  @Patch('by-vocabulary/:vocabularyId/schedule-now')
  async scheduleByVocabulary(@Param('vocabularyId') vocabularyId: string, @CurrentUserId() userId: string) {
    const card = await this.studyDataService.scheduleFlashcardForImmediateReview(userId, vocabularyId);

    if (!card) {
      throw new NotFoundException(`Flashcard not found for vocabulary: ${vocabularyId}`);
    }

    return card;
  }
}
