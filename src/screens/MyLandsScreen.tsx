import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../api/config';
import {
  CitizenScreen,
  EmptyState,
  ListCard,
  PrimaryFAB,
  StatRow,
} from '../components/citizen/CitizenUI';

export default function MyLandsScreen({ navigation }: { navigation: any }) {
  const { token } = useAuth();
  const [lands, setLands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLands = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/lands`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setLands(data.lands || []);
    } catch (error) {
      console.error('Fetch lands error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchLands();
  }, [fetchLands]);

  const verified = lands.filter((l) => l.verified).length;

  return (
    <CitizenScreen
      title="My Lands"
      subtitle="Your registered properties"
      loading={loading}
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        fetchLands();
      }}
      headerStat={{ label: 'Total properties', value: lands.length }}
    >
      {lands.length > 0 ? (
        <StatRow
          items={[
            { label: 'Total', value: lands.length },
            { label: 'Verified', value: verified },
            { label: 'Pending', value: lands.length - verified },
          ]}
        />
      ) : null}

      {lands.length === 0 ? (
        <EmptyState
          icon="map-outline"
          title="No land registered yet"
          message="Register your plot to view ownership details, verification status, and official records in one place."
          actionLabel="Register new land"
          onAction={() => navigation.navigate('AddLandListing')}
        />
      ) : (
        lands.map((land) => (
          <ListCard
            key={land.id}
            icon="location"
            title={land.plotNumber}
            subtitle={`${land.region}, ${land.zone}`}
            meta={`${land.landSize} m²`}
            badge={land.verified ? 'Verified' : 'Pending'}
            badgeTone={land.verified ? 'green' : 'yellow'}
            onPress={() => navigation.navigate('AddLandListing')}
          />
        ))
      )}

      {lands.length > 0 ? (
        <PrimaryFAB
          label="Register new land"
          icon="add-circle"
          onPress={() => navigation.navigate('AddLandListing')}
        />
      ) : null}
    </CitizenScreen>
  );
}
