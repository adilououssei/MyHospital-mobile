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

// Empêcher le splash screen natif de se cacher automatiquement
SplashScreen.preventAutoHideAsync();

function AppContent() {
  // État pour gérer l'affichage du Custom Splash Screen
  const [isLoading, setIsLoading] = useState(true);
  const [appIsReady, setAppIsReady] = useState(false);
  
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [screenParams, setScreenParams] = useState<any>({});
  const [unreadCount, setUnreadCount] = useState(2);
  const [navigationHistory, setNavigationHistory] = useState<string[]>(['welcome']);

  // ✅ MODIFIÉ : Restaurer le token AVANT que l'app soit prête
  useEffect(() => {
    async function prepare() {
      try {
        console.log('🚀 Initialisation de l\'application...');
        
        // ✅ ÉTAPE 1 : Restaurer le token JWT IMMÉDIATEMENT
        const token = await AsyncStorage.getItem('authToken');
        
        if (token) {
          // Configurer le token dans apiClient AVANT tout le reste
          apiClient.setAuthToken(token);
          console.log('✅ Token JWT restauré au démarrage');
          console.log('🔑 Token:', token.substring(0, 20) + '...');
          
          // Vérifier que le token est bien configuré
          const tokenCheck = apiClient.getAuthToken();
          console.log('🔍 Vérification token dans apiClient:', tokenCheck ? 'OK' : 'ERREUR');
          
          // Récupérer les infos utilisateur
          const userJson = await AsyncStorage.getItem('user');
          if (userJson) {
            const user = JSON.parse(userJson);
            console.log('👤 Utilisateur restauré:', user.email || user.nom);
          }
        } else {
          console.log('⚠️ Aucun token trouvé - Utilisateur non connecté');
        }
        
        // ✅ ÉTAPE 2 : Attendre un court instant pour s'assurer que tout est initialisé
        await new Promise(resolve => setTimeout(resolve, 200));
        
        console.log('✅ Application prête - Token configuré:', apiClient.getAuthToken() ? 'OUI' : 'NON');
      } catch (e) {
        console.error('❌ Erreur lors de l\'initialisation:', e);
      } finally {
        // ✅ Marquer l'app comme prête seulement APRÈS la configuration du token
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // Cacher le splash screen natif d'Expo
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  const handleNavigation = (screen: string, params?: any) => {
    setCurrentScreen(screen);
    setNavigationHistory(prev => [...prev, screen]);
    if (params) {
      setScreenParams(params);
    }
  };

  const handleBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop();
      const previousScreen = newHistory[newHistory.length - 1];
      setNavigationHistory(newHistory);
      setCurrentScreen(previousScreen);
      return true;
    }
    return false;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => backHandler.remove();
  }, [navigationHistory]);

  const updateUnreadCount = (count: number) => {
    setUnreadCount(count);
  };

  const getStatusBarStyle = () => {
    if (currentScreen === 'profile') return 'light';
    return 'dark';
  };

  const handleSplashFinish = () => {
    setIsLoading(false);
  };

  // Attendre que l'app soit prête
  if (!appIsReady) {
    return null;
  }

  // Afficher le Custom Splash Screen
  if (isLoading) {
    return (
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <CustomSplashScreen onFinish={handleSplashFinish} />
      </View>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onNavigate={handleNavigation} />;
      case 'login':
        return <LoginScreen onNavigate={handleNavigation} />;
      case 'signup':
        return <SignUpScreen onNavigate={handleNavigation} />;
      case 'forgotPassword':
        return <ForgotPasswordScreen onNavigate={handleNavigation} />;
      case 'verification':
        return (
          <VerificationCodeScreen
            onNavigate={handleNavigation}
            contact={screenParams.contact}
            type={screenParams.type}
          />
        );
      case 'createNewPassword':
        return <CreateNewPasswordScreen onNavigate={handleNavigation} />;
      case 'home':
        return <HomeScreen onNavigate={handleNavigation} unreadCount={unreadCount} />;
      case 'profile':
        return <ProfileScreen onNavigate={handleNavigation} />;
      case 'pharmacy':
        return <PharmacyScreen onNavigate={handleNavigation} />;
      case 'hospital':
        return <HospitalScreen onNavigate={handleNavigation} />;
      case 'appointments':
        return <AppointmentsScreen onNavigate={handleNavigation} />;
      case 'bookingType':
        return <BookingTypeScreen onNavigate={handleNavigation} />;
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
        return <NotificationsScreen onNavigate={handleNavigation} onUpdateUnreadCount={updateUnreadCount} />;
      case 'notificationDetail':
        return (
          <NotificationDetailScreen
            onNavigate={handleNavigation}
            notification={screenParams.notification}
          />
        );
      case 'favorites':
        return <FavoritesScreen onNavigate={handleNavigation} />;
      case 'language':
        return <LanguageScreen onNavigate={handleNavigation} />;
      case 'theme':
        return <ThemeScreen onNavigate={handleNavigation} />;
      case 'savedPaymentMethods':
        return <SavedPaymentMethodsScreen onNavigate={handleNavigation} />;
      case 'faqs':
        return <FAQsScreen onNavigate={handleNavigation} />;
      case 'emergency':
        return <EmergencyScreen onNavigate={setCurrentScreen} />;
      case 'healthInfo':
        return <HealthInfoScreen onNavigate={setCurrentScreen} />;
      case 'editProfile':
        return <EditProfileScreen onNavigate={setCurrentScreen} />;
      case 'settings':
        return <SettingsScreen onNavigate={setCurrentScreen} />;
      case 'privacySecurity':
        return <PrivacySecurityScreen onNavigate={setCurrentScreen} />;
      case 'changePassword':
        return <ChangePasswordScreen onNavigate={setCurrentScreen} />;
      case 'terms':
        return <TermsScreen onNavigate={handleNavigation} />;
      case 'privacyPolicy':
        return <PrivacyPolicyScreen onNavigate={setCurrentScreen} />;
      case 'rateApp':
        return <RateAppScreen onNavigate={handleNavigation} />;
      case 'transactionHistory':
        return <TransactionHistoryScreen onNavigate={handleNavigation} />;
      case 'prescriptions':
        return <PrescriptionsScreen onNavigate={handleNavigation} />;
      default:
        return <WelcomeScreen onNavigate={handleNavigation} />;
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