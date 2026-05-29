import React from 'react';
import { View, ViewProps } from 'react-native';

/** Root screen wrapper — ensures flex layout even if NativeWind className is inactive */
export function Screen({ style, className, children, ...props }: ViewProps & { className?: string }) {
  return (
    <View className={className} style={[{ flex: 1 }, style]} {...props}>
      {children}
    </View>
  );
}
