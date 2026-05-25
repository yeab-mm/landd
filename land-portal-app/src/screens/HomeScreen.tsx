import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// ✅ Type definitions - ADDED Notifications, RegistrationRequest & TrackRequest
type RootStackParamList = {
  Marketplace: undefined;
  Profile: undefined;
  TrackRequest: { referenceNumber?: string };
  RegistrationRequest: undefined;
  Notifications: undefined; // ✅ ADDED
};

// ✅ ADDED Notifications to navigation type
type HomeScreenProp = StackNavigationProp<RootStackParamList, 'Marketplace' | 'Profile' | 'TrackRequest' | 'RegistrationRequest' | 'Notifications'>;

export default function HomeScreen() {
  // ✅ Navigation hook inside component
  const navigation = useNavigation<HomeScreenProp>();

  // Row 1 - Available Services
  const servicesRow1 = [
    { title: 'Ownership Verification', desc: 'Check land authenticity', icon: 'shield-checkmark', navigate: 'VerificationRequest' },
    { title: 'Registration Request', desc: 'Apply for new registration', icon: 'document-attach', navigate: 'RegistrationRequest' },
    { title: 'Land Marketplace', desc: 'Browse land listings', icon: 'business', navigate: 'Marketplace' },
    { title: 'Information Lookup', desc: 'Search by plot/location', icon: 'search', navigate: null },
  ];

  // Row 2 - Additional Services
  const servicesRow2 = [
    { title: 'Ownership Transfer', desc: 'Request land transfer', icon: 'swap-horizontal', navigate: 'OwnershipTransfer' },
    { title: 'Public Statistics', desc: 'Explore land insights', icon: 'stats-chart', navigate: null },
    { title: 'Download Certificate', desc: 'Get ownership docs', icon: 'download', navigate: null },
    { title: 'Track Request', desc: 'Monitor application', icon: 'time', navigate: 'Notifications' },
  ];
  const recentActivities = [
    { title: 'Land Verification', desc: 'Plot #BDU-2024-001', date: '2 hours ago', status: 'Pending' },
    { title: 'Document Upload', desc: 'Ownership Certificate', date: 'Yesterday', status: 'Completed' },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#125f43ff" />

      {/* Header - Matching Onboarding Style */}
      <LinearGradient
        colors={['#125f43ff', '#125f43ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="px-6 pt-12 pb-6 rounded-b-3xl"
      >
        <View className="flex-row items-center justify-between mb-2">
          <View>
            <Text className="text-white/80 text-sm">Welcome,</Text>
            <Text className="text-white text-2xl font-bold">Abebe Gizaw</Text>
          </View>
          {/* ✅ Profile Icon with Navigation */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            className="bg-white/5 p-2 rounded-full"
            activeOpacity={0.7}
          >
            <Ionicons name="person" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Available Services - Row 1 */}
        <View className="py-6">
          <Text className="text-gray-800 text-lg font-bold mb-4">Available Services</Text>
          <View className="flex-row flex-wrap justify-between">
            {servicesRow1.map((action, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => action.navigate && navigation.navigate(action.navigate)}
                className="bg-white rounded-2xl p-4 w-[48%] mb-4 shadow-sm border border-gray-100"
                activeOpacity={0.8}
              >
                <View
                  className="rounded-xl p-3 mb-3 items-center"
                  style={{ backgroundColor: '#125f43ff20' }}
                >
                  <Ionicons name={action.icon as any} size={28} color="#125f43ff" />
                </View>
                <Text className="text-gray-800 font-bold text-sm text-center mb-1">{action.title}</Text>
                <Text className="text-gray-500 text-xs text-center">{action.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Available Services - Row 2 */}
          <View className="flex-row flex-wrap justify-between">
            {servicesRow2.map((action, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => action.navigate && navigation.navigate(action.navigate)}
                className="bg-white rounded-2xl p-4 w-[48%] mb-4 shadow-sm border border-gray-100"
                activeOpacity={0.8}
              >
                <View
                  className="rounded-xl p-3 mb-3 items-center"
                  style={{ backgroundColor: '#125f43ff20' }}
                >
                  <Ionicons name={action.icon as any} size={28} color="#125f43ff" />
                </View>
                <Text className="text-gray-800 font-bold text-sm text-center mb-1">{action.title}</Text>
                <Text className="text-gray-500 text-xs text-center">{action.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View className="pb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-800 text-lg font-bold">Recent Activity</Text>
            <TouchableOpacity>
              <Text className="text-[#125f43ff] text-sm font-semibold">View All</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {recentActivities.map((activity, index) => (
              <View
                key={index}
                className={`flex-row items-start p-4 ${index !== recentActivities.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <View className="bg-green-100 rounded-full p-2 mr-4 mt-1">
                  <Ionicons name="document-text" size={18} color="#125f43ff" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 font-bold text-base">{activity.title}</Text>
                  <Text className="text-gray-600 text-sm">{activity.desc}</Text>
                  <View className="flex-row items-center mt-2">
                    <Text className="text-gray-400 text-xs">{activity.date}</Text>
                    <View className={`px-2 py-0.5 rounded-full ml-3 ${activity.status === 'Completed' ? 'bg-green-100' : 'bg-yellow-100'
                      }`}>
                      <Text className={`text-xs font-medium ${activity.status === 'Completed' ? 'text-green-700' : 'text-yellow-700'
                        }`}>
                        {activity.status}
                      </Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            ))}
          </View>
        </View>

        {/* Quick Stats */}
        <View className="pb-8">
          <Text className="text-gray-800 text-lg font-bold mb-4">Overview</Text>
          <View className="flex-row justify-between">
            <View className="bg-white rounded-2xl p-4 flex-1 mr-2 shadow-sm border border-gray-100">
              <Text className="text-gray-500 text-xs mb-1">Total Lands</Text>
              <Text className="text-2xl font-bold text-[#125f43ff]">3</Text>
            </View>
            <View className="bg-white rounded-2xl p-4 flex-1 ml-2 shadow-sm border border-gray-100">
              <Text className="text-gray-500 text-xs mb-1">Pending</Text>
              <Text className="text-2xl font-bold text-yellow-600">1</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}