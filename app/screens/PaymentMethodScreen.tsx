import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useApp } from '../context/AppContext';

interface PaymentMethodScreenProps {
  onNavigate: (screen: string) => void;
  doctor?: any;
  consultationType?: string;
  description?: string;
  date?: string;
  time?: string;
  consultationPrice?: number;
  confirmationFee?: number;
}

const PaymentMethodScreen = ({
  onNavigate,
  doctor,
  date,
  time,
  consultationPrice = 15000,
  confirmationFee = 2000,
}: PaymentMethodScreenProps) => {
  const { colors } = useApp();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const paymentMethods = [
    {
      id: 'tmoney',
      name: 'T-Money (TOGOCOM)',
      icon: 'phone-portrait',
      color: '#FF6B00',
    },
    {
      id: 'flooz',
      name: 'Flooz (MOOV)',
      icon: 'phone-portrait',
      color: '#0066CC',
    },
  ];

  const totalAmount = consultationPrice + confirmationFee;

  const handleConfirm = () => {
    if (!selectedMethod) {
      alert('Veuillez sélectionner un mode de paiement');
      return;
    }

    setShowSuccessModal(true);
  };

  const handleSuccess = () => {
    setShowSuccessModal(false);
    onNavigate('appointments');
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
          onPress={() => onNavigate('doctorDetail')}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Paiement</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Doctor Info */}
          <View style={[styles.doctorCard, { backgroundColor: colors.card }]}>
            <View style={styles.doctorImagePlaceholder}>
              <FontAwesome5 name="user-md" size={40} color="#0077b6" />
            </View>
            <View style={styles.doctorInfo}>
              <Text style={[styles.doctorName, { color: colors.text }]}>
                {doctor?.name || 'Dr. Marcus Horizon'}
              </Text>
              <Text style={[styles.doctorSpecialty, { color: colors.subText }]}>
                {doctor?.specialty || 'Cardiologue'}
              </Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#FFA500" />
                <Text style={[styles.rating, { color: colors.subText }]}>{doctor?.rating || 4.7}</Text>
                <Ionicons name="location-outline" size={14} color={colors.subText} style={{ marginLeft: 10 }} />
                <Text style={[styles.distance, { color: colors.subText }]}>{doctor?.distance || '800m'}</Text>
              </View>
            </View>
          </View>

          {/* Appointment Details */}
          <View style={[styles.detailsCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.detailsTitle, { color: colors.text }]}>Détails du rendez-vous</Text>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.subText }]}>Date</Text>
              <View style={styles.detailValue}>
                <Text style={[styles.detailText, { color: colors.text }]}>
                  Mercredi, 23 Juin 2021 | {time || '14:00'}
                </Text>
                <TouchableOpacity>
                  <Text style={styles.changeText}>Modifier</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <Text style={[styles.detailsTitle, { color: colors.text }]}>Détail du paiement</Text>

            <View style={styles.paymentRow}>
              <Text style={[styles.paymentLabel, { color: colors.subText }]}>Consultation</Text>
              <Text style={[styles.paymentValue, { color: colors.text }]}>{consultationPrice} FCFA</Text>
            </View>

            <View style={styles.paymentRow}>
              <Text style={[styles.paymentLabel, { color: colors.subText }]}>Frais de confirmation</Text>
              <Text style={[styles.paymentValue, { color: colors.text }]}>{confirmationFee} FCFA</Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.paymentRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
              <Text style={[styles.totalValue, { color: colors.text }]}>{totalAmount} FCFA</Text>
            </View>
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Mode de paiement</Text>

            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.methodCard,
                  { 
                    backgroundColor: colors.card,
                    borderColor: colors.border
                  },
                  selectedMethod === method.id && styles.methodCardActive,
                ]}
                onPress={() => setSelectedMethod(method.id)}
              >
                <View style={styles.methodLeft}>
                  <View
                    style={[
                      styles.methodIcon,
                      { backgroundColor: method.color + '20' },
                    ]}
                  >
                    <Ionicons
                      name={method.icon as any}
                      size={28}
                      color={method.color}
                    />
                  </View>
                  <Text style={[styles.methodName, { color: colors.text }]}>{method.name}</Text>
                </View>

                {selectedMethod === method.id ? (
                  <Ionicons name="radio-button-on" size={24} color="#0077b6" />
                ) : (
                  <Ionicons name="radio-button-off" size={24} color="#ccc" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Section */}
      <View style={[styles.footer, { 
        backgroundColor: colors.card,
        borderTopColor: colors.border
      }]}>
        <View style={styles.totalContainer}>
          <Text style={[styles.footerLabel, { color: colors.subText }]}>Total</Text>
          <Text style={[styles.footerTotal, { color: colors.text }]}>{totalAmount} FCFA</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            !selectedMethod && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirm}
          disabled={!selectedMethod}
        >
          <Text style={styles.confirmButtonText}>Confirmer</Text>
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="checkmark" size={50} color="#0077b6" />
            </View>

            <Text style={[styles.modalTitle, { color: colors.text }]}>Paiement réussi</Text>
            <Text style={[styles.modalDescription, { color: colors.subText }]}>
              Votre paiement a été effectué avec succès,
            </Text>
            <Text style={[styles.modalDescription, { color: colors.subText }]}>
              vous pouvez avoir une session de consultation
            </Text>
            <Text style={[styles.modalDescription, { color: colors.subText }]}>
              avec votre médecin de confiance
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleSuccess}
            >
              <Text style={styles.modalButtonText}>Voir mes rendez-vous</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 30,
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
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  doctorImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: 14,
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    marginLeft: 4,
  },
  distance: {
    fontSize: 14,
    marginLeft: 4,
  },
  detailsCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    marginRight: 10,
  },
  changeText: {
    fontSize: 14,
    color: '#0077b6',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  paymentLabel: {
    fontSize: 14,
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  methodCardActive: {
    borderColor: '#0077b6',
    backgroundColor: '#E0F7FF',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  methodName: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderTopWidth: 1,
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  footerTotal: {
    fontSize: 18,
    fontWeight: '700',
  },
  confirmButton: {
    backgroundColor: '#0077b6',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
  },
  modalButton: {
    marginTop: 15,
    backgroundColor: '#0077b6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentMethodScreen;