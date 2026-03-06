import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('kana_ninja_leaderboard')
@Index(['userId'], { unique: true })
@Index(['bestScore'])
export class KanaLeaderboardEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  userId: string;

  @Column({ type: 'int', default: 0 })
  bestScore: number;

  @Column({ type: 'datetime', nullable: true })
  bestScoreAt: Date | null;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
