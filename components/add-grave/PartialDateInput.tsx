import { View, Switch, StyleSheet } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { Input } from '@/components/ui/Input';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '@/constants/tokens';
import type { PartialDate } from '@/stores/add-grave-store';

interface PartialDateInputProps {
  label: string;
  value: PartialDate;
  onChange: (update: Partial<PartialDate>) => void;
  testID?: string;
}

export function PartialDateInput({ label, value, onChange, testID }: PartialDateInputProps) {
  const { t } = useTranslation();

  const handleToggleUnknown = (unknown: boolean) => {
    onChange({ unknown, year: null, month: null, day: null });
  };

  return (
    <View style={styles.container} testID={testID}>
      <Typography variant="bodySmall" color={colors.textSecondary}>
        {label}
      </Typography>
      <View style={styles.toggleRow}>
        <Typography variant="bodySmall">{t('addGrave.unknownDate')}</Typography>
        <Switch
          value={value.unknown}
          onValueChange={handleToggleUnknown}
          trackColor={{ true: colors.brand }}
          testID={testID ? `${testID}-toggle` : undefined}
        />
      </View>
      {!value.unknown && (
        <View style={styles.fieldsRow}>
          <View style={styles.field}>
            <Input
              label={t('addGrave.day')}
              value={value.day != null ? String(value.day) : ''}
              onChangeText={(text) => {
                const n = parseInt(text, 10);
                onChange({ day: isNaN(n) ? null : Math.min(31, Math.max(1, n)) });
              }}
              keyboardType="number-pad"
              placeholder="—"
              testID={testID ? `${testID}-day` : undefined}
            />
          </View>
          <View style={styles.field}>
            <Input
              label={t('addGrave.month')}
              value={value.month != null ? String(value.month) : ''}
              onChangeText={(text) => {
                const n = parseInt(text, 10);
                onChange({ month: isNaN(n) ? null : Math.min(12, Math.max(1, n)) });
              }}
              keyboardType="number-pad"
              placeholder="—"
              testID={testID ? `${testID}-month` : undefined}
            />
          </View>
          <View style={styles.fieldYear}>
            <Input
              label={t('addGrave.year')}
              value={value.year != null ? String(value.year) : ''}
              onChangeText={(text) => {
                const n = parseInt(text, 10);
                onChange({ year: isNaN(n) ? null : n });
              }}
              keyboardType="number-pad"
              placeholder="—"
              testID={testID ? `${testID}-year` : undefined}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  field: {
    flex: 1,
  },
  fieldYear: {
    flex: 1.5,
  },
});
