// app/components/BookingTypeScreen.tsx

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import ScreenHeader from '../tabs/ScreenHeader';

interface BookingTypeScreenProps {
  onNavigate: (screen: string, params?: any) => void;
}

const BookingTypeScreen = ({ onNavigate }: BookingTypeScreenProps) => {
  const { colors, t } = useApp();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [description, setDescription] = useState('');

  const consultationTypes = [
    { id: 'en_ligne', titleKey: 'bkOnline', icon: 'videocam', descKey: 'bkOnlineDesc' },
    { id: 'domicile', titleKey: 'bkHome',   icon: 'home',     descKey: 'bkHomeDesc' },
    { id: 'hopital',  titleKey: 'bkHospital', icon: 'business', descKey: 'bkHospitalDesc' },
  ];

  const handleNext = () => {
    if (!selectedType || !description.trim()) {
      alert(t('bkValidationMsg'));
      return;
    }
    onNavigate('doctorsList', { consultationType: selectedType, description });
  };

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.container}>
      <ScreenHeader title={t('bkTitle')} onBack={() => onNavigate('appointments')} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Step Indicator */}
            <View style={styles.stepIndicator}>
              <View style={styles.stepActive}><Text style={styles.stepTextActive}>1</Text></View>
              <View style={[styles.stepLine, { backgroundColor: '#e5e7eb' }]} />
              <View style={[styles.stepInactive, { backgroundColor: '#e5e7eb' }]}>
                <Text style={[styles.stepTextInactive, { color: colors.subText }]}>2</Text>
              </View>
              <View style={[styles.stepLine, { backgroundColor: '#e5e7eb' }]} />
              <View style={[styles.stepInactive, { backgroundColor: '#e5e7eb' }]}>
                <Text style={[styles.stepTextInactive, { color: colors.subText }]}>3</Text>
              </View>
            </View>

            <Text style={[styles.title, { color: colors.text }]}>{t('bkTypeTitle')}</Text>
            <Text style={[styles.subtitle, { color: colors.subText }]}>{t('bkTypeSubtitle')}</Text>

            {/* Types de consultation */}
            <View style={styles.typesGrid}>
              {consultationTypes.map(type => (
                <TouchableOpacity key={type.id}
                  style={[styles.typeCard, selectedType === type.id && styles.typeCardActive]}
                  onPress={() => setSelectedType(type.id)}>
                  <View style={[styles.typeIconContainer, selectedType === type.id && styles.typeIconContainerActive]}>
                    <Ionicons name={type.icon as any} size={28} color={selectedType === type.id ? '#fff' : '#1a56db'} />
                  </View>
                  <Text style={[styles.typeTitle, { color: colors.text }]}>{t(type.titleKey)}</Text>
                  <Text style={[styles.typeDescription, { color: colors.subText }]} numberOfLines={2}>{t(type.descKey)}</Text>
                  {selectedType === type.id && (
                    <View style={styles.checkmark}><Ionicons name="checkmark-circle" size={20} color="#1a56db" /></View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Description */}
            <View style={styles.descriptionContainer}>
              <Text style={[styles.label, { color: colors.text }]}>{t('bkDescLabel')}</Text>
              <TextInput
                style={[styles.textArea, { color: colors.text }]}
                placeholder={t('bkDescPlaceholder')}
                placeholderTextColor={colors.subText}
                value={description}
                onChangeText={setDescription}
                multiline numberOfLines={4}
                textAlignVertical="top" maxLength={500}
              />
              <Text style={[styles.characterCount, { color: colors.subText }]}>{description.length}/500</Text>
            </View>
          </View>
        </ScrollView>

        {/* Bouton Suivant */}
        <View style={[styles.footer, { borderTopColor: '#e5e7eb', backgroundColor: '#f0f4f8' }]}>
          <TouchableOpacity
            style={[styles.nextButton, (!selectedType || !description.trim()) && styles.nextButtonDisabled]}
            onPress={handleNext} disabled={!selectedType || !description.trim()}>
            <Text style={styles.nextButtonText}>{t('bkNext')}</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  keyboardAvoidingView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 20 },
  content: { padding: 20 },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 25 },
  stepActive: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a56db', justifyContent: 'center', alignItems: 'center' },
  stepInactive: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  stepTextActive: { color: '#fff', fontSize: 16, fontWeight: '600' },
  stepTextInactive: { fontSize: 16, fontWeight: '600' },
  stepLine: { width: 40, height: 2, marginHorizontal: 5 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, color: '#111827' },
  subtitle: { fontSize: 14, marginBottom: 20, color: '#6b7280' },
  typesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 25 },
  typeCard: { width: '48%', backgroundColor: '#fff', borderRadius: 16, padding: 15, marginBottom: 12, borderWidth: 2, borderColor: 'transparent', position: 'relative', minHeight: 140, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  typeCardActive: { backgroundColor: '#eff6ff', borderColor: '#1a56db' },
  typeIconContainer: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  typeIconContainerActive: { backgroundColor: '#1a56db' },
  typeTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4, color: '#374151' },
  typeDescription: { fontSize: 11, lineHeight: 16, color: '#6b7280' },
  checkmark: { position: 'absolute', top: 10, right: 10 },
  descriptionContainer: { marginBottom: 20 },
  label: { fontSize: 17, fontWeight: '700', marginBottom: 10, color: '#374151' },
  textArea: { borderRadius: 14, padding: 15, fontSize: 14, minHeight: 100, borderWidth: 1.5, borderColor: '#e5e7eb', backgroundColor: 'rgba(255,255,255,0.88)', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  characterCount: { fontSize: 12, textAlign: 'right', marginTop: 5 },
  footer: { padding: 20, paddingBottom: 30, borderTopWidth: 1 },
  nextButton: { backgroundColor: '#1a3fad', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 14, gap: 8, shadowColor: '#1a56db', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  nextButtonDisabled: { backgroundColor: '#9ca3af' },
  nextButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default BookingTypeScreen;
