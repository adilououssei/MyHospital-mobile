// app/components/CreateNewPasswordScreen.tsx

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Modal, KeyboardAvoidingView, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

interface CreateNewPasswordScreenProps {
  onNavigate: (screen: string) => void;
}

const CreateNewPasswordScreen = ({ onNavigate }: CreateNewPasswordScreenProps) => {
  const { t } = useApp();
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal]       = useState(false);
  const [passwordError, setPasswordError]     = useState('');
  const [confirmError, setConfirmError]       = useState('');

  const handleCreatePassword = () => {
    setPasswordError('');
    setConfirmError('');
    if (password.length < 6) { setPasswordError(t('cnpErrLen')); return; }
    if (password !== confirmPassword) { setConfirmError(t('cnpErrMatch')); return; }
    setShowSuccessModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('verification')}>
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>{t('cnpTitle')}</Text>
            <Text style={styles.description}>{t('cnpDesc')}</Text>

            {/* Nouveau mot de passe */}
            <View style={[styles.inputContainer, passwordError ? styles.inputError : null]}>
              <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" />
              <TextInput style={styles.input} placeholder={t('cnpNew')} placeholderTextColor="#9ca3af"
                value={password} onChangeText={text => { setPassword(text); setPasswordError(''); }}
                secureTextEntry={!showPassword} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

            {/* Confirmer */}
            <View style={[styles.inputContainer, confirmError ? styles.inputError : null]}>
              <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" />
              <TextInput style={styles.input} placeholder={t('cnpConfirm')} placeholderTextColor="#9ca3af"
                value={confirmPassword} onChangeText={text => { setConfirmPassword(text); setConfirmError(''); }}
                secureTextEntry={!showConfirmPassword} />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            {confirmError ? <Text style={styles.errorText}>{confirmError}</Text> : null}

            <TouchableOpacity style={styles.createButton} onPress={handleCreatePassword}>
              <Text style={styles.createButtonText}>{t('cnpCreate')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal succès */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="checkmark" size={50} color="#1a56db" />
            </View>
            <Text style={styles.modalTitle}>{t('success')}</Text>
            <Text style={styles.modalDescription}>{t('cnpSuccess')}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => { setShowSuccessModal(false); onNavigate('login'); }}>
              <Text style={styles.modalButtonText}>{t('cnpLogin')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  backButton: { padding: 5 },
  content: { paddingHorizontal: 30, paddingTop: 10 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#111827', marginBottom: 15 },
  description: { fontSize: 14, color: '#6b7280', marginBottom: 40 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.88)', borderRadius: 14,
    paddingHorizontal: 20, paddingVertical: 15,
    marginBottom: 15, borderWidth: 1.5, borderColor: '#e5e7eb',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3
  },
  inputError: { borderColor: '#FF6B6B', borderWidth: 2 },
  input: { flex: 1, marginLeft: 10, fontSize: 14, color: '#111827' },
  errorText: { color: '#FF6B6B', fontSize: 12, marginTop: -10, marginBottom: 10, marginLeft: 20 },
  createButton: {
    backgroundColor: '#1a3fad', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3
  },
  createButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 35, width: '100%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  modalIconContainer: { width: 100, height: 100, backgroundColor: '#E8F9F5', borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  modalDescription: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
  modalButton: { backgroundColor: '#1a3fad', paddingVertical: 15, paddingHorizontal: 60, borderRadius: 14, marginTop: 30, width: '100%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  modalButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default CreateNewPasswordScreen;
