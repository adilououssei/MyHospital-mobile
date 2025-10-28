import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

interface FAQ {
    id: string;
    category: string;
    question: string;
    answer: string;
}

interface FAQsScreenProps {
    onNavigate: (screen: string) => void;
}

const FAQsScreen = ({ onNavigate }: FAQsScreenProps) => {
    const { colors } = useApp();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    const categories = [
        { id: 'all', label: 'Tous', icon: 'apps-outline' },
        { id: 'account', label: 'Compte', icon: 'person-outline' },
        { id: 'appointments', label: 'Rendez-vous', icon: 'calendar-outline' },
        { id: 'payment', label: 'Paiement', icon: 'card-outline' },
        { id: 'technical', label: 'Technique', icon: 'settings-outline' },
    ];

    const faqs: FAQ[] = [
        {
            id: '1',
            category: 'account',
            question: 'Comment créer un compte ?',
            answer: 'Pour créer un compte, cliquez sur "S\'inscrire" sur l\'écran d\'accueil. Renseignez votre nom, prénom, email et mot de passe. Acceptez les conditions d\'utilisation et validez. Vous recevrez un email de confirmation.',
        },
        {
            id: '2',
            category: 'account',
            question: 'Comment réinitialiser mon mot de passe ?',
            answer: 'Sur l\'écran de connexion, cliquez sur "Mot de passe oublié". Entrez votre email ou numéro de téléphone. Vous recevrez un code de vérification pour créer un nouveau mot de passe.',
        },
        {
            id: '3',
            category: 'account',
            question: 'Comment modifier mes informations personnelles ?',
            answer: 'Allez dans votre profil, cliquez sur l\'icône de modification (crayon) à côté de votre photo. Vous pourrez modifier votre nom, email, numéro de téléphone et photo de profil.',
        },
        {
            id: '4',
            category: 'appointments',
            question: 'Comment prendre un rendez-vous ?',
            answer: 'Cliquez sur le bouton "+" en bas de l\'écran des rendez-vous ou sur "Réserver" depuis l\'écran d\'accueil. Choisissez le type de consultation (en ligne, à domicile ou à l\'hôpital), sélectionnez un médecin, choisissez une date et heure, puis validez le paiement.',
        },
        {
            id: '5',
            category: 'appointments',
            question: 'Puis-je annuler ou reprogrammer un rendez-vous ?',
            answer: 'Oui, vous pouvez annuler ou reprogrammer un rendez-vous tant qu\'il est en statut "En attente". Une fois confirmé par le médecin, les modifications ne sont plus possibles. Contactez directement le médecin si nécessaire.',
        },
        {
            id: '6',
            category: 'appointments',
            question: 'Comment rejoindre une consultation en ligne ?',
            answer: 'Pour les consultations en ligne confirmées, un bouton "Rejoindre la consultation" apparaîtra sur votre rendez-vous. Cliquez dessus à l\'heure prévue pour accéder à la vidéoconférence.',
        },
        {
            id: '7',
            category: 'appointments',
            question: 'Que faire si mon rendez-vous est refusé ?',
            answer: 'Si votre rendez-vous est refusé, vous serez remboursé automatiquement. Vous pouvez essayer de prendre un nouveau rendez-vous avec un autre médecin ou à une autre date.',
        },
        {
            id: '8',
            category: 'payment',
            question: 'Quels moyens de paiement sont acceptés ?',
            answer: 'Nous acceptons T-Money (TOGOCOM), Flooz (MOOV) et les cartes bancaires Visa/Mastercard. Vous pouvez enregistrer plusieurs moyens de paiement dans votre profil.',
        },
        {
            id: '9',
            category: 'payment',
            question: 'Comment enregistrer un moyen de paiement ?',
            answer: 'Allez dans Profil > Moyens de paiement. Cliquez sur "Ajouter un moyen de paiement", choisissez le type (T-Money, Flooz ou Carte) et renseignez les informations demandées.',
        },
        {
            id: '10',
            category: 'payment',
            question: 'Mes paiements sont-ils sécurisés ?',
            answer: 'Oui, toutes les transactions sont cryptées et sécurisées. Nous utilisons les protocoles de sécurité les plus avancés pour protéger vos informations bancaires.',
        },
        {
            id: '11',
            category: 'payment',
            question: 'Puis-je obtenir un remboursement ?',
            answer: 'Les remboursements sont automatiques en cas de rendez-vous refusé. Pour les autres cas, contactez notre service client avec votre numéro de rendez-vous.',
        },
        {
            id: '12',
            category: 'technical',
            question: 'L\'application ne fonctionne pas correctement, que faire ?',
            answer: 'Essayez de fermer et rouvrir l\'application. Vérifiez votre connexion internet. Assurez-vous d\'avoir la dernière version de l\'application. Si le problème persiste, contactez notre support technique.',
        },
        {
            id: '13',
            category: 'technical',
            question: 'Comment activer les notifications ?',
            answer: 'Allez dans les paramètres de votre téléphone > Applications > MyHospital > Notifications, et activez-les. Vous recevrez des alertes pour vos rendez-vous, messages et mises à jour importantes.',
        },
        {
            id: '14',
            category: 'technical',
            question: 'Comment changer la langue de l\'application ?',
            answer: 'Allez dans votre profil, cliquez sur "Langue" et sélectionnez la langue de votre choix parmi celles disponibles (Français, Anglais, Espagnol, etc.).',
        },
        {
            id: '15',
            category: 'technical',
            question: 'Comment activer le mode sombre ?',
            answer: 'Allez dans votre profil et cliquez sur "Mode sombre" ou "Mode clair" pour basculer entre les thèmes. Le changement s\'applique immédiatement à toute l\'application.',
        },
    ];

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const filteredFaqs = faqs.filter((faq) => {
        const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const getCategoryColor = (categoryId: string) => {
        const colorMap: { [key: string]: string } = {
            account: '#0077b6',
            appointments: '#00C48C',
            payment: '#FFA500',
            technical: '#9B59B6',
        };
        return colorMap[categoryId] || '#0077b6';
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
                    Questions Fréquentes
                </Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={[styles.searchBar, {
                        backgroundColor: colors.card,
                        borderColor: colors.border
                    }]}>
                        <Ionicons name="search-outline" size={20} color={colors.subText} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder="Rechercher une question..."
                            placeholderTextColor={colors.subText}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery !== '' && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={20} color={colors.subText} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Categories */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoriesContainer}
                    contentContainerStyle={styles.categoriesContent}
                >
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            style={[
                                styles.categoryChip,
                                { backgroundColor: colors.card, borderColor: colors.border },
                                activeCategory === category.id && styles.categoryChipActive,
                            ]}
                            onPress={() => setActiveCategory(category.id)}
                        >
                            <Ionicons
                                name={category.icon as any}
                                size={18}
                                color={activeCategory === category.id ? '#0077b6' : colors.subText}
                            />
                            <Text
                                style={[
                                    styles.categoryChipText,
                                    { color: colors.subText },
                                    activeCategory === category.id && styles.categoryChipTextActive,
                                ]}
                            >
                                {category.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Info Banner */}
                <View style={styles.infoBanner}>
                    <Ionicons name="help-circle" size={24} color="#0077b6" />
                    <View style={styles.infoBannerTextContainer}>
                        <Text style={[styles.infoBannerTitle, { color: colors.text }]}>
                            Besoin d'aide ?
                        </Text>
                        <Text style={[styles.infoBannerText, { color: colors.subText }]}>
                            Parcourez nos questions fréquentes ou contactez notre support
                        </Text>
                    </View>
                </View>

                {/* FAQs List */}
                <View style={styles.faqsContainer}>
                    {filteredFaqs.length > 0 ? (
                        filteredFaqs.map((faq) => (
                            <TouchableOpacity
                                key={faq.id}
                                style={[
                                    styles.faqCard,
                                    { backgroundColor: colors.card },
                                    expandedId === faq.id && styles.faqCardExpanded,
                                ]}
                                onPress={() => toggleExpand(faq.id)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.faqHeader}>
                                    <View style={styles.faqHeaderLeft}>
                                        <View
                                            style={[
                                                styles.categoryIndicator,
                                                { backgroundColor: getCategoryColor(faq.category) + '20' },
                                            ]}
                                        >
                                            <View
                                                style={[
                                                    styles.categoryDot,
                                                    { backgroundColor: getCategoryColor(faq.category) },
                                                ]}
                                            />
                                        </View>
                                        <Text style={[styles.faqQuestion, { color: colors.text }]}>
                                            {faq.question}
                                        </Text>
                                    </View>
                                    <Ionicons
                                        name={expandedId === faq.id ? 'chevron-up' : 'chevron-down'}
                                        size={24}
                                        color={colors.subText}
                                    />
                                </View>

                                {expandedId === faq.id && (
                                    <View style={[styles.faqAnswer, { borderTopColor: colors.border }]}>
                                        <Text style={[styles.faqAnswerText, { color: colors.subText }]}>
                                            {faq.answer}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="search-outline" size={60} color="#ccc" />
                            <Text style={[styles.emptyStateText, { color: colors.subText }]}>
                                Aucune question trouvée
                            </Text>
                            <Text style={[styles.emptyStateSubText, { color: colors.subText }]}>
                                Essayez avec d'autres mots-clés
                            </Text>
                        </View>
                    )}
                </View>

                {/* Contact Support */}
                <View style={styles.supportSection}>
                    <Text style={[styles.supportTitle, { color: colors.text }]}>
                        Vous n'avez pas trouvé de réponse ?
                    </Text>
                    <Text style={[styles.supportSubtitle, { color: colors.subText }]}>
                        Notre équipe est là pour vous aider
                    </Text>

                    <View style={styles.supportButtons}>
                        <TouchableOpacity style={styles.supportButton}>
                            <Ionicons name="mail-outline" size={24} color="#0077b6" />
                            <Text style={styles.supportButtonText}>Email</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.supportButton}>
                            <Ionicons name="call-outline" size={24} color="#0077b6" />
                            <Text style={styles.supportButtonText}>Téléphone</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.supportButton}>
                            <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
                            <Text style={styles.supportButtonText}>WhatsApp</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ height: 30 }} />
            </ScrollView>
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
    searchContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
    },
    categoriesContainer: {
        paddingLeft: 20,
        marginBottom: 20,
    },
    categoriesContent: {
        paddingRight: 20,
        gap: 10,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        gap: 6,
    },
    categoryChipActive: {
        backgroundColor: '#E3F2FD',
        borderColor: '#0077b6',
    },
    categoryChipText: {
        fontSize: 14,
        fontWeight: '500',
    },
    categoryChipTextActive: {
        color: '#0077b6',
    },
    infoBanner: {
        flexDirection: 'row',
        backgroundColor: '#E3F2FD',
        marginHorizontal: 20,
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        alignItems: 'center',
        gap: 12,
    },
    infoBannerTextContainer: {
        flex: 1,
    },
    infoBannerTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    infoBannerText: {
        fontSize: 13,
        lineHeight: 18,
    },
    faqsContainer: {
        paddingHorizontal: 20,
    },
    faqCard: {
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    faqCardExpanded: {
        shadowOpacity: 0.15,
        elevation: 5,
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    faqHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    categoryIndicator: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    faqQuestion: {
        fontSize: 15,
        fontWeight: '600',
        flex: 1,
        lineHeight: 22,
    },
    faqAnswer: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
    },
    faqAnswerText: {
        fontSize: 14,
        lineHeight: 22,
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
    },
    supportSection: {
        paddingHorizontal: 20,
        paddingTop: 30,
        alignItems: 'center',
    },
    supportTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    supportSubtitle: {
        fontSize: 14,
        marginBottom: 20,
        textAlign: 'center',
    },
    supportButtons: {
        flexDirection: 'row',
        gap: 15,
        width: '100%',
    },
    supportButton: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        paddingVertical: 15,
        borderRadius: 12,
        gap: 8,
    },
    supportButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
    },
});

export default FAQsScreen;