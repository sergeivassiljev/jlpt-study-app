import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KanjiEntity } from './entities/kanji.entity';
import { CreateKanjiDto } from './dto/create-kanji.dto';

@Injectable()
export class KanjiService {
  constructor(
    @InjectRepository(KanjiEntity)
    private readonly kanjiRepository: Repository<KanjiEntity>,
  ) {}

  async getKanji(): Promise<KanjiEntity[]> {
    return this.kanjiRepository.find({ order: { character: 'ASC' } });
  }

  async getKanjiByCharacter(character: string): Promise<KanjiEntity | null> {
    return this.kanjiRepository.findOne({ where: { character } });
  }

  async upsertKanji(kanji: CreateKanjiDto): Promise<KanjiEntity> {
    return this.kanjiRepository.save(kanji);
  }

  async getKanjiByLevel(level: string): Promise<KanjiEntity[]> {
    return this.kanjiRepository.find({
      where: { level },
      order: { character: 'ASC' },
    });
  }
}
