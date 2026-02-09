import { ScrollView, View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { ReviewCard } from './ReviewCard';
import { Input } from '@/components/ui/Input';
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
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <ReviewCard
          firstName={store.firstName}
          lastName={store.lastName}
          birthDate={store.birthDate}
          deathDate={store.deathDate}
          cemeteryName={store.cemeteryName}
          photoUri={store.photoUri}
          inscription={store.inscription}
          testID="review-card"
        />
        <Input
          label={t('addGrave.inscriptionHint')}
          value={store.inscription}
          onChangeText={store.setInscription}
          testID="inscription"
        />
        <Typography variant="caption" color={colors.textTertiary} align="center">
          {t('addGrave.editAnytime')}
        </Typography>
      </ScrollView>
      <View style={styles.footer}>
        <Button
          variant="secondary"
          title={t('common.back')}
          onPress={onBack}
          disabled={publishing}
          testID="step3-back"
        />
        <Button
          variant="brand"
          title={t('addGrave.publishMemorial')}
          onPress={onPublish}
          loading={publishing}
          testID="step3-publish"
        />
      </View>
    </KeyboardAvoidingView>
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
});
