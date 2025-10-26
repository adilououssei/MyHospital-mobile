import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useState } from 'react';
import { AppProvider } from './app/context/AppContext';
import WelcomeScreen from './app/screens/WelcomeScreen';
import LoginScreen from './app/screens/LoginScreen';
import SignUpScreen from './app/screens/SignUpScreen';
import ForgotPasswordScreen from './app/screens/ForgotPasswordScreen';
import VerificationCodeScreen from './app/screens/VerificationCodeScreen';
import CreateNewPasswordScreen from './app/screens/CreateNewPasswordScreen';
import HomeScreen from './app/screens/HomeScreen';
import ProfileScreen from './app/screens/ProfileScreen';
import PharmacyScreen from './app/screens/PharmacyScreen';
import HospitalScreen from './app/screens/HospitalScreen';
import AppointmentsScreen from './app/screens/AppointmentsScreen';
import BookingTypeScreen from './app/screens/BookingTypeScreen';
import DoctorsListScreen from './app/screens/DoctorsListScreen';
import DoctorDetailScreen from './app/screens/DoctorDetailScreen';
import PaymentMethodScreen from './app/screens/PaymentMethodScreen';
import NotificationsScreen from './app/screens/NotificationsScreen';
import NotificationDetailScreen from './app/screens/NotificationDetailScreen';
import FavoritesScreen from './app/screens/FavoritesScreen';
import LanguageScreen from './app/screens/LanguageScreen';
import ThemeScreen from './app/screens/ThemeScreen';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [screenParams, setScreenParams] = useState<any>({});
  const [unreadCount, setUnreadCount] = useState(2);

  const handleNavigation = (screen: string, params?: any) => {
    setCurrentScreen(screen);
    if (params) {
      setScreenParams(params);
    }
  };

  const updateUnreadCount = (count: number) => {
    setUnreadCount(count);
  };

  const getStatusBarStyle = () => {
    if (currentScreen === 'profile') return 'light';
    return 'dark';
  };

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
      default:
        return <WelcomeScreen onNavigate={handleNavigation} />;
    }
  };

  return (
    <>
      <StatusBar style={getStatusBarStyle()} />
      {renderScreen()}
    </>
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