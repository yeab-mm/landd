import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useLanguage } from '../context/LanguageContext';

// Components
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { Button } from '../components/ui/Button';

const { width } = Dimensions.get('window');

// ✅ FIXED: Proper navigation types
type RootStackParamList = {
  Services: undefined;
  Login: undefined;
  VerificationRequest: undefined;
  RegistrationRequest: undefined;
  OwnershipTransfer: undefined;
  LandSubdivision: undefined;
  LandMutation: undefined;
  ZoningChange: undefined;
  BlockchainExplorer: undefined;
  MainApp: undefined;
};

type ServicesScreenProp = StackNavigationProp<RootStackParamList, 'Services'>; // ✅ FIXED: Changed from 'Login' to 'Services'

// ✅ Service type definition
type Service = {
  title: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  loginRequired: boolean;
  id: string;
};

export default function ServicesScreen() {
  const navigation = useNavigation<ServicesScreenProp>();
  const { t, language } = useLanguage();

  // ✅ FIXED: Use explicit green theme color
  const PRIMARY_COLOR = '#125f43ff';

  const serviceData: Service[] = [
    {
      title: t('services.verification'),
      desc: t('services.verificationDesc'),
      icon: 'document-text',
      color: PRIMARY_COLOR,
      loginRequired: true,
      id: 'verification'
    },
    {
      title: t('services.registration'),
      desc: t('services.registrationDesc'),
      icon: 'clipboard',
      color: '#2563EB',
      loginRequired: true,
      id: 'registration'
    },
    {
      title: language === 'am' ? 'የመሬት ገበያ' : 'Land Marketplace',
      desc: t('services.marketplaceDesc'),
      icon: 'business',
      color: '#D97706',
      loginRequired: true,
      id: 'marketplace'
    },
    {
      title: language === 'am' ? 'መረጃ መፈለጊያ' : 'Land Information Lookup',
      desc: t('services.lookupDesc'),
      icon: 'search',
      color: '#7C3AED',
      loginRequired: true,
      id: 'lookup'
    },
    {
      title: language === 'am' ? 'ይፋዊ መረጃዎች' : 'Public Land Statistics',
      desc: t('services.statsDesc'),
      icon: 'stats-chart',
      color: '#DB2777',
      loginRequired: false,
      id: 'stats'
    },
    {
      title: t('services.subdivision'),
      desc: t('services.subdivisionDesc'),
      icon: 'grid',
      color: PRIMARY_COLOR,
      loginRequired: true,
      id: 'subdivision'
    },
    {
      title: t('services.mutation'),
      desc: t('services.mutationDesc'),
      icon: 'git-merge',
      color: '#6366f1',
      loginRequired: true,
      id: 'mutation'
    },
    {
      title: t('services.zoning'),
      desc: t('services.zoningDesc'),
      icon: 'business',
      color: '#f97316',
      loginRequired: true,
      id: 'zoning'
    },
    {
      title: t('services.explorer'),
      desc: t('services.explorerDesc'),
      icon: 'link',
      color: '#0f172a',
      loginRequired: false,
      id: 'explorer'
    },
  ];

  const handleServicePress = (id: string, title: string) => {
    switch (id) {
      case 'verification':
        navigation.navigate('VerificationRequest');
        break;
      case 'registration':
        navigation.navigate('RegistrationRequest');
        break;
      case 'marketplace':
        navigation.navigate('Marketplace');
        break;
      case 'lookup':
        navigation.navigate('TrackRequest');
        break;
      case 'stats':
        navigation.navigate('MyRequests');
        break;
      case 'subdivision':
        navigation.navigate('LandSubdivision');
        break;
      case 'mutation':
        navigation.navigate('LandMutation');
        break;
      case 'zoning':
        navigation.navigate('ZoningChange');
        break;
      case 'explorer':
        navigation.navigate('BlockchainExplorer');
        break;
      default:
        Alert.alert(title, language === 'am' ? 'ይህ አገልግሎት በቅርቡ ይጀምራል!' : `This service is coming soon!`);
        break;
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ 
          paddingTop: 140,
          paddingHorizontal: 20,
          paddingBottom: 40 
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-gray-400 text-xs font-bold uppercase mb-4 tracking-widest">
          Available Digital Services
        </Text>

        {serviceData.map((service, index) => (
          <TouchableOpacity
            key={service.id} // ✅ FIXED: Use unique ID instead of index
            className="bg-white rounded-2xl shadow-sm p-4 mb-4 flex-row items-center border border-gray-100"
            activeOpacity={0.7}
            onPress={() => handleServicePress(service.id, service.title)}
            accessibilityLabel={`${service.title}: ${service.desc}`}
            accessibilityHint={service.loginRequired ? 'Login required to access this service' : 'Tap to access this service'}
          >
            <View 
              style={{ backgroundColor: `${service.color}15` }}
              className="w-10 h-10 rounded-xl items-center justify-center mr-4"
            >
              {/* ✅ FIXED: Proper typing for icon name */}
              <Ionicons name={service.icon} size={20} color={service.color} />
            </View>

            <View className="flex-1">
              <Text className="text-gray-800 font-bold text-base mb-0.5">{service.title}</Text>
              <Text className="text-gray-500 text-xs leading-4" numberOfLines={2}>
                {service.desc}
              </Text>
              {service.loginRequired && (
                <View className="flex-row items-center mt-2 bg-gray-50 self-start px-2 py-0.5 rounded-full border border-gray-100">
                  <Ionicons name="lock-closed" size={10} color="#9CA3AF" />
                  <Text className="text-gray-400 text-[10px] font-bold ml-1 uppercase">
                    {language === 'am' ? 'መግባት ያስፈልጋል' : 'Login Required'}
                  </Text>
                </View>
              )}
            </View>
            <Ionicons name="chevron-forward" size={18} color="#E5E7EB" />
          </TouchableOpacity>
        ))}

        {/* ✅ FIXED: Use explicit color */}
        <View className="mt-6 p-6 bg-[#125f43ff]/5 rounded-3xl border border-[#125f43ff]/10 items-center">
          <Ionicons name="information-circle" size={24} color={PRIMARY_COLOR} />
          <Text className="text-gray-600 text-center text-sm mb-4 mt-2">
            {language === 'am' ? 'አንዳንድ አገልግሎቶችን ለመጠቀም በፋይዳ መታወቂያዎ ማረጋገጥ ይኖርብዎታል::' : 'Some services require an authenticated Ethiopian National ID (Fayda) to access official records.'}
          </Text>
          <Button 
            title={language === 'am' ? 'ለመቀጠል ይግቡ' : "Sign In to Access All"} 
            onPress={() => navigation.navigate('Login')}
            className="w-full"
            variant="primary"
            accessibilityLabel="Sign in to access all services"
          />
        </View>
      </ScrollView>

      <View className="absolute top-0 left-0 right-0 z-50">
        <ScreenHeader 
          title={language === 'am' ? 'የዜጎች አገልግሎት' : "Citizen Services"} 
          subtitle={language === 'am' ? 'የመሬት መብትዎን ማስከበር' : "Empowering your land rights"}
        />
      </View>
    </View>
  );
}