import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity,
  TextInput, Dimensions, ActivityIndicator, Linking, Platform, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
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
  { key: 'all',      labelKey: 'hsRegAll',      icon: 'globe-outline',        cities: [] },
  { key: 'maritime', labelKey: 'hsRegMaritime',  icon: 'water-outline',        cities: ['lome', 'tsevie', 'aneho', 'vogan', 'tabligbo', 'kpalime'] },
  { key: 'plateaux', labelKey: 'hsRegPlateaux',  icon: 'partly-sunny-outline', cities: ['atakpame', 'kpalime', 'badou', 'kpeve', 'amlamé'] },
  { key: 'centrale', labelKey: 'hsRegCentrale',  icon: 'location-outline',     cities: ['sokode', 'blitta', 'sotouboua', 'tchamba'] },
  { key: 'kara',     labelKey: 'hsRegKara',      icon: 'triangle-outline',     cities: ['kara', 'niamtougou', 'bassar', 'kanté', 'pagouda'] },
  { key: 'savanes',  labelKey: 'hsRegSavanes',   icon: 'leaf-outline',         cities: ['dapaong', 'mango', 'cinkasse', 'tone'] },
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
const EmergencyBadge = memo(({ label }: { label: string }) => (
  <View style={styles.emergencyBadge}>
    <Ionicons name="flash" size={10} color="#fff" />
    <Text style={styles.emergencyText}>{label}</Text>
  </View>
));

