// app/components/DoctorsDirectoryScreen.tsx - Version corrigée (sans prix)

import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useApp } from '../context/AppContext';
import ScreenHeader from '../tabs/ScreenHeader';
import docteurService, { Docteur } from '../services/docteur.service';
import { API_BASE_URL } from '../services/api.config';

interface DoctorsDirectoryScreenProps {
    onNavigate: (screen: string, params?: any) => void;
}

const DoctorsDirectoryScreen = ({ onNavigate }: DoctorsDirectoryScreenProps) => {
    const { colors, t } = useApp();
    const [searchQuery, setSearchQuery] = useState('');
    const [doctors, setDoctors] = useState<Docteur[]>([]);
    const [filteredDoctors, setFilteredDoctors] = useState<Docteur[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
    const [specialties, setSpecialties] = useState<string[]>([]);

    useEffect(() => { loadDoctors(); }, []);

    useEffect(() => {
        filterDoctors();
    }, [searchQuery, selectedSpecialty, doctors]);

    const loadDoctors = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await docteurService.getDocteurs();
            setDoctors(data);

            // Extraire les spécialités uniques
            const uniqueSpecialties = new Set<string>();
            data.forEach(doctor => {
                const specialty = docteurService.getSpecialite(doctor);
                if (specialty && specialty !== 'Médecin généraliste') {
                    uniqueSpecialties.add(specialty);
                }
            });
            setSpecialties(Array.from(uniqueSpecialties).sort());
        } catch (err: any) {
            setError(t('dlCannotLoad'));
        } finally {
            setLoading(false);
        }
    };

    const filterDoctors = () => {
        let filtered = [...doctors];

        // Filtre par recherche
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(doctor =>
                doctor.nomComplet.toLowerCase().includes(query) ||
                docteurService.getSpecialite(doctor).toLowerCase().includes(query) ||
                (doctor.ville && doctor.ville.toLowerCase().includes(query))
            );
        }

        // Filtre par spécialité
        if (selectedSpecialty) {
            filtered = filtered.filter(doctor =>
                docteurService.getSpecialite(doctor) === selectedSpecialty
            );
        }

        setFilteredDoctors(filtered);
    };

    // Dans DoctorsDirectoryScreen.tsx, la fonction handleDoctorPress doit être :

    // Dans handleDoctorPress
