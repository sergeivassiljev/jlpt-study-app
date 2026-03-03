import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RubyConverterService {
  /**
   * Convert text with ruby notation to HTML ruby tags
   * Input: "朝[あさ]が来ました。"
   * Output: '<ruby data-word-id="w-1">朝<rt>あさ</rt></ruby>が来ました。'
   */
  convertToRuby(text: string): string {
    let result = text;
    let wordId = 1;
    
    // Match pattern: any character(s) followed by [reading]
    const rubyPattern = /([^\[\]]+)\[([^\]]+)\]/g;
    
    result = result.replace(rubyPattern, (match, kanji, reading) => {
      return `<ruby data-word-id="w-${wordId++}">`;
    });

    // Actually, we need a different approach - do it in one pass
    wordId = 1;
    result = '';
    let i = 0;
    
    while (i < text.length) {
      // Look for opening bracket
      const bracketIndex = text.indexOf('[', i);
      
      if (bracketIndex === -1) {
        // No more ruby tags, append rest
        result += text.substring(i);
        break;
      }
      
      // Find matching closing bracket
      const closeBracketIndex = text.indexOf(']', bracketIndex);
      if (closeBracketIndex === -1) {
        // Malformed, append rest
        result += text.substring(i);
        break;
      }
      
      // Extract kanji (text before [)
      let kanjiStart = bracketIndex - 1;
      while (kanjiStart >= i && /[\u4E00-\u9FFF]/.test(text[kanjiStart])) {
        kanjiStart--;
      }
      kanjiStart++;
      
      // Append text before ruby
      result += text.substring(i, kanjiStart);
      
      // Extract kanji and reading
      const kanji = text.substring(kanjiStart, bracketIndex);
      const reading = text.substring(bracketIndex + 1, closeBracketIndex);
      
      // Add ruby tag
      result += `<ruby data-word-id="w-${wordId++}">${kanji}<rt>${reading}</rt></ruby>`;
      
      i = closeBracketIndex + 1;
    }
    
    return result;
  }

  /**
   * Convert one paragraph/line to HTML ruby with <p> tag
   */
  convertParagraphToRuby(text: string): string {
    const ruby = this.convertToRuby(text).trim();
    if (!ruby) return '';
    return `<p>${ruby}</p>`;
  }

  /**
   * Convert multiple lines to array of HTML paragraphs
   */
  convertTextToChapterContent(text: string): string[] {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => this.convertParagraphToRuby(line));
  }
}
