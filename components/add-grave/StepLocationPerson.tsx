import { View, Pressable, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { MapPinSelector } from './MapPinSelector';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { useTranslation } from 'react-i18next';
import { useAddGraveStore } from '@/stores/add-grave-store';
import { colors, spacing, radii } from '@/constants/tokens';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface StepLocationPersonProps {
  onNext: () => void;
}

export function StepLocationPerson({ onNext }: StepLocationPersonProps) {
  const { t } = useTranslation();
  const store = useAddGraveStore();

  const canProceed =
    store.latitude != null &&
    store.longitude != null &&
    store.pinConfirmed &&
    store.firstName.trim().length > 0;

  const handleClearCemetery = () => {
    store.setCemeteryId(null);
    store.setCemeteryName('');
  };

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
        {store.cemeteryId ? (
          <View style={styles.cemeteryCard} testID="cemetery-card">
            <View style={styles.cemeteryCardContent}>
              <FontAwesome name="map-marker" size={16} color={colors.brand} />
              <Typography variant="body">{store.cemeteryName}</Typography>
            </View>
            <Pressable
              onPress={handleClearCemetery}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Clear cemetery"
              testID="cemetery-clear"
            >
              <FontAwesome name="times-circle" size={18} color={colors.textTertiary} />
            </Pressable>
          </View>
        ) : (
          <Input
            label={t('addGrave.cemeteryName')}
            value={store.cemeteryName}
            onChangeText={store.setCemeteryName}
            placeholder={t('addGrave.iDontKnow')}
            testID="cemetery-name"
          />
        )}
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
  cemeteryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e8f5f3',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  cemeteryCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
});
