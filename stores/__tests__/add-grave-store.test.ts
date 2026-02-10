import { useAddGraveStore } from '../add-grave-store';

// Mock MMKV
jest.mock('react-native-mmkv', () => ({
  createMMKV: jest.fn(() => ({
    getString: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  })),
}));

describe('useAddGraveStore', () => {
  beforeEach(() => {
    useAddGraveStore.getState().reset();
  });

  it('starts with default values', () => {
    const state = useAddGraveStore.getState();
    expect(state.firstName).toBe('');
    expect(state.lastName).toBe('');
    expect(state.latitude).toBeNull();
    expect(state.longitude).toBeNull();
    expect(state.currentStep).toBe(1);
    expect(state.photoUri).toBeNull();
    expect(state.inscription).toBe('');
    expect(state.birthDate.year).toBeNull();
    expect(state.cemeteryId).toBeNull();
    expect(state.cemeteryName).toBe('');
  });

  it('sets location', () => {
    useAddGraveStore.getState().setLocation(40.7128, -74.006);
    const state = useAddGraveStore.getState();
    expect(state.latitude).toBe(40.7128);
    expect(state.longitude).toBe(-74.006);
  });

  it('sets first and last name', () => {
    useAddGraveStore.getState().setFirstName('Ivan');
    useAddGraveStore.getState().setLastName('Petrov');
    const state = useAddGraveStore.getState();
    expect(state.firstName).toBe('Ivan');
    expect(state.lastName).toBe('Petrov');
  });

  it('sets birth date partially', () => {
    useAddGraveStore.getState().setBirthDate({ year: 1935 });
    const state = useAddGraveStore.getState();
    expect(state.birthDate.year).toBe(1935);
    expect(state.birthDate.month).toBeNull();
    expect(state.birthDate.day).toBeNull();
  });

  it('sets death date partially', () => {
    useAddGraveStore.getState().setDeathDate({ year: 2020 });
    const state = useAddGraveStore.getState();
    expect(state.deathDate.year).toBe(2020);
    expect(state.deathDate.month).toBeNull();
  });

  it('sets step', () => {
    useAddGraveStore.getState().setStep(2);
    expect(useAddGraveStore.getState().currentStep).toBe(2);
  });

  it('sets photo uri', () => {
    useAddGraveStore.getState().setPhotoUri('file://photo.jpg');
    expect(useAddGraveStore.getState().photoUri).toBe('file://photo.jpg');
  });

  it('sets cemetery name and id', () => {
    useAddGraveStore.getState().setCemeteryName('Green-Wood');
    useAddGraveStore.getState().setCemeteryId('cem-123');
    const state = useAddGraveStore.getState();
    expect(state.cemeteryName).toBe('Green-Wood');
    expect(state.cemeteryId).toBe('cem-123');
  });

  it('resets all fields', () => {
    useAddGraveStore.getState().setFirstName('Ivan');
    useAddGraveStore.getState().setLocation(40, -74);
    useAddGraveStore.getState().setStep(3);
    useAddGraveStore.getState().setCemeteryName('Green-Wood');
    useAddGraveStore.getState().setCemeteryId('cem-123');
    useAddGraveStore.getState().reset();

    const state = useAddGraveStore.getState();
    expect(state.firstName).toBe('');
    expect(state.latitude).toBeNull();
    expect(state.currentStep).toBe(1);
    expect(state.cemeteryName).toBe('');
    expect(state.cemeteryId).toBeNull();
  });
});
