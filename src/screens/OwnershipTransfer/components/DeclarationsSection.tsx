import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface DeclarationsSectionProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export const DeclarationsSection: React.FC<DeclarationsSectionProps> = ({
  formData,
  setFormData,
}) => {
  const navigation = useNavigation<any>();
  const toggleDeclaration = (field: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const DeclarationItem = ({ 
    field, 
    title, 
    description, 
    colorClass 
  }: { 
    field: string, 
    title: string, 
    description: string, 
    colorClass: string 
  }) => (
    <TouchableOpacity
      onPress={() => toggleDeclaration(field)}
      className={`flex-row items-start mb-4 p-4 rounded-xl border ${colorClass}`}
      activeOpacity={0.7}
    >
      <View
        className={`w-6 h-6 rounded border-2 mr-3 mt-1 items-center justify-center ${
          formData[field] ? 'bg-primary border-primary' : 'border-gray-400 bg-white'
        }`}
      >
        {formData[field] && <Ionicons name="checkmark" size={16} color="white" />}
      </View>
      <View className="flex-1">
        <Text className="text-gray-800 text-sm font-semibold mb-1">{title}</Text>
        <Text className="text-gray-700 text-sm mb-2">{description}</Text>
        <TouchableOpacity 
          onPress={(e) => {
            e.stopPropagation();
            navigation.navigate('TermsAndConditions', { type: 'declaration' });
          }}
          className="flex-row items-center"
        >
          <Text className="text-primary text-xs font-bold underline">Detailed Legal Implications</Text>
          <Ionicons name="chevron-forward" size={12} color="#125f43" className="ml-1" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="w-full">
      <Text className="text-gray-800 text-lg font-bold mb-4">Declarations & Signatures</Text>

      <DeclarationItem
        field="currentOwnerDeclaration"
        title="Current Owner Declaration *"
        description="I confirm I am the legal owner and have the right to transfer this land. All information provided is true and accurate."
        colorClass="bg-blue-50 border-blue-200"
      />

      <DeclarationItem
        field="newOwnerDeclaration"
        title="New Owner Declaration *"
        description="I accept ownership and all responsibilities for this land. I agree to pay all transfer fees and taxes."
        colorClass="bg-green-50 border-green-200"
      />

      <DeclarationItem
        field="bothAgree"
        title="Both Parties Agreement *"
        description="We both agree to the terms and conditions of this transfer. No hidden disputes or encumbrances except those disclosed above."
        colorClass="bg-yellow-50 border-yellow-200"
      />

      <DeclarationItem
        field="noHiddenDisputes"
        title="No Hidden Disputes *"
        description="We declare there are no undisclosed legal disputes, mortgages, or claims on this land."
        colorClass="bg-red-50 border-red-200"
      />

      <View className="bg-primary/5 rounded-xl p-4 border border-primary/20 mb-4">
        <View className="flex-row items-start">
          <Ionicons name="shield-checkmark" size={20} color="#125f43" />
          <View className="ml-3 flex-1">
            <Text className="text-primary font-semibold mb-1">What Happens Next?</Text>
            <Text className="text-gray-700 text-xs">
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
};
