import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import {
  CitizenScreen,
  ListCard,
  SectionHeader,
  ProfileBanner,
} from '../components/citizen/CitizenUI';
import { CITIZEN_PRIMARY } from '../theme/citizenTheme';

export default function SettingsTabScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const [showReportModal, setShowReportModal] = useState(false);

  const openProfile = () => {
    navigation.getParent()?.navigate('Profile');
  };

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const settingsItems = [
    { title: 'Profile & Fayda ID', icon: 'person' as const, desc: 'View identity card', onPress: openProfile },
    { title: 'Language', icon: 'language' as const, desc: 'English', onPress: () => {} },
    { title: 'Notifications', icon: 'notifications' as const, desc: 'Alerts & reminders', onPress: () => navigation.navigate('Notifications') },
    { title: 'Privacy', icon: 'shield-checkmark' as const, desc: 'Data & permissions', onPress: () => {} },
    { title: 'Security', icon: 'lock-closed' as const, desc: 'Password & sign-in', onPress: () => {} },
    { title: 'Help & Support', icon: 'help-circle' as const, desc: 'FAQs and contact', onPress: () => {} },
  ];

  const reportIssues = [
    { id: 1, title: 'Fraudulent Listing', icon: 'alert-circle' as const, color: '#EF4444', desc: 'Fake or misleading listings' },
    { id: 2, title: 'Harassment', icon: 'person-remove' as const, color: '#EF4444', desc: 'Inappropriate user behavior' },
    { id: 3, title: 'Document Forgery', icon: 'document' as const, color: '#EF4444', desc: 'Fake or altered documents' },
    { id: 4, title: 'Land Dispute', icon: 'map' as const, color: '#F59E0B', desc: 'Boundary or ownership conflict' },
    { id: 5, title: 'Privacy Violation', icon: 'eye-off' as const, color: '#F59E0B', desc: 'Misuse of personal data' },
    { id: 6, title: 'Other Issue', icon: 'help-circle' as const, color: '#6B7280', desc: 'Other sensitive concerns' },
  ];

  const initials = (user?.fullName || 'U')
    .split(' ')
    .map((p: string) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <CitizenScreen title="Settings" subtitle="Preferences & account">
        <ProfileBanner
          initials={initials}
          name={user?.fullName || 'Citizen'}
          subtitle={user?.email || user?.phone || undefined}
          onPress={openProfile}
        />

        <SectionHeader title="Account" />
        {settingsItems.map((item) => (
          <ListCard
            key={item.title}
            icon={item.icon}
            title={item.title}
            subtitle={item.desc}
            onPress={item.onPress}
          />
        ))}

        <SectionHeader title="Trust & safety" actionLabel="View all" onAction={() => setShowReportModal(true)} />
        {reportIssues.slice(0, 2).map((issue) => (
          <ListCard
            key={issue.id}
            icon={issue.icon}
            iconColor={issue.color}
            title={issue.title}
            subtitle={issue.desc}
            onPress={() => Alert.alert('Report', `Report: ${issue.title}`)}
          />
        ))}

        <TouchableOpacity
          onPress={handleLogout}
          className="mt-4 bg-white p-4 rounded-2xl flex-row items-center justify-center border border-red-100"
        >
          <Ionicons name="log-out-outline" size={22} color="#DC2626" />
          <Text className="text-red-600 font-bold text-base ml-2">Sign out</Text>
        </TouchableOpacity>

        <View className="items-center mt-8 mb-4">
          <Text className="text-gray-400 text-xs">Digital Land Portal v1.0</Text>
        </View>
      </CitizenScreen>

      <Modal visible={showReportModal} transparent animationType="slide" onRequestClose={() => setShowReportModal(false)}>
        <TouchableOpacity className="flex-1 bg-black/50" activeOpacity={1} onPress={() => setShowReportModal(false)}>
          <View className="bg-white rounded-t-3xl mt-auto max-h-[85%]">
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
              <Text className="text-lg font-bold text-gray-900">Report an issue</Text>
              <TouchableOpacity onPress={() => setShowReportModal(false)}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <ScrollView className="p-6">
              <Text className="text-gray-600 text-sm mb-4 leading-5">
                Reports are confidential and reviewed within 24–48 hours.
              </Text>
              {reportIssues.map((issue) => (
                <ListCard
                  key={issue.id}
                  icon={issue.icon}
                  iconColor={issue.color}
                  title={issue.title}
                  subtitle={issue.desc}
                  onPress={() => {
                    setShowReportModal(false);
                    Alert.alert('Submitted', 'Thank you for your report.');
                  }}
                />
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
