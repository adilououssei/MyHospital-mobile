// app/components/AppointmentsScreen.tsx
// ✅ Mise à jour : bouton "Rejoindre" Jitsi réel + vérification statut paiement

import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Alert, Linking, ActivityIndicator, RefreshControl, Image, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useApp, useAuth } from '../context/AppContext';
import { useNotifications } from '../context/NotificationContext';
import ScreenHeader from '../tabs/ScreenHeader';
import rendezVousService from '../services/rendezvous.service';
import evaluationService from '../services/evaluation.service';
import EvaluationDocteurModal from './EvaluationDocteurModal';

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
    peutRejoindre: boolean;   // ✅ true tant que la fenêtre d'accès de 24h est ouverte
    // ✅ Paiement
    transactionId?: string | null;
    montantPaiement?: number;
    // 🏠 Géolocalisation patient (domicile)
    latitude?: number | null;
    longitude?: number | null;
    adresseLocalisation?: string | null;
    indicationComplementaire?: string | null;
    // 🏪 Lieu de consultation du docteur
    docteurConsultationLocation?: {
        latitude: number | null;
        longitude: number | null;
        adresse: string | null;
        indication: string | null;
    } | null;
}

interface AppointmentsScreenProps {
    onNavigate: (screen: string, params?: any) => void;
}

// ── Bannière de rappel : compte à rebours vers un rendez-vous imminent ──
// Affichée dans les 24h qui précèdent l'heure prévue, jusqu'à 30 min après.
const CountdownBanner = ({ rawDate, t }: { rawDate?: string; t: (k: string) => string }) => {
    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    if (!rawDate) return null;
    const target = new Date(rawDate).getTime();
    if (isNaN(target)) return null;

    const diff = target - now;
    if (diff > 24 * 3600 * 1000 || diff < -30 * 60 * 1000) return null;

    const started = diff <= 0;
    let timeStr = '';
    if (!started) {
        const totalSec = Math.floor(diff / 1000);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        timeStr = h >= 1
            ? `${h}h ${m.toString().padStart(2, '0')}min`
            : `${m}min ${s.toString().padStart(2, '0')}s`;
    }

    return (
        <View style={[styles.countdownBanner, started && styles.countdownBannerNow]}>
            <Ionicons name={started ? 'videocam' : 'alarm-outline'} size={18} color="#fff" />
            <Text style={styles.countdownLabel}>
                {started ? t('aptStartingNow') : t('aptStartsIn')}
            </Text>
            {!started && <Text style={styles.countdownTime}>{timeStr}</Text>}
        </View>
    );
};

