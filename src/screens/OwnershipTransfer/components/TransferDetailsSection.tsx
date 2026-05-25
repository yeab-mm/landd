import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../../components/ui/Input';
import { DropdownField } from '../../../components/forms/DropdownField';

interface TransferDetailsSectionProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  taxInfo: any;
}

export const TransferDetailsSection: React.FC<TransferDetailsSectionProps> = ({
  formData,
  setFormData,
  taxInfo,
}) => {
  const details = formData.transferDetails;
  const transferPrice = parseFloat(details.transferPrice) || 0;

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      transferDetails: { ...prev.transferDetails, [field]: value },
    }));
  };

  return (
    <View className="w-full">
      <Text className="text-gray-800 text-lg font-bold mb-4">Transfer Details</Text>

      <Input
        label="Transfer Date"
        placeholder="YYYY-MM-DD"
        value={details.transferDate}
        onChangeText={(text) => updateField('transferDate', text)}
        required
      />

      {formData.transferType === 'sale' && (
        <View className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <Text className="text-blue-800 text-sm font-semibold mb-3">Sale Information</Text>

          <Input
            label="Transfer Price (ETB)"
            placeholder="500000"
            value={details.transferPrice}
            onChangeText={(text) => updateField('transferPrice', text)}
            keyboardType="numeric"
            containerClassName="mb-3"
            className="bg-white"
            required
          />

          {transferPrice > 0 && (
            <View className="mb-3 p-4 bg-green-50 rounded-xl border border-green-200">
              <Text className="text-green-800 text-sm font-semibold mb-2">📊 Tax Calculation</Text>
              <View className="space-y-1">
                <View className="flex-row justify-between">
                  <Text className="text-green-700 text-sm">Transfer Price:</Text>
                  <Text className="text-green-800 text-sm font-bold">
                    {transferPrice.toLocaleString()} ETB
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-green-700 text-sm">Land Use Type:</Text>
                  <Text className="text-green-800 text-sm font-bold">{taxInfo.landUse}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-green-700 text-sm">Tax Rate:</Text>
                  <Text className="text-green-800 text-sm font-bold">{taxInfo.taxRate}%</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-green-700 text-sm">Tax Amount:</Text>
                  <Text className="text-green-800 text-sm font-bold">
                    {parseFloat(taxInfo.taxAmount).toLocaleString()} ETB
                  </Text>
                </View>
                <View className="border-t border-green-300 pt-2 mt-2">
                  <View className="flex-row justify-between">
                    <Text className="text-green-800 text-base font-bold">Total (Price + Tax):</Text>
                    <Text className="text-green-900 text-base font-bold">
                      {parseFloat(taxInfo.totalAmount).toLocaleString()} ETB
                    </Text>
                  </View>
                </View>
              </View>

              <View className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <View className="flex-row items-start">
                  <Ionicons name="information-circle" size={16} color="#F59E0B" />
                  <Text className="text-yellow-800 text-xs ml-2">
                    {taxInfo.taxRate === 22
                      ? 'Commercial/Trading land is subject to 22% transfer tax as per Ethiopian tax law.'
                      : 'Non-commercial/Residential land is subject to 5% transfer tax as per Ethiopian tax law.'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          <DropdownField
            label="Payment Method"
            value={details.paymentMethod}
            options={['Cash', 'Bank Transfer', 'Check']}
            onSelect={(value) => updateField('paymentMethod', value)}
            placeholder="Select Payment Method"
          />

          {details.paymentMethod && (
            <>
              <Input
                label="Bank Name"
                placeholder="Bank of Abyssinia, CBE, etc."
                value={details.bankName}
                onChangeText={(text) => updateField('bankName', text)}
                containerClassName="mb-3"
                className="bg-white"
              />
              <Input
                label="Transaction Reference"
                placeholder="Transaction ID or Check Number"
                value={details.transactionRef}
                onChangeText={(text) => updateField('transactionRef', text)}
                containerClassName="mb-3"
                className="bg-white"
              />
            </>
          )}
        </View>
      )}

      <Input
        label="Reason for Transfer"
        placeholder="Why are you transferring ownership?"
        value={details.reason}
        onChangeText={(text) => updateField('reason', text)}
        multiline
        numberOfLines={3}
        required
      />

      <Input
        label="Effective Date"
        placeholder="YYYY-MM-DD (when transfer takes effect)"
        value={details.effectiveDate}
        onChangeText={(text) => updateField('effectiveDate', text)}
        required
      />
    </View>
  );
};
