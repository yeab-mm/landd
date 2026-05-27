import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../api/config';

type RootStackParamList = {
  ChatList: undefined;
  ChatDetail: { conversationId: string; name: string };
  Marketplace: undefined;
};

type ChatListNavigationProp = StackNavigationProp<RootStackParamList, 'ChatList'>;

type ConversationRow = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  landTitle?: string;
};

export default function ChatListScreen() {
  const navigation = useNavigation<ChatListNavigationProp>();
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token) {
      setConversations([]);
      setLoading(false);
      return;
    }
    try {
      const data = await chatAPI.getConversations();
      const rows: ConversationRow[] = (data.conversations || []).map((c: any) => {
        const last = c.messages?.[0];
        const title = c.land?.listingTitle || c.land?.plotNumber || 'Listing';
        const otherName = title;
        return {
          id: c.id,
          name: otherName,
          landTitle: title,
          lastMessage: last?.content || 'No messages yet',
          time: last?.createdAt
            ? new Date(last.createdAt).toLocaleDateString()
            : new Date(c.updatedAt).toLocaleDateString(),
        };
      });
      setConversations(rows);
    } catch (e) {
      console.error(e);
      setConversations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  const filtered = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q);
  });

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#125f43ff" />

      <LinearGradient colors={['#125f43ff', '#1a7f5a']} className="pt-14 pb-6 px-6 rounded-b-[40px]">
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Marketplace chats</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Marketplace')}
            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
          >
            <Ionicons name="storefront-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>

        <View className="flex-row bg-white/10 rounded-2xl px-4 py-3 items-center border border-white/20">
          <Ionicons name="search" size={20} color="white" />
          <TextInput
            placeholder="Search conversations..."
            placeholderTextColor="rgba(255,255,255,0.7)"
            className="flex-1 ml-3 text-white text-base"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1 px-4 mt-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color="#125f43" className="py-12" />
        ) : filtered.length === 0 ? (
          <View className="items-center py-12">
            <Ionicons name="chatbubbles-outline" size={64} color="#9CA3AF" />
            <Text className="text-gray-500 mt-4 text-center">No marketplace chats yet</Text>
            <Text className="text-gray-400 text-sm mt-2 text-center px-6">
              Open a listing and tap Live chat to talk to the seller in real time.
            </Text>
          </View>
        ) : (
          filtered.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              onPress={() =>
                navigation.navigate('ChatDetail', {
                  conversationId: chat.id,
                  name: chat.landTitle || chat.name,
                })
              }
              className="flex-row items-center bg-white p-4 rounded-2xl mb-3 border border-gray-50"
            >
              <View className="w-14 h-14 rounded-full bg-[#125f43ff]/10 items-center justify-center">
                <Ionicons name="chatbubble" size={28} color="#125f43ff" />
              </View>
              <View className="flex-1 ml-4">
                <View className="flex-row justify-between">
                  <Text className="text-gray-900 font-bold flex-1" numberOfLines={1}>
                    {chat.landTitle || chat.name}
                  </Text>
                  <Text className="text-gray-400 text-xs">{chat.time}</Text>
                </View>
                <Text className="text-gray-500 text-sm mt-1" numberOfLines={1}>
                  {chat.lastMessage}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
