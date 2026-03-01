import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  refreshPharmacyCache,
  type Pharmacy as ApiPharmacy,
  type PharmacyHoraire,
} from '../services/pharmacyService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.48;
const CARD_MARGIN = 8;
const FAVORITES_KEY = '@pharmacies_favorites';

interface UserLocation { latitude: number; longitude: number; }

interface Pharmacy extends ApiPharmacy {
  isFavorite: boolean;
  distanceKm: number | null;
}

interface PharmacyScreenProps {
  onNavigate: (screen: string) => void;
}

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
    const q = encodeURIComponent(`${pharmacy.name} ${pharmacy.address} Lomé Togo`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`);
  }
}

// ─── Images personnalisées (ajoutez vos photos ici) ──────────────────────────
// Associez le slug de la pharmacie à une image locale ou URL
// Exemples :
//   'pharmacie-du-centre':    require('../assets/images/du-centre.jpg'),
//   'pharmacie-saint-paul':   { uri: 'https://votre-serveur.com/saint-paul.jpg' },
const PHARMACY_IMAGES: Record<string, any> = {
  // Ajoutez vos images ici :
  // 'pharmacie-du-centre': require('../assets/images/du-centre.jpg'),
};

function getPharmacyImage(slug?: string): any | null {
  if (!slug) return null;
  return PHARMACY_IMAGES[slug] ?? null;
}

// ─── Avatar : image réelle si dispo, sinon initiales colorées ────────────────
const PharmacyAvatar = ({
  initials, color, slug, size = 52
}: { initials: string; color: string; slug?: string; size?: number }) => {
  const [imgError, setImgError] = React.useState(false);
  const customImage = slug ? getPharmacyImage(slug) : null;

  if (customImage && !imgError) {
    return (
      <Image
        source={customImage}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <View style={[styles.avatarFallback, {
      width: size, height: size, borderRadius: size / 2, backgroundColor: color
    }]}>
      <Text style={{ color: '#fff', fontWeight: '800', fontSize: size * 0.34, letterSpacing: 1 }}>
        {initials || 'PH'}
      </Text>
    </View>
  );
};

// ─── Composant principal ──────────────────────────────────────────────────────
const PharmacyScreen = ({ onNavigate }: PharmacyScreenProps) => {
  const { colors } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [pharmacyPositions, setPharmacyPositions] = useState<{[key: string]: number}>({});

  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [geocodingProgress, setGeocodingProgress] = useState<'idle' | 'loading' | 'done'>('idle');
  const geocodedCacheRef = React.useRef<Record<string, {latitude: number; longitude: number}>>({});

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

  const applyDistances = useCallback((list: Pharmacy[], loc: UserLocation | null): Pharmacy[] =>
    list.map((p) => ({
      ...p,
      distanceKm: (loc && p.coordinates.latitude && p.coordinates.longitude)
        ? haversineDistance(loc.latitude, loc.longitude, p.coordinates.latitude, p.coordinates.longitude)
        : null,
    }))
  , []);

  useEffect(() => {
    if (userLocation && pharmacies.length > 0) {
      setPharmacies((prev) =>
        [...applyDistances(prev, userLocation)].sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999))
      );
    }
  }, [userLocation]);

  const loadFavorites = async (): Promise<string[]> => {
    try { const s = await AsyncStorage.getItem(FAVORITES_KEY); return s ? JSON.parse(s) : []; }
    catch { return []; }
  };

  const fetchPharmacies = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      if (forceRefresh) await refreshPharmacyCache().catch(() => {});
      const data = await getOnCallPharmacies();
      const favorites = await loadFavorites();
      const formatted: Pharmacy[] = data.map((p) => ({
        ...p,
        isFavorite: favorites.includes(p.id),
        distanceKm: null,
        slug: (p as any).slug ?? '',
      }));
      const withDist = applyDistances(formatted, userLocation);
      const sorted = [...withDist].sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
      setPharmacies(sorted);
      return sorted; // retourné pour le géocodage en arrière-plan
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Connexion impossible');
      return null;
    } finally {
      setLoading(false);
    }
  }, [userLocation]);

  // ─── Géocodage direct depuis React Native (sans passer par Symfony) ─────────
  const geocodeAddressRN = async (address: string): Promise<{latitude: number; longitude: number} | null> => {
    // Vérifie le cache en mémoire d'abord
    const cacheKey = address.trim().toLowerCase();
    if (geocodedCacheRef.current[cacheKey]) return geocodedCacheRef.current[cacheKey];

    try {
      const query = encodeURIComponent(address + ', Lomé, Togo');
      const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=tg`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'PharmacieGardeTogoApp/1.0', 'Accept-Language': 'fr' },
      });
      const data = await res.json();
      if (data && data[0]) {
        const coords = { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
        geocodedCacheRef.current[cacheKey] = coords;
        return coords;
      }
    } catch { /* silencieux */ }
    return null;
  };

  const runBackgroundGeocoding = useCallback(async (list: Pharmacy[]) => {
    if (geocodingProgress !== 'idle') return;
    const toGeocode = list.filter((p) => !p.coordinates.latitude && p.address);
    if (toGeocode.length === 0) { setGeocodingProgress('done'); return; }

    setGeocodingProgress('loading');

    for (const pharmacy of toGeocode) {
      await new Promise((r) => setTimeout(r, 1100)); // 1.1s entre chaque (règle Nominatim)
      const coords = await geocodeAddressRN(pharmacy.address);
      if (!coords) continue;

      setPharmacies((prev) => {
        const updated = prev.map((p) => {
          if (p.id !== pharmacy.id) return p;
          const distanceKm = userLocation
            ? haversineDistance(userLocation.latitude, userLocation.longitude, coords.latitude, coords.longitude)
            : null;
          return { ...p, coordinates: coords, distanceKm };
        });
        return [...updated].sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
      });
    }

    setGeocodingProgress('done');
  }, [geocodingProgress, userLocation]);

  useEffect(() => {
    fetchPharmacies().then((loadedPharmacies) => {
      if (loadedPharmacies) runBackgroundGeocoding(loadedPharmacies);
    });
  }, []);

  const toggleFavorite = async (id: string) => {
    setPharmacies((prev) => prev.map((p) => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p));
    const favorites = await loadFavorites();
    const newFav = favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id];
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFav));
  };

  const toggleExpand = (id: string) => setExpandedId(expandedId === id ? null : id);

  const scrollToPharmacy = (id: string) => {
    const pos = pharmacyPositions[id];
    if (pos && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: pos - 100, animated: true });
      setExpandedId(id);
    }
  };

  const filteredPharmacies = pharmacies.filter((p) => {
    const q = searchQuery.toLowerCase();
    const match = p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q) || p.zone.toLowerCase().includes(q);
    if (activeFilter === 'nearby') return match && p.distanceKm !== null && p.distanceKm <= 5;
    if (activeFilter === 'favorites') return match && p.isFavorite;
    return match;
  });

  const favoritePharmacies = pharmacies.filter((p) => p.isFavorite);

  if (loading) return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Pharmacies de garde" onBack={() => onNavigate('home')} showNotification unreadCount={4} onNotificationPress={() => onNavigate('messages')} />
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0077b6" />
        <Text style={[styles.loadingText, { color: colors.subText }]}>Chargement des pharmacies de garde...</Text>
      </View>
      <BottomNavigation currentScreen="pharmacy" onNavigate={onNavigate} />
    </SafeAreaView>
  );

  if (error) return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Pharmacies de garde" onBack={() => onNavigate('home')} showNotification unreadCount={4} onNotificationPress={() => onNavigate('messages')} />
      <View style={styles.centerContainer}>
        <Ionicons name="wifi-outline" size={60} color={colors.subText} />
        <Text style={[styles.errorTitle, { color: colors.text }]}>Connexion impossible</Text>
        <Text style={[styles.errorSubtitle, { color: colors.subText }]}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchPharmacies()}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
      <BottomNavigation currentScreen="pharmacy" onNavigate={onNavigate} />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Pharmacies de garde" onBack={() => onNavigate('home')} showNotification unreadCount={4} onNotificationPress={() => onNavigate('messages')} />

      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>

        {/* Bandeau localisation refusée */}
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
                ? 'Calcul des distances en cours...'
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
            <TextInput style={[styles.searchInput, { color: colors.text }]}
              placeholder="Nom, quartier, zone..." placeholderTextColor={colors.subText}
              value={searchQuery} onChangeText={setSearchQuery} />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={colors.subText} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={[styles.filterButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => fetchPharmacies(true)}>
            <Ionicons name="refresh-outline" size={20} color="#0077b6" />
          </TouchableOpacity>
        </View>

        {/* Filtres */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer} contentContainerStyle={styles.filtersContent}>
          {[
            { key: 'all', label: 'Toutes', icon: 'medical-outline' },
            { key: 'nearby', label: '< 5 km', icon: 'navigate-outline' },
            { key: 'favorites', label: 'Favoris', icon: 'heart-outline' },
          ].map((f) => (
            <TouchableOpacity key={f.key}
              style={[styles.filterChip, { backgroundColor: colors.card, borderColor: colors.border }, activeFilter === f.key && styles.filterChipActive]}
              onPress={() => setActiveFilter(f.key)}>
              <Ionicons name={f.icon as any} size={13} color={activeFilter === f.key ? '#0077b6' : colors.subText} />
              <Text style={[styles.filterChipText, { color: colors.subText }, activeFilter === f.key && styles.filterChipTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

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
                    <PharmacyAvatar initials={(p as any).initials || ''} color={(p as any).avatarColor || '#0077b6'} slug={(p as any).slug} size={44} />
                    <TouchableOpacity onPress={() => toggleFavorite(p.id)} style={styles.heartBtn}>
                      <Ionicons name="heart" size={18} color="#e74c3c" />
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.carouselName, { color: colors.text }]} numberOfLines={2}>{p.name}</Text>
                  {p.zone ? <Text style={styles.carouselZone} numberOfLines={1}>{p.zone}</Text> : null}
                  {p.distanceKm !== null && <Text style={styles.carouselDistance}>{formatDistance(p.distanceKm)}</Text>}
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
            <Text style={[styles.sectionTitle1, { color: colors.text }]}>Pharmacies de garde</Text>
            <Text style={styles.sectionCount}>{filteredPharmacies.length}</Text>
          </View>

          {filteredPharmacies.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="medical-outline" size={50} color={colors.subText} />
              <Text style={[styles.emptyText, { color: colors.subText }]}>Aucune pharmacie trouvée</Text>
            </View>
          )}

          {filteredPharmacies.map((pharmacy) => (
            <View key={pharmacy.id}
              style={[styles.pharmacyCard, { backgroundColor: colors.card }]}
              onLayout={(e) => {
                const y = e.nativeEvent.layout.y; // lire AVANT setState (event pooling)
                setPharmacyPositions(prev => ({ ...prev, [pharmacy.id]: y }));
              }}>

              {/* ── EN-TÊTE DE L'ACCORDÉON (toujours visible) ── */}
              <TouchableOpacity style={styles.pharmacyHeader} onPress={() => toggleExpand(pharmacy.id)} activeOpacity={0.7}>

                {/* Avatar */}
                <PharmacyAvatar initials={(pharmacy as any).initials || ''} color={(pharmacy as any).avatarColor || '#0077b6'} slug={(pharmacy as any).slug} size={52} />

                {/* Infos principales */}
                <View style={styles.pharmacyHeaderInfo}>
                  {/* NOM — toujours visible même accordéon fermé */}
                  <Text style={[styles.pharmacyName, { color: colors.text }]} numberOfLines={2}>
                    {pharmacy.name}
                  </Text>

                  {/* Zone + Distance */}
                  <View style={styles.metaRow}>
                    {pharmacy.zone ? (
                      <View style={styles.metaBadge}>
                        <Ionicons name="location-outline" size={11} color="#0077b6" />
                        <Text style={styles.metaZone} numberOfLines={1}>{pharmacy.zone}</Text>
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

                  {/* Adresse courte */}
                  {pharmacy.address ? (
                    <Text style={[styles.addressShort, { color: colors.subText }]} numberOfLines={1}>
                      {pharmacy.address}
                    </Text>
                  ) : null}
                </View>

                {/* Chevron + favoris */}
                <View style={styles.headerActions}>
                  <TouchableOpacity onPress={() => toggleFavorite(pharmacy.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name={pharmacy.isFavorite ? 'heart' : 'heart-outline'} size={20}
                      color={pharmacy.isFavorite ? '#e74c3c' : colors.subText} />
                  </TouchableOpacity>
                  <Ionicons name={expandedId === pharmacy.id ? 'chevron-up' : 'chevron-down'} size={20} color={colors.subText} style={{ marginTop: 6 }} />
                </View>
              </TouchableOpacity>

              {/* ── DÉTAILS DÉPLIÉS ── */}
              {expandedId === pharmacy.id && (
                <View style={[styles.pharmacyDetails, { borderTopColor: colors.border }]}>

                  {/* Avatar grande taille dans les détails */}
                  <View style={styles.pharmacyImagePlaceholder}>
                    <PharmacyAvatar
                      initials={(pharmacy as any).initials || ''}
                      color={(pharmacy as any).avatarColor || '#0077b6'}
                      slug={(pharmacy as any).slug}
                      size={80}
                    />
                    <Text style={styles.pharmacyImageLabel}>{pharmacy.name}</Text>
                  </View>

                  {/* Adresse */}
                  <View style={styles.detailRow}>
                    <Ionicons name="location" size={17} color="#0077b6" />
                    <Text style={[styles.detailText, { color: colors.subText }]}>
                      {[pharmacy.address, pharmacy.city].filter(Boolean).join(', ')}
                    </Text>
                  </View>

                  {/* Téléphone cliquable */}
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

                  {/* Dates de garde */}
                  {pharmacy.gardeFrom && pharmacy.gardeTo && (
                    <View style={styles.detailRow}>
                      <Ionicons name="calendar-outline" size={17} color="#0077b6" />
                      <Text style={[styles.detailText, { color: colors.subText }]}>
                        Garde du {pharmacy.gardeFrom} au {pharmacy.gardeTo}
                      </Text>
                    </View>
                  )}

                  {/* Horaires */}
                  {(pharmacy as any).horaires?.length > 0 && (
                    <View style={styles.detailRow}>
                      <Ionicons name="time-outline" size={17} color="#0077b6" />
                      <View style={{ flex: 1 }}>
                        {(pharmacy as any).horaires.map((h: PharmacyHoraire, i: number) => (
                          <Text key={i} style={[styles.detailText, { color: colors.subText }]}>
                            {h.jour} : {h.ouverture} {h.fermeture}
                          </Text>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Distance */}
                  {pharmacy.distanceKm !== null && (
                    <View style={styles.detailRow}>
                      <Ionicons name="navigate" size={17} color="#27ae60" />
                      <Text style={[styles.detailText, { color: '#27ae60' }]}>
                        À {formatDistance(pharmacy.distanceKm)} de votre position
                      </Text>
                    </View>
                  )}

                  {/* Assurances */}
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

                  {/* Boutons */}
                  <View style={styles.pharmacyActions}>
                    <View style={styles.dutyBadge}>
                      <Ionicons name="checkmark-circle" size={14} color="#0077b6" />
                      <Text style={styles.dutyBadgeText}>De garde</Text>
                    </View>
                    <TouchableOpacity style={styles.itineraryButton} onPress={() => openItinerary(pharmacy, userLocation)}>
                      <Ionicons name="navigate" size={17} color="#fff" />
                      <Text style={styles.itineraryButtonText}>Itinéraire</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNavigation currentScreen="pharmacy" onNavigate={onNavigate} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, gap: 15 },
  loadingText: { fontSize: 14, textAlign: 'center', marginTop: 12 },
  errorTitle: { fontSize: 18, fontWeight: '600', textAlign: 'center' },
  errorSubtitle: { fontSize: 13, textAlign: 'center' },
  retryButton: { backgroundColor: '#0077b6', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25, marginTop: 10 },
  retryButtonText: { color: '#fff', fontWeight: '600' },

  locationBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#e67e22', marginHorizontal: 20, marginTop: 12, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 12 },
  locationBannerText: { color: '#fff', fontSize: 13, flex: 1 },
  locationGranted: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 20, paddingTop: 10 },
  locationGrantedText: { fontSize: 12, color: '#0077b6' },

  searchContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 10, gap: 10 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 25, paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1, gap: 8 },
  searchInput: { flex: 1, fontSize: 14 },
  filterButton: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },

  filtersContainer: { paddingLeft: 20, marginBottom: 14 },
  filtersContent: { paddingRight: 20, gap: 8 },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  filterChipActive: { backgroundColor: '#E3F2FD', borderColor: '#0077b6' },
  filterChipText: { fontSize: 13, fontWeight: '500' },
  filterChipTextActive: { color: '#0077b6' },

  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12, gap: 8 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 14, gap: 10 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold' },
  sectionTitle1: { fontSize: 17, fontWeight: 'bold', flex: 1 },
  sectionCount: { fontSize: 12, backgroundColor: '#E3F2FD', color: '#0077b6', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 10, overflow: 'hidden' },

  // Carrousel
  carouselContent: { paddingRight: 20 },
  carouselCard: { width: CARD_WIDTH, marginLeft: CARD_MARGIN, marginRight: CARD_MARGIN, borderRadius: 16, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3 },
  carouselCardFirst: { marginLeft: 20 },
  carouselTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  heartBtn: { padding: 4 },
  carouselName: { fontSize: 14, fontWeight: '700', lineHeight: 20, marginBottom: 4 },
  carouselZone: { fontSize: 11, color: '#0077b6', marginBottom: 2 },
  carouselDistance: { fontSize: 11, color: '#27ae60', marginBottom: 10 },
  detailsButton: { backgroundColor: '#0077b6', paddingVertical: 9, borderRadius: 20, alignItems: 'center' },
  detailsButtonText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  // Avatar
  avatarFallback: { backgroundColor: '#E8F4FD', justifyContent: 'center', alignItems: 'center' },

  // Carte accordéon
  pharmacyCard: { marginHorizontal: 20, marginBottom: 10, borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 },

  // En-tête accordéon (toujours visible)
  pharmacyHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  pharmacyHeaderInfo: { flex: 1 },
  pharmacyName: { fontSize: 15, fontWeight: '700', lineHeight: 21, marginBottom: 5 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 3 },
  metaBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#EBF5FB', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  metaBadgeGreen: { backgroundColor: '#EAFAF1' },
  metaZone: { fontSize: 11, color: '#0077b6', fontWeight: '500' },
  metaDist: { fontSize: 11, color: '#27ae60', fontWeight: '500' },
  addressShort: { fontSize: 12, lineHeight: 17 },
  headerActions: { alignItems: 'center', gap: 4, paddingLeft: 6 },

  // Détails dépliés
  pharmacyDetails: { paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, paddingTop: 14, gap: 10 },
  pharmacyImage: { width: '100%', height: 140, borderRadius: 10 },
  pharmacyImagePlaceholder: { width: '100%', height: 110, backgroundColor: '#E8F4FD', justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  pharmacyImageLabel: { fontSize: 12, color: '#0077b6', fontWeight: '600', marginTop: 4 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  detailText: { fontSize: 14, flex: 1, lineHeight: 20 },
  detailTextLink: { fontSize: 14, flex: 1, lineHeight: 20, textDecorationLine: 'underline' },

  insurancesTitle: { fontSize: 12, marginBottom: 6 },
  insurancesTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  insuranceTag: { backgroundColor: '#E3F2FD', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  insuranceTagText: { fontSize: 11, color: '#0077b6' },

  pharmacyActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  dutyBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#E3F2FD', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  dutyBadgeText: { color: '#0077b6', fontSize: 13, fontWeight: '600' },
  itineraryButton: { flex: 1, backgroundColor: '#0077b6', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 20, gap: 8 },
  itineraryButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  emptyContainer: { alignItems: 'center', paddingVertical: 50, gap: 12 },
  emptyText: { fontSize: 14, textAlign: 'center' },
});

export default PharmacyScreen;