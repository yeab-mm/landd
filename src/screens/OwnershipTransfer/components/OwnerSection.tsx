import React from 'react';
import { View, Text } from 'react-native';
import { Input } from '../../../components/ui/Input';
import { FileUploadField } from '../../../components/forms/FileUploadField';
import { DropdownField } from '../../../components/forms/DropdownField';

interface OwnerSectionProps {
  type: 'current' | 'new';
  data: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onUpload: (field: string, size?: number) => void;
}

export const OwnerSection: React.FC<OwnerSectionProps> = ({
  type,
  data,
  setFormData,
  onUpload,
}) => {
  const isNew = type === 'new';
  const title = isNew ? 'New Owner (Transferee)' : 'Current Owner (Transferor)';

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [isNew ? 'newOwner' : 'currentOwner']: {
        ...prev[isNew ? 'newOwner' : 'currentOwner'],
        [field]: value,
      },
    }));
  };

  return (
    <View className="w-full">
      <Text className="text-gray-800 text-lg font-bold mb-4">{title}</Text>

      <Input
        label="Full Name"
        value={data.fullName}
        onChangeText={(text) => updateField('fullName', text)}
        placeholder={isNew ? "New owner's full name" : ""}
        required
      />

      <Input
        label="National ID (Fayda)"
        value={data.nationalId}
        onChangeText={(text) => updateField('nationalId', text)}
        placeholder="1234 5678 9012 3456"
        editable={!isNew} // Assuming current owner ID is pre-filled or fixed from login context
        required
      />

      <View className="flex-col">
        <FileUploadField
          label="Kebele ID (Front)"
          file={data.kebeleIdFront}
          onUpload={() => onUpload(`${type}Owner.kebeleIdFront`, 5)}
          required
          type="image"
        />
        <FileUploadField
          label="Kebele ID (Back)"
          file={data.kebeleIdBack}
          onUpload={() => onUpload(`${type}Owner.kebeleIdBack`, 5)}
          required
          type="image"
        />
      </View>

      {!isNew && (
        <FileUploadField
          label="Current Ownership Certificate"
          file={data.ownershipCertificate}
          onUpload={() => onUpload('currentOwner.ownershipCertificate')}
          required
        />
      )}

      {isNew && (
        <DropdownField
          label="Relationship to Current Owner"
          value={data.relationship}
          options={['Family Member', 'Friend', 'Business Partner', 'Stranger', 'Other']}
          onSelect={(value) => updateField('relationship', value)}
          placeholder="Select Relationship"
        />
      )}

      <Input
        label="Phone Number"
        value={data.phone}
        onChangeText={(text) => updateField('phone', text)}
        placeholder="+251 9XX XXX XXX"
        keyboardType="phone-pad"
        required
      />

      <Input
        label="Email Address"
        value={data.email}
        onChangeText={(text) => updateField('email', text)}
        placeholder="email@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        required
      />

      <Input
        label="Address"
        value={data.address}
        onChangeText={(text) => updateField('address', text)}
        placeholder={isNew ? "New owner's address" : ""}
        multiline
        required
      />
    </View>
  );
};
