import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
  noShadow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  noShadow = false,
  ...props
}) => {
  return (
    <View
      className={`bg-white rounded-2xl p-4 border border-gray-100 ${
        noShadow ? '' : 'shadow-sm'
      } ${className}`}
      {...props}
    >
      {children}
    </View>
  );
};
