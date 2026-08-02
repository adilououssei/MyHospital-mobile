import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Modal, KeyboardAvoidingView, ScrollView,
  ActivityIndicator, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import authService from '../services/authService';
import apiClient from '../services/api.config';
import { secureStorage } from '../services/secureStorage';
import { useAuth, useApp } from '../context/AppContext';

interface LoginScreenProps {
  onNavigate: (screen: string, params?: any) => void;
  returnTo?: string;
  forwardParams?: any;
}

const LANGUAGES = [
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
];

// ─── Arrière-plan décoratif ───────────────────────────────────────────────────
const DecorBackground = () => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    {/* Blob haut droite */}
    <View style={decor.blobTopRight} />
    {/* Blob bas gauche */}
    <View style={decor.blobBottomLeft} />
    {/* Vague bas */}
    <View style={decor.waveBottom} />
    {/* Croix médicales */}
    <Text style={decor.plus1}>✚</Text>
    <Text style={decor.plus2}>✚</Text>
    <Text style={decor.plus3}>✚</Text>
    <Text style={decor.plus4}>✚</Text>
    <Text style={decor.plus5}>✚</Text>
  </View>
);

const decor = StyleSheet.create({
  blobTopRight: {
    position: 'absolute', top: -60, right: -60,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: '#dbeafe', opacity: 0.55,
  },
  blobBottomLeft: {
    position: 'absolute', bottom: 80, left: -80,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: '#bfdbfe', opacity: 0.35,
  },
  waveBottom: {
    position: 'absolute', bottom: -40, left: -40, right: -40,
    height: 130, borderRadius: 80,
    backgroundColor: '#dbeafe', opacity: 0.6,
  },
  plus1: { position: 'absolute', bottom: 55, right: 24,  fontSize: 30, color: '#93c5fd', opacity: 0.75 },
  plus2: { position: 'absolute', bottom: 18, left:  48,  fontSize: 22, color: '#86efac', opacity: 0.70 },
  plus3: { position: 'absolute', bottom: 72, left:  18,  fontSize: 15, color: '#93c5fd', opacity: 0.55 },
  plus4: { position: 'absolute', top:   90, right: 18,   fontSize: 14, color: '#bfdbfe', opacity: 0.60 },
  plus5: { position: 'absolute', top:  180, left:  14,   fontSize: 12, color: '#86efac', opacity: 0.45 },
});

