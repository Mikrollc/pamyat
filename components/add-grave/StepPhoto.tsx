import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { PhotoSelector } from './PhotoSelector';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useTranslation } from 'react-i18next';
import { useAddGraveStore } from '@/stores/add-grave-store';
import { spacing } from '@/constants/tokens';

interface StepPhotoProps {
  onNext: () => void;
  onBack: () => void;
}

export function StepPhoto({ onNext, onBack }: StepPhotoProps) {
  const { t } = useTranslation();
  const { photoUri, setPhotoUri, inscription, setInscription } = useAddGraveStore();

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
        <PhotoSelector
          photoUri={photoUri}
          onPhotoSelected={setPhotoUri}
          onPhotoRemoved={() => setPhotoUri(null)}
          testID="photo-selector"
        />
        <Input
          label={t('addGrave.inscriptionHint')}
          value={inscription}
          onChangeText={setInscription}
          testID="inscription"
        />
      </ScrollView>
      <View style={styles.footer}>
        <Button
          variant="secondary"
          title={t('common.back')}
          icon="arrow-left"
          onPress={onBack}
          testID="step3-back"
        />
        <View style={styles.nextButton}>
          <Button
            variant="brand"
            title={photoUri ? t('common.next') : t('addGrave.skip')}
            icon="arrow-right"
            onPress={onNext}
            testID="step3-next"
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: spacing.md,
    paddingTop: spacing.xl,
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
