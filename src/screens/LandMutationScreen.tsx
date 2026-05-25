import React, { useState } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    StatusBar, 
    TextInput,
    Alert,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// ✅ FIXED: Proper navigation types
type RootStackParamList = {
    LandMutation: undefined;
    MainApp: undefined;
    MutationSuccess: { referenceNumber: string };
};

type LandMutationScreenProp = StackNavigationProp<RootStackParamList, 'LandMutation'>;

const STEPS = ['Select Land', 'Mutation Type', 'New Details', 'Review'];

export default function LandMutationScreen() {
    const navigation = useNavigation<LandMutationScreenProp>();
    const [currentStep, setCurrentStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    
    // ✅ FIXED: Use explicit green theme colors
    const PRIMARY_COLOR = '#125f43ff';
    const PRIMARY_LIGHT = '#1a7f5a';
    
    const [formData, setFormData] = useState({
        landId: '',
        mutationType: '',
        newDetails: '',
        isLegalCertified: false,
    });

    // ✅ Validation function
    const isStepValid = (step: number): boolean => {
        switch (step) {
            case 1: return !!formData.landId.trim();
            case 2: return !!formData.mutationType.trim();
            case 3: return !!formData.newDetails.trim() && formData.isLegalCertified;
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
            // TODO: Replace with real API call
            // await api.post('/api/mutations', formData);
            
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Generate reference number
            const referenceNumber = `MUT-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
            
            Alert.alert(
                'Success',
                `Mutation request submitted!\nReference: ${referenceNumber}`,
                [
                    { 
                        text: 'Track Request', 
                        onPress: () => navigation.navigate('MutationSuccess', { referenceNumber })
                    },
                    { text: 'Submit Another', style: 'cancel', onPress: () => setCurrentStep(1) }
                ]
            );
        } catch (error) {
            console.error('Submit error:', error);
            Alert.alert('Error', 'Failed to submit mutation. Please try again.');
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
                        <Text className="text-gray-800 text-lg font-bold">Identify Parcel</Text>
                        <Text className="text-gray-500 text-sm mb-4">Select the land record that needs mutation.</Text>
                        
                        {/* ✅ FIXED: Use explicit colors + accessibility */}
                        {['LND-4410 (Agricultural)', 'LND-5521 (Residential)'].map((land) => (
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
                        <Text className="text-gray-800 text-lg font-bold">Select Mutation Type</Text>
                        
                        {/* ✅ FIXED: Use explicit colors */}
                        {['Merge Parcels', 'Correction of Area', 'Update Owner Info'].map((type) => (
                            <TouchableOpacity 
                                key={type}
                                onPress={() => setFormData({ ...formData, mutationType: type })}
                                className={`p-4 rounded-xl border ${formData.mutationType === type ? `bg-[${PRIMARY_COLOR}]/5 border-[${PRIMARY_COLOR}]` : 'bg-white border-gray-200'}`}
                                accessibilityLabel={`Select ${type}`}
                                accessibilityState={{ selected: formData.mutationType === type }}
                            >
                                <Text className={`font-bold ${formData.mutationType === type ? `text-[${PRIMARY_COLOR}]` : 'text-gray-700'}`}>{type}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                );
            case 3:
                return (
                    <View className="space-y-6">
                        <Text className="text-gray-800 text-lg font-bold">Updated Information</Text>
                        
                        {/* ✅ FIXED: Add placeholder color + accessibility */}
                        <TextInput 
                            className="bg-white p-4 rounded-xl border border-gray-200 h-32 text-gray-800"
                            placeholder="Describe the changes in detail..."
                            placeholderTextColor="#9CA3AF"
                            multiline
                            value={formData.newDetails}
                            onChangeText={(t) => setFormData({ ...formData, newDetails: t })}
                            accessibilityLabel="Describe the mutation changes"
                        />
                        
                        {/* ✅ FIXED: Use explicit colors + accessibility */}
                        <TouchableOpacity 
                            onPress={() => setFormData({...formData, isLegalCertified: !formData.isLegalCertified})}
                            className="flex-row items-center p-2"
                            accessibilityLabel="Certify that changes are legally verified"
                            accessibilityState={{ checked: formData.isLegalCertified }}
                        >
                            <View className={`w-6 h-6 rounded border items-center justify-center mr-3 ${formData.isLegalCertified ? `bg-[${PRIMARY_COLOR}] border-[${PRIMARY_COLOR}]` : 'border-gray-300'}`}>
                                {formData.isLegalCertified && <Ionicons name="checkmark" size={16} color="white" />}
                            </View>
                            <Text className="text-gray-600 text-xs flex-1">I certify that these changes are legally verified and supported by official documentation.</Text>
                        </TouchableOpacity>
                    </View>
                );
            case 4:
                return (
                    <View className="space-y-6">
                        <Text className="text-gray-800 text-lg font-bold">Review Mutation</Text>
                        
                        {/* ✅ FIXED: Use explicit colors */}
                        <View className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-gray-500 text-xs text-[#125f43ff]/30 uppercase font-bold">Parcel</Text>
                                <Text className="text-gray-800 font-bold">{formData.landId || '---'}</Text>
                            </View>
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-gray-500 text-xs text-[#125f43ff]/30 uppercase font-bold">Type</Text>
                                <Text className="text-gray-800 font-bold">{formData.mutationType || '---'}</Text>
                            </View>
                            <View className="flex-row justify-between">
                                <Text className="text-gray-500 text-xs text-[#125f43ff]/30 uppercase font-bold">Legal Certified</Text>
                                <Text className={`font-bold ${formData.isLegalCertified ? 'text-green-600' : 'text-red-500'}`}>
                                    {formData.isLegalCertified ? 'Yes ✓' : 'No ✗'}
                                </Text>
                            </View>
                        </View>
                        
                        {/* ✅ FIXED: Use explicit colors */}
                        <View className={`p-4 bg-[${PRIMARY_COLOR}]/5 rounded-xl border border-[${PRIMARY_COLOR}]/10`}>
                            <Text className={`font-bold text-xs mb-1 text-[${PRIMARY_COLOR}]`}>Blockchain Note</Text>
                            <Text className="text-gray-600 text-xs">This mutation will create a new block in the land ledger upon approval. All changes are immutable and publicly verifiable.</Text>
                        </View>
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
                    <Text className="text-white text-xl font-bold ml-4">Land Mutation</Text>
                </View>
                <Text className="text-white/80 text-sm">Update land records securely</Text>
            </LinearGradient>

            <ScrollView className="flex-1 px-6 pt-8" showsVerticalScrollIndicator={false}>
                {renderStepIndicator()}
                {renderStepContent()}
                
                {/* Navigation Buttons - ✅ FIXED: Use explicit colors + loading state */}
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
                        className={`flex-[2] py-4 rounded-2xl items-center ${!isStepValid(currentStep) || submitting ? 'bg-gray-300' : `bg-[${PRIMARY_COLOR}]`}`}
                        accessibilityLabel={currentStep === 4 ? 'Submit mutation request' : 'Continue to next step'}
                        accessibilityState={{ disabled: !isStepValid(currentStep) || submitting }}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Text className="text-white font-bold">
                                {currentStep === 4 ? 'Submit Mutation' : 'Continue'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}