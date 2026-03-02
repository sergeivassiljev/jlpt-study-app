import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { KanjiService } from './kanji.service';
import { CreateKanjiDto } from './dto/create-kanji.dto';

@Controller('kanji')
export class KanjiController {
  constructor(private readonly kanjiService: KanjiService) {}

  @Get()
  async list() {
    return await this.kanjiService.getKanji();
  }

  @Get('level/:level')
  async getByLevel(@Param('level') level: string) {
    return await this.kanjiService.getKanjiByLevel(level);
  }

  @Get(':character')
  async getByCharacter(@Param('character') character: string) {
    return await this.kanjiService.getKanjiByCharacter(character);
  }

  @Post()
  async createOrUpdate(@Body() body: CreateKanjiDto) {
    return await this.kanjiService.upsertKanji(body);
  }

  @Post('batch')
  async batchCreateOrUpdate(@Body() body: CreateKanjiDto[]) {
    return Promise.all(body.map(kanji => this.kanjiService.upsertKanji(kanji)));
  }
}
