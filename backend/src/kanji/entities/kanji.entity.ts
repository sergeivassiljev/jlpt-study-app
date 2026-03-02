import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('kanji')
export class KanjiEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  character: string;

  @Column()
  meaning: string;

  @Column('simple-json')
  onyomi: string[];

  @Column('simple-json')
  kunyomi: string[];

  @Column('int')
  strokeCount: number;

  @Column()
  level: string; // N5, N4, N3, etc

  @Column('simple-json', { nullable: true })
  vocabulary?: string[];

  @Column('simple-json', { nullable: true })
  exampleSentences?: string[];
}
