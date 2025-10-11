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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface CreateNewPasswordScreenProps {
  onNavigate: (screen: string) => void;
}

const CreateNewPasswordScreen = ({ onNavigate }: CreateNewPasswordScreenProps) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  const validatePassword = (pwd: string) => {
    if (pwd.length < 6) {
      return 'Le mot de passe doit contenir au moins 6 caractères';
    }
    return '';
  };

  const handleCreatePassword = () => {
    setPasswordError('');
    setConfirmError('');

    // Validation du mot de passe
    const pwdError = validatePassword(password);
    if (pwdError) {
      setPasswordError(pwdError);
      return;
    }

    // Vérification de la correspondance
    if (password !== confirmPassword) {
      setConfirmError('Les mots de passe ne correspondent pas');
      return;
    }

    // Afficher le modal de succès
    setShowSuccessModal(true);
  };

  const handleGoToLogin = () => {
    setShowSuccessModal(false);
    onNavigate('login');
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
              onPress={() => onNavigate('verification')}
            >
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {/* Title */}
            <Text style={styles.title}>Créer un nouveau mot de passe</Text>
            <Text style={styles.description}>
              Créez votre nouveau mot de passe pour vous connecter
            </Text>

            {/* Password Input */}
            <View style={[styles.inputContainer, passwordError && styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={20} color="#999" />
              <TextInput
                style={styles.input}
                placeholder="Nouveau mot de passe"
                placeholderTextColor="#999"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError('');
                }}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>

            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}

            {/* Confirm Password Input */}
            <View style={[styles.inputContainer, confirmError && styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={20} color="#999" />
              <TextInput
                style={styles.input}
                placeholder="Confirmer le mot de passe"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setConfirmError('');
                }}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>

            {confirmError ? (
              <Text style={styles.errorText}>{confirmError}</Text>
            ) : null}

            {/* Create Password Button */}
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreatePassword}
            >
              <Text style={styles.createButtonText}>Créer le mot de passe</Text>
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

            <Text style={styles.modalTitle}>Succès</Text>
            <Text style={styles.modalDescription}>
              Vous avez réinitialisé votre mot de passe
            </Text>
            <Text style={styles.modalDescription}>avec succès.</Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleGoToLogin}
            >
              <Text style={styles.modalButtonText}>Connexion</Text>
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  content: {
    paddingHorizontal: 30,
    paddingTop: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  description: {
    fontSize: 14,
    color: '#999',
    marginBottom: 40,
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
  createButton: {
    backgroundColor: '#0077b6',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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

export default CreateNewPasswordScreen;