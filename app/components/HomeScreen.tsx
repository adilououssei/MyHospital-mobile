// app/components/HomeScreen.tsx - Version corrigée (sans prix et voir plus vers annuaire)

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Image, ActivityIndicator, Modal,
  Dimensions, FlatList, NativeScrollEvent, NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useApp, useAuth } from '../context/AppContext';
import BottomNavigation from '../tabs/BottomNavigation';
import docteurService, { Docteur } from '../services/docteur.service';
import rendezVousService from '../services/rendezvous.service';
import { API_BASE_URL } from '../services/api.config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

// ─── Slides du carousel ───────────────────────────────────────────────────────
const BANNER_SLIDES = [
  {
    id: '1',
    title: 'Protection précoce pour votre famille',
    subtitle: 'Consultez les meilleurs spécialistes depuis chez vous',
    btnLabel: 'En savoir plus',
    screen: 'healthInfo',
    gradient: ['#0077b6', '#023e8a'] as [string, string],
    icon: 'shield-checkmark',
    image: require('../../assets/doctor21.png'),
  },
  {
    id: '2',
    title: 'Pharmacies de garde 24h/7j',
    subtitle: 'Trouvez rapidement une pharmacie ouverte près de vous',
    btnLabel: 'Voir les pharmacies',
    screen: 'pharmacy',
    gradient: ['#0096c7', '#0077b6'] as [string, string],
    icon: 'medkit',
    image: null,
  },
  {
    id: '3',
    title: 'Urgence médicale ?',
    subtitle: 'Accès rapide aux services d\'urgence et ambulances',
    btnLabel: 'Appeler maintenant',
    screen: 'emergency',
    gradient: ['#e63946', '#c1121f'] as [string, string],
    icon: 'pulse',
    image: null,
  },
];

// ─── Composant Carousel ───────────────────────────────────────────────────────
const BannerCarousel = ({ onNavigate }: { onNavigate: (s: string) => void }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActiveIndex(prev => {
        const next = (prev + 1) % BANNER_SLIDES.length;
        flatRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 40));
    if (idx !== activeIndex) setActiveIndex(idx);
  };

  return (
    <View style={styles.carouselWrapper}>
      <FlatList
        ref={flatRef}
        data={BANNER_SLIDES}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={SCREEN_WIDTH - 40}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onNavigate(item.screen)}
            style={styles.slide}
          >
            <LinearGradient
              colors={item.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.slideGradient}
            >
              <View style={styles.slideBubble1} />
              <View style={styles.slideBubble2} />

              <View style={styles.slideContent}>
                <View style={styles.slideLeft}>
                  <View style={styles.slideBadge}>
                    <Ionicons name={item.icon as any} size={14} color="#fff" />
                    <Text style={styles.slideBadgeText}>MyHospital</Text>
                  </View>
                  <Text style={styles.slideTitle}>{item.title}</Text>
                  <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
                  <View style={styles.slideBtn}>
                    <Text style={styles.slideBtnText}>{item.btnLabel}</Text>
                    <Ionicons name="arrow-forward" size={12} color="#0077b6" />
                  </View>
                </View>

                {item.image ? (
                  <Image source={item.image} style={styles.slideImage} resizeMode="contain" />
                ) : (
                  <View style={styles.slideIconBox}>
                    <Ionicons name={item.icon as any} size={52} color="rgba(255,255,255,0.25)" />
                  </View>
                )}
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}
      />

      <View style={styles.dotsRow}>
        {BANNER_SLIDES.map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => {
              flatRef.current?.scrollToIndex({ index: i, animated: true });
              setActiveIndex(i);
            }}
          >
            <View style={[styles.dot, i === activeIndex && styles.dotActive]} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// ─── Composant Carte Prochain RDV ─────────────────────────────────────────────
