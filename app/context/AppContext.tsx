// app/context/AppContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

const translations = {
  fr: {
    home: 'Accueil', profile: 'Profil', appointments: 'Rendez-vous',
    notifications: 'Notifications', favorites: 'Favoris',
    editProfile: 'Modifier le profil', language: 'Langue', theme: 'Apparence',
    prescriptions: 'Mes Ordonnances', paymentMethod: 'Moyen de Paiement',
    faqs: 'FAQs', logout: 'Déconnexion',
    save: 'Enregistrer', cancel: 'Annuler', confirm: 'Confirmer',
    success: 'Succès', error: 'Erreur', loading: 'Chargement...',
    profileUpdated: 'Votre profil a été mis à jour avec succès !',
    languageChanged: 'La langue a été changée en',
    themeChanged: 'Le thème a été modifié avec succès',
    firstName: 'Prénom', lastName: 'Nom', email: 'Email',
    phone: 'Téléphone', address: 'Adresse', city: 'Ville',
    dateOfBirth: 'Date de Naissance', gender: 'Genre',
    bloodGroup: 'Groupe Sanguin', height: 'Taille (m)', weight: 'Poids (kg)',
    male: 'Homme', female: 'Femme', other: 'Autre',
    areYouSureLogout: 'Êtes-vous sûr de vouloir vous déconnecter ?',
    healthInfo: 'Informations de santé', bloodType: 'Groupe sanguin',
    age: 'Âge', bmi: 'Statut IMC', rdvCount: 'Rendez-vous',
    noNotification: 'Aucune notification',
    noNotificationSub: "Vous n'avez pas encore reçu de notification.",
    markAllRead: 'Tout lire',
    // HomeScreen
    bestDoctors: 'Meilleurs Docteurs', seeAll: 'Voir tout',
    searchPlaceholder: 'Rechercher médecin, médicaments...',
    doctor: 'Docteur', pharmacy: 'Pharmacie', hospital: 'Hôpital', ambulance: 'Ambulance',
    bannerTitle1: 'Protection précoce pour', bannerTitle2: 'la santé de votre famille',
    learnMore: 'En savoir plus', loadingDoctors: 'Chargement des médecins...',
    retryButton: 'Réessayer', noDoctors: 'Aucun médecin disponible',
    cannotLoadDoctors: 'Impossible de charger les médecins',
    // Appointments, Booking, ChangePassword, CreateNewPassword
    aptTitle: 'Rendez-vous',
    aptLoading: 'Chargement de vos rendez-vous...',
    aptPending: 'En attente',
    aptConfirmed: 'Confirmé',
    aptPast: 'Passé',
    aptRejected: 'Refusé',
    aptOnline: 'En ligne',
    aptHome: 'À domicile',
    aptHospital: 'À l\'hôpital',
    aptMoreDetails: 'Plus de détails',
    aptHideDetails: 'Masquer les détails',
    aptCall: 'Appeler',
    aptWhatsApp: 'WhatsApp',
    aptDirections: 'Itinéraire',
    aptJoinVideo: 'Rejoindre la consultation',
    aptConfirmedMsg: 'Rendez-vous confirmé',
    aptReschedule: 'Reprogrammer',
    aptDelete: 'Supprimer',
    aptEmpty: 'Aucun rendez-vous',
    aptCancelTitle: 'Annuler le rendez-vous',
    aptCancelMsg: 'Êtes-vous sûr de vouloir annuler ce rendez-vous ?',
    aptDeleteTitle: 'Supprimer le rendez-vous',
    aptDeleteMsg: 'Êtes-vous sûr de vouloir supprimer ce rendez-vous ?',
    aptCancelSuccess: 'Rendez-vous annulé avec succès',
    aptJoinTitle: 'Rejoindre la consultation',
    aptJoinMsg: 'Vous allez être redirigé vers la vidéoconférence',
    aptJoin: 'Rejoindre',
    aptErrLoad: 'Impossible de charger vos rendez-vous. Veuillez réessayer.',
    bkTitle: 'Nouveau rendez-vous',
    bkTypeTitle: 'Type de consultation',
    bkTypeSubtitle: 'Choisissez le type de consultation qui vous convient',
    bkOnline: 'Consultation en ligne',
    bkOnlineDesc: 'Consultation par vidéo',
    bkHome: 'Consultation à domicile',
    bkHomeDesc: 'Le médecin vient chez vous',
    bkHospital: 'Consultation à l\'hôpital',
    bkHospitalDesc: 'Rendez-vous en présentiel',
    bkDescLabel: 'Description du problème',
    bkDescPlaceholder: 'Décrivez brièvement votre problème de santé...',
    bkNext: 'Suivant',
    bkValidationMsg: 'Veuillez sélectionner un type et ajouter une description',
    cpTitle: 'Changer le mot de passe',
    cpInfo: 'Votre mot de passe doit contenir au moins 8 caractères',
    cpCurrent: 'Mot de passe actuel',
    cpCurrentPlaceholder: 'Entrez votre mot de passe actuel',
    cpNew: 'Nouveau mot de passe',
    cpNewPlaceholder: 'Entrez votre nouveau mot de passe',
    cpConfirm: 'Confirmer le nouveau mot de passe',
    cpConfirmPlaceholder: 'Confirmez votre nouveau mot de passe',
    cpForgot: 'Mot de passe oublié ?',
    cpWeak: 'Faible',
    cpMedium: 'Moyen',
    cpStrong: 'Fort',
    cpMatch: 'Les mots de passe correspondent',
    cpNoMatch: 'Les mots de passe ne correspondent pas',
    cpSave: 'Mettre à jour le mot de passe',
    cpSuccess: 'Votre mot de passe a été modifié avec succès',
    cpErrCurrent: 'Veuillez entrer votre mot de passe actuel',
    cpErrNew: 'Veuillez entrer un nouveau mot de passe',
    cpErrLen: 'Le mot de passe doit contenir au moins 8 caractères',
    cpErrSame: 'Le nouveau mot de passe doit être différent de l\'ancien',
    cnpTitle: 'Créer un nouveau mot de passe',
    cnpDesc: 'Créez votre nouveau mot de passe pour vous connecter',
    cnpNew: 'Nouveau mot de passe',
    cnpConfirm: 'Confirmer le mot de passe',
    cnpCreate: 'Créer le mot de passe',
    cnpSuccess: 'Vous avez réinitialisé votre mot de passe avec succès.',
    cnpErrLen: 'Le mot de passe doit contenir au moins 6 caractères',
    cnpErrMatch: 'Les mots de passe ne correspondent pas',
    cnpLogin: 'Connexion',

  },
  en: {
    home: 'Home', profile: 'Profile', appointments: 'Appointments',
    notifications: 'Notifications', favorites: 'Favorites',
    editProfile: 'Edit Profile', language: 'Language', theme: 'Appearance',
    prescriptions: 'My Prescriptions', paymentMethod: 'Payment Method',
    faqs: 'FAQs', logout: 'Logout',
    save: 'Save', cancel: 'Cancel', confirm: 'Confirm',
    success: 'Success', error: 'Error', loading: 'Loading...',
    profileUpdated: 'Your profile has been updated successfully!',
    languageChanged: 'Language changed to',
    themeChanged: 'Theme changed successfully',
    firstName: 'First Name', lastName: 'Last Name', email: 'Email',
    phone: 'Phone', address: 'Address', city: 'City',
    dateOfBirth: 'Date of Birth', gender: 'Gender',
    bloodGroup: 'Blood Group', height: 'Height (m)', weight: 'Weight (kg)',
    male: 'Male', female: 'Female', other: 'Other',
    areYouSureLogout: 'Are you sure you want to logout?',
    healthInfo: 'Health Information', bloodType: 'Blood Type',
    age: 'Age', bmi: 'BMI Status', rdvCount: 'Appointments',
    noNotification: 'No notifications',
    noNotificationSub: "You haven't received any notification yet.",
    markAllRead: 'Mark all read',
    bestDoctors: 'Best Doctors', seeAll: 'See all',
    searchPlaceholder: 'Search doctor, medications...',
    doctor: 'Doctor', pharmacy: 'Pharmacy', hospital: 'Hospital', ambulance: 'Ambulance',
    bannerTitle1: 'Early protection for', bannerTitle2: 'your family health',
    learnMore: 'Learn more', loadingDoctors: 'Loading doctors...',
    retryButton: 'Retry', noDoctors: 'No doctors available',
    cannotLoadDoctors: 'Unable to load doctors',
    // Appointments, Booking, ChangePassword, CreateNewPassword
    aptTitle: 'Appointments',
    aptLoading: 'Loading your appointments...',
    aptPending: 'Pending',
    aptConfirmed: 'Confirmed',
    aptPast: 'Past',
    aptRejected: 'Rejected',
    aptOnline: 'Online',
    aptHome: 'Home visit',
    aptHospital: 'Hospital',
    aptMoreDetails: 'More details',
    aptHideDetails: 'Hide details',
    aptCall: 'Call',
    aptWhatsApp: 'WhatsApp',
    aptDirections: 'Directions',
    aptJoinVideo: 'Join consultation',
    aptConfirmedMsg: 'Appointment confirmed',
    aptReschedule: 'Reschedule',
    aptDelete: 'Delete',
    aptEmpty: 'No appointments',
    aptCancelTitle: 'Cancel appointment',
    aptCancelMsg: 'Are you sure you want to cancel this appointment?',
    aptDeleteTitle: 'Delete appointment',
    aptDeleteMsg: 'Are you sure you want to delete this appointment?',
    aptCancelSuccess: 'Appointment cancelled successfully',
    aptJoinTitle: 'Join consultation',
    aptJoinMsg: 'You will be redirected to the video call',
    aptJoin: 'Join',
    aptErrLoad: 'Unable to load your appointments. Please try again.',
    bkTitle: 'New appointment',
    bkTypeTitle: 'Consultation type',
    bkTypeSubtitle: 'Choose the type of consultation that suits you',
    bkOnline: 'Online consultation',
    bkOnlineDesc: 'Video consultation',
    bkHome: 'Home visit',
    bkHomeDesc: 'The doctor comes to you',
    bkHospital: 'Hospital consultation',
    bkHospitalDesc: 'In-person appointment',
    bkDescLabel: 'Problem description',
    bkDescPlaceholder: 'Briefly describe your health problem...',
    bkNext: 'Next',
    bkValidationMsg: 'Please select a type and add a description',
    cpTitle: 'Change password',
    cpInfo: 'Your password must contain at least 8 characters',
    cpCurrent: 'Current password',
    cpCurrentPlaceholder: 'Enter your current password',
    cpNew: 'New password',
    cpNewPlaceholder: 'Enter your new password',
    cpConfirm: 'Confirm new password',
    cpConfirmPlaceholder: 'Confirm your new password',
    cpForgot: 'Forgot password?',
    cpWeak: 'Weak',
    cpMedium: 'Medium',
    cpStrong: 'Strong',
    cpMatch: 'Passwords match',
    cpNoMatch: 'Passwords do not match',
    cpSave: 'Update password',
    cpSuccess: 'Your password has been changed successfully',
    cpErrCurrent: 'Please enter your current password',
    cpErrNew: 'Please enter a new password',
    cpErrLen: 'Password must contain at least 8 characters',
    cpErrSame: 'New password must be different from old password',
    cnpTitle: 'Create new password',
    cnpDesc: 'Create your new password to log in',
    cnpNew: 'New password',
    cnpConfirm: 'Confirm password',
    cnpCreate: 'Create password',
    cnpSuccess: 'You have successfully reset your password.',
    cnpErrLen: 'Password must contain at least 6 characters',
    cnpErrMatch: 'Passwords do not match',
    cnpLogin: 'Login',

  },
  es: {
    home: 'Inicio', profile: 'Perfil', appointments: 'Citas',
    notifications: 'Notificaciones', favorites: 'Favoritos',
    editProfile: 'Editar perfil', language: 'Idioma', theme: 'Apariencia',
    prescriptions: 'Mis recetas', paymentMethod: 'Método de pago',
    faqs: 'Preguntas frecuentes', logout: 'Cerrar sesión',
    save: 'Guardar', cancel: 'Cancelar', confirm: 'Confirmar',
    success: 'Éxito', error: 'Error', loading: 'Cargando...',
    profileUpdated: '¡Tu perfil ha sido actualizado con éxito!',
    languageChanged: 'Idioma cambiado a',
    themeChanged: 'Tema cambiado con éxito',
    firstName: 'Nombre', lastName: 'Apellido', email: 'Correo',
    phone: 'Teléfono', address: 'Dirección', city: 'Ciudad',
    dateOfBirth: 'Fecha de nacimiento', gender: 'Género',
    bloodGroup: 'Grupo sanguíneo', height: 'Altura (m)', weight: 'Peso (kg)',
    male: 'Hombre', female: 'Mujer', other: 'Otro',
    areYouSureLogout: '¿Estás seguro de que quieres cerrar sesión?',
    healthInfo: 'Información de salud', bloodType: 'Tipo de sangre',
    age: 'Edad', bmi: 'Estado IMC', rdvCount: 'Citas',
    noNotification: 'Sin notificaciones',
    noNotificationSub: 'Aún no has recibido ninguna notificación.',
    markAllRead: 'Marcar todo como leído',
    bestDoctors: 'Mejores Doctores', seeAll: 'Ver todo',
    searchPlaceholder: 'Buscar médico, medicamentos...',
    doctor: 'Doctor', pharmacy: 'Farmacia', hospital: 'Hospital', ambulance: 'Ambulancia',
    bannerTitle1: 'Protección temprana para', bannerTitle2: 'la salud de tu familia',
    learnMore: 'Saber más', loadingDoctors: 'Cargando médicos...',
    retryButton: 'Reintentar', noDoctors: 'No hay médicos disponibles',
    cannotLoadDoctors: 'No se pueden cargar los médicos',
    // Appointments, Booking, ChangePassword, CreateNewPassword
    aptTitle: 'Citas',
    aptLoading: 'Cargando sus citas...',
    aptPending: 'Pendiente',
    aptConfirmed: 'Confirmada',
    aptPast: 'Pasada',
    aptRejected: 'Rechazada',
    aptOnline: 'En línea',
    aptHome: 'A domicilio',
    aptHospital: 'Hospital',
    aptMoreDetails: 'Más detalles',
    aptHideDetails: 'Ocultar detalles',
    aptCall: 'Llamar',
    aptWhatsApp: 'WhatsApp',
    aptDirections: 'Ruta',
    aptJoinVideo: 'Unirse a la consulta',
    aptConfirmedMsg: 'Cita confirmada',
    aptReschedule: 'Reprogramar',
    aptDelete: 'Eliminar',
    aptEmpty: 'Sin citas',
    aptCancelTitle: 'Cancelar cita',
    aptCancelMsg: '¿Está seguro de que desea cancelar esta cita?',
    aptDeleteTitle: 'Eliminar cita',
    aptDeleteMsg: '¿Está seguro de que desea eliminar esta cita?',
    aptCancelSuccess: 'Cita cancelada con éxito',
    aptJoinTitle: 'Unirse a la consulta',
    aptJoinMsg: 'Será redirigido a la videoconferencia',
    aptJoin: 'Unirse',
    aptErrLoad: 'No se pueden cargar sus citas. Inténtelo de nuevo.',
    bkTitle: 'Nueva cita',
    bkTypeTitle: 'Tipo de consulta',
    bkTypeSubtitle: 'Elija el tipo de consulta que más le convenga',
    bkOnline: 'Consulta en línea',
    bkOnlineDesc: 'Consulta por video',
    bkHome: 'Consulta a domicilio',
    bkHomeDesc: 'El médico viene a usted',
    bkHospital: 'Consulta en hospital',
    bkHospitalDesc: 'Cita presencial',
    bkDescLabel: 'Descripción del problema',
    bkDescPlaceholder: 'Describa brevemente su problema de salud...',
    bkNext: 'Siguiente',
    bkValidationMsg: 'Seleccione un tipo y agregue una descripción',
    cpTitle: 'Cambiar contraseña',
    cpInfo: 'Su contraseña debe tener al menos 8 caracteres',
    cpCurrent: 'Contraseña actual',
    cpCurrentPlaceholder: 'Ingrese su contraseña actual',
    cpNew: 'Nueva contraseña',
    cpNewPlaceholder: 'Ingrese su nueva contraseña',
    cpConfirm: 'Confirmar nueva contraseña',
    cpConfirmPlaceholder: 'Confirme su nueva contraseña',
    cpForgot: '¿Olvidó su contraseña?',
    cpWeak: 'Débil',
    cpMedium: 'Medio',
    cpStrong: 'Fuerte',
    cpMatch: 'Las contraseñas coinciden',
    cpNoMatch: 'Las contraseñas no coinciden',
    cpSave: 'Actualizar contraseña',
    cpSuccess: 'Su contraseña ha sido cambiada con éxito',
    cpErrCurrent: 'Ingrese su contraseña actual',
    cpErrNew: 'Ingrese una nueva contraseña',
    cpErrLen: 'La contraseña debe tener al menos 8 caracteres',
    cpErrSame: 'La nueva contraseña debe ser diferente a la anterior',
    cnpTitle: 'Crear nueva contraseña',
    cnpDesc: 'Cree su nueva contraseña para iniciar sesión',
    cnpNew: 'Nueva contraseña',
    cnpConfirm: 'Confirmar contraseña',
    cnpCreate: 'Crear contraseña',
    cnpSuccess: 'Ha restablecido su contraseña con éxito.',
    cnpErrLen: 'La contraseña debe tener al menos 6 caracteres',
    cnpErrMatch: 'Las contraseñas no coinciden',
    cnpLogin: 'Iniciar sesión',

  },
  de: {
    home: 'Startseite', profile: 'Profil', appointments: 'Termine',
    notifications: 'Benachrichtigungen', favorites: 'Favoriten',
    editProfile: 'Profil bearbeiten', language: 'Sprache', theme: 'Erscheinungsbild',
    prescriptions: 'Meine Rezepte', paymentMethod: 'Zahlungsmethode',
    faqs: 'FAQ', logout: 'Abmelden',
    save: 'Speichern', cancel: 'Abbrechen', confirm: 'Bestätigen',
    success: 'Erfolg', error: 'Fehler', loading: 'Laden...',
    profileUpdated: 'Ihr Profil wurde erfolgreich aktualisiert!',
    languageChanged: 'Sprache geändert zu',
    themeChanged: 'Thema erfolgreich geändert',
    firstName: 'Vorname', lastName: 'Nachname', email: 'E-Mail',
    phone: 'Telefon', address: 'Adresse', city: 'Stadt',
    dateOfBirth: 'Geburtsdatum', gender: 'Geschlecht',
    bloodGroup: 'Blutgruppe', height: 'Größe (m)', weight: 'Gewicht (kg)',
    male: 'Mann', female: 'Frau', other: 'Sonstiges',
    areYouSureLogout: 'Möchten Sie sich wirklich abmelden?',
    healthInfo: 'Gesundheitsinformationen', bloodType: 'Blutgruppe',
    age: 'Alter', bmi: 'BMI-Status', rdvCount: 'Termine',
    noNotification: 'Keine Benachrichtigungen',
    noNotificationSub: 'Sie haben noch keine Benachrichtigung erhalten.',
    markAllRead: 'Alle gelesen markieren',
    bestDoctors: 'Beste Ärzte', seeAll: 'Alle sehen',
    searchPlaceholder: 'Arzt, Medikamente suchen...',
    doctor: 'Arzt', pharmacy: 'Apotheke', hospital: 'Krankenhaus', ambulance: 'Krankenwagen',
    bannerTitle1: 'Früher Schutz für', bannerTitle2: 'die Gesundheit Ihrer Familie',
    learnMore: 'Mehr erfahren', loadingDoctors: 'Ärzte werden geladen...',
    retryButton: 'Erneut versuchen', noDoctors: 'Keine Ärzte verfügbar',
    cannotLoadDoctors: 'Ärzte konnten nicht geladen werden',
    // Appointments, Booking, ChangePassword, CreateNewPassword
    aptTitle: 'Termine',
    aptLoading: 'Ihre Termine werden geladen...',
    aptPending: 'Ausstehend',
    aptConfirmed: 'Bestätigt',
    aptPast: 'Vergangen',
    aptRejected: 'Abgelehnt',
    aptOnline: 'Online',
    aptHome: 'Hausbesuch',
    aptHospital: 'Krankenhaus',
    aptMoreDetails: 'Mehr Details',
    aptHideDetails: 'Details ausblenden',
    aptCall: 'Anrufen',
    aptWhatsApp: 'WhatsApp',
    aptDirections: 'Route',
    aptJoinVideo: 'Konsultation beitreten',
    aptConfirmedMsg: 'Termin bestätigt',
    aptReschedule: 'Neu planen',
    aptDelete: 'Löschen',
    aptEmpty: 'Keine Termine',
    aptCancelTitle: 'Termin absagen',
    aptCancelMsg: 'Möchten Sie diesen Termin wirklich absagen?',
    aptDeleteTitle: 'Termin löschen',
    aptDeleteMsg: 'Möchten Sie diesen Termin wirklich löschen?',
    aptCancelSuccess: 'Termin erfolgreich abgesagt',
    aptJoinTitle: 'Konsultation beitreten',
    aptJoinMsg: 'Sie werden zur Videokonferenz weitergeleitet',
    aptJoin: 'Beitreten',
    aptErrLoad: 'Termine können nicht geladen werden. Bitte versuchen Sie es erneut.',
    bkTitle: 'Neuer Termin',
    bkTypeTitle: 'Konsultationstyp',
    bkTypeSubtitle: 'Wählen Sie den für Sie passenden Konsultationstyp',
    bkOnline: 'Online-Konsultation',
    bkOnlineDesc: 'Video-Konsultation',
    bkHome: 'Hausbesuch',
    bkHomeDesc: 'Der Arzt kommt zu Ihnen',
    bkHospital: 'Krankenhausbesuch',
    bkHospitalDesc: 'Persönlicher Termin',
    bkDescLabel: 'Problembeschreibung',
    bkDescPlaceholder: 'Beschreiben Sie kurz Ihr Gesundheitsproblem...',
    bkNext: 'Weiter',
    bkValidationMsg: 'Bitte wählen Sie einen Typ und fügen Sie eine Beschreibung hinzu',
    cpTitle: 'Passwort ändern',
    cpInfo: 'Ihr Passwort muss mindestens 8 Zeichen enthalten',
    cpCurrent: 'Aktuelles Passwort',
    cpCurrentPlaceholder: 'Geben Sie Ihr aktuelles Passwort ein',
    cpNew: 'Neues Passwort',
    cpNewPlaceholder: 'Geben Sie Ihr neues Passwort ein',
    cpConfirm: 'Neues Passwort bestätigen',
    cpConfirmPlaceholder: 'Bestätigen Sie Ihr neues Passwort',
    cpForgot: 'Passwort vergessen?',
    cpWeak: 'Schwach',
    cpMedium: 'Mittel',
    cpStrong: 'Stark',
    cpMatch: 'Passwörter stimmen überein',
    cpNoMatch: 'Passwörter stimmen nicht überein',
    cpSave: 'Passwort aktualisieren',
    cpSuccess: 'Ihr Passwort wurde erfolgreich geändert',
    cpErrCurrent: 'Bitte geben Sie Ihr aktuelles Passwort ein',
    cpErrNew: 'Bitte geben Sie ein neues Passwort ein',
    cpErrLen: 'Passwort muss mindestens 8 Zeichen enthalten',
    cpErrSame: 'Das neue Passwort muss sich vom alten unterscheiden',
    cnpTitle: 'Neues Passwort erstellen',
    cnpDesc: 'Erstellen Sie Ihr neues Passwort zum Einloggen',
    cnpNew: 'Neues Passwort',
    cnpConfirm: 'Passwort bestätigen',
    cnpCreate: 'Passwort erstellen',
    cnpSuccess: 'Sie haben Ihr Passwort erfolgreich zurückgesetzt.',
    cnpErrLen: 'Passwort muss mindestens 6 Zeichen enthalten',
    cnpErrMatch: 'Passwörter stimmen nicht überein',
    cnpLogin: 'Anmelden',

  },
  ar: {
    home: 'الرئيسية', profile: 'الملف الشخصي', appointments: 'المواعيد',
    notifications: 'الإشعارات', favorites: 'المفضلة',
    editProfile: 'تعديل الملف الشخصي', language: 'اللغة', theme: 'المظهر',
    prescriptions: 'وصفاتي الطبية', paymentMethod: 'طريقة الدفع',
    faqs: 'الأسئلة الشائعة', logout: 'تسجيل الخروج',
    save: 'حفظ', cancel: 'إلغاء', confirm: 'تأكيد',
    success: 'نجاح', error: 'خطأ', loading: 'جارٍ التحميل...',
    profileUpdated: 'تم تحديث ملفك الشخصي بنجاح!',
    languageChanged: 'تم تغيير اللغة إلى',
    themeChanged: 'تم تغيير السمة بنجاح',
    firstName: 'الاسم الأول', lastName: 'اسم العائلة', email: 'البريد الإلكتروني',
    phone: 'الهاتف', address: 'العنوان', city: 'المدينة',
    dateOfBirth: 'تاريخ الميلاد', gender: 'الجنس',
    bloodGroup: 'فصيلة الدم', height: 'الطول (م)', weight: 'الوزن (كغ)',
    male: 'ذكر', female: 'أنثى', other: 'آخر',
    areYouSureLogout: 'هل أنت متأكد أنك تريد تسجيل الخروج؟',
    healthInfo: 'معلومات صحية', bloodType: 'فصيلة الدم',
    age: 'العمر', bmi: 'حالة مؤشر كتلة الجسم', rdvCount: 'المواعيد',
    noNotification: 'لا توجد إشعارات',
    noNotificationSub: 'لم تتلق أي إشعار بعد.',
    markAllRead: 'تعليم الكل كمقروء',
    bestDoctors: 'أفضل الأطباء', seeAll: 'عرض الكل',
    searchPlaceholder: 'ابحث عن طبيب، أدوية...',
    doctor: 'طبيب', pharmacy: 'صيدلية', hospital: 'مستشفى', ambulance: 'إسعاف',
    bannerTitle1: 'حماية مبكرة', bannerTitle2: 'لصحة عائلتك',
    learnMore: 'اعرف المزيد', loadingDoctors: 'جارٍ تحميل الأطباء...',
    retryButton: 'إعادة المحاولة', noDoctors: 'لا يوجد أطباء متاحون',
    cannotLoadDoctors: 'تعذر تحميل الأطباء',
    // Appointments, Booking, ChangePassword, CreateNewPassword
    aptTitle: 'المواعيد',
    aptLoading: 'جارٍ تحميل مواعيدك...',
    aptPending: 'قيد الانتظار',
    aptConfirmed: 'مؤكد',
    aptPast: 'منتهي',
    aptRejected: 'مرفوض',
    aptOnline: 'عبر الإنترنت',
    aptHome: 'في المنزل',
    aptHospital: 'في المستشفى',
    aptMoreDetails: 'مزيد من التفاصيل',
    aptHideDetails: 'إخفاء التفاصيل',
    aptCall: 'اتصال',
    aptWhatsApp: 'واتساب',
    aptDirections: 'الاتجاهات',
    aptJoinVideo: 'الانضمام للاستشارة',
    aptConfirmedMsg: 'الموعد مؤكد',
    aptReschedule: 'إعادة جدولة',
    aptDelete: 'حذف',
    aptEmpty: 'لا توجد مواعيد',
    aptCancelTitle: 'إلغاء الموعد',
    aptCancelMsg: 'هل أنت متأكد أنك تريد إلغاء هذا الموعد؟',
    aptDeleteTitle: 'حذف الموعد',
    aptDeleteMsg: 'هل أنت متأكد أنك تريد حذف هذا الموعد؟',
    aptCancelSuccess: 'تم إلغاء الموعد بنجاح',
    aptJoinTitle: 'الانضمام للاستشارة',
    aptJoinMsg: 'سيتم توجيهك إلى مؤتمر الفيديو',
    aptJoin: 'انضمام',
    aptErrLoad: 'تعذر تحميل مواعيدك. يرجى المحاولة مرة أخرى.',
    bkTitle: 'موعد جديد',
    bkTypeTitle: 'نوع الاستشارة',
    bkTypeSubtitle: 'اختر نوع الاستشارة المناسب لك',
    bkOnline: 'استشارة عبر الإنترنت',
    bkOnlineDesc: 'استشارة بالفيديو',
    bkHome: 'استشارة في المنزل',
    bkHomeDesc: 'الطبيب يأتي إليك',
    bkHospital: 'استشارة في المستشفى',
    bkHospitalDesc: 'موعد حضوري',
    bkDescLabel: 'وصف المشكلة',
    bkDescPlaceholder: 'صف مشكلتك الصحية باختصار...',
    bkNext: 'التالي',
    bkValidationMsg: 'الرجاء اختيار النوع وإضافة وصف',
    cpTitle: 'تغيير كلمة المرور',
    cpInfo: 'يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل',
    cpCurrent: 'كلمة المرور الحالية',
    cpCurrentPlaceholder: 'أدخل كلمة مرورك الحالية',
    cpNew: 'كلمة المرور الجديدة',
    cpNewPlaceholder: 'أدخل كلمة مرورك الجديدة',
    cpConfirm: 'تأكيد كلمة المرور الجديدة',
    cpConfirmPlaceholder: 'أكد كلمة مرورك الجديدة',
    cpForgot: 'هل نسيت كلمة المرور؟',
    cpWeak: 'ضعيفة',
    cpMedium: 'متوسطة',
    cpStrong: 'قوية',
    cpMatch: 'كلمات المرور متطابقة',
    cpNoMatch: 'كلمات المرور غير متطابقة',
    cpSave: 'تحديث كلمة المرور',
    cpSuccess: 'تم تغيير كلمة مرورك بنجاح',
    cpErrCurrent: 'الرجاء إدخال كلمة مرورك الحالية',
    cpErrNew: 'الرجاء إدخال كلمة مرور جديدة',
    cpErrLen: 'يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل',
    cpErrSame: 'يجب أن تكون كلمة المرور الجديدة مختلفة عن القديمة',
    cnpTitle: 'إنشاء كلمة مرور جديدة',
    cnpDesc: 'أنشئ كلمة مرورك الجديدة لتسجيل الدخول',
    cnpNew: 'كلمة المرور الجديدة',
    cnpConfirm: 'تأكيد كلمة المرور',
    cnpCreate: 'إنشاء كلمة المرور',
    cnpSuccess: 'لقد أعدت تعيين كلمة مرورك بنجاح.',
    cnpErrLen: 'يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل',
    cnpErrMatch: 'كلمات المرور غير متطابقة',
    cnpLogin: 'تسجيل الدخول',

  },
  zh: {
    home: '首页', profile: '个人资料', appointments: '预约',
    notifications: '通知', favorites: '收藏',
    editProfile: '编辑资料', language: '语言', theme: '外观',
    prescriptions: '我的处方', paymentMethod: '支付方式',
    faqs: '常见问题', logout: '退出登录',
    save: '保存', cancel: '取消', confirm: '确认',
    success: '成功', error: '错误', loading: '加载中...',
    profileUpdated: '您的资料已成功更新！',
    languageChanged: '语言已更改为',
    themeChanged: '主题已成功更改',
    firstName: '名', lastName: '姓', email: '邮箱',
    phone: '电话', address: '地址', city: '城市',
    dateOfBirth: '出生日期', gender: '性别',
    bloodGroup: '血型', height: '身高（米）', weight: '体重（千克）',
    male: '男', female: '女', other: '其他',
    areYouSureLogout: '您确定要退出登录吗？',
    healthInfo: '健康信息', bloodType: '血型',
    age: '年龄', bmi: 'BMI状态', rdvCount: '预约',
    noNotification: '暂无通知',
    noNotificationSub: '您还没有收到任何通知。',
    markAllRead: '全部标为已读',
    bestDoctors: '最佳医生', seeAll: '查看全部',
    searchPlaceholder: '搜索医生、药品...',
    doctor: '医生', pharmacy: '药店', hospital: '医院', ambulance: '救护车',
    bannerTitle1: '早期保护', bannerTitle2: '您家人的健康',
    learnMore: '了解更多', loadingDoctors: '正在加载医生...',
    retryButton: '重试', noDoctors: '暂无医生',
    cannotLoadDoctors: '无法加载医生',
    // Appointments, Booking, ChangePassword, CreateNewPassword
    aptTitle: '预约',
    aptLoading: '正在加载您的预约...',
    aptPending: '待处理',
    aptConfirmed: '已确认',
    aptPast: '已过期',
    aptRejected: '已拒绝',
    aptOnline: '线上',
    aptHome: '上门',
    aptHospital: '医院',
    aptMoreDetails: '更多详情',
    aptHideDetails: '隐藏详情',
    aptCall: '通话',
    aptWhatsApp: 'WhatsApp',
    aptDirections: '导航',
    aptJoinVideo: '加入会诊',
    aptConfirmedMsg: '预约已确认',
    aptReschedule: '重新安排',
    aptDelete: '删除',
    aptEmpty: '暂无预约',
    aptCancelTitle: '取消预约',
    aptCancelMsg: '您确定要取消此预约吗？',
    aptDeleteTitle: '删除预约',
    aptDeleteMsg: '您确定要删除此预约吗？',
    aptCancelSuccess: '预约已成功取消',
    aptJoinTitle: '加入会诊',
    aptJoinMsg: '您将被重定向到视频会议',
    aptJoin: '加入',
    aptErrLoad: '无法加载您的预约，请重试。',
    bkTitle: '新预约',
    bkTypeTitle: '会诊类型',
    bkTypeSubtitle: '选择适合您的会诊类型',
    bkOnline: '线上会诊',
    bkOnlineDesc: '视频会诊',
    bkHome: '上门会诊',
    bkHomeDesc: '医生上门',
    bkHospital: '医院会诊',
    bkHospitalDesc: '面对面预约',
    bkDescLabel: '问题描述',
    bkDescPlaceholder: '简要描述您的健康问题...',
    bkNext: '下一步',
    bkValidationMsg: '请选择类型并添加描述',
    cpTitle: '更改密码',
    cpInfo: '您的密码必须至少包含8个字符',
    cpCurrent: '当前密码',
    cpCurrentPlaceholder: '输入当前密码',
    cpNew: '新密码',
    cpNewPlaceholder: '输入新密码',
    cpConfirm: '确认新密码',
    cpConfirmPlaceholder: '确认新密码',
    cpForgot: '忘记密码？',
    cpWeak: '弱',
    cpMedium: '中',
    cpStrong: '强',
    cpMatch: '密码匹配',
    cpNoMatch: '密码不匹配',
    cpSave: '更新密码',
    cpSuccess: '您的密码已成功更改',
    cpErrCurrent: '请输入当前密码',
    cpErrNew: '请输入新密码',
    cpErrLen: '密码必须至少包含8个字符',
    cpErrSame: '新密码必须与旧密码不同',
    cnpTitle: '创建新密码',
    cnpDesc: '创建您的新密码以登录',
    cnpNew: '新密码',
    cnpConfirm: '确认密码',
    cnpCreate: '创建密码',
    cnpSuccess: '您已成功重置密码。',
    cnpErrLen: '密码必须至少包含6个字符',
    cnpErrMatch: '密码不匹配',
    cnpLogin: '登录',

  },
};

