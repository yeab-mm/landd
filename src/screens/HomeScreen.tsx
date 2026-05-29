import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../api/config';
import { isPendingStatus } from '../api/requests';
import { useUnreadNotifications } from '../hooks/useUnreadNotifications';
import { Screen } from '../components/layout/Screen';
import {
  CitizenHeader,
  SectionHeader,
  StatRow,
  ServiceCard,
  AlertBanner,
  SurfaceCard,
  ActivityRow,
} from '../components/citizen/CitizenUI';
import { CITIZEN_PRIMARY, CITIZEN_BG } from '../theme/citizenTheme';

type RootStackParamList = {
  Marketplace: undefined;
  Profile: undefined;
  TrackRequest: { referenceNumber?: string };
  RegistrationRequest: undefined;
  Notifications: undefined;
  VerificationRequest: undefined;
  OwnershipTransfer: undefined;
  MyRequests: undefined;
  MyDocuments: undefined;
  RequestDetail: { referenceNumber: string; requestId?: string };
};

type HomeScreenProp = StackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenProp>();
  const { user, token, refreshUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalLands: 0, pendingRequests: 0, unreadNotifications: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { refreshUnread } = useUnreadNotifications(0);

  const fetchHomeData = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const pRes = await fetch(`${API_URL}/user/me`, { headers: { Authorization: `Bearer ${token}` } });
      const pData = await pRes.json();
      if (pRes.ok) {
        setProfile(pData.user);
        if (pData.user?.stats) {
          setStats((prev) => ({
            ...prev,
            totalLands: pData.user.stats.totalLands ?? prev.totalLands,
            pendingRequests: pData.user.stats.pendingRequests ?? prev.pendingRequests,
            unreadNotifications: pData.user.stats.unreadNotifications ?? 0,
          }));
        }
      }

      const lRes = await fetch(`${API_URL}/lands`, { headers: { Authorization: `Bearer ${token}` } });
      const lData = await lRes.json();

      const rRes = await fetch(`${API_URL}/requests`, { headers: { Authorization: `Bearer ${token}` } });
      const rData = await rRes.json();
      const userRequests = rData.requests || [];
      if (rRes.ok) setRequests(userRequests);

      setStats((prev) => ({
        ...prev,
        totalLands: (lData.lands || []).length,
        pendingRequests: userRequests.filter((r: any) => isPendingStatus(r.status)).length,
      }));
      refreshUnread();
    } catch (error) {
      console.error('Home data error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, [token]);

  const onRefresh = () => {
    setRefreshing(true);
    refreshUser();
    fetchHomeData();
  };

  const servicesRow1 = [
    { title: 'Ownership Verification', desc: 'Check land authenticity', icon: 'shield-checkmark', navigate: 'VerificationRequest' as const },
    { title: 'Registration Request', desc: 'Apply for new registration', icon: 'document-attach', navigate: 'RegistrationRequest' as const },
    { title: 'Land Marketplace', desc: 'Browse land listings', icon: 'business', navigate: 'Marketplace' as const },
    { title: 'Information Lookup', desc: 'Search by plot/location', icon: 'search', navigate: 'TrackRequest' as const },
  ];

  const servicesRow2 = [
    { title: 'Ownership Transfer', desc: 'Request land transfer', icon: 'swap-horizontal', navigate: 'OwnershipTransfer' as const },
    { title: 'Public Statistics', desc: 'Explore land insights', icon: 'stats-chart', navigate: 'MyRequests' as const },
    { title: 'Download Certificate', desc: 'Get ownership docs', icon: 'download', navigate: 'MyDocuments' as const },
    { title: 'Track Request', desc: 'Monitor application', icon: 'time', navigate: 'MyRequests' as const },
  ];

  const displayName = profile?.fullName || user?.fullName || 'User';

  const openService = (navigate: string | null, title: string) => {
    if (navigate) navigation.navigate(navigate as keyof RootStackParamList);
    else Alert.alert(title, 'This service is coming soon.');
  };

  if (loading && !profile && !user?.fullName) {
    return (
      <Screen className="items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#125f43ff" />
      </Screen>
    );
  }

  return (
    <Screen style={{ backgroundColor: CITIZEN_BG }}>
      <StatusBar barStyle="light-content" backgroundColor={CITIZEN_PRIMARY} />

      <CitizenHeader
        title={`Hello, ${displayName.split(' ')[0]}`}
        subtitle="Digital Land Citizen Portal"
        rightIcon="person-circle"
        onRightPress={() => navigation.navigate('Profile')}
        stat={{
          label: 'Your overview',
          value: `${stats.totalLands} lands · ${stats.pendingRequests} pending`,
        }}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} color={CITIZEN_PRIMARY} />}
      >
        <StatRow
          items={[
            { label: 'Lands', value: stats.totalLands },
            { label: 'Pending', value: stats.pendingRequests },
            { label: 'Alerts', value: stats.unreadNotifications },
          ]}
        />
        {stats.unreadNotifications > 0 && (
          <AlertBanner
            title="You have new updates"
            message={`${stats.unreadNotifications} unread notification${stats.unreadNotifications === 1 ? '' : 's'} — tap to view`}
            onPress={() => navigation.navigate('Notifications')}
          />
        )}

        <SectionHeader title="Available services" />
        <View className="mb-2">
          <View className="flex-row flex-wrap justify-between">
            {servicesRow1.map((action, index) => (
              <ServiceCard
                key={index}
                title={action.title}
                desc={action.desc}
                icon={action.icon as keyof typeof Ionicons.glyphMap}
                onPress={() => openService(action.navigate, action.title)}
              />
            ))}
          </View>
          <View className="flex-row flex-wrap justify-between">
            {servicesRow2.map((action, index) => (
              <ServiceCard
                key={index}
                title={action.title}
                desc={action.desc}
                icon={action.icon as keyof typeof Ionicons.glyphMap}
                onPress={() => openService(action.navigate, action.title)}
              />
            ))}
          </View>
        </View>

        <View className="pb-6">
          <SectionHeader
            title="Recent activity"
            actionLabel="View all"
            onAction={() => navigation.navigate('MyRequests')}
          />
          <SurfaceCard>
            {requests.length === 0 ? (
              <View className="p-10 items-center">
                <Ionicons name="document-text-outline" size={44} color="#d1d5db" />
                <Text className="text-gray-400 text-sm mt-3 font-medium">No recent activity</Text>
              </View>
            ) : (
              requests.slice(0, 3).map((activity, index, arr) => (
                <ActivityRow
                  key={activity.id}
                  title={activity.type}
                  subtitle={`Ref: ${activity.referenceNumber}`}
                  date={new Date(activity.createdAt).toLocaleDateString()}
                  status={activity.status}
                  isLast={index === arr.length - 1}
                  onPress={() =>
                    navigation.navigate('RequestDetail', {
                      referenceNumber: activity.referenceNumber,
                      requestId: activity.id,
                    })
                  }
                />
              ))
            )}
          </SurfaceCard>
        </View>

      </ScrollView>
    </Screen>
  );
}
