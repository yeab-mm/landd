import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { marketplaceAPI, chatAPI } from '../api/config';

type Listing = {
  id: string;
  title: string;
  location: string;
  price: string;
  priceValue: number;
  area: string;
  type: string;
  verified: boolean;
  description: string;
  seller: string;
  sellerId: string;
  phone?: string;
  plotNumber: string;
};

type RootStackParamList = {
  Marketplace: undefined;
  AddLandListing: undefined;
  ChatDetail: { conversationId: string; name: string; landId?: string };
  VerificationRequest: undefined;
};

type MarketplaceScreenProp = StackNavigationProp<RootStackParamList, 'Marketplace'>;

export default function MarketplaceScreen() {
  const navigation = useNavigation<MarketplaceScreenProp>();
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [visibleCount, setVisibleCount] = useState(10);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [contactingId, setContactingId] = useState<string | null>(null);

  const filters = ['All', 'For Sale', 'For Rent'];

  const loadListings = useCallback(async () => {
    if (!token) {
      setListings([]);
      setLoading(false);
      return;
    }
    try {
      const data = await marketplaceAPI.getListings();
      setListings(data.listings || []);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load listings';
      console.error(msg);
      setListings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadListings();
    }, [loadListings])
  );

  const filteredListings = listings.filter((land) => {
    if (activeFilter !== 'All' && land.type !== activeFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        land.title.toLowerCase().includes(query) ||
        land.location.toLowerCase().includes(query) ||
        land.plotNumber.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const displayedListings = filteredListings.slice(0, visibleCount);

  const handleContact = async (land: Listing) => {
    if (!token) {
      Alert.alert('Sign in required', 'Please log in to contact the seller.');
      return;
    }
    setContactingId(land.id);
    try {
      const data = await chatAPI.startConversation(land.id);
      const conv = data.conversation;
      navigation.navigate('ChatDetail', {
        conversationId: conv.id,
        name: `${land.seller} (Seller)`,
        landId: land.id,
      });
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not start chat');
    } finally {
      setContactingId(null);
    }
  };

  const handleDetails = (land: Listing) => {
    Alert.alert(
      land.title,
      `📍 ${land.location}\n💰 ${land.price}\n📐 ${land.area}\n📋 Plot: ${land.plotNumber}\n\n${land.description || 'No description.'}\n\nAsk the seller anything in live chat. You can also request Ownership Verification from Services.`,
      [
        {
          text: 'Ownership verification',
          onPress: () => navigation.navigate('VerificationRequest'),
        },
        { text: 'Contact seller', onPress: () => handleContact(land) },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#125f43ff" />

      <LinearGradient
        colors={['#125f43ff', '#125f43ff']}
        className="px-6 pt-10 pb-6 rounded-b-3xl"
      >
        <Text className="text-white text-2xl font-bold mb-1">Land Marketplace</Text>
        <Text className="text-white/80 text-sm">Officer-approved listings only</Text>

        <View className="mt-4 bg-white/10 rounded-xl px-4 py-3 flex-row items-center border border-white/30">
          <Ionicons name="search" size={20} color="white" />
          <TextInput
            className="flex-1 text-white text-base ml-3"
            placeholder="Search by location, plot..."
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadListings();
            }}
            colors={['#125f43']}
          />
        }
      >
        <View className="flex-row py-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => {
                  setActiveFilter(filter);
                  setVisibleCount(10);
                }}
                className={`px-5 py-2 rounded-full mr-2 ${activeFilter === filter ? 'bg-[#125f43ff]' : 'bg-white border border-gray-200'}`}
              >
                <Text className={`text-sm font-semibold ${activeFilter === filter ? 'text-white' : 'text-gray-700'}`}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-gray-600 text-sm">
            {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'}
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#125f43" className="py-12" />
        ) : displayedListings.length === 0 ? (
          <View className="items-center py-12">
            <Ionicons name="storefront-outline" size={64} color="#9CA3AF" />
            <Text className="text-gray-500 text-base mt-4 text-center">No approved listings yet</Text>
            <Text className="text-gray-400 text-sm mt-2 text-center px-4">
              Submit your land for sale — admin and officer must approve before it appears here.
            </Text>
          </View>
        ) : (
          displayedListings.map((land) => (
            <TouchableOpacity
              key={land.id}
              className="bg-white rounded-2xl overflow-hidden mb-4 shadow-sm border border-gray-100"
              activeOpacity={0.8}
              onPress={() => handleDetails(land)}
            >
              <View className="relative">
                <View className="bg-gray-200 h-40 w-full items-center justify-center">
                  <Ionicons name="image-outline" size={60} color="#9CA3AF" />
                </View>
                <View className={`absolute top-3 left-3 px-3 py-1 rounded-full ${land.type === 'For Sale' ? 'bg-[#125f43ff]' : 'bg-blue-600'}`}>
                  <Text className="text-white text-xs font-semibold">{land.type}</Text>
                </View>
                {land.verified && (
                  <View className="absolute top-3 right-3 bg-slate-900 px-2 py-1 rounded-full flex-row items-center border border-emerald-500/50">
                    <Ionicons name="shield-checkmark" size={12} color="#10b981" />
                    <Text className="text-white text-[10px] font-bold ml-1 uppercase">Verified</Text>
                  </View>
                )}
              </View>

              <View className="p-4">
                <Text className="text-gray-800 font-bold text-lg mb-1">{land.title}</Text>
                <View className="flex-row items-center mb-2">
                  <Ionicons name="location" size={16} color="#9CA3AF" />
                  <Text className="text-gray-600 text-sm ml-1">{land.location}</Text>
                </View>
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-[#125f43ff] font-bold text-lg">{land.price}</Text>
                  <Text className="text-gray-600 text-sm">{land.area}</Text>
                </View>
                <View className="flex-row gap-2">
                  <Button
                    title={contactingId === land.id ? 'Connecting...' : 'Live chat'}
                    onPress={() => handleContact(land)}
                    variant="primary"
                    className="flex-1 py-2.5 h-10"
                    textClassName="text-sm"
                    disabled={contactingId === land.id}
                  />
                  <Button
                    title="Details"
                    onPress={() => handleDetails(land)}
                    variant="outline"
                    className="flex-1 py-2.5 h-10"
                    textClassName="text-sm"
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        {visibleCount < filteredListings.length && (
          <Button
            title="Load more"
            onPress={() => setVisibleCount((v) => v + 10)}
            variant="outline"
            className="mb-8"
          />
        )}
      </ScrollView>

      <TouchableOpacity
        onPress={() => navigation.navigate('AddLandListing')}
        className="absolute bottom-20 right-6 bg-[#125f43ff] rounded-full p-4 shadow-lg"
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}
