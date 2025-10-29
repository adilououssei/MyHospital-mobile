import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useApp } from '../context/AppContext';

type ConsultationType = 'online' | 'home' | 'hospital';

interface Appointment {
    id: string;
    doctorName: string;
    specialty: string;
    date: string;
    time: string;
    status: 'pending' | 'confirmed' | 'past' | 'rejected';
    consultationType: ConsultationType;
    doctorImage: any;
    doctorPhone: string;
    hospitalAddress?: string;
    hospitalCoordinates?: { latitude: number; longitude: number };
}

interface AppointmentsScreenProps {
    onNavigate: (screen: string) => void;
    unreadCount?: number;
}

const AppointmentsScreen = ({ onNavigate, unreadCount = 0 }: AppointmentsScreenProps) => {
    const { colors } = useApp();
    const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'past' | 'rejected'>('confirmed');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    
    const [appointments, setAppointments] = useState<Appointment[]>([
        {
            id: '1',
            doctorName: 'Dr. Marcus Horizon',
            specialty: 'Cardiologue',
            date: '26/06/2022',
            time: '10:30',
            status: 'confirmed',
            consultationType: 'online',
            doctorImage: null,
            doctorPhone: '+33612345678',
        },
        {
            id: '2',
            doctorName: 'Dr. Alysa Hana',
            specialty: 'Pédiatre',
            date: '28/06/2022',
            time: '14:00',
            status: 'confirmed',
            consultationType: 'hospital',
            doctorImage: null,
            doctorPhone: '+33623456789',
            hospitalAddress: 'Hôpital Saint-Louis, 1 Avenue Claude Vellefaux, 75010 Paris',
            hospitalCoordinates: { latitude: 48.8738, longitude: 2.3686 },
        },
        {
            id: '3',
            doctorName: 'Dr. Maria Elena',
            specialty: 'Psychologue',
            date: '15/05/2022',
            time: '09:00',
            status: 'past',
            consultationType: 'home',
            doctorImage: null,
            doctorPhone: '+33634567890',
        },
        {
            id: '4',
            doctorName: 'Dr. Stevi Jessi',
            specialty: 'Orthopédiste',
            date: '20/06/2022',
            time: '16:30',
            status: 'pending',
            consultationType: 'online',
            doctorImage: null,
            doctorPhone: '+33645678901',
        },
        {
            id: '5',
            doctorName: 'Dr. John Smith',
            specialty: 'Généraliste',
            date: '10/06/2022',
            time: '11:00',
            status: 'rejected',
            consultationType: 'hospital',
            doctorImage: null,
            doctorPhone: '+33656789012',
            hospitalAddress: 'Hôpital Necker, 149 Rue de Sèvres, 75015 Paris',
            hospitalCoordinates: { latitude: 48.8486, longitude: 2.3161 },
        },
    ]);

    const filteredAppointments = appointments.filter(
        (apt) => apt.status === activeTab
    );

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleCall = (phone: string) => {
        Linking.openURL(`tel:${phone}`);
    };

    const handleWhatsApp = (phone: string) => {
        const cleanPhone = phone.replace(/\+/g, '').replace(/\s/g, '');
        Linking.openURL(`https://wa.me/${cleanPhone}`);
    };

    const handleGetDirections = (coordinates: { latitude: number; longitude: number }, address: string) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.latitude},${coordinates.longitude}`;
        Linking.openURL(url);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return '#0077b6';
            case 'pending':
                return '#FFA500';
            case 'rejected':
                return '#FF6B6B';
            default:
                return '#666';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'Confirmé';
            case 'pending':
                return 'En attente';
            case 'rejected':
                return 'Refusé';
            case 'past':
                return 'Passé';
            default:
                return status;
        }
    };

    const getConsultationTypeText = (type: ConsultationType) => {
        switch (type) {
            case 'online':
                return 'En ligne';
            case 'home':
                return 'À domicile';
            case 'hospital':
                return 'À l\'hôpital';
            default:
                return type;
        }
    };

    const getConsultationTypeIcon = (type: ConsultationType) => {
        switch (type) {
            case 'online':
                return 'videocam-outline';
            case 'home':
                return 'home-outline';
            case 'hospital':
                return 'business-outline';
            default:
                return 'help-outline';
        }
    };

    const handleCancelAppointment = (id: string) => {
        Alert.alert(
            'Annuler le rendez-vous',
            'Êtes-vous sûr de vouloir annuler ce rendez-vous ?',
            [
                {
                    text: 'Non',
                    style: 'cancel'
                },
                {
                    text: 'Oui',
                    onPress: () => {
                        console.log('Rendez-vous annulé:', id);
                    },
                    style: 'destructive'
                }
            ]
        );
    };

    const handleRescheduleAppointment = (id: string) => {
        console.log('Reprogrammer le rendez-vous:', id);
        onNavigate('bookingType');
    };

    const handleDeleteAppointment = (id: string) => {
        Alert.alert(
            'Supprimer le rendez-vous',
            'Êtes-vous sûr de vouloir supprimer ce rendez-vous ?',
            [
                {
                    text: 'Non',
                    style: 'cancel'
                },
                {
                    text: 'Oui',
                    onPress: () => {
                        setAppointments(appointments.filter(apt => apt.id !== id));
                    },
                    style: 'destructive'
                }
            ]
        );
    };

    const handleJoinVideoCall = (id: string) => {
        Alert.alert(
            'Rejoindre la consultation',
            'Vous allez être redirigé vers la vidéoconférence',
            [
                {
                    text: 'Annuler',
                    style: 'cancel'
                },
                {
                    text: 'Rejoindre',
                    onPress: () => {
                        console.log('Rejoindre la vidéoconférence:', id);
                    }
                }
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
                        <Text style={[styles.cancelButtonText, { color: colors.subText }]}>
                            Annuler
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.rescheduleButton}
                        onPress={() => handleRescheduleAppointment(appointment.id)}
                    >
                        <Text style={styles.rescheduleButtonText}>
                            Reprogrammer
                        </Text>
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
                        <Text style={styles.joinVideoButtonText}>
                            Rejoindre la consultation
                        </Text>
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
                        <Text style={styles.deleteButtonText}>
                            Supprimer
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return null;
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Rendez-vous</Text>
                <TouchableOpacity
                    style={styles.notificationButton}
                    onPress={() => onNavigate('notifications')}
                >
                    <Ionicons name="notifications-outline" size={24} color={colors.text} />
                    {unreadCount > 0 && (
                        <View style={styles.notificationBadge}>
                            <Text style={styles.notificationBadgeText}>
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        { backgroundColor: colors.inputBackground },
                        activeTab === 'pending' && styles.activeTab
                    ]}
                    onPress={() => setActiveTab('pending')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            { color: colors.subText },
                            activeTab === 'pending' && styles.activeTabText,
                        ]}
                    >
                        En attente
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tab,
                        { backgroundColor: colors.inputBackground },
                        activeTab === 'confirmed' && styles.activeTab
                    ]}
                    onPress={() => setActiveTab('confirmed')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            { color: colors.subText },
                            activeTab === 'confirmed' && styles.activeTabText,
                        ]}
                    >
                        Confirmé
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tab,
                        { backgroundColor: colors.inputBackground },
                        activeTab === 'past' && styles.activeTab
                    ]}
                    onPress={() => setActiveTab('past')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            { color: colors.subText },
                            activeTab === 'past' && styles.activeTabText,
                        ]}
                    >
                        Passé
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tab,
                        { backgroundColor: colors.inputBackground },
                        activeTab === 'rejected' && styles.activeTab
                    ]}
                    onPress={() => setActiveTab('rejected')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            { color: colors.subText },
                            activeTab === 'rejected' && styles.activeTabText,
                        ]}
                    >
                        Refusé
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Appointments List */}
                <View style={styles.appointmentsList}>
                    {filteredAppointments.length > 0 ? (
                        filteredAppointments.map((appointment) => (
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

                                {/* Consultation Type Badge */}
                                <View style={[styles.consultationTypeBadge, { backgroundColor: colors.inputBackground }]}>
                                    <Ionicons 
                                        name={getConsultationTypeIcon(appointment.consultationType)} 
                                        size={16} 
                                        color="#0077b6" 
                                    />
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
                                        <View
                                            style={[
                                                styles.statusDot,
                                                { backgroundColor: getStatusColor(appointment.status) },
                                            ]}
                                        />
                                        <Text
                                            style={[
                                                styles.statusText,
                                                { color: getStatusColor(appointment.status) },
                                            ]}
                                        >
                                            {getStatusText(appointment.status)}
                                        </Text>
                                    </View>
                                </View>

                                {/* Contact & Navigation */}
                                <TouchableOpacity 
                                    style={styles.expandButton}
                                    onPress={() => toggleExpand(appointment.id)}
                                >
                                    <Text style={[styles.expandButtonText, { color: '#0077b6' }]}>
                                        {expandedId === appointment.id ? 'Masquer les détails' : 'Plus de détails'}
                                    </Text>
                                    <Ionicons 
                                        name={expandedId === appointment.id ? 'chevron-up' : 'chevron-down'} 
                                        size={18} 
                                        color="#0077b6" 
                                    />
                                </TouchableOpacity>

                                {expandedId === appointment.id && (
                                    <View style={[styles.expandedSection, { borderTopColor: colors.border }]}>
                                        {/* Contact Buttons */}
                                        <View style={styles.contactRow}>
                                            <TouchableOpacity 
                                                style={styles.contactButton}
                                                onPress={() => handleCall(appointment.doctorPhone)}
                                            >
                                                <Ionicons name="call-outline" size={20} color="#0077b6" />
                                                <Text style={styles.contactButtonText}>Appeler</Text>
                                            </TouchableOpacity>
                                            
                                            <TouchableOpacity 
                                                style={styles.contactButton}
                                                onPress={() => handleWhatsApp(appointment.doctorPhone)}
                                            >
                                                <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                                                <Text style={styles.contactButtonText}>WhatsApp</Text>
                                            </TouchableOpacity>
                                        </View>

                                        {/* Hospital Address & Directions */}
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
                                                    onPress={() => handleGetDirections(
                                                        appointment.hospitalCoordinates!,
                                                        appointment.hospitalAddress!
                                                    )}
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

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => onNavigate('bookingType')}
            >
                <Ionicons name="add" size={32} color="#fff" />
            </TouchableOpacity>

            {/* Bottom Navigation */}
            <View style={[styles.bottomNav, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => onNavigate('home')}
                >
                    <Ionicons name="home-outline" size={24} color={colors.subText} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="chatbubble-outline" size={24} color={colors.subText} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="calendar" size={24} color="#0077b6" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => onNavigate('profile')}
                >
                    <Ionicons name="person-outline" size={24} color={colors.subText} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    notificationButton: {
        padding: 8,
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: '#FF6B6B',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 5,
        borderWidth: 2,
        borderColor: '#fff',
    },
    notificationBadgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        marginVertical: 15,
        gap: 2,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
        width: 100,
    },
    activeTab: {
        backgroundColor: '#0077b6',
    },
    tabText: {
        fontSize: 13,
        fontWeight: '500',
    },
    activeTabText: {
        color: '#fff',
        fontWeight: '500',
    },
    appointmentsList: {
        paddingHorizontal: 20,
    },
    appointmentCard: {
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    appointmentHeader: {
        marginBottom: 12,
    },
    doctorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    doctorImagePlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    doctorDetails: {
        flex: 1,
    },
    doctorName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    doctorSpecialty: {
        fontSize: 14,
    },
    consultationTypeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        marginBottom: 12,
        alignSelf: 'flex-start',
    },
    consultationTypeText: {
        fontSize: 13,
        fontWeight: '600',
    },
    appointmentInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingVertical: 10,
        borderRadius: 10,
        paddingHorizontal: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    infoText: {
        fontSize: 13,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '600',
    },
    expandButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 8,
    },
    expandButtonText: {
        fontSize: 13,
        fontWeight: '600',
    },
    expandedSection: {
        borderTopWidth: 1,
        paddingTop: 12,
        marginTop: 8,
        marginBottom: 12,
    },
    contactRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
    },
    contactButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
    },
    contactButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
    },
    addressSection: {
        gap: 10,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    addressText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 18,
    },
    directionsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 10,
        backgroundColor: '#0077b6',
        borderRadius: 10,
    },
    directionsButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#fff',
    },
    appointmentActions: {
        flexDirection: 'row',
        gap: 10,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    rescheduleButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 25,
        backgroundColor: '#0077b6',
        alignItems: 'center',
    },
    rescheduleButtonText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
    },
    joinVideoButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 25,
        backgroundColor: '#0077b6',
    },
    joinVideoButtonText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
    },
    confirmedMessage: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 25,
    },
    confirmedMessageText: {
        fontSize: 14,
        fontWeight: '600',
    },
    deleteButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 25,
        backgroundColor: '#FFE5E5',
    },
    deleteButtonText: {
        fontSize: 14,
        color: '#FF6B6B',
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyStateText: {
        fontSize: 16,
        marginTop: 15,
    },
    fab: {
        position: 'absolute',
        bottom: 120,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#0077b6',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#0077b6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 15,
        paddingBottom: 50,
        borderTopWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    navItem: {
        padding: 5,
    },
});

export default AppointmentsScreen;