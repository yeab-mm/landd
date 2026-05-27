import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StatusBar,
    Alert,
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    Modal,
    TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as Location from 'expo-location';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../api/config';

type RootStackParamList = {
    VerificationRequest: undefined;
    TrackRequest: { referenceNumber: string };
    MainApp: undefined;
};

type VerificationRequestScreenProp = StackNavigationProp<RootStackParamList, 'VerificationRequest'>;

// ✅ Ethiopian Location Data (Cascading Dropdowns)
const ETHIOPIA_LOCATIONS = {
    'Amhara': {
        'Bahir Dar Zone': {
            'Bahir Dar Wereda': ['Kebele 01', 'Kebele 02', 'Kebele 03', 'Kebele 04', 'Kebele 05', 'Kebele 06', 'Kebele 07', 'Kebele 08', 'Kebele 09'],
            'Bure Wereda': ['Kebele 01', 'Kebele 02', 'Kebele 03'],
            'Gorgora Wereda': ['Kebele 01', 'Kebele 02'],
        },
        'Gondar Zone': {
            'Gondar Wereda': ['Kebele 01', 'Kebele 02', 'Kebele 03'],
        },
    },
    'Oromia': {
        'Addis Ababa Zone': {
            'Addis Ababa Wereda': ['Kebele 01', 'Kebele 02', 'Kebele 03'],
        },
    },
    'Tigray': {
        'Mekelle Zone': {
            'Mekelle Wereda': ['Kebele 01', 'Kebele 02', 'Kebele 03'],
        },
    },
    'SNNP': {
        'Hawassa Zone': {
            'Hawassa Wereda': ['Kebele 01', 'Kebele 02', 'Kebele 03'],
        },
    },
};

