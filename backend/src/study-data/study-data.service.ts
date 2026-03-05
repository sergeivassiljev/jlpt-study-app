import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DailyLessonPayload,
  FlashcardItem,
  Folder,
  JLPTLevel,
  ReviewDifficulty,
  StructuredLessonWord,
  TopicLessonProgress,
  TopicProgressSummary,
  VocabularyItem,
  Word,
} from '../types';
import { VocabularyEntity } from './entities/vocabulary.entity';
import { FlashcardEntity } from './entities/flashcard.entity';
import { FolderEntity } from './entities/folder.entity';
import { LessonWordEntity } from './entities/lesson-word.entity';
import { LessonWordProgressEntity } from './entities/lesson-word-progress.entity';
import { N5_TOPIC_LESSON_WORDS } from '../vocabulary/data/n5-topic-lessons.data';

@Injectable()
export class StudyDataService {
  private readonly MAX_VOCABULARY_PER_USER = 10000;
  private readonly DEFAULT_DAILY_LIMIT = 10;
  private readonly MAX_DAILY_LIMIT = 50;

  constructor(
    @InjectRepository(VocabularyEntity)
    private readonly vocabularyRepository: Repository<VocabularyEntity>,
    @InjectRepository(FlashcardEntity)
    private readonly flashcardRepository: Repository<FlashcardEntity>,
    @InjectRepository(FolderEntity)
    private readonly folderRepository: Repository<FolderEntity>,
    @InjectRepository(LessonWordEntity)
    private readonly lessonWordRepository: Repository<LessonWordEntity>,
    @InjectRepository(LessonWordProgressEntity)
    private readonly lessonProgressRepository: Repository<LessonWordProgressEntity>,
  ) {}

  async getVocabulary(userId: string): Promise<VocabularyItem[]> {
    const items = await this.vocabularyRepository.find({
      where: { userId },
      order: { dateAdded: 'DESC' },
    });
    return items.map((item) => this.toVocabularyItem(item));
  }

  async getStructuredLessonTopics(userId: string, jlptLevel: JLPTLevel): Promise<TopicProgressSummary[]> {
    await this.ensureLessonSeedData(jlptLevel);

    const lessonWords = await this.lessonWordRepository.find({
      where: { jlptLevel },
      order: { topic: 'ASC', lessonOrder: 'ASC', wordOrder: 'ASC' },
    });

    if (lessonWords.length === 0) {
      return [];
    }

    const progressRows = await this.lessonProgressRepository.find({
      where: { userId, jlptLevel },
      order: { completedAt: 'DESC' },
    });
    const completedWordIds = new Set(progressRows.map((row) => row.lessonWordId));

    const byTopic = new Map<string, Map<number, { totalWords: number; completedWords: number }>>();

    for (const lessonWord of lessonWords) {
      const topicLessons = byTopic.get(lessonWord.topic) ?? new Map<number, { totalWords: number; completedWords: number }>();
      const lessonStats = topicLessons.get(lessonWord.lessonOrder) ?? { totalWords: 0, completedWords: 0 };

      lessonStats.totalWords += 1;
      if (completedWordIds.has(lessonWord.id)) {
        lessonStats.completedWords += 1;
      }

      topicLessons.set(lessonWord.lessonOrder, lessonStats);
      byTopic.set(lessonWord.topic, topicLessons);
    }

    const result: TopicProgressSummary[] = [];

    for (const [topic, lessonsMap] of byTopic.entries()) {
      const lessonOrders = Array.from(lessonsMap.keys()).sort((a, b) => a - b);
      const lessons: TopicLessonProgress[] = [];

      let previousCompleted = true;
      let topicTotalWords = 0;
      let topicCompletedWords = 0;

      for (const order of lessonOrders) {
        const stats = lessonsMap.get(order)!;
        const isCompleted = stats.totalWords > 0 && stats.completedWords >= stats.totalWords;
        const isUnlocked = previousCompleted;

        lessons.push({
          lessonOrder: order,
          totalWords: stats.totalWords,
          completedWords: stats.completedWords,
          isUnlocked,
          isCompleted,
        });

        topicTotalWords += stats.totalWords;
        topicCompletedWords += stats.completedWords;
        previousCompleted = isCompleted;
      }

      result.push({
        topic,
        totalWords: topicTotalWords,
        completedWords: topicCompletedWords,
        lessons,
      });
    }

    return result.sort((a, b) => a.topic.localeCompare(b.topic));
  }

