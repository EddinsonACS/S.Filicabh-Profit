import { salesCategories } from './EntVentasData';
import { SalesItem } from './VentasTypes';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface ItemModalProps {
    visible: boolean;
    onClose: () => void;
    currentItem: SalesItem | null;
    openEditModal: (item: SalesItem) => void;
    handleDelete: (id: string) => void;
}

const { height } = Dimensions.get('window');

const ItemModal: React.FC<ItemModalProps> = ({
    visible,
    onClose,
    currentItem,
    openEditModal,
    handleDelete
}) => {
    const translateY = React.useRef(new Animated.Value(height)).current;
    const opacity = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: height,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    if (!currentItem) return null;

    // Get the category color from salesCategories
    const getCategoryColor = (type: string) => {
        const category = salesCategories.find(cat => cat.type === type);
        return {
            primary: category?.color || '#15803d',
            light: category?.lightColor || '#dcfce7'
        };
    };

    const colors = getCategoryColor(currentItem.type);

    const DetailField = ({ label, value, isLarge = false }: { label: string; value: string | number | undefined; isLarge?: boolean }) => (
        <View className={`mb-4 ${isLarge ? 'bg-gray-50 p-3 rounded-lg' : ''}`}>
            <Text className="text-gray-500 mb-1 text-sm">{label}</Text>
            <Text className={`${isLarge ? 'text-base' : 'text-sm'} text-gray-800 ${isLarge ? 'font-medium' : ''}`}>
                {value || 'No definido'}
            </Text>
        </View>
    );

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none" // We use our own animation
            onRequestClose={onClose}
        >
            <Animated.View
                style={[
                    StyleSheet.absoluteFill,
                    { backgroundColor: 'rgba(0,0,0,0.5)', opacity }
                ]}
            >
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    activeOpacity={1}
                    onPress={onClose}
                />

                <Animated.View
                    className="h-[80%]"
                    style={{
                        transform: [{ translateY }],
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: 'white',
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        overflow: 'hidden',
                    }}
                >
                    {/* Header with curved design */}
                    <View
                        className="py-6 px-4 rounded-t-3xl"
                        style={{ backgroundColor: colors.primary }}
                    >
                        <View className="absolute top-2 left-0 right-0 flex items-center">
                            <View className="w-12 h-1 bg-white/30 rounded-full" />
                        </View>

                        <View className="flex-row justify-between items-center">
                            <Text className="text-white text-xl font-bold">Detalles</Text>

                            <TouchableOpacity
                                className="w-8 h-8 rounded-full bg-white/20 items-center justify-center"
                                onPress={onClose}
                            >
                                <Ionicons name="close" size={20} color="white" />
                            </TouchableOpacity>
                        </View>

                        {/* Badge status */}
                        <View className="mt-2 flex-row justify-between items-center">
                            <Text className="text-white text-2xl font-bold">{currentItem.name}</Text>
                            <View className={`px-3 py-1 rounded-full ${currentItem.status === 'active' ? 'bg-green-400/20' : 'bg-red-400/20'
                                }`}>
                                <Text className="text-white font-medium text-sm">
                                    {currentItem.status === 'active' ? 'Activo' : 'Inactivo'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Main content */}
                    <ScrollView className="flex-1 px-4">
                        {/* Quick stats for exchange rate */}
                        {currentItem.type === 'exchangeRate' && currentItem.value && (
                            <View className="flex-row mt-6 mb-4">
                                <View className="flex-1 bg-green-50 p-3 rounded-lg mr-1 items-center">
                                    <Text className="text-sm text-green-500 mb-1">Valor</Text>
                                    <Text className="text-xl font-bold text-green-900">
                                        {currentItem.value}
                                    </Text>
                                </View>
                                <View className="flex-1 bg-blue-50 p-3 rounded-lg ml-1 items-center">
                                    <Text className="text-sm text-blue-500 mb-1">Fecha</Text>
                                    <Text className="text-xl font-bold text-blue-900">
                                        {currentItem.date || currentItem.createdAt}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Fields */}
                        <View className="mt-4">
                            <Text className="text-lg font-semibold text-gray-800 mb-2">Información</Text>

                            <DetailField
                                label="Descripción"
                                value={currentItem.description}
                                isLarge
                            />

                            <DetailField
                                label="Código"
                                value={currentItem.code}
                            />

                            {currentItem.type === 'exchangeRate' && !currentItem.value && (
                                <>
                                    <DetailField label="Valor" value={currentItem.value} />
                                    <DetailField label="Fecha" value={currentItem.date || currentItem.createdAt} />
                                </>
                            )}

                            {currentItem.type !== 'exchangeRate' && (
                                <DetailField label="Fecha de creación" value={currentItem.createdAt} />
                            )}

                            <DetailField
                                label="Tipo"
                                value={salesCategories.find(cat => cat.type === currentItem.type)?.title || currentItem.type}
                            />
                        </View>

                        {/* Action buttons - with bottom margin */}
                        <View className="flex-row mb-12 mt-4">
                            <TouchableOpacity
                                className="flex-1 bg-green-100 py-3 rounded-lg mr-2 flex-row justify-center items-center"
                                onPress={() => {
                                    onClose();
                                    openEditModal(currentItem);
                                }}
                            >
                                <Ionicons name="create-outline" size={18} color="#15803d" style={{ marginRight: 6 }} />
                                <Text className="text-green-800 font-medium">Editar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-1 bg-red-100 py-3 rounded-lg ml-2 flex-row justify-center items-center"
                                onPress={() => {
                                    onClose();
                                    handleDelete(currentItem.id);
                                }}
                            >
                                <Ionicons name="trash-outline" size={18} color="#dc2626" style={{ marginRight: 6 }} />
                                <Text className="text-red-800 font-medium">Eliminar</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

export default ItemModal;