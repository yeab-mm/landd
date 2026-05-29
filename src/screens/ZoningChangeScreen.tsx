import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { submitServiceRequest } from '../api/requests';
import { getRequiredDocs } from '../constants/documentRequirements';
import { pickDocument, missingRequiredDocs } from '../utils/documentUpload';
import type { PickedFile } from '../utils/documentUpload';
import { buildSimpleServicePayload } from '../utils/serviceRequestPayload';
import { RequiredDocUploadList } from '../components/forms/RequiredDocUploadList';
import { SubmitSuccessView } from '../components/forms/SubmitSuccessView';
import { CITIZEN_PRIMARY, CITIZEN_PRIMARY_LIGHT } from '../theme/citizenTheme';

type RootStackParamList = {
  ZoningChange: undefined;
  MainApp: undefined;
  RequestDetail: { referenceNumber: string };
};

const REQUIRED = getRequiredDocs('Zoning Change');
const ZONES = ['Residential', 'Commercial', 'Industrial', 'Agricultural', 'Institutional'];

export default function ZoningChangeScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { token } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<{ referenceNumber: string } | null>(null);

  const [formData, setFormData] = useState({
    landId: '',
    targetZone: '',
    justification: '',
    impactLevel: 'Low',
    documents: {} as Record<string, PickedFile | null>,
  });

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return !!formData.landId.trim();
      case 2:
        return !!formData.targetZone;
      case 3:
        return !!formData.justification.trim() && REQUIRED.every((d) => formData.documents[d]?.uri);
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handlePickDoc = async (label: string) => {
    const file = await pickDocument();
    if (!file) return;
    setFormData((prev) => ({ ...prev, documents: { ...prev.documents, [label]: file } }));
  };

  const handleSubmit = async () => {
    if (!token) {
      Alert.alert('Login required', 'Please sign in to submit.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = await buildSimpleServicePayload('Zoning Change', {
        plotNumber: formData.landId.trim(),
        landUseType: formData.targetZone,
        documents: formData.documents,
        extra: {
          targetZone: formData.targetZone,
          justification: formData.justification,
          impactLevel: formData.impactLevel,
        },
      });
      const missing = missingRequiredDocs(REQUIRED, payload.documents);
      if (missing.length) {
        Alert.alert('Missing documents', missing.join(', '));
        return;
      }
      const data = await submitServiceRequest(token, 'Zoning Change', payload);
      setSubmittedRequest({ referenceNumber: data.request.referenceNumber });
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedRequest) {
    return (
      <SubmitSuccessView
        title="Zoning change submitted"
        subtitle="Your zoning change request was received."
        referenceNumber={submittedRequest.referenceNumber}
        onTrack={() =>
          navigation.navigate('RequestDetail', { referenceNumber: submittedRequest.referenceNumber })
        }
        onHome={() => navigation.navigate('MainApp')}
      />
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor={CITIZEN_PRIMARY} />
      <LinearGradient colors={[CITIZEN_PRIMARY, CITIZEN_PRIMARY_LIGHT]} className="px-6 pt-12 pb-6 rounded-b-[32px]">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3">
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Zoning change</Text>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 40 }}>
        {currentStep === 1 && (
          <TextInput
            className="bg-white p-4 rounded-xl border border-gray-200"
            placeholder="Plot number"
            value={formData.landId}
            onChangeText={(t) => setFormData({ ...formData, landId: t })}
          />
        )}
        {currentStep === 2 && (
          <View className="flex-row flex-wrap gap-2">
            {ZONES.map((zone) => (
              <TouchableOpacity
                key={zone}
                onPress={() => setFormData({ ...formData, targetZone: zone })}
                className="px-4 py-2 rounded-full border"
                style={{
                  backgroundColor: formData.targetZone === zone ? CITIZEN_PRIMARY : '#fff',
                  borderColor: formData.targetZone === zone ? CITIZEN_PRIMARY : '#e5e7eb',
                }}
              >
                <Text className={formData.targetZone === zone ? 'text-white font-bold' : 'text-gray-700'}>{zone}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {currentStep === 3 && (
          <View>
            <TextInput
              className="bg-white p-4 rounded-xl border border-gray-200 h-32 mb-4"
              placeholder="Justification for rezoning..."
              multiline
              value={formData.justification}
              onChangeText={(t) => setFormData({ ...formData, justification: t })}
            />
            <RequiredDocUploadList required={REQUIRED} documents={formData.documents} onPick={handlePickDoc} />
          </View>
        )}
        {currentStep === 4 && (
          <View className="bg-white p-4 rounded-2xl">
            <Text className="font-bold">{formData.landId}</Text>
            <Text className="text-gray-600 mt-1">New zone: {formData.targetZone}</Text>
          </View>
        )}

        <View className="flex-row gap-3 mt-10">
          {currentStep > 1 && (
            <TouchableOpacity onPress={() => setCurrentStep((s) => s - 1)} className="flex-1 bg-gray-200 py-4 rounded-2xl items-center">
              <Text className="font-bold text-gray-700">Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() =>
              currentStep === 4
                ? handleSubmit()
                : isStepValid(currentStep)
                  ? setCurrentStep((s) => s + 1)
                  : Alert.alert('Incomplete', 'Fill required fields and upload all documents')
            }
            disabled={submitting}
            className="flex-[2] py-4 rounded-2xl items-center"
            style={{ backgroundColor: CITIZEN_PRIMARY }}
          >
            {submitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">{currentStep === 4 ? 'Submit for review' : 'Continue'}</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