// ✅ Simple Dropdown Component (Same UI as TextInput)
const DropdownField = ({
    label,
    value,
    options,
    onSelect,
    placeholder,
    disabled = false
}: {
    label: string;
    value: string;
    options: string[];
    onSelect: (value: string) => void;
    placeholder: string;
    disabled?: boolean;
}) => {
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <View className="w-[48%]">
            <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">{label} *</Text>
            <TouchableOpacity
                onPress={() => !disabled && setModalVisible(true)}
                disabled={disabled}
                className={`flex-row items-center bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200 ${disabled ? 'opacity-50' : ''
                    }`}
            >
                <Text numberOfLines={1} className={`flex-1 text-gray-800 text-base ${!value ? 'text-gray-400' : ''}`}>
                    {value || placeholder}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Dropdown Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    className="flex-1 bg-black/50"
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View className="bg-white rounded-t-3xl mt-auto max-h-[60%]">
                        <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
                            <Text className="text-lg font-bold text-gray-800">{label}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView className="p-4">
                            {options.map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    onPress={() => {
                                        onSelect(option);
                                        setModalVisible(false);
                                    }}
                                    className={`py-4 px-4 border-b border-gray-100 ${value === option ? 'bg-[#125f43ff]/10' : ''
                                        }`}
                                >
                                    <Text className={`text-base ${value === option ? 'text-[#125f43ff] font-semibold' : 'text-gray-800'
                                        }`}>
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

export default function VerificationRequestScreen() {
    const navigation = useNavigation<VerificationRequestScreenProp>();
    const { user, token, refreshUser } = useAuth();
    const scrollViewRef = useRef<ScrollView>(null);
    const [currentSection, setCurrentSection] = useState(0);
    const [profile, setProfile] = useState<any>(null);

    // Form State
    const [formData, setFormData] = useState({
        // Section 1: Land Identification
        plotNumber: '',
        location: {
            region: '',
            zone: '',
            wereda: '',
            kebele: ''
        },
        coordinates: { latitude: null as any, longitude: null as any },
        landSize: '',
        landSizeUnit: 'm²',
        landUseType: '',

        // Section 2: Owner Information
        ownerName: '',
        ownerNationalId: '',
        relationship: 'Owner',

        // Section 3: Documents
        documents: {
            titleDeed: null as any,
            surveyMap: null as any,
            ownerIdCopy: null as any,
        },

        // Section 4: Purpose
        verificationReason: '',
        additionalNotes: '',
        contactPreference: 'SMS',
        urgency: 'Normal',

        // Section 5: Declaration
        acceptDeclaration1: false,
        acceptDeclaration2: false,
    });

    const applyOwnerFromAccount = (account: { fullName?: string; faydaId?: string } | null) => {
        if (!account) return;
        setFormData((prev) => ({
            ...prev,
            ownerName: account.fullName?.trim() || prev.ownerName,
            ownerNationalId: account.faydaId?.trim() || prev.ownerNationalId,
            relationship: prev.relationship || 'Owner',
        }));
    };

    const resolveOwnerFields = () => {
        const account = profile || user;
        return {
            ownerName: (formData.ownerName || account?.fullName || '').trim(),
            ownerNationalId: (formData.ownerNationalId || account?.faydaId || '').trim(),
            relationship: formData.relationship || 'Owner',
        };
    };

    const loadAccountProfile = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_URL}/user/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok && data.user) {
                setProfile(data.user);
                applyOwnerFromAccount(data.user);
            }
        } catch (error) {
            console.error('Load profile for verification:', error);
        }
    };

    useEffect(() => {
        applyOwnerFromAccount(user);
    }, [user]);

    useFocusEffect(
        React.useCallback(() => {
            refreshUser();
            loadAccountProfile();
        }, [token])
    );

    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successRefNum, setSuccessRefNum] = useState('');

    // Section Titles
    const sections = [
        { title: 'Land Identification', icon: 'map', required: true },
        { title: 'Owner Information', icon: 'person', required: true },
        { title: 'Documents', icon: 'document', required: true },
        { title: 'Verification Purpose', icon: 'clipboard', required: false },
        { title: 'Declaration', icon: 'shield-checkmark', required: true },
    ];


    // ✅ Get available zones based on selected region
    const getAvailableZones = () => {
        if (!formData.location.region) return [];
        const regionData = ETHIOPIA_LOCATIONS[formData.location.region as keyof typeof ETHIOPIA_LOCATIONS];
        return regionData ? Object.keys(regionData) : [];
    };

    // ✅ Get available weredas based on selected zone
    const getAvailableWeredas = () => {
        if (!formData.location.region || !formData.location.zone) return [];
        const regionData = ETHIOPIA_LOCATIONS[formData.location.region as keyof typeof ETHIOPIA_LOCATIONS];
        const zoneData = regionData?.[formData.location.zone as keyof typeof regionData];
        return zoneData ? Object.keys(zoneData) : [];
    };

    // ✅ Get available kebeles based on selected wereda
    const getAvailableKebeles = () => {
        if (!formData.location.region || !formData.location.zone || !formData.location.wereda) return [];
        const regionData = ETHIOPIA_LOCATIONS[formData.location.region as keyof typeof ETHIOPIA_LOCATIONS];
        const zoneData = regionData?.[formData.location.zone as keyof typeof zoneData];
        const weredaData = zoneData?.[formData.location.wereda as keyof typeof zoneData];
        return weredaData || [];
    };

    // ✅ Handle location change (cascade reset)
    const handleLocationChange = (field: string, value: string) => {
        setFormData(prev => {
            const updated = { ...prev, location: { ...prev.location, [field]: value } };

            // Reset dependent fields when parent changes
            if (field === 'region') {
                updated.location.zone = '';
                updated.location.wereda = '';
                updated.location.kebele = '';
            } else if (field === 'zone') {
                updated.location.wereda = '';
                updated.location.kebele = '';
            } else if (field === 'wereda') {
                updated.location.kebele = '';
            }

            return updated;
        });
    };

    // Validate Section 1 (Land Identification)
    const validateLandIdentification = () => {
        if (!formData.plotNumber.trim()) {
            Alert.alert('Error', 'Please enter Plot/Parcel Number');
            return false;
        }
        if (!formData.plotNumber.match(/^PLOT-\d{4}-\d{5}$/i)) {
            Alert.alert('Error', 'Invalid Plot Number format. Use: PLOT-2024-12345');
            return false;
        }
        if (!formData.landSize || parseFloat(formData.landSize) <= 0) {
            Alert.alert('Error', 'Please enter valid land size');
            return false;
        }
        if (!formData.landUseType) {
            Alert.alert('Error', 'Please select land use type');
            return false;
        }
        if (!formData.location.region || !formData.location.zone || !formData.location.wereda || !formData.location.kebele) {
            Alert.alert('Error', 'Please select complete location (Region, Zone, Wereda, Kebele)');
            return false;
        }
        return true;
    };

    // Validate Section 2 (Owner Information) — uses logged-in account when fields are empty
    const validateOwnerInformation = () => {
        const owner = resolveOwnerFields();

        if (!owner.ownerName) {
            Alert.alert('Error', 'Owner name is required. Complete your profile or sign in again.');
            return false;
        }
        if (!owner.ownerNationalId) {
            Alert.alert(
                'Error',
                'National ID (Fayda) is required. Update your profile with your Fayda ID, then try again.'
            );
            return false;
        }
        if (!owner.relationship) {
            Alert.alert('Error', 'Please select relationship to land');
            return false;
        }

        setFormData((prev) => ({
            ...prev,
            ownerName: owner.ownerName,
            ownerNationalId: owner.ownerNationalId,
            relationship: owner.relationship,
        }));
        return true;
    };

    // Validate Section 3 (Documents)
    const validateDocuments = () => {
        if (!formData.documents.titleDeed) {
            Alert.alert('Error', 'Land Title Deed is required');
            return false;
        }
        if (!formData.documents.surveyMap) {
            Alert.alert('Error', 'Survey Map is required');
            return false;
        }
        return true;
    };

    // Validate Section 5 (Declaration)
    const validateDeclaration = () => {
        if (!formData.acceptDeclaration1 || !formData.acceptDeclaration2) {
            Alert.alert('Error', 'You must accept both declarations');
            return false;
        }
        return true;
    };

    // Navigate to Section
    const goToSection = (index: number) => {
        if (index > currentSection) {
            if (currentSection === 0 && !validateLandIdentification()) return;
            if (currentSection === 1 && !validateOwnerInformation()) return;
            if (currentSection === 2 && !validateDocuments()) return;
            if (currentSection === 4 && !validateDeclaration()) return;
        }
        setCurrentSection(index);
    };

    const handleContinue = () => {
        if (currentSection < sections.length - 1) {
            goToSection(currentSection + 1);
        }
    };

    const handleBack = () => {
        if (currentSection > 0) {
            goToSection(currentSection - 1);
        }
    };

    // Handle Document Upload
    const handleUpload = async (docType: string) => {
        try {
            console.log('🔍 Starting upload for:', docType);

            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', '*/*'],
                copyToCacheDirectory: true,
            });

            console.log('📄 Picker result:', result);

            if (result.canceled || !result.assets || result.assets.length === 0) {
                console.log('⏹️ User cancelled selection');
                return;
            }

            const file = result.assets[0];
            console.log('📁 Selected file:', file.name, file.uri);

            const maxSize = 10 * 1024 * 1024;
            if (file.size && file.size > maxSize) {
                Alert.alert('File Too Large', 'Maximum file size is 10MB. Please choose a smaller file.');
                return;
            }

            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
            if (file.mimeType && !allowedTypes.includes(file.mimeType)) {
                Alert.alert('Invalid File Type', 'Please upload PDF, JPEG, or PNG files only.');
                return;
            }

            setFormData(prev => ({
                ...prev,
                documents: {
                    ...prev.documents,
                    [docType]: {
                        name: file.name || 'Document',
                        uri: file.uri,
                        type: file.mimeType,
                        size: file.size,
                    },
                },
            }));

            Alert.alert('✓ Uploaded', `${file.name || 'Document'} added successfully`);

        } catch (error: any) {
            console.error('❌ Upload failed:', error);
            console.error('❌ Error message:', error.message);

            Alert.alert(
                'Upload Failed',
                'Could not access the selected file. Please try again with a different file.',
                [{ text: 'OK' }]
            );
        }
    };

    // Handle GPS Location
    const getCurrentLandLocation = async () => {
        try {
            setLocationLoading(true);
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location permission required');
                setLocationLoading(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            let reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });

            if (reverseGeocode.length > 0) {
                const addr = reverseGeocode[0];
                setFormData(prev => ({
                    ...prev,
                    location: {
                        region: addr.region || 'Amhara',
                        zone: addr.subregion || 'Bahir Dar Zone',
                        wereda: addr.district || 'Bahir Dar Wereda',
                        kebele: addr.street || 'Kebele 03',
                    },
                    coordinates: { latitude, longitude },
                }));
                Alert.alert('Success', 'Location detected!');
            }
        } catch (error) {
            console.error('Location error:', error);
            Alert.alert('Error', 'Could not fetch location');
        } finally {
            setLocationLoading(false);
        }
    };

    // Handle Submit
    const handleSubmit = async () => {
        if (!validateDeclaration()) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/requests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    type: 'Ownership Verification',
                    plotNumber: formData.plotNumber,
                    region: formData.location.region,
                    zone: formData.location.zone,
                    wereda: formData.location.wereda,
                    kebele: formData.location.kebele,
                    landSize: formData.landSize,
                    landUseType: formData.landUseType,
                    reason: formData.verificationReason,
                    metadata: {
                        ownerName: formData.ownerName,
                        ownerId: formData.ownerNationalId,
                        relationship: formData.relationship,
                        additionalNotes: formData.additionalNotes,
                        contactPreference: formData.contactPreference,
                        urgency: formData.urgency
                    }
                })
            });

            const data = await response.json();
            if (response.ok) {
                const refNum = data.request?.referenceNumber || `VER-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
                setSuccessRefNum(refNum);
                setShowSuccessModal(true);
            } else {
                Alert.alert('Error', data.error || 'Submission failed');
            }
        } catch (error) {
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Render Section Card - ✅ ENTIRE CARD IS SCROLLABLE VERTICALLY
    const renderSectionCard = (section: any, index: number) => (
        <ScrollView
            key={index}
            className="w-full px-6"
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 30 }}
        >
            {/* Section Header */}
            <View className="flex-row items-center mb-6">
                <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${currentSection >= index ? 'bg-[#125f43ff]' : 'bg-gray-300'}`}>
                    <Ionicons name={section.icon as any} size={22} color={currentSection >= index ? 'white' : '#9CA3AF'} />
                </View>
                <View className="flex-1">
                    <Text className="text-white text-xl font-bold">{section.title}</Text>
                    {section.required && <Text className="text-white/70 text-xs">* Required fields</Text>}
                </View>
                <View className="flex-row items-center">
                    <Text className="text-white/80 text-sm mr-2">{index + 1} of {sections.length}</Text>
                    <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center">
                        <Text className="text-white font-bold text-sm">{index + 1}</Text>
                    </View>
                </View>
            </View>

            {/* Section Content */}
            <View className="bg-white/90 rounded-3xl px-6 py-6 shadow-2xl mb-4">
                {index === 0 && renderLandIdentification()}
                {index === 1 && renderOwnerInformation()}
                {index === 2 && renderDocuments()}
                {index === 3 && renderVerificationPurpose()}
                {index === 4 && renderDeclaration()}
            </View>

            {/* ✅ Navigation Buttons - Scroll WITH the content */}
            <View className="flex-row justify-between">
                <TouchableOpacity
                    onPress={() => {
                        if (currentSection === 0) {
                            navigation.navigate('MainApp');
                        } else {
                            handleBack();
                        }
                    }}
                    className="flex-row items-center px-6 py-3 rounded-xl bg-white/20"
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={20} color="white" />
                    <Text className="text-white text-base font-semibold ml-2">
                        {currentSection === 0 ? 'Home' : 'Back'}
                    </Text>
                </TouchableOpacity>

                {currentSection < sections.length - 1 ? (
                    <TouchableOpacity
                        onPress={handleContinue}
                        className="flex-row items-center bg-[#125f43ff] px-6 py-3 rounded-xl shadow-lg"
                    >
                        <Text className="text-white text-base font-bold mr-2">Continue</Text>
                        <Ionicons name="arrow-forward" size={20} color="white" />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={loading}
                        className="flex-row items-center bg-[#125f43ff] px-6 py-3 rounded-xl shadow-lg"
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <>
                                <Ionicons name="cloud-upload" size={20} color="white" />
                                <Text className="text-white text-base font-bold ml-2">Submit Request</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );

    // ✅ Section 1: Land Identification (WITH DROPDOWNS - SAME UI LAYOUT)
    const renderLandIdentification = () => (
        <View className="w-full">
            {/* Plot Number */}
            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Plot/Parcel Number *</Text>
                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200">
                    <Ionicons name="location" size={22} color="#9CA3AF" />
                    <TextInput
                        className="flex-1 text-gray-800 text-base ml-3"
                        placeholder="PLOT-2024-12345"
                        placeholderTextColor="#9CA3AF"
                        value={formData.plotNumber}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, plotNumber: text.toUpperCase() }))}
                        autoCapitalize="characters"
                    />
                </View>
                <Text className="text-gray-500 text-xs mt-1 ml-1">Format: PLOT-2024-12345</Text>
            </View>

            {/* Location with GPS */}
            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Location *</Text>
                <TouchableOpacity
                    onPress={getCurrentLandLocation}
                    disabled={locationLoading}
                    className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200 mb-2"
                >
                    {locationLoading ? (
                        <ActivityIndicator size="small" color="#125f43ff" />
                    ) : (
                        <Ionicons name="locate" size={22} color="#125f43ff" />
                    )}
                    <Text className="text-[#125f43ff] text-base ml-3 font-semibold">
                        {locationLoading ? 'Detecting...' : '📍 Use Current Location'}
                    </Text>
                </TouchableOpacity>

                {/* ✅ Dropdown Fields - Same side-by-side layout as original TextInputs */}
                <View className="flex-row justify-between mb-2">
                    <DropdownField
                        label="Region"
                        value={formData.location.region}
                        options={Object.keys(ETHIOPIA_LOCATIONS)}
                        onSelect={(value) => handleLocationChange('region', value)}
                        placeholder="Select Region"
                    />

                    <DropdownField
                        label="Zone"
                        value={formData.location.zone}
                        options={getAvailableZones()}
                        onSelect={(value) => handleLocationChange('zone', value)}
                        placeholder="Select Zone"
                        disabled={!formData.location.region}
                    />
                </View>

                <View className="flex-row justify-between">
                    <DropdownField
                        label="Wereda"
                        value={formData.location.wereda}
                        options={getAvailableWeredas()}
                        onSelect={(value) => handleLocationChange('wereda', value)}
                        placeholder="Select Wereda"
                        disabled={!formData.location.zone}
                    />

                    <DropdownField
                        label="Kebele"
                        value={formData.location.kebele}
                        options={getAvailableKebeles()}
                        onSelect={(value) => handleLocationChange('kebele', value)}
                        placeholder="Select Kebele"
                        disabled={!formData.location.wereda}
                    />
                </View>
            </View>

            {/* Land Size */}
            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Land Size *</Text>
                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200">
                    <Ionicons name="expand" size={22} color="#9CA3AF" />
                    <TextInput
                        className="flex-1 text-gray-800 text-base ml-3"
                        placeholder="450"
                        placeholderTextColor="#9CA3AF"
                        value={formData.landSize}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, landSize: text }))}
                        keyboardType="numeric"
                    />
                    <View className="bg-white rounded-lg px-3 py-2 border border-gray-200 ml-2">
                        <Text className="text-gray-700 text-sm font-semibold">{formData.landSizeUnit}</Text>
                    </View>
                </View>
            </View>

            {/* Land Use Type */}
            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Land Use Type *</Text>
                <View className="flex-row flex-wrap">
                    {['Residential', 'Commercial', 'Agricultural', 'Mixed'].map((type) => (
                        <TouchableOpacity
                            key={type}
                            onPress={() => setFormData(prev => ({ ...prev, landUseType: type }))}
                            className={`px-4 py-2 rounded-xl mr-2 mb-2 border-2 ${formData.landUseType === type
                                ? 'bg-[#125f43ff] border-[#125f43ff]'
                                : 'bg-white border-gray-200'
                                }`}
                        >
                            <Text className={`text-sm font-semibold ${formData.landUseType === type ? 'text-white' : 'text-gray-700'
                                }`}>{type}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );

    // Section 2: Owner Information
    const renderOwnerInformation = () => {
        const account = profile || user;
        const displayName = formData.ownerName || account?.fullName || '';
        const displayFayda = formData.ownerNationalId || account?.faydaId || '';
        const accountReady = Boolean(displayName && displayFayda);

        return (
        <View className="w-full">
            <View className="mb-4 p-3 rounded-xl bg-[#125f43ff]/10 border border-[#125f43ff]/20">
                <Text className="text-[#125f43ff] text-sm font-semibold">
                    Loaded from your account
                </Text>
                <Text className="text-gray-600 text-xs mt-1 leading-5">
                    Name and Fayda ID are taken from your login. Relationship defaults to Owner — tap Continue when ready.
                </Text>
                {account?.email ? (
                    <Text className="text-gray-500 text-xs mt-1">{account.email}</Text>
                ) : null}
            </View>

            {/* Owner Name */}
            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Owner Name *</Text>
                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200">
                    <Ionicons name="person" size={22} color="#9CA3AF" />
                    <TextInput
                        className="flex-1 text-gray-800 text-base ml-3"
                        placeholder="From your account"
                        placeholderTextColor="#9CA3AF"
                        value={displayName}
                        editable={false}
                    />
                    {displayName ? (
                        <Ionicons name="checkmark-circle" size={22} color="#125f43ff" />
                    ) : null}
                </View>
            </View>

            {/* National ID */}
            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">National ID (Fayda) *</Text>
                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200">
                    <Ionicons name="card" size={22} color="#9CA3AF" />
                    <TextInput
                        className="flex-1 text-gray-800 text-base ml-3"
                        placeholder="From your account"
                        placeholderTextColor="#9CA3AF"
                        value={displayFayda}
                        editable={false}
                    />
                    {displayFayda ? (
                        <Ionicons name="checkmark-circle" size={22} color="#125f43ff" />
                    ) : null}
                </View>
                <Text className="text-gray-500 text-xs mt-1 ml-1">
                    {displayFayda ? '✓ Verified from your login credentials' : 'Fayda ID missing — update profile'}
                </Text>
            </View>

            {/* Relationship */}
            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Relationship to Land *</Text>
                <View className="flex-row flex-wrap">
                    {['Owner', 'Heir', 'Legal Agent', 'Co-owner'].map((rel) => (
                        <TouchableOpacity
                            key={rel}
                            onPress={() => setFormData(prev => ({ ...prev, relationship: rel }))}
                            className={`px-4 py-2 rounded-xl mr-2 mb-2 border-2 ${formData.relationship === rel
                                ? 'bg-[#125f43ff] border-[#125f43ff]'
                                : 'bg-white border-gray-200'
                                }`}
                        >
                            <Text className={`text-sm font-semibold ${formData.relationship === rel ? 'text-white' : 'text-gray-700'
                                }`}>{rel}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {!accountReady && (
                <Text className="text-amber-700 text-xs mb-2">
                    Sign out and register again with a complete Fayda ID, or update your profile.
                </Text>
            )}
        </View>
        );
    };

    // Section 3: Documents
    const renderDocuments = () => (
        <View className="w-full">
            {/* Title Deed */}
            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Land Title Deed (Sened) *</Text>
                <TouchableOpacity
                    onPress={() => handleUpload('titleDeed')}
                    className="flex-row items-center justify-between bg-gray-50 rounded-xl px-4 py-4 border-2 border-dashed border-gray-300"
                >
                    <View className="flex-row items-center">
                        <Ionicons name="document-text" size={24} color="#9CA3AF" />
                        <View className="ml-3">
                            <Text className="text-gray-700 text-sm font-semibold">
                                {formData.documents.titleDeed
                                    ? `✓ ${formData.documents.titleDeed.name}`
                                    : 'Upload Title Deed'}
                            </Text>
                            <Text className="text-gray-500 text-xs">PDF, JPEG, PNG • Max 10MB</Text>
                        </View>
                    </View>
                    <Ionicons name="cloud-upload" size={24} color="#125f43ff" />
                </TouchableOpacity>
            </View>

            {/* Survey Map */}
            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Survey Map/Plan *</Text>
                <TouchableOpacity
                    onPress={() => handleUpload('surveyMap')}
                    className="flex-row items-center justify-between bg-gray-50 rounded-xl px-4 py-4 border-2 border-dashed border-gray-300"
                >
                    <View className="flex-row items-center">
                        <Ionicons name="map" size={24} color="#9CA3AF" />
                        <View className="ml-3">
                            <Text className="text-gray-700 text-sm font-semibold">
                                {formData.documents.surveyMap
                                    ? `✓ ${formData.documents.surveyMap.name}`
                                    : 'Upload Survey Map'}
                            </Text>
                            <Text className="text-gray-500 text-xs">PDF, JPEG, PNG • Max 10MB</Text>
                        </View>
                    </View>
                    <Ionicons name="cloud-upload" size={24} color="#125f43ff" />
                </TouchableOpacity>
            </View>

            {/* Owner ID Copy */}
            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Owner ID Copy</Text>
                <View className="flex-row items-center bg-green-50 rounded-xl px-4 py-4 border border-green-200">
                    <Ionicons name="checkmark-circle" size={24} color="#125f43ff" />
                    <View className="ml-3 flex-1">
                        <Text className="text-gray-700 text-sm font-semibold">Auto-filled from profile</Text>
                        <Text className="text-gray-500 text-xs">National ID already verified</Text>
                    </View>
                </View>
            </View>

            {/* Document Requirements Info */}
            <View className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <View className="flex-row items-start">
                    <Ionicons name="information-circle" size={20} color="#2563EB" />
                    <Text className="text-blue-700 text-xs ml-2 flex-1">
                        All documents must be clear, readable, and in PDF, JPEG, or PNG format. Maximum file size: 10MB per document (BR-6).
                    </Text>
                </View>
            </View>
        </View>
    );

    // Section 4: Verification Purpose
    const renderVerificationPurpose = () => (
        <View className="w-full">
            {/* Reason */}
            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Verification Reason</Text>
                <View className="flex-row flex-wrap">
                    {['Property Sale', 'Loan/Collateral', 'Inheritance', 'Dispute', 'Government Req', 'Other'].map((reason) => (
                        <TouchableOpacity
                            key={reason}
                            onPress={() => setFormData(prev => ({ ...prev, verificationReason: reason }))}
                            className={`px-3 py-2 rounded-xl mr-2 mb-2 border ${formData.verificationReason === reason
                                ? 'bg-[#125f43ff] border-[#125f43ff]'
                                : 'bg-white border-gray-200'
                                }`}
                        >
                            <Text className={`text-xs font-semibold ${formData.verificationReason === reason ? 'text-white' : 'text-gray-700'
                                }`}>{reason}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Notes */}
            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Additional Notes</Text>
                <TextInput
                    className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 text-gray-800"
                    placeholder="Brief description of verification need (optional)"
                    placeholderTextColor="#9CA3AF"
                    value={formData.additionalNotes}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, additionalNotes: text }))}
                    multiline
                    numberOfLines={4}
                />
            </View>

            {/* Contact Preference */}
            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Contact Preference</Text>
                <View className="flex-row">
                    {['SMS', 'Email', 'In-App'].map((pref) => (
                        <TouchableOpacity
                            key={pref}
                            onPress={() => setFormData(prev => ({ ...prev, contactPreference: pref }))}
                            className={`flex-1 py-3 rounded-xl mr-2 ${formData.contactPreference === pref
                                ? 'bg-[#125f43ff]'
                                : 'bg-gray-100'
                                }`}
                        >
                            <Text className={`text-center text-sm font-semibold ${formData.contactPreference === pref ? 'text-white' : 'text-gray-700'
                                }`}>{pref}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Urgency */}
            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Urgency Level</Text>
                <View className="flex-row">
                    {['Normal', 'Urgent'].map((urgency) => (
                        <TouchableOpacity
                            key={urgency}
                            onPress={() => setFormData(prev => ({ ...prev, urgency: urgency }))}
                            className={`flex-1 py-3 rounded-xl mr-2 ${formData.urgency === urgency
                                ? urgency === 'Urgent' ? 'bg-red-500' : 'bg-[#125f43ff]'
                                : 'bg-gray-100'
                                }`}
                        >
                            <Text className={`text-center text-sm font-semibold ${formData.urgency === urgency ? 'text-white' : 'text-gray-700'
                                }`}>{urgency}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );

    // Section 5: Declaration
    const renderDeclaration = () => (
        <View className="w-full">
            {/* Declaration 1 */}
            <TouchableOpacity
                onPress={() => setFormData(prev => ({ ...prev, acceptDeclaration1: !prev.acceptDeclaration1 }))}
                className="flex-row items-start mb-4"
            >
                <View className={`w-6 h-6 rounded border-2 mr-3 mt-1 items-center justify-center ${formData.acceptDeclaration1 ? 'bg-[#125f43ff] border-[#125f43ff]' : 'border-gray-400 bg-white'
                    }`}>
                    {formData.acceptDeclaration1 && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
                <Text className="text-gray-700 text-sm flex-1">
                    I declare that the information provided is true and accurate to the best of my knowledge. I understand that false information may result in legal consequences.
                </Text>
            </TouchableOpacity>

            {/* Declaration 2 */}
            <TouchableOpacity
                onPress={() => setFormData(prev => ({ ...prev, acceptDeclaration2: !prev.acceptDeclaration2 }))}
                className="flex-row items-start mb-6"
            >
                <View className={`w-6 h-6 rounded border-2 mr-3 mt-1 items-center justify-center ${formData.acceptDeclaration2 ? 'bg-[#125f43ff] border-[#125f43ff]' : 'border-gray-400 bg-white'
                    }`}>
                    {formData.acceptDeclaration2 && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
                <Text className="text-gray-700 text-sm flex-1">
                    I agree to the Verification Terms & Conditions and authorize land officers to review my documents and verify ownership records.
                </Text>
            </TouchableOpacity>

            {/* Info Box */}
            <View className="bg-green-50 rounded-xl p-4 border border-green-200 mb-4">
                <View className="flex-row items-start">
                    <Ionicons name="shield-checkmark" size={20} color="#125f43ff" />
                    <View className="ml-3 flex-1">
                        <Text className="text-green-800 text-sm font-semibold mb-1">What Happens Next?</Text>
                        <Text className="text-green-700 text-xs">
                            1. Your request will be reviewed by a land officer {"\n"}
                            2. Documents will be validated{"\n"}
                            3. You'll receive notifications at each stage {"\n"}
                            4. Estimated processing time: 3-5 business days
                        </Text>
                    </View>
                </View>
            </View>

            {/* Reference Info */}
            <View className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <Text className="text-blue-800 text-xs font-semibold mb-1">📋 Track Your Request</Text>
                <Text className="text-blue-700 text-xs">
                    After submission, you'll receive a reference number. Use it to track your request status in real-time.
                </Text>
            </View>
        </View>
    );

    return (
        // ✅ KEYBOARD HANDLING: Dismiss keyboard on tap outside
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            {/* ✅ KEYBOARD AVOIDING: Scrolls entire screen up when keyboard opens */}
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 30}  // ✅ Increased offset for Android
                style={{ flex: 1 }}  // ✅ Ensure it takes full height
            >
                <View className="flex-1">
                    <StatusBar barStyle="light-content" backgroundColor="#125f43ff" />

                    <LinearGradient
                        colors={['#125f43ff', '#1a7f5a']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="flex-1"
                    >
                        {/* Progress Bar */}
                        <View className="px-6 pt-8 pb-4">
                            <View className="flex-row justify-between mb-5">
                                {sections.map((_, index) => (
                                    <View
                                        key={index}
                                        className={`h-1 flex-1 rounded-full mx-0.5 ${index <= currentSection ? 'bg-white' : 'bg-white/30'}`}
                                    />
                                ))}
                            </View>
                            <Text className="text-white/80 text-xs text-center">
                                Section {currentSection + 1} of {sections.length}: {sections[currentSection].title}
                            </Text>
                        </View>

                        {/* Active Section Card Container */}
                        <View className="flex-1 w-full">
                            {renderSectionCard(sections[currentSection], currentSection)}
                        </View>
                    </LinearGradient>
                </View>

                {/* Premium Success Modal */}
                <Modal
                    visible={showSuccessModal}
                    transparent={true}
                    animationType="fade"
                    statusBarTranslucent
                    onRequestClose={() => setShowSuccessModal(false)}
                >
                    <View className="flex-1 bg-black/60 justify-center items-center px-6">
                        <View className="bg-white rounded-3xl p-6 w-full max-w-md items-center shadow-2xl">
                            {/* Checked Animated Ring */}
                            <View className="w-20 h-20 bg-green-50 rounded-full items-center justify-center mb-4 border-4 border-green-100">
                                <Ionicons name="checkmark-circle" size={54} color="#125f43" />
                            </View>
                            
                            {/* Title */}
                            <Text className="text-xl font-bold text-gray-800 text-center mb-1">
                                Request Submitted!
                            </Text>
                            <Text className="text-xs text-gray-400 text-center mb-6">
                                ማመልከቻዎ በተሳካ ሁኔታ ገብቷል!
                            </Text>

                            {/* Info Box */}
                            <View className="bg-gray-50 rounded-2xl p-4 w-full mb-6 border border-gray-100">
                                <View className="flex-row justify-between items-center mb-2">
                                    <Text className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Reference Number</Text>
                                    <Text className="text-[10px] text-gray-400 font-medium">የማጣቀሻ ቁጥር</Text>
                                </View>
                                <View className="bg-white border border-gray-100 rounded-xl p-3 items-center flex-row justify-between mb-4">
                                    <Text className="font-mono text-base font-bold text-gray-800 tracking-wider">
                                        {successRefNum}
                                    </Text>
                                    <TouchableOpacity 
                                        onPress={() => {
                                            Alert.alert('Copied', 'Reference number copied to clipboard!');
                                        }}
                                        className="p-1.5 bg-gray-100 rounded-lg"
                                    >
                                        <Ionicons name="copy-outline" size={16} color="#4B5563" />
                                    </TouchableOpacity>
                                </View>

                                <View className="flex-row items-center justify-between border-t border-gray-100 pt-3">
                                    <View className="flex-row items-center">
                                        <Ionicons name="time-outline" size={16} color="#6B7280" />
                                        <Text className="text-xs text-gray-600 font-medium ml-1.5">Estimated Processing</Text>
                                    </View>
                                    <Text className="text-xs font-bold text-[#125f43ff]">3-5 Business Days</Text>
                                </View>
                            </View>

                            {/* CTA Actions */}
                            <View className="w-full gap-3">
                                <TouchableOpacity
                                    onPress={() => {
                                        setShowSuccessModal(false);
                                        navigation.navigate('TrackRequest', { referenceNumber: successRefNum });
                                    }}
                                    className="bg-[#125f43ff] py-3.5 rounded-xl w-full items-center flex-row justify-center shadow-lg"
                                >
                                    <Ionicons name="eye" size={18} color="white" />
                                    <Text className="text-white font-bold text-base ml-2">Track Request Progress</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => {
                                        setFormData({
                                            plotNumber: '',
                                            previousCertificateNumber: '',
                                            previousCertificate: null,
                                            ownerName: user?.fullName || '',
                                            ownerNationalId: user?.faydaId || '',
                                            documents: {
                                                proofOfOwnership: null,
                                                sitePlan: null,
                                                idCopy: null,
                                                taxReceipt: null,
                                            },
                                            purpose: '',
                                            customPurpose: '',
                                            urgency: 'routine',
                                            additionalNotes: '',
                                            contactPreference: 'email',
                                            acceptDeclaration1: false,
                                            acceptDeclaration2: false,
                                        });
                                        setCurrentSection(0);
                                        setShowSuccessModal(false);
                                    }}
                                    className="border border-gray-200 bg-white py-3 rounded-xl w-full items-center flex-row justify-center"
                                >
                                    <Ionicons name="refresh" size={18} color="#4B5563" />
                                    <Text className="text-gray-600 font-bold text-base ml-2">Submit Another Request</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}