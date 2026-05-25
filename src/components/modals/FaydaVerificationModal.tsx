import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useLanguage } from '../../context/LanguageContext';

interface FaydaVerificationModalProps {
    visible: boolean;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function FaydaVerificationModal({ visible, onSuccess, onCancel }: FaydaVerificationModalProps) {
    const { t } = useLanguage();
    const [status, setStatus] = useState<'scanning' | 'verifying' | 'success'>('scanning');
    const [progress] = useState(new Animated.Value(0));
    const [pulse] = useState(new Animated.Value(1));

    useEffect(() => {
        if (visible) {
            startVerification();
        } else {
            reset();
        }
    }, [visible]);

    const startVerification = () => {
        // Scanning animation
        Animated.sequence([
            Animated.timing(progress, {
                toValue: 1,
                duration: 2500,
                useNativeDriver: false,
            }),
        ]).start(() => {
            setStatus('verifying');
            setTimeout(() => {
                setStatus('success');
                setTimeout(() => {
                    onSuccess();
                }, 1500);
            }, 2000);
        });

        // Pulse animation for biometric icon
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, {
                    toValue: 1.2,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulse, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    const reset = () => {
        setStatus('scanning');
        progress.setValue(0);
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <BlurView intensity={30} className="flex-1 items-center justify-center bg-black/40">
                <View className="bg-white rounded-[40px] px-8 py-10 w-[85%] items-center shadow-2xl">
                    <View className="bg-primary/10 p-5 rounded-full mb-6">
                        <Animated.View style={{ transform: [{ scale: pulse }] }}>
                            <Ionicons 
                                name={status === 'success' ? 'checkmark-circle' : 'finger-print'} 
                                size={60} 
                                color={status === 'success' ? '#10B981' : '#125f43'} 
                            />
                        </Animated.View>
                    </View>

                    <Text className="text-gray-900 text-2xl font-bold text-center mb-2">
                        {status === 'scanning' ? t('auth.faydaHandshake') : status === 'verifying' ? t('auth.verifying') : t('auth.verified')}
                    </Text>
                    <Text className="text-gray-500 text-center mb-8">
                        {status === 'scanning' ? 'Establishing secure link with National ID Database...' : 'Performing biometric cross-reference...'}
                    </Text>

                    {status !== 'success' && (
                        <View className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-8">
                            <Animated.View 
                                style={{
                                    width: progress.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0%', '100%'],
                                    }),
                                    backgroundColor: '#125f43',
                                    height: '100%',
                                }}
                            />
                        </View>
                    )}

                    {status === 'success' ? (
                        <View className="bg-green-100 px-4 py-2 rounded-full flex-row items-center">
                            <Ionicons name="shield-checkmark" size={16} color="#059669" />
                            <Text className="text-green-700 text-xs font-bold ml-2">Identity Authenticated</Text>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={onCancel} className="mt-2">
                            <Text className="text-gray-400 font-semibold">{t('common.cancel')}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Secure Badge */}
                <View className="absolute bottom-12 flex-row items-center bg-white/20 px-4 py-2 rounded-full border border-white/30">
                    <Ionicons name="lock-closed" size={14} color="white" />
                    <Text className="text-white text-[10px] font-bold ml-2 tracking-widest uppercase">RSA-2048 Bit Encryption Active</Text>
                </View>
            </BlurView>
        </Modal>
    );
}
