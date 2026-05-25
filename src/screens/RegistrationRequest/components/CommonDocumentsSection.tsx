import React from 'react';
import { View, Text } from 'react-native';
import { FileUploadField } from '../../../components/forms/FileUploadField';
import { Input } from '../../../components/ui/Input';

interface CommonDocumentsSectionProps {
  documents: any;
  onUpload: (path: string) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export const CommonDocumentsSection: React.FC<CommonDocumentsSectionProps> = ({
  documents,
  onUpload,
  setFormData,
}) => {
  const updateWitness = (index: number, field: string, value: any) => {
    setFormData((prev: any) => {
      const witnesses = [...prev.commonDocuments.witnesses];
      witnesses[index] = { ...witnesses[index], [field]: value };
      return {
        ...prev,
        commonDocuments: { ...prev.commonDocuments, witnesses },
      };
    });
  };

  return (
    <View className="w-full">
      <Text className="text-gray-800 text-lg font-bold mb-4">Supporting Visuals & Witnesses</Text>

      <FileUploadField
        label="Official Survey Map / Site Plan"
        file={documents.surveyMap}
        onUpload={() => onUpload('commonDocuments.surveyMap')}
        required
        desc="Stamp-verified document from local office"
      />

      <View className="mt-4 mb-2">
        <Text className="text-gray-700 text-sm font-semibold mb-3">Field Photos (4 Directions)</Text>
        <View className="flex-row flex-wrap justify-between">
          {['North', 'South', 'East', 'West'].map((dir, idx) => (
            <View key={dir} className="w-[48%] mb-4">
              <FileUploadField
                label={`${dir} View`}
                file={documents.landPhotos[idx]}
                onUpload={() => onUpload(`commonDocuments.landPhotos.${idx}`)}
                required
              />
            </View>
          ))}
        </View>
      </View>

      <View className="mt-2">
        <Text className="text-gray-800 text-base font-bold mb-3">Witness Information</Text>
        {documents.witnesses.map((witness: any, idx: number) => (
          <View key={idx} className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <Text className="text-primary font-bold mb-3">Witness #{idx + 1}</Text>
            <Input
              label="Full Name"
              placeholder="Name"
              value={witness.name}
              onChangeText={(text) => updateWitness(idx, 'name', text)}
              required
              className="bg-white"
            />
            <Input
              label="Phone Number"
              placeholder="+251 ..."
              value={witness.phone}
              onChangeText={(text) => updateWitness(idx, 'phone', text)}
              required
              className="bg-white"
            />
            <FileUploadField
              label="Witness ID Copy"
              file={witness.idCopy}
              onUpload={() => onUpload(`commonDocuments.witnesses.${idx}.idCopy`)}
              required
              className="bg-white"
            />
          </View>
        ))}
      </View>
    </View>
  );
};
