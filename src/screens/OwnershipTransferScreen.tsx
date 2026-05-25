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
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as Location from 'expo-location';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../api/config';

type RootStackParamList = {
    OwnershipTransfer: undefined;
    RequestDetail: { referenceNumber: string };
    MainApp: undefined;
};

type OwnershipTransferScreenProp = StackNavigationProp<RootStackParamList, 'OwnershipTransfer'>;

// ✅ Ethiopian Location Data
const ETHIOPIA_LOCATIONS: Record<string, Record<string, Record<string, string[]>>> = {
    'Amhara': {
        'Bahir Dar Zone': {
            'Bahir Dar Wereda': ['Kebele 01', 'Kebele 02', 'Kebele 03', 'Kebele 04', 'Kebele 05'],
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

// ✅ Dropdown Component
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
        <View className="w-full">
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
                            {(options || []).map((option) => (
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
    <View className="mb-3">
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
            <Ionicons name="camera" size={24} color="#125f43ff" />
        </TouchableOpacity>
    </View>
);

export default function OwnershipTransferScreen() {
    const navigation = useNavigation<OwnershipTransferScreenProp>();
    const { user, token } = useAuth();
    const scrollViewRef = useRef<ScrollView>(null);
    const [currentSection, setCurrentSection] = useState(0);

    // Form State
    const [formData, setFormData] = useState({
        transferType: '',

        currentOwner: {
            fullName: '',
            nationalId: '',
            phone: '',
            email: '',
            address: '',
            kebeleIdFront: null as any,
            kebeleIdBack: null as any,
            ownershipCertificate: null as any,
        },

        newOwner: {
            fullName: '',
            nationalId: '',
            phone: '',
            email: '',
            address: '',
            relationship: '',
            kebeleIdFront: null as any,
            kebeleIdBack: null as any,
        },

        landInfo: {
            plotNumber: '',
            certificateNumber: '',
            location: { region: '', zone: '', wereda: '', kebele: '' },
            coordinates: { latitude: null as any, longitude: null as any },
            landSize: '',
            landSizeUnit: 'm²',
            landUseType: '', // Residential, Commercial, Agricultural, Mixed
            landStatus: '',
            boundaries: { north: '', south: '', east: '', west: '' },
            encumbrances: { hasEncumbrance: false, details: '' },
        },

        transferDetails: {
            transferDate: '',
            transferPrice: '',
            paymentMethod: '',
            bankName: '',
            transactionRef: '',
            reason: '',
            effectiveDate: '',
        },

        documents: {
            saleContract: null as any,
            paymentReceipt: null as any,
            taxClearance: null as any,
            giftAgreement: null as any,
            relationshipProof: null as any,
            deathCertificate: null as any,
            inheritanceCourtDocument: null as any,
            familyAgreement: null as any,
            heirList: null as any,
            exchangeAgreement: null as any,
            valuationReport: null as any,
            courtDecision: null as any,
            courtOrder: null as any,
            currentOwnershipCertificate: null as any,
            currentOwnerIdCopy: null as any,
            newOwnerIdCopy: null as any,
            witnesses: [
                { name: '', phone: '', idCopy: null as any, statement: null as any },
                { name: '', phone: '', idCopy: null as any, statement: null as any },
            ],
        },

        currentOwnerDeclaration: false,
        newOwnerDeclaration: false,
        bothAgree: false,
        noHiddenDisputes: false,
        currentOwnerSignature: null as any,
        newOwnerSignature: null as any,
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                currentOwner: {
                    ...prev.currentOwner,
                    fullName: user.fullName || '',
                    nationalId: user.faydaId || '',
                    phone: user.phone || '',
                    email: user.email || '',
                }
            }));
        }
    }, [user]);

    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successRefNum, setSuccessRefNum] = useState('');

    const sections = [
        { title: 'Transfer Type', icon: 'git-merge', required: true },
        { title: 'Current Owner', icon: 'person', required: true },
        { title: 'New Owner', icon: 'people', required: true },
        { title: 'Land Information', icon: 'map', required: true },
        { title: 'Transfer Details', icon: 'swap-horizontal', required: true },
        { title: 'Documents', icon: 'folder', required: true },
        { title: 'Declarations', icon: 'shield-checkmark', required: true },
    ];


    // ✅ Calculate Tax Based on Land Use Type
    const calculateTax = () => {
        const price = parseFloat(formData.transferDetails.transferPrice) || 0;
        const landUse = formData.landInfo.landUseType;

        // ✅ Tax Rates: Commercial = 22%, Residential/Other = 5%
        const taxRate = landUse === 'Commercial' ? 0.22 : 0.05;
        const taxAmount = price * taxRate;
        const totalAmount = price + taxAmount;

        return {
            taxRate: taxRate * 100, // Display as percentage
            taxAmount: taxAmount.toFixed(2),
            totalAmount: totalAmount.toFixed(2),
            landUse: landUse || 'Not specified',
        };
    };

    const getAvailableZones = () => {
        if (!formData?.landInfo?.location?.region) return [];
        const regionData = ETHIOPIA_LOCATIONS[formData.landInfo.location.region];
        return regionData ? Object.keys(regionData) : [];
    };

    const getAvailableWeredas = () => {
        if (!formData?.landInfo?.location?.region || !formData?.landInfo?.location?.zone) return [];
        const regionData = ETHIOPIA_LOCATIONS[formData.landInfo.location.region];
        if (!regionData) return [];
        const zoneData = regionData[formData.landInfo.location.zone];
        return zoneData ? Object.keys(zoneData) : [];
    };

    const getAvailableKebeles = () => {
        if (!formData?.landInfo?.location?.region || !formData?.landInfo?.location?.zone || !formData?.landInfo?.location?.wereda) return [];
        const regionData = ETHIOPIA_LOCATIONS[formData.landInfo.location.region];
        if (!regionData) return [];
        const zoneData = regionData[formData.landInfo.location.zone];
        if (!zoneData) return [];
        const weredaData = zoneData[formData.landInfo.location.wereda];
        return weredaData || [];
    };

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

            const keys = fieldPath.split('.');
            setFormData(prev => {
                const updated = { ...prev };
                let current: any = updated;
                for (let i = 0; i < keys.length - 1; i++) {
                    if (!current[keys[i]]) current[keys[i]] = {};
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

    const validateSection = (sectionIndex: number) => {
        switch (sectionIndex) {
            case 0:
                if (!formData.transferType) {
                    Alert.alert('Error', 'Please select transfer type');
                    return false;
                }
                break;
            case 1:
                if (!formData.currentOwner.ownershipCertificate) {
                    Alert.alert('Error', 'Ownership Certificate is required');
                    return false;
                }
                break;
            case 2:
                if (!formData.newOwner.fullName || !formData.newOwner.nationalId) {
                    Alert.alert('Error', 'Please fill all new owner information');
                    return false;
                }
                if (!formData.newOwner.relationship) {
                    Alert.alert('Error', 'Please select relationship to current owner');
                    return false;
                }
                break;
            case 3:
                if (!formData.landInfo.plotNumber) {
                    Alert.alert('Error', 'Plot Number is required');
                    return false;
                }
                if (!formData.landInfo.landSize || parseFloat(formData.landInfo.landSize) <= 0) {
                    Alert.alert('Error', 'Please enter valid land size');
                    return false;
                }
                if (!formData.landInfo.location.kebele) {
                    Alert.alert('Error', 'Please select complete location');
                    return false;
                }
                break;
            case 4:
                if (formData.transferType === 'sale' && !formData.transferDetails.transferPrice) {
                    Alert.alert('Error', 'Transfer price is required for sale');
                    return false;
                }
                break;
            case 5:
                if (!formData.documents.currentOwnershipCertificate) {
                    Alert.alert('Error', 'Current Ownership Certificate is required');
                    return false;
                }
                break;
            case 6:
                if (!formData.currentOwnerDeclaration || !formData.newOwnerDeclaration || !formData.bothAgree) {
                    Alert.alert('Error', 'You must accept all declarations');
                    return false;
                }
                break;
        }
        return true;
    };

    const goToSection = (index: number) => {
        if (index > currentSection && !validateSection(currentSection)) return;
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

    const handleSubmit = async () => {
        if (!validateSection(6)) return;

        setLoading(true);
        const taxInfo = calculateTax();

        try {
            const response = await fetch(`${API_URL}/requests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    type: 'Ownership Transfer',
                    plotNumber: formData.landInfo.plotNumber,
                    region: formData.landInfo.location.region,
                    zone: formData.landInfo.location.zone,
                    wereda: formData.landInfo.location.wereda,
                    kebele: formData.landInfo.location.kebele,
                    landSize: formData.landInfo.landSize,
                    landUseType: formData.landInfo.landUseType,
                    metadata: {
                        transferType: formData.transferType,
                        currentOwner: {
                            fullName: formData.currentOwner.fullName,
                            nationalId: formData.currentOwner.nationalId,
                            phone: formData.currentOwner.phone,
                            email: formData.currentOwner.email,
                            address: formData.currentOwner.address
                        },
                        newOwner: {
                            fullName: formData.newOwner.fullName,
                            nationalId: formData.newOwner.nationalId,
                            phone: formData.newOwner.phone,
                            email: formData.newOwner.email,
                            address: formData.newOwner.address,
                            relationship: formData.newOwner.relationship
                        },
                        transferDetails: {
                            transferDate: formData.transferDetails.transferDate,
                            transferPrice: formData.transferDetails.transferPrice,
                            paymentMethod: formData.transferDetails.paymentMethod,
                            bankName: formData.transferDetails.bankName,
                            transactionRef: formData.transferDetails.transactionRef,
                            reason: formData.transferDetails.reason,
                            effectiveDate: formData.transferDetails.effectiveDate
                        },
                        landInfo: {
                            certificateNumber: formData.landInfo.certificateNumber,
                            landStatus: formData.landInfo.landStatus,
                            boundaries: formData.landInfo.boundaries,
                            encumbrances: formData.landInfo.encumbrances
                        },
                        taxInfo: {
                            taxRate: taxInfo.taxRate,
                            taxAmount: taxInfo.taxAmount,
                            totalAmount: taxInfo.totalAmount
                        }
                    }
                })
            });

            const data = await response.json();
            if (response.ok) {
                const refNum = data.request?.referenceNumber || `TRF-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
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

    const renderSectionCard = (section: any, index: number) => (
        <ScrollView
            key={index}
            className="w-full px-6"
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 20 }}
        >
            <View className="flex-row items-center mb-6">
                <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${currentSection >= index ? 'bg-[#125f43ff]' : 'bg-gray-300'}`}>
                    <Ionicons name={section.icon as any} size={22} color={currentSection >= index ? 'white' : '#9CA3AF'} />
                </View>
                <View className="flex-1">
                    <Text className="text-white text-xl font-bold">{section.title}</Text>
                    {section.required && <Text className="text-white/70 text-xs">* Required fields</Text>}
                </View>
                <View className="flex-row items-center">
                    <Text className="text-white/80 text-sm mr-2">{index + 1} of {(sections || []).length}</Text>
                    <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center">
                        <Text className="text-white font-bold text-sm">{index + 1}</Text>
                    </View>
                </View>
            </View>

            <View className="bg-white/90 rounded-3xl px-6 py-6 shadow-2xl mb-4">
                {index === 0 && renderTransferType()}
                {index === 1 && renderCurrentOwner()}
                {index === 2 && renderNewOwner()}
                {index === 3 && renderLandInformation()}
                {index === 4 && renderTransferDetails()}
                {index === 5 && renderDocuments()}
                {index === 6 && renderDeclarations()}
            </View>

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

                {currentSection < (sections || []).length - 1 ? (
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
                                <Text className="text-white text-base font-bold ml-2">Submit Transfer</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );

    const renderTransferType = () => (
        <View className="w-full">
            <Text className="text-gray-700 text-sm font-semibold mb-4 text-center">What type of transfer is this? *</Text>
            <View className="space-y-3">
                {[
                    { value: 'sale', label: '💰 Sale/Purchase', desc: 'Land sold with payment' },
                    { value: 'gift', label: '🎁 Gift/Donation', desc: 'Given as gift (no payment)' },
                    { value: 'inheritance', label: '👨‍👩‍👧‍👦 Inheritance', desc: 'Received from deceased owner' },
                    { value: 'exchange', label: '🔄 Exchange', desc: 'Swap with another plot' },
                    { value: 'court', label: '⚖️ Court Order', desc: 'Transfer by legal decision' },
                    { value: 'government', label: '🏛️ Government Acquisition', desc: 'Government takes land' },
                ].map((option) => (
                    <TouchableOpacity
                        key={option.value}
                        onPress={() => setFormData(prev => ({ ...prev, transferType: option.value }))}
                        className={`p-4 rounded-xl border-2 ${formData.transferType === option.value
                                ? 'bg-[#125f43ff] border-[#125f43ff]'
                                : 'bg-white border-gray-200'
                            }`}
                    >
                        <Text className={`text-base font-bold ${formData.transferType === option.value ? 'text-white' : 'text-gray-800'
                            }`}>{option.label}</Text>
                        <Text className={`text-sm ${formData.transferType === option.value ? 'text-white/80' : 'text-gray-500'
                            }`}>{option.desc}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    // ✅ Section 1: Current Owner - FIXED: Kebele IDs VERTICAL
    const renderCurrentOwner = () => (
        <View className="w-full">
            <Text className="text-gray-800 text-lg font-bold mb-4">Current Owner (Transferor)</Text>

            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Full Name *</Text>
                <TextInput
                    className="bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800"
                    value={formData.currentOwner.fullName}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, currentOwner: { ...prev.currentOwner, fullName: text } }))}
                />
            </View>

            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">National ID (Fayda) *</Text>
                <TextInput
                    className="bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800"
                    value={formData.currentOwner.nationalId}
                    editable={false}
                />
            </View>

            {/* ✅ FIXED: Kebele ID Uploads - VERTICAL (Front on top, Back below) */}
            <View className="flex-col mb-4">
                <View className="w-full mb-3">
                    <PhotoUploadField
                        label="Kebele ID (Front) *"
                        file={formData.currentOwner.kebeleIdFront}
                        onUpload={() => handleUpload('currentOwner.kebeleIdFront', 5)}
                        required
                    />
                </View>
                <View className="w-full">
                    <PhotoUploadField
                        label="Kebele ID (Back) *"
                        file={formData.currentOwner.kebeleIdBack}
                        onUpload={() => handleUpload('currentOwner.kebeleIdBack', 5)}
                        required
                    />
                </View>
            </View>

            <DocumentUploadField
                label="Current Ownership Certificate *"
                file={formData.currentOwner.ownershipCertificate}
                onUpload={() => handleUpload('currentOwner.ownershipCertificate')}
                required
            />

            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Phone Number *</Text>
                <TextInput
                    className="bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800"
                    value={formData.currentOwner.phone}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, currentOwner: { ...prev.currentOwner, phone: text } }))}
                    keyboardType="phone-pad"
                />
            </View>

            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Email *</Text>
                <TextInput
                    className="bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800"
                    value={formData.currentOwner.email}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, currentOwner: { ...prev.currentOwner, email: text } }))}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>

            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Address *</Text>
                <TextInput
                    className="bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800"
                    value={formData.currentOwner.address}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, currentOwner: { ...prev.currentOwner, address: text } }))}
                    multiline
                />
            </View>
        </View>
    );

    // ✅ Section 2: New Owner - FIXED: Kebele IDs VERTICAL
    const renderNewOwner = () => (
        <View className="w-full">
            <Text className="text-gray-800 text-lg font-bold mb-4">New Owner (Transferee)</Text>

            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Full Name *</Text>
                <TextInput
                    className="bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800"
                    placeholder="New owner's full name"
                    placeholderTextColor="#9CA3AF"
                    value={formData.newOwner.fullName}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, newOwner: { ...prev.newOwner, fullName: text } }))}
                />
            </View>

            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">National ID (Fayda) *</Text>
                <TextInput
                    className="bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800"
                    placeholder="1234 5678 9012 3456"
                    placeholderTextColor="#9CA3AF"
                    value={formData.newOwner.nationalId}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, newOwner: { ...prev.newOwner, nationalId: text } }))}
                />
            </View>

            {/* ✅ FIXED: Kebele ID Uploads - VERTICAL (Front on top, Back below) */}
            <View className="flex-col mb-4">
                <View className="w-full mb-3">
                    <PhotoUploadField
                        label="Kebele ID (Front) *"
                        file={formData.newOwner.kebeleIdFront}
                        onUpload={() => handleUpload('newOwner.kebeleIdFront', 5)}
                        required
                    />
                </View>
                <View className="w-full">
                    <PhotoUploadField
                        label="Kebele ID (Back) *"
                        file={formData.newOwner.kebeleIdBack}
                        onUpload={() => handleUpload('newOwner.kebeleIdBack', 5)}
                        required
                    />
                </View>
            </View>

            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Relationship to Current Owner *</Text>
                <DropdownField
                    label=""
                    value={formData.newOwner.relationship}
                    options={['Family Member', 'Friend', 'Business Partner', 'Stranger', 'Other']}
                    onSelect={(value) => setFormData(prev => ({ ...prev, newOwner: { ...prev.newOwner, relationship: value } }))}
                    placeholder="Select Relationship"
                />
            </View>

            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Phone Number *</Text>
                <TextInput
                    className="bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800"
                    placeholder="+251 9XX XXX XXX"
                    placeholderTextColor="#9CA3AF"
                    value={formData.newOwner.phone}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, newOwner: { ...prev.newOwner, phone: text } }))}
                    keyboardType="phone-pad"
                />
            </View>

            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Email *</Text>
                <TextInput
                    className="bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800"
                    placeholder="email@example.com"
                    placeholderTextColor="#9CA3AF"
                    value={formData.newOwner.email}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, newOwner: { ...prev.newOwner, email: text } }))}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>

            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Address *</Text>
                <TextInput
                    className="bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800"
                    placeholder="New owner's address"
                    placeholderTextColor="#9CA3AF"
                    value={formData.newOwner.address}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, newOwner: { ...prev.newOwner, address: text } }))}
                    multiline
                />
            </View>
        </View>
    );

    const renderLandInformation = () => (
        <View className="w-full">
            <Text className="text-gray-800 text-lg font-bold mb-4">Land Information</Text>

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

            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Previous Certificate Number *</Text>
                <TextInput
                    className="bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800"
                    placeholder="CERT-2020-XXXXX"
                    placeholderTextColor="#9CA3AF"
                    value={formData.landInfo.certificateNumber}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, landInfo: { ...prev.landInfo, certificateNumber: text } }))}
                />
            </View>

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
                    <View className="w-[48%]">
                        <DropdownField
                            label="Region"
                            value={formData.landInfo.location.region}
                            options={Object.keys(ETHIOPIA_LOCATIONS)}
                            onSelect={(value) => handleLocationChange('region', value)}
                            placeholder="Select Region"
                        />
                    </View>
                    <View className="w-[48%]">
                        <DropdownField
                            label="Zone"
                            value={formData.landInfo.location.zone}
                            options={getAvailableZones()}
                            onSelect={(value) => handleLocationChange('zone', value)}
                            placeholder="Select Zone"
                            disabled={!formData.landInfo.location.region}
                        />
                    </View>
                </View>
                <View className="flex-row justify-between">
                    <View className="w-[48%]">
                        <DropdownField
                            label="Wereda"
                            value={formData.landInfo.location.wereda}
                            options={getAvailableWeredas()}
                            onSelect={(value) => handleLocationChange('wereda', value)}
                            placeholder="Select Wereda"
                            disabled={!formData.landInfo.location.zone}
                        />
                    </View>
                    <View className="w-[48%]">
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
            </View>

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

            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Land Use Type *</Text>
                <DropdownField
                    label=""
                    value={formData.landInfo.landUseType}
                    options={['Residential', 'Commercial', 'Agricultural', 'Mixed', 'Industrial']}
                    onSelect={(value) => setFormData(prev => ({ ...prev, landInfo: { ...prev.landInfo, landUseType: value } }))}
                    placeholder="Select Land Use"
                />
                {/* ✅ Tax Info Hint */}
                {formData.landInfo.landUseType && (
                    <View className="mt-2 p-3 bg-blue-50 rounded-xl border border-blue-200">
                        <View className="flex-row items-center">
                            <Ionicons name="information-circle" size={16} color="#2563EB" />
                            <Text className="text-blue-700 text-xs ml-2">
                                {formData.landInfo.landUseType === 'Commercial'
                                    ? '💼 Commercial land: 22% transfer tax applies'
                                    : '🏠 Non-commercial land: 5% transfer tax applies'}
                            </Text>
                        </View>
                    </View>
                )}
            </View>

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

            <View className="mb-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <TouchableOpacity
                    onPress={() => setFormData(prev => ({
                        ...prev,
                        landInfo: {
                            ...prev.landInfo,
                            encumbrances: { ...prev.landInfo.encumbrances, hasEncumbrance: !prev.landInfo.encumbrances.hasEncumbrance }
                        }
                    }))}
                    className="flex-row items-center mb-3"
                >
                    <View className={`w-5 h-5 rounded border-2 mr-2 items-center justify-center ${formData.landInfo.encumbrances.hasEncumbrance ? 'bg-[#125f43ff] border-[#125f43ff]' : 'border-gray-400 bg-white'
                        }`}>
                        {formData.landInfo.encumbrances.hasEncumbrance && <Ionicons name="checkmark" size={14} color="white" />}
                    </View>
                    <Text className="text-gray-800 text-sm font-semibold">Land has encumbrances (mortgage, lease, dispute)</Text>
                </TouchableOpacity>

                {formData.landInfo.encumbrances.hasEncumbrance && (
                    <View>
                        <Text className="text-gray-700 text-sm font-semibold mb-2">Please describe encumbrances:</Text>
                        <TextInput
                            className="bg-white rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800"
                            placeholder="Describe mortgage, lease, or any disputes..."
                            placeholderTextColor="#9CA3AF"
                            value={formData.landInfo.encumbrances.details}
                            onChangeText={(text) => setFormData(prev => ({
                                ...prev,
                                landInfo: {
                                    ...prev.landInfo,
                                    encumbrances: { ...prev.landInfo.encumbrances, details: text }
                                }
                            }))}
                            multiline
                            numberOfLines={3}
                        />
                    </View>
                )}
            </View>
        </View>
    );

    // ✅ Section 4: Transfer Details - FIXED: Tax Calculation
    const renderTransferDetails = () => {
        const taxInfo = calculateTax();
        const transferPrice = parseFloat(formData.transferDetails.transferPrice) || 0;

        return (
            <View className="w-full">
                <Text className="text-gray-800 text-lg font-bold mb-4">Transfer Details</Text>

                <View className="mb-4">
                    <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Transfer Date *</Text>
                    <TextInput
                        className="bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800"
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#9CA3AF"
                        value={formData.transferDetails.transferDate}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, transferDetails: { ...prev.transferDetails, transferDate: text } }))}
                    />
                </View>

                {formData.transferType === 'sale' && (
                    <View className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <Text className="text-blue-800 text-sm font-semibold mb-3">Sale Information</Text>

                        <View className="mb-3">
                            <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Transfer Price (ETB) *</Text>
                            <TextInput
                                className="bg-white rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800"
                                placeholder="500000"
                                placeholderTextColor="#9CA3AF"
                                value={formData.transferDetails.transferPrice}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, transferDetails: { ...prev.transferDetails, transferPrice: text } }))}
                                keyboardType="numeric"
                            />
                        </View>

                        {/* ✅ TAX CALCULATION DISPLAY */}
                        {transferPrice > 0 && (
                            <View className="mb-3 p-4 bg-green-50 rounded-xl border border-green-200">
                                <Text className="text-green-800 text-sm font-semibold mb-2">📊 Tax Calculation</Text>
                                <View className="space-y-2">
                                    <View className="flex-row justify-between">
                                        <Text className="text-green-700 text-sm">Transfer Price:</Text>
                                        <Text className="text-green-800 text-sm font-bold">{transferPrice.toLocaleString()} ETB</Text>
                                    </View>
                                    <View className="flex-row justify-between">
                                        <Text className="text-green-700 text-sm">Land Use Type:</Text>
                                        <Text className="text-green-800 text-sm font-bold">{taxInfo.landUse}</Text>
                                    </View>
                                    <View className="flex-row justify-between">
                                        <Text className="text-green-700 text-sm">Tax Rate:</Text>
                                        <Text className="text-green-800 text-sm font-bold">{taxInfo.taxRate}%</Text>
                                    </View>
                                    <View className="flex-row justify-between">
                                        <Text className="text-green-700 text-sm">Tax Amount:</Text>
                                        <Text className="text-green-800 text-sm font-bold">{parseFloat(taxInfo.taxAmount).toLocaleString()} ETB</Text>
                                    </View>
                                    <View className="border-t border-green-300 pt-2 mt-2">
                                        <View className="flex-row justify-between">
                                            <Text className="text-green-800 text-base font-bold">Total (Price + Tax):</Text>
                                            <Text className="text-green-900 text-base font-bold">{parseFloat(taxInfo.totalAmount).toLocaleString()} ETB</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Tax Info Box */}
                                <View className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <View className="flex-row items-start">
                                        <Ionicons name="information-circle" size={16} color="#F59E0B" />
                                        <Text className="text-yellow-800 text-xs ml-2">
                                            {taxInfo.taxRate === 22
                                                ? 'Commercial/Trading land is subject to 22% transfer tax as per Ethiopian tax law.'
                                                : 'Non-commercial/Residential land is subject to 5% transfer tax as per Ethiopian tax law.'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        <View className="mb-3">
                            <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Payment Method *</Text>
                            <DropdownField
                                label=""
                                value={formData.transferDetails.paymentMethod}
                                options={['Cash', 'Bank Transfer', 'Check']}
                                onSelect={(value) => setFormData(prev => ({ ...prev, transferDetails: { ...prev.transferDetails, paymentMethod: value } }))}
                                placeholder="Select Payment Method"
                            />
                        </View>

                        {formData.transferDetails.paymentMethod && (
                            <>
                                <View className="mb-3">
                                    <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Bank Name</Text>
                                    <TextInput
                                        className="bg-white rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800"
                                        placeholder="Bank of Abyssinia, CBE, etc."
                                        placeholderTextColor="#9CA3AF"
                                        value={formData.transferDetails.bankName}
                                        onChangeText={(text) => setFormData(prev => ({ ...prev, transferDetails: { ...prev.transferDetails, bankName: text } }))}
                                    />
                                </View>

                                <View className="mb-3">
                                    <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Transaction Reference</Text>
                                    <TextInput
                                        className="bg-white rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800"
                                        placeholder="Transaction ID or Check Number"
                                        placeholderTextColor="#9CA3AF"
                                        value={formData.transferDetails.transactionRef}
                                        onChangeText={(text) => setFormData(prev => ({ ...prev, transferDetails: { ...prev.transferDetails, transactionRef: text } }))}
                                    />
                                </View>
                            </>
                        )}
                    </View>
                )}

                <View className="mb-4">
                    <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Reason for Transfer *</Text>
                    <TextInput
                        className="bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800"
                        placeholder="Why are you transferring ownership?"
                        placeholderTextColor="#9CA3AF"
                        value={formData.transferDetails.reason}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, transferDetails: { ...prev.transferDetails, reason: text } }))}
                        multiline
                        numberOfLines={3}
                    />
                </View>

                <View className="mb-4">
                    <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Effective Date *</Text>
                    <TextInput
                        className="bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800"
                        placeholder="YYYY-MM-DD (when transfer takes effect)"
                        placeholderTextColor="#9CA3AF"
                        value={formData.transferDetails.effectiveDate}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, transferDetails: { ...prev.transferDetails, effectiveDate: text } }))}
                    />
                </View>
            </View>
        );
    };

    const renderDocuments = () => {
        if (!formData.transferType) {
            return (
                <View className="items-center py-12">
                    <Ionicons name="alert-circle-outline" size={64} color="#9CA3AF" />
                    <Text className="text-gray-500 text-base mt-4 text-center">Please select transfer type first</Text>
                </View>
            );
        }

        return (
            <View className="w-full">
                <Text className="text-gray-800 text-lg font-bold mb-4">Supporting Documents</Text>
                <Text className="text-gray-600 text-sm mb-4">Based on your selection: <Text className="font-semibold">{formData.transferType}</Text></Text>

                <View className="mb-6">
                    <Text className="text-gray-800 text-base font-semibold mb-3">Required for All Transfers</Text>
                    <DocumentUploadField
                        label="Current Ownership Certificate *"
                        file={formData.documents.currentOwnershipCertificate}
                        onUpload={() => handleUpload('documents.currentOwnershipCertificate')}
                        required
                    />
                    <DocumentUploadField
                        label="Current Owner ID Copy *"
                        file={formData.documents.currentOwnerIdCopy}
                        onUpload={() => handleUpload('documents.currentOwnerIdCopy')}
                        required
                    />
                    <DocumentUploadField
                        label="New Owner ID Copy *"
                        file={formData.documents.newOwnerIdCopy}
                        onUpload={() => handleUpload('documents.newOwnerIdCopy')}
                        required
                    />
                </View>

                {formData.transferType === 'sale' && (
                    <View className="mb-6">
                        <Text className="text-gray-800 text-base font-semibold mb-3">Sale/Purchase Documents</Text>
                        <DocumentUploadField
                            label="Sale Contract/Agreement *"
                            file={formData.documents.saleContract}
                            onUpload={() => handleUpload('documents.saleContract')}
                            required
                        />
                        <DocumentUploadField
                            label="Payment Receipt/Proof *"
                            file={formData.documents.paymentReceipt}
                            onUpload={() => handleUpload('documents.paymentReceipt')}
                            required
                        />
                        <DocumentUploadField
                            label="Tax Clearance Certificate *"
                            file={formData.documents.taxClearance}
                            onUpload={() => handleUpload('documents.taxClearance')}
                            required
                        />
                    </View>
                )}

                {formData.transferType === 'gift' && (
                    <View className="mb-6">
                        <Text className="text-gray-800 text-base font-semibold mb-3">Gift/Donation Documents</Text>
                        <DocumentUploadField
                            label="Gift Agreement Document *"
                            file={formData.documents.giftAgreement}
                            onUpload={() => handleUpload('documents.giftAgreement')}
                            required
                        />
                        <DocumentUploadField
                            label="Family Relationship Proof *"
                            file={formData.documents.relationshipProof}
                            onUpload={() => handleUpload('documents.relationshipProof')}
                            required
                        />
                    </View>
                )}

                {formData.transferType === 'inheritance' && (
                    <View className="mb-6">
                        <Text className="text-gray-800 text-base font-semibold mb-3">Inheritance Documents</Text>
                        <DocumentUploadField
                            label="Death Certificate *"
                            file={formData.documents.deathCertificate}
                            onUpload={() => handleUpload('documents.deathCertificate')}
                            required
                        />
                        <DocumentUploadField
                            label="Inheritance Court Document *"
                            file={formData.documents.inheritanceCourtDocument}
                            onUpload={() => handleUpload('documents.inheritanceCourtDocument')}
                            required
                        />
                        <DocumentUploadField
                            label="Family Agreement Document *"
                            file={formData.documents.familyAgreement}
                            onUpload={() => handleUpload('documents.familyAgreement')}
                            required
                        />
                        <DocumentUploadField
                            label="Heir List (all family members) *"
                            file={formData.documents.heirList}
                            onUpload={() => handleUpload('documents.heirList')}
                            required
                        />
                    </View>
                )}

                {formData.transferType === 'exchange' && (
                    <View className="mb-6">
                        <Text className="text-gray-800 text-base font-semibold mb-3">Exchange Documents</Text>
                        <DocumentUploadField
                            label="Exchange Agreement *"
                            file={formData.documents.exchangeAgreement}
                            onUpload={() => handleUpload('documents.exchangeAgreement')}
                            required
                        />
                        <DocumentUploadField
                            label="Valuation Report (both plots) *"
                            file={formData.documents.valuationReport}
                            onUpload={() => handleUpload('documents.valuationReport')}
                            required
                        />
                    </View>
                )}

                {formData.transferType === 'court' && (
                    <View className="mb-6">
                        <Text className="text-gray-800 text-base font-semibold mb-3">Court Order Documents</Text>
                        <DocumentUploadField
                            label="Court Decision Document *"
                            file={formData.documents.courtDecision}
                            onUpload={() => handleUpload('documents.courtDecision')}
                            required
                        />
                        <DocumentUploadField
                            label="Court Order Certificate *"
                            file={formData.documents.courtOrder}
                            onUpload={() => handleUpload('documents.courtOrder')}
                            required
                        />
                    </View>
                )}

                <View className="mb-4">
                    <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Witness Statements (2 Minimum) *</Text>
                    <Text className="text-gray-500 text-xs mb-3 ml-1">Each witness must provide ID copy and phone number</Text>

                    {(formData.documents?.witnesses || []).map((witness: any, index: number) => (
                        <View key={index} className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <Text className="text-gray-700 text-sm font-semibold mb-3">Witness {index + 1}</Text>
                            <TextInput
                                className="bg-white rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800 mb-3"
                                placeholder="Witness Full Name *"
                                placeholderTextColor="#9CA3AF"
                                value={witness?.name || ''}
                                onChangeText={(text) => {
                                    const newWitnesses = [...(formData.documents?.witnesses || [])];
                                    newWitnesses[index] = { ...newWitnesses[index], name: text };
                                    setFormData(prev => ({ ...prev, documents: { ...prev.documents, witnesses: newWitnesses } }));
                                }}
                            />
                            <TextInput
                                className="bg-white rounded-xl px-4 py-3.5 border border-gray-200 text-gray-800 mb-3"
                                placeholder="Witness Phone Number *"
                                placeholderTextColor="#9CA3AF"
                                value={witness?.phone || ''}
                                onChangeText={(text) => {
                                    const newWitnesses = [...(formData.documents?.witnesses || [])];
                                    newWitnesses[index] = { ...newWitnesses[index], phone: text };
                                    setFormData(prev => ({ ...prev, documents: { ...prev.documents, witnesses: newWitnesses } }));
                                }}
                                keyboardType="phone-pad"
                            />
                            <DocumentUploadField
                                label="Witness ID Copy *"
                                file={witness?.idCopy}
                                onUpload={() => handleUpload(`documents.witnesses[${index}].idCopy`, 5)}
                                required
                            />
                            <DocumentUploadField
                                label="Witness Statement *"
                                file={witness?.statement}
                                onUpload={() => handleUpload(`documents.witnesses[${index}].statement`)}
                                required
                            />
                        </View>
                    ))}

                    <TouchableOpacity
                        onPress={() => {
                            const currentWitnesses = formData.documents?.witnesses || [];
                            if (currentWitnesses.length < 4) {
                                setFormData(prev => ({
                                    ...prev,
                                    documents: {
                                        ...prev.documents,
                                        witnesses: [
                                            ...currentWitnesses,
                                            { name: '', phone: '', idCopy: null, statement: null }
                                        ]
                                    }
                                }));
                            }
                        }}
                        disabled={(formData.documents?.witnesses || []).length >= 4}
                        className={`flex-row items-center justify-center py-3 rounded-xl border-2 border-dashed ${(formData.documents?.witnesses || []).length >= 4 ? 'border-gray-300' : 'border-[#125f43ff]'
                            }`}
                    >
                        <Ionicons name="add-circle" size={20} color={(formData.documents?.witnesses || []).length >= 4 ? '#9CA3AF' : '#125f43ff'} />
                        <Text className={`text-sm font-semibold ml-2 ${(formData.documents?.witnesses || []).length >= 4 ? 'text-gray-400' : 'text-[#125f43ff]'
                            }`}>
                            {(formData.documents?.witnesses || []).length >= 4 ? 'Maximum 4 witnesses' : 'Add Another Witness'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderDeclarations = () => (
        <View className="w-full">
            <Text className="text-gray-800 text-lg font-bold mb-4">Declarations & Signatures</Text>

            <TouchableOpacity
                onPress={() => setFormData(prev => ({ ...prev, currentOwnerDeclaration: !prev.currentOwnerDeclaration }))}
                className="flex-row items-start mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200"
            >
                <View className={`w-6 h-6 rounded border-2 mr-3 mt-1 items-center justify-center ${formData.currentOwnerDeclaration ? 'bg-[#125f43ff] border-[#125f43ff]' : 'border-gray-400 bg-white'
                    }`}>
                    {formData.currentOwnerDeclaration && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
                <View className="flex-1">
                    <Text className="text-gray-800 text-sm font-semibold mb-1">Current Owner Declaration *</Text>
                    <Text className="text-gray-700 text-sm">I confirm I am the legal owner and have the right to transfer this land. All information provided is true and accurate.</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => setFormData(prev => ({ ...prev, newOwnerDeclaration: !prev.newOwnerDeclaration }))}
                className="flex-row items-start mb-4 p-4 bg-green-50 rounded-xl border border-green-200"
            >
                <View className={`w-6 h-6 rounded border-2 mr-3 mt-1 items-center justify-center ${formData.newOwnerDeclaration ? 'bg-[#125f43ff] border-[#125f43ff]' : 'border-gray-400 bg-white'
                    }`}>
                    {formData.newOwnerDeclaration && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
                <View className="flex-1">
                    <Text className="text-gray-800 text-sm font-semibold mb-1">New Owner Declaration *</Text>
                    <Text className="text-gray-700 text-sm">I accept ownership and all responsibilities for this land. I agree to pay all transfer fees and taxes.</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => setFormData(prev => ({ ...prev, bothAgree: !prev.bothAgree }))}
                className="flex-row items-start mb-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200"
            >
                <View className={`w-6 h-6 rounded border-2 mr-3 mt-1 items-center justify-center ${formData.bothAgree ? 'bg-[#125f43ff] border-[#125f43ff]' : 'border-gray-400 bg-white'
                    }`}>
                    {formData.bothAgree && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
                <View className="flex-1">
                    <Text className="text-gray-800 text-sm font-semibold mb-1">Both Parties Agreement *</Text>
                    <Text className="text-gray-700 text-sm">We both agree to the terms and conditions of this transfer. No hidden disputes or encumbrances except those disclosed above.</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => setFormData(prev => ({ ...prev, noHiddenDisputes: !prev.noHiddenDisputes }))}
                className="flex-row items-start mb-6 p-4 bg-red-50 rounded-xl border border-red-200"
            >
                <View className={`w-6 h-6 rounded border-2 mr-3 mt-1 items-center justify-center ${formData.noHiddenDisputes ? 'bg-[#125f43ff] border-[#125f43ff]' : 'border-gray-400 bg-white'
                    }`}>
                    {formData.noHiddenDisputes && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
                <View className="flex-1">
                    <Text className="text-gray-800 text-sm font-semibold mb-1">No Hidden Disputes *</Text>
                    <Text className="text-gray-700 text-sm">We declare there are no undisclosed legal disputes, mortgages, or claims on this land.</Text>
                </View>
            </TouchableOpacity>

            <View className="bg-green-50 rounded-xl p-4 border border-green-200 mb-4">
                <View className="flex-row items-start">
                    <Ionicons name="shield-checkmark" size={20} color="#125f43ff" />
                    <View className="ml-3 flex-1">
                        <Text className="text-green-800 text-sm font-semibold mb-1">What Happens Next?</Text>
                        <Text className="text-green-700 text-xs">
                            1. Document review by land officer{"\n"}
                            2. Both parties verification{"\n"}
                            3. Field inspection (if required){"\n"}
                            4. Tax clearance verification{"\n"}
                            5. Approval and certificate update{"\n"}
                            6. Estimated processing time: 14-30 business days
                        </Text>
                    </View>
                </View>
            </View>

            <View className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <Text className="text-blue-800 text-xs font-semibold mb-1">📋 Track Your Request</Text>
                <Text className="text-blue-700 text-xs">
                    After submission, you'll receive a reference number. Both parties can track the transfer status in real-time.
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
                        <View className="px-6 pt-14 pb-4">
                            <View className="flex-row justify-between mb-2">
                                {(sections || []).map((_, index) => (
                                    <View
                                        key={index}
                                        className={`h-1 flex-1 rounded-full mx-0.5 ${index <= currentSection ? 'bg-white' : 'bg-white/30'}`}
                                    />
                                ))}
                            </View>
                            <Text className="text-white/80 text-xs text-center">
                                Section {currentSection + 1} of {(sections || []).length}: {(sections || [])[currentSection]?.title}
                            </Text>
                        </View>

                        {/* Active Section Card Container */}
                        <View className="flex-1 w-full">
                            {renderSectionCard((sections || [])[currentSection], currentSection)}
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
                                    <Text className="text-xs font-bold text-[#125f43ff]">14-30 Business Days</Text>
                                </View>
                            </View>

                            {/* CTA Actions */}
                            <View className="w-full gap-3">
                                <TouchableOpacity
                                    onPress={() => {
                                        setShowSuccessModal(false);
                                        navigation.navigate('RequestDetail', { referenceNumber: successRefNum });
                                    }}
                                    className="bg-[#125f43ff] py-3.5 rounded-xl w-full items-center flex-row justify-center shadow-lg"
                                >
                                    <Ionicons name="eye" size={18} color="white" />
                                    <Text className="text-white font-bold text-base ml-2">Track Request Progress</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => {
                                        setFormData({
                                            transferType: '',
                                            currentOwner: {
                                                fullName: user?.fullName || '',
                                                nationalId: user?.faydaId || '',
                                                phone: user?.phone || '',
                                                email: user?.email || '',
                                                address: '',
                                                kebeleIdCopy: null,
                                                powerOfAttorney: null,
                                                maritalStatus: '',
                                                spouseConsent: null,
                                            },
                                            newOwner: {
                                                fullName: '',
                                                nationalId: '',
                                                phone: '',
                                                email: '',
                                                address: '',
                                                kebeleIdCopy: null,
                                                photo: null,
                                            },
                                            landInfo: {
                                                plotNumber: '',
                                                certificateNumber: '',
                                                originalCertificate: null,
                                                location: { region: '', zone: '', wereda: '', kebele: '' },
                                                area: '',
                                                landUseType: '',
                                                landStatus: 'free',
                                                boundaries: { north: '', south: '', east: '', west: '' },
                                                encumbrances: '',
                                            },
                                            transferDetails: {
                                                transferPrice: '',
                                                paymentReceipt: null,
                                                transferAgreement: null,
                                                witnesses: [
                                                    { name: '', phone: '', signature: null },
                                                    { name: '', phone: '', signature: null },
                                                ],
                                            },
                                            acceptDeclaration1: false,
                                            acceptDeclaration2: false,
                                            acceptDeclaration3: false,
                                            currentOwnerSignature: null,
                                            newOwnerSignature: null,
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