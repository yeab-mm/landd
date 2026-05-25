// File: src/screens/RegisterScreen.tsx
// Purpose: Premium Register Screen matching reference UI with live backend integration

import React, { useState, useEffect } from 'react';
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
import * as Location from 'expo-location';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ navigation }: any) {
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
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Password Strength logic
  const [strength, setStrength] = useState(0);
  useEffect(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    setStrength(score);
  }, [password]);

  const getStrengthColor = () => {
    if (strength <= 1) return '#EF4444';
    if (strength <= 3) return '#F59E0B';
    return '#10b981';
  };

  const formatNationalId = (input: string) => {
    const digits = input.replace(/\D/g, '').slice(0, 16);
    const parts = [];
    for (let i = 0; i < digits.length; i += 4) parts.push(digits.slice(i, i + 4));
    return parts.join(' ');
  };

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location is required for address verification.');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      let reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        setAddress(`${addr.street || ''}, ${addr.city || ''}, ${addr.region || ''}`);
        setCoordinates({ latitude: latitude as any, longitude: longitude as any });
      }
    } catch (error) {
      Alert.alert('Error', 'Could not fetch location.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!fullName || !nationalId || !phone || !email || !password) {
      Alert.alert('Required', 'Please fill in all mandatory fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }
    if (!acceptTerms) {
      Alert.alert('Terms', 'Please accept the terms and conditions.');
      return;
    }

    setLoading(true);
    try {
      await register({
        fullName,
        email,
        phone,
        faydaId: nationalId.replace(/\s/g, ''),
        password,
        address,
        coordinates
      });
      // Navigate to OTP
      navigation.navigate('OTPVerification', { phone });
    } catch (error: any) {
      Alert.alert('Registration Error', error.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="flex-1">
          <StatusBar barStyle="light-content" backgroundColor="#125f43ff" />
          <LinearGradient colors={['#125f43ff', '#1a7f5a']} className="flex-1">
            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
              
              <View className="pt-16 pb-8 items-center">
                <View className="w-16 h-16 bg-white/10 rounded-2xl items-center justify-center mb-4 border border-white/20">
                  <Ionicons name="person-add" size={32} color="white" />
                </View>
                <Text className="text-white text-3xl font-bold">Create Account</Text>
                <Text className="text-white/70 text-sm mt-1">Join the Digital Land Citizen Portal</Text>
              </View>

              <View className="bg-white/90 rounded-3xl p-6 shadow-2xl mb-10">
                {/* Full Name */}
                <View className="mb-4">
                  <Text className="text-gray-700 text-xs font-bold mb-2 ml-1">FULL NAME *</Text>
                  <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                    <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                    <TextInput className="flex-1 text-gray-800 ml-3" placeholder="Abebe Gizaw" value={fullName} onChangeText={setFullName} />
                  </View>
                </View>

                {/* Fayda ID */}
                <View className="mb-4">
                  <Text className="text-gray-700 text-xs font-bold mb-2 ml-1">FAYDA NATIONAL ID *</Text>
                  <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                    <Ionicons name="card-outline" size={20} color="#9CA3AF" />
                    <TextInput className="flex-1 text-gray-800 ml-3" placeholder="1234 5678 9012 3456" value={nationalId} onChangeText={t => setNationalId(formatNationalId(t))} keyboardType="numeric" maxLength={19} />
                  </View>
                </View>

                {/* Phone & Email */}
                <View className="flex-row justify-between mb-4">
                  <View className="w-[48%]">
                    <Text className="text-gray-700 text-xs font-bold mb-2 ml-1">PHONE *</Text>
                    <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                      <TextInput className="flex-1 text-gray-800" placeholder="0911..." value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                    </View>
                  </View>
                  <View className="w-[48%]">
                    <Text className="text-gray-700 text-xs font-bold mb-2 ml-1">EMAIL *</Text>
                    <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                      <TextInput className="flex-1 text-gray-800" placeholder="e.g. mail@me.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                    </View>
                  </View>
                </View>

                {/* Address */}
                <View className="mb-4">
                  <Text className="text-gray-700 text-xs font-bold mb-2 ml-1">ADDRESS</Text>
                  <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                    <TextInput className="flex-1 text-gray-800" placeholder="City, Kebele..." value={address} onChangeText={setAddress} multiline />
                  </View>
                  <TouchableOpacity onPress={getCurrentLocation} className="mt-2 flex-row items-center">
                    {locationLoading ? <ActivityIndicator size="small" color="#125f43" /> : <Ionicons name="locate" size={14} color="#125f43" />}
                    <Text className="text-[#125f43] text-xs font-bold ml-1">{locationLoading ? 'Locating...' : 'Use GPS'}</Text>
                  </TouchableOpacity>
                </View>

                {/* Passwords */}
                <View className="mb-4">
                  <Text className="text-gray-700 text-xs font-bold mb-2 ml-1">PASSWORD *</Text>
                  <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                    <TextInput className="flex-1 text-gray-800" placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}><Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#9CA3AF" /></TouchableOpacity>
                  </View>
                  {password.length > 0 && <View className="h-1 bg-gray-200 mt-2 rounded-full overflow-hidden"><View className="h-full" style={{ width: `${(strength/4)*100}%`, backgroundColor: getStrengthColor() }} /></View>}
                </View>

                <View className="mb-6">
                  <Text className="text-gray-700 text-xs font-bold mb-2 ml-1">CONFIRM PASSWORD *</Text>
                  <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                    <TextInput className="flex-1 text-gray-800" placeholder="••••••••" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
                  </View>
                </View>

                <TouchableOpacity onPress={() => setAcceptTerms(!acceptTerms)} className="flex-row items-center mb-6">
                  <View className={`w-5 h-5 rounded border mr-2 items-center justify-center ${acceptTerms ? 'bg-[#125f43] border-[#125f43]' : 'border-gray-300'}`}>
                    {acceptTerms && <Ionicons name="checkmark" size={14} color="white" />}
                  </View>
                  <Text className="text-gray-600 text-xs flex-1">I accept the Terms & Conditions</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleRegister} disabled={loading} className="bg-[#125f43] py-4 rounded-2xl items-center shadow-lg">
                  {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Create Account</Text>}
                </TouchableOpacity>
              </View>

              <View className="flex-row justify-center items-center pb-12">
                <Text className="text-white/70 text-sm">Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text className="text-white font-bold text-sm underline">Sign In</Text>
                </TouchableOpacity>
              </View>

            </ScrollView>
          </LinearGradient>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}