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
  { code: 'de', name: 'Allemand',  nativeName: 'Deutsch',    flag: '🇩🇪' },
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
    <SafeAreaView style={styles.container}>
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
                selected === lang.code && styles.languageCardActive,
                selected === lang.code && { borderColor: '#1a56db' },
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
                color={selected === lang.code ? '#1a56db' : '#9ca3af'}
              />
            </TouchableOpacity>
          ))}

          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color="#1a56db" />
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
  container:    { flex: 1, backgroundColor: '#f0f4f8' },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
  backButton:   { padding: 5 },
  headerTitle:  { fontSize: 18, fontWeight: '600' },
  placeholder:  { width: 34 },
  content:      { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 20 },
  languageCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 2, borderColor: 'transparent',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  languageCardActive: { backgroundColor: '#eff6ff', borderColor: '#1a56db' },
  languageLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  flag:         { fontSize: 32 },
  languageName: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  languageNative: { fontSize: 13 },
  infoCard: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderRadius: 16, padding: 15, gap: 12, marginTop: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  infoText:    { flex: 1, fontSize: 13, lineHeight: 20 },
  footer:      { padding: 20, paddingBottom: 30, borderTopWidth: 1 },
  saveButton:  { backgroundColor: '#1a3fad', paddingVertical: 16, borderRadius: 14, alignItems: 'center', shadowColor: '#1a56db', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default LanguageScreen;
