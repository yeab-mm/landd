import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getRequiredDocs } from '../constants/documentRequirements';

export type DocCheckState = Record<string, boolean | null>;

type Props = {
  visible: boolean;
  applicant: string;
  requestType: string;
  referenceLabel?: string;
  initialDocs?: Record<string, boolean>;
  initialNotes?: string;
  submitting?: boolean;
  onClose: () => void;
  onSaveValidation: (docs: Record<string, boolean>, notes: string) => void;
  onApprove: (docs: Record<string, boolean>, notes: string) => void;
  onReject: (docs: Record<string, boolean>, notes: string) => void;
};

export default function DocumentReviewModal({
  visible,
  applicant,
  requestType,
  referenceLabel,
  initialDocs = {},
  initialNotes = '',
  submitting = false,
  onClose,
  onSaveValidation,
  onApprove,
  onReject,
}: Props) {
  const requiredDocs = getRequiredDocs(requestType);
  const [docs, setDocs] = useState<DocCheckState>({});
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!visible) return;
    const next: DocCheckState = {};
    requiredDocs.forEach((label) => {
      next[label] = initialDocs[label] === true ? true : initialDocs[label] === false ? false : null;
    });
    setDocs(next);
    setNotes(initialNotes);
  }, [visible, requestType, initialNotes, initialDocs]);

  const toggleDoc = (label: string, authentic: boolean) => {
    setDocs((prev) => ({
      ...prev,
      [label]: prev[label] === authentic ? null : authentic,
    }));
  };

  const buildDocsPayload = (): Record<string, boolean> => {
    const out: Record<string, boolean> = {};
    requiredDocs.forEach((label) => {
      if (docs[label] === true) out[label] = true;
      else if (docs[label] === false) out[label] = false;
    });
    return out;
  };

  const allMarkedAuthentic = () =>
    requiredDocs.every((label) => docs[label] === true);

  const anyMarked = () =>
    requiredDocs.some((label) => docs[label] === true || docs[label] === false);

  const handleApprove = () => {
    if (!allMarkedAuthentic()) return;
    onApprove(buildDocsPayload(), notes.trim());
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        className="flex-1 justify-end"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="bg-black/50 absolute inset-0" />
        <View className="bg-white rounded-t-3xl max-h-[92%]">
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
            <View className="flex-1 pr-3">
              <Text className="text-lg font-bold text-gray-900">Document authenticity review</Text>
              <Text className="text-gray-500 text-sm mt-0.5">{applicant}</Text>
              <Text className="text-[#125f43] text-xs font-semibold mt-1">{requestType}</Text>
              {referenceLabel ? (
                <Text className="text-gray-400 text-xs">{referenceLabel}</Text>
              ) : null}
            </View>
            <TouchableOpacity onPress={onClose} disabled={submitting} className="p-2">
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView className="px-5 py-4" keyboardShouldPersistTaps="handled">
            <Text className="text-gray-600 text-sm mb-4">
              Mark each document as authentic or not. Save progress to set status to{' '}
              <Text className="font-bold">Document Validation</Text>. Approve only when every
              required document is authentic.
            </Text>

            {requiredDocs.map((label) => {
              const state = docs[label];
              return (
                <View
                  key={label}
                  className="mb-3 p-3 rounded-xl border border-gray-200 bg-gray-50"
                >
                  <Text className="text-gray-800 font-semibold text-sm mb-2">{label}</Text>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => toggleDoc(label, true)}
                      disabled={submitting}
                      className={`flex-1 py-2.5 rounded-lg flex-row items-center justify-center border ${
                        state === true
                          ? 'bg-green-100 border-green-500'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      <Ionicons
                        name={state === true ? 'checkmark-circle' : 'checkmark-circle-outline'}
                        size={18}
                        color={state === true ? '#059669' : '#9CA3AF'}
                      />
                      <Text
                        className={`ml-1 text-xs font-bold ${
                          state === true ? 'text-green-700' : 'text-gray-500'
                        }`}
                      >
                        Authentic
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => toggleDoc(label, false)}
                      disabled={submitting}
                      className={`flex-1 py-2.5 rounded-lg flex-row items-center justify-center border ${
                        state === false
                          ? 'bg-red-100 border-red-500'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      <Ionicons
                        name={state === false ? 'close-circle' : 'close-circle-outline'}
                        size={18}
                        color={state === false ? '#DC2626' : '#9CA3AF'}
                      />
                      <Text
                        className={`ml-1 text-xs font-bold ${
                          state === false ? 'text-red-700' : 'text-gray-500'
                        }`}
                      >
                        Not authentic
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            <Text className="text-gray-700 text-sm font-semibold mb-2 mt-2">Officer notes</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-gray-800 min-h-[88px] bg-white"
              placeholder="Reason for rejection, missing details, registry mismatch, etc."
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              value={notes}
              onChangeText={setNotes}
              editable={!submitting}
            />
          </ScrollView>

          <View className="px-5 pb-8 pt-3 border-t border-gray-100 gap-2">
            <TouchableOpacity
              onPress={() => onSaveValidation(buildDocsPayload(), notes.trim())}
              disabled={submitting || !anyMarked()}
              className={`py-3.5 rounded-xl items-center border-2 border-[#2563EB] ${
                submitting || !anyMarked() ? 'opacity-50' : 'bg-blue-50'
              }`}
            >
              {submitting ? (
                <ActivityIndicator color="#2563EB" />
              ) : (
                <Text className="text-[#2563EB] font-bold">Save — Document Validation</Text>
              )}
            </TouchableOpacity>

            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => onReject(buildDocsPayload(), notes.trim())}
                disabled={submitting}
                className="flex-1 py-3.5 rounded-xl items-center bg-red-50 border border-red-200"
              >
                <Text className="text-red-600 font-bold">Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleApprove}
                disabled={submitting || !allMarkedAuthentic()}
                className={`flex-1 py-3.5 rounded-xl items-center ${
                  allMarkedAuthentic() ? 'bg-[#125f43]' : 'bg-gray-300'
                }`}
              >
                <Text className="text-white font-bold">Approve</Text>
              </TouchableOpacity>
            </View>
            {!allMarkedAuthentic() && (
              <Text className="text-center text-xs text-gray-500">
                Approve unlocks when all documents are marked authentic.
              </Text>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
