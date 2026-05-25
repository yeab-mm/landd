import React from 'react';
import { View, Text } from 'react-native';
import { FileUploadField } from '../../../components/forms/FileUploadField';

interface AcquisitionDocumentsSectionProps {
  acquisitionType: string;
  documents: any;
  onUpload: (path: string) => void;
}

export const AcquisitionDocumentsSection: React.FC<AcquisitionDocumentsSectionProps> = ({
  acquisitionType,
  documents,
  onUpload,
}) => {
  return (
    <View className="w-full">
      <Text className="text-gray-800 text-lg font-bold mb-4">Acquisition Documents</Text>
      
      {acquisitionType === 'allocation' && (
        <View>
          <FileUploadField
            label="Allocation Letter"
            file={documents.allocationLetter}
            onUpload={() => onUpload('acquisitionDocuments.allocationLetter')}
            required
            desc="Official letter from land administration"
          />
          <FileUploadField
            label="Government Approval"
            file={documents.governmentApproval}
            onUpload={() => onUpload('acquisitionDocuments.governmentApproval')}
            required
          />
          <FileUploadField
            label="Payment Receipt"
            file={documents.allocationPaymentReceipt}
            onUpload={() => onUpload('acquisitionDocuments.allocationPaymentReceipt')}
            required
          />
        </View>
      )}

      {acquisitionType === 'bidding' && (
        <View>
          <FileUploadField
            label="Bidding Win Certificate"
            file={documents.biddingWinCertificate}
            onUpload={() => onUpload('acquisitionDocuments.biddingWinCertificate')}
            required
          />
          <FileUploadField
            label="Payment Receipt (Lease/Purchase)"
            file={documents.biddingPaymentReceipt}
            onUpload={() => onUpload('acquisitionDocuments.biddingPaymentReceipt')}
            required
          />
          <FileUploadField
            label="Auction Announcement/Document"
            file={documents.auctionAnnouncement}
            onUpload={() => onUpload('acquisitionDocuments.auctionAnnouncement')}
          />
        </View>
      )}

      {acquisitionType === 'inheritance' && (
        <View>
          <FileUploadField
            label="Death Certificate"
            file={documents.deathCertificate}
            onUpload={() => onUpload('acquisitionDocuments.deathCertificate')}
            required
          />
          <FileUploadField
            label="Court Inheritance Document"
            file={documents.inheritanceCourtDocument}
            onUpload={() => onUpload('acquisitionDocuments.inheritanceCourtDocument')}
            required
          />
          <FileUploadField
            label="Family Agreement"
            file={documents.familyAgreement}
            onUpload={() => onUpload('acquisitionDocuments.familyAgreement')}
          />
        </View>
      )}

      {acquisitionType === 'gift' && (
        <View>
          <FileUploadField
            label="Gift/Donation Agreement"
            file={documents.giftAgreement}
            onUpload={() => onUpload('acquisitionDocuments.giftAgreement')}
            required
          />
          <FileUploadField
            label="Donor Ownership Certificate"
            file={documents.donorOwnershipCertificate}
            onUpload={() => onUpload('acquisitionDocuments.donorOwnershipCertificate')}
            required
          />
          <FileUploadField
            label="Donor ID Copy"
            file={documents.donorIdCopy}
            onUpload={() => onUpload('acquisitionDocuments.donorIdCopy')}
          />
        </View>
      )}

      {!acquisitionType && (
        <View className="p-10 items-center">
          <Text className="text-gray-400 text-center">Please select acquisition type in Section 1 to see required documents.</Text>
        </View>
      )}
    </View>
  );
};
