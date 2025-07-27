import { describe, expect, test } from 'bun:test';
import { levenshtein } from '@rakeli/utils';

describe('levenshtein', () => {
  test('identical strings have distance 0', () => {
    expect(levenshtein('hello', 'hello')).toBe(0);
    expect(levenshtein('', '')).toBe(0);
    expect(levenshtein('a', 'a')).toBe(0);
  });

  test('empty string distance equals length of other string', () => {
    expect(levenshtein('', 'hello')).toBe(5);
    expect(levenshtein('test', '')).toBe(4);
  });

  test('single character operations', () => {
    // Insertions
    expect(levenshtein('cat', 'cats')).toBe(1);
    // Deletions
    expect(levenshtein('kitten', 'kittn')).toBe(1);
    // Substitutions
    expect(levenshtein('dog', 'cog')).toBe(1);
  });

  test('multiple operations needed', () => {
    expect(levenshtein('kitten', 'sitting')).toBe(3);
    expect(levenshtein('saturday', 'sunday')).toBe(3);
    expect(levenshtein('flaw', 'lawn')).toBe(2);
  });

  test('long strings', () => {
    const str1 = 'supercalifragilisticexpialidocious';
    const str2 = 'supercalifragilisticexpialidocious!';
    expect(levenshtein(str1, str2)).toBe(1);
  });
});
