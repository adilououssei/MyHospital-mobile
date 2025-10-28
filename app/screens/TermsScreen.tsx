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

interface TermsScreenProps {
    onNavigate: (screen: string) => void;
}

const TermsScreen = ({ onNavigate }: TermsScreenProps) => {
    const { colors } = useApp();

    const sections = [
        {
            title: '1. Acceptation des conditions',
            content: 'En accédant et en utilisant MyHospital, vous acceptez d\'être lié par ces conditions d\'utilisation. Si vous n\'acceptez pas ces conditions, veuillez ne pas utiliser l\'application.',
        },
        {
            title: '2. Services proposés',
            content: 'MyHospital est une plateforme de santé numérique qui permet aux utilisateurs de : \n\n• Trouver des professionnels de santé\n• Prendre des rendez-vous médicaux\n• Accéder à des informations de santé\n• Contacter les services d\'urgence\n• Gérer leur dossier médical personnel',
        },
        {
            title: '3. Compte utilisateur',
            content: 'Vous êtes responsable de maintenir la confidentialité de votre compte et de votre mot de passe. Vous acceptez de nous informer immédiatement de toute utilisation non autorisée de votre compte.',
        },
        {
            title: '4. Utilisation appropriée',
            content: 'Vous acceptez d\'utiliser MyHospital uniquement à des fins légales et de manière à ne pas porter atteinte aux droits d\'autrui ou limiter leur utilisation de l\'application.',
        },
        {
            title: '5. Informations médicales',
            content: 'MyHospital fournit des informations générales de santé à des fins éducatives uniquement. Ces informations ne doivent pas remplacer les conseils d\'un professionnel de santé qualifié.',
        },
        {
            title: '6. Protection des données',
            content: 'Vos données personnelles et médicales sont protégées conformément à notre Politique de confidentialité. Nous nous engageons à protéger la confidentialité de vos informations de santé.',
        },
        {
            title: '7. Paiements et remboursements',
            content: 'Les paiements pour les consultations sont traités de manière sécurisée. Les politiques de remboursement varient selon les professionnels de santé.',
        },
        {
            title: '8. Limitation de responsabilité',
            content: 'MyHospital ne peut être tenu responsable des dommages directs, indirects, accessoires ou consécutifs résultant de l\'utilisation ou de l\'impossibilité d\'utiliser l\'application.',
        },
        {
            title: '9. Services d\'urgence',
            content: 'En cas d\'urgence médicale grave, appelez immédiatement les services d\'urgence locaux. MyHospital ne remplace pas les services d\'urgence traditionnels.',
        },
        {
            title: '10. Modifications des conditions',
            content: 'Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications entreront en vigueur dès leur publication dans l\'application.',
        },
        {
            title: '11. Propriété intellectuelle',
            content: 'Tous les contenus, logos, marques et autres éléments de MyHospital sont protégés par les lois sur la propriété intellectuelle.',
        },
        {
            title: '12. Résiliation',
            content: 'Nous nous réservons le droit de suspendre ou de résilier votre accès à MyHospital à tout moment, sans préavis, en cas de violation de ces conditions.',
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
                    Conditions d'utilisation
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
                        Bienvenue sur MyHospital. Veuillez lire attentivement ces conditions d'utilisation avant d'utiliser nos services.
                    </Text>

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
                                Questions ?
                            </Text>
                            <Text style={[styles.contactSubtitle, { color: colors.subText }]}>
                                Contactez-nous à support@myhospital.com
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
        marginBottom: 25,
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

export default TermsScreen;