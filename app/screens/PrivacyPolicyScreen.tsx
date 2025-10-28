import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

interface PrivacyPolicyScreenProps {
    onNavigate: (screen: string) => void;
}

const PrivacyPolicyScreen = ({ onNavigate }: PrivacyPolicyScreenProps) => {
    const { colors } = useApp();

    const sections = [
        {
            title: '1. Collecte des informations',
            content: 'Nous collectons les informations suivantes :\n\n• Informations personnelles : nom, prénom, date de naissance, adresse email, numéro de téléphone\n• Informations de santé : groupe sanguin, taille, poids, historique médical\n• Données de localisation pour trouver les établissements de santé à proximité\n• Informations de paiement pour les transactions',
        },
        {
            title: '2. Utilisation des informations',
            content: 'Vos informations sont utilisées pour :\n\n• Vous fournir nos services de santé numériques\n• Faciliter la prise de rendez-vous avec les professionnels de santé\n• Améliorer votre expérience utilisateur\n• Vous envoyer des notifications importantes\n• Analyser et améliorer nos services',
        },
        {
            title: '3. Protection des données médicales',
            content: 'Vos données de santé sont traitées avec le plus haut niveau de sécurité et de confidentialité. Elles sont cryptées et stockées sur des serveurs sécurisés conformément aux normes internationales de protection des données de santé.',
        },
        {
            title: '4. Partage des informations',
            content: 'Nous ne partageons vos informations qu\'avec :\n\n• Les professionnels de santé que vous consultez\n• Les établissements de santé pour vos rendez-vous\n• Les prestataires de services essentiels (paiement, hébergement)\n\nNous ne vendons jamais vos données personnelles ou médicales à des tiers.',
        },
        {
            title: '5. Vos droits',
            content: 'Vous disposez des droits suivants :\n\n• Accès à vos données personnelles\n• Rectification de vos informations\n• Suppression de votre compte et de vos données\n• Opposition au traitement de vos données\n• Portabilité de vos données\n• Retrait de votre consentement',
        },
        {
            title: '6. Cookies et technologies similaires',
            content: 'Nous utilisons des cookies et technologies similaires pour améliorer votre expérience, analyser l\'utilisation de l\'application et personnaliser le contenu.',
        },
        {
            title: '7. Sécurité',
            content: 'Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, modification, divulgation ou destruction.',
        },
        {
            title: '8. Conservation des données',
            content: 'Nous conservons vos données aussi longtemps que nécessaire pour vous fournir nos services et conformément aux obligations légales. Vous pouvez demander la suppression de vos données à tout moment.',
        },
        {
            title: '9. Transferts internationaux',
            content: 'Vos données peuvent être transférées et traitées dans des pays en dehors de votre pays de résidence. Nous nous assurons que ces transferts sont effectués conformément aux lois applicables.',
        },
        {
            title: '10. Mineurs',
            content: 'MyHospital n\'est pas destiné aux personnes de moins de 18 ans. Si vous avez moins de 18 ans, vous devez obtenir le consentement de vos parents ou tuteurs légaux.',
        },
        {
            title: '11. Modifications de la politique',
            content: 'Nous pouvons modifier cette politique de confidentialité à tout moment. Nous vous informerons de tout changement important par notification dans l\'application.',
        },
        {
            title: '12. Contact',
            content: 'Pour toute question concernant cette politique de confidentialité ou vos données personnelles, contactez notre Délégué à la Protection des Données à : privacy@myhospital.com',
        },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => onNavigate('settings')}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    Politique de confidentialité
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {/* Last Updated */}
                    <View style={[styles.updateBox, { backgroundColor: colors.card }]}>
                        <Ionicons name="calendar-outline" size={20} color="#0077b6" />
                        <Text style={[styles.updateText, { color: colors.subText }]}>
                            Dernière mise à jour : 28 octobre 2025
                        </Text>
                    </View>

                    {/* Introduction */}
                    <Text style={[styles.introText, { color: colors.text }]}>
                        Chez MyHospital, nous prenons très au sérieux la protection de vos données personnelles et médicales. Cette politique explique comment nous collectons, utilisons et protégeons vos informations.
                    </Text>

                    {/* Important Notice */}
                    <View style={[styles.noticeBox, { backgroundColor: '#FFF9E6' }]}>
                        <Ionicons name="shield-checkmark" size={24} color="#FFA500" />
                        <View style={styles.noticeText}>
                            <Text style={[styles.noticeTitle, { color: colors.text }]}>
                                Vos données de santé sont protégées
                            </Text>
                            <Text style={[styles.noticeSubtitle, { color: colors.subText }]}>
                                Conformément aux réglementations internationales
                            </Text>
                        </View>
                    </View>

                    {/* Sections */}
                    {sections.map((section, index) => (
                        <View key={index} style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                {section.title}
                            </Text>
                            <Text style={[styles.sectionContent, { color: colors.subText }]}>
                                {section.content}
                            </Text>
                        </View>
                    ))}

                    {/* Contact */}
                    <View style={[styles.contactBox, { backgroundColor: '#e4f4fcff' }]}>
                        <Ionicons name="mail-outline" size={24} color="#0077b6" />
                        <View style={styles.contactText}>
                            <Text style={[styles.contactTitle, { color: colors.text }]}>
                                Questions sur vos données ?
                            </Text>
                            <Text style={[styles.contactSubtitle, { color: colors.subText }]}>
                                privacy@myhospital.com
                            </Text>
                        </View>
                    </View>

                    <View style={{ height: 40 }} />
                </View>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    updateBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
    },
    updateText: {
        marginLeft: 10,
        fontSize: 13,
        fontWeight: '500',
    },
    introText: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 20,
    },
    noticeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 15,
        marginBottom: 25,
    },
    noticeText: {
        marginLeft: 15,
        flex: 1,
    },
    noticeTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    noticeSubtitle: {
        fontSize: 12,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    sectionContent: {
        fontSize: 14,
        lineHeight: 22,
    },
    contactBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 15,
        marginTop: 10,
    },
    contactText: {
        marginLeft: 15,
        flex: 1,
    },
    contactTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    contactSubtitle: {
        fontSize: 13,
    },
});

export default PrivacyPolicyScreen;