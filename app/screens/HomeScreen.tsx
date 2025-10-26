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
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useApp } from '../context/AppContext';

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
  unreadCount?: number;
}

const HomeScreen = ({ onNavigate, unreadCount = 0 }: HomeScreenProps) => {
  const { colors } = useApp();

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

  const ServiceButton = ({ icon, label, screen }: { icon: string; label: string; screen?: string }) => (
    <TouchableOpacity
      style={styles.serviceButton}
      onPress={() => screen && onNavigate(screen)}
    >
      <View style={styles.serviceIconContainer}>
        <Ionicons name={icon as any} size={28} color="#0077b6" />
      </View>
      <Text style={[styles.serviceLabel, { color: colors.subText }]}>{label}</Text>
    </TouchableOpacity>
  );

  const DoctorCard = ({ doctor }: { doctor: Doctor }) => (
    <TouchableOpacity style={[styles.doctorCard, { backgroundColor: colors.card }]}>
      <View style={styles.doctorImageContainer}>
        <View style={styles.doctorImagePlaceholder}>
          <FontAwesome5 name="user-md" size={40} color="#0077b6" />
        </View>
      </View>
      <Text style={[styles.doctorName, { color: colors.text }]}>{doctor.name}</Text>
      <Text style={[styles.doctorSpecialty, { color: colors.subText }]}>{doctor.specialty}</Text>
      <View style={styles.doctorInfo}>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFC107" />
          <Text style={[styles.ratingText, { color: colors.text }]}>{doctor.rating}</Text>
        </View>
        <View style={styles.distanceContainer}>
          <Ionicons name="location-outline" size={14} color={colors.subText} />
          <Text style={[styles.distanceText, { color: colors.subText }]}>{doctor.distance}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Trouvez votre solution</Text>
            <Text style={[styles.title, { color: colors.text }]}>santé désirée</Text>
          </View>
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

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.inputBackground }]}>
          <Ionicons name="search-outline" size={20} color={colors.subText} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Rechercher médecin, médicaments, articles..."
            placeholderTextColor={colors.subText}
          />
        </View>

        {/* Services */}
        <View style={styles.servicesContainer}>
          <ServiceButton icon="medical-outline" label="Docteur" screen="doctorsList" />
          <ServiceButton icon="medkit-outline" label="Pharmacie" screen="pharmacy" />
          <ServiceButton icon="business-outline" label="Hôpital" screen="hospital" />
          <ServiceButton icon="car-outline" label="Ambulance" />
        </View>

        {/* Banner */}
        <LinearGradient
          colors={['#e4f4fcff', '#0077b6']}
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
              <Image
                source={require('../../assets/doctor2.png')}
                style={{ width: 120, height: 140 }}
              />
            </View>
          </View>
        </LinearGradient>

        {/* Top Doctors */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Meilleurs Docteurs</Text>
          <TouchableOpacity onPress={() => onNavigate('doctorsList')}>
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
      <View style={[styles.bottomNav, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#0077b6" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="chatbubble-outline" size={24} color={colors.subText} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => onNavigate('appointments')}
        >
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: '#e3e2e2ff',
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
  },
  seeAllText: {
    fontSize: 14,
    color: '#0077b6',
    fontWeight: '500',
  },
  doctorsScroll: {
    paddingLeft: 20,
    paddingBottom: 10,
    paddingTop: 5,
  },
  doctorsScrollContent: {
    paddingRight: 20,
  },
  doctorCard: {
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
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 12,
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
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 12,
    marginLeft: 2,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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

export default HomeScreen;