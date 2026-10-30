import { describe, expect, it } from 'vitest'
import { clipKey, sentences, spoken } from './key'
import { spokenLines } from './lines'

describe('voice clip keys', () => {
  it('reads no emoji and tidies spacing', () => {
    expect(spoken('🦊⬆️ 小狐狸變強了！  升到 Lv.3')).toBe('小狐狸變強了！ 升到 Lv.3')
  })
  it('splits Chinese and English lines into sentences, keeping end marks', () => {
    expect(sentences('這一關你第一次就答對 5 題。多練習，大腦會越來越強！')).toEqual(['這一關你第一次就答對 5 題。', '多練習，大腦會越來越強！'])
    expect(sentences('You got 5 right. Practice makes your brain stronger!')).toEqual(['You got 5 right.', 'Practice makes your brain stronger!'])
    // A decimal point or a lowercase word after a full stop is not a new sentence.
    expect(sentences('Each box weighs 2.5 kg.')).toEqual(['Each box weighs 2.5 kg.'])
  })
  it('keys a sentence by language and words', () => expect(clipKey('zh', '好')).toBe('zh:好'))
  it('collects the story, lesson and mystery lines in both languages', () => {
    for (const lang of ['zh', 'en'] as const) {
      const lines = spokenLines(lang)
      expect(lines.length).toBeGreaterThan(500)
      expect(new Set(lines).size).toBe(lines.length)
    }
    expect(spokenLines('zh')).toContain('今天是你的生日派對，來了 5 個好朋友！')
  })
})
