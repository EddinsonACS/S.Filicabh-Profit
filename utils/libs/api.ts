import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const api = axios.create({
  baseURL: ""
})

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
