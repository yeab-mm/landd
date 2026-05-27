// File: src/screens/HomeScreen.tsx
// Purpose: EXACT replica of reference HomeScreen with dynamic backend data

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../api/config';
import { isPendingStatus } from '../api/requests';
import { useUnreadNotifications } from '../hooks/useUnreadNotifications';

export default function HomeScreen({ navigation }: any) {
  const { user, token, refreshUser } = useAuth();
  
  // Backend State
  const [profile, setProfile] = useState<any>(null);
  const [lands, setLands] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalLands: 0, pendingRequests: 0, unreadNotifications: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { refreshUnread } = useUnreadNotifications(0);

  const fetchHomeData = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      // Fetch profile
      const pRes = await fetch(`${API_URL}/user/me`, { headers: { Authorization: `Bearer ${token}` } });
      const pData = await pRes.json();
      if (pRes.ok) {
        setProfile(pData.user);
        if (pData.user?.stats) {
          setStats((prev) => ({
            ...prev,
            totalLands: pData.user.stats.totalLands ?? prev.totalLands,
            pendingRequests: pData.user.stats.pendingRequests ?? prev.pendingRequests,
            unreadNotifications: pData.user.stats.unreadNotifications ?? 0,
          }));
        }
      }

      // Fetch lands
      const lRes = await fetch(`${API_URL}/lands`, { headers: { Authorization: `Bearer ${token}` } });
      const lData = await lRes.json();
      if (lRes.ok) setLands(lData.lands || []);

      // Fetch requests
      const rRes = await fetch(`${API_URL}/requests`, { headers: { Authorization: `Bearer ${token}` } });
      const rData = await rRes.json();
      const userRequests = rData.requests || [];
      if (rRes.ok) setRequests(userRequests);

      // Stats
      setStats((prev) => ({
        ...prev,
        totalLands: (lData.lands || []).length,
        pendingRequests: userRequests.filter((r: any) => isPendingStatus(r.status)).length,
      }));
      refreshUnread();
    } catch (error) {
      console.error('Home data error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, [token]);

  const onRefresh = () => {
    setRefreshing(true);
    refreshUser();
    fetchHomeData();
  };

  // Row 1 - Available Services
  const servicesRow1 = [
    { title: 'Ownership Verification', desc: 'Check land authenticity', icon: 'shield-checkmark', navigate: 'VerificationRequest' },
    { title: 'Registration Request', desc: 'Apply for new registration', icon: 'document-attach', navigate: 'RegistrationRequest' },
    { title: 'Land Marketplace', desc: 'Browse land listings', icon: 'business', navigate: 'Marketplace' },
    { title: 'Information Lookup', desc: 'Search by plot/location', icon: 'search', navigate: 'TrackRequest' },
  ];

  // Row 2 - Additional Services
  const servicesRow2 = [
    { title: 'Ownership Transfer', desc: 'Request land transfer', icon: 'swap-horizontal', navigate: 'OwnershipTransfer' },
    { title: 'Public Statistics', desc: 'Explore land insights', icon: 'stats-chart', navigate: 'MyRequests' },
    { title: 'My Documents', desc: 'View uploaded documents', icon: 'folder', navigate: 'MyDocuments' },
    { title: 'Track Request', desc: 'Monitor application', icon: 'time', navigate: 'MyRequests' },
  ];

  const displayName = profile?.fullName || user?.fullName || 'User';

  if (loading && !profile && !user?.fullName) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#125f43" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#125f43" />

      {/* Header */}
      <LinearGradient
        colors={['#125f43', '#125f43']}
        className="px-6 pt-16 pb-6 rounded-b-8xl"
      >
        <View className="flex-row items-center justify-between mb-2">
          <View>
            <Text className="text-white/80 text-sm">Welcome,</Text>
            <Text className="text-white text-2xl font-bold">{displayName}</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            className="bg-white/5 p-2 rounded-full"
            activeOpacity={0.7}
          >
            <Ionicons name="person" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        className="flex-1 px-6" 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} color="#125f43" />}
      >
        {stats.unreadNotifications > 0 && (
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            className="mt-4 bg-green-50 border border-green-200 rounded-2xl p-4 flex-row items-center"
            activeOpacity={0.85}
          >
            <View className="bg-green-100 rounded-full p-2 mr-3">
              <Ionicons name="notifications" size={22} color="#125f43" />
            </View>
            <View className="flex-1">
              <Text className="text-[#125f43] font-bold text-sm">You have new updates</Text>
              <Text className="text-gray-600 text-xs mt-0.5">
                {stats.unreadNotifications} unread — tap to see approvals and status changes
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#125f43" />
          </TouchableOpacity>
        )}

        {/* Available Services - Row 1 */}
        <View className="py-6">
          <Text className="text-gray-800 text-lg font-bold mb-4">Available Services</Text>
          <View className="flex-row flex-wrap justify-between">
            {servicesRow1.map((action, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  if (action.navigate) navigation.navigate(action.navigate);
                  else Alert.alert(action.title, 'This service is coming soon.');
                }}
                className="bg-white rounded-2xl p-4 w-[48%] mb-4 shadow-sm border border-gray-100"
                activeOpacity={0.8}
              >
                <View
                  className="rounded-xl p-3 mb-3 items-center"
                  style={{ backgroundColor: '#125f4320' }}
                >
                  <Ionicons name={action.icon as any} size={28} color="#125f43" />
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
                onPress={() => {
                  if (action.navigate) navigation.navigate(action.navigate);
                  else Alert.alert(action.title, 'This service is coming soon.');
                }}
                className="bg-white rounded-2xl p-4 w-[48%] mb-4 shadow-sm border border-gray-100"
                activeOpacity={0.8}
              >
                <View
                  className="rounded-xl p-3 mb-3 items-center"
                  style={{ backgroundColor: '#125f4320' }}
                >
                  <Ionicons name={action.icon as any} size={28} color="#125f43" />
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
            <TouchableOpacity onPress={() => navigation.navigate('MyRequests')}>
              <Text className="text-[#125f43] text-sm font-semibold">View All</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {requests.length === 0 ? (
              <View className="p-8 items-center">
                <Ionicons name="document-text-outline" size={40} color="#e5e7eb" />
                <Text className="text-gray-400 text-sm mt-2">No recent activity</Text>
              </View>
            ) : (
              requests.slice(0, 3).map((activity, index) => (
                <TouchableOpacity
                  key={activity.id}
                  onPress={() => navigation.navigate('RequestDetail', { referenceNumber: activity.referenceNumber, requestId: activity.id })}
                  className={`flex-row items-start p-4 ${index !== requests.slice(0, 3).length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <View className="bg-green-100 rounded-full p-2 mr-4 mt-1">
                    <Ionicons name="document-text" size={18} color="#125f43" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-800 font-bold text-base">{activity.type}</Text>
                    <Text className="text-gray-600 text-sm">Ref: {activity.referenceNumber}</Text>
                    <View className="flex-row items-center mt-2">
                      <Text className="text-gray-400 text-xs">{new Date(activity.createdAt).toLocaleDateString()}</Text>
                      <View className={`px-2 py-0.5 rounded-full ml-3 ${
                        activity.status === 'Approved' ? 'bg-green-100' : 
                        activity.status === 'Rejected' ? 'bg-red-100' : 'bg-yellow-100'
                      }`}>
                        <Text className={`text-xs font-medium ${
                          activity.status === 'Approved' ? 'text-green-700' : 
                          activity.status === 'Rejected' ? 'text-red-700' : 'text-yellow-700'
                        }`}>
                          {activity.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        {/* Quick Stats */}
        <View className="pb-8">
          <Text className="text-gray-800 text-lg font-bold mb-4">Overview</Text>
          <View className="flex-row justify-between">
            <View className="bg-white rounded-2xl p-4 flex-1 mr-2 shadow-sm border border-gray-100">
              <Text className="text-gray-500 text-xs mb-1">Total Lands</Text>
              <Text className="text-2xl font-bold text-[#125f43]">{stats.totalLands}</Text>
            </View>
            <View className="bg-white rounded-2xl p-4 flex-1 ml-2 shadow-sm border border-gray-100">
              <Text className="text-gray-500 text-xs mb-1">Pending</Text>
              <Text className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}