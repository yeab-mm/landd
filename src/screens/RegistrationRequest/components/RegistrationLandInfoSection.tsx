import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../../components/ui/Input';
import { DropdownField } from '../../../components/forms/DropdownField';

interface RegistrationLandInfoSectionProps {
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

export const RegistrationLandInfoSection: React.FC<RegistrationLandInfoSectionProps> = ({
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
  const landInfo = formData.landInfo;

  return (
    <View className="w-full">
      <Text className="text-gray-800 text-lg font-bold mb-4">Land Property Details</Text>

      <Input
        label="Plot/Parcel Number"
        placeholder="PLOT-2024-XXXXX"
        value={landInfo.plotNumber}
        onChangeText={(text) =>
          setFormData((prev: any) => ({
            ...prev,
            landInfo: { ...prev.landInfo, plotNumber: text.toUpperCase() },
          }))
        }
        required
      />

      <View className="mb-4">
        <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Location *</Text>
        <TouchableOpacity
          onPress={onLocationDetect}
          disabled={locationLoading}
          className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200 mb-3"
          activeOpacity={0.7}
        >
          {locationLoading ? (
            <ActivityIndicator size="small" color="#125f43" />
          ) : (
            <Ionicons name="locate" size={22} color="#125f43" />
          )}
          <Text className="text-primary text-base ml-3 font-semibold">
            {locationLoading ? 'Detecting...' : '📍 Detect Current Location'}
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-between mb-2">
          <View className="w-[48%]">
            <DropdownField
              label="Region"
              value={landInfo.location.region}
              options={Object.keys(ethiopiaLocations)}
              onSelect={(value) => handleLocationChange('region', value)}
              placeholder="Region"
            />
          </View>
          <View className="w-[48%]">
            <DropdownField
              label="Zone"
              value={landInfo.location.zone}
              options={getAvailableZones()}
              onSelect={(value) => handleLocationChange('zone', value)}
              placeholder="Zone"
              disabled={!landInfo.location.region}
            />
          </View>
        </View>
        <View className="flex-row justify-between">
          <View className="w-[48%]">
            <DropdownField
              label="Wereda"
              value={landInfo.location.wereda}
              options={getAvailableWeredas()}
              onSelect={(value) => handleLocationChange('wereda', value)}
              placeholder="Wereda"
              disabled={!landInfo.location.zone}
            />
          </View>
          <View className="w-[48%]">
            <DropdownField
              label="Kebele"
              value={landInfo.location.kebele}
              options={getAvailableKebeles()}
              onSelect={(value) => handleLocationChange('kebele', value)}
              placeholder="Kebele"
              disabled={!landInfo.location.wereda}
            />
          </View>
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Land Size *</Text>
        <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-1 border border-gray-200">
          <Ionicons name="expand" size={20} color="#9CA3AF" />
          <Input
            placeholder="Size"
            value={landInfo.landSize}
            onChangeText={(text) =>
              setFormData((prev: any) => ({
                ...prev,
                landInfo: { ...prev.landInfo, landSize: text },
              }))
            }
            keyboardType="numeric"
            containerClassName="mb-0 flex-1 ml-0"
            className="border-0 bg-transparent"
          />
          <View className="bg-white rounded-lg px-2 py-1 border border-gray-200 ml-2">
            <Text className="text-gray-700 text-xs font-bold">{landInfo.landSizeUnit}</Text>
          </View>
        </View>
      </View>

      <DropdownField
        label="Land Use Type"
        value={landInfo.landUseType}
        options={['Residential', 'Commercial', 'Agricultural', 'Mixed Use']}
        onSelect={(value) =>
          setFormData((prev: any) => ({
            ...prev,
            landInfo: { ...prev.landInfo, landUseType: value },
          }))
        }
        placeholder="Select Land Use"
      />

      <DropdownField
        label="Status of Development"
        value={landInfo.landStatus}
        options={['Vacant', 'Under Construction', 'Fully Built', 'Agricultural Use']}
        onSelect={(value) =>
          setFormData((prev: any) => ({
            ...prev,
            landInfo: { ...prev.landInfo, landStatus: value.toLowerCase() },
          }))
        }
        placeholder="Current status"
      />

      <View className="mb-4">
        <Text className="text-gray-800 text-sm font-bold mb-3">Boundary Descriptions</Text>
        <View className="flex-row justify-between mb-2">
          <View className="w-[48%]">
            <Input
              label="North neighbor"
              placeholder="Name/Marker"
              value={landInfo.boundaries.north}
              onChangeText={(text) => setFormData((prev: any) => ({ ...prev, landInfo: { ...prev.landInfo, boundaries: { ...prev.landInfo.boundaries, north: text } } }))}
              labelClassName="text-xs"
            />
          </View>
          <View className="w-[48%]">
            <Input
              label="South neighbor"
              placeholder="Name/Marker"
              value={landInfo.boundaries.south}
              onChangeText={(text) => setFormData((prev: any) => ({ ...prev, landInfo: { ...prev.landInfo, boundaries: { ...prev.landInfo.boundaries, south: text } } }))}
              labelClassName="text-xs"
            />
          </View>
        </View>
        <View className="flex-row justify-between">
          <View className="w-[48%]">
            <Input
              label="East neighbor"
              placeholder="Name/Marker"
              value={landInfo.boundaries.east}
              onChangeText={(text) => setFormData((prev: any) => ({ ...prev, landInfo: { ...prev.landInfo, boundaries: { ...prev.landInfo.boundaries, east: text } } }))}
              labelClassName="text-xs"
            />
          </View>
          <View className="w-[48%]">
            <Input
              label="West neighbor"
              placeholder="Name/Marker"
              value={landInfo.boundaries.west}
              onChangeText={(text) => setFormData((prev: any) => ({ ...prev, landInfo: { ...prev.landInfo, boundaries: { ...prev.landInfo.boundaries, west: text } } }))}
              labelClassName="text-xs"
            />
          </View>
        </View>
      </View>
    </View>
  );
};
