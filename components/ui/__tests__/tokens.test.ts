import { colors, spacing, radii, typography, buttonHeight } from '@/constants/tokens';

describe('Design Tokens', () => {
  it('matches token snapshot', () => {
    expect({ colors, spacing, radii, typography, buttonHeight }).toMatchSnapshot();
  });

  it('has correct primary color', () => {
    expect(colors.primary).toBe('#1a73e8');
  });

  it('has Cyrillic-safe lineHeight (~1.2x fontSize)', () => {
    for (const [, style] of Object.entries(typography)) {
      expect(style.lineHeight).toBeGreaterThanOrEqual(style.fontSize * 1.15);
    }
  });
});
