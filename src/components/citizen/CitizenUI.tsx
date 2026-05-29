import React, { ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  ViewStyle,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '../layout/Screen';
import {
  CITIZEN_PRIMARY,
  CITIZEN_PRIMARY_DARK,
  CITIZEN_PRIMARY_LIGHT,
  CITIZEN_BG,
  CITIZEN_SURFACE,
  CITIZEN_HEADER_GRADIENT,
  cardShadow,
  softShadow,
} from '../../theme/citizenTheme';

export const GRADIENT = CITIZEN_HEADER_GRADIENT;

type CitizenHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  badge?: string | number;
  stat?: { label: string; value: string | number };
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
};

export function CitizenHeader({
  title,
  subtitle,
  showBack,
  badge,
  stat,
  rightIcon,
  onRightPress,
}: CitizenHeaderProps) {
  const navigation = useNavigation();
  const canBack = showBack && navigation.canGoBack();

  return (
    <View style={{ overflow: 'hidden' }}>
      <LinearGradient
        colors={GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: 52,
          paddingBottom: 28,
          paddingHorizontal: 20,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: -40,
            right: -30,
            width: 140,
            height: 140,
            borderRadius: 70,
            backgroundColor: 'rgba(255,255,255,0.06)',
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: 20,
            left: -50,
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: 'rgba(255,255,255,0.04)',
          }}
        />

        <View className="flex-row items-center mb-4">
          <View
            className="px-2.5 py-1 rounded-full flex-row items-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
          >
            <Ionicons name="leaf" size={12} color="rgba(255,255,255,0.9)" />
            <Text className="text-white/90 text-[10px] font-bold ml-1 tracking-wider">
              LAND PORTAL
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center flex-1">
            {canBack ? (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
                style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
              >
                <Ionicons name="arrow-back" size={22} color="white" />
              </TouchableOpacity>
            ) : null}
            <View className="flex-1">
              <Text className="text-white text-2xl font-bold tracking-tight">{title}</Text>
              {subtitle ? (
                <Text className="text-white/75 text-sm mt-1 leading-5">{subtitle}</Text>
              ) : null}
            </View>
          </View>
          {badge != null && Number(badge) > 0 ? (
            <View className="bg-red-500 min-w-[28px] h-7 rounded-full items-center justify-center px-2 mr-1">
              <Text className="text-white text-xs font-bold">
                {Number(badge) > 99 ? '99+' : badge}
              </Text>
            </View>
          ) : null}
          {rightIcon && onRightPress ? (
            <TouchableOpacity
              onPress={onRightPress}
              className="w-11 h-11 rounded-2xl items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
            >
              <Ionicons name={rightIcon} size={24} color="white" />
            </TouchableOpacity>
          ) : null}
        </View>

        {stat ? (
          <View
            className="rounded-2xl p-4 mt-2"
            style={{
              backgroundColor: 'rgba(255,255,255,0.14)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.22)',
            }}
          >
            <Text className="text-white/65 text-xs font-medium uppercase tracking-wide">
              {stat.label}
            </Text>
            <Text className="text-white font-bold text-xl mt-1">{stat.value}</Text>
          </View>
        ) : null}
      </LinearGradient>
    </View>
  );
}

