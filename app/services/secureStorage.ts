// TODO: remplacer par expo-secure-store après `npx expo install expo-secure-store`
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY    = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const secureStorage = {
  setToken: (token: string) =>
    AsyncStorage.setItem(AUTH_TOKEN_KEY, token),

  getToken: () =>
    AsyncStorage.getItem(AUTH_TOKEN_KEY),

  deleteToken: () =>
    AsyncStorage.removeItem(AUTH_TOKEN_KEY),

  setRefreshToken: (token: string) =>
    AsyncStorage.setItem(REFRESH_TOKEN_KEY, token),

  getRefreshToken: () =>
    AsyncStorage.getItem(REFRESH_TOKEN_KEY),

  deleteRefreshToken: () =>
    AsyncStorage.removeItem(REFRESH_TOKEN_KEY),

  clearTokens: async () => {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
