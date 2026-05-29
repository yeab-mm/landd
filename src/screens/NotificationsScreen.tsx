import React, { useState, useCallback } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../api/config';
import { parseReferenceFromMessage } from '../hooks/useUnreadNotifications';
import {
  CitizenScreen,
  EmptyState,
  SectionHeader,
  NotificationCard,
} from '../components/citizen/CitizenUI';
import { CITIZEN_PRIMARY } from '../theme/citizenTheme';

type Notification = {
  id: string | number;
  title: string;
  message: string;
  time: string;
  type: 'success' | 'info' | 'warning' | 'error';
  read: boolean;
  referenceNumber?: string;
  isApproval?: boolean;
};

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMins = Math.floor((now.getTime() - d.getTime()) / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 60) return diffMins <= 0 ? 'Just now' : `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

export default function NotificationsScreen() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.notifications) {
        setNotifications(
          data.notifications.map((n: any) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            time: formatTime(n.createdAt),
            type: n.type || 'info',
            read: n.isRead,
            referenceNumber: parseReferenceFromMessage(n.message),
            isApproval: (n.title || '').toLowerCase().includes('approved'),
          }))
        );
      }
    } catch (error) {
      console.error('Fetch notifications error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchNotifications();
    }, [fetchNotifications])
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: Notification['type']): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'warning':
        return 'alert-circle';
      case 'error':
        return 'close-circle';
      default:
        return 'information-circle';
    }
  };

  const getColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return CITIZEN_PRIMARY;
      case 'warning':
        return '#F59E0B';
      case 'error':
        return '#EF4444';
      default:
        return '#2563EB';
    }
  };

  const markAsRead = async (id: string | number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    if (!token) return;
    try {
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      console.error('Mark as read error:', e);
    }
  };

  const onOpen = (n: Notification) => {
    markAsRead(n.id);
    if (n.isApproval || n.type === 'success') {
      navigation.getParent()?.navigate('MyLands');
      return;
    }
    if (n.referenceNumber) {
      navigation.navigate('RequestDetail', { referenceNumber: n.referenceNumber });
    }
  };

  return (
    <CitizenScreen
      title="Notifications"
      subtitle="Updates on your requests"
      badge={unreadCount}
      loading={loading && notifications.length === 0}
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        fetchNotifications();
      }}
      headerStat={{ label: 'Total alerts', value: notifications.length }}
    >
      {notifications.length === 0 ? (
        <EmptyState
          icon="notifications-off-outline"
          title="All caught up"
          message="You'll see approvals, officer updates, and payment reminders here."
        />
      ) : (
        <>
          {unreadCount > 0 ? (
            <SectionHeader title={`${unreadCount} unread`} />
          ) : null}
          {notifications.map((n) => (
            <NotificationCard
              key={String(n.id)}
              title={n.title}
              message={n.message}
              time={n.time}
              read={n.read}
              icon={getIcon(n.type)}
              color={getColor(n.type)}
              onPress={() => onOpen(n)}
            />
          ))}
        </>
      )}
    </CitizenScreen>
  );
}
