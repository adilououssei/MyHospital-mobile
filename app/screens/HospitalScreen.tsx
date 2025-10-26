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

interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  distance: string;
  specialties: string[];
  isOpen24h: boolean;
  isFavorite: boolean;
  image: any;
  rating: number;
  reviewsCount: number;
}

interface HospitalScreenProps {
  onNavigate: (screen: string) => void;
}

const HospitalScreen = ({ onNavigate }: HospitalScreenProps) => {
  const { colors } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const [hospitalPositions, setHospitalPositions] = useState<{[key: string]: number}>({});
  
  const [hospitals, setHospitals] = useState<Hospital[]>([
    {
      id: '1',
      name: 'Hôpital Saint-Louis',
      address: '1 Avenue Claude Vellefaux',
      city: '75010 Paris',
      phone: '01 42 49 49 49',
      distance: '1.5 km',
      specialties: ['Urgences', 'Cardiologie', 'Pédiatrie'],
      isOpen24h: true,
      isFavorite: true,
      image: null,
      rating: 4.7,
      reviewsCount: 342,
    },
    {
      id: '2',
      name: 'Hôpital Necker',
      address: '149 Rue de Sèvres',
      city: '75015 Paris',
      phone: '01 44 49 40 00',
      distance: '2.8 km',
      specialties: ['Pédiatrie', 'Chirurgie', 'Maternité'],
      isOpen24h: true,
      isFavorite: true,
      image: null,
      rating: 4.5,
      reviewsCount: 278,
    },
    {
      id: '3',
      name: 'Hôpital Cochin',
      address: '27 Rue du Faubourg Saint-Jacques',
      city: '75014 Paris',
      phone: '01 58 41 41 41',
      distance: '3.2 km',
      specialties: ['Urgences', 'Maternité', 'Oncologie'],
      isOpen24h: true,
      isFavorite: false,
      image: null,
      rating: 4.3,
      reviewsCount: 198,
    },
    {
      id: '4',
      name: 'Hôpital Pitié-Salpêtrière',
      address: '47-83 Boulevard de l\'Hôpital',
      city: '75013 Paris',
      phone: '01 42 16 00 00',
      distance: '4.1 km',
      specialties: ['Urgences', 'Neurologie', 'Cardiologie'],
      isOpen24h: true,
      isFavorite: true,
      image: null,
      rating: 4.6,
      reviewsCount: 421,
    },
  ]);

  const toggleFavorite = (id: string) => {
    setHospitals(
      hospitals.map((h) =>
        h.id === id ? { ...h, isFavorite: !h.isFavorite } : h
      )
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const scrollToHospital = (id: string) => {
    const position = hospitalPositions[id];
    if (position && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: position - 100, animated: true });
      setExpandedId(id);
    }
  };

  const filteredHospitals = hospitals.filter((hospital) => {
    const matchesSearch = hospital.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'open') return matchesSearch && hospital.isOpen24h;
    if (activeFilter === 'rating') return matchesSearch && hospital.rating >= 4.5;
    
    return matchesSearch;
  });

  const favoriteHospitals = filteredHospitals.filter((h) => h.isFavorite);

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Hôpitaux</Text>
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
              placeholder="Rechercher un hôpital..."
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
            { key: 'all', label: 'Tous' },
            { key: 'open', label: 'Ouvert 24h/24' },
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
        {favoriteHospitals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Favoris</Text>
              <Text style={[styles.sectionCount, { color: colors.subText }]}>
                {favoriteHospitals.length}
              </Text>
            </View>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
              decelerationRate="fast"
              contentContainerStyle={styles.carouselContent}
            >
              {favoriteHospitals.map((hospital, index) => (
                <View
                  key={hospital.id}
                  style={[
                    styles.carouselCard,
                    { backgroundColor: colors.card },
                    index === 0 && styles.carouselCardFirst,
                  ]}
                >
                  <View style={styles.favoriteHeader}>
                    <Text style={[styles.favoriteTitle, { color: colors.text }]} numberOfLines={1}>
                      {hospital.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() => toggleFavorite(hospital.id)}
                    >
                      <Ionicons name="heart" size={20} color="#0077b6" />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Rating */}
                  <View style={styles.ratingContainer}>
                    <View style={styles.starsRow}>
                      {renderStars(hospital.rating)}
                    </View>
                    <Text style={[styles.ratingText, { color: colors.subText }]}>
                      {hospital.rating} ({hospital.reviewsCount})
                    </Text>
                  </View>

                  <Text style={[styles.favoriteAddress, { color: colors.subText }]} numberOfLines={2}>
                    {hospital.address}, {hospital.city}
                  </Text>
                  
                  <TouchableOpacity 
                    style={styles.detailsButton}
                    onPress={() => scrollToHospital(hospital.id)}
                  >
                    <Text style={styles.detailsButtonText}>Voir détails</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* All Hospitals */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle1, { color: colors.text }]}>Tous les hôpitaux</Text>

          {filteredHospitals.map((hospital) => (
            <View 
              key={hospital.id} 
              style={[styles.hospitalCard, { backgroundColor: colors.card }]}
              onLayout={(event) => {
                const { y } = event.nativeEvent.layout;
                setHospitalPositions(prev => ({ ...prev, [hospital.id]: y }));
              }}
            >
              <TouchableOpacity
                style={styles.hospitalHeader}
                onPress={() => toggleExpand(hospital.id)}
              >
                <View style={styles.hospitalHeaderLeft}>
                  <View style={styles.hospitalNameRow}>
                    <Text style={[styles.hospitalName, { color: colors.text }]}>{hospital.name}</Text>
                    <TouchableOpacity
                      onPress={() => toggleFavorite(hospital.id)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons 
                        name={hospital.isFavorite ? "heart" : "heart-outline"} 
                        size={22} 
                        color={hospital.isFavorite ? "#0077b6" : colors.subText} 
                      />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Rating */}
                  <View style={styles.hospitalRatingRow}>
                    <View style={styles.starsRow}>
                      {renderStars(hospital.rating)}
                    </View>
                    <Text style={[styles.hospitalRatingText, { color: colors.subText }]}>
                      {hospital.rating} ({hospital.reviewsCount} avis)
                    </Text>
                  </View>
                  
                  <Text style={[styles.hospitalDistance, { color: colors.subText }]}>{hospital.distance}</Text>
                </View>
                <Ionicons
                  name={
                    expandedId === hospital.id ? 'chevron-up' : 'chevron-down'
                  }
                  size={24}
                  color={colors.subText}
                />
              </TouchableOpacity>

              {expandedId === hospital.id && (
                <View style={[styles.hospitalDetails, { borderTopColor: colors.border }]}>
                  {/* Image de l'hôpital */}
                  <View style={styles.hospitalImageContainer}>
                    {hospital.image ? (
                      <Image
                        source={hospital.image}
                        style={styles.hospitalImage}
                      />
                    ) : (
                      <View style={styles.hospitalImagePlaceholder}>
                        <Ionicons name="business" size={40} color="#0077b6" />
                      </View>
                    )}
                  </View>

                  <Text style={[styles.hospitalAddress, { color: colors.subText }]}>
                    {hospital.address}, {hospital.city}
                  </Text>
                  <Text style={[styles.hospitalPhone, { color: colors.text }]}>{hospital.phone}</Text>

                  {/* Spécialités */}
                  <View style={styles.specialtiesContainer}>
                    <Text style={[styles.specialtiesLabel, { color: colors.text }]}>Spécialités :</Text>
                    <View style={styles.specialtiesChips}>
                      {hospital.specialties.map((specialty, index) => (
                        <View key={index} style={[styles.specialtyChip, { 
                          backgroundColor: colors.inputBackground,
                          borderColor: colors.border
                        }]}>
                          <Text style={[styles.specialtyChipText, { color: colors.subText }]}>{specialty}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.hospitalActions}>
                    {hospital.isOpen24h && (
                      <TouchableOpacity style={styles.open24Badge}>
                        <Text style={styles.open24BadgeText}>Ouvert 24h/24</Text>
                      </TouchableOpacity>
                    )}

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
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
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
  hospitalCard: {
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  hospitalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  hospitalHeaderLeft: {
    flex: 1,
  },
  hospitalNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  hospitalRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  hospitalRatingText: {
    fontSize: 12,
  },
  hospitalDistance: {
    fontSize: 14,
  },
  hospitalDetails: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    paddingTop: 15,
  },
  hospitalImageContainer: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  hospitalImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  hospitalImagePlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hospitalAddress: {
    fontSize: 14,
    marginBottom: 8,
  },
  hospitalPhone: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 15,
  },
  specialtiesContainer: {
    marginBottom: 15,
  },
  specialtiesLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  specialtiesChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  specialtyChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  hospitalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  open24Badge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  open24BadgeText: {
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

export default HospitalScreen;