import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'books' })
export class BookEntity {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  level: 'beginner' | 'N5' | 'N4' | 'N3';

  @Column({ default: 0 })
  chaptersCount: number;

  @Column({ type: 'text', nullable: true })
  coverImage?: string;
}
