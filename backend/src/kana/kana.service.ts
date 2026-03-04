import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { Kana, KanaType } from '../types';

@Injectable()
export class KanaService {
  private kanaData: Kana[] = [];

  constructor() {
    this.initializeKanaData();
  }

  private initializeKanaData(): void {
    const hiragana: [string, string][] = [
      ['あ', 'a'], ['い', 'i'], ['う', 'u'], ['え', 'e'], ['お', 'o'],
      ['か', 'ka'], ['き', 'ki'], ['く', 'ku'], ['け', 'ke'], ['こ', 'ko'],
      ['が', 'ga'], ['ぎ', 'gi'], ['ぐ', 'gu'], ['げ', 'ge'], ['ご', 'go'],
      ['さ', 'sa'], ['し', 'shi'], ['す', 'su'], ['せ', 'se'], ['そ', 'so'],
      ['ざ', 'za'], ['じ', 'ji'], ['ず', 'zu'], ['ぜ', 'ze'], ['ぞ', 'zo'],
      ['た', 'ta'], ['ち', 'chi'], ['つ', 'tsu'], ['て', 'te'], ['と', 'to'],
      ['だ', 'da'], ['ぢ', 'di'], ['づ', 'du'], ['で', 'de'], ['ど', 'do'],
      ['な', 'na'], ['に', 'ni'], ['ぬ', 'nu'], ['ね', 'ne'], ['の', 'no'],
      ['は', 'ha'], ['ひ', 'hi'], ['ふ', 'fu'], ['へ', 'he'], ['ほ', 'ho'],
      ['ば', 'ba'], ['び', 'bi'], ['ぶ', 'bu'], ['べ', 'be'], ['ぼ', 'bo'],
      ['ぱ', 'pa'], ['ぴ', 'pi'], ['ぷ', 'pu'], ['ぺ', 'pe'], ['ぽ', 'po'],
      ['ま', 'ma'], ['み', 'mi'], ['む', 'mu'], ['め', 'me'], ['も', 'mo'],
      ['や', 'ya'], ['ゆ', 'yu'], ['よ', 'yo'],
      ['ら', 'ra'], ['り', 'ri'], ['る', 'ru'], ['れ', 're'], ['ろ', 'ro'],
      ['わ', 'wa'], ['ゐ', 'wi'], ['ゑ', 'we'], ['を', 'wo'], ['ん', 'n'],
    ];

    const katakana: [string, string][] = [
      ['ア', 'a'], ['イ', 'i'], ['ウ', 'u'], ['エ', 'e'], ['オ', 'o'],
      ['カ', 'ka'], ['キ', 'ki'], ['ク', 'ku'], ['ケ', 'ke'], ['コ', 'ko'],
      ['ガ', 'ga'], ['ギ', 'gi'], ['グ', 'gu'], ['ゲ', 'ge'], ['ゴ', 'go'],
      ['サ', 'sa'], ['シ', 'shi'], ['ス', 'su'], ['セ', 'se'], ['ソ', 'so'],
      ['ザ', 'za'], ['ジ', 'ji'], ['ズ', 'zu'], ['ゼ', 'ze'], ['ゾ', 'zo'],
      ['タ', 'ta'], ['チ', 'chi'], ['ツ', 'tsu'], ['テ', 'te'], ['ト', 'to'],
      ['ダ', 'da'], ['ヂ', 'di'], ['ヅ', 'du'], ['デ', 'de'], ['ド', 'do'],
      ['ナ', 'na'], ['ニ', 'ni'], ['ヌ', 'nu'], ['ネ', 'ne'], ['ノ', 'no'],
      ['ハ', 'ha'], ['ヒ', 'hi'], ['フ', 'fu'], ['ヘ', 'he'], ['ホ', 'ho'],
      ['バ', 'ba'], ['ビ', 'bi'], ['ブ', 'bu'], ['ベ', 'be'], ['ボ', 'bo'],
      ['パ', 'pa'], ['ピ', 'pi'], ['プ', 'pu'], ['ペ', 'pe'], ['ポ', 'po'],
      ['マ', 'ma'], ['ミ', 'mi'], ['ム', 'mu'], ['メ', 'me'], ['モ', 'mo'],
      ['ヤ', 'ya'], ['ユ', 'yu'], ['ヨ', 'yo'],
      ['ラ', 'ra'], ['リ', 'ri'], ['ル', 'ru'], ['レ', 're'], ['ロ', 'ro'],
      ['ワ', 'wa'], ['ヰ', 'wi'], ['ヱ', 'we'], ['ヲ', 'wo'], ['ン', 'n'],
    ];

    // Create hiragana kana objects
    hiragana.forEach(([character, romaji]) => {
      this.kanaData.push({
        id: uuid(),
        character,
        romaji,
        type: 'hiragana',
        strokeOrder: undefined,
        isDiacritical: false,
      });
    });

    // Create katakana kana objects
    katakana.forEach(([character, romaji]) => {
      this.kanaData.push({
        id: uuid(),
        character,
        romaji,
        type: 'katakana',
        strokeOrder: undefined,
        isDiacritical: false,
      });
    });
  }

  getAllKana(): Kana[] {
    return this.kanaData;
  }

  getKanaByType(type: KanaType): Kana[] {
    return this.kanaData.filter(kana => kana.type === type);
  }

  getRandomKana(type?: KanaType, count: number = 1): Kana[] {
    let source = type ? this.getKanaByType(type) : this.kanaData;
    const result: Kana[] = [];

    for (let i = 0; i < count && source.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * source.length);
      result.push(source[randomIndex]);
      source = source.filter((_, index) => index !== randomIndex);
    }

    return result;
  }

  searchKana(query: string): Kana[] {
    const lowerQuery = query.toLowerCase();
    return this.kanaData.filter(
      kana =>
        kana.character.includes(query) ||
        kana.romaji.toLowerCase().includes(lowerQuery),
    );
  }

  getKanaById(id: string): Kana | undefined {
    return this.kanaData.find(kana => kana.id === id);
  }
}
