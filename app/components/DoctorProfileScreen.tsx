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
import evaluationService, { EvaluationDocteur } from '../services/evaluation.service';
import StarRating from './StarRating';
import { API_BASE_URL } from '../services/api.config';

interface DoctorProfileScreenProps {
  onNavigate: (screen: string, params?: any) => void;
  doctor: any;
}

const DoctorProfileScreen = ({ onNavigate, doctor }: DoctorProfileScreenProps) => {
  const { colors } = useApp();
  const [loading, setLoading] = useState(true);
  const [doctorDetail, setDoctorDetail] = useState<any>(null);
  const [evaluations, setEvaluations] = useState<EvaluationDocteur[]>([]);
  const [loadingEvals, setLoadingEvals] = useState(false);

  useEffect(() => {
    loadDoctorDetails();
    loadEvaluations();
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

  const loadEvaluations = async () => {
    try {
      setLoadingEvals(true);
      const evals = await evaluationService.getEvaluationsDocteur(doctor.id);
      setEvaluations(evals);
    } catch {
      // silencieux
    } finally {
      setLoadingEvals(false);
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
      <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.container}>
        <ScreenHeader title="Profil du médecin" onBack={() => onNavigate('doctorsDirectory')} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1a56db" />
          <Text style={[styles.loadingText, { color: colors.subText }]}>Chargement des informations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const photoUrl = doctor?.photo ? `${API_BASE_URL}${doctor.photo}` : null;
  const specialty = doctor?.specialty || docteurService.getSpecialite(doctor);
  const availableTypes = doctorDetail?.typesConsultation || [];

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.container}>
      <ScreenHeader title="Profil du médecin" onBack={() => onNavigate('doctorsDirectory')} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          
          {/* Photo et informations principales */}
          <View style={styles.headerSection}>
            {photoUrl ? (
              <Image source={{ uri: photoUrl }} style={styles.doctorImageLarge} />
            ) : (
              <View style={styles.doctorImagePlaceholderLarge}>
                <FontAwesome5 name="user-md" size={60} color="#1a56db" />
              </View>
            )}
            
            <Text style={[styles.doctorNameLarge, { color: colors.text }]}>
              {doctor?.name || doctor?.nomComplet}
            </Text>
            <Text style={[styles.doctorSpecialtyLarge, { color: colors.subText }]}>
              {specialty}
            </Text>
            
            <StarRating
              note={doctor?.note || doctor?.rating || 0}
              nombreAvis={doctor?.nombreAvis || 0}
              size={16}
              showValue
              showAvisCount
            />

            {/* Boutons de contact */}
            <View style={styles.contactButtons}>
              <TouchableOpacity style={styles.contactBtn} onPress={handleCall}>
                <Ionicons name="call-outline" size={20} color="#1a56db" />
                <Text style={[styles.contactBtnText, { color: colors.text }]}>Appeler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactBtn} onPress={handleEmail}>
                <Ionicons name="mail-outline" size={20} color="#1a56db" />
                <Text style={[styles.contactBtnText, { color: colors.text }]}>Email</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Localisation */}
          {doctor?.ville && (
            <View style={styles.infoCard}>
              <Ionicons name="location-outline" size={22} color="#1a56db" />
              <View style={styles.infoCardContent}>
                <Text style={[styles.infoCardTitle, { color: colors.text }]}>Localisation</Text>
                <Text style={[styles.infoCardValue, { color: colors.subText }]}>{doctor.ville}</Text>
                {doctor?.adresse && (
                  <Text style={[styles.infoCardValue, { color: colors.subText, marginTop: 4 }]}>{doctor.adresse}</Text>
                )}
              </View>
            </View>
          )}

          {/* Lieu de consultation */}
          {doctorDetail?.consultationLocation?.latitude && doctorDetail?.consultationLocation?.longitude && (
            <View style={styles.infoCard}>
              <Ionicons name="navigate-outline" size={22} color="#198754" />
              <View style={styles.infoCardContent}>
                <Text style={[styles.infoCardTitle, { color: colors.text }]}>Lieu de consultation</Text>
                {doctorDetail.consultationLocation.adresse && (
                  <Text style={[styles.infoCardValue, { color: colors.subText }]}>
                    {doctorDetail.consultationLocation.adresse}
                  </Text>
                )}
                {doctorDetail.consultationLocation.indication && (
                  <Text style={[styles.infoCardValue, { color: colors.subText, marginTop: 4, fontStyle: 'italic' }]}>
                    {doctorDetail.consultationLocation.indication}
                  </Text>
                )}
                <TouchableOpacity
                  style={styles.routeButton}
                  onPress={() => Linking.openURL(
                    `https://www.google.com/maps/dir/?api=1&destination=${doctorDetail.consultationLocation.latitude},${doctorDetail.consultationLocation.longitude}`
                  )}
                >
                  <Ionicons name="navigate" size={16} color="#fff" />
                  <Text style={styles.routeButtonText}>Ouvrir l'itinéraire</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Tarifs des consultations */}
          {availableTypes.length > 0 && (
            <View style={styles.infoCard}>
              <Ionicons name="cash-outline" size={22} color="#1a56db" />
              <View style={styles.infoCardContent}>
                <Text style={[styles.infoCardTitle, { color: colors.text }]}>Tarifs des consultations</Text>
                {doctorDetail?.typesConsultation?.map((type: any) => (
                  <View key={type.type} style={styles.priceRow}>
                    <Text style={[styles.priceLabel, { color: colors.subText }]}>{type.label}</Text>
                    <Text style={[styles.priceValue, { color: '#1a56db' }]}>{type.prix.toLocaleString()} FCFA</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Description */}
          {doctorDetail?.biographie && (
            <View style={styles.infoCard}>
              <Ionicons name="information-circle-outline" size={22} color="#1a56db" />
              <View style={styles.infoCardContent}>
                <Text style={[styles.infoCardTitle, { color: colors.text }]}>À propos</Text>
                <Text style={[styles.bioText, { color: colors.subText }]}>{doctorDetail.biographie}</Text>
              </View>
            </View>
          )}

          {/* Informations professionnelles */}
          {(doctorDetail?.diplomes || doctorDetail?.anneesExperience > 0 || doctorDetail?.languesParlees) && (
            <View style={styles.infoCard}>
              <Ionicons name="school-outline" size={22} color="#1a56db" />
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

          {/* Avis des patients */}
            <View style={styles.infoCard}>
            <Ionicons name="chatbubbles-outline" size={22} color="#FFC107" />
            <View style={styles.infoCardContent}>
              <Text style={[styles.infoCardTitle, { color: colors.text }]}>Avis des patients</Text>
              {loadingEvals ? (
                <ActivityIndicator size="small" color="#1a56db" style={{ marginTop: 8 }} />
              ) : evaluations.length === 0 ? (
                <Text style={[styles.infoText, { color: colors.subText }]}>Aucun avis pour le moment.</Text>
              ) : (
                evaluations.slice(0, 10).map(ev => (
                  <View key={ev.id} style={styles.evaluationItem}>
                    <View style={styles.evaluationHeader}>
                      <StarRating note={ev.note} size={11} showValue={false} />
                      <Text style={[styles.evaluationDate, { color: colors.subText }]}>
                        {new Date(ev.createdAt).toLocaleDateString('fr-FR')}
                      </Text>
                    </View>
                    {ev.commentaire && (
                      <Text style={[styles.evaluationComment, { color: colors.subText }]}>
                        {ev.commentaire}
                      </Text>
                    )}
                  </View>
                ))
              )}
            </View>
          </View>

          {/* Message pour prendre rendez-vous */}
          <View style={styles.infoCard}>
            <Ionicons name="calendar-outline" size={22} color="#1a56db" />
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
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 12, fontSize: 14 },
  
  headerSection: { alignItems: 'center', marginBottom: 20 },
  doctorImageLarge: { width: 100, height: 100, borderRadius: 50, marginBottom: 16 },
  doctorImagePlaceholderLarge: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  doctorNameLarge: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 4 },
  doctorSpecialtyLarge: { fontSize: 15, color: '#6b7280', marginBottom: 12 },
  ratingContainerLarge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 },
  ratingText: { fontSize: 14, fontWeight: '600', marginLeft: 8 },
  
  contactButtons: { flexDirection: 'row', gap: 12 },
  contactBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: '#f3f4f6' },
  contactBtnText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  
  routeButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#198754', paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, marginTop: 10, alignSelf: 'flex-start',
  },
  routeButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  infoCard: { flexDirection: 'row', padding: 16, borderRadius: 16, marginBottom: 12, gap: 12, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3, marginHorizontal: 0 },
  infoCardContent: { flex: 1 },
  infoCardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  infoCardValue: { fontSize: 14, color: '#6b7280' },
  
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  priceLabel: { fontSize: 14 },
  priceValue: { fontSize: 14, fontWeight: '700' },
  
  bioText: { fontSize: 14, lineHeight: 22, color: '#6b7280' },
  profInfo: { fontSize: 14, marginBottom: 6, color: '#6b7280' },
  profLabel: { fontWeight: '600' },
  
  infoText: { fontSize: 14, lineHeight: 20 },
  evaluationItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  evaluationHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4,
  },
  evaluationDate: { fontSize: 11, color: '#9ca3af' },
  evaluationComment: { fontSize: 13, lineHeight: 18, fontStyle: 'italic', color: '#6b7280' },
});

export default DoctorProfileScreen;
