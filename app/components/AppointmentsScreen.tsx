// app/components/AppointmentsScreen.tsx
// ✅ Mise à jour : bouton "Rejoindre" Jitsi réel + vérification statut paiement

import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Alert, Linking, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useApp, useAuth } from '../context/AppContext';
import ScreenHeader from '../tabs/ScreenHeader';
import BottomNavigation from '../tabs/BottomNavigation';
import rendezVousService from '../services/rendezvous.service';

type ConsultationType = 'online' | 'home' | 'hospital';

interface Appointment {
    id: string;
    doctorId: number;
    doctorName: string;
    specialty: string;
    date: string;
    time: string;
    rawDate: string;
    status: 'pending' | 'confirmed' | 'past' | 'rejected' | 'pending_payment';
    consultationType: ConsultationType;
    doctorImage: string | null;
    doctorPhone: string;
    hospitalAddress?: string;
    hospitalCoordinates?: { latitude: number; longitude: number };
    // ✅ Jitsi
    jitsiUrl: string | null;
    jitsiRoom: string | null;
    // ✅ Paiement
    transactionId?: string | null;
    montantPaiement?: number;
}

interface AppointmentsScreenProps {
    onNavigate: (screen: string, params?: any) => void;
    unreadCount?: number;
}

const AppointmentsScreen = ({ onNavigate, unreadCount = 0 }: AppointmentsScreenProps) => {
    const { colors, t } = useApp();
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'past' | 'rejected' | 'pending_payment'>('pending');
    const [expandedId, setExpandedId]   = useState<string | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading]     = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [checkingPayment, setCheckingPayment] = useState<string | null>(null);

    useEffect(() => { loadAppointments(); }, []);

    const loadAppointments = async () => {
        try {
            setLoading(true);
            const rdvs = await rendezVousService.getMesRendezVous();
            const mapped: Appointment[] = rdvs.map(rdv => ({
                id:               rdv.id.toString(),
                doctorId:         rdv.docteurId,
                doctorName:       `Dr. ${rdv.docteurPrenom} ${rdv.docteurNom}`,
                specialty:        rdv.docteurSpecialite || 'Spécialiste',
                date:             formatDate(rdv.dateRendezVous),
                time:             formatTime(rdv.dateRendezVous),
                rawDate:          rdv.dateRendezVous,
                status:           mapStatus(rdv.statut),
                consultationType: mapConsultationType(rdv.typeConsultation),
                doctorImage:      rdv.docteurPhoto ?? null,
                doctorPhone:      rdv.docteurTelephone ?? '+228 00 00 00 00',
                jitsiUrl:         rdv.jitsiUrl  ?? null,
                jitsiRoom:        rdv.jitsiRoom ?? null,
                transactionId:    rdv.paiement?.transactionId ?? null,
                montantPaiement:  rdv.paiement?.montant,
            }));
            setAppointments(mapped);
        } catch {
            Alert.alert(t('error'), t('aptErrLoad'));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => { setRefreshing(true); loadAppointments(); };

    // ── Mappers ────────────────────────────────────────────────────────────────
    const mapStatus = (s: string): Appointment['status'] => {
        const m: Record<string, Appointment['status']> = {
            'pending':         'pending',
            'pending_payment': 'pending_payment',
            'accepted':        'confirmed',
            'confirmed':       'confirmed',
            'completed':       'past',
            'cancelled':       'rejected',
            'refused':         'rejected',
        };
        return m[s] ?? 'pending';
    };

    const mapConsultationType = (t: string): ConsultationType => {
        const m: Record<string, ConsultationType> = {
            'en_ligne': 'online', 'domicile': 'home', 'hopital': 'hospital',
        };
        return m[t] ?? 'hospital';
    };

    const formatDate = (d: string) => {
        const dt = new Date(d);
        return `${dt.getDate().toString().padStart(2, '0')}/${(dt.getMonth() + 1).toString().padStart(2, '0')}/${dt.getFullYear()}`;
    };

    const formatTime = (d: string) => {
        const dt = new Date(d);
        return `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}`;
    };

    // ── Vérifier le statut d'un paiement en attente ────────────────────────────
    const handleCheckPaymentStatus = useCallback(async (appointment: Appointment) => {
        if (!appointment.transactionId) {
            Alert.alert('', 'Aucune transaction à vérifier.');
            return;
        }

        setCheckingPayment(appointment.id);
        try {
            const status = await rendezVousService.checkPaiementStatus(appointment.transactionId);

            if (status.status === 'success') {
                Alert.alert(
                    '✅ Paiement confirmé',
                    'Votre paiement a été reçu. Le docteur va valider votre rendez-vous.',
                    [{ text: 'OK', onPress: loadAppointments }]
                );
            } else if (status.status === 'failed') {
                Alert.alert(
                    '❌ Paiement échoué',
                    'Le paiement n\'a pas abouti. Voulez-vous réessayer ?',
                    [
                        { text: 'Annuler', style: 'cancel' },
                        { text: 'Réessayer', onPress: () => onNavigate('appointments') },
                    ]
                );
            } else {
                Alert.alert(
                    '⏳ En attente',
                    'Le paiement est encore en cours de traitement. Réessayez dans quelques instants.',
                    [{ text: 'OK' }]
                );
            }
        } catch (e) {
            Alert.alert(t('error'), 'Impossible de vérifier le statut du paiement.');
        } finally {
            setCheckingPayment(null);
        }
    }, []);

    // ── Rejoindre la consultation vidéo ────────────────────────────────────────
    const handleJoinVideoCall = useCallback((appointment: Appointment) => {
        if (!appointment.jitsiUrl) {
            Alert.alert(
                'Consultation non disponible',
                'La salle de consultation n\'est pas encore disponible. Le lien sera actif une fois votre paiement confirmé.',
                [{ text: 'OK' }]
            );
            return;
        }

        Alert.alert(
            '📹 Rejoindre la consultation',
            `Vous allez rejoindre la consultation avec ${appointment.doctorName}.`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Rejoindre',
                    onPress: () => onNavigate('videoCall', {
                        jitsiUrl:    appointment.jitsiUrl,
                        doctorName:  appointment.doctorName,
                        patientName: user ? `${user.prenom} ${user.nom}` : 'Patient',
                    }),
                },
            ]
        );
    }, [user]);

    // ── Couleurs / textes statut ────────────────────────────────────────────────
    const getStatusColor = (s: string) => {
        switch (s) {
            case 'confirmed':       return '#0077b6';
            case 'pending':         return '#FFA500';
            case 'pending_payment': return '#9B59B6';
            case 'rejected':        return '#FF6B6B';
            default:                return '#666';
        }
    };

    const getStatusText = (s: string) => {
        switch (s) {
            case 'confirmed':       return t('aptConfirmed');
            case 'pending':         return t('aptPending');
            case 'pending_payment': return 'Paiement en attente';
            case 'rejected':        return t('aptRejected');
            case 'past':            return t('aptPast');
            default:                return s;
        }
    };

    const getStatusIcon = (s: string) => {
        switch (s) {
            case 'confirmed':       return 'checkmark-circle';
            case 'pending_payment': return 'card-outline';
            case 'pending':         return 'time-outline';
            case 'rejected':        return 'close-circle-outline';
            default:                return 'ellipse-outline';
        }
    };

    const getConsultationTypeText = (type: ConsultationType) => {
        switch (type) {
            case 'online':   return t('aptOnline');
            case 'home':     return t('aptHome');
            case 'hospital': return t('aptHospital');
        }
    };

    const getConsultationTypeIcon = (type: ConsultationType) => {
        switch (type) {
            case 'online':   return 'videocam-outline';
            case 'home':     return 'home-outline';
            case 'hospital': return 'business-outline';
        }
    };

    // ── Actions selon le statut ─────────────────────────────────────────────────
    const renderAppointmentActions = (appointment: Appointment) => {

        // 💳 En attente de paiement
        if (appointment.status === 'pending_payment') {
            const isChecking = checkingPayment === appointment.id;
            return (
                <View style={styles.appointmentActions}>
                    <TouchableOpacity
                        style={[styles.checkPaymentButton, isChecking && { opacity: 0.6 }]}
                        onPress={() => handleCheckPaymentStatus(appointment)}
                        disabled={isChecking}
                    >
                        {isChecking
                            ? <ActivityIndicator size="small" color="#fff" />
                            : <Ionicons name="refresh-outline" size={18} color="#fff" />
                        }
                        <Text style={styles.checkPaymentText}>
                            {isChecking ? 'Vérification...' : 'Vérifier le paiement'}
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }

        // ⏳ En attente de validation docteur
        if (appointment.status === 'pending') return (
            <View style={styles.appointmentActions}>
                <TouchableOpacity
                    style={[styles.cancelButton, { backgroundColor: colors.inputBackground }]}
                    onPress={() => handleCancelAppointment(appointment.id)}
                >
                    <Text style={[styles.cancelButtonText, { color: colors.subText }]}>{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.rescheduleButton}
                    onPress={() => handleRescheduleAppointment(appointment)}
                >
                    <Ionicons name="calendar-outline" size={16} color="#fff" />
                    <Text style={styles.rescheduleButtonText}>{t('aptReschedule')}</Text>
                </TouchableOpacity>
            </View>
        );

        // ✅ Confirmé + consultation en ligne → bouton Jitsi
        if (appointment.status === 'confirmed' && appointment.consultationType === 'online') return (
            <View style={styles.appointmentActions}>
                <TouchableOpacity
                    style={[
                        styles.joinVideoButton,
                        !appointment.jitsiUrl && styles.joinVideoButtonDisabled
                    ]}
                    onPress={() => handleJoinVideoCall(appointment)}
                >
                    <Ionicons name="videocam" size={20} color="#fff" />
                    <Text style={styles.joinVideoButtonText}>{t('aptJoinVideo')}</Text>
                </TouchableOpacity>
            </View>
        );

        // ✅ Confirmé (autre type)
        if (appointment.status === 'confirmed') return (
            <View style={styles.appointmentActions}>
                <View style={[styles.confirmedMessage, { backgroundColor: colors.inputBackground }]}>
                    <Ionicons name="checkmark-circle" size={20} color="#0077b6" />
                    <Text style={[styles.confirmedMessageText, { color: colors.text }]}>{t('aptConfirmedMsg')}</Text>
                </View>
            </View>
        );

        // 🗑️ Passé ou refusé
        if (appointment.status === 'past' || appointment.status === 'rejected') return (
            <View style={styles.appointmentActions}>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteAppointment(appointment.id)}
                >
                    <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                    <Text style={styles.deleteButtonText}>{t('aptDelete')}</Text>
                </TouchableOpacity>
            </View>
        );

        return null;
    };

    // ── Handlers existants ──────────────────────────────────────────────────────
    const handleCall     = (phone: string) => Linking.openURL(`tel:${phone}`);
    const handleWhatsApp = (phone: string) =>
        Linking.openURL(`https://wa.me/${phone.replace(/\+/g, '').replace(/\s/g, '')}`);
    const handleGetDirections = (coords: { latitude: number; longitude: number }) =>
        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${coords.latitude},${coords.longitude}`);
    const toggleExpand = (id: string) => setExpandedId(expandedId === id ? null : id);

    const handleRescheduleAppointment = (apt: Appointment) => {
        onNavigate('doctorDetail', {
            doctor: { id: apt.doctorId, name: apt.doctorName, specialty: apt.specialty, telephone: apt.doctorPhone },
            consultationType: apt.consultationType === 'online' ? 'en_ligne' : apt.consultationType === 'home' ? 'domicile' : 'hopital',
            rescheduleId: parseInt(apt.id),
        });
    };

    const handleCancelAppointment = async (id: string) => {
        Alert.alert(t('aptCancelTitle'), t('aptCancelMsg'), [
            { text: t('cancel'), style: 'cancel' },
            {
                text: t('confirm'), style: 'destructive',
                onPress: async () => {
                    try {
                        await rendezVousService.cancelRendezVous(parseInt(id));
                        Alert.alert(t('success'), t('aptCancelSuccess'));
                        loadAppointments();
                    } catch (e: any) {
                        Alert.alert(t('error'), e.message || t('aptErrLoad'));
                    }
                },
            }
        ]);
    };

    const handleDeleteAppointment = (id: string) => {
        Alert.alert(t('aptDeleteTitle'), t('aptDeleteMsg'), [
            { text: t('cancel'), style: 'cancel' },
            {
                text: t('confirm'), style: 'destructive',
                onPress: () => setAppointments(prev => prev.filter(a => a.id !== id)),
            }
        ]);
    };

    // ── Tabs disponibles ────────────────────────────────────────────────────────
    const tabs: Array<{ key: Appointment['status']; label: string }> = [
        { key: 'pending',         label: t('aptPending') },
        { key: 'pending_payment', label: '💳 Paiement' },
        { key: 'confirmed',       label: t('aptConfirmed') },
        { key: 'past',            label: t('aptPast') },
        { key: 'rejected',        label: t('aptRejected') },
    ];

    const filteredAppointments = appointments.filter(a => a.status === activeTab);

    // ── Chargement initial ──────────────────────────────────────────────────────
    if (loading && appointments.length === 0) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <ScreenHeader title={t('aptTitle')} showNotification unreadCount={unreadCount}
                    onNotificationPress={() => onNavigate('notifications')} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0077b6" />
                    <Text style={[styles.loadingText, { color: colors.subText }]}>{t('aptLoading')}</Text>
                </View>
                <BottomNavigation currentScreen="appointments" onNavigate={onNavigate} unreadCount={unreadCount} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScreenHeader title={t('aptTitle')} showNotification unreadCount={unreadCount}
                onNotificationPress={() => onNavigate('notifications')} />

            {/* ── Tabs ── */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
                style={styles.tabsScroll} contentContainerStyle={styles.tabsContent}>
                {tabs.map(tab => (
                    <TouchableOpacity key={tab.key}
                        style={[
                            styles.tab,
                            { backgroundColor: colors.inputBackground },
                            activeTab === tab.key && styles.activeTab,
                        ]}
                        onPress={() => setActiveTab(tab.key)}
                    >
                        <Text style={[styles.tabText, { color: colors.subText },
                            activeTab === tab.key && styles.activeTabText]}>
                            {tab.label}
                        </Text>
                        {/* Badge compteur */}
                        {appointments.filter(a => a.status === tab.key).length > 0 && (
                            <View style={[styles.tabBadge,
                                activeTab === tab.key && styles.tabBadgeActive]}>
                                <Text style={styles.tabBadgeText}>
                                    {appointments.filter(a => a.status === tab.key).length}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ScrollView showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0077b6']} tintColor="#0077b6" />}>
                <View style={styles.appointmentsList}>
                    {filteredAppointments.length > 0 ? filteredAppointments.map(appointment => (
                        <View key={appointment.id} style={[styles.appointmentCard, { backgroundColor: colors.card },
                            // Bordure spéciale pour les en attente de paiement
                            appointment.status === 'pending_payment' && styles.pendingPaymentCard
                        ]}>

                            {/* ── En-tête docteur ── */}
                            <View style={styles.appointmentHeader}>
                                <View style={styles.doctorInfo}>
                                    <View style={styles.doctorImagePlaceholder}>
                                        <FontAwesome5 name="user-md" size={30} color="#0077b6" />
                                    </View>
                                    <View style={styles.doctorDetails}>
                                        <Text style={[styles.doctorName, { color: colors.text }]}>{appointment.doctorName}</Text>
                                        <Text style={[styles.doctorSpecialty, { color: colors.subText }]}>{appointment.specialty}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* ── Type consultation ── */}
                            <View style={[styles.consultationTypeBadge, { backgroundColor: colors.inputBackground }]}>
                                <Ionicons name={getConsultationTypeIcon(appointment.consultationType)} size={16} color="#0077b6" />
                                <Text style={[styles.consultationTypeText, { color: colors.text }]}>
                                    {getConsultationTypeText(appointment.consultationType)}
                                </Text>
                            </View>

                            {/* ── Info date / heure / statut ── */}
                            <View style={[styles.appointmentInfo, { backgroundColor: colors.inputBackground }]}>
                                <View style={styles.infoRow}>
                                    <Ionicons name="calendar-outline" size={16} color={colors.subText} />
                                    <Text style={[styles.infoText, { color: colors.subText }]}>{appointment.date}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Ionicons name="time-outline" size={16} color={colors.subText} />
                                    <Text style={[styles.infoText, { color: colors.subText }]}>{appointment.time}</Text>
                                </View>
                                <View style={styles.statusBadge}>
                                    <Ionicons name={getStatusIcon(appointment.status)} size={14}
                                        color={getStatusColor(appointment.status)} />
                                    <Text style={[styles.statusText, { color: getStatusColor(appointment.status) }]}>
                                        {getStatusText(appointment.status)}
                                    </Text>
                                </View>
                            </View>

                            {/* ── Bouton expand ── */}
                            <TouchableOpacity style={styles.expandButton} onPress={() => toggleExpand(appointment.id)}>
                                <Text style={[styles.expandButtonText, { color: '#0077b6' }]}>
                                    {expandedId === appointment.id ? t('aptHideDetails') : t('aptMoreDetails')}
                                </Text>
                                <Ionicons name={expandedId === appointment.id ? 'chevron-up' : 'chevron-down'} size={18} color="#0077b6" />
                            </TouchableOpacity>

                            {/* ── Section dépliée ── */}
                            {expandedId === appointment.id && (
                                <View style={[styles.expandedSection, { borderTopColor: colors.border }]}>
                                    <View style={styles.contactRow}>
                                        <TouchableOpacity style={styles.contactButton} onPress={() => handleCall(appointment.doctorPhone)}>
                                            <Ionicons name="call-outline" size={20} color="#0077b6" />
                                            <Text style={styles.contactButtonText}>{t('aptCall')}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.contactButton} onPress={() => handleWhatsApp(appointment.doctorPhone)}>
                                            <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                                            <Text style={styles.contactButtonText}>{t('aptWhatsApp')}</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Montant paiement si consultation en ligne */}
                                    {appointment.consultationType === 'online' && appointment.montantPaiement && (
                                        <View style={[styles.paymentInfo, { backgroundColor: colors.inputBackground }]}>
                                            <Ionicons name="card-outline" size={16} color={colors.subText} />
                                            <Text style={[styles.paymentInfoText, { color: colors.subText }]}>
                                                Montant : {appointment.montantPaiement.toLocaleString()} FCFA
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* ── Actions ── */}
                            {renderAppointmentActions(appointment)}
                        </View>
                    )) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="calendar-outline" size={60} color="#ccc" />
                            <Text style={[styles.emptyStateText, { color: colors.subText }]}>
                                {t('aptEmpty')}
                            </Text>
                        </View>
                    )}
                </View>
                <View style={{ height: 120 }} />
            </ScrollView>

            {/* ── FAB Nouveau RDV ── */}
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

    // Tabs horizontaux (scrollables)
    tabsScroll: { maxHeight: 55 },
    tabsContent: { paddingHorizontal: 10, paddingVertical: 10, gap: 6 },
    tab: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingVertical: 8, paddingHorizontal: 14,
        borderRadius: 20, minWidth: 80,
    },
    activeTab: { backgroundColor: '#0077b6' },
    tabText: { fontSize: 12, fontWeight: '500' },
    activeTabText: { color: '#fff', fontWeight: '600' },
    tabBadge: {
        backgroundColor: '#ccc', borderRadius: 10,
        minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4,
    },
    tabBadgeActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
    tabBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

    appointmentsList: { paddingHorizontal: 20 },
    appointmentCard: {
        borderRadius: 15, padding: 15, marginBottom: 15,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
    },
    pendingPaymentCard: { borderWidth: 2, borderColor: '#9B59B6' },

    appointmentHeader: { marginBottom: 12 },
    doctorInfo: { flexDirection: 'row', alignItems: 'center' },
    doctorImagePlaceholder: {
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    doctorDetails: { flex: 1 },
    doctorName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    doctorSpecialty: { fontSize: 14 },

    consultationTypeBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
        marginBottom: 12, alignSelf: 'flex-start',
    },
    consultationTypeText: { fontSize: 13, fontWeight: '600' },

    appointmentInfo: {
        flexDirection: 'row', justifyContent: 'space-between',
        marginBottom: 12, paddingVertical: 10, borderRadius: 10, paddingHorizontal: 12,
    },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    infoText: { fontSize: 12 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    statusText: { fontSize: 12, fontWeight: '600' },

    expandButton: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', gap: 6, paddingVertical: 8,
    },
    expandButtonText: { fontSize: 13, fontWeight: '600' },
    expandedSection: { borderTopWidth: 1, paddingTop: 12, marginTop: 4, marginBottom: 12 },
    contactRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
    contactButton: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', gap: 6, paddingVertical: 10,
        backgroundColor: '#F5F5F5', borderRadius: 10,
    },
    contactButtonText: { fontSize: 13, fontWeight: '600', color: '#333' },

    paymentInfo: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
    },
    paymentInfoText: { fontSize: 13 },

    // Actions
    appointmentActions: { flexDirection: 'row', gap: 10 },
    cancelButton: { flex: 1, paddingVertical: 12, borderRadius: 25, alignItems: 'center' },
    cancelButtonText: { fontSize: 14, fontWeight: '600' },
    rescheduleButton: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 25, backgroundColor: '#0077b6',
    },
    rescheduleButtonText: { fontSize: 14, color: '#fff', fontWeight: '600' },
    joinVideoButton: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 25, backgroundColor: '#0077b6',
    },
    joinVideoButtonDisabled: { backgroundColor: '#b0bec5' },
    joinVideoButtonText: { fontSize: 15, color: '#fff', fontWeight: '700' },
    confirmedMessage: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 25,
    },
    confirmedMessageText: { fontSize: 14, fontWeight: '600' },
    deleteButton: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', gap: 8, paddingVertical: 12,
        borderRadius: 25, backgroundColor: '#FFE5E5',
    },
    deleteButtonText: { fontSize: 14, color: '#FF6B6B', fontWeight: '600' },

    // ✅ Bouton vérifier paiement
    checkPaymentButton: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', gap: 8, paddingVertical: 12,
        borderRadius: 25, backgroundColor: '#9B59B6',
    },
    checkPaymentText: { fontSize: 14, color: '#fff', fontWeight: '600' },

    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    emptyStateText: { fontSize: 16, marginTop: 15 },

    fab: {
        position: 'absolute', bottom: 100, right: 20,
        width: 60, height: 60, borderRadius: 30, backgroundColor: '#0077b6',
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#0077b6', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
    },
});

export default AppointmentsScreen;