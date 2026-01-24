// app/context/AppContext.tsx

import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
}

interface Colors {
  background: string;
  text: string;
  subText: string;
  card: string;
  inputBackground: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

interface AppContextType {
  colors: Colors;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AppContext = createContext<AppContextType | undefined>(undefined);

const lightColors: Colors = {
  background: '#ffffff',
  text: '#000000',
  subText: '#666666',
  card: '#f5f5f5',
  inputBackground: '#f0f0f0',
};

const darkColors: Colors = {
  background: '#1a1a1a',
  text: '#ffffff',
  subText: '#b0b0b0',
  card: '#2a2a2a',
  inputBackground: '#333333',
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const login = async (userData: User) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'utilisateur:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const authValue = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
  };

  const appValue = {
    colors: isDarkMode ? darkColors : lightColors,
    isDarkMode,
    toggleTheme,
  };

  return (
    <AuthContext.Provider value={authValue}>
      <AppContext.Provider value={appValue}>
        {children}
      </AppContext.Provider>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AppProvider');
  }
  return context;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};