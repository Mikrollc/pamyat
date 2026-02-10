import { View, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { colors, spacing, radii } from '@/constants/tokens';

interface CemeteryFloatingCardProps {
  name: string;
  nameRu: string | null;
  city: string | null;
  state: string | null;
  onAddMemorial: () => void;
  onClose: () => void;
}

export function CemeteryFloatingCard({
  name,
  nameRu,
  city,
  state,
  onAddMemorial,
  onClose,
}: CemeteryFloatingCardProps) {
  const { i18n, t } = useTranslation();
  const isRu = i18n.language === 'ru';
  const primaryName = isRu && nameRu ? nameRu : name;
  const secondaryName = isRu ? name : nameRu;
  const subtitle = [city, state].filter(Boolean).join(', ');

  return (
    <View style={styles.card}>
      <Pressable
        onPress={onClose}
        hitSlop={8}
        style={styles.close}
        accessibilityRole="button"
        accessibilityLabel={t('common.cancel')}
      >
        <View style={styles.closeCircle}>
          <FontAwesome name="times" size={11} color={colors.textSecondary} />
        </View>
      </Pressable>

      <View style={styles.primaryName}>
        <Typography variant="body" numberOfLines={1}>
          {primaryName}
        </Typography>
      </View>

      {secondaryName && (
        <Typography
          variant="caption"
          color={colors.textSecondary}
          numberOfLines={1}
        >
          {secondaryName}
        </Typography>
      )}

      {subtitle ? (
        <View style={styles.subtitle}>
          <Typography
            variant="caption"
            color={colors.textTertiary}
            numberOfLines={1}
          >
            {subtitle}
          </Typography>
        </View>
      ) : null}

      <View style={styles.cta}>
        <Button
          variant="brand"
          title={t('map.addMemorialHere')}
          icon="plus"
          onPress={onAddMemorial}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    bottom: 100,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: spacing.md,
    zIndex: 5,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  close: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 1,
  },
  closeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryName: {
    paddingRight: spacing.lg,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  cta: {
    marginTop: spacing.md,
  },
});
