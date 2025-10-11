import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  distance: string;
  image: any;
}

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

const HomeScreen = ({ onNavigate }: HomeScreenProps) => {
  const topDoctors: Doctor[] = [
    {
      id: '1',
      name: 'Dr. Marcus Horiz',
      specialty: 'Cardiologue',
      rating: 4.7,
      distance: '800m',
      image: require('../../assets/doctor1.png'),
    },
    {
      id: '2',
      name: 'Dr. Maria Elena',
      specialty: 'Psychologue',
      rating: 4.8,
      distance: '1.5km',
      image: require('../../assets/doctor2.png'),
      
    },
    {
      id: '3',
      name: 'Dr. Stevi Jessi',
      specialty: 'Orthopédiste',
      rating: 4.8,
      distance: '2km',
      image: require('../../assets/doctor3.png'),
    },
  ];

  const ServiceButton = ({ icon, label }: { icon: string; label: string }) => (
    <TouchableOpacity style={styles.serviceButton}>
      <View style={styles.serviceIconContainer}>
        <Ionicons name={icon as any} size={28} color="#0077b6" />
      </View>
      <Text style={styles.serviceLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const DoctorCard = ({ doctor }: { doctor: Doctor }) => (
    <TouchableOpacity style={styles.doctorCard}>
      <View style={styles.doctorImageContainer}>
        <View style={styles.doctorImagePlaceholder}>
          <Ionicons name="person" size={40} color="#0077b6" />
        </View>
      </View>
      <Text style={styles.doctorName}>{doctor.name}</Text>
      <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
      <View style={styles.doctorInfo}>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFC107" />
          <Text style={styles.ratingText}>{doctor.rating}</Text>
        </View>
        <View style={styles.distanceContainer}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.distanceText}>{doctor.distance}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Trouvez votre solution</Text>
            <Text style={styles.title}>santé désirée</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher médecin, médicaments, articles..."
            placeholderTextColor="#999"
          />
        </View>

        {/* Services */}
        <View style={styles.servicesContainer}>
          <ServiceButton icon="medical-outline" label="Docteur" />
          <ServiceButton icon="medkit-outline" label="Pharmacie" />
          <ServiceButton icon="business-outline" label="Hôpital" />
          <ServiceButton icon="car-outline" label="Ambulance" />
        </View>

        {/* Banner */}
        <LinearGradient
          colors={['#0077b6', '#E8F9F5']}
          style={styles.banner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Protection précoce pour</Text>
            <Text style={styles.bannerTitle}>la santé de votre famille</Text>
            <TouchableOpacity style={styles.bannerButton}>
              <Text style={styles.bannerButtonText}>En savoir plus</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.bannerImageContainer}>
            <View style={styles.bannerImagePlaceholder}>
              <Ionicons name="medical" size={60} color="#0077b6" />
            </View>
          </View>
        </LinearGradient>

        {/* Top Doctors */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Meilleurs Docteurs</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Voir tout</Text>
          </TouchableOpacity>
        </View>

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

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#0077b6" />
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
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
  },
  notificationButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    marginHorizontal: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#000',
  },
  servicesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  serviceButton: {
    alignItems: 'center',
  },
  serviceIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#e4f4fcff',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceLabel: {
    fontSize: 12,
    color: '#666',
  },
  banner: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  bannerButton: {
    backgroundColor: '#0077b6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 15,
  },
  bannerButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  bannerImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerImagePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  seeAllText: {
    fontSize: 14,
    color: '#0077b6',
    fontWeight: '500',
  },
  doctorsScroll: {
    paddingLeft: 20,
  },
  doctorsScrollContent: {
    paddingRight: 20,
  },
  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  doctorImageContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  doctorImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#e4f4fcff',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  doctorInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    color: '#000',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingBottom: 25,
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

export default HomeScreen;