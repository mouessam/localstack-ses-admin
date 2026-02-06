import { describe, expect, it } from 'vitest';
import { cn } from '../../src/lib/utils';

describe('cn', () => {
  it('merges class names correctly', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
  });

  it('handles conditional classes', () => {
    const includeConditional = true;
    const includeHidden = false;
    expect(
      cn('base-class', includeConditional && 'conditional-class', includeHidden && 'hidden-class'),
    ).toBe('base-class conditional-class');
  });

  it('handles tailwind conflicts - later class wins', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('handles empty inputs', () => {
    expect(cn()).toBe('');
  });

  it('handles arrays of classes', () => {
    expect(cn(['class1', 'class2'])).toBe('class1 class2');
  });

  it('handles objects with boolean values', () => {
    expect(cn({ class1: true, class2: false, class3: true })).toBe('class1 class3');
  });

  it('handles mixed inputs', () => {
    expect(cn('base', { active: true, disabled: false }, ['extra'])).toBe('base active extra');
  });

  it('handles duplicate classes (clsx keeps them, tailwind-merge handles conflicts)', () => {
    // clsx doesn't dedupe non-conflicting classes
    // tailwind-merge only merges Tailwind conflicts
    const result = cn('class1', 'class2', 'class1');
    expect(result).toBeTruthy();
    expect(result).toContain('class1');
    expect(result).toContain('class2');
  });
});