// ─── Composant principal ──────────────────────────────────────────────────────
const LoginScreen = ({ onNavigate, returnTo, forwardParams }: LoginScreenProps) => {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError]     = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLangModal, setShowLangModal]       = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login: saveUser }          = useAuth();
  const { language, setLanguage, t } = useApp();

  const currentLang = LANGUAGES.find(l => l.code === language) ?? LANGUAGES[0];
  const validateEmail = (text: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);

  const handleLogin = async () => {
    setEmailError(false); setPasswordError(false); setErrorMessage('');
    if (!validateEmail(email)) { setEmailError(true); setErrorMessage(t('loginErrEmail')); return; }
    if (password.length < 6)  { setPasswordError(true); setErrorMessage(t('loginErrPassword')); return; }

    setIsLoading(true);
    try {
      const response = await authService.login({ email: email.trim(), password });
      setIsLoading(false);
      if (response.status === 'success' && response.user) {
        const token = response.token;
        if (token) {
          apiClient.setAuthToken(token);
          await secureStorage.setToken(token);
          if ((response as any).refresh_token)
            await secureStorage.setRefreshToken((response as any).refresh_token);
        }
        await saveUser({
          ...response.user,
          roles: response.roles,
          isDocteur: response.isDocteur,
          docteurId: response.docteurId,
          hasConsultationLocation: response.hasConsultationLocation,
          photo: response.user.photo ?? '',
        });
        setShowSuccessModal(true);
      } else {
        setPasswordError(true);
        setErrorMessage(response.message || t('loginErrServer'));
        Alert.alert(t('error'), response.message || t('loginErrServer'));
      }
    } catch (error: any) {
      setIsLoading(false);
      setPasswordError(true);
      let msg = t('loginErrServer');
      if (error.response) msg = error.response.data?.message ?? error.response.data?.error ?? msg;
      else if (error.message) msg = error.message;
      setErrorMessage(msg);
      Alert.alert(t('error'), msg);
    }
  };

  return (
    <View style={styles.root}>
      {/* ── Fond décoratif absolu ─────────────────────────────── */}
      <DecorBackground />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior="padding" style={styles.flex}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

            {/* ── Top bar ──────────────────────────────────────── */}
            <View style={styles.topBar}>
              <View style={{ flex: 1 }} />
              <TouchableOpacity style={styles.langPill} onPress={() => setShowLangModal(true)}>
                <Text style={styles.langFlag}>{currentLang.flag}</Text>
                <Text style={styles.langLabel}>{currentLang.label}</Text>
                <Ionicons name="chevron-down" size={13} color="#1a56db" />
              </TouchableOpacity>
            </View>

            {/* ── Logo ─────────────────────────────────────────── */}
            <View style={styles.logoWrap}>
              <Image
                source={require('../../assets/MyHospitalMyHospital.png')}
                style={styles.logoImg}
                resizeMode="contain"
              />
            </View>

            {/* ── Titre ────────────────────────────────────────── */}
            <Text style={styles.title}>{t('loginWelcome')}</Text>
            <Text style={styles.subtitle}>{t('loginSubtitle')}</Text>

            {/* ── Champs ───────────────────────────────────────── */}
            <View style={[styles.inputBox, emailError && styles.inputBoxError]}>
              <Ionicons name="mail-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('loginEmailPlaceholder')}
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={text => { setEmail(text); setEmailError(false); setErrorMessage(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
              {email && validateEmail(email) && <Ionicons name="checkmark-circle" size={20} color="#1a56db" />}
            </View>

            <View style={[styles.inputBox, passwordError && styles.inputBoxError]}>
              <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('loginPasswordPlaceholder')}
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={text => { setPassword(text); setPasswordError(false); setErrorMessage(''); }}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            {errorMessage ? <Text style={styles.errorText}>* {errorMessage}</Text> : null}

            <TouchableOpacity style={styles.forgotRow} onPress={() => onNavigate('forgotPassword')} disabled={isLoading}>
              <Text style={styles.forgotText}>{t('loginForgotPassword')}</Text>
            </TouchableOpacity>

            {/* ── Bouton Connexion ─────────────────────────────── */}
            <TouchableOpacity
              style={[styles.primaryBtn, isLoading && styles.primaryBtnDisabled]}
              onPress={handleLogin} disabled={isLoading} activeOpacity={0.85}
            >
              {isLoading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.primaryBtnText}>{t('loginBtn')}</Text>
              }
            </TouchableOpacity>

            {/* ── Inscription ──────────────────────────────────── */}
            <View style={styles.switchRow}>
              <Text style={styles.switchText}>{t('loginNoAccount')} </Text>
              <TouchableOpacity onPress={() => onNavigate('signup')} disabled={isLoading}>
                <Text style={styles.switchLink}>{t('loginSignup')}</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* ── Modal succès ─────────────────────────────────────────── */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <Ionicons name="checkmark" size={44} color="#1a56db" />
            </View>
            <Text style={styles.modalTitle}>{t('loginSuccessTitle')}</Text>
            <Text style={styles.modalDesc}>{t('loginSuccessDesc1')}</Text>
            <Text style={styles.modalDesc}>{t('loginSuccessDesc2')}</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => {
              setShowSuccessModal(false);
              const target = returnTo || 'home';
              if (forwardParams && returnTo) {
                const p = { ...forwardParams }; delete p.returnTo; onNavigate(target, p);
              } else { onNavigate(target); }
            }}>
              <Text style={styles.primaryBtnText}>{returnTo ? 'Continuer' : t('loginSuccessBtn')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Modal langue ─────────────────────────────────────────── */}
      <Modal visible={showLangModal} transparent animationType="fade" onRequestClose={() => setShowLangModal(false)}>
        <TouchableOpacity style={styles.langOverlay} activeOpacity={1} onPress={() => setShowLangModal(false)}>
          <View style={styles.langSheet}>
            <View style={styles.langSheetHandle} />
            <Text style={styles.langSheetTitle}>{t('loginLangTitle')}</Text>
            {LANGUAGES.map(lang => (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langItem, language === lang.code && styles.langItemActive]}
                onPress={async () => { await setLanguage(lang.code); setShowLangModal(false); }}
              >
                <Text style={styles.langItemFlag}>{lang.flag}</Text>
                <Text style={[styles.langItemText, language === lang.code && styles.langItemTextActive]}>
                  {lang.label}
                </Text>
                {language === lang.code && <Ionicons name="checkmark-circle" size={20} color="#1a56db" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f0f6ff' },
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  flex: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 140 },

  topBar: { flexDirection: 'row', alignItems: 'center', paddingTop: 12, marginBottom: 28 },
  langPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1.5, borderColor: '#e5e7eb',
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.85)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 2,
  },
  langFlag: { fontSize: 18 },
  langLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },

  logoWrap: { marginBottom: 28 },
  logoImg: { width: 160, height: 52 },

  title: { fontSize: 30, fontWeight: '800', color: '#111827', marginBottom: 6, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 28, lineHeight: 20 },

  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#e5e7eb',
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    marginBottom: 14, backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  inputBoxError: { borderColor: '#ef4444' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#111827' },
  errorText: { color: '#ef4444', fontSize: 12, marginTop: -8, marginBottom: 10, marginLeft: 4 },

  forgotRow: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { color: '#1a56db', fontSize: 14, fontWeight: '600' },

  primaryBtn: {
    backgroundColor: '#1a3fad', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginBottom: 20,
    shadowColor: '#1a56db', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  primaryBtnDisabled: { backgroundColor: '#9ca3af', shadowOpacity: 0 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  switchRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24 },
  switchText: { fontSize: 14, color: '#6b7280' },
  switchLink: { fontSize: 14, fontWeight: '700', color: '#1a56db' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 },
  modalCard: { backgroundColor: '#fff', borderRadius: 24, padding: 32, width: '100%', alignItems: 'center' },
  modalIconWrap: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginBottom: 22 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 10, textAlign: 'center' },
  modalDesc: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20 },

  langOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
  langSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  langSheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#e5e7eb', alignSelf: 'center', marginBottom: 18 },
  langSheetTitle: { fontSize: 16, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 16 },
  langItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14, borderRadius: 12, marginBottom: 4, gap: 14 },
  langItemActive: { backgroundColor: '#eff6ff' },
  langItemFlag: { fontSize: 26 },
  langItemText: { flex: 1, fontSize: 15, color: '#374151' },
  langItemTextActive: { color: '#1a56db', fontWeight: '700' },
});

export default LoginScreen;