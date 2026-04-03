import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Modal,
    Share,
    RefreshControl,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../services/api.config';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

interface Medication {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
}

interface Prescription {
    id: number;
    doctorName: string;
    doctorSpecialty: string;
    appointmentId: number;
    date: string;
    diagnosis: string;
    medications: Medication[];
    notes: string;
    pdfUrl: string | null;
    isDownloaded: boolean;
    texteComplet: string;
    createdAt: string;
}

interface PrescriptionsScreenProps {
    onNavigate: (screen: string) => void;
}

const PrescriptionsScreen = ({ onNavigate }: PrescriptionsScreenProps) => {
    const { colors } = useApp();
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [downloadingId, setDownloadingId] = useState<number | null>(null);

    // Récupérer les ordonnances depuis l'API
    const fetchPrescriptions = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                console.log('No token found');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/patient/prescriptions`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                const text = await response.text();
                console.error('Response error:', text);
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log('Prescriptions fetched:', data);
            
            if (data.success && data.prescriptions) {
                const formattedPrescriptions = data.prescriptions.map((presc: any) => ({
                    id: presc.id,
                    doctorName: presc.doctorName || `Dr. ${presc.docteur?.prenom || ''} ${presc.docteur?.nom || ''}`,
                    doctorSpecialty: presc.doctorSpecialty || presc.docteur?.specialite || 'Médecin',
                    appointmentId: presc.rendezVous?.id,
                    date: new Date(presc.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    }),
                    diagnosis: presc.diagnostic,
                    medications: parseMedications(presc.medicaments),
                    notes: presc.conseils || '',
                    pdfUrl: null,
                    isDownloaded: false,
                    texteComplet: presc.texteComplet,
                    createdAt: presc.createdAt,
                }));
                
                setPrescriptions(formattedPrescriptions);
            } else {
                setPrescriptions([]);
            }
        } catch (error) {
            console.error('Network error:', error);
            Alert.alert('Erreur', 'Impossible de charger vos ordonnances. Vérifiez votre connexion.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Parser le texte des médicaments en objet structuré
    const parseMedications = (medicamentsText: string): Medication[] => {
        if (!medicamentsText) return [];
        
        const lines = medicamentsText.split('\n');
        const medications: Medication[] = [];
        
        for (const line of lines) {
            if (line.trim()) {
                medications.push({
                    name: line.trim(),
                    dosage: '',
                    frequency: '',
                    duration: '',
                    instructions: '',
                });
            }
        }
        
        if (medications.length === 1 && medicamentsText.includes('—')) {
            const parts = medicamentsText.split('—');
            if (parts.length >= 2) {
                medications[0] = {
                    name: parts[0].trim(),
                    dosage: parts[1].trim(),
                    frequency: parts[2]?.trim() || '',
                    duration: parts[3]?.trim() || '',
                    instructions: '',
                };
            }
        }
        
        return medications;
    };

    // ✅ Télécharger le PDF de l'ordonnance
    const handleDownloadPDF = async (prescription: Prescription) => {
        try {
            setDownloadingId(prescription.id);
            
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                Alert.alert('Erreur', 'Vous devez être connecté');
                return;
            }
            
            // Appeler l'API pour générer le PDF
            const response = await fetch(`${API_BASE_URL}/prescription/pdf/${prescription.id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/pdf',
                },
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const blob = await response.blob();
            const reader = new FileReader();
            
            reader.onloadend = async () => {
                const base64data = reader.result as string;
                const fileName = `ordonnance_${prescription.id}_${Date.now()}.pdf`;
                const fileUri = `${FileSystem.documentDirectory}${fileName}`;
                
                // Sauvegarder le fichier
                await FileSystem.writeAsStringAsync(fileUri, base64data.split(',')[1], {
                    encoding: FileSystem.EncodingType.Base64,
                });
                
                // Vérifier si le partage est disponible
                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(fileUri, {
                        mimeType: 'application/pdf',
                        dialogTitle: `Ordonnance - ${prescription.doctorName}`,
                        UTI: 'com.adobe.pdf',
                    });
                } else {
                    Alert.alert('Info', 'Le fichier a été téléchargé');
                }
            };
            
            reader.readAsDataURL(blob);
            
        } catch (error) {
            console.error('Error downloading PDF:', error);
            Alert.alert('Erreur', 'Impossible de télécharger le PDF. Réessayez plus tard.');
        } finally {
            setDownloadingId(null);
        }
    };

    // ✅ Partager l'ordonnance
    const handleSharePrescription = async (prescription: Prescription) => {
        try {
            const shareContent = `
📋 ORDONNANCE MÉDICALE
━━━━━━━━━━━━━━━━━━━━━━━━━
Dr. ${prescription.doctorName}
Date: ${prescription.date}
━━━━━━━━━━━━━━━━━━━━━━━━━

📌 DIAGNOSTIC
${prescription.diagnosis}

💊 TRAITEMENTS
${prescription.medications.map(m => `• ${m.name}`).join('\n')}

${prescription.notes ? `📌 RECOMMANDATIONS\n${prescription.notes}\n` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━
Ordonnance médicale - Mon Hôpital Mobile
            `.trim();
            
            await Share.share({
                message: shareContent,
                title: `Ordonnance - ${prescription.doctorName}`,
            });
        } catch (error) {
            console.error('Error sharing:', error);
            Alert.alert('Erreur', 'Impossible de partager l\'ordonnance');
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
                        Alert.alert('Information', 'Téléchargez d\'abord le PDF pour l\'imprimer');
                    }
                }
            ]
        );
    };

    const handleViewPrescription = (prescription: Prescription) => {
        setSelectedPrescription(prescription);
        setShowDetailModal(true);
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchPrescriptions();
    };

    useEffect(() => {
        fetchPrescriptions();
    }, [fetchPrescriptions]);

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={[styles.header, { backgroundColor: colors.card }]}>
                    <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('profile')}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Mes Ordonnances</Text>
                    <View style={styles.placeholder} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0077b6" />
                    <Text style={[styles.loadingText, { color: colors.subText }]}>
                        Chargement de vos ordonnances...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.card }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('profile')}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    Mes Ordonnances
                </Text>
                <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
                    <Ionicons name="refresh-outline" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.infoBanner}>
                <Ionicons name="information-circle" size={24} color="#0077b6" />
                <View style={styles.infoBannerTextContainer}>
                    <Text style={[styles.infoBannerText, { color: colors.subText }]}>
                        {prescriptions.length > 0 
                            ? `Vous avez ${prescriptions.length} ordonnance(s) disponible(s)`
                            : 'Aucune ordonnance pour le moment'}
                    </Text>
                </View>
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0077b6']} />
                }
            >
                <View style={styles.prescriptionsList}>
                    {prescriptions.length > 0 ? (
                        prescriptions.map((prescription) => (
                            <View
                                key={prescription.id}
                                style={[styles.prescriptionCard, { backgroundColor: colors.card }]}
                            >
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

                                <View style={[styles.diagnosisContainer, { backgroundColor: colors.inputBackground }]}>
                                    <Text style={[styles.diagnosisLabel, { color: colors.subText }]}>
                                        Diagnostic
                                    </Text>
                                    <Text style={[styles.diagnosisText, { color: colors.text }]}>
                                        {prescription.diagnosis}
                                    </Text>
                                </View>

                                <View style={styles.medicationsCount}>
                                    <Ionicons name="medkit-outline" size={18} color="#0077b6" />
                                    <Text style={[styles.medicationsCountText, { color: colors.text }]}>
                                        {prescription.medications.length} médicament(s) prescrit(s)
                                    </Text>
                                </View>

                                {/* ✅ Actions avec bouton PDF */}
                                <View style={styles.actionsContainer}>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => handleViewPrescription(prescription)}
                                    >
                                        <Ionicons name="eye-outline" size={20} color="#0077b6" />
                                        <Text style={styles.actionButtonText}>Voir</Text>
                                    </TouchableOpacity>

                                    {/* ✅ NOUVEAU BOUTON PDF */}
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.pdfButton]}
                                        onPress={() => handleDownloadPDF(prescription)}
                                        disabled={downloadingId === prescription.id}
                                    >
                                        {downloadingId === prescription.id ? (
                                            <ActivityIndicator size="small" color="#dc3545" />
                                        ) : (
                                            <Ionicons name="document-text-outline" size={20} color="#dc3545" />
                                        )}
                                        <Text style={[styles.actionButtonText, styles.pdfButtonText]}>
                                            {downloadingId === prescription.id ? 'Téléchargement...' : 'PDF'}
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
                            <TouchableOpacity 
                                style={styles.refreshEmptyButton}
                                onPress={onRefresh}
                            >
                                <Ionicons name="refresh-outline" size={20} color="#0077b6" />
                                <Text style={styles.refreshEmptyText}>Rafraîchir</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
                <View style={{ height: 30 }} />
            </ScrollView>

            {/* Detail Modal avec bouton PDF */}
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
                                <View style={styles.modalSection}>
                                    <Text style={[styles.modalSectionTitle, { color: colors.text }]}>
                                        Ordonnance médicale
                                    </Text>
                                    <View style={[styles.texteCompletBox, { backgroundColor: colors.inputBackground }]}>
                                        <Text style={[styles.texteCompletText, { color: colors.text }]}>
                                            {selectedPrescription.texteComplet}
                                        </Text>
                                    </View>
                                </View>

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

                                <View style={styles.modalSection}>
                                    <Text style={[styles.modalSectionTitle, { color: colors.text }]}>
                                        Diagnostic
                                    </Text>
                                    <Text style={[styles.modalText, { color: colors.text }]}>
                                        {selectedPrescription.diagnosis}
                                    </Text>
                                </View>

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
                                                {med.dosage ? (
                                                    <Text style={[styles.medicationDosage, { color: '#0077b6' }]}>
                                                        {med.dosage}
                                                    </Text>
                                                ) : null}
                                            </View>
                                        </View>
                                    ))}
                                </View>

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

                                {/* ✅ Boutons d'action dans le modal */}
                                <View style={styles.modalActions}>
                                    <TouchableOpacity
                                        style={[styles.modalActionButton, styles.pdfModalButton]}
                                        onPress={() => {
                                            handleDownloadPDF(selectedPrescription);
                                        }}
                                    >
                                        <Ionicons name="document-text-outline" size={20} color="#fff" />
                                        <Text style={styles.modalActionButtonText}>Télécharger PDF</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.modalActionButton, styles.shareModalButton]}
                                        onPress={() => {
                                            handleSharePrescription(selectedPrescription);
                                        }}
                                    >
                                        <Ionicons name="share-social-outline" size={20} color="#fff" />
                                        <Text style={styles.modalActionButtonText}>Partager</Text>
                                    </TouchableOpacity>
                                </View>
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
    refreshButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    placeholder: {
        width: 34,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 14,
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
    pdfButton: {
        backgroundColor: '#FFF5F5',
        borderWidth: 1,
        borderColor: '#dc3545',
    },
    pdfButtonText: {
        color: '#dc3545',
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
    refreshEmptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#E3F2FD',
        borderRadius: 25,
    },
    refreshEmptyText: {
        color: '#0077b6',
        fontSize: 14,
        fontWeight: '600',
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
    texteCompletBox: {
        padding: 15,
        borderRadius: 10,
        fontFamily: 'monospace',
    },
    texteCompletText: {
        fontSize: 13,
        lineHeight: 20,
        fontFamily: 'monospace',
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
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
        marginBottom: 20,
    },
    modalActionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 30,
        gap: 8,
    },
    pdfModalButton: {
        backgroundColor: '#dc3545',
    },
    shareModalButton: {
        backgroundColor: '#0077b6',
    },
    modalActionButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default PrescriptionsScreen;