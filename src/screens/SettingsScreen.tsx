import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Settings: undefined;
  Welcome: undefined;
};

type SettingsScreenProp = StackNavigationProp<RootStackParamList, 'Welcome'>;

export default function SettingsScreen() {
  const navigation = useNavigation<SettingsScreenProp>();
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'am', name: 'አማርኛ (Amharic)', flag: '🇪🇹' },
    { code: 'or', name: 'Afaan Oromo', flag: '🇪🇹' },
    { code: 'ti', name: 'ትግርኛ (Tigrinya)', flag: '🇪🇹' },
  ];

  const handleSubmit = () => {
    Alert.alert(
      'Success',
      `Language set to ${languages.find(l => l.code === selectedLanguage)?.name}`,
      [
        {
          text: 'Continue',
          style: 'default',
          onPress: () => {
            console.log('🚀 Navigating to Welcome...');
            navigation.navigate('Welcome');
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
          className="mb-6 w-10 h-10 rounded-full bg-white/5 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={18} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold mb-2">Select Language</Text>
        <Text className="text-white/80 text-sm">Choose your preferred language</Text>
      </LinearGradient>

      {/* Language Options */}
      <View className="flex-1 px-6 py-8">
        <Text className="text-gray-800 text-lg font-bold mb-6">Available Languages</Text>

        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {languages.map((lang, index) => (
            <TouchableOpacity
              key={lang.code}
              onPress={() => setSelectedLanguage(lang.code)}
              className={`flex-row items-center p-4 ${index !== languages.length - 1 ? 'border-b border-gray-100' : ''}`}
              activeOpacity={0.7}
            >
              <Text className="text-3xl mr-4">{lang.flag}</Text>
              <View className="flex-1">
                <Text className="text-gray-800 font-bold text-base">{lang.name}</Text>
              </View>
              {selectedLanguage === lang.code && (
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
              You can change your language preference anytime in the Settings menu.
            </Text>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          className="bg-[#125f43ff] py-4 rounded-2xl items-center shadow-lg mt-8"
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-lg">Continue</Text>
        </TouchableOpacity>

        {/* App Info */}
        <View className="mt-8 items-center">
          <Text className="text-gray-400 text-xs">Digital Land Portal v1.0</Text>
          <Text className="text-gray-400 text-xs mt-1">Bahir Dar University Project</Text>
        </View>
      </View>
    </View>
  );
}