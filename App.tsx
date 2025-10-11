import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useState } from 'react';
import WelcomeScreen from './app/screens/WelcomeScreen';
import LoginScreen from './app/screens/LoginScreen';
import SignUpScreen from './app/screens/SignUpScreen';
import ForgotPasswordScreen from './app/screens/ForgotPasswordScreen';
import VerificationCodeScreen from './app/screens/VerificationCodeScreen';
import CreateNewPasswordScreen from './app/screens/CreateNewPasswordScreen';
import HomeScreen from './app/screens/HomeScreen';
import ProfileScreen from './app/screens/ProfileScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [screenParams, setScreenParams] = useState<any>({});

  const handleNavigation = (screen: string, params?: any) => {
    setCurrentScreen(screen);
    if (params) {
      setScreenParams(params);
    }
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
        return <HomeScreen onNavigate={handleNavigation} />;
      case 'profile':
        return <ProfileScreen onNavigate={handleNavigation} />;
      default:
        return <WelcomeScreen onNavigate={handleNavigation} />;
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar style={getStatusBarStyle()} />
      {renderScreen()}
    </SafeAreaProvider>
  );
}