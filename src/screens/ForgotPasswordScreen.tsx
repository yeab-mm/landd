import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StatusBar,
    Alert,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    ActivityIndicator,
    ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';

// Components
import { Button } from '../components/ui/Button';

// ✅ FIXED: Navigation types with proper identifier param
type RootStackParamList = {
    ForgotPassword: undefined;
    Login: undefined;
    OTPVerification: { identifier: string; action: 'reset'; method: 'email' | 'phone' | 'fayda' };
};

type ForgotPasswordScreenProp = StackNavigationProp<RootStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: { navigation: ForgotPasswordScreenProp }) {
    const [recoveryMethod, setRecoveryMethod] = useState<'email' | 'phone' | 'fayda'>('email');
    const [identifier, setIdentifier] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ identifier?: string }>({});

    // ✅ Validation Functions
    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const validatePhone = (phone: string) => {
        const re = /^(\+251|0)?9\d{8}$/;
        return re.test(phone.replace(/\s/g, ''));
    };

    const validateFaydaId = (faydaId: string) => {
        const re = /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/;
        return re.test(faydaId);
    };

    // ✅ Handle Send Reset Code
    const handleSendResetCode = async () => {
        setErrors({});

        // Validate input
        if (!identifier.trim()) {
            const errorMsg = `Please enter your ${getRecoveryConfig().label}`;
            setErrors({ identifier: errorMsg });
            Alert.alert('Validation Error', errorMsg);
            return;
        }

        if (recoveryMethod === 'email' && !validateEmail(identifier)) {
            setErrors({ identifier: 'Please enter a valid email address' });
            Alert.alert('Validation Error', 'Please enter a valid email address');
            return;
        }

        if (recoveryMethod === 'phone' && !validatePhone(identifier)) {
            setErrors({ identifier: 'Please enter a valid Ethiopian phone number (+251 9XX XXX XXX)' });
            Alert.alert('Validation Error', 'Please enter a valid Ethiopian phone number');
            return;
        }

        if (recoveryMethod === 'fayda' && !validateFaydaId(identifier)) {
            setErrors({ identifier: 'Please enter valid Fayda ID (1234 5678 9012 3456)' });
            Alert.alert('Validation Error', 'Please enter valid Fayda ID');
            return;
        }

        setLoading(true);

        try {
            // ✅ Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // ✅ FIXED: Pass proper params to OTPVerification
            navigation.navigate('OTPVerification', {
                identifier: identifier.trim(),
                action: 'reset',
                method: recoveryMethod
            });

        } catch (error) {
            console.error('Send reset code error:', error);
            Alert.alert('Error', 'Failed to send reset code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ✅ Get Recovery Config
    const getRecoveryConfig = () => {
        switch (recoveryMethod) {
            case 'email':
                return {
                    placeholder: 'email@example.com',
                    keyboardType: 'email-address' as const,
                    icon: 'mail-outline' as const,
                    label: 'Email Address',
                    info: 'We\'ll send a reset link to your email'
                };
            case 'phone':
                return {
                    placeholder: '+251 9XX XXX XXX',
                    keyboardType: 'phone-pad' as const,
                    icon: 'phone-portrait-outline' as const,
                    label: 'Phone Number',
                    info: 'We\'ll send a 6-digit code via SMS'
                };
            case 'fayda':
                return {
                    placeholder: '1234 5678 9012 3456',
                    keyboardType: 'numeric' as const,
                    icon: 'card-outline' as const,
                    label: 'Fayda National ID',
                    info: 'We\'ll verify your identity and send reset instructions'
                };
        }
    };

    const config = getRecoveryConfig();

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
                <View className="flex-1">
                    <StatusBar barStyle="light-content" backgroundColor="#125f43ff" />

                    {/* Gradient Background */}
                    <LinearGradient
                        colors={['#125f43ff', '#1a7f5a']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        className="flex-1 px-7"
                    >
                        {/* Header */}
                        <View className="pt-12 pb-6">
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                className="mb-8 w-10 h-10 rounded-full bg-white/10 items-center justify-center"
                                activeOpacity={0.7}
                                accessibilityLabel="Go back to login"
                            >
                                <Ionicons name="arrow-back" size={20} color="white" />
                            </TouchableOpacity>
                            <Text className="text-white text-3xl font-bold">Forgot Password?</Text>
                            <Text className="text-white/70 text-sm mt-1">No worries, we'll help you reset it</Text>
                        </View>

                        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                            {/* Info Card */}
                            <View className="bg-white/10 rounded-2xl p-5 mb-6 border border-white/20">
                                <View className="flex-row items-start">
                                    <View className="bg-white/20 rounded-full p-2 mr-3">
                                        <Ionicons name="information-circle" size={24} color="white" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-white font-semibold text-base mb-1">Reset Your Password</Text>
                                        <Text className="text-white/70 text-sm">
                                            Enter your {config.label.toLowerCase()} and we'll send you instructions to reset your password securely.
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Recovery Method Selection */}
                            <View className="mb-6">
                                <Text className="text-white/90 text-sm mb-3 ml-1">Recovery Method</Text>
                                <View className="flex-row bg-white/10 rounded-xl p-1 border border-white/20">
                                    {(['email', 'phone', 'fayda'] as const).map((method) => (
                                        <TouchableOpacity
                                            key={method}
                                            onPress={() => {
                                                setRecoveryMethod(method);
                                                setIdentifier('');
                                                setErrors({});
                                            }}
                                            className={`flex-1 py-2.5 rounded-lg items-center ${recoveryMethod === method ? 'bg-white' : ''}`}
                                            accessibilityLabel={`Use ${method} for recovery`}
                                        >
                                            <Ionicons
                                                name={method === 'email' ? 'mail' : method === 'phone' ? 'phone-portrait' : 'card'}
                                                size={18}
                                                color={recoveryMethod === method ? '#125f43ff' : 'white'}
                                            />
                                            <Text className={`text-xs font-semibold mt-1 ${recoveryMethod === method ? 'text-[#125f43ff]' : 'text-white/70'}`}>
                                                {method === 'email' ? 'Email' : method === 'phone' ? 'Phone' : 'Fayda'}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Info Text */}
                            <View className="mb-5 p-4 bg-[#125f43ff]/20 rounded-xl border border-[#125f43ff]/30">
                                <View className="flex-row items-center">
                                    <Ionicons name="shield-checkmark" size={18} color="#125f43ff" />
                                    <Text className="text-white/80 text-sm ml-2">{config.info}</Text>
                                </View>
                            </View>

                            {/* Identifier Input - ✅ FIXED: py-1 → py-3.5 */}
                            <View className="mb-6">
                                <Text className="text-white/90 text-sm mb-2 ml-1">{config.label} *</Text>
                                <View className={`bg-white/10 rounded-xl px-5 py-3.5 flex-row items-center border ${errors.identifier ? 'border-red-400' : 'border-white/30'}`}>
                                    <Ionicons name={config.icon} size={22} color="white" />
                                    <TextInput
                                        className="flex-1 text-white text-base ml-4"  // ✅ FIXED: text-lg → text-base for consistency
                                        placeholder={config.placeholder}
                                        placeholderTextColor="rgba(255,255,255,0.6)"
                                        value={identifier}
                                        onChangeText={(text) => {
                                            setIdentifier(text);
                                            if (errors.identifier) setErrors(prev => ({ ...prev, identifier: undefined }));
                                        }}
                                        keyboardType={config.keyboardType}
                                        autoCapitalize="none"
                                        autoComplete={recoveryMethod === 'email' ? 'email' : recoveryMethod === 'phone' ? 'tel' : undefined}
                                        accessibilityLabel={`Enter your ${config.label.toLowerCase()}`}
                                    />
                                </View>
                                {errors.identifier && (
                                    <Text className="text-red-400 text-xs mt-1 ml-1" accessibilityLiveRegion="polite">{errors.identifier}</Text>
                                )}
                            </View>

                            {/* Send Reset Code Button - ✅ FIXED: Ensure Button supports variant or use explicit classes */}
                            <Button
                                title="Send Reset Code"
                                onPress={handleSendResetCode}
                                loading={loading}
                                // ✅ If Button doesn't support variant="white", use className instead:
                                className="bg-white mb-6"
                                textClassName="text-[#125f43ff]"
                                icon="paper-plane" as const
                                disabled={!identifier.trim() || loading}
                                accessibilityLabel="Send password reset code"
                            />

                            {/* Security Notice */}
                            <View className="bg-yellow-500/20 rounded-xl p-4 border border-yellow-500/30 mb-8">
                                <View className="flex-row items-start">
                                    <Ionicons name="lock-closed" size={18} color="#F59E0B" />
                                    <View className="ml-3 flex-1">
                                        <Text className="text-yellow-400 text-sm font-semibold mb-1">Security Notice</Text>
                                        <Text className="text-yellow-200/80 text-xs">
                                            For your security, the reset code will expire in 10 minutes.
                                            Don't share it with anyone, including support staff.
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Back to Login */}
                            <View className="flex-row justify-center items-center pb-8">
                                <Text className="text-white/70 text-sm">Remember your password? </Text>
                                <TouchableOpacity 
                                    onPress={() => navigation.navigate('Login')}
                                    accessibilityLabel="Go back to sign in"
                                >
                                    <Text className="text-white font-bold text-sm">Sign In</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </LinearGradient>
                </View>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}