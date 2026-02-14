// app/screens/HomeScreen.tsx
// ✅ Connecté à l'API - Les docteurs sont chargés depuis le backend

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
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

const HomeScreen = ({ onNavigate, unreadCount = 0 }: HomeScreenProps) => {
  const { colors } = useApp();

  // ── State des docteurs ──────────────────────────────────────
  const [topDoctors, setTopDoctors]   = useState<Docteur[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [errorDocs, setErrorDocs]     = useState<string | null>(null);

  // ── Chargement des docteurs au montage ──────────────────────
  useEffect(() => {
    loadTopDoctors();
  }, []);

  const loadTopDoctors = async () => {
    try {
      setLoadingDocs(true);
      setErrorDocs(null);
      const doctors = await docteurService.getDocteurs();
      // On garde les 3 mieux notés
      const sorted = [...doctors].sort((a, b) => b.note - a.note).slice(0, 3);
      setTopDoctors(sorted);
    } catch (err: any) {
      console.error('Erreur chargement docteurs HomeScreen:', err.message);
      setErrorDocs('Impossible de charger les médecins');
    } finally {
      setLoadingDocs(false);
    }
  };

  // ── Composant bouton de service ─────────────────────────────
  const ServiceButton = ({
    icon,
    label,
    screen,
  }: {
    icon: string;
    label: string;
    screen?: string;
  }) => (
    <TouchableOpacity
      style={styles.serviceButton}
      onPress={() => screen && onNavigate(screen)}
    >
      <View style={styles.serviceIconContainer}>
        {label === 'Docteur' ? (
          <FontAwesome5 name="user-md" size={28} color="#0077b6" />
        ) : label === 'Ambulance' ? (
          <FontAwesome5 name="ambulance" size={28} color="#0077b6" />
        ) : (
          <Ionicons name={icon as any} size={28} color="#0077b6" />
        )}
      </View>
      <Text style={[styles.serviceLabel, { color: colors.subText }]}>{label}</Text>
    </TouchableOpacity>
  );

  // ── Carte d'un docteur ──────────────────────────────────────
  const DoctorCard = ({ doctor }: { doctor: Docteur }) => {
    const photoUrl = doctor.photo ? `${API_BASE_URL}${doctor.photo}` : null;
    const prix     = docteurService.getPrixMin(doctor);

    return (
      <TouchableOpacity
        style={[styles.doctorCard, { backgroundColor: colors.card }]}
        onPress={() =>
          onNavigate('doctorDetail', {
            doctor: {
              id:        doctor.id,
              name:      doctor.nomComplet,
              specialty: doctor.specialite,
              rating:    doctor.note,
              ville:     doctor.ville,
              price:     prix,
              photo:     doctor.photo,
              telephone: doctor.telephone,
              email:     doctor.email,
              adresse:   doctor.adresse,
            },
          })
        }
      >
        {/* Photo ou placeholder */}
        <View style={styles.doctorImageContainer}>
          {photoUrl ? (
            <Image
              source={{ uri: photoUrl }}
              style={styles.doctorImage}
            />
          ) : (
            <View style={styles.doctorImagePlaceholder}>
              <FontAwesome5 name="user-md" size={36} color="#0077b6" />
            </View>
          )}
        </View>

        {/* Infos */}
        <Text
          style={[styles.doctorName, { color: colors.text }]}
          numberOfLines={1}
        >
          {doctor.nomComplet}
        </Text>
        <Text
          style={[styles.doctorSpecialty, { color: colors.subText }]}
          numberOfLines={1}
        >
          {doctor.specialite ?? 'Généraliste'}
        </Text>

        {/* Note + Ville */}
        <View style={styles.doctorInfo}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={13} color="#FFC107" />
            <Text style={[styles.ratingText, { color: colors.text }]}>
              {doctor.note.toFixed(1)}
            </Text>
          </View>
          <View style={styles.distanceContainer}>
            <Ionicons name="location-outline" size={13} color={colors.subText} />
            <Text
              style={[styles.distanceText, { color: colors.subText }]}
              numberOfLines={1}
            >
              {doctor.ville}
            </Text>
          </View>
        </View>

        {/* Prix */}
        {prix > 0 && (
          <Text style={styles.prixText}>
            {prix.toLocaleString()} FCFA
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  // ── Rendu section docteurs ──────────────────────────────────
  const renderDoctorsSection = () => {
    if (loadingDocs) {
      return (
        <View style={styles.docsLoadingContainer}>
          <ActivityIndicator size="small" color="#0077b6" />
          <Text style={[styles.docsLoadingText, { color: colors.subText }]}>
            Chargement des médecins...
          </Text>
        </View>
      );
    }

    if (errorDocs) {
      return (
        <View style={styles.docsErrorContainer}>
          <Text style={[styles.docsErrorText, { color: colors.subText }]}>
            {errorDocs}
          </Text>
          <TouchableOpacity onPress={loadTopDoctors} style={styles.retryButton}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (topDoctors.length === 0) {
      return (
        <View style={styles.docsEmptyContainer}>
          <Text style={[styles.docsEmptyText, { color: colors.subText }]}>
            Aucun médecin disponible
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.doctorsScroll}
        contentContainerStyle={styles.doctorsScrollContent}
      >
        {topDoctors.map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} />
        ))}
      </ScrollView>
    );
  };

  // ── Rendu principal ─────────────────────────────────────────
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/MyHospital1.png')}
            style={{ width: 200, height: 60 }}
          />
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => onNavigate('notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Barre de recherche */}
        <View style={[styles.searchContainer, { backgroundColor: colors.inputBackground }]}>
          <Ionicons name="search-outline" size={20} color={colors.subText} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Rechercher médecin, médicaments..."
            placeholderTextColor={colors.subText}
          />
        </View>

        {/* Services */}
        <View style={styles.servicesContainer}>
          <ServiceButton icon="medical-outline" label="Docteur"   screen="doctorsList" />
          <ServiceButton icon="medkit-outline"  label="Pharmacie" screen="pharmacy" />
          <ServiceButton icon="business-outline" label="Hôpital"  screen="hospital" />
          <ServiceButton icon="car-outline"     label="Ambulance" screen="emergency" />
        </View>

        {/* Bannière */}
        <LinearGradient
          colors={['#e4f4fcff', '#0077b6']}
          style={styles.banner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Protection précoce pour</Text>
            <Text style={styles.bannerTitle}>la santé de votre famille</Text>
            <TouchableOpacity
              style={styles.bannerButton}
              onPress={() => onNavigate('healthInfo')}
            >
              <Text style={styles.bannerButtonText}>En savoir plus</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.bannerImageContainer}>
            <Image
              source={require('../../assets/doctor2.png')}
              style={{ width: 120, height: 140 }}
            />
          </View>
        </LinearGradient>

        {/* Section meilleurs docteurs */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Meilleurs Docteurs
          </Text>
          <TouchableOpacity onPress={() => onNavigate('doctorsList')}>
            <Text style={styles.seeAllText}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        {renderDoctorsSection()}
      </ScrollView>

      <BottomNavigation
        currentScreen="home"
        onNavigate={onNavigate}
        unreadCount={unreadCount}
      />
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────────────────────
// 🎨 STYLES
// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:    { flex: 1 },
  scrollContent:{ paddingBottom: 90 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  notificationButton: { padding: 8, position: 'relative', marginTop: 15 },
  notificationBadge: {
    position: 'absolute',
    top: 5, right: 5,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20, height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  notificationBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },

  // Recherche
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14 },

  // Services
  servicesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  serviceButton:        { alignItems: 'center' },
  serviceIconContainer: {
    width: 60, height: 60,
    backgroundColor: '#e4f4fcff',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceLabel: { fontSize: 12 },

  // Bannière
  banner: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  bannerContent:        { flex: 1 },
  bannerTitle:          { fontSize: 16, fontWeight: '600', color: '#000', marginBottom: 2 },
  bannerButton: {
    backgroundColor: '#0077b6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 15,
  },
  bannerButtonText:     { color: '#fff', fontSize: 13, fontWeight: '600' },
  bannerImageContainer: { justifyContent: 'center', alignItems: 'center' },

  // Section titre
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  seeAllText:   { fontSize: 14, color: '#0077b6', fontWeight: '500' },

  // Liste docteurs
  doctorsScroll:        { paddingLeft: 20 },
  doctorsScrollContent: { paddingRight: 20, paddingBottom: 10 },

  doctorCard: {
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    width: 145,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  doctorImageContainer: { alignItems: 'center', marginBottom: 10 },
  doctorImage: {
    width: 80, height: 80,
    borderRadius: 40,
  },
  doctorImagePlaceholder: {
    width: 80, height: 80,
    backgroundColor: '#e4f4fcff',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorName:     { fontSize: 13, fontWeight: '600', marginBottom: 3 },
  doctorSpecialty:{ fontSize: 11, marginBottom: 8 },
  doctorInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingContainer:  { flexDirection: 'row', alignItems: 'center' },
  ratingText:       { fontSize: 12, fontWeight: '600', marginLeft: 3 },
  distanceContainer:{ flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: 6 },
  distanceText:     { fontSize: 11, marginLeft: 2 },
  prixText:         { fontSize: 12, fontWeight: '700', color: '#0077b6', marginTop: 4 },

  // États chargement / erreur / vide
  docsLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
    gap: 10,
  },
  docsLoadingText: { fontSize: 14 },

  docsErrorContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  docsErrorText: { fontSize: 14, textAlign: 'center', marginBottom: 12 },
  retryButton: {
    backgroundColor: '#0077b6',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  docsEmptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  docsEmptyText: { fontSize: 14, textAlign: 'center' },
});

export default HomeScreen;