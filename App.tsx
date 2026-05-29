import 'react-native-gesture-handler';
// File: App.tsx
// Location: C:\Users\h\land-portal-app/App.tsx (FRONTEND ROOT)
// Purpose: Root component with NavigationContainer and providers
// File: App.tsx (add at very top, before React import)
import './src/global.css';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Frontend providers only
import { AuthProvider } from './src/context/AuthContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { PaymentProvider } from './src/context/PaymentContext';
// Frontend navigation only
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <PaymentProvider>
            <LanguageProvider>
              <AuthProvider>
                <AppNavigator />
                <StatusBar style="light" />
              </AuthProvider>
            </LanguageProvider>
          </PaymentProvider>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}