import { render, screen } from '@testing-library/react-native';
import { Typography } from '../Typography';

describe('Typography', () => {
  it('renders children', () => {
    render(<Typography>Hello</Typography>);
    expect(screen.getByText('Hello')).toBeTruthy();
  });

  it('applies body variant by default', () => {
    render(<Typography testID="txt">Default</Typography>);
    const el = screen.getByTestId('txt');
    expect(el.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ fontSize: 17 })]),
    );
  });

  it('applies h1 variant', () => {
    render(<Typography variant="h1" testID="txt">Heading</Typography>);
    const el = screen.getByTestId('txt');
    expect(el.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ fontSize: 36 })]),
    );
  });

  it('sets accessibilityRole=header for h1', () => {
    render(<Typography variant="h1" testID="txt">H1</Typography>);
    expect(screen.getByTestId('txt').props.accessibilityRole).toBe('header');
  });

  it('sets accessibilityRole=header for h2', () => {
    render(<Typography variant="h2" testID="txt">H2</Typography>);
    expect(screen.getByTestId('txt').props.accessibilityRole).toBe('header');
  });

  it('does not set accessibilityRole for body', () => {
    render(<Typography testID="txt">Body</Typography>);
    expect(screen.getByTestId('txt').props.accessibilityRole).toBeUndefined();
  });

  it('renders Cyrillic text', () => {
    render(<Typography>Память о близких</Typography>);
    expect(screen.getByText('Память о близких')).toBeTruthy();
  });

  it('accepts custom color', () => {
    render(<Typography color="#ff0000" testID="txt">Red</Typography>);
    const el = screen.getByTestId('txt');
    expect(el.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: '#ff0000' })]),
    );
  });

  it('accepts text alignment', () => {
    render(<Typography align="center" testID="txt">Centered</Typography>);
    const el = screen.getByTestId('txt');
    expect(el.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ textAlign: 'center' })]),
    );
  });
});
