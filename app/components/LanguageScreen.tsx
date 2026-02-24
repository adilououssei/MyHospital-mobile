// app/screens/LanguageScreen.tsx

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

interface LanguageScreenProps {
  onNavigate: (screen: string) => void;
}

const LANGUAGES = [
  { code: 'fr', name: 'Français',  nativeName: 'Français',   flag: '🇫🇷' },
  { code: 'en', name: 'Anglais',   nativeName: 'English',    flag: '🇬🇧' },
  { code: 'es', name: 'Espagnol',  nativeName: 'Español',    flag: '🇪🇸' },
  { code: 'de', name: 'Allemand',  nativeName: 'Deutsch',    flag: '🇩🇪' },
  { code: 'ar', name: 'Arabe',     nativeName: 'العربية',    flag: '🇸🇦' },
  { code: 'zh', name: 'Chinois',   nativeName: '中文',        flag: '🇨🇳' },
];

const LanguageScreen = ({ onNavigate }: LanguageScreenProps) => {
  const { language, setLanguage, colors, t } = useApp();
  const [selected, setSelected] = useState(language);

  const handleSave = async () => {
    await setLanguage(selected);
    const lang = LANGUAGES.find(l => l.code === selected);
    Alert.alert(
      t('success'),
      `${t('languageChanged')} ${lang?.name}`,
      [{ text: 'OK', onPress: () => onNavigate('profile') }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('profile')}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('language')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { color: colors.subText }]}>
            Choisir la langue de l'application
          </Text>

          {LANGUAGES.map(lang => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageCard,
                { backgroundColor: colors.card, borderColor: selected === lang.code ? '#0077b6' : 'transparent' },
                selected === lang.code && styles.languageCardActive,
              ]}
              onPress={() => setSelected(lang.code)}
            >
              <View style={styles.languageLeft}>
                <Text style={styles.flag}>{lang.flag}</Text>
                <View>
                  <Text style={[styles.languageName, { color: colors.text }]}>{lang.name}</Text>
                  <Text style={[styles.languageNative, { color: colors.subText }]}>{lang.nativeName}</Text>
                </View>
              </View>
              <Ionicons
                name={selected === lang.code ? 'radio-button-on' : 'radio-button-off'}
                size={24}
                color={selected === lang.code ? '#0077b6' : '#ccc'}
              />
            </TouchableOpacity>
          ))}

          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color="#0077b6" />
            <Text style={[styles.infoText, { color: colors.subText }]}>
              Le changement de langue sera appliqué immédiatement à toute l'application.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bouton sauvegarder */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>{t('save')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:    { flex: 1 },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
  backButton:   { padding: 5 },
  headerTitle:  { fontSize: 18, fontWeight: '600' },
  placeholder:  { width: 34 },
  content:      { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 20 },
  languageCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 2,
  },
  languageCardActive: { backgroundColor: '#e4f4fc' },
  languageLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  flag:         { fontSize: 32 },
  languageName: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  languageNative: { fontSize: 13 },
  infoCard: {
    flexDirection: 'row', backgroundColor: '#E3F2FD',
    borderRadius: 12, padding: 15, gap: 12, marginTop: 20,
  },
  infoText:    { flex: 1, fontSize: 13, lineHeight: 20 },
  footer:      { padding: 20, paddingBottom: 30, borderTopWidth: 1 },
  saveButton:  { backgroundColor: '#0077b6', paddingVertical: 16, borderRadius: 30, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default LanguageScreen;