// app/components/EmergencyScreen.tsx

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useApp } from '../context/AppContext';
import ScreenHeader from '../tabs/ScreenHeader';

interface EmergencyScreenProps {
  onNavigate: (screen: string) => void;
}

const PHONE = '170';

const EmergencyScreen = ({ onNavigate }: EmergencyScreenProps) => {
  const { colors, t } = useApp();
  const pulseAnim   = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim,   { toValue: 1.1, duration: 800, useNativeDriver: true }),
      Animated.timing(pulseAnim,   { toValue: 1,   duration: 800, useNativeDriver: true }),
    ]));
    const blink = Animated.loop(Animated.sequence([
      Animated.timing(opacityAnim, { toValue: 0.6, duration: 500, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1,   duration: 500, useNativeDriver: true }),
    ]));
    pulse.start(); blink.start();
    return () => { pulse.stop(); blink.stop(); };
  }, []);

  const handleEmergencyCall = () => {
    Alert.alert(t('emCallTitle'), `${t('emCallMsg')} ${PHONE} ?`, [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('emCallAction'),
        onPress: () => {
          Linking.openURL(`tel:${PHONE}`).catch(err => {
            Alert.alert(t('error'), t('emCallError'));
          });
        },
      },
    ]);
  };

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.container, { backgroundColor: '#f0f4f8' }]}>
      <ScreenHeader title={t('emTitle')} onBack={() => onNavigate('home')} />

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <FontAwesome5 name="ambulance" size={80} color="#FF3B30" />
        </View>

        <Text style={[styles.title, { color: '#111827' }]}>{t('emMedTitle')}</Text>
        <Text style={[styles.description, { color: '#6b7280' }]}>{t('emDesc')}</Text>

        <Animated.View style={{ transform: [{ scale: pulseAnim }], opacity: opacityAnim }}>
          <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyCall} activeOpacity={0.8}>
            <FontAwesome5 name="phone-alt" size={28} color="#fff" />
            <Text style={styles.emergencyButtonText}>{t('emCallBtn')}</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.infoContainer}>
          <Ionicons name="information-circle-outline" size={24} color="#1a56db" />
          <Text style={[styles.infoText, { color: '#6b7280' }]}>{t('em24h')}</Text>
        </View>

        <View style={styles.warningContainer}>
          <Ionicons name="warning-outline" size={20} color="#FFC107" />
          <Text style={[styles.warningText, { color: '#6b7280' }]}>{t('emWarning')}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  iconContainer: { width: 160, height: 160, backgroundColor: '#eff6ff', borderRadius: 80, justifyContent: 'center', alignItems: 'center', marginBottom: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  description: { fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 40 },
  emergencyButton: { backgroundColor: '#FF3B30', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20, paddingHorizontal: 40, borderRadius: 50, width: 320, shadowColor: '#FF3B30', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8, marginBottom: 30 },
  emergencyButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginLeft: 15 },
  infoContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, marginBottom: 15, width: '100%', maxWidth: 320, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  infoText: { fontSize: 14, marginLeft: 10, flex: 1 },
  warningContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, width: '100%', maxWidth: 320, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  warningText: { fontSize: 13, marginLeft: 10, flex: 1 },
});

export default EmergencyScreen;
