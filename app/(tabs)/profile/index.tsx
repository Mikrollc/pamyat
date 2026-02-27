import { useState } from 'react';
import { View, Text, Pressable, ScrollView, Platform, StyleSheet, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { supabase } from '@/lib/supabase';
import { deleteAccount } from '@/lib/api';
import { useSession } from '@/hooks/useSession';
import { useProfile } from '@/hooks/useProfile';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { colors, spacing, radii, fonts } from '@/constants/tokens';
import { formatPhoneDisplay } from '@/lib/format-phone';
import i18n from '@/i18n';

function InfoRow({
  icon,
  label,
  value,
  onPress,
  destructive,
  testID,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress: () => void;
  destructive?: boolean;
  testID?: string;
}) {
  return (
    <Pressable
      style={styles.row}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
    >
      <View style={styles.rowLeft}>
        <View style={[styles.rowIcon, destructive && styles.rowIconDestructive]}>
          <FontAwesome
            name={icon as never}
            size={15}
            color={destructive ? colors.destructive : colors.brand}
          />
        </View>
        <Typography
          variant="body"
          color={destructive ? colors.destructive : colors.textPrimary}
        >
          {label}
        </Typography>
      </View>
      {value ? (
        <Typography variant="bodySmall" color={colors.textTertiary}>
          {value}
        </Typography>
      ) : (
        <FontAwesome name="angle-right" size={18} color={colors.textTertiary} />
      )}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const session = useSession();
  const { data: profile } = useProfile(session?.user.id);

  const currentLang = i18n.language === 'ru' ? t('profile.russian') : t('profile.english');
  const version = Constants.expoConfig?.version ?? '1.0.0';

  const handleLanguageToggle = () => {
    const newLang = i18n.language === 'ru' ? 'en' : 'ru';
    i18n.changeLanguage(newLang);
  };

  const [showSignOut, setShowSignOut] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      setShowDeleteAccount(false);
      await supabase.auth.signOut();
    } catch (error) {
      setIsDeleting(false);
      setShowDeleteAccount(false);
      Alert.alert(t('profile.deleteAccount'), t('profile.deleteAccountError'));
    }
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.headerBtnPlaceholder} />
        <Text style={styles.headerTitle}>{t('profile.title')}</Text>
        <View style={styles.headerBtnPlaceholder} />
      </View>
      <View style={styles.headerBorder} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + identity */}
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <FontAwesome name="user" size={28} color={colors.white} />
          </View>
          <Typography variant="h2">
            {profile?.display_name ?? ''}
          </Typography>
          <Typography variant="bodySmall" color={colors.textTertiary}>
            {session?.user.phone ? formatPhoneDisplay(session.user.phone) : ''}
          </Typography>
        </View>

        {/* Settings section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('profile.settings')}</Text>
          <View style={styles.sectionCard}>
            <InfoRow
              icon="globe"
              label={t('profile.language')}
              value={currentLang}
              onPress={handleLanguageToggle}
              testID="language-toggle"
            />
          </View>
        </View>

        {/* Legal section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('profile.legal')}</Text>
          <View style={styles.sectionCard}>
            <InfoRow
              icon="shield"
              label={t('profile.privacyPolicy')}
              onPress={() => WebBrowser.openBrowserAsync('https://raduna.app/privacy')}
              testID="privacy-policy-button"
            />
            <View style={styles.separator} />
            <InfoRow
              icon="file-text-o"
              label={t('profile.termsOfService')}
              onPress={() => WebBrowser.openBrowserAsync('https://raduna.app/terms')}
              testID="terms-of-service-button"
            />
            <View style={styles.separator} />
            <InfoRow
              icon="code"
              label={t('profile.licenses')}
              onPress={() => router.push('/(tabs)/profile/licenses')}
              testID="oss-licenses-button"
            />
          </View>
        </View>

        {/* Danger zone */}
        <View style={styles.section}>
          <View style={styles.sectionCard}>
            <InfoRow
              icon="trash"
              label={t('profile.deleteAccount')}
              onPress={() => setShowDeleteAccount(true)}
              destructive
              testID="delete-account-button"
            />
          </View>
        </View>

        {/* Sign out */}
        <View style={styles.signOutSection}>
          <Button
            variant="destructive"
            title={t('profile.signOut')}
            icon="sign-out"
            onPress={() => setShowSignOut(true)}
            testID="sign-out-button"
          />
        </View>

        {/* Version */}
        <View style={styles.version}>
          <Typography variant="caption" color={colors.textTertiary}>
            {t('profile.version', { version })}
          </Typography>
        </View>
      </ScrollView>

      <ConfirmModal
        visible={showSignOut}
        title={t('profile.signOut')}
        message={t('profile.signOutConfirm')}
        cancelLabel={t('common.cancel')}
        confirmLabel={t('profile.signOut')}
        confirmVariant="destructive"
        confirmIcon="sign-out"
        onCancel={() => setShowSignOut(false)}
        onConfirm={() => {
          setShowSignOut(false);
          supabase.auth.signOut();
        }}
      />

      <ConfirmModal
        visible={showDeleteAccount}
        title={t('profile.deleteAccount')}
        message={t('profile.deleteAccountConfirm')}
        cancelLabel={t('common.cancel')}
        confirmLabel={isDeleting ? t('profile.deleting') : t('profile.deleteAccount')}
        confirmVariant="destructive"
        confirmIcon="trash"
        onCancel={() => !isDeleting && setShowDeleteAccount(false)}
        onConfirm={handleDeleteAccount}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  flex: {
    flex: 1,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.backgroundPrimary,
    zIndex: 1,
  },
  headerTitle: {
    fontFamily: fonts.serif,
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  headerBtnPlaceholder: {
    width: 36,
    height: 36,
  },
  headerBorder: {
    height: 1,
    backgroundColor: colors.border,
  },

  /* Scroll */
  scrollContent: {
    padding: spacing.md,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  /* Identity */
  identity: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },

  /* Sections */
  section: {
    gap: spacing.sm,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: spacing.xs,
  },
  sectionCard: {
    backgroundColor: colors.backgroundPrimary,
    borderRadius: radii.md,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  /* Rows */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 52,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconDestructive: {
    backgroundColor: '#fdf0f0',
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.md + 34 + spacing.md,
  },

  /* Sign out */
  signOutSection: {
    marginTop: spacing.sm,
  },

  /* Version */
  version: {
    alignItems: 'center',
  },
});
