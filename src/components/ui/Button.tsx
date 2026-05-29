import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  TouchableOpacityProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'white';
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  className?: string; // Standardize for NativeWind
  textClassName?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  textClassName = '',
  disabled,
  style,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary';
      case 'secondary':
        return 'bg-secondary';
      case 'outline':
        return 'bg-transparent border border-primary';
      case 'ghost':
        return 'bg-transparent';
      case 'white':
        return 'bg-white';
      default:
        return 'bg-primary';
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return 'text-white';
      case 'outline':
      case 'ghost':
        return 'text-primary';
      case 'white':
        return 'text-primary';
      default:
        return 'text-white';
    }
  };

  return (
    <TouchableOpacity
      className={`py-4 rounded-2xl items-center flex-row justify-center ${
        disabled || loading ? 'bg-gray-300 shadow-none' : getVariantStyles()
      } ${
        disabled || loading ? 'opacity-50' : ''
      } ${className}`}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        !(disabled || loading) && variant === 'primary'
          ? {
              shadowColor: '#125f43',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }
          : undefined,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'white' || variant === 'primary' ? '#125f43ff' : 'white'}
        />
      ) : (
        <View className="flex-row items-center justify-center">
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={20}
              color={variant === 'white' || variant === 'outline' || variant === 'ghost' ? '#125f43ff' : 'white'}
              className="mr-2"
            />
          )}
          <Text
            className={`${getTextColor()} font-bold text-lg ${textClassName}`}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={20}
              color={variant === 'white' || variant === 'outline' || variant === 'ghost' ? '#125f43ff' : 'white'}
              className="ml-2"
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};
