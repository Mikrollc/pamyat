import { View, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { useTranslation } from 'react-i18next';
import { colors, spacing, radii } from '@/constants/tokens';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface PhotoSelectorProps {
  photoUri: string | null;
  onPhotoSelected: (uri: string) => void;
  onPhotoRemoved: () => void;
  testID?: string;
}

export function PhotoSelector({
  photoUri,
  onPhotoSelected,
  onPhotoRemoved,
  testID,
}: PhotoSelectorProps) {
  const { t } = useTranslation();

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('', t('addGrave.permissionPhotos'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets[0]) {
      onPhotoSelected(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('', t('addGrave.permissionCamera'));
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets[0]) {
      onPhotoSelected(result.assets[0].uri);
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
              onPress={takePhoto}
              testID={testID ? `${testID}-retake` : undefined}
            />
          </View>
          <View style={styles.actionButton}>
            <Button
              variant="destructive"
              title={t('addGrave.removePhoto')}
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
      <View style={styles.emptyState}>
        <FontAwesome name="camera" size={48} color={colors.textTertiary} />
        <Typography variant="body" color={colors.textSecondary} align="center">
          {t('addGrave.photoHint')}
        </Typography>
      </View>
      <View style={styles.actions}>
        <View style={styles.actionButton}>
          <Button
            variant="secondary"
            title={t('addGrave.takePhoto')}
            onPress={takePhoto}
            testID={testID ? `${testID}-camera` : undefined}
          />
        </View>
        <View style={styles.actionButton}>
          <Button
            variant="secondary"
            title={t('addGrave.chooseGallery')}
            onPress={pickFromGallery}
            testID={testID ? `${testID}-gallery` : undefined}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    alignItems: 'center',
  },
  emptyState: {
    width: '100%',
    height: 200,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  preview: {
    width: '100%',
    height: 250,
    borderRadius: radii.md,
  },
  actions: {
    flexDirection: 'column',
    gap: spacing.sm,
    width: '100%',
  },
  actionButton: {},
});
