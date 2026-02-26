import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import Animated, { FadeIn, BounceIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { colors, spacing, radii, buttonHeight, typography } from '@/constants/tokens';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const SERIF_FONT = Platform.select({ ios: 'Georgia', default: 'serif' });

interface SuccessInterstitialProps {
  personName: string;
  dates?: string;
  onShare: () => void;
  onView: () => void;
  testID?: string;
}

export function SuccessInterstitial({
  personName,
  dates,
  onShare,
  onView,
  testID,
}: SuccessInterstitialProps) {
  const { t } = useTranslation();

  return (
    <LinearGradient
      colors={[colors.splash.gradientStart, colors.splash.gradientEnd]}
      style={styles.gradient}
      testID={testID}
    >
      <View style={styles.top} />

      <View style={styles.center}>
        <Animated.View entering={BounceIn.delay(200)} style={styles.checkCircle}>
          <FontAwesome name="check" size={40} color={colors.brand} />
        </Animated.View>

        <Animated.View entering={FadeIn.delay(500)} style={styles.textBlock}>
          <Text style={styles.title}>{t('addGrave.memorialCreated')}</Text>
          <Text style={styles.personName}>{personName}</Text>
          {dates ? <Text style={styles.dates}>{dates}</Text> : null}
        </Animated.View>

        <Animated.View entering={FadeIn.delay(800)}>
          <Text style={styles.tagline}>{t('addGrave.taglineMemory')}</Text>
        </Animated.View>
      </View>

      <Animated.View entering={FadeIn.delay(1000)} style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
          onPress={onShare}
          accessibilityRole="button"
          testID={testID ? `${testID}-share` : undefined}
        >
          <FontAwesome name="share-alt" size={16} color={colors.brand} />
          <Text style={styles.primaryButtonText}>{t('addGrave.shareWithFamily')}</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}
          onPress={onView}
          accessibilityRole="button"
          testID={testID ? `${testID}-view` : undefined}
        >
          <Text style={styles.secondaryButtonText}>{t('addGrave.viewMemorial')}</Text>
        </Pressable>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  top: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
    gap: spacing.xl,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    fontFamily: SERIF_FONT,
    fontSize: 32,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
  },
  personName: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
  dates: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  tagline: {
    fontFamily: SERIF_FONT,
    fontSize: typography.body.fontSize,
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  actions: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: buttonHeight.md,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  primaryButtonPressed: {
    opacity: 0.85,
  },
  primaryButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
    color: colors.brand,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: buttonHeight.md,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  secondaryButtonPressed: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  secondaryButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
    color: colors.white,
  },
});