const handleDoctorPress = (doctor: Docteur) => {
    onNavigate('doctorProfile', {  // ← Changé vers doctorProfile
      doctor: {
        id: doctor.id,
        name: doctor.nomComplet,
        specialty: docteurService.getSpecialite(doctor),
        rating: doctor.note,
        ville: doctor.ville,
        photo: doctor.photo,
        telephone: doctor.telephone,
        email: doctor.email,
        adresse: doctor.adresse,
        tarifs: doctor.tarifs,
      },
    });
  };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScreenHeader title="Annuaire des Médecins" onBack={() => onNavigate('home')} />

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.content}>

                    {/* Barre de recherche */}
                    <View style={[styles.searchBar, { backgroundColor: colors.inputBackground, borderColor: colors.subText }]}>
                        <Ionicons name="search-outline" size={20} color={colors.subText} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder="Rechercher un médecin..."
                            placeholderTextColor={colors.subText}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={20} color={colors.subText} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Filtres par spécialité */}
                    {specialties.length > 0 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specialtiesScroll}>
                            <TouchableOpacity
                                style={[styles.specialtyChip, !selectedSpecialty && styles.specialtyChipActive]}
                                onPress={() => setSelectedSpecialty(null)}
                            >
                                <Text style={[styles.specialtyChipText, !selectedSpecialty && styles.specialtyChipTextActive]}>
                                    Tous
                                </Text>
                            </TouchableOpacity>
                            {specialties.map(spec => (
                                <TouchableOpacity
                                    key={spec}
                                    style={[styles.specialtyChip, selectedSpecialty === spec && styles.specialtyChipActive]}
                                    onPress={() => setSelectedSpecialty(selectedSpecialty === spec ? null : spec)}
                                >
                                    <Text style={[styles.specialtyChipText, selectedSpecialty === spec && styles.specialtyChipTextActive]}>
                                        {spec}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}

                    {/* Liste des docteurs - SANS PRIX */}
                    {loading ? (
                        <View style={styles.centerContainer}>
                            <ActivityIndicator size="large" color="#0077b6" />
                            <Text style={[styles.centerText, { color: colors.subText }]}>Chargement des médecins...</Text>
                        </View>
                    ) : error ? (
                        <View style={styles.centerContainer}>
                            <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
                            <Text style={[styles.centerText, { color: colors.text }]}>{error}</Text>
                            <TouchableOpacity onPress={loadDoctors} style={styles.retryButton}>
                                <Text style={styles.retryButtonText}>Réessayer</Text>
                            </TouchableOpacity>
                        </View>
                    ) : filteredDoctors.length === 0 ? (
                        <View style={styles.centerContainer}>
                            <FontAwesome5 name="user-md" size={64} color={colors.subText} />
                            <Text style={[styles.emptyText, { color: colors.text }]}>Aucun médecin trouvé</Text>
                            <Text style={[styles.centerText, { color: colors.subText }]}>
                                {searchQuery ? 'Essayez une autre recherche' : 'Aucun médecin disponible pour le moment'}
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.doctorsList}>
                            {filteredDoctors.map(doctor => {
                                const photoUrl = doctor.photo ? `${API_BASE_URL}${doctor.photo}` : null;
                                const specialty = docteurService.getSpecialite(doctor);

                                return (
                                    <TouchableOpacity
                                        key={doctor.id}
                                        style={[styles.doctorCard, { backgroundColor: colors.card }]}
                                        onPress={() => handleDoctorPress(doctor)}
                                    >
                                        {photoUrl
                                            ? <Image source={{ uri: photoUrl }} style={styles.doctorImage} />
                                            : <View style={styles.doctorImagePlaceholder}>
                                                <FontAwesome5 name="user-md" size={40} color="#0077b6" />
                                            </View>
                                        }
                                        <View style={styles.doctorInfo}>
                                            <Text style={[styles.doctorName, { color: colors.text }]}>{doctor.nomComplet}</Text>
                                            <Text style={[styles.doctorSpecialty, { color: colors.subText }]}>{specialty}</Text>
                                            <View style={styles.doctorMeta}>
                                                <View style={styles.ratingContainer}>
                                                    <Ionicons name="star" size={14} color="#FFA500" />
                                                    <Text style={[styles.rating, { color: colors.text }]}>{doctor.note.toFixed(1)}</Text>
                                                </View>
                                                {doctor.ville && (
                                                    <View style={styles.locationContainer}>
                                                        <Ionicons name="location-outline" size={12} color={colors.subText} />
                                                        <Text style={[styles.location, { color: colors.subText }]}>{doctor.ville}</Text>
                                                    </View>
                                                )}
                                            </View>
                                            {/* Prix SUPPRIMÉ ici */}
                                        </View>
                                        <Ionicons name="chevron-forward" size={24} color={colors.subText} />
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },

    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginBottom: 15,
        borderWidth: 1,
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 14 },

    specialtiesScroll: { flexDirection: 'row', marginBottom: 20 },
    specialtyChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        marginRight: 10,
    },
    specialtyChipActive: { backgroundColor: '#0077b6' },
    specialtyChipText: { fontSize: 13, color: '#666' },
    specialtyChipTextActive: { color: '#fff' },

    centerContainer: { padding: 40, alignItems: 'center' },
    centerText: { fontSize: 14, textAlign: 'center', marginTop: 12 },
    emptyText: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 8 },
    retryButton: { marginTop: 16, backgroundColor: '#0077b6', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 },
    retryButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },

    doctorsList: { gap: 12, paddingBottom: 50 },
    doctorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 15,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    doctorImage: { width: 70, height: 70, borderRadius: 35, marginRight: 15 },
    doctorImagePlaceholder: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    doctorInfo: { flex: 1 },
    doctorName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    doctorSpecialty: { fontSize: 13, marginBottom: 6 },
    doctorMeta: { flexDirection: 'row', gap: 12, marginBottom: 4 },
    ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    rating: { fontSize: 12, fontWeight: '600' },
    locationContainer: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    location: { fontSize: 11 },
    // style price supprimé
});

export default DoctorsDirectoryScreen;