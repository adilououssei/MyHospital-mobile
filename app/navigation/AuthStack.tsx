import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../components/WelcomeScreen';
import LoginScreen from '../components/LoginScreen';
import SignUpScreen from '../components/SignUpScreen';
import ForgotPasswordScreen from '../components/ForgotPasswordScreen';
import VerificationCodeScreen from '../components/VerificationCodeScreen';
import CreateNewPasswordScreen from '../components/CreateNewPasswordScreen';

const Stack = createNativeStackNavigator();

function createOnNavigate(navigation: any) {
  return (screen: string, params?: any) => {
    navigation.navigate(screen, params);
  };
}

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="welcome">
        {({ navigation }: any) => (
          <WelcomeScreen onNavigate={createOnNavigate(navigation)} />
        )}
      </Stack.Screen>
      <Stack.Screen name="login">
        {({ navigation, route }: any) => (
          <LoginScreen
            onNavigate={createOnNavigate(navigation)}
            returnTo={route.params?.returnTo}
            forwardParams={route.params}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="signup">
        {({ navigation }: any) => (
          <SignUpScreen onNavigate={createOnNavigate(navigation)} />
        )}
      </Stack.Screen>
      <Stack.Screen name="forgotPassword">
        {({ navigation }: any) => (
          <ForgotPasswordScreen onNavigate={createOnNavigate(navigation)} />
        )}
      </Stack.Screen>
      <Stack.Screen name="verification">
        {({ navigation, route }: any) => (
          <VerificationCodeScreen
            onNavigate={createOnNavigate(navigation)}
            contact={route.params?.email || route.params?.contact || ''}
            type={route.params?.type || 'email'}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="createNewPassword">
        {({ navigation, route }: any) => (
          <CreateNewPasswordScreen
            onNavigate={createOnNavigate(navigation)}
            token={route.params?.token || ''}
            email={route.params?.email || ''}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
