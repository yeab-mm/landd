import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../i18n/translations';

// Components
import { Button } from '../components/ui/Button';

// ✅ FIXED: Proper navigation types
type RootStackParamList = {
  Onboarding: undefined;
  Settings: undefined;        // ← This IS your Language screen
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  OTPVerification: { phone?: string };
  MainApp: undefined;
};

type SettingsScreenProp = StackNavigationProp<RootStackParamList, 'Settings'>;

export default function SettingsScreen() {
  const navigation = useNavigation<SettingsScreenProp>();
  const { language, setLanguage, t } = useLanguage();

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'am', name: 'አማርኛ (Amharic)', flag: '🇪🇹' },
  ];

  // ✅ FIXED: Navigate to Welcome after language selection (not MainApp)
  const handleSubmit = () => {
    Alert.alert(
      language === 'am' ? 'ተሳክቷል' : 'Success',
      language === 'am' 
        ? `ቋንቋ ወደ ${languages.find(l => l.code === language)?.name} ተቀይሯል` 
        : `Language set to ${languages.find(l => l.code === language)?.name}`,
      [
        {
          text: t('common.continue'),
          style: 'default',
          onPress: () => {
            // ✅ Navigate to Welcome screen after language selection
            navigation.replace('Welcome');
          }
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#125f43ff" />

      {/* Header with Gradient */}
      <LinearGradient
        colors={['#125f43ff', '#125f43ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="px-6 pt-8 pb-8 rounded-b-3xl"
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mb-6 w-10 h-10 rounded-full bg-white/10 items-center justify-center"
          activeOpacity={0.7}
          accessibilityLabel="Go back to previous screen"
        >
          <Ionicons name="arrow-back" size={18} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold mb-2">
          {language === 'am' ? 'ቋንቋ ይምረጡ' : 'Select Language'}
        </Text>
        <Text className="text-white/80 text-sm">
          {language === 'am' ? 'የሚመርጡትን ቋንቋ ይምረጡ' : 'Choose your preferred language'}
        </Text>
      </LinearGradient>

      {/* Language Options */}
      <View className="flex-1 px-6 py-8">
        <Text className="text-gray-800 text-lg font-bold mb-6">
          {language === 'am' ? 'የሚገኙ ቋንቋዎች' : 'Available Languages'}
        </Text>

        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {languages.map((lang, index) => (
            <TouchableOpacity
              key={lang.code}
              onPress={() => setLanguage(lang.code)}
              className={`flex-row items-center p-4 ${index !== languages.length - 1 ? 'border-b border-gray-100' : ''}`}
              activeOpacity={0.7}
              accessibilityLabel={`Select ${lang.name} language`}
              accessibilityState={{ selected: language === lang.code }}
            >
              <Text className="text-3xl mr-4">{lang.flag}</Text>
              <View className="flex-1">
                <Text className="text-gray-800 font-bold text-base">{lang.name}</Text>
              </View>
              {language === lang.code && (
                <View className="bg-green-100 rounded-full p-2">
                  <Ionicons name="checkmark-circle" size={24} color="#125f43ff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Box */}
        <View className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#2563EB" />
            <Text className="text-blue-700 text-sm ml-2 flex-1">
              {language === 'am' 
                ? 'ቋንቋዎን በማንኛውም ጊዜ በቅንብሮች ውስጥ መቀየር ይችላሉ::' 
                : 'You can change your language preference anytime in the Settings menu.'}
            </Text>
          </View>
        </View>

        {/* Continue Button */}
        <Button
          title={language === 'am' ? 'ቀጥል' : 'Continue'}
          onPress={handleSubmit}
          className="mt-8"
          accessibilityLabel="Continue with selected language"
        />

        {/* App Info */}
        <View className="mt-8 items-center">
          <Text className="text-gray-400 text-xs">Digital Land Portal v1.0</Text>
          <Text className="text-gray-400 text-xs mt-1">Bahir Dar University Project</Text>
        </View>
      </View>
    </View>
  );
}