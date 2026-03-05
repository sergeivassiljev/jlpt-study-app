import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { StudyDataService } from '../study-data/study-data.service';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { UpdateVocabularyReviewDto } from './dto/update-vocabulary-review.dto';
import { CreateFolderDto, MoveToFolderDto } from './dto/folder.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUserId } from '../auth/decorators/current-user-id.decorator';
import { CompleteLessonWordDto } from './dto/complete-lesson-word.dto';
import { DailyLessonQueryDto, LessonTopicsQueryDto, TopicLessonWordsQueryDto } from './dto/lesson-query.dto';

@Controller('vocabulary')
@UseGuards(JwtAuthGuard)
export class VocabularyController {
  constructor(private readonly studyDataService: StudyDataService) {}

  @Get()
  async list(@CurrentUserId() userId: string) {
    return await this.studyDataService.getVocabulary(userId);
  }

  @Get('lessons/topics')
  async listLessonTopics(@CurrentUserId() userId: string, @Query() query: LessonTopicsQueryDto) {
    return await this.studyDataService.getStructuredLessonTopics(userId, query.level);
  }

  @Get('lessons/daily')
  async getDailyLesson(@CurrentUserId() userId: string, @Query() query: DailyLessonQueryDto) {
    return await this.studyDataService.getDailyLessonWords(userId, query.level, query.topic, query.limit);
  }

  @Get('lessons/words')
  async getTopicLessonWords(@CurrentUserId() userId: string, @Query() query: TopicLessonWordsQueryDto) {
    return await this.studyDataService.getTopicLessonWords(userId, query.level, query.topic, query.lessonOrder);
  }

  @Post('lessons/complete')
  async completeLessonWord(@CurrentUserId() userId: string, @Body() body: CompleteLessonWordDto) {
    return await this.studyDataService.completeLessonWord(userId, body.lessonWordId, body.vocabularyId);
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

  // Folder endpoints
  @Post('folders')
  async createFolder(@CurrentUserId() userId: string, @Body() body: CreateFolderDto) {
    return await this.studyDataService.createFolder(userId, body.name, body.color || '');
  }

  @Get('folders')
  async listFolders(@CurrentUserId() userId: string) {
    return await this.studyDataService.getFolders(userId);
  }

  @Delete('folders/:folderId')
  async deleteFolder(@Param('folderId') folderId: string, @CurrentUserId() userId: string) {
    const deleted = await this.studyDataService.deleteFolder(userId, folderId);

    if (!deleted) {
      throw new NotFoundException(`Folder not found: ${folderId}`);
    }

    return { success: true };
  }

  @Patch(':id/move-to-folder')
  async moveToFolder(
    @Param('id') vocabularyId: string,
    @CurrentUserId() userId: string,
    @Body() body: MoveToFolderDto,
  ) {
    const moved = await this.studyDataService.moveWordToFolder(userId, vocabularyId, body.folderId || null);

    if (!moved) {
      throw new NotFoundException(`Vocabulary item not found: ${vocabularyId}`);
    }

    return { success: true };
  }

  @Get('folders/:folderId')
  async getVocabularyByFolder(@Param('folderId') folderId: string, @CurrentUserId() userId: string) {
    return await this.studyDataService.getVocabularyByFolder(userId, folderId === 'none' ? null : folderId);
  }
}
