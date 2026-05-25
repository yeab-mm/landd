import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function MyDocumentsScreen() {
    const documents = [
        { id: 1, title: 'Ownership Certificate', type: 'PDF', date: 'March 15, 2024', plotNumber: 'BDU-2024-001' },
        { id: 2, title: 'Land Registration Doc', type: 'PDF', date: 'February 20, 2024', plotNumber: 'BDU-2023-089' },
        { id: 3, title: 'Transfer Agreement', type: 'PDF', date: 'January 10, 2024', plotNumber: 'BDU-2022-156' },
        { id: 4, title: 'Tax Clearance', type: 'PDF', date: 'December 5, 2023', plotNumber: 'BDU-2024-001' },
    ];

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
                    {documents.map((doc, index) => (
                        <TouchableOpacity
                            key={doc.id}
                            className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100"
                            activeOpacity={0.8}
                        >
                            <View className="flex-row items-start">
                                <View className="bg-green-100 rounded-xl p-3 mr-4">
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
                                <Ionicons name="download" size={20} color="#125f43ff" />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}