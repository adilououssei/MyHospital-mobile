// app/components/DoctorsListScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useApp } from '../context/AppContext';
import ScreenHeader from '../tabs/ScreenHeader';
import docteurService, { Docteur } from '../services/docteur.service';
import { API_BASE_URL } from '../services/api.config';

interface DoctorsListScreenProps {
  onNavigate: (screen: string, params?: any) => void;
  consultationType?: string;
  description?: string;
}

const DoctorsListScreen = ({ onNavigate, consultationType, description }: DoctorsListScreenProps) => {
  const { colors, t } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [doctors, setDoctors]         = useState<Docteur[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  useEffect(() => { loadDoctors(); }, []);

  const loadDoctors = async (search?: string) => {
    try {
      setLoading(true); setError(null);
      const data = await docteurService.getDocteurs(undefined, search, consultationType);
      setDoctors(data);
    } catch (err: any) {
      setError(t('dlCannotLoad'));
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const timer = setTimeout(() => { loadDoctors(searchQuery.trim() || undefined); }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectDoctor = (doctor: Docteur) => {
    onNavigate('doctorDetail', {
      doctor: {
        id: doctor.id, name: doctor.nomComplet, specialty: doctor.specialite,
        rating: doctor.note, ville: doctor.ville,
        price: docteurService.getPrixMin(doctor), photo: doctor.photo,
        telephone: doctor.telephone, email: doctor.email, adresse: doctor.adresse,
      },
      consultationType, description,
    });
  };

  const getConsultationLabel = () => {
    switch (consultationType) {
      case 'en_ligne': return t('ddConsultOnline');
      case 'domicile': return t('ddConsultHome');
      case 'hopital':  return t('ddConsultHospital');
      default:         return 'Consultation';
    }
  };

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.container}>
      <ScreenHeader title={t('dlTitle')} onBack={() => onNavigate('bookingType')} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Steps */}
          <View style={styles.stepIndicator}>
            <View style={styles.stepCompleted}><Ionicons name="checkmark" size={20} color="#fff" /></View>
            <View style={styles.stepLineCompleted} />
            <View style={styles.stepActive}><Text style={styles.stepTextActive}>2</Text></View>
            <View style={[styles.stepLine, { backgroundColor: colors.subText }]} />
            <View style={[styles.stepInactive, { backgroundColor: colors.inputBackground }]}>
              <Text style={[styles.stepTextInactive, { color: colors.subText }]}>3</Text>
            </View>
          </View>

          {/* Type consultation */}
          {consultationType && (
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={20} color="#1a56db" />
              <Text style={[styles.infoText, { color: colors.text }]}>{getConsultationLabel()}</Text>
            </View>
          )}

          {/* Recherche */}
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color={colors.subText} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={t('dlSearchPlaceholder')}
              placeholderTextColor={colors.subText}
              value={searchQuery} onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.subText} />
              </TouchableOpacity>
            )}
          </View>

          {/* États */}
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#1a56db" />
              <Text style={[styles.centerText, { color: colors.subText }]}>{t('dlLoading')}</Text>
            </View>
          ) : error ? (
            <View style={styles.centerContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
              <Text style={[styles.centerText, { color: colors.text }]}>{error}</Text>
              <TouchableOpacity onPress={() => loadDoctors()} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>{t('dlRetry')}</Text>
              </TouchableOpacity>
            </View>
          ) : doctors.length === 0 ? (
            <View style={styles.centerContainer}>
              <FontAwesome5 name="user-md" size={64} color={colors.subText} />
              <Text style={[styles.emptyText, { color: colors.text }]}>{t('dlNoDoctor')}</Text>
              <Text style={[styles.centerText, { color: colors.subText }]}>
                {searchQuery ? t('dlTryOther') : `${t('dlNoneForType')} ${getConsultationLabel().toLowerCase()}`}
              </Text>
            </View>
          ) : (
            <View style={styles.doctorsList}>
              {doctors.map(doctor => {
                const photoUrl = doctor.photo ? `${API_BASE_URL}${doctor.photo}` : null;
                const price    = docteurService.getPrixMin(doctor);
                return (
                  <TouchableOpacity key={doctor.id}
                    style={styles.doctorCard}
                    onPress={() => handleSelectDoctor(doctor)}>
                    {photoUrl
                      ? <Image source={{ uri: photoUrl }} style={styles.doctorImage} />
                      : <View style={styles.doctorImagePlaceholder}><FontAwesome5 name="user-md" size={40} color="#1a56db" /></View>
                    }
                    <View style={styles.doctorInfo}>
                      <Text style={[styles.doctorName, { color: colors.text }]}>{doctor.nomComplet}</Text>
                      <Text style={[styles.doctorSpecialty, { color: colors.subText }]}>{doctor.specialite ?? 'Médecin généraliste'}</Text>
                      <View style={styles.doctorMeta}>
                        <View style={styles.ratingContainer}>
                          <Ionicons name="star" size={14} color="#FFA500" />
                          <Text style={[styles.rating, { color: colors.text }]}>{doctor.note.toFixed(1)}</Text>
                        </View>
                        <View style={styles.distanceContainer}>
                          <Ionicons name="location-outline" size={14} color={colors.subText} />
                          <Text style={[styles.distance, { color: colors.subText }]}>{doctor.ville}</Text>
                        </View>
                      </View>
                      {price > 0 && <Text style={styles.price}>{price.toLocaleString()} FCFA</Text>}
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={colors.subText} />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  content: { padding: 20 },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 25 },
  stepCompleted: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a56db', justifyContent: 'center', alignItems: 'center' },
  stepActive: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a56db', justifyContent: 'center', alignItems: 'center' },
  stepInactive: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  stepTextActive: { color: '#fff', fontSize: 16, fontWeight: '600' },
  stepTextInactive: { fontSize: 16, fontWeight: '600' },
  stepLine: { width: 40, height: 2, marginHorizontal: 5 },
  stepLineCompleted: { width: 40, height: 2, backgroundColor: '#1a56db', marginHorizontal: 5 },
  infoCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 15, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#1a56db', backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  infoText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 15, paddingVertical: 12, marginBottom: 20, borderWidth: 1.5, borderColor: '#e5e7eb', backgroundColor: 'rgba(255,255,255,0.88)', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14 },
  centerContainer: { padding: 40, alignItems: 'center' },
  centerText: { fontSize: 14, textAlign: 'center', marginTop: 12 },
  emptyText: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 8, color: '#111827' },
  retryButton: { marginTop: 16, backgroundColor: '#1a3fad', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 14, shadowColor: '#1a56db', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  retryButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  doctorsList: { gap: 12, paddingBottom: 50 },
  doctorCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 15, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  doctorImage: { width: 80, height: 80, borderRadius: 40, marginRight: 15 },
  doctorImagePlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  doctorInfo: { flex: 1 },
  doctorName: { fontSize: 16, fontWeight: '600', marginBottom: 4, color: '#111827' },
  doctorSpecialty: { fontSize: 14, marginBottom: 8, color: '#6b7280' },
  doctorMeta: { flexDirection: 'row', gap: 15, marginBottom: 6 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating: { fontSize: 13, fontWeight: '600' },
  distanceContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  distance: { fontSize: 13 },
  price: { fontSize: 15, fontWeight: '700', color: '#1a56db' },
});

export default DoctorsListScreen;
