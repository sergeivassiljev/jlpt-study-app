import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'vocabulary_folders' })
export class FolderEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  userId: string;

  @Column()
  name: string;

  @Column({ type: 'text', default: '' })
  color: string;

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ default: 0 })
  wordCount: number;
}
