// app/components/DoctorDetailScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Image, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useApp } from '../context/AppContext';
import ScreenHeader from '../tabs/ScreenHeader';
import docteurService, { DocteurDetail, Creneau, Disponibilite } from '../services/docteur.service';
import { API_BASE_URL } from '../services/api.config';
import { usePayment } from '../hooks/Usepayment';
import rendezVousService from '../services/rendezvous.service';

interface DoctorDetailScreenProps {
  onNavigate: (screen: string, params?: any) => void;
  doctor?: any;
  consultationType?: string;
  description?: string;
}

const formatDateForDisplay = (dateStr: string) => {
  const jours = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const d = new Date(dateStr + 'T00:00:00');
  return { label: jours[d.getDay()], dateNum: d.getDate().toString(), fullDate: dateStr };
};

// ✅ Frais de confirmation : 200 FCFA
const CONFIRMATION_FEE = 200;

const DoctorDetailScreen = ({ onNavigate, doctor: initialDoctor, consultationType, description }: DoctorDetailScreenProps) => {
  const { colors, t } = useApp();

  const [doctorDetails, setDoctorDetails]       = useState<DocteurDetail | null>(null);
  const [loadingDetails, setLoadingDetails]     = useState(false);
  const [errorDetails, setErrorDetails]         = useState<string | null>(null);
  const [disponibilites, setDisponibilites]     = useState<Disponibilite[]>([]);
  const [loadingDispos, setLoadingDispos]       = useState(false);
  const [datesDisponibles, setDatesDisponibles] = useState<Array<{ label: string; dateNum: string; fullDate: string }>>([]);
  const [selectedDate, setSelectedDate]         = useState<string | null>(null);
  const [creneaux, setCreneaux]                 = useState<Creneau[]>([]);
  const [selectedCreneau, setSelectedCreneau]   = useState<Creneau | null>(null);

  const { isLoading: isCreatingRdv, createRendezVousAndPay } = usePayment(
    () => {
      Alert.alert(t('success'), t('ddSuccessMsg'), [{ text: 'OK', onPress: () => onNavigate('appointments') }]);
    },
    (error) => { console.error('Erreur création RDV:', error); }
  );

  useEffect(() => {
    if (initialDoctor?.id) {
      loadDetails(initialDoctor.id);
      loadDisponibilites(initialDoctor.id);
    }
  }, [initialDoctor?.id]);

  const loadDetails = async (id: number) => {
    try {
      setLoadingDetails(true); setErrorDetails(null);
      const details = await docteurService.getDocteurById(id);
      setDoctorDetails(details);
    } catch (err: any) {
      setErrorDetails(t('ddCannotLoad'));
    } finally { setLoadingDetails(false); }
  };

  const loadDisponibilites = async (id: number) => {
    try {
      setLoadingDispos(true);
      const today = new Date();
      const in30Days = new Date(); in30Days.setDate(today.getDate() + 30);
      const dateDebut = today.toISOString().split('T')[0];
      const dateFin   = in30Days.toISOString().split('T')[0];
      const params: any = { date_debut: dateDebut, date_fin: dateFin };
      if (consultationType === 'hospital') params.type = 'hopital';
      else if (consultationType === 'home') params.type = 'domicile';
      else if (consultationType === 'video') params.type = 'en_ligne';
      const dispos = await docteurService.getDisponibilites(id, params);
      setDisponibilites(dispos);
      const dates = dispos.map(d => formatDateForDisplay(d.date));
      setDatesDisponibles(dates);
      if (dates.length > 0) setSelectedDate(dates[0].fullDate);
    } catch (err: any) {
      setDatesDisponibles([]);
    } finally { setLoadingDispos(false); }
  };

  useEffect(() => {
    if (selectedDate) {
      const dispo = disponibilites.find(d => d.date === selectedDate);
      setCreneaux(dispo?.creneaux || []);
      setSelectedCreneau(null);
    }
  }, [selectedDate, disponibilites]);

  const doc = doctorDetails ?? initialDoctor;
  const photoUrl = doc?.photo ? `${API_BASE_URL}${doc.photo}` : null;
  const consultationPrice = (() => {
    if (doctorDetails) return doctorDetails.tarifs.hopital ?? doctorDetails.tarifs.domicile ?? doctorDetails.tarifs.enLigne ?? 0;
    return initialDoctor?.price ?? 0;
  })();

  const getConsultationLabel = () => {
    switch (consultationType) {
      case 'en_ligne': return t('ddConsultOnline');
      case 'domicile': return t('ddConsultHome');
      default:         return t('ddConsultHospital');
    }
  };

  const getConsultationIcon = () => {
    if (consultationType === 'en_ligne') return 'videocam';
    if (consultationType === 'domicile') return 'home';
    return 'business';
  };

  const handleNext = async () => {
    if (!selectedDate)    { Alert.alert('', t('ddSelectDate')); return; }
    if (!selectedCreneau) { Alert.alert('', t('ddSelectSlot')); return; }

    const selectedDateObj = datesDisponibles.find(d => d.fullDate === selectedDate);
    const mappedType = rendezVousService.mapConsultationType(consultationType || '');

    // ── Données docteur complètes à transmettre ────────────────────
    const doctorPayload = {
      id:         doc?.id ?? initialDoctor?.id,
      name:       doctorDetails?.nomComplet ?? initialDoctor?.name ?? 'Médecin',
      nomComplet: doctorDetails?.nomComplet ?? initialDoctor?.name ?? 'Médecin', // ✅
      specialty:  doctorDetails?.specialite ?? initialDoctor?.specialty ?? 'Spécialiste',
      specialite: doctorDetails?.specialite ?? initialDoctor?.specialty ?? 'Spécialiste', // ✅
      rating:     doctorDetails?.note ?? initialDoctor?.rating ?? null,
      note:       doctorDetails?.note ?? initialDoctor?.rating ?? null,           // ✅
      photo:      doc?.photo ?? null,
    };

    if (mappedType === 'en_ligne') {
      // → Paiement requis
      onNavigate('paymentMethod', {
        doctor:           doctorPayload,
        consultationType,
        description,
        date:             selectedDate,
        // ✅ Date lisible transmise correctement
        dateFormatted:    selectedDateObj
          ? `${selectedDateObj.dateNum} ${selectedDateObj.label}`
          : selectedDate,
        time:             selectedCreneau.heure,
        creneauId:        selectedCreneau.id,
        consultationPrice,
        confirmationFee:  CONFIRMATION_FEE, // ✅ 200 FCFA
      });
    } else {
      // → Domicile / hôpital : création directe sans paiement
      const dateTime = `${selectedDate}T${selectedCreneau.heure}:00`;
      await createRendezVousAndPay({
        docteurId:        doc?.id || initialDoctor?.id,
        date:             dateTime,
        typeConsultation: mappedType,
        modePaiement:     'tmoney',
        description,
      });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={t('ddTitle')} onBack={() => onNavigate('doctorsList')} rightIcon="ellipsis-vertical" />

      {loadingDetails ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0077b6" />
          <Text style={[styles.centeredText, { color: colors.subText }]}>{t('ddLoading')}</Text>
        </View>
      ) : errorDetails ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
          <Text style={[styles.centeredText, { color: colors.text }]}>{errorDetails}</Text>
          <TouchableOpacity onPress={() => initialDoctor?.id && loadDetails(initialDoctor.id)} style={styles.retryButton}>
            <Text style={styles.retryText}>{t('ddRetry')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.content}>

            {/* Steps */}
            <View style={styles.stepRow}>
              {[1, 2, 3].map((s, i) => (
                <React.Fragment key={s}>
                  {i > 0 && <View style={[styles.stepLine, { backgroundColor: '#0077b6' }]} />}
                  <View style={styles.stepCircle}>
                    {s < 3 ? <Ionicons name="checkmark" size={18} color="#fff" /> : <Text style={styles.stepNum}>3</Text>}
                  </View>
                </React.Fragment>
              ))}
            </View>

            {/* Carte docteur */}
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              {photoUrl
                ? <Image source={{ uri: photoUrl }} style={styles.avatar} />
                : <View style={[styles.avatarPlaceholder, { backgroundColor: '#E3F2FD' }]}><FontAwesome5 name="user-md" size={46} color="#0077b6" /></View>
              }
              <View style={styles.cardInfo}>
                <Text style={[styles.docName, { color: colors.text }]} numberOfLines={2}>
                  {doctorDetails?.nomComplet ?? initialDoctor?.name ?? 'Médecin'}
                </Text>
                <Text style={[styles.docSpecialty, { color: colors.subText }]}>
                  {doctorDetails?.specialite ?? initialDoctor?.specialty ?? 'Généraliste'}
                </Text>
                <View style={styles.metaRow}>
                  <Ionicons name="star" size={14} color="#FFA500" />
                  <Text style={[styles.metaText, { color: colors.text }]}>
                    {(doctorDetails?.note ?? initialDoctor?.rating ?? 4.5).toFixed(1)}
                  </Text>
                  <Ionicons name="location-outline" size={14} color={colors.subText} style={{ marginLeft: 10 }} />
                  <Text style={[styles.metaText, { color: colors.subText }]}>
                    {doctorDetails?.ville ?? initialDoctor?.ville ?? 'Lomé'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Badge type consultation */}
            <View style={[styles.consultationBadge, { backgroundColor: colors.inputBackground }]}>
              <Ionicons name={getConsultationIcon() as any} size={20} color="#0077b6" />
              <Text style={[styles.consultationText, { color: colors.text }]}>{getConsultationLabel()}</Text>
            </View>

            {/* À propos */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('ddAbout')}</Text>
              <Text style={[styles.aboutText, { color: colors.subText }]}>
                {doctorDetails?.biographie ?? `Spécialiste en ${doctorDetails?.specialite ?? initialDoctor?.specialty ?? 'médecine'}.`}
              </Text>
              {doctorDetails && (
                <View style={styles.detailsGrid}>
                  {doctorDetails.anneesExperience > 0 && (
                    <View style={styles.detailRow}>
                      <Ionicons name="briefcase-outline" size={18} color="#0077b6" />
                      <Text style={[styles.detailText, { color: colors.subText }]}>{doctorDetails.anneesExperience} {t('ddExperience')}</Text>
                    </View>
                  )}
                  {doctorDetails.nombrePatients > 0 && (
                    <View style={styles.detailRow}>
                      <Ionicons name="people-outline" size={18} color="#0077b6" />
                      <Text style={[styles.detailText, { color: colors.subText }]}>{doctorDetails.nombrePatients}+ {t('ddPatients')}</Text>
                    </View>
                  )}
                  {doctorDetails.languesParlees && (
                    <View style={styles.detailRow}>
                      <Ionicons name="language-outline" size={18} color="#0077b6" />
                      <Text style={[styles.detailText, { color: colors.subText }]}>{doctorDetails.languesParlees}</Text>
                    </View>
                  )}
                  {doctorDetails.numeroOrdre && (
                    <View style={styles.detailRow}>
                      <Ionicons name="card-outline" size={18} color="#0077b6" />
                      <Text style={[styles.detailText, { color: colors.subText }]}>N° Ordre : {doctorDetails.numeroOrdre}</Text>
                    </View>
                  )}
                </View>
              )}
              {doctorDetails?.diplomes && (
                <View style={[styles.diplomesBox, { borderTopColor: colors.subText }]}>
                  <Text style={[styles.diplomesTitle, { color: colors.text }]}>{t('ddDiplomas')}</Text>
                  <Text style={[styles.diplomesText, { color: colors.subText }]}>{doctorDetails.diplomes}</Text>
                </View>
              )}
            </View>

            {/* Tarifs */}
            {doctorDetails && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('ddPrices')}</Text>
                <View style={[styles.tarifGrid, { backgroundColor: colors.card }]}>
                  {doctorDetails.tarifs.hopital  != null && <View style={styles.tarifItem}><Ionicons name="business-outline" size={20} color="#0077b6" /><Text style={[styles.tarifLabel, { color: colors.subText }]}>{t('ddConsultHospital')}</Text><Text style={styles.tarifPrice}>{doctorDetails.tarifs.hopital.toLocaleString()} FCFA</Text></View>}
                  {doctorDetails.tarifs.domicile != null && <View style={styles.tarifItem}><Ionicons name="home-outline"     size={20} color="#0077b6" /><Text style={[styles.tarifLabel, { color: colors.subText }]}>{t('ddConsultHome')}</Text>    <Text style={styles.tarifPrice}>{doctorDetails.tarifs.domicile.toLocaleString()} FCFA</Text></View>}
                  {doctorDetails.tarifs.enLigne  != null && <View style={styles.tarifItem}><Ionicons name="videocam-outline" size={20} color="#0077b6" /><Text style={[styles.tarifLabel, { color: colors.subText }]}>{t('ddConsultOnline')}</Text>  <Text style={styles.tarifPrice}>{doctorDetails.tarifs.enLigne.toLocaleString()} FCFA</Text></View>}
                </View>
              </View>
            )}

            {/* Dates */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('ddAvailableDates')}</Text>
              {loadingDispos ? (
                <View style={styles.datesLoading}>
                  <ActivityIndicator size="small" color="#0077b6" />
                  <Text style={[styles.datesLoadingText, { color: colors.subText }]}>{t('ddLoadingDates')}</Text>
                </View>
              ) : datesDisponibles.length === 0 ? (
                <View style={[styles.datesEmpty, { backgroundColor: colors.card }]}>
                  <Ionicons name="calendar-outline" size={32} color={colors.subText} />
                  <Text style={[styles.datesEmptyText, { color: colors.subText }]}>{t('ddNoDates')}</Text>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {datesDisponibles.map(item => {
                    const active = selectedDate === item.fullDate;
                    return (
                      <TouchableOpacity key={item.fullDate}
                        style={[styles.dateCard, { backgroundColor: colors.card, borderColor: colors.subText }, active && styles.dateCardActive]}
                        onPress={() => setSelectedDate(item.fullDate)}>
                        <Text style={[styles.dateLabel, { color: colors.subText }, active && styles.dateLabelActive]}>{item.label}</Text>
                        <Text style={[styles.dateNum, { color: colors.text }, active && styles.dateNumActive]}>{item.dateNum}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>

            {/* Créneaux */}
            {selectedDate && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('ddAvailableSlots')}</Text>
                {creneaux.length === 0 ? (
                  <View style={[styles.creneauxEmpty, { backgroundColor: colors.card }]}>
                    <Ionicons name="time-outline" size={32} color={colors.subText} />
                    <Text style={[styles.creneauxEmptyText, { color: colors.subText }]}>{t('ddNoSlots')}</Text>
                  </View>
                ) : (
                  <View style={styles.creneauxGrid}>
                    {creneaux.map(c => {
                      const active = selectedCreneau?.id === c.id;
                      return (
                        <TouchableOpacity key={c.id} disabled={!c.disponible}
                          style={[styles.creneauBtn, { backgroundColor: !c.disponible ? colors.inputBackground : colors.card, borderColor: !c.disponible ? '#ccc' : colors.subText, opacity: c.disponible ? 1 : 0.45 }, active && styles.creneauBtnActive]}
                          onPress={() => setSelectedCreneau(c)}>
                          <Text style={[styles.creneauText, { color: !c.disponible ? '#aaa' : colors.subText }, active && styles.creneauTextActive]}>{c.heure}</Text>
                          {!c.disponible && <Text style={styles.creneauPris}>{t('ddOccupied')}</Text>}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            )}

            {/* Récap prix consultation en ligne */}
            {consultationType === 'en_ligne' && (
              <>
                <View style={[styles.pricingCard, { backgroundColor: colors.card }]}>
                  <Text style={[styles.pricingTitle, { color: colors.text }]}>{t('ddFeeDetails')}</Text>
                  <View style={styles.pricingRow}>
                    <Text style={[styles.pricingLabel, { color: colors.subText }]}>{t('ddConsultation')}</Text>
                    <Text style={[styles.pricingVal, { color: colors.text }]}>{consultationPrice > 0 ? `${consultationPrice.toLocaleString()} FCFA` : '—'}</Text>
                  </View>
                  <View style={styles.pricingRow}>
                    <Text style={[styles.pricingLabel, { color: colors.subText }]}>{t('ddConfirmFee')}</Text>
                    {/* ✅ Affiche 200 FCFA */}
                    <Text style={[styles.pricingVal, { color: colors.text }]}>{CONFIRMATION_FEE.toLocaleString()} FCFA</Text>
                  </View>
                  <View style={[styles.divider, { backgroundColor: '#E0E0E0' }]} />
                  <View style={styles.pricingRow}>
                    <Text style={[styles.totalLabel, { color: colors.text }]}>{t('ddTotal')}</Text>
                    <Text style={styles.totalVal}>{(consultationPrice + CONFIRMATION_FEE).toLocaleString()} FCFA</Text>
                  </View>
                </View>
                <View style={styles.noteCard}>
                  <Ionicons name="information-circle" size={22} color="#FFA500" />
                  <Text style={[styles.noteText, { color: colors.subText }]}>
                    <Text style={[styles.noteBold, { color: colors.text }]}>{t('ddNbOnlineLabel')} </Text>
                    {t('ddNbOnline')} {CONFIRMATION_FEE.toLocaleString()} {t('ddNbOnline2')}
                  </Text>
                </View>
              </>
            )}

            {/* Note domicile/hôpital */}
            {consultationType !== 'en_ligne' && (
              <View style={styles.noteCard}>
                <Ionicons name="information-circle" size={22} color="#0077b6" />
                <Text style={[styles.noteText, { color: colors.subText }]}>
                  <Text style={[styles.noteBold, { color: colors.text }]}>{t('ddPayOnSite')} </Text>
                  {t('ddPayOnSiteMsg')}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {!loadingDetails && !errorDetails && (
        <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.subText }]}>
          <TouchableOpacity style={[styles.nextBtn, isCreatingRdv && styles.nextBtnDisabled]} onPress={handleNext} disabled={isCreatingRdv}>
            {isCreatingRdv ? <ActivityIndicator color="#fff" /> : (
              <>
                <Text style={styles.nextBtnText}>{consultationType === 'en_ligne' ? t('ddContinuePayment') : t('ddConfirmRdv')}</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 110 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  centeredText: { marginTop: 15, fontSize: 14, textAlign: 'center' },
  retryButton: { marginTop: 20, backgroundColor: '#0077b6', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 25 },
  stepCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0077b6', justifyContent: 'center', alignItems: 'center' },
  stepLine: { width: 40, height: 2, marginHorizontal: 5 },
  stepNum: { color: '#fff', fontSize: 16, fontWeight: '600' },
  card: { flexDirection: 'row', borderRadius: 15, padding: 15, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  avatar: { width: 90, height: 90, borderRadius: 45, marginRight: 15 },
  avatarPlaceholder: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  cardInfo: { flex: 1, justifyContent: 'center' },
  docName: { fontSize: 17, fontWeight: '600', marginBottom: 4 },
  docSpecialty: { fontSize: 13, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 13, marginLeft: 4 },
  consultationBadge: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 15, paddingVertical: 12, borderRadius: 10, marginBottom: 20 },
  consultationText: { fontSize: 15, fontWeight: '600' },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 17, fontWeight: '600', marginBottom: 12 },
  aboutText: { fontSize: 14, lineHeight: 22 },
  detailsGrid: { marginTop: 12, gap: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailText: { fontSize: 14 },
  diplomesBox: { marginTop: 15, paddingTop: 15, borderTopWidth: 1 },
  diplomesTitle: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
  diplomesText: { fontSize: 13, lineHeight: 20 },
  tarifGrid: { flexDirection: 'row', borderRadius: 12, padding: 15, gap: 10 },
  tarifItem: { flex: 1, alignItems: 'center', gap: 4 },
  tarifLabel: { fontSize: 12 },
  tarifPrice: { fontSize: 13, fontWeight: '700', color: '#0077b6' },
  datesLoading: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 20 },
  datesLoadingText: { fontSize: 14 },
  datesEmpty: { borderRadius: 12, padding: 30, alignItems: 'center', gap: 10 },
  datesEmptyText: { fontSize: 14, textAlign: 'center' },
  dateCard: { borderRadius: 12, padding: 12, marginRight: 10, alignItems: 'center', minWidth: 58, borderWidth: 2 },
  dateCardActive: { backgroundColor: '#0077b6', borderColor: '#0077b6' },
  dateLabel: { fontSize: 12, marginBottom: 4 },
  dateLabelActive: { color: '#fff' },
  dateNum: { fontSize: 20, fontWeight: '600' },
  dateNumActive: { color: '#fff' },
  creneauxEmpty: { borderRadius: 12, padding: 30, alignItems: 'center', gap: 10 },
  creneauxEmptyText: { fontSize: 14, textAlign: 'center' },
  creneauxGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  creneauBtn: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 20, borderWidth: 1, alignItems: 'center' },
  creneauBtnActive: { backgroundColor: '#0077b6', borderColor: '#0077b6' },
  creneauText: { fontSize: 14, fontWeight: '500' },
  creneauTextActive: { color: '#fff', fontWeight: '600' },
  creneauPris: { fontSize: 9, color: '#aaa', marginTop: 1 },
  pricingCard: { borderRadius: 15, padding: 20, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  pricingTitle: { fontSize: 16, fontWeight: '600', marginBottom: 15 },
  pricingRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  pricingLabel: { fontSize: 14 },
  pricingVal: { fontSize: 14, fontWeight: '500' },
  divider: { height: 1, marginVertical: 10 },
  totalLabel: { fontSize: 16, fontWeight: '600' },
  totalVal: { fontSize: 18, fontWeight: '700', color: '#0077b6' },
  noteCard: { flexDirection: 'row', backgroundColor: '#FFF9E6', borderRadius: 12, padding: 15, gap: 10, marginBottom: 20, borderWidth: 1, borderColor: '#FFE4A0' },
  noteText: { flex: 1, fontSize: 13, lineHeight: 20 },
  noteBold: { fontWeight: '700' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, borderTopWidth: 1 },
  nextBtn: { backgroundColor: '#0077b6', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 30, gap: 8 },
  nextBtnDisabled: { backgroundColor: '#ccc' },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default DoctorDetailScreen;