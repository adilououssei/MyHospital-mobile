import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

interface EditProfileScreenProps {
  onNavigate: (screen: string) => void;
}

const EditProfileScreen = ({ onNavigate }: EditProfileScreenProps) => {
  const { colors } = useApp();
  
  const [formData, setFormData] = useState({
    fullName: 'Amelia Renata',
    email: 'amelia.renata@email.com',
    phone: '+228 96 71 21 98',
    dateOfBirth: '15/03/1992',
    gender: 'Féminin',
    address: '123 Rue de la Santé, Lomé',
    bloodGroup: 'O+',
    height: '165',
    weight: '47',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showBloodGroupPicker, setShowBloodGroupPicker] = useState(false);

  // Date picker state
  const [selectedDay, setSelectedDay] = useState<number>(15);
  const [selectedMonth, setSelectedMonth] = useState<number>(3);
  const [selectedYear, setSelectedYear] = useState<number>(1992);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' },
  ];
  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleSave = () => {
    Alert.alert(
      'Succès',
      'Votre profil a été mis à jour avec succès !',
      [
        {
          text: 'OK',
          onPress: () => onNavigate('profile'),
        },
      ]
    );
  };

  const handleSelectDate = () => {
    const formattedDate = `${selectedDay.toString().padStart(2, '0')}/${selectedMonth.toString().padStart(2, '0')}/${selectedYear}`;
    setFormData({ ...formData, dateOfBirth: formattedDate });
    setShowDatePicker(false);
  };

  const handleSelectBloodGroup = (group: string) => {
    setFormData({ ...formData, bloodGroup: group });
    setShowBloodGroupPicker(false);
  };

  const InputField = ({ 
    label, 
    value, 
    field, 
    icon, 
    keyboardType = 'default' 
  }: { 
    label: string; 
    value: string; 
    field: string; 
    icon: string;
    keyboardType?: any;
  }) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.inputLabel, { color: colors.text }]}>{label}</Text>
      <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
        <Ionicons name={icon as any} size={20} color={colors.subText} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={value}
          onChangeText={(text) => setFormData({ ...formData, [field]: text })}
          placeholderTextColor={colors.subText}
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );

  const GenderSelector = () => (
    <View style={styles.inputContainer}>
      <Text style={[styles.inputLabel, { color: colors.text }]}>Genre</Text>
      <View style={styles.genderContainer}>
        {['Masculin', 'Féminin', 'Autre'].map((gender) => (
          <TouchableOpacity
            key={gender}
            style={[
              styles.genderButton,
              { 
                backgroundColor: formData.gender === gender ? '#0077b6' : colors.card,
                borderColor: formData.gender === gender ? '#0077b6' : colors.border,
              }
            ]}
            onPress={() => setFormData({ ...formData, gender })}
          >
            <Text
              style={[
                styles.genderButtonText,
                { color: formData.gender === gender ? '#fff' : colors.text }
              ]}
            >
              {gender}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => onNavigate('profile')}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Modifier le Profil
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <View style={[styles.profileImagePlaceholder, { backgroundColor: colors.card }]}>
              <Ionicons name="person" size={60} color="#0077b6" />
            </View>
            <TouchableOpacity style={styles.changePhotoButton}>
              <Ionicons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.changePhotoText, { color: colors.text }]}>
            Changer la photo
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <InputField
            label="Nom Complet"
            value={formData.fullName}
            field="fullName"
            icon="person-outline"
          />

          <InputField
            label="Email"
            value={formData.email}
            field="email"
            icon="mail-outline"
            keyboardType="email-address"
          />

          <InputField
            label="Téléphone"
            value={formData.phone}
            field="phone"
            icon="call-outline"
            keyboardType="phone-pad"
          />

          {/* Date of Birth */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Date de Naissance</Text>
            <TouchableOpacity
              style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={colors.subText} style={styles.inputIcon} />
              <Text style={[styles.input, { color: colors.text }]}>
                {formData.dateOfBirth}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.subText} />
            </TouchableOpacity>
          </View>

          <GenderSelector />

          <InputField
            label="Adresse"
            value={formData.address}
            field="address"
            icon="location-outline"
          />

          {/* Blood Group */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Groupe Sanguin</Text>
            <TouchableOpacity
              style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}
              onPress={() => setShowBloodGroupPicker(true)}
            >
              <Ionicons name="water-outline" size={20} color={colors.subText} style={styles.inputIcon} />
              <Text style={[styles.input, { color: colors.text }]}>
                {formData.bloodGroup}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.subText} />
            </TouchableOpacity>
          </View>

          <View style={styles.rowInputs}>
            <View style={styles.halfInput}>
              <InputField
                label="Taille (cm) - Optionnel"
                value={formData.height}
                field="height"
                icon="resize-outline"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <InputField
                label="Poids (kg) - Optionnel"
                value={formData.weight}
                field="weight"
                icon="barbell-outline"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Enregistrer les modifications</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: colors.border }]}
            onPress={() => onNavigate('profile')}
          >
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Annuler</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.pickerModal, { backgroundColor: colors.card }]}>
            <View style={styles.pickerHeader}>
              <Text style={[styles.pickerTitle, { color: colors.text }]}>Date de naissance</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.datePickerContainer}>
              <ScrollView style={styles.datePicker} showsVerticalScrollIndicator={false}>
                {days.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[styles.dateItem, selectedDay === day && styles.dateItemSelected]}
                    onPress={() => setSelectedDay(day)}
                  >
                    <Text style={[styles.dateItemText, { color: colors.text }, selectedDay === day && styles.dateItemTextSelected]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <ScrollView style={styles.datePicker} showsVerticalScrollIndicator={false}>
                {months.map((month) => (
                  <TouchableOpacity
                    key={month.value}
                    style={[styles.dateItem, selectedMonth === month.value && styles.dateItemSelected]}
                    onPress={() => setSelectedMonth(month.value)}
                  >
                    <Text style={[styles.dateItemText, { color: colors.text }, selectedMonth === month.value && styles.dateItemTextSelected]}>
                      {month.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <ScrollView style={styles.datePicker} showsVerticalScrollIndicator={false}>
                {years.map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[styles.dateItem, selectedYear === year && styles.dateItemSelected]}
                    onPress={() => setSelectedYear(year)}
                  >
                    <Text style={[styles.dateItemText, { color: colors.text }, selectedYear === year && styles.dateItemTextSelected]}>
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity style={styles.confirmButton} onPress={handleSelectDate}>
              <Text style={styles.confirmButtonText}>Confirmer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Blood Group Picker Modal */}
      <Modal
        visible={showBloodGroupPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBloodGroupPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.pickerModal, { backgroundColor: colors.card }]}>
            <View style={styles.pickerHeader}>
              <Text style={[styles.pickerTitle, { color: colors.text }]}>Groupe sanguin</Text>
              <TouchableOpacity onPress={() => setShowBloodGroupPicker(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.bloodGroupGrid}>
              {bloodGroups.map((group) => (
                <TouchableOpacity
                  key={group}
                  style={[
                    styles.bloodGroupItem,
                    { backgroundColor: colors.inputBackground },
                    formData.bloodGroup === group && styles.bloodGroupItemSelected
                  ]}
                  onPress={() => handleSelectBloodGroup(group)}
                >
                  <Ionicons name="water" size={24} color="#FF6B6B" />
                  <Text style={[styles.bloodGroupText, { color: colors.text }]}>{group}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#0077b6',
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0077b6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  changePhotoText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 15,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 15,
  },
  halfInput: {
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#0077b6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerModal: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '80%',
    paddingBottom: 30,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  datePickerContainer: {
    flexDirection: 'row',
    padding: 20,
    height: 250,
  },
  datePicker: {
    flex: 1,
  },
  dateItem: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  dateItemSelected: {
    backgroundColor: '#0077b6',
    borderRadius: 10,
  },
  dateItemText: {
    fontSize: 16,
  },
  dateItemTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#0077b6',
    paddingVertical: 15,
    marginHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bloodGroupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 15,
  },
  bloodGroupItem: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  bloodGroupItemSelected: {
    borderColor: '#0077b6',
    backgroundColor: '#e4f4fcff',
  },
  bloodGroupText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
});

export default EditProfileScreen;