import React from 'react';
import {
  CitizenScreen,
  ListCard,
  SectionHeader,
  InfoBanner,
} from '../components/citizen/CitizenUI';

const documents = [
  { id: '1', title: 'Ownership Certificate', type: 'PDF', date: 'Mar 15, 2024', plotNumber: 'BDU-2024-001' },
  { id: '2', title: 'Land Registration', type: 'PDF', date: 'Feb 20, 2024', plotNumber: 'BDU-2023-089' },
  { id: '3', title: 'Transfer Agreement', type: 'PDF', date: 'Jan 10, 2024', plotNumber: 'BDU-2022-156' },
  { id: '4', title: 'Tax Clearance', type: 'PDF', date: 'Dec 5, 2023', plotNumber: 'BDU-2024-001' },
];

export default function MyDocumentsScreen() {
  return (
    <CitizenScreen
      title="My Documents"
      subtitle="Certificates & official files"
      headerStat={{ label: 'Stored documents', value: documents.length }}
    >
      <InfoBanner
        title="Government-verified vault"
        message="Download and share official land documents securely."
      />

      <SectionHeader title="Your files" />

      {documents.map((doc) => (
        <ListCard
          key={doc.id}
          icon="document-text"
          title={doc.title}
          subtitle={doc.plotNumber}
          meta={`${doc.type} · ${doc.date}`}
          badge="PDF"
          badgeTone="red"
          rightIcon="download-outline"
          onPress={() => {}}
        />
      ))}
    </CitizenScreen>
  );
}
