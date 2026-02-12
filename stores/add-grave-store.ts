import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from './mmkv';

export interface PartialDate {
  year: number | null;
  month: number | null;
  day: number | null;
}

const emptyDate: PartialDate = { year: null, month: null, day: null };

interface AddGraveState {
  // Step 1: Location + Person
  latitude: number | null;
  longitude: number | null;
  pinConfirmed: boolean;
  firstName: string;
  lastName: string;
  birthDate: PartialDate;
  deathDate: PartialDate;
  cemeteryName: string;
  cemeteryId: string | null;

  // Step 1b: Dates & Details
  plotInfo: string;
  relationship: string | null;

  // Step 2: Photo
  photoUri: string | null;

  // Step 3: Review
  inscription: string;

  // Navigation
  currentStep: 1 | 2 | 3 | 4;

  // Actions
  setLocation: (lat: number, lng: number, confirmed?: boolean) => void;
  setFirstName: (name: string) => void;
  setLastName: (name: string) => void;
  setBirthDate: (date: Partial<PartialDate>) => void;
  setDeathDate: (date: Partial<PartialDate>) => void;
  setCemeteryName: (name: string) => void;
  setCemeteryId: (id: string | null) => void;
  setPlotInfo: (text: string) => void;
  setRelationship: (rel: string | null) => void;
  setPhotoUri: (uri: string | null) => void;
  setInscription: (text: string) => void;
  setStep: (step: 1 | 2 | 3 | 4) => void;
  reset: () => void;
}

const initialState = {
  latitude: null as number | null,
  longitude: null as number | null,
  pinConfirmed: false,
  firstName: '',
  lastName: '',
  birthDate: { ...emptyDate },
  deathDate: { ...emptyDate },
  cemeteryName: '',
  cemeteryId: null as string | null,
  plotInfo: '',
  relationship: null as string | null,
  photoUri: null as string | null,
  inscription: '',
  currentStep: 1 as const,
};

export const useAddGraveStore = create<AddGraveState>()(
  persist(
    (set) => ({
      ...initialState,
      setLocation: (lat, lng, confirmed) => set({ latitude: lat, longitude: lng, pinConfirmed: confirmed ?? false }),
      setFirstName: (name) => set({ firstName: name }),
      setLastName: (name) => set({ lastName: name }),
      setBirthDate: (date) =>
        set((state) => ({ birthDate: { ...state.birthDate, ...date } })),
      setDeathDate: (date) =>
        set((state) => ({ deathDate: { ...state.deathDate, ...date } })),
      setCemeteryName: (name) => set({ cemeteryName: name }),
      setCemeteryId: (id) => set({ cemeteryId: id }),
      setPlotInfo: (text) => set({ plotInfo: text }),
      setRelationship: (rel) => set({ relationship: rel }),
      setPhotoUri: (uri) => set({ photoUri: uri }),
      setInscription: (text) => set({ inscription: text }),
      setStep: (step) => set({ currentStep: step }),
      reset: () => set({ ...initialState, birthDate: { ...emptyDate }, deathDate: { ...emptyDate } }),
    }),
    {
      name: 'add-grave-draft',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        latitude: state.latitude,
        longitude: state.longitude,
        pinConfirmed: state.pinConfirmed,
        firstName: state.firstName,
        lastName: state.lastName,
        birthDate: state.birthDate,
        deathDate: state.deathDate,
        cemeteryName: state.cemeteryName,
        cemeteryId: state.cemeteryId,
        plotInfo: state.plotInfo,
        relationship: state.relationship,
        photoUri: state.photoUri,
        inscription: state.inscription,
        currentStep: state.currentStep,
      }),
    },
  ),
);
