import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FileUploadField } from '../../../components/forms/FileUploadField';

interface DocumentsSectionProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onUpload: (field: string, size?: number) => void;
}

export const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  formData,
  setFormData,
  onUpload,
}) => {
  const { transferType, documents } = formData;

  if (!transferType) {
    return (
      <View className="items-center py-12">
        <Ionicons name="alert-circle-outline" size={64} color="#9CA3AF" />
        <Text className="text-gray-500 text-base mt-4 text-center">
          Please select transfer type first
        </Text>
      </View>
    );
  }

  const renderWitnesses = () => (
    <View className="mb-4">
      <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">
        Witness Statements (2 Minimum) *
      </Text>
      <Text className="text-gray-500 text-xs mb-3 ml-1">
        Each witness must provide ID copy and phone number
      </Text>

      {(documents.witnesses || []).map((witness: any, index: number) => (
        <View key={index} className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <Text className="text-gray-700 text-sm font-semibold mb-3">Witness {index + 1}</Text>
          <TextInput
            className="bg-white rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800 mb-3"
            placeholder="Witness Full Name *"
            placeholderTextColor="#9CA3AF"
            value={witness.name}
            onChangeText={(text) => {
              const newWitnesses = [...documents.witnesses];
              newWitnesses[index] = { ...newWitnesses[index], name: text };
              setFormData((prev: any) => ({
                ...prev,
                documents: { ...prev.documents, witnesses: newWitnesses },
              }));
            }}
          />
          <TextInput
            className="bg-white rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800 mb-3"
            placeholder="Witness Phone Number *"
            placeholderTextColor="#9CA3AF"
            value={witness.phone}
            onChangeText={(text) => {
              const newWitnesses = [...documents.witnesses];
              newWitnesses[index] = { ...newWitnesses[index], phone: text };
              setFormData((prev: any) => ({
                ...prev,
                documents: { ...prev.documents, witnesses: newWitnesses },
              }));
            }}
            keyboardType="phone-pad"
          />
          <FileUploadField
            label="Witness ID Copy"
            file={witness.idCopy}
            onUpload={() => onUpload(`documents.witnesses[${index}].idCopy`, 5)}
            required
            type="document"
          />
          <FileUploadField
            label="Witness Statement"
            file={witness.statement}
            onUpload={() => onUpload(`documents.witnesses[${index}].statement`)}
            required
            type="document"
          />
        </View>
      ))}

      <TouchableOpacity
        onPress={() => {
          if (documents.witnesses.length < 4) {
            setFormData((prev: any) => ({
              ...prev,
              documents: {
                ...prev.documents,
                witnesses: [
                  ...prev.documents.witnesses,
                  { name: '', phone: '', idCopy: null, statement: null },
                ],
              },
            }));
          }
        }}
        disabled={documents.witnesses.length >= 4}
        className={`flex-row items-center justify-center py-3 rounded-xl border-2 border-dashed ${
          documents.witnesses.length >= 4 ? 'border-gray-300' : 'border-primary'
        }`}
      >
        <Ionicons
          name="add-circle"
          size={20}
          color={documents.witnesses.length >= 4 ? '#9CA3AF' : '#125f43'}
        />
        <Text
          className={`text-sm font-semibold ml-2 ${
            documents.witnesses.length >= 4 ? 'text-gray-400' : 'text-primary'
          }`}
        >
          {documents.witnesses.length >= 4 ? 'Maximum 4 witnesses' : 'Add Another Witness'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="w-full">
      <Text className="text-gray-800 text-lg font-bold mb-4">Supporting Documents</Text>
      <Text className="text-gray-600 text-sm mb-4">
        Based on your selection: <Text className="font-semibold text-primary">{transferType}</Text>
      </Text>

      <View className="mb-6">
        <Text className="text-gray-800 text-base font-semibold mb-3">Required for All Transfers</Text>
        <FileUploadField
          label="Current Ownership Certificate"
          file={documents.currentOwnershipCertificate}
          onUpload={() => onUpload('documents.currentOwnershipCertificate')}
          required
        />
        <FileUploadField
          label="Current Owner ID Copy"
          file={documents.currentOwnerIdCopy}
          onUpload={() => onUpload('documents.currentOwnerIdCopy')}
          required
        />
        <FileUploadField
          label="New Owner ID Copy"
          file={documents.newOwnerIdCopy}
          onUpload={() => onUpload('documents.newOwnerIdCopy')}
          required
        />
      </View>

      {/* Conditional Document Sections */}
      {transferType === 'sale' && (
        <View className="mb-6">
          <Text className="text-gray-800 text-base font-semibold mb-3">Sale/Purchase Documents</Text>
          <FileUploadField
            label="Sale Contract/Agreement"
            file={documents.saleContract}
            onUpload={() => onUpload('documents.saleContract')}
            required
          />
          <FileUploadField
            label="Payment Receipt/Proof"
            file={documents.paymentReceipt}
            onUpload={() => onUpload('documents.paymentReceipt')}
            required
          />
          <FileUploadField
            label="Tax Clearance Certificate"
            file={documents.taxClearance}
            onUpload={() => onUpload('documents.taxClearance')}
            required
          />
        </View>
      )}

      {transferType === 'gift' && (
        <View className="mb-6">
          <Text className="text-gray-800 text-base font-semibold mb-3">Gift/Donation Documents</Text>
          <FileUploadField
            label="Gift Agreement Document"
            file={documents.giftAgreement}
            onUpload={() => onUpload('documents.giftAgreement')}
            required
          />
          <FileUploadField
            label="Family Relationship Proof"
            file={documents.relationshipProof}
            onUpload={() => onUpload('documents.relationshipProof')}
            required
          />
        </View>
      )}

      {transferType === 'inheritance' && (
        <View className="mb-6">
          <Text className="text-gray-800 text-base font-semibold mb-3">Inheritance Documents</Text>
          <FileUploadField
            label="Death Certificate"
            file={documents.deathCertificate}
            onUpload={() => onUpload('documents.deathCertificate')}
            required
          />
          <FileUploadField
            label="Inheritance Court Document"
            file={documents.inheritanceCourtDocument}
            onUpload={() => onUpload('documents.inheritanceCourtDocument')}
            required
          />
          <FileUploadField
            label="Family Agreement Document"
            file={documents.familyAgreement}
            onUpload={() => onUpload('documents.familyAgreement')}
            required
          />
          <FileUploadField
            label="Heir List (all family members)"
            file={documents.heirList}
            onUpload={() => onUpload('documents.heirList')}
            required
          />
        </View>
      )}

      {renderWitnesses()}
    </View>
  );
};
