import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'chapters' })
export class ChapterEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  bookId: string;

  @Column({ default: 1 })
  number: number;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'simple-json' })
  content: string[];
}
