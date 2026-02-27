import { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  Modal,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useGrave, useSession, useGraveMembership, useUpdateGrave, useDeleteGrave } from '@/hooks';
import { getGravePhotoUrl } from '@/lib/api/photos';
import { parseLocationCoords } from '@/lib/geo';
import { validatePartialDate, validateDateOrder } from '@/lib/validate-date';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { InviteFamilySheet } from '@/components/invite/InviteFamilySheet';
import { PartialDateInput } from '@/components/add-grave/PartialDateInput';
import { PhotoSelector } from '@/components/add-grave/PhotoSelector';
import { colors, spacing, radii, fonts } from '@/constants/tokens';
import type { PartialDate } from '@/stores/add-grave-store';

const BOTTOM_BAR_HEIGHT = 84;
const RELATIONSHIPS = ['parent', 'grandparent', 'spouse', 'sibling', 'child', 'other'] as const;

const relKeys: Record<string, string> = {
  parent: 'addGrave.relParent',
  grandparent: 'addGrave.relGrandparent',
  spouse: 'addGrave.relSpouse',
  sibling: 'addGrave.relSibling',
  child: 'addGrave.relChild',
  other: 'addGrave.relOther',
};

export default function EditMemorialScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const session = useSession();

  const { data: grave, isLoading } = useGrave(slug);
  const { data: membership } = useGraveMembership(grave?.id, session?.user?.id);
  const updateGrave = useUpdateGrave();
  const deleteGrave = useDeleteGrave();

  const loaded = useRef(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState<PartialDate>({ year: null, month: null, day: null });
  const [deathDate, setDeathDate] = useState<PartialDate>({ year: null, month: null, day: null });
  const [cemeteryName, setCemeteryName] = useState('');
  const [plotInfo, setPlotInfo] = useState('');
  const [relationship, setRelationship] = useState<string | null>(null);
  const [inscription, setInscription] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoChanged, setPhotoChanged] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showInviteSheet, setShowInviteSheet] = useState(false);

  // Track originals for diffing
  const originalCemeteryName = useRef('');
  const originalRelationship = useRef<string | null>(null);
  const originalPhotoPath = useRef<string | null>(null);

  // Initialize state from grave data once
  useEffect(() => {
    if (!grave || loaded.current) return;
    loaded.current = true;

    const nameParts = (grave.person_name ?? '').split(' ');
    setFirstName(nameParts[0] ?? '');
    setLastName(nameParts.slice(1).join(' '));

    setBirthDate({ year: grave.birth_year, month: grave.birth_month, day: grave.birth_day });
    setDeathDate({ year: grave.death_year, month: grave.death_month, day: grave.death_day });

    const cemName = grave.cemetery?.name ?? '';
    setCemeteryName(cemName);
    originalCemeteryName.current = cemName;

    setPlotInfo(grave.plot_info ?? '');
    setInscription(grave.inscription ?? '');

    if (grave.cover_photo_path) {
      setPhotoUri(getGravePhotoUrl(grave.cover_photo_path));
      originalPhotoPath.current = grave.cover_photo_path;
    }
  }, [grave]);

  // Initialize relationship from membership
  useEffect(() => {
    if (!membership || originalRelationship.current !== null) return;
    setRelationship(membership.relationship ?? null);
    originalRelationship.current = membership.relationship ?? null;
  }, [membership]);

  // Validation
  const birthValid = !validatePartialDate(birthDate.year, birthDate.month, birthDate.day);
  const deathValid = !validatePartialDate(deathDate.year, deathDate.month, deathDate.day);
  const dateOrderValid = validateDateOrder(
    birthDate.year, deathDate.year,
    birthDate.month, deathDate.month,
    birthDate.day, deathDate.day,
  );
  const dateOrderError = !dateOrderValid ? t('addGrave.deathBeforeBirth') : null;
  const canSave = firstName.trim().length > 0 && birthValid && deathValid && dateOrderValid;

  function handleSave() {
    if (!grave || !canSave) return;

    const coords = parseLocationCoords(grave.location);
    updateGrave.mutate(
      {
        graveId: grave.id,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        birthDate,
        deathDate,
        cemeteryName,
        cemeteryId: grave.cemetery_id,
        cemeteryNameChanged: cemeteryName.trim() !== originalCemeteryName.current.trim(),
        latitude: coords ? coords[1] : 0,
        longitude: coords ? coords[0] : 0,
        plotInfo,
        relationship,
        originalRelationship: originalRelationship.current,
        inscription,
        photoUri: photoChanged ? photoUri : null,
        photoChanged,
        originalPhotoPath: originalPhotoPath.current,
      },
      {
        onSuccess: () => {
          router.back();
        },
        onError: () => {
          Alert.alert('', t('manage.saveError'));
        },
      },
    );
  }

  function handleDelete() {
    if (!grave) return;
    deleteGrave.mutate(grave.id, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
        router.replace('/(tabs)/graves');
      },
      onError: () => {
        setShowDeleteConfirm(false);
        Alert.alert('', t('manage.deleteError'));
      },
    });
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!grave) {
    return (
      <View style={styles.centered}>
        <Typography variant="body" color={colors.textSecondary}>
          {t('memorial.notFound')}
        </Typography>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          style={styles.headerBtn}
        >
          <FontAwesome name="arrow-left" size={15} color={colors.textSecondary} />
        </Pressable>

        <Text style={styles.headerTitle}>{t('manage.title')}</Text>

        <Pressable
          onPress={() => setShowMenu(true)}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t('common.more')}
          style={styles.headerBtn}
        >
          <FontAwesome name="ellipsis-h" size={15} color={colors.textSecondary} />
        </Pressable>
      </View>
      <View style={styles.headerBorder} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: BOTTOM_BAR_HEIGHT + insets.bottom + spacing.xl }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Photo */}
          <PhotoSelector
            photoUri={photoUri}
            onPhotoSelected={(uri) => {
              setPhotoUri(uri);
              setPhotoChanged(true);
            }}
            onPhotoRemoved={() => {
              setPhotoUri(null);
              setPhotoChanged(true);
            }}
            testID="edit-photo"
          />

          {/* Person section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('addGrave.firstName')}</Text>
            <View style={styles.sectionCard}>
              <Input
                label={t('addGrave.firstName')}
                value={firstName}
                onChangeText={setFirstName}
                maxLength={50}
                testID="edit-first-name"
              />
              <Input
                label={t('addGrave.lastName')}
                value={lastName}
                onChangeText={setLastName}
                maxLength={100}
                testID="edit-last-name"
              />
            </View>
          </View>

          {/* Dates section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('addGrave.birthDate')}</Text>
            <View style={styles.sectionCard}>
              <PartialDateInput
                label={t('addGrave.birthDate')}
                value={birthDate}
                onChange={(update) => setBirthDate((prev) => ({ ...prev, ...update }))}
                testID="edit-birth-date"
              />
              <PartialDateInput
                label={t('addGrave.deathDate')}
                value={deathDate}
                onChange={(update) => setDeathDate((prev) => ({ ...prev, ...update }))}
                error={dateOrderError}
                testID="edit-death-date"
              />
            </View>
          </View>

          {/* Location section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('memorial.cemetery')}</Text>
            <View style={styles.sectionCard}>
              <Input
                label={t('addGrave.cemeteryName')}
                value={cemeteryName}
                onChangeText={setCemeteryName}
                maxLength={100}
                testID="edit-cemetery"
              />
              <Input
                label={t('addGrave.plotInfo')}
                value={plotInfo}
                onChangeText={setPlotInfo}
                placeholder={t('addGrave.plotInfoHint')}
                maxLength={200}
                testID="edit-plot"
              />
            </View>
          </View>

          {/* Relationship section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('addGrave.relationship')}</Text>
            <View style={styles.chipGroup}>
              {RELATIONSHIPS.map((rel) => {
                const selected = relationship === rel;
                return (
                  <Pressable
                    key={rel}
                    style={[styles.chip, selected && styles.chipSelected]}
                    onPress={() => setRelationship(selected ? null : rel)}
                    testID={`edit-rel-${rel}`}
                  >
                    {selected && (
                      <FontAwesome name="check" size={11} color={colors.brand} />
                    )}
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                      {t(relKeys[rel] ?? rel)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Inscription section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('memorial.notes')}</Text>
            <View style={styles.sectionCard}>
              <Input
                label={t('addGrave.inscriptionHint')}
                value={inscription}
                onChangeText={setInscription}
                maxLength={500}
                testID="edit-inscription"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sticky save bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          variant="brand"
          title={updateGrave.isPending ? t('manage.saving') : t('manage.save')}
          icon="check"
          onPress={handleSave}
          disabled={!canSave}
          loading={updateGrave.isPending}
          style={styles.saveButton}
          testID="edit-save"
        />
      </View>

      {/* Menu bottom sheet */}
      <Modal visible={showMenu} transparent animationType="slide" statusBarTranslucent>
        <Pressable style={styles.menuBackdrop} onPress={() => setShowMenu(false)}>
          <View style={[styles.menuSheet, { paddingBottom: insets.bottom + spacing.lg }]}>
            <View style={styles.menuHandle} />

            <View style={styles.menuActions}>
              <Pressable
                style={styles.menuItemDestructive}
                onPress={() => {
                  setShowMenu(false);
                  setShowDeleteConfirm(true);
                }}
              >
                <View style={styles.menuIconDestructive}>
                  <FontAwesome name="trash" size={16} color={colors.destructive} />
                </View>
                <Typography variant="body" color={colors.destructive}>
                  {t('manage.deleteTitle')}
                </Typography>
              </Pressable>

              {(membership?.role === 'owner' || membership?.role === 'editor') && (
                <Pressable
                  style={styles.menuItem}
                  onPress={() => {
                    setShowMenu(false);
                    setShowInviteSheet(true);
                  }}
                  testID="menu-invite-family"
                >
                  <View style={styles.menuIcon}>
                    <FontAwesome name="user-plus" size={14} color={colors.brand} />
                  </View>
                  <Typography variant="body" color={colors.brand}>
                    {t('invite.title')}
                  </Typography>
                </Pressable>
              )}
            </View>

            <Pressable
              style={styles.menuCancel}
              onPress={() => setShowMenu(false)}
            >
              <Typography variant="body">{t('common.cancel')}</Typography>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <ConfirmModal
        visible={showDeleteConfirm}
        title={t('manage.deleteTitle')}
        message={t('manage.deleteMessage')}
        cancelLabel={t('common.cancel')}
        confirmLabel={t('manage.deleteConfirm')}
        confirmVariant="destructive"
        confirmIcon="trash"
        loading={deleteGrave.isPending}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
      />

      {grave && session?.user?.id && (
        <InviteFamilySheet
          visible={showInviteSheet}
          graveId={grave.id}
          userId={session.user.id}
          onClose={() => setShowInviteSheet(false)}
        />
      )}
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundPrimary,
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
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fonts.serif,
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  headerBorder: {
    height: 1,
    backgroundColor: colors.border,
  },

  /* Scroll */
  scrollContent: {
    padding: spacing.md,
    gap: spacing.lg,
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
    padding: spacing.md,
    gap: spacing.md,
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

  /* Chips */
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.backgroundPrimary,
  },
  chipSelected: {
    backgroundColor: colors.brandLight,
    borderColor: colors.brand,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.brand,
    fontWeight: '600',
  },

  /* Bottom bar */
  bottomBar: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    backgroundColor: colors.backgroundPrimary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  saveButton: {
    borderRadius: radii.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },

  /* Menu bottom sheet */
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  menuSheet: {
    backgroundColor: colors.backgroundPrimary,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  menuHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  menuActions: {
    gap: spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
  },
  menuItemDestructive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconDestructive: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fdf0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuCancel: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
