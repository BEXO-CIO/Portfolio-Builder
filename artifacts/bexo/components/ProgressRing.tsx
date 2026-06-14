import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useColors } from '@/hooks/useColors';
import { typography } from '@/constants/theme';

type Props = {
  percent: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
};

export function ProgressRing({ percent, size = 72, strokeWidth = 5, showLabel = true }: Props) {
  const colors = useColors();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, percent));
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const color = progress >= 90 ? colors.success : progress >= 60 ? colors.warning : colors.accent;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      {showLabel ? (
        <Text style={[typography.label, styles.label, { color }]}>
          {Math.round(progress)}%
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center' },
  label: { fontFamily: 'DMSans_700Bold' },
});
