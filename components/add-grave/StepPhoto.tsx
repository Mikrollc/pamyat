import { View, StyleSheet } from 'react-native';
import { PhotoSelector } from './PhotoSelector';
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
  const { photoUri, setPhotoUri } = useAddGraveStore();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <PhotoSelector
          photoUri={photoUri}
          onPhotoSelected={setPhotoUri}
          onPhotoRemoved={() => setPhotoUri(null)}
          testID="photo-selector"
        />
      </View>
      <View style={styles.footer}>
        <View style={styles.footerButton}>
          <Button
            variant="secondary"
            title={t('common.back')}
            icon="arrow-left"
            onPress={onBack}
            testID="step2-back"
          />
        </View>
        <View style={styles.footerButton}>
          <Button
            variant="brand"
            title={photoUri ? t('common.next') : t('addGrave.skip')}
            icon="arrow-right"
            onPress={onNext}
            testID="step2-next"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.md,
    paddingTop: spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  footerButton: {
    flex: 1,
  },
});
