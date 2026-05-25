import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface TransferTypeSectionProps {
  value: string;
  onSelect: (value: string) => void;
}

const OPTIONS = [
  { value: 'sale', label: '💰 Sale/Purchase', desc: 'Land sold with payment' },
  { value: 'gift', label: '🎁 Gift/Donation', desc: 'Given as gift (no payment)' },
  { value: 'inheritance', label: '👨‍👩‍👧‍👦 Inheritance', desc: 'Received from deceased owner' },
  { value: 'exchange', label: '🔄 Exchange', desc: 'Swap with another plot' },
  { value: 'court', label: '⚖️ Court Order', desc: 'Transfer by legal decision' },
  { value: 'government', label: '🏛️ Government Acquisition', desc: 'Government takes land' },
];

export const TransferTypeSection: React.FC<TransferTypeSectionProps> = ({ value, onSelect }) => (
  <View className="w-full">
    <Text className="text-gray-700 text-sm font-semibold mb-4 text-center">
      What type of transfer is this? *
    </Text>
    <View className="space-y-3">
      {OPTIONS.map((option) => (
        <TouchableOpacity
          key={option.value}
          onPress={() => onSelect(option.value)}
          className={`p-4 rounded-xl border-2 mb-3 ${
            value === option.value
              ? 'bg-primary border-primary'
              : 'bg-white border-gray-200'
          }`}
          activeOpacity={0.7}
        >
          <Text
            className={`text-base font-bold ${
              value === option.value ? 'text-white' : 'text-gray-800'
            }`}
          >
            {option.label}
          </Text>
          <Text
            className={`text-sm ${
              value === option.value ? 'text-white/80' : 'text-gray-500'
            }`}
          >
            {option.desc}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);
