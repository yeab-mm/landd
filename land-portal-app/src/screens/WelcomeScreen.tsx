import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  MainApp: undefined;
};

type WelcomeScreenProp = StackNavigationProp<RootStackParamList, 'Login'>;

export default function WelcomeScreen({ navigation }: { navigation: WelcomeScreenProp }) {
  return (
    <View className="flex-1">
      <StatusBar barStyle="light-content" backgroundColor="#125f43ff" />

      {/* Gradient Background - Fixed with expo-linear-gradient */}
      <LinearGradient
        colors={['#125f43ff', '#125f43ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="flex-1 justify-center p-6"
      >
        {/* Top Section - Icon and Title */}
        <View className="items-center mb-16">
          <View className="bg-white/20 rounded-3xl p-8 mb-12 shadow-2xl">
            <Ionicons name="home" size={100} color="#040706ff" />
          </View>
          <Text className="text-white text-3xl font-bold text-center mb-5">
            Digital Land Portal
          </Text>
          <Text className="text-white/90 text-center text-base">
            Secure • Verified • Official
          </Text>
        </View>

        {/* Bottom Section - Buttons */}
        <View className="w-full space-y-5 md-8 mb-1">
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            className="bg-white py-3 rounded-3xl items-center shadow-lg"
            activeOpacity={0.8}
          >
            <Text className="text-[#125f43ff] font-bold text-lg">Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            className="bg-white/20 border-2 border-white/20 py-3 rounded-3xl items-center mb-12"
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-lg">Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('MainApp')}
            className="py-1 items-center mt-12"
            activeOpacity={0.8}
          >
            <Text className="text-white/90 text-sm underline ">Continue as Guest</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="absolute bottom-8 left-0 right-0 items-center">
          <Text className="text-white/70 text-xs">
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}