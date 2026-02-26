import { View, Modal, Pressable, Image, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGrave } from '@/hooks';
import { getGravePhotoUrl } from '@/lib/api/photos';
import { formatGraveDateRange } from '@/lib/format-dates';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { colors, spacing, radii } from '@/constants/tokens';

const SERIF_FONT = Platform.select({ ios: 'Georgia', default: 'serif' });
const THUMB_SIZE = 56;

interface GraveBottomSheetProps {
  slug: string;
  onClose: () => void;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function GraveBottomSheet({ slug, onClose }: GraveBottomSheetProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: grave } = useGrave(slug);

  function handleViewMemorial() {
    onClose();
    router.push(`/memorial/${slug}`);
  }

  if (!grave) return null;

  const dateStr = formatGraveDateRange(
    grave.birth_year,
    grave.birth_month,
    grave.birth_day,
    grave.death_year,
    grave.death_month,
    grave.death_day,
  );
  const cemeteryName = grave.cemetery?.name ?? null;
  const subtitle = [dateStr, cemeteryName].filter(Boolean).join(' · ');

  return (
    <Modal visible transparent animationType="slide" statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}
          onPress={() => {}}
        >
          <View style={styles.handle} />

          <View style={styles.row}>
            {grave.cover_photo_path ? (
              <Image
                source={{ uri: getGravePhotoUrl(grave.cover_photo_path) }}
                style={styles.thumb}
              />
            ) : (
              <View style={[styles.thumb, styles.initialsCircle]}>
                <Typography variant="body" color={colors.brand}>
                  {getInitials(grave.person_name)}
                </Typography>
              </View>
            )}

            <View style={styles.info}>
              <Typography
                variant="body"
                numberOfLines={2}
                style={{ fontFamily: SERIF_FONT }}
              >
                {grave.person_name}
              </Typography>
              {subtitle ? (
                <Typography
                  variant="caption"
                  color={colors.textSecondary}
                  numberOfLines={1}
                >
                  {subtitle}
                </Typography>
              ) : null}
            </View>
          </View>

          <Button
            variant="brand"
            title={t('map.viewMemorial')}
            onPress={handleViewMemorial}
            testID="view-memorial-button"
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.backgroundPrimary,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
  },
  initialsCircle: {
    backgroundColor: colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
});
