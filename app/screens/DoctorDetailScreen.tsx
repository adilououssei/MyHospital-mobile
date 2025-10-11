import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

interface DoctorDetailScreenProps {
  onNavigate: (screen: string, params?: any) => void;
  doctor?: any;
  consultationType?: string;
  description?: string;
}

const DoctorDetailScreen = ({
  onNavigate,
  doctor,
  consultationType,
  description,
}: DoctorDetailScreenProps) => {
  const [selectedDate, setSelectedDate] = useState('23');
  const [selectedTime, setSelectedTime] = useState('14:00');

  const dates = [
    { day: 'Lun', date: '21' },
    { day: 'Mar', date: '22' },
    { day: 'Mer', date: '23' },
    { day: 'Jeu', date: '24' },
    { day: 'Ven', date: '25' },
    { day: 'Sam', date: '26' },
  ];

  const timeSlots = [
    '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  ];

  const confirmationFee = 2000; // Frais de confirmation

  const handleNext = () => {
    if (!selectedDate || !selectedTime) {
      alert('Veuillez sélectionner une date et une heure');
      return;
    }

    onNavigate('paymentMethod', {
      doctor,
      consultationType,
      description,
      date: selectedDate,
      time: selectedTime,
      consultationPrice: doctor?.price || 15000,
      confirmationFee,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => onNavigate('doctorsList')}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails du médecin</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            <View style={styles.stepCompleted}>
              <Ionicons name="checkmark" size={20} color="#fff" />
            </View>
            <View style={styles.stepLineCompleted} />
            <View style={styles.stepCompleted}>
              <Ionicons name="checkmark" size={20} color="#fff" />
            </View>
            <View style={styles.stepLineCompleted} />
            <View style={styles.stepActive}>
              <Text style={styles.stepTextActive}>3</Text>
            </View>
          </View>

          {/* Doctor Info */}
          <View style={styles.doctorCard}>
            <View style={styles.doctorImagePlaceholder}>
              <FontAwesome5 name="user-md" size={50} color="#0077b6" />
            </View>
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>{doctor?.name || 'Dr. Marcus Horizon'}</Text>
              <Text style={styles.doctorSpecialty}>{doctor?.specialty || 'Cardiologue'}</Text>
              <View style={styles.doctorMeta}>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFA500" />
                  <Text style={styles.rating}>{doctor?.rating || 4.7}</Text>
                </View>
                <View style={styles.distanceContainer}>
                  <Ionicons name="location-outline" size={16} color="#666" />
                  <Text style={styles.distance}>{doctor?.distance || '800m'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>À propos</Text>
            <Text style={styles.aboutText}>
              Spécialiste en cardiologie avec plus de 15 ans d'expérience.
              Diplômé de l'université de médecine de Paris, le Dr. Marcus
              Horizon est reconnu pour son expertise...
            </Text>
            <TouchableOpacity>
              <Text style={styles.readMore}>Lire la suite</Text>
            </TouchableOpacity>
          </View>

          {/* Date Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choisir une date</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.datesScroll}
            >
              {dates.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dateCard,
                    selectedDate === item.date && styles.dateCardActive,
                  ]}
                  onPress={() => setSelectedDate(item.date)}
                >
                  <Text
                    style={[
                      styles.dateDay,
                      selectedDate === item.date && styles.dateDayActive,
                    ]}
                  >
                    {item.day}
                  </Text>
                  <Text
                    style={[
                      styles.dateNumber,
                      selectedDate === item.date && styles.dateNumberActive,
                    ]}
                  >
                    {item.date}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Time Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choisir une heure</Text>
            <View style={styles.timeGrid}>
              {timeSlots.map((time, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.timeSlot,
                    selectedTime === time && styles.timeSlotActive,
                  ]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text
                    style={[
                      styles.timeText,
                      selectedTime === time && styles.timeTextActive,
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Pricing */}
          <View style={styles.pricingCard}>
            <Text style={styles.pricingTitle}>Détails des frais</Text>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Prix de la consultation</Text>
              <Text style={styles.pricingValue}>{doctor?.price || 15000} FCFA</Text>
            </View>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Frais de confirmation</Text>
              <Text style={styles.pricingValue}>{confirmationFee} FCFA</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.pricingRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {(doctor?.price || 15000) + confirmationFee} FCFA
              </Text>
            </View>
          </View>

          {/* Important Note */}
          <View style={styles.noteCard}>
            <Ionicons name="information-circle" size={24} color="#FFA500" />
            <Text style={styles.noteText}>
              <Text style={styles.noteBold}>NB : </Text>
              Les frais de confirmation de {confirmationFee} FCFA ne sont pas
              remboursables, que le rendez-vous soit accepté ou refusé par le médecin.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Suivant</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingBottom: 30,
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
  menuButton: {
    padding: 5,
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
  stepTextActive: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  stepLineCompleted: {
    width: 40,
    height: 2,
    backgroundColor: '#0077b6',
    marginHorizontal: 5,
  },
  doctorCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doctorImagePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  doctorInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: 18,
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
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distance: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 8,
  },
  readMore: {
    fontSize: 14,
    color: '#0077b6',
    fontWeight: '600',
  },
  datesScroll: {
    marginHorizontal: -5,
  },
  dateCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    minWidth: 60,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dateCardActive: {
    backgroundColor: '#0077b6',
    borderColor: '#0077b6',
  },
  dateDay: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dateDayActive: {
    color: '#fff',
  },
  dateNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  dateNumberActive: {
    color: '#fff',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeSlot: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  timeSlotActive: {
    backgroundColor: '#0077b6',
    borderColor: '#0077b6',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  timeTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  pricingCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  pricingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pricingLabel: {
    fontSize: 14,
    color: '#666',
  },
  pricingValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0077b6',
  },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 15,
    gap: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFE4A0',
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  noteBold: {
    fontWeight: '700',
    color: '#000',
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  nextButton: {
    backgroundColor: '#0077b6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 30,
    gap: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DoctorDetailScreen;