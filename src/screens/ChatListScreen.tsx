import React, { useState, useMemo } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    TextInput, 
    StatusBar, 
    Image,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';

// ✅ Type definitions
type RootStackParamList = {
    ChatList: undefined;
    ChatDetail: { chatId: string; name: string; type: string };
    MainApp: undefined;
};

type ChatListNavigationProp = StackNavigationProp<RootStackParamList, 'ChatList'>;

// ✅ Chat type definition
type Chat = {
    id: string;
    name: string;
    lastMessage: string;
    time: string;
    timestamp?: string; // ISO for sorting
    unread: number;
    type: 'official' | 'marketplace' | 'support';
    avatar: string | null;
    online: boolean;
};

const MOCK_CHATS: Chat[] = [
  {
    id: '1',
    name: 'Land Admin Bureau (A.A)',
    lastMessage: 'Your document verification is complete. Please check...',
    time: '10:24 AM',
    timestamp: '2024-04-02T10:24:00Z',
    unread: 2,
    type: 'official',
    avatar: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=100&q=80',
    online: true,
  },
  {
    id: '2',
    name: 'Dawit Getachew (Seller)',
    lastMessage: 'I can show you the property tomorrow at 4 PM.',
    time: 'Yesterday',
    timestamp: '2024-04-01T16:00:00Z',
    unread: 0,
    type: 'marketplace',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    online: false,
  },
  {
    id: '3',
    name: 'Official Registry Support',
    lastMessage: 'How can I assist you with your Fayda ID today?',
    time: 'Mon',
    timestamp: '2024-03-25T09:00:00Z',
    unread: 0,
    type: 'support',
    avatar: null,
    online: true,
  },
];

