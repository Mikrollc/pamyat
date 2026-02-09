import { transliterate } from '../transliterate';

describe('transliterate', () => {
  it('converts Cyrillic name to Latin', () => {
    expect(transliterate('Иван Петров')).toBe('ivan petrov');
  });

  it('handles mixed Cyrillic and Latin', () => {
    expect(transliterate('John Иванов')).toBe('john ivanov');
  });

  it('handles special Cyrillic characters', () => {
    expect(transliterate('Щербаков')).toBe('shcherbakov');
  });

  it('handles ё and й', () => {
    expect(transliterate('Ёлкин Андрей')).toBe('yolkin andrey');
  });

  it('passes through numbers and hyphens', () => {
    expect(transliterate('Иван-123')).toBe('ivan-123');
  });

  it('handles empty string', () => {
    expect(transliterate('')).toBe('');
  });

  it('lowercases Latin input', () => {
    expect(transliterate('JOHN DOE')).toBe('john doe');
  });

  it('handles soft and hard signs', () => {
    expect(transliterate('Подъезд')).toBe('podezd');
  });
});
