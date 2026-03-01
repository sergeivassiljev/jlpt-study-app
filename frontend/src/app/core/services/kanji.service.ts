import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Kanji } from '../models/index';

@Injectable({
  providedIn: 'root'
})
export class KanjiService {
  private kanjiList: Kanji[] = this.initializeN5Kanji();
  private kanjiSubject = new BehaviorSubject<Kanji[]>(this.kanjiList);
  kanji$ = this.kanjiSubject.asObservable();

  constructor() { }

  getKanji(): Observable<Kanji[]> {
    return this.kanji$;
  }

  getKanjiByCharacter(character: string): Kanji | undefined {
    return this.kanjiList.find(k => k.character === character);
  }

  private initializeN5Kanji(): Kanji[] {
    // Complete N5 Kanji List (~105 essential kanji)
    return [
      // Numbers
      { id: 'k-1', character: '一', meaning: 'one', onyomi: ['イチ'], kunyomi: ['ひと', 'ひとつ'], strokeCount: 1, level: 'N5', vocabulary: [], exampleSentences: ['一冊の本があります。', '一番好きです。'] },
      { id: 'k-2', character: '二', meaning: 'two', onyomi: ['ニ'], kunyomi: ['ふた', 'ふたつ'], strokeCount: 2, level: 'N5', vocabulary: [], exampleSentences: ['二人の友達がいます。', '二月です。'] },
      { id: 'k-3', character: '三', meaning: 'three', onyomi: ['サン'], kunyomi: ['み', 'みつ'], strokeCount: 3, level: 'N5', vocabulary: [], exampleSentences: ['三月は春です。', '三つのりんご。'] },
      { id: 'k-4', character: '四', meaning: 'four', onyomi: ['シ', 'ヨン'], kunyomi: ['よ', 'よつ'], strokeCount: 5, level: 'N5', vocabulary: [], exampleSentences: ['四時に会います。', '四人家族です。'] },
      { id: 'k-5', character: '五', meaning: 'five', onyomi: ['ゴ'], kunyomi: ['いつ', 'いつつ'], strokeCount: 4, level: 'N5', vocabulary: [], exampleSentences: ['五月は黄金週間です。', '五個のブドウ。'] },
      { id: 'k-6', character: '六', meaning: 'six', onyomi: ['ロク'], kunyomi: ['む', 'むつ'], strokeCount: 4, level: 'N5', vocabulary: [], exampleSentences: ['六月は雨の季節です。', '六日は何曜日ですか。'] },
      { id: 'k-7', character: '七', meaning: 'seven', onyomi: ['シチ'], kunyomi: ['なな', 'ななつ'], strokeCount: 2, level: 'N5', vocabulary: [], exampleSentences: ['七月は暑いです。', '七日の朝。'] },
      { id: 'k-8', character: '八', meaning: 'eight', onyomi: ['ハチ'], kunyomi: ['や', 'やつ'], strokeCount: 2, level: 'N5', vocabulary: [], exampleSentences: ['八時に起きます。', '八月も暑いです。'] },
      { id: 'k-9', character: '九', meaning: 'nine', onyomi: ['キュウ', 'ク'], kunyomi: ['ここ', 'こここのつ'], strokeCount: 2, level: 'N5', vocabulary: [], exampleSentences: ['九月は秋です。', '九時です。'] },
      { id: 'k-10', character: '十', meaning: 'ten', onyomi: ['ジュウ', 'トウ'], kunyomi: ['と', 'とお'], strokeCount: 2, level: 'N5', vocabulary: [], exampleSentences: ['十月です。', '十人です。'] },
      
      // Days and Time
      { id: 'k-11', character: '日', meaning: 'day, sun', onyomi: ['ニチ', 'ジツ'], kunyomi: ['ひ', 'か'], strokeCount: 4, level: 'N5', vocabulary: [], exampleSentences: ['日曜日です。', '日が昇ります。'] },
      { id: 'k-12', character: '月', meaning: 'month, moon', onyomi: ['ゲツ', 'ガツ'], kunyomi: ['つき'], strokeCount: 4, level: 'N5', vocabulary: [], exampleSentences: ['月がきれいです。', '八月です。'] },
      { id: 'k-13', character: '火', meaning: 'fire, Tuesday', onyomi: ['カ'], kunyomi: ['ひ', 'ほ'], strokeCount: 4, level: 'N5', vocabulary: [], exampleSentences: ['火曜日です。', '火が燃えています。'] },
      { id: 'k-14', character: '水', meaning: 'water, Wednesday', onyomi: ['スイ'], kunyomi: ['みず'], strokeCount: 4, level: 'N5', vocabulary: [], exampleSentences: ['水曜日です。', '水を飲みます。'] },
      { id: 'k-15', character: '木', meaning: 'tree, Thursday', onyomi: ['モク'], kunyomi: ['き'], strokeCount: 4, level: 'N5', vocabulary: [], exampleSentences: ['木曜日です。', '木の下。'] },
      { id: 'k-16', character: '金', meaning: 'gold, money, Friday', onyomi: ['キン'], kunyomi: ['かね'], strokeCount: 8, level: 'N5', vocabulary: [], exampleSentences: ['金曜日です。', '金を貯めます。'] },
      { id: 'k-17', character: '土', meaning: 'earth, soil, Saturday', onyomi: ['ド', 'ト'], kunyomi: ['つち'], strokeCount: 3, level: 'N5', vocabulary: [], exampleSentences: ['土曜日です。', '土が必要です。'] },

      // Common Adjectives/Basic Characters
      { id: 'k-18', character: '大', meaning: 'big, large', onyomi: ['ダイ', 'タイ'], kunyomi: ['おお', 'おおきい'], strokeCount: 3, level: 'N5', vocabulary: [], exampleSentences: ['大きな猫です。', '大学生です。'] },
      { id: 'k-19', character: '小', meaning: 'small', onyomi: ['ショウ'], kunyomi: ['ちい', 'ちいさい'], strokeCount: 3, level: 'N5', vocabulary: [], exampleSentences: ['小さい子どもです。', '小学校です。'] },
      { id: 'k-20', character: '中', meaning: 'middle, inside', onyomi: ['チュウ'], kunyomi: ['なか'], strokeCount: 4, level: 'N5', vocabulary: [], exampleSentences: ['中学校です。', '中に入ります。'] },
      { id: 'k-21', character: '上', meaning: 'up, above', onyomi: ['ジョウ', 'ショウ'], kunyomi: ['うえ', 'あ', 'あげる'], strokeCount: 3, level: 'N5', vocabulary: [], exampleSentences: ['上に上ります。', '上着を脱ぎます。'] },
      { id: 'k-22', character: '下', meaning: 'down, below', onyomi: ['カ', 'ゲ'], kunyomi: ['した', 'しも', 'さ'], strokeCount: 3, level: 'N5', vocabulary: [], exampleSentences: ['下に降ります。', '下の階です。'] },
      { id: 'k-23', character: '左', meaning: 'left', onyomi: ['サ'], kunyomi: ['ひだり'], strokeCount: 5, level: 'N5', vocabulary: [], exampleSentences: ['左に曲がります。', '左手です。'] },
      { id: 'k-24', character: '右', meaning: 'right', onyomi: ['ウ', 'ユウ'], kunyomi: ['みぎ'], strokeCount: 5, level: 'N5', vocabulary: [], exampleSentences: ['右に曲がります。', '右手です。'] },
      { id: 'k-25', character: '黒', meaning: 'black', onyomi: ['コク'], kunyomi: ['くろ'], strokeCount: 11, level: 'N5', vocabulary: [], exampleSentences: ['黒い猫がいます。', '黒い服です。'] },
      { id: 'k-26', character: '白', meaning: 'white', onyomi: ['ハク', 'パク'], kunyomi: ['しろ', 'しら'], strokeCount: 5, level: 'N5', vocabulary: [], exampleSentences: ['白い猫です。', '白いワイシャツ。'] },
      { id: 'k-27', character: '赤', meaning: 'red', onyomi: ['セキ', 'シャク'], kunyomi: ['あか', 'あかい'], strokeCount: 7, level: 'N5', vocabulary: [], exampleSentences: ['赤いリンゴです。', '赤信号です。'] },
      { id: 'k-28', character: '青', meaning: 'blue', onyomi: ['セイ', 'ショウ'], kunyomi: ['あお'], strokeCount: 8, level: 'N5', vocabulary: [], exampleSentences: ['青い空です。', '青信号です。'] },

      // People and Relations
      { id: 'k-29', character: '人', meaning: 'person', onyomi: ['ジン', 'ニン'], kunyomi: ['ひと'], strokeCount: 2, level: 'N5', vocabulary: [], exampleSentences: ['人がたくさんいます。', '友人です。'] },
      { id: 'k-30', character: '男', meaning: 'man, male', onyomi: ['ダン'], kunyomi: ['おとこ'], strokeCount: 7, level: 'N5', vocabulary: [], exampleSentences: ['男の子です。', '男性です。'] },
      { id: 'k-31', character: '女', meaning: 'woman, female', onyomi: ['ジョ'], kunyomi: ['おんな', 'め'], strokeCount: 3, level: 'N5', vocabulary: [], exampleSentences: ['女の子です。', '女性です。'] },
      { id: 'k-32', character: '子', meaning: 'child', onyomi: ['シ', 'ス'], kunyomi: ['こ'], strokeCount: 3, level: 'N5', vocabulary: [], exampleSentences: ['子どもです。', '息子です。'] },
      { id: 'k-33', character: '友', meaning: 'friend', onyomi: ['ユウ'], kunyomi: ['とも'], strokeCount: 4, level: 'N5', vocabulary: [], exampleSentences: ['友達になります。', '友人です。'] },
      { id: 'k-34', character: '父', meaning: 'father', onyomi: ['フ', 'ッ'], kunyomi: ['ちち'], strokeCount: 4, level: 'N5', vocabulary: [], exampleSentences: ['父は医者です。', '父に会います。'] },
      { id: 'k-35', character: '母', meaning: 'mother', onyomi: ['ボ'], kunyomi: ['はは', 'も'], strokeCount: 5, level: 'N5', vocabulary: [], exampleSentences: ['母は先生です。', '母に電話します。'] },
      { id: 'k-36', character: '兄', meaning: 'older brother', onyomi: ['キョウ'], kunyomi: ['あに'], strokeCount: 5, level: 'N5', vocabulary: [], exampleSentences: ['兄は大学生です。', '兄に相談します。'] },
      { id: 'k-37', character: '弟', meaning: 'younger brother', onyomi: ['テイ', 'ダイ'], kunyomi: ['おとうと'], strokeCount: 5, level: 'N5', vocabulary: [], exampleSentences: ['弟は学生です。', '弟と遊びます。'] },
      { id: 'k-38', character: '姉', meaning: 'older sister', onyomi: ['シ'], kunyomi: ['あね'], strokeCount: 8, level: 'N5', vocabulary: [], exampleSentences: ['姉は看護婦です。', '姉に聞きます。'] },
      { id: 'k-39', character: '妹', meaning: 'younger sister', onyomi: ['マイ'], kunyomi: ['いもうと'], strokeCount: 8, level: 'N5', vocabulary: [], exampleSentences: ['妹は中学生です。', '妹と買い物します。'] },

      // Food and Nature
      { id: 'k-40', character: '米', meaning: 'rice', onyomi: ['ベイ', 'マイ'], kunyomi: ['こめ'], strokeCount: 6, level: 'N5', vocabulary: [], exampleSentences: ['米を食べます。', '米が好きです。'] },
      { id: 'k-41', character: '食', meaning: 'eat, food', onyomi: ['ショク'], kunyomi: ['たべる', 'くう'], strokeCount: 9, level: 'N5', vocabulary: [], exampleSentences: ['食べ物が好きです。', '食事をします。'] },
      { id: 'k-42', character: '山', meaning: 'mountain', onyomi: ['サン'], kunyomi: ['やま'], strokeCount: 3, level: 'N5', vocabulary: [], exampleSentences: ['山に登ります。', '高い山です。'] },
      { id: 'k-43', character: '川', meaning: 'river', onyomi: ['セン'], kunyomi: ['かわ'], strokeCount: 3, level: 'N5', vocabulary: [], exampleSentences: ['川で遊びます。', '大きな川です。'] },
      { id: 'k-44', character: '花', meaning: 'flower', onyomi: ['カ'], kunyomi: ['はな'], strokeCount: 7, level: 'N5', vocabulary: [], exampleSentences: ['花がきれいです。', '花を育てます。'] },
      { id: 'k-45', character: '草', meaning: 'grass, herb', onyomi: ['ソウ'], kunyomi: ['くさ'], strokeCount: 9, level: 'N5', vocabulary: [], exampleSentences: ['草を切ります。', '草がいっぱいです。'] },
      { id: 'k-46', character: '木', meaning: 'tree', onyomi: ['モク'], kunyomi: ['き'], strokeCount: 4, level: 'N5', vocabulary: [], exampleSentences: ['木の下。', '木が高いです。'] },
      { id: 'k-47', character: '雨', meaning: 'rain', onyomi: ['ウ'], kunyomi: ['あめ'], strokeCount: 8, level: 'N5', vocabulary: [], exampleSentences: ['雨が降っています。', '雨が好きではありません。'] },
      { id: 'k-48', character: '雪', meaning: 'snow', onyomi: ['セツ'], kunyomi: ['ゆき'], strokeCount: 11, level: 'N5', vocabulary: [], exampleSentences: ['雪が積もっています。', '雪が美しいです。'] },
      { id: 'k-49', character: '風', meaning: 'wind', onyomi: ['フウ', 'フ'], kunyomi: ['かぜ'], strokeCount: 9, level: 'N5', vocabulary: [], exampleSentences: ['風が強いです。', '風邪をひきました。'] },

      // Action Verbs (in kanji form)
      { id: 'k-50', character: '来', meaning: 'come', onyomi: ['ライ'], kunyomi: ['く', 'くる'], strokeCount: 7, level: 'N5', vocabulary: [], exampleSentences: ['猫が来ました。', '友達が来ます。'] },
      { id: 'k-51', character: '行', meaning: 'go', onyomi: ['コウ', 'ギョウ'], kunyomi: ['い', 'いく', 'ゆ'], strokeCount: 6, level: 'N5', vocabulary: [], exampleSentences: ['学校に行きます。', '行きましょう。'] },
      { id: 'k-52', character: '見', meaning: 'look, see', onyomi: ['ケン'], kunyomi: ['み', 'みる'], strokeCount: 7, level: 'N5', vocabulary: [], exampleSentences: ['映画を見ます。', '見えますか。'] },
      { id: 'k-53', character: '聞', meaning: 'listen, hear', onyomi: ['ブン', 'モン'], kunyomi: ['き', 'きく'], strokeCount: 8, level: 'N5', vocabulary: [], exampleSentences: ['音楽を聞きます。', '質問を聞きます。'] },
      { id: 'k-54', character: '知', meaning: 'know', onyomi: ['チ'], kunyomi: ['し', 'しる'], strokeCount: 8, level: 'N5', vocabulary: [], exampleSentences: ['知っていますか。', '知人です。'] },
      { id: 'k-55', character: '使', meaning: 'use', onyomi: ['シ'], kunyomi: ['つかう'], strokeCount: 8, level: 'N5', vocabulary: [], exampleSentences: ['ペンを使います。', '使い方を教えます。'] },
      { id: 'k-56', character: '作', meaning: 'make, create', onyomi: ['サク'], kunyomi: ['つく', 'つくる'], strokeCount: 7, level: 'N5', vocabulary: [], exampleSentences: ['料理を作ります。', '作品です。'] },
      { id: 'k-57', character: '読', meaning: 'read', onyomi: ['トク', 'ドク'], kunyomi: ['よ', 'よむ'], strokeCount: 10, level: 'N5', vocabulary: [], exampleSentences: ['本を読みます。', '読書が好きです。'] },
      { id: 'k-58', character: '書', meaning: 'write', onyomi: ['ショ'], kunyomi: ['か', 'かく'], strokeCount: 10, level: 'N5', vocabulary: [], exampleSentences: ['手紙を書きます。', '字を書きます。'] },
      { id: 'k-59', character: '立', meaning: 'stand', onyomi: ['リツ', 'リュウ'], kunyomi: ['た', 'たつ', 'たて'], strokeCount: 5, level: 'N5', vocabulary: [], exampleSentences: ['立ってください。', '立てます。'] },
      { id: 'k-60', character: '座', meaning: 'sit', onyomi: ['ザ'], kunyomi: ['すわ', 'すわる'], strokeCount: 7, level: 'N5', vocabulary: [], exampleSentences: ['座ってください。', '座りました。'] },

      // Places and Objects
      { id: 'k-61', character: '家', meaning: 'house, home', onyomi: ['カ', 'ケ'], kunyomi: ['いえ', 'や'], strokeCount: 10, level: 'N5', vocabulary: [], exampleSentences: ['家に帰ります。', '大きな家です。'] },
      { id: 'k-62', character: '学', meaning: 'study, learn', onyomi: ['ガク'], kunyomi: [], strokeCount: 8, level: 'N5', vocabulary: [], exampleSentences: ['学校です。', '学生です。'] },
      { id: 'k-63', character: '校', meaning: 'school', onyomi: ['コウ'], kunyomi: [], strokeCount: 10, level: 'N5', vocabulary: [], exampleSentences: ['学校に行きます。', '高い校舎です。'] },
      { id: 'k-64', character: '店', meaning: 'shop, store', onyomi: ['テン'], kunyomi: ['みせ'], strokeCount: 8, level: 'N5', vocabulary: [], exampleSentences: ['店で買い物します。', '駅の近くの店。'] },
      { id: 'k-65', character: '本', meaning: 'book', onyomi: ['ホン'], kunyomi: ['もと'], strokeCount: 5, level: 'N5', vocabulary: [], exampleSentences: ['本を読みます。', '本が好きです。'] },
      { id: 'k-66', character: '門', meaning: 'gate', onyomi: ['モン'], kunyomi: ['かど'], strokeCount: 8, level: 'N5', vocabulary: [], exampleSentences: ['門の前。', '門を通ります。'] },
      { id: 'k-67', character: '車', meaning: 'car, vehicle', onyomi: ['シャ'], kunyomi: ['くるま'], strokeCount: 7, level: 'N5', vocabulary: [], exampleSentences: ['車で行きます。', '車が好きです。'] },
      { id: 'k-68', character: '電', meaning: 'electricity', onyomi: ['デン'], kunyomi: [], strokeCount: 13, level: 'N5', vocabulary: [], exampleSentences: ['電車で移動します。', '電気をつけます。'] },
      { id: 'k-69', character: '話', meaning: 'talk, story', onyomi: ['ワ'], kunyomi: ['はなし', 'はなす'], strokeCount: 13, level: 'N5', vocabulary: [], exampleSentences: ['話を聞きます。', '話すことが好きです。'] },
      { id: 'k-70', character: '字', meaning: 'character, letter', onyomi: ['ジ'], kunyomi: ['あざ'], strokeCount: 6, level: 'N5', vocabulary: [], exampleSentences: ['字を書きます。', '浮き字です。'] },

      // Time and Periods
      { id: 'k-71', character: '時', meaning: 'time, hour', onyomi: ['ジ', 'トキ'], kunyomi: ['とき'], strokeCount: 10, level: 'N5', vocabulary: [], exampleSentences: ['何時ですか。', '時間があります。'] },
      { id: 'k-72', character: '間', meaning: 'between, interval', onyomi: ['カン'], kunyomi: ['ま', 'あいだ'], strokeCount: 12, level: 'N5', vocabulary: [], exampleSentences: ['その間に。', '間もなく。'] },
      { id: 'k-73', character: '朝', meaning: 'morning', onyomi: ['チョウ', 'アサ'], kunyomi: ['あさ'], strokeCount: 12, level: 'N5', vocabulary: [], exampleSentences: ['朝、起きます。', '朝の散歩。'] },
      { id: 'k-74', character: '昼', meaning: 'noon, daytime', onyomi: ['チュウ'], kunyomi: ['ひる'], strokeCount: 9, level: 'N5', vocabulary: [], exampleSentences: ['昼間です。', '昼食を食べます。'] },
      { id: 'k-75', character: '夜', meaning: 'night', onyomi: ['ヤ'], kunyomi: ['よ', 'よる'], strokeCount: 8, level: 'N5', vocabulary: [], exampleSentences: ['夜に勉強します。', '夜が好きです。'] },
      { id: 'k-76', character: '春', meaning: 'spring', onyomi: ['シュン'], kunyomi: ['はる'], strokeCount: 9, level: 'N5', vocabulary: [], exampleSentences: ['春が来ました。', '春は桜が咲きます。'] },
      { id: 'k-77', character: '夏', meaning: 'summer', onyomi: ['カ'], kunyomi: ['なつ'], strokeCount: 10, level: 'N5', vocabulary: [], exampleSentences: ['夏は暑いです。', '夏休み。'] },
      { id: 'k-78', character: '秋', meaning: 'autumn, fall', onyomi: ['シュウ'], kunyomi: ['あき'], strokeCount: 9, level: 'N5', vocabulary: [], exampleSentences: ['秋は涼しいです。', '秋紅葉。'] },
      { id: 'k-79', character: '冬', meaning: 'winter', onyomi: ['トウ'], kunyomi: ['ふゆ'], strokeCount: 5, level: 'N5', vocabulary: [], exampleSentences: ['冬は寒いです。', '冬休み。'] },

      // Adjectives and Qualities
      { id: 'k-80', character: '長', meaning: 'long', onyomi: ['チョウ'], kunyomi: ['なが', 'ながい'], strokeCount: 8, level: 'N5', vocabulary: [], exampleSentences: ['長い髪です。', '長い時間。'] },
      { id: 'k-81', character: '短', meaning: 'short', onyomi: ['タン'], kunyomi: ['みじか', 'みじかい'], strokeCount: 12, level: 'N5', vocabulary: [], exampleSentences: ['短い髪です。', '短い話。'] },
      { id: 'k-82', character: '高', meaning: 'high, tall', onyomi: ['コウ'], kunyomi: ['たか', 'たかい'], strokeCount: 10, level: 'N5', vocabulary: [], exampleSentences: ['高い山です。', '背が高いです。'] },
      { id: 'k-83', character: '低', meaning: 'low, short', onyomi: ['テイ'], kunyomi: ['ひくい'], strokeCount: 7, level: 'N5', vocabulary: [], exampleSentences: ['低い声です。', '低い建物。'] },
      { id: 'k-84', character: '新', meaning: 'new', onyomi: ['シン'], kunyomi: ['あたらしい'], strokeCount: 13, level: 'N5', vocabulary: [], exampleSentences: ['新しい本です。', '新年。'] },
      { id: 'k-85', character: '古', meaning: 'old (things)', onyomi: ['コ', 'ク'], kunyomi: ['ふるい'], strokeCount: 5, level: 'N5', vocabulary: [], exampleSentences: ['古い家です。', '古い友人。'] },
      { id: 'k-86', character: '美', meaning: 'beautiful', onyomi: ['ビ'], kunyomi: ['うつくしい'], strokeCount: 9, level: 'N5', vocabulary: [], exampleSentences: ['美しい花です。', '美しい女性。'] },
      { id: 'k-87', character: '得', meaning: 'gain, win', onyomi: ['トク'], kunyomi: ['え', 'える', 'う'], strokeCount: 11, level: 'N5', vocabulary: [], exampleSentences: ['利得です。', '得意です。'] },

      // Movement and Actions
      { id: 'k-88', character: '歩', meaning: 'walk', onyomi: ['ホ'], kunyomi: ['あ', 'あるく', 'ぶ'], strokeCount: 13, level: 'N5', vocabulary: [], exampleSentences: ['歩いて行きます。', '散歩します。'] },
      { id: 'k-89', character: '走', meaning: 'run', onyomi: ['ソウ'], kunyomi: ['はし', 'はしる'], strokeCount: 27, level: 'N5', vocabulary: [], exampleSentences: ['走ります。', '走って来ました。'] },
      { id: 'k-90', character: '飛', meaning: 'fly', onyomi: ['ヒ'], kunyomi: ['と', 'とぶ'], strokeCount: 9, level: 'N5', vocabulary: [], exampleSentences: ['鳥が飛びます。', '飛行機が飛びます。'] },
      { id: 'k-91', character: '泳', meaning: 'swim', onyomi: ['エイ'], kunyomi: ['およぐ'], strokeCount: 8, level: 'N5', vocabulary: [], exampleSentences: ['泳ぎます。', '海で泳ぎます。'] },
      { id: 'k-92', character: '乗', meaning: 'ride', onyomi: ['ジョウ', 'ショウ'], kunyomi: ['の', 'のる'], strokeCount: 9, level: 'N5', vocabulary: [], exampleSentences: ['電車に乗ります。', '乗っています。'] },
      { id: 'k-93', character: '降', meaning: 'descend, fall', onyomi: ['コウ'], kunyomi: ['お', 'おりる', 'ふ'], strokeCount: 10, level: 'N5', vocabulary: [], exampleSentences: ['雨が降ります。', '降ろします。'] },
      { id: 'k-94', character: '遊', meaning: 'play', onyomi: ['ユウ'], kunyomi: ['あそ', 'あそぶ'], strokeCount: 13, level: 'N5', vocabulary: [], exampleSentences: ['遊びます。', '公園で遊びます。'] },
      { id: 'k-95', character: '投', meaning: 'throw', onyomi: ['トウ'], kunyomi: ['な', 'なげる'], strokeCount: 7, level: 'N5', vocabulary: [], exampleSentences: ['ボールを投げます。', '投げました。'] },

      // Numbers and Math Related
      { id: 'k-96', character: '百', meaning: 'hundred', onyomi: ['ヒャク'], kunyomi: [], strokeCount: 6, level: 'N5', vocabulary: [], exampleSentences: ['百円です。', '百人以上。'] },
      { id: 'k-97', character: '千', meaning: 'thousand', onyomi: ['セン'], kunyomi: ['ち'], strokeCount: 3, level: 'N5', vocabulary: [], exampleSentences: ['千円です。', '千人以上。'] },
      { id: 'k-98', character: '万', meaning: 'ten thousand', onyomi: ['マン'], kunyomi: ['よろず'], strokeCount: 3, level: 'N5', vocabulary: [], exampleSentences: ['万円です。', '万年。'] },
      { id: 'k-99', character: '名', meaning: 'name, reputation', onyomi: ['メイ', 'ミョウ'], kunyomi: ['な'], strokeCount: 6, level: 'N5', vocabulary: [], exampleSentences: ['名前は何ですか。', '有名です。'] },
      { id: 'k-100', character: '猫', meaning: 'cat', onyomi: ['ビョウ'], kunyomi: ['ねこ'], strokeCount: 11, level: 'N5', vocabulary: ['vocab-nekomonogatari'], exampleSentences: ['猫は動物です。', '黒い猫が好きです。'] },
      { id: 'k-101', character: '犬', meaning: 'dog', onyomi: ['ケン'], kunyomi: ['いぬ'], strokeCount: 4, level: 'N5', vocabulary: [], exampleSentences: ['犬が好きです。', '犬を飼います。'] },
      { id: 'k-102', character: '鳥', meaning: 'bird', onyomi: ['チョウ'], kunyomi: ['とり'], strokeCount: 11, level: 'N5', vocabulary: [], exampleSentences: ['鳥が歌います。', '鳥小屋です。'] },
      { id: 'k-103', character: '魚', meaning: 'fish', onyomi: ['ギョ'], kunyomi: ['さかな'], strokeCount: 11, level: 'N5', vocabulary: [], exampleSentences: ['魚を釣ります。', '魚が好きです。'] },
      { id: 'k-104', character: '寝', meaning: 'sleep', onyomi: ['シン'], kunyomi: ['ね', 'ねる'], strokeCount: 13, level: 'N5', vocabulary: [], exampleSentences: ['寝ます。', '寝てください。'] },
      { id: 'k-105', character: '起', meaning: 'wake up, rise', onyomi: ['キ'], kunyomi: ['おきる', 'おこす'], strokeCount: 10, level: 'N5', vocabulary: [], exampleSentences: ['起きます。', '朝、起きます。'] }
    ];
  }
}
