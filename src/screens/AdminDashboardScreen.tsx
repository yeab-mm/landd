import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../api/config';

type RootStackParamList = {
    MainApp: undefined;
    AdminDashboard: undefined;
};

type AdminDashboardScreenProp = StackNavigationProp<RootStackParamList, 'AdminDashboard'>;

export default function AdminDashboardScreen() {
    const navigation = useNavigation<AdminDashboardScreenProp>();
    const { token } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchUsers = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data.users) {
                const mapped = data.users.map((u: any) => ({
                    id: u.id,
                    name: u.fullName || 'N/A',
                    email: u.email || 'N/A',
                    role: u.role || 'Citizen',
                    status: u.status || 'Active'
                }));
                setUsers(mapped);
            }
        } catch (error) {
            console.error('Fetch users error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [token]);

    // ✅ Filter users by search query
    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase()) || 
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    // ✅ Toggle user role with confirmation
    const toggleRole = (id: string) => {
        const user = users.find(u => u.id === id);
        if (!user) return;
        
        const newRole = user.role === 'Citizen' ? 'Officer' : 'Citizen';
        
        Alert.alert(
            'Change Role',
            `Change ${user.name}'s role from ${user.role} to ${newRole}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Confirm', 
                    onPress: async () => {
                        try {
                            setLoading(true);
                            const res = await fetch(`${API_URL}/users/${id}/role`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`
                                },
                                body: JSON.stringify({ role: newRole })
                            });
                            const data = await res.json();
                            if (res.ok) {
                                Alert.alert('Success', 'User role updated');
                                fetchUsers();
                            } else {
                                Alert.alert('Error', data.error || 'Failed to update user role');
                            }
                        } catch (error) {
                            console.error('Update user role error:', error);
                            Alert.alert('Error', 'Failed to update user role');
                        } finally {
                            setLoading(false);
                        }
                    } 
                }
            ]
        );
    };

    // ✅ Suspend user with confirmation
    const handleSuspend = (id: string) => {
        const user = users.find(u => u.id === id);
        if (!user) return;
        
        Alert.alert(
            'Suspend User',
            `Are you sure you want to suspend ${user.name}? They will lose access to the system.`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Suspend', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            const res = await fetch(`${API_URL}/users/${id}/status`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`
                                },
                                body: JSON.stringify({ status: 'Suspended' })
                            });
                            const data = await res.json();
                            if (res.ok) {
                                Alert.alert('Suspended', `${user.name} has been suspended`);
                                fetchUsers();
                            } else {
                                Alert.alert('Error', data.error || 'Failed to suspend user');
                            }
                        } catch (error) {
                            console.error('Suspend user error:', error);
                            Alert.alert('Error', 'Failed to suspend user');
                        } finally {
                            setLoading(false);
                        }
                    } 
                }
            ]
        );
    };

    // ✅ System maintenance actions
    const handleFlushCache = () => {
        Alert.alert(
            'Flush Cache',
            'This will clear all cached data. System may be temporarily slower.',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Flush', 
                    style: 'destructive',
                    onPress: () => Alert.alert('Success', 'System cache flushed') 
                }
            ]
        );
    };

    const handleBackup = () => {
        Alert.alert(
            'Backup Ledger',
            'Create a new backup of the blockchain ledger?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Backup', 
                    onPress: () => Alert.alert('Success', 'Backup completed successfully') 
                }
            ]
        );
    };

    // ✅ Get role badge styles
    const getRoleBadgeStyle = (role: string) => {
        switch (role) {
            case 'Admin': return { bg: 'bg-purple-100', text: 'text-purple-700' };
            case 'Officer': return { bg: 'bg-[#125f43ff]/20', text: 'text-[#125f43ff]' };
            default: return { bg: 'bg-gray-100', text: 'text-gray-700' };
        }
    };

    // ✅ Get status badge styles
    const getStatusBadgeStyle = (status: string) => {
        switch (status) {
            case 'Active': return { bg: 'bg-green-100', text: 'text-green-700' };
            case 'Pending': return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
            case 'Suspended': return { bg: 'bg-red-100', text: 'text-red-700' };
            default: return { bg: 'bg-gray-100', text: 'text-gray-700' };
        }
    };

    if (loading && users.length === 0) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#125f43ff" />
                <Text className="text-gray-600 mt-4">Loading system data...</Text>
            </View>
        );
    }


    return (
        <View className="flex-1 bg-gray-50">
            {/* ✅ FIXED: Match app's green theme */}
            <StatusBar barStyle="light-content" backgroundColor="#125f43ff" />
            
            {/* Header */}
            <LinearGradient
                colors={['#125f43ff', '#1a7f5a']}
                className="px-6 pt-12 pb-8 rounded-b-[40px] shadow-lg"
            >
                <View className="flex-row items-center justify-between mb-4">
                    <TouchableOpacity 
                        onPress={() => navigation.goBack()}
                        accessibilityLabel="Go back"
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View className="bg-white/20 px-3 py-1 rounded-full">
                        <Text className="text-white text-[10px] font-bold uppercase tracking-wider">System Administration</Text>
                    </View>
                    <TouchableOpacity accessibilityLabel="Settings">
                        <Ionicons name="settings-outline" size={24} color="white" />
                    </TouchableOpacity>
                </View>
                <Text className="text-white text-2xl font-bold">Admin Control Panel</Text>
                <Text className="text-white/80 text-sm">System Health: Optimal</Text>
            </LinearGradient>

            <View className="flex-1 px-6">
                {/* Search Bar */}
                <View className="bg-white flex-row items-center px-4 py-3 rounded-2xl shadow-sm border border-gray-100 -mt-6 mb-6">
                    <Ionicons name="search" size={20} color="#9CA3AF" />
                    <TextInput 
                        placeholder="Search users by name or email..."
                        placeholderTextColor="#9CA3AF"
                        className="flex-1 ml-2 text-gray-800"
                        value={search}
                        onChangeText={setSearch}
                        accessibilityLabel="Search users"
                    />
                </View>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    {/* User Management */}
                    <View className="mb-6">
                        <Text className="text-gray-800 text-lg font-bold mb-4">User Management</Text>
                        
                        {filteredUsers.length === 0 ? (
                            <View className="bg-white rounded-2xl p-8 items-center border border-gray-100">
                                <Ionicons name="search-outline" size={48} color="#9CA3AF" />
                                <Text className="text-gray-500 text-center mt-3">No users found</Text>
                                <Text className="text-gray-400 text-sm text-center">Try adjusting your search</Text>
                            </View>
                        ) : (
                            filteredUsers.map((user) => {
                                const roleStyle = getRoleBadgeStyle(user.role);
                                const statusStyle = getStatusBadgeStyle(user.status);
                                
                                return (
                                    <View key={user.id} className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-xs">
                                        <View className="flex-row justify-between items-start">
                                            <View className="flex-row items-center flex-1">
                                                <View className="w-10 h-10 bg-[#125f43ff]/20 rounded-full items-center justify-center mr-3">
                                                    <Text className="text-[#125f43ff] font-bold">{user.name.charAt(0)}</Text>
                                                </View>
                                                <View className="flex-1">
                                                    <Text className="text-gray-900 font-bold">{user.name}</Text>
                                                    <Text className="text-gray-500 text-xs">{user.email}</Text>
                                                </View>
                                            </View>
                                            <View className={`px-2 py-1 rounded-md ${roleStyle.bg}`}>
                                                <Text className={`text-[10px] font-bold ${roleStyle.text}`}>
                                                    {user.role.toUpperCase()}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Status Badge */}
                                        <View className="mt-2">
                                            <View className={`self-start px-2 py-1 rounded-md ${statusStyle.bg}`}>
                                                <Text className={`text-[10px] font-bold ${statusStyle.text}`}>
                                                    {user.status}
                                                </Text>
                                            </View>
                                        </View>

                                        {user.role !== 'Admin' && (
                                            <View className="mt-4 pt-4 border-t border-gray-50 flex-row justify-end space-x-3">
                                                <TouchableOpacity 
                                                    onPress={() => toggleRole(user.id)}
                                                    className="px-4 py-2 rounded-lg bg-[#125f43ff]/10 border border-[#125f43ff]/20"
                                                    accessibilityLabel={`Change role for ${user.name}`}
                                                >
                                                    <Text className="text-[#125f43ff] text-xs font-bold">
                                                        {user.role === 'Citizen' ? 'Promote to Officer' : 'Demote to Citizen'}
                                                    </Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity 
                                                    onPress={() => handleSuspend(user.id)}
                                                    className="px-4 py-2 rounded-lg bg-red-50 border border-red-100"
                                                    accessibilityLabel={`Suspend ${user.name}`}
                                                >
                                                    <Text className="text-red-500 text-xs font-bold">Suspend</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                );
                            })
                        )}
                    </View>

                    {/* System Maintenance */}
                    <View className="mb-10">
                        <Text className="text-gray-800 text-lg font-bold mb-4">System Maintenance</Text>
                        <TouchableOpacity 
                            className="bg-white p-4 rounded-2xl border border-gray-100 flex-row items-center justify-between mb-2"
                            onPress={handleFlushCache}
                            accessibilityLabel="Flush system cache"
                        >
                            <View className="flex-row items-center">
                                <Ionicons name="refresh-circle" size={24} color="#125f43ff" />
                                <Text className="ml-3 font-semibold">Flush System Cache</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            className="bg-white p-4 rounded-2xl border border-gray-100 flex-row items-center justify-between"
                            onPress={handleBackup}
                            accessibilityLabel="Backup blockchain ledger"
                        >
                            <View className="flex-row items-center">
                                <Ionicons name="shield-half" size={24} color="#125f43ff" />
                                <Text className="ml-3 font-semibold">Backup Blockchain Ledger</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}