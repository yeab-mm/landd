import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Login: undefined;
  MainApp: undefined;
};

type ProfileScreenProp = StackNavigationProp<RootStackParamList, 'Login'>;

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenProp>();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => navigation.navigate('Login') },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="p-6 pt-12 items-center"
        style={{ backgroundColor: '#125f43ff' }}>
        <View className="bg-white p-4 rounded-full mb-3">
          <Ionicons name="person" size={40} color="#125f43ff" />
        </View>
        <Text className="text-white text-xl font-bold">Abebe Gizaw</Text>
        <Text className="text-white/80 text-sm">0911234567</Text>
      </View>

      {/* Menu Items */}
      <View className="p-4 ">
        <View className="bg-white rounded-lg shadow-md overflow-hidden">
          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <Ionicons name="file-tray-full" size={24} color="#125f43ff" />
            <Text className="text-gray-700 text-base font-semibold flex-1 ml-4">My Lands</Text>
            <Text className="text-gray-400">›</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <Ionicons name="shield-checkmark" size={24} color="#125f43ff" />
            <Text className="text-gray-700 text-base font-semibold flex-1 ml-4">Verification Status</Text>
            <Text className="text-gray-400">›</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <Ionicons name="settings" size={24} color="#125f43ff" />
            <Text className="text-gray-700 text-base font-semibold flex-1 ml-4">Settings</Text>
            <Text className="text-gray-400">›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-white p-4 rounded-lg shadow-md mt-6 flex-row items-center justify-center border border-red-200"
        >
          <Ionicons name="log-out" size={20} color="#EF4444" />
          <Text className="text-red-500 font-bold text-base ml-2">Logout</Text>
        </TouchableOpacity>

        <View className="mt-8 items-center">
          <Text className="text-gray-400 text-xs">Digital Land Portal v1.0</Text>
          <Text className="text-gray-400 text-xs">Bahir Dar University Project</Text>
        </View>
      </View>
    </ScrollView>
  );
}