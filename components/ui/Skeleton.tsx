import { View, StyleSheet } from 'react-native';
import { colors, spacing, radii } from '@/constants/tokens';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = radii.sm }: SkeletonProps) {
  return (
    <View
      style={[
        styles.base,
        { width: width as number, height, borderRadius },
      ]}
    />
  );
}

export function GraveCardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton width={64} height={64} borderRadius={spacing.sm} />
      <View style={styles.cardInfo}>
        <Skeleton width="60%" height={17} />
        <Skeleton width="40%" height={12} />
        <Skeleton width="50%" height={12} />
      </View>
    </View>
  );
}

export function GravesListSkeleton() {
  return (
    <View style={styles.list}>
      <GraveCardSkeleton />
      <GraveCardSkeleton />
      <GraveCardSkeleton />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.backgroundSecondary,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
  },
  cardInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  list: {
    paddingHorizontal: spacing.md,
  },
});
