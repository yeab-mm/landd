import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
    BlockchainExplorer: undefined;
    MainApp: undefined;
    TransactionDetail: { blockId: string };
};

type BlockchainExplorerScreenProp = StackNavigationProp<RootStackParamList, 'BlockchainExplorer'>;

// ✅ Backend-ready mock data with ISO timestamps
const MOCK_BLOCKS = [
    { 
        id: '12882', 
        type: 'Transfer' as const, 
        hash: '0x882a...991c', 
        timestamp: '2024-04-02T14:30:00Z', 
        status: 'Confirmed' as const,
        details: 'Plot #LND-9912 transferred from Alice to Bob',
        plotId: 'LND-9912',
    },
    { 
        id: '12881', 
        type: 'Registration' as const, 
        hash: '0x71fb...a221', 
        timestamp: '2024-04-02T14:15:00Z', 
        status: 'Confirmed' as const,
        details: 'New Registration: Plot #LND-1002 (Agricultural)',
        plotId: 'LND-1002',
    },
    { 
        id: '12880', 
        type: 'Mutation' as const, 
        hash: '0x12bc...330d', 
        timestamp: '2024-04-02T13:30:00Z', 
        status: 'Confirmed' as const,
        details: 'Mutation Applied: Plot #LND-4410 (Correction of Area)',
        plotId: 'LND-4410',
    },
    { 
        id: '12879', 
        type: 'Subdivision' as const, 
        hash: '0x44dd...ee22', 
        timestamp: '2024-04-02T11:30:00Z', 
        status: 'Confirmed' as const,
        details: 'Subdivision: Plot #LND-8829 split into 4 units',
        plotId: 'LND-8829',
    },
    { 
        id: '12878', 
        type: 'Transfer' as const, 
        hash: '0x99aa...bb11', 
        timestamp: '2024-04-01T16:45:00Z', 
        status: 'Confirmed' as const,
        details: 'Plot #LND-7731 transferred from Kebede to Tigist',
        plotId: 'LND-7731',
    },
];

