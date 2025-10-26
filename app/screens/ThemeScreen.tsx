import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

interface ThemeOption {
    id: string;
    name: string;
    description: string;
    icon: string;
}

interface ThemeScreenProps {
    onNavigate: (screen: string) => void;
}

const ThemeScreen = ({ onNavigate }: ThemeScreenProps) => {
    const { theme, setTheme, colors } = useApp();
    const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'auto'>(theme);
    const [autoBrightness, setAutoBrightness] = useState(false);

    useEffect(() => {
        setSelectedTheme(theme);
    }, [theme]);

    const themeOptions: ThemeOption[] = [
        {
            id: 'light',
            name: 'Mode clair',
            description: 'Interface lumineuse et claire',
            icon: 'sunny',
        },
        {
            id: 'dark',
            name: 'Mode sombre',
            description: 'Interface sombre pour réduire la fatigue oculaire',
            icon: 'moon',
        },
        {
            id: 'auto',
            name: 'Automatique',
            description: 'S\'adapte aux paramètres du système',
            icon: 'phone-portrait',
        },
    ];

    const handleSelectTheme = (newTheme: 'light' | 'dark' | 'auto') => {
        setSelectedTheme(newTheme);
    };

    const handleSave = async () => {
        await setTheme(selectedTheme);
        Alert.alert(
            'Succès',
            'Le thème a été modifié avec succès',
            [{ text: 'OK', onPress: () => onNavigate('profile') }]
        );
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
                <Text style={[styles.headerTitle, { color: colors.text }]}>Apparence</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {/* Preview */}
                    <View style={styles.previewSection}>
                        <Text style={[styles.sectionTitle, { color: colors.subText }]}>Aperçu</Text>
                        <View style={[styles.previewCard, { backgroundColor: colors.card }]}>
                            <View style={styles.previewHeader}>
                                <Ionicons name="medical" size={30} color="#0077b6" />
                                <Text style={[styles.previewText, { color: colors.text }]}>MyHospital</Text>
                            </View>
                            <View style={styles.previewContent}>
                                <View style={[styles.previewItem, { backgroundColor: colors.inputBackground }]} />
                                <View style={[styles.previewItem, { backgroundColor: colors.inputBackground }]} />
                            </View>
                        </View>
                    </View>

                    {/* Theme Options */}
                    <Text style={[styles.sectionTitle, { color: colors.subText }]}>Choisir le thème</Text>

                    {themeOptions.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            style={[
                                styles.themeCard,
                                {
                                    backgroundColor: colors.card,
                                    borderColor: selectedTheme === option.id ? '#0077b6' : 'transparent'
                                },
                                selectedTheme === option.id && styles.themeCardActive,
                            ]}
                            onPress={() => handleSelectTheme(option.id as any)}
                        >
                            <View style={styles.themeLeft}>
                                <View
                                    style={[
                                        styles.themeIconContainer,
                                        { backgroundColor: selectedTheme === option.id ? '#0077b6' : '#e4f4fcff' },
                                    ]}
                                >
                                    <Ionicons
                                        name={option.icon as any}
                                        size={24}
                                        color={selectedTheme === option.id ? '#fff' : '#0077b6'}
                                    />
                                </View>
                                <View>
                                    <Text style={[styles.themeName, { color: colors.text }]}>{option.name}</Text>
                                    <Text style={[styles.themeDescription, { color: colors.subText }]}>{option.description}</Text>
                                </View>
                            </View>

                            {selectedTheme === option.id ? (
                                <Ionicons name="radio-button-on" size={24} color="#0077b6" />
                            ) : (
                                <Ionicons name="radio-button-off" size={24} color="#ccc" />
                            )}
                        </TouchableOpacity>
                    ))}

                    {/* Additional Settings */}
                    <View style={styles.settingsSection}>
                        <Text style={[styles.sectionTitle, { color: colors.subText }]}>Paramètres supplémentaires</Text>

                        <View style={[styles.settingCard, { backgroundColor: colors.card }]}>
                            <View style={styles.settingLeft}>
                                <Ionicons name="contrast" size={24} color="#0077b6" />
                                <View style={styles.settingInfo}>
                                    <Text style={[styles.settingName, { color: colors.text }]}>Luminosité automatique</Text>
                                    <Text style={[styles.settingDescription, { color: colors.subText }]}>
                                        Ajuster selon l'heure de la journée
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={autoBrightness}
                                onValueChange={setAutoBrightness}
                                trackColor={{ false: '#E0E0E0', true: '#0077b6' }}
                                thumbColor="#fff"
                            />
                        </View>

                        <View style={styles.infoCard}>
                            <Ionicons name="information-circle" size={20} color="#0077b6" />
                            <Text style={[styles.infoText, { color: colors.subText }]}>
                                Le mode sombre peut aider à réduire la fatigue oculaire dans des
                                environnements sombres et économiser la batterie.
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Save Button */}
            <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                >
                    <Text style={styles.saveButtonText}>Enregistrer</Text>
                </TouchableOpacity>
            </View>
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
    previewSection: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 15,
    },
    previewCard: {
        borderRadius: 15,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    previewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    previewText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    previewContent: {
        gap: 10,
    },
    previewItem: {
        height: 40,
        borderRadius: 8,
    },
    themeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
    },
    themeCardActive: {
        backgroundColor: '#e4f4fcff',
    },
    themeLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        flex: 1,
    },
    themeIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    themeName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    themeDescription: {
        fontSize: 13,
    },
    settingsSection: {
        marginTop: 20,
    },
    settingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 12,
        padding: 16,
        marginBottom: 15,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        flex: 1,
    },
    settingInfo: {
        flex: 1,
    },
    settingName: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    settingDescription: {
        fontSize: 13,
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#E3F2FD',
        borderRadius: 12,
        padding: 15,
        gap: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 20,
    },
    footer: {
        padding: 20,
        paddingBottom: 30,
        borderTopWidth: 1,
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

export default ThemeScreen;