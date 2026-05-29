import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StatusBar, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { fetchRequestDetail } from '../api/requests';
import { mapRequestToDetail } from '../utils/requestWorkflow';
import type { TimelineStepStatus } from '../utils/requestWorkflow';

type RootStackParamList = {
  RequestDetail: { referenceNumber: string };
  MyRequests: undefined;
  MainApp: undefined;
  Notifications: undefined;
};

type RequestDetailScreenProp = StackNavigationProp<RootStackParamList, 'RequestDetail'>;
type RequestDetailRouteProp = RouteProp<RootStackParamList, 'RequestDetail'>;

const getStatusColor = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes('approv')) return '#125f43';
  if (s.includes('reject')) return '#EF4444';
  if (s.includes('officer') || s.includes('validation')) return '#2563EB';
  if (s.includes('review') || s.includes('submitted')) return '#F59E0B';
  return '#9CA3AF';
};

const getStatusIcon = (status: TimelineStepStatus) => {
  switch (status) {
    case 'completed':
      return 'checkmark-circle';
    case 'active':
      return 'hourglass';
    case 'rejected':
      return 'close-circle';
    default:
      return 'ellipse';
  }
};

export default function RequestDetailScreen() {
  const navigation = useNavigation<RequestDetailScreenProp>();
  const route = useRoute<RequestDetailRouteProp>();
  const { referenceNumber } = route.params;
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [requestDetail, setRequestDetail] = useState<ReturnType<typeof mapRequestToDetail> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) {
      setError('Please sign in to view this request.');
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const raw = await fetchRequestDetail(token, referenceNumber);
      setRequestDetail(mapRequestToDetail(raw));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load request');
      setRequestDetail(null);
    } finally {
      setLoading(false);
    }
  }, [token, referenceNumber]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      if (!loading && token) load();
    }, [load, loading, token])
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#125f43" />
        <Text className="text-gray-600 mt-4">Loading request details...</Text>
      </View>
    );
  }

  if (!requestDetail || error) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Ionicons name="alert-circle-outline" size={64} color="#9CA3AF" />
        <Text className="text-gray-600 mt-4 text-center">{error || 'Request not found'}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="bg-[#125f43] px-8 py-3 rounded-xl mt-4">
          <Text className="text-white font-bold">Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusColor = getStatusColor(requestDetail.status);

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
          <Text className="text-white text-2xl font-bold">Track request</Text>
        </View>

        <View className="bg-white/10 rounded-2xl p-4 border border-white/20">
          <Text className="text-white/70 text-xs mb-1">Reference number</Text>
          <Text className="text-white font-mono font-bold text-lg">{requestDetail.referenceNumber}</Text>
          <Text className="text-white/70 text-xs mt-2">Submitted: {requestDetail.submissionDate}</Text>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View
          className={`rounded-2xl p-4 mb-6 mt-4 ${
            requestDetail.status === 'Approved'
              ? 'bg-green-100 border border-green-200'
              : requestDetail.status === 'Rejected'
                ? 'bg-red-100 border border-red-200'
                : 'bg-blue-100 border border-blue-200'
          }`}
        >
          <View className="flex-row items-center">
            <Ionicons
              name={
                requestDetail.status === 'Approved'
                  ? 'checkmark-circle'
                  : requestDetail.status === 'Rejected'
                    ? 'close-circle'
                    : 'hourglass'
              }
              size={24}
              color={statusColor}
            />
            <View className="ml-3 flex-1">
              <Text
                className={`font-bold ${
                  requestDetail.status === 'Approved'
                    ? 'text-green-800'
                    : requestDetail.status === 'Rejected'
                      ? 'text-red-800'
                      : 'text-blue-800'
                }`}
              >
                {requestDetail.status}
              </Text>
              <Text
                className={`text-sm ${
                  requestDetail.status === 'Approved'
                    ? 'text-green-700'
                    : requestDetail.status === 'Rejected'
                      ? 'text-red-700'
                      : 'text-blue-700'
                }`}
              >
                Admin reviews documents → officer gives final approval → you get a notification
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <Text className="text-gray-800 text-lg font-bold mb-4">Progress</Text>
          {requestDetail.timeline.map((item, index) => (
            <View key={item.step} className="mb-6 last:mb-0">
              <View className="flex-row">
                <View className="items-center mr-4">
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center ${
                      item.status === 'completed'
                        ? 'bg-[#125f43]'
                        : item.status === 'active'
                          ? 'bg-[#F59E0B]'
                          : item.status === 'rejected'
                            ? 'bg-red-500'
                            : 'bg-gray-200'
                    }`}
                  >
                    <Ionicons
                      name={getStatusIcon(item.status)}
                      size={18}
                      color={item.status === 'pending' ? '#9CA3AF' : 'white'}
                    />
                  </View>
                  {index < requestDetail.timeline.length - 1 && (
                    <View
                      className={`w-0.5 h-12 ${
                        item.status === 'completed' ? 'bg-[#125f43]' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </View>
                <View className="flex-1 pb-2">
                  <Text
                    className={`font-semibold ${
                      item.status === 'pending' ? 'text-gray-400' : 'text-gray-800'
                    }`}
                  >
                    {item.title}
                  </Text>
                  <Text
                    className={`text-sm ${
                      item.status === 'pending' ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {item.description}
                  </Text>
                  {item.date ? <Text className="text-xs text-gray-500 mt-1">{item.date}</Text> : null}
                </View>
              </View>
            </View>
          ))}
        </View>

        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <Text className="text-gray-800 text-lg font-bold mb-4">Request information</Text>
          <View className="gap-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Request type</Text>
              <Text className="text-gray-800 font-semibold">{requestDetail.requestType}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Plot number</Text>
              <Text className="text-gray-800 font-semibold">{requestDetail.plotNumber}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Location</Text>
              <Text className="text-gray-800 font-semibold text-right flex-1 ml-4">
                {requestDetail.location}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Land size</Text>
              <Text className="text-gray-800 font-semibold">{requestDetail.landSize}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Land use</Text>
              <Text className="text-gray-800 font-semibold">{requestDetail.landUse}</Text>
            </View>
          </View>
        </View>

        {requestDetail.documents.length > 0 && (
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
            <Text className="text-gray-800 text-lg font-bold mb-4">Documents</Text>
            {requestDetail.documents.map((doc, index) => (
              <View
                key={`${doc.name}-${index}`}
                className={`flex-row items-center py-3 ${
                  index !== requestDetail.documents.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <Ionicons
                  name={doc.uploaded ? 'document' : 'document-outline'}
                  size={20}
                  color={doc.uploaded ? '#125f43' : '#9CA3AF'}
                />
                <View className="ml-3 flex-1">
                  <Text className="text-gray-800 text-sm">{doc.name}</Text>
                </View>
                <View
                  className={`px-3 py-1 rounded-full ${
                    doc.status === 'Verified' ? 'bg-green-100' : 'bg-gray-100'
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      doc.status === 'Verified' ? 'text-green-700' : 'text-gray-700'
                    }`}
                  >
                    {doc.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {requestDetail.officerNotes ? (
          <View className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200 mb-6">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#F59E0B" />
              <Text className="text-yellow-800 text-sm ml-2 flex-1">
                <Text className="font-semibold">Officer note: </Text>
                {requestDetail.officerNotes}
              </Text>
            </View>
          </View>
        ) : null}

        <View className="gap-3 pb-8">
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            className="bg-[#125f43] py-4 rounded-xl items-center shadow-lg"
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-lg">View notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('MyRequests')}
            className="bg-white border-2 border-[#125f43] py-4 rounded-xl items-center"
            activeOpacity={0.8}
          >
            <Text className="text-[#125f43] font-bold text-lg">All my requests</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="bg-white border border-gray-200 py-4 rounded-xl items-center"
            activeOpacity={0.8}
          >
            <Text className="text-gray-700 font-bold text-lg">Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
