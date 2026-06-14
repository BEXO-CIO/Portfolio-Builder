import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useColors } from '@/hooks/useColors';
import { typography, radius } from '@/constants/theme';

const CODE_LENGTH = 4;

type Props = {
  onComplete: (code: string) => void;
  disabled?: boolean;
  error?: boolean;
};

export function OTPInput({ onComplete, disabled, error }: Props) {
  const colors = useColors();
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [focused, setFocused] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);

    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocused(index + 1);
    }

    const full = next.join('');
    if (full.length === CODE_LENGTH && !full.includes('')) {
      onComplete(full);
    }
  };

  const handleKeyPress = (e: { nativeEvent: { key: string } }, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocused(index - 1);
      const next = [...code];
      next[index - 1] = '';
      setCode(next);
    }
  };

  return (
    <View style={styles.row}>
      {Array.from({ length: CODE_LENGTH }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.cell,
            {
              backgroundColor: colors.surface,
              borderColor: error
                ? colors.destructive
                : focused === i
                ? colors.primary
                : colors.border,
              borderRadius: radius.sm,
            },
          ]}
        >
          <TextInput
            ref={(r) => { inputRefs.current[i] = r; }}
            style={[typography.h2, styles.cellText, { color: colors.foreground }]}
            value={code[i]}
            onChangeText={(t) => handleChange(t, i)}
            onKeyPress={(e) => handleKeyPress(e, i)}
            onFocus={() => setFocused(i)}
            keyboardType="number-pad"
            maxLength={1}
            editable={!disabled}
            selectTextOnFocus
            textAlign="center"
          />
          {code[i] ? null : (
            <Text style={[styles.cursor, { color: focused === i ? colors.primary : colors.border }]}>
              |
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  cell: {
    width: 68,
    height: 72,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: { textAlign: 'center', fontSize: 28 },
  cursor: {
    position: 'absolute',
    fontSize: 28,
    fontWeight: '300',
  },
});
