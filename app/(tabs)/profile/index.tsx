import { useState } from 'react';
import { View, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
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
import { colors, spacing, radii } from '@/constants/tokens';
import i18n from '@/i18n';


function ProfileRow({
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
        <FontAwesome
          name={icon as never}
          size={18}
          color={destructive ? colors.destructive : colors.textSecondary}
        />
        <Typography
          variant="body"
          color={destructive ? colors.destructive : colors.textPrimary}
        >
          {label}
        </Typography>
      </View>
      {value ? (
        <Typography variant="body" color={colors.textTertiary}>
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <FontAwesome name="user" size={32} color={colors.white} />
        </View>
        <Typography variant="h2">
          {profile?.display_name ?? ''}
        </Typography>
        <Typography variant="bodySmall" color={colors.textTertiary}>
          {session?.user.phone ?? ''}
        </Typography>
      </View>

      <View style={styles.section}>
        <ProfileRow
          icon="globe"
          label={t('profile.language')}
          value={currentLang}
          onPress={handleLanguageToggle}
          testID="language-toggle"
        />
      </View>

      <View style={styles.section}>
        <ProfileRow
          icon="shield"
          label={t('profile.privacyPolicy')}
          onPress={() => WebBrowser.openBrowserAsync('https://raduna.app/privacy')}
          testID="privacy-policy-button"
        />
        <ProfileRow
          icon="file-text-o"
          label={t('profile.termsOfService')}
          onPress={() => WebBrowser.openBrowserAsync('https://raduna.app/terms')}
          testID="terms-of-service-button"
        />
      </View>

      <View style={styles.section}>
        <ProfileRow
          icon="trash"
          label={t('profile.deleteAccount')}
          onPress={() => setShowDeleteAccount(true)}
          destructive
          testID="delete-account-button"
        />
      </View>

      <View style={styles.signOutSection}>
        <Button
          variant="destructive"
          title={t('profile.signOut')}
          icon="sign-out"
          onPress={() => setShowSignOut(true)}
          testID="sign-out-button"
        />
      </View>

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

      <View style={styles.version}>
        <Typography variant="caption" color={colors.textTertiary}>
          {t('profile.version', { version })}
        </Typography>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  content: {
    paddingTop: 80,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingBottom: spacing.xl,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  section: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  signOutSection: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  version: {
    alignItems: 'center' as const,
    marginTop: spacing.md,
  },
});
