import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface DigitalSignatureViewProps {
    signedBy?: string;
    date?: string;
    hash?: string;
}

export default function DigitalSignatureView({ 
    signedBy = 'Officer Dawit Solomon', 
    date = new Date().toLocaleDateString(),
    hash = '0xRSA-7712-BE22-88AD'
}: DigitalSignatureViewProps) {
    return (
        <View className="mt-8 border-t border-gray-100 pt-8 pb-4">
            <View className="bg-slate-50 rounded-3xl p-6 border border-slate-200">
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                        <View className="bg-emerald-500 rounded-full p-1.5 mr-2">
                            <Ionicons name="shield-checkmark" size={16} color="white" />
                        </View>
                        <Text className="text-gray-900 font-bold">Document Integrity Verified</Text>
                    </View>
                    <Ionicons name="ribbon" size={24} color="#125f43" />
                </View>

                <View className="space-y-3">
                    <View className="flex-row justify-between">
                        <Text className="text-gray-500 text-xs">Digital Signature ID</Text>
                        <Text className="text-gray-900 text-xs font-mono">{hash}</Text>
                    </View>
                    <View className="flex-row justify-between">
                        <Text className="text-gray-500 text-xs">Signed By</Text>
                        <Text className="text-gray-900 text-xs font-bold">{signedBy}</Text>
                    </View>
                    <View className="flex-row justify-between">
                        <Text className="text-gray-500 text-xs">Verification Date</Text>
                        <Text className="text-gray-900 text-xs">{date}</Text>
                    </View>
                </View>

                <LinearGradient 
                    colors={['transparent', 'rgba(16, 185, 129, 0.05)', 'transparent']} 
                    className="h-px w-full my-4" 
                />

                <View className="flex-row items-center justify-center">
                    <Ionicons name="lock-closed" size={12} color="#10b981" />
                    <Text className="text-emerald-600 text-[10px] font-bold uppercase ml-1 tracking-widest">
                        End-to-End Cryptographically Sealed
                    </Text>
                </View>
            </View>
        </View>
    );
}
