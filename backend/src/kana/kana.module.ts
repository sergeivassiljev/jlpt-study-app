import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KanaService } from './kana.service';
import { KanaStatsService } from './kana-stats.service';
import { KanaController } from './kana.controller';
import { KanaStats } from './kana-stats.entity';

@Module({
  imports: [TypeOrmModule.forFeature([KanaStats])],
  providers: [KanaService, KanaStatsService],
  controllers: [KanaController],
  exports: [KanaService, KanaStatsService],
})
export class KanaModule {}
