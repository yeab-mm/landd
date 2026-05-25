import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

type RootStackParamList = {
    MyRequests: undefined;
    RequestDetail: { referenceNumber: string };
    MainApp: undefined;
};

type MyRequestsScreenProp = StackNavigationProp<RootStackParamList, 'MyRequests'>;

// ✅ Mock Request List Data
const MOCK_REQUESTS = [
    {
        referenceNumber: 'VER-2024-ABC123',
        requestType: 'Ownership Verification',
        submissionDate: '2024-04-02',
        status: 'Under Review',
        plotNumber: 'PLOT-2024-12345',
        location: 'Bahir Dar, Kebele 03',
    },
    {
        referenceNumber: 'VER-2024-XYZ789',
        requestType: 'Ownership Verification',
        submissionDate: '2024-03-28',
        status: 'Approved',
        plotNumber: 'PLOT-2024-67890',
        location: 'Gondar, Kebele 05',
    },
    {
        referenceNumber: 'VER-2024-DEF456',
        requestType: 'Ownership Verification',
        submissionDate: '2024-03-15',
        status: 'Document Validation',
        plotNumber: 'PLOT-2024-11111',
        location: 'Bahir Dar, Kebele 07',
    },
];

export default function MyRequestsScreen() {
    const navigation = useNavigation<MyRequestsScreenProp>();
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<any[]>([]);

    useEffect(() => {
        setTimeout(() => {
            setRequests(MOCK_REQUESTS);
            setLoading(false);
        }, 500);
    }, []);

    // ✅ Get status badge color
    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'bg-green-100';
            case 'Under Review': return 'bg-yellow-100';
            case 'Document Validation': return 'bg-blue-100';
            case 'Rejected': return 'bg-red-100';
            default: return 'bg-gray-100';
        }
    };

    const getStatusTextColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'text-green-700';
            case 'Under Review': return 'text-yellow-700';
            case 'Document Validation': return 'text-blue-700';
            case 'Rejected': return 'text-red-700';
            default: return 'text-gray-700';
        }
    };

    // ✅ Render Request List Item
    const renderRequestItem = (request: any, index: number) => (
        <TouchableOpacity
            key={index}
            onPress={() => navigation.navigate('RequestDetail', { referenceNumber: request.referenceNumber })}
            className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
            activeOpacity={0.7}
        >
            <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-800 font-bold text-base">{request.requestType}</Text>
                <View className={`px-3 py-1 rounded-full ${getStatusBadgeColor(request.status)}`}>
                    <Text className={`text-xs font-medium ${getStatusTextColor(request.status)}`}>
                        {request.status}
                    </Text>
                </View>
            </View>

            <View className="flex-row items-center mb-1">
                <Ionicons name="document-text-outline" size={16} color="#9CA3AF" />
                <Text className="text-gray-600 text-sm ml-2">{request.referenceNumber}</Text>
            </View>

            <View className="flex-row items-center mb-1">
                <Ionicons name="location-outline" size={16} color="#9CA3AF" />
                <Text className="text-gray-600 text-sm ml-2">{request.plotNumber}</Text>
            </View>

            <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={16} color="#9CA3AF" />
                <Text className="text-gray-600 text-sm ml-2">Submitted: {request.submissionDate}</Text>
            </View>

            <View className="flex-row items-center justify-end mt-2">
                <Text className="text-[#125f43ff] text-sm font-semibold">View Details</Text>
                <Ionicons name="chevron-forward" size={16} color="#125f43ff" />
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#125f43ff" />
                <Text className="text-gray-600 mt-4">Loading requests...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="light-content" backgroundColor="#125f43ff" />

            {/* Header */}
            <LinearGradient
                colors={['#125f43ff', '#1a7f5a']}
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
                    <Text className="text-white text-2xl font-bold">My Requests</Text>
                </View>

                <View className="bg-white/10 rounded-2xl p-4 border border-white/20">
                    <Text className="text-white/70 text-xs mb-1">Total Requests</Text>
                    <Text className="text-white font-bold text-2xl">{requests.length}</Text>
                </View>
            </LinearGradient>

            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                <Text className="text-gray-800 text-lg font-bold mb-4 mt-4">All Requests</Text>

                {requests.map((request, index) => renderRequestItem(request, index))}

                {requests.length === 0 && (
                    <View className="items-center py-12">
                        <Ionicons name="folder-open-outline" size={64} color="#9CA3AF" />
                        <Text className="text-gray-500 text-base mt-4 text-center">No requests found</Text>
                        <Text className="text-gray-400 text-sm mt-2 text-center">Submit a verification request to track it here</Text>

                        <TouchableOpacity
                            onPress={() => navigation.navigate('MainApp')}
                            className="bg-[#125f43ff] px-8 py-3 rounded-xl mt-6"
                        >
                            <Text className="text-white font-bold">Submit Request</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Bottom Spacing */}
                <View className="h-20" />
            </ScrollView>
        </View>
    );
}