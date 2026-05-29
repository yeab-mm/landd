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
  LandSubdivision: undefined;
  MainApp: undefined;
  RequestDetail: { referenceNumber: string };
};

type LandSubdivisionScreenProp = StackNavigationProp<RootStackParamList, 'LandSubdivision'>;

const STEPS = ['Select Land', 'Subdivision', 'Documents', 'Review'];
const REQUIRED = getRequiredDocs('Land Subdivision');

export default function LandSubdivisionScreen() {
  const navigation = useNavigation<LandSubdivisionScreenProp>();
  const { token } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<{ referenceNumber: string } | null>(null);

  const [formData, setFormData] = useState({
    landId: '',
    units: '',
    purpose: '',
    documents: {} as Record<string, PickedFile | null>,
  });

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.landId.trim();
      case 2:
        return !!formData.units && parseInt(formData.units, 10) > 1 && !!formData.purpose.trim();
      case 3:
        return REQUIRED.every((d) => formData.documents[d]?.uri);
      case 4:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (!isStepValid(currentStep)) {
      Alert.alert('Incomplete', 'Please fill all required fields before continuing');
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handlePickDoc = async (label: string) => {
    const file = await pickDocument();
    if (!file) return;
    setFormData((prev) => ({
      ...prev,
      documents: { ...prev.documents, [label]: file },
    }));
  };

  const handleSubmit = async () => {
    if (!token) {
      Alert.alert('Login required', 'Please sign in to submit this service.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = await buildSimpleServicePayload('Land Subdivision', {
        plotNumber: formData.landId.replace(/\s*\(.*\)$/, '').trim() || formData.landId,
        landUseType: formData.purpose,
        landSize: parseInt(formData.units, 10) || 0,
        documents: formData.documents,
        extra: { units: formData.units, purpose: formData.purpose },
      });
      const missing = missingRequiredDocs(REQUIRED, payload.documents);
      if (missing.length > 0) {
        Alert.alert('Missing documents', `Please upload: ${missing.join(', ')}`);
        return;
      }
      const data = await submitServiceRequest(token, 'Land Subdivision', payload);
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
        title="Subdivision submitted"
        subtitle="Your land subdivision request was received."
        referenceNumber={submittedRequest.referenceNumber}
        onTrack={() =>
          navigation.navigate('RequestDetail', { referenceNumber: submittedRequest.referenceNumber })
        }
        onHome={() => navigation.navigate('MainApp')}
      />
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View>
            <Text className="text-gray-800 text-lg font-bold mb-1">Select parent parcel</Text>
            <Text className="text-gray-500 text-sm mb-4">Plot number of the land to subdivide.</Text>
            <TextInput
              className="bg-white p-4 rounded-xl border border-gray-200 text-gray-800 mb-3"
              placeholder="e.g. PLOT-2024-12345"
              value={formData.landId}
              onChangeText={(t) => setFormData({ ...formData, landId: t })}
            />
          </View>
        );
      case 2:
        return (
          <View>
            <Text className="text-gray-800 text-lg font-bold mb-4">Subdivision details</Text>
            <Text className="text-gray-600 text-xs font-bold uppercase mb-2">Number of sub-units *</Text>
            <TextInput
              className="bg-white p-4 rounded-xl border border-gray-200 text-gray-800 mb-4"
              placeholder="e.g. 4"
              keyboardType="numeric"
              value={formData.units}
              onChangeText={(t) => setFormData({ ...formData, units: t.replace(/[^0-9]/g, '') })}
            />
            <Text className="text-gray-600 text-xs font-bold uppercase mb-2">Purpose *</Text>
            <TextInput
              className="bg-white p-4 rounded-xl border border-gray-200 h-24 text-gray-800"
              placeholder="Describe the purpose..."
              multiline
              value={formData.purpose}
              onChangeText={(t) => setFormData({ ...formData, purpose: t })}
            />
          </View>
        );
      case 3:
        return (
          <View>
            <Text className="text-gray-800 text-lg font-bold mb-1">Required documents</Text>
            <Text className="text-gray-500 text-sm mb-4">
              Same review process as marketplace listings — admin then officer approval.
            </Text>
            <RequiredDocUploadList
              required={REQUIRED}
              documents={formData.documents}
              onPick={handlePickDoc}
            />
          </View>
        );
      case 4:
        return (
          <View>
            <Text className="text-gray-800 text-lg font-bold mb-4">Review</Text>
            <View className="bg-white p-4 rounded-2xl border border-gray-100">
              <Text className="text-gray-500 text-xs">Plot</Text>
              <Text className="text-gray-900 font-bold mb-2">{formData.landId || '—'}</Text>
              <Text className="text-gray-500 text-xs">Units</Text>
              <Text className="text-gray-900 font-bold mb-2">{formData.units || '—'}</Text>
              <Text className="text-gray-500 text-xs">Documents</Text>
              <Text className="font-bold" style={{ color: CITIZEN_PRIMARY }}>
                {REQUIRED.filter((d) => formData.documents[d]?.uri).length}/{REQUIRED.length} uploaded
              </Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor={CITIZEN_PRIMARY} />
      <LinearGradient
        colors={[CITIZEN_PRIMARY, CITIZEN_PRIMARY_LIGHT]}
        className="px-6 pt-12 pb-6 rounded-b-[32px]"
      >
        <View className="flex-row items-center mb-2">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3"
          >
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Land subdivision</Text>
        </View>
        <Text className="text-white/80 text-sm ml-[52px]">Step {currentStep} of 4</Text>
      </LinearGradient>

      <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 40 }}>
        {renderStepContent()}
        <View className="flex-row gap-3 mt-10">
          {currentStep > 1 && (
            <TouchableOpacity onPress={prevStep} className="flex-1 bg-gray-200 py-4 rounded-2xl items-center">
              <Text className="text-gray-700 font-bold">Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={currentStep === 4 ? handleSubmit : nextStep}
            disabled={!isStepValid(currentStep) || submitting}
            className="flex-[2] py-4 rounded-2xl items-center"
            style={{
              backgroundColor: !isStepValid(currentStep) || submitting ? '#d1d5db' : CITIZEN_PRIMARY,
            }}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold">
                {currentStep === 4 ? 'Submit for review' : 'Continue'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
