import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { marketplaceAPI, chatAPI } from '../api/config';
import { Screen } from '../components/layout/Screen';
import {
  CitizenHeader,
  EmptyState,
  SearchBar,
  FilterChips,
  MarketplaceListingCard,
} from '../components/citizen/CitizenUI';
import { CITIZEN_PRIMARY, CITIZEN_BG } from '../theme/citizenTheme';

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
      `Location: ${land.location}\nPrice: ${land.price}\nArea: ${land.area}\nPlot: ${land.plotNumber}\n\n${land.description || 'No description.'}\n\nAsk the seller anything in live chat. You can also request Ownership Verification from Services.`,
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
    <Screen style={{ backgroundColor: CITIZEN_BG }}>
      <StatusBar barStyle="light-content" backgroundColor={CITIZEN_PRIMARY} />

      <CitizenHeader
        title="Land Marketplace"
        subtitle="Officer-approved listings only"
        showBack
        stat={{ label: 'Listings', value: filteredListings.length }}
      />

      <View className="px-5 -mt-2 mb-3">
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search location, plot..."
          onClear={() => setSearchQuery('')}
        />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadListings();
            }}
            colors={[CITIZEN_PRIMARY]}
          />
        }
      >
        <View className="py-3">
          <FilterChips
            options={filters}
            active={activeFilter}
            onSelect={(f) => {
              setActiveFilter(f);
              setVisibleCount(10);
            }}
          />
        </View>

        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-gray-600 text-sm">
            {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'}
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#125f43" className="py-12" />
        ) : displayedListings.length === 0 ? (
          <EmptyState
            icon="storefront-outline"
            title="No listings yet"
            message="Approved properties will appear here. List your land and wait for officer verification."
            actionLabel="List my land"
            onAction={() => navigation.navigate('AddLandListing')}
          />
        ) : (
          displayedListings.map((land) => (
            <MarketplaceListingCard
              key={land.id}
              title={land.title}
              location={land.location}
              price={land.price}
              area={land.area}
              typeLabel={land.type}
              verified={land.verified}
              contacting={contactingId === land.id}
              onPress={() => handleDetails(land)}
              onContact={() => handleContact(land)}
              onDetails={() => handleDetails(land)}
            />
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
        activeOpacity={0.88}
        className="absolute bottom-20 right-6 rounded-full p-4"
        style={{
          backgroundColor: CITIZEN_PRIMARY,
          shadowColor: CITIZEN_PRIMARY,
          shadowOpacity: 0.45,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </Screen>
  );
}
