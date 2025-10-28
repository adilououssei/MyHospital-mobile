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
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useApp } from '../context/AppContext';

interface HealthInfoScreenProps {
    onNavigate: (screen: string) => void;
}

const HealthInfoScreen = ({ onNavigate }: HealthInfoScreenProps) => {
    const { colors } = useApp();

    const healthTopics = [
        {
            id: '1',
            icon: 'shield-checkmark',
            iconLib: 'Ionicons',
            title: 'Vaccination',
            description: 'Calendrier vaccinal et rappels importants',
            color: '#4CAF50',
        },
        {
            id: '2',
            icon: 'heart-pulse',
            iconLib: 'MaterialCommunityIcons',
            title: 'Prévention',
            description: 'Conseils pour prévenir les maladies',
            color: '#FF6B6B',
        },
        {
            id: '3',
            icon: 'nutrition',
            iconLib: 'MaterialCommunityIcons',
            title: 'Nutrition',
            description: 'Guide alimentaire pour toute la famille',
            color: '#FFC107',
        },
        {
            id: '4',
            icon: 'baby',
            iconLib: 'Ionicons',
            title: 'Pédiatrie',
            description: 'Suivi de santé pour vos enfants',
            color: '#9C27B0',
        },
        {
            id: '5',
            icon: 'fitness',
            iconLib: 'Ionicons',
            title: 'Activité Physique',
            description: 'Exercices et recommandations',
            color: '#2196F3',
        },
        {
            id: '6',
            icon: 'water',
            iconLib: 'Ionicons',
            title: 'Hydratation',
            description: 'Importance de boire suffisamment d\'eau',
            color: '#00BCD4',
        },
    ];

    const quickTips = [
        {
            id: '1',
            title: 'Lavez-vous les mains régulièrement',
            tip: 'Pendant au moins 20 secondes avec du savon',
        },
        {
            id: '2',
            title: 'Dormez suffisamment',
            tip: '7-9 heures pour les adultes, plus pour les enfants',
        },
        {
            id: '3',
            title: 'Mangez équilibré',
            tip: '5 fruits et légumes par jour minimum',
        },
        {
            id: '4',
            title: 'Restez actif',
            tip: 'Au moins 30 minutes d\'activité physique par jour',
        },
    ];

    const renderIcon = (iconLib: string, iconName: string, size: number, color: string) => {
        if (iconLib === 'Ionicons') {
            return <Ionicons name={iconName as any} size={size} color={color} />;
        } else if (iconLib === 'MaterialCommunityIcons') {
            return <MaterialCommunityIcons name={iconName as any} size={size} color={color} />;
        }
        return null;
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => onNavigate('home')}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    Santé & Prévention
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <View style={[styles.heroSection, { backgroundColor: colors.card }]}>
                    <View style={styles.heroIconContainer}>
                        <FontAwesome5 name="hand-holding-heart" size={50} color="#0077b6" />
                    </View>
                    <Text style={[styles.heroTitle, { color: colors.text }]}>
                        Protection précoce pour votre famille
                    </Text>
                    <Text style={[styles.heroDescription, { color: colors.subText }]}>
                        Découvrez nos conseils et guides pour maintenir votre famille en bonne santé
                    </Text>
                </View>

                {/* Health Topics Grid */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Thèmes de santé
                    </Text>
                    <View style={styles.topicsGrid}>
                        {healthTopics.map((topic) => (
                            <TouchableOpacity
                                key={topic.id}
                                style={[styles.topicCard, { backgroundColor: colors.card }]}
                            >
                                <View style={[styles.topicIconContainer, { backgroundColor: topic.color + '20' }]}>
                                    {renderIcon(topic.iconLib, topic.icon, 32, topic.color)}
                                </View>
                                <Text style={[styles.topicTitle, { color: colors.text }]}>
                                    {topic.title}
                                </Text>
                                <Text style={[styles.topicDescription, { color: colors.subText }]}>
                                    {topic.description}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Quick Tips */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Conseils rapides
                    </Text>
                    {quickTips.map((item) => (
                        <View
                            key={item.id}
                            style={[styles.tipCard, { backgroundColor: colors.card }]}
                        >
                            <View style={styles.tipIconContainer}>
                                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                            </View>
                            <View style={styles.tipContent}>
                                <Text style={[styles.tipTitle, { color: colors.text }]}>
                                    {item.title}
                                </Text>
                                <Text style={[styles.tipText, { color: colors.subText }]}>
                                    {item.tip}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Emergency Contact */}
                <View style={[styles.emergencySection, { backgroundColor: '#FFE5E5' }]}>
                    <View style={styles.emergencyContent}>
                        <FontAwesome5 name="ambulance" size={40} color="#FF3B30" />
                        <View style={styles.emergencyTextContainer}>
                            <Text style={styles.emergencyTitle}>Urgence médicale ?</Text>
                            <Text style={styles.emergencyDescription}>
                                Contactez immédiatement les services d'urgence
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.emergencyButton}
                        onPress={() => onNavigate('emergency')}
                    >
                        <Text style={styles.emergencyButtonText}>Appeler</Text>
                        <Ionicons name="call" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Bottom Spacing */}
                <View style={{ height: 40 }} />
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
        fontSize: 20,
        fontWeight: 'bold',
    },
    heroSection: {
        marginHorizontal: 20,
        marginTop: 10,
        marginBottom: 25,
        padding: 25,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    heroIconContainer: {
        width: 100,
        height: 100,
        backgroundColor: '#e4f4fcff',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    heroDescription: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    topicsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    topicCard: {
        width: '48%',
        padding: 15,
        borderRadius: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    topicIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    topicTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 5,
    },
    topicDescription: {
        fontSize: 12,
        lineHeight: 16,
    },
    tipCard: {
        flexDirection: 'row',
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    tipIconContainer: {
        marginRight: 12,
    },
    tipContent: {
        flex: 1,
    },
    tipTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    tipText: {
        fontSize: 13,
        lineHeight: 18,
    },
    emergencySection: {
        marginHorizontal: 20,
        padding: 20,
        borderRadius: 15,
        marginBottom: 20,
    },
    emergencyContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    emergencyTextContainer: {
        flex: 1,
        marginLeft: 15,
    },
    emergencyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF3B30',
        marginBottom: 4,
    },
    emergencyDescription: {
        fontSize: 13,
        color: '#666',
    },
    emergencyButton: {
        backgroundColor: '#FF3B30',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 10,
        gap: 8,
    },
    emergencyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default HealthInfoScreen;