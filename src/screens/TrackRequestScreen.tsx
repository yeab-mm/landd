import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

type RootStackParamList = {
    TrackRequest: { referenceNumber?: string };
    Home: undefined;
    MainApp: undefined;
    VerificationRequest: undefined;
};

type TrackRequestScreenProp = StackNavigationProp<RootStackParamList, 'TrackRequest'>;
type TrackRequestRouteProp = RouteProp<RootStackParamList, 'TrackRequest'>;

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

// ✅ Get status color
const getStatusColor = (status: string) => {
    switch (status) {
        case 'Approved': return '#125f43ff';
        case 'Under Review': return '#F59E0B';
        case 'Document Validation': return '#2563EB';
        case 'Rejected': return '#EF4444';
        default: return '#9CA3AF';
    }
};

// ✅ Get status icon
const getStatusIcon = (status: string) => {
    switch (status) {
        case 'Approved': return 'checkmark-circle';
        case 'Under Review': return 'hourglass';
        case 'Document Validation': return 'document-text';
        case 'Rejected': return 'close-circle';
        default: return 'ellipse';
    }
};

export default function TrackRequestScreen() {
    const navigation = useNavigation<TrackRequestScreenProp>();
    const route = useRoute<TrackRequestRouteProp>();
    const { referenceNumber } = route.params || {};

    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'detail'>('list'); // ✅ List or Detail view
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [requests, setRequests] = useState<any[]>([]);

    useEffect(() => {
        setTimeout(() => {
            // ✅ If referenceNumber provided (from Verification), show that request directly
            if (referenceNumber) {
                const foundRequest = MOCK_REQUESTS.find(req => req.referenceNumber === referenceNumber) || {
                    referenceNumber,
                    requestType: 'Ownership Verification',
                    submissionDate: new Date().toISOString().split('T')[0],
                    status: 'Under Review',
                    plotNumber: 'PLOT-2024-12345',
                    location: 'Bahir Dar, Kebele 03',
                };
                setSelectedRequest(foundRequest);
                setViewMode('detail');
            } else {
                // ✅ Otherwise show list of all requests
                setRequests(MOCK_REQUESTS);
                setViewMode('list');
            }
            setLoading(false);
        }, 500);
    }, [referenceNumber]);

    // ✅ Render Request List Item
    const renderRequestItem = (request: any, index: number) => (
        <TouchableOpacity
            key={index}
            onPress={() => {
                setSelectedRequest(request);
                setViewMode('detail');
            }}
            className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
            activeOpacity={0.7}
        >
            <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-800 font-bold text-base">{request.requestType}</Text>
                <View className={`px-3 py-1 rounded-full ${request.status === 'Approved' ? 'bg-green-100' :
                    request.status === 'Under Review' ? 'bg-yellow-100' :
                        request.status === 'Document Validation' ? 'bg-blue-100' :
                            'bg-gray-100'
                    }`}>
                    <Text className={`text-xs font-medium ${request.status === 'Approved' ? 'text-green-700' :
                        request.status === 'Under Review' ? 'text-yellow-700' :
                            request.status === 'Document Validation' ? 'text-blue-700' :
                                'text-gray-700'
                        }`}>
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

    // ✅ Render Request Detail View
    const renderRequestDetail = () => {
        if (!selectedRequest) return null;

        const timeline = [
            {
                step: 1,
                title: 'Request Submitted',
                description: 'Your verification request has been received',
                date: selectedRequest.submissionDate,
                status: 'completed' as const,
            },
            {
                step: 2,
                title: 'Under Review',
                description: 'Land officer is reviewing your documents',
                date: selectedRequest.status === 'Under Review' || selectedRequest.status === 'Document Validation' || selectedRequest.status === 'Approved' ? new Date().toISOString().split('T')[0] : null,
                status: (selectedRequest.status === 'Under Review' || selectedRequest.status === 'Document Validation' || selectedRequest.status === 'Approved') ? 'active' as const : 'pending' as const,
            },
            {
                step: 3,
                title: 'Document Validation',
                description: 'Supporting documents are being verified',
                date: selectedRequest.status === 'Document Validation' || selectedRequest.status === 'Approved' ? new Date().toISOString().split('T')[0] : null,
                status: (selectedRequest.status === 'Document Validation' || selectedRequest.status === 'Approved') ? 'active' as const : 'pending' as const,
            },
            {
                step: 4,
                title: 'Final Approval',
                description: 'Final verification and certificate generation',
                date: selectedRequest.status === 'Approved' ? new Date().toISOString().split('T')[0] : null,
                status: selectedRequest.status === 'Approved' ? 'completed' as const : 'pending' as const,
            },
        ];

        return (
            <View>
                {/* Current Status Banner */}
                <View className={`rounded-2xl p-4 mb-6 ${selectedRequest.status === 'Approved' ? 'bg-green-100 border border-green-200' :
                    selectedRequest.status === 'Rejected' ? 'bg-red-100 border border-red-200' :
                        'bg-blue-100 border border-blue-200'
                    }`}>
                    <View className="flex-row items-center">
                        <Ionicons
                            name={getStatusIcon(selectedRequest.status)}
                            size={24}
                            color={getStatusColor(selectedRequest.status)}
                        />
                        <View className="ml-3 flex-1">
                            <Text className={`font-bold ${selectedRequest.status === 'Approved' ? 'text-green-800' :
                                selectedRequest.status === 'Rejected' ? 'text-red-800' :
                                    'text-blue-800'
                                }`}>
                                {selectedRequest.status}
                            </Text>
                            <Text className={`text-sm ${selectedRequest.status === 'Approved' ? 'text-green-700' :
                                selectedRequest.status === 'Rejected' ? 'text-red-700' :
                                    'text-blue-700'
                                }`}>
                                Estimated completion: 3-5 business days
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Progress Timeline */}
                <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
                    <Text className="text-gray-800 text-lg font-bold mb-4">Progress</Text>

                    {timeline.map((item: any, index: number) => (
                        <View key={item.step} className="mb-6 last:mb-0">
                            <View className="flex-row">
                                <View className="items-center mr-4">
                                    <View className={`w-8 h-8 rounded-full items-center justify-center ${item.status === 'completed' ? 'bg-[#125f43ff]' :
                                        item.status === 'active' ? 'bg-[#F59E0B]' :
                                            'bg-gray-200'
                                        }`}>
                                        <Ionicons
                                            name={item.status === 'completed' ? 'checkmark-circle' :
                                                item.status === 'active' ? 'hourglass' : 'ellipse'}
                                            size={18}
                                            color={item.status === 'pending' ? '#9CA3AF' : 'white'}
                                        />
                                    </View>
                                    {index < timeline.length - 1 && (
                                        <View className={`w-0.5 h-12 ${item.status === 'completed' ? 'bg-[#125f43ff]' : 'bg-gray-200'
                                            }`} />
                                    )}
                                </View>
                                <View className="flex-1 pb-2">
                                    <Text className={`font-semibold ${item.status === 'pending' ? 'text-gray-400' : 'text-gray-800'
                                        }`}>
                                        {item.title}
                                    </Text>
                                    <Text className={`text-sm ${item.status === 'pending' ? 'text-gray-400' : 'text-gray-600'
                                        }`}>
                                        {item.description}
                                    </Text>
                                    {item.date && (
                                        <Text className="text-xs text-gray-500 mt-1">{item.date}</Text>
                                    )}
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Request Info */}
                <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
                    <Text className="text-gray-800 text-lg font-bold mb-4">Request Information</Text>
                    <View className="space-y-3">
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">Reference Number:</Text>
                            <Text className="text-gray-800 font-semibold">{selectedRequest.referenceNumber}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">Request Type:</Text>
                            <Text className="text-gray-800 font-semibold">{selectedRequest.requestType}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">Plot Number:</Text>
                            <Text className="text-gray-800 font-semibold">{selectedRequest.plotNumber}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">Location:</Text>
                            <Text className="text-gray-800 font-semibold">{selectedRequest.location}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">Submission Date:</Text>
                            <Text className="text-gray-800 font-semibold">{selectedRequest.submissionDate}</Text>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View className="space-y-3 pb-8">
                    <TouchableOpacity
                        onPress={() => setViewMode('list')}
                        className="bg-[#125f43ff] py-4 rounded-xl items-center shadow-lg"
                        activeOpacity={0.8}
                    >
                        <Text className="text-white font-bold text-lg">Back to Request List</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('MainApp')}
                        className="bg-white border-2 border-[#125f43ff] py-4 rounded-xl items-center"
                        activeOpacity={0.8}
                    >
                        <Text className="text-[#125f43ff] font-bold text-lg">Back to Dashboard</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

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
                        onPress={() => viewMode === 'detail' ? setViewMode('list') : navigation.goBack()}
                        className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3"
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-2xl font-bold">
                        {viewMode === 'list' ? 'My Requests' : 'Request Details'}
                    </Text>
                </View>

                {viewMode === 'list' && (
                    <View className="bg-white/10 rounded-2xl p-4 border border-white/20">
                        <Text className="text-white/70 text-xs mb-1">Total Requests</Text>
                        <Text className="text-white font-bold text-2xl">{requests.length}</Text>
                    </View>
                )}
            </LinearGradient>

            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                {viewMode === 'list' ? (
                    // ✅ REQUEST LIST VIEW
                    <View>
                        <Text className="text-gray-800 text-lg font-bold mb-4 mt-4">All Requests</Text>
                        {requests.map((request, index) => renderRequestItem(request, index))}

                        {requests.length === 0 && (
                            <View className="items-center py-12">
                                <Ionicons name="folder-open-outline" size={64} color="#9CA3AF" />
                                <Text className="text-gray-500 text-base mt-4 text-center">No requests found</Text>
                                <Text className="text-gray-400 text-sm mt-2 text-center">Submit a verification request to track it here</Text>
                            </View>
                        )}
                    </View>
                ) : (
                    // ✅ REQUEST DETAIL VIEW
                    renderRequestDetail()
                )}
            </ScrollView>
        </View>
    );
}