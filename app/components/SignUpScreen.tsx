import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

interface SignUpScreenProps {
  onNavigate: (screen: string) => void;
}

const SignUpScreen = ({ onNavigate }: SignUpScreenProps) => {
  const [currentStep, setCurrentStep] = useState(1);

  // Étape 1
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Étape 2
  const [selectedCountry, setSelectedCountry] = useState<Country>({
    code: 'TG',
    name: 'Togo',
    dialCode: '+228',
    flag: '🇹🇬',
  });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Modals
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showBloodGroupPicker, setShowBloodGroupPicker] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const countries: Country[] = [
    { code: 'TG', name: 'Togo', dialCode: '+228', flag: '🇹🇬' },
    { code: 'BJ', name: 'Bénin', dialCode: '+229', flag: '🇧🇯' },
    { code: 'BF', name: 'Burkina Faso', dialCode: '+226', flag: '🇧🇫' },
    { code: 'CI', name: 'Côte d\'Ivoire', dialCode: '+225', flag: '🇨🇮' },
    { code: 'GH', name: 'Ghana', dialCode: '+233', flag: '🇬🇭' },
    { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
    { code: 'SN', name: 'Sénégal', dialCode: '+221', flag: '🇸🇳' },
    { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  ];

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    country.dialCode.includes(countrySearch)
  );

  // Date picker state
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [selectedYear, setSelectedYear] = useState<number>(2000);

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

  const validateEmail = (text: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  };

  const validatePassword = (text: string) => {
    return text.length >= 8;
  };

  const validatePhoneNumber = (text: string) => {
    return text.length >= 8;
  };

  const isStep1Valid = () => {
    return (
      firstName.trim() &&
      lastName.trim() &&
      email &&
      validateEmail(email) &&
      password &&
      validatePassword(password) &&
      password === confirmPassword
    );
  };

  const isStep2Valid = () => {
    return (
      phoneNumber &&
      validatePhoneNumber(phoneNumber) &&
      address.trim() &&
      city.trim() &&
      dateOfBirth &&
      gender &&
      bloodGroup &&
      agreedToTerms
    );
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!isStep1Valid()) {
        if (!firstName.trim()) alert('Veuillez entrer votre prénom');
        else if (!lastName.trim()) alert('Veuillez entrer votre nom');
        else if (!email) alert('Veuillez entrer votre email');
        else if (!validateEmail(email)) alert('Email invalide');
        else if (!password) alert('Veuillez entrer un mot de passe');
        else if (!validatePassword(password)) alert('Mot de passe trop court (min. 8 caractères)');
        else if (password !== confirmPassword) alert('Les mots de passe ne correspondent pas');
        return;
      }
      setCurrentStep(2);
    }
  };

  const handleSignUp = () => {
    if (!isStep2Valid()) {
      if (!phoneNumber) alert('Veuillez entrer votre numéro de téléphone');
      else if (!validatePhoneNumber(phoneNumber)) alert('Numéro de téléphone invalide');
      else if (!address.trim()) alert('Veuillez entrer votre adresse');
      else if (!city.trim()) alert('Veuillez entrer votre ville');
      else if (!dateOfBirth) alert('Veuillez sélectionner votre date de naissance');
      else if (!gender) alert('Veuillez sélectionner votre genre');
      else if (!bloodGroup) alert('Veuillez sélectionner votre groupe sanguin');
      else if (!agreedToTerms) alert('Veuillez accepter les conditions');
      return;
    }

    setShowSuccessModal(true);
  };

  const handleSelectCountry = (country: Country) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
    setCountrySearch('');
  };

  const handleSelectDate = () => {
    const formattedDate = `${selectedDay.toString().padStart(2, '0')}/${selectedMonth.toString().padStart(2, '0')}/${selectedYear}`;
    setDateOfBirth(formattedDate);
    setShowDatePicker(false);
  };

  const handleSelectBloodGroup = (group: string) => {
    setBloodGroup(group);
    setShowBloodGroupPicker(false);
  };

  const handleGoToLogin = () => {
    setShowSuccessModal(false);
    onNavigate('login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                if (currentStep === 2) {
                  setCurrentStep(1);
                } else {
                  onNavigate('welcome');
                }
              }}
            >
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Inscription</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.content}>
            {/* Step Indicator */}
            <View style={styles.stepIndicator}>
              <View style={styles.stepActive}>
                <Text style={styles.stepTextActive}>1</Text>
              </View>
              <View style={[styles.stepLine, currentStep === 2 && styles.stepLineActive]} />
              <View style={[styles.stepInactive, currentStep === 2 && styles.stepActive]}>
                <Text style={[styles.stepTextInactive, currentStep === 2 && styles.stepTextActive]}>2</Text>
              </View>
            </View>

            <Text style={styles.welcomeText}>
              {currentStep === 1 ? 'Créer un compte' : 'Informations complémentaires'}
            </Text>
            <Text style={styles.subtitleText}>
              {currentStep === 1
                ? 'Remplissez vos informations personnelles'
                : 'Complétez votre profil'}
            </Text>

            {/* ÉTAPE 1 */}
            {currentStep === 1 && (
              <>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color="#999" />
                  <TextInput
                    style={styles.input}
                    placeholder="Prénom"
                    placeholderTextColor="#999"
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                  />
                  {firstName.trim() && (
                    <Ionicons name="checkmark-circle" size={20} color="#0077b6" />
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color="#999" />
                  <TextInput
                    style={styles.input}
                    placeholder="Nom"
                    placeholderTextColor="#999"
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                  />
                  {lastName.trim() && (
                    <Ionicons name="checkmark-circle" size={20} color="#0077b6" />
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#999" />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {email && validateEmail(email) && (
                    <Ionicons name="checkmark-circle" size={20} color="#0077b6" />
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#999" />
                  <TextInput
                    style={styles.input}
                    placeholder="Mot de passe (min. 8 caractères)"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color="#999"
                    />
                  </TouchableOpacity>
                </View>

                {password && (
                  <View style={styles.passwordStrengthContainer}>
                    <View
                      style={[
                        styles.passwordStrengthBar,
                        {
                          width: password.length >= 8 ? '100%' : `${(password.length / 8) * 100}%`,
                          backgroundColor: password.length >= 8 ? '#00C48C' : '#FFA500',
                        },
                      ]}
                    />
                  </View>
                )}

                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#999" />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirmer le mot de passe"
                    placeholderTextColor="#999"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Ionicons
                      name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color="#999"
                    />
                  </TouchableOpacity>
                </View>

                {confirmPassword && password && (
                  <View style={styles.passwordMatchContainer}>
                    {password === confirmPassword ? (
                      <View style={styles.passwordMatchRow}>
                        <Ionicons name="checkmark-circle" size={16} color="#00C48C" />
                        <Text style={styles.passwordMatchText}>Les mots de passe correspondent</Text>
                      </View>
                    ) : (
                      <View style={styles.passwordMatchRow}>
                        <Ionicons name="close-circle" size={16} color="#FF6B6B" />
                        <Text style={[styles.passwordMatchText, { color: '#FF6B6B' }]}>
                          Les mots de passe ne correspondent pas
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.nextButton, !isStep1Valid() && styles.buttonDisabled]}
                  onPress={handleNextStep}
                >
                  <Text style={styles.buttonText}>Suivant</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
              </>
            )}

            {/* ÉTAPE 2 */}
            {currentStep === 2 && (
              <>
                {/* Country Selector */}
                <TouchableOpacity
                  style={styles.countrySelector}
                  onPress={() => setShowCountryPicker(true)}
                >
                  <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
                  <View style={styles.countrySelectorContent}>
                    <Text style={styles.countryName}>{selectedCountry.name}</Text>
                    <Text style={styles.countryDialCode}>{selectedCountry.dialCode}</Text>
                  </View>
                  <Ionicons name="chevron-down" size={20} color="#999" />
                </TouchableOpacity>

                {/* Phone Number */}
                <View style={styles.phoneInputContainer}>
                  <View style={styles.phonePrefix}>
                    <Text style={styles.phonePrefixText}>{selectedCountry.dialCode}</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="Numéro de téléphone"
                    placeholderTextColor="#999"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                  />
                  {phoneNumber && validatePhoneNumber(phoneNumber) && (
                    <Ionicons name="checkmark-circle" size={20} color="#0077b6" />
                  )}
                </View>

                {/* Address */}
                <View style={styles.inputContainer}>
                  <Ionicons name="location-outline" size={20} color="#999" />
                  <TextInput
                    style={styles.input}
                    placeholder="Adresse"
                    placeholderTextColor="#999"
                    value={address}
                    onChangeText={setAddress}
                  />
                  {address.trim() && (
                    <Ionicons name="checkmark-circle" size={20} color="#0077b6" />
                  )}
                </View>

                {/* City */}
                <View style={styles.inputContainer}>
                  <Ionicons name="business-outline" size={20} color="#999" />
                  <TextInput
                    style={styles.input}
                    placeholder="Ville"
                    placeholderTextColor="#999"
                    value={city}
                    onChangeText={setCity}
                  />
                  {city.trim() && (
                    <Ionicons name="checkmark-circle" size={20} color="#0077b6" />
                  )}
                </View>

                {/* Date of Birth */}
                <TouchableOpacity
                  style={styles.inputContainer}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color="#999" />
                  <Text style={[styles.inputText, dateOfBirth ? { color: '#000' } : { color: '#999' }]}>
                    {dateOfBirth || 'Date de naissance'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#999" />
                </TouchableOpacity>

                {/* Gender Selector */}
                <View style={styles.labelContainer}>
                  <Text style={styles.label}>Genre</Text>
                </View>
                <View style={styles.genderContainer}>
                  {['Masculin', 'Féminin', 'Autre'].map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[
                        styles.genderButton,
                        gender === g && styles.genderButtonActive
                      ]}
                      onPress={() => setGender(g)}
                    >
                      <Text style={[
                        styles.genderButtonText,
                        gender === g && styles.genderButtonTextActive
                      ]}>
                        {g}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Blood Group */}
                <TouchableOpacity
                  style={styles.inputContainer}
                  onPress={() => setShowBloodGroupPicker(true)}
                >
                  <Ionicons name="water-outline" size={20} color="#999" />
                  <Text style={[styles.inputText, bloodGroup ? { color: '#000' } : { color: '#999' }]}>
                    {bloodGroup || 'Groupe sanguin'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#999" />
                </TouchableOpacity>

                {/* Height & Weight (Optional) */}
                <View style={styles.labelContainer}>
                  <Text style={styles.label}>Informations supplémentaires (optionnel)</Text>
                </View>
                <View style={styles.rowInputs}>
                  <View style={styles.halfInputContainer}>
                    <Ionicons name="resize-outline" size={20} color="#999" />
                    <TextInput
                      style={styles.halfInput}
                      placeholder="Taille (cm)"
                      placeholderTextColor="#999"
                      value={height}
                      onChangeText={setHeight}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.halfInputContainer}>
                    <Ionicons name="barbell-outline" size={20} color="#999" />
                    <TextInput
                      style={styles.halfInput}
                      placeholder="Poids (kg)"
                      placeholderTextColor="#999"
                      value={weight}
                      onChangeText={setWeight}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Terms Checkbox */}
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setAgreedToTerms(!agreedToTerms)}
                >
                  <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                    {agreedToTerms && <Ionicons name="checkmark" size={16} color="#fff" />}
                  </View>
                  <Text style={styles.checkboxText}>
                    J'accepte les <Text style={styles.linkText}>Conditions d'utilisation</Text> et la{' '}
                    <Text style={styles.linkText}>Politique de confidentialité</Text>
                  </Text>
                </TouchableOpacity>

                {/* Sign Up Button */}
                <TouchableOpacity
                  style={[styles.nextButton, !isStep2Valid() && styles.buttonDisabled]}
                  onPress={handleSignUp}
                >
                  <Text style={styles.buttonText}>S'inscrire</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Vous avez déjà un compte ? </Text>
              <TouchableOpacity onPress={() => onNavigate('login')}>
                <Text style={styles.loginLink}>Se connecter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Sélectionnez votre pays</Text>
              <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={20} color="#999" />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un pays..."
                placeholderTextColor="#999"
                value={countrySearch}
                onChangeText={setCountrySearch}
              />
            </View>

            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryItem}
                  onPress={() => handleSelectCountry(item)}
                >
                  <Text style={styles.countryItemFlag}>{item.flag}</Text>
                  <Text style={styles.countryItemName}>{item.name}</Text>
                  <Text style={styles.countryItemCode}>{item.dialCode}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Date de naissance</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Ionicons name="close" size={24} color="#000" />
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
                    <Text style={[styles.dateItemText, selectedDay === day && styles.dateItemTextSelected]}>
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
                    <Text style={[styles.dateItemText, selectedMonth === month.value && styles.dateItemTextSelected]}>
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
                    <Text style={[styles.dateItemText, selectedYear === year && styles.dateItemTextSelected]}>
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
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Groupe sanguin</Text>
              <TouchableOpacity onPress={() => setShowBloodGroupPicker(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.bloodGroupGrid}>
              {bloodGroups.map((group) => (
                <TouchableOpacity
                  key={group}
                  style={styles.bloodGroupItem}
                  onPress={() => handleSelectBloodGroup(group)}
                >
                  <Ionicons name="water" size={24} color="#FF6B6B" />
                  <Text style={styles.bloodGroupText}>{group}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="checkmark" size={50} color="#fff" />
            </View>

            <Text style={styles.modalTitle}>Inscription réussie !</Text>
            <Text style={styles.modalDescription}>
              Bienvenue {firstName} {lastName} !
            </Text>
            <Text style={styles.modalSubDescription}>
              Votre compte a été créé avec succès
            </Text>

            <TouchableOpacity style={styles.modalButton} onPress={handleGoToLogin}>
              <Text style={styles.modalButtonText}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
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
    paddingHorizontal: 30,
    paddingTop: 10,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
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
    width: 80,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 10,
  },
  stepLineActive: {
    backgroundColor: '#0077b6',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#000',
  },
  inputText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },
  passwordStrengthContainer: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 15,
    overflow: 'hidden',
  },
  passwordStrengthBar: {
    height: '100%',
    borderRadius: 2,
  },
  passwordMatchContainer: {
    marginBottom: 15,
  },
  passwordMatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  passwordMatchText: {
    fontSize: 12,
    color: '#00C48C',
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 15,
  },
  countryFlag: {
    fontSize: 28,
    marginRight: 12,
  },
  countrySelectorContent: {
    flex: 1,
  },
  countryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  countryDialCode: {
    fontSize: 12,
    color: '#999',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingRight: 20,
    marginBottom: 15,
  },
  phonePrefix: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  phonePrefixText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0077b6',
  },
  phoneInput: {
    flex: 1,
    marginLeft: 15,
    fontSize: 14,
    color: '#000',
  },
  labelContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: '#0077b6',
  },
  genderButtonText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  genderButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  halfInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  halfInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#000',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 20,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#0077b6',
    borderColor: '#0077b6',
  },
  checkboxText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  linkText: {
    color: '#0077b6',
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#0077b6',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#0077b6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#B0B0B0',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#0077b6',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerModal: {
    backgroundColor: '#fff',
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
    color: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    margin: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#000',
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  countryItemFlag: {
    fontSize: 28,
    marginRight: 15,
  },
  countryItemName: {
    flex: 1,
    fontSize: 15,
    color: '#000',
  },
  countryItemCode: {
    fontSize: 14,
    color: '#0077b6',
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
    color: '#000',
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
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F5F5F5',
  },
  bloodGroupText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 5,
  },
  successModalContent: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 35,
    margin: 30,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#0077b6',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 16,
    color: '#0077b6',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 4,
  },
  modalSubDescription: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#0077b6',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 25,
    marginTop: 30,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SignUpScreen;