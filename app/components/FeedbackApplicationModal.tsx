import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  TextInput, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import evaluationService from '../services/evaluation.service';

interface FeedbackApplicationModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const FeedbackApplicationModal = ({
  visible,
  onClose,
  onSuccess,
}: FeedbackApplicationModalProps) => {
  const { colors, t } = useApp();
  const [step, setStep] = useState<'satisfaction' | 'detail' | 'done'>('satisfaction');
  const [satisfaction, setSatisfaction] = useState<'oui' | 'moyen' | 'non' | null>(null);
  const [note, setNote] = useState(0);
  const [hoveredNote, setHoveredNote] = useState(0);
  const [commentaire, setCommentaire] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setStep('satisfaction');
    setSatisfaction(null);
    setNote(0);
    setHoveredNote(0);
    setCommentaire('');
    setSuggestion('');
    setError('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSatisfactionChoice = (choice: 'oui' | 'moyen' | 'non') => {
    setSatisfaction(choice);
    setStep('detail');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    const data: any = {};
    if (satisfaction === 'oui') {
      if (note === 0) {
        setError('Veuillez sélectionner une note');
        setLoading(false);
        return;
      }
      data.note = note;
      data.commentaire = commentaire.trim() || undefined;
    } else {
      data.commentaire = commentaire.trim() || undefined;
      data.suggestionAmelioration = suggestion.trim() || undefined;
    }

    const result = await evaluationService.soumettreFeedbackApp(data);
    setLoading(false);

    if (result.success) {
      setStep('done');
    } else {
      setError(result.message);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: colors.background }]}>
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <Ionicons name="close" size={24} color="#999" />
          </TouchableOpacity>

          {step === 'satisfaction' && (
            <>
              <View style={styles.iconContainer}>
                <Ionicons name="heart" size={36} color="#FF6B6B" />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>
                Êtes-vous satisfait de votre expérience sur MyHospital ?
              </Text>

              <View style={styles.choiceButtons}>
                {[
                  { value: 'oui' as const, label: 'Oui', icon: 'happy-outline', color: '#4CAF50' },
                  { value: 'moyen' as const, label: 'Moyen', icon: 'remove-outline', color: '#FF9800' },
                  { value: 'non' as const, label: 'Non', icon: 'sad-outline', color: '#F44336' },
                ].map(choice => (
                  <TouchableOpacity
                    key={choice.value}
                    style={[styles.choiceBtn, { borderColor: colors.border }]}
                    onPress={() => handleSatisfactionChoice(choice.value)}
                  >
                    <Ionicons name={choice.icon as any} size={28} color={choice.color} />
                    <Text style={[styles.choiceLabel, { color: colors.text }]}>
                      {choice.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {step === 'detail' && (
            <>
              <Text style={[styles.title, { color: colors.text }]}>
                {satisfaction === 'oui'
                  ? 'Super ! Notez votre expérience'
                  : 'Aidez-nous à nous améliorer'}
              </Text>

              {satisfaction === 'oui' && (
                <>
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
                          size={40}
                          color={star <= (hoveredNote || note) ? '#FFB800' : '#D0D0D0'}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
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
                </>
              )}

              {(satisfaction === 'moyen' || satisfaction === 'non') && (
                <>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                    placeholder="Décrivez ce qui pourrait être amélioré..."
                    placeholderTextColor={colors.subText}
                    value={commentaire}
                    onChangeText={setCommentaire}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                    placeholder="Suggestions d'amélioration (optionnel)"
                    placeholderTextColor={colors.subText}
                    value={suggestion}
                    onChangeText={setSuggestion}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </>
              )}

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <View style={styles.buttons}>
                <TouchableOpacity
                  style={[styles.btnLater, { borderColor: colors.border }]}
                  onPress={handleClose}
                  disabled={loading}
                >
                  <Text style={[styles.btnLaterText, { color: colors.subText }]}>Plus tard</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btnSubmit, loading && styles.btnDisabled]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.btnSubmitText}>Envoyer</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}

          {step === 'done' && (
            <>
              <View style={styles.iconContainer}>
                <Ionicons name="checkmark-circle" size={50} color="#4CAF50" />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>
                Merci pour votre feedback !
              </Text>
              <Text style={[styles.subtitle, { color: colors.subText }]}>
                Votre avis nous aide à améliorer MyHospital.
              </Text>
              <TouchableOpacity style={[styles.btnSubmit, { marginTop: 20 }]} onPress={handleClose}>
                <Text style={styles.btnSubmitText}>Fermer</Text>
              </TouchableOpacity>
            </>
          )}
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  choiceButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    width: '100%',
  },
  choiceBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  choiceLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    marginBottom: 12,
    minHeight: 80,
  },
  error: {
    color: '#FF6B6B',
    fontSize: 13,
    marginBottom: 8,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 8,
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

export default FeedbackApplicationModal;
