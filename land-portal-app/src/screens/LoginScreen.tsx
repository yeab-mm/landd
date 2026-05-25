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

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  MainApp: undefined;
  OTPVerification: { phone: string };
};

type LoginScreenProp = StackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: { navigation: LoginScreenProp }) {
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
    const re = /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/;
    return re.test(faydaId);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  // ✅ Handle Login
  const handleLogin = async () => {
    setErrors({});

    let hasError = false;
    const newErrors: typeof errors = {};

    if (!identifier.trim()) {
      newErrors.identifier = `Please enter your ${loginMethod === 'email' ? 'email' : loginMethod === 'phone' ? 'phone number' : 'Fayda ID'}`;
      hasError = true;
    } else if (loginMethod === 'email' && !validateEmail(identifier)) {
      newErrors.identifier = 'Please enter a valid email address';
      hasError = true;
    } else if (loginMethod === 'phone' && !validatePhone(identifier)) {
      newErrors.identifier = 'Please enter a valid Ethiopian phone number (+251 9XX XXX XXX)';
      hasError = true;
    } else if (loginMethod === 'fayda' && !validateFaydaId(identifier)) {
      newErrors.identifier = 'Please enter valid Fayda ID (1234 5678 9012 3456)';
      hasError = true;
    }

    if (!password) {
      newErrors.password = 'Please enter your password';
      hasError = true;
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 8 characters';
      hasError = true;
    }

    if (!acceptTerms) {
      newErrors.terms = 'You must accept the Terms & Conditions';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      if (firstError) Alert.alert('Validation Error', firstError);
      return;
    }

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (loginMethod === 'fayda') {
        navigation.navigate('OTPVerification', { phone: identifier.replace(/\s/g, '') });
        return;
      }

      navigation.navigate('MainApp');

    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', 'Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleLoginMethod = () => {
    const methods: Array<'email' | 'phone' | 'fayda'> = ['email', 'phone', 'fayda'];
    const currentIndex = methods.indexOf(loginMethod);
    const nextIndex = (currentIndex + 1) % methods.length;
    setLoginMethod(methods[nextIndex]);
    setIdentifier('');
    setErrors({});
  };

  const getIdentifierConfig = () => {
    switch (loginMethod) {
      case 'email':
        return {
          placeholder: 'email@example.com',
          keyboardType: 'email-address' as const,
          icon: 'mail-outline' as const,
          label: 'Email Address'
        };
      case 'phone':
        return {
          placeholder: '+251 9XX XXX XXX',
          keyboardType: 'phone-pad' as const,
          icon: 'phone-portrait-outline' as const,
          label: 'Phone Number'
        };
      case 'fayda':
        return {
          placeholder: '1234 5678 9012 3456',
          keyboardType: 'numeric' as const,
          icon: 'card-outline' as const,
          label: 'Fayda National ID'
        };
    }
  };

  const config = getIdentifierConfig();

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
            className="flex-1 px-7"
          >
            <View className="pt-12 pb-6">
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="mb-8 w-10 h-10 rounded-full bg-white/10 items-center justify-center"
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={20} color="white" />
              </TouchableOpacity>
              <Text className="text-white text-3xl font-bold">Welcome Back!</Text>
              <Text className="text-white/70 text-sm mt-1">Sign in to continue</Text>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {/* Login Method Toggle */}
              <View className="mb-6">
                <Text className="text-white/90 text-sm mb-3 ml-1">Sign in with</Text>
                <View className="flex-row bg-white/10 rounded-xl p-1 border border-white/20">
                  {(['email', 'phone', 'fayda'] as const).map((method) => (
                    <TouchableOpacity
                      key={method}
                      onPress={() => {
                        setLoginMethod(method);
                        setIdentifier('');
                        setErrors({});
                      }}
                      className={`flex-1 py-2.5 rounded-lg items-center ${loginMethod === method ? 'bg-white' : ''}`}
                    >
                      <Text className={`text-sm font-semibold ${loginMethod === method ? 'text-[#125f43ff]' : 'text-white/70'}`}>
                        {method === 'email' ? 'Email' : method === 'phone' ? 'Phone' : 'Fayda ID'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Identifier Input - ✅ FIXED: Email stays lowercase */}
              <View className="mb-5">
                <Text className="text-white/90 text-sm mb-2 ml-1">{config.label} *</Text>
                <View className={`bg-white/10 rounded-xl px-4 py-1 flex-row items-center border ${errors.identifier ? 'border-red-400' : 'border-white/30'}`}>
                  <Ionicons name={config.icon} size={20} color="white" />
                  <TextInput
                    className="flex-1 text-white text-base ml-3"
                    placeholder={config.placeholder}
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    value={identifier}
                    onChangeText={(text) => {
                      // ✅ FIXED: Force email to lowercase only
                      const value = loginMethod === 'email' ? text.toLowerCase() : text;
                      setIdentifier(value);
                      if (errors.identifier) setErrors(prev => ({ ...prev, identifier: undefined }));
                    }}
                    keyboardType={config.keyboardType}
                    autoCapitalize="none"  // ✅ Already prevents auto-cap
                    autoCorrect={false}     // ✅ Prevents auto-correction
                    autoComplete={loginMethod === 'email' ? 'email' : loginMethod === 'phone' ? 'tel' : undefined}
                  />
                </View>
                {errors.identifier && (
                  <Text className="text-red-400 text-xs mt-1 ml-1">{errors.identifier}</Text>
                )}
              </View>

              {/* Password Input */}
              <View className="mb-4">
                <Text className="text-white/90 text-sm mb-2 ml-1">Password *</Text>
                <View className={`bg-white/10 rounded-xl px-4 py-1 flex-row items-center border ${errors.password ? 'border-red-400' : 'border-white/30'}`}>
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
                    autoComplete="password"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="ml-2">
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text className="text-red-400 text-xs mt-1 ml-1">{errors.password}</Text>
                )}
              </View>

              {/* Remember Me & Forgot Password */}
              <View className="flex-row items-center justify-between mb-6">
                <TouchableOpacity
                  onPress={() => {
                    setRememberMe(!rememberMe);
                    if (errors.terms) setErrors(prev => ({ ...prev, terms: undefined }));
                  }}
                  className="flex-row items-center"
                >
                  <View className={`w-5 h-5 rounded border-2 mr-2 items-center justify-center ${rememberMe ? 'bg-white border-white' : 'border-white/50 bg-transparent'}`}>
                    {rememberMe && <Ionicons name="checkmark" size={14} color="#125f43ff" />}
                  </View>
                  <Text className="text-white/80 text-sm">Remember Me</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text className="text-white font-semibold text-sm">Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                className={`py-3 rounded-xl items-center shadow-lg mb-6 ${loading ? 'bg-white/50' : 'bg-white'}`}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#125f43ff" />
                ) : (
                  <Text className="text-[#125f43ff] font-bold text-lg">Sign In</Text>
                )}
              </TouchableOpacity>

              {/* Terms & Conditions */}
              <View className="mb-8">
                <TouchableOpacity
                  onPress={() => setAcceptTerms(!acceptTerms)}
                  className="flex-row items-start"
                >
                  <View className={`w-5 h-5 rounded border-2 mr-2 mt-0.5 items-center justify-center ${acceptTerms ? 'bg-white border-white' : 'border-white/50 bg-transparent'}`}>
                    {acceptTerms && <Ionicons name="checkmark" size={14} color="#125f43ff" />}
                  </View>
                  <Text className="text-white/70 text-sm flex-1">
                    I agree to the <Text className="text-white font-semibold underline">Terms of Service</Text> and <Text className="text-white font-semibold underline">Privacy Policy</Text>
                  </Text>
                </TouchableOpacity>
                {errors.terms && (
                  <Text className="text-red-400 text-xs mt-1 ml-7">{errors.terms}</Text>
                )}
              </View>

              {/* Divider */}
              <View className="flex-row items-center mb-6">
                <View className="flex-1 h-px bg-white/20" />
                <Text className="text-white/50 text-sm mx-4">Or continue with</Text>
                <View className="flex-1 h-px bg-white/20" />
              </View>

              {/* Social Login Buttons */}
              <View className="flex-row justify-center space-x-6 mb-10">
                <TouchableOpacity className="bg-white/10 p-3.5 rounded-xl border border-white/20 active:bg-white/20">
                  <Ionicons name="logo-google" size={26} color="#f57723ff" />
                </TouchableOpacity>
                <TouchableOpacity className="bg-white/10 p-3.5 rounded-xl border border-white/20 active:bg-white/20">
                  <Ionicons name="logo-facebook" size={26} color="#1877F2" />
                </TouchableOpacity>
                <TouchableOpacity className="bg-white/10 p-3.5 rounded-xl border border-white/20 active:bg-white/20">
                  <Ionicons name="logo-apple" size={26} color="white" />
                </TouchableOpacity>
              </View>

              {/* Register Link */}
              <View className="flex-row justify-center items-center pb-8">
                <Text className="text-white/70 text-sm">Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text className="text-white font-bold text-sm">Create Account</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </LinearGradient>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}