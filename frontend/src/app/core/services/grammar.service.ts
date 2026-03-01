import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GrammarItem } from '../models/index';

@Injectable({
  providedIn: 'root'
})
export class GrammarService {
  private grammarItems: GrammarItem[] = this.initializeN5Grammar();
  private grammarSubject = new BehaviorSubject<GrammarItem[]>(this.grammarItems);
  grammar$ = this.grammarSubject.asObservable();

  constructor() { }

  getGrammar(): Observable<GrammarItem[]> {
    return this.grammar$;
  }

  getGrammarItem(id: string): GrammarItem | undefined {
    return this.grammarItems.find(g => g.id === id);
  }

  private initializeN5Grammar(): GrammarItem[] {
    return [
      {
        id: 'g-1',
        pattern: 'です/ます',
        explanation: 'Polite present tense. Used for simple statements and descriptions.',
        structure: '[Noun] + です / [Verb] + ます',
        examples: [
          {
            japanese: '私は学生です。',
            furigana: 'わたしはがくせいです。',
            english: 'I am a student.'
          },
          {
            japanese: '毎日勉強します。',
            furigana: 'まいにちべんきょうします。',
            english: 'I study every day.'
          }
        ],
        level: 'N5'
      },
      {
        id: 'g-2',
        pattern: 'は (Topic Marker)',
        explanation: 'Marks the topic of a sentence.',
        structure: '[Topic] + は + [Comment]',
        examples: [
          {
            japanese: '猫は好きです。',
            furigana: 'ねこはすきです。',
            english: 'As for cats, I like them.'
          },
          {
            japanese: '日本は大きい国です。',
            furigana: 'にほんはおおきいくにです。',
            english: 'Japan is a big country.'
          }
        ],
        level: 'N5'
      },
      {
        id: 'g-3',
        pattern: 'を (Object Marker)',
        explanation: 'Marks the direct object of a verb.',
        structure: '[Object] + を + [Verb]',
        examples: [
          {
            japanese: 'コーヒーを飲みます。',
            furigana: 'コーヒーをのみます。',
            english: 'I drink coffee.'
          },
          {
            japanese: '本を読みます。',
            furigana: 'ほんをよみます。',
            english: 'I read a book.'
          }
        ],
        level: 'N5'
      },
      {
        id: 'g-4',
        pattern: 'に (Destination/Location)',
        explanation: 'Marks destination or location. Can also indicate the target of an action.',
        structure: '[Place/Destination] + に + [Action]',
        examples: [
          {
            japanese: '学校に行きます。',
            furigana: 'がっこうにいきます。',
            english: 'I go to school.'
          },
          {
            japanese: '公園に猫がいます。',
            furigana: 'こうえんねこがいます。',
            english: 'There is a cat in the park.'
          }
        ],
        level: 'N5'
      },
      {
        id: 'g-5',
        pattern: 'の (Possessive)',
        explanation: 'Shows possession or relationship between nouns.',
        structure: '[Noun A] + の + [Noun B]',
        examples: [
          {
            japanese: '私の猫',
            furigana: 'わたしのねこ',
            english: 'my cat'
          },
          {
            japanese: '学校の先生',
            furigana: 'がっこうのせんせい',
            english: 'school teacher'
          }
        ],
        level: 'N5'
      },
      {
        id: 'g-6',
        pattern: 'を (Action Target with に)',
        explanation: 'Combined usage with に for direction of action.',
        structure: '[Place] + に [Object] + を [Verb]',
        examples: [
          {
            japanese: '机の上に本を置きます。',
            furigana: 'つくえのうえにほんをおきます。',
            english: 'I place a book on the desk.'
          }
        ],
        level: 'N5'
      },
      {
        id: 'g-7',
        pattern: 'と (Together/With)',
        explanation: 'Shows companionship or listing items.',
        structure: '[Person/Item] + と [Action]',
        examples: [
          {
            japanese: '友達と遊びます。',
            furigana: 'ともだちとあそびます。',
            english: 'I play together with a friend.'
          },
          {
            japanese: 'りんごとみかん',
            furigana: 'りんごとみかん',
            english: 'apples and oranges'
          }
        ],
        level: 'N5'
      },
      {
        id: 'g-8',
        pattern: 'も (Also)',
        explanation: 'Means "also" or "too", indicating inclusion.',
        structure: '[Noun] + も',
        examples: [
          {
            japanese: '私も好きです。',
            furigana: 'わたしもすきです。',
            english: 'I also like it.'
          },
          {
            japanese: '猫も犬も好きです。',
            furigana: 'ねこもいぬもすきです。',
            english: 'I like both cats and dogs.'
          }
        ],
        level: 'N5'
      }
    ];
  }
}
