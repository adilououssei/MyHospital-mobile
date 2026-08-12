import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { AppProvider, useApp, useAuth } from './app/context/AppContext';
import { NotificationProvider } from './app/context/NotificationContext';
import apiClient from './app/services/api.config';
import { secureStorage } from './app/services/secureStorage';
import CustomSplashScreen from './app/components/SplashScreen';
import BiometricLockScreen from './app/components/BiometricLockScreen';
import RootNavigator from './app/navigation/RootNavigator';
import { BIOMETRIC_LOCK_KEY } from './app/constants/security';

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { login: authLogin, logout: authLogout, isAuthenticated } = useAuth();
  const { colors, isDarkMode } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [appIsReady, setAppIsReady] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Le thème de React Navigation suit sa PROPRE détection du mode sombre système
  // (useColorScheme interne) si on ne le fixe pas explicitement — totalement
  // déconnecté du thème clair/sombre propre à l'app. Résultat : fond noir par
  // défaut (DarkTheme) dès que le téléphone est en mode sombre système, quel
  // que soit le style de chaque écran. On le force ici à suivre notre thème.
  const navigationTheme = {
    ...(isDarkMode ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDarkMode ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.background,
    },
  };

  useEffect(() => {
    async function prepare() {
      try {
        const [token, savedUser] = await Promise.all([
          secureStorage.getToken(),
          AsyncStorage.getItem('user'),
        ]);
        if (token) {
          apiClient.setAuthToken(token);
        }
        if (token && savedUser) {
          const userData = JSON.parse(savedUser);
          await authLogin(userData);
          const biometricEnabled = await AsyncStorage.getItem(BIOMETRIC_LOCK_KEY);
          if (biometricEnabled === 'true') {
            setIsLocked(true);
          }
        }
        apiClient.setOnSessionExpired(async () => {
          await authLogout();
        });
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (e) {
        console.error('Erreur initialisation:', e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) return null;

  if (isLoading) {
    return (
      <View style={{ flex: 1 }}>
        <CustomSplashScreen onFinish={() => setIsLoading(false)} />
      </View>
    );
  }

  if (isLocked) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} backgroundColor={colors.background} />
        <BiometricLockScreen onUnlock={() => setIsLocked(false)} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} backgroundColor={colors.background} />
      <NavigationContainer theme={navigationTheme}>
        <RootNavigator />
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
