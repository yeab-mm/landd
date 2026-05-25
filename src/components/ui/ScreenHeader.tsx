import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  rightElement?: React.ReactNode;
  onBackPress?: () => void;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  rightElement,
  onBackPress,
}) => {
  const navigation = useNavigation();

  return (
    <LinearGradient
      colors={['#125f43', '#1a7f5a']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      className="px-6 pt-12 pb-6 rounded-b-3xl"
    >
      <StatusBar barStyle="light-content" backgroundColor="#125f43" />
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          {showBackButton && (
            <TouchableOpacity
              onPress={onBackPress || (() => navigation.goBack())}
              className="mr-4 w-10 h-10 rounded-full bg-white/10 items-center justify-center"
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
          )}
          <View className="flex-1">
            <Text className="text-white text-2xl font-bold">{title}</Text>
            {subtitle && (
              <Text className="text-white/80 text-sm mt-0.5">{subtitle}</Text>
            )}
          </View>
        </View>
        {rightElement}
      </View>
    </LinearGradient>
  );
};
