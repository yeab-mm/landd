import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface AcquisitionTypeSectionProps {
  value: string;
  onSelect: (value: string) => void;
}

export const AcquisitionTypeSection: React.FC<AcquisitionTypeSectionProps> = ({
  value,
  onSelect,
}) => {
  const options = [
    { value: 'allocation', label: '🏛️ Government Allocation', desc: 'Land given by government' },
    { value: 'bidding', label: '🔨 Government Bidding/Auction', desc: 'Purchased through auction' },
    { value: 'inheritance', label: '📜 Inheritance', desc: 'Land passed down from family' },
    { value: 'gift', label: '🎁 Gift/Donation', desc: 'Land given as a gift' },
  ];

  return (
    <View className="w-full">
      <Text className="text-gray-700 text-sm font-semibold mb-4 text-center">How did you acquire this land? *</Text>
      <View>
        {options.map((option) => (
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
};
