import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface DynamicHeaderProps {
  // Navigation
  navigateToModules: () => void;
  
  // View type control
  viewType: 'chips' | 'dropdown';
  setViewType: (type: 'chips' | 'dropdown') => void;
  
  // Content customization
  title: string;
  description: string;
  backgroundColor: string;
  textColor: string;
  lightTextColor: string;
  buttonColor: string;
  
  // Optional category title
  categoryTitle?: string;
}

const DynamicHeader: React.FC<DynamicHeaderProps> = ({
  navigateToModules,
  viewType,
  setViewType,
  title,
  description,
  backgroundColor,
  textColor,
  lightTextColor,
  buttonColor,
  categoryTitle
}) => {
  return (
    <View style={{ backgroundColor }} className="px-4 py-4">
      <View className="flex-row justify-between items-start">
        <View className="flex-row items-start flex-1 mr-2">
          <TouchableOpacity
            className="mr-3 p-1 mt-1"
            onPress={navigateToModules}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={lightTextColor}
            />
          </TouchableOpacity>
          <View className="flex-1">
            <Text style={{ color: textColor }} className="text-xl font-bold mb-1">{title}</Text>
            <Text 
              style={{ color: lightTextColor }} 
              className="text-sm"
              numberOfLines={2}
            >
              {categoryTitle ? `${description} - ${categoryTitle}` : description}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={{ backgroundColor: buttonColor }}
          className="rounded-full p-2 flex-row items-center mt-1"
          onPress={() => setViewType(viewType === 'chips' ? 'dropdown' : 'chips')}
        >
          <Ionicons
            name={viewType === 'chips' ? 'list-outline' : 'grid-outline'}
            size={18}
            color={lightTextColor}
          />
          <Text style={{ color: lightTextColor }} className="ml-1 text-xs">
            {viewType === 'chips' ? 'Ver lista' : 'Ver chips'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DynamicHeader; 