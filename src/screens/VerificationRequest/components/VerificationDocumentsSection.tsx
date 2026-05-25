import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FileUploadField } from '../../../components/forms/FileUploadField';

interface VerificationDocumentsSectionProps {
  documents: any;
  onUpload: (type: string) => void;
}

export const VerificationDocumentsSection: React.FC<VerificationDocumentsSectionProps> = ({
  documents,
  onUpload,
}) => {
  return (
    <View className="w-full">
      <FileUploadField
        label="Land Title Deed (Sened)"
        file={documents.titleDeed}
        onUpload={() => onUpload('titleDeed')}
        required
        desc="Upload a clear scan of the original deed"
      />

      <FileUploadField
        label="Survey Map / Plan"
        file={documents.surveyMap}
        onUpload={() => onUpload('surveyMap')}
        required
        desc="Recent stamp-verified survey plan"
      />

      <View className="mb-4">
        <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Owner ID Copy</Text>
        <View className="flex-row items-center bg-green-50 rounded-xl px-4 py-4 border border-green-200">
          <Ionicons name="checkmark-circle" size={24} color="#125f43" />
          <View className="ml-3 flex-1">
            <Text className="text-gray-700 text-sm font-semibold">Auto-filled from profile</Text>
            <Text className="text-gray-500 text-xs">National ID already verified</Text>
          </View>
        </View>
      </View>

      <View className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <View className="flex-row items-start">
          <Ionicons name="information-circle" size={20} color="#2563EB" />
          <Text className="text-blue-700 text-xs ml-2 flex-1">
            All documents must be clear, readable, and in PDF, JPEG, or PNG format. Maximum file size: 10MB per document.
          </Text>
        </View>
      </View>
    </View>
  );
};
