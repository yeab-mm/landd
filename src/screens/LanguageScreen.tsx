// File: src/screens/LanguageScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageScreen({ navigation }: any) {
  const { language, setLanguage, t } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState(language || 'en');

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'am', name: 'Amharic', flag: '🇪🇹' },
    { code: 'or', name: 'Afaan Oromo', flag: '🇪🇹' },
    { code: 'ti', name: 'Tigrinya', flag: '🇪🇹' },
  ];

  const handleContinue = () => {
    setLanguage(selectedLanguage);
    navigation.replace('Welcome');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView className="flex-1 px-6">
        <View className="pt-12 pb-8">
          <Text className="text-3xl font-bold text-gray-800 mb-2">
            {t('language.title')}
          </Text>
          <Text className="text-gray-600">
            {t('language.subtitle')}
          </Text>
        </View>

        <View className="space-y-3 mb-8">
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              className={`p-4 rounded-xl border-2 flex-row items-center ${
                selectedLanguage === lang.code
                  ? 'border-[#125f43ff] bg-[#125f43ff]/5'
                  : 'border-gray-200 bg-gray-50'
              }`}
              onPress={() => setSelectedLanguage(lang.code)}
            >
              <Text className="text-3xl mr-4">{lang.flag}</Text>
              <View className="flex-1">
                <Text className={`font-semibold ${
                  selectedLanguage === lang.code ? 'text-[#125f43ff]' : 'text-gray-800'
                }`}>
                  {lang.name}
                </Text>
              </View>
              {selectedLanguage === lang.code && (
                <Text className="text-[#125f43ff] text-2xl">✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          className="bg-[#125f43ff] py-4 rounded-xl items-center shadow-lg mb-4"
          onPress={handleContinue}
        >
          <Text className="text-white font-bold text-lg">{t('common.continue')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="py-3 items-center"
          onPress={handleContinue}
        >
          <Text className="text-gray-500">{t('common.skip')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}