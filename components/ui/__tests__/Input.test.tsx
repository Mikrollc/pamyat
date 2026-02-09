import { render, screen, fireEvent } from '@testing-library/react-native';
import { Input } from '../Input';

describe('Input', () => {
  const onChangeText = jest.fn();

  beforeEach(() => onChangeText.mockClear());

  it('renders label text', () => {
    render(<Input label="Email" value="" onChangeText={onChangeText} />);
    expect(screen.getByText('Email')).toBeTruthy();
  });

  it('calls onChangeText when typing', () => {
    render(<Input label="Name" value="" onChangeText={onChangeText} testID="input" />);
    fireEvent.changeText(screen.getByTestId('input'), 'hello');
    expect(onChangeText).toHaveBeenCalledWith('hello');
  });

  it('shows error message when error prop is set', () => {
    render(
      <Input label="Email" value="" onChangeText={onChangeText} error="Required" testID="input" />,
    );
    expect(screen.getByText('Required')).toBeTruthy();
    expect(screen.getByTestId('input-error')).toBeTruthy();
  });

  it('does not show error when error prop is not set', () => {
    render(<Input label="Email" value="" onChangeText={onChangeText} testID="input" />);
    expect(screen.queryByTestId('input-error')).toBeNull();
  });

  it('has autoCorrect disabled by default', () => {
    render(<Input label="Name" value="" onChangeText={onChangeText} testID="input" />);
    expect(screen.getByTestId('input').props.autoCorrect).toBe(false);
  });

  it('renders Cyrillic label and placeholder', () => {
    render(
      <Input
        label="Имя"
        value=""
        onChangeText={onChangeText}
        placeholder="Введите имя"
      />,
    );
    expect(screen.getByText('Имя')).toBeTruthy();
    expect(screen.getByPlaceholderText('Введите имя')).toBeTruthy();
  });

  it('passes secureTextEntry to TextInput', () => {
    render(
      <Input label="Password" value="" onChangeText={onChangeText} secureTextEntry testID="input" />,
    );
    expect(screen.getByTestId('input').props.secureTextEntry).toBe(true);
  });
});
