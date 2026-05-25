import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Input } from '../../../components/ui/Input';
import { DropdownField } from '../../../components/forms/DropdownField';

interface PurposeSectionProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export const PurposeSection: React.FC<PurposeSectionProps> = ({
  formData,
  setFormData,
}) => {
  return (
    <View className="w-full">
      <View className="mb-4">
        <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Verification Reason</Text>
        <View className="flex-row flex-wrap">
          {['Property Sale', 'Loan/Collateral', 'Inheritance', 'Dispute', 'Government Req', 'Other'].map((reason) => (
            <TouchableOpacity
              key={reason}
              onPress={() => setFormData((prev: any) => ({ ...prev, verificationReason: reason }))}
              className={`px-3 py-2 rounded-xl mr-2 mb-2 border-2 ${
                formData.verificationReason === reason
                  ? 'bg-primary border-primary'
                  : 'bg-white border-gray-200'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  formData.verificationReason === reason ? 'text-white' : 'text-gray-700'
                }`}
              >
                {reason}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Input
        label="Additional Notes (Optional)"
        placeholder="Provide any additional context or specific instructions..."
        value={formData.additionalNotes}
        onChangeText={(text) => setFormData((prev: any) => ({ ...prev, additionalNotes: text }))}
        multiline
        numberOfLines={3}
      />

      <View className="flex-row justify-between">
        <View className="w-[48%]">
          <DropdownField
            label="Urgency"
            value={formData.urgency}
            options={['Normal', 'Urgent', 'Emergency']}
            onSelect={(value) => setFormData((prev: any) => ({ ...prev, urgency: value }))}
            placeholder="Select Urgency"
          />
        </View>
        <View className="w-[48%]">
          <DropdownField
            label="Contact via"
            value={formData.contactPreference}
            options={['SMS', 'Email', 'Phone call']}
            onSelect={(value) => setFormData((prev: any) => ({ ...prev, contactPreference: value }))}
            placeholder="Select Channel"
          />
        </View>
      </View>
    </View>
  );
};
