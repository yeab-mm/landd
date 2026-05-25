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
import * as DocumentPicker from 'expo-document-picker';

// ✅ Proper navigation types
type RootStackParamList = {
    LandSubdivision: undefined;
    MainApp: undefined;
    SubdivisionSuccess: { referenceNumber: string };
};

type LandSubdivisionScreenProp = StackNavigationProp<RootStackParamList, 'LandSubdivision'>;

const STEPS = ['Select Land', 'Subdivision', 'Documents', 'Review'];

export default function LandSubdivisionScreen() {
    const navigation = useNavigation<LandSubdivisionScreenProp>();
    const [currentStep, setCurrentStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    
    // ✅ Use explicit green theme colors
    const PRIMARY_COLOR = '#125f43ff';
    const PRIMARY_LIGHT = '#0d4a35';
    
    const [formData, setFormData] = useState({
        landId: '',
        units: '',
        purpose: '',
        hasSurvey: false,
        surveyFile: null as any,
    });

    // ✅ Validation function
    const isStepValid = (step: number): boolean => {
        switch (step) {
            case 1: return !!formData.landId.trim();
            case 2: return !!formData.units && parseInt(formData.units) > 1 && !!formData.purpose.trim();
            case 3: return formData.hasSurvey;
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

    // ✅ Handle file upload
    const handleUploadSurvey = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
                copyToCacheDirectory: true,
            });

            if (result.canceled || !result.assets || result.assets.length === 0) return;

            const file = result.assets[0];
            
            // Validate file size (max 10MB)
            if (file.size && file.size > 10 * 1024 * 1024) {
                Alert.alert('File Too Large', 'Please select a file under 10MB');
                return;
            }

            setFormData(prev => ({
                ...prev,
                hasSurvey: true,
                surveyFile: { name: file.name, uri: file.uri, size: file.size }
            }));
            Alert.alert('✓ Success', 'Survey map uploaded successfully');
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Error', 'Could not access file picker. Please try again.');
        }
    };

    // ✅ Handle submission
    const handleSubmit = async () => {
        if (!isStepValid(4)) {
            Alert.alert('Error', 'Please complete all required fields');
            return;
        }
        
        setSubmitting(true);
        
        try {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Generate reference number
            const referenceNumber = `SUB-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
            
            Alert.alert(
                'Success',
                `Subdivision application submitted!\nReference: ${referenceNumber}\nAdministrative Fee: 2,500 ETB`,
                [
                    { 
                        text: 'Track Request', 
                        onPress: () => navigation.navigate('SubdivisionSuccess', { referenceNumber })
                    },
                    { 
                        text: 'Submit Another', 
                        style: 'cancel', 
                        onPress: () => {
                            setCurrentStep(1);
                            setFormData({ landId: '', units: '', purpose: '', hasSurvey: false, surveyFile: null });
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Submit error:', error);
            Alert.alert('Error', 'Failed to submit subdivision. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // ✅ Step indicator
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
                        
                        {/* Connector line */}
                        {!isLast && (
                            <View className={`absolute left-[55%] top-4 h-[2px] w-[90%] ${stepNum < currentStep ? `bg-[${PRIMARY_COLOR}]` : 'bg-gray-200'}`} />
                        )}
                    </View>
                );
            })}
        </View>
    );

    // ✅ Step content renderer
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <View className="space-y-4">
                        <Text className="text-gray-800 text-lg font-bold">Select Parent Parcel</Text>
                        <Text className="text-gray-500 text-sm mb-4">Choose the land parcel you wish to subdivide.</Text>
                        
                        {['LND-8829 (Residential)', 'LND-9912 (Commercial)'].map((land) => (
                            <TouchableOpacity 
                                key={land}
                                onPress={() => setFormData({ ...formData, landId: land })}
                                className={`p-4 rounded-2xl border ${formData.landId === land ? `bg-[${PRIMARY_COLOR}]/5 border-[${PRIMARY_COLOR}]` : 'bg-white border-gray-100'} shadow-sm flex-row items-center justify-between`}
                                accessibilityLabel={`Select ${land}`}
                                accessibilityState={{ selected: formData.landId === land }}
                            >
                                <View className="flex-row items-center">
                                    <View className="w-10 h-10 bg-gray-100 rounded-xl items-center justify-center mr-3">
                                        <Ionicons name="map" size={20} color={PRIMARY_COLOR} />
                                    </View>
                                    <Text className="text-gray-800 font-semibold">{land}</Text>
                                </View>
                                {formData.landId === land && <Ionicons name="checkmark-circle" size={20} color={PRIMARY_COLOR} />}
                            </TouchableOpacity>
                        ))}
                    </View>
                );
            case 2:
                return (
                    <View className="space-y-6">
                        <Text className="text-gray-800 text-lg font-bold">Subdivision Details</Text>
                        
                        <View>
                            <Text className="text-gray-600 text-xs font-bold uppercase mb-2">Number of Sub-Units *</Text>
                            <TextInput 
                                className="bg-white p-4 rounded-xl border border-gray-200 text-gray-800"
                                placeholder="Example: 4"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="numeric"
                                value={formData.units}
                                onChangeText={(t) => setFormData({ ...formData, units: t.replace(/[^0-9]/g, '') })}
                                accessibilityLabel="Number of sub-units to create"
                            />
                            <Text className="text-gray-400 text-[10px] mt-1">Must be 2 or more</Text>
                        </View>

                        <View>
                            <Text className="text-gray-600 text-xs font-bold uppercase mb-2">Purpose of Subdivision *</Text>
                            <TextInput 
                                className="bg-white p-4 rounded-xl border border-gray-200 h-24 text-gray-800"
                                placeholder="Example: Residential development or inheritance distribution..."
                                placeholderTextColor="#9CA3AF"
                                multiline
                                value={formData.purpose}
                                onChangeText={(t) => setFormData({ ...formData, purpose: t })}
                                accessibilityLabel="Purpose of the subdivision"
                            />
                        </View>
                    </View>
                );
            case 3:
                return (
                    <View className="space-y-6">
                        <Text className="text-gray-800 text-lg font-bold">Required Documents</Text>
                        <Text className="text-gray-500 text-sm">Please upload the following required documents.</Text>

                        <TouchableOpacity 
                            onPress={handleUploadSurvey}
                            className={`bg-white p-6 rounded-2xl border-2 border-dashed ${formData.hasSurvey ? 'border-[#125f43ff]' : 'border-gray-200'} items-center justify-center`}
                            accessibilityLabel="Upload survey map document"
                        >
                            <Ionicons name="cloud-upload" size={40} color={formData.hasSurvey ? PRIMARY_COLOR : '#9CA3AF'} />
                            <Text className="text-gray-800 font-bold mt-2">{formData.hasSurvey ? (formData.surveyFile?.name || 'Survey Map Uploaded') : 'Upload Survey Map'}</Text>
                            <Text className="text-gray-400 text-xs">PDF or High-res Image (max 10MB)</Text>
                        </TouchableOpacity>

                        <View className="bg-blue-50 p-4 rounded-xl flex-row items-start border border-blue-100">
                            <Ionicons name="information-circle" size={20} color="#2563EB" />
                            <Text className="text-blue-800 text-xs ml-2 flex-1">
                                Survey maps must be stamped by a certified land surveyor and verified by the local district office.
                            </Text>
                        </View>
                    </View>
                );
            case 4:
                return (
                    <View className="space-y-6">
                        <Text className="text-gray-800 text-lg font-bold">Review Application</Text>
                        
                        <View className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-gray-500 text-xs">Parent Parcel</Text>
                                <Text className="text-gray-800 font-bold uppercase">{formData.landId || 'Not Selected'}</Text>
                            </View>
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-gray-500 text-xs">Proposed Units</Text>
                                <Text className="text-gray-800 font-bold">{formData.units || '0'}</Text>
                            </View>
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-gray-500 text-xs">Documents</Text>
                                <Text className={formData.hasSurvey ? "text-green-600 font-bold" : "text-red-500"}>
                                    {formData.hasSurvey ? 'Verified ✓' : 'Missing ✗'}
                                </Text>
                            </View>
                        </View>

                        <View className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
                            <Text className="text-orange-800 text-[10px] font-bold uppercase mb-1">Administrative Fee</Text>
                            <Text className="text-orange-900 text-xl font-bold">2,500 ETB</Text>
                            <Text className="text-orange-700 text-[10px] mt-1">Payable upon approval</Text>
                        </View>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
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
                    <Text className="text-white text-xl font-bold ml-4">Land Subdivision</Text>
                </View>
                <Text className="text-white/80 text-sm">Split a parcel into multiple units</Text>
            </LinearGradient>

            <ScrollView className="flex-1 px-6 pt-8" showsVerticalScrollIndicator={false}>
                {renderStepIndicator()}
                {renderStepContent()}
                
                {/* Navigation Buttons */}
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
                        accessibilityLabel={currentStep === 4 ? 'Submit subdivision application' : 'Continue to next step'}
                        accessibilityState={{ disabled: !isStepValid(currentStep) || submitting }}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Text className="text-white font-bold">
                                {currentStep === 4 ? 'Submit Application' : 'Continue'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}