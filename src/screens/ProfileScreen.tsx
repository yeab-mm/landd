import React, { useCallback, useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../api/config';
import { Screen } from '../components/layout/Screen';
import {
  CITIZEN_PRIMARY,
  CITIZEN_PRIMARY_DARK,
  CITIZEN_PRIMARY_LIGHT,
  CITIZEN_BG,
} from '../theme/citizenTheme';

type ProfileData = {
  id: string;
  email: string | null;
  fullName: string;
  phone: string | null;
  faydaId: string | null;
  role: string;
  status?: string;
  createdAt: string;
  lastLogin: string | null;
  stats?: {
    totalLands: number;
    totalRequests: number;
    pendingRequests: number;
    pendingPayments: number;
    unreadNotifications: number;
  };
};

type RootStackParamList = {
  Profile: undefined;
  MainApp: undefined;
  MyLands: undefined;
  MyRequests: undefined;
  MyDocuments: undefined;
  Notifications: undefined;
  VerificationRequest: undefined;
  TrackRequest: undefined;
};

type ProfileScreenProp = StackNavigationProp<RootStackParamList, 'Profile'>;

function formatFaydaId(id: string | null | undefined): string {
  if (!id) return '—';
  const digits = id.replace(/\D/g, '');
  if (digits.length !== 16) return id;
  return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8, 12)} ${digits.slice(12, 16)}`;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-ET', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function InfoRow({
  icon,
  label,
  value,
  verified,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  verified?: boolean;
}) {
  return (
    <View className="flex-row items-start py-3.5 border-b border-gray-100">
      <View
        className="w-10 h-10 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: `${CITIZEN_PRIMARY}18` }}
      >
        <Ionicons name={icon} size={20} color={CITIZEN_PRIMARY} />
      </View>
      <View className="flex-1">
        <Text className="text-gray-500 text-xs uppercase tracking-wide mb-0.5">{label}</Text>
        <Text className="text-gray-900 font-semibold text-base">{value}</Text>
      </View>
      {verified ? (
        <View className="flex-row items-center bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
          <Ionicons name="checkmark-circle" size={14} color="#059669" />
          <Text className="text-emerald-700 text-[10px] font-bold ml-1">VERIFIED</Text>
        </View>
      ) : null}
    </View>
  );
}

function FaydaCard({ profile }: { profile: ProfileData }) {
  const initials = getInitials(profile.fullName);
  const faydaFormatted = formatFaydaId(profile.faydaId);
  const isVerified = (profile.status || 'Active') === 'Active';

  return (
    <View className="mx-4 -mt-16 mb-2">
      <LinearGradient
        colors={[CITIZEN_PRIMARY_DARK, CITIZEN_PRIMARY, CITIZEN_PRIMARY_LIGHT]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 20,
          padding: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 16,
          elevation: 10,
        }}
      >
        {/* Card header */}
        <View className="flex-row items-center justify-between mb-5">
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-amber-400/90 items-center justify-center mr-2">
              <Ionicons name="flag" size={16} color={CITIZEN_PRIMARY_DARK} />
            </View>
            <View>
              <Text className="text-white/70 text-[10px] font-medium tracking-widest">
                FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA
              </Text>
              <Text className="text-white font-bold text-sm tracking-wide">
                Fayda Digital ID
              </Text>
            </View>
          </View>
          <View className="bg-white/15 px-2 py-1 rounded-md">
            <Ionicons name="qr-code" size={28} color="white" />
          </View>
        </View>

        {/* Photo + identity */}
        <View className="flex-row">
          <View className="mr-4">
            <View
              className="w-24 h-28 rounded-xl items-center justify-center border-2 border-white/40"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
              <Text className="text-white text-3xl font-bold">{initials}</Text>
            </View>
            <View className="flex-row items-center justify-center mt-2">
              <Ionicons name="finger-print" size={14} color="rgba(255,255,255,0.7)" />
              <Text className="text-white/60 text-[9px] ml-1">Biometric linked</Text>
            </View>
          </View>

          <View className="flex-1 justify-center">
            <Text className="text-white/60 text-[10px] uppercase mb-0.5">Full name</Text>
            <Text className="text-white font-bold text-lg leading-tight mb-3" numberOfLines={2}>
              {profile.fullName}
            </Text>

            <Text className="text-white/60 text-[10px] uppercase mb-0.5">Fayda ID (FIN)</Text>
            <Text className="text-white font-mono text-base tracking-wider mb-3">
              {faydaFormatted}
            </Text>

            <View className="flex-row items-center">
              {isVerified ? (
                <View className="flex-row items-center bg-white/20 px-2.5 py-1 rounded-full">
                  <Ionicons name="shield-checkmark" size={14} color="#86efac" />
                  <Text className="text-white text-[10px] font-bold ml-1">ID VERIFIED</Text>
                </View>
              ) : (
                <View className="flex-row items-center bg-amber-500/30 px-2.5 py-1 rounded-full">
                  <Ionicons name="time" size={14} color="#fde68a" />
                  <Text className="text-amber-100 text-[10px] font-bold ml-1">PENDING</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Card footer strip */}
        <View className="flex-row justify-between items-center mt-5 pt-4 border-t border-white/20">
          <View>
            <Text className="text-white/50 text-[9px]">Citizen portal ID</Text>
            <Text className="text-white/90 text-xs font-mono">
              {profile.id.slice(0, 8).toUpperCase()}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-white/50 text-[9px]">Member since</Text>
            <Text className="text-white/90 text-xs font-semibold">
              {formatDate(profile.createdAt)}
            </Text>
          </View>
          <View className="w-12 h-8 bg-amber-300/80 rounded items-center justify-center">
            <View className="w-8 h-5 border border-amber-700/40 rounded-sm" />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <View
      className="flex-1 bg-white rounded-2xl p-3 mx-1 items-center border border-gray-100"
      style={{ minWidth: '22%' }}
    >
      <Text className="text-xl font-bold" style={{ color: CITIZEN_PRIMARY }}>
        {value}
      </Text>
      <Text className="text-gray-500 text-[10px] text-center mt-0.5">{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenProp>();
  const { user, token, logout, refreshUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setProfile(data.user);
        await refreshUser();
      }
    } catch (e) {
      console.error('Profile load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, refreshUser]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadProfile();
    }, [loadProfile])
  );

  const displayProfile: ProfileData | null =
    profile ||
    (user
      ? {
          id: user.id || '',
          email: user.email,
          fullName: user.fullName || 'User',
          phone: user.phone,
          faydaId: user.faydaId,
          role: user.role || 'citizen',
          status: 'Active',
          createdAt: user.createdAt || new Date().toISOString(),
          lastLogin: user.lastLogin,
        }
      : null);

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const quickActions = [
    {
      icon: 'map' as const,
      label: 'My Lands',
      sub: 'Registered properties',
      onPress: () => navigation.navigate('MyLands'),
    },
    {
      icon: 'document-text' as const,
      label: 'My Requests',
      sub: 'Applications & status',
      onPress: () => navigation.navigate('MyRequests'),
    },
    {
      icon: 'folder' as const,
      label: 'Documents',
      sub: 'Certificates & files',
      onPress: () => navigation.navigate('MyDocuments'),
    },
    {
      icon: 'notifications' as const,
      label: 'Notifications',
      sub: 'Alerts & updates',
      onPress: () => navigation.navigate('Notifications'),
      badge: displayProfile?.stats?.unreadNotifications,
    },
  ];

  if (loading && !displayProfile) {
    return (
      <Screen className="items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color={CITIZEN_PRIMARY} />
      </Screen>
    );
  }

  if (!displayProfile) {
    return (
      <Screen className="items-center justify-center bg-gray-50 px-6">
        <Ionicons name="person-circle-outline" size={64} color="#9CA3AF" />
        <Text className="text-gray-600 mt-4 text-center">Could not load profile</Text>
        <TouchableOpacity onPress={loadProfile} className="mt-4 px-6 py-3 rounded-xl" style={{ backgroundColor: CITIZEN_PRIMARY }}>
          <Text className="text-white font-bold">Retry</Text>
        </TouchableOpacity>
      </Screen>
    );
  }

  const stats = displayProfile.stats || {
    totalLands: 0,
    totalRequests: 0,
    pendingRequests: 0,
    pendingPayments: 0,
    unreadNotifications: 0,
  };

  return (
    <Screen style={{ backgroundColor: CITIZEN_BG }}>
      <StatusBar barStyle="light-content" backgroundColor={CITIZEN_PRIMARY} />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadProfile();
            }}
            colors={[CITIZEN_PRIMARY]}
          />
        }
      >
        {/* Top banner */}
        <LinearGradient
          colors={[CITIZEN_PRIMARY, CITIZEN_PRIMARY_LIGHT]}
          style={{ paddingTop: 48, paddingBottom: 72, paddingHorizontal: 20 }}
        >
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
              <Ionicons name="arrow-back" size={22} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-lg font-bold">My Profile</Text>
            <View className="w-10" />
          </View>
          <Text className="text-white/80 text-sm mt-4 text-center">
            Official citizen identity & account
          </Text>
        </LinearGradient>

        <FaydaCard profile={displayProfile} />

        {/* Stats */}
        <View className="px-3 mb-4">
          <Text className="text-gray-800 font-bold text-base mb-3 px-1">Account overview</Text>
          <View className="flex-row justify-between">
            <StatPill label="Lands" value={stats.totalLands} />
            <StatPill label="Requests" value={stats.totalRequests} />
            <StatPill label="Pending" value={stats.pendingRequests} />
            <StatPill label="Alerts" value={stats.unreadNotifications} />
          </View>
        </View>

        {/* Personal details */}
        <View className="mx-4 mb-4 bg-white rounded-2xl px-4 shadow-sm border border-gray-100">
          <Text className="text-gray-800 font-bold text-base pt-4 pb-1">Personal information</Text>
          <InfoRow icon="mail" label="Email" value={displayProfile.email || '—'} />
          <InfoRow icon="call" label="Phone" value={displayProfile.phone || '—'} verified />
          <InfoRow
            icon="card"
            label="Fayda National ID"
            value={formatFaydaId(displayProfile.faydaId)}
            verified
          />
          <InfoRow
            icon="person"
            label="Account type"
            value={(displayProfile.role || 'citizen').replace(/^\w/, (c) => c.toUpperCase())}
          />
          <InfoRow icon="calendar" label="Member since" value={formatDate(displayProfile.createdAt)} />
          <InfoRow icon="time" label="Last sign in" value={formatDate(displayProfile.lastLogin)} />
          <View className="flex-row items-start py-3.5">
            <View
              className="w-10 h-10 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: `${CITIZEN_PRIMARY}18` }}
            >
              <Ionicons name="pulse" size={20} color={CITIZEN_PRIMARY} />
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-xs uppercase tracking-wide mb-0.5">Account status</Text>
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                <Text className="text-gray-900 font-semibold text-base">
                  {displayProfile.status || 'Active'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick actions */}
        <View className="mx-4 mb-4">
          <Text className="text-gray-800 font-bold text-base mb-3 px-1">Quick actions</Text>
          <View className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={action.label}
                onPress={action.onPress}
                className={`flex-row items-center p-4 ${
                  index < quickActions.length - 1 ? 'border-b border-gray-100' : ''
                }`}
                activeOpacity={0.7}
              >
                <View
                  className="w-11 h-11 rounded-xl items-center justify-center mr-3"
                  style={{ backgroundColor: `${CITIZEN_PRIMARY}15` }}
                >
                  <Ionicons name={action.icon} size={22} color={CITIZEN_PRIMARY} />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-semibold text-base">{action.label}</Text>
                  <Text className="text-gray-500 text-xs mt-0.5">{action.sub}</Text>
                </View>
                {action.badge != null && action.badge > 0 ? (
                  <View className="bg-red-500 min-w-[22px] h-[22px] rounded-full items-center justify-center px-1.5 mr-2">
                    <Text className="text-white text-[10px] font-bold">
                      {action.badge > 9 ? '9+' : action.badge}
                    </Text>
                  </View>
                ) : null}
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Services */}
        <View className="mx-4 mb-4">
          <Text className="text-gray-800 font-bold text-base mb-3 px-1">Land services</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('VerificationRequest')}
            className="bg-white rounded-2xl p-4 flex-row items-center mb-3 border border-gray-100 shadow-sm"
          >
            <Ionicons name="shield-checkmark" size={24} color={CITIZEN_PRIMARY} />
            <View className="flex-1 ml-3">
              <Text className="text-gray-900 font-semibold">Ownership verification</Text>
              <Text className="text-gray-500 text-xs">Verify land against Fayda identity</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('TrackRequest')}
            className="bg-white rounded-2xl p-4 flex-row items-center border border-gray-100 shadow-sm"
          >
            <Ionicons name="search" size={24} color={CITIZEN_PRIMARY} />
            <View className="flex-1 ml-3">
              <Text className="text-gray-900 font-semibold">Track application</Text>
              <Text className="text-gray-500 text-xs">Look up by reference number</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Sign out */}
        <TouchableOpacity
          onPress={handleLogout}
          className="mx-4 mb-4 bg-white p-4 rounded-2xl flex-row items-center justify-center border border-red-100 shadow-sm"
        >
          <Ionicons name="log-out-outline" size={22} color="#DC2626" />
          <Text className="text-red-600 font-bold text-base ml-2">Sign out</Text>
        </TouchableOpacity>

        <View className="items-center pb-10">
          <Text className="text-gray-400 text-xs">Digital Land Citizen Portal v1.0</Text>
          <Text className="text-gray-400 text-[10px] mt-1">Bahir Dar University · Ethiopia</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
