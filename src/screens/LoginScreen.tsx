// File: src/screens/LoginScreen.tsx
// Purpose: Premium Login Screen matching reference UI with live backend integration

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
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone' | 'fayda'>('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string; terms?: string }>({});

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
    const digits = faydaId.replace(/\s/g, '');
    return digits.length === 16;
  };

  // ✅ Handle Login with Backend Integration
  const handleLogin = async () => {
    setErrors({});
    let hasError = false;
    const newErrors: any = {};

    if (!identifier.trim()) {
      newErrors.identifier = `Please enter your ${loginMethod === 'email' ? 'email' : loginMethod === 'phone' ? 'phone number' : 'Fayda ID'}`;
      hasError = true;
    }

    if (!password) {
      newErrors.password = 'Please enter your password';
      hasError = true;
    }

    if (!acceptTerms) {
      newErrors.terms = 'You must accept the Terms & Conditions';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // ✅ Call backend login
      await login(identifier, password);
      // AuthContext will handle navigation to MainApp via AppNavigator state change
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error.message || 'Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getIdentifierConfig = () => {
    switch (loginMethod) {
      case 'email':
        return { placeholder: 'email@example.com', keyboardType: 'email-address' as const, icon: 'mail-outline' as const, label: 'Email Address' };
      case 'phone':
        return { placeholder: '+251 9XX XXX XXX', keyboardType: 'phone-pad' as const, icon: 'phone-portrait-outline' as const, label: 'Phone Number' };
      case 'fayda':
        return { placeholder: '1234 5678 9012 3456', keyboardType: 'numeric' as const, icon: 'card-outline' as const, label: 'Fayda National ID' };
    }
  };

  const config = getIdentifierConfig();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View className="flex-1">
          <StatusBar barStyle="light-content" backgroundColor="#125f43ff" />

          <LinearGradient
            colors={['#125f43ff', '#1a7f5a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            className="flex-1 px-7"
          >
            <View className="pt-12 pb-6">
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="mb-8 w-10 h-10 rounded-full bg-white/10 items-center justify-center"
              >
                <Ionicons name="arrow-back" size={20} color="white" />
              </TouchableOpacity>
              <Text className="text-white text-3xl font-bold tracking-tight">Welcome Back!</Text>
              <Text className="text-white/70 text-sm mt-1">Sign in to your land portal account</Text>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {/* Method Switcher */}
              <View className="mb-6">
                <Text className="text-white/90 text-sm mb-3 ml-1 font-medium">Sign in with</Text>
                <View className="flex-row bg-white/10 rounded-xl p-1 border border-white/20">
                  {(['email', 'phone', 'fayda'] as const).map((method) => (
                    <TouchableOpacity
                      key={method}
                      onPress={() => {
                        setLoginMethod(method);
                        setIdentifier('');
                        setErrors({});
                      }}
                      className={`flex-1 py-2.5 rounded-lg items-center ${loginMethod === method ? 'bg-white shadow-sm' : ''}`}
                    >
                      <Text className={`text-xs font-bold ${loginMethod === method ? 'text-[#125f43ff]' : 'text-white/70'}`}>
                        {method.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Identifier Input */}
              <View className="mb-5">
                <Text className="text-white/90 text-sm mb-2 ml-1 font-medium">{config.label}</Text>
                <View className={`bg-white/10 rounded-xl px-4 py-3 flex-row items-center border ${errors.identifier ? 'border-red-400' : 'border-white/30'}`}>
                  <Ionicons name={config.icon} size={20} color="white" />
                  <TextInput
                    className="flex-1 text-white text-base ml-3"
                    placeholder={config.placeholder}
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    value={identifier}
                    onChangeText={(text) => {
                      setIdentifier(loginMethod === 'email' ? text.toLowerCase() : text);
                      if (errors.identifier) setErrors(prev => ({ ...prev, identifier: undefined }));
                    }}
                    keyboardType={config.keyboardType}
                    autoCapitalize="none"
                  />
                </View>
                {errors.identifier && <Text className="text-red-400 text-xs mt-1 ml-1">{errors.identifier}</Text>}
              </View>

              {/* Password Input */}
              <View className="mb-4">
                <Text className="text-white/90 text-sm mb-2 ml-1 font-medium">Password</Text>
                <View className={`bg-white/10 rounded-xl px-4 py-3 flex-row items-center border ${errors.password ? 'border-red-400' : 'border-white/30'}`}>
                  <Ionicons name="lock-closed-outline" size={20} color="white" />
                  <TextInput
                    className="flex-1 text-white text-base ml-3"
                    placeholder="••••••••"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                    }}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="white" />
                  </TouchableOpacity>
                </View>
                {errors.password && <Text className="text-red-400 text-xs mt-1 ml-1">{errors.password}</Text>}
              </View>

              {/* Remember & Forgot */}
              <View className="flex-row items-center justify-between mb-8">
                <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} className="flex-row items-center">
                  <View className={`w-5 h-5 rounded border-2 mr-2 items-center justify-center ${rememberMe ? 'bg-white border-white' : 'border-white/50'}`}>
                    {rememberMe && <Ionicons name="checkmark" size={14} color="#125f43" />}
                  </View>
                  <Text className="text-white/80 text-sm">Remember Me</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text className="text-white font-bold text-sm">Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                className={`py-4 rounded-2xl items-center shadow-lg mb-6 ${loading ? 'bg-white/50' : 'bg-white'}`}
                activeOpacity={0.8}
              >
                {loading ? <ActivityIndicator color="#125f43" /> : <Text className="text-[#125f43] font-bold text-lg">Sign In</Text>}
              </TouchableOpacity>

              {/* Terms */}
              <View className="mb-8">
                <TouchableOpacity onPress={() => setAcceptTerms(!acceptTerms)} className="flex-row items-start">
                  <View className={`w-5 h-5 rounded border-2 mr-2 mt-0.5 items-center justify-center ${acceptTerms ? 'bg-white border-white' : 'border-white/50'}`}>
                    {acceptTerms && <Ionicons name="checkmark" size={14} color="#125f43" />}
                  </View>
                  <Text className="text-white/70 text-xs flex-1 leading-4">
                    I agree to the <Text className="text-white font-bold underline">Terms of Service</Text> and <Text className="text-white font-bold underline">Privacy Policy</Text>
                  </Text>
                </TouchableOpacity>
                {errors.terms && <Text className="text-red-400 text-[10px] mt-1 ml-7">{errors.terms}</Text>}
              </View>

              {/* Footer */}
              <View className="flex-row justify-center items-center pb-12">
                <Text className="text-white/70 text-sm">Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text className="text-white font-extrabold text-sm underline">Create Account</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </LinearGradient>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}