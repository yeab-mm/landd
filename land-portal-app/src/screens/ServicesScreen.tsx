import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Services: undefined;
  Login: undefined;
};

type ServicesScreenProp = StackNavigationProp<RootStackParamList, 'Login'>;

const services = [
  {
    title: 'Land Ownership Verification',
    desc: 'Check land authenticity and ownership details',
    icon: 'document-text',
    loginRequired: true,
  },
  {
    title: 'Land Registration Request',
    desc: 'Apply for new land registration',
    icon: 'clipboard',
    loginRequired: true,
  },
  {
    title: 'Land Marketplace',
    desc: 'View land listings and ownership transfer',
    icon: 'business',
    loginRequired: true,
  },
  {
    title: 'Land Information Lookup',
    desc: 'Search land data by plot or location',
    icon: 'search',
    loginRequired: true,
  },
  {
    title: 'Public Land Statistics',
    desc: 'Explore official land-related insights',
    icon: 'stats-chart',
    loginRequired: false,
  },
];

export default function ServicesScreen() {
  const navigation = useNavigation<ServicesScreenProp>();

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary p-6 pt-12">
        <Text className="text-white text-2xl font-bold mb-2">Available Services</Text>
        <Text className="text-white/80 text-sm">Browse public services</Text>
      </View>

      {/* Services List */}
      <ScrollView className="flex-1 p-4">
        {services.map((service, index) => (
          <TouchableOpacity
            key={index}
            className="bg-white rounded-lg shadow-md p-4 mb-4 flex-row items-center"
          >
            <View className="bg-green-100 rounded-lg p-3 mr-4">
              <Ionicons name={service.icon as any} size={24} color="#2E7D32" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-bold text-base mb-1">{service.title}</Text>
              <Text className="text-gray-600 text-sm">{service.desc}</Text>
              {service.loginRequired && (
                <View className="flex-row items-center mt-2">
                  <Ionicons name="lock-closed" size={12} color="#6B7280" />
                  <Text className="text-gray-500 text-xs ml-1">Login required</Text>
                </View>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}

        {/* Login Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          className="bg-primary py-4 rounded-lg mt-4 items-center shadow-md"
        >
          <Text className="text-white font-bold text-base">Login to Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}