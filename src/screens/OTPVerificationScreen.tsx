// File: src/screens/OTPVerificationScreen.tsx
// Purpose: Verify phone number with OTP code, then redirect to homepage

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';

// ✅ ADD THIS: Auth context
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../api/config';

// ✅ Proper navigation types
type RootStackParamList = {
  OTPVerification: { phone: string };
  MainApp: undefined;
  Login: undefined;
};

type OTPVerificationScreenProp = StackNavigationProp<RootStackParamList, 'OTPVerification'>;

export default function OTPVerificationScreen({ navigation, route }: { 
  navigation: OTPVerificationScreenProp;
  route: { params: { phone: string } };
}) {
  const { verifyOtp, pendingPhone } = useAuth();
  
  // Use param if available, fallback to context
  const phone = route.params?.phone || pendingPhone || '';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle OTP digit input
  const handleOtpChange = (text: string, index: number) => {
    // Only allow digits
    const digit = text.replace(/[^0-9]/g, '').slice(0, 1);
    
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (digit && index === 5 && newOtp.every(d => d !== '')) {
      handleVerify();
    }
  };

  // Handle backspace navigation
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ✅ FIXED: Verify OTP with backend API
  const handleVerify = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter all 6 digits of the OTP code');
      return;
    }

    setLoading(true);

    try {
      // ✅ Use auth context verifyOtp method (saves full auth state)
      await verifyOtp(phone.replace(/\s/g, ''), otpCode);
      // AppNavigator redirects to personalized home when auth state updates
      
    } catch (error: any) {
      console.error('OTP verification error:', error);
      Alert.alert(
        'Verification Failed',
        error.message || 'Invalid OTP code. Please try again.'
      );
      // Clear OTP inputs on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP code
  const handleResend = async () => {
    if (countdown > 0) return;
    
    setResendLoading(true);

    try {
      
      console.log('📱 Resending OTP to:', phone);

      const response = await fetch(`${API_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone.replace(/\s/g, ''),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log('✅ OTP resent:', result.demoCode);
        
        // Show demo code for testing (remove in production)
        Alert.alert(
          'OTP Sent',
          `Demo code: ${result.demoCode || '123456'}\n\n(In production, this would be sent via SMS)`,
          [{ text: 'OK' }]
        );
        
        // Start 30-second countdown
        setCountdown(30);
      } else {
        Alert.alert('Error', result.error || 'Failed to resend OTP');
      }

    } catch (error: any) {
      console.error('Resend OTP error:', error);
      Alert.alert('Error', 'Could not resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  // Format phone for display
  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+251 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
    }
    return phone;
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <View className="flex-1">
          <StatusBar barStyle="light-content" backgroundColor="#125f43ff" />

          <LinearGradient
            colors={['#125f43ff', '#1a7f5a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            className="flex-1 px-6"
          >
            {/* Header */}
            <View className="pt-16 pb-8 items-center">
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="absolute left-0 top-4 w-10 h-10 rounded-full bg-white/10 items-center justify-center"
              >
                <Ionicons name="arrow-back" size={20} color="white" />
              </TouchableOpacity>
              
              <View className="w-20 h-20 bg-white/20 rounded-2xl items-center justify-center mb-6">
                <Ionicons name="shield-checkmark" size={40} color="white" />
              </View>
              
              <Text className="text-white text-2xl font-bold text-center mb-2">
                Verify Your Phone
              </Text>
              <Text className="text-white/80 text-center text-sm">
                Enter the 6-digit code sent to{'\n'}
                <Text className="font-semibold">{formatPhone(phone)}</Text>
              </Text>
            </View>

            {/* OTP Input */}
            <View className="bg-white/10 rounded-3xl p-6 mb-8">
              <View className="flex-row justify-between">
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    className="w-12 h-14 bg-white rounded-xl text-center text-2xl font-bold text-gray-800 border-2 border-transparent focus:border-[#125f43ff]"
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    selectTextOnFocus
                    accessibilityLabel={`OTP digit ${index + 1}`}
                  />
                ))}
              </View>

              {/* Resend OTP */}
              <View className="items-center mt-6">
                <Text className="text-white/70 text-sm mb-2">
                  Didn't receive the code?
                </Text>
                <TouchableOpacity
                  onPress={handleResend}
                  disabled={countdown > 0 || resendLoading}
                  className={`px-4 py-2 rounded-lg ${
                    countdown > 0 || resendLoading 
                      ? 'bg-white/10' 
                      : 'bg-white/20 active:bg-white/30'
                  }`}
                >
                  {resendLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : countdown > 0 ? (
                    <Text className="text-white/70 text-sm">
                      Resend in {countdown}s
                    </Text>
                  ) : (
                    <Text className="text-white font-semibold text-sm">
                      Resend Code
                    </Text>
                  )}
                </TouchableOpacity>
                
                {/* Demo hint for testing */}
                <Text className="text-white/50 text-xs mt-4 text-center">
                  💡 Demo: Use code 123456 or 000000
                </Text>
              </View>
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              onPress={handleVerify}
              disabled={loading || otp.some(d => d === '')}
              className={`py-4 rounded-xl items-center shadow-lg ${
                loading || otp.some(d => d === '') 
                  ? 'bg-gray-400' 
                  : 'bg-white'
              }`}
            >
              {loading ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="#125f43ff" />
                  <Text className="text-[#125f43ff] font-bold text-lg ml-2">
                    Verifying...
                  </Text>
                </View>
              ) : (
                <Text className="text-[#125f43ff] font-bold text-lg">
                  Verify & Continue
                </Text>
              )}
            </TouchableOpacity>

            {/* Change Phone */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              className="items-center mt-6"
            >
              <Text className="text-white/70 text-sm">
                Wrong number? <Text className="text-white font-semibold underline">Change</Text>
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}