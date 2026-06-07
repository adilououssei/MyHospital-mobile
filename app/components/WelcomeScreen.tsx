import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

interface WelcomeScreenProps {
  onNavigate: (screen: string) => void;
}

const WelcomeScreen = ({ onNavigate }: WelcomeScreenProps) => {
  const { t } = useApp();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Image
              source={require('../../assets/MyHospital1.png')}
              style={{ width: 250, height: 200 }}
            />
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{t('welcomeStart')}</Text>
          <Text style={styles.description}>
            {t('welcomeDesc1')}
          </Text>
          <Text style={styles.description}>
            {t('welcomeDesc2')}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => onNavigate('login')}
          >
            <Text style={styles.loginButtonText}>{t('welcomeLogin')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => onNavigate('signup')}
          >
            <Text style={styles.signupButtonText}>{t('welcomeSignup')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  logoIcon: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',

  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a56db',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 15,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  loginButton: {
    backgroundColor: '#1a3fad',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1a56db',
  },
  signupButtonText: {
    color: '#1a56db',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WelcomeScreen;
