import { View, Pressable, Image, StyleSheet, Alert, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { useTranslation } from 'react-i18next';
import { colors, spacing, radii } from '@/constants/tokens';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const MAX_WIDTH = 1920;

interface PhotoSelectorProps {
  photoUri: string | null;
  onPhotoSelected: (uri: string) => void;
  onPhotoRemoved: () => void;
  testID?: string;
}

async function compressPhoto(uri: string, width: number): Promise<string> {
  const actions: { resize: { width: number } }[] =
    width > MAX_WIDTH ? [{ resize: { width: MAX_WIDTH } }] : [];
  const result = await manipulateAsync(uri, actions, {
    compress: 0.7,
    format: SaveFormat.JPEG,
  });
  return result.uri;
}

export function PhotoSelector({
  photoUri,
  onPhotoSelected,
  onPhotoRemoved,
  testID,
}: PhotoSelectorProps) {
  const { t } = useTranslation();

  const showPermissionAlert = (messageKey: string) => {
    Alert.alert('', t(messageKey), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.settings'), onPress: () => Linking.openSettings() },
    ]);
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showPermissionAlert('addGrave.permissionPhotos');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [3, 2],
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const compressed = await compressPhoto(asset.uri, asset.width);
      onPhotoSelected(compressed);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showPermissionAlert('addGrave.permissionCamera');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
      aspect: [3, 2],
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const compressed = await compressPhoto(asset.uri, asset.width);
      onPhotoSelected(compressed);
    }
  };

  if (photoUri) {
    return (
      <View style={styles.container} testID={testID}>
        <Image source={{ uri: photoUri }} style={styles.preview} />
        <View style={styles.actions}>
          <View style={styles.actionButton}>
            <Button
              variant="secondary"
              title={t('addGrave.retakePhoto')}
              icon="camera"
              onPress={takePhoto}
              testID={testID ? `${testID}-retake` : undefined}
            />
          </View>
          <View style={styles.actionButton}>
            <Button
              variant="destructive"
              title={t('addGrave.removePhoto')}
              icon="trash"
              onPress={onPhotoRemoved}
              testID={testID ? `${testID}-remove` : undefined}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.twoAreaRow}>
        <Pressable
          style={styles.areaCard}
          onPress={takePhoto}
          testID={testID ? `${testID}-camera` : undefined}
        >
          <FontAwesome name="camera" size={32} color={colors.textSecondary} />
          <Typography variant="bodySmall" color={colors.textSecondary} align="center">
            {t('addGrave.takePhoto')}
          </Typography>
        </Pressable>
        <Pressable
          style={styles.areaCard}
          onPress={pickFromGallery}
          testID={testID ? `${testID}-gallery` : undefined}
        >
          <FontAwesome name="image" size={32} color={colors.textSecondary} />
          <Typography variant="bodySmall" color={colors.textSecondary} align="center">
            {t('addGrave.chooseGallery')}
          </Typography>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    alignItems: 'center',
  },
  twoAreaRow: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  areaCard: {
    flex: 1,
    height: 160,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  preview: {
    width: '100%',
    aspectRatio: 3 / 2,
    borderRadius: radii.md,
  },
  actions: {
    flexDirection: 'column',
    gap: spacing.sm,
    width: '100%',
  },
  actionButton: {},
});
