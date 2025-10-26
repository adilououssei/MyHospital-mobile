import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppContextType {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    setTheme: (theme: 'light' | 'dark' | 'auto') => void;
    setLanguage: (language: string) => void;
    colors: {
        background: string;
        card: string;
        text: string;
        subText: string;
        primary: string;
        border: string;
        inputBackground: string;
    };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<'light' | 'dark' | 'auto'>('light');
    const [language, setLanguageState] = useState('fr');

    // Charger les préférences au démarrage
    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('app_theme');
            const savedLanguage = await AsyncStorage.getItem('app_language');

            if (savedTheme) {
                setThemeState(savedTheme as 'light' | 'dark' | 'auto');
            }
            if (savedLanguage) {
                setLanguageState(savedLanguage);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des préférences:', error);
        }
    };

    const setTheme = async (newTheme: 'light' | 'dark' | 'auto') => {
        try {
            await AsyncStorage.setItem('app_theme', newTheme);
            setThemeState(newTheme);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde du thème:', error);
        }
    };

    const setLanguage = async (newLanguage: string) => {
        try {
            await AsyncStorage.setItem('app_language', newLanguage);
            setLanguageState(newLanguage);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de la langue:', error);
        }
    };

    // Définir les couleurs en fonction du thème
    const colors = theme === 'dark' ? {
        background: '#121212',
        card: '#1E1E1E',
        text: '#FFFFFF',
        subText: '#B0B0B0',
        primary: '#0077b6',
        border: '#333333',
        inputBackground: '#2C2C2C',
    } : {
        background: '#F5F5F5',
        card: '#FFFFFF',
        text: '#000000',
        subText: '#666666',
        primary: '#0077b6',
        border: '#E0E0E0',
        inputBackground: '#F5F5F5',
    };

    return (
        <AppContext.Provider value={{ theme, language, setTheme, setLanguage, colors }}>
            {children}
        </AppContext.Provider>
    );
};