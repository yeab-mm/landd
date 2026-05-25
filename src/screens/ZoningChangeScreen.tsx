import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// ✅ FIXED: Proper navigation types
type RootStackParamList = {
    ZoningChange: undefined;
    MainApp: undefined;
    ZoningSuccess: { referenceNumber: string };
};

type ZoningChangeScreenProp = StackNavigationProp<RootStackParamList, 'ZoningChange'>;

const STEPS = ['Select Land', 'New Zoning', 'Justification', 'Review'];
const ZONES = ['Residential', 'Commercial', 'Industrial', 'Agricultural', 'Institutional'];

export default function ZoningChangeScreen() {
    const navigation = useNavigation<ZoningChangeScreenProp>();
    const [currentStep, setCurrentStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    
    // ✅ FIXED: Use explicit green theme colors
    const PRIMARY_COLOR = '#125f43ff';
    const PRIMARY_LIGHT = '#1a7f5a';
    
    const [formData, setFormData] = useState({
        landId: '',
        targetZone: '',
        justification: '',
        impactLevel: 'Low',
    });

    // ✅ Validation function
    const isStepValid = (step: number): boolean => {
        switch (step) {
            case 1: return !!formData.landId.trim();
            case 2: return !!formData.targetZone.trim();
            case 3: return !!formData.justification.trim();
            case 4: return true;
            default: return false;
        }
    };

    const nextStep = () => {
        if (!isStepValid(currentStep)) {
            Alert.alert('Incomplete', 'Please fill all required fields before continuing');
            return;
        }
        setCurrentStep(prev => Math.min(prev + 1, 4));
    };
    
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    // ✅ Handle submission
    const handleSubmit = async () => {
        if (!isStepValid(4)) {
            Alert.alert('Error', 'Please complete all required fields');
            return;
        }
        
        setSubmitting(true);
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Generate reference number
            const referenceNumber = `ZONE-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
            
            Alert.alert(
                'Success',
                `Zoning change request submitted!\nReference: ${referenceNumber}`,
                [
                    { 
                        text: 'Track Request', 
                        onPress: () => navigation.navigate('ZoningSuccess', { referenceNumber })
                    },
                    { text: 'Submit Another', style: 'cancel', onPress: () => {
                        setCurrentStep(1);
                        setFormData({ landId: '', targetZone: '', justification: '', impactLevel: 'Low' });
                    }}
                ]
            );
        } catch (error) {
            console.error('Submit error:', error);
            Alert.alert('Error', 'Failed to submit zoning change. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // ✅ Simplified step indicator without absolute positioning issues
    const renderStepIndicator = () => (
        <View className="flex-row justify-between mb-8 px-2">
            {STEPS.map((step, index) => {
                const stepNum = index + 1;
                const isActive = stepNum <= currentStep;
                const isLast = index === STEPS.length - 1;
                
                return (
                    <View key={step} className="items-center flex-1">
                        <View className={`w-8 h-8 rounded-full items-center justify-center mb-1 ${isActive ? `bg-[${PRIMARY_COLOR}]` : 'bg-gray-200'}`}>
                            {stepNum < currentStep ? (
                                <Ionicons name="checkmark" size={16} color="white" />
                            ) : (
                                <Text className={`text-xs font-bold ${isActive ? 'text-white' : 'text-gray-500'}`}>{stepNum}</Text>
                            )}
                        </View>
                        <Text className={`text-[8px] font-bold uppercase text-center ${isActive ? `text-[${PRIMARY_COLOR}]` : 'text-gray-400'}`}>{step}</Text>
                        
                        {/* Connector line - simplified */}
                        {!isLast && (
                            <View className={`absolute left-[55%] top-4 h-[2px] w-[90%] ${stepNum < currentStep ? `bg-[${PRIMARY_COLOR}]` : 'bg-gray-200'}`} />
                        )}
                    </View>
                );
            })}
        </View>
    );

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <View className="space-y-4">
                        <Text className="text-gray-800 text-lg font-bold">Select Parcel</Text>
                        <Text className="text-gray-500 text-sm mb-4">Select the land you want to rezone.</Text>
                        
                        {/* ✅ FIXED: Use explicit colors + accessibility */}
                        {['LND-1002 (Agricultural)', 'LND-3033 (Industrial)'].map((land) => (
                            <TouchableOpacity 
                                key={land}
                                onPress={() => setFormData({ ...formData, landId: land })}
                                className={`p-4 rounded-2xl border ${formData.landId === land ? `bg-[${PRIMARY_COLOR}]/5 border-[${PRIMARY_COLOR}]` : 'bg-white border-gray-100'} shadow-sm flex-row items-center justify-between`}
                                accessibilityLabel={`Select ${land}`}
                                accessibilityState={{ selected: formData.landId === land }}
                            >
                                <Text className="text-gray-800 font-semibold">{land}</Text>
                                {formData.landId === land && <Ionicons name="checkmark-circle" size={20} color={PRIMARY_COLOR} />}
                            </TouchableOpacity>
                        ))}
                    </View>
                );
            case 2:
                return (
                    <View className="space-y-4">
                        <Text className="text-gray-800 text-lg font-bold">Proposed Zoning Type</Text>
                        <View className="flex-row flex-wrap">
                            {ZONES.map((zone) => (
                                <TouchableOpacity 
                                    key={zone}
                                    onPress={() => setFormData({ ...formData, targetZone: zone })}
                                    className={`m-1 px-4 py-2 rounded-full border ${formData.targetZone === zone ? `bg-[${PRIMARY_COLOR}] border-[${PRIMARY_COLOR}]` : 'bg-white border-gray-200'}`}
                                    accessibilityLabel={`Select ${zone} zoning`}
                                    accessibilityState={{ selected: formData.targetZone === zone }}
                                >
                                    <Text className={`text-xs font-bold ${formData.targetZone === zone ? 'text-white' : 'text-gray-600'}`}>{zone}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );
            case 3:
                return (
                    <View className="space-y-6">
                        <Text className="text-gray-800 text-lg font-bold">Justification</Text>
                        {/* ✅ FIXED: Add placeholder color + accessibility */}
                        <TextInput 
                            className="bg-white p-4 rounded-xl border border-gray-200 h-40 text-gray-800"
                            placeholder="Explain why this rezoning is necessary for the community or development..."
                            placeholderTextColor="#9CA3AF"
                            multiline
                            value={formData.justification}
                            onChangeText={(t) => setFormData({ ...formData, justification: t })}
                            accessibilityLabel="Justification for zoning change"
                        />
                        
                        <Text className="text-gray-600 text-xs font-bold uppercase mb-2">Estimated Impact</Text>
                        <View className="flex-row space-x-2">
                            {['Low', 'Medium', 'High'].map((lvl) => (
                                <TouchableOpacity 
                                    key={lvl}
                                    onPress={() => setFormData({...formData, impactLevel: lvl})}
                                    className={`flex-1 py-2 rounded-lg border items-center ${formData.impactLevel === lvl ? `bg-[${PRIMARY_COLOR}]/10 border-[${PRIMARY_COLOR}]/30` : 'bg-white border-gray-200'}`}
                                    accessibilityLabel={`Select ${lvl} impact level`}
                                    accessibilityState={{ selected: formData.impactLevel === lvl }}
                                >
                                    <Text className={`text-xs font-bold ${formData.impactLevel === lvl ? `text-[${PRIMARY_COLOR}]` : 'text-gray-500'}`}>{lvl}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );
            case 4:
                return (
                    <View className="space-y-6">
                        <Text className="text-gray-800 text-lg font-bold">Summary Review</Text>
                        
                        {/* ✅ FIXED: Use explicit colors */}
                        <View className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                            <View className="flex-row justify-between mb-3">
                                <Text className="text-gray-400 text-xs font-bold uppercase">Target Parcel</Text>
                                <Text className="text-gray-800 font-bold">{formData.landId || 'Select one'}</Text>
                            </View>
                            <View className="flex-row justify-between mb-3">
                                <Text className="text-gray-400 text-xs font-bold uppercase">Requested Zone</Text>
                                <Text className={`font-bold uppercase ${formData.targetZone ? `text-[${PRIMARY_COLOR}]` : 'text-gray-400'}`}>{formData.targetZone || 'Select one'}</Text>
                            </View>
                            <View className="border-t border-gray-50 pt-3">
                                <Text className="text-gray-400 text-[10px] font-bold uppercase mb-1">Justification Overview</Text>
                                <Text className="text-gray-700 text-sm leading-5">
                                    {formData.justification.substring(0, 100) || 'No justification provided yet...'}
                                    {formData.justification.length > 100 ? '...' : ''}
                                </Text>
                            </View>
                        </View>
                        <Text className="text-gray-400 text-[10px] italic">
                            * Note: Zoning changes require public hearing and approval from the Urban Planning Commission.
                        </Text>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* ✅ FIXED: Use green theme */}
            <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />
            
            <LinearGradient 
                colors={[PRIMARY_COLOR, PRIMARY_LIGHT]} 
                className="px-6 pt-12 pb-6 rounded-b-[40px]"
            >
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity 
                        onPress={() => navigation.goBack()}
                        className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                        accessibilityLabel="Go back"
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold ml-4">Zoning Change Request</Text>
                </View>
                <Text className="text-white/80 text-sm">Request land use reclassification</Text>
            </LinearGradient>

            <ScrollView className="flex-1 px-6 pt-8" showsVerticalScrollIndicator={false}>
                {renderStepIndicator()}
                {renderStepContent()}
                
                {/* Navigation Buttons - ✅ FIXED: Use explicit colors + loading state + validation */}
                <View className="flex-row space-x-4 mt-10 mb-20">
                    {currentStep > 1 && (
                        <TouchableOpacity 
                            onPress={prevStep}
                            className="flex-1 bg-gray-200 py-4 rounded-2xl items-center"
                            accessibilityLabel="Go to previous step"
                        >
                            <Text className="text-gray-700 font-bold">Back</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity 
                        onPress={currentStep === 4 ? handleSubmit : nextStep}
                        disabled={!isStepValid(currentStep) || submitting}
                        className={`flex-[2] py-4 rounded-2xl items-center ${!isStepValid(currentStep) || submitting ? 'bg-gray-300' : `bg-[${PRIMARY_COLOR}]`} shadow-md shadow-[${PRIMARY_COLOR}]/20`}
                        accessibilityLabel={currentStep === 4 ? 'Submit zoning change request' : 'Continue to next step'}
                        accessibilityState={{ disabled: !isStepValid(currentStep) || submitting }}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Text className="text-white font-bold">
                                {currentStep === 4 ? 'Confirm Request' : 'Continue'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}