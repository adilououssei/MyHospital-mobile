import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Modal, KeyboardAvoidingView, ScrollView,
  FlatList, ActivityIndicator, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import authService from '../services/authService';
import { useApp } from '../context/AppContext';

interface Country { code: string; name: string; dialCode: string; flag: string; }
interface SignUpScreenProps { onNavigate: (screen: string) => void; }

// ─── Arrière-plan décoratif ───────────────────────────────────────────────────
const DecorBackground = () => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <View style={decor.blobTopRight} />
    <View style={decor.blobBottomLeft} />
    <View style={decor.waveBottom} />
    <Text style={decor.plus1}>✚</Text>
    <Text style={decor.plus2}>✚</Text>
    <Text style={decor.plus3}>✚</Text>
    <Text style={decor.plus4}>✚</Text>
    <Text style={decor.plus5}>✚</Text>
  </View>
);

const decor = StyleSheet.create({
  blobTopRight: {
    position: 'absolute', top: -60, right: -60,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: '#dbeafe', opacity: 0.55,
  },
  blobBottomLeft: {
    position: 'absolute', bottom: 80, left: -80,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: '#bfdbfe', opacity: 0.35,
  },
  waveBottom: {
    position: 'absolute', bottom: -40, left: -40, right: -40,
    height: 130, borderRadius: 80,
    backgroundColor: '#dbeafe', opacity: 0.6,
  },
  plus1: { position: 'absolute', bottom: 55, right: 24,  fontSize: 30, color: '#93c5fd', opacity: 0.75 },
  plus2: { position: 'absolute', bottom: 18, left:  48,  fontSize: 22, color: '#86efac', opacity: 0.70 },
  plus3: { position: 'absolute', bottom: 72, left:  18,  fontSize: 15, color: '#93c5fd', opacity: 0.55 },
  plus4: { position: 'absolute', top:   90, right: 18,   fontSize: 14, color: '#bfdbfe', opacity: 0.60 },
  plus5: { position: 'absolute', top:  200, left:  14,   fontSize: 12, color: '#86efac', opacity: 0.45 },
});

