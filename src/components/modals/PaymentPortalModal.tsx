import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, Image, Animated, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Button } from '../ui/Button';
import { useLanguage } from '../../context/LanguageContext';

interface PaymentPortalModalProps {
  visible: boolean;
  amount: number;
  title: string;
  onSuccess: (method: string) => void;
  onClose: () => void;
}

export default function PaymentPortalModal({ visible, amount, title, onSuccess, onClose }: PaymentPortalModalProps) {
  const { language } = useLanguage();
  const [step, setStep] = useState<'methods' | 'processing' | 'success'>('methods');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      setStep('methods');
      setSelectedMethod(null);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handlePay = () => {
    if (!selectedMethod) return;
    setStep('processing');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess(selectedMethod);
      }, 2000);
    }, 3000);
  };

  const methods = [
    { id: 'telebirr', name: 'TeleBirr', color: '#1E40AF', icon: 'wallet-outline' },
    { id: 'cbebirr', name: 'CBE Birr', color: '#7E22CE', icon: 'card-outline' },
    { id: 'bank', name: 'Bank Transfer', color: '#125f43', icon: 'business-outline' },
  ];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(val);
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <BlurView intensity={20} className="flex-1 justify-end bg-black/40">
        <TouchableOpacity className="flex-1" onPress={onClose} activeOpacity={1} />
        
        <Animated.View 
          style={{ opacity: fadeAnim }}
          className="bg-white rounded-t-[40px] px-6 pt-8 pb-12 shadow-2xl"
        >
          {/* Close Handle */}
          <View className="w-12 h-1.5 bg-gray-200 rounded-full self-center mb-8" />

          {step === 'methods' && (
            <View>
              <Text className="text-gray-900 text-2xl font-bold mb-2">
                {language === 'am' ? 'ክፍያ ይፈጽሙ' : 'Complete Payment'}
              </Text>
              <Text className="text-gray-500 mb-8">{title}</Text>

              <View className="bg-gray-50 rounded-3xl p-6 mb-8 flex-row items-center justify-between border border-gray-100">
                <View>
                  <Text className="text-gray-400 text-xs font-bold uppercase mb-1">{language === 'am' ? 'ጠቅላላ ክፍያ' : 'Total Amount'}</Text>
                  <Text className="text-primary text-3xl font-bold">{formatCurrency(amount)}</Text>
                </View>
                <View className="bg-primary/10 p-3 rounded-2xl">
                  <Ionicons name="receipt" size={32} color="#125f43" />
                </View>
              </View>

              <Text className="text-gray-800 font-bold mb-4 ml-1">{language === 'am' ? 'የክፍያ ዘዴ ይምረጡ' : 'Select Payment Method'}</Text>
              <View className="space-y-3 mb-8">
                {methods.map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    onPress={() => setSelectedMethod(method.id)}
                    className={`flex-row items-center p-4 rounded-2xl border-2 transition-all ${
                      selectedMethod === method.id ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white'
                    }`}
                  >
                    <View className="w-12 h-12 rounded-xl bg-gray-50 items-center justify-center mr-4">
                      <Ionicons name={method.icon as any} size={24} color={selectedMethod === method.id ? '#125f43' : '#9CA3AF'} />
                    </View>
                    <Text className={`flex-1 font-bold text-lg ${selectedMethod === method.id ? 'text-primary' : 'text-gray-700'}`}>
                      {method.name}
                    </Text>
                    {selectedMethod === method.id && (
                      <Ionicons name="checkmark-circle" size={24} color="#125f43" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <Button
                title={language === 'am' ? 'ክፍያ ይፈጽሙ' : `Pay ${formatCurrency(amount)}`}
                onPress={handlePay}
                disabled={!selectedMethod}
                variant="primary"
                className="py-4"
              />
            </View>
          )}

          {step === 'processing' && (
            <View className="items-center py-12">
              <ActivityIndicator size="large" color="#125f43" className="mb-6" />
              <Text className="text-gray-900 text-xl font-bold mb-2">
                {language === 'am' ? 'ክፍያ በመካሄድ ላይ...' : 'Processing Payment...'}
              </Text>
              <Text className="text-gray-500 text-center px-10">
                Securely connecting to {methods.find(m => m.id === selectedMethod)?.name} gateway. Please do not close the app.
              </Text>
            </View>
          )}

          {step === 'success' && (
            <View className="items-center py-10">
              <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-6">
                <Ionicons name="checkmark-circle" size={60} color="#059669" />
              </View>
              <Text className="text-gray-900 text-2xl font-bold mb-2">
                {language === 'am' ? 'ክፍያ ተሳክቷል!' : 'Payment Successful!'}
              </Text>
              <Text className="text-gray-500 text-center mb-8 px-10">
                Your transaction has been confirmed and recorded on the blockchain ledger.
              </Text>
              <View className="bg-gray-50 w-full p-4 rounded-2xl border border-gray-100 flex-row items-center justify-center">
                <Ionicons name="shield-checkmark" size={16} color="#125f43" />
                <Text className="text-primary text-xs font-bold ml-2 uppercase tracking-widest">Verified by Digital Land Portal</Text>
              </View>
            </View>
          )}
        </Animated.View>
      </BlurView>
    </Modal>
  );
}
