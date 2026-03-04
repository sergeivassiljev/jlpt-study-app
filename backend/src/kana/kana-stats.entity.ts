import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum KanaMasteryLevel {
  NOT_PRACTICED = 'not_practiced',
  WEAK = 'weak',
  MEDIUM = 'medium',
  STRONG = 'strong'
}

@Entity('kana_stats')
@Index(['userId', 'character', 'type'], { unique: true })
export class KanaStats {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  userId: string;

  @Column({ type: 'int', nullable: true })
  kanaId?: number;

  @Column()
  character: string;

  @Column()
  romaji: string;

  @Column({ type: 'varchar', length: 20 })
  type: 'hiragana' | 'katakana';

  @Column({ type: 'int', default: 0 })
  totalAttempts: number;

  @Column({ type: 'int', default: 0 })
  correctAttempts: number;

  @Column({ type: 'int', default: 0 })
  incorrectAttempts: number;

  @Column({ type: 'float', default: 0 })
  totalResponseTime: number; // in milliseconds

  @Column({ type: 'float', default: 0 })
  avgResponseTime: number; // in milliseconds

  @Column({ type: 'float', default: 0 })
  accuracy: number; // percentage (0-100)

  @Column({ type: 'float', default: 0 })
  masteryScore: number; // 0-100

  @Column({ 
    type: 'varchar', 
    length: 20, 
    default: KanaMasteryLevel.NOT_PRACTICED 
  })
  masteryLevel: KanaMasteryLevel;

  @Column({ type: 'datetime', nullable: true })
  lastPracticedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
