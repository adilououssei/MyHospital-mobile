import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity,
  TextInput, Dimensions, ActivityIndicator, Linking, Platform, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import BottomNavigation from '../tabs/BottomNavigation';
import ScreenHeader from '../tabs/ScreenHeader';
import {
  getHospitals,
  refreshHospitalCache,
  type Hospital as ApiHospital,
} from '../services/hospitalService';

const { width } = Dimensions.get('window');

// ─── Régions du Togo ──────────────────────────────────────────────────────────
const REGIONS = [
  { key: 'all',      label: 'Toutes',    icon: 'globe-outline',    cities: [] },
  { key: 'maritime', label: 'Maritime',  icon: 'water-outline',    cities: ['lome', 'tsevie', 'aneho', 'vogan', 'tabligbo', 'kpalime'] },
  { key: 'plateaux', label: 'Plateaux',  icon: 'partly-sunny-outline', cities: ['atakpame', 'kpalime', 'badou', 'kpeve', 'amlamé'] },
  { key: 'centrale', label: 'Centrale',  icon: 'location-outline', cities: ['sokode', 'blitta', 'sotouboua', 'tchamba'] },
  { key: 'kara',     label: 'Kara',      icon: 'triangle-outline', cities: ['kara', 'niamtougou', 'bassar', 'kanté', 'pagouda'] },
  { key: 'savanes',  label: 'Savanes',   icon: 'leaf-outline',     cities: ['dapaong', 'mango', 'cinkasse', 'tone'] },
];

// Urgences = filtre transversal
const EXTRA_FILTERS = [
  { key: 'emergency', label: 'Urgences 24h', icon: 'flash-outline' },
];

interface UserLocation { latitude: number; longitude: number; }
interface Hospital extends ApiHospital { distanceKm: number | null; }
interface Props { onNavigate: (screen: string) => void; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km: number | null): string {
  if (km === null) return '';
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

function openMap(h: Hospital, loc: UserLocation | null) {
  const { latitude: lat, longitude: lon } = h.coordinates;
  if (lat && lon) {
    const url = Platform.OS === 'ios'
      ? `maps://app?daddr=${lat},${lon}`
      : `google.navigation:q=${lat},${lon}`;
    Linking.openURL(url).catch(() =>
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`)
    );
  } else {
    const q = encodeURIComponent(`${h.name} ${h.city} Togo`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`);
  }
}

function matchesRegion(hospital: Hospital, regionKey: string): boolean {
  if (regionKey === 'all') return true;
  if (regionKey === 'emergency') return hospital.emergency;
  const region = REGIONS.find((r) => r.key === regionKey);
  if (!region || region.cities.length === 0) return true;
  const cityLower = (hospital.city ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return region.cities.some((c) => cityLower.includes(c) || c.includes(cityLower));
}

// ─── Images des établissements ────────────────────────────────────────────────
const HOSPITAL_IMAGES: Record<string, any> = {
  // Décommentez quand le fichier image existe :
  // 'CHU Sylvanus Olympio': require('../../assets/images/hospitals/chu.jpg'),
  // 'Clinique Biasa':       require('../../assets/images/hospitals/biasa.jpg'),
};

function getHospitalImage(name: string): any | null {
  for (const key of Object.keys(HOSPITAL_IMAGES)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return HOSPITAL_IMAGES[key];
  }
  return null;
}

// ─── Avatar mémoïsé ───────────────────────────────────────────────────────────
const HospitalAvatar = memo(({
  initials, color, name, size = 52
}: { initials: string; color: string; name?: string; size?: number }) => {
  const [imgError, setImgError] = useState(false);
  const img = name ? getHospitalImage(name) : null;
  const apiUrl = null; // branché sur imageUrl si dispo

  if (img && !imgError) {
    return <Image source={img} style={{ width: size, height: size, borderRadius: size / 2 }} onError={() => setImgError(true)} />;
  }
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: color, justifyContent: 'center', alignItems: 'center',
      elevation: 3,
    }}>
      <Text style={{ color: '#fff', fontWeight: '800', fontSize: size * 0.33 }}>
        {initials || 'HO'}
      </Text>
    </View>
  );
});

// ─── Badge urgences ───────────────────────────────────────────────────────────
const EmergencyBadge = memo(() => (
  <View style={styles.emergencyBadge}>
    <Ionicons name="flash" size={10} color="#fff" />
    <Text style={styles.emergencyText}>Urgences 24h</Text>
  </View>
));

