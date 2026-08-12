import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useApp } from '../context/AppContext';

interface BiometricLockScreenProps {
  onUnlock: () => void;
}

const BiometricLockScreen = ({ onUnlock }: BiometricLockScreenProps) => {
  const { colors } = useApp();
  const [error, setError] = useState(false);

  const authenticate = async () => {
    setError(false);
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Déverrouillez MyHospital',
    });
    if (result.success) {
      onUnlock();
    } else {
      setError(true);
    }
  };

  useEffect(() => { authenticate(); }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.iconBox}>
          <Ionicons name="finger-print" size={64} color="#1a56db" />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Application verrouillée</Text>
        <Text style={[styles.subtitle, { color: colors.subText }]}>
          {error ? "Authentification échouée. Réessayez." : 'Authentifiez-vous pour continuer'}
        </Text>
        <TouchableOpacity style={styles.button} onPress={authenticate}>
          <Text style={styles.buttonText}>Déverrouiller</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  iconBox: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#eff6ff',
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 30 },
  button: { backgroundColor: '#1a56db', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 14 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

export default BiometricLockScreen;
