import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../api/config';
import DocumentReviewModal from '../components/DocumentReviewModal';

type RootStackParamList = {
  MainApp: undefined;
  ChatDetail: { chatId: string; name: string };
  OfficerDashboard: undefined;
};

type OfficerDashboardScreenProp = StackNavigationProp<RootStackParamList, 'OfficerDashboard'>;

type RequestStatus =
  | 'Pending'
  | 'Under Review'
  | 'Document Validation'
  | 'Approved'
  | 'Rejected';

type QueueRequest = {
  id: string;
  referenceNumber: string;
  applicant: string;
  landType: string;
  date: string;
  status: RequestStatus;
  docType: string;
  docAuthenticity?: {
    docs?: Record<string, boolean>;
    notes?: string;
  };
};

const mapApiStatus = (status: string): RequestStatus => {
  const s = (status || '').toLowerCase();
  if (s === 'approved') return 'Approved';
  if (s === 'rejected') return 'Rejected';
  if (s === 'document validation') return 'Document Validation';
  if (s === 'under review') return 'Under Review';
  return 'Pending';
};

const statusStyle = (status: RequestStatus) => {
  switch (status) {
    case 'Document Validation':
      return { bg: 'bg-blue-100', text: 'text-blue-700' };
    case 'Approved':
      return { bg: 'bg-green-100', text: 'text-green-700' };
    case 'Rejected':
      return { bg: 'bg-red-100', text: 'text-red-700' };
    case 'Under Review':
      return { bg: 'bg-indigo-100', text: 'text-indigo-700' };
    default:
      return { bg: 'bg-orange-100', text: 'text-orange-700' };
  }
};

