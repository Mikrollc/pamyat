import { Text, type TextProps } from 'react-native';
import { typography, colors } from '@/constants/tokens';

type Variant = keyof typeof typography;

interface TypographyProps extends Omit<TextProps, 'style'> {
  variant?: Variant;
  color?: string;
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}

export function Typography({
  variant = 'body',
  color = colors.textPrimary,
  align,
  children,
  ...rest
}: TypographyProps) {
  const isHeader = variant === 'h1' || variant === 'h2';

  return (
    <Text
      accessibilityRole={isHeader ? 'header' : undefined}
      style={[typography[variant], { color }, align ? { textAlign: align } : undefined]}
      {...rest}
    >
      {children}
    </Text>
  );
}
