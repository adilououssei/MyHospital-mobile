// app/screens/AppointmentsScreen.tsx
// ✅ Corrections :
//   1. mapStatus : 'accepted' → 'confirmed' (était ignoré, tombait sur 'pending')
//   2. handleRescheduleAppointment : navigue vers DoctorDetailScreen en mode reschedule
//      au lieu de créer un nouveau rendez-vous

import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Alert, Linking, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useApp } from '../context/AppContext';
import ScreenHeader from '../tabs/ScreenHeader';
import BottomNavigation from '../tabs/BottomNavigation';
import rendezVousService from '../services/rendezvous.service';

type ConsultationType = 'online' | 'home' | 'hospital';

interface Appointment {
    id: string;
    doctorId: number;           // ✅ Ajouté : nécessaire pour le reschedule
    doctorName: string;
    specialty: string;
    date: string;
    time: string;
    rawDate: string;            // ✅ Ajouté : date ISO brute pour le reschedule
    status: 'pending' | 'confirmed' | 'past' | 'rejected';
    consultationType: ConsultationType;
    doctorImage: string | null;
    doctorPhone: string;
    hospitalAddress?: string;
    hospitalCoordinates?: { latitude: number; longitude: number };
}

interface AppointmentsScreenProps {
    onNavigate: (screen: string, params?: any) => void;
    unreadCount?: number;
}

