import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KanjiEntity } from './entities/kanji.entity';
import { KanjiService } from './kanji.service';
import { KanjiController } from './kanji.controller';

@Module({
  imports: [TypeOrmModule.forFeature([KanjiEntity])],
  providers: [KanjiService],
  controllers: [KanjiController],
  exports: [KanjiService],
})
export class KanjiModule {}
