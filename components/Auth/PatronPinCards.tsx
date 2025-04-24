import React from "react";
import { Text, View } from "react-native";
import Animated, { FadeIn } from 'react-native-reanimated';
import PatronInput from "./PatronInput";
import PinInput from "./PinInput";

interface PatronPinCardsProps {
  currentPage: number;
}

interface PageInfo {
  title: string;
}

export default function PatronPinCards({ currentPage }: PatronPinCardsProps) {
  const renderAuthComponent = () => {
    switch(currentPage) {
      case 0:
        return <PatronInput onPatronComplete={(patron) => console.log('Patron:', patron)} />;
      case 1:
        return <PinInput onPinComplete={(pin) => console.log('Pin:', pin)} />;
      default:
        return null;
    }
  };

  const getPageInfo = (): PageInfo => {
    const pages: PageInfo[] = [
      {
        title: "Ingresa tu Patrón",
      },
      {
        title: "Ingresa tu Pin",
      },
    ];
    return pages[currentPage];
  };

  const pageInfo = getPageInfo();

  return (
    <Animated.View 
      entering={FadeIn.duration(400)}
      className="flex-1 w-full"
    >
      <Text className="text-center text-2xl text-blue-800 mt-20 font-semibold">
        {pageInfo.title}
      </Text>
      <View className="flex-1 justify-center items-center">
        {renderAuthComponent()}
      </View>
    </Animated.View>
  );
}