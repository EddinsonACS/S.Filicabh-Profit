import ConfirmationModal from '@/components/common/ConfirmationModal';
import ErrorModal from '@/components/common/ErrorModal';
import { useConfirmationModal } from '@/hooks/common/useConfirmationModal';
import { useErrorModal } from '@/hooks/common/useErrorModal';
import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef, memo, useEffect, useImperativeHandle, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { height } = Dimensions.get('window');

export interface DynamicItemModalRef {
  showError: (title: string, message: string) => void;
  showWarning: (title: string, message: string) => void;
  showInfo: (title: string, message: string) => void;
  showDeleteError: (entityName: string, errorMessage?: string) => void;
  showCreateError: (entityName: string, errorMessage?: string) => void;
  showUpdateError: (entityName: string, errorMessage?: string) => void;
}

export interface DynamicItemModalProps {
  visible: boolean;
  onClose: () => void;
  currentItem: any;
  openEditModal: (item: any) => void;
  handleDelete: (id: number) => void;
  mainTitleField: { label: string; value: string };
  badges: Array<{
    label: string;
    value: boolean;
    activeIcon: string;
    inactiveIcon: string;
    color: string;
  }>;
  statusField: {
    value: boolean;
    activeText: string;
    inactiveText: string;
  };
  systemFields: Array<{
    label: string;
    value: string | number | undefined;
    icon?: string;
  }>;
  // Theme colors
  headerColor: string;
  headerTextColor: string;
  badgeColor: string;
  editButtonColor: string;
  editButtonTextColor: string;
  deleteButtonColor: string;
  deleteButtonTextColor: string;
  deleteButtonBorderColor: string;
}

const DynamicItemModal = forwardRef<DynamicItemModalRef, DynamicItemModalProps>(({
  visible,
  onClose,
  currentItem,
  openEditModal,
  handleDelete,
  mainTitleField,
  badges,
  statusField,
  systemFields,
  headerColor,
  headerTextColor,
  badgeColor,
  editButtonColor,
  editButtonTextColor,
  deleteButtonColor,
  deleteButtonTextColor,
  deleteButtonBorderColor
}, ref) => {
  const translateY = useRef(new Animated.Value(height)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const confirmationModal = useConfirmationModal();
  const errorModal = useErrorModal();

  // Exponer funciones a través del ref
  useImperativeHandle(ref, () => ({
    showError: (title: string, message: string) => {
      errorModal.showError(title, message, 'Entendido', headerColor);
    },
    showWarning: (title: string, message: string) => {
      errorModal.showWarning(title, message, 'Entendido', headerColor);
    },
    showInfo: (title: string, message: string) => {
      errorModal.showInfo(title, message, 'Entendido', headerColor);
    },
    showDeleteError: (entityName: string, errorMessage?: string) => {
      errorModal.showDeleteError(entityName, errorMessage, headerColor);
    },
    showCreateError: (entityName: string, errorMessage?: string) => {
      errorModal.showCreateError(entityName, errorMessage, headerColor);
    },
    showUpdateError: (entityName: string, errorMessage?: string) => {
      errorModal.showUpdateError(entityName, errorMessage, headerColor);
    }
  }), [errorModal, headerColor]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (_, gestureState) => gestureState.y0 < 100,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 10 && gestureState.y0 < 100,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            friction: 8,
            useNativeDriver: true
          }).start();
        }
      }
    })
  ).current;

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

  const confirmDelete = () => {
    confirmationModal.showDeleteConfirmation(
      'elemento',
      mainTitleField.value,
      () => {
        // No cerrar el modal aquí, se cerrará después de que la eliminación sea exitosa
        handleDelete(currentItem.id);
      },
      () => {
        // Si cancela, no hacer nada - mantener el modal abierto
      },
      headerColor
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
      style={{ zIndex: 1000 }}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: 'rgba(0,0,0,0.5)', opacity, zIndex: 1000 }
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
            height: '80%',
            zIndex: 1000
          }}
        >
          {/* Header */}
          <View
            style={{ backgroundColor: headerColor }}
            className="rounded-xl mb-4 p-4"
            {...panResponder.panHandlers}
          >
            <View className="absolute top-3 left-0 right-0 flex items-center z-10">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>
            <View className="items-center mt-4">
              <Text style={{ color: headerTextColor }} className="text-2xl font-bold text-center" numberOfLines={2}>{mainTitleField.value}</Text>
            </View>
          </View>

          {/* Main Content - Área con scroll */}
          <ScrollView
            ref={scrollViewRef}
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={true}
            overScrollMode="always"
            bounces={true}
            alwaysBounceVertical={true}
            scrollEventThrottle={16}
            nestedScrollEnabled={true}
          >
            {/* Card */}
            <View className="px-4 mb-4">
              {/* Información del sistema */}
              <View className="bg-white rounded-lg p-6 shadow-sm border border-gray-300">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="information-circle-outline" size={20} color="#7e22ce" />
                  <Text className="text-lg font-semibold text-gray-800 ml-1">Detalles del Registro</Text>
                </View>
                {systemFields.map((field, idx) => (
                  <View key={idx} className={`flex-row justify-between py-2 ${idx < systemFields.length - 1 ? 'border-b border-gray-300' : ''}`}>
                    <Text className="text-gray-500">{field.label}</Text>
                    <Text className="text-gray-800 font-medium">{field.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Action buttons */}
          <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-6 px-8">
            <View className="flex-row space-x-4 pb-4">
              <TouchableOpacity
                style={{ 
                  backgroundColor: deleteButtonColor,
                  borderColor: deleteButtonBorderColor,
                  borderWidth: 2
                }}
                className="flex-1 py-3 rounded-lg flex-row justify-center items-center"
                onPress={confirmDelete}
              >
                <Ionicons name="trash-outline" size={18} color={deleteButtonTextColor} />
                <Text style={{ color: deleteButtonTextColor }} className="font-medium ml-2">Eliminar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ backgroundColor: editButtonColor }}
                className="flex-1 py-3 rounded-lg flex-row justify-center items-center"
                onPress={() => {
                  onClose();
                  openEditModal(currentItem);
                }}
              >
                <Ionicons name="create-outline" size={18} color={editButtonTextColor} />
                <Text style={{ color: editButtonTextColor }} className="font-medium ml-2">Editar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
      
      <ConfirmationModal
        visible={confirmationModal.isVisible}
        type={confirmationModal.config?.type || 'warning'}
        title={confirmationModal.config?.title || ''}
        message={confirmationModal.config?.message || ''}
        onConfirm={confirmationModal.handleConfirm}
        onCancel={confirmationModal.handleCancel}
        confirmText={confirmationModal.config?.confirmText}
        cancelText={confirmationModal.config?.cancelText}
        sectionColor={confirmationModal.config?.sectionColor}
      />
      
      <ErrorModal
        visible={errorModal.isVisible}
        type={errorModal.config?.type || 'error'}
        title={errorModal.config?.title || ''}
        message={errorModal.config?.message || ''}
        onClose={errorModal.hideError}
        buttonText={errorModal.config?.buttonText}
        sectionColor={errorModal.config?.sectionColor || headerColor}
      />
    </Modal>
  );
});

export default memo(DynamicItemModal); 