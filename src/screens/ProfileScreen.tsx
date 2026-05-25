// File: src/screens/ProfileScreen.tsx
// Purpose: Premium Personalized Profile Dashboard with dynamic stats, Fayda ID visualization, and inline editing

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  StatusBar, 
  TextInput, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../api/config';

export default function ProfileScreen({ navigation }: any) {
  const { user: authUser, token, refreshUser, logout } = useAuth();
  
  // Local state for personalized info and editing
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
  });

  // Fetch complete profile & stats from backend
  const fetchProfile = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (response.ok && data.user) {
        setProfile(data.user);
        setFormData({
          fullName: data.user.fullName || '',
          phone: data.user.phone || '',
          email: data.user.email || '',
        });
      } else {
        console.error('Failed to fetch profile:', data.error);
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const onRefresh = () => {
    setRefreshing(true);
    refreshUser(); // Sync AuthContext
    fetchProfile(); // Load latest stats
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to exit?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => await logout() },
    ]);
  };

  // Submit profile edits
  const handleSaveProfile = async () => {
    if (!formData.fullName.trim()) {
      Alert.alert('Error', 'Full Name cannot be empty');
      return;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Phone number cannot be empty');
      return;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Email address cannot be empty');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/user/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (response.ok) {
        Alert.alert('Success', 'Profile updated successfully!');
        setIsEditing(false);
        await refreshUser(); // Update Auth Context
        await fetchProfile(); // Reload screen data
      } else {
        Alert.alert('Error', data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Save profile error:', error);
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Format Fayda ID elegantly: ET-XXXX-XXXX-XXXX
  const formatFaydaId = (rawId: string) => {
    if (!rawId) return 'ET-0000-0000-0000';
    const cleaned = rawId.replace(/\s/g, '').replace(/ET-?/gi, '');
    const parts = cleaned.match(/.{1,4}/g) || [];
    return `ET-${parts.slice(0, 3).join('-')}`;
  };

  const menuItems = [
    { title: 'My Lands', icon: 'map', navigate: 'MyLands' },
    { title: 'My Requests', icon: 'document-text', navigate: 'MyRequests' },
    { title: 'Security Settings', icon: 'shield-checkmark-outline', navigate: 'Settings' },
    { title: 'Language', icon: 'language', navigate: 'Language' },
    { title: 'Help & Support', icon: 'help-circle-outline', navigate: 'Support' },
  ];

  if (loading && !profile) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#125f43" />
        <Text className="mt-2 text-gray-500 font-bold">Fetching personalized profile...</Text>
      </View>
    );
  }

  // Fallback / default data
  const userData = profile || authUser;
  const stats = userData?.stats || {
    totalLands: 0,
    totalRequests: 0,
    pendingRequests: 0,
    pendingPayments: 0,
    unreadNotifications: 0,
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#125f43" />
      
      {/* Header Profile Section */}
      <LinearGradient colors={['#125f43', '#1a7f5a']} className="px-6 pt-16 pb-12 rounded-b-[40px] items-center shadow-lg relative">
        {/* Edit Button in Header */}
        <TouchableOpacity 
          onPress={() => {
            if (isEditing) {
              handleSaveProfile();
            } else {
              setIsEditing(true);
            }
          }}
          className="absolute right-6 top-16 bg-white/20 p-2.5 rounded-full border border-white/30"
          activeOpacity={0.7}
        >
          <Ionicons name={isEditing ? "checkmark" : "create-outline"} size={22} color="white" />
        </TouchableOpacity>

        {/* Back Button */}
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="absolute left-6 top-16 bg-white/20 p-2.5 rounded-full border border-white/30"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>

        <View className="bg-white/20 p-1 rounded-full border border-white/30 mb-4 mt-4">
          <View className="bg-white p-6 rounded-full relative">
            <Ionicons name="person" size={48} color="#125f43" />
            <View className="absolute bottom-0 right-0 bg-green-500 border-2 border-white p-1 rounded-full">
              <Ionicons name="checkmark-circle" size={16} color="white" />
            </View>
          </View>
        </View>
        
        <Text className="text-white text-2xl font-black">{userData?.fullName || 'User Name'}</Text>
        <Text className="text-white/70 text-sm font-medium mt-1">{userData?.email || userData?.phone}</Text>
        
        <View className="flex-row mt-4 space-x-3">
          <View className="bg-white/10 px-4 py-1.5 rounded-full border border-white/20">
            <Text className="text-white text-[10px] font-bold uppercase tracking-widest">Citizen Portal</Text>
          </View>
          <View className="bg-green-400/20 px-4 py-1.5 rounded-full border border-green-400/30 flex-row items-center">
            <Ionicons name="shield-checkmark" size={12} color="#4ade80" className="mr-1" />
            <Text className="text-green-400 text-[10px] font-bold uppercase tracking-widest ml-1">Verified ID</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        className="flex-1 px-6 -mt-8" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#125f43']} />
        }
      >
        {/* Dynamic User Stats Grid */}
        <View className="flex-row justify-between mb-6">
          <TouchableOpacity 
            onPress={() => navigation.navigate('MyLands')}
            className="bg-white p-4 rounded-3xl w-[23%] items-center shadow-sm border border-gray-100"
            activeOpacity={0.8}
          >
            <View className="bg-green-50 p-2.5 rounded-2xl mb-2">
              <Ionicons name="map" size={20} color="#125f43" />
            </View>
            <Text className="text-[#125f43] font-black text-lg leading-none">{stats.totalLands}</Text>
            <Text className="text-gray-400 text-[9px] font-bold mt-1 text-center">Lands</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate('MyRequests')}
            className="bg-white p-4 rounded-3xl w-[23%] items-center shadow-sm border border-gray-100"
            activeOpacity={0.8}
          >
            <View className="bg-yellow-50 p-2.5 rounded-2xl mb-2">
              <Ionicons name="document-text" size={20} color="#d97706" />
            </View>
            <Text className="text-yellow-600 font-black text-lg leading-none">{stats.pendingRequests}</Text>
            <Text className="text-gray-400 text-[9px] font-bold mt-1 text-center">Pending</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate('PaymentHistory')}
            className="bg-white p-4 rounded-3xl w-[23%] items-center shadow-sm border border-gray-100"
            activeOpacity={0.8}
          >
            <View className="bg-red-50 p-2.5 rounded-2xl mb-2">
              <Ionicons name="card" size={20} color="#ef4444" />
            </View>
            <Text className="text-red-500 font-black text-lg leading-none">{stats.pendingPayments}</Text>
            <Text className="text-gray-400 text-[9px] font-bold mt-1 text-center">Unpaid</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate('Notifications')}
            className="bg-white p-4 rounded-3xl w-[23%] items-center shadow-sm border border-gray-100"
            activeOpacity={0.8}
          >
            <View className="bg-blue-50 p-2.5 rounded-2xl mb-2">
              <Ionicons name="notifications" size={20} color="#2563eb" />
            </View>
            <Text className="text-blue-600 font-black text-lg leading-none">{stats.unreadNotifications}</Text>
            <Text className="text-gray-400 text-[9px] font-bold mt-1 text-center">Unread</Text>
          </TouchableOpacity>
        </View>

        {/* Ethiopian National Digital ID (Fayda) Card */}
        <View className="mb-6">
          <Text className="text-gray-800 text-lg font-black mb-3 ml-1">National Digital ID</Text>
          <LinearGradient 
            colors={['#064e3b', '#065f46', '#042f2c']} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 1 }} 
            className="rounded-3xl p-6 shadow-md relative overflow-hidden border border-emerald-600/30"
          >
            {/* Watermark Graphic Pattern */}
            <View className="absolute -right-12 -bottom-12 opacity-5">
              <Ionicons name="shield" size={180} color="white" />
            </View>

            {/* Top Bar of the Card */}
            <View className="flex-row justify-between items-start mb-6">
              <View>
                <Text className="text-white/60 text-[9px] font-black tracking-widest">የኢትዮጵያ ፌደራላዊ ዲሞክራሲያዊ ሪፐብሊክ</Text>
                <Text className="text-emerald-400 text-[8px] font-black uppercase tracking-wider">Federal Democratic Republic of Ethiopia</Text>
                <Text className="text-white text-[11px] font-black mt-1 tracking-widest">Fayda National Digital ID</Text>
              </View>
              <View className="bg-amber-400/20 p-2 rounded-xl border border-amber-400/40">
                <Ionicons name="ribbon" size={22} color="#fbbf24" />
              </View>
            </View>

            {/* Smart Card Chip visual representation */}
            <View className="flex-row justify-between items-end mb-6">
              <View className="bg-gradient-to-r from-yellow-400 to-amber-500 w-10 h-8 rounded-lg border border-yellow-300/40 relative overflow-hidden items-center justify-center">
                <View className="border-r border-b border-black/10 w-5 h-4 absolute top-0 left-0" />
                <View className="border-l border-b border-black/10 w-5 h-4 absolute top-0 right-0" />
                <View className="border-r border-t border-black/10 w-5 h-4 absolute bottom-0 left-0" />
                <View className="border-l border-t border-black/10 w-5 h-4 absolute bottom-0 right-0" />
                <View className="w-4 h-3 bg-amber-400/20 rounded border border-yellow-200/30" />
              </View>
              <View className="flex-row items-center bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-400/30">
                <Ionicons name="checkmark-circle" size={14} color="#34d399" />
                <Text className="text-emerald-300 text-[9px] font-black uppercase ml-1.5 tracking-wider">VERIFIED</Text>
              </View>
            </View>

            {/* User Fayda ID Number */}
            <Text className="text-white text-2xl font-black tracking-[4px] mb-6">
              {formatFaydaId(userData?.faydaId)}
            </Text>

            {/* ID Details Footer */}
            <View className="flex-row justify-between items-end">
              <View>
                <Text className="text-white/50 text-[9px] font-bold uppercase tracking-wider">Holder Name</Text>
                <Text className="text-white text-base font-black tracking-wide uppercase mt-0.5">{userData?.fullName}</Text>
              </View>
              <View className="items-end">
                <Text className="text-white/50 text-[9px] font-bold uppercase tracking-wider">Status</Text>
                <Text className="text-emerald-400 text-xs font-black uppercase mt-0.5">Active ID</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Personal Details & Editable Fields */}
        <View className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6 p-5">
          <View className="flex-row justify-between items-center mb-4 border-b border-gray-50 pb-3">
            <Text className="text-gray-800 text-lg font-black">Personal Details</Text>
            <TouchableOpacity 
              onPress={() => {
                if (isEditing) {
                  handleSaveProfile();
                } else {
                  setIsEditing(true);
                }
              }}
              className="flex-row items-center"
            >
              <Ionicons name={isEditing ? "checkmark-circle-outline" : "create-outline"} size={16} color="#125f43" />
              <Text className="text-[#125f43] text-sm font-black ml-1">
                {isEditing ? "Save" : "Edit"}
              </Text>
            </TouchableOpacity>
          </View>

          {isEditing ? (
            <View className="space-y-4">
              <View>
                <Text className="text-gray-500 text-xs font-bold mb-1.5 ml-1">Full Name</Text>
                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                  <Ionicons name="person-outline" size={18} color="#9ca3af" className="mr-2" />
                  <TextInput 
                    value={formData.fullName}
                    onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                    placeholder="Enter full name"
                    className="flex-1 text-gray-800 font-bold ml-2 py-0 text-base"
                  />
                </View>
              </View>

              <View>
                <Text className="text-gray-500 text-xs font-bold mb-1.5 ml-1">Phone Number</Text>
                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                  <Ionicons name="call-outline" size={18} color="#9ca3af" className="mr-2" />
                  <TextInput 
                    value={formData.phone}
                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                    className="flex-1 text-gray-800 font-bold ml-2 py-0 text-base"
                  />
                </View>
              </View>

              <View>
                <Text className="text-gray-500 text-xs font-bold mb-1.5 ml-1">Email Address</Text>
                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                  <Ionicons name="mail-outline" size={18} color="#9ca3af" className="mr-2" />
                  <TextInput 
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    placeholder="Enter email address"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="flex-1 text-gray-800 font-bold ml-2 py-0 text-base"
                  />
                </View>
              </View>

              <View className="flex-row space-x-3 pt-4">
                <TouchableOpacity 
                  onPress={() => {
                    setIsEditing(false);
                    setFormData({
                      fullName: userData.fullName || '',
                      phone: userData.phone || '',
                      email: userData.email || '',
                    });
                  }}
                  className="flex-1 bg-gray-100 py-3.5 rounded-2xl items-center"
                >
                  <Text className="text-gray-500 font-black text-sm">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={handleSaveProfile}
                  className="flex-1 bg-[#125f43] py-3.5 rounded-2xl items-center shadow-sm"
                >
                  <Text className="text-white font-black text-sm">Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className="space-y-4">
              <View className="flex-row justify-between items-center py-1">
                <View className="flex-row items-center">
                  <Ionicons name="person-outline" size={18} color="#125f43" />
                  <Text className="text-gray-500 text-sm font-bold ml-3.5">Full Name</Text>
                </View>
                <Text className="text-gray-800 font-black text-sm">{userData?.fullName}</Text>
              </View>

              <View className="flex-row justify-between items-center py-1 border-t border-gray-50 pt-3">
                <View className="flex-row items-center">
                  <Ionicons name="call-outline" size={18} color="#125f43" />
                  <Text className="text-gray-500 text-sm font-bold ml-3.5">Phone</Text>
                </View>
                <Text className="text-gray-800 font-black text-sm">{userData?.phone}</Text>
              </View>

              <View className="flex-row justify-between items-center py-1 border-t border-gray-50 pt-3">
                <View className="flex-row items-center">
                  <Ionicons name="mail-outline" size={18} color="#125f43" />
                  <Text className="text-gray-500 text-sm font-bold ml-3.5">Email</Text>
                </View>
                <Text className="text-gray-800 font-black text-sm">{userData?.email || 'Not provided'}</Text>
              </View>

              <View className="flex-row justify-between items-center py-1 border-t border-gray-50 pt-3">
                <View className="flex-row items-center">
                  <Ionicons name="briefcase-outline" size={18} color="#125f43" />
                  <Text className="text-gray-500 text-sm font-bold ml-3.5">Account Role</Text>
                </View>
                <Text className="text-[#125f43] font-black text-sm bg-green-50 px-3 py-0.5 rounded-full">{userData?.role}</Text>
              </View>

              <View className="flex-row justify-between items-center py-1 border-t border-gray-50 pt-3">
                <View className="flex-row items-center">
                  <Ionicons name="calendar-outline" size={18} color="#125f43" />
                  <Text className="text-gray-500 text-sm font-bold ml-3.5">Member Since</Text>
                </View>
                <Text className="text-gray-800 font-black text-sm">
                  {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) : 'N/A'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Menu Navigation Items */}
        <View className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              onPress={() => item.navigate && navigation.navigate(item.navigate)}
              className={`flex-row items-center p-5 ${index !== menuItems.length - 1 ? 'border-b border-gray-50' : ''}`}
              activeOpacity={0.6}
            >
              <View className="bg-gray-50 p-2.5 rounded-xl mr-4">
                <Ionicons name={item.icon as any} size={20} color="#125f43" />
              </View>
              <Text className="text-gray-800 text-base font-bold flex-1">{item.title}</Text>
              <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Action */}
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-white p-5 rounded-3xl shadow-sm border border-red-100 flex-row items-center justify-center mb-10"
          activeOpacity={0.6}
        >
          <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          <Text className="text-red-500 font-black text-base ml-2">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}