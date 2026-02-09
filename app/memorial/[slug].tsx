import {
  View,
  ScrollView,
  Image,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  Share,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useGrave, useSession, useGraveMembership, useWaitlistStatus, useJoinWaitlist } from '@/hooks';
import { getGravePhotoUrl } from '@/lib/api/photos';
import { formatGraveDateRange } from '@/lib/format-dates';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing, typography as typographyTokens } from '@/constants/tokens';

const BOTTOM_BAR_HEIGHT = 56;

export default function MemorialPageScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const session = useSession();

  const { data: grave, isLoading, error } = useGrave(slug);
  const { data: membership } = useGraveMembership(grave?.id, session?.user?.id);
  const { data: waitlistEntry } = useWaitlistStatus(grave?.id ?? '', session?.user?.id);
  const joinWaitlist = useJoinWaitlist();

  const canEdit = membership?.role === 'owner' || membership?.role === 'editor';
  const isOnWaitlist = !!waitlistEntry;

  function handleShare() {
    Share.share({
      message: `${grave?.person_name} — https://pamyat.app/memorial/${slug}`,
    });
  }

  function handleWaitlistPress() {
    if (!session) {
      router.push('/(auth)');
      return;
    }

    Alert.alert(
      t('memorial.wantCare'),
      t('memorial.confirmCare'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('memorial.confirmCareYes'),
          onPress: () => {
            if (grave) {
              joinWaitlist.mutate({ grave_id: grave.id, user_id: session.user.id });
            }
          },
        },
      ],
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Typography variant="body" color={colors.textSecondary}>
          {error.message ?? t('common.error')}
        </Typography>
      </View>
    );
  }

  if (!grave) {
    return (
      <View style={styles.centered}>
        <Typography variant="body" color={colors.textSecondary}>
          {t('memorial.notFound')}
        </Typography>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          style={styles.headerButton}
        >
          <FontAwesome name="arrow-left" size={20} color={colors.textPrimary} />
        </Pressable>

        <View style={styles.headerRight}>
          <Pressable
            onPress={handleShare}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={t('memorial.share')}
            style={styles.headerButton}
          >
            <FontAwesome name="share" size={20} color={colors.textPrimary} />
          </Pressable>

          {canEdit && (
            <Pressable
              onPress={() => {
                // Placeholder: edit route not yet implemented
              }}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={t('graves.edit')}
              style={[styles.headerButton, { marginLeft: spacing.md }]}
            >
              <Typography variant="body" color={colors.primary}>
                {t('graves.edit')}
              </Typography>
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          !session ? { paddingBottom: insets.bottom + BOTTOM_BAR_HEIGHT + spacing.md } : { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero photo */}
        {grave.cover_photo_path ? (
          <Image
            source={{ uri: getGravePhotoUrl(grave.cover_photo_path) }}
            style={styles.heroPhoto}
            resizeMode="cover"
            accessibilityLabel={grave.person_name}
          />
        ) : (
          <View style={styles.heroPlaceholder}>
            <FontAwesome name="camera" size={48} color={colors.textTertiary} />
          </View>
        )}

        {/* Info section */}
        <View style={styles.infoSection}>
          <Typography variant="h2">{grave.person_name}</Typography>

          <Typography variant="body" color={colors.textSecondary}>
            {formatGraveDateRange(
              grave.birth_year,
              grave.birth_month,
              grave.birth_day,
              grave.death_year,
              grave.death_month,
              grave.death_day,
            )}
          </Typography>

          {grave.cemetery?.name ? (
            <Typography variant="bodySmall" color={colors.textTertiary}>
              {grave.cemetery.name}
            </Typography>
          ) : null}

          {grave.inscription ? (
            <Text style={styles.inscription}>{grave.inscription}</Text>
          ) : null}
        </View>

        {/* Waitlist CTA */}
        <View style={styles.ctaSection}>
          {isOnWaitlist ? (
            <Button
              variant="secondary"
              disabled
              title={t('memorial.onWaitlist')}
              onPress={() => {}}
            />
          ) : (
            <Button
              variant="accent"
              title={t('memorial.wantCare')}
              onPress={handleWaitlistPress}
              loading={joinWaitlist.isPending}
            />
          )}
        </View>
      </ScrollView>

      {/* Anonymous bottom bar */}
      {!session && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
          <Pressable
            onPress={() => router.push('/(auth)')}
            style={styles.bottomBarInner}
            accessibilityRole="button"
          >
            <Typography variant="body" color={colors.textPrimary}>
              {t('memorial.signUpToManage')}
            </Typography>
            <FontAwesome name="chevron-right" size={16} color={colors.textTertiary} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.backgroundPrimary,
    zIndex: 1,
  },
  headerButton: {
    padding: spacing.xs,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroPhoto: {
    width: '100%',
    aspectRatio: 3 / 2,
  },
  heroPlaceholder: {
    width: '100%',
    aspectRatio: 3 / 2,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    gap: spacing.xs,
  },
  inscription: {
    fontSize: typographyTokens.body.fontSize,
    fontWeight: typographyTokens.body.fontWeight,
    lineHeight: typographyTokens.body.lineHeight,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  ctaSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  bottomBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
