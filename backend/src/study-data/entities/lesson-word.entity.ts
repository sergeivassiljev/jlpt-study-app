import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'lesson_words' })
export class LessonWordEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  jlptLevel: string;

  @Column()
  topic: string;

  @Column({ type: 'simple-json' })
  topics: string[];

  @Column()
  lessonOrder: number;

  @Column()
  wordOrder: number;

  @Column()
  word: string;

  @Column()
  reading: string;

  @Column({ type: 'text' })
  meaning: string;

  @Column({ nullable: true })
  emoji?: string;

  @Column({ default: 'word' })
  partOfSpeech: string;
}
