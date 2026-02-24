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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={t('bkTitle')} onBack={() => onNavigate('appointments')} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Step Indicator */}
            <View style={styles.stepIndicator}>
              <View style={styles.stepActive}><Text style={styles.stepTextActive}>1</Text></View>
              <View style={[styles.stepLine, { backgroundColor: '#ddd' }]} />
              <View style={[styles.stepInactive, { backgroundColor: '#e0e0e0' }]}>
                <Text style={[styles.stepTextInactive, { color: colors.subText }]}>2</Text>
              </View>
              <View style={[styles.stepLine, { backgroundColor: '#ddd' }]} />
              <View style={[styles.stepInactive, { backgroundColor: '#e0e0e0' }]}>
                <Text style={[styles.stepTextInactive, { color: colors.subText }]}>3</Text>
              </View>
            </View>

            <Text style={[styles.title, { color: colors.text }]}>{t('bkTypeTitle')}</Text>
            <Text style={[styles.subtitle, { color: colors.subText }]}>{t('bkTypeSubtitle')}</Text>

            {/* Types de consultation */}
            <View style={styles.typesGrid}>
              {consultationTypes.map(type => (
                <TouchableOpacity key={type.id}
                  style={[styles.typeCard, { backgroundColor: colors.card }, selectedType === type.id && styles.typeCardActive]}
                  onPress={() => setSelectedType(type.id)}>
                  <View style={[styles.typeIconContainer, selectedType === type.id && styles.typeIconContainerActive]}>
                    <Ionicons name={type.icon as any} size={28} color={selectedType === type.id ? '#fff' : '#0077b6'} />
                  </View>
                  <Text style={[styles.typeTitle, { color: colors.text }]}>{t(type.titleKey)}</Text>
                  <Text style={[styles.typeDescription, { color: colors.subText }]} numberOfLines={2}>{t(type.descKey)}</Text>
                  {selectedType === type.id && (
                    <View style={styles.checkmark}><Ionicons name="checkmark-circle" size={20} color="#0077b6" /></View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Description */}
            <View style={styles.descriptionContainer}>
              <Text style={[styles.label, { color: colors.text }]}>{t('bkDescLabel')}</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: '#ddd' }]}
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
        <View style={[styles.footer, { borderTopColor: '#ddd', backgroundColor: colors.background }]}>
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
  container: { flex: 1 },
  keyboardAvoidingView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 20 },
  content: { padding: 20 },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 25 },
  stepActive: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0077b6', justifyContent: 'center', alignItems: 'center' },
  stepInactive: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  stepTextActive: { color: '#fff', fontSize: 16, fontWeight: '600' },
  stepTextInactive: { fontSize: 16, fontWeight: '600' },
  stepLine: { width: 40, height: 2, marginHorizontal: 5 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 20 },
  typesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 25 },
  typeCard: { width: '48%', borderRadius: 12, padding: 15, marginBottom: 12, borderWidth: 2, borderColor: 'transparent', position: 'relative', minHeight: 140 },
  typeCardActive: { backgroundColor: '#E3F2FD', borderColor: '#0077b6' },
  typeIconContainer: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  typeIconContainerActive: { backgroundColor: '#0077b6' },
  typeTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  typeDescription: { fontSize: 11, lineHeight: 16 },
  checkmark: { position: 'absolute', top: 10, right: 10 },
  descriptionContainer: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  textArea: { borderRadius: 12, padding: 15, fontSize: 14, minHeight: 100, borderWidth: 1 },
  characterCount: { fontSize: 12, textAlign: 'right', marginTop: 5 },
  footer: { padding: 20, paddingBottom: 30, borderTopWidth: 1 },
  nextButton: { backgroundColor: '#0077b6', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 30, gap: 8 },
  nextButtonDisabled: { backgroundColor: '#ccc' },
  nextButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default BookingTypeScreen;