export default function ChatListScreen() {
    const navigation = useNavigation<ChatListNavigationProp>();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'official' | 'marketplace' | 'support'>('all');

    // ✅ Filter and search chats
    const filteredChats = useMemo(() => {
        return MOCK_CHATS.filter(chat => {
            // Filter by type
            if (activeFilter !== 'all' && chat.type !== activeFilter) return false;
            
            // Filter by search query
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                return (
                    chat.name.toLowerCase().includes(query) ||
                    chat.lastMessage.toLowerCase().includes(query)
                );
            }
            return true;
        }).sort((a, b) => {
            // Sort by unread first, then by timestamp
            if (a.unread > 0 && b.unread === 0) return -1;
            if (a.unread === 0 && b.unread > 0) return 1;
            if (a.timestamp && b.timestamp) {
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            }
            return 0;
        });
    }, [searchQuery, activeFilter]);

    // ✅ Get filter button styles
    const getFilterStyle = (filter: string) => {
        if (activeFilter === filter) {
            return {
                bg: 'bg-[#125f43ff]/10',
                border: 'border-[#125f43ff]/30',
                text: 'text-[#125f43ff]'
            };
        }
        return {
            bg: 'bg-white',
            border: 'border-gray-200',
            text: 'text-gray-500'
        };
    };

    // ✅ Start new conversation
    const startNewChat = () => {
        Alert.alert(
            'New Message',
            'Who would you like to contact?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Support', 
                    onPress: () => navigation.navigate('ChatDetail', { 
                        chatId: 'new-support', 
                        name: 'Official Support',
                        type: 'support'
                    })
                },
                { 
                    text: 'Land Officer', 
                    onPress: () => navigation.navigate('ChatDetail', { 
                        chatId: 'new-official', 
                        name: 'Land Admin Bureau',
                        type: 'official'
                    })
                },
            ]
        );
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* ✅ FIXED: Status bar style */}
            <StatusBar barStyle="light-content" backgroundColor="#125f43ff" />
            
            {/* Header - ✅ FIXED: Color codes */}
            <LinearGradient
                colors={['#125f43ff', '#1a7f5a']}
                className="pt-14 pb-6 px-6 rounded-b-[40px] shadow-lg"
            >
                <View className="flex-row justify-between items-center mb-6">
                    <TouchableOpacity 
                        onPress={() => navigation.goBack()}
                        className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                        accessibilityLabel="Go back"
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold italic">Secure Messages</Text>
                    <TouchableOpacity 
                        onPress={startNewChat}
                        className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                        accessibilityLabel="Start new conversation"
                    >
                        <Ionicons name="create-outline" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar - ✅ FIXED: Placeholder color */}
                <View className="flex-row bg-white/10 rounded-2xl px-4 py-3 items-center border border-white/20">
                    <Ionicons name="search" size={20} color="white" />
                    <TextInput
                        placeholder="Search conversations..."
                        placeholderTextColor="rgba(255,255,255,0.7)"  // ✅ ADDED
                        className="flex-1 ml-3 text-white text-base"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        accessibilityLabel="Search conversations"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity 
                            onPress={() => setSearchQuery('')}
                            accessibilityLabel="Clear search"
                        >
                            <Ionicons name="close-circle" size={20} color="white" />
                        </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>

            <ScrollView className="flex-1 px-4 mt-6" showsVerticalScrollIndicator={false}>
                {/* Filter Tabs - ✅ FIXED: Explicit colors + functionality */}
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    className="mb-6"
                >
                    <View className="flex-row space-x-2">
                        {(['all', 'official', 'marketplace', 'support'] as const).map((filter) => {
                            const style = getFilterStyle(filter);
                            return (
                                <TouchableOpacity
                                    key={filter}
                                    onPress={() => setActiveFilter(filter)}
                                    className={`px-4 py-2 rounded-full border ${style.bg} ${style.border}`}
                                    accessibilityLabel={`Filter by ${filter}`}
                                >
                                    <Text className={`font-semibold text-xs ${style.text}`}>
                                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>

                {/* Empty State */}
                {filteredChats.length === 0 ? (
                    <View className="items-center py-12">
                        <Ionicons name="chatbubble-ellipses-outline" size={64} color="#9CA3AF" />
                        <Text className="text-gray-500 text-base mt-4 text-center">
                            {searchQuery ? 'No conversations match your search' : 'No conversations yet'}
                        </Text>
                        {searchQuery && (
                            <TouchableOpacity 
                                onPress={() => setSearchQuery('')} 
                                className="mt-4"
                            >
                                <Text className="text-[#125f43ff] text-sm font-semibold">Clear Search</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    /* Chat List - ✅ FIXED: Explicit colors */
                    filteredChats.map((chat) => (
                        <TouchableOpacity 
                            key={chat.id}
                            onPress={() => navigation.navigate('ChatDetail', { 
                                chatId: chat.id, 
                                name: chat.name,
                                type: chat.type
                            })}
                            className="flex-row items-center bg-white p-4 rounded-2xl mb-3 shadow-sm border border-gray-50 active:bg-gray-50"
                            accessibilityLabel={`Open conversation with ${chat.name}`}
                            activeOpacity={0.8}
                        >
                            {/* Avatar with online status */}
                            <View className="relative">
                                {chat.avatar ? (
                                    <Image 
                                        source={{ uri: chat.avatar }} 
                                        className="w-14 h-14 rounded-full"
                                        onError={() => console.log(`Failed to load avatar for ${chat.name}`)}
                                    />
                                ) : (
                                    <View className="w-14 h-14 rounded-full bg-[#125f43ff]/10 items-center justify-center">
                                        <Ionicons name="person" size={28} color="#125f43ff" />
                                    </View>
                                )}
                                {chat.online && (
                                    <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                                )}
                            </View>

                            {/* Chat info */}
                            <View className="flex-1 ml-4">
                                <View className="flex-row justify-between items-center mb-1">
                                    <Text className="text-gray-900 font-bold text-base" numberOfLines={1}>
                                        {chat.name}
                                    </Text>
                                    <Text className="text-gray-400 text-xs">{chat.time}</Text>
                                </View>
                                <View className="flex-row justify-between items-center">
                                    <Text className="text-gray-500 text-sm flex-1 mr-2" numberOfLines={1}>
                                        {chat.lastMessage}
                                    </Text>
                                    {chat.unread > 0 && (
                                        <View className="bg-[#F59E0B] px-2 rounded-full h-5 min-w-[20px] items-center justify-center">
                                            <Text className="text-white text-[10px] font-bold">{chat.unread}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}

                {/* Encryption notice - ✅ FIXED: Explicit color */}
                <View className="items-center mt-6 mb-10">
                    <View className="flex-row items-center bg-green-50 px-4 py-2 rounded-xl">
                        <Ionicons name="shield-checkmark" size={16} color="#125f43ff" />
                        <Text className="text-[#125f43ff] text-[10px] ml-2 font-medium">
                            End-to-end encrypted correspondence
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}