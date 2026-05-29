import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useAuth } from '../context/AuthContext';

type RootStackParamList = {
  Register: undefined;
  Login: undefined;
  OTPVerification: { phone?: string };
};

type RegisterScreenProp = StackNavigationProp<RootStackParamList, 'Login'>;

export default function RegisterScreen() {
  const navigation = useNavigation<RegisterScreenProp>();
  const { register } = useAuth();

  // Form State
  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState({ latitude: null, longitude: null });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Password Strength State
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  React.useEffect(() => {
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [password]);

  // ✅ Validate National ID Format (Fayda: 1234 5678 9012 3456)
  const validateNationalId = (id: string) => {
    const nidPattern = /^\d{4} \d{4} \d{4} \d{4}$/;
    return nidPattern.test(id);
  };

  // ✅ Auto-format National ID as user types
  const formatNationalId = (input: string) => {
    const digits = input.replace(/\D/g, '');
    const limited = digits.slice(0, 16);
    const parts = [];
    for (let i = 0; i < limited.length; i += 4) {
      parts.push(limited.slice(i, i + 4));
    }
    return parts.join(' ');
  };

  // Validate Ethiopian Phone Format
  const validatePhone = (phoneNumber: string) => {
    const phonePattern = /^(\+251|0)[9|7]\d{8}$/;
    return phonePattern.test(phoneNumber.replace(/\s/g, ''));
  };

  // Validate Email
  const validateEmail = (emailAddress: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(emailAddress);
  };

  // Get Password Strength Score
  const getPasswordStrengthScore = () => {
    return Object.values(passwordStrength).filter(Boolean).length;
  };

  // Get Password Strength Color
  const getPasswordStrengthColor = () => {
    const score = getPasswordStrengthScore();
    if (score <= 2) return '#EF4444';
    if (score <= 4) return '#F59E0B';
    return '#125f43ff';
  };

  // ✅ GPS Location Function
  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to verify your address.');
        setLocationLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      let reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });

      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        const formattedAddress = `${addr.street || ''}, ${addr.city || ''}, ${addr.region || ''}`;
        setAddress(formattedAddress);
        setCoordinates({ latitude, longitude });
        Alert.alert('Success', 'Location verified successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not fetch location. Please enter manually.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);

    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      setLoading(false);
      return;
    }

    if (!nationalId.trim()) {
      Alert.alert('Error', 'Please enter your National ID (Fayda)');
      setLoading(false);
      return;
    }

    if (!validateNationalId(nationalId)) {
      Alert.alert('Error', 'Invalid National ID format. Use format: 1234 5678 9012 3456');
      setLoading(false);
      return;
    }

    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      setLoading(false);
      return;
    }

    if (!validatePhone(phone)) {
      Alert.alert('Error', 'Invalid phone number. Use format: +251 9XX XXX XXX');
      setLoading(false);
      return;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Invalid email address');
      setLoading(false);
      return;
    }

    if (!address.trim()) {
      Alert.alert('Error', 'Please enter or fetch your address');
      setLoading(false);
      return;
    }

    if (!password) {
      Alert.alert('Error', 'Please create a password');
      setLoading(false);
      return;
    }

    if (getPasswordStrengthScore() < 5) {
      Alert.alert('Error', 'Password does not meet all security requirements');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      setLoading(false);
      return;
    }

    if (!acceptTerms) {
      Alert.alert('Error', 'You must accept the Terms & Conditions');
      setLoading(false);
      return;
    }

    const normalizedPhone = phone.replace(/\s/g, '');

    try {
      const { demoCode } = await register({
        fullName: fullName.trim(),
        faydaId: nationalId.replace(/\s/g, ''),
        phone: normalizedPhone,
        email: email.trim().toLowerCase(),
        password,
      });
      navigation.replace('OTPVerification', { phone: normalizedPhone, demoCode });
    } catch (error: any) {
      Alert.alert('Registration Failed', error?.message || 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <View className="flex-1">
          <StatusBar barStyle="light-content" backgroundColor="#125f43ff" />

          <LinearGradient
            colors={['#125f43ff', '#1a7f5a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-1"
          >
            <View className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
            <View className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />

            <ScrollView
              className="flex-1 px-6"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              {/* Header */}
              <View className="pt-16 pb-8 items-center">
                <View className="w-20 h-20 bg-white/5 rounded-2xl items-center justify-center mb-4 backdrop-blur-sm border border-white/20">
                  <Ionicons name="person-add" size={35} color="white" />
                </View>
                <Text className="text-white text-3xl font-bold mb-2 text-center">Create Account</Text>
                <Text className="text-white/80 text-base text-center">Join the Digital Land Portal</Text>
              </View>

              {/* Form Card */}
              <View className="bg-white/70 rounded-3xl px-6 py-6 shadow-2xl mb-6">

                {/* Full Name */}
                <View className="mb-4">
                  <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Full Name *</Text>
                  <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-1 border border-gray-200">
                    <Ionicons name="person-outline" size={22} color="#9CA3AF" />
                    <TextInput
                      className="flex-1 text-gray-800 text-base ml-3"
                      placeholder="Abebe Gizaw"
                      placeholderTextColor="#9CA3AF"
                      value={fullName}
                      onChangeText={setFullName}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                {/* National ID (Fayda) */}
                <View className="mb-4">
                  <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">National ID (Fayda) *</Text>
                  <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-1 border border-gray-200">
                    <Ionicons name="card-outline" size={22} color="#9CA3AF" />
                    <TextInput
                      className="flex-1 text-gray-800 text-base ml-3"
                      placeholder="1234 5678 9012 3456"
                      placeholderTextColor="#9CA3AF"
                      value={nationalId}
                      onChangeText={(text) => setNationalId(formatNationalId(text))}
                      keyboardType="number-pad"
                      maxLength={19}
                    />
                  </View>
                  <Text className="text-gray-500 text-xs mt-1 ml-1">Format: 1234 5678 9012 3456</Text>
                </View>

                {/* Phone Number */}
                <View className="mb-4">
                  <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Phone Number *</Text>
                  <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-1 border border-gray-200">
                    <Ionicons name="phone-portrait-outline" size={22} color="#9CA3AF" />
                    <TextInput
                      className="flex-1 text-gray-800 text-base ml-3"
                      placeholder="+251 9XX XXX XXX"
                      placeholderTextColor="#9CA3AF"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                {/* Email */}
                <View className="mb-4">
                  <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Email Address *</Text>
                  <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-1 border border-gray-200">
                    <Ionicons name="mail-outline" size={22} color="#9CA3AF" />
                    <TextInput
                      className="flex-1 text-gray-800 text-base ml-3"
                      placeholder="example@email.com"
                      placeholderTextColor="#9CA3AF"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                {/* Address with GPS */}
                <View className="mb-4">
                  <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Address *</Text>
                  <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-1 border border-gray-200">
                    <Ionicons name="location-outline" size={22} color="#9CA3AF" />
                    <TextInput
                      className="flex-1 text-gray-800 text-base ml-3"
                      placeholder="Bahir Dar, Kebele 03"
                      placeholderTextColor="#9CA3AF"
                      value={address}
                      onChangeText={setAddress}
                      multiline
                    />
                  </View>
                  <TouchableOpacity
                    onPress={getCurrentLocation}
                    disabled={locationLoading}
                    className="flex-row items-center mt-2 ml-1"
                  >
                    {locationLoading ? (
                      <ActivityIndicator size="small" color="#125f43ff" />
                    ) : (
                      <Ionicons name="locate" size={16} color="#125f43ff" />
                    )}
                    <Text className="text-[#125f43ff] text-xs font-semibold ml-1">
                      {locationLoading ? 'Fetching...' : '📍 Use Current Location'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Password */}
                <View className="mb-4">
                  <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Password *</Text>
                  <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-1 border border-gray-200">
                    <Ionicons name="lock-closed-outline" size={22} color="#9CA3AF" />
                    <TextInput
                      className="flex-1 text-gray-800 text-base ml-3"
                      placeholder="••••••••"
                      placeholderTextColor="#9CA3AF"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                  {password.length > 0 && (
                    <View className="mt-3">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-xs text-gray-600">Password Strength</Text>
                        <Text className="text-xs font-semibold" style={{ color: getPasswordStrengthColor() }}>
                          {getPasswordStrengthScore() <= 2 ? 'Weak' : getPasswordStrengthScore() <= 4 ? 'Medium' : 'Strong'}
                        </Text>
                      </View>
                      <View className="flex-row h-2 rounded-full overflow-hidden bg-gray-200">
                        <View
                          className="h-full rounded-full"
                          style={{
                            width: `${(getPasswordStrengthScore() / 5) * 100}%`,
                            backgroundColor: getPasswordStrengthColor()
                          }}
                        />
                      </View>
                    </View>
                  )}
                </View>

                {/* Confirm Password */}
                <View className="mb-4">
                  <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Confirm Password *</Text>
                  <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-1 border border-gray-200">
                    <Ionicons name="lock-closed-outline" size={22} color="#9CA3AF" />
                    <TextInput
                      className="flex-1 text-gray-800 text-base ml-3"
                      placeholder="••••••••"
                      placeholderTextColor="#9CA3AF"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                      <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Terms */}
                <TouchableOpacity onPress={() => setAcceptTerms(!acceptTerms)} className="flex-row items-center mb-6">
                  <View className={`w-5 h-5 rounded border-2 mr-2 items-center justify-center ${acceptTerms ? 'bg-[#125f43ff] border-[#125f43ff]' : 'border-gray-400 bg-white'}`}>
                    {acceptTerms && <Ionicons name="checkmark" size={14} color="white" />}
                  </View>
                  <Text className="text-gray-700 text-sm flex-1">
                    I agree to the <Text className="text-[#125f43ff] font-semibold">Terms & Conditions</Text>
                  </Text>
                </TouchableOpacity>

                {/* Register Button */}
                <TouchableOpacity
                  onPress={handleRegister}
                  disabled={loading}
                  className="bg-[#125f43ff] py-4 rounded-xl items-center shadow-lg"
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <Text className="text-white font-bold text-lg">Creating Account...</Text>
                  ) : (
                    <Text className="text-white font-bold text-lg">Create Account</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Login Link */}
              <View className="flex-row justify-center items-center pb-2">
                <Text className="text-white/80 text-base">Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text className="text-white font-bold text-base underline">Sign In</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </LinearGradient>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}