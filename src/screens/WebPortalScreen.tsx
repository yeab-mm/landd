import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

const WEB_PORTAL_URL = 'http://localhost:5173';

export default function WebPortalScreen() {
  const { user, logout } = useAuth();
  const role = (user?.role || '').toLowerCase();
  const title = role === 'admin' ? 'Admin Control Panel' : 'Land Officer Portal';

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#125f43" />
      <LinearGradient colors={['#125f43', '#0d4a35']} className="px-6 pt-14 pb-10 rounded-b-[32px]">
        <Text className="text-white/80 text-sm">Staff access</Text>
        <Text className="text-white text-2xl font-bold mt-1">{title}</Text>
      </LinearGradient>

      <View className="flex-1 px-6 pt-8">
        <View className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <Ionicons name="desktop-outline" size={48} color="#125f43" style={{ alignSelf: 'center', marginBottom: 16 }} />
          <Text className="text-gray-900 text-lg font-bold text-center mb-2">
            Use the web portal
          </Text>
          <Text className="text-gray-600 text-sm text-center leading-6 mb-4">
            Officer and Admin tools run in the Land Systems website (verification queue, document
            validation, user management). The mobile app is for citizens only.
          </Text>
          <Text className="text-gray-500 text-xs text-center mb-6">
            Signed in as {user?.fullName} ({user?.role})
          </Text>

          <TouchableOpacity
            onPress={() => Linking.openURL(WEB_PORTAL_URL).catch(() => {})}
            className="bg-[#125f43] py-3.5 rounded-xl items-center mb-3"
          >
            <Text className="text-white font-bold">Open web portal</Text>
          </TouchableOpacity>

          <Text className="text-center text-gray-400 text-xs mb-6">{WEB_PORTAL_URL}</Text>

          <TouchableOpacity
            onPress={logout}
            className="py-3 rounded-xl items-center border border-red-200 bg-red-50"
          >
            <Text className="text-red-600 font-bold">Sign out</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-gray-400 text-xs text-center mt-6 px-4">
          Start the portal: cd land-systems → npm run dev → open the URL in your browser.
        </Text>
      </View>
    </View>
  );
}
