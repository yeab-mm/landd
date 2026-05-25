import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../../components/ui/Input';
import { DropdownField } from '../../../components/forms/DropdownField';

interface LandInformationSectionProps {
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

export const LandInformationSection: React.FC<LandInformationSectionProps> = ({
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
      <Text className="text-gray-800 text-lg font-bold mb-4">Land Information</Text>

      <Input
        label="Plot/Parcel Number"
        placeholder="PLOT-2024-12345"
        value={landInfo.plotNumber}
        onChangeText={(text) =>
          setFormData((prev: any) => ({
            ...prev,
            landInfo: { ...prev.landInfo, plotNumber: text.toUpperCase() },
          }))
        }
        autoCapitalize="characters"
        required
      />

      <Input
        label="Previous Certificate Number"
        placeholder="CERT-2020-XXXXX"
        value={landInfo.certificateNumber}
        onChangeText={(text) =>
          setFormData((prev: any) => ({
            ...prev,
            landInfo: { ...prev.landInfo, certificateNumber: text },
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
            {locationLoading ? 'Detecting...' : '📍 Use Current Location'}
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-between">
          <View className="w-[48%]">
            <DropdownField
              label="Region"
              value={landInfo.location.region}
              options={Object.keys(ethiopiaLocations)}
              onSelect={(value) => handleLocationChange('region', value)}
              placeholder="Select Region"
            />
          </View>
          <View className="w-[48%]">
            <DropdownField
              label="Zone"
              value={landInfo.location.zone}
              options={getAvailableZones()}
              onSelect={(value) => handleLocationChange('zone', value)}
              placeholder="Select Zone"
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
              placeholder="Select Wereda"
              disabled={!landInfo.location.zone}
            />
          </View>
          <View className="w-[48%]">
            <DropdownField
              label="Kebele"
              value={landInfo.location.kebele}
              options={getAvailableKebeles()}
              onSelect={(value) => handleLocationChange('kebele', value)}
              placeholder="Select Kebele"
              disabled={!landInfo.location.wereda}
            />
          </View>
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Land Size *</Text>
        <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-2 border border-gray-200">
          <Ionicons name="expand" size={22} color="#9CA3AF" />
          <Input
            placeholder="450"
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
          <View className="bg-white rounded-lg px-3 py-2 border border-gray-200 ml-2">
            <Text className="text-gray-700 text-sm font-semibold">{landInfo.landSizeUnit}</Text>
          </View>
        </View>
      </View>

      <DropdownField
        label="Land Use Type"
        value={landInfo.landUseType}
        options={['Residential', 'Commercial', 'Agricultural', 'Mixed', 'Industrial']}
        onSelect={(value) =>
          setFormData((prev: any) => ({
            ...prev,
            landInfo: { ...prev.landInfo, landUseType: value },
          }))
        }
        placeholder="Select Land Use"
      />

      {landInfo.landUseType && (
        <View className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
          <View className="flex-row items-center">
            <Ionicons name="information-circle" size={16} color="#2563EB" />
            <Text className="text-blue-700 text-xs ml-2">
              {landInfo.landUseType === 'Commercial'
                ? '💼 Commercial land: 22% transfer tax applies'
                : '🏠 Non-commercial land: 5% transfer tax applies'}
            </Text>
          </View>
        </View>
      )}

      <DropdownField
        label="Current Land Status"
        value={landInfo.landStatus}
        options={['Vacant', 'Under Construction', 'Fully Built', 'Agricultural Use']}
        onSelect={(value) =>
          setFormData((prev: any) => ({
            ...prev,
            landInfo: { ...prev.landInfo, landStatus: value },
          }))
        }
        placeholder="Select Status"
      />

      <View className="mb-4">
        <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Land Boundaries *</Text>
        <Text className="text-gray-500 text-xs mb-3 ml-1">
          Enter neighbor names or boundary markers for each direction
        </Text>
        <View className="flex-row justify-between mb-2">
          <View className="w-[48%]">
            <Input
              placeholder="North *"
              value={landInfo.boundaries.north}
              onChangeText={(text) =>
                setFormData((prev: any) => ({
                  ...prev,
                  landInfo: {
                    ...prev.landInfo,
                    boundaries: { ...prev.landInfo.boundaries, north: text },
                  },
                }))
              }
            />
          </View>
          <View className="w-[48%]">
            <Input
              placeholder="South *"
              value={landInfo.boundaries.south}
              onChangeText={(text) =>
                setFormData((prev: any) => ({
                  ...prev,
                  landInfo: {
                    ...prev.landInfo,
                    boundaries: { ...prev.landInfo.boundaries, south: text },
                  },
                }))
              }
            />
          </View>
        </View>
        <View className="flex-row justify-between">
          <View className="w-[48%]">
            <Input
              placeholder="East *"
              value={landInfo.boundaries.east}
              onChangeText={(text) =>
                setFormData((prev: any) => ({
                  ...prev,
                  landInfo: {
                    ...prev.landInfo,
                    boundaries: { ...prev.landInfo.boundaries, east: text },
                  },
                }))
              }
            />
          </View>
          <View className="w-[48%]">
            <Input
              placeholder="West *"
              value={landInfo.boundaries.west}
              onChangeText={(text) =>
                setFormData((prev: any) => ({
                  ...prev,
                  landInfo: {
                    ...prev.landInfo,
                    boundaries: { ...prev.landInfo.boundaries, west: text },
                  },
                }))
              }
            />
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={() =>
          setFormData((prev: any) => ({
            ...prev,
            landInfo: {
              ...prev.landInfo,
              encumbrances: {
                ...prev.landInfo.encumbrances,
                hasEncumbrance: !prev.landInfo.encumbrances.hasEncumbrance,
              },
            },
          }))
        }
        className="mb-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200"
      >
        <View className="flex-row items-center mb-3">
          <View
            className={`w-5 h-5 rounded border-2 mr-2 items-center justify-center ${
              landInfo.encumbrances.hasEncumbrance
                ? 'bg-primary border-primary'
                : 'border-gray-400 bg-white'
            }`}
          >
            {landInfo.encumbrances.hasEncumbrance && (
              <Ionicons name="checkmark" size={14} color="white" />
            )}
          </View>
          <Text className="text-gray-800 text-sm font-semibold">
            Land has encumbrances (mortgage, lease, dispute)
          </Text>
        </View>

        {landInfo.encumbrances.hasEncumbrance && (
          <View>
            <Text className="text-gray-700 text-sm font-semibold mb-2">
              Please describe encumbrances:
            </Text>
            <Input
              placeholder="Describe mortgage, lease, or any disputes..."
              value={landInfo.encumbrances.details}
              onChangeText={(text) =>
                setFormData((prev: any) => ({
                  ...prev,
                  landInfo: {
                    ...prev.landInfo,
                    encumbrances: { ...prev.landInfo.encumbrances, details: text },
                  },
                }))
              }
              multiline
              numberOfLines={3}
              containerClassName="mb-0"
              className="bg-white"
            />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};
