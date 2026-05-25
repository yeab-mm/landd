import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../../components/ui/Input';
import { FileUploadField } from '../../../components/forms/FileUploadField';

interface RegistrationStatusSectionProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onUpload: (path: string) => void;
}

export const RegistrationStatusSection: React.FC<RegistrationStatusSectionProps> = ({
  formData,
  setFormData,
  onUpload,
}) => {
  const options = [
    { value: 'yes', label: 'Yes (Already has registration)', icon: 'checkmark-circle' },
    { value: 'no', label: 'No (First-time registration)', icon: 'document-text' },
  ];

  const updateLandInfo = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      landInfo: { ...prev.landInfo, [field]: value },
    }));
  };

  return (
    <View className="w-full">
      <Text className="text-gray-700 text-sm font-semibold mb-4 text-center">Is this land previously registered? *</Text>
      <View className="mb-4">
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => setFormData((prev: any) => ({ ...prev, isPreviouslyRegistered: option.value }))}
            className={`flex-row items-center p-4 rounded-xl border-2 mb-3 ${
              formData.isPreviouslyRegistered === option.value
                ? 'bg-primary border-primary'
                : 'bg-white border-gray-200'
            }`}
            activeOpacity={0.7}
          >
            <Ionicons
              name={option.icon as any}
              size={24}
              color={formData.isPreviouslyRegistered === option.value ? 'white' : '#9CA3AF'}
            />
            <Text
              className={`text-base font-semibold ml-3 ${
                formData.isPreviouslyRegistered === option.value ? 'text-white' : 'text-gray-800'
              }`}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {formData.isPreviouslyRegistered === 'yes' && (
        <View className="mt-2">
          <Input
            label="Previous Certificate Number"
            placeholder="CERT-2020-XXXXX"
            value={formData.landInfo.previousCertificateNumber}
            onChangeText={(text) => updateLandInfo('previousCertificateNumber', text)}
            required
          />
          
          <FileUploadField
            label="Previous Ownership Certificate"
            file={formData.landInfo.previousCertificate}
            onUpload={() => onUpload('landInfo.previousCertificate')}
            required
          />

          <Input
            label="Previous Owner Name"
            placeholder="Previous owner's full name"
            value={formData.landInfo.previousOwnerName}
            onChangeText={(text) => updateLandInfo('previousOwnerName', text)}
            required
          />

          <FileUploadField
            label="Transfer Document"
            file={formData.landInfo.transferDocument}
            onUpload={() => onUpload('landInfo.transferDocument')}
            required
            desc="Contract, court paper, etc."
          />
        </View>
      )}
    </View>
  );
};
