import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'lesson_word_progress' })
export class LessonWordProgressEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  userId: string;

  @Column()
  lessonWordId: string;

  @Column()
  jlptLevel: string;

  @Column()
  topic: string;

  @Column()
  lessonOrder: number;

  @Column({ type: 'datetime' })
  completedAt: Date;

  @Column({ nullable: true })
  vocabularyId?: string;
}
