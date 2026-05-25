import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import OnboardingScreen from '../screens/OnboardingScreen';
import SettingsScreen from '../screens/SettingsScreen';
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


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#125f43ff',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerShown: false
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />, tabBarLabel: 'Home' }} />
      <Tab.Screen name="MyLands" component={MyLandsScreen} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="map" color={color} size={size} />, tabBarLabel: 'My Lands' }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="notifications" color={color} size={size} />, tabBarLabel: 'Notifications' }} />
      <Tab.Screen name="MyDocuments" component={MyDocumentsScreen} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="folder" color={color} size={size} />, tabBarLabel: 'My Documents' }} />
      <Tab.Screen name="SettingsTab" component={SettingsTabScreen} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="settings" color={color} size={size} />, tabBarLabel: 'Settings' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Onboarding" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="MainApp" component={AppTabs} />
        <Stack.Screen name="Marketplace" component={MarketplaceScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
        <Stack.Screen name="VerificationRequest" component={VerificationRequestScreen} options={{ headerShown: false }} />
        <Stack.Screen name="RegistrationRequest" component={RegistrationRequestScreen} options={{ headerShown: false }} />
        <Stack.Screen name="TrackRequest" component={TrackRequestScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MyRequests" component={MyRequestsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="RequestDetail" component={RequestDetailScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="OwnershipTransfer" component={OwnershipTransferScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}