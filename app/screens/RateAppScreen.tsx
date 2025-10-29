import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

interface RateAppScreenProps {
    onNavigate: (screen: string) => void;
}

const RateAppScreen = ({ onNavigate }: RateAppScreenProps) => {
    const { colors } = useApp();
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const ratingLabels = [
        { stars: 1, label: 'Très mauvais', emoji: '😞' },
        { stars: 2, label: 'Mauvais', emoji: '😕' },
        { stars: 3, label: 'Moyen', emoji: '😐' },
        { stars: 4, label: 'Bon', emoji: '😊' },
        { stars: 5, label: 'Excellent', emoji: '🤩' },
    ];

    const getCurrentLabel = () => {
        const currentRating = hoveredRating || rating;
        return ratingLabels.find(r => r.stars === currentRating);
    };

    const handleSubmit = () => {
        if (rating === 0) {
            Alert.alert('Attention', 'Veuillez sélectionner une note');
            return;
        }

        // Ici, vous enverrez les données au backend
        console.log('Rating:', rating);
        console.log('Comment:', comment);

        setShowSuccessModal(true);
    };

    const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
        onNavigate('settings');
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
                    Noter l'application
                </Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {/* App Icon */}
                    <View style={styles.appIconContainer}>
                        <View style={styles.appIcon}>
                            <Ionicons name="medical" size={60} color="#0077b6" />
                        </View>
                        <Text style={[styles.appName, { color: colors.text }]}>MyHospital</Text>
                    </View>

                    {/* Title */}
                    <Text style={[styles.title, { color: colors.text }]}>
                        Que pensez-vous de MyHospital ?
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.subText }]}>
                        Votre avis nous aide à améliorer l'application
                    </Text>

                    {/* Rating Stars */}
                    <View style={styles.starsContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity
                                key={star}
                                style={styles.starButton}
                                onPress={() => setRating(star)}
                                onPressIn={() => setHoveredRating(star)}
                                onPressOut={() => setHoveredRating(0)}
                            >
                                <Ionicons
                                    name={star <= (hoveredRating || rating) ? 'star' : 'star-outline'}
                                    size={50}
                                    color={star <= (hoveredRating || rating) ? '#FFB800' : '#D0D0D0'}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Rating Label */}
                    {(rating > 0 || hoveredRating > 0) && (
                        <View style={styles.ratingLabelContainer}>
                            <Text style={styles.ratingEmoji}>
                                {getCurrentLabel()?.emoji}
                            </Text>
                            <Text style={[styles.ratingLabel, { color: colors.text }]}>
                                {getCurrentLabel()?.label}
                            </Text>
                        </View>
                    )}

                    {/* Comment Section */}
                    <View style={styles.commentSection}>
                        <Text style={[styles.commentTitle, { color: colors.text }]}>
                            Partagez votre expérience (optionnel)
                        </Text>
                        <View style={[styles.commentInputContainer, {
                            backgroundColor: colors.card,
                            borderColor: colors.border
                        }]}>
                            <TextInput
                                style={[styles.commentInput, { color: colors.text }]}
                                placeholder="Qu'avez-vous aimé ou qu'est-ce qui pourrait être amélioré ?"
                                placeholderTextColor={colors.subText}
                                value={comment}
                                onChangeText={setComment}
                                multiline
                                numberOfLines={6}
                                textAlignVertical="top"
                            />
                        </View>
                        <Text style={[styles.commentHint, { color: colors.subText }]}>
                            {comment.length}/500 caractères
                        </Text>
                    </View>

                    {/* Benefits */}
                    <View style={styles.benefitsContainer}>
                        <Text style={[styles.benefitsTitle, { color: colors.text }]}>
                            Pourquoi noter l'application ?
                        </Text>
                        <View style={styles.benefitItem}>
                            <Ionicons name="checkmark-circle" size={20} color="#00C48C" />
                            <Text style={[styles.benefitText, { color: colors.subText }]}>
                                Aide les autres utilisateurs à découvrir l'app
                            </Text>
                        </View>
                        <View style={styles.benefitItem}>
                            <Ionicons name="checkmark-circle" size={20} color="#00C48C" />
                            <Text style={[styles.benefitText, { color: colors.subText }]}>
                                Nous permet d'améliorer nos services
                            </Text>
                        </View>
                        <View style={styles.benefitItem}>
                            <Ionicons name="checkmark-circle" size={20} color="#00C48C" />
                            <Text style={[styles.benefitText, { color: colors.subText }]}>
                                Prend moins d'une minute
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Submit Button */}
            <View style={[styles.footer, {
                backgroundColor: colors.card,
                borderTopColor: colors.border
            }]}>
                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        rating === 0 && styles.submitButtonDisabled
                    ]}
                    onPress={handleSubmit}
                    disabled={rating === 0}
                >
                    <Text style={styles.submitButtonText}>Envoyer mon avis</Text>
                </TouchableOpacity>
            </View>

            {/* Success Modal */}
            <Modal
                visible={showSuccessModal}
                transparent
                animationType="fade"
                onRequestClose={handleCloseSuccessModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={styles.modalIconContainer}>
                            <Ionicons name="checkmark-circle" size={70} color="#00C48C" />
                        </View>

                        <Text style={[styles.modalTitle, { color: colors.text }]}>
                            Merci pour votre avis !
                        </Text>
                        <Text style={[styles.modalDescription, { color: colors.subText }]}>
                            Votre évaluation nous aide à améliorer MyHospital pour tous nos utilisateurs
                        </Text>

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={handleCloseSuccessModal}
                        >
                            <Text style={styles.modalButtonText}>Fermer</Text>
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
    appIconContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    appIcon: {
        width: 100,
        height: 100,
        borderRadius: 25,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    appName: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 30,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 20,
    },
    starButton: {
        padding: 5,
    },
    ratingLabelContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    ratingEmoji: {
        fontSize: 50,
        marginBottom: 10,
    },
    ratingLabel: {
        fontSize: 18,
        fontWeight: '600',
    },
    commentSection: {
        marginBottom: 30,
    },
    commentTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    commentInputContainer: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 15,
        minHeight: 120,
    },
    commentInput: {
        fontSize: 14,
        lineHeight: 20,
    },
    commentHint: {
        fontSize: 12,
        marginTop: 8,
        textAlign: 'right',
    },
    benefitsContainer: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 20,
    },
    benefitsTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 15,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    benefitText: {
        fontSize: 14,
        flex: 1,
    },
    footer: {
        padding: 20,
        paddingBottom: 30,
        borderTopWidth: 1,
    },
    submitButton: {
        backgroundColor: '#0077b6',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: '#B0B0B0',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    modalContent: {
        borderRadius: 25,
        padding: 30,
        width: '100%',
        alignItems: 'center',
    },
    modalIconContainer: {
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    modalDescription: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 25,
    },
    modalButton: {
        backgroundColor: '#0077b6',
        paddingVertical: 15,
        paddingHorizontal: 60,
        borderRadius: 25,
        width: '100%',
        alignItems: 'center',
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default RateAppScreen;