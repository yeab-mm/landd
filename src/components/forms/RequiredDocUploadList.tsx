import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CITIZEN_PRIMARY } from '../../theme/citizenTheme';
import type { PickedFile } from '../../utils/documentUpload';

type Props = {
  required: string[];
  documents: Record<string, PickedFile | null>;
  onPick: (label: string) => void;
};

export function RequiredDocUploadList({ required, documents, onPick }: Props) {
  return (
    <View className="gap-3">
      {required.map((label) => {
        const file = documents[label];
        const uploaded = Boolean(file?.uri);
        return (
          <TouchableOpacity
            key={label}
            onPress={() => onPick(label)}
            className="bg-white p-4 rounded-2xl border-2 border-dashed flex-row items-center"
            style={{
              borderColor: uploaded ? CITIZEN_PRIMARY : '#e5e7eb',
              backgroundColor: uploaded ? `${CITIZEN_PRIMARY}08` : '#fff',
            }}
          >
            <View
              className="w-11 h-11 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: uploaded ? `${CITIZEN_PRIMARY}18` : '#f3f4f6' }}
            >
              <Ionicons
                name={uploaded ? 'checkmark-circle' : 'cloud-upload-outline'}
                size={24}
                color={uploaded ? CITIZEN_PRIMARY : '#9CA3AF'}
              />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-bold text-sm">{label}</Text>
              <Text className="text-gray-500 text-xs mt-0.5">
                {uploaded ? file?.name || 'Uploaded' : 'Tap to upload PDF or image'}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
