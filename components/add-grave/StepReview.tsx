import { ScrollView, View, StyleSheet } from 'react-native';
import { ReviewCard } from './ReviewCard';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { useTranslation } from 'react-i18next';
import { useAddGraveStore } from '@/stores/add-grave-store';
import { colors, spacing } from '@/constants/tokens';

interface StepReviewProps {
  onBack: () => void;
  onPublish: () => void;
  publishing: boolean;
}

export function StepReview({ onBack, onPublish, publishing }: StepReviewProps) {
  const { t } = useTranslation();
  const store = useAddGraveStore();

  return (
    <View style={styles.flex}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
      >
        <ReviewCard
          firstName={store.firstName}
          lastName={store.lastName}
          birthDate={store.birthDate}
          deathDate={store.deathDate}
          cemeteryName={store.cemeteryName}
          plotInfo={store.plotInfo}
          relationship={store.relationship}
          photoUri={store.photoUri}
          inscription={store.inscription}
          testID="review-card"
        />
        <Typography variant="caption" color={colors.textTertiary} align="center">
          {t('addGrave.editAnytime')}
        </Typography>
      </ScrollView>
      <View style={styles.footer}>
        <Button
          variant="secondary"
          title={t('common.back')}
          icon="arrow-left"
          onPress={onBack}
          disabled={publishing}
          testID="step4-back"
        />
        <View style={styles.nextButton}>
          <Button
            variant="brand"
            title={t('addGrave.publish')}
            icon="check"
            onPress={onPublish}
            loading={publishing}
            testID="step4-publish"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  nextButton: {
    flex: 1,
  },
});
