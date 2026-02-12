import { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  runOnJS,
  Easing,
  FadeIn,
  ZoomIn,
} from 'react-native-reanimated';
import Svg, { Rect, Path, Line, Defs, RadialGradient, Stop, Ellipse } from 'react-native-svg';
import { colors } from '@/constants/tokens';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface SplashOverlayProps {
  onComplete: () => void;
}

// Icon matching design: rounded rect bg + white pin + green heart
function SplashIcon() {
  return (
    <Svg width={96} height={96} viewBox="0 0 200 200" fill="none">
      <Rect width={200} height={200} rx={44} fill="rgba(255,255,255,0.08)" />
      <Path
        d="M100 30 C68 30 44 56 44 88 C44 124 100 172 100 172 C100 172 156 124 156 88 C156 56 132 30 100 30Z"
        fill="#fff"
        opacity={0.95}
      />
      <Path
        d="M100 76 C100 76 82 62 74 72 C66 82 74 96 100 116 C126 96 134 82 126 72 C118 62 100 76 100 76Z"
        fill="#1a5c54"
      />
    </Svg>
  );
}

// Grid matching design pixel positions (390x844 viewport)
function CartographicGrid() {
  const hLines = [120, 200, 280, 360, 440, 520, 600, 680, 760];
  const vLines = [60, 130, 195, 260, 330];

  return (
    <Svg width={SCREEN_W} height={SCREEN_H} style={StyleSheet.absoluteFill}>
      {hLines.map((y) => {
        const scaledY = (y / 844) * SCREEN_H;
        return (
          <Line
            key={`h-${y}`}
            x1={0}
            y1={scaledY}
            x2={SCREEN_W}
            y2={scaledY}
            stroke="rgba(255,255,255,0.025)"
            strokeWidth={0.5}
          />
        );
      })}
      {vLines.map((x) => {
        const scaledX = (x / 390) * SCREEN_W;
        return (
          <Line
            key={`v-${x}`}
            x1={scaledX}
            y1={0}
            x2={scaledX}
            y2={SCREEN_H}
            stroke="rgba(255,255,255,0.025)"
            strokeWidth={0.5}
          />
        );
      })}
    </Svg>
  );
}

// Radial glow matching design: radial gradient ellipse, 400x400
function GlowEffect() {
  return (
    <Svg
      width={400}
      height={400}
      style={styles.glowSvg}
    >
      <Defs>
        <RadialGradient id="glow" cx="50%" cy="50%" rx="50%" ry="50%">
          <Stop offset="0" stopColor="#fff" stopOpacity={0.07} />
          <Stop offset="0.65" stopColor="#fff" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Ellipse cx={200} cy={200} rx={200} ry={200} fill="url(#glow)" />
    </Svg>
  );
}

function LoadingDot({ index }: { index: number }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withDelay(
      1500 + index * 200,
      withRepeat(
        withSequence(
          withTiming(1.4, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + (scale.value - 1) * 1.75,
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

export default function SplashOverlay({ onComplete }: SplashOverlayProps) {
  const overlayOpacity = useSharedValue(1);

  useEffect(() => {
    overlayOpacity.value = withDelay(
      3500,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) }, () => {
        runOnJS(onComplete)();
      }),
    );
  }, []);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  // Glow breathing: design pulses between scale 1 and 1.15, opacity 1 and 0.6
  const glowScale = useSharedValue(1);
  const glowOpacity = useSharedValue(1);
  useEffect(() => {
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  return (
    <Animated.View style={[styles.overlay, overlayStyle]}>
      <View style={styles.background} />

      {/* Radial glow */}
      <Animated.View style={[styles.glowContainer, glowStyle]}>
        <GlowEffect />
      </Animated.View>

      {/* Cartographic grid */}
      <Animated.View
        entering={FadeIn.delay(800).duration(1500)}
        style={StyleSheet.absoluteFill}
      >
        <CartographicGrid />
      </Animated.View>

      {/* Content */}
      <View style={styles.content}>
        <Animated.View
          entering={ZoomIn.delay(300).duration(900).springify()}
          style={styles.iconWrap}
        >
          <SplashIcon />
        </Animated.View>

        <Animated.Text
          entering={FadeIn.delay(700).duration(700)}
          style={styles.wordmark}
        >
          Raduna
        </Animated.Text>

        <Animated.Text
          entering={FadeIn.delay(950).duration(700)}
          style={styles.tagline}
        >
          Grave Care Registry
        </Animated.Text>
      </View>

      {/* Loading dots — absolute positioned */}
      <Animated.View
        entering={FadeIn.delay(1300).duration(500)}
        style={styles.loaderContainer}
      >
        {[0, 1, 2].map((i) => (
          <LoadingDot key={i} index={i} />
        ))}
      </Animated.View>

      {/* Bottom text */}
      <Animated.Text
        entering={FadeIn.delay(1500).duration(500)}
        style={styles.bottomText}
      >
        радуна • care
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.splash.gradientMid,
  },
  glowContainer: {
    position: 'absolute',
    top: '35%',
    left: '50%',
    marginLeft: -200,
    marginTop: -200,
  },
  glowSvg: {
    width: 400,
    height: 400,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    marginBottom: 28,
  },
  wordmark: {
    fontFamily: 'CormorantGaramond-SemiBold',
    fontSize: 42,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 3,
    marginBottom: 8,
  },
  tagline: {
    fontFamily: 'DMSans-Medium',
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  bottomText: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    fontFamily: 'DMSans-Medium',
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.15)',
    letterSpacing: 0.5,
  },
});
