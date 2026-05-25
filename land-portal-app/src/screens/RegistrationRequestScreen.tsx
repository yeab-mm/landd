import React, { useState, useRef } from 'react';
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
    TouchableWithoutFeedback,
    Keyboard,
    Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as Location from 'expo-location';

type RootStackParamList = {
    RegistrationRequest: undefined;
    RequestDetail: { referenceNumber: string };
    MainApp: undefined;
};

type RegistrationRequestScreenProp = StackNavigationProp<RootStackParamList, 'RegistrationRequest'>;

// ✅ Ethiopian Location Data (Cascading Dropdowns)
const ETHIOPIA_LOCATIONS = {
    'Amhara': {
        'Bahir Dar Zone': {
            'Bahir Dar Wereda': ['Kebele 01', 'Kebele 02', 'Kebele 03', 'Kebele 04', 'Kebele 05', 'Kebele 06', 'Kebele 07', 'Kebele 08', 'Kebele 09'],
            'Bure Wereda': ['Kebele 01', 'Kebele 02', 'Kebele 03'],
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

// ✅ Simple Dropdown Component
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
            <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">{label}</Text>
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

// ✅ Document Upload Component
const DocumentUploadField = ({
    label,
    file,
    onUpload,
    required = false
}: {
    label: string;
    file: any;
    onUpload: () => void;
    required?: boolean;
}) => (
    <View className="mb-3">
        <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">
            {label} {required && <Text className="text-red-500">*</Text>}
        </Text>
        <TouchableOpacity
            onPress={onUpload}
            className="flex-row items-center justify-between bg-gray-50 rounded-xl px-4 py-3.5 border-2 border-dashed border-gray-300"
        >
            <View className="flex-row items-center">
                <Ionicons name="document-text" size={24} color="#9CA3AF" />
                <View className="ml-3">
                    <Text className="text-gray-700 text-sm font-semibold">
                        {file ? `✓ ${file.name}` : 'Upload Document'}
                    </Text>
                    <Text className="text-gray-500 text-xs">PDF, JPEG, PNG • Max 10MB</Text>
                </View>
            </View>
            <Ionicons name="cloud-upload" size={24} color="#125f43ff" />
        </TouchableOpacity>
    </View>
);

// ✅ Photo Upload Component
const PhotoUploadField = ({
    label,
    file,
    onUpload,
    required = false
}: {
    label: string;
    file: any;
    onUpload: () => void;
    required?: boolean;
}) => (
    <View className="mb-1">
        <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">
            {label} {required && <Text className="text-red-500">*</Text>}
        </Text>
        <TouchableOpacity
            onPress={onUpload}
            className="flex-row items-center justify-between bg-gray-50 rounded-xl px-4 py-3.5 border-2 border-dashed border-gray-300"
        >
            <View className="flex-row items-center">
                <Ionicons name="image" size={24} color="#9CA3AF" />
                <View className="ml-3">
                    <Text className="text-gray-700 text-sm font-semibold">
                        {file ? `✓ ${file.name}` : 'Upload Photo'}
                    </Text>
                    <Text className="text-gray-500 text-xs">JPEG, PNG • Max 5MB</Text>
                </View>
            </View>
            <Ionicons name="camera" size={20} color="#125f43ff" />
        </TouchableOpacity>
    </View>
);

export default function RegistrationRequestScreen() {
    const navigation = useNavigation<RegistrationRequestScreenProp>();
    const scrollViewRef = useRef<ScrollView>(null);
    const [currentSection, setCurrentSection] = useState(0);

    // Form State
    const [formData, setFormData] = useState({
        // Section 0: Land Acquisition Type
        acquisitionType: '', // 'allocation', 'bidding', 'inheritance', 'gift'

        // Section 0.5: Land Registration Status
        isPreviouslyRegistered: '', // 'yes', 'no'

        // Section 1: Applicant Information
        applicantInfo: {
            fullName: 'Abebe Gizaw',
            nationalId: '1234 5678 9012 3456',
            kebeleIdFront: null,
            kebeleIdBack: null,
            applicantPhoto: null,
            maritalStatus: '', // 'single', 'married', 'divorced', 'widowed'
            spouseName: '',
            spouseNationalId: '',
            spouseKebeleId: null,
            spouseConsent: false,
            relationshipToLand: '', // 'owner', 'representative', 'heir', 'co-owner', 'guardian'
            ownerName: '', // if representative
            ownerNationalId: '', // if representative
            authorizationDocument: null, // if representative
            phone: '+251 911 234 567',
            email: 'abebe@example.com',
            address: 'Bahir Dar, Kebele 03',
        },

        // Section 2: Land Information
        landInfo: {
            plotNumber: '',
            previousCertificateNumber: '',
            previousCertificate: null,
            previousOwnerName: '',
            transferDocument: null,
            location: { region: '', zone: '', wereda: '', kebele: '' },
            coordinates: { latitude: null, longitude: null },
            landSize: '',
            landSizeUnit: 'm²',
            landUseType: '',
            landStatus: '', // 'vacant', 'under-construction', 'fully-built', 'agricultural'
            boundaries: { north: '', south: '', east: '', west: '' },
        },

        // Section 3: Acquisition-Specific Documents
        acquisitionDocuments: {
            // Allocation
            allocationLetter: null,
            governmentApproval: null,
            allocationPaymentReceipt: null,
            // Bidding
            biddingWinCertificate: null,
            biddingPaymentReceipt: null,
            auctionAnnouncement: null,
            // Inheritance
            deathCertificate: null,
            inheritanceCourtDocument: null,
            familyAgreement: null,
            heirList: null,
            // Gift
            giftAgreement: null,
            donorOwnershipCertificate: null,
            donorIdCopy: null,
        },

        // Section 4: Common Documents
        commonDocuments: {
            nationalIdCopy: null, // Auto from profile
            surveyMap: null,
            landPhotos: [null, null, null, null], // N, S, E, W
            witnesses: [
                { name: '', phone: '', idCopy: null, statement: null },
                { name: '', phone: '', idCopy: null, statement: null },
            ],
        },

        // Section 5: Declaration
        acceptDeclaration1: false,
        acceptDeclaration2: false,
        acceptDeclaration3: false,
    });

    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);

    // Section Titles
    const sections = [
        { title: 'Acquisition Type', icon: 'git-merge', required: true },
        { title: 'Registration Status', icon: 'document-text', required: true },
        { title: 'Applicant Info', icon: 'person', required: true },
        { title: 'Land Information', icon: 'map', required: true },
        { title: 'Documents', icon: 'folder', required: true },
        { title: 'Common Documents', icon: 'images', required: true },
        { title: 'Declaration', icon: 'shield-checkmark', required: true },
    ];

    const CARD_WIDTH = 405;

    // ✅ Get available zones/weeredas/kebeles
    const getAvailableZones = () => {
        if (!formData.landInfo.location.region) return [];
        const regionData = ETHIOPIA_LOCATIONS[formData.landInfo.location.region as keyof typeof ETHIOPIA_LOCATIONS];
        return regionData ? Object.keys(regionData) : [];
    };

    const getAvailableWeredas = () => {
        if (!formData.landInfo.location.region || !formData.landInfo.location.zone) return [];
        const regionData = ETHIOPIA_LOCATIONS[formData.landInfo.location.region as keyof typeof ETHIOPIA_LOCATIONS];
        const zoneData = regionData?.[formData.landInfo.location.zone as keyof typeof regionData];
        return zoneData ? Object.keys(zoneData) : [];
    };

    const getAvailableKebeles = () => {
        if (!formData.landInfo.location.region || !formData.landInfo.location.zone || !formData.landInfo.location.wereda) return [];
        const regionData = ETHIOPIA_LOCATIONS[formData.landInfo.location.region as keyof typeof ETHIOPIA_LOCATIONS];
        const zoneData = regionData?.[formData.landInfo.location.zone as keyof typeof zoneData];
        const weredaData = zoneData?.[formData.landInfo.location.wereda as keyof typeof zoneData];
        return weredaData || [];
    };

    // ✅ Handle location change
    const handleLocationChange = (field: string, value: string) => {
        setFormData(prev => {
            const updated = { ...prev, landInfo: { ...prev.landInfo, location: { ...prev.landInfo.location, [field]: value } } };
            if (field === 'region') {
                updated.landInfo.location.zone = '';
                updated.landInfo.location.wereda = '';
                updated.landInfo.location.kebele = '';
            } else if (field === 'zone') {
                updated.landInfo.location.wereda = '';
                updated.landInfo.location.kebele = '';
            } else if (field === 'wereda') {
                updated.landInfo.location.kebele = '';
            }
            return updated;
        });
    };

    // ✅ Handle Document Upload
    const handleUpload = async (fieldPath: string, maxSize = 10) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
                copyToCacheDirectory: true,
            });

            if (result.canceled || !result.assets || result.assets.length === 0) return;

            const file = result.assets[0];
            const maxSizeBytes = maxSize * 1024 * 1024;

            if (file.size && file.size > maxSizeBytes) {
                Alert.alert('File Too Large', `Maximum file size is ${maxSize}MB.`);
                return;
            }

            // Navigate through nested state
            const keys = fieldPath.split('.');
            setFormData(prev => {
                const updated = { ...prev };
                let current: any = updated;
                for (let i = 0; i < keys.length - 1; i++) {
                    current = current[keys[i]];
                }
                current[keys[keys.length - 1]] = {
                    name: file.name || 'Document',
                    uri: file.uri,
                    type: file.mimeType,
                    size: file.size,
                };
                return updated;
            });

            Alert.alert('✓ Uploaded', `${file.name || 'Document'} added successfully`);

        } catch (error: any) {
            console.error('Upload failed:', error);
            Alert.alert('Upload Failed', 'Could not access the selected file.');
        }
    };

    // ✅ Handle GPS Location
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
                    landInfo: {
                        ...prev.landInfo,
                        location: {
                            region: addr.region || 'Amhara',
                            zone: addr.subregion || 'Bahir Dar Zone',
                            wereda: addr.district || 'Bahir Dar Wereda',
                            kebele: addr.street || 'Kebele 03',
                        },
                        coordinates: { latitude, longitude },
                    },
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

    // ✅ Validation Functions
    const validateSection = (sectionIndex: number) => {
        switch (sectionIndex) {
            case 0: // Acquisition Type
                if (!formData.acquisitionType) {
                    Alert.alert('Error', 'Please select land acquisition type');
                    return false;
                }
                break;
            case 1: // Registration Status
                if (!formData.isPreviouslyRegistered) {
                    Alert.alert('Error', 'Please select registration status');
                    return false;
                }
                break;
            case 2: // Applicant Info
                if (!formData.applicantInfo.relationshipToLand) {
                    Alert.alert('Error', 'Please select relationship to land');
                    return false;
                }
                if (!formData.applicantInfo.maritalStatus) {
                    Alert.alert('Error', 'Please select marital status');
                    return false;
                }
                if (formData.applicantInfo.maritalStatus === 'married' && !formData.applicantInfo.spouseName) {
                    Alert.alert('Error', 'Please enter spouse name');
                    return false;
                }
                break;
            case 3: // Land Information
                if (!formData.landInfo.landSize || parseFloat(formData.landInfo.landSize) <= 0) {
                    Alert.alert('Error', 'Please enter valid land size');
                    return false;
                }
                if (!formData.landInfo.landUseType) {
                    Alert.alert('Error', 'Please select land use type');
                    return false;
                }
                if (!formData.landInfo.location.kebele) {
                    Alert.alert('Error', 'Please select complete location');
                    return false;
                }
                break;
            case 5: // Common Documents
                if (!formData.commonDocuments.surveyMap) {
                    Alert.alert('Error', 'Survey Map is required');
                    return false;
                }
                break;
            case 6: // Declaration
                if (!formData.acceptDeclaration1 || !formData.acceptDeclaration2 || !formData.acceptDeclaration3) {
                    Alert.alert('Error', 'You must accept all declarations');
                    return false;
                }
                break;
        }
        return true;
    };

    // ✅ Navigate to Section
    const goToSection = (index: number) => {
        if (index > currentSection && !validateSection(currentSection)) return;
        setCurrentSection(index);
        scrollViewRef.current?.scrollTo({ x: index * CARD_WIDTH, animated: true });
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

    // ✅ Handle Submit
    const handleSubmit = () => {
        if (!validateSection(6)) return;

        setLoading(true);

        // Generate Temporary Reference Number
        const referenceNumber = `REG-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        setTimeout(() => {
            Alert.alert(
                'Success',
                `Registration request submitted!\nReference: ${referenceNumber}\nEstimated time: 7-14 business days`,
                [
                    {
                        text: 'Track Request',
                        onPress: () => navigation.navigate('RequestDetail', { referenceNumber }),
                    },
                    {
                        text: 'Submit Another',
                        style: 'cancel',
                        onPress: () => {
                            setCurrentSection(0);
                            scrollViewRef.current?.scrollTo({ x: 0, animated: true });
                        },
                    },
                ]
            );
            setLoading(false);
        }, 2000);
    };

    // ✅ Render Section Card
    const renderSectionCard = (section: any, index: number) => (
        <ScrollView
            key={index}
            className="w-[405px] px-6"
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 20 }}
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
                {index === 0 && renderAcquisitionType()}
                {index === 1 && renderRegistrationStatus()}
                {index === 2 && renderApplicantInfo()}
                {index === 3 && renderLandInformation()}
                {index === 4 && renderAcquisitionDocuments()}
                {index === 5 && renderCommonDocuments()}
                {index === 6 && renderDeclaration()}
            </View>

            {/* Navigation Buttons */}
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
                                <Text className="text-white text-base font-bold ml-2">Submit Registration</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );

    // ✅ Section 0: Land Acquisition Type
    const renderAcquisitionType = () => (
        <View className="w-full">
            <Text className="text-gray-700 text-sm font-semibold mb-4 text-center">How did you acquire this land? *</Text>
            <View className="space-y-3">
                {[
                    { value: 'allocation', label: '🏛️ Government Allocation', desc: 'Land given by government' },
                    { value: 'bidding', label: '🔨 Government Bidding/Auction', desc: 'Purchased through auction' },

                ].map((option) => (
                    <TouchableOpacity
                        key={option.value}
                        onPress={() => setFormData(prev => ({ ...prev, acquisitionType: option.value }))}
                        className={`p-4 rounded-xl border-2 ${formData.acquisitionType === option.value
                            ? 'bg-[#125f43ff] border-[#125f43ff]'
                            : 'bg-white border-gray-200'
                            }`}
                    >
                        <Text className={`text-base font-bold ${formData.acquisitionType === option.value ? 'text-white' : 'text-gray-800'
                            }`}>{option.label}</Text>
                        <Text className={`text-sm ${formData.acquisitionType === option.value ? 'text-white/80' : 'text-gray-500'
                            }`}>{option.desc}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    // ✅ Section 0.5: Land Registration Status
    const renderRegistrationStatus = () => (
        <View className="w-full">
            <Text className="text-gray-700 text-sm font-semibold mb-4 text-center">Is this land previously registered? *</Text>
            <View className="space-y-3">
                {[
                    { value: 'yes', label: 'Yes (Already has registration)', icon: 'checkmark-circle' },
                    { value: 'no', label: 'No (First-time registration)', icon: 'document-text' },
                ].map((option) => (
                    <TouchableOpacity
                        key={option.value}
                        onPress={() => setFormData(prev => ({ ...prev, isPreviouslyRegistered: option.value }))}
                        className={`flex-row items-center p-4 rounded-xl border-2 ${formData.isPreviouslyRegistered === option.value
                            ? 'bg-[#125f43ff] border-[#125f43ff]'
                            : 'bg-white border-gray-200'
                            }`}
                    >
                        <Ionicons
                            name={option.icon as any}
                            size={24}
                            color={formData.isPreviouslyRegistered === option.value ? 'white' : '#9CA3AF'}
                        />
                        <Text className={`text-base font-semibold ml-3 ${formData.isPreviouslyRegistered === option.value ? 'text-white' : 'text-gray-800'
                            }`}>{option.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {formData.isPreviouslyRegistered === 'yes' && (
                <View className="mt-4 space-y-3">
                    <View>
                        <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Previous Certificate Number *</Text>
                        <TextInput
                            className="bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800"
                            placeholder="CERT-2020-XXXXX"
                            placeholderTextColor="#9CA3AF"
                            value={formData.landInfo.previousCertificateNumber}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, landInfo: { ...prev.landInfo, previousCertificateNumber: text } }))}
                        />
                    </View>
                    <DocumentUploadField
                        label="Previous Ownership Certificate *"
                        file={formData.landInfo.previousCertificate}
                        onUpload={() => handleUpload('landInfo.previousCertificate')}
                        required
                    />
                    <View>
                        <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Previous Owner Name *</Text>
                        <TextInput
                            className="bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800"
                            placeholder="Previous owner's full name"
                            placeholderTextColor="#9CA3AF"
                            value={formData.landInfo.previousOwnerName}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, landInfo: { ...prev.landInfo, previousOwnerName: text } }))}
                        />
                    </View>
                    <DocumentUploadField
                        label="Transfer Document *"
                        file={formData.landInfo.transferDocument}
                        onUpload={() => handleUpload('landInfo.transferDocument')}
                        required
                    />
                </View>
            )}
        </View>
    );

    // ✅ Section 1: Applicant Information
    const renderApplicantInfo = () => (
        <View className="w-full">
            {/* Auto-filled Info */}
            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Full Name *</Text>
                <TextInput
                    className="bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800"
                    value={formData.applicantInfo.fullName}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, applicantInfo: { ...prev.applicantInfo, fullName: text } }))}
                />
            </View>

            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">National ID (Fayda) *</Text>
                <TextInput
                    className="bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800"
                    value={formData.applicantInfo.nationalId}
                    editable={false}
                />
            </View>

            {/* Kebele ID Photos */}
            <View className="flex-col mb-1">
                <View className="w-full mb-3">
                    <PhotoUploadField
                        label="Kebele ID (Front) *"
                        file={formData.applicantInfo.kebeleIdFront}
                        onUpload={() => handleUpload('applicantInfo.kebeleIdFront', 5)}
                        required
                    />
                </View>
                <View className="w-full">
                    <PhotoUploadField
                        label="Kebele ID (Back) *"
                        file={formData.applicantInfo.kebeleIdBack}
                        onUpload={() => handleUpload('applicantInfo.kebeleIdBack', 5)}
                        required
                    />
                </View>
            </View>

            {/* Applicant Photo */}
            <PhotoUploadField
                label="Applicant Photo *"
                file={formData.applicantInfo.applicantPhoto}
                onUpload={() => handleUpload('applicantInfo.applicantPhoto', 5)}
                required
            />

            {/* Marital Status */}
            <View className="mb-1">
                <Text className="text-gray-700 text-sm font-semibold mb-1 ml-1">Marital Status *</Text>
                <DropdownField
                    label=""
                    value={formData.applicantInfo.maritalStatus}
                    options={['Single', 'Married', 'Divorced', 'Widowed']}
                    onSelect={(value) => setFormData(prev => ({ ...prev, applicantInfo: { ...prev.applicantInfo, maritalStatus: value.toLowerCase() } }))}
                    placeholder="Select Marital Status"
                />
            </View>

            {/* Spouse Info (if Married) */}
            {formData.applicantInfo.maritalStatus === 'married' && (
                <View className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <Text className="text-blue-800 text-sm font-semibold mb-3">Spouse Information</Text>
                    <TextInput
                        className="bg-white rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800 mb-3"
                        placeholder="Spouse Full Name *"
                        placeholderTextColor="#9CA3AF"
                        value={formData.applicantInfo.spouseName}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, applicantInfo: { ...prev.applicantInfo, spouseName: text } }))}
                    />
                    <TextInput
                        className="bg-white rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800 mb-3"
                        placeholder="Spouse National ID *"
                        placeholderTextColor="#9CA3AF"
                        value={formData.applicantInfo.spouseNationalId}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, applicantInfo: { ...prev.applicantInfo, spouseNationalId: text } }))}
                    />
                    <PhotoUploadField
                        label="Spouse Kebele ID *"
                        file={formData.applicantInfo.spouseKebeleId}
                        onUpload={() => handleUpload('applicantInfo.spouseKebeleId', 5)}
                        required
                    />
                    <TouchableOpacity
                        onPress={() => setFormData(prev => ({ ...prev, applicantInfo: { ...prev.applicantInfo, spouseConsent: !prev.applicantInfo.spouseConsent } }))}
                        className="flex-row items-center mt-3"
                    >
                        <View className={`w-5 h-5 rounded border-2 mr-2 items-center justify-center ${formData.applicantInfo.spouseConsent ? 'bg-[#125f43ff] border-[#125f43ff]' : 'border-gray-400 bg-white'
                            }`}>
                            {formData.applicantInfo.spouseConsent && <Ionicons name="checkmark" size={14} color="white" />}
                        </View>
                        <Text className="text-gray-700 text-sm">Spouse consent for registration</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Relationship to Land */}
            <View className="mb-2">
                <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Relationship to Land *</Text>
                <DropdownField
                    label=""
                    value={formData.applicantInfo.relationshipToLand}
                    options={['Owner', 'Representative/Agent', 'Heir', 'Co-owner', 'Guardian', 'Other']}
                    onSelect={(value) => setFormData(prev => ({ ...prev, applicantInfo: { ...prev.applicantInfo, relationshipToLand: value.toLowerCase() } }))}
                    placeholder="Select Relationship"
                />
            </View>

            {/* Representative Info */}
            {formData.applicantInfo.relationshipToLand === 'representative' && (
                <View className="mb-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <Text className="text-yellow-800 text-sm font-semibold mb-3">Owner Information (Representative)</Text>
                    <TextInput
                        className="bg-white rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800 mb-3"
                        placeholder="Owner Full Name *"
                        placeholderTextColor="#9CA3AF"
                        value={formData.applicantInfo.ownerName}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, applicantInfo: { ...prev.applicantInfo, ownerName: text } }))}
                    />
                    <TextInput
                        className="bg-white rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800 mb-3"
                        placeholder="Owner National ID *"
                        placeholderTextColor="#9CA3AF"
                        value={formData.applicantInfo.ownerNationalId}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, applicantInfo: { ...prev.applicantInfo, ownerNationalId: text } }))}
                    />
                    <DocumentUploadField
                        label="Authorization Document *"
                        file={formData.applicantInfo.authorizationDocument}
                        onUpload={() => handleUpload('applicantInfo.authorizationDocument')}
                        required
                    />
                </View>
            )}

            {/* Contact Info */}
            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Phone Number *</Text>
                <TextInput
                    className="bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800"
                    value={formData.applicantInfo.phone}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, applicantInfo: { ...prev.applicantInfo, phone: text } }))}
                    keyboardType="phone-pad"
                />
            </View>

            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Email *</Text>
                <TextInput
                    className="bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800"
                    value={formData.applicantInfo.email}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, applicantInfo: { ...prev.applicantInfo, email: text } }))}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>

            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Address *</Text>
                <TextInput
                    className="bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800"
                    value={formData.applicantInfo.address}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, applicantInfo: { ...prev.applicantInfo, address: text } }))}
                    multiline
                />
            </View>
        </View>
    );

    // ✅ Section 2: Land Information
    const renderLandInformation = () => (
        <View className="w-full">
            {/* Plot Number (conditional) */}
            {formData.isPreviouslyRegistered === 'yes' && (
                <View className="mb-4">
                    <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Plot/Parcel Number *</Text>
                    <TextInput
                        className="bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800"
                        placeholder="PLOT-2024-12345"
                        placeholderTextColor="#9CA3AF"
                        value={formData.landInfo.plotNumber}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, landInfo: { ...prev.landInfo, plotNumber: text.toUpperCase() } }))}
                        autoCapitalize="characters"
                    />
                </View>
            )}

            {formData.isPreviouslyRegistered === 'no' && (
                <View className="mb-4 p-4 bg-green-50 rounded-xl border border-green-200">
                    <Text className="text-green-800 text-sm">
                        📝 Plot/Parcel number will be assigned after registration approval
                    </Text>
                </View>
            )}

            {/* Location with GPS */}
            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Location *</Text>
                <TouchableOpacity
                    onPress={getCurrentLandLocation}
                    disabled={locationLoading}
                    className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200 mb-3"
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

                <View className="flex-row justify-between mb-2">
                    <DropdownField
                        label="Region"
                        value={formData.landInfo.location.region}
                        options={Object.keys(ETHIOPIA_LOCATIONS)}
                        onSelect={(value) => handleLocationChange('region', value)}
                        placeholder="Select Region"
                    />
                    <DropdownField
                        label="Zone"
                        value={formData.landInfo.location.zone}
                        options={getAvailableZones()}
                        onSelect={(value) => handleLocationChange('zone', value)}
                        placeholder="Select Zone"
                        disabled={!formData.landInfo.location.region}
                    />
                </View>
                <View className="flex-row justify-between">
                    <DropdownField
                        label="Wereda"
                        value={formData.landInfo.location.wereda}
                        options={getAvailableWeredas()}
                        onSelect={(value) => handleLocationChange('wereda', value)}
                        placeholder="Select Wereda"
                        disabled={!formData.landInfo.location.zone}
                    />
                    <DropdownField
                        label="Kebele"
                        value={formData.landInfo.location.kebele}
                        options={getAvailableKebeles()}
                        onSelect={(value) => handleLocationChange('kebele', value)}
                        placeholder="Select Kebele"
                        disabled={!formData.landInfo.location.wereda}
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
                        value={formData.landInfo.landSize}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, landInfo: { ...prev.landInfo, landSize: text } }))}
                        keyboardType="numeric"
                    />
                    <View className="bg-white rounded-lg px-3 py-2 border border-gray-200 ml-2">
                        <Text className="text-gray-700 text-sm font-semibold">{formData.landInfo.landSizeUnit}</Text>
                    </View>
                </View>
            </View>

            {/* Land Use Type */}
            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Land Use Type *</Text>
                <DropdownField
                    label=""
                    value={formData.landInfo.landUseType}
                    options={['Residential', 'Commercial', 'Agricultural', 'Mixed', 'Industrial']}
                    onSelect={(value) => setFormData(prev => ({ ...prev, landInfo: { ...prev.landInfo, landUseType: value } }))}
                    placeholder="Select Land Use"
                />
            </View>

            {/* Current Land Status */}
            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Current Land Status *</Text>
                <DropdownField
                    label=""
                    value={formData.landInfo.landStatus}
                    options={['Vacant', 'Under Construction', 'Fully Built', 'Agricultural Use']}
                    onSelect={(value) => setFormData(prev => ({ ...prev, landInfo: { ...prev.landInfo, landStatus: value } }))}
                    placeholder="Select Status"
                />
            </View>

            {/* Land Boundaries */}
            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Land Boundaries *</Text>
                <Text className="text-gray-500 text-xs mb-3 ml-1">Enter neighbor names or boundary markers for each direction</Text>
                <View className="flex-row justify-between mb-2">
                    <View className="w-[48%]">
                        <TextInput
                            className="bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800"
                            placeholder="North *"
                            placeholderTextColor="#9CA3AF"
                            value={formData.landInfo.boundaries.north}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, landInfo: { ...prev.landInfo, boundaries: { ...prev.landInfo.boundaries, north: text } } }))}
                        />
                    </View>
                    <View className="w-[48%]">
                        <TextInput
                            className="bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800"
                            placeholder="South *"
                            placeholderTextColor="#9CA3AF"
                            value={formData.landInfo.boundaries.south}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, landInfo: { ...prev.landInfo, boundaries: { ...prev.landInfo.boundaries, south: text } } }))}
                        />
                    </View>
                </View>
                <View className="flex-row justify-between">
                    <View className="w-[48%]">
                        <TextInput
                            className="bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800"
                            placeholder="East *"
                            placeholderTextColor="#9CA3AF"
                            value={formData.landInfo.boundaries.east}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, landInfo: { ...prev.landInfo, boundaries: { ...prev.landInfo.boundaries, east: text } } }))}
                        />
                    </View>
                    <View className="w-[48%]">
                        <TextInput
                            className="bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800"
                            placeholder="West *"
                            placeholderTextColor="#9CA3AF"
                            value={formData.landInfo.boundaries.west}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, landInfo: { ...prev.landInfo, boundaries: { ...prev.landInfo.boundaries, west: text } } }))}
                        />
                    </View>
                </View>
            </View>
        </View>
    );

    // ✅ Section 3: Acquisition-Specific Documents
    const renderAcquisitionDocuments = () => {
        if (!formData.acquisitionType) {
            return (
                <View className="items-center py-12">
                    <Ionicons name="alert-circle-outline" size={64} color="#9CA3AF" />
                    <Text className="text-gray-500 text-base mt-4 text-center">Please select acquisition type first</Text>
                </View>
            );
        }

        return (
            <View className="w-full">
                <Text className="text-gray-800 text-lg font-bold mb-4">Required Documents</Text>
                <Text className="text-gray-600 text-sm mb-4">Based on your selection: <Text className="font-semibold">{formData.acquisitionType}</Text></Text>

                {formData.acquisitionType === 'allocation' && (
                    <View className="space-y-3">
                        <DocumentUploadField
                            label="Government Allocation Letter *"
                            file={formData.acquisitionDocuments.allocationLetter}
                            onUpload={() => handleUpload('acquisitionDocuments.allocationLetter')}
                            required
                        />
                        <DocumentUploadField
                            label="Government Approval Document *"
                            file={formData.acquisitionDocuments.governmentApproval}
                            onUpload={() => handleUpload('acquisitionDocuments.governmentApproval')}
                            required
                        />
                        <DocumentUploadField
                            label="Payment Receipt (if any)"
                            file={formData.acquisitionDocuments.allocationPaymentReceipt}
                            onUpload={() => handleUpload('acquisitionDocuments.allocationPaymentReceipt')}
                        />
                    </View>
                )}

                {formData.acquisitionType === 'bidding' && (
                    <View className="space-y-3">
                        <DocumentUploadField
                            label="Bidding Win Certificate *"
                            file={formData.acquisitionDocuments.biddingWinCertificate}
                            onUpload={() => handleUpload('acquisitionDocuments.biddingWinCertificate')}
                            required
                        />
                        <DocumentUploadField
                            label="Payment Receipt (Full Payment) *"
                            file={formData.acquisitionDocuments.biddingPaymentReceipt}
                            onUpload={() => handleUpload('acquisitionDocuments.biddingPaymentReceipt')}
                            required
                        />
                        <DocumentUploadField
                            label="Auction Announcement Copy"
                            file={formData.acquisitionDocuments.auctionAnnouncement}
                            onUpload={() => handleUpload('acquisitionDocuments.auctionAnnouncement')}
                        />
                    </View>
                )}

                {formData.acquisitionType === 'inheritance' && (
                    <View className="space-y-3">
                        <DocumentUploadField
                            label="Death Certificate *"
                            file={formData.acquisitionDocuments.deathCertificate}
                            onUpload={() => handleUpload('acquisitionDocuments.deathCertificate')}
                            required
                        />
                        <DocumentUploadField
                            label="Inheritance Court Document *"
                            file={formData.acquisitionDocuments.inheritanceCourtDocument}
                            onUpload={() => handleUpload('acquisitionDocuments.inheritanceCourtDocument')}
                            required
                        />
                        <DocumentUploadField
                            label="Family Agreement Document *"
                            file={formData.acquisitionDocuments.familyAgreement}
                            onUpload={() => handleUpload('acquisitionDocuments.familyAgreement')}
                            required
                        />
                        <DocumentUploadField
                            label="Heir List (all family members) *"
                            file={formData.acquisitionDocuments.heirList}
                            onUpload={() => handleUpload('acquisitionDocuments.heirList')}
                            required
                        />
                    </View>
                )}

                {formData.acquisitionType === 'gift' && (
                    <View className="space-y-3">
                        <DocumentUploadField
                            label="Gift Agreement Document *"
                            file={formData.acquisitionDocuments.giftAgreement}
                            onUpload={() => handleUpload('acquisitionDocuments.giftAgreement')}
                            required
                        />
                        <DocumentUploadField
                            label="Donor's Ownership Certificate *"
                            file={formData.acquisitionDocuments.donorOwnershipCertificate}
                            onUpload={() => handleUpload('acquisitionDocuments.donorOwnershipCertificate')}
                            required
                        />
                        <DocumentUploadField
                            label="Donor's ID Copy *"
                            file={formData.acquisitionDocuments.donorIdCopy}
                            onUpload={() => handleUpload('acquisitionDocuments.donorIdCopy')}
                            required
                        />
                    </View>
                )}
            </View>
        );
    };

    // ✅ Section 4: Common Documents
    const renderCommonDocuments = () => (
        <View className="w-full">
            <Text className="text-gray-800 text-lg font-bold mb-4">Supporting Documents</Text>

            {/* National ID Copy */}
            <View className="mb-4 p-4 bg-green-50 rounded-xl border border-green-200">
                <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={24} color="#125f43ff" />
                    <View className="ml-3 flex-1">
                        <Text className="text-gray-700 text-sm font-semibold">National ID Copy</Text>
                        <Text className="text-gray-500 text-xs">Auto-filled from profile</Text>
                    </View>
                </View>
            </View>

            {/* Survey Map */}
            <DocumentUploadField
                label="Survey Map/Plan *"
                file={formData.commonDocuments.surveyMap}
                onUpload={() => handleUpload('commonDocuments.surveyMap')}
                required
            />



            {/* Witness Statements (2 minimum) */}
            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Witness Statements (2 Minimum) *</Text>
                <Text className="text-gray-500 text-xs mb-3 ml-1">Each witness must provide ID copy and phone number</Text>

                {formData.commonDocuments.witnesses.map((witness, index) => (
                    <View key={index} className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <Text className="text-gray-700 text-sm font-semibold mb-3">Witness {index + 1}</Text>
                        <TextInput
                            className="bg-white rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800 mb-3"
                            placeholder="Witness Full Name *"
                            placeholderTextColor="#9CA3AF"
                            value={witness.name}
                            onChangeText={(text) => {
                                const newWitnesses = [...formData.commonDocuments.witnesses];
                                newWitnesses[index].name = text;
                                setFormData(prev => ({ ...prev, commonDocuments: { ...prev.commonDocuments, witnesses: newWitnesses } }));
                            }}
                        />
                        <TextInput
                            className="bg-white rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800 mb-3"
                            placeholder="Witness Phone Number *"
                            placeholderTextColor="#9CA3AF"
                            value={witness.phone}
                            onChangeText={(text) => {
                                const newWitnesses = [...formData.commonDocuments.witnesses];
                                newWitnesses[index].phone = text;
                                setFormData(prev => ({ ...prev, commonDocuments: { ...prev.commonDocuments, witnesses: newWitnesses } }));
                            }}
                            keyboardType="phone-pad"
                        />
                        <DocumentUploadField
                            label="Witness ID Copy *"
                            file={witness.idCopy}
                            onUpload={() => handleUpload(`commonDocuments.witnesses[${index}].idCopy`, 5)}
                            required
                        />
                        <DocumentUploadField
                            label="Witness Statement *"
                            file={witness.statement}
                            onUpload={() => handleUpload(`commonDocuments.witnesses[${index}].statement`)}
                            required
                        />
                    </View>
                ))}

                <TouchableOpacity
                    onPress={() => {
                        if (formData.commonDocuments.witnesses.length < 4) {
                            setFormData(prev => ({
                                ...prev,
                                commonDocuments: {
                                    ...prev.commonDocuments,
                                    witnesses: [
                                        ...prev.commonDocuments.witnesses,
                                        { name: '', phone: '', idCopy: null, statement: null }
                                    ]
                                }
                            }));
                        }
                    }}
                    disabled={formData.commonDocuments.witnesses.length >= 4}
                    className={`flex-row items-center justify-center py-3 rounded-xl border-2 border-dashed ${formData.commonDocuments.witnesses.length >= 4 ? 'border-gray-300' : 'border-[#125f43ff]'
                        }`}
                >
                    <Ionicons name="add-circle" size={20} color={formData.commonDocuments.witnesses.length >= 4 ? '#9CA3AF' : '#125f43ff'} />
                    <Text className={`text-sm font-semibold ml-2 ${formData.commonDocuments.witnesses.length >= 4 ? 'text-gray-400' : 'text-[#125f43ff]'
                        }`}>
                        {formData.commonDocuments.witnesses.length >= 4 ? 'Maximum 4 witnesses' : 'Add Another Witness'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    // ✅ Section 5: Declaration
    const renderDeclaration = () => (
        <View className="w-full">
            <TouchableOpacity
                onPress={() => setFormData(prev => ({ ...prev, acceptDeclaration1: !prev.acceptDeclaration1 }))}
                className="flex-row items-start mb-4"
            >
                <View className={`w-6 h-6 rounded border-2 mr-3 mt-1 items-center justify-center ${formData.acceptDeclaration1 ? 'bg-[#125f43ff] border-[#125f43ff]' : 'border-gray-400 bg-white'
                    }`}>
                    {formData.acceptDeclaration1 && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
                <Text className="text-gray-700 text-sm flex-1">
                    I declare that the information provided is true and accurate to the best of my knowledge. I understand that false information may result in legal consequences including land confiscation.
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => setFormData(prev => ({ ...prev, acceptDeclaration2: !prev.acceptDeclaration2 }))}
                className="flex-row items-start mb-4"
            >
                <View className={`w-6 h-6 rounded border-2 mr-3 mt-1 items-center justify-center ${formData.acceptDeclaration2 ? 'bg-[#125f43ff] border-[#125f43ff]' : 'border-gray-400 bg-white'
                    }`}>
                    {formData.acceptDeclaration2 && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
                <Text className="text-gray-700 text-sm flex-1">
                    I agree to the Land Registration Terms & Conditions and authorize land officers to verify my documents and conduct field inspection.
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => setFormData(prev => ({ ...prev, acceptDeclaration3: !prev.acceptDeclaration3 }))}
                className="flex-row items-start mb-6"
            >
                <View className={`w-6 h-6 rounded border-2 mr-3 mt-1 items-center justify-center ${formData.acceptDeclaration3 ? 'bg-[#125f43ff] border-[#125f43ff]' : 'border-gray-400 bg-white'
                    }`}>
                    {formData.acceptDeclaration3 && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
                <Text className="text-gray-700 text-sm flex-1">
                    I consent to background verification and neighbor confirmation for boundary validation.
                </Text>
            </TouchableOpacity>

            {/* Info Box */}
            <View className="bg-green-50 rounded-xl p-4 border border-green-200 mb-4">
                <View className="flex-row items-start">
                    <Ionicons name="shield-checkmark" size={20} color="#125f43ff" />
                    <View className="ml-3 flex-1">
                        <Text className="text-green-800 text-sm font-semibold mb-1">What Happens Next?</Text>
                        <Text className="text-green-700 text-xs">
                            1. Document review by land officer{"\n"}
                            2. Field inspection and boundary verification{"\n"}
                            3. Neighbor confirmation{"\n"}
                            4. Approval and certificate generation{"\n"}
                            5. Estimated processing time: 7-14 business days
                        </Text>
                    </View>
                </View>
            </View>

            {/* Reference Info */}
            <View className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <Text className="text-blue-800 text-xs font-semibold mb-1">📋 Track Your Request</Text>
                <Text className="text-blue-700 text-xs">
                    After submission, you'll receive a reference number. Use it to track your registration status in real-time.
                </Text>
            </View>
        </View>
    );

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 30}
                style={{ flex: 1 }}
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
                        <View className="px-6 pt-14 pb-4">
                            <View className="flex-row justify-between mb-2">
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

                        {/* Horizontal ScrollView */}
                        <ScrollView
                            ref={scrollViewRef}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            scrollEnabled={false}
                            className="flex-1"
                            contentContainerStyle={{ paddingBottom: 40 }}
                            keyboardShouldPersistTaps="handled"
                            keyboardDismissMode="on-drag"
                        >
                            {sections.map((section, index) => renderSectionCard(section, index))}
                        </ScrollView>
                    </LinearGradient>
                </View>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}