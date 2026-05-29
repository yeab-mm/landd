import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StatusBar, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { fetchMyRequests, normalizeStatus } from '../api/requests';
import { parseRequestFormData, formatRequestLocation } from '../utils/requestWorkflow';

type RootStackParamList = {
  TrackRequest: { referenceNumber?: string };
  RequestDetail: { referenceNumber: string };
  MainApp: undefined;
};

type TrackRequestScreenProp = StackNavigationProp<RootStackParamList, 'TrackRequest'>;
type TrackRequestRouteProp = RouteProp<RootStackParamList, 'TrackRequest'>;

function statusBadgeStyle(status: string) {
  const s = normalizeStatus(status).toLowerCase();
  if (s.includes('approv')) return { bg: 'bg-green-100', text: 'text-green-700' };
  if (s.includes('reject')) return { bg: 'bg-red-100', text: 'text-red-700' };
  if (s.includes('officer') || s.includes('validation')) return { bg: 'bg-blue-100', text: 'text-blue-700' };
  return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
}

export default function TrackRequestScreen() {
  const navigation = useNavigation<TrackRequestScreenProp>();
  const route = useRoute<TrackRequestRouteProp>();
  const { referenceNumber } = route.params || {};
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const list = await fetchMyRequests(token);
      setRequests(list);
    } catch (e) {
      console.error('Track requests load error:', e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (referenceNumber) {
      navigation.replace('RequestDetail', { referenceNumber });
      return;
    }
    load();
  }, [referenceNumber, navigation, load]);

  const openDetail = (ref: string) => {
    navigation.navigate('RequestDetail', { referenceNumber: ref });
  };

  if (referenceNumber) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#125f43" />
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#125f43" />
        <Text className="text-gray-600 mt-4">Loading requests...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#125f43" />

      <LinearGradient
        colors={['#125f43', '#1a7f5a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pt-14 pb-6 rounded-b-3xl"
      >
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">Track requests</Text>
        </View>

        <View className="bg-white/10 rounded-2xl p-4 border border-white/20">
          <Text className="text-white/70 text-xs mb-1">Total requests</Text>
          <Text className="text-white font-bold text-2xl">{requests.length}</Text>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <Text className="text-gray-800 text-lg font-bold mb-4 mt-4">All requests</Text>

        {requests.length === 0 ? (
          <View className="items-center py-12">
            <Ionicons name="folder-open-outline" size={64} color="#9CA3AF" />
            <Text className="text-gray-500 text-base mt-4 text-center">No requests found</Text>
            <Text className="text-gray-400 text-sm mt-2 text-center px-6">
              Submit a service request from Home. After submit, use Track or Back on the success screen.
            </Text>
          </View>
        ) : (
          requests.map((req) => {
            const fd = parseRequestFormData(req.formData);
            const badge = statusBadgeStyle(req.status);
            return (
              <TouchableOpacity
                key={req.id}
                onPress={() => openDetail(req.referenceNumber)}
                className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-800 font-bold text-base flex-1 mr-2">{req.type}</Text>
                  <View className={`px-3 py-1 rounded-full ${badge.bg}`}>
                    <Text className={`text-xs font-medium ${badge.text}`}>
                      {normalizeStatus(req.status)}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center mb-1">
                  <Ionicons name="document-text-outline" size={16} color="#9CA3AF" />
                  <Text className="text-gray-600 text-sm ml-2">{req.referenceNumber}</Text>
                </View>

                <View className="flex-row items-center mb-1">
                  <Ionicons name="location-outline" size={16} color="#9CA3AF" />
                  <Text className="text-gray-600 text-sm ml-2">
                    {String(fd.plotNumber || '—')} · {formatRequestLocation(fd)}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between mt-2">
                  <Text className="text-gray-500 text-xs">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="text-[#125f43] text-sm font-semibold">View progress</Text>
                    <Ionicons name="chevron-forward" size={16} color="#125f43" />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <TouchableOpacity
          onPress={() => navigation.navigate('MainApp')}
          className="bg-white border-2 border-[#125f43] py-4 rounded-xl items-center my-8"
          activeOpacity={0.8}
        >
          <Text className="text-[#125f43] font-bold text-lg">Back to home</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
