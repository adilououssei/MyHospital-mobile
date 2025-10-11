import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

interface Appointment {
    id: string;
    doctorName: string;
    specialty: string;
    date: string;
    time: string;
    status: 'pending' | 'confirmed' | 'past' | 'rejected';
    doctorImage: any;
}

interface AppointmentsScreenProps {
    onNavigate: (screen: string) => void;
    unreadCount?: number;
}

const AppointmentsScreen = ({ onNavigate, unreadCount = 0 }: AppointmentsScreenProps) => {
    const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'past' | 'rejected'>('confirmed');

    const appointments: Appointment[] = [
        {
            id: '1',
            doctorName: 'Dr. Marcus Horizon',
            specialty: 'Cardiologue',
            date: '26/06/2022',
            time: '10:30',
            status: 'confirmed',
            doctorImage: null,
        },
        {
            id: '2',
            doctorName: 'Dr. Alysa Hana',
            specialty: 'Pédiatre',
            date: '28/06/2022',
            time: '14:00',
            status: 'confirmed',
            doctorImage: null,
        },
        {
            id: '3',
            doctorName: 'Dr. Maria Elena',
            specialty: 'Psychologue',
            date: '15/05/2022',
            time: '09:00',
            status: 'past',
            doctorImage: null,
        },
        {
            id: '4',
            doctorName: 'Dr. Stevi Jessi',
            specialty: 'Orthopédiste',
            date: '20/06/2022',
            time: '16:30',
            status: 'pending',
            doctorImage: null,
        },
    ];

    const filteredAppointments = appointments.filter(
        (apt) => apt.status === activeTab
    );

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

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Rendez-vous</Text>
                <TouchableOpacity
                    style={styles.notificationButton}
                    onPress={() => onNavigate('notifications')}
                >
                    <Ionicons name="notifications-outline" size={24} color="#000" />
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
                    style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
                    onPress={() => setActiveTab('pending')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'pending' && styles.activeTabText,
                        ]}
                    >
                        En attente
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'confirmed' && styles.activeTab]}
                    onPress={() => setActiveTab('confirmed')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'confirmed' && styles.activeTabText,
                        ]}
                    >
                        Confirmé
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'past' && styles.activeTab]}
                    onPress={() => setActiveTab('past')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'past' && styles.activeTabText,
                        ]}
                    >
                        Passé
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'rejected' && styles.activeTab]}
                    onPress={() => setActiveTab('rejected')}
                >
                    <Text
                        style={[
                            styles.tabText,
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
                            <View key={appointment.id} style={styles.appointmentCard}>
                                <View style={styles.appointmentHeader}>
                                    <View style={styles.doctorInfo}>
                                        <View style={styles.doctorImagePlaceholder}>
                                            <FontAwesome5 name="user-md" size={30} color="#0077b6" />
                                        </View>
                                        <View style={styles.doctorDetails}>
                                            <Text style={styles.doctorName}>
                                                {appointment.doctorName}
                                            </Text>
                                            <Text style={styles.doctorSpecialty}>
                                                {appointment.specialty}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.appointmentInfo}>
                                    <View style={styles.infoRow}>
                                        <Ionicons name="calendar-outline" size={18} color="#666" />
                                        <Text style={styles.infoText}>{appointment.date}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Ionicons name="time-outline" size={18} color="#666" />
                                        <Text style={styles.infoText}>{appointment.time}</Text>
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

                                <View style={styles.appointmentActions}>
                                    <TouchableOpacity style={styles.cancelButton}>
                                        <Text style={styles.cancelButtonText}>Annuler</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.rescheduleButton}>
                                        <Text style={styles.rescheduleButtonText}>
                                            Reprogrammer
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="calendar-outline" size={60} color="#ccc" />
                            <Text style={styles.emptyStateText}>
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
            <View style={styles.bottomNav}>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => onNavigate('home')}
                >
                    <Ionicons name="home-outline" size={24} color="#999" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="chatbubble-outline" size={24} color="#999" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="calendar" size={24} color="#0077b6" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => onNavigate('profile')}
                >
                    <Ionicons name="person-outline" size={24} color="#999" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
        color: '#000',
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
        backgroundColor: '#F5F5F5',
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
        color: '#666',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#fff',
        fontWeight: '600',
    },
    appointmentsList: {
        paddingHorizontal: 20,
    },
    appointmentCard: {
        backgroundColor: '#fff',
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
        marginBottom: 15,
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
        color: '#000',
        marginBottom: 4,
    },
    doctorSpecialty: {
        fontSize: 14,
        color: '#666',
    },
    appointmentInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        paddingVertical: 10,
        backgroundColor: '#F9F9F9',
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
        color: '#666',
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
    appointmentActions: {
        flexDirection: 'row',
        gap: 10,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 25,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 14,
        color: '#666',
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
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#999',
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
        backgroundColor: '#fff',
        paddingVertical: 15,
        paddingBottom: 50,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
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