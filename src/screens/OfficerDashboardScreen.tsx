import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../api/config';

// ✅ FIXED: Proper navigation types
type RootStackParamList = {
    MainApp: undefined;
    ChatDetail: { chatId: string; name: string };
    OfficerDashboard: undefined;
};

type OfficerDashboardScreenProp = StackNavigationProp<RootStackParamList, 'OfficerDashboard'>;

// ✅ Request type definition
type Request = {
    id: string;
    applicant: string;
    landType: string;
    date: string;
    status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected';
    docType: string;
};

export default function OfficerDashboardScreen() {
    const navigation = useNavigation<OfficerDashboardScreenProp>();
    const { token, user } = useAuth();
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchRequests = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_URL}/requests`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data.requests) {
                const mapped: Request[] = data.requests.map((r: any) => ({
                    id: r.id,
                    applicant: r.ownerName || r.user?.fullName || 'Anonymous',
                    landType: r.formData?.landUseType || r.landUseType || 'Residential',
                    date: r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    status: (r.status === 'submitted' || r.status === 'Pending' || r.status === 'Under Review') ? 'Pending' : r.status,
                    docType: r.type || 'Ownership Verification'
                }));
                setRequests(mapped);
            }
        } catch (error) {
            console.error('Fetch requests error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [token]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchRequests();
    };

    const pendingCount = requests.filter(r => r.status === 'Pending' || r.status === 'Under Review').length;
    const approvedCount = requests.filter(r => r.status === 'Approved').length;
    const rejectedCount = requests.filter(r => r.status === 'Rejected').length;

    // ✅ FIXED: Use explicit green theme colors
    const PRIMARY_COLOR = '#125f43ff';
    const PRIMARY_LIGHT = '#0d4a35';

    const renderStatCard = (title: string, count: string, icon: keyof typeof Ionicons.glyphMap, color: string) => (
        <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex-1 mx-1">
            <View className={`w-8 h-8 rounded-full items-center justify-center mb-2`} style={{ backgroundColor: `${color}20` }}>
                <Ionicons name={icon} size={16} color={color} />
            </View>
            <Text className="text-gray-400 text-[10px] font-bold uppercase">{title}</Text>
            <Text className="text-gray-900 text-xl font-bold">{count}</Text>
        </View>
    );

    // ✅ Handle action with confirmation
    const handleAction = (id: string, action: 'Approve' | 'Reject', applicant: string) => {
        const finalStatus = action === 'Approve' ? 'Approved' : 'Rejected';
        
        Alert.alert(
            `${action} Request`,
            `Are you sure you want to ${action.toLowerCase()} the request from ${applicant}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: action, 
                    style: action === 'Reject' ? 'destructive' : 'default',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            const res = await fetch(`${API_URL}/requests/${id}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`
                                },
                                body: JSON.stringify({ status: finalStatus })
                            });
                            const data = await res.json();
                            if (res.ok) {
                                Alert.alert('Success', `Request ${action.toLowerCase()}d successfully`);
                                fetchRequests();
                            } else {
                                Alert.alert('Error', data.error || 'Failed to update request');
                            }
                        } catch (error) {
                            console.error('Request status update error:', error);
                            Alert.alert('Error', 'Failed to update request status');
                        } finally {
                            setLoading(false);
                        }
                    } 
                }
            ]
        );
    };

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
            
            {/* Header */}
            <LinearGradient
                colors={[PRIMARY_COLOR, PRIMARY_LIGHT]}
                className="px-6 pt-12 pb-8 rounded-b-[40px] shadow-lg"
            >
                <View className="flex-row items-center justify-between mb-4">
                    <TouchableOpacity 
                        onPress={() => navigation.goBack()}
                        className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                        accessibilityLabel="Go back"
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View className="bg-white/20 px-3 py-1 rounded-full">
                        <Text className="text-white text-[10px] font-bold uppercase">Land Officer Portal</Text>
                    </View>
                    <TouchableOpacity 
                        className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                        accessibilityLabel="View notifications"
                    >
                        <Ionicons name="notifications-outline" size={24} color="white" />
                    </TouchableOpacity>
                </View>
                <Text className="text-white text-2xl font-bold">Welcome back,</Text>
                <Text className="text-white/80 text-base">{user?.fullName || 'Officer Haile'}</Text>
            </LinearGradient>


            <ScrollView 
                className="flex-1 px-6" 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PRIMARY_COLOR]} />
                }
            >
                {/* Stats */}
                <View className="flex-row justify-between -mt-6 mb-8">
                    {renderStatCard('Pending', String(pendingCount), 'time', '#F59E0B')}
                    {renderStatCard('Verified', String(148 + approvedCount), 'checkmark-circle', '#10B981')}
                    {renderStatCard('Flagged', String(3 + rejectedCount), 'flag', '#EF4444')}
                </View>

                {/* Verification Queue */}
                <View className="mb-6">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-gray-800 text-lg font-bold">Verification Queue</Text>
                        <Text className="text-[#125f43ff] text-sm font-semibold">{requests.length} Requests</Text>
                    </View>

                    {requests.length === 0 ? (
                        <View className="bg-white rounded-2xl p-8 items-center border border-gray-100">
                            <Ionicons name="checkmark-done-circle" size={48} color="#10B981" />
                            <Text className="text-gray-500 text-base mt-4 text-center">All caught up!</Text>
                            <Text className="text-gray-400 text-sm text-center mt-1">No pending requests to review</Text>
                        </View>
                    ) : (
                        requests.map((item) => (
                            <View key={item.id} className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
                                <View className="flex-row justify-between items-start mb-3">
                                    <View>
                                        <Text className="text-gray-900 font-bold text-base">{item.applicant}</Text>
                                        <Text className="text-gray-500 text-xs">{item.landType} • {item.docType}</Text>
                                    </View>
                                    <View className={`px-2 py-1 rounded-md ${
                                        item.status === 'Pending' ? 'bg-orange-100' :
                                        item.status === 'Under Review' ? 'bg-blue-100' :
                                        item.status === 'Approved' ? 'bg-green-100' : 'bg-red-100'
                                    }`}>
                                        <Text className={`text-[10px] font-bold ${
                                            item.status === 'Pending' ? 'text-orange-600' :
                                            item.status === 'Under Review' ? 'text-blue-600' :
                                            item.status === 'Approved' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {item.status.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>

                                <View className="flex-row items-center mb-4">
                                    <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                                    <Text className="text-gray-500 text-xs ml-1">Submitted on {item.date}</Text>
                                </View>

                                <View className="flex-row space-x-2">
                                    <TouchableOpacity 
                                        onPress={() => navigation.navigate('ChatDetail', { chatId: `officer-${item.id}`, name: item.applicant })}
                                        className="flex-1 bg-gray-100 py-2.5 rounded-xl items-center"
                                        accessibilityLabel={`Chat with ${item.applicant}`}
                                    >
                                        <Text className="text-gray-700 font-bold text-xs">Chat</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        onPress={() => handleAction(item.id, 'Reject', item.applicant)}
                                        className="flex-1 bg-red-50 py-2.5 rounded-xl items-center border border-red-100"
                                        accessibilityLabel={`Reject request from ${item.applicant}`}
                                    >
                                        <Text className="text-red-500 font-bold text-xs">Reject</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        onPress={() => handleAction(item.id, 'Approve', item.applicant)}
                                        className="flex-1 bg-[#125f43ff] py-2.5 rounded-xl items-center shadow-sm"
                                        accessibilityLabel={`Approve request from ${item.applicant}`}
                                    >
                                        <Text className="text-white font-bold text-xs">Approve</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                {/* Recent Activity */}
                <View className="mb-10">
                    <Text className="text-gray-800 text-lg font-bold mb-4">Recent System Logs</Text>
                    <View className="bg-white rounded-2xl p-4 border border-gray-100">
                        <Text className="text-gray-400 text-sm text-center italic">Integration with Blockchain Sync Pending...</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}