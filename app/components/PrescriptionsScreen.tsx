import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Modal,
    Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

interface Medication {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
}

interface Prescription {
    id: string;
    doctorName: string;
    doctorSpecialty: string;
    appointmentId: string;
    date: string;
    diagnosis: string;
    medications: Medication[];
    notes: string;
    pdfUrl: string;
    isDownloaded: boolean;
}

interface PrescriptionsScreenProps {
    onNavigate: (screen: string) => void;
}

const PrescriptionsScreen = ({ onNavigate }: PrescriptionsScreenProps) => {
    const { colors } = useApp();
    const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const prescriptions: Prescription[] = [
        {
            id: 'PRESC001',
            doctorName: 'Dr. Marcus Horizon',
            doctorSpecialty: 'Cardiologue',
            appointmentId: 'APT001',
            date: '26 Juin 2024',
            diagnosis: 'Hypertension artérielle légère',
            medications: [
                {
                    name: 'Amlodipine',
                    dosage: '5mg',
                    frequency: '1 fois par jour',
                    duration: '30 jours',
                    instructions: 'À prendre le matin avant le petit-déjeuner',
                },
                {
                    name: 'Aspirine',
                    dosage: '100mg',
                    frequency: '1 fois par jour',
                    duration: '30 jours',
                    instructions: 'À prendre le soir après le dîner',
                },
            ],
            notes: 'Surveiller la tension artérielle quotidiennement. Réduire le sel dans l\'alimentation.',
            pdfUrl: 'https://example.com/prescription001.pdf',
            isDownloaded: true,
        },
        {
            id: 'PRESC002',
            doctorName: 'Dr. Alysa Hana',
            doctorSpecialty: 'Pédiatre',
            appointmentId: 'APT002',
            date: '20 Juin 2024',
            diagnosis: 'Infection respiratoire',
            medications: [
                {
                    name: 'Amoxicilline',
                    dosage: '500mg',
                    frequency: '3 fois par jour',
                    duration: '7 jours',
                    instructions: 'À prendre après les repas',
                },
                {
                    name: 'Paracétamol',
                    dosage: '500mg',
                    frequency: 'Si fièvre',
                    duration: '7 jours',
                    instructions: 'Maximum 3 fois par jour',
                },
            ],
            notes: 'Repos recommandé. Hydratation suffisante. Consulter si la fièvre persiste après 3 jours.',
            pdfUrl: 'https://example.com/prescription002.pdf',
            isDownloaded: false,
        },
    ];

    const handleDownloadPDF = async (prescription: Prescription) => {
        // Simuler le téléchargement
        Alert.alert(
            'Téléchargement',
            'L\'ordonnance est en cours de téléchargement...',
            [
                {
                    text: 'OK',
                    onPress: () => {
                        // Logique de téléchargement réel ici
                        console.log('Downloading PDF:', prescription.pdfUrl);
                    }
                }
            ]
        );
    };

    const handleSharePrescription = async (prescription: Prescription) => {
        try {
            await Share.share({
                message: `Ordonnance de ${prescription.doctorName}\nDate: ${prescription.date}\nDiagnostic: ${prescription.diagnosis}`,
                url: prescription.pdfUrl,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handlePrintPrescription = (prescription: Prescription) => {
        Alert.alert(
            'Imprimer',
            'Voulez-vous imprimer cette ordonnance ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Imprimer',
                    onPress: () => {
                        // Logique d'impression ici
                        console.log('Printing prescription:', prescription.id);
                    }
                }
            ]
        );
    };

    const handleViewPrescription = (prescription: Prescription) => {
        setSelectedPrescription(prescription);
        setShowDetailModal(true);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.card }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => onNavigate('profile')}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    Mes Ordonnances
                </Text>
                <View style={styles.placeholder} />
            </View>

            {/* Info Banner */}
            <View style={styles.infoBanner}>
                <Ionicons name="information-circle" size={24} color="#0077b6" />
                <View style={styles.infoBannerTextContainer}>
                    <Text style={[styles.infoBannerText, { color: colors.subText }]}>
                        Téléchargez vos ordonnances pour les présenter en pharmacie
                    </Text>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.prescriptionsList}>
                    {prescriptions.length > 0 ? (
                        prescriptions.map((prescription) => (
                            <View
                                key={prescription.id}
                                style={[styles.prescriptionCard, { backgroundColor: colors.card }]}
                            >
                                {/* Header */}
                                <View style={styles.cardHeader}>
                                    <View style={styles.cardHeaderLeft}>
                                        <View style={styles.doctorIcon}>
                                            <Ionicons name="medical" size={24} color="#0077b6" />
                                        </View>
                                        <View style={styles.doctorInfo}>
                                            <Text style={[styles.doctorName, { color: colors.text }]}>
                                                {prescription.doctorName}
                                            </Text>
                                            <Text style={[styles.specialty, { color: colors.subText }]}>
                                                {prescription.doctorSpecialty}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.dateContainer}>
                                        <Ionicons name="calendar-outline" size={14} color={colors.subText} />
                                        <Text style={[styles.dateText, { color: colors.subText }]}>
                                            {prescription.date}
                                        </Text>
                                    </View>
                                </View>

                                {/* Diagnosis */}
                                <View style={[styles.diagnosisContainer, { backgroundColor: colors.inputBackground }]}>
                                    <Text style={[styles.diagnosisLabel, { color: colors.subText }]}>
                                        Diagnostic
                                    </Text>
                                    <Text style={[styles.diagnosisText, { color: colors.text }]}>
                                        {prescription.diagnosis}
                                    </Text>
                                </View>

                                {/* Medications Count */}
                                <View style={styles.medicationsCount}>
                                    <Ionicons name="medkit-outline" size={18} color="#0077b6" />
                                    <Text style={[styles.medicationsCountText, { color: colors.text }]}>
                                        {prescription.medications.length} médicament(s) prescrit(s)
                                    </Text>
                                </View>

                                {/* Actions */}
                                <View style={styles.actionsContainer}>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => handleViewPrescription(prescription)}
                                    >
                                        <Ionicons name="eye-outline" size={20} color="#0077b6" />
                                        <Text style={styles.actionButtonText}>Voir</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => handleDownloadPDF(prescription)}
                                    >
                                        <Ionicons 
                                            name={prescription.isDownloaded ? "checkmark-circle" : "download-outline"} 
                                            size={20} 
                                            color={prescription.isDownloaded ? "#00C48C" : "#0077b6"} 
                                        />
                                        <Text style={styles.actionButtonText}>
                                            {prescription.isDownloaded ? 'Téléchargé' : 'Télécharger'}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => handleSharePrescription(prescription)}
                                    >
                                        <Ionicons name="share-outline" size={20} color="#0077b6" />
                                        <Text style={styles.actionButtonText}>Partager</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => handlePrintPrescription(prescription)}
                                    >
                                        <Ionicons name="print-outline" size={20} color="#0077b6" />
                                        <Text style={styles.actionButtonText}>Imprimer</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="document-text-outline" size={60} color="#ccc" />
                            <Text style={[styles.emptyStateText, { color: colors.subText }]}>
                                Aucune ordonnance disponible
                            </Text>
                            <Text style={[styles.emptyStateSubText, { color: colors.subText }]}>
                                Les ordonnances de vos consultations apparaîtront ici
                            </Text>
                        </View>
                    )}
                </View>
                <View style={{ height: 30 }} />
            </ScrollView>

            {/* Detail Modal */}
            <Modal
                visible={showDetailModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowDetailModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>
                                Détails de l'ordonnance
                            </Text>
                            <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                                <Ionicons name="close" size={28} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        {selectedPrescription && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {/* Doctor Info */}
                                <View style={styles.modalSection}>
                                    <Text style={[styles.modalSectionTitle, { color: colors.text }]}>
                                        Médecin prescripteur
                                    </Text>
                                    <Text style={[styles.modalText, { color: colors.text }]}>
                                        {selectedPrescription.doctorName}
                                    </Text>
                                    <Text style={[styles.modalSubText, { color: colors.subText }]}>
                                        {selectedPrescription.doctorSpecialty}
                                    </Text>
                                </View>

                                {/* Diagnosis */}
                                <View style={styles.modalSection}>
                                    <Text style={[styles.modalSectionTitle, { color: colors.text }]}>
                                        Diagnostic
                                    </Text>
                                    <Text style={[styles.modalText, { color: colors.text }]}>
                                        {selectedPrescription.diagnosis}
                                    </Text>
                                </View>

                                {/* Medications */}
                                <View style={styles.modalSection}>
                                    <Text style={[styles.modalSectionTitle, { color: colors.text }]}>
                                        Médicaments prescrits
                                    </Text>
                                    {selectedPrescription.medications.map((med, index) => (
                                        <View key={index} style={[styles.medicationItem, { backgroundColor: colors.inputBackground }]}>
                                            <View style={styles.medicationHeader}>
                                                <Text style={[styles.medicationName, { color: colors.text }]}>
                                                    {med.name}
                                                </Text>
                                                <Text style={[styles.medicationDosage, { color: '#0077b6' }]}>
                                                    {med.dosage}
                                                </Text>
                                            </View>
                                            <View style={styles.medicationDetail}>
                                                <Ionicons name="time-outline" size={14} color={colors.subText} />
                                                <Text style={[styles.medicationDetailText, { color: colors.subText }]}>
                                                    {med.frequency}
                                                </Text>
                                            </View>
                                            <View style={styles.medicationDetail}>
                                                <Ionicons name="calendar-outline" size={14} color={colors.subText} />
                                                <Text style={[styles.medicationDetailText, { color: colors.subText }]}>
                                                    Durée: {med.duration}
                                                </Text>
                                            </View>
                                            <View style={styles.medicationDetail}>
                                                <Ionicons name="information-circle-outline" size={14} color={colors.subText} />
                                                <Text style={[styles.medicationDetailText, { color: colors.subText }]}>
                                                    {med.instructions}
                                                </Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>

                                {/* Notes */}
                                {selectedPrescription.notes && (
                                    <View style={styles.modalSection}>
                                        <Text style={[styles.modalSectionTitle, { color: colors.text }]}>
                                            Recommandations
                                        </Text>
                                        <Text style={[styles.modalText, { color: colors.subText }]}>
                                            {selectedPrescription.notes}
                                        </Text>
                                    </View>
                                )}

                                {/* Download Button */}
                                <TouchableOpacity
                                    style={styles.downloadButton}
                                    onPress={() => {
                                        handleDownloadPDF(selectedPrescription);
                                        setShowDetailModal(false);
                                    }}
                                >
                                    <Ionicons name="download-outline" size={20} color="#fff" />
                                    <Text style={styles.downloadButtonText}>
                                        Télécharger le PDF
                                    </Text>
                                </TouchableOpacity>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
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
    infoBanner: {
        flexDirection: 'row',
        backgroundColor: '#E3F2FD',
        marginHorizontal: 20,
        marginVertical: 15,
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
        gap: 12,
    },
    infoBannerTextContainer: {
        flex: 1,
    },
    infoBannerText: {
        fontSize: 13,
        lineHeight: 18,
    },
    prescriptionsList: {
        paddingHorizontal: 20,
    },
    prescriptionCard: {
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        flex: 1,
    },
    doctorIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    doctorInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    doctorName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    specialty: {
        fontSize: 13,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dateText: {
        fontSize: 12,
    },
    diagnosisContainer: {
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
    },
    diagnosisLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    diagnosisText: {
        fontSize: 14,
        fontWeight: '500',
    },
    medicationsCount: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 15,
    },
    medicationsCountText: {
        fontSize: 14,
        fontWeight: '500',
    },
    actionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    actionButtonText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#333',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyStateText: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 15,
    },
    emptyStateSubText: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        padding: 20,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalSection: {
        marginBottom: 20,
    },
    modalSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },
    modalText: {
        fontSize: 14,
        lineHeight: 22,
    },
    modalSubText: {
        fontSize: 13,
        marginTop: 4,
    },
    medicationItem: {
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
    },
    medicationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    medicationName: {
        fontSize: 15,
        fontWeight: '600',
    },
    medicationDosage: {
        fontSize: 14,
        fontWeight: '600',
    },
    medicationDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    medicationDetailText: {
        fontSize: 13,
        flex: 1,
    },
    downloadButton: {
        backgroundColor: '#0077b6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 30,
        gap: 10,
        marginTop: 10,
    },
    downloadButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
export default PrescriptionsScreen;