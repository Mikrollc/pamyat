import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors, radii } from '@/constants/tokens';

interface ProgressBarProps {
  step: number;
  totalSteps?: number;
  testID?: string;
}

export function ProgressBar({ step, totalSteps = 4, testID }: ProgressBarProps) {
  const progress = step / totalSteps;

  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(`${progress * 100}%`, { duration: 300 }),
  }));

  return (
    <View style={styles.track} testID={testID}>
      <Animated.View style={[styles.fill, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 3,
    backgroundColor: colors.border,
  },
  fill: {
    height: '100%',
    backgroundColor: colors.brand,
  },
});
