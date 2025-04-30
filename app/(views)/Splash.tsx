import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Image, ImageSourcePropType, View } from "react-native";

export default function SplashScreen(): JSX.Element {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/Home");
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const splashIcon: ImageSourcePropType = require("../../assets/splash-icon.png");

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F9F8FD",
      }}
    >
      <Image
        source={splashIcon}
        style={{ width: 180, height: 180 }}
      />
    </View>
  );
}