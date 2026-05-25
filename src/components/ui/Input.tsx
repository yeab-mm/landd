import React from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  helperText?: string;
  isPassword?: boolean;
  required?: boolean;
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  icon,
  error,
  helperText,
  isPassword = false,
  required = false,
  className = '',
  containerClassName = '',
  labelClassName = '',
  inputClassName = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && (
        <Text className={`text-gray-700 text-sm font-semibold mb-2 ml-1 ${labelClassName}`}>
          {label} {required && <Text className="text-red-500">*</Text>}
        </Text>
      )}
      <View
        className={`flex-row items-center rounded-xl px-4 py-1 border ${
          error ? 'border-red-400' : 'border-gray-200'
        } ${className.includes('bg-') ? '' : 'bg-gray-50'} ${className}`}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={22}
            color={error ? '#EF4444' : '#9CA3AF'}
          />
        )}
        <TextInput
          className={`flex-1 text-base ml-3 py-3 ${inputClassName.includes('text-') ? '' : 'text-gray-800'} ${inputClassName}`}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize="none"
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="ml-2"
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        )}
      </View>
      {error ? (
        <Text className="text-red-500 text-xs mt-1 ml-1">{error}</Text>
      ) : helperText ? (
        <Text className="text-gray-500 text-xs mt-1 ml-1">{helperText}</Text>
      ) : null}
    </View>
  );
};