const AppointmentsScreen = ({ onNavigate, unreadCount = 0 }: AppointmentsScreenProps) => {
    const { colors } = useApp();
    const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'past' | 'rejected'>('pending');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => { loadAppointments(); }, []);

    const loadAppointments = async () => {
        try {
            setLoading(true);
            const rdvs = await rendezVousService.getMesRendezVous();

            const mappedAppointments: Appointment[] = rdvs.map(rdv => ({
                id:               rdv.id.toString(),
                doctorId:         rdv.docteurId,                         // ✅
                doctorName:       `Dr. ${rdv.docteurPrenom} ${rdv.docteurNom}`,
                specialty:        rdv.docteurSpecialite || 'Spécialiste',
                date:             formatDate(rdv.dateRendezVous),
                time:             formatTime(rdv.dateRendezVous),
                rawDate:          rdv.dateRendezVous,                    // ✅
                status:           mapStatus(rdv.statut),
                consultationType: mapConsultationType(rdv.typeConsultation),
                doctorImage:      rdv.docteurPhoto ?? null,
                doctorPhone:      rdv.docteurTelephone ?? '+228 00 00 00 00',
            }));

            setAppointments(mappedAppointments);
        } catch (error: any) {
            console.error('❌ Erreur chargement rendez-vous:', error);
            Alert.alert('Erreur', 'Impossible de charger vos rendez-vous. Veuillez réessayer.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => { setRefreshing(true); loadAppointments(); };

    // ─────────────────────────────────────────────────────────────────────────
    // ✅ BUG FIX 1 : mapStatus
    //    Avant : 'accepted' n'était PAS dans le map → retombait sur 'pending'
    //    Après : mapping complet de tous les statuts backend
    // ─────────────────────────────────────────────────────────────────────────
    const mapStatus = (backendStatus: string): 'pending' | 'confirmed' | 'past' | 'rejected' => {
        const statusMap: Record<string, 'pending' | 'confirmed' | 'past' | 'rejected'> = {
            'pending':         'pending',    // ✅ en attente de validation docteur
            'pending_payment': 'pending',    // en attente de paiement
            'accepted':        'confirmed',  // ✅ CORRECTIF : accepté par le docteur → confirmé
            'confirmed':       'confirmed',
            'completed':       'past',
            'cancelled':       'rejected',
            'refused':         'rejected',   // ✅ refusé par le docteur
        };
        return statusMap[backendStatus] ?? 'pending';
    };

    const mapConsultationType = (backendType: string): ConsultationType => {
        const typeMap: Record<string, ConsultationType> = {
            'en_ligne': 'online',
            'domicile': 'home',
            'hopital':  'hospital',
        };
        return typeMap[backendType] ?? 'hospital';
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    const formatTime = (dateString: string): string => {
        const date = new Date(dateString);
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    const filteredAppointments = appointments.filter(apt => apt.status === activeTab);

    const toggleExpand = (id: string) => { setExpandedId(expandedId === id ? null : id); };

    const handleCall      = (phone: string) => Linking.openURL(`tel:${phone}`);
    const handleWhatsApp  = (phone: string) => Linking.openURL(`https://wa.me/${phone.replace(/\+/g, '').replace(/\s/g, '')}`);

    const handleGetDirections = (coordinates: { latitude: number; longitude: number }, address: string) => {
        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${coordinates.latitude},${coordinates.longitude}`);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return '#0077b6';
            case 'pending':   return '#FFA500';
            case 'rejected':  return '#FF6B6B';
            default:          return '#666';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'confirmed': return 'Confirmé';
            case 'pending':   return 'En attente';
            case 'rejected':  return 'Refusé';
            case 'past':      return 'Passé';
            default:          return status;
        }
    };

    const getConsultationTypeText = (type: ConsultationType) => {
        switch (type) {
            case 'online':   return 'En ligne';
            case 'home':     return 'À domicile';
            case 'hospital': return "À l'hôpital";
        }
    };

    const getConsultationTypeIcon = (type: ConsultationType) => {
        switch (type) {
            case 'online':   return 'videocam-outline';
            case 'home':     return 'home-outline';
            case 'hospital': return 'business-outline';
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // ✅ BUG FIX 2 : handleRescheduleAppointment
    //    Avant : naviguait vers 'bookingType' → créait un NOUVEAU rendez-vous
    //    Après : navigue vers DoctorDetailScreen en mode reschedule (rdvId passé)
    //            Le DoctorDetailScreen détecte rescheduleId et appelle PATCH au lieu de POST
    // ─────────────────────────────────────────────────────────────────────────
    const handleRescheduleAppointment = (appointment: Appointment) => {
        onNavigate('doctorDetail', {
            // Données du docteur pour recharger les disponibilités
            doctor: {
                id:        appointment.doctorId,
                name:      appointment.doctorName,
                specialty: appointment.specialty,
                photo:     appointment.doctorImage,
                telephone: appointment.doctorPhone,
            },
            consultationType: mapConsultationTypeBack(appointment.consultationType),
            // ✅ Clé qui active le mode "reprogrammer" dans DoctorDetailScreen
            rescheduleId:     parseInt(appointment.id),
        });
    };

    // Inverse de mapConsultationType : frontend → backend
    const mapConsultationTypeBack = (type: ConsultationType): string => {
        switch (type) {
            case 'online':   return 'en_ligne';
            case 'home':     return 'domicile';
            case 'hospital': return 'hopital';
        }
    };

    const handleCancelAppointment = async (id: string) => {
        Alert.alert(
            'Annuler le rendez-vous',
            'Êtes-vous sûr de vouloir annuler ce rendez-vous ?',
            [
                { text: 'Non', style: 'cancel' },
                {
                    text: 'Oui',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await rendezVousService.cancelRendezVous(parseInt(id));
                            Alert.alert('Succès', 'Rendez-vous annulé avec succès');
                            loadAppointments();
                        } catch (error: any) {
                            Alert.alert('Erreur', error.message || 'Impossible d\'annuler le rendez-vous');
                        }
                    },
                }
            ]
        );
    };

    const handleDeleteAppointment = (id: string) => {
        Alert.alert(
            'Supprimer le rendez-vous',
            'Êtes-vous sûr de vouloir supprimer ce rendez-vous ?',
            [
                { text: 'Non', style: 'cancel' },
                {
                    text: 'Oui',
                    style: 'destructive',
                    onPress: () => setAppointments(prev => prev.filter(apt => apt.id !== id)),
                }
            ]
        );
    };

    const handleJoinVideoCall = (id: string) => {
        Alert.alert(
            'Rejoindre la consultation',
            'Vous allez être redirigé vers la vidéoconférence',
            [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Rejoindre', onPress: () => console.log('Rejoindre vidéo:', id) }
            ]
        );
    };

    const renderAppointmentActions = (appointment: Appointment) => {
        if (appointment.status === 'pending') {
            return (
                <View style={styles.appointmentActions}>
                    <TouchableOpacity
                        style={[styles.cancelButton, { backgroundColor: colors.inputBackground }]}
                        onPress={() => handleCancelAppointment(appointment.id)}
                    >
                        <Text style={[styles.cancelButtonText, { color: colors.subText }]}>Annuler</Text>
                    </TouchableOpacity>
                    {/* ✅ CORRECTIF : passe l'objet appointment complet */}
                    <TouchableOpacity
                        style={styles.rescheduleButton}
                        onPress={() => handleRescheduleAppointment(appointment)}
                    >
                        <Ionicons name="calendar-outline" size={16} color="#fff" />
                        <Text style={styles.rescheduleButtonText}>Reprogrammer</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (appointment.status === 'confirmed' && appointment.consultationType === 'online') {
            return (
                <View style={styles.appointmentActions}>
                    <TouchableOpacity
                        style={styles.joinVideoButton}
                        onPress={() => handleJoinVideoCall(appointment.id)}
                    >
                        <Ionicons name="videocam" size={20} color="#fff" />
                        <Text style={styles.joinVideoButtonText}>Rejoindre la consultation</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (appointment.status === 'confirmed') {
            return (
                <View style={styles.appointmentActions}>
                    <View style={[styles.confirmedMessage, { backgroundColor: colors.inputBackground }]}>
                        <Ionicons name="checkmark-circle" size={20} color="#0077b6" />
                        <Text style={[styles.confirmedMessageText, { color: colors.text }]}>
                            Rendez-vous confirmé
                        </Text>
                    </View>
                </View>
            );
        }

        if (appointment.status === 'past' || appointment.status === 'rejected') {
            return (
                <View style={styles.appointmentActions}>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteAppointment(appointment.id)}
                    >
                        <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                        <Text style={styles.deleteButtonText}>Supprimer</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return null;
    };

    if (loading && appointments.length === 0) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <ScreenHeader title="Rendez-vous" showNotification unreadCount={unreadCount}
                    onNotificationPress={() => onNavigate('notifications')} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0077b6" />
                    <Text style={[styles.loadingText, { color: colors.subText }]}>
                        Chargement de vos rendez-vous...
                    </Text>
                </View>
                <BottomNavigation currentScreen="appointments" onNavigate={onNavigate} unreadCount={unreadCount} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScreenHeader title="Rendez-vous" showNotification unreadCount={unreadCount}
                onNotificationPress={() => onNavigate('notifications')} />

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                {(['pending', 'confirmed', 'past', 'rejected'] as const).map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[
                            styles.tab,
                            { backgroundColor: colors.inputBackground },
                            activeTab === tab && styles.activeTab,
                        ]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[
                            styles.tabText,
                            { color: colors.subText },
                            activeTab === tab && styles.activeTabText,
                        ]}>
                            {getStatusText(tab)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0077b6']} tintColor="#0077b6" />
                }
            >
                <View style={styles.appointmentsList}>
                    {filteredAppointments.length > 0 ? (
                        filteredAppointments.map(appointment => (
                            <View key={appointment.id} style={[styles.appointmentCard, { backgroundColor: colors.card }]}>
                                <View style={styles.appointmentHeader}>
                                    <View style={styles.doctorInfo}>
                                        <View style={styles.doctorImagePlaceholder}>
                                            <FontAwesome5 name="user-md" size={30} color="#0077b6" />
                                        </View>
                                        <View style={styles.doctorDetails}>
                                            <Text style={[styles.doctorName, { color: colors.text }]}>
                                                {appointment.doctorName}
                                            </Text>
                                            <Text style={[styles.doctorSpecialty, { color: colors.subText }]}>
                                                {appointment.specialty}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={[styles.consultationTypeBadge, { backgroundColor: colors.inputBackground }]}>
                                    <Ionicons name={getConsultationTypeIcon(appointment.consultationType)} size={16} color="#0077b6" />
                                    <Text style={[styles.consultationTypeText, { color: colors.text }]}>
                                        {getConsultationTypeText(appointment.consultationType)}
                                    </Text>
                                </View>

                                <View style={[styles.appointmentInfo, { backgroundColor: colors.inputBackground }]}>
                                    <View style={styles.infoRow}>
                                        <Ionicons name="calendar-outline" size={18} color={colors.subText} />
                                        <Text style={[styles.infoText, { color: colors.subText }]}>{appointment.date}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Ionicons name="time-outline" size={18} color={colors.subText} />
                                        <Text style={[styles.infoText, { color: colors.subText }]}>{appointment.time}</Text>
                                    </View>
                                    <View style={styles.statusBadge}>
                                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(appointment.status) }]} />
                                        <Text style={[styles.statusText, { color: getStatusColor(appointment.status) }]}>
                                            {getStatusText(appointment.status)}
                                        </Text>
                                    </View>
                                </View>

                                <TouchableOpacity style={styles.expandButton} onPress={() => toggleExpand(appointment.id)}>
                                    <Text style={[styles.expandButtonText, { color: '#0077b6' }]}>
                                        {expandedId === appointment.id ? 'Masquer les détails' : 'Plus de détails'}
                                    </Text>
                                    <Ionicons name={expandedId === appointment.id ? 'chevron-up' : 'chevron-down'} size={18} color="#0077b6" />
                                </TouchableOpacity>

                                {expandedId === appointment.id && (
                                    <View style={[styles.expandedSection, { borderTopColor: '#E0E0E0' }]}>
                                        <View style={styles.contactRow}>
                                            <TouchableOpacity style={styles.contactButton} onPress={() => handleCall(appointment.doctorPhone)}>
                                                <Ionicons name="call-outline" size={20} color="#0077b6" />
                                                <Text style={styles.contactButtonText}>Appeler</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.contactButton} onPress={() => handleWhatsApp(appointment.doctorPhone)}>
                                                <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                                                <Text style={styles.contactButtonText}>WhatsApp</Text>
                                            </TouchableOpacity>
                                        </View>

                                        {appointment.consultationType === 'hospital' && appointment.hospitalAddress && (
                                            <View style={styles.addressSection}>
                                                <View style={styles.addressRow}>
                                                    <Ionicons name="location" size={16} color={colors.subText} />
                                                    <Text style={[styles.addressText, { color: colors.subText }]}>
                                                        {appointment.hospitalAddress}
                                                    </Text>
                                                </View>
                                                <TouchableOpacity
                                                    style={styles.directionsButton}
                                                    onPress={() => handleGetDirections(appointment.hospitalCoordinates!, appointment.hospitalAddress!)}
                                                >
                                                    <Ionicons name="navigate" size={18} color="#fff" />
                                                    <Text style={styles.directionsButtonText}>Itinéraire</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                )}

                                {renderAppointmentActions(appointment)}
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="calendar-outline" size={60} color="#ccc" />
                            <Text style={[styles.emptyStateText, { color: colors.subText }]}>
                                Aucun rendez-vous {getStatusText(activeTab).toLowerCase()}
                            </Text>
                        </View>
                    )}
                </View>
                <View style={{ height: 100 }} />
            </ScrollView>

            <TouchableOpacity style={styles.fab} onPress={() => onNavigate('bookingType')}>
                <Ionicons name="add" size={32} color="#fff" />
            </TouchableOpacity>

            <BottomNavigation currentScreen="appointments" onNavigate={onNavigate} unreadCount={unreadCount} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
    loadingText: { marginTop: 15, fontSize: 14 },
    tabsContainer: { flexDirection: 'row', paddingHorizontal: 10, marginVertical: 15, gap: 2 },
    tab: { flex: 1, paddingVertical: 10, paddingHorizontal: 6, borderRadius: 20, alignItems: 'center', justifyContent: 'center', height: 40 },
    activeTab: { backgroundColor: '#0077b6' },
    tabText: { fontSize: 12, fontWeight: '500' },
    activeTabText: { color: '#fff', fontWeight: '600' },
    appointmentsList: { paddingHorizontal: 20 },
    appointmentCard: { borderRadius: 15, padding: 15, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    appointmentHeader: { marginBottom: 12 },
    doctorInfo: { flexDirection: 'row', alignItems: 'center' },
    doctorImagePlaceholder: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    doctorDetails: { flex: 1 },
    doctorName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    doctorSpecialty: { fontSize: 14 },
    consultationTypeBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginBottom: 12, alignSelf: 'flex-start' },
    consultationTypeText: { fontSize: 13, fontWeight: '600' },
    appointmentInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingVertical: 10, borderRadius: 10, paddingHorizontal: 12 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    infoText: { fontSize: 13 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    statusText: { fontSize: 13, fontWeight: '600' },
    expandButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8 },
    expandButtonText: { fontSize: 13, fontWeight: '600' },
    expandedSection: { borderTopWidth: 1, paddingTop: 12, marginTop: 8, marginBottom: 12 },
    contactRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    contactButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, backgroundColor: '#F5F5F5', borderRadius: 10 },
    contactButtonText: { fontSize: 13, fontWeight: '600', color: '#333' },
    addressSection: { gap: 10 },
    addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
    addressText: { flex: 1, fontSize: 12, lineHeight: 18 },
    directionsButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, backgroundColor: '#0077b6', borderRadius: 10 },
    directionsButtonText: { fontSize: 13, fontWeight: '600', color: '#fff' },
    appointmentActions: { flexDirection: 'row', gap: 10 },
    cancelButton: { flex: 1, paddingVertical: 12, borderRadius: 25, alignItems: 'center' },
    cancelButtonText: { fontSize: 14, fontWeight: '600' },
    rescheduleButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 25, backgroundColor: '#0077b6' },
    rescheduleButtonText: { fontSize: 14, color: '#fff', fontWeight: '600' },
    joinVideoButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 25, backgroundColor: '#0077b6' },
    joinVideoButtonText: { fontSize: 14, color: '#fff', fontWeight: '600' },
    confirmedMessage: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 25 },
    confirmedMessageText: { fontSize: 14, fontWeight: '600' },
    deleteButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 25, backgroundColor: '#FFE5E5' },
    deleteButtonText: { fontSize: 14, color: '#FF6B6B', fontWeight: '600' },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    emptyStateText: { fontSize: 16, marginTop: 15 },
    fab: { position: 'absolute', bottom: 120, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#0077b6', justifyContent: 'center', alignItems: 'center', shadowColor: '#0077b6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 },
});

export default AppointmentsScreen;