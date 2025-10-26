import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.45;
const CARD_MARGIN = 10;

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  distance: string;
  isOnDuty: boolean;
  isFavorite: boolean;
  image: any;
  rating: number;
  reviewsCount: number;
}

interface PharmacyScreenProps {
  onNavigate: (screen: string) => void;
}

const PharmacyScreen = ({ onNavigate }: PharmacyScreenProps) => {
  const { colors } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const [pharmacyPositions, setPharmacyPositions] = useState<{[key: string]: number}>({});
  
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([
    {
      id: '1',
      name: 'Pharmacie Centrale',
      address: '12 Rue de la Liberté',
      city: '75001 Paris',
      phone: '01 42 36 78 90',
      distance: '1.2 km',
      isOnDuty: true,
      isFavorite: true,
      image: null,
      rating: 4.5,
      reviewsCount: 128,
    },
    {
      id: '2',
      name: 'Pharmacie du Soleil',
      address: '45 Avenue du Général Leclerc',
      city: '75014 Paris',
      phone: '01 43 27 89 12',
      distance: '2.5 km',
      isOnDuty: true,
      isFavorite: true,
      image: null,
      rating: 4.8,
      reviewsCount: 203,
    },
    {
      id: '3',
      name: 'Pharmacie des Lilas',
      address: '78 Boulevard de Ménilmontant',
      city: '75020 Paris',
      phone: '01 46 36 45 67',
      distance: '3.8 km',
      isOnDuty: true,
      isFavorite: false,
      image: null,
      rating: 4.2,
      reviewsCount: 89,
    },
    {
      id: '4',
      name: 'Pharmacie de la Paix',
      address: '23 Rue de la Paix',
      city: '75002 Paris',
      phone: '01 42 61 89 34',
      distance: '1.8 km',
      isOnDuty: true,
      isFavorite: true,
      image: null,
      rating: 4.6,
      reviewsCount: 156,
    },
  ]);

  const toggleFavorite = (id: string) => {
    setPharmacies(
      pharmacies.map((p) =>
        p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
      )
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const scrollToPharmacy = (id: string) => {
    const position = pharmacyPositions[id];
    if (position && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: position - 100, animated: true });
      setExpandedId(id);
    }
  };

  const filteredPharmacies = pharmacies.filter((pharmacy) => {
    const matchesSearch = pharmacy.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'open') return matchesSearch && pharmacy.isOnDuty;
    if (activeFilter === 'rating') return matchesSearch && pharmacy.rating >= 4.5;
    
    return matchesSearch;
  });

  const favoritePharmacies = filteredPharmacies.filter((p) => p.isFavorite);

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={`star-${i}`} name="star" size={14} color="#FFB800" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons key="star-half" name="star-half" size={14} color="#FFB800" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons
          key={`star-empty-${i}`}
          name="star-outline"
          size={14}
          color="#FFB800"
        />
      );
    }

    return stars;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => onNavigate('home')}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Pharmacies de garde</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { 
            backgroundColor: colors.card,
            borderColor: colors.border
          }]}>
            <Ionicons name="search-outline" size={20} color={colors.subText} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Rechercher une pharmacie..."
              placeholderTextColor={colors.subText}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={[styles.filterButton, {
            backgroundColor: colors.card,
            borderColor: colors.border
          }]}>
            <Ionicons name="options-outline" size={20} color="#0077b6" />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {[
            { key: 'all', label: 'Toutes' },
            { key: 'open', label: 'Ouvertes' },
            { key: 'rating', label: 'Meilleures notes' }
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterChip,
                { backgroundColor: colors.card, borderColor: colors.border },
                activeFilter === filter.key && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(filter.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: colors.subText },
                  activeFilter === filter.key && styles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Favorites Carousel */}
        {favoritePharmacies.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Favoris</Text>
              <Text style={[styles.sectionCount, { color: colors.subText }]}>
                {favoritePharmacies.length}
              </Text>
            </View>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
              decelerationRate="fast"
              contentContainerStyle={styles.carouselContent}
            >
              {favoritePharmacies.map((pharmacy, index) => (
                <View
                  key={pharmacy.id}
                  style={[
                    styles.carouselCard,
                    { backgroundColor: colors.card },
                    index === 0 && styles.carouselCardFirst,
                  ]}
                >
                  <View style={styles.favoriteHeader}>
                    <Text style={[styles.favoriteTitle, { color: colors.text }]} numberOfLines={1}>
                      {pharmacy.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() => toggleFavorite(pharmacy.id)}
                    >
                      <Ionicons name="heart" size={20} color="#0077b6" />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Rating */}
                  <View style={styles.ratingContainer}>
                    <View style={styles.starsRow}>
                      {renderStars(pharmacy.rating)}
                    </View>
                    <Text style={[styles.ratingText, { color: colors.subText }]}>
                      {pharmacy.rating} ({pharmacy.reviewsCount})
                    </Text>
                  </View>

                  <Text style={[styles.favoriteAddress, { color: colors.subText }]} numberOfLines={2}>
                    {pharmacy.address}, {pharmacy.city}
                  </Text>
                  
                  <TouchableOpacity 
                    style={styles.detailsButton}
                    onPress={() => scrollToPharmacy(pharmacy.id)}
                  >
                    <Text style={styles.detailsButtonText}>Voir détails</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* All Pharmacies */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle1, { color: colors.text }]}>Toutes les pharmacies</Text>

          {filteredPharmacies.map((pharmacy) => (
            <View 
              key={pharmacy.id} 
              style={[styles.pharmacyCard, { backgroundColor: colors.card }]}
              onLayout={(event) => {
                const { y } = event.nativeEvent.layout;
                setPharmacyPositions(prev => ({ ...prev, [pharmacy.id]: y }));
              }}
            >
              <TouchableOpacity
                style={styles.pharmacyHeader}
                onPress={() => toggleExpand(pharmacy.id)}
              >
                <View style={styles.pharmacyHeaderLeft}>
                  <View style={styles.pharmacyNameRow}>
                    <Text style={[styles.pharmacyName, { color: colors.text }]}>{pharmacy.name}</Text>
                    <TouchableOpacity
                      onPress={() => toggleFavorite(pharmacy.id)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons 
                        name={pharmacy.isFavorite ? "heart" : "heart-outline"} 
                        size={22} 
                        color={pharmacy.isFavorite ? "#0077b6" : colors.subText} 
                      />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Rating */}
                  <View style={styles.pharmacyRatingRow}>
                    <View style={styles.starsRow}>
                      {renderStars(pharmacy.rating)}
                    </View>
                    <Text style={[styles.pharmacyRatingText, { color: colors.subText }]}>
                      {pharmacy.rating} ({pharmacy.reviewsCount} avis)
                    </Text>
                  </View>
                  
                  <Text style={[styles.pharmacyDistance, { color: colors.subText }]}>{pharmacy.distance}</Text>
                </View>
                <Ionicons
                  name={
                    expandedId === pharmacy.id ? 'chevron-up' : 'chevron-down'
                  }
                  size={24}
                  color={colors.subText}
                />
              </TouchableOpacity>

              {expandedId === pharmacy.id && (
                <View style={[styles.pharmacyDetails, { borderTopColor: colors.border }]}>
                  {/* Image de la pharmacie */}
                  <View style={styles.pharmacyImageContainer}>
                    {pharmacy.image ? (
                      <Image
                        source={pharmacy.image}
                        style={styles.pharmacyImage}
                      />
                    ) : (
                      <View style={styles.pharmacyImagePlaceholder}>
                        <Ionicons name="medical" size={40} color="#0077b6" />
                      </View>
                    )}
                  </View>

                  <Text style={[styles.pharmacyAddress, { color: colors.subText }]}>
                    {pharmacy.address}, {pharmacy.city}
                  </Text>
                  <Text style={[styles.pharmacyPhone, { color: colors.text }]}>{pharmacy.phone}</Text>

                  <View style={styles.pharmacyActions}>
                    <TouchableOpacity style={styles.dutyBadge}>
                      <Text style={styles.dutyBadgeText}>De garde</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.itineraryButton}>
                      <Ionicons name="navigate" size={18} color="#fff" />
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

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { 
        backgroundColor: colors.card,
        borderTopColor: colors.border
      }]}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => onNavigate('home')}
        >
          <Ionicons name="home-outline" size={24} color={colors.subText} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="chatbubble-outline" size={24} color={colors.subText} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="calendar-outline" size={24} color={colors.subText} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => onNavigate('profile')}
        >
          <Ionicons name="person-outline" size={24} color={colors.subText} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 34,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  filtersContainer: {
    paddingLeft: 20,
    marginBottom: 20,
  },
  filtersContent: {
    paddingRight: 20,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#0077b6',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#0077b6',
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingLeft: 5,

  },
  sectionTitle1: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    paddingLeft: 20,
  },
  sectionCount: {
    fontSize: 14,
    backgroundColor: '#E3F2FD',
    color: '#0077b6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  carouselContent: {
    paddingRight: 20,
  },
  carouselCard: {
    width: CARD_WIDTH,
    marginLeft: CARD_MARGIN,
    marginRight: CARD_MARGIN,
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  carouselCardFirst: {
    marginLeft: 20,
  },
  favoriteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  favoriteTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    marginRight: 10,
  },
  ratingContainer: {
    marginBottom: 8,
  },
  favoriteAddress: {
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 18,
  },
  detailsButton: {
    backgroundColor: '#0077b6',
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
  },
  pharmacyCard: {
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  pharmacyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  pharmacyHeaderLeft: {
    flex: 1,
  },
  pharmacyNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  pharmacyName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  pharmacyRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  pharmacyRatingText: {
    fontSize: 12,
  },
  pharmacyDistance: {
    fontSize: 14,
  },
  pharmacyDetails: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    paddingTop: 15,
  },
  pharmacyImageContainer: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  pharmacyImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  pharmacyImagePlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pharmacyAddress: {
    fontSize: 14,
    marginBottom: 8,
  },
  pharmacyPhone: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 15,
  },
  pharmacyActions: {
    flexDirection: 'row',
    gap: 10,
  },
  dutyBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  dutyBadgeText: {
    color: '#0077b6',
    fontSize: 13,
    fontWeight: '600',
  },
  itineraryButton: {
    flex: 1,
    backgroundColor: '#0077b6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  itineraryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    paddingBottom: 50,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  navItem: {
    padding: 5,
  },
});
export default PharmacyScreen;