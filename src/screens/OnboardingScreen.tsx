import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Onboarding: undefined;
  Settings: { fromOnboarding?: boolean };
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  OTPVerification: { phone?: string };
  MainApp: undefined;
};

type OnboardingScreenProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

type Slide = {
  title: string;
  subtitle: string;
  features: Array<{ title: string; desc: string }>;
  icon: keyof typeof Ionicons.glyphMap;
};

export default function OnboardingScreen() {
  const navigation = useNavigation<OnboardingScreenProp>();
  const { language, t } = useLanguage();
  const { completeOnboarding } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const PRIMARY_COLOR = '#125f43ff';

  const slides: Slide[] = [
    {
      title: language === 'am' ? 'የዲጂታል መሬት ፖርታል' : 'Digital Land Citizen Portal',
      subtitle: language === 'am' ? 'ዜጎች የመሬት አገልግሎቶችን እንዲያገኙ እና የመሬት ባለቤትነትን በዲጂታል መንገድ እንዲያረጋግጡ የሚረዳ ቀላል እና ደህንነቱ የተጠበቀ የሞባይል ፕላትፎርም::' : 'A simple and secure mobile platform that helps citizens access land services and verify land ownership digitally.',
      features: [
        { title: language === 'am' ? 'ባለቤትነትን ያረጋግጡ' : 'Verify Ownership', desc: language === 'am' ? 'የመሬትን ትክክለኛነት በቀጥታ ከስልክዎ ያረጋግጡ::' : 'Confirm land authenticity directly from your phone.' },
        { title: language === 'am' ? 'ዲጂታል አገልግሎቶች' : 'Digital Services', desc: language === 'am' ? 'የባለቤትነት የምስክር ወረቀቶችን ይጠይቁ እና የመሬት አገልግሎቶችን በመስመር ላይ ያስዳድሩ::' : 'Request certificates and manage land services online.' },
        { title: language === 'am' ? 'ታማኝ እና ግልጽ' : 'Trusted & Transparent', desc: language === 'am' ? 'ከመንግስት አሰራር ጋር የተጣጣመ እና ከማጭበርበር የተጠበቀ ስርዓት::' : 'Government-aligned system protected against fraud.' },
      ],
      icon: 'earth',
    },
    {
      title: language === 'am' ? 'መሬትዎን ያረጋግጡ እና ያስዳድሩ' : 'Verify & Manage Your Land',
      subtitle: language === 'am' ? 'በስምዎ የተመዘገቡ መሬቶችን ሁሉ ይመልከቱ፣ የባለቤትነት ዝርዝሮችን ያረጋግጡ እና የመሬት አገልግሎቶችን በግል ዳሽቦርድዎ በኩል ይጠይቁ::' : 'View all land registered under your name, verify ownership details, and request land services securely through your personal dashboard.',
      features: [
        { title: language === 'am' ? 'የዳኝነት መሬቶችን ይመልከቱ' : 'View Owned Land', desc: language === 'am' ? 'በስምዎ የተመዘገቡ መሬቶችን ሙሉ ዝርዝር ያግኙ::' : 'Access complete details of land registered in your name.' },
        { title: language === 'am' ? 'የባለቤትነት ማረጋገጫ' : 'Ownership Verification', desc: language === 'am' ? 'የመሬት ካርታ ወይም የምስክር ወረቀት ቁጥሮችን በመጠቀም ትክክለኛነቱን ያረጋግጡ::' : 'Confirm land authenticity using plot or certificate numbers.' },
        { title: language === 'am' ? 'ጥያቄዎችን ይከታተሉ' : 'Request Tracking', desc: language === 'am' ? 'የጥያቄዎን የሂደት ደረጃ በቅጽበት ይከታተሉ::' : 'Track approval progress step by step in real time.' },
      ],
      icon: 'document-text',
    },
    {
      title: language === 'am' ? 'ይግዙ፣ ይሽጡ እና አገልግሎቶችን ያግኙ' : 'Buy, Sell & Access Services',
      subtitle: language === 'am' ? 'የተረጋገጡ የመሬት ሽያጭ ዝርዝሮችን ያስሱ፣ የባለቤትነት ዝውውር ይጠይቁ እና ሁሉንም ዲጂታል የመሬት አገልግሎቶች በአንድ የታመነ ቦታ ያግኙ::' : 'Explore verified land listings, request transfers, and access digital land services all in one trusted platform.',
      features: [
        { title: language === 'am' ? 'የመሬት ገበያ' : 'Land Marketplace', desc: language === 'am' ? 'የተረጋገጡ የመሬት ሽያጭ ዝርዝሮችን በደህና ይፈልጉ እና ይለጥፉ::' : 'Browse and publish verified land listings securely.' },
        { title: language === 'am' ? 'የባለቤትነት ዝውውር' : 'Ownership Transfer', desc: language === 'am' ? 'በዲጂታል መንገድ የመሬት ባለቤትነት ዝውውር ይጠይቁ::' : 'Request digital land transfer with official approval.' },
        { title: language === 'am' ? 'የመሬት አገልግሎቶች' : 'Land Services', desc: language === 'am' ? 'የምስክር ወረቀቶችን፣ እድሳትን እና ህጋዊ አገልግሎቶችን በመስመር ላይ ያግኙ::' : 'Apply for certificates, updates, and legal services online.' },
      ],
      icon: 'business',
    },
  ];

  // ✅ Navigate to Settings (your language screen)
  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      scrollViewRef.current?.scrollTo({ x: width * (currentIndex + 1), animated: true });
      setCurrentIndex(currentIndex + 1);
    } else {
      await completeOnboarding();
      navigation.navigate('Settings', { fromOnboarding: true });
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
    navigation.navigate('Settings', { fromOnboarding: true });
  };

  const renderSlide = (slide: Slide, index: number) => (
    <View key={index} style={{ width }} className="flex-1">
      <View
        className="px-6 pt-16 pb-12 rounded-b-3xl mb-2"
        style={{
          backgroundColor: PRIMARY_COLOR,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
          minHeight: index === 2 ? 391 : 380,
        }}
      >
        <View className="items-center mb-10">
          <View className="bg-white/10 rounded-2xl p-8">
            <Ionicons name={slide.icon} size={70} color="white" />
          </View>
        </View>
        <Text className="text-white text-3xl font-bold text-center mb-4 leading-tight">
          <Text>{slide.title}</Text>
        </Text>
        <Text className="text-white/95 text-center text-sm leading-6 px-10">
          <Text>{slide.subtitle}</Text>
        </Text>
      </View>

      <View className="px-6 flex-1 justify-center mb-30">
        {slide.features.map((feature, idx) => (
          <View key={idx} className="flex-row mb-10 items-start">
            <View className="bg-green-100 rounded-full p-2.5 mr-4 mt-1">
              <Ionicons name="checkmark" size={18} color="#11553cff" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-bold text-base mb-1.5">
                <Text>{feature.title}</Text>
              </Text>
              <Text className="text-gray-600 text-sm leading-5">
                <Text>{feature.desc}</Text>
              </Text>
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
          style={{ backgroundColor: idx === currentIndex ? PRIMARY_COLOR : '#D1D5DB' }}
        />
      ))}
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />

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

      <View className="px-6 pb-18">
        {renderPagination()}
        <View className="flex-row justify-between items-center">
          <TouchableOpacity onPress={handleSkip} className="px-4 py-2">
            <Text className="text-gray-400 font-semibold text-base">
              <Text>{t?.('common.skip') || 'Skip'}</Text>
            </Text>
          </TouchableOpacity>
          <Button
            title={currentIndex === slides.length - 1 ? (t?.('common.getStarted') || 'Get Started') : (t?.('common.next') || 'Next')}
            onPress={handleNext}
            variant="primary"
            className="px-7"
            icon={currentIndex === slides.length - 1 ? 'rocket' : 'arrow-forward'}
            iconPosition="right"
          />
        </View>
      </View>
    </View>
  );
}