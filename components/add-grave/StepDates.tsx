import { View, Pressable, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { PartialDateInput } from './PartialDateInput';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { useTranslation } from 'react-i18next';
import { useAddGraveStore } from '@/stores/add-grave-store';
import { validatePartialDate, validateDateOrder } from '@/lib/validate-date';
import { colors, spacing, radii } from '@/constants/tokens';

const RELATIONSHIPS = ['parent', 'grandparent', 'spouse', 'sibling', 'child', 'other'] as const;

interface StepDatesProps {
  onNext: () => void;
  onBack: () => void;
}

export function StepDates({ onNext, onBack }: StepDatesProps) {
  const { t } = useTranslation();
  const store = useAddGraveStore();

  const birthValid = !validatePartialDate(store.birthDate.year, store.birthDate.month, store.birthDate.day);
  const deathValid = !validatePartialDate(store.deathDate.year, store.deathDate.month, store.deathDate.day);
  const dateOrderValid = validateDateOrder(
    store.birthDate.year, store.deathDate.year,
    store.birthDate.month, store.deathDate.month,
    store.birthDate.day, store.deathDate.day,
  );
  const dateOrderError = !dateOrderValid ? t('addGrave.deathBeforeBirth') : null;

  const canProceed = birthValid && deathValid && dateOrderValid;

  const relKeys: Record<string, string> = {
    parent: 'addGrave.relParent',
    grandparent: 'addGrave.relGrandparent',
    spouse: 'addGrave.relSpouse',
    sibling: 'addGrave.relSibling',
    child: 'addGrave.relChild',
    other: 'addGrave.relOther',
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
        <Typography variant="body" color={colors.textSecondary}>
          {t('addGrave.datesFor', { name: `${store.firstName} ${store.lastName}`.trim() })}
        </Typography>
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
        <Typography variant="caption" color={colors.textTertiary}>
          {t('addGrave.dateFieldsHint')}
        </Typography>
        <View style={styles.fieldGroup}>
          <Input
            label={t('addGrave.plotInfo')}
            value={store.plotInfo}
            onChangeText={store.setPlotInfo}
            placeholder={t('addGrave.plotInfoHint')}
            testID="plot-info"
          />
        </View>
        <View style={styles.fieldGroup}>
          <Typography variant="bodySmall" color={colors.textSecondary}>
            {t('addGrave.relationship')}
          </Typography>
          <View style={styles.chipGroup}>
            {RELATIONSHIPS.map((rel) => {
              const selected = store.relationship === rel;
              return (
                <Pressable
                  key={rel}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => store.setRelationship(selected ? null : rel)}
                  testID={`rel-${rel}`}
                >
                  <Typography
                    variant="bodySmall"
                    color={selected ? colors.brand : colors.textSecondary}
                  >
                    {t(relKeys[rel])}
                  </Typography>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button
          variant="secondary"
          title={t('common.back')}
          icon="arrow-left"
          onPress={onBack}
          testID="step2-back"
        />
        <View style={styles.nextButton}>
          <Button
            variant="brand"
            title={t('common.next')}
            icon="arrow-right"
            onPress={onNext}
            disabled={!canProceed}
            testID="step2-next"
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
    gap: spacing.lg,
    paddingBottom: spacing.md,
  },
  fieldGroup: {
    gap: spacing.sm,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipSelected: {
    backgroundColor: '#e8f0ef',
    borderColor: colors.brand,
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
