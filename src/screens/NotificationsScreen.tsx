import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

// ✅ FIXED: Proper navigation types
type RootStackParamList = {
    Notifications: undefined;
    RequestDetail: { referenceNumber: string };
    MainApp: undefined;
};

type NotificationsScreenProp = StackNavigationProp<RootStackParamList, 'Notifications'>;

// ✅ FIXED: Proper Notification type definition
type Notification = {
    id: number;
    title: string;
    message: string;
    time: string;
    type: 'success' | 'info' | 'warning' | 'error';
    read: boolean;
    referenceNumber?: string;
};

// ✅ Mock Notifications Data
const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: 1,
        title: 'Request Submitted',
        message: 'Your registration request REG-2024-ABC123 has been submitted successfully',
        time: '2 hours ago',
        type: 'success',
        read: false,
        referenceNumber: 'REG-2024-ABC123',
    },
    {
        id: 2,
        title: 'Document Review',
        message: 'Your documents are being reviewed by a land officer',
        time: '1 day ago',
        type: 'info',
        read: false,
        referenceNumber: 'VER-2024-XYZ789',
    },
    {
        id: 3,
        title: 'Request Approved',
        message: 'Congratulations! Your verification request has been approved',
        time: '3 days ago',
        type: 'success',
        read: true,
        referenceNumber: 'VER-2024-DEF456',
    },
    {
        id: 4,
        title: 'Additional Documents Required',
        message: 'Please upload additional documents for your registration request',
        time: '5 days ago',
        type: 'warning',
        read: true,
        referenceNumber: 'REG-2024-GHI012',
    },
    {
        id: 5,
        title: 'Field Inspection Scheduled',
        message: 'Land officer will visit your property on April 10, 2024',
        time: '1 week ago',
        type: 'info',
        read: true,
        referenceNumber: 'REG-2024-JKL345',
    },
];

export default function NotificationsScreen() {
    const navigation = useNavigation<NotificationsScreenProp>();
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

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
    const markAsRead = (id: number) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
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