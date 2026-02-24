/**
 * 📱 useOnCallPharmacies.ts
 * 
 * Hook React Native à utiliser dans PharmacyScreen.tsx
 * Remplace les données statiques par les vraies pharmacies de garde.
 * 
 * Installation : npm install @react-native-async-storage/async-storage
 */

import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Config ────────────────────────────────────────────────────────────────────
const API_BASE_URL = __DEV__
  ? 'http://127.0.0.1:8000'      // ← Remplace X.X par ton IP locale (ex: 192.168.1.12)
  : 'https://ton-serveur.com';      // ← Remplace par ton URL de production

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  city: string;
  zone: string;
  phone: string;
  email: string;
  isOnDuty: boolean;
  isFavorite: boolean;
  distance: string | null;
  coordinates: {
    latitude: number | null;
    longitude: number | null;
  };
  openingHours: Array<{ day: string; open: string; close: string }> | null;
  insurances: string[];
  gardeFrom: string | null;
  gardeTo: string | null;
}

// ─── Hook principal ────────────────────────────────────────────────────────────
export function useOnCallPharmacies() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPharmacies = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      if (forceRefresh) {
        await fetch(`${API_BASE_URL}/api/pharmacies/on-call/refresh`);
      }

      const response = await fetch(`${API_BASE_URL}/api/pharmacies/on-call`);

      if (!response.ok) throw new Error(`Erreur serveur: ${response.status}`);

      const json = await response.json();
      if (!json.success) throw new Error(json.error || 'Erreur inconnue');

      // Fusionner avec les favoris sauvegardés localement
      const favorites = await loadFavorites();
      const withFavorites = json.data.map((p: Pharmacy) => ({
        ...p,
        isFavorite: favorites.includes(p.id),
        // Note: rating et reviewsCount ne viennent pas de l'API officielle
        // Tu peux les supprimer de ton UI ou utiliser une valeur par défaut
        rating: 0,
        reviewsCount: 0,
        image: null,
      }));

      setPharmacies(withFavorites);
    } catch (err: any) {
      console.error('Erreur fetch pharmacies:', err);
      setError(err.message || 'Connexion impossible');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPharmacies();
  }, [fetchPharmacies]);

  const toggleFavorite = useCallback(async (id: string) => {
    setPharmacies((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    );
    await saveFavoriteToggle(id);
  }, []);

  return {
    pharmacies,
    loading,
    error,
    refresh: () => fetchPharmacies(true),
    toggleFavorite,
  };
}

// ─── Gestion des favoris (stockés localement sur l'appareil) ──────────────────
const FAVORITES_KEY = '@pharmacies_favorites';

async function loadFavorites(): Promise<string[]> {
  try {
    const stored = await AsyncStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

async function saveFavoriteToggle(id: string): Promise<void> {
  const favorites = await loadFavorites();
  const newFavorites = favorites.includes(id)
    ? favorites.filter((fid) => fid !== id)
    : [...favorites, id];
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
}