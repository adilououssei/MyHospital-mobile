import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  distance: string;
  price: number;
  image: any;
}

interface DoctorsListScreenProps {
  onNavigate: (screen: string, params?: any) => void;
  consultationType?: string;
  description?: string;
}

const DoctorsListScreen = ({
  onNavigate,
  consultationType,
  description,
}: DoctorsListScreenProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const doctors: Doctor[] = [
    {
      id: '1',
      name: 'Dr. Marcus Horizon',
      specialty: 'Cardiologue',
      rating: 4.7,
      distance: '800m',
      price: 15000,
      image: null,
    },
    {
      id: '2',
      name: 'Dr. Maria Elena',
      specialty: 'Psychologue',
      rating: 4.8,
      distance: '1.5km',
      price: 12000,
      image: null,
    },
    {
      id: '3',
      name: 'Dr. Stevi Jessi',
      specialty: 'Orthopédiste',
      rating: 4.7,
      distance: '2km',
      price: 18000,
      image: null,
    },
    {
      id: '4',
      name: 'Dr. Gerty Cori',
      specialty: 'Orthopédiste',
      rating: 4.7,
      distance: '2.5km',
      price: 16000,
      image: null,
    },
  ];

  const filteredDoctors = doctors.filter((doctor) =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectDoctor = (doctor: Doctor) => {
    onNavigate('doctorDetail', {
      doctor,
      consultationType,
      description,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => onNavigate('bookingType')}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choisir un médecin</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            <View style={styles.stepCompleted}>
              <Ionicons name="checkmark" size={20} color="#fff" />
            </View>
            <View style={styles.stepLineCompleted} />
            <View style={styles.stepActive}>
              <Text style={styles.stepTextActive}>2</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.stepInactive}>
              <Text style={styles.stepTextInactive}>3</Text>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un médecin..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Doctors List */}
          <View style={styles.doctorsList}>
            {filteredDoctors.map((doctor) => (
              <TouchableOpacity
                key={doctor.id}
                style={styles.doctorCard}
                onPress={() => handleSelectDoctor(doctor)}
              >
                <View style={styles.doctorImagePlaceholder}>
                  <FontAwesome5 name="user-md" size={40} color="#0077b6" />
                </View>

                <View style={styles.doctorInfo}>
                  <Text style={styles.doctorName}>{doctor.name}</Text>
                  <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>

                  <View style={styles.doctorMeta}>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color="#FFA500" />
                      <Text style={styles.rating}>{doctor.rating}</Text>
                    </View>
                    <View style={styles.distanceContainer}>
                      <Ionicons name="location-outline" size={14} color="#666" />
                      <Text style={styles.distance}>{doctor.distance}</Text>
                    </View>
                  </View>

                  <Text style={styles.price}>{doctor.price} FCFA</Text>
                </View>

                <Ionicons name="chevron-forward" size={24} color="#666" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
  content: {
    padding: 20,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
  },
  stepCompleted: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0077b6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepActive: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0077b6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepInactive: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepTextActive: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  stepTextInactive: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 5,
  },
  stepLineCompleted: {
    width: 40,
    height: 2,
    backgroundColor: '#0077b6',
    marginHorizontal: 5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#000',
  },
  doctorsList: {
    gap: 12,
    paddingBottom: 50,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doctorImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  doctorMeta: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distance: {
    fontSize: 13,
    color: '#666',
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0077b6',
  },
});

export default DoctorsListScreen;