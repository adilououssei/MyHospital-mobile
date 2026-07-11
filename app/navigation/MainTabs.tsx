import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../components/HomeScreen';
import ChatbotScreen from '../components/ChatbotScreen';
import AppointmentsScreen from '../components/AppointmentsScreen';
import ProfileScreen from '../components/ProfileScreen';
import CustomTabBar from './CustomTabBar';

const Tab = createBottomTabNavigator();

function createOnNavigate(navigation: any) {
  return (screen: string, params?: any) => {
    navigation.navigate(screen, params);
  };
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props: any) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="home">
        {({ navigation }: any) => (
          <HomeScreen onNavigate={createOnNavigate(navigation)} />
        )}
      </Tab.Screen>
      <Tab.Screen name="chatbot">
        {({ navigation }: any) => (
          <ChatbotScreen onNavigate={createOnNavigate(navigation)} />
        )}
      </Tab.Screen>
      <Tab.Screen name="appointments">
        {({ navigation }: any) => (
          <AppointmentsScreen onNavigate={createOnNavigate(navigation)} />
        )}
      </Tab.Screen>
      <Tab.Screen name="profile">
        {({ navigation }: any) => (
          <ProfileScreen onNavigate={createOnNavigate(navigation)} />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
