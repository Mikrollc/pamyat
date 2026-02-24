import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Raduna',
  slug: 'raduna',
  owner: 'mikrollc0033',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'raduna',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    backgroundColor: '#1a5c54',
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.mikrollc.raduna',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSLocationWhenInUseUsageDescription:
        'Raduna uses your location to find nearby cemeteries and help you navigate to grave sites.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundImage: './assets/images/adaptive-icon-bg.png',
    },
    edgeToEdgeEnabled: true,
    package: 'com.mikrollc.raduna',
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-web-browser',
    'expo-router',
    [
      'expo-font',
      {
        fonts: [
          'node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome.ttf',
          './assets/fonts/CormorantGaramond-SemiBold.ttf',
          './assets/fonts/DMSans-Medium.ttf',
        ],
      },
    ],
    '@rnmapbox/maps',
    [
      '@sentry/react-native/expo',
      {
        organization: process.env.SENTRY_ORG,
        project: 'raduna',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'Raduna needs access to your photos to add memorial images.',
        cameraPermission: 'Raduna needs access to your camera to take memorial photos.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: '75cd9211-74ff-4352-bf10-bb65486d06f3',
    },
  },
});
