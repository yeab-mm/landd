import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../api/config';

// ✅ FIXED: Proper navigation types
type RootStackParamList = {
    TrackRequest: { referenceNumber?: string };
    Home: undefined;
    MainApp: undefined;
    VerificationRequest: undefined;
    ChatDetail: { chatId: string; name: string };
};

type TrackRequestScreenProp = StackNavigationProp<RootStackParamList, 'TrackRequest'>;
type TrackRequestRouteProp = RouteProp<RootStackParamList, 'TrackRequest'>;

// ✅ FIXED: Proper Request type definition
type Request = {
    referenceNumber: string;
    requestType: string;
    submissionDate: string;
    status: 'Approved' | 'Under Review' | 'Document Validation' | 'Rejected';
    plotNumber: string;
    location: string;
};

// ✅ Mock Request List Data
const MOCK_REQUESTS: Request[] = [
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
const getStatusColor = (status: Request['status']) => {
    switch (status) {
        case 'Approved': return '#125f43ff';
        case 'Under Review': return '#F59E0B';
        case 'Document Validation': return '#2563EB';
        case 'Rejected': return '#EF4444';
        default: return '#9CA3AF';
    }
};

// ✅ Get status icon
const getStatusIcon = (status: Request['status']) => {
    switch (status) {
        case 'Approved': return 'checkmark-circle' as const;
        case 'Under Review': return 'hourglass' as const;
        case 'Document Validation': return 'document-text' as const;
        case 'Rejected': return 'close-circle' as const;
        default: return 'ellipse' as const;
    }
};

export default function TrackRequestScreen() {
    const navigation = useNavigation<TrackRequestScreenProp>();
    const route = useRoute<TrackRequestRouteProp>();
    const { referenceNumber } = route.params || {};
    const { token } = useAuth();

    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
    const [requests, setRequests] = useState<Request[]>([]);

    const mapBackendStatus = (status: string): Request['status'] => {
        const s = (status || '').toLowerCase();
        if (s === 'approved') return 'Approved';
        if (s === 'rejected') return 'Rejected';
        if (s === 'document validation') return 'Document Validation';
        if (s === 'pending' || s === 'submitted' || s === 'under review') return 'Under Review';
        return 'Under Review';
    };

    const mapBackendRequestToFrontend = (req: any): Request => {
        const formData =
            typeof req.formData === 'string'
                ? (() => {
                      try {
                          return JSON.parse(req.formData);
                      } catch {
                          return {};
                      }
                  })()
                : req.formData || {};
        return {
            referenceNumber: req.referenceNumber || '',
            requestType: req.type || 'Ownership Verification',
            submissionDate: req.createdAt
                ? new Date(req.createdAt).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0],
            status: mapBackendStatus(req.status),
            plotNumber: formData.plotNumber || req.plotNumber || 'N/A',
            location: formData.region
                ? `${formData.region}, ${formData.kebele || 'Kebele'}`
                : req.region || 'N/A',
        };
    };

    useEffect(() => {
        const fetchTrackData = async () => {
            setLoading(true);
            try {
                if (referenceNumber) {
                    const response = await fetch(`${API_URL}/requests/${referenceNumber}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await response.json();
                    if (response.ok && data.request) {
                        setSelectedRequest(mapBackendRequestToFrontend(data.request));
                        setViewMode('detail');
                    } else {
                        setSelectedRequest({
                            referenceNumber,
                            requestType: 'Ownership Verification',
                            submissionDate: new Date().toISOString().split('T')[0],
                            status: 'Under Review',
                            plotNumber: 'N/A',
                            location: 'N/A'
                        });
                        setViewMode('detail');
                    }
                } else {
                    const response = await fetch(`${API_URL}/requests`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await response.json();
                    if (response.ok && data.requests) {
                        const mapped = data.requests.map(mapBackendRequestToFrontend);
                        setRequests(mapped);
                    } else {
                        setRequests([]);
                    }
                    setViewMode('list');
                }
            } catch (error) {
                console.error('Fetch tracking data error:', error);
                if (referenceNumber) {
                    setSelectedRequest({
                        referenceNumber,
                        requestType: 'Ownership Verification',
                        submissionDate: new Date().toISOString().split('T')[0],
                        status: 'Under Review',
                        plotNumber: 'N/A',
                        location: 'N/A'
                    });
                    setViewMode('detail');
                } else {
                    setRequests([]);
                    setViewMode('list');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchTrackData();
    }, [referenceNumber, token]);

    // ✅ Render Request List Item
    const renderRequestItem = (request: Request, index: number) => (
        <TouchableOpacity
            key={request.referenceNumber} // ✅ Use unique ID instead of index
            onPress={() => {
                setSelectedRequest(request);
                setViewMode('detail');
            }}
            className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
            activeOpacity={0.7}
            accessibilityLabel={`View details for request ${request.referenceNumber}`}
        >
            <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-800 font-bold text-base">{request.requestType}</Text>
                <View className={`px-3 py-1 rounded-full ${
                    request.status === 'Approved' ? 'bg-green-100' :
                    request.status === 'Under Review' ? 'bg-yellow-100' :
                    request.status === 'Document Validation' ? 'bg-blue-100' :
                    'bg-gray-100'
                }`}>
                    <Text className={`text-xs font-medium ${
                        request.status === 'Approved' ? 'text-green-700' :
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
                <View className={`rounded-2xl p-4 mb-6 ${
                    selectedRequest.status === 'Approved' ? 'bg-green-100 border border-green-200' :
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
                            <Text className={`font-bold ${
                                selectedRequest.status === 'Approved' ? 'text-green-800' :
                                selectedRequest.status === 'Rejected' ? 'text-red-800' :
                                'text-blue-800'
                            }`}>
                                {selectedRequest.status}
                            </Text>
                            <Text className={`text-sm ${
                                selectedRequest.status === 'Approved' ? 'text-green-700' :
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
                                    <View className={`w-8 h-8 rounded-full items-center justify-center ${
                                        item.status === 'completed' ? 'bg-[#125f43ff]' :
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
                                        <View className={`w-0.5 h-12 ${
                                            item.status === 'completed' ? 'bg-[#125f43ff]' : 'bg-gray-200'
                                        }`} />
                                    )}
                                </View>
                                <View className="flex-1 pb-2">
                                    <Text className={`font-semibold ${
                                        item.status === 'pending' ? 'text-gray-400' : 'text-gray-800'
                                    }`}>
                                        {item.title}
                                    </Text>
                                    <Text className={`text-sm ${
                                        item.status === 'pending' ? 'text-gray-400' : 'text-gray-600'
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

                {/* Contact Officer - ✅ FIXED: Proper navigation typing */}
                <TouchableOpacity 
                    onPress={() => navigation.navigate('ChatDetail', { 
                        chatId: `officer-${selectedRequest.referenceNumber}`, 
                        name: 'Land Officer (Assigned)' 
                    })}
                    className="flex-row items-center justify-center bg-[#125f43ff]/10 py-3 rounded-xl border border-[#125f43ff]/20 mb-6"
                    accessibilityLabel="Contact assigned land officer"
                >
                    <Ionicons name="chatbubble-ellipses" size={20} color="#125f43ff" />
                    <Text className="text-[#125f43ff] font-bold ml-2">Contact Assigned Officer</Text>
                </TouchableOpacity>

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
                        accessibilityLabel="Back to request list"
                    >
                        <Text className="text-white font-bold text-lg">Back to Request List</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('MainApp')}
                        className="bg-white border-2 border-[#125f43ff] py-4 rounded-xl items-center"
                        activeOpacity={0.8}
                        accessibilityLabel="Back to home dashboard"
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
                        accessibilityLabel={viewMode === 'detail' ? 'Back to request list' : 'Go back to previous screen'}
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