// ─── Composant principal ──────────────────────────────────────────────────────
const SignUpScreen = ({ onNavigate }: SignUpScreenProps) => {
  const { t } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Étape 1
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Étape 2
  const [selectedCountry, setSelectedCountry] = useState<Country>({ code: 'TG', name: 'Togo', dialCode: '+228', flag: '🇹🇬' });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showBloodGroupPicker, setShowBloodGroupPicker] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const countries: Country[] = [
    { code: 'TG', name: 'Togo',           dialCode: '+228', flag: '🇹🇬' },
    { code: 'BJ', name: 'Bénin',          dialCode: '+229', flag: '🇧🇯' },
    { code: 'BF', name: 'Burkina Faso',   dialCode: '+226', flag: '🇧🇫' },
    { code: 'CI', name: "Côte d'Ivoire",  dialCode: '+225', flag: '🇨🇮' },
    { code: 'GH', name: 'Ghana',          dialCode: '+233', flag: '🇬🇭' },
    { code: 'NG', name: 'Nigeria',        dialCode: '+234', flag: '🇳🇬' },
    { code: 'SN', name: 'Sénégal',        dialCode: '+221', flag: '🇸🇳' },
    { code: 'FR', name: 'France',         dialCode: '+33',  flag: '🇫🇷' },
  ];
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) || c.dialCode.includes(countrySearch)
  );

  const [selDay, setSelDay]     = useState(1);
  const [selMonth, setSelMonth] = useState(1);
  const [selYear, setSelYear]   = useState(2000);
  const days   = Array.from({ length: 31 }, (_, i) => i + 1);
  const monthKeys = ['signupMonth1','signupMonth2','signupMonth3','signupMonth4','signupMonth5','signupMonth6',
                     'signupMonth7','signupMonth8','signupMonth9','signupMonth10','signupMonth11','signupMonth12'];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years  = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

  const validateEmail  = (t: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
  const validatePw     = (t: string) => t.length >= 8;
  const validatePhone  = (t: string) => t.length >= 8;

  const isStep1Valid = () =>
    firstName.trim() && lastName.trim() && email && validateEmail(email) &&
    password && validatePw(password) && password === confirmPassword;

  const isStep2Valid = () =>
    phoneNumber && validatePhone(phoneNumber) && address.trim() &&
    city.trim() && dateOfBirth && gender && bloodGroup && agreedToTerms;

  const handleNext = () => {
    if (!isStep1Valid()) {
      if (!firstName.trim()) return Alert.alert(t('signupErr'), t('firstName') + ' requis');
      if (!lastName.trim())  return Alert.alert(t('signupErr'), t('lastName') + ' requis');
      if (!validateEmail(email)) return Alert.alert(t('signupErr'), t('loginErrEmail'));
      if (!validatePw(password)) return Alert.alert(t('signupErr'), t('cpErrLen'));
      if (password !== confirmPassword) return Alert.alert(t('signupErr'), t('signupPasswordNoMatch'));
    }
    setCurrentStep(2);
  };

  const handleSignUp = async () => {
    if (!isStep2Valid()) {
      if (!phoneNumber)      return Alert.alert(t('signupErr'), t('phone') + ' requis');
      if (!address.trim())   return Alert.alert(t('signupErr'), t('address') + ' requise');
      if (!city.trim())      return Alert.alert(t('signupErr'), t('city') + ' requise');
      if (!dateOfBirth)      return Alert.alert(t('signupErr'), t('signupDateOfBirth') + ' requise');
      if (!gender)           return Alert.alert(t('signupErr'), t('signupGender') + ' requis');
      if (!bloodGroup)       return Alert.alert(t('signupErr'), t('signupBloodGroup') + ' requis');
      if (!agreedToTerms)    return Alert.alert(t('signupErr'), t('signupTermsError'));
    }
    setIsLoading(true);
    try {
      const [d, m, y] = dateOfBirth.split('/');
      const res = await authService.register({
        email: email.trim(), password,
        nom: lastName.trim(), prenom: firstName.trim(),
        telephone: `${selectedCountry.dialCode}${phoneNumber}`,
        adresse: address.trim(), ville: city.trim(),
        dateNaissance: `${y}-${m}-${d}`,
        genre: gender, groupeSanguin: bloodGroup,
        taille: height ? parseFloat(height) : 0,
        poids:  weight ? parseFloat(weight)  : 0,
      });
      setIsLoading(false);
      if (res.status === 'success') setShowSuccessModal(true);
      else Alert.alert(t('error'), res.message || t('loginErrServer'));
    } catch {
      setIsLoading(false);
      Alert.alert(t('error'), t('loginErrServer'));
    }
  };

  const confirmDate = () => {
    setDateOfBirth(`${selDay.toString().padStart(2,'0')}/${selMonth.toString().padStart(2,'0')}/${selYear}`);
    setShowDatePicker(false);
  };

  return (
    <View style={styles.root}>
      {/* ── Fond décoratif absolu ─────────────────────────────── */}
      <DecorBackground />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior="padding" style={styles.flex}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

            {/* ── Top bar ──────────────────────────────────────── */}
            <View style={styles.topBar}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => currentStep === 2 ? setCurrentStep(1) : onNavigate('welcome')}
                disabled={isLoading}
              >
                <Ionicons name="chevron-back" size={22} color="#374151" />
              </TouchableOpacity>
            </View>

            {/* ── Logo ─────────────────────────────────────────── */}
            <View style={styles.logoWrap}>
              <Image
                source={require('../../assets/MyHospitalMyHospital.png')}
                style={styles.logoImg}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.title}>{t('signupTitle')}</Text>
            <Text style={styles.subtitle}>
              {currentStep === 1 ? t('signupStep1Sub') : t('signupStep2Sub')}
            </Text>

            {/* ── Step indicator ───────────────────────────────── */}
            <View style={styles.stepRow}>
              <View style={styles.stepDotActive}><Text style={styles.stepTextActive}>1</Text></View>
              <View style={[styles.stepLine, currentStep === 2 && styles.stepLineActive]} />
              <View style={currentStep === 2 ? styles.stepDotActive : styles.stepDotInactive}>
                <Text style={currentStep === 2 ? styles.stepTextActive : styles.stepTextInactive}>2</Text>
              </View>
            </View>

            {/* ════ ÉTAPE 1 ════ */}
            {currentStep === 1 && (
              <>
                <View style={styles.inputBox}>
                  <Ionicons name="person-outline" size={20} color="#9ca3af" style={styles.icon} />
                  <TextInput style={styles.input} placeholder={t('firstName')} placeholderTextColor="#9ca3af"
                    value={firstName} onChangeText={setFirstName} autoCapitalize="words" editable={!isLoading} />
                  {firstName.trim() && <Ionicons name="checkmark-circle" size={20} color="#1a56db" />}
                </View>

                <View style={styles.inputBox}>
                  <Ionicons name="person-outline" size={20} color="#9ca3af" style={styles.icon} />
                  <TextInput style={styles.input} placeholder={t('lastName')} placeholderTextColor="#9ca3af"
                    value={lastName} onChangeText={setLastName} autoCapitalize="words" editable={!isLoading} />
                  {lastName.trim() && <Ionicons name="checkmark-circle" size={20} color="#1a56db" />}
                </View>

                <View style={styles.inputBox}>
                  <Ionicons name="mail-outline" size={20} color="#9ca3af" style={styles.icon} />
                  <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#9ca3af"
                    value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" editable={!isLoading} />
                  {email && validateEmail(email) && <Ionicons name="checkmark-circle" size={20} color="#1a56db" />}
                </View>

                <View style={styles.inputBox}>
                  <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={styles.icon} />
                  <TextInput style={styles.input} placeholder={t('signupPasswordPlaceholder')} placeholderTextColor="#9ca3af"
                    value={password} onChangeText={setPassword} secureTextEntry={!showPassword} editable={!isLoading} />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9ca3af" />
                  </TouchableOpacity>
                </View>

                {password.length > 0 && (
                  <View style={styles.hint}>
                    <Ionicons name="checkmark-circle" size={14} color={validatePw(password) ? '#10b981' : '#9ca3af'} />
                    <Text style={[styles.hintText, { color: validatePw(password) ? '#10b981' : '#9ca3af' }]}>
                      Le mot de passe doit contenir au moins 8 caractères
                    </Text>
                  </View>
                )}

                <View style={styles.inputBox}>
                  <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={styles.icon} />
                  <TextInput style={styles.input} placeholder={t('signupConfirmPassword')} placeholderTextColor="#9ca3af"
                    value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword} editable={!isLoading} />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Ionicons name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9ca3af" />
                  </TouchableOpacity>
                </View>

                {confirmPassword.length > 0 && (
                  <View style={styles.hint}>
                    <Ionicons name={password === confirmPassword ? 'checkmark-circle' : 'close-circle'} size={14}
                      color={password === confirmPassword ? '#10b981' : '#ef4444'} />
                    <Text style={[styles.hintText, { color: password === confirmPassword ? '#10b981' : '#ef4444' }]}>
                      {password === confirmPassword ? t('signupPasswordMatch') : t('signupPasswordNoMatch')}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.primaryBtn, (!isStep1Valid() || isLoading) && styles.primaryBtnDisabled]}
                  onPress={handleNext} disabled={isLoading}
                >
                  <Text style={styles.primaryBtnText}>{t('signupNext')}</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </TouchableOpacity>
              </>
            )}

            {/* ════ ÉTAPE 2 ════ */}
            {currentStep === 2 && (
              <>
                {/* Pays */}
                <TouchableOpacity style={styles.inputBox} onPress={() => setShowCountryPicker(true)} disabled={isLoading}>
                  <Text style={{ fontSize: 22, marginRight: 10 }}>{selectedCountry.flag}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>{selectedCountry.name}</Text>
                    <Text style={{ fontSize: 12, color: '#9ca3af' }}>{selectedCountry.dialCode}</Text>
                  </View>
                  <Ionicons name="chevron-down" size={18} color="#9ca3af" />
                </TouchableOpacity>

                {/* Téléphone */}
                <View style={styles.inputBox}>
                  <View style={styles.phonePrefix}>
                    <Text style={styles.phonePrefixText}>{selectedCountry.dialCode}</Text>
                  </View>
                  <TextInput style={[styles.input, { marginLeft: 12 }]}
                    placeholder={t('signupPhonePlaceholder')} placeholderTextColor="#9ca3af"
                    value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" editable={!isLoading} />
                  {phoneNumber && validatePhone(phoneNumber) && <Ionicons name="checkmark-circle" size={20} color="#1a56db" />}
                </View>

                {/* Adresse */}
                <View style={styles.inputBox}>
                  <Ionicons name="location-outline" size={20} color="#9ca3af" style={styles.icon} />
                  <TextInput style={styles.input} placeholder={t('address')} placeholderTextColor="#9ca3af"
                    value={address} onChangeText={setAddress} editable={!isLoading} />
                  {address.trim() && <Ionicons name="checkmark-circle" size={20} color="#1a56db" />}
                </View>

                {/* Ville */}
                <View style={styles.inputBox}>
                  <Ionicons name="business-outline" size={20} color="#9ca3af" style={styles.icon} />
                  <TextInput style={styles.input} placeholder={t('city')} placeholderTextColor="#9ca3af"
                    value={city} onChangeText={setCity} editable={!isLoading} />
                  {city.trim() && <Ionicons name="checkmark-circle" size={20} color="#1a56db" />}
                </View>

                {/* Date de naissance */}
                <TouchableOpacity style={styles.inputBox} onPress={() => setShowDatePicker(true)} disabled={isLoading}>
                  <Ionicons name="calendar-outline" size={20} color="#9ca3af" style={styles.icon} />
                  <Text style={[styles.input, { color: dateOfBirth ? '#111827' : '#9ca3af' }]}>
                    {dateOfBirth || t('signupDateOfBirth')}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color="#9ca3af" />
                </TouchableOpacity>

                {/* Genre */}
                <Text style={styles.fieldLabel}>{t('signupGender')}</Text>
                <View style={styles.genderRow}>
                  {['Masculin','Féminin','Autre'].map(g => {
                    const key = g === 'Masculin' ? 'signupMale' : g === 'Féminin' ? 'signupFemale' : 'signupOther';
                    return (
                      <TouchableOpacity key={g}
                        style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                        onPress={() => setGender(g)} disabled={isLoading}
                      >
                        <Text style={[styles.genderBtnText, gender === g && styles.genderBtnTextActive]}>{t(key)}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Groupe sanguin */}
                <TouchableOpacity style={styles.inputBox} onPress={() => setShowBloodGroupPicker(true)} disabled={isLoading}>
                  <Ionicons name="water-outline" size={20} color="#9ca3af" style={styles.icon} />
                  <Text style={[styles.input, { color: bloodGroup ? '#111827' : '#9ca3af' }]}>
                    {bloodGroup || t('signupBloodGroup')}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color="#9ca3af" />
                </TouchableOpacity>

                {/* Taille / Poids */}
                <Text style={styles.fieldLabel}>{t('signupOptionalInfo')}</Text>
                <View style={styles.rowInputs}>
                  <View style={[styles.inputBox, { flex: 1, marginBottom: 0 }]}>
                    <Ionicons name="resize-outline" size={18} color="#9ca3af" style={styles.icon} />
                    <TextInput style={styles.input} placeholder={t('signupHeightPlaceholder')} placeholderTextColor="#9ca3af"
                      value={height} onChangeText={setHeight} keyboardType="numeric" editable={!isLoading} />
                  </View>
                  <View style={[styles.inputBox, { flex: 1, marginBottom: 0 }]}>
                    <Ionicons name="barbell-outline" size={18} color="#9ca3af" style={styles.icon} />
                    <TextInput style={styles.input} placeholder={t('signupWeightPlaceholder')} placeholderTextColor="#9ca3af"
                      value={weight} onChangeText={setWeight} keyboardType="numeric" editable={!isLoading} />
                  </View>
                </View>

                {/* CGU */}
                <TouchableOpacity style={styles.checkboxRow} onPress={() => setAgreedToTerms(!agreedToTerms)} disabled={isLoading}>
                  <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                    {agreedToTerms && <Ionicons name="checkmark" size={14} color="#fff" />}
                  </View>
                  <Text style={styles.checkboxText}>
                    {t('signupTermsAccept')}
                    <Text style={styles.link}>{t('signupTerms')}</Text>
                    {t('signupAnd')} <Text style={styles.link}>{t('signupPrivacy')}</Text>
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.primaryBtn, (!isStep2Valid() || isLoading) && styles.primaryBtnDisabled]}
                  onPress={handleSignUp} disabled={!isStep2Valid() || isLoading}
                >
                  {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>{t('signupSignUp')}</Text>}
                </TouchableOpacity>
              </>
            )}

            {/* ── Divider + Google ──────────────────────────────── */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('loginOr')}</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.socialBtn} disabled={isLoading} activeOpacity={0.8}>
              <Ionicons name="logo-google" size={22} color="#DB4437" />
              <Text style={styles.socialBtnText}>{t('loginGoogle')}</Text>
            </TouchableOpacity>

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>{t('signupHaveAccount')} </Text>
              <TouchableOpacity onPress={() => onNavigate('login')} disabled={isLoading}>
                <Text style={styles.switchLink}>{t('signupSignIn')}</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* ── Country Picker ───────────────────────────────────────── */}
      <Modal visible={showCountryPicker} transparent animationType="slide" onRequestClose={() => setShowCountryPicker(false)}>
        <View style={styles.sheetOverlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t('signupCountryPicker')}</Text>
              <TouchableOpacity onPress={() => setShowCountryPicker(false)}><Ionicons name="close" size={24} color="#374151" /></TouchableOpacity>
            </View>
            <View style={[styles.inputBox, { marginHorizontal: 16, marginBottom: 8 }]}>
              <Ionicons name="search-outline" size={18} color="#9ca3af" style={styles.icon} />
              <TextInput style={styles.input} placeholder={t('signupCountrySearch')} placeholderTextColor="#9ca3af"
                value={countrySearch} onChangeText={setCountrySearch} />
            </View>
            <FlatList data={filteredCountries} keyExtractor={i => i.code}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.countryItem} onPress={() => { setSelectedCountry(item); setShowCountryPicker(false); setCountrySearch(''); }}>
                  <Text style={{ fontSize: 24, marginRight: 14 }}>{item.flag}</Text>
                  <Text style={styles.countryName}>{item.name}</Text>
                  <Text style={styles.countryCode}>{item.dialCode}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* ── Date Picker ─────────────────────────────────────────── */}
      <Modal visible={showDatePicker} transparent animationType="slide" onRequestClose={() => setShowDatePicker(false)}>
        <View style={styles.sheetOverlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t('signupBirthTitle')}</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}><Ionicons name="close" size={24} color="#374151" /></TouchableOpacity>
            </View>
            <View style={styles.datePickers}>
              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {days.map(d => (
                  <TouchableOpacity key={d} style={[styles.dateItem, selDay === d && styles.dateItemActive]} onPress={() => setSelDay(d)}>
                    <Text style={[styles.dateItemText, selDay === d && styles.dateItemTextActive]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {months.map(m => (
                  <TouchableOpacity key={m} style={[styles.dateItem, selMonth === m && styles.dateItemActive]} onPress={() => setSelMonth(m)}>
                    <Text style={[styles.dateItemText, selMonth === m && styles.dateItemTextActive]}>{t(monthKeys[m-1])}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {years.map(y => (
                  <TouchableOpacity key={y} style={[styles.dateItem, selYear === y && styles.dateItemActive]} onPress={() => setSelYear(y)}>
                    <Text style={[styles.dateItemText, selYear === y && styles.dateItemTextActive]}>{y}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <TouchableOpacity style={[styles.primaryBtn, { marginHorizontal: 20, marginBottom: 10 }]} onPress={confirmDate}>
              <Text style={styles.primaryBtnText}>{t('confirm')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Blood Group Picker ──────────────────────────────────── */}
      <Modal visible={showBloodGroupPicker} transparent animationType="slide" onRequestClose={() => setShowBloodGroupPicker(false)}>
        <View style={styles.sheetOverlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t('signupBloodGroup')}</Text>
              <TouchableOpacity onPress={() => setShowBloodGroupPicker(false)}><Ionicons name="close" size={24} color="#374151" /></TouchableOpacity>
            </View>
            <View style={styles.bloodGrid}>
              {bloodGroups.map(g => (
                <TouchableOpacity key={g} style={styles.bloodItem} onPress={() => { setBloodGroup(g); setShowBloodGroupPicker(false); }}>
                  <Ionicons name="water" size={22} color="#ef4444" />
                  <Text style={styles.bloodItemText}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Success Modal ───────────────────────────────────────── */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <Ionicons name="checkmark" size={44} color="#fff" />
            </View>
            <Text style={styles.modalTitle}>{t('signupSuccessTitle')}</Text>
            <Text style={styles.modalDesc}>{t('signupSuccessDesc')}{firstName} {lastName} !</Text>
            <Text style={[styles.modalDesc, { color: '#9ca3af', fontWeight: '400', marginTop: 6 }]}>{t('signupSuccessSub')}</Text>
            <TouchableOpacity style={[styles.primaryBtn, { width: '100%' }]}
              onPress={() => { setShowSuccessModal(false); onNavigate('login'); }}>
              <Text style={styles.primaryBtnText}>{t('signupSignIn')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root:         { flex: 1, backgroundColor: '#f0f6ff' },
  safeArea:     { flex: 1, backgroundColor: 'transparent' },
  flex:         { flex: 1 },
  scrollContent:{ paddingHorizontal: 24, paddingBottom: 140 },

  topBar:  { flexDirection: 'row', alignItems: 'center', paddingTop: 12, marginBottom: 20 },
  backBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1.5, borderColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.8)' },

  logoWrap: { marginBottom: 22 },
  logoImg:  { width: 160, height: 52 },

  title:    { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 4, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 20, lineHeight: 20 },

  stepRow:         { flexDirection: 'row', alignItems: 'center', marginBottom: 22 },
  stepDotActive:   { width: 34, height: 34, borderRadius: 17, backgroundColor: '#1a3fad', justifyContent: 'center', alignItems: 'center' },
  stepDotInactive: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center' },
  stepTextActive:  { color: '#fff',    fontWeight: '700', fontSize: 15 },
  stepTextInactive:{ color: '#9ca3af', fontWeight: '600', fontSize: 15 },
  stepLine:        { flex: 1, height: 2, backgroundColor: '#e5e7eb', marginHorizontal: 8 },
  stepLineActive:  { backgroundColor: '#1a3fad' },

  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14, marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.88)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  icon:  { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#111827' },

  phonePrefix:     { paddingRight: 12, borderRightWidth: 1, borderRightColor: '#e5e7eb' },
  phonePrefixText: { fontSize: 14, fontWeight: '700', color: '#1a3fad' },

  hint:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -8, marginBottom: 12, marginLeft: 4 },
  hintText: { fontSize: 12 },

  fieldLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 10 },

  genderRow:        { flexDirection: 'row', gap: 10, marginBottom: 14 },
  genderBtn:        { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.88)', alignItems: 'center', borderWidth: 1.5, borderColor: '#e5e7eb' },
  genderBtnActive:  { backgroundColor: '#1a3fad', borderColor: '#1a3fad' },
  genderBtnText:    { fontSize: 13, color: '#6b7280', fontWeight: '600' },
  genderBtnTextActive:{ color: '#fff' },

  rowInputs: { flexDirection: 'row', gap: 12, marginBottom: 14 },

  checkboxRow:    { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  checkbox:       { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#d1d5db', marginRight: 10, justifyContent: 'center', alignItems: 'center', marginTop: 1 },
  checkboxChecked:{ backgroundColor: '#1a3fad', borderColor: '#1a3fad' },
  checkboxText:   { flex: 1, fontSize: 13, color: '#6b7280', lineHeight: 20 },
  link:           { color: '#1a56db', fontWeight: '600' },

  primaryBtn:        { backgroundColor: '#1a3fad', borderRadius: 14, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20, shadowColor: '#1a56db', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 8, elevation: 5 },
  primaryBtnDisabled:{ backgroundColor: '#9ca3af', shadowOpacity: 0 },
  primaryBtnText:    { color: '#fff', fontSize: 16, fontWeight: '700' },

  divider:    { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dividerLine:{ flex: 1, height: 1, backgroundColor: '#d1d5db' },
  dividerText:{ marginHorizontal: 14, fontSize: 13, color: '#9ca3af', fontWeight: '500' },

  socialBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 14, paddingVertical: 14, marginBottom: 20, backgroundColor: 'rgba(255,255,255,0.88)', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  socialBtnText:{ fontSize: 15, fontWeight: '600', color: '#111827' },

  switchRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  switchText:{ fontSize: 14, color: '#6b7280' },
  switchLink:{ fontSize: 14, fontWeight: '700', color: '#1a56db' },

  sheetOverlay:{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet:       { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '82%', paddingBottom: 30 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  sheetTitle:  { fontSize: 17, fontWeight: '700', color: '#111827' },

  countryItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  countryName: { flex: 1, fontSize: 15, color: '#111827' },
  countryCode: { fontSize: 14, fontWeight: '600', color: '#1a56db' },

  datePickers:      { flexDirection: 'row', height: 220, paddingHorizontal: 10, marginBottom: 16 },
  dateItem:         { paddingVertical: 11, alignItems: 'center', borderRadius: 10 },
  dateItemActive:   { backgroundColor: '#1a3fad' },
  dateItemText:     { fontSize: 15, color: '#374151' },
  dateItemTextActive:{ color: '#fff', fontWeight: '700' },

  bloodGrid:    { flexDirection: 'row', flexWrap: 'wrap', padding: 20, gap: 14 },
  bloodItem:    { width: '22%', aspectRatio: 1, backgroundColor: '#fef2f2', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  bloodItemText:{ fontSize: 15, fontWeight: '700', color: '#111827', marginTop: 4 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 },
  modalCard:    { backgroundColor: '#fff', borderRadius: 24, padding: 32, width: '100%', alignItems: 'center' },
  modalIconWrap:{ width: 90, height: 90, borderRadius: 45, backgroundColor: '#1a3fad', justifyContent: 'center', alignItems: 'center', marginBottom: 22 },
  modalTitle:   { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 10, textAlign: 'center' },
  modalDesc:    { fontSize: 15, color: '#1a56db', fontWeight: '600', textAlign: 'center' },
});

export default SignUpScreen;