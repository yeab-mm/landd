import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
    OTPVerification: undefined;
    Login: undefined;
};

type OTPVerificationScreenProp = StackNavigationProp<RootStackParamList, 'Login'>;

export default function OTPVerificationScreen() {
    const navigation = useNavigation<OTPVerificationScreenProp>();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(30);
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef<Array<TextInput | null>>([]);

    // Countdown Timer
    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleOtpChange = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        // Auto-focus next input
        if (text && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleVerify = () => {
        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            Alert.alert('Error', 'Please enter the complete 6-digit OTP');
            return;
        }

        setLoading(true);
        // Simulate OTP Verification
        setTimeout(() => {
            if (otpCode === '123456') { // Mock OTP
                Alert.alert('Success', 'Phone number verified!', [
                    {
                        text: 'Continue',
                        onPress: () => navigation.navigate('Login'),
                    },
                ]);
            } else {
                Alert.alert('Error', 'Invalid OTP. Try 123456');
            }
            setLoading(false);
        }, 1500);
    };

    const handleResend = () => {
        if (timer === 0) {
            setTimer(30);
            Alert.alert('Success', 'OTP resent to your phone');
        }
    };

    return (
        <View className="flex-1">
            <StatusBar barStyle="light-content" backgroundColor="#125f43ff" />
            <LinearGradient
                colors={['#125f43ff', '#1a7f5a', '#25a072']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="flex-1 justify-center px-6"
            >
                {/* Header */}
                <View className="items-center mb-10">
                    <View className="w-20 h-20 bg-white/5 rounded-full items-center justify-center mb-6 border border-white/20">
                        <Ionicons name="shield-checkmark" size={40} color="white" />
                    </View>
                    <Text className="text-white text-3xl font-bold mb-2">Verify Phone</Text>
                    <Text className="text-white/80 text-center text-base">
                        Enter the 6-digit code sent to your phone number
                    </Text>
                </View>

                {/* OTP Inputs */}
                <View className="flex-row justify-between gap- mb-8">
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => (inputRefs.current[index] = ref)}
                            className="w-12 h-12 bg-white rounded-xl text-center text-2xl font-bold text-gray-800 border border-gray-200"
                            value={digit}
                            onChangeText={(text) => handleOtpChange(text, index)}
                            keyboardType="number-pad"
                            maxLength={1}
                        />
                    ))}
                </View>

                {/* Verify Button */}
                <TouchableOpacity
                    onPress={handleVerify}
                    disabled={loading}
                    className="bg-white py-4 rounded-xl items-center shadow-lg mb-6"
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <Text className="text-[#125f43ff] font-bold text-lg">Verifying...</Text>
                    ) : (
                        <Text className="text-[#125f43ff] font-bold text-lg">Verify OTP</Text>
                    )}
                </TouchableOpacity>

                {/* Resend OTP */}
                <View className="flex-row justify-center items-center">
                    <Text className="text-white/80 text-base">Didn't receive code? </Text>
                    {timer > 0 ? (
                        <Text className="text-white/60 text-base">Resend in {timer}s</Text>
                    ) : (
                        <TouchableOpacity onPress={handleResend}>
                            <Text className="text-white font-bold text-base underline">Resend</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Back Button */}
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="items-center mt-8"
                >
                    <Text className="text-white/70 text-sm">← Back to Registration</Text>
                </TouchableOpacity>
            </LinearGradient>
        </View>
    );
}