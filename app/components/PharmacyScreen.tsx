import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Dimensions, ActivityIndicator, Linking, Platform, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import BottomNavigation from '../tabs/BottomNavigation';
import ScreenHeader from '../tabs/ScreenHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getOnCallPharmacies,
  getAllPharmacies,
  refreshPharmacyCache,
  type Pharmacy as ApiPharmacy,
  type PharmacyHoraire,
} from '../services/pharmacyService';

const { width } = Dimensions.get('window');
const CARD_WIDTH  = width * 0.48;
const CARD_MARGIN = 8;
const FAVORITES_KEY = '@pharmacies_favorites';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserLocation { latitude: number; longitude: number; }

interface Pharmacy extends ApiPharmacy {
  isFavorite:  boolean;
  distanceKm:  number | null;
}

interface PharmacyScreenProps {
  onNavigate: (screen: string) => void;
}

// ─── Utilitaires ──────────────────────────────────────────────────────────────

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R    = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a    = Math.sin(dLat / 2) ** 2
    + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km: number | null): string {
  if (km === null) return '';
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

function openItinerary(pharmacy: Pharmacy, userLocation: UserLocation | null) {
  const { latitude, longitude } = pharmacy.coordinates;
  if (latitude && longitude) {
    const url = Platform.OS === 'ios'
      ? `maps://app?daddr=${latitude},${longitude}`
      : `google.navigation:q=${latitude},${longitude}`;
    Linking.openURL(url).catch(() =>
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`)
    );
  } else {
    const q = encodeURIComponent(`${pharmacy.name} ${pharmacy.address} Togo`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`);
  }
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

const PharmacyAvatar = React.memo(({
  initials, color, imageUrl, size = 52,
}: {
  initials: string;
  color: string;
  imageUrl?: string | null;
  size?: number;
}) => {
  const [imgError, setImgError] = useState(false);

  // Reset l'erreur si l'URL change
  useEffect(() => { setImgError(false); }, [imageUrl]);

  if (imageUrl && !imgError) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#E8F4FD' }}
        onError={() => setImgError(true)}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={[
      styles.avatarFallback,
      { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
    ]}>
      <Text style={{ color: '#fff', fontWeight: '800', fontSize: size * 0.34, letterSpacing: 1 }}>
        {initials || 'PH'}
      </Text>
    </View>
  );
});

// ─── Carte pharmacie (mémorisée pour éviter les re-renders) ──────────────────

const PharmacyCard = React.memo(({
  pharmacy, isExpanded, locationStatus, userLocation, colors,
  onToggleExpand, onToggleFavorite, onLayout, onItinerary,
}: {
  pharmacy: Pharmacy;
  isExpanded: boolean;
  locationStatus: string;
  userLocation: UserLocation | null;
  colors: any;
  onToggleExpand: () => void;
  onToggleFavorite: () => void;
  onLayout: (y: number) => void;
  onItinerary: () => void;
}) => (
  <View
    style={[styles.pharmacyCard, { backgroundColor: colors.card }]}
    onLayout={(e) => onLayout(e.nativeEvent.layout.y)}>

    {/* En-tête accordéon */}
    <TouchableOpacity style={styles.pharmacyHeader} onPress={onToggleExpand} activeOpacity={0.7}>
      <PharmacyAvatar
        initials={pharmacy.initials || ''}
        color={pharmacy.avatarColor || '#0077b6'}
        imageUrl={pharmacy.imageUrl}
        size={52}
      />

      <View style={styles.pharmacyHeaderInfo}>
        <Text style={[styles.pharmacyName, { color: colors.text }]} numberOfLines={2}>
          {pharmacy.name}
        </Text>

        <View style={styles.metaRow}>
          {pharmacy.zone ? (
            <View style={styles.metaBadge}>
              <Ionicons name="location-outline" size={11} color="#0077b6" />
              <Text style={styles.metaZone} numberOfLines={1}>{pharmacy.zone}</Text>
            </View>
          ) : null}
          {pharmacy.region ? (
            <View style={[styles.metaBadge, styles.metaBadgeRegion]}>
              <Ionicons name="map-outline" size={11} color="#9C27B0" />
              <Text style={styles.metaRegion} numberOfLines={1}>{pharmacy.region}</Text>
            </View>
          ) : null}
          {pharmacy.distanceKm !== null ? (
            <View style={[styles.metaBadge, styles.metaBadgeGreen]}>
              <Ionicons name="navigate-outline" size={11} color="#27ae60" />
              <Text style={styles.metaDist}>{formatDistance(pharmacy.distanceKm)}</Text>
            </View>
          ) : locationStatus === 'granted' ? (
            <View style={[styles.metaBadge, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="navigate-outline" size={11} color="#FF9800" />
              <Text style={[styles.metaDist, { color: '#FF9800' }]}>GPS indisponible</Text>
            </View>
          ) : null}
        </View>

        {pharmacy.address ? (
          <Text style={[styles.addressShort, { color: colors.subText }]} numberOfLines={1}>
            {pharmacy.address}
          </Text>
        ) : null}
      </View>

      <View style={styles.headerActions}>
        <TouchableOpacity onPress={onToggleFavorite} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons
            name={pharmacy.isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={pharmacy.isFavorite ? '#e74c3c' : colors.subText}
          />
        </TouchableOpacity>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.subText}
          style={{ marginTop: 6 }}
        />
      </View>
    </TouchableOpacity>

    {/* Détails dépliés */}
    {isExpanded && (
      <View style={[styles.pharmacyDetails, { borderTopColor: colors.border }]}>

        {pharmacy.imageUrl ? (
          <Image
            source={{ uri: pharmacy.imageUrl }}
            style={styles.pharmacyImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.pharmacyImagePlaceholder}>
            <PharmacyAvatar
              initials={pharmacy.initials || ''}
              color={pharmacy.avatarColor || '#0077b6'}
              imageUrl={null}
              size={80}
            />
            <Text style={styles.pharmacyImageLabel}>{pharmacy.name}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Ionicons name="location" size={17} color="#0077b6" />
          <Text style={[styles.detailText, { color: colors.subText }]}>
            {[pharmacy.address, pharmacy.city].filter(Boolean).join(', ')}
          </Text>
        </View>

        {pharmacy.region ? (
          <View style={styles.detailRow}>
            <Ionicons name="map" size={17} color="#9C27B0" />
            <Text style={[styles.detailText, { color: colors.subText }]}>Région {pharmacy.region}</Text>
          </View>
        ) : null}

        {pharmacy.phone ? (
          <TouchableOpacity style={styles.detailRow} onPress={() => Linking.openURL(`tel:${pharmacy.phone}`)}>
            <Ionicons name="call" size={17} color="#0077b6" />
            <Text style={[styles.detailTextLink, { color: '#0077b6' }]}>{pharmacy.phone}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={17} color={colors.subText} />
            <Text style={[styles.detailText, { color: colors.subText }]}>Numéro non disponible</Text>
          </View>
        )}

        {pharmacy.email ? (
          <TouchableOpacity style={styles.detailRow} onPress={() => Linking.openURL(`mailto:${pharmacy.email}`)}>
            <Ionicons name="mail" size={17} color="#0077b6" />
            <Text style={[styles.detailTextLink, { color: '#0077b6' }]}>{pharmacy.email}</Text>
          </TouchableOpacity>
        ) : null}

        {pharmacy.gardeFrom && pharmacy.gardeTo && (
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={17} color="#0077b6" />
            <Text style={[styles.detailText, { color: colors.subText }]}>
              Garde du {pharmacy.gardeFrom} au {pharmacy.gardeTo}
            </Text>
          </View>
        )}

        {pharmacy.horaires?.length > 0 && (
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={17} color="#0077b6" />
            <View style={{ flex: 1 }}>
              {pharmacy.horaires.map((h: PharmacyHoraire, i: number) => (
                <Text key={i} style={[styles.detailText, { color: colors.subText }]}>
                  {h.jour} : {h.ouverture} – {h.fermeture}
                </Text>
              ))}
            </View>
          </View>
        )}

        {pharmacy.distanceKm !== null && (
          <View style={styles.detailRow}>
            <Ionicons name="navigate" size={17} color="#27ae60" />
            <Text style={[styles.detailText, { color: '#27ae60' }]}>
              À {formatDistance(pharmacy.distanceKm)} de votre position
            </Text>
          </View>
        )}

        {pharmacy.insurances?.length > 0 && (
          <View>
            <Text style={[styles.insurancesTitle, { color: colors.subText }]}>Assurances acceptées :</Text>
            <View style={styles.insurancesTags}>
              {pharmacy.insurances.map((ins, i) => (
                <View key={i} style={styles.insuranceTag}>
                  <Text style={styles.insuranceTagText}>{ins}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.pharmacyActions}>
          {pharmacy.isOnDuty ? (
            <View style={styles.dutyBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#0077b6" />
              <Text style={styles.dutyBadgeText}>De garde</Text>
            </View>
          ) : (
            <View style={[styles.dutyBadge, styles.notDutyBadge]}>
              <Ionicons name="time-outline" size={14} color="#607D8B" />
              <Text style={styles.notDutyBadgeText}>Hors garde</Text>
            </View>
          )}
          <TouchableOpacity style={styles.itineraryButton} onPress={onItinerary}>
            <Ionicons name="navigate" size={17} color="#fff" />
            <Text style={styles.itineraryButtonText}>Itinéraire</Text>
          </TouchableOpacity>
        </View>
      </View>
    )}
  </View>
));

// ─── Composant principal ──────────────────────────────────────────────────────

const PharmacyScreen = ({ onNavigate }: PharmacyScreenProps) => {
  const { colors } = useApp();

  // ── UI ──────────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery]           = useState('');
  const [activeFilter, setActiveFilter]         = useState('all');
  const [viewMode, setViewMode]                 = useState<'on-call' | 'all'>('on-call');
  const [selectedRegion, setSelectedRegion]     = useState('');
  const [expandedId, setExpandedId]             = useState<string | null>(null);
  const scrollViewRef                            = useRef<ScrollView>(null);
  const pharmacyPositions                        = useRef<Record<string, number>>({});

  // ── Données ─────────────────────────────────────────────────────────────────
  const [onCallPharmacies, setOnCallPharmacies] = useState<Pharmacy[]>([]);
  const [allPharmaciesData, setAllPharmaciesData] = useState<Pharmacy[]>([]);
  const [regions, setRegions]                   = useState<string[]>([]);

  // ── États de chargement séparés ─────────────────────────────────────────────
  const [loadingOnCall, setLoadingOnCall]       = useState(true);   // bloquant
  const [loadingAll, setLoadingAll]             = useState(false);  // silencieux
  const [error, setError]                       = useState<string | null>(null);

  // ── Localisation ────────────────────────────────────────────────────────────
  const [userLocation, setUserLocation]         = useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus]     = useState<'pending' | 'granted' | 'denied'>('pending');
  const [geocodingProgress, setGeocodingProgress] = useState<'idle' | 'loading' | 'done'>('idle');
  const geocodedCache = useRef<Record<string, { latitude: number; longitude: number }>>({});
  const geocodingRef  = useRef(false); // verrou pour éviter les doubles runs

  // ── Localisation ────────────────────────────────────────────────────────────
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

  useEffect(() => { requestLocation(); }, [requestLocation]);

  // ── Distances ───────────────────────────────────────────────────────────────
  const withDistances = useCallback((list: Pharmacy[], loc: UserLocation | null): Pharmacy[] =>
    list.map((p) => ({
      ...p,
      distanceKm: loc && p.coordinates.latitude && p.coordinates.longitude
        ? haversineDistance(loc.latitude, loc.longitude, p.coordinates.latitude, p.coordinates.longitude)
        : null,
    })), []);

  const sortByDistance = useCallback((arr: Pharmacy[]): Pharmacy[] =>
    [...arr].sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999)), []);

  // Recalcul distances si position change après chargement
  useEffect(() => {
    if (!userLocation) return;
    const recalc = (arr: Pharmacy[]) => sortByDistance(withDistances(arr, userLocation));
    setOnCallPharmacies((p) => recalc(p));
    setAllPharmaciesData((p) => recalc(p));
  }, [userLocation]);

  // ── Favoris ─────────────────────────────────────────────────────────────────
  const loadFavorites = async (): Promise<string[]> => {
    try {
      const s = await AsyncStorage.getItem(FAVORITES_KEY);
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  };

  const toggleFavorite = useCallback(async (id: string) => {
    const toggle = (arr: Pharmacy[]) => arr.map((p) => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p);
    setOnCallPharmacies(toggle);
    setAllPharmaciesData(toggle);
    const favorites = await loadFavorites();
    const next = favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id];
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  }, []);

  // ── Format une liste brute → Pharmacy[] ─────────────────────────────────────
  const formatList = useCallback((
    list: ApiPharmacy[],
    favorites: string[],
    onDutySlugs: Set<string>,
    loc: UserLocation | null,
    forceOnDuty = false,
  ): Pharmacy[] => {
    const mapped: Pharmacy[] = list.map((p) => ({
      ...p,
      isOnDuty:   forceOnDuty || onDutySlugs.has(p.slug),
      isFavorite: favorites.includes(p.id),
      distanceKm: null,
    }));
    return sortByDistance(withDistances(mapped, loc));
  }, [withDistances, sortByDistance]);

  // ── Géocodage Nominatim ──────────────────────────────────────────────────────
  const geocodeAddress = useCallback(async (address: string) => {
    const key = address.trim().toLowerCase();
    if (geocodedCache.current[key]) return geocodedCache.current[key];
    try {
      const q   = encodeURIComponent(address + ', Togo');
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=tg`,
        { headers: { 'User-Agent': 'PharmacieTogoApp/2.0', 'Accept-Language': 'fr' } }
      );
      const data = await res.json();
      if (data?.[0]) {
        const coords = { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
        geocodedCache.current[key] = coords;
        return coords;
      }
    } catch { /* silencieux */ }
    return null;
  }, []);

  const runGeocoding = useCallback(async (
    list: Pharmacy[],
    setter: React.Dispatch<React.SetStateAction<Pharmacy[]>>,
    loc: UserLocation | null,
  ) => {
    if (geocodingRef.current) return;
    const toGeocode = list.filter((p) => !p.coordinates.latitude && p.address);
    if (!toGeocode.length) { setGeocodingProgress('done'); return; }

    geocodingRef.current = true;
    setGeocodingProgress('loading');

    for (const pharmacy of toGeocode) {
      await new Promise((r) => setTimeout(r, 1200));
      const coords = await geocodeAddress(pharmacy.address);
      if (!coords) continue;

      setter((prev) => {
        const updated = prev.map((p) => {
          if (p.id !== pharmacy.id) return p;
          const distanceKm = loc
            ? haversineDistance(loc.latitude, loc.longitude, coords.latitude, coords.longitude)
            : null;
          return { ...p, coordinates: coords, distanceKm };
        });
        return sortByDistance(updated);
      });
    }

    geocodingRef.current = false;
    setGeocodingProgress('done');
  }, [geocodeAddress, sortByDistance]);

  // ── ÉTAPE 1 : Charger uniquement les pharmacies de garde (rapide, bloquant) ─
  const fetchOnCall = useCallback(async (forceRefresh = false) => {
    setLoadingOnCall(true);
    setError(null);
    try {
      if (forceRefresh) await refreshPharmacyCache().catch(() => {});
      const [onCallData, favorites] = await Promise.all([
        getOnCallPharmacies(),
        loadFavorites(),
      ]);
      const formatted = formatList(onCallData, favorites, new Set(), userLocation, true);
      setOnCallPharmacies(formatted);
      return { onCallData, favorites };
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Connexion impossible');
      return null;
    } finally {
      setLoadingOnCall(false);
    }
  }, [userLocation, formatList]);

  // ── ÉTAPE 2 : Charger toutes les pharmacies en arrière-plan (silencieux) ────
  const fetchAllBackground = useCallback(async (
    onCallData: ApiPharmacy[],
    favorites: string[],
  ) => {
    setLoadingAll(true);
    try {
      const { pharmacies: allData, regions: availableRegions } = await getAllPharmacies();
      setRegions(availableRegions);
      const onDutySlugs = new Set(onCallData.map((p) => p.slug));
      const formatted   = formatList(allData, favorites, onDutySlugs, userLocation);
      setAllPharmaciesData(formatted);

      // Enrichit aussi la liste on-call avec images/région récupérés du catalogue complet
      const imagesBySlug  = Object.fromEntries(allData.map((p) => [p.slug, p.imageUrl]));
      const regionBySlug  = Object.fromEntries(allData.map((p) => [p.slug, p.region]));
      setOnCallPharmacies((prev) =>
        prev.map((p) => ({
          ...p,
          imageUrl: p.imageUrl ?? imagesBySlug[p.slug] ?? null,
          region:   p.region   || regionBySlug[p.slug]  || '',
        }))
      );

      return formatted;
    } catch { /* silencieux — la liste on-call reste affichée */ }
    finally { setLoadingAll(false); }
    return null;
  }, [userLocation, formatList]);

  // ── Initialisation ───────────────────────────────────────────────────────────
  useEffect(() => {
    fetchOnCall().then((result) => {
      if (!result) return;
      const { onCallData, favorites } = result;

      // Lance le géocodage des on-call immédiatement
      runGeocoding(
        onCallData.map((p) => ({ ...p, isFavorite: false, distanceKm: null })),
        setOnCallPharmacies,
        userLocation,
      );

      // Charge la liste complète en arrière-plan avec un léger délai
      setTimeout(() => {
        fetchAllBackground(onCallData, favorites).then((allList) => {
          if (allList) {
            setTimeout(() => runGeocoding(allList, setAllPharmaciesData, userLocation), 3000);
          }
        });
      }, 800);
    });
  }, []);

  // ── Rafraîchissement complet ─────────────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    geocodingRef.current = false;
    setGeocodingProgress('idle');
    const result = await fetchOnCall(true);
    if (!result) return;
    fetchAllBackground(result.onCallData, result.favorites);
  }, [fetchOnCall, fetchAllBackground]);

  // ── Accordéon ────────────────────────────────────────────────────────────────
  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const scrollToPharmacy = useCallback((id: string) => {
    const pos = pharmacyPositions.current[id];
    if (pos !== undefined && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: pos - 100, animated: true });
      setExpandedId(id);
    }
  }, []);

  // ── Listes filtrées (mémorisées) ─────────────────────────────────────────────
  const activeList = viewMode === 'on-call' ? onCallPharmacies : allPharmaciesData;

  const filteredPharmacies = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return activeList.filter((p) => {
      const matchSearch = !q
        || p.name.toLowerCase().includes(q)
        || p.address.toLowerCase().includes(q)
        || p.zone.toLowerCase().includes(q);
      const matchRegion = !selectedRegion || p.region === selectedRegion;
      if (!matchSearch || !matchRegion) return false;
      if (activeFilter === 'nearby')    return p.distanceKm !== null && p.distanceKm <= 5;
      if (activeFilter === 'favorites') return p.isFavorite;
      return true;
    });
  }, [activeList, searchQuery, selectedRegion, activeFilter]);

  const favoritePharmacies = useMemo(
    () => activeList.filter((p) => p.isFavorite),
    [activeList]
  );

  // ── Écran de chargement (seulement pour le premier chargement on-call) ───────
  if (loadingOnCall) return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Pharmacies" onBack={() => onNavigate('home')}
        showNotification unreadCount={4} onNotificationPress={() => onNavigate('messages')} />
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0077b6" />
        <Text style={[styles.loadingText, { color: colors.subText }]}>
          Chargement des pharmacies de garde...
        </Text>
      </View>
      <BottomNavigation currentScreen="pharmacy" onNavigate={onNavigate} />
    </SafeAreaView>
  );

  if (error) return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Pharmacies" onBack={() => onNavigate('home')}
        showNotification unreadCount={4} onNotificationPress={() => onNavigate('messages')} />
      <View style={styles.centerContainer}>
        <Ionicons name="wifi-outline" size={60} color={colors.subText} />
        <Text style={[styles.errorTitle, { color: colors.text }]}>Connexion impossible</Text>
        <Text style={[styles.errorSubtitle, { color: colors.subText }]}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
      <BottomNavigation currentScreen="pharmacy" onNavigate={onNavigate} />
    </SafeAreaView>
  );

  // ── Rendu ────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Pharmacies" onBack={() => onNavigate('home')}
        showNotification unreadCount={4} onNotificationPress={() => onNavigate('messages')} />

      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false} removeClippedSubviews>

        {/* Toggle De garde / Toutes */}
        <View style={styles.modeToggle}>
          {(['on-call', 'all'] as const).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[styles.modeBtn, viewMode === mode && styles.modeBtnActive]}
              onPress={() => { setViewMode(mode); setExpandedId(null); }}>
              <Ionicons
                name={mode === 'on-call' ? 'moon-outline' : 'medical-outline'}
                size={14}
                color={viewMode === mode ? '#fff' : '#0077b6'}
              />
              <Text style={[styles.modeBtnText, viewMode === mode && styles.modeBtnTextActive]}>
                {mode === 'on-call' ? 'De garde' : 'Toutes'}
              </Text>
              <View style={[styles.modeBadge, viewMode === mode && styles.modeBadgeActive]}>
                {mode === 'all' && loadingAll
                  ? <ActivityIndicator size="small" color="#0077b6" style={{ width: 18 }} />
                  : <Text style={[styles.modeBadgeText, viewMode === mode && { color: '#0077b6' }]}>
                      {mode === 'on-call' ? onCallPharmacies.length : allPharmaciesData.length}
                    </Text>
                }
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bandeau localisation */}
        {locationStatus === 'denied' && (
          <TouchableOpacity style={styles.locationBanner} onPress={requestLocation}>
            <Ionicons name="location-outline" size={16} color="#fff" />
            <Text style={styles.locationBannerText}>Activer la localisation pour voir les distances</Text>
          </TouchableOpacity>
        )}
        {locationStatus === 'granted' && (
          <View style={styles.locationGranted}>
            <Ionicons name="location" size={13} color="#0077b6" />
            <Text style={styles.locationGrantedText}>
              {geocodingProgress === 'loading'
                ? 'Calcul des distances...'
                : 'Triées par distance depuis votre position'}
            </Text>
            {geocodingProgress === 'loading' && (
              <ActivityIndicator size="small" color="#0077b6" style={{ marginLeft: 6 }} />
            )}
          </View>
        )}

        {/* Barre de recherche */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="search-outline" size={20} color={colors.subText} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Nom, quartier, zone..."
              placeholderTextColor={colors.subText}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={colors.subText} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleRefresh}>
            <Ionicons name="refresh-outline" size={20} color="#0077b6" />
          </TouchableOpacity>
        </View>

        {/* Filtres rapides */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer} contentContainerStyle={styles.filtersContent}>
          {[
            { key: 'all',       label: 'Toutes',  icon: 'medical-outline'  },
            { key: 'nearby',    label: '< 5 km',  icon: 'navigate-outline' },
            { key: 'favorites', label: 'Favoris', icon: 'heart-outline'    },
          ].map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterChip,
                { backgroundColor: colors.card, borderColor: colors.border },
                activeFilter === f.key && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(f.key)}>
              <Ionicons name={f.icon as any} size={13} color={activeFilter === f.key ? '#0077b6' : colors.subText} />
              <Text style={[styles.filterChipText, { color: colors.subText }, activeFilter === f.key && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Filtre régions */}
        {regions.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            style={{ paddingLeft: 20, marginBottom: 12 }}
            contentContainerStyle={{ paddingRight: 20, gap: 8 }}>
            {(['', ...regions]).map((r) => (
              <TouchableOpacity
                key={r || '__all__'}
                style={[
                  styles.regionChip,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  selectedRegion === r && styles.regionChipActive,
                ]}
                onPress={() => setSelectedRegion(r)}>
                <Ionicons name="map-outline" size={12} color={selectedRegion === r ? '#9C27B0' : colors.subText} />
                <Text style={[styles.regionChipText, { color: colors.subText }, selectedRegion === r && styles.regionChipTextActive]}>
                  {r || 'Tout le Togo'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Carrousel Favoris */}
        {favoritePharmacies.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Favoris</Text>
              <Text style={styles.sectionCount}>{favoritePharmacies.length}</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH + CARD_MARGIN * 2} decelerationRate="fast"
              contentContainerStyle={styles.carouselContent}>
              {favoritePharmacies.map((p, index) => (
                <View key={p.id} style={[styles.carouselCard, { backgroundColor: colors.card }, index === 0 && styles.carouselCardFirst]}>
                  <View style={styles.carouselTop}>
                    <PharmacyAvatar initials={p.initials || ''} color={p.avatarColor || '#0077b6'} imageUrl={p.imageUrl} size={44} />
                    <TouchableOpacity onPress={() => toggleFavorite(p.id)} style={styles.heartBtn}>
                      <Ionicons name="heart" size={18} color="#e74c3c" />
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.carouselName, { color: colors.text }]} numberOfLines={2}>{p.name}</Text>
                  {p.zone   ? <Text style={styles.carouselZone}   numberOfLines={1}>{p.zone}</Text>   : null}
                  {p.region ? <Text style={styles.carouselRegion} numberOfLines={1}>{p.region}</Text> : null}
                  {p.distanceKm !== null ? <Text style={styles.carouselDistance}>{formatDistance(p.distanceKm)}</Text> : null}
                  <TouchableOpacity style={styles.detailsButton} onPress={() => scrollToPharmacy(p.id)}>
                    <Text style={styles.detailsButtonText}>Voir détails</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Liste accordéon */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle1, { color: colors.text }]}>
              {viewMode === 'on-call' ? 'Pharmacies de garde' : 'Toutes les pharmacies'}
            </Text>
            <Text style={styles.sectionCount}>{filteredPharmacies.length}</Text>
          </View>

          {filteredPharmacies.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="medical-outline" size={50} color={colors.subText} />
              <Text style={[styles.emptyText, { color: colors.subText }]}>Aucune pharmacie trouvée</Text>
            </View>
          )}

          {filteredPharmacies.map((pharmacy) => (
            <PharmacyCard
              key={pharmacy.id}
              pharmacy={pharmacy}
              isExpanded={expandedId === pharmacy.id}
              locationStatus={locationStatus}
              userLocation={userLocation}
              colors={colors}
              onToggleExpand={() => toggleExpand(pharmacy.id)}
              onToggleFavorite={() => toggleFavorite(pharmacy.id)}
              onLayout={(y) => { pharmacyPositions.current[pharmacy.id] = y; }}
              onItinerary={() => openItinerary(pharmacy, userLocation)}
            />
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNavigation currentScreen="pharmacy" onNavigate={onNavigate} />
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:       { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, gap: 15 },
  loadingText:     { fontSize: 14, textAlign: 'center', marginTop: 12 },
  errorTitle:      { fontSize: 18, fontWeight: '600', textAlign: 'center' },
  errorSubtitle:   { fontSize: 13, textAlign: 'center' },
  retryButton:     { backgroundColor: '#0077b6', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25, marginTop: 10 },
  retryButtonText: { color: '#fff', fontWeight: '600' },

  modeToggle:        { flexDirection: 'row', marginHorizontal: 20, marginTop: 14, backgroundColor: '#E3F2FD', borderRadius: 25, padding: 3, gap: 3 },
  modeBtn:           { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9, borderRadius: 22 },
  modeBtnActive:     { backgroundColor: '#0077b6' },
  modeBtnText:       { fontSize: 13, fontWeight: '600', color: '#0077b6' },
  modeBtnTextActive: { color: '#fff' },
  modeBadge:         { backgroundColor: '#fff', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 10, minWidth: 22, alignItems: 'center' },
  modeBadgeActive:   { backgroundColor: '#E3F2FD' },
  modeBadgeText:     { fontSize: 10, fontWeight: '700', color: '#0077b6' },

  locationBanner:      { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#e67e22', marginHorizontal: 20, marginTop: 12, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 12 },
  locationBannerText:  { color: '#fff', fontSize: 13, flex: 1 },
  locationGranted:     { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 20, paddingTop: 10 },
  locationGrantedText: { fontSize: 12, color: '#0077b6' },

  searchContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 10, gap: 10 },
  searchBar:       { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 25, paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1, gap: 8 },
  searchInput:     { flex: 1, fontSize: 14 },
  filterButton:    { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },

  filtersContainer:     { paddingLeft: 20, marginBottom: 10 },
  filtersContent:       { paddingRight: 20, gap: 8 },
  filterChip:           { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  filterChipActive:     { backgroundColor: '#E3F2FD', borderColor: '#0077b6' },
  filterChipText:       { fontSize: 13, fontWeight: '500' },
  filterChipTextActive: { color: '#0077b6' },

  regionChip:           { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  regionChipActive:     { backgroundColor: '#F3E5F5', borderColor: '#9C27B0' },
  regionChipText:       { fontSize: 12, fontWeight: '500' },
  regionChipTextActive: { color: '#9C27B0' },

  section:          { marginBottom: 20 },
  sectionHeader:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12, gap: 8 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 14, gap: 10 },
  sectionTitle:     { fontSize: 17, fontWeight: 'bold' },
  sectionTitle1:    { fontSize: 17, fontWeight: 'bold', flex: 1 },
  sectionCount:     { fontSize: 12, backgroundColor: '#E3F2FD', color: '#0077b6', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 10, overflow: 'hidden' },

  carouselContent:   { paddingRight: 20 },
  carouselCard:      { width: CARD_WIDTH, marginLeft: CARD_MARGIN, marginRight: CARD_MARGIN, borderRadius: 16, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3 },
  carouselCardFirst: { marginLeft: 20 },
  carouselTop:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  heartBtn:          { padding: 4 },
  carouselName:      { fontSize: 14, fontWeight: '700', lineHeight: 20, marginBottom: 4 },
  carouselZone:      { fontSize: 11, color: '#0077b6', marginBottom: 1 },
  carouselRegion:    { fontSize: 11, color: '#9C27B0', marginBottom: 2 },
  carouselDistance:  { fontSize: 11, color: '#27ae60', marginBottom: 10 },
  detailsButton:     { backgroundColor: '#0077b6', paddingVertical: 9, borderRadius: 20, alignItems: 'center' },
  detailsButtonText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  avatarFallback: { justifyContent: 'center', alignItems: 'center' },

  pharmacyCard:    { marginHorizontal: 20, marginBottom: 10, borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 },
  pharmacyHeader:  { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  pharmacyHeaderInfo: { flex: 1 },
  pharmacyName:    { fontSize: 15, fontWeight: '700', lineHeight: 21, marginBottom: 5 },

  metaRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 3 },
  metaBadge:       { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#EBF5FB', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  metaBadgeGreen:  { backgroundColor: '#EAFAF1' },
  metaBadgeRegion: { backgroundColor: '#F3E5F5' },
  metaZone:        { fontSize: 11, color: '#0077b6', fontWeight: '500' },
  metaDist:        { fontSize: 11, color: '#27ae60', fontWeight: '500' },
  metaRegion:      { fontSize: 11, color: '#9C27B0', fontWeight: '500' },
  addressShort:    { fontSize: 12, lineHeight: 17 },
  headerActions:   { alignItems: 'center', gap: 4, paddingLeft: 6 },

  pharmacyDetails:          { paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, paddingTop: 14, gap: 10 },
  pharmacyImage:            { width: '100%', height: 160, borderRadius: 10 },
  pharmacyImagePlaceholder: { width: '100%', height: 110, backgroundColor: '#E8F4FD', justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  pharmacyImageLabel:       { fontSize: 12, color: '#0077b6', fontWeight: '600', marginTop: 4 },
  detailRow:                { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  detailText:               { fontSize: 14, flex: 1, lineHeight: 20 },
  detailTextLink:           { fontSize: 14, flex: 1, lineHeight: 20, textDecorationLine: 'underline' },

  insurancesTitle:  { fontSize: 12, marginBottom: 6 },
  insurancesTags:   { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  insuranceTag:     { backgroundColor: '#E3F2FD', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  insuranceTagText: { fontSize: 11, color: '#0077b6' },

  pharmacyActions:     { flexDirection: 'row', gap: 10, marginTop: 4 },
  dutyBadge:           { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#E3F2FD', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  dutyBadgeText:       { color: '#0077b6', fontSize: 13, fontWeight: '600' },
  notDutyBadge:        { backgroundColor: '#ECEFF1' },
  notDutyBadgeText:    { color: '#607D8B', fontSize: 13, fontWeight: '600' },
  itineraryButton:     { flex: 1, backgroundColor: '#0077b6', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 20, gap: 8 },
  itineraryButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  emptyContainer: { alignItems: 'center', paddingVertical: 50, gap: 12 },
  emptyText:      { fontSize: 14, textAlign: 'center' },
});

export default PharmacyScreen;