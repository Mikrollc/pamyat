import { useMemo } from 'react';
import {
  View,
  FlatList,
  Image,
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
import { Typography } from '@/components/ui/Typography';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { GravesListSkeleton } from '@/components/ui/Skeleton';
import { colors, spacing } from '@/constants/tokens';

const THUMB_SIZE = 64;

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
          <Typography variant="h2">{t('tabs.myGraves')}</Typography>
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
        <Typography variant="h2">{t('tabs.myGraves')}</Typography>
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
        renderItem={({ item }) => (
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
                      name="image"
                      size={24}
                      color={colors.textTertiary}
                    />
                  </View>
                )}
                <View style={styles.info}>
                  <Typography variant="body" numberOfLines={2}>
                    {item.person_name}
                  </Typography>
                  <Typography variant="caption" color={colors.textSecondary}>
                    {formatGraveDateRange(
                      item.birth_year,
                      item.birth_month,
                      item.birth_day,
                      item.death_year,
                      item.death_month,
                      item.death_day,
                    )}
                  </Typography>
                  {item.cemetery?.name && (
                    <Typography
                      variant="caption"
                      color={colors.textTertiary}
                      numberOfLines={1}
                    >
                      {item.cemetery.name}
                    </Typography>
                  )}
                </View>
              </View>
            </Card>
          </Pressable>
        )}
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
    borderRadius: spacing.sm,
  },
  placeholder: {
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
});
