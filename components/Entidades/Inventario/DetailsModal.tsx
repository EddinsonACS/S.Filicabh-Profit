import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    ScrollView,
    Image
} from 'react-native';
import { Inventario } from '@/core/models/Inventario';

interface DetailsModalProps {
    visible: boolean;
    item: Inventario | null;
    onClose: () => void;
    onEdit: (item: Inventario) => void;
    onDelete: (id: number) => void;
}

const DetailsModal: React.FC<DetailsModalProps> = ({
    visible,
    item,
    onClose,
    onEdit,
    onDelete
}) => {
    if (!item) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-white rounded-t-3xl p-4">
                    <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />

                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl font-bold text-gray-800">Detalles</Text>
                        <TouchableOpacity
                            className="p-2"
                            onPress={onClose}
                        >
                            <Ionicons name="close" size={24} color="#6b7280" />
                        </TouchableOpacity>
                    </View>

                    <View className="bg-purple-50 rounded-lg p-4 mb-4">
                        <Text className="text-2xl font-bold text-purple-900 mb-2">{item.nombre}</Text>
                        <View className={`self-start px-3 py-1 rounded-full ${!item.suspendido ? 'bg-green-100' : 'bg-red-100'} mb-4`}>
                            <Text className={`text-sm font-medium ${!item.suspendido ? 'text-green-800' : 'text-red-800'}`}>
                                {!item.suspendido ? 'Activo' : 'Inactivo'}
                            </Text>
                        </View>
                    </View>

                    <ScrollView className="max-h-80">
                        <View className="mb-4">
                            <Text className="text-gray-500 mb-1">Descripción</Text>
                            <Text className="text-gray-800">{item.otrosC1 || 'Sin descripción'}</Text>
                        </View>

                        <View className="mb-4">
                            <Text className="text-gray-500 mb-1">Código</Text>
                            <Text className="text-gray-800">{item.otrosC2 || 'Sin código'}</Text>
                        </View>

                        <View className="mb-4">
                            <Text className="text-gray-500 mb-1">Grupo</Text>
                            <Text className="text-gray-800">{item.otrosC4 || 'No asignado'}</Text>
                        </View>

                        <View className="mb-4">
                            <Text className="text-gray-500 mb-1">Fecha de registro</Text>
                            <Text className="text-gray-800">{new Date(item.fechaRegistro).toLocaleDateString()}</Text>
                        </View>

                        <View className="mb-4">
                            <Text className="text-gray-500 mb-1">Registrado por</Text>
                            <Text className="text-gray-800">{item.usuarioRegistroNombre}</Text>
                        </View>

                        {item.fechaModificacion && (
                            <View className="mb-4">
                                <Text className="text-gray-500 mb-1">Última modificación</Text>
                                <Text className="text-gray-800">{new Date(item.fechaModificacion).toLocaleDateString()}</Text>
                            </View>
                        )}

                        {item.usuarioModificacionNombre && (
                            <View className="mb-4">
                                <Text className="text-gray-500 mb-1">Modificado por</Text>
                                <Text className="text-gray-800">{item.usuarioModificacionNombre}</Text>
                            </View>
                        )}
                    </ScrollView>

                    <View className="flex-row mt-6">
                        <TouchableOpacity
                            className="flex-1 bg-purple-100 py-3 rounded-lg mr-2 flex-row justify-center items-center"
                            onPress={() => {
                                onClose();
                                onEdit(item);
                            }}
                        >
                            <Ionicons name="create-outline" size={18} color="#7e22ce" style={{ marginRight: 6 }} />
                            <Text className="text-purple-700 font-medium">Editar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-1 bg-red-100 py-3 rounded-lg ml-2 flex-row justify-center items-center"
                            onPress={() => {
                                onDelete(item.id);
                            }}
                        >
                            <Ionicons name="trash-outline" size={18} color="#dc2626" style={{ marginRight: 6 }} />
                            <Text className="text-red-700 font-medium">Eliminar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default DetailsModal;