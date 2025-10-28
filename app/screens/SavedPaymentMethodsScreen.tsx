import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Modal,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

interface PaymentMethod {
    id: string;
    type: 'tmoney' | 'flooz' | 'card';
    name: string;
    details: string;
    isDefault: boolean;
    icon: string;
    color: string;
}

interface SavedPaymentMethodsScreenProps {
    onNavigate: (screen: string) => void;
}

const SavedPaymentMethodsScreen = ({ onNavigate }: SavedPaymentMethodsScreenProps) => {
    const { colors } = useApp();
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedType, setSelectedType] = useState<'tmoney' | 'flooz' | 'card'>('tmoney');

    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
        {
            id: '1',
            type: 'tmoney',
            name: 'T-Money',
            details: '+228 90 12 34 56',
            isDefault: true,
            icon: 'phone-portrait-outline',
            color: '#FF6B00',
        },
        {
            id: '2',
            type: 'flooz',
            name: 'Flooz',
            details: '+228 96 78 90 12',
            isDefault: false,
            icon: 'phone-portrait-outline',
            color: '#0066CC',
        },
    ]);

    const [phoneNumber, setPhoneNumber] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');

    const handleSetDefault = (id: string) => {
        setPaymentMethods(
            paymentMethods.map((method) => ({
                ...method,
                isDefault: method.id === id,
            }))
        );
        Alert.alert('Succès', 'Moyen de paiement par défaut modifié');
    };

    const handleDelete = (id: string) => {
        const method = paymentMethods.find(m => m.id === id);
        if (method?.isDefault && paymentMethods.length > 1) {
            Alert.alert('Erreur', 'Veuillez définir un autre moyen de paiement par défaut avant de supprimer celui-ci');
            return;
        }

        Alert.alert(
            'Supprimer',
            'Êtes-vous sûr de vouloir supprimer ce moyen de paiement ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: () => {
                        setPaymentMethods(paymentMethods.filter(m => m.id !== id));
                    },
                },
            ]
        );
    };

    const handleAddPaymentMethod = () => {
        if (selectedType === 'card') {
            if (!cardNumber || !cardName || !expiryDate || !cvv) {
                Alert.alert('Erreur', 'Veuillez remplir tous les champs');
                return;
            }
        } else {
            if (!phoneNumber) {
                Alert.alert('Erreur', 'Veuillez entrer le numéro de téléphone');
                return;
            }
        }

        const newMethod: PaymentMethod = {
            id: Date.now().toString(),
            type: selectedType,
            name: selectedType === 'tmoney' ? 'T-Money' : selectedType === 'flooz' ? 'Flooz' : 'Carte bancaire',
            details: selectedType === 'card' ? `**** **** **** ${cardNumber.slice(-4)}` : phoneNumber,
            isDefault: paymentMethods.length === 0,
            icon: selectedType === 'card' ? 'card-outline' : 'phone-portrait-outline',
            color: selectedType === 'tmoney' ? '#FF6B00' : selectedType === 'flooz' ? '#0066CC' : '#0077b6',
        };

        setPaymentMethods([...paymentMethods, newMethod]);
        setShowAddModal(false);
        resetForm();
        Alert.alert('Succès', 'Moyen de paiement ajouté avec succès');
    };

    const resetForm = () => {
        setPhoneNumber('');
        setCardNumber('');
        setCardName('');
        setExpiryDate('');
        setCvv('');
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
                <Text style={[styles.headerTitle, { color: colors.text }]}>Moyens de paiement</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {/* Info Card */}
                    <View style={styles.infoCard}>
                        <Ionicons name="shield-checkmark" size={24} color="#0077b6" />
                        <View style={styles.infoTextContainer}>
                            <Text style={[styles.infoText, { color: colors.subText }]}>
                                Vos informations de paiement sont sécurisées et cryptées
                            </Text>
                        </View>
                    </View>

                    {/* Payment Methods List */}
                    {paymentMethods.length > 0 ? (
                        paymentMethods.map((method) => (
                            <View
                                key={method.id}
                                style={[
                                    styles.methodCard,
                                    { backgroundColor: colors.card },
                                    method.isDefault && styles.defaultMethodCard,
                                ]}
                            >
                                <View style={styles.methodHeader}>
                                    <View style={[styles.methodIcon, { backgroundColor: method.color + '20' }]}>
                                        <Ionicons name={method.icon as any} size={28} color={method.color} />
                                    </View>
                                    <View style={styles.methodInfo}>
                                        <View style={styles.methodTitleRow}>
                                            <Text style={[styles.methodName, { color: colors.text }]}>
                                                {method.name}
                                            </Text>
                                            {method.isDefault && (
                                                <View style={styles.defaultBadge}>
                                                    <Text style={styles.defaultBadgeText}>Par défaut</Text>
                                                </View>
                                            )}
                                        </View>
                                        <Text style={[styles.methodDetails, { color: colors.subText }]}>
                                            {method.details}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.methodActions}>
                                    {!method.isDefault && (
                                        <TouchableOpacity
                                            style={[styles.actionButton, { backgroundColor: colors.inputBackground }]}
                                            onPress={() => handleSetDefault(method.id)}
                                        >
                                            <Text style={[styles.actionButtonText, { color: colors.text }]}>
                                                Définir par défaut
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity
                                        style={styles.deleteButton}
                                        onPress={() => handleDelete(method.id)}
                                    >
                                        <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="wallet-outline" size={60} color="#ccc" />
                            <Text style={[styles.emptyStateText, { color: colors.subText }]}>
                                Aucun moyen de paiement enregistré
                            </Text>
                            <Text style={[styles.emptyStateSubText, { color: colors.subText }]}>
                                Ajoutez un moyen de paiement pour faciliter vos transactions
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Add Button */}
            <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowAddModal(true)}
                >
                    <Ionicons name="add-circle-outline" size={24} color="#fff" />
                    <Text style={styles.addButtonText}>Ajouter un moyen de paiement</Text>
                </TouchableOpacity>
            </View>

            {/* Add Payment Method Modal */}
            <Modal
                visible={showAddModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowAddModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>
                                Ajouter un moyen de paiement
                            </Text>
                            <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                <Ionicons name="close" size={28} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Type Selection */}
                            <View style={styles.typeSelection}>
                                <TouchableOpacity
                                    style={[
                                        styles.typeButton,
                                        { backgroundColor: colors.inputBackground },
                                        selectedType === 'tmoney' && styles.typeButtonActive,
                                    ]}
                                    onPress={() => setSelectedType('tmoney')}
                                >
                                    <Ionicons name="phone-portrait-outline" size={24} color={selectedType === 'tmoney' ? '#FF6B00' : colors.subText} />
                                    <Text style={[styles.typeButtonText, { color: selectedType === 'tmoney' ? '#FF6B00' : colors.subText }]}>
                                        T-Money
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.typeButton,
                                        { backgroundColor: colors.inputBackground },
                                        selectedType === 'flooz' && styles.typeButtonActive,
                                    ]}
                                    onPress={() => setSelectedType('flooz')}
                                >
                                    <Ionicons name="phone-portrait-outline" size={24} color={selectedType === 'flooz' ? '#0066CC' : colors.subText} />
                                    <Text style={[styles.typeButtonText, { color: selectedType === 'flooz' ? '#0066CC' : colors.subText }]}>
                                        Flooz
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.typeButton,
                                        { backgroundColor: colors.inputBackground },
                                        selectedType === 'card' && styles.typeButtonActive,
                                    ]}
                                    onPress={() => setSelectedType('card')}
                                >
                                    <Ionicons name="card-outline" size={24} color={selectedType === 'card' ? '#0077b6' : colors.subText} />
                                    <Text style={[styles.typeButtonText, { color: selectedType === 'card' ? '#0077b6' : colors.subText }]}>
                                        Carte
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Mobile Money Form */}
                            {(selectedType === 'tmoney' || selectedType === 'flooz') && (
                                <View style={styles.formSection}>
                                    <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground }]}>
                                        <Ionicons name="phone-portrait-outline" size={20} color={colors.subText} />
                                        <TextInput
                                            style={[styles.input, { color: colors.text }]}
                                            placeholder="Numéro de téléphone"
                                            placeholderTextColor={colors.subText}
                                            value={phoneNumber}
                                            onChangeText={setPhoneNumber}
                                            keyboardType="phone-pad"
                                        />
                                    </View>
                                </View>
                            )}

                            {/* Card Form */}
                            {selectedType === 'card' && (
                                <View style={styles.formSection}>
                                    <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground }]}>
                                        <Ionicons name="card-outline" size={20} color={colors.subText} />
                                        <TextInput
                                            style={[styles.input, { color: colors.text }]}
                                            placeholder="Numéro de carte"
                                            placeholderTextColor={colors.subText}
                                            value={cardNumber}
                                            onChangeText={setCardNumber}
                                            keyboardType="number-pad"
                                            maxLength={16}
                                        />
                                    </View>

                                    <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground }]}>
                                        <Ionicons name="person-outline" size={20} color={colors.subText} />
                                        <TextInput
                                            style={[styles.input, { color: colors.text }]}
                                            placeholder="Nom sur la carte"
                                            placeholderTextColor={colors.subText}
                                            value={cardName}
                                            onChangeText={setCardName}
                                        />
                                    </View>

                                    <View style={styles.row}>
                                        <View style={[styles.inputContainer, styles.halfInput, { backgroundColor: colors.inputBackground }]}>
                                            <Ionicons name="calendar-outline" size={20} color={colors.subText} />
                                            <TextInput
                                                style={[styles.input, { color: colors.text }]}
                                                placeholder="MM/AA"
                                                placeholderTextColor={colors.subText}
                                                value={expiryDate}
                                                onChangeText={setExpiryDate}
                                                maxLength={5}
                                            />
                                        </View>

                                        <View style={[styles.inputContainer, styles.halfInput, { backgroundColor: colors.inputBackground }]}>
                                            <Ionicons name="lock-closed-outline" size={20} color={colors.subText} />
                                            <TextInput
                                                style={[styles.input, { color: colors.text }]}
                                                placeholder="CVV"
                                                placeholderTextColor={colors.subText}
                                                value={cvv}
                                                onChangeText={setCvv}
                                                keyboardType="number-pad"
                                                maxLength={3}
                                                secureTextEntry
                                            />
                                        </View>
                                    </View>
                                </View>
                            )}

                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleAddPaymentMethod}
                            >
                                <Text style={styles.saveButtonText}>Enregistrer</Text>
                            </TouchableOpacity>
                        </ScrollView>
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
    content: {
        padding: 20,
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#E3F2FD',
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        alignItems: 'center',
        gap: 12,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoText: {
        fontSize: 13,
        lineHeight: 18,
    },
    methodCard: {
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    defaultMethodCard: {
        borderWidth: 2,
        borderColor: '#0077b6',
    },
    methodHeader: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    methodIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    methodInfo: {
        flex: 1,
    },
    methodTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        gap: 10,
    },
    methodName: {
        fontSize: 16,
        fontWeight: '600',
    },
    defaultBadge: {
        backgroundColor: '#0077b6',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    defaultBadgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    },
    methodDetails: {
        fontSize: 14,
        marginBottom: 4,
    },
    methodActions: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
    },
    actionButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 20,
        alignItems: 'center',
    },
    actionButtonText: {
        fontSize: 13,
        fontWeight: '600',
    },
    deleteButton: {
        padding: 10,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyStateText: {
        fontSize: 16,
        marginTop: 15,
        fontWeight: '600',
    },
    emptyStateSubText: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    footer: {
        padding: 20,
        paddingBottom: 30,
        borderTopWidth: 1,
    },
    addButton: {
        backgroundColor: '#0077b6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 30,
        gap: 10,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
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
        maxHeight: '85%',
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
    typeSelection: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        gap: 8,
    },
    typeButtonActive: {
        backgroundColor: '#E3F2FD',
        borderWidth: 2,
        borderColor: '#0077b6',
    },
    typeButtonText: {
        fontSize: 12,
        fontWeight: '600',
    },
    formSection: {
        gap: 15,
        marginBottom: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 15,
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
    },
    row: {
        flexDirection: 'row',
        gap: 10,
    },
    halfInput: {
        flex: 1,
    },
    saveButton: {
        backgroundColor: '#0077b6',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default SavedPaymentMethodsScreen;