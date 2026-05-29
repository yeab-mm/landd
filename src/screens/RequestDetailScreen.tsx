import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

type RootStackParamList = {
    RequestDetail: { referenceNumber: string };
    MyRequests: undefined;
    MainApp: undefined;
    VerificationRequest: undefined;
};

type RequestDetailScreenProp = StackNavigationProp<RootStackParamList, 'RequestDetail'>;
type RequestDetailRouteProp = RouteProp<RootStackParamList, 'RequestDetail'>;

// ✅ Mock Request Detail Data
const getRequestDetail = (referenceNumber: string) => {
    return {
        referenceNumber,
        requestType: 'Ownership Verification',
        submissionDate: '2024-04-02',
        status: 'Under Review',
        plotNumber: 'PLOT-2024-12345',
        location: 'Bahir Dar, Kebele 03',
        landSize: '450 m²',
        landUse: 'Residential',
        ownerName: 'Abebe Gizaw',
        ownerNationalId: '1234 5678 9012 3456',
        documents: [
            { name: 'Land Title Deed (Sened)', status: 'Verified', uploaded: true },
            { name: 'Survey Map', status: 'Verified', uploaded: true },
            { name: 'Owner ID Copy', status: 'Auto-verified', uploaded: true },
        ],
        timeline: [
            {
                step: 1,
                title: 'Request Submitted',
                description: 'Your verification request has been received',
                date: '2024-04-02',
                status: 'completed' as const,
            },
            {
                step: 2,
                title: 'Under Review',
                description: 'Land officer is reviewing your documents',
                date: '2024-04-03',
                status: 'active' as const,
            },
            {
                step: 3,
                title: 'Document Validation',
                description: 'Supporting documents are being verified',
                date: null,
                status: 'pending' as const,
            },
            {
                step: 4,
                title: 'Final Approval',
                description: 'Final verification and certificate generation',
                date: null,
                status: 'pending' as const,
            },
        ],
        officerNotes: 'Documents received. Awaiting field verification.',
    };
};

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
        case 'completed': return 'checkmark-circle';
        case 'active': return 'hourglass';
        case 'pending': return 'ellipse';
        case 'rejected': return 'close-circle';
        default: return 'ellipse';
    }
};

