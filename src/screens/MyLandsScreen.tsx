// File: src/screens/MyLandsScreen.tsx
// Purpose: Personalized My Lands list with Premium UI

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../api/config';

export default function MyLandsScreen({ navigation }: any) {
    const { token } = useAuth();
    const [lands, setLands] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchLands = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_URL}/lands`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setLands(data.lands || []);
        } catch (error) {
            console.error('Fetch lands error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchLands();
    }, [token]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchLands();
    };

    const getStatusColor = (verified: boolean) => {
        return verified
            ? { bg: 'bg-green-100', text: 'text-green-700', icon: 'checkmark-circle' }
            : { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: 'time' };
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#125f43" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="light-content" backgroundColor="#125f43ff" />

            <LinearGradient
                colors={['#125f43ff', '#1a7f5a']}
                className="px-6 pt-14 pb-8 rounded-b-[40px] shadow-lg"
            >
                <Text className="text-white text-3xl font-extrabold">My Lands</Text>
                <Text className="text-white/80 text-sm mt-1">Manage your registered properties</Text>
            </LinearGradient>

            <ScrollView 
                className="flex-1 px-6" 
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} color="#125f43" />}
            >
                <View className="py-8">
                    {lands.length === 0 ? (
                        <View className="items-center py-10 bg-white rounded-3xl border border-dashed border-gray-300">
                            <Ionicons name="map-outline" size={60} color="#d1d5db" />
                            <Text className="text-gray-400 mt-4 font-medium">No properties registered yet</Text>
                        </View>
                    ) : (
                        lands.map((land) => (
                            <TouchableOpacity
                                key={land.id}
                                onPress={() => navigation.navigate('MyLands', { landId: land.id })}
                                className="bg-white rounded-3xl p-6 mb-4 shadow-sm border border-gray-100"
                                activeOpacity={0.8}
                            >
                                <View className="flex-row items-start mb-4">
                                    <View className="bg-green-50 rounded-2xl p-3 mr-4">
                                        <Ionicons name="location" size={24} color="#125f43" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-900 font-bold text-xl">{land.plotNumber}</Text>
                                        <Text className="text-gray-500 text-sm">{land.region}, {land.zone}</Text>
                                    </View>
                                </View>

                                <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-gray-50">
                                    <View className="flex-row items-center">
                                        <Ionicons name="expand" size={18} color="#9CA3AF" />
                                        <Text className="text-gray-600 text-sm ml-2 font-medium">{land.landSize} m²</Text>
                                    </View>
                                    <View className={`flex-row items-center px-3 py-1.5 rounded-full ${getStatusColor(land.verified).bg}`}>
                                        <Ionicons name={getStatusColor(land.verified).icon as any} size={14} color={land.verified ? '#059669' : '#D97706'} />
                                        <Text className={`text-[10px] font-bold ml-1.5 uppercase ${getStatusColor(land.verified).text}`}>
                                            {land.verified ? 'Verified' : 'Pending'}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                <TouchableOpacity
                    onPress={() => navigation.navigate('AddLandListing')}
                    className="flex-row items-center justify-center py-4 rounded-2xl shadow-lg mb-12"
                    style={{ backgroundColor: '#125f43ff' }}
                >
                    <Ionicons name="add-circle" size={20} color="white" />
                    <Text className="text-white font-bold text-base ml-2">Register New Land</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}