// app/components/PaymentMethodScreen.tsx
// ✅ PayPlus DIRECT — UX modale (numéro → USSD sur téléphone → confirmation)

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useApp } from '../context/AppContext';
import ScreenHeader from '../tabs/ScreenHeader';
import rendezVousService from '../services/rendezvous.service';

interface PaymentMethodScreenProps {
  onNavigate: (screen: string) => void;
  doctor?: any;
  consultationType?: string;
  description?: string;
  date?: string;
  dateFormatted?: string;
  time?: string;
  selectedSlot?: any;
  consultationPrice?: number;
  confirmationFee?: number;
}

const PaymentMethodScreen = ({
  onNavigate,
  doctor,
  consultationType,
  description,
  date,
  dateFormatted,
  time,
  consultationPrice = 15000,
  confirmationFee   = 200,
}: PaymentMethodScreenProps) => {
  const { colors } = useApp();

  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  // Modal 1 : saisie du numéro
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [paymentPhone,   setPaymentPhone]   = useState('');
  const [isSending,      setIsSending]      = useState(false);

  // Modal 2 : attente USSD + polling
  const [showWaitingModal, setShowWaitingModal] = useState(false);
  const [pollingSeconds,   setPollingSeconds]   = useState(0);
  const [paymentStatus,    setPaymentStatus]    = useState<'waiting' | 'success' | 'failed'>('waiting');

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalAmount = consultationPrice + confirmationFee;

  const paymentMethods = [
    {
      id:          'tmoney',
      name:        'Mix By Yas (TOGOCOM)',
      icon:        'phone-portrait' as const,
      color:       '#FF6B00',
      hint:        'Numéros Togocom : 90, 91, 92, 70, 71…',
      placeholder: '90 00 00 00',
    },
    {
      id:          'flooz',
      name:        'Flooz (MOOV)',
      icon:        'phone-portrait' as const,
      color:       '#0066CC',
      hint:        'Numéros Moov : 93, 96, 97, 98…',
      placeholder: '96 00 00 00',
    },
  ];

  const selectedMethodData = paymentMethods.find(m => m.id === selectedMethod);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timerRef.current)   clearInterval(timerRef.current);
    };
  }, []);

  const isPhoneValid = () => {
    const cleaned = paymentPhone.replace(/[^0-9]/g, '');
    return cleaned.length === 8 || (cleaned.length === 11 && cleaned.startsWith('228'));
  };

  const handleOpenPhoneModal = () => {
    if (!selectedMethod) {
      Alert.alert('Mode de paiement', 'Veuillez sélectionner un mode de paiement.');
      return;
    }
    setPaymentPhone('');
    setShowPhoneModal(true);
  };

  const handleSubmitPhone = async () => {
    if (!isPhoneValid()) {
      Alert.alert('Numéro invalide', `Entrez un numéro valide à 8 chiffres.\n${selectedMethodData?.hint}`);
      return;
    }

    setIsSending(true);
    try {
      const mappedType    = rendezVousService.mapConsultationType(consultationType ?? '');
      const mappedPayment = rendezVousService.mapPaymentMethod(selectedMethod ?? '');
      const dateTime      = `${date}T${time || '10:00'}:00`;

      const result = await rendezVousService.createRendezVous({
        docteurId:        doctor.id,
        date:             dateTime,
        typeConsultation: mappedType,
        modePaiement:     mappedPayment,
        description:      description,
        paymentPhone:     paymentPhone.replace(/[^0-9]/g, ''),
      });

      if (!result.transactionId) {
        throw new Error(result.message ?? 'Erreur lors de la création du paiement');
      }

      // Fermer modal 1 → ouvrir modal 2
      setShowPhoneModal(false);
      setPaymentStatus('waiting');
      setPollingSeconds(0);
      setShowWaitingModal(true);

      // Chronomètre
      timerRef.current = setInterval(() => {
        setPollingSeconds(s => s + 1);
      }, 1000);

      // Polling toutes les 3s pendant 2min max
      const txId = result.transactionId;
      let count  = 0;
      const MAX  = 40;

      pollingRef.current = setInterval(async () => {
        count++;
        if (count >= MAX) {
          clearInterval(pollingRef.current!);
          clearInterval(timerRef.current!);
          setPaymentStatus('failed');
          return;
        }
        try {
          const res = await rendezVousService.checkPaymentStatus(txId);
          if (res?.status === 'paid') {
            clearInterval(pollingRef.current!);
            clearInterval(timerRef.current!);
            setPaymentStatus('success');
          } else if (res?.status === 'failed') {
            clearInterval(pollingRef.current!);
            clearInterval(timerRef.current!);
            setPaymentStatus('failed');
          }
        } catch { /* réseau passager */ }
      }, 3000);

    } catch (err: any) {
      Alert.alert('Erreur', err?.message ?? 'Erreur réseau');
    } finally {
      setIsSending(false);
    }
  };

  const handleCancelWaiting = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (timerRef.current)   clearInterval(timerRef.current);
    setShowWaitingModal(false);
    setPaymentStatus('waiting');
  };

  const handleGoToAppointments = () => {
    setShowWaitingModal(false);
    onNavigate('appointments');
  };

  const handleRetry = () => {
    setShowWaitingModal(false);
    setPaymentStatus('waiting');
    setPaymentPhone('');
    setShowPhoneModal(true);
  };

  const getDisplayDate = () => dateFormatted ?? date ?? '—';
  const getTypeLabel   = () => {
    switch (consultationType) {
      case 'en_ligne': return 'Consultation en ligne';
      case 'domicile': return 'Consultation à domicile';
      default:         return "Consultation à l'hôpital";
    }
  };

  const doctorDisplayName = doctor?.nomComplet ?? doctor?.name ?? 'Médecin';
  const doctorSpecialty   = doctor?.specialite ?? doctor?.specialty ?? 'Spécialiste';
  const doctorRating      = doctor?.note ?? doctor?.rating ?? null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Paiement" onBack={() => onNavigate('doctorDetail')} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          {/* ── Carte docteur ── */}
          <View style={[styles.doctorCard, { backgroundColor: colors.card }]}>
            <View style={styles.avatarBox}>
              <FontAwesome5 name="user-md" size={36} color="#0077b6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.doctorName, { color: colors.text }]}>{doctorDisplayName}</Text>
              <Text style={[styles.doctorSpec, { color: colors.subText }]}>{doctorSpecialty}</Text>
              {doctorRating !== null && (
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={13} color="#FFA500" />
                  <Text style={[styles.ratingText, { color: colors.subText }]}>
                    {typeof doctorRating === 'number' ? doctorRating.toFixed(1) : doctorRating}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* ── Récapitulatif ── */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Récapitulatif</Text>
            <View style={styles.row}>
              <Text style={[styles.rowLabel, { color: colors.subText }]}>Date</Text>
              <Text style={[styles.rowValue, { color: colors.text }]}>
                {getDisplayDate()}{time ? ` · ${time}` : ''}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.rowLabel, { color: colors.subText }]}>Type</Text>
              <Text style={[styles.rowValue, { color: colors.text }]}>{getTypeLabel()}</Text>
            </View>
            {!!description && (
              <View style={styles.row}>
                <Text style={[styles.rowLabel, { color: colors.subText }]}>Motif</Text>
                <Text style={[styles.rowValue, { color: colors.text, flex: 1, textAlign: 'right' }]}
                  numberOfLines={2}>{description}</Text>
              </View>
            )}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.row}>
              <Text style={[styles.rowLabel, { color: colors.subText }]}>Consultation</Text>
              <Text style={[styles.rowValue, { color: colors.text }]}>
                {consultationPrice.toLocaleString()} FCFA
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.rowLabel, { color: colors.subText }]}>Frais de confirmation</Text>
              <Text style={[styles.rowValue, { color: colors.text }]}>
                {confirmationFee.toLocaleString()} FCFA
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.row}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
              <Text style={[styles.totalValue, { color: '#0077b6' }]}>
                {totalAmount.toLocaleString()} FCFA
              </Text>
            </View>
          </View>

          {/* ── Modes de paiement ── */}
          <View style={{ marginBottom: 20 }}>
            <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 10 }]}>
              Mode de paiement
            </Text>
            {paymentMethods.map(method => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.methodCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  selectedMethod === method.id && styles.methodCardActive,
                ]}
                onPress={() => setSelectedMethod(method.id)}
              >
                <View style={styles.methodLeft}>
                  <View style={[styles.methodIcon, { backgroundColor: method.color + '18' }]}>
                    <Ionicons name={method.icon} size={26} color={method.color} />
                  </View>
                  <View>
                    <Text style={[styles.methodName, { color: colors.text }]}>{method.name}</Text>
                    <Text style={[styles.methodHint, { color: colors.subText }]}>{method.hint}</Text>
                  </View>
                </View>
                <Ionicons
                  name={selectedMethod === method.id ? 'radio-button-on' : 'radio-button-off'}
                  size={22}
                  color={selectedMethod === method.id ? '#0077b6' : '#ccc'}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Note ── */}
          <View style={styles.noteCard}>
            <Ionicons name="information-circle-outline" size={18} color="#FFA500" />
            <Text style={styles.noteText}>
              <Text style={{ fontWeight: '700' }}>NB : </Text>
              Les {confirmationFee} FCFA de frais de confirmation ne sont pas remboursables.
              Seul le montant de la consultation est remboursé en cas de refus.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ── Footer ── */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View>
          <Text style={[styles.footerLabel, { color: colors.subText }]}>Total à payer</Text>
          <Text style={[styles.footerTotal, { color: colors.text }]}>
            {totalAmount.toLocaleString()} FCFA
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.payBtn, !selectedMethod && styles.payBtnDisabled]}
          onPress={handleOpenPhoneModal}
          disabled={!selectedMethod}
        >
          <Text style={styles.payBtnText}>Confirmer et payer</Text>
        </TouchableOpacity>
      </View>

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 1 — Saisie du numéro (bottom sheet)
      ══════════════════════════════════════════════════════════════════════ */}
      <Modal
        visible={showPhoneModal}
        transparent
        animationType="slide"
        onRequestClose={() => !isSending && setShowPhoneModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />

            <View style={[styles.networkBadge, { backgroundColor: (selectedMethodData?.color ?? '#0077b6') + '15' }]}>
              <Ionicons name="phone-portrait" size={30} color={selectedMethodData?.color ?? '#0077b6'} />
            </View>

            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Paiement via {selectedMethodData?.name}
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.subText }]}>
              Entrez votre numéro {selectedMethodData?.name}. Un prompt USSD apparaîtra sur votre téléphone pour saisir votre code secret.
            </Text>

            {/* Champ numéro */}
            <View style={[
              styles.phoneInputWrapper,
              {
                borderColor: paymentPhone.length > 0
                  ? (isPhoneValid() ? '#2ecc71' : '#e63946')
                  : colors.border,
                backgroundColor: (colors as any).inputBackground ?? colors.background,
              },
            ]}>
              <Text style={[styles.prefix, { color: colors.subText }]}>+228</Text>
              <View style={[styles.prefixSep, { backgroundColor: colors.border }]} />
              <TextInput
                style={[styles.phoneInput, { color: colors.text }]}
                value={paymentPhone}
                onChangeText={setPaymentPhone}
                placeholder={selectedMethodData?.placeholder ?? '90 00 00 00'}
                placeholderTextColor={colors.subText}
                keyboardType="phone-pad"
                maxLength={11}
                autoFocus
              />
              {paymentPhone.length > 0 && (
                <Ionicons
                  name={isPhoneValid() ? 'checkmark-circle' : 'close-circle'}
                  size={20}
                  color={isPhoneValid() ? '#2ecc71' : '#e63946'}
                />
              )}
            </View>

            {/* Montant */}
            <View style={[styles.amountBadge, { backgroundColor: '#E3F2FD' }]}>
              <Text style={styles.amountText}>
                Montant :{' '}
                <Text style={{ fontWeight: '700', color: '#0077b6' }}>
                  {totalAmount.toLocaleString()} FCFA
                </Text>
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.sendBtn, (!isPhoneValid() || isSending) && styles.sendBtnDisabled]}
              onPress={handleSubmitPhone}
              disabled={!isPhoneValid() || isSending}
            >
              {isSending
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.sendBtnText}>Envoyer la demande</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowPhoneModal(false)}
              disabled={isSending}
            >
              <Text style={[styles.cancelBtnText, { color: colors.subText }]}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 2 — Attente USSD / Succès / Échec (centre)
      ══════════════════════════════════════════════════════════════════════ */}
      <Modal
        visible={showWaitingModal}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={[styles.modalOverlay, { justifyContent: 'center' }]}>
          <View style={[styles.waitingSheet, { backgroundColor: colors.card }]}>

            {paymentStatus === 'waiting' && (
              <>
                <ActivityIndicator size="large" color="#0077b6" style={{ marginBottom: 14 }} />
                <Text style={[styles.waitingTitle, { color: colors.text }]}>
                  Validez sur votre téléphone
                </Text>

                {/* Instructions USSD */}
                <View style={[styles.ussdBox, { backgroundColor: '#F0F8FF', borderColor: '#BDE0FF' }]}>
                  <Ionicons name="phone-portrait-outline" size={22} color="#0077b6" style={{ marginBottom: 6, alignSelf: 'center' }} />
                  <Text style={styles.ussdStep}>① Un menu USSD s'affiche sur votre téléphone</Text>
                  <Text style={styles.ussdStep}>② Entrez votre code secret {selectedMethodData?.name}</Text>
                  <Text style={styles.ussdStep}>③ Confirmez le paiement de <Text style={{ fontWeight: '700' }}>{totalAmount.toLocaleString()} FCFA</Text></Text>
                </View>

                <Text style={[styles.waitingPhone, { color: colors.subText }]}>
                  Numéro :{' '}
                  <Text style={{ fontWeight: '700', color: colors.text }}>+228 {paymentPhone}</Text>
                </Text>
                <Text style={[styles.waitingTimer, { color: colors.subText }]}>
                  Vérification en cours… {pollingSeconds}s
                </Text>

                <TouchableOpacity style={styles.cancelWaitBtn} onPress={handleCancelWaiting}>
                  <Text style={styles.cancelWaitText}>Annuler</Text>
                </TouchableOpacity>
              </>
            )}

            {paymentStatus === 'success' && (
              <>
                <Ionicons name="checkmark-circle" size={72} color="#2ecc71" style={{ marginBottom: 12 }} />
                <Text style={[styles.waitingTitle, { color: colors.text }]}>Paiement réussi !</Text>
                <Text style={[styles.waitingSubtitle, { color: colors.subText }]}>
                  Votre rendez-vous est enregistré. Le docteur le confirmera bientôt.
                </Text>
                <TouchableOpacity
                  style={[styles.sendBtn, { marginTop: 20, backgroundColor: '#2ecc71' }]}
                  onPress={handleGoToAppointments}
                >
                  <Text style={styles.sendBtnText}>Voir mes rendez-vous</Text>
                </TouchableOpacity>
              </>
            )}

            {paymentStatus === 'failed' && (
              <>
                <Ionicons name="close-circle" size={72} color="#e63946" style={{ marginBottom: 12 }} />
                <Text style={[styles.waitingTitle, { color: colors.text }]}>Paiement non confirmé</Text>
                <Text style={[styles.waitingSubtitle, { color: colors.subText }]}>
                  Le paiement n'a pas été validé dans les délais. Vérifiez votre solde ou réessayez.
                </Text>
                <TouchableOpacity
                  style={[styles.sendBtn, { marginTop: 20, backgroundColor: '#e63946' }]}
                  onPress={handleRetry}
                >
                  <Text style={styles.sendBtnText}>Réessayer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelWaiting}>
                  <Text style={[styles.cancelBtnText, { color: colors.subText }]}>Annuler</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content:   { padding: 16, paddingBottom: 24 },

  doctorCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, borderRadius: 12, marginBottom: 16,
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, gap: 12,
  },
  avatarBox: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center',
  },
  doctorName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  doctorSpec: { fontSize: 13, marginBottom: 4 },
  ratingRow:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 13 },

  card: {
    borderRadius: 12, padding: 14, marginBottom: 16,
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4,
  },
  cardTitle:  { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  row:        { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, gap: 12 },
  rowLabel:   { fontSize: 13 },
  rowValue:   { fontSize: 13, fontWeight: '500' },
  totalLabel: { fontSize: 15, fontWeight: '700' },
  totalValue: { fontSize: 15, fontWeight: '700' },
  divider:    { height: 1, marginVertical: 10 },

  methodCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1.5,
  },
  methodCardActive: { borderColor: '#0077b6', backgroundColor: '#E0F7FF' },
  methodLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  methodIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  methodName: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  methodHint: { fontSize: 11 },

  noteCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#FFF9E6', borderRadius: 10, padding: 12, gap: 8,
    borderWidth: 1, borderColor: '#FFE4A0',
  },
  noteText: { flex: 1, fontSize: 12, lineHeight: 18, color: '#856404' },

  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, borderTopWidth: 1,
  },
  footerLabel: { fontSize: 12, marginBottom: 2 },
  footerTotal: { fontSize: 18, fontWeight: '700' },
  payBtn:        { backgroundColor: '#0077b6', paddingVertical: 13, paddingHorizontal: 22, borderRadius: 10, minWidth: 160, alignItems: 'center' },
  payBtnDisabled:{ backgroundColor: '#ccc' },
  payBtnText:    { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Modaux
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet:   { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, alignItems: 'center' },
  handle:       { width: 40, height: 4, borderRadius: 2, marginBottom: 20 },
  networkBadge: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  modalTitle:   { fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  modalSubtitle:{ fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 20, paddingHorizontal: 8 },

  phoneInputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    width: '100%', marginBottom: 14, gap: 10,
  },
  prefix:    { fontSize: 16, fontWeight: '600' },
  prefixSep: { width: 1, height: 20 },
  phoneInput:{ flex: 1, fontSize: 20, letterSpacing: 3 },

  amountBadge: { borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, marginBottom: 20, width: '100%', alignItems: 'center' },
  amountText:  { fontSize: 14, color: '#333' },

  sendBtn:        { backgroundColor: '#0077b6', borderRadius: 12, paddingVertical: 14, width: '100%', alignItems: 'center', marginBottom: 10 },
  sendBtnDisabled:{ backgroundColor: '#ccc' },
  sendBtnText:    { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelBtn:      { paddingVertical: 10, width: '100%', alignItems: 'center' },
  cancelBtnText:  { fontSize: 14, fontWeight: '500' },

  // Modal 2
  waitingSheet:   { marginHorizontal: 24, borderRadius: 20, padding: 24, alignItems: 'center', elevation: 10 },
  waitingTitle:   { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 10 },
  waitingSubtitle:{ fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 8 },
  ussdBox:        { width: '100%', borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 14, gap: 8 },
  ussdStep:       { fontSize: 13, lineHeight: 20, color: '#0055a5' },
  waitingPhone:   { fontSize: 13, marginBottom: 4 },
  waitingTimer:   { fontSize: 12, marginBottom: 16 },
  cancelWaitBtn:  { paddingVertical: 8, paddingHorizontal: 20 },
  cancelWaitText: { color: '#e63946', fontSize: 14, fontWeight: '600' },
});

export default PaymentMethodScreen;