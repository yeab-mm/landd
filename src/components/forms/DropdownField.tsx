import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DropdownFieldProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
}

export const DropdownField: React.FC<DropdownFieldProps> = ({
  label,
  value,
  options,
  onSelect,
  placeholder,
  disabled = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View className="w-full mb-4">
      {label ? <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">{label}</Text> : null}
      <TouchableOpacity
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
        className={`flex-row items-center bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200 ${
          disabled ? 'opacity-50' : ''
        }`}
      >
        <Text
          numberOfLines={1}
          className={`flex-1 text-gray-800 text-base ${!value ? 'text-gray-400' : ''}`}
        >
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50"
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View className="bg-white rounded-t-3xl mt-auto max-h-[60%]">
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
              <Text className="text-lg font-bold text-gray-800">{label || 'Select Option'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
              {(options || []).map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => {
                    onSelect(option);
                    setModalVisible(false);
                  }}
                  className={`py-4 px-4 border-b border-gray-100 ${
                    value === option ? 'bg-primary/10' : ''
                  }`}
                >
                  <Text
                    className={`text-base ${
                      value === option ? 'text-primary font-semibold' : 'text-gray-800'
                    }`}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
