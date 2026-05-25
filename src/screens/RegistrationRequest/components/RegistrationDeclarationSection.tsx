import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface RegistrationDeclarationSectionProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export const RegistrationDeclarationSection: React.FC<RegistrationDeclarationSectionProps> = ({
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
      <Text className="text-gray-800 text-lg font-bold mb-4">Final Declaration</Text>

      <DeclarationItem
        field="acceptDeclaration1"
        title="Accuracy Statement *"
        description="I declare that all information and documents provided in this application are true, correct, and complete to the best of my knowledge."
        colorClass="bg-blue-50 border-blue-100"
      />

      <DeclarationItem
        field="acceptDeclaration2"
        title="Authorization & Verificaiton *"
        description="I authorize the Land Administration Bureau to verify my information with relevant government agencies and conduct field inspections."
        colorClass="bg-green-50 border-green-100"
      />

      <DeclarationItem
        field="acceptDeclaration3"
        title="Legal Responsibility *"
        description="I understand that any false statement or forged document will lead to immediate rejection, legal action, and possible criminal prosecution."
        colorClass="bg-red-50 border-red-100"
      />
      
      <View className="bg-primary/5 rounded-xl p-4 border border-primary/20 mt-4">
        <View className="flex-row items-start">
          <Ionicons name="information-circle" size={20} color="#125f43" />
          <View className="ml-3 flex-1">
            <Text className="text-primary font-semibold mb-1">Fee Notice</Text>
            <Text className="text-gray-700 text-xs">
              Registration fees will be calculated after document verification. You will receive a notification to pay the fees before final approval.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