export const i18n = new I18n(translations);
i18n.enableFallback = true;
i18n.defaultLocale = 'fr';

// ─────────────────────────────────────────────────────────────
// 🏷️ TYPES
// ─────────────────────────────────────────────────────────────
interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
}

interface Colors {
  background: string; text: string; subText: string;
  card: string; inputBackground: string; border: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

interface AppContextType {
  colors: Colors;
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: 'light' | 'dark' | 'auto';
  setTheme: (theme: 'light' | 'dark' | 'auto') => Promise<void>;
  language: string;
  setLanguage: (code: string) => Promise<void>;
  t: (key: string) => string;
}

// ─────────────────────────────────────────────────────────────
// 🎨 COULEURS
// ─────────────────────────────────────────────────────────────
const lightColors: Colors = {
  background: '#ffffff', text: '#000000', subText: '#666666',
  card: '#f5f5f5', inputBackground: '#f0f0f0', border: '#e2e8f0',
};
const darkColors: Colors = {
  background: '#1a1a1a', text: '#ffffff', subText: '#b0b0b0',
  card: '#2a2a2a', inputBackground: '#333333', border: '#444444',
};

// ─────────────────────────────────────────────────────────────
// 📦 CONTEXTES
// ─────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AppContext  = createContext<AppContextType  | undefined>(undefined);

// ─────────────────────────────────────────────────────────────
// 🏗️ PROVIDER UNIQUE
// user/session + thème/langue dans un seul provider
// PAS de key={language} → pas de déconnexion
// La langue s'applique via t() qui lit `language` (state React)
// ─────────────────────────────────────────────────────────────
export const AppProvider = ({ children }: { children: ReactNode }) => {

  // ── Auth ──────────────────────────────────────────────────
  const [user, setUser] = useState<User | null>(null);

  // ── Thème/Langue ──────────────────────────────────────────
  const [theme, setThemeState]       = useState<'light' | 'dark' | 'auto'>('light');
  const [isDarkMode, setIsDarkMode]  = useState(false);
  const [language, setLanguageState] = useState('fr');

  // ── Chargement initial ────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [savedUser, savedTheme, savedLanguage] = await Promise.all([
          AsyncStorage.getItem('user'),
          AsyncStorage.getItem('app_theme'),
          AsyncStorage.getItem('app_language'),
        ]);

        // Session — lecture seule, pas de setState qui déclenche re-mount
        if (savedUser) setUser(JSON.parse(savedUser));

        // Langue
        if (savedLanguage) {
          setLanguageState(savedLanguage);
        } else {
          const deviceLocale = Localization.getLocales?.()?.[0]?.languageCode ?? 'fr';
          const supported    = Object.keys(translations);
          setLanguageState(supported.includes(deviceLocale) ? deviceLocale : 'fr');
        }

        // Thème
        if (savedTheme) {
          setThemeState(savedTheme as 'light' | 'dark' | 'auto');
          setIsDarkMode(savedTheme === 'dark');
        }
      } catch (e) {
        console.error('Erreur chargement préférences:', e);
      }
    };
    load();
  }, []);

  // ── Auth functions ────────────────────────────────────────
  const login = async (userData: User) => {
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (userData: User) => setUser(userData);

  // ── Thème ─────────────────────────────────────────────────
  const toggleTheme = () => {
    const newDark = !isDarkMode;
    setIsDarkMode(newDark);
    setThemeState(newDark ? 'dark' : 'light');
    AsyncStorage.setItem('app_theme', newDark ? 'dark' : 'light');
  };

  const setTheme = async (newTheme: 'light' | 'dark' | 'auto') => {
    setThemeState(newTheme);
    setIsDarkMode(newTheme === 'dark');
    await AsyncStorage.setItem('app_theme', newTheme);
  };

  // ── Langue ────────────────────────────────────────────────
  const setLanguage = async (code: string) => {
    setLanguageState(code);
    await AsyncStorage.setItem('app_language', code);
  };

  // ── Traduction ────────────────────────────────────────────
  // Lit `language` du state React → re-render automatique de TOUS
  // les composants qui appellent t() quand la langue change
  // SANS re-monter les composants → session préservée ✅
  const t = (key: string): string => {
    try {
      const dict = translations[language as keyof typeof translations] ?? translations['fr'];
      return (dict as any)[key] ?? (translations['fr'] as any)[key] ?? key;
    } catch {
      return key;
    }
  };

  // ── Valeurs ───────────────────────────────────────────────
  const authValue: AuthContextType = {
    user, isAuthenticated: !!user, login, logout, updateUser,
  };

  const appValue: AppContextType = {
    colors: isDarkMode ? darkColors : lightColors,
    isDarkMode, toggleTheme,
    theme, setTheme,
    language, setLanguage,
    t,
  };

  // ── Rendu — PAS de key sur les providers ──────────────────
  // key forcerait un re-mount (destroy + recreate) → déconnexion
  // Le re-render via state suffit pour mettre à jour t()
  return (
    <AuthContext.Provider value={authValue}>
      <AppContext.Provider value={appValue}>
        {children}
      </AppContext.Provider>
    </AuthContext.Provider>
  );
};

// ─────────────────────────────────────────────────────────────
// 🪝 HOOKS
// ─────────────────────────────────────────────────────────────
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AppProvider');
  return ctx;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
};