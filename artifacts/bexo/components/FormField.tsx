import React, { forwardRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { useColors } from '@/hooks/useColors';
import { typography, radius } from '@/constants/theme';

type Props = TextInputProps & {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
};

export const FormField = forwardRef<TextInput, Props>(
  ({ label, error, hint, optional, style, ...rest }, ref) => {
    const colors = useColors();

    return (
      <View style={styles.wrapper}>
        <View style={styles.labelRow}>
          <Text style={[typography.label, { color: colors.mutedForeground }]}>
            {label.toUpperCase()}
          </Text>
          {optional ? (
            <Text style={[typography.caption, { color: colors.mutedForeground }]}>
              optional
            </Text>
          ) : null}
        </View>
        <TextInput
          ref={ref}
          style={[
            typography.bodyLg,
            styles.input,
            {
              backgroundColor: colors.surface,
              borderColor: error ? colors.destructive : colors.border,
              color: colors.foreground,
              borderRadius: radius.sm,
            },
            style,
          ]}
          placeholderTextColor={colors.mutedForeground}
          {...rest}
        />
        {error ? (
          <Text style={[typography.bodySm, { color: colors.destructive, marginTop: 4 }]}>
            {error}
          </Text>
        ) : hint ? (
          <Text style={[typography.bodySm, { color: colors.mutedForeground, marginTop: 4 }]}>
            {hint}
          </Text>
        ) : null}
      </View>
    );
  }
);

FormField.displayName = 'FormField';

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  input: {
    height: 52,
    borderWidth: 1.5,
    paddingHorizontal: 14,
  },
});
