import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  TextInput, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import evaluationService from '../services/evaluation.service';

interface EvaluationDocteurModalProps {
  visible: boolean;
  onClose: () => void;
  rendezVousId: number;
  docteurNom: string;
  docteurPrenom: string;
  onSuccess?: () => void;
}

const EvaluationDocteurModal = ({
  visible,
  onClose,
  rendezVousId,
  docteurNom,
  docteurPrenom,
  onSuccess,
}: EvaluationDocteurModalProps) => {
  const { colors, t } = useApp();
  const [note, setNote] = useState(0);
  const [hoveredNote, setHoveredNote] = useState(0);
  const [commentaire, setCommentaire] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (note === 0) {
      setError('Veuillez sélectionner une note');
      return;
    }
    setLoading(true);
    setError('');
    const result = await evaluationService.soumettreEvaluation({
      rendezVousId,
      note,
      commentaire: commentaire.trim() || undefined,
    });
    setLoading(false);
    if (result.success) {
      reset();
      onSuccess?.();
    } else {
      setError(result.message);
    }
  };

  const reset = () => {
    setNote(0);
    setHoveredNote(0);
    setCommentaire('');
    setError('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: colors.background }]}>
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <Ionicons name="close" size={24} color="#999" />
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            <Ionicons name="star" size={40} color="#FFC107" />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            Comment s'est passée votre consultation ?
          </Text>
          <Text style={[styles.doctorName, { color: colors.subText }]}>
            Dr. {docteurPrenom} {docteurNom}
          </Text>

          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity
                key={star}
                onPress={() => { setNote(star); setError(''); }}
                onPressIn={() => setHoveredNote(star)}
                onPressOut={() => setHoveredNote(0)}
              >
                <Ionicons
                  name={star <= (hoveredNote || note) ? 'star' : 'star-outline'}
                  size={44}
                  color={star <= (hoveredNote || note) ? '#FFB800' : '#D0D0D0'}
                />
              </TouchableOpacity>
            ))}
          </View>

          {note > 0 && (
            <Text style={styles.noteLabel}>
              {['', 'Très mauvais', 'Mauvais', 'Moyen', 'Bon', 'Excellent'][note]}
            </Text>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Ajouter un commentaire (optionnel)"
            placeholderTextColor={colors.subText}
            value={commentaire}
            onChangeText={setCommentaire}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.btnLater, { borderColor: colors.border }]}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={[styles.btnLaterText, { color: colors.subText }]}>Plus tard</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnSubmit, (note === 0 || loading) && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={note === 0 || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.btnSubmitText}>Envoyer</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    width: '100%',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF8E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  doctorName: {
    fontSize: 14,
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  noteLabel: {
    fontSize: 13,
    color: '#FFB800',
    fontWeight: '600',
    marginBottom: 16,
  },
  error: {
    color: '#FF6B6B',
    fontSize: 13,
    marginBottom: 8,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    marginBottom: 20,
    minHeight: 80,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btnLater: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnLaterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  btnSubmit: {
    flex: 1,
    backgroundColor: '#1a3fad',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnDisabled: {
    backgroundColor: '#B0B0B0',
  },
  btnSubmitText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default EvaluationDocteurModal;
