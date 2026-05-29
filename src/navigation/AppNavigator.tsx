// File: src/navigation/AppNavigator.tsx
// Auth flow:
// 1. New user → Onboarding → Language → Register → OTP → Home
// 2. Returning user (not logged in) → Login → Home
// 3. Saved session → Home directly

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { useUnreadNotifications } from '../hooks/useUnreadNotifications';
import SettingsScreen from '../screens/SettingsScreen';

import OnboardingScreen from '../screens/OnboardingScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';
import HomeScreen from '../screens/HomeScreen';
import MyLandsScreen from '../screens/MyLandsScreen';
import MyRequestsScreen from '../screens/MyRequestsScreen';
import MyDocumentsScreen from '../screens/MyDocumentsScreen';
import SettingsTabScreen from '../screens/SettingsTabScreen';
import MarketplaceScreen from '../screens/MarketplaceScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ProfileScreen from '../screens/ProfileScreen';
import VerificationRequestScreen from '../screens/VerificationRequestScreen';
import TrackRequestScreen from '../screens/TrackRequestScreen';
import RegistrationRequestScreen from '../screens/RegistrationRequestScreen';
import RequestDetailScreen from '../screens/RequestDetailScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import OwnershipTransferScreen from '../screens/OwnershipTransferScreen';
import AddLandListingScreen from '../screens/AddLandListingScreen';
import TermsAndConditionsScreen from '../screens/TermsAndConditionsScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import WebPortalScreen from '../screens/WebPortalScreen';
import LandSubdivisionScreen from '../screens/LandSubdivisionScreen';
import LandMutationScreen from '../screens/LandMutationScreen';
import ZoningChangeScreen from '../screens/ZoningChangeScreen';
import BlockchainExplorerScreen from '../screens/BlockchainExplorerScreen';
import TaxDashboardScreen from '../screens/TaxDashboardScreen';
import PaymentHistoryScreen from '../screens/PaymentHistoryScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const stackScreenOptions = {
  headerShown: false,
  animation: 'slide_from_right' as const,
  contentStyle: { flex: 1, backgroundColor: '#f0f7f4' },
};

function TabNotificationIcon({ color, size }: { color: string; size: number }) {
  const { unreadCount } = useUnreadNotifications();
  return (
    <View>
      <Ionicons name="notifications" color={color} size={size} />
      {unreadCount > 0 && (
        <View style={tabStyles.badge}>
          <Text style={tabStyles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
        </View>
      )}
    </View>
  );
}

function AppTabs() {
  const { refreshUnread } = useUnreadNotifications();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#125f43',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          paddingBottom: 10,
          paddingTop: 10,
          height: 68,
          shadowColor: '#0a3d2c',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 12,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 2 },
        headerShown: false,
        sceneStyle: { flex: 1, backgroundColor: '#f0f7f4' },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />, tabBarLabel: 'Home' }} />
      <Tab.Screen name="MyLands" component={MyLandsScreen} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="map" color={color} size={size} />, tabBarLabel: 'My Lands' }} />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        listeners={{ focus: () => refreshUnread() }}
        options={{
          tabBarIcon: ({ color, size }) => <TabNotificationIcon color={color} size={size} />,
          tabBarLabel: 'Notifications',
        }}
      />
      <Tab.Screen name="MyDocuments" component={MyDocumentsScreen} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="folder" color={color} size={size} />, tabBarLabel: 'My Documents' }} />
      <Tab.Screen name="SettingsTab" component={SettingsTabScreen} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="settings" color={color} size={size} />, tabBarLabel: 'Settings' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { token, isLoading, isOtpVerified, pendingPhone, hasSeenOnboarding, user } = useAuth();

  const isAuthenticated = Boolean(token && isOtpVerified);
  const isAwaitingOtp = Boolean(pendingPhone && !isOtpVerified);

  const getInitialRoute = () => {
    if (isAuthenticated) {
      const role = (user?.role || '').toLowerCase();
      if (role === 'officer' || role === 'admin') return 'WebPortal';
      return 'MainApp';
    }
    if (isAwaitingOtp) return 'OTPVerification';
    if (!hasSeenOnboarding) return 'Onboarding';
    return 'Login';
  };

  // Keep a single guest stack so Register → OTP navigation is not reset mid-flow
  const stackKey = isAuthenticated ? 'authenticated' : 'guest';

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' }}>
        <ActivityIndicator size="large" color="#125f43" />
        <Text style={{ marginTop: 10, color: '#4B5563' }}>Loading Portal...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator
      key={stackKey}
      initialRouteName={getInitialRoute()}
      screenOptions={stackScreenOptions}
    >
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen
            name="OTPVerification"
            component={OTPVerificationScreen}
            initialParams={pendingPhone ? { phone: pendingPhone } : undefined}
          />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="MainApp" component={AppTabs} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainApp" component={AppTabs} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Marketplace" component={MarketplaceScreen} />
          <Stack.Screen name="VerificationRequest" component={VerificationRequestScreen} />
          <Stack.Screen name="RegistrationRequest" component={RegistrationRequestScreen} />
          <Stack.Screen name="MyRequests" component={MyRequestsScreen} />
          <Stack.Screen name="RequestDetail" component={RequestDetailScreen} />
          <Stack.Screen name="MyLands" component={MyLandsScreen} />
          <Stack.Screen name="AddLandListing" component={AddLandListingScreen} />
          <Stack.Screen name="OwnershipTransfer" component={OwnershipTransferScreen} />
          <Stack.Screen name="TrackRequest" component={TrackRequestScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="ChatList" component={ChatListScreen} />
          <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
          <Stack.Screen name="LandSubdivision" component={LandSubdivisionScreen} />
          <Stack.Screen name="LandMutation" component={LandMutationScreen} />
          <Stack.Screen name="ZoningChange" component={ZoningChangeScreen} />
          <Stack.Screen name="BlockchainExplorer" component={BlockchainExplorerScreen} />
          <Stack.Screen name="TaxDashboard" component={TaxDashboardScreen} />
          <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
          <Stack.Screen name="WebPortal" component={WebPortalScreen} />
        </>
      )}

      <Stack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} />
    </Stack.Navigator>
  );
}

const tabStyles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -6,
    top: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
});
