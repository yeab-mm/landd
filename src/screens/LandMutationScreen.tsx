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
  LandMutation: undefined;
  MainApp: undefined;
  RequestDetail: { referenceNumber: string };
};

const REQUIRED = getRequiredDocs('Land Mutation');
const MUTATION_TYPES = ['Boundary correction', 'Name change', 'Area correction', 'Other'];

export default function LandMutationScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { token } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<{ referenceNumber: string } | null>(null);

  const [formData, setFormData] = useState({
    landId: '',
    mutationType: '',
    newDetails: '',
    documents: {} as Record<string, PickedFile | null>,
  });

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return !!formData.landId.trim();
      case 2:
        return !!formData.mutationType && !!formData.newDetails.trim();
      case 3:
        return REQUIRED.every((d) => formData.documents[d]?.uri);
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
      const payload = await buildSimpleServicePayload('Land Mutation', {
        plotNumber: formData.landId.trim(),
        documents: formData.documents,
        extra: { mutationType: formData.mutationType, newDetails: formData.newDetails },
      });
      const missing = missingRequiredDocs(REQUIRED, payload.documents);
      if (missing.length) {
        Alert.alert('Missing documents', missing.join(', '));
        return;
      }
      const data = await submitServiceRequest(token, 'Land Mutation', payload);
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
        title="Mutation submitted"
        subtitle="Your land mutation request was received."
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
          <Text className="text-white text-xl font-bold">Land mutation</Text>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 40 }}>
        {currentStep === 1 && (
          <View>
            <Text className="text-lg font-bold text-gray-900 mb-2">Plot number</Text>
            <TextInput
              className="bg-white p-4 rounded-xl border border-gray-200"
              placeholder="PLOT-2024-12345"
              value={formData.landId}
              onChangeText={(t) => setFormData({ ...formData, landId: t })}
            />
          </View>
        )}
        {currentStep === 2 && (
          <View>
            <Text className="text-sm font-bold text-gray-600 mb-2">Mutation type</Text>
            {MUTATION_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setFormData({ ...formData, mutationType: t })}
                className="p-3 mb-2 rounded-xl border"
                style={{
                  borderColor: formData.mutationType === t ? CITIZEN_PRIMARY : '#e5e7eb',
                  backgroundColor: formData.mutationType === t ? `${CITIZEN_PRIMARY}10` : '#fff',
                }}
              >
                <Text className="font-semibold text-gray-800">{t}</Text>
              </TouchableOpacity>
            ))}
            <TextInput
              className="bg-white p-4 rounded-xl border border-gray-200 h-28 mt-2"
              placeholder="Describe the requested change..."
              multiline
              value={formData.newDetails}
              onChangeText={(t) => setFormData({ ...formData, newDetails: t })}
            />
          </View>
        )}
        {currentStep === 3 && (
          <RequiredDocUploadList required={REQUIRED} documents={formData.documents} onPick={handlePickDoc} />
        )}
        {currentStep === 4 && (
          <View className="bg-white p-4 rounded-2xl border border-gray-100">
            <Text className="text-gray-500 text-xs">Plot</Text>
            <Text className="font-bold mb-2">{formData.landId}</Text>
            <Text className="text-gray-500 text-xs">Type</Text>
            <Text className="font-bold">{formData.mutationType}</Text>
          </View>
        )}

        <View className="flex-row gap-3 mt-10">
          {currentStep > 1 && (
            <TouchableOpacity onPress={() => setCurrentStep((s) => s - 1)} className="flex-1 bg-gray-200 py-4 rounded-2xl items-center">
              <Text className="font-bold text-gray-700">Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => (currentStep === 4 ? handleSubmit() : isStepValid(currentStep) ? setCurrentStep((s) => s + 1) : Alert.alert('Incomplete', 'Fill required fields'))}
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
