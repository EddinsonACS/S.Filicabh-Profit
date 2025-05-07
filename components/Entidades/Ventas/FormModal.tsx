// components/Ventas/FormModal.tsx
import React, { useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Animated,
    Dimensions
} from 'react-native';
import { FormDataType } from '@/components/Entidades/Ventas/VentasTypes';
import { Ionicons } from '@expo/vector-icons';
import { salesCategories } from '@/components/Entidades/Ventas/EntVentasData';

interface FormModalProps {
    visible: boolean;
    onClose: () => void;
    formData: FormDataType;
    setFormData: (data: FormDataType) => void;
    isEditing: boolean;
    selectedCategory: string;
    handleCreate: () => void;
    handleUpdate: () => void;
}

const { height } = Dimensions.get('window');

const FormModal: React.FC<FormModalProps> = ({
    visible,
    onClose,
    formData,
    setFormData,
    isEditing,
    selectedCategory,
    handleCreate,
    handleUpdate
}) => {
    // Animation values
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

    // Get category colors for styling
    const getCategoryColor = (type: string) => {
        const category = salesCategories.find(cat => cat.type === type);
        return {
            primary: category?.color || '#15803d',
            light: category?.lightColor || '#dcfce7'
        };
    };

    const colors = getCategoryColor(selectedCategory);

    // Basic form fields that all items have
    const renderBasicFields = () => (
        <>
            <View className="mb-4">
                <Text className="text-gray-700 mb-2 font-medium">Nombre</Text>
                <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                    placeholder="Ingrese nombre"
                />
            </View>

            <View className="mb-4">
                <Text className="text-gray-700 mb-2 font-medium">Descripción</Text>
                <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                    value={formData.description}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                    placeholder="Ingrese descripción"
                    multiline
                    numberOfLines={3}
                    style={{ height: 100, textAlignVertical: 'top' }}
                />
            </View>

            <View className="mb-4">
                <Text className="text-gray-700 mb-2 font-medium">Código</Text>
                <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                    value={formData.code}
                    onChangeText={(text) => setFormData({ ...formData, code: text })}
                    placeholder="Ingrese código"
                />
            </View>
        </>
    );

    // Additional fields for specific types
    const renderExchangeRateFields = () => (
        <>
            <View className="mb-4">
                <Text className="text-gray-700 mb-2 font-medium">Valor</Text>
                <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                    value={formData.value}
                    onChangeText={(text) => setFormData({ ...formData, value: text })}
                    placeholder="Ingrese valor"
                    keyboardType="numeric"
                />
            </View>

            <View className="mb-4">
                <Text className="text-gray-700 mb-2 font-medium">Fecha</Text>
                <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                    value={formData.date}
                    onChangeText={(text) => setFormData({ ...formData, date: text })}
                    placeholder="AAAA-MM-DD"
                />
            </View>
        </>
    );

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none" // Using our own animation
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
                        height: '80%'
                    }}
                >
                    {/* Header with matching style */}
                    <View
                        style={{
                            backgroundColor: colors.primary,
                            paddingVertical: 24,
                            paddingHorizontal: 16,
                            borderTopLeftRadius: 24,
                            borderTopRightRadius: 24
                        }}
                    >
                        <View style={{ position: 'absolute', top: 8, left: 0, right: 0, alignItems: 'center' }}>
                            <View style={{ width: 48, height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4 }} />
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
                                {isEditing ? 'Editar' : 'Nuevo'}
                            </Text>

                            <TouchableOpacity
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 16,
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                onPress={onClose}
                            >
                                <Ionicons name="close" size={20} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={{ flex: 1 }}
                    >
                        <ScrollView style={{ padding: 16 }}>
                            {renderBasicFields()}

                            {selectedCategory === 'exchangeRate' && renderExchangeRateFields()}

                            <View className="mb-4">
                                <Text className="text-gray-700 mb-2 font-medium">Estado</Text>
                                <View className="flex-row">
                                    <TouchableOpacity
                                        className={`flex-1 py-3 rounded-l-lg border ${formData.status === 'active'
                                                ? 'bg-green-100 border-green-300'
                                                : 'bg-gray-50 border-gray-200'
                                            }`}
                                        onPress={() => setFormData({ ...formData, status: 'active' })}
                                    >
                                        <Text className={`text-center ${formData.status === 'active'
                                                ? 'text-green-900 font-medium'
                                                : 'text-gray-700'
                                            }`}>
                                            Activo
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        className={`flex-1 py-3 rounded-r-lg border ${formData.status === 'inactive'
                                                ? 'bg-red-100 border-red-300'
                                                : 'bg-gray-50 border-gray-200'
                                            }`}
                                        onPress={() => setFormData({ ...formData, status: 'inactive' })}
                                    >
                                        <Text className={`text-center ${formData.status === 'inactive'
                                                ? 'text-red-900 font-medium'
                                                : 'text-gray-700'
                                            }`}>
                                            Inactivo
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Extra bottom padding for scroll */}
                            <View style={{ height: 20 }} />
                        </ScrollView>

                        <View className="p-4 border-t border-gray-100">
                            <TouchableOpacity
                                className="bg-green-600 py-3 rounded-lg"
                                onPress={isEditing ? handleUpdate : handleCreate}
                            >
                                <Text className="text-center text-white font-medium">
                                    {isEditing ? 'Actualizar' : 'Guardar'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

export default FormModal;