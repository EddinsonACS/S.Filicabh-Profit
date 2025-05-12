// ItemList.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Animated,
  PanResponder,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Inventario } from '@/core/models/Inventario';
import EmptyState from './EmptyState';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ItemsListProps {
  items: Inventario[];
  handleDelete: (id: number) => void;
  showItemDetails: (item: Inventario) => void;
  openEditModal: (item: Inventario) => void;
  onLoadMore: () => void;
  hasMore: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80;

const ItemsList: React.FC<ItemsListProps> = ({
  items,
  handleDelete,
  showItemDetails,
  openEditModal,
  onLoadMore,
  hasMore
}) => {
  const [activeRow, setActiveRow] = useState<number | null>(null);
  const [swipeHintShown, setSwipeHintShown] = useState<boolean>(false);

  // SwipeableItem component with enhanced swipe gestures
  const SwipeableItem = ({ item, index }: { item: Inventario, index: number }) => {
    const rowTranslateX = useRef(new Animated.Value(0)).current;
    const rowScale = useRef(new Animated.Value(1)).current;
    const leftButtonWidth = useRef(new Animated.Value(0)).current;
    const rightButtonWidth = useRef(new Animated.Value(0)).current;

    // Track current open side
    const openSide = useRef<'left' | 'right' | null>(null);

    // Show swipe hint only once for the first item
    useEffect(() => {
      if (index === 0 && !swipeHintShown) {
        setTimeout(() => {
          setSwipeHintShown(true);
        }, 3000); // Hide after 3 seconds
      }
    }, [index]);

    // Reset all animations
    const resetRow = () => {
      openSide.current = null;
      Animated.parallel([
        Animated.spring(rowTranslateX, {
          toValue: 0,
          friction: 5,
          useNativeDriver: true
        }),
        Animated.spring(rowScale, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true
        }),
        Animated.spring(leftButtonWidth, {
          toValue: 0,
          friction: 5,
          useNativeDriver: false
        }),
        Animated.spring(rightButtonWidth, {
          toValue: 0,
          friction: 5,
          useNativeDriver: false
        })
      ]).start();
      setActiveRow(null);
    };

    // Open row to left (showing delete button)
    const openLeft = () => {
      // If right side was open, close it first
      if (openSide.current === 'right') {
        Animated.spring(rightButtonWidth, {
          toValue: 0,
          friction: 5,
          useNativeDriver: false
        }).start();
      }

      openSide.current = 'left';
      Animated.parallel([
        Animated.spring(rowTranslateX, {
          toValue: 80,
          friction: 5,
          useNativeDriver: true
        }),
        Animated.spring(rowScale, {
          toValue: 0.95,
          friction: 5,
          useNativeDriver: true
        }),
        Animated.spring(leftButtonWidth, {
          toValue: 80,
          friction: 5,
          useNativeDriver: false
        })
      ]).start();
      setActiveRow(item.id);
    };

    // Open row to right (showing edit button)
    const openRight = () => {
      // If left side was open, close it first
      if (openSide.current === 'left') {
        Animated.spring(leftButtonWidth, {
          toValue: 0,
          friction: 5,
          useNativeDriver: false
        }).start();
      }

      openSide.current = 'right';
      Animated.parallel([
        Animated.spring(rowTranslateX, {
          toValue: -80,
          friction: 5,
          useNativeDriver: true
        }),
        Animated.spring(rowScale, {
          toValue: 0.95,
          friction: 5,
          useNativeDriver: true
        }),
        Animated.spring(rightButtonWidth, {
          toValue: 80,
          friction: 5,
          useNativeDriver: false
        })
      ]).start();
      setActiveRow(item.id);
    };

    // Handle delete confirmation
    const confirmDelete = () => {
      Alert.alert(
        "Confirmar eliminación",
        "¿Está seguro que desea eliminar este elemento?",
        [
          {
            text: "Cancelar",
            style: "cancel",
            onPress: resetRow
          },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: () => {
              resetRow();
              handleDelete(item.id);
            }
          }
        ]
      );
    };

    // Reset all other rows when this row is activated
    const closeOtherRows = () => {
      if (activeRow && activeRow !== item.id) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setActiveRow(null);
      }
    };

    // Create PanResponder for handling swipe gestures
    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dx) > 10;
        },
        onPanResponderGrant: () => {
          closeOtherRows();
        },
        onPanResponderMove: (_, gestureState) => {
          // Handle real-time movement
          rowTranslateX.setValue(gestureState.dx);

          // Scale effect based on distance
          const scaleValue = Math.max(0.95, 1 - Math.abs(gestureState.dx) / 500);
          rowScale.setValue(scaleValue);

          // Real-time button width adjustment
          if (gestureState.dx > 0) {
            // Moving right - show delete button
            leftButtonWidth.setValue(Math.min(80, gestureState.dx));
            rightButtonWidth.setValue(0);
          } else if (gestureState.dx < 0) {
            // Moving left - show edit button
            rightButtonWidth.setValue(Math.min(80, Math.abs(gestureState.dx)));
            leftButtonWidth.setValue(0);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx > SWIPE_THRESHOLD) {
            // Swiped right - show delete button on left
            openLeft();
          } else if (gestureState.dx < -SWIPE_THRESHOLD) {
            // Swiped left - show edit button on right
            openRight();
          } else {
            // Not enough swipe, reset position
            resetRow();
          }
        },
        onPanResponderTerminate: () => resetRow()
      })
    ).current;

    // When item is pressed, reset row and show details
    const handlePress = () => {
      resetRow();
      showItemDetails(item);
    };

    // Render item content with improved design
    const renderItemContent = () => (
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-lg font-semibold text-gray-800">{item.nombre}</Text>
          <View className={`px-2 py-1 rounded-full ${
            item.suspendido 
              ? 'bg-red-100 border border-red-200' 
              : 'bg-green-100 border border-green-200'
          }`}>
            <Text className={`text-xs font-medium ${
              item.suspendido 
                ? 'text-red-800' 
                : 'text-green-800'
            }`}>
              {item.suspendido ? 'Inactivo' : 'Activo'}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between mt-1">
          <View className="flex-row items-center">
            <Ionicons 
              name={item.aplicaVentas ? "checkmark-circle" : "close-circle"} 
              size={14} 
              color={item.aplicaVentas ? "#10b981" : "#9ca3af"}
              style={{ marginRight: 4 }}
            />
            <Text className="text-sm text-gray-500">
              Ventas
            </Text>
          </View>
          
          <View className="flex-row items-center">
            <Ionicons 
              name={item.aplicaCompras ? "checkmark-circle" : "close-circle"} 
              size={14} 
              color={item.aplicaCompras ? "#10b981" : "#9ca3af"}
              style={{ marginRight: 4 }}
            />
            <Text className="text-sm text-gray-500">
              Compras
            </Text>
          </View>
        </View>

        <Text className="text-xs text-gray-400 mt-2">
          ID: {item.id} · Creado: {new Date(item.fechaRegistro).toLocaleDateString()}
        </Text>
        <Text className="text-xs text-gray-400 mt-2">
          Creado por: {item.usuarioRegistroNombre}
        </Text>
        <Text className="text-xs text-gray-400 mt-2">
          Ultima modificación: {new Date(item.fechaModificacion).toLocaleDateString()}
        </Text>
      </View>
    );

    // Helper styles for row animations
    const rowStyles = {
      transform: [
        { translateX: rowTranslateX },
        { scale: rowScale }
      ]
    };

    return (
      <Animated.View style={[rowStyles]} className="flex-row bg-white rounded-xl my-1.5 shadow-sm border border-gray-100 overflow-hidden">
        {/* Left button (Delete) */}
        <Animated.View style={{ width: leftButtonWidth }} className="absolute left-0 h-full bg-red-500 justify-center items-center overflow-hidden">
          <TouchableOpacity
            className="w-full h-full justify-center items-center"
            onPress={confirmDelete}
          >
            <Ionicons name="trash-outline" size={24} color="white" />
          </TouchableOpacity>
        </Animated.View>

        {/* Right button (Edit) */}
        <Animated.View style={{ width: rightButtonWidth }} className="absolute right-0 h-full bg-purple-900 justify-center items-center overflow-hidden">
          <TouchableOpacity
            className="w-full h-full justify-center items-center"
            onPress={() => {
              resetRow();
              openEditModal(item);
            }}
          >
            <Ionicons name="pencil-outline" size={24} color="white" />
          </TouchableOpacity>
        </Animated.View>

        {/* Main content */}
        <Animated.View
          {...panResponder.panHandlers}
          className="flex-1 bg-white"
        >
          <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.7}
          >
            {renderItemContent()}
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    );
  };

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#581c87" />
      </View>
    );
  };

  return (
    <FlatList
      data={items}
      ListEmptyComponent={<EmptyState />}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item, index }) => (
        <SwipeableItem item={item} index={index} />
      )}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
    />
  );
};

export default ItemsList;