import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../services/authService';
import apiClient from '../services/api.config';
import { useAuth } from '../context/AppContext';

interface LoginScreenProps {
  onNavigate: (screen: string) => void;
}

const LoginScreen = ({ onNavigate }: LoginScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login: saveUser } = useAuth();

  const validateEmail = (text: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  };

  const handleLogin = async () => {
    setEmailError(false);
    setPasswordError(false);
    setErrorMessage('');

    // Validation côté client
    if (!validateEmail(email)) {
      setEmailError(true);
      setErrorMessage('Email invalide');
      return;
    }

    if (password.length < 6) {
      setPasswordError(true);
      setErrorMessage('Mot de passe trop court');
      return;
    }

    // Appel API
    setIsLoading(true);

    try {
      console.log('🔐 Tentative de connexion...');
      
      const response = await authService.login({
        email: email.trim(),
        password: password,
      });

      setIsLoading(false);

      if (response.status === 'success' && response.user) {
        console.log('✅ Connexion réussie');

        // ✅ NOUVEAU : Récupérer le token JWT
        const token = response.token;

        if (token) {
          // 1. Configurer le token dans apiClient (pour les requêtes API)
          apiClient.setAuthToken(token);
          console.log('✅ Token configuré dans apiClient');

          // 2. Sauvegarder le token dans AsyncStorage (persistence)
          await AsyncStorage.setItem('authToken', token);
          console.log('✅ Token sauvegardé dans AsyncStorage');

          // 3. Sauvegarder les infos utilisateur dans AsyncStorage
          await AsyncStorage.setItem('user', JSON.stringify(response.user));
          console.log('✅ Infos utilisateur sauvegardées');
        } else {
          console.warn('⚠️ Token non reçu du serveur');
        }

        // Sauvegarder l'utilisateur dans le contexte
        await saveUser(response.user);
        
        // Afficher le modal de succès
        setShowSuccessModal(true);
      } else {
        // Afficher l'erreur
        setPasswordError(true);
        setErrorMessage(response.message || 'Erreur de connexion');
        Alert.alert('Erreur', response.message || 'Erreur de connexion');
      }
    } catch (error: any) {
      console.error('❌ Erreur login:', error);
      setIsLoading(false);
      setPasswordError(true);
      
      let errorMsg = 'Erreur de connexion au serveur';
      
      if (error.response) {
        errorMsg = error.response.data?.message || 
                   error.response.data?.error || 
                   'Identifiants incorrects';
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
      Alert.alert('Erreur', errorMsg);
    }
  };

  const handleGoToHome = () => {
    setShowSuccessModal(false);
    onNavigate('home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => onNavigate('welcome')}
            >
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Connexion</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.content}>
            <Text style={styles.welcomeText}>Bon retour !</Text>
            <Text style={styles.subtitleText}>
              Connectez-vous pour accéder à votre compte
            </Text>

            {/* Email Input */}
            <View style={[styles.inputContainer, emailError && styles.inputError]}>
              <Ionicons name="mail-outline" size={20} color="#999" />
              <TextInput
                style={styles.input}
                placeholder="Entrez votre email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setEmailError(false);
                  setErrorMessage('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
              {email && validateEmail(email) && (
                <Ionicons name="checkmark" size={20} color="#0077b6" />
              )}
            </View>

            {/* Password Input */}
            <View style={[styles.inputContainer, passwordError && styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={20} color="#999" />
              <TextInput
                style={styles.input}
                placeholder="Entrez votre mot de passe"
                placeholderTextColor="#999"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError(false);
                  setErrorMessage('');
                }}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>

            {errorMessage ? (
              <Text style={styles.errorText}>*{errorMessage}</Text>
            ) : null}

            {/* Forgot Password */}
            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={() => onNavigate('forgotPassword')}
              disabled={isLoading}
            >
              <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity 
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Connexion</Text>
              )}
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Vous n'avez pas de compte ? </Text>
              <TouchableOpacity 
                onPress={() => onNavigate('signup')}
                disabled={isLoading}
              >
                <Text style={styles.signupLink}>Inscription</Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OU</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login Buttons */}
            <TouchableOpacity style={styles.socialButton} disabled={isLoading}>
              <Ionicons name="logo-google" size={24} color="#DB4437" />
              <Text style={styles.socialButtonText}>Se connecter avec Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton} disabled={isLoading}>
              <Ionicons name="logo-apple" size={24} color="#000" />
              <Text style={styles.socialButtonText}>Se connecter avec Apple</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton} disabled={isLoading}>
              <Ionicons name="logo-facebook" size={24} color="#1877F2" />
              <Text style={styles.socialButtonText}>Se connecter avec Facebook</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="checkmark" size={50} color="#0077b6" />
            </View>

            <Text style={styles.modalTitle}>Bon retour !</Text>
            <Text style={styles.modalDescription}>
              Vous vous êtes connecté avec succès
            </Text>
            <Text style={styles.modalDescription}>
              à l'application MyHospital
            </Text>

            <TouchableOpacity style={styles.modalButton} onPress={handleGoToHome}>
              <Text style={styles.modalButtonText}>Aller à l'accueil</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 34,
  },
  content: {
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  inputError: {
    borderColor: '#FF6B6B',
    borderWidth: 2,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#000',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 20,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: '#0077b6',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#0077b6',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonDisabled: {
    backgroundColor: '#B0B0B0',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  signupText: {
    color: '#666',
    fontSize: 14,
  },
  signupLink: {
    color: '#0077b6',
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#999',
    fontSize: 14,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 25,
    paddingVertical: 15,
    marginBottom: 15,
  },
  socialButtonText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#000',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 35,
    width: '100%',
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#E8F9F5',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#0077b6',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 25,
    marginTop: 30,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen;