import { ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { MapPinSelector } from './MapPinSelector';
import { PartialDateInput } from './PartialDateInput';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useTranslation } from 'react-i18next';
import { useAddGraveStore } from '@/stores/add-grave-store';
import { validatePartialDate, validateDateOrder } from '@/lib/validate-date';
import { spacing } from '@/constants/tokens';

interface StepLocationPersonProps {
  onNext: () => void;
}

export function StepLocationPerson({ onNext }: StepLocationPersonProps) {
  const { t } = useTranslation();
  const store = useAddGraveStore();

  const birthValid = store.birthDate.unknown || !validatePartialDate(store.birthDate.year, store.birthDate.month, store.birthDate.day);
  const deathValid = store.deathDate.unknown || !validatePartialDate(store.deathDate.year, store.deathDate.month, store.deathDate.day);
  const dateOrderValid = validateDateOrder(
    store.birthDate.year, store.deathDate.year,
    store.birthDate.month, store.deathDate.month,
    store.birthDate.day, store.deathDate.day,
  );
  const dateOrderError = !dateOrderValid ? t('addGrave.deathBeforeBirth') : null;

  const canProceed =
    store.latitude != null &&
    store.longitude != null &&
    store.pinConfirmed &&
    store.firstName.trim().length > 0 &&
    birthValid &&
    deathValid &&
    dateOrderValid;

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
        <MapPinSelector
          latitude={store.latitude}
          longitude={store.longitude}
          onLocationChange={store.setLocation}
          testID="map-pin"
        />
        <Input
          label={t('addGrave.firstName')}
          value={store.firstName}
          onChangeText={store.setFirstName}
          testID="first-name"
        />
        <Input
          label={t('addGrave.lastName')}
          value={store.lastName}
          onChangeText={store.setLastName}
          testID="last-name"
        />
        <PartialDateInput
          label={t('addGrave.birthDate')}
          value={store.birthDate}
          onChange={store.setBirthDate}
          testID="birth-date"
        />
        <PartialDateInput
          label={t('addGrave.deathDate')}
          value={store.deathDate}
          onChange={store.setDeathDate}
          error={dateOrderError}
          testID="death-date"
        />
        <Input
          label={t('addGrave.cemeteryName')}
          value={store.cemeteryName}
          onChangeText={store.setCemeteryName}
          placeholder={t('addGrave.iDontKnow')}
          testID="cemetery-name"
        />
        <Button
          variant="brand"
          title={t('common.next')}
          icon="arrow-right"
          onPress={onNext}
          disabled={!canProceed}
          testID="step1-next"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
});
