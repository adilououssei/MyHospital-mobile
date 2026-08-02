import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AppContext';
import MainTabs from './MainTabs';
import PharmacyScreen from '../components/PharmacyScreen';
import HospitalScreen from '../components/HospitalScreen';
import BookingTypeScreen from '../components/BookingTypeScreen';
import DoctorsListScreen from '../components/DoctorsListScreen';
import DoctorDetailScreen from '../components/DoctorDetailScreen';
import VideoCallScreen from '../components/VideoCallScreen';
import PaymentMethodScreen from '../components/PaymentMethodScreen';
import NotificationsScreen from '../components/NotificationsScreen';
import NotificationDetailScreen from '../components/NotificationDetailScreen';
import DoctorProfileScreen from '../components/DoctorProfileScreen';
import FavoritesScreen from '../components/FavoritesScreen';
import LanguageScreen from '../components/LanguageScreen';
import ThemeScreen from '../components/ThemeScreen';
import SavedPaymentMethodsScreen from '../components/SavedPaymentMethodsScreen';
import FAQsScreen from '../components/FAQsScreen';
import EmergencyScreen from '../components/EmergencyScreen';
import HealthInfoScreen from '../components/HealthInfoScreen';
import EditProfileScreen from '../components/EditProfileScreen';
import SettingsScreen from '../components/SettingsScreen';
import PrivacySecurityScreen from '../components/PrivacySecurityScreen';
import ChangePasswordScreen from '../components/ChangePasswordScreen';
import TermsScreen from '../components/TermsScreen';
import PrivacyPolicyScreen from '../components/PrivacyPolicyScreen';
import RateAppScreen from '../components/RateAppScreen';
import TransactionHistoryScreen from '../components/TransactionHistoryScreen';
import PrescriptionsScreen from '../components/PrescriptionsScreen';
import DoctorsDirectoryScreen from '../components/DoctorsDirectoryScreen';

const Stack = createNativeStackNavigator();

const PROTECTED_SCREENS = [
  'appointments', 'profile', 'bookingType', 'paymentMethod',
  'notifications', 'favorites', 'editProfile', 'changePassword',
  'prescriptions', 'savedPaymentMethods', 'transactionHistory',
  'doctorProfile', 'pharmacy', 'hospital',
];

// Écrans imbriqués dans le tab navigator "mainTabs" — inatteignables par un
// navigate() direct depuis un écran frère de MainStack (ex: pharmacy → home).
// React Navigation ne "descend" pas automatiquement dans les navigateurs
// enfants d'un frère ; il faut cibler explicitement le parent + l'écran.
const TAB_SCREENS = ['home', 'chatbot', 'appointments', 'profile'];

function createProtectedNavigate(navigation: any, isAuthenticated: boolean) {
  return (screen: string, params?: any) => {
    if (!isAuthenticated && PROTECTED_SCREENS.includes(screen)) {
      navigation.navigate('login', { returnTo: screen, ...params });
      return;
    }
    if (TAB_SCREENS.includes(screen)) {
      navigation.navigate('mainTabs', { screen, params });
      return;
    }
    navigation.navigate(screen, params);
  };
}

