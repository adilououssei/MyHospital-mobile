import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

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
}

interface HospitalScreenProps {
  onNavigate: (screen: string) => void;
}

const HospitalScreen = ({ onNavigate }: HospitalScreenProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('open');
  const [expandedId, setExpandedId] = useState<string | null>(null);
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
      isFavorite: false,
      image: null,
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

  const filteredHospitals = hospitals.filter((hospital) => {
    const matchesSearch = hospital.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const favoriteHospitals = filteredHospitals.filter((h) => h.isFavorite);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => onNavigate('home')}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hôpitaux</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un hôpital..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
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
          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === 'open' && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter('open')}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === 'open' && styles.filterChipTextActive,
              ]}
            >
              Ouvert 24h/24
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === 'urgences' && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter('urgences')}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === 'urgences' && styles.filterChipTextActive,
              ]}
            >
              Urgences
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === 'distance' && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter('distance')}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === 'distance' && styles.filterChipTextActive,
              ]}
            >
              Distance
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === 'speciality' && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter('speciality')}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === 'speciality' && styles.filterChipTextActive,
              ]}
            >
              Spécialités
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Favorites Section */}
        {favoriteHospitals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Favoris</Text>
            <View style={styles.favoritesRow}>
              {favoriteHospitals.slice(0, 2).map((hospital) => (
                <View key={hospital.id} style={styles.favoriteCard}>
                  <View style={styles.favoriteHeader}>
                    <Text style={styles.favoriteTitle} numberOfLines={1}>
                      {hospital.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() => toggleFavorite(hospital.id)}
                    >
                      <Ionicons name="heart" size={20} color="#0077b6" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.favoriteAddress} numberOfLines={2}>
                    {hospital.address}, {hospital.city}
                  </Text>
                  <TouchableOpacity style={styles.detailsButton}>
                    <Text style={styles.detailsButtonText}>Voir détails</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* All Hospitals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tous les hôpitaux</Text>

          {filteredHospitals.map((hospital) => (
            <View key={hospital.id} style={styles.hospitalCard}>
              <TouchableOpacity
                style={styles.hospitalHeader}
                onPress={() => toggleExpand(hospital.id)}
              >
                <View style={styles.hospitalHeaderLeft}>
                  <Text style={styles.hospitalName}>{hospital.name}</Text>
                  <Text style={styles.hospitalDistance}>{hospital.distance}</Text>
                </View>
                <Ionicons
                  name={
                    expandedId === hospital.id ? 'chevron-up' : 'chevron-down'
                  }
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>

              {expandedId === hospital.id && (
                <View style={styles.hospitalDetails}>
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

                  <Text style={styles.hospitalAddress}>
                    {hospital.address}, {hospital.city}
                  </Text>
                  <Text style={styles.hospitalPhone}>{hospital.phone}</Text>

                  {/* Spécialités */}
                  <View style={styles.specialtiesContainer}>
                    <Text style={styles.specialtiesLabel}>Spécialités :</Text>
                    <View style={styles.specialtiesChips}>
                      {hospital.specialties.map((specialty, index) => (
                        <View key={index} style={styles.specialtyChip}>
                          <Text style={styles.specialtyChipText}>{specialty}</Text>
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
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => onNavigate('home')}
        >
          <Ionicons name="home-outline" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="chatbubble-outline" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="calendar-outline" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => onNavigate('profile')}
        >
          <Ionicons name="person-outline" size={24} color="#999" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
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
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#000',
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#0077b6',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#0077b6',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  favoritesRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 15,
  },
  favoriteCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    color: '#000',
    marginRight: 10,
  },
  favoriteAddress: {
    fontSize: 12,
    color: '#666',
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
    backgroundColor: '#fff',
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
  hospitalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  hospitalDistance: {
    fontSize: 14,
    color: '#666',
  },
  hospitalDetails: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
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
    color: '#666',
    marginBottom: 8,
  },
  hospitalPhone: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    marginBottom: 15,
  },
  specialtiesContainer: {
    marginBottom: 15,
  },
  specialtiesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  specialtiesChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyChip: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  specialtyChipText: {
    fontSize: 12,
    color: '#666',
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
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingBottom: 50,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
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