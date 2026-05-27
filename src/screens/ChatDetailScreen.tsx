import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../api/config';
import { useChatSocket } from '../hooks/useChatSocket';

type RootStackParamList = {
  ChatDetail: { name: string; conversationId: string; landId?: string };
};

type ChatDetailRouteProp = RouteProp<RootStackParamList, 'ChatDetail'>;
type ChatDetailNavigationProp = StackNavigationProp<RootStackParamList, 'ChatDetail'>;

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  senderId: string;
};

export default function ChatDetailScreen() {
  const navigation = useNavigation<ChatDetailNavigationProp>();
  const route = useRoute<ChatDetailRouteProp>();
  const { name = 'Chat', conversationId } = route.params || {};
  const { token, user } = useAuth();
  const userId = user?.id ?? user?.userId;

  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);

  const { joinConversation, leaveConversation, sendMessage, subscribe } =
    useChatSocket(token);

  const mapMessage = useCallback(
    (m: { id: string; senderId: string; content: string; createdAt: string }): Message => ({
      id: m.id,
      text: m.content,
      isUser: m.senderId === userId,
      timestamp: m.createdAt,
      senderId: m.senderId,
    }),
    [userId]
  );

  useEffect(() => {
    if (!conversationId || !token) return;

    let unsubNew: (() => void) | undefined;
    let unsubErr: (() => void) | undefined;

    (async () => {
      try {
        const data = await chatAPI.getMessages(conversationId);
        const conv = data.conversation;
        setLocked(Boolean(conv?.adminLocked));
        setMessages((data.messages || []).map(mapMessage));
      } catch (e) {
        Alert.alert('Error', e instanceof Error ? e.message : 'Failed to load messages');
      } finally {
        setLoading(false);
      }
    })();

    joinConversation(conversationId);
    unsubNew = subscribe('new_message', (payload: unknown) => {
      const p = payload as { message?: { id: string; senderId: string; content: string; createdAt: string } };
      if (p.message?.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === p.message!.id)) return prev;
          return [...prev, mapMessage(p.message!)];
        });
      }
    });
    unsubErr = subscribe('error_message', (payload: unknown) => {
      const p = payload as { error?: string };
      if (p.error) Alert.alert('Chat', p.error);
    });

    return () => {
      leaveConversation(conversationId);
      unsubNew?.();
      unsubErr?.();
    };
  }, [
    conversationId,
    token,
    joinConversation,
    leaveConversation,
    subscribe,
    mapMessage,
  ]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim() || !conversationId || locked) return;
    const text = inputText.trim();
    setInputText('');
    sendMessage(conversationId, text);
  };

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar barStyle="light-content" backgroundColor="#125f43ff" />

      <LinearGradient colors={['#125f43ff', '#1a7f5a']} className="pt-14 pb-4 px-4 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View className="flex-1 ml-2">
          <Text className="text-white font-bold text-lg">{name}</Text>
          <View className="flex-row items-center">
            <View className="w-2 h-2 bg-green-400 rounded-full mr-1.5" />
            <Text className="text-white/80 text-xs font-medium">Live · Socket.IO</Text>
          </View>
        </View>
      </LinearGradient>

      {locked && (
        <View className="bg-amber-50 px-4 py-2 border-b border-amber-200">
          <Text className="text-amber-800 text-xs text-center">
            This chat is locked by admin. You cannot send messages until it is unlocked.
          </Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#125f43" className="flex-1" />
      ) : (
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4 pt-4"
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {messages.length === 0 && (
            <View className="items-center py-12">
              <Text className="text-gray-500">No messages yet. Say hello!</Text>
            </View>
          )}
          {messages.map((msg) => (
            <View key={msg.id} className={`mb-4 flex-row ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
              <View
                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  msg.isUser ? 'bg-[#125f43ff] rounded-tr-none' : 'bg-gray-100 rounded-tl-none'
                }`}
              >
                <Text className={`text-base ${msg.isUser ? 'text-white' : 'text-gray-800'}`}>{msg.text}</Text>
                <Text className={`text-[10px] mt-1 ${msg.isUser ? 'text-white/70' : 'text-gray-400'}`}>
                  {formatTime(msg.timestamp)}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <View className="px-4 py-4 border-t border-gray-100 flex-row items-center bg-white pb-10">
        <View className="flex-1 flex-row items-center bg-gray-50 rounded-3xl px-4 py-1 border border-gray-200">
          <TextInput
            placeholder={locked ? 'Chat locked' : 'Write a message...'}
            placeholderTextColor="#9CA3AF"
            className="flex-1 h-10 text-gray-800 text-base"
            value={inputText}
            onChangeText={setInputText}
            editable={!locked}
            multiline
          />
        </View>
        <TouchableOpacity
          onPress={handleSend}
          disabled={!inputText.trim() || locked}
          className={`ml-2 w-10 h-10 rounded-full items-center justify-center ${
            inputText.trim() && !locked ? 'bg-[#125f43ff]' : 'bg-gray-300'
          }`}
        >
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
