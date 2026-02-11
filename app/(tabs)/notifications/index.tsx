import { useMemo, useCallback } from 'react';
import { View, FlatList, Pressable, RefreshControl, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSession, useMyGraves, useProfile } from '@/hooks';
import { getUpcomingDates, type MemorialDate } from '@/lib/memorial-dates';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors, spacing } from '@/constants/tokens';

function getDaysAway(date: Date, now: Date): number {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatCountdown(days: number, t: (key: string, params?: Record<string, unknown>) => string): string {
  if (days === 0) return t('notifications.today');
  if (days === 1) return t('notifications.tomorrow');
  return t('notifications.daysAway', { count: days });
}

function dotColor(type: MemorialDate['type']): string {
  switch (type) {
    case 'orthodox':
      return colors.brand;
    case 'us_holiday':
      return colors.accent;
    case 'anniversary':
      return colors.destructive;
  }
}

function iconForType(type: MemorialDate['type']): string {
  switch (type) {
    case 'orthodox':
      return 'calendar';
    case 'us_holiday':
      return 'flag';
    case 'anniversary':
      return 'heart';
  }
}

export default function NotificationsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const session = useSession();
  const { data: graves, refetch: refetchGraves } = useMyGraves(session?.user?.id);
  const { data: profile, refetch: refetchProfile } = useProfile(session?.user?.id);

  const now = useMemo(() => new Date(), []);

  const dates = useMemo(() => {
    const pushOrthodox = profile?.push_orthodox ?? true;
    const pushUSHolidays = profile?.push_us_holidays ?? true;
    return getUpcomingDates(graves ?? [], pushOrthodox, pushUSHolidays, now);
  }, [graves, profile, now]);

  const handleRefresh = useCallback(() => {
    refetchGraves();
    refetchProfile();
  }, [refetchGraves, refetchProfile]);

  const handlePress = useCallback(
    (item: MemorialDate) => {
      if (item.graveSlug) {
        router.push(`/memorial/${item.graveSlug}`);
      } else {
        router.push('/(tabs)/map');
      }
    },
    [router],
  );

  const formatDate = useCallback(
    (date: Date) => {
      return date.toLocaleDateString(i18n.language === 'ru' ? 'ru-RU' : 'en-US', {
        month: 'long',
        day: 'numeric',
      });
    },
    [i18n.language],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Typography variant="h2">{t('tabs.notifications')}</Typography>
      </View>

      <FlatList
        data={dates}
        keyExtractor={(item) => item.id}
        contentContainerStyle={dates.length === 0 ? styles.center : styles.list}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="bell"
            title={t('notifications.empty')}
            subtitle={t('notifications.emptyHint')}
            testID="notifications-empty"
          />
        }
        renderItem={({ item }) => {
          const days = getDaysAway(item.date, now);
          const countdown = formatCountdown(days, t);
          return (
            <Pressable
              onPress={() => handlePress(item)}
              accessibilityRole="button"
              accessibilityLabel={`${t(item.nameKey, item.nameParams)} ${countdown}`}
            >
              <Card style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.iconContainer}>
                    <FontAwesome
                      name={iconForType(item.type) as never}
                      size={18}
                      color={dotColor(item.type)}
                    />
                  </View>
                  <View style={styles.info}>
                    <Typography variant="body" numberOfLines={1}>
                      {t(item.nameKey, item.nameParams)}
                    </Typography>
                    <Typography variant="caption" color={colors.textSecondary}>
                      {formatDate(item.date)} · {countdown}
                    </Typography>
                  </View>
                  <FontAwesome name="chevron-right" size={14} color={colors.textTertiary} />
                </View>
              </Card>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
});
