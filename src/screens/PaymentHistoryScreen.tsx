import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { usePayment } from '../context/PaymentContext';
import { ScreenHeader } from '../components/ui/ScreenHeader';

// ✅ Payment record type definition
type PaymentRecord = {
    id: string;
    title: string;
    date: string;
    amount: number;
    method: string;
    reference: string;
    status: 'completed' | 'pending' | 'failed';
};

export default function PaymentHistoryScreen() {
  const { language, t } = useLanguage();
  const { history } = usePayment();
  const navigation = useNavigation();

  // ✅ Handle receipt download
  const handleDownloadReceipt = (record: PaymentRecord) => {
    // TODO: Replace with real download logic in production
    Alert.alert(
      t('payment.downloadReceipt'),
      `${record.title}\n${t('payment.receiptWillBeDownloaded')}`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.download'),
          onPress: () => {
            // Simulate download success
            Alert.alert(t('common.success'), t('payment.receiptDownloaded'));
            
            // In production, you would:
            // 1. Fetch signed URL: GET /api/payments/${record.id}/receipt
            // 2. Use expo-file-system to save to device
            // 3. Use expo-sharing to open/share the PDF
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* ✅ FIXED: Added 'ff' for full opacity */}
      <StatusBar barStyle="light-content" backgroundColor="#125f43ff" />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="px-6 pt-32 pb-8">
            <Text className="text-gray-800 text-2xl font-bold mb-6">
                {language === 'am' ? 'የክፍያ ታሪክ' : 'Payment History'}
            </Text>

            {history.length === 0 ? (
              <View className="items-center justify-center py-20">
                <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
                <Text className="text-gray-400 mt-4 text-center">
                  {language === 'am' ? 'ምንም የክፍያ ታሪክ የለም::' : 'No payment records found.'}
                </Text>
                <Text className="text-gray-500 text-sm mt-2 text-center">
                  {language === 'am' ? 'ክፍያ ካደረጉ በኋላ እዚህ ይታያል::' : 'Your payment history will appear here after you make a payment.'}
                </Text>
              </View>
            ) : (
              history.map((record: PaymentRecord) => (
                <View 
                  key={record.id}
                  className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-100"
                >
                  <View className="flex-row justify-between items-start mb-4">
                    <View className="flex-row items-center">
                      {/* ✅ FIXED: Use explicit color */}
                      <View className="w-10 h-10 rounded-full bg-[#125f43ff]/10 items-center justify-center mr-3">
                        <Ionicons name="checkmark-circle" size={20} color="#125f43ff" />
                      </View>
                      <View>
                        <Text className="text-gray-900 font-bold">{record.title}</Text>
                        <Text className="text-gray-400 text-[10px]">{record.date}</Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text className="text-gray-900 font-bold">ETB {record.amount.toLocaleString('en-ET')}</Text>
                      <Text className="text-gray-400 text-[10px]">{record.method}</Text>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between pt-3 border-t border-gray-50">
                    <View className="flex-row items-center">
                      <Ionicons name="key" size={12} color="#9CA3AF" />
                      <Text className="text-gray-400 text-[10px] ml-1">{record.reference}</Text>
                    </View>
                    {/* ✅ FIXED: Added accessibility label + handler */}
                    <TouchableOpacity 
                      className="flex-row items-center bg-gray-50 px-3 py-1.5 rounded-full"
                      onPress={() => handleDownloadReceipt(record)}
                      accessibilityLabel={`Download receipt for ${record.title}`}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="download-outline" size={14} color="#125f43ff" />
                      {/* ✅ FIXED: Use explicit color */}
                      <Text className="text-[#125f43ff] text-[10px] font-bold ml-1 uppercase">
                        {language === 'am' ? 'ደረሰኝ' : 'Receipt'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
        </View>
      </ScrollView>

      <View className="absolute top-0 left-0 right-0 z-50">
        <ScreenHeader 
            title={language === 'am' ? 'የክፍያ ታሪክ' : "Transaction History"} 
            subtitle={language === 'am' ? 'ያለፉ ክፍያዎችን ይመልከቱ' : "View and download your digital receipts"}
        />
      </View>
    </View>
  );
}