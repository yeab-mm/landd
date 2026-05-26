import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../api/config';

// ✅ FIXED: Proper navigation types
type RootStackParamList = {
    Notifications: undefined;
    RequestDetail: { referenceNumber: string };
    MainApp: undefined;
};

type NotificationsScreenProp = StackNavigationProp<RootStackParamList, 'Notifications'>;

// ✅ FIXED: Proper Notification type definition
type Notification = {
    id: string | number;
    title: string;
    message: string;
    time: string;
    type: 'success' | 'info' | 'warning' | 'error';
    read: boolean;
    referenceNumber?: string;
};

const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
        return `${diffMins <= 0 ? 'Just now' : diffMins + 'm ago'}`;
    } else if (diffHours < 24) {
        return `${diffHours}h ago`;
    } else {
        return `${diffDays}d ago`;
    }
};

export default function NotificationsScreen() {
    const navigation = useNavigation<NotificationsScreenProp>();
    const { token } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_URL}/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data.notifications) {
                const mapped: Notification[] = data.notifications.map((n: any) => ({
                    id: n.id,
                    title: n.title,
                    message: n.message,
                    time: formatTime(n.createdAt),
                    type: n.type || 'info',
                    read: n.isRead,
                    referenceNumber: n.message.match(/REG-\d+-\w+|VER-\d+-\w+/)?.[0] || undefined
                }));
                setNotifications(mapped);
            }
        } catch (error) {
            console.error('Fetch notifications error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [token]);

    // ✅ FIXED: Proper typing for icon name return
    const getNotificationIcon = (type: Notification['type']): keyof typeof Ionicons.glyphMap => {
        switch (type) {
            case 'success': return 'checkmark-circle';
            case 'warning': return 'alert-circle';
            case 'error': return 'close-circle';
            default: return 'information-circle';
        }
    };

    // ✅ Get notification color by type
    const getNotificationColor = (type: Notification['type']) => {
        switch (type) {
            case 'success': return '#125f43ff';
            case 'warning': return '#F59E0B';
            case 'error': return '#EF4444';
            default: return '#2563EB';
        }
    };

    // ✅ Get badge color by type
    const getBadgeColor = (type: Notification['type']) => {
        switch (type) {
            case 'success': return 'bg-green-100';
            case 'warning': return 'bg-yellow-100';
            case 'error': return 'bg-red-100';
            default: return 'bg-blue-100';
        }
    };

    // ✅ Mark as read
    const markAsRead = async (id: string | number) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, read: true } : notif
            )
        );

        if (!token) return;
        try {
            await fetch(`${API_URL}/notifications/${id}/read`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Mark as read error:', error);
        }
    };


    // ✅ FIXED: Proper typing for notification parameter
    const renderNotificationItem = (notification: Notification) => (
        <TouchableOpacity
            key={notification.id}
            onPress={() => {
                markAsRead(notification.id);
                if (notification.referenceNumber) {
                    navigation.navigate('RequestDetail', { referenceNumber: notification.referenceNumber });
                }
            }}
            className={`p-4 mb-3 rounded-2xl border ${notification.read ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-200'}`}
            activeOpacity={0.7}
            accessibilityLabel={`Notification: ${notification.title}. ${notification.message}`}
            accessibilityState={{ selected: !notification.read }}
        >
            <View className="flex-row items-start">
                {/* Icon */}
                <View
                    className="rounded-full p-2 mr-3 mt-1"
                    style={{ backgroundColor: `${getNotificationColor(notification.type)}20` }}
                >
                    <Ionicons
                        name={getNotificationIcon(notification.type)}
                        size={20}
                        color={getNotificationColor(notification.type)}
                    />
                </View>

                {/* Content */}
                <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-1">
                        <Text className={`font-bold text-base ${notification.read ? 'text-gray-800' : 'text-gray-900'}`}>
                            {notification.title}
                        </Text>
                        {!notification.read && (
                            <View className="w-2 h-2 rounded-full bg-[#125f43ff]" accessibilityLabel="Unread notification" />
                        )}
                    </View>

                    <Text className="text-gray-600 text-sm mb-2">{notification.message}</Text>

                    <View className="flex-row items-center justify-between">
                        <Text className="text-gray-400 text-xs">{notification.time}</Text>
                        {notification.referenceNumber && (
                            <View className={`px-2 py-1 rounded-full ${getBadgeColor(notification.type)}`}>
                                <Text className={`text-xs font-medium ${
                                    notification.type === 'success' ? 'text-green-700' :
                                    notification.type === 'warning' ? 'text-yellow-700' :
                                    notification.type === 'error' ? 'text-red-700' :
                                    'text-blue-700'
                                }`}>
                                    View Details
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    // ✅ Calculate unread count
    const unreadCount = notifications.filter(n => !n.read).length;

    if (loading && notifications.length === 0) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#125f43ff" />
                <Text className="text-gray-600 mt-4">Loading notifications...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="light-content" backgroundColor="#125f43ff" />

            {/* Header */}
            <LinearGradient
                colors={['#125f43ff', '#1a7f5a']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="px-6 pt-14 pb-6 rounded-b-3xl"
            >
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="w-10 h-10 rounded-full bg-white/10 items-center justify-center mr-3"
                            activeOpacity={0.7}
                            accessibilityLabel="Go back"
                        >
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <Text className="text-white text-2xl font-bold">Notifications</Text>
                    </View>

                    {unreadCount > 0 && (
                        <View className="bg-red-500 px-3 py-1 rounded-full" accessibilityLabel={`${unreadCount} unread notifications`}>
                            <Text className="text-white text-sm font-bold">{unreadCount}</Text>
                        </View>
                    )}
                </View>

                <View className="bg-white/10 rounded-2xl p-4 border border-white/20">
                    <Text className="text-white/70 text-xs mb-1">Total Notifications</Text>
                    <Text className="text-white font-bold text-2xl">{notifications.length}</Text>
                </View>
            </LinearGradient>

            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                <View className="py-4">
                    {notifications.length === 0 ? (
                        <View className="items-center py-12">
                            <Ionicons name="notifications-off-outline" size={64} color="#9CA3AF" />
                            <Text className="text-gray-500 text-base mt-4 text-center">No notifications yet</Text>
                            <Text className="text-gray-400 text-sm mt-2 text-center">
                                You'll receive updates about your requests here
                            </Text>
                        </View>
                    ) : (
                        notifications.map(renderNotificationItem)
                    )}
                </View>

                {/* Bottom Spacing */}
                <View className="h-20" />
            </ScrollView>
        </View>
    );
}