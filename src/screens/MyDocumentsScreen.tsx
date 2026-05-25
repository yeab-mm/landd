import React from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    StatusBar,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// ✅ Document type definition
type Document = {
    id: number;
    title: string;
    type: 'PDF' | 'DOC' | 'IMG';
    date: string;
    plotNumber: string;
    fileUrl?: string; // For backend integration
};

export default function MyDocumentsScreen() {
    // ✅ Mock data - replace with API call in production
    const documents: Document[] = [
        { id: 1, title: 'Ownership Certificate', type: 'PDF', date: 'March 15, 2024', plotNumber: 'BDU-2024-001' },
        { id: 2, title: 'Land Registration Doc', type: 'PDF', date: 'February 20, 2024', plotNumber: 'BDU-2023-089' },
        { id: 3, title: 'Transfer Agreement', type: 'PDF', date: 'January 10, 2024', plotNumber: 'BDU-2022-156' },
        { id: 4, title: 'Tax Clearance', type: 'PDF', date: 'December 5, 2023', plotNumber: 'BDU-2024-001' },
    ];

    // ✅ Handle document download
    const handleDownload = (doc: Document) => {
        // TODO: Replace with real download logic in production
        Alert.alert(
            'Download Document',
            `Download ${doc.title} for plot ${doc.plotNumber}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Download',
                    onPress: () => {
                        // Simulate download success
                        Alert.alert('✓ Success', `${doc.title} downloaded successfully`);
                        
                        // In production, you would:
                        // 1. Fetch signed URL: GET /api/documents/${doc.id}/download
                        // 2. Use expo-file-system to save to device
                        // 3. Use expo-sharing to open/share the file
                    }
                }
            ]
        );
    };

    // ✅ Handle view document details
    const handleViewDocument = (doc: Document) => {
        Alert.alert(
            doc.title,
            `Plot: ${doc.plotNumber}\nType: ${doc.type}\nDate: ${doc.date}\n\nThis would open a document viewer in production.`,
            [
                { text: 'Close', style: 'cancel' },
                { text: 'Download', onPress: () => handleDownload(doc) }
            ]
        );
    };

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="light-content" backgroundColor="#125f43ff" />

            {/* Header */}
            <LinearGradient
                colors={['#125f43ff', '#125f43ff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                className="px-6 pt-10 pb-6 rounded-b-3xl"
            >
                <Text className="text-white text-2xl font-bold mb-1">My Documents</Text>
                <Text className="text-white/80 text-sm">Access your land certificates</Text>
            </LinearGradient>

            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                <View className="py-6">
                    {/* ✅ Empty state handling */}
                    {documents.length === 0 ? (
                        <View className="items-center py-12">
                            <Ionicons name="document-outline" size={64} color="#9CA3AF" />
                            <Text className="text-gray-500 text-base mt-4 text-center">No documents yet</Text>
                            <Text className="text-gray-400 text-sm text-center mt-1">
                                Your land certificates and documents will appear here
                            </Text>
                        </View>
                    ) : (
                        documents.map((doc) => (
                            <TouchableOpacity
                                key={doc.id}
                                onPress={() => handleViewDocument(doc)}
                                className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100"
                                activeOpacity={0.8}
                                accessibilityLabel={`View ${doc.title} for plot ${doc.plotNumber}`}
                            >
                                <View className="flex-row items-start">
                                    <View className="bg-[#125f43ff]/10 rounded-xl p-3 mr-4">
                                        <Ionicons name="document-text" size={24} color="#125f43ff" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-800 font-bold text-base mb-1">{doc.title}</Text>
                                        <Text className="text-gray-600 text-sm">{doc.plotNumber}</Text>
                                        <View className="flex-row items-center mt-2">
                                            <View className="bg-red-100 px-2 py-0.5 rounded mr-3">
                                                <Text className="text-red-700 text-xs font-semibold">{doc.type}</Text>
                                            </View>
                                            <Text className="text-gray-400 text-xs">{doc.date}</Text>
                                        </View>
                                    </View>
                                    {/* ✅ FIXED: Download button with functionality */}
                                    <TouchableOpacity 
                                        onPress={(e) => {
                                            e.stopPropagation(); // Prevent card tap when downloading
                                            handleDownload(doc);
                                        }}
                                        className="p-2"
                                        accessibilityLabel={`Download ${doc.title}`}
                                    >
                                        <Ionicons name="download" size={20} color="#125f43ff" />
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
}