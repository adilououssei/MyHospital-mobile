// app/components/DoctorProfileScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useApp } from '../context/AppContext';
import ScreenHeader from '../tabs/ScreenHeader';
import docteurService from '../services/docteur.service';
import { API_BASE_URL } from '../services/api.config';

interface DoctorProfileScreenProps {
  onNavigate: (screen: string, params?: any) => void;
  doctor: any;
}

const DoctorProfileScreen = ({ onNavigate, doctor }: DoctorProfileScreenProps) => {
  const { colors } = useApp();
  const [loading, setLoading] = useState(true);
  const [doctorDetail, setDoctorDetail] = useState<any>(null);

  useEffect(() => {
    loadDoctorDetails();
  }, []);

  const loadDoctorDetails = async () => {
    try {
      setLoading(true);
      const details = await docteurService.getDocteurById(doctor.id);
      setDoctorDetail(details);
    } catch (error) {
      console.error('Erreur chargement détails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (doctor?.telephone) {
      Linking.openURL(`tel:${doctor.telephone}`);
    }
  };

  const handleEmail = () => {
    if (doctor?.email) {
      Linking.openURL(`mailto:${doctor.email}`);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader title="Profil du médecin" onBack={() => onNavigate('doctorsDirectory')} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0077b6" />
          <Text style={[styles.loadingText, { color: colors.subText }]}>Chargement des informations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const photoUrl = doctor?.photo ? `${API_BASE_URL}${doctor.photo}` : null;
  const specialty = doctor?.specialty || docteurService.getSpecialite(doctor);
  const availableTypes = doctorDetail?.typesConsultation || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Profil du médecin" onBack={() => onNavigate('doctorsDirectory')} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          
          {/* Photo et informations principales */}
          <View style={styles.headerSection}>
            {photoUrl ? (
              <Image source={{ uri: photoUrl }} style={styles.doctorImageLarge} />
            ) : (
              <View style={[styles.doctorImagePlaceholderLarge, { backgroundColor: colors.inputBackground }]}>
                <FontAwesome5 name="user-md" size={60} color="#0077b6" />
              </View>
            )}
            
            <Text style={[styles.doctorNameLarge, { color: colors.text }]}>
              {doctor?.name || doctor?.nomComplet}
            </Text>
            <Text style={[styles.doctorSpecialtyLarge, { color: colors.subText }]}>
              {specialty}
            </Text>
            
            <View style={styles.ratingContainerLarge}>
              {[1, 2, 3, 4, 5].map(i => (
                <Ionicons
                  key={i}
                  name={i <= Math.round(doctor?.rating || 4.5) ? 'star' : 'star-outline'}
                  size={16}
                  color="#FFC107"
                />
              ))}
              <Text style={[styles.ratingText, { color: colors.text }]}>
                {(doctor?.rating || 4.5).toFixed(1)}
              </Text>
            </View>

            {/* Boutons de contact */}
            <View style={styles.contactButtons}>
              <TouchableOpacity style={[styles.contactBtn, { backgroundColor: colors.inputBackground }]} onPress={handleCall}>
                <Ionicons name="call-outline" size={20} color="#0077b6" />
                <Text style={[styles.contactBtnText, { color: colors.text }]}>Appeler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.contactBtn, { backgroundColor: colors.inputBackground }]} onPress={handleEmail}>
                <Ionicons name="mail-outline" size={20} color="#0077b6" />
                <Text style={[styles.contactBtnText, { color: colors.text }]}>Email</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Localisation */}
          {doctor?.ville && (
            <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
              <Ionicons name="location-outline" size={22} color="#0077b6" />
              <View style={styles.infoCardContent}>
                <Text style={[styles.infoCardTitle, { color: colors.text }]}>Localisation</Text>
                <Text style={[styles.infoCardValue, { color: colors.subText }]}>{doctor.ville}</Text>
                {doctor?.adresse && (
                  <Text style={[styles.infoCardValue, { color: colors.subText, marginTop: 4 }]}>{doctor.adresse}</Text>
                )}
              </View>
            </View>
          )}

          {/* Tarifs des consultations */}
          {availableTypes.length > 0 && (
            <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
              <Ionicons name="cash-outline" size={22} color="#0077b6" />
              <View style={styles.infoCardContent}>
                <Text style={[styles.infoCardTitle, { color: colors.text }]}>Tarifs des consultations</Text>
                {doctorDetail?.typesConsultation?.map((type: any) => (
                  <View key={type.type} style={styles.priceRow}>
                    <Text style={[styles.priceLabel, { color: colors.subText }]}>{type.label}</Text>
                    <Text style={[styles.priceValue, { color: '#0077b6' }]}>{type.prix.toLocaleString()} FCFA</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Description */}
          {doctorDetail?.biographie && (
            <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
              <Ionicons name="information-circle-outline" size={22} color="#0077b6" />
              <View style={styles.infoCardContent}>
                <Text style={[styles.infoCardTitle, { color: colors.text }]}>À propos</Text>
                <Text style={[styles.bioText, { color: colors.subText }]}>{doctorDetail.biographie}</Text>
              </View>
            </View>
          )}

          {/* Informations professionnelles */}
          {(doctorDetail?.diplomes || doctorDetail?.anneesExperience > 0 || doctorDetail?.languesParlees) && (
            <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
              <Ionicons name="school-outline" size={22} color="#0077b6" />
              <View style={styles.infoCardContent}>
                <Text style={[styles.infoCardTitle, { color: colors.text }]}>Informations professionnelles</Text>
                {doctorDetail?.diplomes && (
                  <Text style={[styles.profInfo, { color: colors.subText }]}>
                    <Text style={styles.profLabel}>Diplômes: </Text>
                    {doctorDetail.diplomes}
                  </Text>
                )}
                {doctorDetail?.anneesExperience > 0 && (
                  <Text style={[styles.profInfo, { color: colors.subText }]}>
                    <Text style={styles.profLabel}>Expérience: </Text>
                    {doctorDetail.anneesExperience} ans
                  </Text>
                )}
                {doctorDetail?.languesParlees && (
                  <Text style={[styles.profInfo, { color: colors.subText }]}>
                    <Text style={styles.profLabel}>Langues: </Text>
                    {doctorDetail.languesParlees}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Message pour prendre rendez-vous */}
          <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
            <Ionicons name="calendar-outline" size={22} color="#0077b6" />
            <View style={styles.infoCardContent}>
              <Text style={[styles.infoCardTitle, { color: colors.text }]}>Prendre rendez-vous</Text>
              <Text style={[styles.infoText, { color: colors.subText }]}>
                Pour consulter ce médecin, utilisez l'option "Prendre rendez-vous" depuis l'accueil.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 12, fontSize: 14 },
  
  headerSection: { alignItems: 'center', marginBottom: 24 },
  doctorImageLarge: { width: 120, height: 120, borderRadius: 60, marginBottom: 16 },
  doctorImagePlaceholderLarge: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  doctorNameLarge: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  doctorSpecialtyLarge: { fontSize: 16, marginBottom: 12 },
  ratingContainerLarge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 },
  ratingText: { fontSize: 14, fontWeight: '600', marginLeft: 8 },
  
  contactButtons: { flexDirection: 'row', gap: 12 },
  contactBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25 },
  contactBtnText: { fontSize: 14, fontWeight: '500' },
  
  infoCard: { flexDirection: 'row', padding: 16, borderRadius: 12, marginBottom: 16, gap: 12 },
  infoCardContent: { flex: 1 },
  infoCardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  infoCardValue: { fontSize: 14 },
  
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  priceLabel: { fontSize: 14 },
  priceValue: { fontSize: 14, fontWeight: '700' },
  
  bioText: { fontSize: 14, lineHeight: 22 },
  profInfo: { fontSize: 14, marginBottom: 6 },
  profLabel: { fontWeight: '600' },
  
  infoText: { fontSize: 14, lineHeight: 20 },
});

export default DoctorProfileScreen;