// ─── Carte hôpital mémoïsée ───────────────────────────────────────────────────
const HospitalCard = memo(({
  hospital, expanded, onToggle, userLocation, colors,
}: {
  hospital: Hospital;
  expanded: boolean;
  onToggle: (id: string) => void;
  userLocation: UserLocation | null;
  colors: any;
}) => {
  const heroImg = getHospitalImage(hospital.name);
  const apiImg  = (hospital as any).imageUrl;

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      {/* EN-TÊTE */}
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={() => onToggle(hospital.id)}
        activeOpacity={0.7}>

        <HospitalAvatar initials={hospital.initials} color={hospital.avatarColor} name={hospital.name} size={50} />

        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={[styles.hospitalName, { color: colors.text }]} numberOfLines={2}>
              {hospital.name}
            </Text>
            {hospital.emergency && <EmergencyBadge />}
          </View>
          <Text style={styles.hospitalType}>{hospital.type}</Text>
          <View style={styles.badgeRow}>
            {hospital.city ? (
              <View style={styles.badge}>
                <Ionicons name="location-outline" size={11} color="#e74c3c" />
                <Text style={styles.badgeText} numberOfLines={1}>{hospital.city}</Text>
              </View>
            ) : null}
            {hospital.distanceKm !== null ? (
              <View style={[styles.badge, styles.badgeGreen]}>
                <Ionicons name="navigate-outline" size={11} color="#27ae60" />
                <Text style={[styles.badgeText, { color: '#27ae60' }]}>{formatDistance(hospital.distanceKm)}</Text>
              </View>
            ) : null}
          </View>
          {hospital.address ? (
            <Text style={[styles.addressShort, { color: colors.subText }]} numberOfLines={1}>
              {hospital.address}
            </Text>
          ) : null}
        </View>

        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.subText} style={{ marginLeft: 6 }} />
      </TouchableOpacity>

      {/* DÉTAILS */}
      {expanded && (
        <View style={[styles.details, { borderTopColor: colors.border }]}>

          {/* Image ou hero coloré */}
          {heroImg ? (
            <Image source={heroImg} style={styles.heroImage} resizeMode="cover" />
          ) : apiImg ? (
            <Image source={{ uri: apiImg }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={[styles.heroPlaceholder, { backgroundColor: hospital.avatarColor + '22' }]}>
              <HospitalAvatar initials={hospital.initials} color={hospital.avatarColor} name={hospital.name} size={64} />
              <Text style={[styles.heroName, { color: hospital.avatarColor }]}>{hospital.name}</Text>
            </View>
          )}

          {/* Nom + type */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
            <Text style={[{ fontSize: 13, color: '#e74c3c', fontWeight: '700' }]}>{hospital.type}</Text>
            {hospital.emergency && <EmergencyBadge />}
          </View>

          {hospital.description ? (
            <Text style={[{ fontSize: 13, color: colors.subText, lineHeight: 19, marginBottom: 4 }]}>
              {hospital.description}
            </Text>
          ) : null}

          {/* Adresse */}
          <View style={styles.detailRow}>
            <Ionicons name="location" size={17} color="#e74c3c" />
            <Text style={[styles.detailText, { color: colors.subText }]}>
              {[hospital.address, hospital.city].filter(Boolean).join(' — ') || 'Togo'}
            </Text>
          </View>

          {/* Téléphone */}
          {hospital.phone ? (
            <TouchableOpacity style={styles.detailRow} onPress={() => Linking.openURL(`tel:${hospital.phone}`)}>
              <Ionicons name="call" size={17} color="#e74c3c" />
              <Text style={styles.detailLink}>{hospital.phone}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.detailRow}>
              <Ionicons name="call-outline" size={17} color={colors.subText} />
              <Text style={[styles.detailText, { color: colors.subText, fontStyle: 'italic' }]}>Numéro non renseigné</Text>
            </View>
          )}

          {/* Horaires */}
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={17} color="#e74c3c" />
            <Text style={[styles.detailText, { color: colors.subText }]}>
              {hospital.openingHours
                ? hospital.openingHours
                : hospital.emergency
                  ? 'Ouvert 24h/24 — 7j/7'
                  : 'Horaires non renseignés dans OSM'}
            </Text>
          </View>

          {/* Distance */}
          {hospital.distanceKm !== null && (
            <View style={styles.detailRow}>
              <Ionicons name="navigate" size={17} color="#27ae60" />
              <Text style={[styles.detailText, { color: '#27ae60' }]}>
                À {formatDistance(hospital.distanceKm)} de votre position
              </Text>
            </View>
          )}

          {/* Site web */}
          {hospital.website ? (
            <TouchableOpacity style={styles.detailRow} onPress={() => Linking.openURL(hospital.website)}>
              <Ionicons name="globe-outline" size={17} color="#e74c3c" />
              <Text style={styles.detailLink} numberOfLines={1}>{hospital.website}</Text>
            </TouchableOpacity>
          ) : null}

          {/* Spécialités */}
          {hospital.specialties.length > 0 && (
            <View style={{ marginTop: 4 }}>
              <Text style={[styles.specTitle, { color: colors.subText }]}>Spécialités :</Text>
              <View style={styles.specTags}>
                {hospital.specialties.map((s, i) => (
                  <View key={i} style={[styles.specTag, s.includes('Urgences') && styles.specTagRed]}>
                    <Text style={[styles.specTagText, s.includes('Urgences') && { color: '#e74c3c' }]}>{s}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Boutons */}
          <View style={styles.actions}>
            {hospital.phone ? (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#e74c3c' }]}
                onPress={() => Linking.openURL(`tel:${hospital.phone}`)}>
                <Ionicons name="call" size={16} color="#fff" />
                <Text style={styles.actionBtnText}>Appeler</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#0077b6', flex: 1 }]}
              onPress={() => openMap(hospital, userLocation)}>
              <Ionicons name="navigate" size={16} color="#fff" />
              <Text style={styles.actionBtnText}>Itinéraire</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}, (prev, next) =>
  prev.expanded === next.expanded &&
  prev.hospital.distanceKm === next.hospital.distanceKm &&
  prev.hospital.id === next.hospital.id
);

// ─── Composant principal ──────────────────────────────────────────────────────
const HospitalScreen = ({ onNavigate }: Props) => {
  const { colors } = useApp();
  const [hospitals, setHospitals]           = useState<Hospital[]>([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);
  const [searchQuery, setSearchQuery]       = useState('');
  const [activeRegion, setActiveRegion]     = useState('all');
  const [showEmergencyOnly, setShowEmergencyOnly] = useState(false);
  const [expandedId, setExpandedId]         = useState<string | null>(null);
  const [userLocation, setUserLocation]     = useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<'pending' | 'granted' | 'denied'>('pending');

  // ─── Localisation ───────────────────────────────────────────────────────────
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) { setLocationStatus('denied'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationStatus('granted');
        setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      },
      () => setLocationStatus('denied'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => { requestLocation(); }, []);

  const addDistances = useCallback((list: Hospital[], loc: UserLocation | null): Hospital[] =>
    list.map((h) => ({
      ...h,
      distanceKm: (loc && h.coordinates.latitude && h.coordinates.longitude)
        ? haversineDistance(loc.latitude, loc.longitude, h.coordinates.latitude!, h.coordinates.longitude!)
        : null,
    })), []);

  useEffect(() => {
    if (userLocation && hospitals.length > 0) {
      setHospitals((prev) =>
        [...addDistances(prev, userLocation)].sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999))
      );
    }
  }, [userLocation]);

  // ─── Chargement ─────────────────────────────────────────────────────────────
  const fetchHospitals = useCallback(async (forceRefresh = false) => {
    setLoading(true); setError(null); setExpandedId(null);
    try {
      if (forceRefresh) await refreshHospitalCache().catch(() => {});
      const data = await getHospitals();
      const withExtras: Hospital[] = data.map((h) => ({ ...h, distanceKm: null }));
      const withDist = addDistances(withExtras, userLocation);
      const sorted = [...withDist].sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
      setHospitals(sorted);
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Connexion impossible');
    } finally {
      setLoading(false);
    }
  }, [userLocation]);

  useEffect(() => { fetchHospitals(); }, []);

  // ─── Toggle accordéon ────────────────────────────────────────────────────────
  const handleToggle = useCallback((id: string) => {
    setExpandedId((prev) => prev === id ? null : id);
  }, []);

  // ─── Filtrage mémoïsé ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return hospitals.filter((h) => {
      if (showEmergencyOnly && !h.emergency) return false;
      if (!matchesRegion(h, activeRegion)) return false;
      if (!q) return true;
      const name = h.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const city = (h.city ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const specs = h.specialties.join(' ').toLowerCase();
      return name.includes(q) || city.includes(q) || specs.includes(q);
    });
  }, [hospitals, searchQuery, activeRegion, showEmergencyOnly]);

  // ─── renderItem pour FlatList ────────────────────────────────────────────────
  const renderItem = useCallback(({ item }: { item: Hospital }) => (
    <HospitalCard
      hospital={item}
      expanded={expandedId === item.id}
      onToggle={handleToggle}
      userLocation={userLocation}
      colors={colors}
    />
  ), [expandedId, handleToggle, userLocation, colors]);

  const keyExtractor = useCallback((item: Hospital) => item.id, []);

  // ─── États loading/erreur ────────────────────────────────────────────────────
  if (loading) return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Hôpitaux & Cliniques" onBack={() => onNavigate('home')} showNotification unreadCount={4} onNotificationPress={() => onNavigate('messages')} />
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e74c3c" />
        <Text style={[styles.loadingText, { color: colors.subText }]}>Chargement depuis OpenStreetMap...</Text>
        <Text style={{ fontSize: 12, color: colors.subText, textAlign: 'center', marginTop: 4 }}>
          Première ouverture — peut prendre 5-10 secondes{'\n'}(données mises en cache ensuite)
        </Text>
      </View>
      <BottomNavigation currentScreen="hospital" onNavigate={onNavigate} />
    </SafeAreaView>
  );

  if (error) return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Hôpitaux & Cliniques" onBack={() => onNavigate('home')} showNotification unreadCount={4} onNotificationPress={() => onNavigate('messages')} />
      <View style={styles.center}>
        <Ionicons name="wifi-outline" size={60} color={colors.subText} />
        <Text style={[styles.errorTitle, { color: colors.text }]}>Connexion impossible</Text>
        <Text style={[{ fontSize: 13, color: colors.subText, textAlign: 'center' }]}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => fetchHospitals()}>
          <Text style={styles.retryBtnText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
      <BottomNavigation currentScreen="hospital" onNavigate={onNavigate} />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Hôpitaux & Cliniques" onBack={() => onNavigate('home')} showNotification unreadCount={4} onNotificationPress={() => onNavigate('messages')} />

      {/* ── ZONE FIXE (ne scroll pas) ── */}
      <View style={[styles.fixedHeader, { backgroundColor: colors.background }]}>

        {/* Localisation */}
        {locationStatus === 'denied' && (
          <TouchableOpacity style={styles.locBanner} onPress={requestLocation}>
            <Ionicons name="location-outline" size={15} color="#fff" />
            <Text style={styles.locBannerText}>Activer la localisation pour voir les distances</Text>
          </TouchableOpacity>
        )}
        {locationStatus === 'granted' && (
          <View style={styles.locGranted}>
            <Ionicons name="location" size={12} color="#e74c3c" />
            <Text style={styles.locGrantedText}>Triés par distance depuis votre position</Text>
          </View>
        )}

        {/* Barre de recherche */}
        <View style={styles.searchRow}>
          <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="search-outline" size={19} color={colors.subText} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Nom, spécialité..."
              placeholderTextColor={colors.subText}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={17} color={colors.subText} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.refreshBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => fetchHospitals(true)}>
            <Ionicons name="refresh-outline" size={19} color="#e74c3c" />
          </TouchableOpacity>
        </View>

        {/* Bouton Urgences */}
        <TouchableOpacity
          style={[styles.emergencyFilter, showEmergencyOnly && styles.emergencyFilterActive]}
          onPress={() => setShowEmergencyOnly((v) => !v)}>
          <Ionicons name="flash" size={14} color={showEmergencyOnly ? '#fff' : '#e74c3c'} />
          <Text style={[styles.emergencyFilterText, showEmergencyOnly && { color: '#fff' }]}>
            Urgences 24h seulement
          </Text>
        </TouchableOpacity>

        {/* Filtres RÉGIONS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 8 }}
          contentContainerStyle={styles.regionsContent}>
          {REGIONS.map((r) => (
            <TouchableOpacity
              key={r.key}
              style={[styles.regionChip, { backgroundColor: colors.card, borderColor: colors.border },
                activeRegion === r.key && styles.regionChipActive]}
              onPress={() => setActiveRegion(r.key)}>
              <Ionicons name={r.icon as any} size={13} color={activeRegion === r.key ? '#e74c3c' : colors.subText} />
              <Text style={[styles.regionChipText, { color: colors.subText },
                activeRegion === r.key && { color: '#e74c3c', fontWeight: '700' }]}>
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Compteur */}
        <View style={styles.countRow}>
          <Text style={[styles.countTitle, { color: colors.text }]}>
            {activeRegion === 'all' ? 'Tous les établissements' : `Région ${REGIONS.find(r => r.key === activeRegion)?.label ?? ''}`}
          </Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{filtered.length}</Text>
          </View>
        </View>
      </View>

      {/* ── LISTE SCROLLANTE ── */}
      <FlatList
        data={filtered}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 4 }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={8}
        windowSize={10}
        initialNumToRender={8}
        getItemLayout={undefined}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="medkit-outline" size={50} color={colors.subText} />
            <Text style={{ fontSize: 14, color: colors.subText, textAlign: 'center' }}>
              Aucun établissement dans cette région
            </Text>
          </View>
        }
      />

      <BottomNavigation currentScreen="hospital" onNavigate={onNavigate} />
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, gap: 14 },
  loadingText: { fontSize: 14, textAlign: 'center', marginTop: 12 },
  errorTitle: { fontSize: 18, fontWeight: '600', textAlign: 'center' },
  retryBtn: { backgroundColor: '#e74c3c', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25, marginTop: 10 },
  retryBtnText: { color: '#fff', fontWeight: '600' },

  // ── Zone fixe ──
  fixedHeader: {
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
    zIndex: 10,
  },

  locBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#e74c3c', marginHorizontal: 16, marginTop: 10, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  locBannerText: { color: '#fff', fontSize: 13, flex: 1 },
  locGranted: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 2 },
  locGrantedText: { fontSize: 12, color: '#e74c3c' },

  searchRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6, gap: 10 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 22, paddingHorizontal: 13, paddingVertical: 10, borderWidth: 1, gap: 8 },
  searchInput: { flex: 1, fontSize: 14 },
  refreshBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },

  emergencyFilter: { flexDirection: 'row', alignItems: 'center', gap: 7, marginHorizontal: 16, marginBottom: 4, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#e74c3c', alignSelf: 'flex-start' },
  emergencyFilterActive: { backgroundColor: '#e74c3c' },
  emergencyFilterText: { fontSize: 13, fontWeight: '600', color: '#e74c3c' },

  regionsContent: { paddingLeft: 16, paddingRight: 16, gap: 8 },
  regionChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 18, borderWidth: 1 },
  regionChipActive: { backgroundColor: '#FDEDEC', borderColor: '#e74c3c' },
  regionChipText: { fontSize: 13, fontWeight: '500' },

  countRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 4, gap: 8 },
  countTitle: { fontSize: 15, fontWeight: '700', flex: 1 },
  countBadge: { backgroundColor: '#FDEDEC', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 10 },
  countBadgeText: { fontSize: 12, color: '#e74c3c', fontWeight: '600' },

  // ── Carte ──
  card: { marginHorizontal: 16, marginBottom: 8, borderRadius: 14, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 13, gap: 11 },
  nameRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, flexWrap: 'wrap', marginBottom: 2 },
  hospitalName: { fontSize: 14, fontWeight: '700', lineHeight: 20, flex: 1 },
  hospitalType: { fontSize: 12, fontWeight: '600', color: '#e74c3c', marginBottom: 4 },
  emergencyBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#e74c3c', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 7 },
  emergencyText: { fontSize: 10, color: '#fff', fontWeight: '700' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 3 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#FDEDEC', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 7 },
  badgeGreen: { backgroundColor: '#EAFAF1' },
  badgeText: { fontSize: 11, color: '#e74c3c', fontWeight: '500' },
  addressShort: { fontSize: 12, lineHeight: 16 },

  // ── Détails ──
  details: { paddingHorizontal: 14, paddingBottom: 14, paddingTop: 12, borderTopWidth: 1, gap: 9 },
  heroImage: { width: '100%', height: 150, borderRadius: 10, marginBottom: 8 },
  heroPlaceholder: { width: '100%', height: 90, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10, gap: 6 },
  heroName: { fontSize: 12, fontWeight: '600' },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  detailText: { fontSize: 14, flex: 1, lineHeight: 20 },
  detailLink: { fontSize: 14, flex: 1, lineHeight: 20, color: '#0077b6', textDecorationLine: 'underline' },
  specTitle: { fontSize: 12, marginBottom: 6, fontWeight: '500' },
  specTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  specTag: { backgroundColor: '#FDEDEC', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 9 },
  specTagRed: { borderWidth: 1, borderColor: '#e74c3c' },
  specTagText: { fontSize: 11, color: '#e74c3c' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, gap: 7 },
  actionBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
});

export default HospitalScreen;