  async getDailyLessonWords(
    userId: string,
    jlptLevel: JLPTLevel,
    topic: string,
    dailyLimit = this.DEFAULT_DAILY_LIMIT,
  ): Promise<DailyLessonPayload> {
    await this.ensureLessonSeedData(jlptLevel);

    const normalizedTopic = topic.trim();
    const safeLimit = Math.max(1, Math.min(this.MAX_DAILY_LIMIT, dailyLimit || this.DEFAULT_DAILY_LIMIT));

    const lessonWords = await this.lessonWordRepository.find({
      where: { jlptLevel, topic: normalizedTopic },
      order: { lessonOrder: 'ASC', wordOrder: 'ASC' },
    });

    const progressRows = await this.lessonProgressRepository.find({
      where: { userId, jlptLevel, topic: normalizedTopic },
    });
    const completedWordIds = new Set(progressRows.map((row) => row.lessonWordId));

    const allPendingWords = lessonWords.filter((word) => !completedWordIds.has(word.id));
    const nextLessonOrder = allPendingWords.length > 0
      ? Math.min(...allPendingWords.map((word) => word.lessonOrder))
      : null;
    const lessonPendingWords = nextLessonOrder === null
      ? []
      : allPendingWords.filter((word) => word.lessonOrder === nextLessonOrder);
    const limitedWords = lessonPendingWords.slice(0, safeLimit);

    return {
      jlptLevel,
      topic: normalizedTopic,
      dailyLimit: safeLimit,
      words: limitedWords.map((word) => this.toStructuredLessonWord(word, completedWordIds)),
      remainingWords: Math.max(0, allPendingWords.length - limitedWords.length),
    };
  }

  async getTopicLessonWords(
    userId: string,
    jlptLevel: JLPTLevel,
    topic: string,
    lessonOrder: number,
  ): Promise<StructuredLessonWord[]> {
    await this.ensureLessonSeedData(jlptLevel);

    const words = await this.lessonWordRepository.find({
      where: { jlptLevel, topic, lessonOrder },
      order: { wordOrder: 'ASC' },
    });

    const progressRows = await this.lessonProgressRepository.find({ where: { userId, jlptLevel, topic, lessonOrder } });
    const completedWordIds = new Set(progressRows.map((row) => row.lessonWordId));

    return words.map((word) => this.toStructuredLessonWord(word, completedWordIds));
  }

