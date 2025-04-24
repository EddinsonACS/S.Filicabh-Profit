import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Image, View } from "react-native";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.replace("/Onboarding");
    }, 2000);
  }, []);

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
          source={require("../../assets/splash-icon.png")}
          style={{ width: 180, height: 180 }}
        />
      </View>
  );
}