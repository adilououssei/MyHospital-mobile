// app/components/HomeScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Image, ActivityIndicator, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useApp } from '../context/AppContext';
import BottomNavigation from '../tabs/BottomNavigation';
import docteurService, { Docteur } from '../services/docteur.service';
import { API_BASE_URL } from '../services/api.config';

interface HomeScreenProps {
  onNavigate: (screen: string, params?: any) => void;
  unreadCount?: number;
}

const LANGUAGES = [
  { code: 'fr', flag: '🇫🇷', label: 'FR' },
  { code: 'en', flag: '🇬🇧', label: 'EN' },
  { code: 'es', flag: '🇪🇸', label: 'ES' },
  { code: 'de', flag: '🇩🇪', label: 'DE' },
  { code: 'ar', flag: '🇸🇦', label: 'AR' },
  { code: 'zh', flag: '🇨🇳', label: 'ZH' },
];

const HomeScreen = ({ onNavigate, unreadCount = 0 }: HomeScreenProps) => {
  const { colors, t, language, setLanguage } = useApp();

  const [topDoctors, setTopDoctors]       = useState<Docteur[]>([]);
  const [loadingDocs, setLoadingDocs]     = useState(true);
  const [errorDocs, setErrorDocs]         = useState<string | null>(null);
  const [showLangModal, setShowLangModal] = useState(false);

  const currentLang = LANGUAGES.find(l => l.code === language) ?? LANGUAGES[0];

  useEffect(() => { loadTopDoctors(); }, []);

  const loadTopDoctors = async () => {
    try {
      setLoadingDocs(true);
      setErrorDocs(null);
      const doctors = await docteurService.getDocteurs();
      const sorted  = [...doctors].sort((a, b) => b.note - a.note).slice(0, 3);
      setTopDoctors(sorted);
    } catch (err: any) {
      setErrorDocs(t('cannotLoadDoctors'));
    } finally {
      setLoadingDocs(false);
    }
  };

  // ── Bouton service ──────────────────────────────────────────
  const ServiceButton = ({ icon, labelKey, screen }: { icon: string; labelKey: string; screen?: string }) => (
    <TouchableOpacity style={styles.serviceButton} onPress={() => screen && onNavigate(screen)}>
      <View style={styles.serviceIconContainer}>
        {labelKey === 'doctor' ? (
          <FontAwesome5 name="user-md" size={28} color="#0077b6" />
        ) : labelKey === 'ambulance' ? (
          <FontAwesome5 name="ambulance" size={28} color="#0077b6" />
        ) : (
          <Ionicons name={icon as any} size={28} color="#0077b6" />
        )}
      </View>
      <Text style={[styles.serviceLabel, { color: colors.subText }]}>{t(labelKey)}</Text>
    </TouchableOpacity>
  );

  // ── Carte docteur ───────────────────────────────────────────
  const DoctorCard = ({ doctor }: { doctor: Docteur }) => {
    const photoUrl = doctor.photo ? `${API_BASE_URL}${doctor.photo}` : null;
    const prix     = docteurService.getPrixMin(doctor);
    return (
      <TouchableOpacity
        style={[styles.doctorCard, { backgroundColor: colors.card }]}
        onPress={() => onNavigate('doctorDetail', {
          doctor: {
            id: doctor.id, name: doctor.nomComplet, specialty: doctor.specialite,
            rating: doctor.note, ville: doctor.ville, price: prix,
            photo: doctor.photo, telephone: doctor.telephone,
            email: doctor.email, adresse: doctor.adresse,
          },
        })}
      >
        <View style={styles.doctorImageContainer}>
          {photoUrl
            ? <Image source={{ uri: photoUrl }} style={styles.doctorImage} />
            : <View style={styles.doctorImagePlaceholder}><FontAwesome5 name="user-md" size={36} color="#0077b6" /></View>
          }
        </View>
        <Text style={[styles.doctorName, { color: colors.text }]} numberOfLines={1}>{doctor.nomComplet}</Text>
        <Text style={[styles.doctorSpecialty, { color: colors.subText }]} numberOfLines={1}>
          {doctor.specialite ?? 'Généraliste'}
        </Text>
        <View style={styles.doctorInfo}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={13} color="#FFC107" />
            <Text style={[styles.ratingText, { color: colors.text }]}>{doctor.note.toFixed(1)}</Text>
          </View>
          <View style={styles.distanceContainer}>
            <Ionicons name="location-outline" size={13} color={colors.subText} />
            <Text style={[styles.distanceText, { color: colors.subText }]} numberOfLines={1}>{doctor.ville}</Text>
          </View>
        </View>
        {prix > 0 && <Text style={styles.prixText}>{prix.toLocaleString()} FCFA</Text>}
      </TouchableOpacity>
    );
  };

  // ── Section docteurs ────────────────────────────────────────
  const renderDoctorsSection = () => {
    if (loadingDocs) return (
      <View style={styles.docsLoadingContainer}>
        <ActivityIndicator size="small" color="#0077b6" />
        <Text style={[styles.docsLoadingText, { color: colors.subText }]}>{t('loadingDoctors')}</Text>
      </View>
    );
    if (errorDocs) return (
      <View style={styles.docsErrorContainer}>
        <Text style={[styles.docsErrorText, { color: colors.subText }]}>{errorDocs}</Text>
        <TouchableOpacity onPress={loadTopDoctors} style={styles.retryButton}>
          <Text style={styles.retryText}>{t('retryButton')}</Text>
        </TouchableOpacity>
      </View>
    );
    if (topDoctors.length === 0) return (
      <View style={styles.docsEmptyContainer}>
        <Text style={[styles.docsEmptyText, { color: colors.subText }]}>{t('noDoctors')}</Text>
      </View>
    );
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={styles.doctorsScroll} contentContainerStyle={styles.doctorsScrollContent}>
        {topDoctors.map(doctor => <DoctorCard key={doctor.id} doctor={doctor} />)}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── Header avec sélecteur de langue ── */}
        <View style={styles.header}>
          <Image source={require('../../assets/MyHospital1.png')} style={{ width: 160, height: 50 }} />

          <View style={styles.headerRight}>
            {/* 🌐 Sélecteur langue */}
            <TouchableOpacity style={[styles.langButton, { backgroundColor: colors.card }]} onPress={() => setShowLangModal(true)}>
              <Text style={styles.langFlag}>{currentLang.flag}</Text>
              <Text style={[styles.langLabel, { color: colors.text }]}>{currentLang.label}</Text>
              <Ionicons name="chevron-down" size={12} color="#0077b6" />
            </TouchableOpacity>

            {/* 🔔 Notifications */}
            <TouchableOpacity style={styles.notificationButton} onPress={() => onNavigate('notifications')}>
              <Ionicons name="notifications-outline" size={24} color={colors.text} />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Recherche */}
        <View style={[styles.searchContainer, { backgroundColor: colors.inputBackground }]}>
          <Ionicons name="search-outline" size={20} color={colors.subText} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={t('searchPlaceholder')}
            placeholderTextColor={colors.subText}
          />
        </View>

        {/* Services */}
        <View style={styles.servicesContainer}>
          <ServiceButton icon="medical-outline"  labelKey="doctor"    screen="doctorsList" />
          <ServiceButton icon="medkit-outline"   labelKey="pharmacy"  screen="pharmacy" />
          <ServiceButton icon="business-outline" labelKey="hospital"  screen="hospital" />
          <ServiceButton icon="car-outline"      labelKey="ambulance" screen="emergency" />
        </View>

        {/* Bannière */}
        <LinearGradient colors={['#e4f4fcff', '#0077b6']} style={styles.banner}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>{t('bannerTitle1')}</Text>
            <Text style={styles.bannerTitle}>{t('bannerTitle2')}</Text>
            <TouchableOpacity style={styles.bannerButton} onPress={() => onNavigate('healthInfo')}>
              <Text style={styles.bannerButtonText}>{t('learnMore')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.bannerImageContainer}>
            <Image source={require('../../assets/doctor2.png')} style={{ width: 120, height: 140 }} />
          </View>
        </LinearGradient>

        {/* Meilleurs docteurs */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('bestDoctors')}</Text>
          <TouchableOpacity onPress={() => onNavigate('doctorsList')}>
            <Text style={styles.seeAllText}>{t('seeAll')}</Text>
          </TouchableOpacity>
        </View>

        {renderDoctorsSection()}
      </ScrollView>

      <BottomNavigation currentScreen="home" onNavigate={onNavigate} unreadCount={unreadCount} />

      {/* ── Modal sélection langue ── */}
      <Modal visible={showLangModal} transparent animationType="slide" onRequestClose={() => setShowLangModal(false)}>
        <TouchableOpacity style={styles.langModalOverlay} activeOpacity={1} onPress={() => setShowLangModal(false)}>
          <View style={[styles.langModalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.langModalTitle, { color: colors.text }]}>🌐 {t('language')}</Text>
            {LANGUAGES.map(lang => (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langModalItem, language === lang.code && styles.langModalItemActive]}
                onPress={async () => {
                  await setLanguage(lang.code);
                  setShowLangModal(false);
                }}
              >
                <Text style={styles.langModalFlag}>{lang.flag}</Text>
                <Text style={[styles.langModalItemText, { color: colors.text }, language === lang.code && { color: '#0077b6', fontWeight: '700' }]}>
                  {lang.label}
                </Text>
                {language === lang.code && <Ionicons name="checkmark-circle" size={20} color="#0077b6" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:    { flex: 1 },
  scrollContent:{ paddingBottom: 90 },

  // Header
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  headerRight:  { flexDirection: 'row', alignItems: 'center', gap: 10 },

  // Bouton langue
  langButton:   { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#0077b620' },
  langFlag:     { fontSize: 16 },
  langLabel:    { fontSize: 12, fontWeight: '700' },

  // Notifications
  notificationButton:    { padding: 6, position: 'relative' },
  notificationBadge:     { position: 'absolute', top: 2, right: 2, backgroundColor: '#FF6B6B', borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4, borderWidth: 2, borderColor: '#fff' },
  notificationBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  searchContainer:       { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, paddingHorizontal: 15, paddingVertical: 12, borderRadius: 12, marginBottom: 20 },
  searchInput:           { flex: 1, marginLeft: 10, fontSize: 14 },
  servicesContainer:     { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20, marginBottom: 20 },
  serviceButton:         { alignItems: 'center' },
  serviceIconContainer:  { width: 60, height: 60, backgroundColor: '#e4f4fcff', borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  serviceLabel:          { fontSize: 12 },
  banner:                { marginHorizontal: 20, borderRadius: 20, padding: 20, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  bannerContent:         { flex: 1 },
  bannerTitle:           { fontSize: 16, fontWeight: '600', color: '#000', marginBottom: 2 },
  bannerButton:          { backgroundColor: '#0077b6', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, alignSelf: 'flex-start', marginTop: 15 },
  bannerButtonText:      { color: '#fff', fontSize: 13, fontWeight: '600' },
  bannerImageContainer:  { justifyContent: 'center', alignItems: 'center' },
  sectionHeader:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  sectionTitle:          { fontSize: 18, fontWeight: 'bold' },
  seeAllText:            { fontSize: 14, color: '#0077b6', fontWeight: '500' },
  doctorsScroll:         { paddingLeft: 20 },
  doctorsScrollContent:  { paddingRight: 20, paddingBottom: 10 },
  doctorCard:            { borderRadius: 15, padding: 15, marginRight: 15, width: 145, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  doctorImageContainer:  { alignItems: 'center', marginBottom: 10 },
  doctorImage:           { width: 80, height: 80, borderRadius: 40 },
  doctorImagePlaceholder:{ width: 80, height: 80, backgroundColor: '#e4f4fcff', borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  doctorName:            { fontSize: 13, fontWeight: '600', marginBottom: 3 },
  doctorSpecialty:       { fontSize: 11, marginBottom: 8 },
  doctorInfo:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  ratingContainer:       { flexDirection: 'row', alignItems: 'center' },
  ratingText:            { fontSize: 12, fontWeight: '600', marginLeft: 3 },
  distanceContainer:     { flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: 6 },
  distanceText:          { fontSize: 11, marginLeft: 2 },
  prixText:              { fontSize: 12, fontWeight: '700', color: '#0077b6', marginTop: 4 },
  docsLoadingContainer:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 30, gap: 10 },
  docsLoadingText:       { fontSize: 14 },
  docsErrorContainer:    { alignItems: 'center', paddingHorizontal: 20, paddingVertical: 20 },
  docsErrorText:         { fontSize: 14, textAlign: 'center', marginBottom: 12 },
  retryButton:           { backgroundColor: '#0077b6', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  retryText:             { color: '#fff', fontSize: 13, fontWeight: '600' },
  docsEmptyContainer:    { alignItems: 'center', paddingHorizontal: 20, paddingVertical: 30 },
  docsEmptyText:         { fontSize: 14, textAlign: 'center' },

  // Modal langue
  langModalOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  langModalContent:    { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  langModalTitle:      { fontSize: 16, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  langModalItem:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, marginBottom: 4, gap: 14 },
  langModalItemActive: { backgroundColor: '#e4f4fc' },
  langModalFlag:       { fontSize: 26 },
  langModalItemText:   { flex: 1, fontSize: 15 },
});

export default HomeScreen;