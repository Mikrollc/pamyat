import { render, screen, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  const onPress = jest.fn();

  beforeEach(() => onPress.mockClear());

  it('renders title text', () => {
    render(<Button title="Sign In" onPress={onPress} />);
    expect(screen.getByText('Sign In')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    render(<Button title="Tap" onPress={onPress} testID="btn" />);
    fireEvent.press(screen.getByTestId('btn'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    render(<Button title="Tap" onPress={onPress} disabled testID="btn" />);
    fireEvent.press(screen.getByTestId('btn'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows ActivityIndicator when loading', () => {
    render(<Button title="Load" onPress={onPress} loading testID="btn" />);
    expect(screen.getByTestId('btn-loader')).toBeTruthy();
    expect(screen.queryByText('Load')).toBeNull();
  });

  it('does not call onPress when loading', () => {
    render(<Button title="Load" onPress={onPress} loading testID="btn" />);
    fireEvent.press(screen.getByTestId('btn'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('has accessibilityRole=button', () => {
    render(<Button title="Btn" onPress={onPress} testID="btn" />);
    expect(screen.getByTestId('btn').props.accessibilityRole).toBe('button');
  });

  it('renders Cyrillic title', () => {
    render(<Button title="Войти" onPress={onPress} />);
    expect(screen.getByText('Войти')).toBeTruthy();
  });

  it('renders all variants without crashing', () => {
    const variants = ['primary', 'secondary', 'accent', 'destructive'] as const;
    for (const variant of variants) {
      const { unmount } = render(
        <Button title={variant} variant={variant} onPress={onPress} />,
      );
      expect(screen.getByText(variant)).toBeTruthy();
      unmount();
    }
  });
});