  async completeLessonWord(userId: string, lessonWordId: string, vocabularyId?: string): Promise<{ lessonWordId: string; completedAt: string }> {
    const lessonWord = await this.lessonWordRepository.findOne({ where: { id: lessonWordId } });
    if (!lessonWord) {
      throw new BadRequestException(`Lesson word not found: ${lessonWordId}`);
    }

    const existing = await this.lessonProgressRepository.findOne({ where: { userId, lessonWordId } });
    if (existing) {
      return {
        lessonWordId: existing.lessonWordId,
        completedAt: existing.completedAt.toISOString(),
      };
    }

    const completedAt = new Date();
    const progress = this.lessonProgressRepository.create({
      id: `lesson-progress-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      lessonWordId,
      jlptLevel: lessonWord.jlptLevel,
      topic: lessonWord.topic,
      lessonOrder: lessonWord.lessonOrder,
      completedAt,
      vocabularyId,
    });
    await this.lessonProgressRepository.save(progress);

    return {
      lessonWordId,
      completedAt: completedAt.toISOString(),
    };
  }

  async addVocabulary(userId: string, payload: { word: Word; exampleSentence: string }): Promise<VocabularyItem> {
    // Check vocabulary limit
    const currentCount = await this.vocabularyRepository.count({ where: { userId } });
    if (currentCount >= this.MAX_VOCABULARY_PER_USER) {
      throw new BadRequestException(
        `Vocabulary limit reached. Maximum ${this.MAX_VOCABULARY_PER_USER} words per user.`
      );
    }

    const now = new Date();
    const vocabulary: VocabularyItem = {
      id: `vocab-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      word: payload.word,
      exampleSentence: payload.exampleSentence,
      dateAdded: now.toISOString(),
      reviewed: false,
      nextReviewDate: now.toISOString(),
      reviewCount: 0,
      difficulty: 'medium',
    };

    await this.vocabularyRepository.save(this.toVocabularyEntity(vocabulary));
    await this.ensureFlashcardForVocabulary(vocabulary);

    return vocabulary;
  }

  async updateVocabularyReviewStatus(userId: string, vocabularyId: string, difficulty: ReviewDifficulty): Promise<VocabularyItem | null> {
    const item = await this.vocabularyRepository.findOne({ where: { id: vocabularyId, userId } });

    if (!item) {
      return null;
    }

    item.difficulty = difficulty;
    item.reviewed = true;
    item.reviewCount += 1;

    const daysToAdd = difficulty === 'hard' ? 1 : difficulty === 'medium' ? 3 : 7;
    item.nextReviewDate = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);

    const saved = await this.vocabularyRepository.save(item);

    return this.toVocabularyItem(saved);
  }

  async scheduleVocabularyForImmediateReview(userId: string, vocabularyId: string): Promise<VocabularyItem | null> {
    const item = await this.vocabularyRepository.findOne({ where: { id: vocabularyId, userId } });

    if (!item) {
      return null;
    }

    item.nextReviewDate = new Date();
    const saved = await this.vocabularyRepository.save(item);
    return this.toVocabularyItem(saved);
  }

  async deleteVocabulary(userId: string, vocabularyId: string): Promise<boolean> {
    const deletedVocabulary = await this.vocabularyRepository.delete({ id: vocabularyId, userId });

    if (deletedVocabulary.affected && deletedVocabulary.affected > 0) {
      await this.flashcardRepository.delete({ userId, vocabularyId });
      return true;
    }

    return false;
  }

