import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Modal, Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

interface BiometricAuthModalProps {
    visible: boolean;
    onSuccess: () => void;
    onCancel: () => void;
    title?: string;
    reason?: string;
}

export default function BiometricAuthModal({ 
    visible, 
    onSuccess, 
    onCancel, 
    title = 'Security Verification',
    reason = 'Confirm your identity to proceed with this high-value transaction'
}: BiometricAuthModalProps) {
    const [status, setStatus] = useState<'scanning' | 'success' | 'failed'>('scanning');
    const scanLineAnim = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
        if (visible) {
            setStatus('scanning');
            startScanning();
            
            // Simulate scanning delay
            const timer = setTimeout(() => {
                setStatus('success');
                setTimeout(() => {
                    onSuccess();
                }, 1500);
            }, 3500);
            
            return () => {
                clearTimeout(timer);
                scanLineAnim.setValue(0);
            };
        }
    }, [visible]);

    const startScanning = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(scanLineAnim, {
                    toValue: 200,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(scanLineAnim, {
                    toValue: 0,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
        >
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
                <View className="flex-1 items-center justify-center px-6">
                    <View className="bg-white/95 rounded-[40px] w-full p-8 items-center shadow-2xl border border-white/20">
                        <View className="w-16 h-1 w-12 bg-gray-200 rounded-full mb-8" />
                        
                        <Text className="text-gray-900 font-bold text-xl mb-2 text-center">{title}</Text>
                        <Text className="text-gray-500 text-sm text-center mb-10 leading-5">
                            {reason}
                        </Text>

                        {/* Scanner UI */}
                        <View className="relative w-52 h-52 items-center justify-center mb-10">
                            {/* Outer Rings */}
                            <View className="absolute inset-0 rounded-full border-[3px] border-primary/5" />
                            <View className="absolute inset-4 rounded-full border border-primary/10" />
                            
                            {/* Fingerprint / Face Icon */}
                            <View className="items-center justify-center">
                                <Ionicons 
                                    name={status === 'success' ? 'checkmark-circle' : 'finger-print'} 
                                    size={100} 
                                    color={status === 'success' ? '#10b981' : '#125f43'} 
                                />
                                {status === 'scanning' && (
                                    <Animated.View 
                                        style={[
                                            styles.scanLine,
                                            { transform: [{ translateY: scanLineAnim }] }
                                        ]} 
                                    />
                                )}
                            </View>
                        </View>

                        <Text className={`font-bold mb-8 uppercase tracking-widest text-xs ${
                            status === 'success' ? 'text-emerald-500' : 'text-primary'
                        }`}>
                            {status === 'scanning' ? 'Scanning Biometrics...' : 'Identity Verified'}
                        </Text>

                        <TouchableOpacity 
                            onPress={onCancel}
                            className="bg-gray-100 px-8 py-3 rounded-2xl"
                        >
                            <Text className="text-gray-500 font-bold">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </BlurView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    scanLine: {
        position: 'absolute',
        top: -50,
        left: -20,
        right: -20,
        height: 3,
        backgroundColor: '#10b981',
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 10,
    }
});