const NextAppointmentCard = ({
  onNavigate,
  colors,
  t,
}: {
  onNavigate: (s: string) => void;
  colors: any;
  t: (k: string) => string;
}) => {
  const [nextRdv, setNextRdv] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const rdvs = await rendezVousService.getMesRendezVous();
        const now = new Date();
        const upcoming = rdvs
          .filter(r => ['pending', 'accepted', 'confirmed'].includes(r.statut))
          .filter(r => new Date(r.dateRendezVous) > now)
          .sort((a, b) => new Date(a.dateRendezVous).getTime() - new Date(b.dateRendezVous).getTime());
        if (upcoming.length > 0) setNextRdv(upcoming[0]);
      } catch { /* silencieux */ }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return null;
  if (!nextRdv) return null;

  const rdvDate = new Date(nextRdv.dateRendezVous);
  const day = rdvDate.getDate().toString().padStart(2, '0');
  const month = rdvDate.toLocaleDateString('fr-FR', { month: 'short' });
  const time = `${rdvDate.getHours().toString().padStart(2, '0')}:${rdvDate.getMinutes().toString().padStart(2, '0')}`;

  const typeIcon = nextRdv.typeConsultation === 'en_ligne'
    ? 'videocam'
    : nextRdv.typeConsultation === 'domicile'
    ? 'home'
    : 'business';

  const typeLabel = nextRdv.typeConsultation === 'en_ligne'
    ? 'En ligne'
    : nextRdv.typeConsultation === 'domicile'
    ? 'À domicile'
    : 'À l\'hôpital';

  return (
    <TouchableOpacity
      style={styles.rdvCardWrapper}
      activeOpacity={0.85}
      onPress={() => onNavigate('appointments')}
    >
      <LinearGradient
        colors={['#e8f4fd', '#dceefb']}
        style={styles.rdvCard}
      >
        <View style={styles.rdvAccent} />
        <View style={styles.rdvDateBox}>
          <Text style={styles.rdvDay}>{day}</Text>
          <Text style={styles.rdvMonth}>{month.toUpperCase()}</Text>
        </View>
        <View style={styles.rdvDivider} />
        <View style={styles.rdvInfo}>
          <View style={styles.rdvLabelRow}>
            <Ionicons name="calendar" size={12} color="#0077b6" />
            <Text style={styles.rdvLabel}>Prochain rendez-vous</Text>
          </View>
          <Text style={styles.rdvDoctor} numberOfLines={1}>
            Dr. {nextRdv.docteurPrenom} {nextRdv.docteurNom}
          </Text>
          <View style={styles.rdvMetaRow}>
            <View style={styles.rdvMeta}>
              <Ionicons name="time-outline" size={12} color="#666" />
              <Text style={styles.rdvMetaText}>{time}</Text>
            </View>
            <View style={styles.rdvMeta}>
              <Ionicons name={typeIcon as any} size={12} color="#666" />
              <Text style={styles.rdvMetaText}>{typeLabel}</Text>
            </View>
          </View>
        </View>
        <View style={styles.rdvArrow}>
          <Ionicons name="chevron-forward" size={20} color="#0077b6" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// ─── Fonction pour obtenir la spécialité du docteur ──────────────────────────
const getDoctorSpecialty = (doctor: Docteur): string => {
  return docteurService.getSpecialite(doctor);
};

// ─── Composant principal ──────────────────────────────────────────────────────
const HomeScreen = ({ onNavigate, unreadCount = 0 }: HomeScreenProps) => {
  const { colors, t, language, setLanguage } = useApp();
  const { user } = useAuth();

  const [topDoctors, setTopDoctors] = useState<Docteur[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [errorDocs, setErrorDocs] = useState<string | null>(null);
  const [showLangModal, setShowLangModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentLang = LANGUAGES.find(l => l.code === language) ?? LANGUAGES[0];
  const firstName = user?.prenom ?? '';

  useEffect(() => { loadTopDoctors(); }, []);

  const loadTopDoctors = async () => {
    try {
      setLoadingDocs(true);
      setErrorDocs(null);
      const doctors = await docteurService.getDocteurs();
      const sorted = [...doctors].sort((a, b) => (b.note || 0) - (a.note || 0)).slice(0, 5);
      setTopDoctors(sorted);
    } catch (err) {
      console.error('Erreur:', err);
      setErrorDocs(t('cannotLoadDoctors'));
    } finally {
      setLoadingDocs(false);
    }
  };

  const SERVICES = [
    { icon: 'user-md',   lib: 'fa5',     label: t('doctor'),   screen: 'doctorsDirectory', color: '#0077b6', bg: '#e8f4fd' },
    { icon: 'medkit',    lib: 'ionicons', label: t('pharmacy'), screen: 'pharmacy',    color: '#0096c7', bg: '#e0f4fb' },
    { icon: 'business',  lib: 'ionicons', label: t('hospital'), screen: 'hospital',    color: '#023e8a', bg: '#dde8f8' },
    { icon: 'ambulance', lib: 'fa5',     label: t('ambulance'),screen: 'emergency',   color: '#e63946', bg: '#fdecea' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.subText }]}>
              {new Date().getHours() < 12 ? 'Bonjour' : new Date().getHours() < 18 ? 'Bon après-midi' : 'Bonsoir'} 👋
            </Text>
            <Text style={[styles.userName, { color: colors.text }]}>
              {firstName ? firstName : 'Bienvenue !'}
            </Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[styles.langPill, { backgroundColor: colors.card }]}
              onPress={() => setShowLangModal(true)}
            >
              <Text style={styles.langFlag}>{currentLang.flag}</Text>
              <Ionicons name="chevron-down" size={11} color="#0077b6" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.notifBtn, { backgroundColor: colors.card }]}
              onPress={() => onNavigate('notifications')}
            >
              <Ionicons name="notifications-outline" size={22} color={colors.text} />
              {unreadCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Barre de recherche */}
        <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
          <Ionicons name="search-outline" size={20} color="#0077b6" />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={t('searchPlaceholder')}
            placeholderTextColor={colors.subText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.searchFilter}>
            <Ionicons name="options-outline" size={20} color="#0077b6" />
          </TouchableOpacity>
        </View>

        {/* Prochain RDV */}
        <NextAppointmentCard onNavigate={onNavigate} colors={colors} t={t} />

        {/* Services */}
        <View style={styles.servicesGrid}>
          {SERVICES.map(s => (
            <TouchableOpacity
              key={s.label}
              style={[styles.serviceCard, { backgroundColor: colors.card }]}
              onPress={() => onNavigate(s.screen)}
              activeOpacity={0.8}
            >
              <View style={[styles.serviceIconBox, { backgroundColor: s.bg }]}>
                {s.lib === 'fa5'
                  ? <FontAwesome5 name={s.icon as any} size={24} color={s.color} />
                  : <Ionicons name={s.icon as any} size={24} color={s.color} />
                }
              </View>
              <Text style={[styles.serviceLabel, { color: colors.text }]} numberOfLines={1}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Carousel bannières */}
        <BannerCarousel onNavigate={onNavigate} />

        {/* Meilleurs docteurs */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('bestDoctors')}</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.subText }]}>Recommandés pour vous</Text>
          </View>
          <TouchableOpacity
            style={styles.seeAllBtn}
            onPress={() => onNavigate('doctorsDirectory')}  // ← Changé vers annuaire
          >
            <Text style={styles.seeAllText}>{t('seeAll')}</Text>
            <Ionicons name="arrow-forward" size={14} color="#0077b6" />
          </TouchableOpacity>
        </View>

        {/* Doctors list - Sans prix */}
        {loadingDocs ? (
          <View style={styles.docsLoading}>
            <ActivityIndicator size="small" color="#0077b6" />
            <Text style={[styles.docsLoadingText, { color: colors.subText }]}>{t('loadingDoctors')}</Text>
          </View>
        ) : errorDocs ? (
          <View style={styles.docsError}>
            <Text style={[{ color: colors.subText, fontSize: 13, textAlign: 'center' }]}>{errorDocs}</Text>
            <TouchableOpacity onPress={loadTopDoctors} style={styles.retryBtn}>
              <Text style={styles.retryText}>{t('retryButton')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.doctorsScroll}
          >
            {topDoctors.map(doctor => {
              const photoUrl = doctor.photo ? `${API_BASE_URL}${doctor.photo}` : null;
              const specialty = getDoctorSpecialty(doctor);
              
              return (
                <TouchableOpacity
                  key={doctor.id}
                  style={[styles.doctorCard, { backgroundColor: colors.card }]}
                  onPress={() => onNavigate('doctorProfile', {
                    doctor: {
                      id: doctor.id,
                      name: doctor.nomComplet,
                      specialty: specialty,
                      rating: doctor.note || 4.5,
                      ville: doctor.ville,
                      photo: doctor.photo,
                      telephone: doctor.telephone,
                      email: doctor.email,
                      adresse: doctor.adresse,
                      tarifs: doctor.tarifs,
                    },
                  })}
                  activeOpacity={0.85}
                >
                  {/* Badge spécialité */}
                  <View style={styles.doctorBadge}>
                    <Text style={styles.doctorBadgeText} numberOfLines={1}>
                      {specialty}
                    </Text>
                  </View>

                  {/* Photo */}
                  <View style={styles.doctorAvatarWrap}>
                    {photoUrl
                      ? <Image source={{ uri: photoUrl }} style={styles.doctorAvatar} />
                      : (
                        <View style={[styles.doctorAvatarFallback]}>
                          <FontAwesome5 name="user-md" size={34} color="#0077b6" />
                        </View>
                      )
                    }
                  </View>

                  <Text style={[styles.doctorName, { color: colors.text }]} numberOfLines={2}>
                    {doctor.nomComplet}
                  </Text>

                  {/* Rating (étoiles) */}
                  <View style={styles.ratingRow}>
                    {[1,2,3,4,5].map(i => (
                      <Ionicons
                        key={i}
                        name={i <= Math.round(doctor.note || 4.5) ? 'star' : 'star-outline'}
                        size={10}
                        color="#FFC107"
                      />
                    ))}
                    <Text style={styles.ratingNum}>{(doctor.note || 4.5).toFixed(1)}</Text>
                  </View>

                  {/* Localisation seulement (prix enlevé) */}
                  <View style={styles.doctorMeta}>
                    <View style={styles.doctorMetaRow}>
                      <Ionicons name="location-outline" size={11} color="#0077b6" />
                      <Text style={[styles.doctorCity, { color: colors.subText }]} numberOfLines={1}>
                        {doctor.ville || 'Adresse non précisée'}
                      </Text>
                    </View>
                  </View>

                  {/* Bouton Voir détails (pas Consulter) */}
                  <TouchableOpacity
                    style={styles.doctorBookBtn}
                    onPress={() => onNavigate('doctorProfile', {
                      doctor: {
                        id: doctor.id,
                        name: doctor.nomComplet,
                        specialty: specialty,
                        rating: doctor.note || 4.5,
                        ville: doctor.ville,
                        photo: doctor.photo,
                        telephone: doctor.telephone,
                        email: doctor.email,
                        adresse: doctor.adresse,
                        tarifs: doctor.tarifs,
                      },
                    })}
                  >
                    <Text style={styles.doctorBookBtnText}>Voir détails</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      <BottomNavigation currentScreen="home" onNavigate={onNavigate} unreadCount={unreadCount} />

      {/* Modal langue */}
      <Modal
        visible={showLangModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLangModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLangModal(false)}
        >
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>🌐 {t('language')}</Text>
            {LANGUAGES.map(lang => (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langItem, language === lang.code && styles.langItemActive]}
                onPress={async () => { await setLanguage(lang.code); setShowLangModal(false); }}
              >
                <Text style={styles.langItemFlag}>{lang.flag}</Text>
                <Text style={[styles.langItemText, { color: colors.text }, language === lang.code && styles.langItemTextActive]}>
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

// Styles (inchangés, garder les mêmes)
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', paddingHorizontal: 20,
    paddingTop: 12, paddingBottom: 20,
  },
  greeting: { fontSize: 13, marginBottom: 2 },
  userName: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 4 },
  langPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 2,
  },
  langFlag: { fontSize: 17 },
  notifBtn: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center', position: 'relative',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 2,
  },
  notifBadge: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: '#FF6B6B', borderRadius: 8,
    minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#fff',
  },
  notifBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },

  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, paddingHorizontal: 16, paddingVertical: 13,
    borderRadius: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 14 },
  searchFilter: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#e8f4fd', justifyContent: 'center', alignItems: 'center',
  },

  rdvCardWrapper: { marginHorizontal: 20, marginBottom: 20 },
  rdvCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 16, overflow: 'hidden',
    shadowColor: '#0077b6', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
  },
  rdvAccent: { width: 5, height: '100%', backgroundColor: '#0077b6', position: 'absolute', left: 0 },
  rdvDateBox: {
    paddingLeft: 22, paddingRight: 12, paddingVertical: 16,
    alignItems: 'center',
  },
  rdvDay: { fontSize: 28, fontWeight: '800', color: '#0077b6', lineHeight: 30 },
  rdvMonth: { fontSize: 11, fontWeight: '700', color: '#0077b6', letterSpacing: 1 },
  rdvDivider: { width: 1, height: 44, backgroundColor: '#b8d8ee', marginRight: 12 },
  rdvInfo: { flex: 1, paddingVertical: 14 },
  rdvLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 },
  rdvLabel: { fontSize: 11, color: '#0077b6', fontWeight: '600', letterSpacing: 0.3 },
  rdvDoctor: { fontSize: 15, fontWeight: '700', color: '#1a1a2e', marginBottom: 5 },
  rdvMetaRow: { flexDirection: 'row', gap: 14 },
  rdvMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rdvMetaText: { fontSize: 12, color: '#555' },
  rdvArrow: { paddingHorizontal: 14 },

  servicesGrid: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 20, marginBottom: 20, gap: 10,
  },
  serviceCard: {
    flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 5, elevation: 2,
  },
  serviceIconBox: {
    width: 50, height: 50, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  serviceLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },

  carouselWrapper: { marginBottom: 24 },
  slide: {
    width: SCREEN_WIDTH - 40,
    marginHorizontal: 20,
    borderRadius: 20, overflow: 'hidden',
    shadowColor: '#0077b6', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 10, elevation: 6,
  },
  slideGradient: { borderRadius: 20, padding: 20, minHeight: 160 },
  slideBubble1: {
    position: 'absolute', right: -30, top: -30,
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  slideBubble2: {
    position: 'absolute', right: 40, bottom: -40,
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  slideContent: { flexDirection: 'row', alignItems: 'center' },
  slideLeft: { flex: 1 },
  slideBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 10,
  },
  slideBadgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  slideTitle: { fontSize: 16, fontWeight: '800', color: '#fff', lineHeight: 22, marginBottom: 6 },
  slideSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 17, marginBottom: 14 },
  slideBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, alignSelf: 'flex-start',
  },
  slideBtnText: { color: '#0077b6', fontSize: 12, fontWeight: '700' },
  slideImage: { width: 100, height: 130, marginLeft: 10 },
  slideIconBox: {
    width: 90, height: 90, justifyContent: 'center',
    alignItems: 'center', marginLeft: 10,
  },
  dotsRow: {
    flexDirection: 'row', justifyContent: 'center',
    gap: 6, marginTop: 12,
  },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#c5dff4',
  },
  dotActive: {
    width: 20, height: 6, borderRadius: 3,
    backgroundColor: '#0077b6',
  },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-end', paddingHorizontal: 20, marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.2 },
  sectionSubtitle: { fontSize: 12, marginTop: 2 },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  seeAllText: { color: '#0077b6', fontSize: 13, fontWeight: '600' },

  doctorsScroll: { paddingLeft: 20, paddingRight: 10, gap: 12 },
  doctorCard: {
    width: 155, borderRadius: 18, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  doctorBadge: {
    backgroundColor: '#e8f4fd', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8, alignSelf: 'flex-start', marginBottom: 10,
  },
  doctorBadgeText: { color: '#0077b6', fontSize: 10, fontWeight: '600' },
  doctorAvatarWrap: { alignItems: 'center', marginBottom: 10 },
  doctorAvatar: { width: 72, height: 72, borderRadius: 36 },
  doctorAvatarFallback: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#e8f4fd', justifyContent: 'center', alignItems: 'center',
  },
  doctorName: { fontSize: 13, fontWeight: '700', marginBottom: 6, lineHeight: 18 },
  ratingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 8,
  },
  ratingNum: { fontSize: 11, color: '#888', marginLeft: 3, fontWeight: '600' },
  doctorMeta: {
    flexDirection: 'row', justifyContent: 'flex-start',
    alignItems: 'center', marginBottom: 10,
  },
  doctorMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  doctorCity: { fontSize: 11, flex: 1, color: '#666' },
  doctorBookBtn: {
    backgroundColor: '#0077b6', paddingVertical: 8, borderRadius: 10,
    alignItems: 'center',
  },
  doctorBookBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  docsLoading: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 30, paddingHorizontal: 20, gap: 10,
  },
  docsLoadingText: { fontSize: 14 },
  docsError: { alignItems: 'center', paddingHorizontal: 20, paddingVertical: 20 },
  retryBtn: {
    marginTop: 12, backgroundColor: '#0077b6',
    paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20,
  },
  retryText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 40,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#ddd', alignSelf: 'center', marginBottom: 16,
  },
  modalTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  langItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 13, paddingHorizontal: 14, borderRadius: 12, marginBottom: 4, gap: 14,
  },
  langItemActive: { backgroundColor: '#e8f4fd' },
  langItemFlag: { fontSize: 26 },
  langItemText: { flex: 1, fontSize: 15 },
  langItemTextActive: { color: '#0077b6', fontWeight: '700' },
});

export default HomeScreen;