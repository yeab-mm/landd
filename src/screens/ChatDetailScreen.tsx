import React, { useState, useRef, useEffect } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    TextInput, 
    KeyboardAvoidingView, 
    Platform, 
    StatusBar,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';

// ✅ Type definitions
type RootStackParamList = {
    ChatDetail: { name: string; conversationId: string; type: 'support' | 'user' };
    MainApp: undefined;
};

type ChatDetailRouteProp = RouteProp<RootStackParamList, 'ChatDetail'>;
type ChatDetailNavigationProp = StackNavigationProp<RootStackParamList, 'ChatDetail'>;

// ✅ Message type with delivery status
type Message = {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: string; // ISO string
    status?: 'sending' | 'sent' | 'delivered' | 'read';
    type?: 'text' | 'image' | 'document';
};

export default function ChatDetailScreen() {
    const navigation = useNavigation<ChatDetailNavigationProp>();
    const route = useRoute<ChatDetailRouteProp>();
    const { name = 'Support', conversationId, type = 'support' } = route.params || {};
    
    const scrollViewRef = useRef<ScrollView>(null);
    const [messages, setMessages] = useState<Message[]>([
        { 
            id: '1', 
            text: "Welcome to the Digital Land Portal secure messaging. How can we help you today?", 
            isUser: false, 
            timestamp: '2024-04-02T10:24:00Z',
            status: 'read'
        },
        { 
            id: '2', 
            text: "I have a question about my land verification status. It's been pending for 3 days.", 
            isUser: true, 
            timestamp: '2024-04-02T10:25:00Z',
            status: 'read'
        },
        { 
            id: '3', 
            text: "I've checked your application #LP-2024-001. A Land Officer has been assigned and is currently reviewing your deed documents.", 
            isUser: false, 
            timestamp: '2024-04-02T10:26:00Z',
            status: 'delivered'
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // ✅ Format timestamp to human-readable
    const formatTime = (iso: string): string => {
        const date = new Date(iso);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // ✅ Auto-scroll to bottom when messages change
    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [messages]);

    // ✅ Simulate typing indicator (for demo)
    useEffect(() => {
        if (inputText.trim()) {
            setIsTyping(true);
            const timer = setTimeout(() => setIsTyping(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [inputText]);

    // ✅ Send message with backend simulation
    const sendMessage = async () => {
        if (inputText.trim() === '') return;
        
        const newMessage: Message = {
            id: Date.now().toString(),
            text: inputText.trim(),
            isUser: true,
            timestamp: new Date().toISOString(),
            status: 'sending',
        };
        
        // Optimistic update
        setMessages(prev => [...prev, newMessage]);
        setInputText('');
        
        try {
            // TODO: Replace with real API call
            // await api.post(`/chat/conversations/${conversationId}/messages`, { content: inputText });
            
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Update status to 'sent'
            setMessages(prev => prev.map(msg => 
                msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
            ));
            
            // Simulate auto-reply for support chats
            if (type === 'support') {
                setTimeout(() => {
                    const reply: Message = {
                        id: (Date.now() + 1).toString(),
                        text: "Thank you for your message. Our team will respond within 24 hours.",
                        isUser: false,
                        timestamp: new Date().toISOString(),
                        status: 'delivered'
                    };
                    setMessages(prev => [...prev, reply]);
                }, 2000);
            }
        } catch (error) {
            console.error('Send failed:', error);
            // Update status to failed
            setMessages(prev => prev.map(msg => 
                msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg // Keep as 'sent' for demo
            ));
            Alert.alert('Error', 'Failed to send message. Please try again.');
        }
    };

    // ✅ Get delivery icon based on status
    const getDeliveryIcon = (status?: Message['status']) => {
        switch (status) {
            case 'sending': return { name: 'time-outline' as const, color: '#9CA3AF' };
            case 'sent': return { name: 'checkmark' as const, color: '#9CA3AF' };
            case 'delivered': return { name: 'checkmark-done' as const, color: '#A7F3D0' };
            case 'read': return { name: 'checkmark-done' as const, color: '#125f43ff' };
            default: return null;
        }
    };

    return (
        <KeyboardAvoidingView 
            className="flex-1 bg-white"
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <StatusBar barStyle="light-content" backgroundColor="#125f43ff" />
            
            {/* Header - ✅ FIXED: Color codes */}
            <LinearGradient
                colors={['#125f43ff', '#1a7f5a']}
                className="pt-14 pb-4 px-4 flex-row items-center border-b border-gray-100"
            >
                <TouchableOpacity 
                    onPress={() => navigation.goBack()} 
                    className="p-2"
                    accessibilityLabel="Go back to conversations"
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <View className="flex-1 ml-2">
                    <Text className="text-white font-bold text-lg">{name}</Text>
                    <View className="flex-row items-center">
                        <View className="w-2 h-2 bg-green-400 rounded-full mr-1.5" />
                        <Text className="text-white/80 text-xs font-medium">Online</Text>
                    </View>
                </View>
                <View className="flex-row space-x-3">
                    <TouchableOpacity 
                        className="p-2"
                        accessibilityLabel="Start voice call"
                    >
                        <Ionicons name="call-outline" size={22} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        className="p-2"
                        accessibilityLabel="View conversation security"
                    >
                        <Ionicons name="shield-checkmark-outline" size={22} color="white" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Messages List */}
            <ScrollView 
                ref={scrollViewRef}
                className="flex-1 px-4 pt-4"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                {/* Date separator */}
                <View className="items-center mb-6">
                    <View className="bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100">
                        <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Today</Text>
                    </View>
                </View>

                {/* Empty state */}
                {messages.length === 0 && (
                    <View className="items-center py-12">
                        <Ionicons name="chatbubble-ellipses-outline" size={48} color="#9CA3AF" />
                        <Text className="text-gray-500 text-base mt-4">No messages yet</Text>
                        <Text className="text-gray-400 text-sm text-center mt-1">
                            Start the conversation by sending a message below
                        </Text>
                    </View>
                )}

                {/* Message bubbles */}
                {messages.map((msg) => {
                    const deliveryIcon = getDeliveryIcon(msg.status);
                    return (
                        <View 
                            key={msg.id} 
                            className={`mb-4 flex-row ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                        >
                            <View 
                                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                                    msg.isUser 
                                        ? 'bg-[#125f43ff] rounded-tr-none'  // ✅ FIXED: Explicit color
                                        : 'bg-gray-100 rounded-tl-none'
                                }`}
                            >
                                <Text className={`text-base leading-5 ${msg.isUser ? 'text-white' : 'text-gray-800'}`}>
                                    {msg.text}
                                </Text>
                                <View className="flex-row items-center justify-end mt-1">
                                    <Text className={`text-[10px] ${msg.isUser ? 'text-white/70' : 'text-gray-400'}`}>
                                        {formatTime(msg.timestamp)}
                                    </Text>
                                    {msg.isUser && deliveryIcon && (
                                        <Ionicons 
                                            name={deliveryIcon.name} 
                                            size={14} 
                                            color={deliveryIcon.color} 
                                            style={{ marginLeft: 4 }} 
                                        />
                                    )}
                                </View>
                            </View>
                        </View>
                    );
                })}

                {/* Typing indicator */}
                {isTyping && !messages[messages.length - 1]?.isUser && (
                    <View className="mb-4 flex-row justify-start">
                        <View className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-none">
                            <View className="flex-row space-x-1">
                                <View className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                                <View className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-100" />
                                <View className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-200" />
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Input Area - ✅ FIXED: Placeholder color */}
            <View className="px-4 py-4 border-t border-gray-100 flex-row items-center bg-white pb-10">
                <TouchableOpacity 
                    className="p-2 mr-1 bg-gray-50 rounded-full"
                    accessibilityLabel="Attach file"
                >
                    <Ionicons name="add" size={24} color="#125f43ff" />
                </TouchableOpacity>
                <View className="flex-1 flex-row items-center bg-gray-50 rounded-3xl px-4 py-1 border border-gray-200">
                    <TextInput
                        placeholder="Write a message..."
                        placeholderTextColor="#9CA3AF"  // ✅ ADDED
                        className="flex-1 h-10 text-gray-800 text-base"
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        accessibilityLabel="Type your message"
                    />
                    <TouchableOpacity accessibilityLabel="Add emoji">
                        <Ionicons name="happy-outline" size={22} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity 
                    onPress={sendMessage}
                    disabled={!inputText.trim()}
                    className={`ml-2 w-10 h-10 rounded-full items-center justify-center ${
                        inputText.trim() ? 'bg-[#125f43ff]' : 'bg-gray-300'  // ✅ FIXED
                    }`}
                    accessibilityLabel="Send message"
                >
                    <Ionicons name="send" size={20} color="white" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}