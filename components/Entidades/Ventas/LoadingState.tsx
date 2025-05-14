import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

const LoadingState: React.FC = () => {
    return (
        <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#15803d" />
            <Text className="mt-2 text-gray-600">Cargando datos...</Text>
        </View>
    );
};

export default LoadingState;