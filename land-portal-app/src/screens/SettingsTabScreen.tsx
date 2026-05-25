import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
    Login: undefined;
    ReportIssue: undefined;
};

type SettingsTabScreenProp = StackNavigationProp<RootStackParamList, 'Login'>;

export default function SettingsTabScreen() {
    const navigation = useNavigation<SettingsTabScreenProp>();
    const [showReportModal, setShowReportModal] = React.useState(false);

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: () => navigation.navigate('Login') },
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
        { title: 'Profile Settings', icon: 'person', desc: 'Edit your personal info' },
        { title: 'Language', icon: 'language', desc: 'English' },
        { title: 'Notifications', icon: 'notifications', desc: 'Manage alerts' },
        { title: 'Privacy', icon: 'shield-checkmark', desc: 'Privacy settings' },
        { title: 'Security', icon: 'lock-closed', desc: 'Password & authentication' },
        { title: 'Help & Support', icon: 'help-circle', desc: 'FAQs and contact' },
    ];

    // ✅ Report Sensitive Issues List
    const reportIssues = [
        {
            id: 1,
            title: 'Fraudulent Listing',
            icon: 'alert-circle',
            color: '#EF4444',
            desc: 'Report fake or misleading land listings',
        },
        {
            id: 2,
            title: 'Harassment or Abuse',
            icon: 'person-remove',
            color: '#EF4444',
            desc: 'Report inappropriate behavior from users',
        },
        {
            id: 3,
            title: 'Privacy Violation',
            icon: 'eye-off',
            color: '#F59E0B',
            desc: 'Report misuse of personal information',
        },
        {
            id: 4,
            title: 'Document Forgery',
            icon: 'document-dislike',
            color: '#EF4444',
            desc: 'Report fake or altered documents',
        },
        {
            id: 5,
            title: 'Land Dispute',
            icon: 'map',
            color: '#F59E0B',
            desc: 'Report boundary or ownership conflicts',
        },
        {
            id: 6,
            title: 'Other Issue',
            icon: 'help-circle',
            color: '#6B7280',
            desc: 'Report any other sensitive concern',
        },
    ];

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="light-content" backgroundColor="#125f43ff" />

            {/* Header */}
            <LinearGradient
                colors={['#125f43ff', '#125f43ff']}
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
                        >
                            <View className="flex-row items-center">
                                <View className="bg-green-100 rounded-xl p-3 mr-4">
                                    <Ionicons name={item.icon as any} size={22} color="#125f43ff" />
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
                        <TouchableOpacity onPress={() => setShowReportModal(true)}>
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
                        >
                            <View className="flex-row items-center">
                                <View className={`rounded-xl p-3 mr-4`} style={{ backgroundColor: `${issue.color}20` }}>
                                    <Ionicons name={issue.icon as any} size={22} color={issue.color} />
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

                {/* Logout Button */}
                <TouchableOpacity
                    onPress={handleLogout}
                    className="bg-white p-4 rounded-xl shadow-md mt-6 flex-row items-center justify-center border border-red-200 mb-8"
                    activeOpacity={0.8}
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
                >
                    <View className="bg-white rounded-t-3xl mt-auto max-h-[100%]">
                        <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
                            <Text className="text-lg font-bold text-gray-800">Report an Issue</Text>
                            <TouchableOpacity onPress={() => setShowReportModal(false)}>
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
                                >
                                    <View className={`rounded-xl p-3 mr-4`} style={{ backgroundColor: `${issue.color}20` }}>
                                        <Ionicons name={issue.icon as any} size={22} color={issue.color} />
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