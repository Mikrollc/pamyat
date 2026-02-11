import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'pamyat',
  slug: 'pamyat',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'pamyat',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#1a5c54',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.mikrollc.pamyat',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundImage: './assets/images/adaptive-icon-bg.png',
    },
    edgeToEdgeEnabled: true,
    package: 'com.mikrollc.pamyat',
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-font',
      {
        fonts: [
          'node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome.ttf',
        ],
      },
    ],
    '@rnmapbox/maps',
    [
      'expo-image-picker',
      {
        photosPermission: 'Pamyat needs access to your photos to add memorial images.',
        cameraPermission: 'Pamyat needs access to your camera to take memorial photos.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: 'df5bad0a-03e0-4aa0-ae9a-20e2d84cbe54',
    },
  },
});
