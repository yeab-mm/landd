import React, { useState, useEffect, useCallback } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../api/config';
import { isPendingStatus } from '../api/requests';
import {
  CitizenScreen,
  EmptyState,
  ListCard,
  PrimaryFAB,
  StatRow,
} from '../components/citizen/CitizenUI';

type RootStackParamList = {
  MyRequests: undefined;
  RequestDetail: { referenceNumber: string };
  RegistrationRequest: undefined;
  VerificationRequest: undefined;
};

function statusTone(status: string): 'green' | 'yellow' | 'blue' | 'red' | 'gray' {
  const s = status.toLowerCase();
  if (s.includes('approv')) return 'green';
  if (s.includes('reject')) return 'red';
  if (s.includes('pending') || s.includes('review')) return 'yellow';
  return 'blue';
}

export default function MyRequestsScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setRequests(data.requests || []);
    } catch (e) {
      console.error('Requests load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const pending = requests.filter((r) => isPendingStatus(r.status)).length;

  return (
    <CitizenScreen
      title="My Requests"
      subtitle="Track your applications"
      showBack
      loading={loading && requests.length === 0}
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        load();
      }}
      headerStat={{ label: 'Total requests', value: requests.length }}
    >
      {requests.length > 0 ? (
        <StatRow
          items={[
            { label: 'All', value: requests.length },
            { label: 'Pending', value: pending },
            { label: 'Done', value: requests.length - pending },
          ]}
        />
      ) : null}

      {requests.length === 0 ? (
        <EmptyState
          icon="document-text-outline"
          title="No requests yet"
          message="Start a verification, registration, or transfer application to track progress here."
          actionLabel="New verification"
          onAction={() => navigation.navigate('VerificationRequest')}
        />
      ) : (
        requests.map((req) => (
          <ListCard
            key={req.id}
            icon="document-text"
            title={req.type || 'Land request'}
            subtitle={req.referenceNumber}
            meta={new Date(req.createdAt).toLocaleDateString()}
            badge={req.status}
            badgeTone={statusTone(req.status)}
            onPress={() =>
              navigation.navigate('RequestDetail', { referenceNumber: req.referenceNumber })
            }
          />
        ))
      )}

      <PrimaryFAB
        label="New request"
        icon="add"
        onPress={() => navigation.navigate('VerificationRequest')}
      />
    </CitizenScreen>
  );
}
