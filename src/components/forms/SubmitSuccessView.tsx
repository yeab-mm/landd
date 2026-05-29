import React from 'react';
import { View, Text, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../ui/Button';
import { WORKFLOW_SUCCESS_STEPS } from '../../utils/serviceRequestPayload';
import { CITIZEN_PRIMARY } from '../../theme/citizenTheme';

type Props = {
  title: string;
  subtitle: string;
  referenceNumber: string;
  steps?: string[];
  onTrack: () => void;
  onHome: () => void;
};

export function SubmitSuccessView({
  title,
  subtitle,
  referenceNumber,
  steps = WORKFLOW_SUCCESS_STEPS,
  onTrack,
  onHome,
}: Props) {
  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <View className="flex-1 items-center justify-center px-6">
        <View
          className="w-24 h-24 rounded-full items-center justify-center mb-6"
          style={{ backgroundColor: `${CITIZEN_PRIMARY}18` }}
        >
          <Ionicons name="checkmark-circle" size={60} color={CITIZEN_PRIMARY} />
        </View>
        <Text className="text-2xl font-bold text-gray-900 mb-2">{title}</Text>
        <Text className="text-gray-500 text-center mb-2">{subtitle}</Text>
        <Text className="text-center mb-8">
          <Text className="font-bold" style={{ color: CITIZEN_PRIMARY }}>
            {referenceNumber}
          </Text>
        </Text>

        <View
          className="p-6 rounded-3xl w-full mb-8 border"
          style={{ backgroundColor: `${CITIZEN_PRIMARY}08`, borderColor: `${CITIZEN_PRIMARY}25` }}
        >
          <Text className="font-bold mb-3 text-center" style={{ color: CITIZEN_PRIMARY }}>
            What happens next
          </Text>
          {steps.map((step, i) => (
            <View key={i} className="flex-row items-start mb-3">
              <View
                className="w-6 h-6 rounded-full items-center justify-center mr-3 mt-0.5"
                style={{ backgroundColor: `${CITIZEN_PRIMARY}22` }}
              >
                <Text className="text-xs font-bold" style={{ color: CITIZEN_PRIMARY }}>
                  {i + 1}
                </Text>
              </View>
              <Text className="text-gray-700 text-sm flex-1 leading-5">{step}</Text>
            </View>
          ))}
        </View>

        <View className="w-full gap-3">
          <Button title="Track request" onPress={onTrack} icon="search" />
          <Button title="Back" onPress={onHome} variant="outline" icon="arrow-back" />
        </View>
      </View>
    </View>
  );
}
