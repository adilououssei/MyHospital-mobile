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
import { useApp } from '../context/AppContext';

type TransactionStatus = 'success' | 'failed' | 'pending' | 'refunded';
type PaymentMethodType = 'tmoney' | 'flooz' | 'card';

interface Transaction {
    id: string;
    appointmentId: string;
    doctorName: string;
    specialty: string;
    amount: number;
    paymentMethod: PaymentMethodType;
    status: TransactionStatus;
    date: string;
    time: string;
    transactionId: string;
    description: string;
}

interface TransactionHistoryScreenProps {
    onNavigate: (screen: string) => void;
}

const TransactionHistoryScreen = ({ onNavigate }: TransactionHistoryScreenProps) => {
    const { colors } = useApp();
    const [activeFilter, setActiveFilter] = useState<'all' | TransactionStatus>('all');
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const transactions: Transaction[] = [
        {
            id: '1',
            appointmentId: 'APT001',
            doctorName: 'Dr. Marcus Horizon',
            specialty: 'Cardiologue',
            amount: 17000,
            paymentMethod: 'tmoney',
            status: 'success',
            date: '26 Juin 2024',
            time: '10:30',
            transactionId: 'TXN12345678',
            description: 'Consultation en ligne',
        },
        {
            id: '2',
            appointmentId: 'APT002',
            doctorName: 'Dr. Alysa Hana',
            specialty: 'Pédiatre',
            amount: 20000,
            paymentMethod: 'flooz',
            status: 'success',
            date: '20 Juin 2024',
            time: '14:00',
            transactionId: 'TXN87654321',
            description: 'Consultation à l\'hôpital',
        },
        {
            id: '3',
            appointmentId: 'APT003',
            doctorName: 'Dr. Maria Elena',
            specialty: 'Psychologue',
            amount: 15000,
            paymentMethod: 'card',
            status: 'refunded',
            date: '15 Juin 2024',
            time: '09:00',
            transactionId: 'TXN45678912',
            description: 'Consultation à domicile',
        },
        {
            id: '4',
            appointmentId: 'APT004',
            doctorName: 'Dr. John Smith',
            specialty: 'Généraliste',
            amount: 18000,
            paymentMethod: 'tmoney',
            status: 'failed',
            date: '10 Juin 2024',
            time: '11:00',
            transactionId: 'TXN78912345',
            description: 'Consultation en ligne',
        },
        {
            id: '5',
            appointmentId: 'APT005',
            doctorName: 'Dr. Sarah Connor',
            specialty: 'Dermatologue',
            amount: 22000,
            paymentMethod: 'flooz',
            status: 'pending',
            date: '05 Juin 2024',
            time: '15:30',
            transactionId: 'TXN12378945',
            description: 'Consultation à l\'hôpital',
        },
    ];

    const getStatusColor = (status: TransactionStatus) => {
        switch (status) {
            case 'success':
                return '#00C48C';
            case 'failed':
                return '#FF6B6B';
            case 'pending':
                return '#FFA500';
            case 'refunded':
                return '#6B7280';
            default:
                return colors.subText;
        }
    };

    const getStatusText = (status: TransactionStatus) => {
        switch (status) {
            case 'success':
                return 'Succès';
            case 'failed':
                return 'Échoué';
            case 'pending':
                return 'En attente';
            case 'refunded':
                return 'Remboursé';
            default:
                return status;
        }
    };

    const getStatusIcon = (status: TransactionStatus) => {
        switch (status) {
            case 'success':
                return 'checkmark-circle';
            case 'failed':
                return 'close-circle';
            case 'pending':
                return 'time';
            case 'refunded':
                return 'arrow-undo-circle';
            default:
                return 'help-circle';
        }
    };

    const getPaymentMethodLabel = (method: PaymentMethodType) => {
        switch (method) {
            case 'tmoney':
                return 'T-Money';
            case 'flooz':
                return 'Flooz';
            case 'card':
                return 'Carte bancaire';
            default:
                return method;
        }
    };

    const getPaymentMethodColor = (method: PaymentMethodType) => {
        switch (method) {
            case 'tmoney':
                return '#FF6B00';
            case 'flooz':
                return '#0066CC';
            case 'card':
                return '#0077b6';
            default:
                return colors.subText;
        }
    };

    const filteredTransactions = transactions.filter(transaction => {
        if (activeFilter === 'all') return true;
        return transaction.status === activeFilter;
    });

    const handleTransactionPress = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setShowDetailModal(true);
    };

    const calculateTotal = () => {
        return filteredTransactions
            .filter(t => t.status === 'success')
            .reduce((sum, t) => sum + t.amount, 0);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.card }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => onNavigate('settings')}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    Historique des transactions
                </Text>
                <View style={styles.placeholder} />
            </View>

            {/* Summary Card */}
            <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryLabel, { color: colors.subText }]}>
                        Total dépensé
                    </Text>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>
                        {calculateTotal().toLocaleString()} FCFA
                    </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryLabel, { color: colors.subText }]}>
                        Transactions
                    </Text>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>
                        {filteredTransactions.length}
                    </Text>
                </View>
            </View>

            {/* Filters */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filtersContainer}
                contentContainerStyle={styles.filtersContent}
            >
                {[
                    { key: 'all', label: 'Toutes' },
                    { key: 'success', label: 'Succès' },
                    { key: 'pending', label: 'En attente' },
                    { key: 'failed', label: 'Échouées' },
                    { key: 'refunded', label: 'Remboursées' },
                ].map((filter) => (
                    <TouchableOpacity
                        key={filter.key}
                        style={[
                            styles.filterChip,
                            { backgroundColor: colors.card, borderColor: colors.border },
                            activeFilter === filter.key && styles.filterChipActive,
                        ]}
                        onPress={() => setActiveFilter(filter.key as any)}
                    >
                        <Text
                            style={[
                                styles.filterChipText,
                                { color: colors.subText },
                                activeFilter === filter.key && styles.filterChipTextActive,
                            ]}
                        >
                            {filter.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.transactionsList}>
                    {filteredTransactions.length > 0 ? (
                        filteredTransactions.map((transaction) => (
                            <TouchableOpacity
                                key={transaction.id}
                                style={[styles.transactionCard, { backgroundColor: colors.card }]}
                                onPress={() => handleTransactionPress(transaction)}
                            >
                                <View style={styles.transactionLeft}>
                                    <View style={[
                                        styles.transactionIcon,
                                        { backgroundColor: getStatusColor(transaction.status) + '20' }
                                    ]}>
                                        <Ionicons
                                            name={getStatusIcon(transaction.status)}
                                            size={24}
                                            color={getStatusColor(transaction.status)}
                                        />
                                    </View>
                                    <View style={styles.transactionInfo}>
                                        <Text style={[styles.doctorName, { color: colors.text }]}>
                                            {transaction.doctorName}
                                        </Text>
                                        <Text style={[styles.specialty, { color: colors.subText }]}>
                                            {transaction.specialty} • {transaction.description}
                                        </Text>
                                        <View style={styles.transactionMeta}>
                                            <Ionicons name="calendar-outline" size={12} color={colors.subText} />
                                            <Text style={[styles.metaText, { color: colors.subText }]}>
                                                {transaction.date}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.transactionRight}>
                                    <Text style={[styles.amount, { color: colors.text }]}>
                                        {transaction.amount.toLocaleString()} FCFA
                                    </Text>
                                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transaction.status) + '20' }]}>
                                        <Text style={[styles.statusText, { color: getStatusColor(transaction.status) }]}>
                                            {getStatusText(transaction.status)}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="receipt-outline" size={60} color="#ccc" />
                            <Text style={[styles.emptyStateText, { color: colors.subText }]}>
                                Aucune transaction trouvée
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
                                Détails de la transaction
                            </Text>
                            <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                                <Ionicons name="close" size={28} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        {selectedTransaction && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {/* Status Icon */}
                                <View style={styles.modalStatusContainer}>
                                    <View style={[
                                        styles.modalStatusIcon,
                                        { backgroundColor: getStatusColor(selectedTransaction.status) + '20' }
                                    ]}>
                                        <Ionicons
                                            name={getStatusIcon(selectedTransaction.status)}
                                            size={50}
                                            color={getStatusColor(selectedTransaction.status)}
                                        />
                                    </View>
                                    <Text style={[styles.modalStatusText, { color: getStatusColor(selectedTransaction.status) }]}>
                                        {getStatusText(selectedTransaction.status)}
                                    </Text>
                                </View>

                                {/* Details */}
                                <View style={styles.detailsSection}>
                                    <View style={styles.detailRow}>
                                        <Text style={[styles.detailLabel, { color: colors.subText }]}>
                                            Médecin
                                        </Text>
                                        <Text style={[styles.detailValue, { color: colors.text }]}>
                                            {selectedTransaction.doctorName}
                                        </Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={[styles.detailLabel, { color: colors.subText }]}>
                                            Spécialité
                                        </Text>
                                        <Text style={[styles.detailValue, { color: colors.text }]}>
                                            {selectedTransaction.specialty}
                                        </Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={[styles.detailLabel, { color: colors.subText }]}>
                                            Type de consultation
                                        </Text>
                                        <Text style={[styles.detailValue, { color: colors.text }]}>
                                            {selectedTransaction.description}
                                        </Text>
                                    </View>

                                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                                    <View style={styles.detailRow}>
                                        <Text style={[styles.detailLabel, { color: colors.subText }]}>
                                            Date
                                        </Text>
                                        <Text style={[styles.detailValue, { color: colors.text }]}>
                                            {selectedTransaction.date}
                                        </Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={[styles.detailLabel, { color: colors.subText }]}>
                                            Heure
                                        </Text>
                                        <Text style={[styles.detailValue, { color: colors.text }]}>
                                            {selectedTransaction.time}
                                        </Text>
                                    </View>

                                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                                    <View style={styles.detailRow}>
                                        <Text style={[styles.detailLabel, { color: colors.subText }]}>
                                            Moyen de paiement
                                        </Text>
                                        <Text style={[styles.detailValue, { color: getPaymentMethodColor(selectedTransaction.paymentMethod) }]}>
                                            {getPaymentMethodLabel(selectedTransaction.paymentMethod)}
                                        </Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={[styles.detailLabel, { color: colors.subText }]}>
                                            ID Transaction
                                        </Text>
                                        <Text style={[styles.detailValue, { color: colors.text }]}>
                                            {selectedTransaction.transactionId}
                                        </Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={[styles.detailLabel, { color: colors.subText }]}>
                                            ID Rendez-vous
                                        </Text>
                                        <Text style={[styles.detailValue, { color: colors.text }]}>
                                            {selectedTransaction.appointmentId}
                                        </Text>
                                    </View>

                                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                                    <View style={styles.detailRow}>
                                        <Text style={[styles.totalLabel, { color: colors.text }]}>
                                            Montant total
                                        </Text>
                                        <Text style={[styles.totalValue, { color: colors.text }]}>
                                            {selectedTransaction.amount.toLocaleString()} FCFA
                                        </Text>
                                    </View>
                                </View>

                                {/* Actions */}
                                {selectedTransaction.status === 'success' && (
                                    <TouchableOpacity style={styles.downloadButton}>
                                        <Ionicons name="download-outline" size={20} color="#fff" />
                                        <Text style={styles.downloadButtonText}>
                                            Télécharger le reçu
                                        </Text>
                                    </TouchableOpacity>
                                )}
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
    summaryCard: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginVertical: 20,
        padding: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 13,
        marginBottom: 8,
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    summaryDivider: {
        width: 1,
        backgroundColor: '#E0E0E0',
        marginHorizontal: 15,
    },
    filtersContainer: {
        paddingLeft: 20,
        marginBottom: 20,
    },
    filtersContent: {
        paddingRight: 20,
        
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        minWidth: 90,
        alignItems: 'center',
    },
    filterChipActive: {
        backgroundColor: '#E3F2FD',
        borderColor: '#0077b6',
    },
    filterChipText: {
        fontSize: 13,
        fontWeight: '500',
        
    },
    filterChipTextActive: {
        color: '#0077b6',
    },
    transactionsList: {
        paddingHorizontal: 20,
    },
    transactionCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    transactionLeft: {
        flexDirection: 'row',
        flex: 1,
    },
    transactionIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    transactionInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    doctorName: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    specialty: {
        fontSize: 13,
        marginBottom: 4,
    },
    transactionMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
    },
    transactionRight: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
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
    modalStatusContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    modalStatusIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    modalStatusText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    detailsSection: {
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    detailLabel: {
        fontSize: 14,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'right',
        flex: 1,
        marginLeft: 20,
    },
    divider: {
        height: 1,
        marginVertical: 8,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
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

export default TransactionHistoryScreen;