import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { AppProvider, useAuth } from './app/context/AppContext';
import { NotificationProvider } from './app/context/NotificationContext';
import apiClient from './app/services/api.config';
import { secureStorage } from './app/services/secureStorage';
import CustomSplashScreen from './app/components/SplashScreen';
import RootNavigator from './app/navigation/RootNavigator';

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { login: authLogin, logout: authLogout, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [appIsReady, setAppIsReady] = useState(false);

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

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <NavigationContainer>
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
