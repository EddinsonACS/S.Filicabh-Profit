import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Image, ImageSourcePropType, View } from "react-native";

export default function SplashScreen(): JSX.Element {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(async () => {
      const notNew = await AsyncStorage.getItem("not_new");
      if (!notNew) {
        router.replace("/Onboarding")
      } else {
        router.replace("/Login");
      }

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