export default function MainStack() {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="mainTabs">
        {({ navigation }: any) => (
          <MainTabs />
        )}
      </Stack.Screen>
      <Stack.Screen name="pharmacy">
        {({ navigation }: any) => (
          <PharmacyScreen onNavigate={createProtectedNavigate(navigation, isAuthenticated)} />
        )}
      </Stack.Screen>
      <Stack.Screen name="hospital">
        {({ navigation }: any) => (
          <HospitalScreen onNavigate={createProtectedNavigate(navigation, isAuthenticated)} />
        )}
      </Stack.Screen>
      <Stack.Screen name="bookingType">
        {({ navigation, route }: any) => (
          <BookingTypeScreen
            onNavigate={createProtectedNavigate(navigation, isAuthenticated)}
            doctor={route.params?.doctor}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="doctorsList">
        {({ navigation, route }: any) => (
          <DoctorsListScreen
            onNavigate={createProtectedNavigate(navigation, isAuthenticated)}
            consultationType={route.params?.consultationType}
            description={route.params?.description}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="doctorDetail">
        {({ navigation, route }: any) => (
          <DoctorDetailScreen
            onNavigate={createProtectedNavigate(navigation, isAuthenticated)}
            doctor={route.params?.doctor}
            consultationType={route.params?.consultationType}
            description={route.params?.description}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="videoCall">
        {({ navigation, route }: any) => (
          <VideoCallScreen
            onNavigate={createProtectedNavigate(navigation, isAuthenticated)}
            jitsiUrl={route.params?.jitsiUrl}
            doctorName={route.params?.doctorName}
            patientName={route.params?.patientName}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="paymentMethod">
        {({ navigation, route }: any) => (
          <PaymentMethodScreen
            onNavigate={createProtectedNavigate(navigation, isAuthenticated)}
            doctor={route.params?.doctor}
            consultationType={route.params?.consultationType}
            description={route.params?.description}
            date={route.params?.date}
            time={route.params?.time}
            consultationPrice={route.params?.consultationPrice}
            confirmationFee={route.params?.confirmationFee}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="notifications">
        {({ navigation }: any) => (
          <NotificationsScreen onNavigate={createProtectedNavigate(navigation, isAuthenticated)} />
        )}
      </Stack.Screen>
      <Stack.Screen name="notificationDetail">
        {({ navigation, route }: any) => (
          <NotificationDetailScreen
            onNavigate={createProtectedNavigate(navigation, isAuthenticated)}
            notification={route.params?.notification}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="doctorProfile">
        {({ navigation, route }: any) => (
          <DoctorProfileScreen
            onNavigate={createProtectedNavigate(navigation, isAuthenticated)}
            doctor={route.params?.doctor}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="favorites">
        {({ navigation }: any) => (
          <FavoritesScreen onNavigate={createProtectedNavigate(navigation, isAuthenticated)} />
        )}
      </Stack.Screen>
      <Stack.Screen name="language">
        {({ navigation }: any) => (
          <LanguageScreen onNavigate={createProtectedNavigate(navigation, isAuthenticated)} />
        )}
      </Stack.Screen>
      <Stack.Screen name="theme">
        {({ navigation }: any) => (
          <ThemeScreen onNavigate={createProtectedNavigate(navigation, isAuthenticated)} />
        )}
      </Stack.Screen>
      <Stack.Screen name="savedPaymentMethods">
        {({ navigation }: any) => (
          <SavedPaymentMethodsScreen onNavigate={createProtectedNavigate(navigation, isAuthenticated)} />
        )}
      </Stack.Screen>
      <Stack.Screen name="faqs">
        {({ navigation }: any) => (
          <FAQsScreen onNavigate={createProtectedNavigate(navigation, isAuthenticated)} />
        )}
      </Stack.Screen>
      <Stack.Screen name="emergency">
        {({ navigation }: any) => (
          <EmergencyScreen onNavigate={createProtectedNavigate(navigation, isAuthenticated)} />
        )}
      </Stack.Screen>
      <Stack.Screen name="healthInfo">
        {({ navigation }: any) => (
          <HealthInfoScreen onNavigate={createProtectedNavigate(navigation, isAuthenticated)} />
        )}
      </Stack.Screen>
      <Stack.Screen name="editProfile">
        {({ navigation }: any) => (
          <EditProfileScreen onNavigate={createProtectedNavigate(navigation, isAuthenticated)} />
        )}
      </Stack.Screen>
      <Stack.Screen name="settings">
        {({ navigation }: any) => (
          <SettingsScreen onNavigate={createProtectedNavigate(navigation, isAuthenticated)} />
        )}
      </Stack.Screen>
      <Stack.Screen name="privacySecurity">
        {({ navigation }: any) => (
          <PrivacySecurityScreen onNavigate={createProtectedNavigate(navigation, isAuthenticated)} />
        )}
      </Stack.Screen>
      <Stack.Screen name="changePassword">
        {({ navigation }: any) => (
          <ChangePasswordScreen onNavigate={createProtectedNavigate(navigation, isAuthenticated)} />
        )}
      </Stack.Screen>
      <Stack.Screen name="terms">
        {({ navigation }: any) => (
          <TermsScreen onNavigate={createProtectedNavigate(navigation, isAuthenticated)} />
        )}
      </Stack.Screen>
      <Stack.Screen name="privacyPolicy">
        {({ navigation }: any) => (
          <PrivacyPolicyScreen onNavigate={createProtectedNavigate(navigation, isAuthenticated)} />
        )}
      </Stack.Screen>
      <Stack.Screen name="rateApp">
        {({ navigation }: any) => (
          <RateAppScreen onNavigate={createProtectedNavigate(navigation, isAuthenticated)} />
        )}
      </Stack.Screen>
      <Stack.Screen name="transactionHistory">
        {({ navigation }: any) => (
          <TransactionHistoryScreen onNavigate={createProtectedNavigate(navigation, isAuthenticated)} />
        )}
      </Stack.Screen>
      <Stack.Screen name="prescriptions">
        {({ navigation }: any) => (
          <PrescriptionsScreen onNavigate={createProtectedNavigate(navigation, isAuthenticated)} />
        )}
      </Stack.Screen>
      <Stack.Screen name="doctorsDirectory">
        {({ navigation, route }: any) => (
          <DoctorsDirectoryScreen
            onNavigate={createProtectedNavigate(navigation, isAuthenticated)}
            initialQuery={route.params?.initialQuery}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
