import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';

import { useColors } from '@/hooks/useColors';
import { radius } from '@/constants/theme';

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
            style={[
              styles.cellText,
              {
                color: colors.foreground,
                // On Android, tintColor drives the cursor colour
                ...(Platform.OS === 'android' ? { cursorColor: colors.primary } : {}),
              },
            ]}
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
    overflow: 'hidden',
  },
  cellText: {
    // Fill the cell completely so RN centres the text naturally
    width: 68,
    height: 72,
    fontSize: 28,
    fontFamily: 'DMSans_700Bold',
    textAlign: 'center',
    textAlignVertical: 'center',
    // Strip all internal padding so the glyph is truly centred
    padding: 0,
    margin: 0,
    includeFontPadding: false,
    lineHeight: undefined,
  },
});
