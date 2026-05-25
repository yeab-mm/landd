import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Onboarding: undefined;
  Settings: undefined;
};

type OnboardingScreenProp = StackNavigationProp<RootStackParamList, 'Settings'>;

const slides = [
  {
    title: 'Digital Land Citizen Portal',
    subtitle: 'A simple and secure mobile platform that helps citizens access land services and verify land ownership digitally.',
    features: [
      { title: 'Verify Ownership', desc: 'Confirm land authenticity directly from your phone.' },
      { title: 'Digital Services', desc: 'Request certificates and manage land services online.' },
      { title: 'Trusted & Transparent', desc: 'Government-aligned system protected against fraud.' },
    ],
    icon: 'earth',
  },
  {
    title: 'Verify & Manage Your Land',
    subtitle: 'View all land registered under your name, verify ownership details, and request land services securely through your personal dashboard.',
    features: [
      { title: 'View Owned Land', desc: 'Access complete details of land registered in your name.' },
      { title: 'Ownership Verification', desc: 'Confirm land authenticity using plot or certificate numbers.' },
      { title: 'Request Tracking', desc: 'Track approval progress step by step in real time.' },
    ],
    icon: 'document-text',
  },
  {
    title: 'Buy, Sell & Access Services',
    subtitle: 'Explore verified land listings, request transfers, and access digital land services all in one trusted platform.',
    features: [
      { title: 'Land Marketplace', desc: 'Browse and publish verified land listings securely.' },
      { title: 'Ownership Transfer', desc: 'Request digital land transfer with official approval.' },
      { title: 'Land Services', desc: 'Apply for certificates, updates, and legal services online.' },
    ],
    icon: 'business',
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation<OnboardingScreenProp>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      scrollViewRef.current?.scrollTo({ x: width * (currentIndex + 1), animated: true });
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.navigate('Settings'); // ✅ Navigate to Settings
    }
  };

  const handleSkip = () => {
    navigation.navigate('Settings'); // ✅ Navigate to Settings
  };

  const renderSlide = (slide: typeof slides[0], index: number) => (
    <View key={index} style={{ width }} className="flex-1">
      {/* Gradient Header */}
      <View
        className="px-6 pt-16 pb-12 rounded-b-3xl mb-2"
        style={{
          backgroundColor: '#125f43ff',
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
          minHeight: index === 2 ? 391 : 380,
        }}
      >
        {/* Icon - Centered */}
        <View className="items-center mb-10">
          <View className="bg-white/10 rounded-2xl p-8">
            <Ionicons name={slide.icon as any} size={70} color="white" />
          </View>
        </View>

        {/* Title - Centered */}
        <Text className="text-white text-3xl font-bold text-center mb-4 leading-tight">
          {slide.title}
        </Text>

        {/* Subtitle - Centered */}
        <Text className="text-white/95 text-center text-sm leading-6 px-10">
          {slide.subtitle}
        </Text>
      </View>

      {/* Features List */}
      <View className="px-6 flex-1 justify-center mb-30">
        {slide.features.map((feature, idx) => (
          <View key={idx} className="flex-row mb-10 items-start">
            <View className="bg-green-100 rounded-full p-2.5 mr-4 mt-1">
              <Ionicons name="checkmark" size={18} color="#11553cff" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-bold text-base mb-1.5">{feature.title}</Text>
              <Text className="text-gray-600 text-sm leading-5">{feature.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderPagination = () => (
    <View className="flex-row justify-center mb-10">
      {slides.map((_, idx) => (
        <View
          key={idx}
          className={`h-2 rounded-full mx-1.5 ${idx === currentIndex ? 'w-7' : 'w-2'}`}
          style={{
            backgroundColor: idx === currentIndex ? '#125f43ff' : '#D1D5DB'
          }}
        />
      ))}
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#164634ff" />

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      >
        {slides.map((slide, index) => renderSlide(slide, index))}
      </ScrollView>

      {/* Bottom Controls */}
      <View className="px-6 pb-18">
        {renderPagination()}

        <View className="flex-row justify-between items-center">
          {/* Skip Button */}
          <TouchableOpacity
            onPress={handleSkip}
            className="px-4 py-2"
            activeOpacity={0.7}
          >
            <Text className="text-gray-400 font-semibold text-base">Skip</Text>
          </TouchableOpacity>

          {/* Next/Get Started Button */}
          <TouchableOpacity
            onPress={handleNext}
            className="px-7 py-3 rounded-xl shadow-md"
            style={{ backgroundColor: '#1E7F5C' }}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-base">
              {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}