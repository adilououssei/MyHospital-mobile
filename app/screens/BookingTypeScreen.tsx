import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface BookingTypeScreenProps {
  onNavigate: (screen: string, params?: any) => void;
}

const BookingTypeScreen = ({ onNavigate }: BookingTypeScreenProps) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [description, setDescription] = useState('');

  const consultationTypes = [
    {
      id: 'online',
      title: 'Consultation en ligne',
      icon: 'videocam',
      description: 'Consultation par vidéo',
    },
    {
      id: 'home',
      title: 'Consultation à domicile',
      icon: 'home',
      description: 'Le médecin vient chez vous',
    },
    {
      id: 'hospital',
      title: 'Consultation à l\'hôpital',
      icon: 'business',
      description: 'Rendez-vous en présentiel',
    },
  ];

  const handleNext = () => {
    if (!selectedType || !description.trim()) {
      alert('Veuillez sélectionner un type et ajouter une description');
      return;
    }

    onNavigate('doctorsList', {
      consultationType: selectedType,
      description: description,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => onNavigate('appointments')}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouveau rendez-vous</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            <View style={styles.stepActive}>
              <Text style={styles.stepTextActive}>1</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.stepInactive}>
              <Text style={styles.stepTextInactive}>2</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.stepInactive}>
              <Text style={styles.stepTextInactive}>3</Text>
            </View>
          </View>

          <Text style={styles.title}>Type de consultation</Text>
          <Text style={styles.subtitle}>
            Choisissez le type de consultation qui vous convient
          </Text>

          {/* Consultation Types */}
          <View style={styles.typesContainer}>
            {consultationTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeCard,
                  selectedType === type.id && styles.typeCardActive,
                ]}
                onPress={() => setSelectedType(type.id)}
              >
                <View
                  style={[
                    styles.typeIconContainer,
                    selectedType === type.id && styles.typeIconContainerActive,
                  ]}
                >
                  <Ionicons
                    name={type.icon as any}
                    size={32}
                    color={selectedType === type.id ? '#fff' : '#0077b6'}
                  />
                </View>
                <Text style={styles.typeTitle}>{type.title}</Text>
                <Text style={styles.typeDescription}>{type.description}</Text>
                {selectedType === type.id && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark-circle" size={24} color="#0077b6" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.label}>Description du problème</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Décrivez brièvement votre problème de santé..."
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>{description.length}/500</Text>
          </View>
        </View>
      </ScrollView>

      {/* Next Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            (!selectedType || !description.trim()) && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!selectedType || !description.trim()}
        >
          <Text style={styles.nextButtonText}>Suivant</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 25,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 34,
  },
  content: {
    padding: 20,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  stepActive: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0077b6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepInactive: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepTextActive: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  stepTextInactive: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 25,
  },
  typesContainer: {
    marginBottom: 25,
  },
  typeCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  typeCardActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#0077b6',
  },
  typeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeIconContainerActive: {
    backgroundColor: '#0077b6',
  },
  typeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 13,
    color: '#666',
  },
  checkmark: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 10,
  },
  textArea: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 15,
    fontSize: 14,
    color: '#000',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 5,
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  nextButton: {
    backgroundColor: '#0077b6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 30,
    gap: 8,
  },
  nextButtonDisabled: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BookingTypeScreen;