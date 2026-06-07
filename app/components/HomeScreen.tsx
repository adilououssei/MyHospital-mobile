// app/components/HomeScreen.tsx - Redesign fidèle à la maquette

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Image, ActivityIndicator, Modal,
  Dimensions, FlatList, NativeScrollEvent, NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useApp, useAuth } from '../context/AppContext';
import { useNotifications } from '../context/NotificationContext';
import BottomNavigation from '../tabs/BottomNavigation';
import docteurService, { Docteur } from '../services/docteur.service';
import rendezVousService from '../services/rendezvous.service';
import StarRating from './StarRating';
import { API_BASE_URL } from '../services/api.config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HomeScreenProps {
  onNavigate: (screen: string, params?: any) => void;
}

// ─── Hero Banner (slide unique selon maquette) ────────────────────────────────
const HeroBanner = ({ onNavigate }: { onNavigate: (s: string) => void }) => (
  <TouchableOpacity
    activeOpacity={0.93}
    onPress={() => onNavigate('appointments')}
    style={styles.heroWrapper}
  >
    <LinearGradient
      colors={['#1a56db', '#1e40af']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.heroGradient}
    >
      {/* Décoration réseau/connexions */}
      <View style={styles.heroDot1} />
      <View style={styles.heroDot2} />
      <View style={styles.heroLine1} />
      <View style={styles.heroLine2} />

      {/* Contenu gauche */}
      <View style={styles.heroLeft}>
        <Text style={styles.heroTitle}>Votre santé{'\n'}à portée de main</Text>
        <Text style={styles.heroSubtitle}>
          Prenez rendez-vous et consultez les meilleurs spécialistes.
        </Text>
        <TouchableOpacity style={styles.heroBtn} onPress={() => onNavigate('appointments')}>
          <Ionicons name="calendar-outline" size={16} color="#1a56db" />
          <Text style={styles.heroBtnText}>Réserver maintenant</Text>
        </TouchableOpacity>
      </View>

      {/* Logo décoratif droite */}
      <View style={styles.heroLogoBox}>
        {/* Orbite */}
        <View style={styles.heroOrbit}>
          <View style={styles.heroOrbitDot1} />
          <View style={styles.heroOrbitDot2} />
        </View>
        <Image source={require('../../assets/icone_blanche.png')} style={styles.heroLogo} />
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

// ─── Accès rapides ────────────────────────────────────────────────────────────
const QUICK_ACCESS = [
  { icon: 'user-md',   lib: 'fa5',      label: 'Docteur',    screen: 'doctorsDirectory', color: '#1a56db', bg: '#eff6ff' },
  { icon: 'medkit',    lib: 'ionicons',  label: 'Pharmacie',  screen: 'pharmacy',          color: '#059669', bg: '#ecfdf5' },
  { icon: 'business',  lib: 'ionicons',  label: 'Hôpital',    screen: 'hospital',          color: '#1a56db', bg: '#eff6ff' },
  { icon: 'ambulance', lib: 'fa5',      label: 'Urgence',    screen: 'emergency',         color: '#dc2626', bg: '#fef2f2' },
];

const QuickAccessSection = ({ onNavigate, colors }: { onNavigate: (s: string) => void; colors: any }) => (
  <View style={[styles.qaCard, { backgroundColor: colors.card }]}>
    <Text style={[styles.qaTitle, { color: colors.text }]}>Accès rapides</Text>
    <View style={styles.qaRow}>
      {QUICK_ACCESS.map(item => (
        <TouchableOpacity
          key={item.label}
          style={styles.qaItem}
          onPress={() => onNavigate(item.screen)}
          activeOpacity={0.75}
        >
          <View style={[styles.qaIconBox, { backgroundColor: item.bg }]}>
            {item.lib === 'fa5'
              ? <FontAwesome5 name={item.icon as any} size={26} color={item.color} />
              : <Ionicons name={item.icon as any} size={26} color={item.color} />
            }
          </View>
          <Text style={[styles.qaLabel, { color: colors.text }]}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

// ─── Carte Prochain RDV (bannière bas de page dans la maquette) ───────────────
const ManageAppointmentsBanner = ({ onNavigate, colors }: { onNavigate: (s: string) => void; colors: any }) => (
  <TouchableOpacity
    style={[styles.rdvBanner, { backgroundColor: colors.card }]}
    activeOpacity={0.85}
    onPress={() => onNavigate('appointments')}
  >
    <View style={[styles.rdvBannerIconBox, { backgroundColor: '#eff6ff' }]}>
      <Ionicons name="calendar" size={28} color="#1a56db" />
    </View>
    <View style={styles.rdvBannerText}>
      <Text style={[styles.rdvBannerTitle, { color: colors.text }]}>Gérez vos rendez-vous</Text>
      <Text style={[styles.rdvBannerSub, { color: colors.subText }]}>
        Consultez, modifiez ou annulez{'\n'}vos rendez-vous en toute simplicité.
      </Text>
    </View>
    <TouchableOpacity style={styles.rdvBannerBtn} onPress={() => onNavigate('appointments')}>
      <Text style={styles.rdvBannerBtnText}>Voir mes RDV</Text>
      <Ionicons name="chevron-forward" size={14} color="#fff" />
    </TouchableOpacity>
  </TouchableOpacity>
);

// ─── Composant Carte Docteur (liste horizontale) ──────────────────────────────
const getDoctorSpecialty = (doctor: Docteur): string => docteurService.getSpecialite(doctor);

// ─── Composant principal ──────────────────────────────────────────────────────
const HomeScreen = ({ onNavigate }: HomeScreenProps) => {
  const { unreadCount } = useNotifications();
  const { colors, t, language, setLanguage } = useApp();
  const { user, isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();

  const [topDoctors, setTopDoctors] = useState<Docteur[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [errorDocs, setErrorDocs] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const firstName = user?.prenom ?? '';

  useEffect(() => { loadTopDoctors(); }, []);

  const loadTopDoctors = async () => {
    try {
      setLoadingDocs(true);
      setErrorDocs(null);
      const doctors = await docteurService.getDocteurs();
      const sorted = [...doctors].sort((a, b) => (b.note || 0) - (a.note || 0)).slice(0, 6);
      setTopDoctors(sorted);
    } catch (err) {
      setErrorDocs(t('cannotLoadDoctors'));
    } finally {
      setLoadingDocs(false);
    }
  };

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Bonjour' : greetingHour < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#f0f4f8' }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          {/* Logo */}
          <View style={styles.logoRow}>
            <Image source={require('../../assets/MyHospitalMyHospital.png')} style={styles.logoImg} />
            
          </View>

          {/* Droite : cloche + avatar */}
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => onNavigate('notifications')}
            >
              <Ionicons name="notifications-outline" size={22} color="#374151" />
              {unreadCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onNavigate('profile')}>
              <View style={styles.avatarBox}>
                {user?.photo
                  ? <Image source={{ uri: `${API_BASE_URL}${user.photo}` }} style={styles.avatarImg} />
                  : <Ionicons name="person" size={22} color="#6b7280" />
                }
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Salutation ──────────────────────────────────────────────────── */}
        <View style={styles.greetRow}>
          <Text style={styles.greetEmoji}>👋</Text>
          <Text style={styles.greetText}>
            {greeting} <Text style={styles.greetName}>{firstName || 'Bienvenue'}</Text>
          </Text>
        </View>
        <Text style={styles.greetSub}>Comment puis-je vous aider aujourd'hui ?</Text>

        {/* ── Barre de recherche ──────────────────────────────────────────── */}
        <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
          <Ionicons name="search-outline" size={20} color="#9ca3af" />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Rechercher médecin, pharmacie, hôpital..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="options-outline" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* ── Localisation ─────────────────────────────────────────────────── */}
        <TouchableOpacity style={styles.locationRow}>
          <Ionicons name="location-sharp" size={14} color="#1a56db" />
          <Text style={styles.locationText}>Lomé, Togo</Text>
          <Ionicons name="chevron-down" size={14} color="#6b7280" />
        </TouchableOpacity>

        {/* ── Hero Banner ─────────────────────────────────────────────────── */}
        <HeroBanner onNavigate={onNavigate} />

        {/* ── Accès rapides ────────────────────────────────────────────────── */}
        <QuickAccessSection onNavigate={onNavigate} colors={colors} />

        {/* ── Médecins recommandés ─────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Médecins recommandés</Text>
          </View>
          <TouchableOpacity
            style={styles.seeAllBtn}
            onPress={() => onNavigate('doctorsDirectory')}
          >
            <Text style={styles.seeAllText}>Voir tout</Text>
            <Ionicons name="chevron-forward" size={14} color="#1a56db" />
          </TouchableOpacity>
        </View>

        {loadingDocs ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="small" color="#1a56db" />
          </View>
        ) : errorDocs ? (
          <View style={styles.errorBox}>
            <Text style={{ color: colors.subText, fontSize: 13, textAlign: 'center' }}>{errorDocs}</Text>
            <TouchableOpacity onPress={loadTopDoctors} style={styles.retryBtn}>
              <Text style={styles.retryText}>{t('retryButton')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.doctorsList}
          >
            {topDoctors.map(doctor => {
              const photoUrl = doctor.photo ? `${API_BASE_URL}${doctor.photo}` : null;
              const specialty = getDoctorSpecialty(doctor);
              const docParams = {
                doctor: {
                  id: doctor.id,
                  name: doctor.nomComplet,
                  specialty,
                  rating: doctor.note || 4.5,
                  note: doctor.note || 0,
                  nombreAvis: doctor.nombreAvis || 0,
                  ville: doctor.ville,
                  photo: doctor.photo,
                  telephone: doctor.telephone,
                  email: doctor.email,
                  adresse: doctor.adresse,
                  tarifs: doctor.tarifs,
                },
              };

              return (
                <TouchableOpacity
                  key={doctor.id}
                  style={[styles.docCard, { backgroundColor: colors.card }]}
                  onPress={() => onNavigate('doctorProfile', docParams)}
                  activeOpacity={0.85}
                >
                  {/* Photo + badge disponibilité */}
                  <View style={styles.docAvatarWrap}>
                    {photoUrl
                      ? <Image source={{ uri: photoUrl }} style={styles.docAvatar} />
                      : (
                        <View style={styles.docAvatarFallback}>
                          <FontAwesome5 name="user-md" size={30} color="#1a56db" />
                        </View>
                      )
                    }
                    <View style={styles.docOnlineDot} />
                  </View>

                  {/* Infos */}
                  <Text style={[styles.docName, { color: colors.text }]} numberOfLines={2}>
                    {doctor.nomComplet}
                  </Text>
                  <Text style={[styles.docSpecialty, { color: colors.subText }]} numberOfLines={1}>
                    {specialty}
                  </Text>

                  {/* Note */}
                  <StarRating note={doctor.note || 0} nombreAvis={doctor.nombreAvis} size={10} showValue showAvisCount />

                  {/* Distance/ville */}
                  <View style={styles.docMetaRow}>
                    <Ionicons name="location-outline" size={11} color="#1a56db" />
                    <Text style={[styles.docCity, { color: colors.subText }]} numberOfLines={1}>
                      {doctor.ville || 'Non précisé'}
                    </Text>
                  </View>

                  {/* CTA */}
                  <TouchableOpacity
                    style={styles.docCta}
                    onPress={() => onNavigate('doctorProfile', docParams)}
                  >
                    <Text style={styles.docCtaText}>Prendre RDV</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* ── Bannière Gérer RDV ───────────────────────────────────────────── */}
        <ManageAppointmentsBanner onNavigate={onNavigate} colors={colors} />

        <View style={{ height: 16 }} />
      </ScrollView>

      <BottomNavigation currentScreen="home" onNavigate={onNavigate} />
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {},

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#1a56db',
    justifyContent: 'center', alignItems: 'center',
  },
  logoIconText: { fontSize: 20, color: '#fff' },
  logoImg: { width: 130, height: 44, resizeMode: 'contain' },
  logoText: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  notifBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07, shadowRadius: 4, elevation: 2,
  },
  notifBadge: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: '#ef4444', borderRadius: 8,
    minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#fff',
  },
  notifBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  avatarBox: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: 40, height: 40, borderRadius: 20 },

  // Salutation
  greetRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 20, marginTop: 16, marginBottom: 2,
  },
  greetEmoji: { fontSize: 22 },
  greetText: { fontSize: 20, fontWeight: '700', color: '#111827' },
  greetName: { fontWeight: '900', color: '#111827' },
  greetSub: { fontSize: 13, color: '#6b7280', paddingHorizontal: 20, marginBottom: 14 },

  // Search
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 14, marginBottom: 10, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  searchInput: { flex: 1, fontSize: 14 },
  filterBtn: {
    width: 34, height: 34, borderRadius: 9,
    backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center',
  },

  // Location
  locationRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 20, marginBottom: 18,
  },
  locationText: { fontSize: 13, fontWeight: '600', color: '#374151' },

  // Hero Banner
  heroWrapper: {
    marginHorizontal: 16, marginBottom: 16,
    borderRadius: 20, overflow: 'hidden',
    shadowColor: '#1a56db', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25, shadowRadius: 14, elevation: 8,
  },
  heroGradient: {
    flexDirection: 'row', alignItems: 'center',
    padding: 24, minHeight: 180, borderRadius: 20, overflow: 'hidden',
  },
  heroDot1: {
    position: 'absolute', width: 8, height: 8, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)', top: 30, right: 120,
  },
  heroDot2: {
    position: 'absolute', width: 6, height: 6, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)', bottom: 40, right: 60,
  },
  heroLine1: {
    position: 'absolute', width: 70, height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    top: 33, right: 55, transform: [{ rotate: '30deg' }],
  },
  heroLine2: {
    position: 'absolute', width: 50, height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    bottom: 42, right: 90, transform: [{ rotate: '-20deg' }],
  },
  heroLeft: { flex: 1, paddingRight: 10 },
  heroTitle: { fontSize: 20, fontWeight: '800', color: '#fff', lineHeight: 28, marginBottom: 8 },
  heroSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 18, marginBottom: 16 },
  heroBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 24, alignSelf: 'flex-start',
  },
  heroBtnText: { color: '#1a56db', fontWeight: '700', fontSize: 13 },
  heroLogoBox: { width: 110, alignItems: 'center', justifyContent: 'center' },
  heroOrbit: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)',
    position: 'absolute', justifyContent: 'center', alignItems: 'center',
  },
  heroOrbitDot1: {
    position: 'absolute', top: -4, left: 20,
    width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.5)',
  },
  heroOrbitDot2: {
    position: 'absolute', bottom: -4, right: 16,
    width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)',
  },
  heroLogoInner: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  heroLogo: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
  },
  heroLogoText: { fontSize: 34, color: '#fff' },

  // Quick access
  qaCard: {
    marginHorizontal: 16, borderRadius: 18, padding: 18,
    marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  qaTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  qaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  qaItem: { alignItems: 'center', gap: 8 },
  qaIconBox: {
    width: 62, height: 62, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  qaLabel: { fontSize: 12, fontWeight: '600', textAlign: 'center' },

  // Section header
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 14,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  seeAllText: { color: '#1a56db', fontSize: 13, fontWeight: '600' },

  // Doctor cards
  doctorsList: { paddingLeft: 16, paddingRight: 8, gap: 12 },
  docCard: {
    width: 160, borderRadius: 16, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
    marginBottom: 4,
  },
  docAvatarWrap: { alignItems: 'center', marginBottom: 10, position: 'relative' },
  docAvatar: { width: 68, height: 68, borderRadius: 34 },
  docAvatarFallback: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center',
  },
  docOnlineDot: {
    position: 'absolute', bottom: 2, right: 42,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#10b981', borderWidth: 2, borderColor: '#fff',
  },
  docName: { fontSize: 13, fontWeight: '700', lineHeight: 17, marginBottom: 2 },
  docSpecialty: { fontSize: 11, marginBottom: 6 },
  docMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 5, marginBottom: 10 },
  docCity: { fontSize: 11, flex: 1 },
  docCta: {
    backgroundColor: '#1a56db', paddingVertical: 8, borderRadius: 10, alignItems: 'center',
  },
  docCtaText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  // RDV Banner
  rdvBanner: {
    marginHorizontal: 16, marginTop: 6, marginBottom: 4,
    borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  rdvBannerIconBox: {
    width: 52, height: 52, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  rdvBannerText: { flex: 1 },
  rdvBannerTitle: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  rdvBannerSub: { fontSize: 11, lineHeight: 15 },
  rdvBannerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#1a56db', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
  },
  rdvBannerBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  // Loader / Error
  loaderBox: { paddingVertical: 30, alignItems: 'center' },
  errorBox: { alignItems: 'center', paddingHorizontal: 20, paddingVertical: 20 },
  retryBtn: {
    marginTop: 12, backgroundColor: '#1a56db',
    paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20,
  },
  retryText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});

export default HomeScreen;