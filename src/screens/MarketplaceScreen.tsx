import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

// Components
import { Button } from '../components/ui/Button';

// ✅ FIXED: Added BlockchainExplorer to navigation types
type RootStackParamList = {
  Marketplace: undefined;
  AddLandListing: undefined;
  MainApp: undefined;
  ChatDetail: { chatId: string; name: string };
  BlockchainExplorer: undefined;  // ✅ ADDED
};

type MarketplaceScreenProp = StackNavigationProp<RootStackParamList, 'Marketplace'>;

export default function MarketplaceScreen() {
  const navigation = useNavigation<MarketplaceScreenProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [visibleCount, setVisibleCount] = useState(5);
  const [showFilterModal, setShowFilterModal] = useState(false); // ✅ ADDED for filter modal

  const filters = ['All', 'For Sale', 'For Rent'];

  const landListings = [
    {
      id: 1,
      title: 'Residential Land',
      location: 'Bahir Dar, Kebele 03',
      price: 'ETB 2,500,000',
      priceValue: 2500000,
      area: '450 m²',
      areaValue: 450,
      type: 'For Sale',
      verified: true,
      ledgerHash: '0x882a...991c',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400',
      features: ['Electricity', 'Water', 'Road Access'],
      description: 'Prime residential plot near city center. Ready for construction with all utilities available.',
      seller: 'Abebe Gizaw',
      phone: '+251 911 234 567',
    },
    {
      id: 2,
      title: 'Commercial Plot',
      location: 'Bahir Dar, Kebele 07',
      price: 'ETB 1,800,000',
      priceValue: 1800000,
      area: '320 m²',
      areaValue: 320,
      type: 'For Sale',
      verified: true,
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400',
      features: ['Main Road', 'Electricity'],
      description: 'Excellent location for commercial development. High traffic area with great visibility.',
      seller: 'Kebede Tadesse',
      phone: '+251 922 345 678',
    },
    {
      id: 3,
      title: 'Agricultural Land',
      location: 'Bahir Dar, Kebele 12',
      price: 'ETB 800,000',
      priceValue: 800000,
      area: '1,200 m²',
      areaValue: 1200,
      type: 'For Sale',
      verified: true,
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400',
      features: ['Fertile Soil', 'Water Access'],
      description: 'Fertile agricultural land with water access. Perfect for farming or agricultural investment.',
      seller: 'Tigist Alemu',
      phone: '+251 933 456 789',
    },
    {
      id: 4,
      title: 'Office Space',
      location: 'Bahir Dar, City Center',
      price: 'ETB 15,000/month',
      priceValue: 15000,
      area: '85 m²',
      areaValue: 85,
      type: 'For Rent',
      verified: true,
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
      features: ['Furnished', 'Parking', 'Security'],
      description: 'Modern office space in city center. Fully furnished with parking and 24/7 security.',
      seller: 'Dawit Solomon',
      phone: '+251 944 567 890',
    },
    {
      id: 5,
      title: 'Warehouse',
      location: 'Bahir Dar, Industrial Area',
      price: 'ETB 25,000/month',
      priceValue: 25000,
      area: '500 m²',
      areaValue: 500,
      type: 'For Rent',
      verified: true,
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400',
      features: ['Loading Dock', '24/7 Access'],
      description: 'Large warehouse with loading dock. Ideal for storage or distribution business.',
      seller: 'Hana Bekele',
      phone: '+251 955 678 901',
    },
    {
      id: 6,
      title: 'Mixed Use Plot',
      location: 'Bahir Dar, Kebele 05',
      price: 'ETB 3,200,000',
      priceValue: 3200000,
      area: '650 m²',
      areaValue: 650,
      type: 'For Sale',
      verified: true,
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400',
      features: ['Corner Plot', 'Two Roads'],
      description: 'Versatile mixed-use plot on corner location. Suitable for residential or commercial development.',
      seller: 'Robel Haile',
      phone: '+251 966 789 012',
    },
    {
      id: 7,
      title: 'Retail Space',
      location: 'Bahir Dar, Market Area',
      price: 'ETB 20,000/month',
      priceValue: 20000,
      area: '120 m²',
      areaValue: 120,
      type: 'For Rent',
      verified: true,
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400',
      features: ['High Foot Traffic', 'Display Windows'],
      description: 'Prime retail space in busy market area. Perfect for shop or restaurant.',
      seller: 'Meron Tesfaye',
      phone: '+251 977 890 123',
    },
  ];

  // ✅ Filter & Search Logic
  const filteredListings = landListings.filter((land) => {
    if (activeFilter !== 'All' && land.type !== activeFilter) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        land.title.toLowerCase().includes(query) ||
        land.location.toLowerCase().includes(query) ||
        land.features.some((f) => f.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const displayedListings = filteredListings.slice(0, visibleCount);

  // ✅ Handle Contact Seller
  const handleContact = (land: typeof landListings[0]) => {
    navigation.navigate('ChatDetail', { 
      chatId: `mkt-${land.id}`, 
      name: `${land.seller} (Seller)` 
    });
  };

  // ✅ Handle View Details
  const handleDetails = (land: typeof landListings[0]) => {
    Alert.alert(
      land.title,
      `📍 ${land.location}\n💰 ${land.price}\n📐 ${land.area}\n\n${land.description}\n\n⛓️ Blockchain Hash: ${land.ledgerHash || 'Pending'}\n\nFeatures: ${land.features.join(', ')}`,
      [
        {
          text: 'View on Ledger',
          onPress: () => navigation.navigate('BlockchainExplorer'),
        },
        {
          text: 'Contact Seller',
          onPress: () => handleContact(land),
        },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  // ✅ Handle Load More
  const handleLoadMore = () => {
    if (visibleCount < filteredListings.length) {
      setVisibleCount((prev) => Math.min(prev + 3, filteredListings.length));
    }
  };

  // ✅ Handle Add New Land
  const handleAddListing = () => {
    navigation.navigate('AddLandListing');
  };

  // ✅ Handle Filter Press (NEW)
  const handleFilterPress = () => {
    // For presentation: show simple alert
    // In production: open a filter modal with price range, location, etc.
    Alert.alert(
      'Filter Listings',
      'Filter options will be available in the next update.\n\nFor now, use the search bar or category tabs above.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#125f43ff" />

      {/* Header with Gradient */}
      <LinearGradient
        colors={['#125f43ff', '#125f43ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="px-6 pt-10 pb-6 rounded-b-3xl"
      >
        <Text className="text-white text-2xl font-bold mb-1">Land Marketplace</Text>
        <Text className="text-white/80 text-sm">Browse verified land listings</Text>

        {/* Search Bar */}
        <View className="mt-4 bg-white/10 rounded-xl px-4 py-3 flex-row items-center border border-white/30">
          <Ionicons name="search" size={20} color="white" />
          <TextInput
            className="flex-1 text-white text-base ml-3"
            placeholder="Search by location, price..."
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="Search land listings"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} accessibilityLabel="Clear search">
              <Ionicons name="close-circle" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Filter Tabs */}
        <View className="flex-row py-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filters.map((filter, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setActiveFilter(filter);
                  setVisibleCount(5);
                }}
                className={`px-5 py-2 rounded-full mr-2 ${activeFilter === filter ? 'bg-[#125f43ff]' : 'bg-white border border-gray-200'}`}
                accessibilityLabel={`Filter by ${filter}`}
                accessibilityState={{ selected: activeFilter === filter }}
              >
                <Text className={`text-sm font-semibold ${activeFilter === filter ? 'text-white' : 'text-gray-700'}`}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Results Count + Filter Button */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-gray-600 text-sm">
            {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'} found
          </Text>
          {/* ✅ FIXED: Added onPress to Filter button */}
          <TouchableOpacity 
            className="flex-row items-center"
            onPress={handleFilterPress}
            accessibilityLabel="Open filter options"
          >
            <Ionicons name="filter" size={18} color="#125f43ff" />
            <Text className="text-[#125f43ff] text-sm font-semibold ml-1">Filter</Text>
          </TouchableOpacity>
        </View>

        {/* Land Listings */}
        <View className="pb-8">
          {displayedListings.length === 0 ? (
            <View className="items-center py-12">
              <Ionicons name="search-outline" size={64} color="#9CA3AF" />
              <Text className="text-gray-500 text-base mt-4 text-center">No listings found</Text>
              <Text className="text-gray-400 text-sm mt-2 text-center">
                Try adjusting your search or filters
              </Text>
            </View>
          ) : (
            displayedListings.map((land) => (
              <TouchableOpacity
                key={land.id}
                className="bg-white rounded-2xl overflow-hidden mb-4 shadow-sm border border-gray-100"
                activeOpacity={0.8}
                onPress={() => handleDetails(land)}
                accessibilityLabel={`View details for ${land.title} in ${land.location}`}
              >
                {/* Land Image Placeholder */}
                <View className="relative">
                  <View className="bg-gray-200 h-40 w-full items-center justify-center">
                    <Ionicons name="image-outline" size={60} color="#9CA3AF" />
                  </View>

                  {/* Type Badge */}
                  <View className={`absolute top-3 left-3 px-3 py-1 rounded-full ${land.type === 'For Sale' ? 'bg-[#125f43ff]' : 'bg-blue-600'}`}>
                    <Text className="text-white text-xs font-semibold">{land.type}</Text>
                  </View>

                  {/* Verified Badge */}
                  <View className="absolute top-3 right-3 bg-slate-900 px-2 py-1 rounded-full flex-row items-center border border-emerald-500/50">
                    <Ionicons name="shield-checkmark" size={12} color="#10b981" />
                    <Text className="text-white text-[10px] font-bold ml-1 uppercase">Blockchain Verified</Text>
                  </View>
                </View>

                {/* Land Details */}
                <View className="p-4">
                  <Text className="text-gray-800 font-bold text-lg mb-1">{land.title}</Text>

                  <View className="flex-row items-center mb-2">
                    <Ionicons name="location" size={16} color="#9CA3AF" />
                    <Text className="text-gray-600 text-sm ml-1">{land.location}</Text>
                  </View>

                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-[#125f43ff] font-bold text-lg">{land.price}</Text>
                    <View className="flex-row items-center bg-gray-100 px-2 py-1 rounded">
                      <Ionicons name="expand" size={14} color="#6B7280" />
                      <Text className="text-gray-600 text-sm ml-1">{land.area}</Text>
                    </View>
                  </View>

                  {/* Features */}
                  <View className="flex-row flex-wrap mb-3">
                    {land.features.map((feature, idx) => (
                      <View key={idx} className="bg-green-50 px-2 py-1 rounded mr-2 mb-1">
                        <Text className="text-[#125f43ff] text-xs">{feature}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Action Buttons */}
                  <View className="flex-row gap-2">
                    <Button
                      title="Contact"
                      onPress={() => handleContact(land)}
                      variant="primary"
                      className="flex-1 py-2.5 h-10"
                      textClassName="text-sm"
                      accessibilityLabel={`Contact seller ${land.seller}`}
                    />
                    <Button
                      title="Details"
                      onPress={() => handleDetails(land)}
                      variant="outline"
                      className="flex-1 py-2.5 h-10"
                      textClassName="text-sm"
                      accessibilityLabel={`View details for ${land.title}`}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Load More Button */}
        {visibleCount < filteredListings.length && (
          <Button
            title="Load More Listings"
            onPress={handleLoadMore}
            variant="outline"
            className="mb-8"
            icon="arrow-down"
            iconPosition="right"
            accessibilityLabel="Load more land listings"
          />
        )}
      </ScrollView>

      {/* Floating Add Listing Button */}
      <TouchableOpacity
        onPress={handleAddListing}
        className="absolute bottom-20 right-6 bg-[#125f43ff] rounded-full p-4 shadow-lg"
        activeOpacity={0.8}
        accessibilityLabel="Add new land listing"
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}