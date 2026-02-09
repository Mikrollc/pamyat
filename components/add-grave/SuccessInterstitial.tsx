import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn, BounceIn } from 'react-native-reanimated';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '@/constants/tokens';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface SuccessInterstitialProps {
  personName: string;
  onDone: () => void;
  testID?: string;
}

export function SuccessInterstitial({ personName, onDone, testID }: SuccessInterstitialProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container} testID={testID}>
      <Animated.View entering={BounceIn.delay(200)} style={styles.checkCircle}>
        <FontAwesome name="check" size={48} color={colors.white} />
      </Animated.View>
      <Animated.View entering={FadeIn.delay(500)}>
        <Typography variant="h2" align="center">
          {t('addGrave.memorialCreated')}
        </Typography>
        <View style={styles.name}>
          <Typography variant="body" color={colors.textSecondary} align="center">
            {personName}
          </Typography>
        </View>
      </Animated.View>
      <Animated.View entering={FadeIn.delay(800)} style={styles.button}>
        <Button
          variant="brand"
          title={t('common.done')}
          icon="check"
          onPress={onDone}
          testID={testID ? `${testID}-done` : undefined}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.xl,
  },
  checkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    marginTop: spacing.sm,
  },
  button: {
    width: '100%',
    marginTop: spacing.xxl,
  },
});
