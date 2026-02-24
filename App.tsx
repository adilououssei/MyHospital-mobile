import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
import { BackHandler, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppProvider } from './app/context/AppContext';
import apiClient from './app/services/api.config';
import CustomSplashScreen from './app/components/SplashScreen';
import WelcomeScreen from './app/components/WelcomeScreen';
import LoginScreen from './app/components/LoginScreen';
import SignUpScreen from './app/components/SignUpScreen';
import ForgotPasswordScreen from './app/components/ForgotPasswordScreen';
import VerificationCodeScreen from './app/components/VerificationCodeScreen';
import CreateNewPasswordScreen from './app/components/CreateNewPasswordScreen';
import HomeScreen from './app/components/HomeScreen';
import ProfileScreen from './app/components/ProfileScreen';
import PharmacyScreen from './app/components/PharmacyScreen';
import HospitalScreen from './app/components/HospitalScreen';
import AppointmentsScreen from './app/components/AppointmentsScreen';
import BookingTypeScreen from './app/components/BookingTypeScreen';
import DoctorsListScreen from './app/components/DoctorsListScreen';
import DoctorDetailScreen from './app/components/DoctorDetailScreen';
import PaymentMethodScreen from './app/components/PaymentMethodScreen';
import NotificationsScreen from './app/components/NotificationsScreen';
import NotificationDetailScreen from './app/components/NotificationDetailScreen';
import FavoritesScreen from './app/components/FavoritesScreen';
import LanguageScreen from './app/components/LanguageScreen';
import ThemeScreen from './app/components/ThemeScreen';
import SavedPaymentMethodsScreen from './app/components/SavedPaymentMethodsScreen';
import FAQsScreen from './app/components/FAQsScreen';
import EmergencyScreen from './app/components/EmergencyScreen';
import HealthInfoScreen from './app/components/HealthInfoScreen';
import SettingsScreen from './app/components/SettingsScreen';
import EditProfileScreen from './app/components/EditProfileScreen';
import PrivacySecurityScreen from './app/components/PrivacySecurityScreen';
import ChangePasswordScreen from './app/components/ChangePasswordScreen';
import TermsScreen from './app/components/TermsScreen';
import PrivacyPolicyScreen from './app/components/PrivacyPolicyScreen';
import RateAppScreen from './app/components/RateAppScreen';
import TransactionHistoryScreen from './app/components/TransactionHistoryScreen';
import PrescriptionsScreen from './app/components/PrescriptionsScreen';

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const [isLoading, setIsLoading]   = useState(true);
  const [appIsReady, setAppIsReady] = useState(false);

  const [currentScreen, setCurrentScreen]       = useState('welcome');
  const [screenParams, setScreenParams]         = useState<any>({});
  const [unreadCount, setUnreadCount]           = useState(2);
  const [navigationHistory, setNavigationHistory] = useState<string[]>(['welcome']);

  // ── Init : restaure uniquement le token JWT ───────────────
  // ⚠️  NE PAS lire 'user' ici — c'est AppProvider qui le gère
  //     Si on setUser() ici ET dans AppProvider → conflit → déconnexion
  useEffect(() => {
    async function prepare() {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          apiClient.setAuthToken(token);
          console.log('✅ Token JWT restauré');
        }
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (e) {
        console.error('❌ Erreur initialisation:', e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) await SplashScreen.hideAsync();
  }, [appIsReady]);

  // ── Navigation ────────────────────────────────────────────
  const handleNavigation = (screen: string, params?: any) => {
    setCurrentScreen(screen);
    setNavigationHistory(prev => [...prev, screen]);
    if (params) setScreenParams(params);
  };

  const handleBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop();
      setNavigationHistory(newHistory);
      setCurrentScreen(newHistory[newHistory.length - 1]);
      return true;
    }
    return false;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => backHandler.remove();
  }, [navigationHistory]);

  const getStatusBarStyle = () => currentScreen === 'profile' ? 'light' : 'dark';

  if (!appIsReady) return null;

  if (isLoading) {
    return (
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <CustomSplashScreen onFinish={() => setIsLoading(false)} />
      </View>
    );
  }

  // ── Écrans ────────────────────────────────────────────────
  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':         return <WelcomeScreen onNavigate={handleNavigation} />;
      case 'login':           return <LoginScreen onNavigate={handleNavigation} />;
      case 'signup':          return <SignUpScreen onNavigate={handleNavigation} />;
      case 'forgotPassword':  return <ForgotPasswordScreen onNavigate={handleNavigation} />;
      case 'verification':
        return (
          <VerificationCodeScreen
            onNavigate={handleNavigation}
            contact={screenParams.contact}
            type={screenParams.type}
          />
        );
      case 'createNewPassword': return <CreateNewPasswordScreen onNavigate={handleNavigation} />;
      case 'home':            return <HomeScreen onNavigate={handleNavigation} unreadCount={unreadCount} />;
      case 'profile':         return <ProfileScreen onNavigate={handleNavigation} />;
      case 'pharmacy':        return <PharmacyScreen onNavigate={handleNavigation} />;
      case 'hospital':        return <HospitalScreen onNavigate={handleNavigation} />;
      case 'appointments':    return <AppointmentsScreen onNavigate={handleNavigation} />;
      case 'bookingType':     return <BookingTypeScreen onNavigate={handleNavigation} />;
      case 'doctorsList':
        return (
          <DoctorsListScreen
            onNavigate={handleNavigation}
            consultationType={screenParams.consultationType}
            description={screenParams.description}
          />
        );
      case 'doctorDetail':
        return (
          <DoctorDetailScreen
            onNavigate={handleNavigation}
            doctor={screenParams.doctor}
            consultationType={screenParams.consultationType}
            description={screenParams.description}
          />
        );
      case 'paymentMethod':
        return (
          <PaymentMethodScreen
            onNavigate={handleNavigation}
            doctor={screenParams.doctor}
            consultationType={screenParams.consultationType}
            description={screenParams.description}
            date={screenParams.date}
            time={screenParams.time}
            consultationPrice={screenParams.consultationPrice}
            confirmationFee={screenParams.confirmationFee}
          />
        );
      case 'notifications':
        return <NotificationsScreen onNavigate={handleNavigation} onUpdateUnreadCount={setUnreadCount} />;
      case 'notificationDetail':
        return (
          <NotificationDetailScreen
            onNavigate={handleNavigation}
            notification={screenParams.notification}
          />
        );
      case 'favorites':           return <FavoritesScreen onNavigate={handleNavigation} />;
      case 'language':            return <LanguageScreen onNavigate={handleNavigation} />;
      case 'theme':               return <ThemeScreen onNavigate={handleNavigation} />;
      case 'savedPaymentMethods': return <SavedPaymentMethodsScreen onNavigate={handleNavigation} />;
      case 'faqs':                return <FAQsScreen onNavigate={handleNavigation} />;
      case 'emergency':           return <EmergencyScreen onNavigate={handleNavigation} />;
      case 'healthInfo':          return <HealthInfoScreen onNavigate={handleNavigation} />;
      case 'editProfile':         return <EditProfileScreen onNavigate={handleNavigation} />;
      case 'settings':            return <SettingsScreen onNavigate={handleNavigation} />;
      case 'privacySecurity':     return <PrivacySecurityScreen onNavigate={handleNavigation} />;
      case 'changePassword':      return <ChangePasswordScreen onNavigate={handleNavigation} />;
      case 'terms':               return <TermsScreen onNavigate={handleNavigation} />;
      case 'privacyPolicy':       return <PrivacyPolicyScreen onNavigate={handleNavigation} />;
      case 'rateApp':             return <RateAppScreen onNavigate={handleNavigation} />;
      case 'transactionHistory':  return <TransactionHistoryScreen onNavigate={handleNavigation} />;
      case 'prescriptions':       return <PrescriptionsScreen onNavigate={handleNavigation} />;
      default:                    return <WelcomeScreen onNavigate={handleNavigation} />;
    }
  };

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <StatusBar style={getStatusBarStyle()} />
      {renderScreen()}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </SafeAreaProvider>
  );
}