// ─── Carte hôpital mémoïsée ───────────────────────────────────────────────────
const HospitalCard = memo(({
  hospital, expanded, onToggle, userLocation, colors, t,
}: {
  hospital: Hospital;
  expanded: boolean;
  onToggle: (id: string) => void;
  userLocation: UserLocation | null;
  colors: any;
  t: (key: string) => string;
}) => {
  const heroImg = getHospitalImage(hospital.name);
  const apiImg  = (hospital as any).imageUrl;

  return (
    <View style={styles.card}>
      {/* EN-TÊTE */}
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={() => onToggle(hospital.id)}
        activeOpacity={0.7}>

        <HospitalAvatar initials={hospital.initials} color={hospital.avatarColor} name={hospital.name} size={50} />

        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={styles.hospitalName} numberOfLines={2}>
              {hospital.name}
            </Text>
            {hospital.emergency && <EmergencyBadge label={t('hsEmergencyBadge')} />}
          </View>
          <Text style={styles.hospitalType}>{hospital.type}</Text>
          <View style={styles.badgeRow}>
            {hospital.city ? (
              <View style={styles.badge}>
                <Ionicons name="location-outline" size={11} color="#dc2626" />
                <Text style={styles.badgeText} numberOfLines={1}>{hospital.city}</Text>
              </View>
            ) : null}
            {hospital.distanceKm !== null ? (
              <View style={[styles.badge, styles.badgeGreen]}>
                <Ionicons name="navigate-outline" size={11} color="#059669" />
                <Text style={[styles.badgeText, { color: '#059669' }]}>{formatDistance(hospital.distanceKm)}</Text>
              </View>
            ) : null}
          </View>
          {hospital.address ? (
            <Text style={styles.addressShort} numberOfLines={1}>
              {hospital.address}
            </Text>
          ) : null}
        </View>

        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.subText} style={{ marginLeft: 6 }} />
      </TouchableOpacity>

      {/* DÉTAILS */}
      {expanded && (
        <View style={styles.details}>

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

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
            <Text style={{ fontSize: 13, color: '#dc2626', fontWeight: '700' }}>{hospital.type}</Text>
            {hospital.emergency && <EmergencyBadge label={t('hsEmergencyBadge')} />}
          </View>

          {hospital.description ? (
            <Text style={{ fontSize: 13, color: colors.subText, lineHeight: 19, marginBottom: 4 }}>
              {hospital.description}
            </Text>
          ) : null}

          <View style={styles.detailRow}>
            <Ionicons name="location" size={17} color="#dc2626" />
            <Text style={styles.detailText}>
              {[hospital.address, hospital.city].filter(Boolean).join(' — ') || 'Togo'}
            </Text>
          </View>

          {hospital.phone ? (
            <TouchableOpacity style={styles.detailRow} onPress={() => Linking.openURL(`tel:${hospital.phone}`)}>
              <Ionicons name="call" size={17} color="#dc2626" />
              <Text style={styles.detailLink}>{hospital.phone}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.detailRow}>
              <Ionicons name="call-outline" size={17} color={colors.subText} />
              <Text style={[styles.detailText, { color: colors.subText, fontStyle: 'italic' }]}>{t('hsNoPhone')}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={17} color="#dc2626" />
            <Text style={styles.detailText}>
              {hospital.openingHours
                ? hospital.openingHours
                : hospital.emergency
                  ? t('hsOpen247')
                  : t('hsNoHours')}
            </Text>
          </View>

          {hospital.distanceKm !== null && (
            <View style={styles.detailRow}>
              <Ionicons name="navigate" size={17} color="#059669" />
              <Text style={[styles.detailText, { color: '#059669' }]}>
                {t('hsDistanceFrom')} {formatDistance(hospital.distanceKm)} {t('hsDistanceFromPos')}
              </Text>
            </View>
          )}

          {hospital.website ? (
            <TouchableOpacity style={styles.detailRow} onPress={() => Linking.openURL(hospital.website)}>
              <Ionicons name="globe-outline" size={17} color="#dc2626" />
              <Text style={styles.detailLink} numberOfLines={1}>{hospital.website}</Text>
            </TouchableOpacity>
          ) : null}

          {hospital.specialties.length > 0 && (
            <View style={{ marginTop: 4 }}>
              <Text style={[styles.specTitle, { color: colors.subText }]}>{t('hsSpecialties')}</Text>
              <View style={styles.specTags}>
                {hospital.specialties.map((s, i) => (
                  <View key={i} style={[styles.specTag, s.includes('Urgences') && styles.specTagRed]}>
                    <Text style={[styles.specTagText, s.includes('Urgences') && { color: '#dc2626' }]}>{s}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {hospital.insurances?.length > 0 && (
            <View style={{ marginTop: 4 }}>
              <Text style={[styles.specTitle, { color: colors.subText }]}>{t('hsInsurances')}</Text>
              <View style={styles.specTags}>
                {hospital.insurances.map((ins, i) => (
                  <View key={i} style={[styles.specTag, { backgroundColor: '#ecfdf5' }]}>
                    <Text style={[styles.specTagText, { color: '#059669' }]}>{ins}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.actions}>
            {hospital.phone ? (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#dc2626' }]}
                onPress={() => Linking.openURL(`tel:${hospital.phone}`)}>
                <Ionicons name="call" size={16} color="#fff" />
                <Text style={styles.actionBtnText}>{t('aptCall')}</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#1a56db', flex: 1 }]}
              onPress={() => openMap(hospital, userLocation)}>
              <Ionicons name="navigate" size={16} color="#fff" />
              <Text style={styles.actionBtnText}>{t('favDirections')}</Text>
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
  const { colors, t } = useApp();
  const [hospitals, setHospitals]           = useState<Hospital[]>([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);
  const [searchQuery, setSearchQuery]       = useState('');
  const [activeRegion, setActiveRegion]     = useState('all');
  const [showEmergencyOnly, setShowEmergencyOnly] = useState(false);
  const [expandedId, setExpandedId]         = useState<string | null>(null);
  const [userLocation, setUserLocation]     = useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<'pending' | 'granted' | 'denied'>('pending');

  const requestLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setLocationStatus('denied'); return; }
      const pos = await Location.getCurrentPositionAsync({});
      setLocationStatus('granted');
      setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
    } catch {
      setLocationStatus('denied');
    }
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
    if (!userLocation || hospitals.length === 0) return;
    setHospitals((prev) =>
      [...addDistances(prev, userLocation)].sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999))
    );
  }, [userLocation, hospitals.length]);

  const fetchHospitals = useCallback(async (forceRefresh = false) => {
    setLoading(true); setError(null); setExpandedId(null);
    try {
      if (forceRefresh) await refreshHospitalCache().catch(() => {});
      const data = await getHospitals();
      const withExtras: Hospital[] = data.map((h) => ({ ...h, distanceKm: null }));
      setHospitals(withExtras);
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || t('hsConnectError'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHospitals(); }, []);

  const handleToggle = useCallback((id: string) => {
    setExpandedId((prev) => prev === id ? null : id);
  }, []);

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

  const renderItem = useCallback(({ item }: { item: Hospital }) => (
    <HospitalCard
      hospital={item}
      expanded={expandedId === item.id}
      onToggle={handleToggle}
      userLocation={userLocation}
      colors={colors}
      t={t}
    />
  ), [expandedId, handleToggle, userLocation, colors, t]);

  const keyExtractor = useCallback((item: Hospital) => item.id, []);
  const activeRegionData = REGIONS.find(r => r.key === activeRegion);

  if (loading) return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.container}>
      <ScreenHeader title={t('hsTitle')} onBack={() => onNavigate('home')} showNotification onNotificationPress={() => onNavigate('notifications')} />
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#dc2626" />
        <Text style={styles.loadingText}>{t('hsLoading')}</Text>
        <Text style={{ fontSize: 12, color: colors.subText, textAlign: 'center', marginTop: 4 }}>
          {t('hsLoadingFirst')}
        </Text>
      </View>
      <BottomNavigation currentScreen="hospital" onNavigate={onNavigate} />
    </SafeAreaView>
  );

  if (error) return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.container}>
      <ScreenHeader title={t('hsTitle')} onBack={() => onNavigate('home')} showNotification onNotificationPress={() => onNavigate('notifications')} />
      <View style={styles.center}>
        <Ionicons name="wifi-outline" size={60} color={colors.subText} />
        <Text style={styles.errorTitle}>{t('hsConnectError')}</Text>
        <Text style={{ fontSize: 13, color: colors.subText, textAlign: 'center' }}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => fetchHospitals()}>
          <Text style={styles.retryBtnText}>{t('retryButton')}</Text>
        </TouchableOpacity>
      </View>
      <BottomNavigation currentScreen="hospital" onNavigate={onNavigate} />
    </SafeAreaView>
  );

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.container}>
      <ScreenHeader title={t('hsTitle')} onBack={() => onNavigate('home')} showNotification onNotificationPress={() => onNavigate('notifications')} />

      <View style={styles.fixedHeader}>
        {locationStatus === 'denied' && (
          <TouchableOpacity style={styles.locBanner} onPress={requestLocation}>
            <Ionicons name="location-outline" size={15} color="#fff" />
            <Text style={styles.locBannerText}>{t('hsLocDenied')}</Text>
          </TouchableOpacity>
        )}
        {locationStatus === 'granted' && (
          <View style={styles.locGranted}>
            <Ionicons name="location" size={12} color="#dc2626" />
            <Text style={styles.locGrantedText}>{t('hsLocGranted')}</Text>
          </View>
        )}

        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={19} color={colors.subText} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={t('hsSearchPlaceholder')}
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
            style={styles.refreshBtn}
            onPress={() => fetchHospitals(true)}>
            <Ionicons name="refresh-outline" size={19} color="#dc2626" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.emergencyFilter, showEmergencyOnly && styles.emergencyFilterActive]}
          onPress={() => setShowEmergencyOnly((v) => !v)}>
          <Ionicons name="flash" size={14} color={showEmergencyOnly ? '#fff' : '#dc2626'} />
          <Text style={[styles.emergencyFilterText, showEmergencyOnly && { color: '#fff' }]}>
            {t('hsEmergencyOnly')}
          </Text>
        </TouchableOpacity>

        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          style={{ marginTop: 8 }} contentContainerStyle={styles.regionsContent}>
          {REGIONS.map((r) => (
            <TouchableOpacity
              key={r.key}
              style={[styles.regionChip,
                activeRegion === r.key && styles.regionChipActive]}
              onPress={() => setActiveRegion(r.key)}>
              <Ionicons name={r.icon as any} size={13} color={activeRegion === r.key ? '#dc2626' : colors.subText} />
              <Text style={[styles.regionChipText, { color: colors.subText },
                activeRegion === r.key && { color: '#dc2626', fontWeight: '700' }]}>
                {t(r.labelKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.countRow}>
          <Text style={[styles.countTitle, { color: colors.text }]}>
            {activeRegion === 'all'
              ? t('hsAllEstablishments')
              : `${t('hsRegion')} ${activeRegionData ? t(activeRegionData.labelKey) : ''}`}
          </Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{filtered.length}</Text>
          </View>
        </View>
      </View>

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
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="medkit-outline" size={50} color={colors.subText} />
            <Text style={{ fontSize: 14, color: colors.subText, textAlign: 'center' }}>
              {t('hsEmpty')}
            </Text>
          </View>
        }
      />

      <BottomNavigation currentScreen="hospital" onNavigate={onNavigate} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, gap: 14, backgroundColor: '#f0f4f8' },
  loadingText: { fontSize: 14, textAlign: 'center', marginTop: 12, color: '#6b7280' },
  errorTitle: { fontSize: 18, fontWeight: '600', textAlign: 'center', color: '#111827' },
  retryBtn: { backgroundColor: '#dc2626', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 20, marginTop: 10 },
  retryBtnText: { color: '#fff', fontWeight: '600' },
  fixedHeader: { paddingBottom: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#f3f4f6', zIndex: 10 },
  locBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#dc2626', marginHorizontal: 16, marginTop: 10, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  locBannerText: { color: '#fff', fontSize: 13, flex: 1 },
  locGranted: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 2 },
  locGrantedText: { fontSize: 12, color: '#dc2626' },
  searchRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6, gap: 10 },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, gap: 8,
    backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  searchInput: { flex: 1, fontSize: 14 },
  refreshBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  emergencyFilter: { flexDirection: 'row', alignItems: 'center', gap: 7, marginHorizontal: 16, marginBottom: 4, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#dc2626', alignSelf: 'flex-start' },
  emergencyFilterActive: { backgroundColor: '#dc2626' },
  emergencyFilterText: { fontSize: 13, fontWeight: '600', color: '#dc2626' },
  regionsContent: { paddingLeft: 16, paddingRight: 16, gap: 8 },
  regionChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff' },
  regionChipActive: { backgroundColor: '#fef2f2', borderColor: '#dc2626' },
  regionChipText: { fontSize: 13, fontWeight: '500' },
  countRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 4, gap: 8 },
  countTitle: { fontSize: 15, fontWeight: '700' },
  countBadge: { backgroundColor: '#fef2f2', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 10 },
  countBadgeText: { fontSize: 12, color: '#dc2626', fontWeight: '600' },
  card: { marginHorizontal: 16, marginBottom: 8, borderRadius: 16, overflow: 'hidden', backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, flexWrap: 'wrap', marginBottom: 2 },
  hospitalName: { fontSize: 15, fontWeight: '700', lineHeight: 20, flex: 1, color: '#111827' },
  hospitalType: { fontSize: 12, fontWeight: '600', color: '#dc2626', marginBottom: 4 },
  emergencyBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#dc2626', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 7 },
  emergencyText: { fontSize: 10, color: '#fff', fontWeight: '700' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 3 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#fef2f2', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  badgeGreen: { backgroundColor: '#ecfdf5' },
  badgeText: { fontSize: 11, color: '#dc2626', fontWeight: '500' },
  addressShort: { fontSize: 12, lineHeight: 17, color: '#6b7280' },
  details: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#f3f4f6', gap: 10 },
  heroImage: { width: '100%', height: 150, borderRadius: 10, marginBottom: 8 },
  heroPlaceholder: { width: '100%', height: 90, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10, gap: 6 },
  heroName: { fontSize: 12, fontWeight: '600' },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  detailText: { fontSize: 14, flex: 1, lineHeight: 20, color: '#6b7280' },
  detailLink: { fontSize: 14, flex: 1, lineHeight: 20, color: '#1a56db', textDecorationLine: 'underline' },
  specTitle: { fontSize: 12, marginBottom: 6, fontWeight: '500' },
  specTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  specTag: { backgroundColor: '#fef2f2', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 9 },
  specTagRed: { borderWidth: 1, borderColor: '#dc2626' },
  specTagText: { fontSize: 11, color: '#dc2626' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, gap: 7 },
  actionBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
});

export default HospitalScreen;
