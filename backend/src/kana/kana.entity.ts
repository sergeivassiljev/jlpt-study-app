import { Column, Entity, PrimaryColumn } from 'typeorm';

export type KanaType = 'hiragana' | 'katakana';

@Entity({ name: 'kana_characters' })
export class KanaEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  character: string;

  @Column()
  romaji: string;

  @Column()
  type: KanaType;

  @Column({ nullable: true })
  strokeOrder?: string;

  @Column({ default: false })
  isDiacritical: boolean;
}
