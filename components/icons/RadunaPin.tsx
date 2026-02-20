import Svg, { Path } from 'react-native-svg';

interface RadunaPinProps {
  size?: number;
  color?: string;
  heartColor?: string;
}

/**
 * App icon adapted as a map pin.
 * White pin silhouette with a heart inside, colored by props.
 */
export function RadunaPin({ size = 40, color = '#fff', heartColor = '#1a5c54' }: RadunaPinProps) {
  // Original viewBox: pin path fits within 44–156 x, 30–172 y → center at 100, span ~112x142
  return (
    <Svg width={size} height={size * 1.27} viewBox="40 26 120 154" fill="none">
      <Path
        d="M100 30 C68 30 44 56 44 88 C44 124 100 172 100 172 C100 172 156 124 156 88 C156 56 132 30 100 30Z"
        fill={color}
      />
      <Path
        d="M100 76 C100 76 82 62 74 72 C66 82 74 96 100 116 C126 96 134 82 126 72 C118 62 100 76 100 76Z"
        fill={heartColor}
      />
    </Svg>
  );
}

/**
 * Simplified icon version for tab bar — just the pin outline, no drop shadow.
 */
export function RadunaTabIcon({ size = 24, color = '#1a5c54' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size * 1.27} viewBox="40 26 120 154" fill="none">
      <Path
        d="M100 30 C68 30 44 56 44 88 C44 124 100 172 100 172 C100 172 156 124 156 88 C156 56 132 30 100 30Z"
        fill={color}
      />
      <Path
        d="M100 76 C100 76 82 62 74 72 C66 82 74 96 100 116 C126 96 134 82 126 72 C118 62 100 76 100 76Z"
        fill="#fff"
      />
    </Svg>
  );
}
