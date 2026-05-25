import React from 'react';
import { View, Text, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';

// ✅ FIXED: Proper route params typing
interface RouteParams {
  type?: 'general' | 'listing' | 'declaration' | 'auth';
}

// ✅ Content type definition
type ContentSection = {
  header: string;
  content: string;
};

type Content = {
  title: string;
  subtitle: string;
  sections: ContentSection[];
};

const CONTENT: Record<string, Content> = {
  general: {
    title: 'Terms & Conditions',
    subtitle: 'Service Usage Agreement',
    sections: [
      {
        header: '1. Acceptance of Terms',
        content: 'By accessing and using the Digital Land Portal, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the services.',
      },
      {
        header: '2. User Eligibility',
        content: 'Users must be legal residents of Ethiopia and possess a valid Fayda Digital ID to access government-level land services.',
      },
      {
        header: '3. Data Privacy',
        content: 'Your personal and land data is protected under the National Data Protection Laws. We only share information with authorized government bodies for verification purposes.',
      },
      {
        header: '4. Prohibited Activities',
        content: 'Users are prohibited from submitting forged documents, misrepresenting land ownership, or attempting to bypass security measures.',
      },
    ],
  },
  listing: {
    title: 'Marketplace Terms',
    subtitle: 'Property Listing Agreement',
    sections: [
      {
        header: '1. Accuracy of Information',
        content: 'As a lister, you are solely responsible for the accuracy of property details, price, and media provided.',
      },
      {
        header: '2. Ownership Verification',
        content: 'Listing a property on this portal does not constitute a legal transfer of title. Official transfers must be processed via the Ownership Transfer service.',
      },
      {
        header: '3. Fees and Commissions',
        content: 'The portal currently does not charge commissions on successful sales, but government administrative fees apply for title transfers.',
      },
    ],
  },
  declaration: {
    title: 'Legal Declaration',
    subtitle: 'Applicant Solemn Affirmation',
    sections: [
      {
        header: '1. Truthfulness',
        content: 'I solemnly declare that all information and documents provided in this application are true, correct, and complete to the best of my knowledge.',
      },
      {
        header: '2. Verification Consent',
        content: 'I authorize the Land Administration Bureau to verify my information with relevant government agencies and conduct field inspections at the specified plot.',
      },
      {
        header: '3. Legal Consequences',
        content: 'I understand that any false statement or forged document will lead to immediate rejection, legal action, and possible criminal prosecution under the Revised Federal Criminal Code.',
      },
    ],
  },
  auth: {
    title: 'Account Terms',
    subtitle: 'User Registration Agreement',
    sections: [
      {
        header: '1. Fayda Integration',
        content: 'Account creation requires integration with the Fayda Digital ID system. Your identity will be verified against the National ID database.',
      },
      {
        header: '2. Security Responsibilities',
        content: 'You are responsible for maintaining the confidentiality of your credentials. Any activity performed under your account is your legal responsibility.',
      },
      {
        header: '3. Termination',
        content: 'The bureau reserves the right to suspend or terminate accounts found to be involved in fraudulent land transactions.',
      },
    ],
  },
};

export default function TermsAndConditionsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { type = 'general' } = (route.params as RouteParams) || {};
  
  // ✅ FIXED: Use explicit green theme colors
  const PRIMARY_COLOR = '#125f43ff';
  const PRIMARY_LIGHT = '#1a7f5a';
  
  const data = CONTENT[type as keyof typeof CONTENT] || CONTENT.general;

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View className="pt-14 pb-4 px-6 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-4"
          accessibilityLabel="Go back to previous screen"
        >
          <Ionicons name="arrow-back" size={24} color={PRIMARY_COLOR} />
        </TouchableOpacity>
        <View>
          <Text className="text-2xl font-bold text-gray-900">{data.title}</Text>
          <Text className="text-gray-500 text-xs uppercase tracking-widest">{data.subtitle}</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-6" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 40 }}
      >
        {/* ✅ FIXED: Use explicit colors */}
        <LinearGradient
          colors={[PRIMARY_COLOR, PRIMARY_LIGHT]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="p-6 rounded-3xl mb-8"
        >
          <Ionicons name="shield-checkmark" size={40} color="white" style={{ opacity: 0.8, marginBottom: 12 }} />
          <Text className="text-white text-lg font-bold mb-2">Your Security Matters</Text>
          <Text className="text-white/80 text-sm leading-5">
            We ensure all land transactions are legal, transparent, and protected by the Federal Democratic Republic of Ethiopia's land laws.
          </Text>
        </LinearGradient>

        {data.sections.map((section, index) => (
          <View key={index} className="mb-8">
            {/* ✅ FIXED: Use explicit color */}
            <Text className="text-[#125f43ff] font-bold text-lg mb-2">{section.header}</Text>
            {/* ✅ FIXED: Use explicit color */}
            <View className="w-12 h-1 bg-[#125f43ff]/20 rounded-full mb-3" />
            <Text className="text-gray-700 text-base leading-6 text-justify">
              {section.content}
            </Text>
          </View>
        ))}

        <View className="mt-4 p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <Text className="text-gray-500 text-xs text-center italic">
            Last Updated: April 2024{"\n"}
            Digital Land Administration Bureau
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View className="px-6 py-6 border-t border-gray-100">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="bg-[#125f43ff] py-4 rounded-2xl items-center shadow-lg shadow-[#125f43ff]/30"
          accessibilityLabel="Agree to terms and continue"
        >
          <Text className="text-white font-bold text-lg">I Understand & Agree</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}