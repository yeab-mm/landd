import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../api/config';

type RootStackParamList = {
    RequestDetail: { referenceNumber?: string; requestId?: string };
    MyRequests: undefined;
    MainApp: undefined;
    VerificationRequest: undefined;
};

type RequestDetailScreenProp = StackNavigationProp<RootStackParamList, 'RequestDetail'>;
type RequestDetailRouteProp = RouteProp<RootStackParamList, 'RequestDetail'>;

export default function RequestDetailScreen() {
    const navigation = useNavigation<RequestDetailScreenProp>();
    const route = useRoute<RequestDetailRouteProp>();
    const { referenceNumber, requestId } = route.params || {};
    const searchKey = referenceNumber || requestId;
    const { token } = useAuth();

    const [loading, setLoading] = useState(true);
    const [request, setRequest] = useState<any>(null);

    useEffect(() => {
        fetchRequestDetail();
    }, [searchKey]);

    const fetchRequestDetail = async () => {
        if (!searchKey) {
            setLoading(false);
            return;
        }
        try {
            const response = await fetch(`${API_URL}/requests/${searchKey}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setRequest(data.request);
            } else {
                Alert.alert('Error', 'Could not load request details');
            }
        } catch (error) {
            console.error('Fetch detail error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return '#125f43';
            case 'Under Review': return '#F59E0B';
            case 'Document Validation': return '#2563EB';
            case 'Rejected': return '#EF4444';
            default: return '#9CA3AF';
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#125f43" />
                <Text className="text-gray-600 mt-4">Loading details...</Text>
            </View>
        );
    }

    if (!request) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <Ionicons name="alert-circle" size={64} color="#9CA3AF" />
                <Text className="text-gray-600 mt-2">Request not found</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} className="bg-[#125f43] px-8 py-3 rounded-xl mt-4">
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
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
                    <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 rounded-full bg-white/5 items-center justify-center mr-3">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-2xl font-bold">Request Details</Text>
                </View>
                <View className="bg-white/10 rounded-2xl p-4 border border-white/20">
                    <Text className="text-white/70 text-xs mb-1">Reference Number</Text>
                    <Text className="text-white font-mono font-bold text-lg">{request.referenceNumber}</Text>
                    <Text className="text-white/70 text-xs mt-2">Submitted: {new Date(request.createdAt).toLocaleDateString()}</Text>
                </View>
            </LinearGradient>

            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                <View className={`rounded-2xl p-4 my-6 ${request.status === 'Approved' ? 'bg-green-100' : 'bg-blue-100'}`}>
                    <View className="flex-row items-center">
                        <Ionicons name="information-circle" size={24} color={getStatusColor(request.status)} />
                        <View className="ml-3">
                            <Text className="font-bold text-gray-800">{request.status}</Text>
                            <Text className="text-gray-600 text-sm">Processing in progress</Text>
                        </View>
                    </View>
                </View>

                <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
                    <Text className="text-gray-800 text-lg font-bold mb-4">Information</Text>
                    <View className="space-y-3">
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-600">Type:</Text>
                            <Text className="text-gray-800 font-semibold">{request.type}</Text>
                        </View>
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-600">Plot Number:</Text>
                            <Text className="text-gray-800 font-semibold">{request.plotNumber || 'N/A'}</Text>
                        </View>
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-600">Region:</Text>
                            <Text className="text-gray-800 font-semibold">{request.region}</Text>
                        </View>
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-600">Land Size:</Text>
                            <Text className="text-gray-800 font-semibold">{request.landSize} m²</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity onPress={() => navigation.navigate('MyRequests')} className="bg-[#125f43] py-4 rounded-xl items-center shadow-lg mb-4">
                    <Text className="text-white font-bold text-lg">Back to List</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('MainApp')} className="bg-white border-2 border-[#125f43] py-4 rounded-xl items-center mb-8">
                    <Text className="text-[#125f43] font-bold text-lg">Dashboard</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}