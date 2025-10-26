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
import { useApp } from '../context/AppContext';

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
  const { colors } = useApp();
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { 
        backgroundColor: colors.card,
        borderBottomColor: colors.border
      }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => onNavigate('bookingType')}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Choisir un médecin</Text>
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
            <View style={[styles.stepLine, { backgroundColor: colors.border }]} />
            <View style={[styles.stepInactive, { backgroundColor: colors.border }]}>
              <Text style={[styles.stepTextInactive, { color: colors.subText }]}>3</Text>
            </View>
          </View>

          {/* Search Bar */}
          <View style={[styles.searchBar, { 
            backgroundColor: colors.inputBackground,
            borderColor: colors.border
          }]}>
            <Ionicons name="search-outline" size={20} color={colors.subText} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Rechercher un médecin..."
              placeholderTextColor={colors.subText}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Doctors List */}
          <View style={styles.doctorsList}>
            {filteredDoctors.map((doctor) => (
              <TouchableOpacity
                key={doctor.id}
                style={[styles.doctorCard, { backgroundColor: colors.card }]}
                onPress={() => handleSelectDoctor(doctor)}
              >
                <View style={styles.doctorImagePlaceholder}>
                  <FontAwesome5 name="user-md" size={40} color="#0077b6" />
                </View>

                <View style={styles.doctorInfo}>
                  <Text style={[styles.doctorName, { color: colors.text }]}>{doctor.name}</Text>
                  <Text style={[styles.doctorSpecialty, { color: colors.subText }]}>{doctor.specialty}</Text>

                  <View style={styles.doctorMeta}>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color="#FFA500" />
                      <Text style={[styles.rating, { color: colors.text }]}>{doctor.rating}</Text>
                    </View>
                    <View style={styles.distanceContainer}>
                      <Ionicons name="location-outline" size={14} color={colors.subText} />
                      <Text style={[styles.distance, { color: colors.subText }]}>{doctor.distance}</Text>
                    </View>
                  </View>

                  <Text style={styles.price}>{doctor.price} FCFA</Text>
                </View>

                <Ionicons name="chevron-forward" size={24} color={colors.subText} />
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepTextActive: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  stepTextInactive: {
    fontSize: 16,
    fontWeight: '600',
  },
  stepLine: {
    width: 40,
    height: 2,
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
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },
  doctorsList: {
    gap: 12,
    paddingBottom: 50,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
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
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distance: {
    fontSize: 13,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0077b6',
  },
});

export default DoctorsListScreen;