export default function RequestDetailScreen() {
    const navigation = useNavigation<RequestDetailScreenProp>();
    const route = useRoute<RequestDetailRouteProp>();
    const { referenceNumber } = route.params;

    const [loading, setLoading] = useState(true);
    const [requestDetail, setRequestDetail] = useState<any>(null);

    useEffect(() => {
        setTimeout(() => {
            setRequestDetail(getRequestDetail(referenceNumber));
            setLoading(false);
        }, 500);
    }, [referenceNumber]);

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#125f43ff" />
                <Text className="text-gray-600 mt-4">Loading request details...</Text>
            </View>
        );
    }

    if (!requestDetail) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <Ionicons name="alert-circle-outline" size={64} color="#9CA3AF" />
                <Text className="text-gray-600 mt-4">Request not found</Text>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="bg-[#125f43ff] px-8 py-3 rounded-xl mt-4"
                >
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
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
                        className="w-10 h-10 rounded-full bg-white/5 items-center justify-center mr-3"
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-2xl font-bold">Request Details</Text>
                </View>

                <View className="bg-white/5 rounded-2xl p-4 border border-white/20">
                    <Text className="text-white/5 text-xs mb-1">Reference Number</Text>
                    <Text className="text-white font-mono font-bold text-lg">{requestDetail.referenceNumber}</Text>
                    <Text className="text-white/70 text-xs mt-2">Submitted: {requestDetail.submissionDate}</Text>
                </View>
            </LinearGradient>

            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                {/* Current Status Banner */}
                <View className={`rounded-2xl p-4 mb-6 ${requestDetail.status === 'Approved' ? 'bg-green-100 border border-green-200' :
                    requestDetail.status === 'Rejected' ? 'bg-red-100 border border-red-200' :
                        'bg-blue-100 border border-blue-200'
                    }`}>
                    <View className="flex-row items-center">
                        <Ionicons
                            name={requestDetail.status === 'Approved' ? 'checkmark-circle' :
                                requestDetail.status === 'Rejected' ? 'close-circle' : 'hourglass'}
                            size={24}
                            color={getStatusColor(requestDetail.status)}
                        />
                        <View className="ml-3 flex-1">
                            <Text className={`font-bold ${requestDetail.status === 'Approved' ? 'text-green-800' :
                                requestDetail.status === 'Rejected' ? 'text-red-800' :
                                    'text-blue-800'
                                }`}>
                                {requestDetail.status}
                            </Text>
                            <Text className={`text-sm ${requestDetail.status === 'Approved' ? 'text-green-700' :
                                requestDetail.status === 'Rejected' ? 'text-red-700' :
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

                    {requestDetail.timeline.map((item: any, index: number) => (
                        <View key={item.step} className="mb-6 last:mb-0">
                            <View className="flex-row">
                                <View className="items-center mr-4">
                                    <View className={`w-8 h-8 rounded-full items-center justify-center ${item.status === 'completed' ? 'bg-[#125f43ff]' :
                                        item.status === 'active' ? 'bg-[#F59E0B]' :
                                            'bg-gray-200'
                                        }`}>
                                        <Ionicons
                                            name={getStatusIcon(item.status)}
                                            size={18}
                                            color={item.status === 'pending' ? '#9CA3AF' : 'white'}
                                        />
                                    </View>
                                    {index < requestDetail.timeline.length - 1 && (
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

                {/* Request Information */}
                <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
                    <Text className="text-gray-800 text-lg font-bold mb-4">Request Information</Text>
                    <View className="space-y-3">
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">Request Type:</Text>
                            <Text className="text-gray-800 font-semibold">{requestDetail.requestType}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">Plot Number:</Text>
                            <Text className="text-gray-800 font-semibold">{requestDetail.plotNumber}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">Location:</Text>
                            <Text className="text-gray-800 font-semibold">{requestDetail.location}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">Land Size:</Text>
                            <Text className="text-gray-800 font-semibold">{requestDetail.landSize}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">Land Use:</Text>
                            <Text className="text-gray-800 font-semibold">{requestDetail.landUse}</Text>
                        </View>
                    </View>
                </View>

                {/* Owner Information */}
                <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
                    <Text className="text-gray-800 text-lg font-bold mb-4">Owner Information</Text>
                    <View className="space-y-3">
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">Owner Name:</Text>
                            <Text className="text-gray-800 font-semibold">{requestDetail.ownerName}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">National ID:</Text>
                            <Text className="text-gray-800 font-semibold">{requestDetail.ownerNationalId}</Text>
                        </View>
                    </View>
                </View>

                {/* Documents Status */}
                <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
                    <Text className="text-gray-800 text-lg font-bold mb-4">Documents</Text>
                    {requestDetail.documents.map((doc: any, index: number) => (
                        <View
                            key={index}
                            className={`flex-row items-center py-3 ${index !== requestDetail.documents.length - 1 ? 'border-b border-gray-100' : ''
                                }`}
                        >
                            <Ionicons
                                name={doc.uploaded ? 'document' : 'document-outline'}
                                size={20}
                                color={doc.uploaded ? '#125f43ff' : '#9CA3AF'}
                            />
                            <View className="ml-3 flex-1">
                                <Text className="text-gray-800 text-sm">{doc.name}</Text>
                            </View>
                            <View className={`px-3 py-1 rounded-full ${doc.status === 'Verified' ? 'bg-green-100' :
                                doc.status === 'Auto-verified' ? 'bg-blue-100' :
                                    'bg-gray-100'
                                }`}>
                                <Text className={`text-xs font-medium ${doc.status === 'Verified' ? 'text-green-700' :
                                    doc.status === 'Auto-verified' ? 'text-blue-700' :
                                        'text-gray-700'
                                    }`}>
                                    {doc.status}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Officer Notes */}
                {requestDetail.officerNotes && (
                    <View className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200 mb-6">
                        <View className="flex-row items-start">
                            <Ionicons name="information-circle" size={20} color="#F59E0B" />
                            <Text className="text-yellow-800 text-sm ml-2 flex-1">
                                <Text className="font-semibold">Officer Note:</Text> {requestDetail.officerNotes}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Action Buttons */}
                <View className="space-y-3 pb-8">
                    <TouchableOpacity
                        onPress={() => navigation.navigate('MyRequests')}
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
                        <Text className="text-[#125f43ff] font-bold text-lg">Back to Home</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('VerificationRequest')}
                        className="bg-white border-2 border-[#125f43ff] py-4 rounded-xl items-center"
                        activeOpacity={0.8}
                    >
                        <Text className="text-[#125f43ff] font-bold text-lg">Submit Another Request</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}