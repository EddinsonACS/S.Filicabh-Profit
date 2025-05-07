import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  FadeIn,
  SlideInUp,
  withSequence
} from 'react-native-reanimated';
import { enterpriseStore } from '@/data/global/entrepiseStore';

interface LoadingScreenProps {
  message?: string;
  color?: string | {
    primary: string;
    secondary: string;
    tertiary: string;
  };
}

// Color mapping for sections
const colorMappings: Record<string, any> = {
  blue: {
    primary: 'bg-blue-900',
    secondary: 'bg-blue-700',
    tertiary: 'bg-blue-600',
    accent: 'bg-blue-500',
    text: 'text-blue-200',
    iconBg: 'bg-blue-800',
    progressBg: 'bg-blue-700'
  },
  green: {
    primary: 'bg-green-900',
    secondary: 'bg-green-700',
    tertiary: 'bg-green-600',
    accent: 'bg-green-500',
    text: 'text-green-200',
    iconBg: 'bg-green-800',
    progressBg: 'bg-green-700'
  },
  purple: {
    primary: 'bg-purple-900',
    secondary: 'bg-purple-700',
    tertiary: 'bg-purple-600',
    accent: 'bg-purple-500',
    text: 'text-purple-200',
    iconBg: 'bg-purple-800',
    progressBg: 'bg-purple-700'
  }
};

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "",
  color = "blue"
}) => {
  // Animation values
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const progressWidth = useSharedValue(10);
  const opacity = useSharedValue(0);
  const { selectedEnterprise } = enterpriseStore();

  // Get the color theme based on the color prop
  const colorTheme = typeof color === 'string'
    ? colorMappings[color] || colorMappings.blue
    : color;

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 2000 }),
      -1,
      false
    );

    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      false
    );

    // Progress animation with realistic increment patterns
    progressWidth.value = withSequence(
      withTiming(30, { duration: 800 }),
      withTiming(50, { duration: 1200 }),
      withTiming(70, { duration: 1500 }),
      withTiming(85, { duration: 2000 }),
      withTiming(95, { duration: 3000 })
    );

    // Text opacity animation
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(1, { duration: 2000 }),
        withTiming(0, { duration: 400 })
      ),
      -1
    );
  }, []);

  // Define animated styles
  const rotatingStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotateZ: `${rotation.value}deg` }],
    };
  });

  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progressWidth.value}%`,
    };
  });

  const fadeStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  // Array of loading messages that will cycle
  const loadingSteps = [
    "Cargando"
  ];

  return (
    <View className={`flex-1 w-full ${colorTheme.primary} items-center justify-center`}>
      {/* Background decorative elements */}
      <View className={`absolute top-0 right-0 w-40 h-40 rounded-full ${colorTheme.secondary} opacity-20`} />
      <View className={`absolute bottom-0 left-0 w-56 h-56 rounded-full ${colorTheme.tertiary} opacity-10`} />
      <View className={`absolute top-1/4 left-10 w-20 h-20 rounded-full ${colorTheme.accent} opacity-20`} />

      {/* Main content container */}
      <Animated.View
        entering={FadeIn.duration(800)}
        className="w-full items-center justify-center"
        testID="loading-container"
      >
        {/* Animated icon */}
        <Animated.View
          style={[rotatingStyle, pulseStyle]}
          className="mb-8"
        >
          <View className={`${colorTheme.iconBg} p-5 rounded-2xl shadow-lg`}>
            <Ionicons name="cube-outline" size={50} color="#ffffff" />
          </View>
        </Animated.View>

        {/* Main loading text */}
        <Animated.Text
          entering={SlideInUp.duration(500)}
          className="text-white text-2xl font-bold text-center mb-2"
        >
          {message}
        </Animated.Text>

        {/* Loading steps - cycling messages */}
        <View className="h-6 justify-center mb-8">
          {loadingSteps.map((step, index) => (
            <Animated.Text
              key={step}
              style={[fadeStyle, {
                position: 'absolute',
                alignSelf: 'center',
                opacity: index === 0 ? 1 : 0
              }]}
              entering={FadeIn.delay(index * 3000).duration(500)}
              className={`${colorTheme.text} text-center`}
            >
              {step}...
            </Animated.Text>
          ))}
        </View>

        {/* Progress bar */}
        <View className={`w-4/5 h-1 ${colorTheme.progressBg} rounded-full overflow-hidden mb-6`}>
          <Animated.View
            style={progressStyle}
            className="h-full bg-white rounded-full"
          />
        </View>

        {/* Company info */}
        <Animated.View
          entering={FadeIn.delay(100).duration(600)}
          className="items-center mt-12"
        >
          <Text className={`${colorTheme.text} text-xs`}>
            {selectedEnterprise?.nombre}
          </Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

export default LoadingScreen;