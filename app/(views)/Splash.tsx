import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Image, ImageSourcePropType, View } from "react-native";
import { useAlmacen } from "@/hooks/Inventario/useAlmacen";
import axios from 'axios';

export default function SplashScreen(): JSX.Element {
  const router = useRouter();
  const { useGetAlmacenList } = useAlmacen();
  const { isError, isSuccess, isLoading, error } = useGetAlmacenList(1,1);
  const hasCheckedSession = useRef(false);

  useEffect(() => {
    const checkSession = async () => {
      if (hasCheckedSession.current) return;
      
      const notNew = await AsyncStorage.getItem("not_new");
      const token = await AsyncStorage.getItem("authToken");

      if (!notNew) {
        router.replace("/Onboarding");
        return;
      }

      if (!token) {
        router.replace("/Login");
        return;
      }

      if (isSuccess) {
        router.replace("/(views)/Entrepise");
      } else if (isError && axios.isAxiosError(error) && error.response?.status === 401) {
        router.replace("/Login");
      }
      
      hasCheckedSession.current = true;
    };

    if (!isLoading) {
      checkSession();
    }
  }, [error, isLoading]);

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
