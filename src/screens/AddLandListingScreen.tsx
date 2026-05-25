import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StatusBar,
    Alert,
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as DocumentPicker from 'expo-document-picker';

// Global Components
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../api/config';

type RootStackParamList = {
    AddLandListing: undefined;
    Marketplace: undefined;
    TermsAndConditions: { type: string };
};

type AddLandListingScreenProp = StackNavigationProp<RootStackParamList, 'AddLandListing'>;

export default function AddLandListingScreen() {
    const navigation = useNavigation<AddLandListingScreenProp>();
    const scrollViewRef = useRef<ScrollView>(null);
    const [currentSection, setCurrentSection] = useState(0);
    const [loading, setLoading] = useState(false);
    const { token } = useAuth();

    // Form State - Backend-ready structure
    const [formData, setFormData] = useState({
        title: '',
        landUseType: 'Residential',
        transactionType: 'For Sale', // Added: For Sale / For Rent
        price: '',
        area: '',
        description: '',
        location: {
            kebele: '',
            zone: 'Bahir Dar Zone',
            region: 'Amhara',
            latitude: null as number | null,
            longitude: null as number | null,
        },
        plotNumber: '',
        images: [] as Array<{ name: string; uri: string }>,
        acceptTerms: false,
    });

    const sections = [
        { title: 'Basic Info', icon: 'information-circle' as const },
        { title: 'Location & Plot', icon: 'map' as const },
        { title: 'Visuals & Description', icon: 'images' as const },
        { title: 'Review & Post', icon: 'cloud-upload' as const },
    ];


    // ✅ Safe Plot Number Validation
    const isValidPlotNumber = (plot: string): boolean => {
        if (!plot) return false;
        return /^PLOT-\d{4}-\d{5}$/i.test(plot);
    };

    const isSectionValid = (index: number): boolean => {
        switch (index) {
            case 0:
                return !!formData.title.trim() && !!formData.price.trim() && !!formData.area.trim();
            case 1:
                return isValidPlotNumber(formData.plotNumber) && !!formData.location.kebele.trim();
            case 2:
                return !!formData.description.trim() && formData.images.length > 0;
            case 3:
                return formData.acceptTerms;
            default:
                return true;
        }
    };

    const goToSection = (index: number) => {
        // Only allow forward navigation if current section is valid
        if (index > currentSection && !isSectionValid(currentSection)) {
            Alert.alert('Incomplete', 'Please fill all required fields before continuing');
            return;
        }
        setCurrentSection(index);
    };

    const handleUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/jpeg', 'image/png', 'image/jpg'],
                copyToCacheDirectory: true,
            });

            if (result.canceled || !result.assets || result.assets.length === 0) return;

            const file = result.assets[0];
            
            // Validate file size (max 5MB)
            if (file.size && file.size > 5 * 1024 * 1024) {
                Alert.alert('File Too Large', 'Please select an image under 5MB');
                return;
            }

            setFormData(prev => ({
                ...prev,
                images: [...prev.images, { name: file.name || 'Image', uri: file.uri }],
            }));
            Alert.alert('✓ Success', 'Image added successfully');
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Error', 'Could not access gallery. Please try again.');
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async () => {
        if (!isSectionValid(3)) {
            Alert.alert('Error', 'Please accept the terms to publish');
            return;
        }

        setLoading(true);
        
        try {
            const response = await fetch(`${API_URL}/lands`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: formData.title,
                    price: formData.price,
                    area: formData.area,
                    transactionType: formData.transactionType,
                    plotNumber: formData.plotNumber,
                    region: formData.location.region,
                    zone: formData.location.zone,
                    wereda: formData.location.kebele, // Mapping kebele to wereda or using as needed
                    kebele: formData.location.kebele,
                    landSize: formData.area,
                    landUseType: formData.landUseType,
                    description: formData.description,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit land listing');
            }

            Alert.alert(
                'Success', 
                'Land listing published successfully!', 
                [
                    { 
                        text: 'View in Marketplace', 
                        onPress: () => navigation.navigate('Marketplace') 
                    }
                ]
            );
        } catch (error: any) {
            Alert.alert('Error', error.message || 'An error occurred while submitting');
            console.error('Submit error:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderSectionControls = () => (
        <View className="flex-row justify-between mt-auto pt-6 pb-4">
            <Button
                title={currentSection === 0 ? 'Cancel' : 'Back'}
                onPress={() => currentSection === 0 ? navigation.goBack() : goToSection(currentSection - 1)}
                variant="ghost"
                textClassName={currentSection === 0 ? "text-white/70" : "text-white"}
                icon={currentSection === 0 ? "close" as const : "arrow-back" as const}
            />
            {currentSection < sections.length - 1 ? (
                <Button
                    title="Continue"
                    onPress={() => goToSection(currentSection + 1)}
                    icon="arrow-forward" as const
                    iconPosition="right"
                    className="px-8"
                    disabled={!isSectionValid(currentSection)}
                />
            ) : (
                <Button
                    title="Publish Listing"
                    onPress={handleSubmit}
                    loading={loading}
                    icon="checkmark-circle" as const
                    className="px-8"
                    disabled={!isSectionValid(currentSection)}
                />
            )}
        </View>
    );

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
                <View className="flex-1 bg-gray-50">
                    {/* ✅ FIXED: Added 'ff' for full opacity */}
                    <StatusBar barStyle="light-content" backgroundColor="#125f43ff" />
                    <LinearGradient
                        colors={['#125f43ff', '#1a7f5a']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="flex-1"
                    >
                        {/* Header with Progress */}
                        <View className="px-6 pt-14 pb-4">
                            <View className="flex-row justify-between mb-2">
                                {sections.map((_, i) => (
                                    <View 
                                        key={i} 
                                        className={`h-1.5 flex-1 rounded-full mx-0.5 ${i <= currentSection ? 'bg-white' : 'bg-white/30'}`} 
                                    />
                                ))}
                            </View>
                            <Text className="text-white text-2xl font-bold">{sections[currentSection].title}</Text>
                            <Text className="text-white/60 text-xs">Land Listing Form • Section {currentSection + 1} of {sections.length}</Text>
                        </View>

                        {/* Active Section Card Container */}
                        <View className="flex-1 w-full">
                            {currentSection === 0 && (
                                <View className="flex-1 px-6">
                                    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                                        <View className="bg-white/95 rounded-3xl p-6 shadow-2xl mb-6">
                                            <Input
                                                label="Listing Title *"
                                                placeholder="e.g. Beautiful Residential Plot in Kebele 03"
                                                value={formData.title}
                                                onChangeText={(t) => setFormData(p => ({ ...p, title: t }))}
                                                required
                                            />
                                            <View className="flex-row gap-4 mt-4">
                                                <View className="flex-1">
                                                    <Input
                                                        label="Price (ETB) *"
                                                        placeholder="2,500,000"
                                                        keyboardType="numeric"
                                                        value={formData.price}
                                                        onChangeText={(t) => setFormData(p => ({ ...p, price: t.replace(/[^0-9]/g, '') }))}
                                                        required
                                                    />
                                                </View>
                                                <View className="flex-1">
                                                    <Input
                                                        label="Land Size (m²) *"
                                                        placeholder="450"
                                                        keyboardType="numeric"
                                                        value={formData.area}
                                                        onChangeText={(t) => setFormData(p => ({ ...p, area: t.replace(/[^0-9.]/g, '') }))}
                                                        required
                                                    />
                                                </View>
                                            </View>
                                            <View className="mt-4">
                                                <Text className="text-gray-700 font-bold text-sm mb-2">Transaction Type *</Text>
                                                <View className="flex-row gap-2">
                                                    {['For Sale', 'For Rent'].map(type => (
                                                        <TouchableOpacity
                                                            key={type}
                                                            onPress={() => setFormData(p => ({ ...p, transactionType: type }))}
                                                            className={`px-4 py-2 rounded-xl flex-1 items-center border ${formData.transactionType === type ? 'bg-[#125f43ff] border-[#125f43ff]' : 'bg-gray-100 border-gray-200'}`}
                                                        >
                                                            <Text className={`font-semibold ${formData.transactionType === type ? 'text-white' : 'text-gray-600'}`}>{type}</Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            </View>
                                        </View>
                                        {renderSectionControls()}
                                    </ScrollView>
                                </View>
                            )}

                            {currentSection === 1 && (
                                <View className="flex-1 px-6">
                                    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                                        <View className="bg-white/95 rounded-3xl p-6 shadow-2xl mb-6">
                                            <Input
                                                label="Plot Reference Number *"
                                                placeholder="PLOT-2024-12345"
                                                value={formData.plotNumber}
                                                onChangeText={(t) => setFormData(p => ({ ...p, plotNumber: t.toUpperCase() }))}
                                                required
                                            />
                                            <Text className="text-gray-400 text-[10px] -mt-2 mb-4">Format: PLOT-YYYY-XXXXX</Text>
                                            
                                            <Input
                                                label="Region"
                                                value={formData.location.region}
                                                editable={false}
                                                className="bg-gray-100"
                                            />
                                            <Input
                                                label="Zone"
                                                value={formData.location.zone}
                                                editable={false}
                                                className="bg-gray-100"
                                            />
                                            <Input
                                                label="Kebele / District *"
                                                placeholder="Enter local kebele name"
                                                value={formData.location.kebele}
                                                onChangeText={(t) => setFormData(p => ({ ...p, location: { ...p.location, kebele: t } }))}
                                                required
                                            />
                                        </View>
                                        {renderSectionControls()}
                                    </ScrollView>
                                </View>
                            )}

                            {currentSection === 2 && (
                                <View className="flex-1 px-6">
                                    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                                        <View className="bg-white/95 rounded-3xl p-6 shadow-2xl mb-6">
                                            <Text className="text-gray-700 font-bold text-sm mb-2">Property Photos (1-5) *</Text>
                                            <Text className="text-gray-400 text-[10px] mb-3">JPEG, PNG • Max 5MB each</Text>
                                            
                                            <View className="flex-row flex-wrap gap-2 mb-4">
                                                {formData.images.map((img, i) => (
                                                    <View key={i} className="w-20 h-20 bg-gray-200 rounded-xl items-center justify-center relative overflow-hidden">
                                                        <Ionicons name="image" size={30} color="#9CA3AF" />
                                                        <Text className="text-[10px] text-gray-500 mt-1 px-1 text-center" numberOfLines={1}>{img.name}</Text>
                                                        <TouchableOpacity 
                                                            onPress={() => removeImage(i)}
                                                            className="absolute -top-1 -right-1 bg-red-500 rounded-full"
                                                        >
                                                            <Ionicons name="close-circle" size={18} color="white" />
                                                        </TouchableOpacity>
                                                    </View>
                                                ))}
                                                {formData.images.length < 5 && (
                                                    <TouchableOpacity 
                                                        onPress={handleUpload}
                                                        className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl items-center justify-center bg-gray-50"
                                                    >
                                                        <Ionicons name="add" size={30} color="#9CA3AF" />
                                                    </TouchableOpacity>
                                                )}
                                            </View>

                                            <Input
                                                label="Property Description *"
                                                placeholder="Describe the land features, accessibility, utilities, nearby landmarks..."
                                                value={formData.description}
                                                onChangeText={(t) => setFormData(p => ({ ...p, description: t }))}
                                                multiline
                                                numberOfLines={4}
                                                required
                                            />
                                        </View>
                                        {renderSectionControls()}
                                    </ScrollView>
                                </View>
                            )}

                            {currentSection === 3 && (
                                <View className="flex-1 px-6">
                                    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                                        <View className="bg-white/95 rounded-3xl p-6 shadow-2xl mb-6">
                                            <Text className="text-[#125f43ff] font-bold text-lg mb-4">Final Review</Text>
                                            <View className="space-y-3 mb-6">
                                                <View className="flex-row justify-between border-b border-gray-100 pb-2">
                                                    <Text className="text-gray-500">Title</Text>
                                                    <Text className="text-gray-800 font-bold text-right flex-1 ml-4" numberOfLines={1}>{formData.title || '-'}</Text>
                                                </View>
                                                <View className="flex-row justify-between border-b border-gray-100 pb-2">
                                                    <Text className="text-gray-500">Price</Text>
                                                    <Text className="text-gray-800 font-bold">ETB {formData.price ? parseInt(formData.price).toLocaleString() : '-'}</Text>
                                                </View>
                                                <View className="flex-row justify-between border-b border-gray-100 pb-2">
                                                    <Text className="text-gray-500">Area</Text>
                                                    <Text className="text-gray-800 font-bold">{formData.area || '-'} m²</Text>
                                                </View>
                                                <View className="flex-row justify-between border-b border-gray-100 pb-2">
                                                    <Text className="text-gray-500">Plot No.</Text>
                                                    <Text className="text-gray-800 font-bold">{formData.plotNumber || '-'}</Text>
                                                </View>
                                                <View className="flex-row justify-between border-b border-gray-100 pb-2">
                                                    <Text className="text-gray-500">Location</Text>
                                                    <Text className="text-gray-800 font-bold text-right flex-1 ml-4 text-xs" numberOfLines={1}>
                                                        {formData.location.kebele || '-'}, {formData.location.zone}
                                                    </Text>
                                                </View>
                                                <View className="flex-row justify-between pb-2">
                                                    <Text className="text-gray-500">Photos</Text>
                                                    <Text className="text-gray-800 font-bold">{formData.images.length}</Text>
                                                </View>
                                            </View>

                                            <View className="flex-row items-start bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                                <TouchableOpacity 
                                                    onPress={() => setFormData(p => ({ ...p, acceptTerms: !p.acceptTerms }))}
                                                    className={`w-6 h-6 rounded-lg border-2 mr-3 mt-0.5 items-center justify-center flex-shrink-0 ${formData.acceptTerms ? 'bg-[#125f43ff] border-[#125f43ff]' : 'border-gray-300'}`}
                                                >
                                                    {formData.acceptTerms && <Ionicons name="checkmark" size={16} color="white" />}
                                                </TouchableOpacity>
                                                <Text className="text-gray-600 text-xs flex-1">
                                                    I confirm that all provided information is accurate and I agree to the{' '}
                                                    <Text 
                                                        className="text-[#125f43ff] font-semibold underline"
                                                        onPress={() => navigation.navigate('TermsAndConditions', { type: 'listing' })}
                                                    >
                                                        Listing Terms & Conditions
                                                    </Text>.
                                                </Text>
                                            </View>
                                        </View>
                                        {renderSectionControls()}
                                    </ScrollView>
                                </View>
                            )}
                        </View>
                    </LinearGradient>
                </View>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}