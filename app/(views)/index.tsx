import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";

export default function HomeScreen() {
  const [redirectPath, setRedirectPath] = useState<"/Entrepise" | "/Splash">("/Splash");

  useEffect(() => {
    const checkTokenAndSetRedirect = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        console.log(token)
        console.log("token")
        if (token) {
          setRedirectPath("/Entrepise");
        } else {
          setRedirectPath("/Splash");
        }
      } catch (error) {
        setRedirectPath("/Splash");
      }
    };

    checkTokenAndSetRedirect();
  }, [])

  console.log(redirectPath)

  return <Redirect href={redirectPath} />;
}
