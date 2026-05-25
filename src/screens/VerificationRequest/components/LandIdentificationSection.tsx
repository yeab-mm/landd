import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../../components/ui/Input';
import { DropdownField } from '../../../components/forms/DropdownField';

interface LandIdentificationSectionProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onLocationDetect: () => void;
  locationLoading: boolean;
  ethiopiaLocations: any;
  handleLocationChange: (field: string, value: string) => void;
  getAvailableZones: () => string[];
  getAvailableWeredas: () => string[];
  getAvailableKebeles: () => string[];
}

export const LandIdentificationSection: React.FC<LandIdentificationSectionProps> = ({
  formData,
  setFormData,
  onLocationDetect,
  locationLoading,
  ethiopiaLocations,
  handleLocationChange,
  getAvailableZones,
  getAvailableWeredas,
  getAvailableKebeles,
}) => {
  return (
    <View className="w-full">
      <Input
        label="Plot/Parcel Number"
        placeholder="PLOT-2024-12345"
        value={formData.plotNumber}
        onChangeText={(text) => setFormData((prev: any) => ({ ...prev, plotNumber: text.toUpperCase() }))}
        autoCapitalize="characters"
        required
        helperText="Format: PLOT-2024-12345"
      />

      <View className="mb-4">
        <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Location *</Text>
        <TouchableOpacity
          onPress={onLocationDetect}
          disabled={locationLoading}
          className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200 mb-2"
          activeOpacity={0.7}
        >
          {locationLoading ? (
            <ActivityIndicator size="small" color="#125f43" />
          ) : (
            <Ionicons name="locate" size={22} color="#125f43" />
          )}
          <Text className="text-primary text-base ml-3 font-semibold">
            {locationLoading ? 'Detecting...' : '📍 Use Current Location'}
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-between mb-2">
          <View className="w-[48%]">
            <DropdownField
              label="Region"
              value={formData.location.region}
              options={Object.keys(ethiopiaLocations)}
              onSelect={(value) => handleLocationChange('region', value)}
              placeholder="Select Region"
            />
          </View>
          <View className="w-[48%]">
            <DropdownField
              label="Zone"
              value={formData.location.zone}
              options={getAvailableZones()}
              onSelect={(value) => handleLocationChange('zone', value)}
              placeholder="Select Zone"
              disabled={!formData.location.region}
            />
          </View>
        </View>

        <View className="flex-row justify-between">
          <View className="w-[48%]">
            <DropdownField
              label="Wereda"
              value={formData.location.wereda}
              options={getAvailableWeredas()}
              onSelect={(value) => handleLocationChange('wereda', value)}
              placeholder="Select Wereda"
              disabled={!formData.location.zone}
            />
          </View>
          <View className="w-[48%]">
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
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Land Size *</Text>
        <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-1 border border-gray-200">
          <Ionicons name="expand" size={22} color="#9CA3AF" />
          <Input
            placeholder="450"
            value={formData.landSize}
            onChangeText={(text) => setFormData((prev: any) => ({ ...prev, landSize: text }))}
            keyboardType="numeric"
            containerClassName="mb-0 flex-1 ml-0"
            className="border-0 bg-transparent"
          />
          <View className="bg-white rounded-lg px-3 py-2 border border-gray-200 ml-2">
            <Text className="text-gray-700 text-sm font-semibold">{formData.landSizeUnit}</Text>
          </View>
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Land Use Type *</Text>
        <View className="flex-row flex-wrap">
          {['Residential', 'Commercial', 'Agricultural', 'Mixed'].map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setFormData((prev: any) => ({ ...prev, landUseType: type }))}
              className={`px-4 py-2 rounded-xl mr-2 mb-2 border-2 ${
                formData.landUseType === type
                  ? 'bg-primary border-primary'
                  : 'bg-white border-gray-200'
              }`}
              activeOpacity={0.7}
            >
              <Text
                className={`text-sm font-semibold ${
                  formData.landUseType === type ? 'text-white' : 'text-gray-700'
                }`}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};
