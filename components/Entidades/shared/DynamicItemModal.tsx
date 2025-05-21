import React, { memo, useEffect, useRef } from 'react';
import {
  Alert,
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
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

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
}

const DynamicItemModal: React.FC<DynamicItemModalProps> = ({
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
  deleteButtonTextColor
}) => {
  const translateY = useRef(new Animated.Value(height)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

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
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de eliminar "${mainTitleField.value}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => handleDelete(currentItem.id) }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
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
          {/* Header */}
          <View
            style={{ backgroundColor: headerColor }}
            className="rounded-xl mb-4 p-6"
            {...panResponder.panHandlers}
          >
            <View className="absolute top-3 left-0 right-0 flex items-center z-10">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>
            <View>
              <Text style={{ color: headerTextColor }} className="text-2xl font-bold" numberOfLines={1}>{mainTitleField.value}</Text>
            </View>
            <View className="flex-row justify-between items-center mt-2">
              <View className="flex-row space-x-2">
                {badges.map((badge, idx) => (
                  <View key={idx} style={{ backgroundColor: badgeColor }} className="p-2 rounded-full flex-row items-center">
                    <View style={{ position: 'relative', width: 14, height: 14, justifyContent: 'center', alignItems: 'center' }}>
                      {badge.value ? (
                        <>
                          <Ionicons name={badge.activeIcon as any} size={14} color={badge.color} />
                          <Ionicons name="checkmark" size={10} color="black" style={{ position: 'absolute' }} />
                        </>
                      ) : (
                        <Ionicons name={badge.inactiveIcon as any} size={14} color="#7C7D7DFF" />
                      )}
                    </View>
                    <Text style={{ color: headerTextColor }} className="text-xs ml-1">{badge.label}</Text>
                  </View>
                ))}
              </View>
              <View className={`p-2 rounded-full ${statusField.value
                ? 'bg-green-100 border border-green-600'
                : 'bg-red-100 border border-red-600'
                }`}>
                <Text className={`font-bold ${statusField.value ? 'text-green-600' : 'text-red-600'}`}>{statusField.value ? statusField.activeText : statusField.inactiveText}</Text>
              </View>
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
            <View className="flex-row space-x-4 mt-1">
              <TouchableOpacity
                style={{ backgroundColor: deleteButtonColor }}
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
    </Modal>
  );
};

export default memo(DynamicItemModal); 