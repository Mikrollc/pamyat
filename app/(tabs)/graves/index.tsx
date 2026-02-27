import { useMemo } from 'react';
import {
  View,
  FlatList,
  Image,
  Text,
  Pressable,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSession, useMyGraves } from '@/hooks';
import { getGravePhotoUrl } from '@/lib/api/photos';
import { formatGraveDateRange } from '@/lib/format-dates';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { GravesListSkeleton } from '@/components/ui/Skeleton';
import { PendingInvitations } from '@/components/invite/PendingInvitations';
import { colors, spacing, radii, fonts } from '@/constants/tokens';

const THUMB_SIZE = 72;

export default function GravesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const session = useSession();
  const { data, isLoading, error, refetch } = useMyGraves(session?.user?.id);

  const sorted = useMemo(
    () =>
      data
        ? [...data].sort(
            (a, b) =>
              new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
          )
        : [],
    [data],
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('tabs.myGraves')}</Text>
          <Pressable
            onPress={() => router.push('/add-grave')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('map.addGrave')}
            testID="add-grave-header-button"
          >
            <FontAwesome name="plus" size={22} color={colors.brand} />
          </Pressable>
        </View>
        <GravesListSkeleton />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ErrorState onRetry={refetch} testID="graves-error" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('tabs.myGraves')}</Text>
        <Pressable
          onPress={() => router.push('/add-grave')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('map.addGrave')}
          testID="add-grave-header-button"
        >
          <FontAwesome name="plus" size={22} color={colors.brand} />
        </Pressable>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={sorted.length === 0 ? styles.center : styles.list}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refetch} />
        }
        ListHeaderComponent={<PendingInvitations />}
        ListEmptyComponent={
          <EmptyState
            icon="book"
            title={t('graves.empty')}
            subtitle={t('notifications.emptyHint')}
            testID="graves-empty"
          >
            <Button
              variant="brand"
              title={t('graves.addFirst')}
              icon="plus"
              onPress={() => router.push('/add-grave')}
              testID="add-first-grave-button"
            />
          </EmptyState>
        }
        renderItem={({ item }) => {
          const dateStr = formatGraveDateRange(
            item.birth_year,
            item.birth_month,
            item.birth_day,
            item.death_year,
            item.death_month,
            item.death_day,
          );
          return (
            <Pressable
              onPress={() => router.push(`/memorial/${item.slug}`)}
              accessibilityRole="button"
              accessibilityLabel={item.person_name}
            >
              <Card style={styles.card}>
                <View style={styles.row}>
                  {item.cover_photo_path ? (
                    <Image
                      source={{ uri: getGravePhotoUrl(item.cover_photo_path) }}
                      style={styles.thumb}
                    />
                  ) : (
                    <View style={[styles.thumb, styles.placeholder]}>
                      <FontAwesome
                        name="camera"
                        size={24}
                        color="rgba(255,255,255,0.4)"
                      />
                    </View>
                  )}
                  <View style={styles.info}>
                    <Text style={styles.personName} numberOfLines={2}>
                      {item.person_name}
                    </Text>
                    {dateStr ? (
                      <Text style={styles.dates}>{dateStr}</Text>
                    ) : null}
                    {item.cemetery?.name ? (
                      <View style={styles.cemeteryRow}>
                        <FontAwesome name="map-marker" size={11} color={colors.textTertiary} />
                        <Text style={styles.cemetery} numberOfLines={1}>
                          {item.cemetery.name}
                        </Text>
                      </View>
                    ) : null}
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontFamily: fonts.serif,
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 29,
    letterSpacing: -0.3,
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
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radii.md,
  },
  placeholder: {
    backgroundColor: colors.placeholderDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 3,
  },
  personName: {
    fontFamily: fonts.serif,
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 22,
  },
  dates: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.primary,
    letterSpacing: 0.3,
  },
  cemeteryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cemetery: {
    fontSize: 13,
    color: colors.textTertiary,
  },
});
