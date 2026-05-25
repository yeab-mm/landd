import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FileUploadFieldProps {
  label: string;
  file: any;
  onUpload: () => void;
  required?: boolean;
  type?: 'document' | 'image';
  helperText?: string;
  className?: string;
}

export const FileUploadField: React.FC<FileUploadFieldProps> = ({
  label,
  file,
  onUpload,
  required = false,
  type = 'document',
  helperText,
  className = '',
}) => {
  const iconName = type === 'document' ? 'document-text' : 'image';
  const uploadIconName = type === 'document' ? 'cloud-upload' : 'camera';
  const defaultHelperText = type === 'document' 
    ? 'PDF, JPEG, PNG • Max 10MB' 
    : 'JPEG, PNG • Max 5MB';

  return (
    <View className={`mb-4 ${className}`}>
      <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">
        {label} {required && <Text className="text-red-500">*</Text>}
      </Text>
      <TouchableOpacity
        onPress={onUpload}
        className="flex-row items-center justify-between bg-gray-50 rounded-xl px-4 py-3.5 border-2 border-dashed border-gray-300"
        activeOpacity={0.7}
      >
        <View className="flex-row items-center flex-1">
          <Ionicons name={iconName} size={24} color="#9CA3AF" />
          <View className="ml-3 flex-1">
            <Text className="text-gray-700 text-sm font-semibold" numberOfLines={1}>
              {file ? `✓ ${file.name}` : `Upload ${type === 'document' ? 'Document' : 'Photo'}`}
            </Text>
            <Text className="text-gray-500 text-xs">{helperText || defaultHelperText}</Text>
          </View>
        </View>
        <Ionicons name={uploadIconName} size={24} color="#125f43" />
      </TouchableOpacity>
    </View>
  );
};
