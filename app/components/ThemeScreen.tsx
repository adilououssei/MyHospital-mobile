// app/screens/ThemeScreen.tsx

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Switch, Image, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

interface ThemeScreenProps {
  onNavigate: (screen: string) => void;
}

const THEME_OPTIONS = [
  { id: 'light', name: 'Mode clair',    description: 'Interface lumineuse et claire',                          icon: 'sunny'          },
  { id: 'dark',  name: 'Mode sombre',   description: 'Interface sombre pour réduire la fatigue oculaire',      icon: 'moon'           },
  { id: 'auto',  name: 'Automatique',   description: "S'adapte aux paramètres du système",                     icon: 'phone-portrait' },
] as const;

const ThemeScreen = ({ onNavigate }: ThemeScreenProps) => {
  const { theme, setTheme, colors, t } = useApp();
  const [selected, setSelected]       = useState<'light' | 'dark' | 'auto'>(theme);
  const [autoBrightness, setAutoBrightness] = useState(false);

  const handleSave = async () => {
    await setTheme(selected);
    Alert.alert(
      t('success'),
      t('themeChanged'),
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('theme')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          {/* Aperçu */}
          <View style={styles.previewSection}>
            <Text style={[styles.sectionTitle, { color: colors.subText }]}>Aperçu</Text>
            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <View style={[styles.previewLogo, { backgroundColor: '#1a56db' }]}>
                  <Ionicons name="medical" size={28} color="#fff" />
                  <Text style={styles.previewLogoText}>MyHospital</Text>
                </View>
              </View>
              <View style={styles.previewContent}>
                <View style={[styles.previewItem, { backgroundColor: colors.inputBackground }]} />
                <View style={[styles.previewItem, { backgroundColor: colors.inputBackground, width: '70%' }]} />
              </View>
            </View>
          </View>

          {/* Options de thème */}
          <Text style={[styles.sectionTitle, { color: colors.subText }]}>Choisir le thème</Text>

          {THEME_OPTIONS.map(option => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.themeCard,
                selected === option.id && styles.themeCardActive,
                selected === option.id && { borderColor: '#1a56db' },
              ]}
              onPress={() => setSelected(option.id)}
            >
              <View style={styles.themeLeft}>
                <View style={[
                  styles.themeIconContainer,
                  { backgroundColor: selected === option.id ? '#1a56db' : '#eff6ff' },
                ]}>
                  <Ionicons
                    name={option.icon as any}
                    size={24}
                    color={selected === option.id ? '#fff' : '#1a56db'}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.themeName, { color: colors.text }]}>{option.name}</Text>
                  <Text style={[styles.themeDescription, { color: colors.subText }]}>{option.description}</Text>
                </View>
              </View>
              <Ionicons
                name={selected === option.id ? 'radio-button-on' : 'radio-button-off'}
                size={24}
                color={selected === option.id ? '#1a56db' : '#9ca3af'}
              />
            </TouchableOpacity>
          ))}

          {/* Paramètres supplémentaires */}
          <View style={styles.settingsSection}>
            <Text style={[styles.sectionTitle, { color: colors.subText }]}>Paramètres supplémentaires</Text>

            <View style={styles.settingCard}>
              <View style={styles.settingLeft}>
                <Ionicons name="contrast" size={24} color="#1a56db" />
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingName, { color: colors.text }]}>Luminosité automatique</Text>
                  <Text style={[styles.settingDescription, { color: colors.subText }]}>
                    Ajuster selon l'heure de la journée
                  </Text>
                </View>
              </View>
              <Switch
                value={autoBrightness}
                onValueChange={setAutoBrightness}
                trackColor={{ false: '#e5e7eb', true: '#1a56db' }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={20} color="#1a56db" />
              <Text style={[styles.infoText, { color: colors.subText }]}>
                Le mode sombre peut aider à réduire la fatigue oculaire dans des
                environnements sombres et économiser la batterie.
              </Text>
            </View>
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
  previewSection: { marginBottom: 30 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 15 },
  previewCard:  { backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  previewHeader:{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  previewLogo:  { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  previewLogoText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  previewContent: { gap: 10 },
  previewItem:  { height: 40, borderRadius: 8, width: '100%' },
  themeCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 2, borderColor: 'transparent',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  themeCardActive:     { backgroundColor: '#eff6ff' },
  themeLeft:           { flexDirection: 'row', alignItems: 'center', gap: 15, flex: 1 },
  themeIconContainer:  { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  themeName:           { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  themeDescription:    { fontSize: 13 },
  settingsSection:     { marginTop: 20 },
  settingCard:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  settingLeft:         { flexDirection: 'row', alignItems: 'center', gap: 15, flex: 1 },
  settingInfo:         { flex: 1 },
  settingName:         { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  settingDescription:  { fontSize: 13 },
  infoCard:            { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 15, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  infoText:            { flex: 1, fontSize: 13, lineHeight: 20 },
  footer:              { padding: 20, paddingBottom: 30, borderTopWidth: 1 },
  saveButton:          { backgroundColor: '#1a3fad', paddingVertical: 16, borderRadius: 14, alignItems: 'center', shadowColor: '#1a56db', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  saveButtonText:      { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default ThemeScreen;
