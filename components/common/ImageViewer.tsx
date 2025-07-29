import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
    Dimensions,
    Image,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ImageViewerProps {
  visible: boolean;
  images: Array<{ id: number; urlFoto: string; esPrincipal?: boolean }>;
  initialIndex: number;
  onClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  visible,
  images,
  initialIndex,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      if (isZoomed) {
        // Reset zoom
        scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
        setIsZoomed(false);
      } else {
        // Zoom in
        setIsZoomed(true);
      }
    }
    setLastTap(now);
  };

  const handleSwipeLeft = () => {
    if (!isZoomed && currentIndex < images.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsZoomed(false);
    }
  };

  const handleSwipeRight = () => {
    if (!isZoomed && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsZoomed(false);
    }
  };

  const handleClose = () => {
    setIsZoomed(false);
    onClose();
  };

  const currentImage = images[currentIndex];

  return (
    <Modal
      visible={visible}
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={handleClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {/* Close Button */}
        <TouchableOpacity
          onPress={handleClose}
          style={{
            position: 'absolute',
            top: 50,
            right: 20,
            zIndex: 1000,
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 20,
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>

        {/* Image Counter */}
        {images.length > 1 && (
          <View style={{
            position: 'absolute',
            top: 50,
            left: 20,
            zIndex: 1000,
            backgroundColor: 'rgba(0,0,0,0.6)',
            borderRadius: 15,
            paddingHorizontal: 12,
            paddingVertical: 6
          }}>
            <Text style={{ color: 'white', fontSize: 14, fontWeight: '500' }}>
              {currentIndex + 1} de {images.length}
            </Text>
          </View>
        )}

        {/* Main Image with ScrollView for zoom */}
        {currentImage && (
          <View style={{
            flex: 1,
            width: screenWidth,
            height: screenHeight,
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <ScrollView
              ref={scrollViewRef}
              style={{
                width: screenWidth,
                height: screenHeight,
                flex: 1
              }}
              contentContainerStyle={{
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: screenHeight,
                minWidth: screenWidth
              }}
              maximumZoomScale={5}
              minimumZoomScale={1}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              onMomentumScrollEnd={() => {
                // Check if zoomed by looking at scroll position
                scrollViewRef.current?.getScrollResponder()?.getScrollableNode()?.measure((x, y, width, height, pageX, pageY) => {
                  // This is a simplified way to detect zoom
                  // In a real implementation, you might want to track the zoom scale more precisely
                });
              }}
            >
              <TouchableOpacity
                activeOpacity={1}
                onPress={handleDoubleTap}
                style={{
                  width: screenWidth,
                  height: screenHeight * 0.8,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Image
                  source={{
                    uri: `https://wise.filicabh.com.ve:5000/${currentImage.urlFoto}`,
                  }}
                  style={{
                    width: screenWidth,
                    height: screenHeight * 0.8,
                  }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* Navigation Buttons */}
        {images.length > 1 && !isZoomed && (
          <>
            {/* Previous Button */}
            {currentIndex > 0 && (
              <TouchableOpacity
                onPress={handleSwipeRight}
                style={{
                  position: 'absolute',
                  left: 20,
                  top: '50%',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: 25,
                  width: 50,
                  height: 50,
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 10
                }}
              >
                <Ionicons name="chevron-back" size={30} color="white" />
              </TouchableOpacity>
            )}

            {/* Next Button */}
            {currentIndex < images.length - 1 && (
              <TouchableOpacity
                onPress={handleSwipeLeft}
                style={{
                  position: 'absolute',
                  right: 20,
                  top: '50%',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: 25,
                  width: 50,
                  height: 50,
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 10
                }}
              >
                <Ionicons name="chevron-forward" size={30} color="white" />
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Photo info overlay */}
        {currentImage?.esPrincipal && !isZoomed && (
          <View style={{
            position: 'absolute',
            bottom: 100,
            alignSelf: 'center',
            backgroundColor: 'rgba(255,215,0,0.9)',
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 8,
            flexDirection: 'row',
            alignItems: 'center',
            zIndex: 10
          }}>
            <Ionicons name="star" size={16} color="white" style={{ marginRight: 6 }} />
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>
              Imagen Principal
            </Text>
          </View>
        )}

        {/* Zoom indicator */}
        {isZoomed && (
          <View style={{
            position: 'absolute',
            bottom: 50,
            alignSelf: 'center',
            backgroundColor: 'rgba(0,0,0,0.7)',
            borderRadius: 15,
            paddingHorizontal: 12,
            paddingVertical: 6,
            zIndex: 10
          }}>
            <Text style={{ color: 'white', fontSize: 12, fontWeight: '500' }}>
              Zoom activo
            </Text>
          </View>
        )}

        {/* Swipe Gesture Areas - Only when not zoomed */}
        {!isZoomed && (
          <>
            {/* Left swipe area */}
            <TouchableOpacity
              onPress={handleSwipeRight}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: screenWidth * 0.3,
                height: screenHeight,
                zIndex: 5
              }}
              activeOpacity={0}
            />
            
            {/* Right swipe area */}
            <TouchableOpacity
              onPress={handleSwipeLeft}
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                width: screenWidth * 0.3,
                height: screenHeight,
                zIndex: 5
              }}
              activeOpacity={0}
            />
          </>
        )}
      </View>
    </Modal>
  );
};

export default ImageViewer; 