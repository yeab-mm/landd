import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { useLanguage } from '../context/LanguageContext';

type RootStackParamList = {
  Onboarding: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  OTPVerification: { phone?: string };
  ForgotPassword: undefined;
  TermsAndConditions: undefined;
};

type WelcomeScreenProp = StackNavigationProp<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: { navigation: WelcomeScreenProp }) {
  const { t } = useLanguage();

  return (
    <View className="flex-1">
      <StatusBar barStyle="light-content" backgroundColor="#125f43ff" />

      <LinearGradient
        colors={['#125f43ff', '#125f43ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="flex-1 justify-center p-6"
      >
        <View className="items-center mb-16">
          <View className="bg-white/20 rounded-3xl p-8 mb-12 shadow-2xl">
            <Ionicons name="home" size={100} color="#040706ff" />
          </View>
          <Text className="text-white text-3xl font-bold text-center mb-5">
            {t('welcome.title')}
          </Text>
          <Text className="text-white/90 text-center text-base">
            {t('welcome.subtitle')}
          </Text>
        </View>

        <View className="w-full space-y-5 mb-8">
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            className="bg-white py-3 rounded-3xl items-center shadow-lg"
            activeOpacity={0.8}
            accessibilityLabel="Sign in to your account"
          >
            <Text className="text-[#125f43ff] font-bold text-lg">
              {t('welcome.login')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            className="bg-white/20 border-2 border-white/20 py-3 rounded-3xl items-center"
            activeOpacity={0.8}
            accessibilityLabel="Create a new account"
          >
            <Text className="text-white font-bold text-lg">
              {t('welcome.register')}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}