export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between mb-3 mt-1 px-0.5">
      <Text className="text-gray-900 font-bold text-lg">{title}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity onPress={onAction} className="px-2 py-1">
          <Text className="text-sm font-bold" style={{ color: CITIZEN_PRIMARY }}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function SurfaceCard({
  children,
  style,
  className = '',
}: {
  children: ReactNode;
  style?: ViewStyle;
  className?: string;
}) {
  return (
    <View
      className={`bg-white rounded-3xl overflow-hidden border border-gray-100/80 ${className}`}
      style={[cardShadow, style]}
    >
      {children}
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View
      className="items-center py-14 px-6 rounded-3xl border-2 border-dashed"
      style={{
        backgroundColor: CITIZEN_SURFACE,
        borderColor: `${CITIZEN_PRIMARY}25`,
        ...softShadow,
      }}
    >
      <View
        className="w-24 h-24 rounded-3xl items-center justify-center mb-5"
        style={{ backgroundColor: `${CITIZEN_PRIMARY}14` }}
      >
        <Ionicons name={icon} size={44} color={CITIZEN_PRIMARY} />
      </View>
      <Text className="text-gray-900 font-bold text-xl text-center">{title}</Text>
      <Text className="text-gray-500 text-sm text-center mt-2 leading-6 max-w-[280px]">{message}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity
          onPress={onAction}
          activeOpacity={0.85}
          className="mt-8 px-8 py-3.5 rounded-2xl"
          style={{
            backgroundColor: CITIZEN_PRIMARY,
            shadowColor: CITIZEN_PRIMARY,
            shadowOpacity: 0.35,
            shadowRadius: 10,
            elevation: 4,
          }}
        >
          <Text className="text-white font-bold text-base">{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function ListCard({
  icon,
  iconColor,
  title,
  subtitle,
  meta,
  badge,
  badgeTone = 'green',
  onPress,
  rightIcon = 'chevron-forward',
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  title: string;
  subtitle?: string;
  meta?: string;
  badge?: string;
  badgeTone?: 'green' | 'yellow' | 'blue' | 'red' | 'gray';
  onPress?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
}) {
  const toneMap = {
    green: { bg: '#dcfce7', text: '#166534' },
    yellow: { bg: '#fef9c3', text: '#a16207' },
    blue: { bg: '#dbeafe', text: '#1d4ed8' },
    red: { bg: '#fee2e2', text: '#b91c1c' },
    gray: { bg: '#f3f4f6', text: '#4b5563' },
  };
  const tone = toneMap[badgeTone];
  const color = iconColor || CITIZEN_PRIMARY;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.72 : 1}
      className="bg-white rounded-2xl p-4 mb-3 flex-row overflow-hidden border border-gray-100/90"
      style={cardShadow}
    >
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 12,
          bottom: 12,
          width: 4,
          borderRadius: 4,
          backgroundColor: color,
          opacity: 0.85,
        }}
      />
      <View
        className="w-12 h-12 rounded-2xl items-center justify-center ml-2 mr-3"
        style={{ backgroundColor: `${color}16` }}
      >
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View className="flex-1 pr-1">
        <View className="flex-row items-start justify-between">
          <Text className="text-gray-900 font-bold text-base flex-1 pr-2">{title}</Text>
          {badge ? (
            <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: tone.bg }}>
              <Text className="text-[10px] font-bold uppercase" style={{ color: tone.text }}>
                {badge}
              </Text>
            </View>
          ) : null}
        </View>
        {subtitle ? <Text className="text-gray-600 text-sm mt-1 leading-5">{subtitle}</Text> : null}
        {meta ? <Text className="text-gray-400 text-xs mt-2">{meta}</Text> : null}
      </View>
      {onPress ? (
        <View className="w-8 h-8 rounded-full bg-gray-50 items-center justify-center self-center">
          <Ionicons name={rightIcon} size={18} color="#9CA3AF" />
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

export function ServiceCard({
  title,
  desc,
  icon,
  onPress,
}: {
  title: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      className="rounded-2xl p-4 w-[48%] mb-4 border border-gray-100/80"
      style={{ backgroundColor: CITIZEN_SURFACE, ...cardShadow }}
    >
      <View
        className="w-14 h-14 rounded-2xl items-center justify-center mb-3"
        style={{ backgroundColor: `${CITIZEN_PRIMARY}14` }}
      >
        <Ionicons name={icon} size={28} color={CITIZEN_PRIMARY} />
      </View>
      <Text className="text-gray-900 font-bold text-sm leading-5 mb-1">{title}</Text>
      <Text className="text-gray-500 text-xs leading-4">{desc}</Text>
    </TouchableOpacity>
  );
}

export function InfoBanner({
  title,
  message,
  icon = 'shield-checkmark',
}: {
  title: string;
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View
      className="flex-row items-center rounded-2xl p-4 mb-4 border"
      style={{
        backgroundColor: `${CITIZEN_PRIMARY}0c`,
        borderColor: `${CITIZEN_PRIMARY}28`,
        ...softShadow,
      }}
    >
      <View
        className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
        style={{ backgroundColor: `${CITIZEN_PRIMARY}16` }}
      >
        <Ionicons name={icon} size={26} color={CITIZEN_PRIMARY} />
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 font-bold text-sm">{title}</Text>
        <Text className="text-gray-600 text-xs mt-1 leading-4">{message}</Text>
      </View>
    </View>
  );
}

export function AlertBanner({
  title,
  message,
  onPress,
  icon = 'notifications',
}: {
  title: string;
  message: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      className="rounded-2xl p-4 flex-row items-center mb-4 border"
      style={{
        backgroundColor: `${CITIZEN_PRIMARY}0c`,
        borderColor: `${CITIZEN_PRIMARY}35`,
        ...softShadow,
      }}
    >
      <View
        className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
        style={{ backgroundColor: `${CITIZEN_PRIMARY}20` }}
      >
        <Ionicons name={icon} size={24} color={CITIZEN_PRIMARY} />
      </View>
      <View className="flex-1">
        <Text className="font-bold text-sm" style={{ color: CITIZEN_PRIMARY_DARK }}>
          {title}
        </Text>
        <Text className="text-gray-600 text-xs mt-0.5 leading-4">{message}</Text>
      </View>
      <View className="w-8 h-8 rounded-full items-center justify-center bg-white/80">
        <Ionicons name="chevron-forward" size={18} color={CITIZEN_PRIMARY} />
      </View>
    </TouchableOpacity>
  );
}

export function ActivityRow({
  title,
  subtitle,
  date,
  status,
  onPress,
  isLast,
}: {
  title: string;
  subtitle: string;
  date: string;
  status: string;
  onPress: () => void;
  isLast?: boolean;
}) {
  const s = status.toLowerCase();
  const statusStyle =
    s.includes('approv')
      ? { bg: '#dcfce7', text: '#166534' }
      : s.includes('reject')
        ? { bg: '#fee2e2', text: '#b91c1c' }
        : { bg: '#fef9c3', text: '#a16207' };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={`flex-row items-start p-4 ${!isLast ? 'border-b border-gray-100' : ''}`}
    >
      <View
        className="w-11 h-11 rounded-2xl items-center justify-center mr-3 mt-0.5"
        style={{ backgroundColor: `${CITIZEN_PRIMARY}14` }}
      >
        <Ionicons name="document-text" size={20} color={CITIZEN_PRIMARY} />
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 font-bold text-base">{title}</Text>
        <Text className="text-gray-600 text-sm mt-0.5">{subtitle}</Text>
        <View className="flex-row items-center mt-2 flex-wrap gap-2">
          <Text className="text-gray-400 text-xs">{date}</Text>
          <View className="px-2.5 py-0.5 rounded-full" style={{ backgroundColor: statusStyle.bg }}>
            <Text className="text-xs font-semibold" style={{ color: statusStyle.text }}>
              {status}
            </Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#D1D5DB" style={{ marginTop: 8 }} />
    </TouchableOpacity>
  );
}

export function SearchBar({
  value,
  onChangeText,
  placeholder,
  onClear,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  onClear?: () => void;
}) {
  return (
    <View
      className="rounded-2xl px-4 py-3.5 flex-row items-center border border-gray-100"
      style={{ backgroundColor: CITIZEN_SURFACE, ...cardShadow }}
    >
      <View
        className="w-9 h-9 rounded-xl items-center justify-center mr-2"
        style={{ backgroundColor: `${CITIZEN_PRIMARY}12` }}
      >
        <Ionicons name="search" size={18} color={CITIZEN_PRIMARY} />
      </View>
      <TextInput
        className="flex-1 text-gray-900 text-base"
        placeholder={placeholder || 'Search…'}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
      />
      {value.length > 0 && onClear ? (
        <TouchableOpacity onPress={onClear} className="p-1">
          <Ionicons name="close-circle" size={22} color="#9CA3AF" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function FilterChips({
  options,
  active,
  onSelect,
}: {
  options: string[];
  active: string;
  onSelect: (v: string) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-1">
      {options.map((filter) => {
        const selected = active === filter;
        return (
          <TouchableOpacity
            key={filter}
            onPress={() => onSelect(filter)}
            className="px-5 py-2.5 rounded-full mr-2 border"
            style={
              selected
                ? {
                    backgroundColor: CITIZEN_PRIMARY,
                    borderColor: CITIZEN_PRIMARY,
                    shadowColor: CITIZEN_PRIMARY,
                    shadowOpacity: 0.25,
                    shadowRadius: 6,
                    elevation: 3,
                  }
                : { backgroundColor: CITIZEN_SURFACE, borderColor: '#e5e7eb' }
            }
          >
            <Text
              className={`text-sm font-bold ${selected ? 'text-white' : 'text-gray-600'}`}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export function MarketplaceListingCard({
  title,
  location,
  price,
  area,
  typeLabel,
  verified,
  contacting,
  onPress,
  onContact,
  onDetails,
}: {
  title: string;
  location: string;
  price: string;
  area: string;
  typeLabel: string;
  verified: boolean;
  contacting?: boolean;
  onPress: () => void;
  onContact: () => void;
  onDetails: () => void;
}) {
  const isSale = typeLabel === 'For Sale';
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      className="rounded-3xl overflow-hidden mb-5 border border-gray-100/80"
      style={{ backgroundColor: CITIZEN_SURFACE, ...cardShadow }}
    >
      <View className="relative">
        <LinearGradient
          colors={['#e8f5ef', '#d1e8dd', '#b8dcc8']}
          style={{ height: 148, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="home" size={56} color={`${CITIZEN_PRIMARY}55`} />
        </LinearGradient>
        <View
          className="absolute top-3 left-3 px-3 py-1.5 rounded-full"
          style={{ backgroundColor: isSale ? CITIZEN_PRIMARY : '#2563eb' }}
        >
          <Text className="text-white text-xs font-bold">{typeLabel}</Text>
        </View>
        {verified ? (
          <View className="absolute top-3 right-3 flex-row items-center px-2.5 py-1 rounded-full bg-gray-900/85 border border-emerald-400/40">
            <Ionicons name="shield-checkmark" size={12} color="#34d399" />
            <Text className="text-white text-[10px] font-bold ml-1">VERIFIED</Text>
          </View>
        ) : null}
      </View>
      <View className="p-4">
        <Text className="text-gray-900 font-bold text-lg mb-1" numberOfLines={2}>
          {title}
        </Text>
        <View className="flex-row items-center mb-3">
          <Ionicons name="location-outline" size={16} color={CITIZEN_PRIMARY} />
          <Text className="text-gray-600 text-sm ml-1 flex-1" numberOfLines={1}>
            {location}
          </Text>
        </View>
        <View className="flex-row items-center justify-between mb-4">
          <Text className="font-bold text-xl" style={{ color: CITIZEN_PRIMARY }}>
            {price}
          </Text>
          <Text className="text-gray-500 text-sm font-medium">{area}</Text>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={onContact}
            disabled={contacting}
            className="flex-1 py-3 rounded-xl items-center"
            style={{ backgroundColor: CITIZEN_PRIMARY }}
          >
            <Text className="text-white font-bold text-sm">
              {contacting ? 'Connecting…' : 'Live chat'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDetails}
            className="flex-1 py-3 rounded-xl items-center border-2"
            style={{ borderColor: CITIZEN_PRIMARY }}
          >
            <Text className="font-bold text-sm" style={{ color: CITIZEN_PRIMARY }}>
              Details
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function NotificationCard({
  title,
  message,
  time,
  read,
  icon,
  color,
  onPress,
}: {
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="rounded-2xl p-4 mb-3 border border-gray-100/90"
      style={[
        cardShadow,
        !read
          ? {
              backgroundColor: CITIZEN_SURFACE,
              borderLeftWidth: 4,
              borderLeftColor: CITIZEN_PRIMARY,
            }
          : { backgroundColor: '#fafafa' },
      ]}
    >
      <View className="flex-row items-start">
        <View
          className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
          style={{ backgroundColor: `${color}18` }}
        >
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text
              className={`font-bold text-base flex-1 pr-2 ${read ? 'text-gray-600' : 'text-gray-900'}`}
            >
              {title}
            </Text>
            {!read ? (
              <View
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: CITIZEN_PRIMARY }}
              />
            ) : null}
          </View>
          <Text className="text-gray-600 text-sm mt-1 leading-5">{message}</Text>
          <Text className="text-gray-400 text-xs mt-2">{time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function ProfileBanner({
  initials,
  name,
  subtitle,
  onPress,
}: {
  initials: string;
  name: string;
  subtitle?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} className="mb-5 rounded-3xl overflow-hidden">
      <LinearGradient
        colors={[CITIZEN_PRIMARY_DARK, CITIZEN_PRIMARY, CITIZEN_PRIMARY_LIGHT]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 20, ...cardShadow }}
      >
        <View className="flex-row items-center">
          <View className="w-16 h-16 rounded-2xl bg-white/20 items-center justify-center mr-4 border border-white/30">
            <Text className="text-white text-2xl font-bold">{initials}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-xl">{name}</Text>
            {subtitle ? <Text className="text-white/75 text-sm mt-0.5">{subtitle}</Text> : null}
            <View className="flex-row items-center mt-3 bg-white/15 self-start px-3 py-1.5 rounded-full">
              <Text className="text-white text-xs font-bold">View Fayda profile</Text>
              <Ionicons name="chevron-forward" size={14} color="white" style={{ marginLeft: 4 }} />
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export function PrimaryFAB({
  label,
  icon = 'add',
  onPress,
  style,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  style?: ViewStyle;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="flex-row items-center justify-center py-4 rounded-2xl mb-8"
      style={[
        {
          backgroundColor: CITIZEN_PRIMARY,
          shadowColor: CITIZEN_PRIMARY,
          shadowOpacity: 0.4,
          shadowRadius: 14,
          elevation: 6,
        },
        style,
      ]}
    >
      <Ionicons name={icon} size={22} color="white" />
      <Text className="text-white font-bold text-base ml-2">{label}</Text>
    </TouchableOpacity>
  );
}

type CitizenScreenProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  badge?: string | number;
  headerStat?: { label: string; value: string | number };
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  children: ReactNode;
};

export function CitizenScreen({
  title,
  subtitle,
  showBack,
  badge,
  headerStat,
  loading,
  refreshing,
  onRefresh,
  children,
}: CitizenScreenProps) {
  if (loading) {
    return (
      <Screen className="items-center justify-center" style={{ backgroundColor: CITIZEN_BG }}>
        <StatusBar barStyle="light-content" backgroundColor={CITIZEN_PRIMARY_DARK} />
        <ActivityIndicator size="large" color={CITIZEN_PRIMARY} />
        <Text className="text-gray-500 mt-3 font-medium">Loading…</Text>
      </Screen>
    );
  }

  return (
    <Screen style={{ backgroundColor: CITIZEN_BG }}>
      <StatusBar barStyle="light-content" backgroundColor={CITIZEN_PRIMARY_DARK} />
      <CitizenHeader
        title={title}
        subtitle={subtitle}
        showBack={showBack}
        badge={badge}
        stat={headerStat}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 4,
          paddingBottom: 36,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} colors={[CITIZEN_PRIMARY]} />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    </Screen>
  );
}

export function StatRow({ items }: { items: { label: string; value: number | string }[] }) {
  return (
    <View className="flex-row mb-4 -mx-0.5">
      {items.map((item) => (
        <View
          key={item.label}
          className="flex-1 mx-1 rounded-2xl p-3.5 items-center border border-gray-100/80"
          style={{ backgroundColor: CITIZEN_SURFACE, ...softShadow }}
        >
          <Text className="text-2xl font-bold" style={{ color: CITIZEN_PRIMARY }}>
            {item.value}
          </Text>
          <Text className="text-gray-500 text-[10px] text-center mt-1 font-medium uppercase tracking-wide">
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
