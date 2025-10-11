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
}

interface PharmacyScreenProps {
  onNavigate: (screen: string) => void;
}

const PharmacyScreen = ({ onNavigate }: PharmacyScreenProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('open');
  const [expandedId, setExpandedId] = useState<string | null>(null);
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
      image: null, // Placeholder
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

  const filteredPharmacies = pharmacies.filter((pharmacy) => {
    const matchesSearch = pharmacy.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const favoritePharmacies = filteredPharmacies.filter((p) => p.isFavorite);

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
        <Text style={styles.headerTitle}>Pharmacies de garde</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher une pharmacie..."
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
              Ouvert maintenant
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === 'services' && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter('services')}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === 'services' && styles.filterChipTextActive,
              ]}
            >
              Services
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
              activeFilter === 'rating' && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter('rating')}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === 'rating' && styles.filterChipTextActive,
              ]}
            >
              Note
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Favorites Section */}
        {favoritePharmacies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Favoris</Text>
            <View style={styles.favoritesRow}>
              {favoritePharmacies.slice(0, 2).map((pharmacy) => (
                <View key={pharmacy.id} style={styles.favoriteCard}>
                  <View style={styles.favoriteHeader}>
                    <Text style={styles.favoriteTitle} numberOfLines={1}>
                      {pharmacy.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() => toggleFavorite(pharmacy.id)}
                    >
                      <Ionicons name="heart" size={20} color="#0077b6" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.favoriteAddress} numberOfLines={2}>
                    {pharmacy.address}, {pharmacy.city}
                  </Text>
                  <TouchableOpacity style={styles.detailsButton}>
                    <Text style={styles.detailsButtonText}>Voir détails</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* All Pharmacies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Toutes les pharmacies</Text>

          {filteredPharmacies.map((pharmacy) => (
            <View key={pharmacy.id} style={styles.pharmacyCard}>
              <TouchableOpacity
                style={styles.pharmacyHeader}
                onPress={() => toggleExpand(pharmacy.id)}
              >
                <View style={styles.pharmacyHeaderLeft}>
                  <Text style={styles.pharmacyName}>{pharmacy.name}</Text>
                  <Text style={styles.pharmacyDistance}>{pharmacy.distance}</Text>
                </View>
                <Ionicons
                  name={
                    expandedId === pharmacy.id ? 'chevron-up' : 'chevron-down'
                  }
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>

              {expandedId === pharmacy.id && (
                <View style={styles.pharmacyDetails}>
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

                  <Text style={styles.pharmacyAddress}>
                    {pharmacy.address}, {pharmacy.city}
                  </Text>
                  <Text style={styles.pharmacyPhone}>{pharmacy.phone}</Text>

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

      {/* Bottom Navigation - Identique aux autres pages */}
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
  pharmacyCard: {
    backgroundColor: '#fff',
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
  pharmacyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  pharmacyDistance: {
    fontSize: 14,
    color: '#666',
  },
  pharmacyDetails: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
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
    color: '#666',
    marginBottom: 8,
  },
  pharmacyPhone: {
    fontSize: 14,
    color: '#000',
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

export default PharmacyScreen;