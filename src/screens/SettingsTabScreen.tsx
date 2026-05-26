import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';

// ✅ FIXED: Proper navigation types
type RootStackParamList = {
    Login: undefined;
    ReportIssue: undefined;
    OfficerDashboard: undefined;
    AdminDashboard: undefined;
    SettingsTab: undefined;
};

type SettingsTabScreenProp = StackNavigationProp<RootStackParamList, 'SettingsTab'>; // ✅ FIXED: Changed from 'Login' to 'SettingsTab'

export default function SettingsTabScreen() {
    const navigation = useNavigation<SettingsTabScreenProp>();
    const { logout } = useAuth();
    const [showReportModal, setShowReportModal] = useState(false);

    // ✅ FIXED: Use explicit green theme colors
    const PRIMARY_COLOR = '#125f43ff';
    const SECONDARY_COLOR = '#F59E0B';

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    await logout();
                },
            },
        ]);
    };

    const handleReportIssue = (issueType: string) => {
        setShowReportModal(false);
        Alert.alert(
            'Report Issue',
            `You selected: ${issueType}\n\nOur team will review your report within 24-48 hours. You'll receive a confirmation email shortly.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Submit Report',
                    onPress: () => {
                        // In real app: navigate to ReportIssue screen or submit to API
                        Alert.alert('Report Submitted', 'Thank you for helping keep our community safe.');
                    },
                },
            ]
        );
    };

    const settingsItems = [
        { title: 'Profile Settings', icon: 'person' as const, desc: 'Edit your personal info' },
        { title: 'Language', icon: 'language' as const, desc: 'English' },
        { title: 'Notifications', icon: 'notifications' as const, desc: 'Manage alerts' },
        { title: 'Privacy', icon: 'shield-checkmark' as const, desc: 'Privacy settings' },
        { title: 'Security', icon: 'lock-closed' as const, desc: 'Password & authentication' },
        { title: 'Help & Support', icon: 'help-circle' as const, desc: 'FAQs and contact' },
    ];

    // ✅ Report Sensitive Issues List
    const reportIssues = [
        {
            id: 1,
            title: 'Fraudulent Listing',
            icon: 'alert-circle' as const,
            color: '#EF4444',
            desc: 'Report fake or misleading land listings',
        },
        {
            id: 2,
            title: 'Harassment or Abuse',
            icon: 'person-remove' as const,
            color: '#EF4444',
            desc: 'Report inappropriate behavior from users',
        },
        {
            id: 3,
            title: 'Privacy Violation',
            icon: 'eye-off' as const,
            color: '#F59E0B',
            desc: 'Report misuse of personal information',
        },
        {
            id: 4,
            title: 'Document Forgery',
            icon: 'document-dislike' as const,
            color: '#EF4444',
            desc: 'Report fake or altered documents',
        },
        {
            id: 5,
            title: 'Land Dispute',
            icon: 'map' as const,
            color: '#F59E0B',
            desc: 'Report boundary or ownership conflicts',
        },
        {
            id: 6,
            title: 'Other Issue',
            icon: 'help-circle' as const,
            color: '#6B7280',
            desc: 'Report any other sensitive concern',
        },
    ];

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />

            {/* Header */}
            <LinearGradient
                colors={[PRIMARY_COLOR, PRIMARY_COLOR]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                className="px-6 pt-10 pb-6 rounded-b-3xl"
            >
                <Text className="text-white text-2xl font-bold mb-1">Settings</Text>
                <Text className="text-white/80 text-sm">Manage your preferences</Text>
            </LinearGradient>

            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                {/* Settings Items */}
                <View className="py-6">
                    {settingsItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            className="bg-white rounded-2xl p-4 mb-2 shadow-sm border border-gray-100"
                            activeOpacity={0.8}
                            accessibilityLabel={`${item.title}: ${item.desc}`}
                        >
                            <View className="flex-row items-center">
                                {/* ✅ FIXED: Use explicit color */}
                                <View className="bg-[#125f43ff]/10 rounded-xl p-3 mr-4">
                                    <Ionicons name={item.icon} size={22} color={PRIMARY_COLOR} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-800 font-bold text-base">{item.title}</Text>
                                    <Text className="text-gray-600 text-sm">{item.desc}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ✅ Report Sensitive Issues Section */}
                <View className="py-4">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-gray-800 text-lg font-bold">Report Sensitive Issues</Text>
                        <TouchableOpacity 
                            onPress={() => setShowReportModal(true)}
                            accessibilityLabel="View all reportable issues"
                        >
                            <Text className="text-[#125f43ff] text-sm font-semibold">View All</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Preview of First 2 Report Types */}
                    {reportIssues.slice(0, 2).map((issue) => (
                        <TouchableOpacity
                            key={issue.id}
                            onPress={() => handleReportIssue(issue.title)}
                            className="bg-white rounded-2xl p-4 mb-2 shadow-sm border border-gray-100"
                            activeOpacity={0.8}
                            accessibilityLabel={`Report ${issue.title}: ${issue.desc}`}
                        >
                            <View className="flex-row items-center">
                                <View className={`rounded-xl p-3 mr-4`} style={{ backgroundColor: `${issue.color}20` }}>
                                    <Ionicons name={issue.icon} size={22} color={issue.color} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-800 font-bold text-base">{issue.title}</Text>
                                    <Text className="text-gray-600 text-sm">{issue.desc}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Developer Options Section */}
                <View className="py-4 mt-2">
                    <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4 ml-1">Developer Options</Text>
                    <View className="bg-orange-50 rounded-2xl p-5 border border-orange-100">
                        <View className="flex-row items-center mb-4">
                            <Ionicons name="construct" size={20} color="#F59E0B" />
                            <Text className="text-gray-800 font-bold ml-2">Internal Role Override</Text>
                        </View>
                        <Text className="text-gray-500 text-xs mb-4">Switch between personas to test specialized dashboards from the RAD.</Text>
                        
                        <View className="flex-row space-x-2">
                            <TouchableOpacity 
                                className="flex-1 bg-white py-2 rounded-lg border border-gray-200 items-center"
                                onPress={() => Alert.alert('Role Switched', 'Currently testing as: CITIZEN')}
                                accessibilityLabel="Test as Citizen role"
                            >
                                <Text className="text-gray-700 text-[10px] font-bold">CITIZEN</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                className="flex-1 bg-[#125f43ff]/10 py-2 rounded-lg border border-[#125f43ff]/20 items-center"
                                onPress={() => {
                                    Alert.alert('Role Switched', 'Currently testing as: LAND OFFICER');
                                    navigation.navigate('OfficerDashboard');
                                }}
                                accessibilityLabel="Test as Land Officer role"
                            >
                                <Text className="text-[#125f43ff] text-[10px] font-bold">OFFICER</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                className="flex-1 bg-[#F59E0B]/10 py-2 rounded-lg border border-[#F59E0B]/20 items-center"
                                onPress={() => {
                                    Alert.alert('Role Switched', 'Currently testing as: SYSTEM ADMIN');
                                    navigation.navigate('AdminDashboard');
                                }}
                                accessibilityLabel="Test as System Admin role"
                            >
                                <Text className="text-[#F59E0B] text-[10px] font-bold">ADMIN</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    onPress={handleLogout}
                    className="bg-white p-4 rounded-xl shadow-md mt-6 flex-row items-center justify-center border border-red-200 mb-8"
                    activeOpacity={0.8}
                    accessibilityLabel="Logout from your account"
                >
                    <Ionicons name="log-out" size={20} color="#EF4444" />
                    <Text className="text-red-500 font-bold text-base ml-2">Logout</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* ✅ Report Issues Modal */}
            <Modal
                visible={showReportModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowReportModal(false)}
            >
                <TouchableOpacity
                    className="flex-1 bg-black/50"
                    activeOpacity={1}
                    onPress={() => setShowReportModal(false)}
                    accessibilityLabel="Close report modal"
                >
                    <View className="bg-white rounded-t-3xl mt-auto max-h-[100%]">
                        <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
                            <Text className="text-lg font-bold text-gray-800">Report an Issue</Text>
                            <TouchableOpacity 
                                onPress={() => setShowReportModal(false)}
                                accessibilityLabel="Close report modal"
                            >
                                <Ionicons name="close" size={24} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView className="p-6">
                            <Text className="text-gray-600 text-sm mb-4">
                                Select the type of sensitive issue you'd like to report. All reports are confidential and reviewed by our trust & safety team.
                            </Text>
                            
                            {reportIssues.map((issue) => (
                                <TouchableOpacity
                                    key={issue.id}
                                    onPress={() => handleReportIssue(issue.title)}
                                    className="flex-row items-center p-4 mb-3 bg-gray-50 rounded-xl border border-gray-100"
                                    activeOpacity={0.7}
                                    accessibilityLabel={`Report ${issue.title}: ${issue.desc}`}
                                >
                                    <View className={`rounded-xl p-3 mr-4`} style={{ backgroundColor: `${issue.color}20` }}>
                                        <Ionicons name={issue.icon} size={22} color={issue.color} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-800 font-bold text-base">{issue.title}</Text>
                                        <Text className="text-gray-600 text-sm">{issue.desc}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                                </TouchableOpacity>
                            ))}

                            {/* Info Box */}
                            <View className="bg-blue-50 rounded-xl p-4 border border-blue-200 mt-1">
                                <View className="flex-row items-start">
                                    <Ionicons name="information-circle" size={20} color="#2563EB" />
                                    <Text className="text-blue-700 text-xs ml-2">
                                        All reports are handled confidentially. Our team responds within 24-48 hours. For urgent issues, contact support directly.
                                    </Text>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}