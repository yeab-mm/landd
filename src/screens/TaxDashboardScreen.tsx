import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useLanguage } from '../context/LanguageContext';
import { usePayment, PaymentRecord } from '../context/PaymentContext';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import PaymentPortalModal from '../components/modals/PaymentPortalModal';

// ✅ FIXED: Proper navigation types
type RootStackParamList = {
  TaxDashboard: undefined;
  PaymentHistory: undefined;
  MainApp: undefined;
};

type TaxDashboardScreenProp = StackNavigationProp<RootStackParamList, 'TaxDashboard'>;

export default function TaxDashboardScreen() {
  const navigation = useNavigation<TaxDashboardScreenProp>();
  const { language, t } = useLanguage();
  const { pendingPayments, payInvoice } = usePayment();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<PaymentRecord | null>(null);

  // ✅ FIXED: Use explicit green theme colors
  const PRIMARY_COLOR = '#125f43ff';
  const PRIMARY_DARK = '#166534';

  const handlePayPress = (invoice: PaymentRecord) => {
    setSelectedInvoice(invoice);
    setModalVisible(true);
  };

  const handlePaymentSuccess = (method: string) => {
    if (selectedInvoice) {
      payInvoice(selectedInvoice.id);
      setModalVisible(false);
      Alert.alert(
        language === 'am' ? 'ተሳክቷል' : 'Success',
        language === 'am' ? 'ክፍያዎ በተሳካ ሁኔታ ተጠናቅቋል::' : 'Your payment has been successfully processed.'
      );
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* ✅ FIXED: Status bar with full opacity green */}
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* ✅ FIXED: Use explicit color */}
        <View className="h-64 absolute top-0 left-0 right-0 bg-[#125f43ff] opacity-10" />
        
        <View className="px-6 pt-16 pb-8">
            <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
                {language === 'am' ? 'የፋይናንስ ሁኔታ' : 'Financial Standing'}
            </Text>
            <View className="flex-row items-center justify-between">
                <Text className="text-gray-900 text-3xl font-bold">
                    {language === 'am' ? 'ግብር እና ክፍያዎች' : 'Taxes & Payments'}
                </Text>
                {/* ✅ FIXED: Added accessibility label */}
                <TouchableOpacity 
                    onPress={() => navigation.navigate('PaymentHistory')}
                    accessibilityLabel="View payment history"
                >
                    <Ionicons name="time-outline" size={28} color={PRIMARY_COLOR} />
                </TouchableOpacity>
            </View>
        </View>

        {/* Pending Summary Card */}
        <View className="px-6 mb-8">
          <LinearGradient
            colors={[PRIMARY_COLOR, PRIMARY_DARK]}
            className="rounded-[35px] p-8 shadow-xl"
          >
            <Text className="text-white/70 text-sm font-semibold mb-2">
                {language === 'am' ? 'ሊከፈል የሚገባው ጠቅላላ' : 'Total Outstanding'}
            </Text>
            <Text className="text-white text-4xl font-bold mb-6">
                ETB {pendingPayments.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('en-ET')}
            </Text>
            
            <View className="flex-row space-x-4">
                <View className="flex-1 bg-white/10 rounded-2xl p-4 border border-white/10">
                    <Text className="text-white/60 text-[10px] uppercase font-bold mb-1">{language === 'am' ? 'የግብር ክፍያዎች' : 'Taxes'}</Text>
                    <Text className="text-white font-bold">{pendingPayments.filter(p => p.type === 'Tax').length}</Text>
                </View>
                <View className="flex-1 bg-white/10 rounded-2xl p-4 border border-white/10">
                    <Text className="text-white/60 text-[10px] uppercase font-bold mb-1">{language === 'am' ? 'የሊዝ ክፍያዎች' : 'Leases'}</Text>
                    <Text className="text-white font-bold">{pendingPayments.filter(p => p.type === 'Lease').length}</Text>
                </View>
            </View>
          </LinearGradient>
        </View>

        {/* Pending List */}
        <View className="px-6">
          <Text className="text-gray-800 text-lg font-bold mb-4">{language === 'am' ? 'የሚጠበቁ ክፍያዎች' : 'Pending Invoices'}</Text>
          
          {pendingPayments.length === 0 ? (
            <View className="bg-white rounded-3xl p-10 items-center justify-center border border-dashed border-gray-200">
                <Ionicons name="checkmark-done-circle" size={48} color={PRIMARY_COLOR} />
                <Text className="text-gray-500 mt-4 text-center">
                    {language === 'am' ? 'ምንም የሚጠበቅ ክፍያ የለም::' : 'All your obligations are up to date!'}
                </Text>
            </View>
          ) : (
            pendingPayments.map((invoice) => (
              <TouchableOpacity
                key={invoice.id}
                onPress={() => handlePayPress(invoice)}
                className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-100 flex-row items-center"
                activeOpacity={0.7}
                accessibilityLabel={`Pay ${invoice.title}: ETB ${invoice.amount.toLocaleString()}`}
              >
                <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${invoice.type === 'Tax' ? 'bg-blue-50' : 'bg-orange-50'}`}>
                  <Ionicons 
                    name={invoice.type === 'Tax' ? 'receipt' : 'calendar'} 
                    size={24} 
                    color={invoice.type === 'Tax' ? '#2563eb' : '#f97316'} 
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-bold mb-0.5">{invoice.title}</Text>
                  <Text className="text-gray-400 text-xs">Due: {invoice.date}</Text>
                </View>
                <View className="items-end">
                  {/* ✅ FIXED: Use explicit color */}
                  <Text className="text-[#125f43ff] font-bold">ETB {invoice.amount.toLocaleString('en-ET')}</Text>
                  <View className="bg-red-50 px-2 py-0.5 rounded-full mt-1">
                    <Text className="text-red-500 text-[10px] font-bold uppercase">{language === 'am' ? 'አሁን ይክፈሉ' : 'Pay Now'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Info Section */}
        <View className="px-6 mt-8">
            {/* ✅ FIXED: Use explicit colors */}
            <View className="bg-[#125f43ff]/5 rounded-3xl p-6 border border-[#125f43ff]/10">
                <View className="flex-row items-center mb-2">
                    <Ionicons name="information-circle" size={20} color={PRIMARY_COLOR} />
                    {/* ✅ FIXED: Use explicit color */}
                    <Text className="text-[#125f43ff] font-bold ml-2">{language === 'am' ? 'ጠቃሚ መረጃ' : 'Important Note'}</Text>
                </View>
                <Text className="text-gray-600 text-xs leading-5">
                    {language === 'am' 
                      ? 'የመሬት ግብር እና የሊዝ ክፍያዎች በየዓመቱ እስከ ሰኔ 30 መጠናቀቅ አለባቸው:: ዘግይተው የሚፈጸሙ ክፍያዎች ቅጣት ሊያስከትሉ ይችላሉ::' 
                      : 'Land taxes and lease payments must be settled by June 30th annually. Delayed payments may incur penalty fees according to the revised land proclamation.'}
                </Text>
            </View>
        </View>
      </ScrollView>

      <View className="absolute top-0 left-0 right-0 z-50">
        <ScreenHeader 
            title={language === 'am' ? 'ግብር እና ክፍያ' : "Taxes & Payments"} 
            subtitle={language === 'am' ? 'የፋይናንስ ግዴታዎን ይከታተሉ' : "Manage your land financial obligations"}
        />
      </View>

      <PaymentPortalModal
        visible={modalVisible}
        amount={selectedInvoice?.amount || 0}
        title={selectedInvoice?.title || ''}
        onSuccess={handlePaymentSuccess}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}