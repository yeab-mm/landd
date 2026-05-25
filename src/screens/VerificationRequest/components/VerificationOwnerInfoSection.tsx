import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../../components/ui/Input';

interface VerificationOwnerInfoSectionProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export const VerificationOwnerInfoSection: React.FC<VerificationOwnerInfoSectionProps> = ({
  formData,
  setFormData,
}) => {
  return (
    <View className="w-full">
      <Input
        label="Owner Name"
        value={formData.ownerName}
        onChangeText={(text) => setFormData((prev: any) => ({ ...prev, ownerName: text }))}
        placeholder="Owner's full name"
        required
      />

      <View className="mb-4">
        <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">National ID (Fayda) *</Text>
        <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200">
          <Ionicons name="card" size={22} color="#9CA3AF" />
          <Text className="flex-1 text-gray-800 text-base ml-3">
            {formData.ownerNationalId}
          </Text>
          <Ionicons name="checkmark-circle" size={22} color="#125f43" />
        </View>
        <Text className="text-gray-500 text-xs mt-1 ml-1">✓ Verified from profile</Text>
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Relationship to Land *</Text>
        <View className="flex-row flex-wrap">
          {['Owner', 'Heir', 'Legal Agent', 'Co-owner'].map((rel) => (
            <TouchableOpacity
              key={rel}
              onPress={() => setFormData((prev: any) => ({ ...prev, relationship: rel }))}
              className={`px-4 py-2 rounded-xl mr-2 mb-2 border-2 ${
                formData.relationship === rel
                  ? 'bg-primary border-primary'
                  : 'bg-white border-gray-200'
              }`}
              activeOpacity={0.7}
            >
              <Text
                className={`text-sm font-semibold ${
                  formData.relationship === rel ? 'text-white' : 'text-gray-700'
                }`}
              >
                {rel}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};