const AppointmentsScreen = ({ onNavigate }: AppointmentsScreenProps) => {
    const { unreadCount } = useNotifications();
    const { colors, t } = useApp();
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'past' | 'rejected' | 'pending_payment'>('pending');
    const [expandedId, setExpandedId]   = useState<string | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading]     = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [checkingPayment, setCheckingPayment] = useState<string | null>(null);
    const [evalModalVisible, setEvalModalVisible] = useState(false);
    const [selectedRdvForEval, setSelectedRdvForEval] = useState<Appointment | null>(null);
    const [pendingEvalIds, setPendingEvalIds] = useState<Set<number>>(new Set());

    useEffect(() => { loadAppointments(); }, []);

    const loadAppointments = async () => {
        try {
            setLoading(true);
            const [rdvs, rdvsAEvaluer] = await Promise.all([
                rendezVousService.getMesRendezVous(),
                evaluationService.getRendezVousEnAttente().catch(() => []),
            ]);
            setPendingEvalIds(new Set(rdvsAEvaluer.map((r: any) => r.id)));
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
                peutRejoindre:    rdv.peutRejoindre ?? false,
                transactionId:    rdv.paiement?.transactionId ?? null,
                montantPaiement:  rdv.paiement?.montant,
                latitude:               rdv.latitude ?? null,
                longitude:              rdv.longitude ?? null,
                adresseLocalisation:    rdv.adresseLocalisation ?? null,
                indicationComplementaire: rdv.indicationComplementaire ?? null,
                docteurConsultationLocation: rdv.docteurConsultationLocation ?? null,
            }));
            setAppointments(mapped);
        } catch (error: any) {
            console.error('❌ loadAppointments error:', error?.response?.data || error.message);
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
            `Vous allez rejoindre ${appointment.doctorName}.`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Ouvrir Jitsi',
                    onPress: async () => {
                        const httpsUrl = appointment.jitsiUrl!;
                        const room = httpsUrl.replace(/https?:\/\/[^\/]+\//, '').split('#')[0];
                        const jitsiAppUrl = `org.jitsi.meet://${room}`;

                        if (Platform.OS === 'android') {
                            // Tentative 1 : Intent Android avec package explicite
                            try {
                                await Linking.openURL(
                                    `intent://meet.jit.si/${room}#Intent;scheme=https;package=org.jitsi.meet;end`
                                );
                                return;
                            } catch {}
                        }

                        // Tentative 2 : Custom scheme (iOS / Android fallback)
                        try {
                            await Linking.openURL(jitsiAppUrl);
                            return;
                        } catch {}

                        // Dernier recours : navigateur
                        Linking.openURL(httpsUrl);
                    },
                },
                {
                    text: 'Version intégrée',
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
            case 'confirmed':       return '#1a56db';
            case 'pending':         return '#FFA500';
            case 'pending_payment': return '#9B59B6';
            case 'rejected':        return '#FF6B6B';
            case 'past':            return '#10b981';
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
            case 'past':            return 'checkmark-done-outline';
            default:                return 'ellipse-outline';
        }
    };

    const getStatusBg = (s: string) => getStatusColor(s) + '20';

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

        // ✅ Confirmé + consultation en ligne + fenêtre d'accès 24h ouverte → bouton Jitsi
        if (appointment.status === 'confirmed' && appointment.consultationType === 'online' && appointment.peutRejoindre) return (
            <View style={styles.appointmentActions}>
                <TouchableOpacity
                    style={styles.joinVideoButton}
                    onPress={() => handleJoinVideoCall(appointment)}
                >
                    <Ionicons name="videocam" size={20} color="#fff" />
                    <Text style={styles.joinVideoButtonText}>{t('aptJoinVideo')}</Text>
                </TouchableOpacity>
            </View>
        );

        // ✅ Confirmé (autre type) → message + annulation
        if (appointment.status === 'confirmed') return (
            <View style={styles.appointmentActions}>
                <View style={[styles.confirmedMessage, { backgroundColor: colors.inputBackground }]}>
                    <Ionicons name="checkmark-circle" size={20} color="#1a56db" />
                    <Text style={[styles.confirmedMessageText, { color: colors.text }]}>{t('aptConfirmedMsg')}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.cancelButton, { backgroundColor: '#FFE5E5', flex: 0.6 }]}
                    onPress={() => handleCancelAppointment(appointment.id)}
                >
                    <Text style={[styles.cancelButtonText, { color: '#FF6B6B' }]}>{t('cancel')}</Text>
                </TouchableOpacity>
            </View>
        );

        // 🗑️ Refusé (supprimer seulement)
        if (appointment.status === 'rejected') return (
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

        // ⭐ Passé → Évaluer (si pas déjà fait) + Supprimer
        if (appointment.status === 'past') {
            const needsEval = pendingEvalIds.has(parseInt(appointment.id));
            return (
                <View style={styles.appointmentActions}>
                    {/* ✅ Consultation en ligne terminée mais encore dans la fenêtre de 24h :
                        le patient peut se reconnecter (ex: coupure réseau). */}
                    {appointment.consultationType === 'online' && appointment.peutRejoindre && (
                        <TouchableOpacity
                            style={styles.joinVideoButton}
                            onPress={() => handleJoinVideoCall(appointment)}
                        >
                            <Ionicons name="videocam" size={20} color="#fff" />
                            <Text style={styles.joinVideoButtonText}>{t('aptJoinVideo')}</Text>
                        </TouchableOpacity>
                    )}
                    {needsEval && (
                        <TouchableOpacity
                            style={styles.evaluateButton}
                            onPress={() => {
                                setSelectedRdvForEval(appointment);
                                setEvalModalVisible(true);
                            }}
                        >
                            <Ionicons name="star-outline" size={18} color="#fff" />
                            <Text style={styles.evaluateButtonText}>Évaluer</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[styles.deleteButton, needsEval ? styles.deleteButtonCompact : null]}
                        onPress={() => handleDeleteAppointment(appointment.id)}
                    >
                        <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                        <Text style={styles.deleteButtonText}>{t('aptDelete')}</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return null;
    };

    // ── Handlers existants ──────────────────────────────────────────────────────
    const handleCall     = (phone: string) => Linking.openURL(`tel:${phone}`);
    const handleWhatsApp = (phone: string) =>
        Linking.openURL(`https://wa.me/${phone.replace(/\+/g, '').replace(/\s/g, '')}`);
    const handleGetDirections = (coords: { latitude: number; longitude: number }) =>
        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${coords.latitude},${coords.longitude}`);
    const handleShareLocation = async (appointment: Appointment) => {
        const lat = appointment.latitude;
        const lng = appointment.longitude;
        if (lat == null || lng == null) return;
        const googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
        const phone = appointment.doctorPhone.replace(/\+/g, '').replace(/\s/g, '');
        const message = `Bonjour Dr. ${appointment.doctorName}, voici ma position pour la consultation à domicile : ${googleMapsLink}`;
        Linking.openURL(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`);
    };
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
        { key: 'pending_payment', label: 'Paiement' },
        { key: 'confirmed',       label: t('aptConfirmed') },
        { key: 'past',            label: t('aptPast') },
        { key: 'rejected',        label: t('aptRejected') },
    ];

    const filteredAppointments = appointments.filter(a => a.status === activeTab);

    // ── Chargement initial ──────────────────────────────────────────────────────
    if (loading && appointments.length === 0) {
        return (
            <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.container}>
                <ScreenHeader title={t('aptTitle')} showNotification 
                    onNotificationPress={() => onNavigate('notifications')} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1a56db" />
                    <Text style={[styles.loadingText, { color: colors.subText }]}>{t('aptLoading')}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.container}>
            <ScreenHeader title={t('aptTitle')} showNotification 
                onNotificationPress={() => onNavigate('notifications')} />

            {/* ── Tabs ── */}
            <View style={styles.tabsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabsContent}>
                    {tabs.map(tab => {
                        const isActive = activeTab === tab.key;
                        const count = appointments.filter(a => a.status === tab.key).length;
                        return (
                            <TouchableOpacity key={tab.key}
                                style={[styles.tab, isActive ? styles.activeTab : styles.inactiveTab]}
                                onPress={() => setActiveTab(tab.key)}
                            >
                                <Text style={isActive ? styles.activeTabText : styles.inactiveTabText}>
                                    {tab.label}
                                </Text>
                                {count > 0 && (
                                    <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                                        <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
                                            {count}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 110 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1a56db']} tintColor="#1a56db" />}>
                <View style={styles.appointmentsList}>
                    {filteredAppointments.length > 0 ? filteredAppointments.map(appointment => (
                        <View key={appointment.id} style={[styles.appointmentCard,
                            // Bordure spéciale pour les en attente de paiement
                            appointment.status === 'pending_payment' && styles.pendingPaymentCard
                        ]}>

                            {/* ── Rappel compte à rebours (rendez-vous confirmé imminent) ── */}
                            {appointment.status === 'confirmed' && (
                                <CountdownBanner rawDate={appointment.rawDate} t={t} />
                            )}

                            {/* ── En-tête docteur ── */}
                            <View style={styles.appointmentHeader}>
                                <View style={styles.doctorInfo}>
                                    <View style={styles.doctorImagePlaceholder}>
                                        <FontAwesome5 name="user-md" size={30} color="#1a56db" />
                                    </View>
                                    <View style={styles.doctorDetails}>
                                        <Text style={styles.doctorName}>{appointment.doctorName}</Text>
                                        <Text style={styles.doctorSpecialty}>{appointment.specialty}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* ── Type consultation ── */}
                            <View style={[styles.consultationTypeBadge, { backgroundColor: colors.inputBackground }]}>
                                <Ionicons name={getConsultationTypeIcon(appointment.consultationType)} size={16} color="#1a56db" />
                                <Text style={[styles.consultationTypeText, { color: colors.text }]}>
                                    {getConsultationTypeText(appointment.consultationType)}
                                </Text>
                            </View>

                            {/* ── Info date / heure / statut ── */}
                            <View style={[styles.appointmentInfo, { backgroundColor: colors.inputBackground }]}>
                                <View style={styles.infoLeft}>
                                    <View style={styles.infoRow}>
                                        <Ionicons name="calendar-outline" size={16} color={colors.subText} />
                                        <Text style={[styles.infoText, { color: colors.subText }]}>{appointment.date}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Ionicons name="time-outline" size={16} color={colors.subText} />
                                        <Text style={[styles.infoText, { color: colors.subText }]}>{appointment.time}</Text>
                                    </View>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusBg(appointment.status) }]}>
                                    <Ionicons name={getStatusIcon(appointment.status)} size={14}
                                        color={getStatusColor(appointment.status)} />
                                    <Text style={[styles.statusText, { color: getStatusColor(appointment.status) }]}
                                        numberOfLines={1} ellipsizeMode="tail">
                                        {getStatusText(appointment.status)}
                                    </Text>
                                </View>
                            </View>

                            {/* ── Bouton expand ── */}
                            <TouchableOpacity style={styles.expandButton} onPress={() => toggleExpand(appointment.id)}>
                                <Text style={[styles.expandButtonText, { color: '#1a56db' }]}>
                                    {expandedId === appointment.id ? t('aptHideDetails') : t('aptMoreDetails')}
                                </Text>
                                <Ionicons name={expandedId === appointment.id ? 'chevron-up' : 'chevron-down'} size={18} color="#1a56db" />
                            </TouchableOpacity>

                            {/* ── Section dépliée ── */}
                            {expandedId === appointment.id && (
                                <View style={[styles.expandedSection, { borderTopColor: colors.border }]}>
                                    <View style={styles.contactRow}>
                                        <TouchableOpacity style={styles.contactButton} onPress={() => handleCall(appointment.doctorPhone)}>
                                            <Ionicons name="call-outline" size={20} color="#1a56db" />
                                            <Text style={styles.contactButtonText}>{t('aptCall')}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.contactButton} onPress={() => handleWhatsApp(appointment.doctorPhone)}>
                                            <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                                            <Text style={styles.contactButtonText}>{t('aptWhatsApp')}</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* 🏠 Localisation partagée avec le docteur */}
                                    {appointment.consultationType === 'home' && (
                                        <View style={styles.locationSection}>
                                            {/* Adresse que le docteur verra */}
                                            {appointment.adresseLocalisation && (
                                                <View style={[styles.aptAddressCard, { backgroundColor: colors.inputBackground }]}>
                                                    <Ionicons name="location" size={18} color="#1a56db" />
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={[styles.aptAddressLabel, { color: colors.subText }]}>Position envoyée au docteur</Text>
                                                        <Text style={[styles.aptAddressText, { color: colors.text }]}>{appointment.adresseLocalisation}</Text>
                                                    </View>
                                                </View>
                                            )}
                                            {/* Indication complémentaire */}
                                            {appointment.indicationComplementaire && (
                                                <View style={[styles.aptIndicationBox, { backgroundColor: colors.inputBackground }]}>
                                                    <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.subText} />
                                                    <Text style={[styles.aptIndicationText, { color: colors.subText }]}>"{appointment.indicationComplementaire}"</Text>
                                                </View>
                                            )}
                                            {/* Partager la position via WhatsApp */}
                                            {appointment.latitude != null && appointment.longitude != null && (
                                                <TouchableOpacity
                                                    style={styles.shareLocationButton}
                                                    onPress={() => handleShareLocation(appointment)}
                                                >
                                                    <Ionicons name="logo-whatsapp" size={20} color="#fff" />
                                                    <Text style={styles.shareLocationText}>{t('aptShareLocation')}</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    )}

                                    {/* 🏪 Lieu de consultation du docteur */}
                                    {appointment.docteurConsultationLocation?.latitude && appointment.docteurConsultationLocation?.longitude && (
                                        <View style={styles.locationSection}>
                                            <View style={[styles.aptAddressCard, { backgroundColor: colors.inputBackground }]}>
                                                <Ionicons name="navigate-outline" size={18} color="#198754" />
                                                <View style={{ flex: 1 }}>
                                                    <Text style={[styles.aptAddressLabel, { color: colors.subText }]}>Lieu de consultation du docteur</Text>
                                                    {appointment.docteurConsultationLocation.adresse && (
                                                        <Text style={[styles.aptAddressText, { color: colors.text }]}>
                                                            {appointment.docteurConsultationLocation.adresse}
                                                        </Text>
                                                    )}
                                                    {appointment.docteurConsultationLocation.indication && (
                                                        <Text style={[styles.aptIndicationText, { color: colors.subText }]}>
                                                            "{appointment.docteurConsultationLocation.indication}"
                                                        </Text>
                                                    )}
                                                </View>
                                            </View>
                                            <TouchableOpacity
                                                style={styles.doctorRouteButton}
                                                onPress={() => {
                                                    const { latitude, longitude } = appointment.docteurConsultationLocation!;
                                                    Linking.openURL(
                                                        `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
                                                    );
                                                }}
                                            >
                                                <Ionicons name="navigate" size={18} color="#fff" />
                                                <Text style={styles.doctorRouteButtonText}>Ouvrir l'itinéraire</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}

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
                            <Ionicons name="calendar-outline" size={60} color="#9ca3af" />
                            <Text style={styles.emptyStateText}>
                                {t('aptEmpty')}
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* ── FAB Nouveau RDV ── */}
            <TouchableOpacity style={styles.fab} onPress={() => onNavigate('bookingType')}>
                <Ionicons name="add" size={32} color="#fff" />
            </TouchableOpacity>

            {selectedRdvForEval && (
                <EvaluationDocteurModal
                    visible={evalModalVisible}
                    onClose={() => { setEvalModalVisible(false); setSelectedRdvForEval(null); }}
                    rendezVousId={parseInt(selectedRdvForEval.id)}
                    docteurPrenom={selectedRdvForEval.doctorName.replace('Dr. ', '').split(' ').slice(0, 1).join('')}
                    docteurNom={selectedRdvForEval.doctorName.replace('Dr. ', '').split(' ').slice(1).join(' ')}
                    onSuccess={() => {
                        setEvalModalVisible(false);
                        setSelectedRdvForEval(null);
                        loadAppointments();
                    }}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4f8' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
    loadingText: { marginTop: 15, fontSize: 14 },

    // Tabs horizontaux (scrollables) — hauteur FIXE pour éviter l'étirement vertical
    tabsScroll: {
        height: 56, flexGrow: 0, flexShrink: 0,
        backgroundColor: '#eff6ff', borderRadius: 28,
        marginHorizontal: 20, marginTop: 14,
    },
    tabsContent: { paddingHorizontal: 6, alignItems: 'center' },
    tab: {
        flexDirection: 'row', alignItems: 'center', flexShrink: 0,
        height: 44, paddingHorizontal: 16,
        borderRadius: 22, marginRight: 6,
    },
    activeTab: { backgroundColor: '#1a3fad' },
    tabText: { fontSize: 13, fontWeight: '600' },
    activeTabText: { color: '#fff', fontWeight: '700' },
    tabBadge: {
        backgroundColor: '#9aa7bd', borderRadius: 10, marginLeft: 7,
        minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4,
    },
    tabBadgeActive: { backgroundColor: '#fff' },
    tabBadgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
    tabBadgeTextActive: { color: '#1a56db' },

    appointmentsList: { paddingHorizontal: 20 },

    // Bannière compte à rebours (rappel RDV)
    countdownBanner: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#1a3fad', borderRadius: 12,
        paddingVertical: 10, paddingHorizontal: 14, marginBottom: 12,
    },
    countdownBannerNow: { backgroundColor: '#198754' },
    countdownLabel: { color: '#fff', fontSize: 12.5, fontWeight: '600', flex: 1 },
    countdownTime: {
        color: '#fff', fontSize: 14, fontWeight: '800',
        backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 10, paddingVertical: 3,
        borderRadius: 8, fontVariant: ['tabular-nums'],
    },
    appointmentCard: {
        backgroundColor: '#fff', borderRadius: 16, padding: 15, marginBottom: 15,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    },
    pendingPaymentCard: { borderWidth: 2, borderColor: '#9B59B6' },

    appointmentHeader: { padding: 16, gap: 12 },
    doctorInfo: { flexDirection: 'row', alignItems: 'center' },
    doctorImagePlaceholder: {
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    doctorDetails: { flex: 1 },
    doctorName: { fontSize: 15, fontWeight: '700', marginBottom: 4, color: '#111827' },
    doctorSpecialty: { fontSize: 13, color: '#6b7280' },

    consultationTypeBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
        marginBottom: 12, alignSelf: 'flex-start',
    },
    consultationTypeText: { fontSize: 13, fontWeight: '600' },

    appointmentInfo: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 12, paddingVertical: 10, borderRadius: 10, paddingHorizontal: 12, gap: 8,
    },
    infoLeft: { flexDirection: 'row', gap: 10, flexShrink: 0 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    infoText: { fontSize: 12 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, flexShrink: 1 },
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
        backgroundColor: '#f3f4f6', borderRadius: 10,
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
        justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 14, backgroundColor: '#1a3fad',
    },
    rescheduleButtonText: { fontSize: 14, color: '#fff', fontWeight: '600' },
    joinVideoButton: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, backgroundColor: '#1a3fad',
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
    deleteButtonCompact: { flex: 0.7 },
    deleteButtonText: { fontSize: 14, color: '#FF6B6B', fontWeight: '600' },
    evaluateButton: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', gap: 6, paddingVertical: 12,
        borderRadius: 25, backgroundColor: '#FFB800',
    },
    evaluateButtonText: { fontSize: 14, color: '#fff', fontWeight: '700' },

    // ✅ Bouton vérifier paiement
    checkPaymentButton: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', gap: 8, paddingVertical: 12,
        borderRadius: 25, backgroundColor: '#9B59B6',
    },
    checkPaymentText: { fontSize: 14, color: '#fff', fontWeight: '600' },

    // 🏠 Localisation pour consultation à domicile
    locationSection: { marginBottom: 12 },
    aptAddressCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 10, marginBottom: 8 },
    aptAddressLabel: { fontSize: 11, marginBottom: 2 },
    aptAddressText: { fontSize: 14, fontWeight: '500' },
    aptIndicationBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, padding: 10, borderRadius: 8, marginBottom: 8 },
    aptIndicationText: { fontSize: 12, fontStyle: 'italic', flex: 1 },
    shareLocationButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, paddingVertical: 12, borderRadius: 10, backgroundColor: '#25D366',
    },
    shareLocationText: { color: '#fff', fontSize: 14, fontWeight: '600' },

    doctorRouteButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, paddingVertical: 12, borderRadius: 10, backgroundColor: '#198754',
    },
    doctorRouteButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },

    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    emptyStateText: { fontSize: 16, marginTop: 15, color: '#111827' },

    fab: {
        position: 'absolute', bottom: 130, right: 20,
        width: 60, height: 60, borderRadius: 30, backgroundColor: '#1a56db',
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#1a56db', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
    },
});

export default AppointmentsScreen;