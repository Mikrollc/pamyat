import { useState } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WizardHeader } from '@/components/add-grave/WizardHeader';
import { StepLocationPerson } from '@/components/add-grave/StepLocationPerson';
import { StepDates } from '@/components/add-grave/StepDates';
import { StepPhoto } from '@/components/add-grave/StepPhoto';
import { StepReview } from '@/components/add-grave/StepReview';
import { SuccessInterstitial } from '@/components/add-grave/SuccessInterstitial';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useAddGraveStore } from '@/stores/add-grave-store';
import { usePublishGrave } from '@/hooks/usePublishGrave';
import { colors } from '@/constants/tokens';


export default function AddGraveScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const store = useAddGraveStore();
  const publishMutation = usePublishGrave();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);

  const handleClose = () => {
    setShowDiscard(true);
  };

  const handleDiscard = () => {
    setShowDiscard(false);
    store.reset();
    router.back();
  };

  const goToStep = (step: 1 | 2 | 3 | 4) => {
    store.setStep(step);
  };

  const handlePublish = async () => {
    if (store.latitude == null || store.longitude == null) return;

    try {
      await publishMutation.mutateAsync({
        latitude: store.latitude,
        longitude: store.longitude,
        firstName: store.firstName,
        lastName: store.lastName,
        birthDate: store.birthDate,
        deathDate: store.deathDate,
        cemeteryName: store.cemeteryName,
        cemeteryId: store.cemeteryId,
        plotInfo: store.plotInfo,
        relationship: store.relationship,
        photoUri: store.photoUri,
        inscription: store.inscription,
      });
      setShowSuccess(true);
    } catch (error) {
      Alert.alert('', t('addGrave.publishError'));
    }
  };

  const handleDone = () => {
    store.reset();
    router.replace('/(tabs)/graves');
  };

  if (showSuccess) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <SuccessInterstitial
          personName={`${store.firstName} ${store.lastName}`.trim()}
          onDone={handleDone}
          testID="success"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <WizardHeader
        step={store.currentStep}
        title={t('addGrave.wizardTitle')}
        onClose={handleClose}
        testID="wizard-header"
      />
      {store.currentStep === 1 && (
        <StepLocationPerson onNext={() => goToStep(2)} />
      )}
      {store.currentStep === 2 && (
        <StepDates onNext={() => goToStep(3)} onBack={() => goToStep(1)} />
      )}
      {store.currentStep === 3 && (
        <StepPhoto onNext={() => goToStep(4)} onBack={() => goToStep(2)} />
      )}
      {store.currentStep === 4 && (
        <StepReview
          onBack={() => goToStep(3)}
          onPublish={handlePublish}
          publishing={publishMutation.isPending}
        />
      )}

      <ConfirmModal
        visible={showDiscard}
        title={t('addGrave.leaveTitle')}
        message={t('addGrave.leaveMessage')}
        cancelLabel={t('common.cancel')}
        confirmLabel={t('addGrave.leave')}
        confirmVariant="destructive"
        confirmIcon="trash"
        onCancel={() => setShowDiscard(false)}
        onConfirm={handleDiscard}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
});
