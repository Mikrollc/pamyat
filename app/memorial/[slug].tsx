import {
  View,
  ScrollView,
  Image,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  Share,
  Platform,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useGrave, useSession, useGraveMembership, useWaitlistStatus, useJoinWaitlist } from '@/hooks';
import { getGravePhotoUrl } from '@/lib/api/photos';
import { formatGraveDate } from '@/lib/format-dates';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { colors, spacing, radii } from '@/constants/tokens';

const BOTTOM_BAR_HEIGHT = 56;
const HERO_HEIGHT = 380;
const NAV_BTN_SIZE = 36;
const SERIF_FONT = Platform.select({ ios: 'Georgia', default: 'serif' });

export default function MemorialPageScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const session = useSession();

  const { data: grave, isLoading, error, refetch } = useGrave(slug);
  const { data: membership } = useGraveMembership(grave?.id, session?.user?.id);
  const { data: waitlistEntry } = useWaitlistStatus(grave?.id ?? '', session?.user?.id);
  const joinWaitlist = useJoinWaitlist();

  const canEdit = membership?.role === 'owner' || membership?.role === 'editor';
  const isOnWaitlist = !!waitlistEntry;

  async function handleShare() {
    if (!grave) return;
    const url = `https://raduna.app/memorial/${grave.slug}`;
    try {
      await Share.share(
        Platform.OS === 'ios'
          ? { message: grave.person_name, url }
          : { message: `${grave.person_name}\n${url}` },
      );
    } catch {
      // user cancelled or share failed
    }
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
        <ErrorState onRetry={refetch} testID="memorial-error" />
      </View>
    );
  }

  if (!grave) {
    return (
      <View style={styles.centered}>
        <EmptyState icon="book" title={t('memorial.notFound')} testID="memorial-not-found" />
      </View>
    );
  }

  const birthDate = formatGraveDate(grave.birth_year, grave.birth_month, grave.birth_day);
  const deathDate = formatGraveDate(grave.death_year, grave.death_month, grave.death_day);

  const cemeterySubtitle = [grave.cemetery?.city, grave.cemetery?.state]
    .filter(Boolean)
    .join(', ');

  const relationshipLabel = membership?.relationship
    ? t(`addGrave.relationships.${membership.relationship}`, membership.relationship)
    : null;

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          !session
            ? { paddingBottom: insets.bottom + BOTTOM_BAR_HEIGHT + spacing.md }
            : { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero photo with overlaid nav */}
        <View style={styles.heroContainer}>
          {grave.cover_photo_path ? (
            <Image
              source={{ uri: getGravePhotoUrl(grave.cover_photo_path) }}
              style={styles.heroPhoto}
              resizeMode="cover"
              accessibilityLabel={grave.person_name}
            />
          ) : (
            <View style={styles.heroPlaceholder}>
              <FontAwesome name="camera" size={48} color={colors.textSecondary} />
            </View>
          )}

          {/* Dark gradient at top for nav readability */}
          <View style={styles.navOverlay} pointerEvents="none">
            <View style={[styles.gradientStrip, { backgroundColor: 'rgba(0,0,0,0.35)' }]} />
            <View style={[styles.gradientStrip, { backgroundColor: 'rgba(0,0,0,0.25)' }]} />
            <View style={[styles.gradientStrip, { backgroundColor: 'rgba(0,0,0,0.15)' }]} />
            <View style={[styles.gradientStrip, { backgroundColor: 'rgba(0,0,0,0.08)' }]} />
            <View style={[styles.gradientStrip, { backgroundColor: 'rgba(0,0,0,0.02)' }]} />
            <View style={[styles.gradientStrip, { backgroundColor: 'rgba(0,0,0,0)' }]} />
          </View>

          {/* Floating nav buttons */}
          <View style={[styles.floatingNav, { paddingTop: insets.top + spacing.sm }]}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={t('common.back')}
              style={styles.navBtn}
            >
              <FontAwesome name="arrow-left" size={16} color={colors.white} />
            </Pressable>
            <View style={styles.navRight}>
              <Pressable
                onPress={handleShare}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={t('memorial.share')}
                style={styles.navBtn}
              >
                <FontAwesome name="share" size={14} color={colors.white} />
              </Pressable>
              {canEdit && (
                <Pressable
                  onPress={() => router.push(`/memorial/edit/${slug}`)}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel={t('graves.edit')}
                  style={styles.navBtn}
                >
                  <FontAwesome name="pencil" size={14} color={colors.white} />
                </Pressable>
              )}
            </View>
          </View>

          {/* Photo counter pill */}
          {grave.cover_photo_path ? (
            <View style={styles.photoCounter}>
              <Text style={styles.photoCounterText}>1 / 1</Text>
            </View>
          ) : null}

          {/* Bottom gradient fade into content */}
          <View style={styles.bottomGradient} pointerEvents="none">
            <View style={[styles.gradientStrip, { backgroundColor: 'rgba(255,255,255,0)' }]} />
            <View style={[styles.gradientStrip, { backgroundColor: 'rgba(255,255,255,0.15)' }]} />
            <View style={[styles.gradientStrip, { backgroundColor: 'rgba(255,255,255,0.35)' }]} />
            <View style={[styles.gradientStrip, { backgroundColor: 'rgba(255,255,255,0.55)' }]} />
            <View style={[styles.gradientStrip, { backgroundColor: 'rgba(255,255,255,0.8)' }]} />
            <View style={[styles.gradientStrip, { backgroundColor: colors.backgroundPrimary }]} />
          </View>
        </View>

        {/* Content area — overlaps photo slightly */}
        <View style={styles.content}>
          {/* Name + Dates */}
          <View style={styles.headerSection}>
            <Text style={styles.personName}>{grave.person_name}</Text>
            <Text style={styles.dates}>
              {birthDate}
              <Text style={styles.datesSeparator}> — </Text>
              {deathDate}
            </Text>
            {relationshipLabel ? (
              <View style={styles.relationshipBadge}>
                <FontAwesome name="heart" size={12} color={colors.textTertiary} />
                <Text style={styles.relationshipText}>{relationshipLabel}</Text>
              </View>
            ) : null}
          </View>

          {/* Cemetery info */}
          {grave.cemetery?.name ? (
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <FontAwesome name="map-marker" size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.infoLabel}>{t('memorial.cemetery')}</Text>
                  <Text style={styles.infoValue}>{grave.cemetery.name}</Text>
                  {cemeterySubtitle ? (
                    <Text style={styles.infoValueSub}>{cemeterySubtitle}</Text>
                  ) : null}
                </View>
              </View>
            </View>
          ) : null}

          {/* Plot info */}
          {grave.plot_info ? (
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <FontAwesome name="th" size={16} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.infoLabel}>{t('memorial.plot')}</Text>
                  <Text style={styles.infoValue}>{grave.plot_info}</Text>
                </View>
              </View>
            </View>
          ) : null}

          {/* Inscription / Notes */}
          {grave.inscription ? (
            <View style={styles.epitaphSection}>
              <Text style={styles.epitaphLabel}>{t('memorial.notes')}</Text>
              <Text style={styles.epitaphText}>{grave.inscription}</Text>
            </View>
          ) : null}

          {/* Actions */}
          <View style={styles.actionsSection}>
            {isOnWaitlist ? (
              <Button
                variant="secondary"
                disabled
                title={t('memorial.onWaitlist')}
                icon="clock-o"
                onPress={() => {}}
              />
            ) : (
              <Button
                variant="brand"
                title={t('memorial.notifyMe')}
                icon="heart"
                onPress={handleWaitlistPress}
                loading={joinWaitlist.isPending}
                style={styles.primaryAction}
              />
            )}
            <View style={styles.actionRow}>
              <Pressable
                onPress={() => {}}
                style={({ pressed }) => [
                  styles.secondaryAction,
                  pressed && styles.secondaryActionPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={t('memorial.addPhoto')}
              >
                <FontAwesome name="camera" size={14} color={colors.textSecondary} />
                <Text style={styles.secondaryActionText}>{t('memorial.addPhoto')}</Text>
              </Pressable>
              <Pressable
                onPress={() => {}}
                style={({ pressed }) => [
                  styles.secondaryAction,
                  pressed && styles.secondaryActionPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={t('memorial.more')}
              >
                <FontAwesome name="ellipsis-v" size={14} color={colors.textSecondary} />
                <Text style={styles.secondaryActionText}>{t('memorial.more')}</Text>
              </Pressable>
            </View>
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {},

  /* Hero */
  heroContainer: {
    width: '100%',
    height: HERO_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
  },
  heroPhoto: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Nav overlay — dark gradient at top */
  navOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  floatingNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    zIndex: 10,
  },
  navBtn: {
    width: NAV_BTN_SIZE,
    height: NAV_BTN_SIZE,
    borderRadius: NAV_BTN_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navRight: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  /* Photo counter pill */
  photoCounter: {
    position: 'absolute',
    bottom: 70,
    right: spacing.md,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radii.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 5,
  },
  photoCounterText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },

  /* Bottom gradient fade */
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  gradientStrip: {
    flex: 1,
  },

  /* Content */
  content: {
    paddingHorizontal: spacing.lg,
    marginTop: -20,
  },

  /* Header */
  headerSection: {
    marginBottom: spacing.xl,
  },
  personName: {
    fontFamily: SERIF_FONT,
    fontSize: 30,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 34,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  dates: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  datesSeparator: {
    color: '#bbb',
  },

  /* Relationship badge */
  relationshipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: radii.sm,
    backgroundColor: '#f0eeeb',
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  relationshipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textTertiary,
  },

  /* Info sections */
  infoSection: {
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#f0eeeb',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f5f3f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  infoValueSub: {
    fontSize: 13,
    color: '#999',
    marginTop: 1,
  },

  /* Epitaph / Notes */
  epitaphSection: {
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#f0eeeb',
  },
  epitaphLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  epitaphText: {
    fontFamily: SERIF_FONT,
    fontSize: 20,
    fontWeight: '500',
    fontStyle: 'italic',
    color: '#444',
    lineHeight: 30,
  },

  /* Actions */
  actionsSection: {
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#f0eeeb',
    gap: 10,
  },
  primaryAction: {
    borderRadius: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#f5f3f0',
  },
  secondaryActionPressed: {
    backgroundColor: '#eceae6',
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
  },

  /* Bottom bar */
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
