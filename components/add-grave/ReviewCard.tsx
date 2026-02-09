import { View, Image, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { useTranslation } from 'react-i18next';
import { colors, spacing, radii, typography as typographyTokens } from '@/constants/tokens';
import type { PartialDate } from '@/stores/add-grave-store';

interface ReviewCardProps {
  firstName: string;
  lastName: string;
  birthDate: PartialDate;
  deathDate: PartialDate;
  cemeteryName: string;
  photoUri: string | null;
  inscription: string;
  testID?: string;
}

function formatPartialDate(d: PartialDate): string {
  if (d.unknown) return '?';
  const parts: string[] = [];
  if (d.day != null) parts.push(String(d.day).padStart(2, '0'));
  if (d.month != null) parts.push(String(d.month).padStart(2, '0'));
  if (d.year != null) parts.push(String(d.year));
  return parts.join('.') || '—';
}

export function ReviewCard({
  firstName,
  lastName,
  birthDate,
  deathDate,
  cemeteryName,
  photoUri,
  inscription,
  testID,
}: ReviewCardProps) {
  const { t } = useTranslation();
  const fullName = `${firstName} ${lastName}`.trim();
  const dates = `${formatPartialDate(birthDate)} — ${formatPartialDate(deathDate)}`;

  return (
    <Card testID={testID}>
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.photo} />
      ) : (
        <View style={styles.photoPlaceholder}>
          <Typography variant="caption" color={colors.textTertiary} align="center">
            {t('addGrave.noPhoto')}
          </Typography>
        </View>
      )}
      <View style={styles.info}>
        <Typography variant="h2">{fullName || '—'}</Typography>
        <Typography variant="body" color={colors.textSecondary}>
          {dates}
        </Typography>
        {cemeteryName ? (
          <Typography variant="bodySmall" color={colors.textTertiary}>
            {cemeteryName}
          </Typography>
        ) : null}
        {inscription ? (
          <Text style={styles.inscription}>{`\u201C${inscription}\u201D`}</Text>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  photo: {
    width: '100%',
    height: 200,
    borderRadius: radii.sm,
    marginBottom: spacing.md,
  },
  photoPlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  info: {
    gap: spacing.xs,
  },
  inscription: {
    fontSize: typographyTokens.bodySmall.fontSize,
    fontWeight: typographyTokens.bodySmall.fontWeight,
    lineHeight: typographyTokens.bodySmall.lineHeight,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
});
