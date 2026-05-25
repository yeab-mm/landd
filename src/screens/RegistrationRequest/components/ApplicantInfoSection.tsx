import React from 'react';
import { View, Text } from 'react-native';
import { Input } from '../../../components/ui/Input';
import { DropdownField } from '../../../components/forms/DropdownField';
import { FileUploadField } from '../../../components/forms/FileUploadField';

interface ApplicantInfoSectionProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onUpload: (path: string) => void;
}

export const ApplicantInfoSection: React.FC<ApplicantInfoSectionProps> = ({
  formData,
  setFormData,
  onUpload,
}) => {
  const applicantInfo = formData.applicantInfo;

  const updateInfo = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      applicantInfo: { ...prev.applicantInfo, [field]: value },
    }));
  };

  return (
    <View className="w-full">
      <Text className="text-gray-800 text-lg font-bold mb-4">Applicant Information</Text>

      <Input
        label="Full Name"
        value={applicantInfo.fullName}
        onChangeText={(text) => updateInfo('fullName', text)}
        required
      />

      <Input
        label="National ID (Fayda)"
        value={applicantInfo.nationalId}
        editable={false}
        helperText="Auto-filled from profile"
      />

      <View className="flex-row justify-between">
        <View className="w-[48%]">
          <FileUploadField
            label="ID Front"
            file={applicantInfo.kebeleIdFront}
            onUpload={() => onUpload('applicantInfo.kebeleIdFront')}
            required
          />
        </View>
        <View className="w-[48%]">
          <FileUploadField
            label="ID Back"
            file={applicantInfo.kebeleIdBack}
            onUpload={() => onUpload('applicantInfo.kebeleIdBack')}
            required
          />
        </View>
      </View>

      <FileUploadField
        label="Applicant Photo"
        file={applicantInfo.applicantPhoto}
        onUpload={() => onUpload('applicantInfo.applicantPhoto')}
        required
      />

      <DropdownField
        label="Marital Status"
        value={applicantInfo.maritalStatus}
        options={['Single', 'Married', 'Divorced', 'Widowed']}
        onSelect={(value) => updateInfo('maritalStatus', value.toLowerCase())}
        placeholder="Select Marital Status"
      />

      {applicantInfo.maritalStatus === 'married' && (
        <View className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <Text className="text-blue-800 font-bold mb-3">Spouse Information</Text>
          <Input
            label="Spouse Full Name"
            placeholder="Spouse name"
            value={applicantInfo.spouseName}
            onChangeText={(text) => updateInfo('spouseName', text)}
            required
            className="bg-white"
          />
          <Input
            label="Spouse National ID"
            placeholder="Fayda ID"
            value={applicantInfo.spouseNationalId}
            onChangeText={(text) => updateInfo('spouseNationalId', text)}
            required
            className="bg-white"
          />
        </View>
      )}

      <DropdownField
        label="Relationship to Land"
        value={applicantInfo.relationshipToLand}
        options={['Owner', 'Representative', 'Heir', 'Co-owner', 'Guardian']}
        onSelect={(value) => updateInfo('relationshipToLand', value.toLowerCase())}
        placeholder="Your relationship"
      />

      {applicantInfo.relationshipToLand === 'representative' && (
        <View className="mb-4 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
          <Text className="text-yellow-800 font-bold mb-3">Authorization Details</Text>
          <FileUploadField
            label="Power of Attorney Document"
            file={applicantInfo.authorizationDocument}
            onUpload={() => onUpload('applicantInfo.authorizationDocument')}
            required
            className="bg-white"
          />
        </View>
      )}

      <Input
        label="Phone Number"
        value={applicantInfo.phone}
        onChangeText={(text) => updateInfo('phone', text)}
        required
        keyboardType="phone-pad"
      />

      <Input
        label="Email Address"
        value={applicantInfo.email}
        onChangeText={(text) => updateInfo('email', text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
    </View>
  );
};