  async createFolder(userId: string, name: string, color: string = ''): Promise<Folder> {
    const folder: Folder = {
      id: `folder-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      name,
      color,
      createdAt: new Date().toISOString(),
      wordCount: 0,
    };

    await this.folderRepository.save(this.toFolderEntity(folder));
    return folder;
  }

  async getFolders(userId: string): Promise<Folder[]> {
    const folders = await this.folderRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return folders.map((f) => this.toFolder(f));
  }

  async deleteFolder(userId: string, folderId: string): Promise<boolean> {
    const deleted = await this.folderRepository.delete({ id: folderId, userId });
    if (deleted.affected && deleted.affected > 0) {
      // Remove folderId from all words in this folder
      await this.vocabularyRepository.update(
        { userId, folderId },
        { folderId: null },
      );
      return true;
    }
    return false;
  }

  async moveWordToFolder(userId: string, vocabularyId: string, folderId: string | null): Promise<boolean> {
    const updated = await this.vocabularyRepository.update(
      { id: vocabularyId, userId },
      { folderId },
    );
    return updated.affected ? updated.affected > 0 : false;
  }

  async getVocabularyByFolder(userId: string, folderId: string | null): Promise<VocabularyItem[]> {
    const items = await this.vocabularyRepository.find({
      where: { userId, folderId: folderId === null ? null : folderId },
      order: { dateAdded: 'DESC' },
    });
    return items.map((item) => this.toVocabularyItem(item));
  }

  async getFlashcards(userId: string): Promise<FlashcardItem[]> {
    await this.syncFlashcardsWithVocabulary(userId);
    const cards = await this.flashcardRepository.find({ where: { userId } });
    return cards.map((card) => this.toFlashcardItem(card));
  }

  async getDueFlashcards(userId: string): Promise<FlashcardItem[]> {
    const now = new Date();
    const due = await this.flashcardRepository
      .createQueryBuilder('flashcard')
      .where('flashcard.userId = :userId', { userId })
      .andWhere('flashcard.nextReview <= :now', { now: now.toISOString() })
      .getMany();

    return due.map((card) => this.toFlashcardItem(card));
  }

  async reviewFlashcard(userId: string, flashcardId: string, difficulty: ReviewDifficulty): Promise<FlashcardItem | null> {
    const card = await this.flashcardRepository.findOne({ where: { id: flashcardId, userId } });

    if (!card) {
      return null;
    }

    card.difficulty = difficulty;
    card.repetitions += 1;

    let interval = card.interval;
    if (difficulty === 'hard') {
      interval = 1;
    } else if (difficulty === 'medium') {
      interval = card.interval * 1.5;
    } else {
      interval = card.interval * 2;
    }

    card.interval = Math.max(1, Math.floor(interval));
    card.nextReview = new Date(Date.now() + card.interval * 24 * 60 * 60 * 1000);

    const saved = await this.flashcardRepository.save(card);
    await this.updateVocabularyReviewStatus(userId, card.vocabularyId, difficulty);

    return this.toFlashcardItem(saved);
  }

  async scheduleFlashcardForImmediateReview(userId: string, vocabularyId: string): Promise<FlashcardItem | null> {
    const card = await this.flashcardRepository.findOne({ where: { userId, vocabularyId } });

    if (!card) {
      return null;
    }

    card.nextReview = new Date();
    const saved = await this.flashcardRepository.save(card);
    return this.toFlashcardItem(saved);
  }

  private async ensureFlashcardForVocabulary(vocabulary: VocabularyItem): Promise<void> {
    const existing = await this.flashcardRepository.findOne({
      where: { userId: vocabulary.userId, vocabularyId: vocabulary.id },
    });

    if (existing) {
      return;
    }

    const flashcard: FlashcardItem = {
      id: `fc-${vocabulary.id}`,
      userId: vocabulary.userId,
      vocabularyId: vocabulary.id,
      front: vocabulary.word.text,
      back: `${vocabulary.word.reading} - ${vocabulary.word.meaning}`,
      nextReview: new Date().toISOString(),
      difficulty: 'medium',
      interval: 1,
      repetitions: 0,
    };

    await this.flashcardRepository.save(this.toFlashcardEntity(flashcard));
  }

  private async syncFlashcardsWithVocabulary(userId: string): Promise<void> {
    const vocabulary = await this.vocabularyRepository.find({ where: { userId } });
    const vocabularyIds = new Set(vocabulary.map((entry) => entry.id));

    const allCards = await this.flashcardRepository.find({ where: { userId } });
    const orphanedCards = allCards.filter((card) => !vocabularyIds.has(card.vocabularyId));
    if (orphanedCards.length > 0) {
      await this.flashcardRepository.remove(orphanedCards);
    }

    const existingVocabularyIds = new Set(allCards.map((card) => card.vocabularyId));
    const missingCards: FlashcardEntity[] = [];

    for (const item of vocabulary) {
      if (!existingVocabularyIds.has(item.id)) {
        missingCards.push(
          this.toFlashcardEntity({
            id: `fc-${item.id}`,
            userId,
            vocabularyId: item.id,
            front: item.word.text,
            back: `${item.word.reading} - ${item.word.meaning}`,
            nextReview: new Date().toISOString(),
            difficulty: 'medium',
            interval: 1,
            repetitions: 0,
          }),
        );
      }
    }

    if (missingCards.length > 0) {
      await this.flashcardRepository.save(missingCards);
    }
  }

  private async ensureLessonSeedData(jlptLevel: JLPTLevel): Promise<void> {
    if (jlptLevel !== 'N5') {
      return;
    }

    const existingCount = await this.lessonWordRepository.count({ where: { jlptLevel } });
    if (existingCount > 0) {
      return;
    }

    const entities = N5_TOPIC_LESSON_WORDS.map((item) => {
      const topicSlug = item.topic.toLowerCase().replace(/\s+/g, '-');
      return this.lessonWordRepository.create({
        id: `lesson-${item.jlptLevel.toLowerCase()}-${topicSlug}-${item.lessonOrder}-${item.wordOrder}`,
        jlptLevel: item.jlptLevel,
        topic: item.topic,
        topics: [item.topic],
        lessonOrder: item.lessonOrder,
        wordOrder: item.wordOrder,
        word: item.word,
        reading: item.reading,
        meaning: item.meaning,
        emoji: item.emoji,
        partOfSpeech: 'word',
      });
    });

    await this.lessonWordRepository.save(entities);
  }

  private toStructuredLessonWord(entity: LessonWordEntity, completedWordIds: Set<string>): StructuredLessonWord {
    return {
      id: entity.id,
      jlptLevel: entity.jlptLevel as JLPTLevel,
      topic: entity.topic,
      topics: entity.topics,
      lessonOrder: entity.lessonOrder,
      wordOrder: entity.wordOrder,
      word: entity.word,
      reading: entity.reading,
      meaning: entity.meaning,
      emoji: entity.emoji,
      partOfSpeech: entity.partOfSpeech,
      isCompleted: completedWordIds.has(entity.id),
    };
  }

  private toVocabularyItem(entity: VocabularyEntity): VocabularyItem {
    return {
      id: entity.id,
      userId: entity.userId,
      word: entity.word,
      exampleSentence: entity.exampleSentence,
      dateAdded: entity.dateAdded.toISOString(),
      reviewed: entity.reviewed,
      nextReviewDate: entity.nextReviewDate.toISOString(),
      reviewCount: entity.reviewCount,
      difficulty: entity.difficulty,
      folderId: entity.folderId,
    };
  }

  private toFlashcardItem(entity: FlashcardEntity): FlashcardItem {
    return {
      id: entity.id,
      userId: entity.userId,
      vocabularyId: entity.vocabularyId,
      front: entity.front,
      back: entity.back,
      nextReview: entity.nextReview.toISOString(),
      difficulty: entity.difficulty,
      interval: entity.interval,
      repetitions: entity.repetitions,
    };
  }

  private toVocabularyEntity(item: VocabularyItem): VocabularyEntity {
    return {
      id: item.id,
      userId: item.userId,
      word: item.word,
      exampleSentence: item.exampleSentence,
      dateAdded: new Date(item.dateAdded),
      reviewed: item.reviewed,
      nextReviewDate: new Date(item.nextReviewDate),
      reviewCount: item.reviewCount,
      difficulty: item.difficulty,
      folderId: item.folderId,
    };
  }

  private toFlashcardEntity(item: FlashcardItem): FlashcardEntity {
    return {
      id: item.id,
      userId: item.userId,
      vocabularyId: item.vocabularyId,
      front: item.front,
      back: item.back,
      nextReview: new Date(item.nextReview),
      difficulty: item.difficulty,
      interval: item.interval,
      repetitions: item.repetitions,
    };
  }

  private toFolderEntity(folder: Folder): FolderEntity {
    return {
      id: folder.id,
      userId: folder.userId,
      name: folder.name,
      color: folder.color,
      createdAt: new Date(folder.createdAt),
      wordCount: folder.wordCount,
    };
  }

  private toFolder(entity: FolderEntity): Folder {
    return {
      id: entity.id,
      userId: entity.userId,
      name: entity.name,
      color: entity.color,
      createdAt: entity.createdAt.toISOString(),
      wordCount: entity.wordCount,
    };
  }
}
