import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function MyLandsScreen() {
    const lands = [
        { id: 1, plotNumber: 'BDU-2024-001', location: 'Bahir Dar, Kebele 03', area: '450 m²', status: 'Verified' },
        { id: 2, plotNumber: 'BDU-2023-089', location: 'Bahir Dar, Kebele 07', area: '320 m²', status: 'Pending' },
        { id: 3, plotNumber: 'BDU-2022-156', location: 'Bahir Dar, Kebele 12', area: '600 m²', status: 'Verified' },
    ];

    const getStatusColor = (status: string) => {
        return status === 'Verified'
            ? { bg: 'bg-green-100', text: 'text-green-700', icon: 'checkmark-circle' }
            : { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: 'time' };
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
                <Text className="text-white text-2xl font-bold mb-1">My Lands</Text>
                <Text className="text-white/80 text-sm">View your registered properties</Text>
            </LinearGradient>

            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                <View className="py-6">
                    {lands.map((land, index) => (
                        <TouchableOpacity
                            key={land.id}
                            className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100"
                            activeOpacity={0.8}
                        >
                            <View className="flex-row items-start mb-3">
                                <View className="bg-green-100 rounded-xl p-3 mr-4">
                                    <Ionicons name="location" size={24} color="#125f43ff" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-800 font-bold text-lg">{land.plotNumber}</Text>
                                    <Text className="text-gray-600 text-sm">{land.location}</Text>
                                </View>
                            </View>

                            <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                <View className="flex-row items-center">
                                    <Ionicons name="expand" size={18} color="#9CA3AF" />
                                    <Text className="text-gray-600 text-sm ml-2">{land.area}</Text>
                                </View>
                                <View className={`flex-row items-center px-3 py-1.5 rounded-full ${getStatusColor(land.status).bg}`}>
                                    <Ionicons name={getStatusColor(land.status).icon as any} size={16} color={land.status === 'Verified' ? '#059669' : '#D97706'} />
                                    <Text className={`text-xs font-semibold ml-1.5 ${getStatusColor(land.status).text}`}>
                                        {land.status}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Add New Land Button */}
                <TouchableOpacity
                    className="flex-row items-center justify-center py-3 rounded-2xl shadow-lg mb-8"
                    style={{ backgroundColor: '#125f43ff' }}
                    activeOpacity={0.8}
                >
                    <Ionicons name="add-circle" size={18} color="white" />
                    <Text className="text-white font-bold text-sm ml-2">Register New Land</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}