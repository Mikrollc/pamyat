import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Card } from '../Card';

describe('Card', () => {
  it('renders children', () => {
    render(
      <Card>
        <Text>Content</Text>
      </Card>,
    );
    expect(screen.getByText('Content')).toBeTruthy();
  });

  it('accepts testID', () => {
    render(
      <Card testID="card">
        <Text>Inside</Text>
      </Card>,
    );
    expect(screen.getByTestId('card')).toBeTruthy();
  });

  it('renders Cyrillic children', () => {
    render(
      <Card>
        <Text>Карточка</Text>
      </Card>,
    );
    expect(screen.getByText('Карточка')).toBeTruthy();
  });

  it('accepts custom style', () => {
    render(
      <Card testID="card" style={{ marginTop: 10 }}>
        <Text>Styled</Text>
      </Card>,
    );
    const el = screen.getByTestId('card');
    expect(el.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ marginTop: 10 })]),
    );
  });
});