export default function OfficerDashboardScreen() {
  const navigation = useNavigation<OfficerDashboardScreenProp>();
  const { token, user } = useAuth();
  const [requests, setRequests] = useState<QueueRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<QueueRequest | null>(null);

  const PRIMARY_COLOR = '#125f43ff';
  const PRIMARY_LIGHT = '#0d4a35';

  const parseFormData = (raw: unknown) => {
    if (!raw) return {};
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw);
      } catch {
        return {};
      }
    }
    return raw as Record<string, unknown>;
  };

  const fetchRequests = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.requests) {
        const mapped: QueueRequest[] = data.requests.map((r: any) => {
          const fd = parseFormData(r.formData);
          return {
            id: r.id,
            referenceNumber: r.referenceNumber || r.id,
            applicant: r.ownerName || r.user?.fullName || 'Anonymous',
            landType: fd.landUseType || r.landUseType || 'Residential',
            date: r.createdAt
              ? new Date(r.createdAt).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0],
            status: mapApiStatus(r.status),
            docType: r.type || 'Ownership Verification',
            docAuthenticity: fd.docAuthenticity,
          };
        });
        setRequests(mapped);
      }
    } catch (error) {
      console.error('Fetch requests error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const pendingCount = requests.filter(
    (r) =>
      r.status === 'Pending' ||
      r.status === 'Under Review' ||
      r.status === 'Document Validation'
  ).length;
  const approvedCount = requests.filter((r) => r.status === 'Approved').length;
  const rejectedCount = requests.filter((r) => r.status === 'Rejected').length;
  const inValidationCount = requests.filter((r) => r.status === 'Document Validation').length;

  const submitStatusUpdate = async (
    requestId: string,
    status: string,
    docs: Record<string, boolean>,
    notes: string
  ) => {
    const res = await fetch(`${API_URL}/requests/${requestId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status,
        docValidation: { docs, notes: notes || undefined },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update request');
    }
    return data;
  };

  const closeReview = () => {
    if (!submitting) setReviewTarget(null);
  };

  const handleSaveValidation = async (docs: Record<string, boolean>, notes: string) => {
    if (!reviewTarget) return;
    try {
      setSubmitting(true);
      await submitStatusUpdate(reviewTarget.id, 'Document Validation', docs, notes);
      Alert.alert('Saved', 'Request moved to Document Validation. You can approve or reject when ready.');
      setReviewTarget(null);
      fetchRequests();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not save validation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (docs: Record<string, boolean>, notes: string) => {
    if (!reviewTarget) return;
    try {
      setSubmitting(true);
      await submitStatusUpdate(reviewTarget.id, 'Approved', docs, notes);
      Alert.alert('Approved', 'All documents verified as authentic.');
      setReviewTarget(null);
      fetchRequests();
    } catch (e: any) {
      Alert.alert('Cannot approve', e.message || 'Approval failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (docs: Record<string, boolean>, notes: string) => {
    if (!reviewTarget) return;
    if (!notes.trim()) {
      Alert.alert('Notes required', 'Please add officer notes explaining the rejection.');
      return;
    }
    Alert.alert('Reject request', `Reject ${reviewTarget.applicant}'s request?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          try {
            setSubmitting(true);
            await submitStatusUpdate(reviewTarget.id, 'Rejected', docs, notes);
            Alert.alert('Rejected', 'Request has been rejected.');
            setReviewTarget(null);
            fetchRequests();
          } catch (e: any) {
            Alert.alert('Error', e.message || 'Rejection failed');
          } finally {
            setSubmitting(false);
          }
        },
      },
    ]);
  };

  const renderStatCard = (
    title: string,
    count: string,
    icon: keyof typeof Ionicons.glyphMap,
    color: string
  ) => (
    <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex-1 mx-1">
      <View
        className="w-8 h-8 rounded-full items-center justify-center mb-2"
        style={{ backgroundColor: `${color}20` }}
      >
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text className="text-gray-400 text-[10px] font-bold uppercase">{title}</Text>
      <Text className="text-gray-900 text-xl font-bold">{count}</Text>
    </View>
  );

  if (loading && requests.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text className="text-gray-600 mt-4">Loading verification queue...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />

      <LinearGradient
        colors={[PRIMARY_COLOR, PRIMARY_LIGHT]}
        className="px-6 pt-12 pb-8 rounded-b-[40px] shadow-lg"
      >
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View className="bg-white/20 px-3 py-1 rounded-full">
            <Text className="text-white text-[10px] font-bold uppercase">Land Officer Portal</Text>
          </View>
          <TouchableOpacity className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
            <Ionicons name="notifications-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <Text className="text-white text-2xl font-bold">Welcome back,</Text>
        <Text className="text-white/80 text-base">{user?.fullName || 'Officer'}</Text>
      </LinearGradient>

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PRIMARY_COLOR]} />
        }
      >
        <View className="flex-row justify-between -mt-6 mb-4">
          {renderStatCard('Pending', String(pendingCount), 'time', '#F59E0B')}
          {renderStatCard('In validation', String(inValidationCount), 'document-text', '#2563EB')}
          {renderStatCard('Approved', String(approvedCount), 'checkmark-circle', '#10B981')}
        </View>
        <View className="flex-row justify-between mb-8">
          {renderStatCard('Rejected', String(rejectedCount), 'flag', '#EF4444')}
        </View>

        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-800 text-lg font-bold">Verification Queue</Text>
            <Text className="text-[#125f43ff] text-sm font-semibold">{requests.length} Requests</Text>
          </View>

          {requests.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center border border-gray-100">
              <Ionicons name="checkmark-done-circle" size={48} color="#10B981" />
              <Text className="text-gray-500 text-base mt-4 text-center">All caught up!</Text>
            </View>
          ) : (
            requests.map((item) => {
              const st = statusStyle(item.status);
              const checkedCount = item.docAuthenticity?.docs
                ? Object.values(item.docAuthenticity.docs).filter((v) => v === true || v === false)
                    .length
                : 0;
              return (
                <View
                  key={item.id}
                  className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100"
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1 pr-2">
                      <Text className="text-gray-900 font-bold text-base">{item.applicant}</Text>
                      <Text className="text-gray-500 text-xs">{item.landType} • {item.docType}</Text>
                      <Text className="text-gray-400 text-[10px] mt-1">{item.referenceNumber}</Text>
                    </View>
                    <View className={`px-2 py-1 rounded-md ${st.bg}`}>
                      <Text className={`text-[10px] font-bold ${st.text}`}>
                        {item.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center mb-3">
                    <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                    <Text className="text-gray-500 text-xs ml-1">Submitted {item.date}</Text>
                    {checkedCount > 0 && (
                      <Text className="text-blue-600 text-xs ml-2">
                        • {checkedCount} doc(s) reviewed
                      </Text>
                    )}
                  </View>

                  {item.status !== 'Approved' && item.status !== 'Rejected' && (
                    <TouchableOpacity
                      onPress={() => setReviewTarget(item)}
                      className="mb-3 py-3 rounded-xl bg-[#125f43]/10 border border-[#125f43]/30 flex-row items-center justify-center"
                    >
                      <Ionicons name="shield-checkmark" size={18} color={PRIMARY_COLOR} />
                      <Text className="text-[#125f43] font-bold text-sm ml-2">
                        Review documents
                      </Text>
                    </TouchableOpacity>
                  )}

                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate('ChatDetail', {
                          chatId: `officer-${item.id}`,
                          name: item.applicant,
                        })
                      }
                      className="flex-1 bg-gray-100 py-2.5 rounded-xl items-center"
                    >
                      <Text className="text-gray-700 font-bold text-xs">Chat</Text>
                    </TouchableOpacity>
                    {item.status !== 'Approved' && item.status !== 'Rejected' && (
                      <TouchableOpacity
                        onPress={() => setReviewTarget(item)}
                        className="flex-[2] bg-[#125f43] py-2.5 rounded-xl items-center"
                      >
                        <Text className="text-white font-bold text-xs">Validate / Decide</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <DocumentReviewModal
        visible={!!reviewTarget}
        applicant={reviewTarget?.applicant || ''}
        requestType={reviewTarget?.docType || ''}
        referenceLabel={reviewTarget?.referenceNumber}
        initialDocs={reviewTarget?.docAuthenticity?.docs}
        initialNotes={reviewTarget?.docAuthenticity?.notes || ''}
        submitting={submitting}
        onClose={closeReview}
        onSaveValidation={handleSaveValidation}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </View>
  );
}
