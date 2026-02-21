import { useState, useMemo } from 'react';
import { View, Modal, Pressable, TextInput, FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Typography } from './Typography';
import {
  ALL_COUNTRIES,
  PRIORITY_COUNT,
  type Country,
} from '@/lib/country-data';
import { colors, spacing, radii, typography as typo } from '@/constants/tokens';

interface CountryPickerSheetProps {
  visible: boolean;
  onSelect: (country: Country) => void;
  onClose: () => void;
}

export function CountryPickerSheet({ visible, onSelect, onClose }: CountryPickerSheetProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return ALL_COUNTRIES;
    const q = search.toLowerCase().trim();
    return ALL_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.nameLocal.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q),
    );
  }, [search]);

  function handleClose() {
    setSearch('');
    onClose();
  }

  function handleSelect(country: Country) {
    setSearch('');
    onSelect(country);
  }

  function renderItem({ item, index }: { item: Country; index: number }) {
    const showSeparator = !search.trim() && index === PRIORITY_COUNT;
    return (
      <>
        {showSeparator && <View style={styles.separator} />}
        <Pressable
          style={styles.row}
          onPress={() => handleSelect(item)}
          accessibilityRole="button"
          accessibilityLabel={`${item.name} ${item.dialCode}`}
        >
          <View style={styles.flag}>
            <Typography variant="body">{item.flag}</Typography>
          </View>
          <View style={styles.countryName}>
            <Typography variant="body">{item.name}</Typography>
          </View>
          <Typography variant="body" color={colors.textSecondary}>{item.dialCode}</Typography>
        </Pressable>
      </>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}
          onPress={() => {}}
        >
          <View style={styles.header}>
            <Typography variant="h2">{t('auth.selectCountry')}</Typography>
            <Pressable onPress={handleClose} hitSlop={12} accessibilityRole="button">
              <FontAwesome name="times" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder={t('auth.searchCountry')}
            placeholderTextColor={colors.textTertiary}
            autoCorrect={false}
            autoCapitalize="none"
          />

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.code}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            style={styles.list}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.backgroundPrimary,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typo.body.fontSize,
    color: colors.textPrimary,
  },
  list: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    gap: spacing.sm,
  },
  flag: {
    width: 28,
    textAlign: 'center',
  },
  countryName: {
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
});
