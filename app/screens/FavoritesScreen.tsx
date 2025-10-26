import React, { useState } from 'react';
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

interface FavoriteItem {
    id: string;
    type: 'pharmacy' | 'hospital';
    name: string;
    address: string;
    city: string;
    distance: string;
    phone: string;
    specialties?: string[];
}

interface FavoritesScreenProps {
    onNavigate: (screen: string) => void;
}

const FavoritesScreen = ({ onNavigate }: FavoritesScreenProps) => {
    const { colors } = useApp();
    const [activeTab, setActiveTab] = useState<'all' | 'pharmacy' | 'hospital'>('all');
    const [favorites, setFavorites] = useState<FavoriteItem[]>([
        {
            id: '1',
            type: 'pharmacy',
            name: 'Pharmacie Centrale',
            address: '12 Rue de la Liberté',
            city: '75001 Paris',
            distance: '1.2 km',
            phone: '01 42 36 78 90',
        },
        {
            id: '2',
            type: 'pharmacy',
            name: 'Pharmacie du Soleil',
            address: '45 Avenue du Général Leclerc',
            city: '75014 Paris',
            distance: '2.5 km',
            phone: '01 43 27 89 12',
        },
        {
            id: '3',
            type: 'hospital',
            name: 'Hôpital Saint-Louis',
            address: '1 Avenue Claude Vellefaux',
            city: '75010 Paris',
            distance: '1.5 km',
            phone: '01 42 49 49 49',
            specialties: ['Urgences', 'Cardiologie', 'Pédiatrie'],
        },
        {
            id: '4',
            type: 'hospital',
            name: 'Hôpital Necker',
            address: '149 Rue de Sèvres',
            city: '75015 Paris',
            distance: '2.8 km',
            phone: '01 44 49 40 00',
            specialties: ['Pédiatrie', 'Chirurgie', 'Maternité'],
        },
    ]);

    const removeFavorite = (id: string) => {
        setFavorites(favorites.filter((item) => item.id !== id));
    };

    const filteredFavorites = favorites.filter((item) => {
        if (activeTab === 'all') return true;
        return item.type === activeTab;
    });

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
                <Text style={[styles.headerTitle, { color: colors.text }]}>Mes Favoris</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Tabs */}
            <View style={[styles.tabsContainer, { backgroundColor: colors.card }]}>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        { backgroundColor: colors.inputBackground },
                        activeTab === 'all' && styles.activeTab
                    ]}
                    onPress={() => setActiveTab('all')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            { color: colors.subText },
                            activeTab === 'all' && styles.activeTabText,
                        ]}
                    >
                        Tous ({favorites.length})
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tab,
                        { backgroundColor: colors.inputBackground },
                        activeTab === 'pharmacy' && styles.activeTab
                    ]}
                    onPress={() => setActiveTab('pharmacy')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            { color: colors.subText },
                            activeTab === 'pharmacy' && styles.activeTabText,
                        ]}
                    >
                        Pharmacies ({favorites.filter((f) => f.type === 'pharmacy').length})
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tab,
                        { backgroundColor: colors.inputBackground },
                        activeTab === 'hospital' && styles.activeTab
                    ]}
                    onPress={() => setActiveTab('hospital')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            { color: colors.subText },
                            activeTab === 'hospital' && styles.activeTabText,
                        ]}
                    >
                        Hôpitaux ({favorites.filter((f) => f.type === 'hospital').length})
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {filteredFavorites.length > 0 ? (
                        filteredFavorites.map((item) => (
                            <View key={item.id} style={[styles.favoriteCard, { backgroundColor: colors.card }]}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons
                                            name={item.type === 'pharmacy' ? 'medical' : 'business'}
                                            size={28}
                                            color="#0077b6"
                                        />
                                    </View>
                                    <TouchableOpacity
                                        style={styles.favoriteButton}
                                        onPress={() => removeFavorite(item.id)}
                                    >
                                        <Ionicons name="heart" size={24} color="#FF6B6B" />
                                    </TouchableOpacity>
                                </View>

                                <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                                <Text style={[styles.itemAddress, { color: colors.subText }]}>
                                    {item.address}, {item.city}
                                </Text>

                                <View style={styles.infoRow}>
                                    <View style={styles.infoItem}>
                                        <Ionicons name="location-outline" size={16} color={colors.subText} />
                                        <Text style={[styles.infoText, { color: colors.subText }]}>{item.distance}</Text>
                                    </View>
                                    <View style={styles.infoItem}>
                                        <Ionicons name="call-outline" size={16} color={colors.subText} />
                                        <Text style={[styles.infoText, { color: colors.subText }]}>{item.phone}</Text>
                                    </View>
                                </View>

                                {item.specialties && (
                                    <View style={styles.specialtiesContainer}>
                                        {item.specialties.map((specialty, index) => (
                                            <View key={index} style={[styles.specialtyChip, {
                                                backgroundColor: colors.inputBackground,
                                                borderColor: colors.border
                                            }]}>
                                                <Text style={[styles.specialtyText, { color: colors.subText }]}>{specialty}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                <View style={styles.cardActions}>
                                    <TouchableOpacity style={styles.actionButton}>
                                        <Ionicons name="navigate" size={18} color="#fff" />
                                        <Text style={styles.actionButtonText}>Itinéraire</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.callButton}>
                                        <Ionicons name="call" size={18} color="#0077b6" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="heart-outline" size={80} color="#ccc" />
                            <Text style={[styles.emptyText, { color: colors.subText }]}>Aucun favori</Text>
                            <Text style={styles.emptySubtext}>
                                Ajoutez des pharmacies ou hôpitaux à vos favoris
                            </Text>
                        </View>
                    )}
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
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 15,
        gap: 8,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 20,
        alignItems: 'center',
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
        fontWeight: '600',
    },
    content: {
        padding: 20,
    },
    favoriteCard: {
        borderRadius: 15,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#e4f4fcff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    favoriteButton: {
        padding: 5,
    },
    itemName: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 6,
    },
    itemAddress: {
        fontSize: 14,
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 12,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    infoText: {
        fontSize: 13,
    },
    specialtiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 15,
    },
    specialtyChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
    },
    specialtyText: {
        fontSize: 12,
        fontWeight: '500',
    },
    cardActions: {
        flexDirection: 'row',
        gap: 10,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#0077b6',
        paddingVertical: 12,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    callButton: {
        width: 50,
        height: 44,
        borderRadius: 20,
        backgroundColor: '#e4f4fcff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 20,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#ccc',
        textAlign: 'center',
    },
});

export default FavoritesScreen;