// ✅ Format timestamp to human-readable
const formatTimestamp = (iso: string): string => {
    const date = new Date(iso);
    const now = new Date();
    const diffSeconds = (now.getTime() - date.getTime()) / 1000;
    
    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} mins ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours ago`;
    return date.toLocaleDateString('en-ET', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// ✅ Get icon and color by transaction type
const getTransactionStyle = (type: string) => {
    switch (type) {
        case 'Transfer': return { icon: 'swap-horizontal' as const, color: '#2563EB', bg: 'bg-blue-50' };
        case 'Registration': return { icon: 'add-circle' as const, color: '#125f43ff', bg: 'bg-[#125f43ff]/10' };
        case 'Mutation': return { icon: 'git-merge' as const, color: '#7C3AED', bg: 'bg-purple-50' };
        case 'Subdivision': return { icon: 'grid' as const, color: '#D97706', bg: 'bg-orange-50' };
        default: return { icon: 'document-text' as const, color: '#6B7280', bg: 'bg-gray-50' };
    }
};

export default function BlockchainExplorerScreen() {
    const navigation = useNavigation<BlockchainExplorerScreenProp>();
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
    const [visibleCount, setVisibleCount] = useState(4);

    // ✅ Filter blocks by search query
    const filteredBlocks = useMemo(() => {
        if (!searchQuery.trim()) return MOCK_BLOCKS;
        
        const query = searchQuery.toLowerCase();
        return MOCK_BLOCKS.filter(block => 
            block.details.toLowerCase().includes(query) ||
            block.hash.toLowerCase().includes(query) ||
            block.id.includes(query) ||
            block.plotId?.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    // ✅ Sort blocks
    const sortedBlocks = useMemo(() => {
        return [...filteredBlocks].sort((a, b) => {
            const aTime = new Date(a.timestamp).getTime();
            const bTime = new Date(b.timestamp).getTime();
            return sortBy === 'newest' ? bTime - aTime : aTime - bTime;
        });
    }, [filteredBlocks, sortBy]);

    // ✅ Paginate blocks
    const displayedBlocks = sortedBlocks.slice(0, visibleCount);

    // ✅ Toggle sort order
    const toggleSort = () => {
        setSortBy(prev => prev === 'newest' ? 'oldest' : 'newest');
    };

    // ✅ View transaction details
    const viewTransaction = (blockId: string) => {
        // In real app: navigation.navigate('TransactionDetail', { blockId })
        Alert.alert(
            'Transaction Details',
            `Block #${blockId}\n\nThis would show full transaction details including:\n• Parties involved\n• Land details\n• Timestamps\n• Blockchain proof`,
            [{ text: 'OK' }]
        );
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* ✅ FIXED: Match app's green theme */}
            <StatusBar barStyle="light-content" backgroundColor="#125f43ff" />
            
            <LinearGradient 
                colors={['#125f43ff', '#1a7f5a']} 
                className="px-6 pt-12 pb-8 rounded-b-[40px]"
            >
                <View className="flex-row items-center mb-6">
                    <TouchableOpacity 
                        onPress={() => navigation.goBack()}
                        accessibilityLabel="Go back"
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View className="ml-4 flex-1">
                        <Text className="text-white text-xl font-bold">Blockchain Explorer</Text>
                        <Text className="text-white/80 text-xs">Public Trust & Transparency Ledger</Text>
                    </View>
                    <View className="bg-white/20 px-3 py-1 rounded-full border border-white/30">
                        <Text className="text-white text-[10px] font-bold">Mainnet</Text>
                    </View>
                </View>

                {/* Search Bar */}
                <View className="bg-white/10 rounded-2xl px-4 py-3 flex-row items-center border border-white/30">
                    <Ionicons name="search" size={20} color="white" />
                    <TextInput 
                        className="flex-1 ml-3 text-white text-sm"
                        placeholder="Search by plot ID, hash, or owner..."
                        placeholderTextColor="rgba(255,255,255,0.7)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        accessibilityLabel="Search transactions"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} accessibilityLabel="Clear search">
                            <Ionicons name="close-circle" size={20} color="white" />
                        </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>

            <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
                {/* Header with Sort */}
                <View className="flex-row items-center justify-between mb-6">
                    <Text className="text-gray-800 font-bold text-lg">Transaction History</Text>
                    <TouchableOpacity 
                        onPress={toggleSort}
                        className="flex-row items-center bg-white px-3 py-2 rounded-xl border border-gray-200"
                        accessibilityLabel={`Sort by ${sortBy === 'newest' ? 'oldest' : 'newest'}`}
                    >
                        <Text className="text-gray-600 text-xs mr-1">
                            {sortBy === 'newest' ? 'Newest' : 'Oldest'}
                        </Text>
                        <Ionicons name={sortBy === 'newest' ? 'arrow-down' : 'arrow-up'} size={14} color="#6B7280" />
                    </TouchableOpacity>
                </View>

                {/* Empty State */}
                {displayedBlocks.length === 0 ? (
                    <View className="items-center py-12">
                        <Ionicons name="search-outline" size={64} color="#9CA3AF" />
                        <Text className="text-gray-500 text-base mt-4 text-center">
                            {searchQuery ? 'No transactions match your search' : 'No transactions yet'}
                        </Text>
                        {searchQuery && (
                            <TouchableOpacity onPress={() => setSearchQuery('')} className="mt-4">
                                <Text className="text-[#125f43ff] text-sm font-semibold">Clear Search</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    <>
                        {/* Transaction List */}
                        {displayedBlocks.map((block) => {
                            const style = getTransactionStyle(block.type);
                            return (
                                <TouchableOpacity 
                                    key={block.id}
                                    onPress={() => viewTransaction(block.id)}
                                    className="bg-white p-5 rounded-2xl mb-4 border border-gray-100 shadow-sm"
                                    accessibilityLabel={`View ${block.type} transaction for ${block.plotId}`}
                                    activeOpacity={0.8}
                                >
                                    <View className="flex-row justify-between items-start mb-3">
                                        <View className="flex-row items-center">
                                            <View className={`w-8 h-8 rounded-lg items-center justify-center mr-3 ${style.bg}`}>
                                                <Ionicons name={style.icon} size={18} color={style.color} />
                                            </View>
                                            <View>
                                                <Text className="text-gray-900 font-bold text-sm">{block.type}</Text>
                                                <Text className="text-gray-400 text-[10px] font-mono">{block.hash}</Text>
                                            </View>
                                        </View>
                                        <View className="items-end">
                                            <Text className="text-gray-400 text-[10px] mb-1">
                                                {formatTimestamp(block.timestamp)}
                                            </Text>
                                            <View className="bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                                <Text className="text-green-700 text-[9px] font-bold">CONFIRMED</Text>
                                            </View>
                                        </View>
                                    </View>
                                    
                                    {/* Transaction Details Preview */}
                                    <View className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <Text className="text-gray-600 text-[11px] leading-4">{block.details}</Text>
                                        {block.plotId && (
                                            <Text className="text-[#125f43ff] text-[10px] font-semibold mt-1">
                                                Plot: {block.plotId}
                                            </Text>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}

                        {/* Load More */}
                        {visibleCount < sortedBlocks.length && (
                            <TouchableOpacity 
                                onPress={() => setVisibleCount(prev => prev + 4)}
                                className="py-4 items-center border-2 border-dashed border-[#125f43ff]/30 rounded-xl mt-2"
                                accessibilityLabel="Load more transactions"
                            >
                                <Text className="text-[#125f43ff] text-sm font-semibold">Load More Transactions</Text>
                                <Ionicons name="arrow-down" size={16} color="#125f43ff" />
                            </TouchableOpacity>
                        )}
                    </>
                )}

                {/* Bottom Spacing */}
                <View className="h-20" />
            </ScrollView>
        </View>
    );
}