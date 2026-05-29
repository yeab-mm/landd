import React from 'react';
import { View, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Screen } from '../components/layout/Screen';
import { CitizenHeader, ServiceCard, SectionHeader } from '../components/citizen/CitizenUI';
import { CITIZEN_BG, CITIZEN_PRIMARY } from '../theme/citizenTheme';

type RootStackParamList = {
  Services: undefined;
  Login: undefined;
};

type ServicesScreenProp = StackNavigationProp<RootStackParamList, 'Login'>;

const services = [
  {
    title: 'Land Ownership Verification',
    desc: 'Check land authenticity and ownership details',
    icon: 'shield-checkmark' as const,
    loginRequired: true,
  },
  {
    title: 'Land Registration Request',
    desc: 'Apply for new land registration',
    icon: 'document-attach' as const,
    loginRequired: true,
  },
  {
    title: 'Land Marketplace',
    desc: 'View land listings and ownership transfer',
    icon: 'business' as const,
    loginRequired: true,
  },
  {
    title: 'Land Information Lookup',
    desc: 'Search land data by plot or location',
    icon: 'search' as const,
    loginRequired: true,
  },
  {
    title: 'Public Land Statistics',
    desc: 'Explore official land-related insights',
    icon: 'stats-chart' as const,
    loginRequired: false,
  },
];

export default function ServicesScreen() {
  const navigation = useNavigation<ServicesScreenProp>();

  return (
    <Screen style={{ backgroundColor: CITIZEN_BG }}>
      <StatusBar barStyle="light-content" backgroundColor={CITIZEN_PRIMARY} />
      <CitizenHeader title="Available services" subtitle="Browse public land services" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader title="All services" />
        <View className="flex-row flex-wrap justify-between">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              title={service.title}
              desc={service.desc}
              icon={service.icon}
              onPress={() => navigation.navigate('Login')}
            />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
