// app/components/EditProfileScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal, Image, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useApp, useAuth } from '../context/AppContext';
import {
  PatientProfile, UpdateProfileData,
  getProfileByUserId, updateProfile, uploadProfilePhoto,
} from '../services/profileService';
import { API_BASE_URL } from '../services/api.config';

interface EditProfileScreenProps {
  onNavigate: (screen: string) => void;
}

const EditProfileScreen = ({ onNavigate }: EditProfileScreenProps) => {
  const { colors, t }        = useApp();
  const { user, updateUser } = useAuth();

  const [profile, setProfile]               = useState<PatientProfile | null>(null);
  const [loading, setLoading]               = useState(true);
  const [saving, setSaving]                 = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '', phone: '',
    dateOfBirth: '', gender: '', address: '', ville: '',
    bloodGroup: '', height: '', weight: '',
  });
  const [profileImage, setProfileImage]                   = useState<string | null>(null);
  const [showPhotoOptions, setShowPhotoOptions]           = useState(false);
  const [showDatePicker, setShowDatePicker]               = useState(false);
  const [selectedDay, setSelectedDay]                     = useState(1);
  const [selectedMonth, setSelectedMonth]                 = useState(1);
  const [selectedYear, setSelectedYear]                   = useState(1990);
  const [showBloodGroupPicker, setShowBloodGroupPicker]   = useState(false);

  const days   = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    { value: 1, label: 'Janvier' },   { value: 2,  label: 'Fevrier' },
    { value: 3, label: 'Mars' },      { value: 4,  label: 'Avril' },
    { value: 5, label: 'Mai' },       { value: 6,  label: 'Juin' },
    { value: 7, label: 'Juillet' },   { value: 8,  label: 'Aout' },
    { value: 9, label: 'Septembre' }, { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' }, { value: 12, label: 'Decembre' },
  ];
  const years      = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => { if (user?.id) loadProfile(); }, [user?.id]);

  const loadProfile = async () => {
    try {
      const data = await getProfileByUserId(user!.id);
      setProfile(data);
      const rawDate = data.health_info.date_naissance ?? '';
      let d = 1, m = 1, y = 1990;
      if (rawDate) {
        const p = rawDate.split('-');
        y = parseInt(p[0], 10); m = parseInt(p[1], 10); d = parseInt(p[2], 10);
      }
      setSelectedDay(d); setSelectedMonth(m); setSelectedYear(y);
      setFormData({
        nom:         data.personal_info.nom         ?? '',
        prenom:      data.personal_info.prenom      ?? '',
        email:       data.personal_info.email       ?? '',
        phone:       data.personal_info.telephone   ?? '',
        dateOfBirth: rawDate ? `${String(d).padStart(2,'0')}/${String(m).padStart(2,'0')}/${y}` : '',
        gender:      data.health_info.genre         ?? '',
        address:     data.personal_info.adresse     ?? '',
        ville:       data.personal_info.ville       ?? '',
        bloodGroup:  data.health_info.groupe_sanguin ?? '',
        height:      data.health_info.taille ? String(data.health_info.taille) : '',
        weight:      data.health_info.poids  ? String(data.health_info.poids)  : '',
      });
    } catch {
      Alert.alert(t('error'), t('epErrLoad'));
    } finally { setLoading(false); }
  };

  const handleSelectDate = () => {
    const f = `${String(selectedDay).padStart(2,'0')}/${String(selectedMonth).padStart(2,'0')}/${selectedYear}`;
    setFormData(p => ({ ...p, dateOfBirth: f }));
    setShowDatePicker(false);
  };

  const handleSelectBloodGroup = (group: string) => {
    setFormData(p => ({ ...p, bloodGroup: group }));
    setShowBloodGroupPicker(false);
  };

  const requestPermissions = async () => {
    const { status: cam } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: gal } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (cam !== 'granted' || gal !== 'granted') {
      Alert.alert(t('epPermTitle'), t('epErrPermissions')); return false;
    }
    return true;
  };

  const pickAndUpload = async (uri: string) => {
    if (!profile?.id) return;
    setUploadingPhoto(true); setProfileImage(uri);
    try {
      const fileName = uri.split('/').pop() ?? 'photo.jpg';
      const uploaded = await uploadProfilePhoto(profile.id, uri, fileName);
      setProfile(prev => prev ? { ...prev, personal_info: { ...prev.personal_info, photo: uploaded.photo_url } } : prev);
      if (user) updateUser({ ...user, photo: uploaded.photo_url });
      Alert.alert(t('success'), t('epPhotoUpdated'));
    } catch {
      Alert.alert(t('error'), t('epErrPhoto')); setProfileImage(null);
    } finally { setUploadingPhoto(false); }
  };

  const handleTakePhoto = async () => {
    setShowPhotoOptions(false);
    if (!(await requestPermissions())) return;
    const r = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1,1], quality: 0.8 });
    if (!r.canceled && r.assets[0]) await pickAndUpload(r.assets[0].uri);
  };

  const handleChooseFromGallery = async () => {
    setShowPhotoOptions(false);
    if (!(await requestPermissions())) return;
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1,1], quality: 0.8 });
    if (!r.canceled && r.assets[0]) await pickAndUpload(r.assets[0].uri);
  };

  const handleRemovePhoto = () => {
    setShowPhotoOptions(false);
    Alert.alert(t('epDeleteConfirmTitle'), t('epDeleteConfirmMsg'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('aptDelete'), style: 'destructive', onPress: () => setProfileImage(null) },
    ]);
  };

  const handleSave = async () => {
    if (!profile?.id) return;
    let isoDate: string | undefined;
    if (formData.dateOfBirth) {
      const [d, m, y] = formData.dateOfBirth.split('/');
      isoDate = `${y}-${m}-${d}`;
    }
    setSaving(true);
    try {
      const payload: UpdateProfileData = {
        nom: formData.nom.trim() || undefined, prenom: formData.prenom.trim() || undefined,
        email: formData.email.trim() || undefined, telephone: formData.phone.trim() || undefined,
        adresse: formData.address.trim() || undefined, ville: formData.ville.trim() || undefined,
        dateNaissance: isoDate, genre: formData.gender || undefined,
        groupeSanguin: formData.bloodGroup || undefined,
        taille: formData.height ? parseFloat(formData.height) : undefined,
        poids:  formData.weight ? parseFloat(formData.weight) : undefined,
      };
      const updated = await updateProfile(profile.id, payload);
      setProfile(updated);
      if (user) updateUser({ ...user, nom: updated.personal_info.nom, prenom: updated.personal_info.prenom, email: updated.personal_info.email });
      Alert.alert(t('success'), t('profileUpdated'), [{ text: 'OK', onPress: () => onNavigate('profile') }]);
    } catch (err: any) {
      Alert.alert(t('error'), err?.response?.data?.error ?? t('epErrSave'));
    } finally { setSaving(false); }
  };

  const photoUrl = profileImage ?? (profile?.personal_info.photo ? `${API_BASE_URL}${profile.personal_info.photo}` : null);

  const InputField = ({ label, value, field, icon, keyboardType = 'default' }: {
    label: string; value: string; field: string; icon: string; keyboardType?: any;
  }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
        <Ionicons name={icon as any} size={20} color={colors.subText} style={styles.inputIcon} />
        <TextInput style={[styles.input, { color: colors.text }]} value={value}
          onChangeText={text => setFormData(p => ({ ...p, [field]: text }))}
          placeholderTextColor={colors.subText} keyboardType={keyboardType} autoCapitalize="none" />
      </View>
    </View>
  );

  if (loading) return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('profile')}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('epTitle')}</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1a56db" />
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('profile')}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('epTitle')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Photo */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <View style={[styles.profileImagePlaceholder, { backgroundColor: colors.card }]}>
              {uploadingPhoto ? <ActivityIndicator size="large" color="#1a56db" />
                : photoUrl ? <Image source={{ uri: photoUrl }} style={styles.profileImage} />
                : <Ionicons name="person" size={60} color="#1a56db" />}
            </View>
            <TouchableOpacity style={styles.changePhotoButton} onPress={() => setShowPhotoOptions(true)} disabled={uploadingPhoto}>
              <Ionicons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => setShowPhotoOptions(true)} disabled={uploadingPhoto}>
            <Text style={styles.changePhotoText}>
              {uploadingPhoto ? t('epUploading') : t('epChangePhoto')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <InputField label={t('firstName')} value={formData.prenom}  field="prenom"  icon="person-outline" />
          <InputField label={t('lastName')}  value={formData.nom}     field="nom"     icon="person-outline" />
          <InputField label={t('email')}     value={formData.email}   field="email"   icon="mail-outline"   keyboardType="email-address" />
          <InputField label={t('phone')}     value={formData.phone}   field="phone"   icon="call-outline"   keyboardType="phone-pad" />

          {/* Date naissance */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('epDateBirth')}</Text>
            <TouchableOpacity style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={20} color={colors.subText} style={styles.inputIcon} />
              <Text style={[styles.input, { color: formData.dateOfBirth ? colors.text : colors.subText }]}>
                {formData.dateOfBirth || t('epDatePlaceholder')}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.subText} />
            </TouchableOpacity>
          </View>

          {/* Genre */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('epGender')}</Text>
            <View style={styles.genderContainer}>
              {[['homme', t('epMale')], ['femme', t('epFemale')], ['autre', t('epOther')]].map(([val, label]) => (
                <TouchableOpacity key={val}
                  style={[styles.genderButton, { backgroundColor: formData.gender === val ? '#1a3fad' : colors.card, borderColor: formData.gender === val ? '#1a3fad' : '#e5e7eb' }]}
                  onPress={() => setFormData(p => ({ ...p, gender: val }))}>
                  <Text style={[styles.genderButtonText, { color: formData.gender === val ? '#fff' : colors.text }]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <InputField label={t('address')} value={formData.address} field="address" icon="location-outline" />
          <InputField label={t('city')}    value={formData.ville}   field="ville"   icon="business-outline" />

          {/* Groupe sanguin */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('epBloodGroup')}</Text>
            <TouchableOpacity style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]} onPress={() => setShowBloodGroupPicker(true)}>
              <Ionicons name="water-outline" size={20} color={colors.subText} style={styles.inputIcon} />
              <Text style={[styles.input, { color: formData.bloodGroup ? colors.text : colors.subText }]}>
                {formData.bloodGroup || t('epBloodSelect')}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.subText} />
            </TouchableOpacity>
          </View>

          {/* Taille + Poids */}
          <View style={styles.rowInputs}>
            <View style={styles.halfInput}><InputField label={t('epHeight')} value={formData.height} field="height" icon="resize-outline"  keyboardType="decimal-pad" /></View>
            <View style={styles.halfInput}><InputField label={t('epWeight')} value={formData.weight} field="weight" icon="barbell-outline" keyboardType="decimal-pad" /></View>
          </View>

          {formData.height && formData.weight && parseFloat(formData.height) > 0 && parseFloat(formData.weight) > 0 && (
            <View style={styles.imcCard}>
              <Ionicons name="analytics-outline" size={20} color="#1a56db" />
              <Text style={styles.imcText}>
                IMC : {(parseFloat(formData.weight) / parseFloat(formData.height) ** 2).toFixed(1)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.saveButton, saving && { opacity: 0.7 }]} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>{t('epSave')}</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => onNavigate('profile')}>
            <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal : Options photo */}
      <Modal visible={showPhotoOptions} transparent animationType="slide" onRequestClose={() => setShowPhotoOptions(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.photoOptionsModal, { backgroundColor: colors.card }]}>
            <View style={styles.photoOptionsHeader}>
              <Text style={[styles.photoOptionsTitle, { color: colors.text }]}>{t('epPhotoOptions')}</Text>
              <TouchableOpacity onPress={() => setShowPhotoOptions(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
            </View>
            <TouchableOpacity style={[styles.photoOption, { backgroundColor: colors.inputBackground }]} onPress={handleTakePhoto}>
              <View style={styles.photoOptionIcon}><Ionicons name="camera" size={24} color="#1a56db" /></View>
              <Text style={[styles.photoOptionText, { color: colors.text }]}>{t('epTakePhoto')}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.subText} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.photoOption, { backgroundColor: colors.inputBackground }]} onPress={handleChooseFromGallery}>
              <View style={styles.photoOptionIcon}><Ionicons name="images" size={24} color="#1a56db" /></View>
              <Text style={[styles.photoOptionText, { color: colors.text }]}>{t('epGallery')}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.subText} />
            </TouchableOpacity>
            {profileImage && (
              <TouchableOpacity style={[styles.photoOption, { backgroundColor: colors.inputBackground }]} onPress={handleRemovePhoto}>
                <View style={styles.photoOptionIcon}><Ionicons name="trash-outline" size={24} color="#FF6B6B" /></View>
                <Text style={[styles.photoOptionText, { color: '#FF6B6B' }]}>{t('epDeletePhoto')}</Text>
                <Ionicons name="chevron-forward" size={20} color="#FF6B6B" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal : Date picker */}
      <Modal visible={showDatePicker} transparent animationType="slide" onRequestClose={() => setShowDatePicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.pickerModal, { backgroundColor: colors.card }]}>
            <View style={styles.pickerHeader}>
              <Text style={[styles.pickerTitle, { color: colors.text }]}>{t('epBirthTitle')}</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
            </View>
            <View style={styles.datePickerContainer}>
              <ScrollView style={styles.datePicker} showsVerticalScrollIndicator={false}>
                {days.map(d => (
                  <TouchableOpacity key={d} style={[styles.dateItem, selectedDay === d && styles.dateItemSelected]} onPress={() => setSelectedDay(d)}>
                    <Text style={[styles.dateItemText, { color: colors.text }, selectedDay === d && styles.dateItemTextSelected]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <ScrollView style={styles.datePicker} showsVerticalScrollIndicator={false}>
                {months.map(m => (
                  <TouchableOpacity key={m.value} style={[styles.dateItem, selectedMonth === m.value && styles.dateItemSelected]} onPress={() => setSelectedMonth(m.value)}>
                    <Text style={[styles.dateItemText, { color: colors.text }, selectedMonth === m.value && styles.dateItemTextSelected]}>{m.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <ScrollView style={styles.datePicker} showsVerticalScrollIndicator={false}>
                {years.map(y => (
                  <TouchableOpacity key={y} style={[styles.dateItem, selectedYear === y && styles.dateItemSelected]} onPress={() => setSelectedYear(y)}>
                    <Text style={[styles.dateItemText, { color: colors.text }, selectedYear === y && styles.dateItemTextSelected]}>{y}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <TouchableOpacity style={styles.confirmButton} onPress={handleSelectDate}>
              <Text style={styles.confirmButtonText}>{t('epConfirmDate')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal : Groupe sanguin */}
      <Modal visible={showBloodGroupPicker} transparent animationType="slide" onRequestClose={() => setShowBloodGroupPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.pickerModal, { backgroundColor: colors.card }]}>
            <View style={styles.pickerHeader}>
              <Text style={[styles.pickerTitle, { color: colors.text }]}>{t('epBloodTitle')}</Text>
              <TouchableOpacity onPress={() => setShowBloodGroupPicker(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
            </View>
            <View style={styles.bloodGroupGrid}>
              {bloodGroups.map(group => (
                <TouchableOpacity key={group}
                  style={[styles.bloodGroupItem, { backgroundColor: colors.inputBackground }, formData.bloodGroup === group && styles.bloodGroupItemSelected]}
                  onPress={() => handleSelectBloodGroup(group)}>
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
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  profileSection: { alignItems: 'center', paddingVertical: 20 },
  profileImageContainer: { position: 'relative', marginBottom: 15 },
  profileImagePlaceholder: { width: 110, height: 110, borderRadius: 55, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#1a56db', overflow: 'hidden' },
  profileImage: { width: '100%', height: '100%' },
  changePhotoButton: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#1a56db', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff' },
  changePhotoText: { color: '#1a56db', fontSize: 14, fontWeight: '600', marginTop: 10 },
  formContainer: { paddingHorizontal: 20 },
  inputContainer: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1.5, borderColor: '#e5e7eb', backgroundColor: 'rgba(255,255,255,0.88)', paddingHorizontal: 16, height: 50, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15 },
  genderContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  genderButton: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: '#e5e7eb', alignItems: 'center' },
  genderButtonText: { fontSize: 14, fontWeight: '600' },
  rowInputs: { flexDirection: 'row', gap: 15 },
  halfInput: { flex: 1 },
  imcCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#eff6ff', borderRadius: 12, padding: 12, marginBottom: 16 },
  imcText: { fontSize: 15, fontWeight: '700', color: '#1a56db' },
  buttonContainer: { paddingHorizontal: 20, marginTop: 20 },
  saveButton: { backgroundColor: '#1a3fad', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginBottom: 15, shadowColor: '#1a56db', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelButton: { paddingVertical: 16, borderRadius: 14, alignItems: 'center', borderWidth: 1.5, borderColor: '#e5e7eb' },
  cancelButtonText: { color: '#374151', fontSize: 15, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  photoOptionsModal: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 30 },
  photoOptionsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  photoOptionsTitle: { fontSize: 18, fontWeight: '600' },
  photoOption: { flexDirection: 'row', alignItems: 'center', padding: 16, marginHorizontal: 20, marginTop: 12, borderRadius: 14 },
  photoOptionIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  photoOptionText: { flex: 1, fontSize: 15, fontWeight: '500' },
  pickerModal: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%', paddingBottom: 30 },
  pickerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  pickerTitle: { fontSize: 18, fontWeight: '600' },
  datePickerContainer: { flexDirection: 'row', padding: 20, height: 250 },
  datePicker: { flex: 1 },
  dateItem: { paddingVertical: 12, alignItems: 'center' },
  dateItemSelected: { backgroundColor: '#1a3fad', borderRadius: 10 },
  dateItemText: { fontSize: 16 },
  dateItemTextSelected: { color: '#fff', fontWeight: '600' },
  confirmButton: { backgroundColor: '#1a3fad', paddingVertical: 15, marginHorizontal: 20, borderRadius: 20, alignItems: 'center' },
  confirmButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  bloodGroupGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 20, gap: 15 },
  bloodGroupItem: { width: '22%', aspectRatio: 1, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  bloodGroupItemSelected: { borderColor: '#1a56db', backgroundColor: '#eff6ff' },
  bloodGroupText: { fontSize: 16, fontWeight: 'bold', marginTop: 5 },
});

export default EditProfileScreen;
