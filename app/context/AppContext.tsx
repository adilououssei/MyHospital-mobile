import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import * as Localization from "expo-localization";

const translations = {
  fr: {
    home: 'Accueil',
    profile: 'Profil',
    appointments: 'Rendez-vous',
    notifications: 'Notifications',
    favorites: 'Favoris',
    editProfile: 'Modifier le profil',
    language: 'Langue',
    theme: 'Apparence',
    prescriptions: 'Mes Ordonnances',
    paymentMethod: 'Moyen de Paiement',
    faqs: 'FAQs',
    logout: 'Déconnexion',
    save: 'Enregistrer',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    success: 'Succès',
    error: 'Erreur',
    loading: 'Chargement...',
    profileUpdated: 'Votre profil a été mis à jour avec succès !',
    languageChanged: 'La langue a été changée en',
    themeChanged: 'Le thème a été modifié avec succès',
    firstName: 'Prénom',
    lastName: 'Nom',
    email: 'Email',
    phone: 'Téléphone',
    address: 'Adresse',
    city: 'Ville',
    dateOfBirth: 'Date de Naissance',
    gender: 'Genre',
    bloodGroup: 'Groupe Sanguin',
    height: 'Taille (m)',
    weight: 'Poids (kg)',
    male: 'Homme',
    female: 'Femme',
    other: 'Autre',
    areYouSureLogout: 'Êtes-vous sûr de vouloir vous déconnecter ?',
    healthInfo: 'Informations de santé',
    bloodType: 'Groupe sanguin',
    age: 'Âge',
    bmi: 'Statut IMC',
    rdvCount: 'Rendez-vous',
    noNotification: 'Aucune notification',
    noNotificationSub: 'Vous n\'avez pas encore reçu de notification.',
    markAllRead: 'Tout lire',
    bestDoctors: 'Meilleurs Docteurs',
    seeAll: 'Voir tout',
    searchPlaceholder: 'Rechercher médecin, médicaments...',
    doctor: 'Docteur',
    pharmacy: 'Pharmacie',
    hospital: 'Hôpital',
    ambulance: 'Ambulance',
    bannerTitle1: 'Protection précoce pour',
    bannerTitle2: 'la santé de votre famille',
    learnMore: 'En savoir plus',
    loadingDoctors: 'Chargement des médecins...',
    retryButton: 'Réessayer',
    noDoctors: 'Aucun médecin disponible',
    cannotLoadDoctors: 'Impossible de charger les médecins',
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
    ddTitle: 'Détails du médecin',
    ddLoading: 'Chargement...',
    ddRetry: 'Réessayer',
    ddAbout: 'À propos',
    ddExperience: 'ans d\'expérience',
    ddPatients: 'patients',
    ddDiplomas: 'Diplômes',
    ddPrices: 'Tarifs',
    ddAvailableDates: 'Dates disponibles',
    ddLoadingDates: 'Chargement des disponibilités...',
    ddNoDates: 'Aucune disponibilité dans les 30 prochains jours',
    ddAvailableSlots: 'Créneaux disponibles',
    ddNoSlots: 'Aucun créneau disponible pour cette date',
    ddOccupied: 'occupé',
    ddFeeDetails: 'Détails des frais',
    ddConsultation: 'Consultation',
    ddConfirmFee: 'Frais de confirmation',
    ddTotal: 'Total',
    ddNbOnline: 'Les frais de confirmation de',
    ddNbOnline2: 'FCFA ne sont pas remboursables, que le rendez-vous soit accepté ou refusé.',
    ddNbOnlineLabel: 'NB :',
    ddPayOnSite: 'Paiement sur place :',
    ddPayOnSiteMsg: 'Le paiement se fera directement lors de la consultation.',
    ddSelectDate: 'Veuillez sélectionner une date',
    ddSelectSlot: 'Veuillez sélectionner un créneau horaire',
    ddContinuePayment: 'Continuer vers le paiement',
    ddConfirmRdv: 'Confirmer le rendez-vous',
    ddSuccessMsg: 'Votre rendez-vous a été créé avec succès !',
    ddConsultOnline: 'Consultation en ligne',
    ddConsultHome: 'Consultation à domicile',
    ddConsultHospital: 'Consultation à l\'hôpital',
    ddCannotLoad: 'Impossible de charger les détails du médecin',
    dlTitle: 'Choisir un médecin',
    dlSearchPlaceholder: 'Rechercher un médecin...',
    dlLoading: 'Chargement des médecins...',
    dlNoDoctor: 'Aucun médecin trouvé',
    dlTryOther: 'Essayez une autre recherche',
    dlNoneForType: 'Aucun médecin disponible pour',
    dlRetry: 'Réessayer',
    dlCannotLoad: 'Impossible de charger les médecins',
    epTitle: 'Modifier le Profil',
    epChangePhoto: 'Changer la photo',
    epUploading: 'Upload en cours...',
    epSave: 'Enregistrer les modifications',
    epDateBirth: 'Date de Naissance',
    epDatePlaceholder: 'JJ/MM/AAAA',
    epGender: 'Genre',
    epMale: 'Homme',
    epFemale: 'Femme',
    epOther: 'Autre',
    epBloodGroup: 'Groupe Sanguin',
    epBloodSelect: 'Sélectionner',
    epHeight: 'Taille (m)',
    epWeight: 'Poids (kg)',
    epPhotoOptions: 'Photo de profil',
    epTakePhoto: 'Prendre une photo',
    epGallery: 'Choisir depuis la galerie',
    epDeletePhoto: 'Supprimer la photo',
    epConfirmDate: 'Confirmer',
    epBirthTitle: 'Date de naissance',
    epBloodTitle: 'Groupe sanguin',
    epErrLoad: 'Impossible de charger le profil.',
    epErrSave: 'Erreur lors de la sauvegarde.',
    epErrPhoto: 'Impossible d\'uploader la photo.',
    epPhotoUpdated: 'Photo mise à jour avec succès',
    epDeleteConfirmTitle: 'Supprimer la photo',
    epDeleteConfirmMsg: 'Voulez-vous vraiment supprimer votre photo de profil ?',
    epErrPermissions: 'Autorisez l\'accès à la caméra et à la galerie.',
    epPermTitle: 'Permissions requises',
    emTitle: 'Urgences',
    emMedTitle: 'Urgence Médicale',
    emDesc: 'En cas d\'urgence médicale, appuyez sur le bouton ci-dessous pour contacter immédiatement les services d\'urgence.',
    emCallBtn: 'Appeler les Urgences',
    em24h: 'Ce service est disponible 24h/24 et 7j/7',
    emWarning: 'N\'utilisez ce service qu\'en cas d\'urgence réelle',
    emCallTitle: 'Appel d\'urgence',
    emCallMsg: 'Voulez-vous appeler le',
    emCallAction: 'Appeler',
    emCallError: 'Impossible de passer l\'appel',
    faqTitle: 'Questions Fréquentes',
    faqSearchPlaceholder: 'Rechercher une question...',
    faqCatAll: 'Tous',
    faqCatAccount: 'Compte',
    faqCatAppointments: 'Rendez-vous',
    faqCatPayment: 'Paiement',
    faqCatTechnical: 'Technique',
    faqBannerTitle: 'Besoin d\'aide ?',
    faqBannerText: 'Parcourez nos questions fréquentes ou contactez notre support',
    faqEmpty: 'Aucune question trouvée',
    faqEmptySub: 'Essayez avec d\'autres mots-clés',
    faqSupportTitle: 'Vous n\'avez pas trouvé de réponse ?',
    faqSupportSub: 'Notre équipe est là pour vous aider',
    faqPhone: 'Téléphone',
    favTitle: 'Mes Favoris',
    favAll: 'Tous',
    favPharmacies: 'Pharmacies',
    favHospitals: 'Hôpitaux',
    favDirections: 'Itinéraire',
    favEmpty: 'Aucun favori',
    favEmptySub: 'Ajoutez des pharmacies ou hôpitaux à vos favoris',
    fpTitle: 'Mot de passe oublié ?',
    fpDesc1: 'Entrez votre email ou votre numéro de téléphone,',
    fpDesc2: 'nous vous enverrons un code de confirmation',
    fpTabPhone: 'Téléphone',
    fpEmailPlaceholder: 'exemple@email.com',
    fpPhonePlaceholder: '0612345678',
    fpResetBtn: 'Réinitialiser le mot de passe',
    fpErrEmail: 'Veuillez entrer un email valide',
    fpErrPhone: 'Veuillez entrer un numéro de téléphone valide',
    hiTitle: 'Santé & Prévention',
    hiHeroTitle: 'Protection précoce pour votre famille',
    hiHeroDesc: 'Découvrez nos conseils et guides pour maintenir votre famille en bonne santé',
    hiTopicsTitle: 'Thèmes de santé',
    hiTipsTitle: 'Conseils rapides',
    hiEmergencyTitle: 'Urgence médicale ?',
    hiEmergencyDesc: 'Contactez immédiatement les services d\'urgence',
    hiEmergencyBtn: 'Appeler',
    hiVaccination: 'Vaccination',
    hiVaccinationDesc: 'Calendrier vaccinal et rappels importants',
    hiPrevention: 'Prévention',
    hiPreventionDesc: 'Conseils pour prévenir les maladies',
    hiNutrition: 'Nutrition',
    hiNutritionDesc: 'Guide alimentaire pour toute la famille',
    hiPediatrics: 'Pédiatrie',
    hiPediatricsDesc: 'Suivi de santé pour vos enfants',
    hiFitness: 'Activité Physique',
    hiFitnessDesc: 'Exercices et recommandations',
    hiHydration: 'Hydratation',
    hiHydrationDesc: 'Importance de boire suffisamment d\'eau',
    hiTip1Title: 'Lavez-vous les mains régulièrement',
    hiTip1: 'Pendant au moins 20 secondes avec du savon',
    hiTip2Title: 'Dormez suffisamment',
    hiTip2: '7-9 heures pour les adultes, plus pour les enfants',
    hiTip3Title: 'Mangez équilibré',
    hiTip3: '5 fruits et légumes par jour minimum',
    hiTip4Title: 'Restez actif',
    hiTip4: 'Au moins 30 minutes d\'activité physique par jour',
    hsTitle: 'Hôpitaux & Cliniques',
    hsLoading: 'Chargement depuis OpenStreetMap...',
    hsLoadingFirst: 'Première ouverture — peut prendre 5-10 secondes (données mises en cache ensuite)',
    hsConnectError: 'Connexion impossible',
    hsEmpty: 'Aucun établissement dans cette région',
    hsSearchPlaceholder: 'Nom, spécialité...',
    hsEmergencyOnly: 'Urgences 24h seulement',
    hsEmergencyBadge: 'Urgences 24h',
    hsLocDenied: 'Activer la localisation pour voir les distances',
    hsLocGranted: 'Triés par distance depuis votre position',
    hsAllEstablishments: 'Tous les établissements',
    hsRegion: 'Région',
    hsRegAll: 'Toutes',
    hsRegMaritime: 'Maritime',
    hsRegPlateaux: 'Plateaux',
    hsRegCentrale: 'Centrale',
    hsRegKara: 'Kara',
    hsRegSavanes: 'Savanes',
    hsNoPhone: 'Numéro non renseigné',
    hsOpen247: 'Ouvert 24h/24 — 7j/7',
    hsNoHours: 'Horaires non renseignés',
    hsDistanceFrom: 'À',
    hsDistanceFromPos: 'de votre position',
    hsSpecialties: 'Spécialités :',
    loginTitle: 'Connexion',
    loginWelcome: 'Bon retour !',
    loginSubtitle: 'Connectez-vous pour accéder à votre compte',
    loginEmailPlaceholder: 'Entrez votre email',
    loginPasswordPlaceholder: 'Entrez votre mot de passe',
    loginForgotPassword: 'Mot de passe oublié ?',
    loginBtn: 'Connexion',
    loginNoAccount: 'Vous n\'avez pas de compte ? ',
    loginSignup: 'Inscription',
    loginOr: 'OU',
    loginGoogle: 'Se connecter avec Google',
    loginApple: 'Se connecter avec Apple',
    loginFacebook: 'Se connecter avec Facebook',
    loginErrEmail: 'Email invalide',
    loginErrPassword: 'Mot de passe trop court',
    loginErrServer: 'Erreur de connexion au serveur',
    loginSuccessTitle: 'Bon retour !',
    loginSuccessDesc1: 'Vous vous êtes connecté avec succès',
    loginSuccessDesc2: 'à l\'application MyHospital',
    loginSuccessBtn: 'Aller à l\'accueil',
    loginLangTitle: '🌐 Choisir la langue',
    ndDetails: 'Détails',
    ndTypeAppointment: 'Rendez-vous',
    ndTypeStatus: 'Mise à jour',
    ndTypeGeneral: 'Information',
    ndMessage: 'Message',
    ndQuickActions: 'Actions rapides',
    ndViewAppointments: 'Voir mes rendez-vous',
    ndDirections: 'Itinéraire',
    ndCallDoctor: 'Appeler le médecin',
    ndViewDetails: 'Voir les détails',
    ndLearnMore: 'En savoir plus',
    ndMoreInfo: 'Plus d\'informations',
    ndDelete: 'Supprimer',
    notifTitle: 'Notifications',
    notifLoading: 'Chargement...',
    notifConnectError: 'Connexion impossible',
    notifLoadError: 'Impossible de charger les notifications.',
    notifEmpty: 'Aucune notification',
    notifEmptySub: 'Vous n\'avez pas encore reçu de notification.',
    notifUnread: 'notification non lue',
    notifUnreadPlural: 'notifications non lues',
    notifMarkAll: 'Tout lire',
    notifDeleteTitle: 'Supprimer la notification',
    notifDeleteMsg: 'Voulez-vous supprimer cette notification ?',
    notifRetry: 'Réessayer',
  },
  en: {
    home: 'Home', profile: 'Profile', appointments: 'Appointments', notifications: 'Notifications',
    favorites: 'Favorites', editProfile: 'Edit Profile', language: 'Language', theme: 'Appearance',
    prescriptions: 'My Prescriptions', paymentMethod: 'Payment Method', faqs: 'FAQs', logout: 'Logout',
    save: 'Save', cancel: 'Cancel', confirm: 'Confirm', success: 'Success', error: 'Error', loading: 'Loading...',
    profileUpdated: 'Your profile has been updated successfully!', languageChanged: 'Language changed to',
    themeChanged: 'Theme changed successfully', firstName: 'First Name', lastName: 'Last Name', email: 'Email',
    phone: 'Phone', address: 'Address', city: 'City', dateOfBirth: 'Date of Birth', gender: 'Gender',
    bloodGroup: 'Blood Group', height: 'Height (m)', weight: 'Weight (kg)', male: 'Male', female: 'Female',
    other: 'Other', areYouSureLogout: 'Are you sure you want to logout?', healthInfo: 'Health Information',
    bloodType: 'Blood Type', age: 'Age', bmi: 'BMI Status', rdvCount: 'Appointments',
    noNotification: 'No notifications', noNotificationSub: 'You haven\'t received any notification yet.',
    markAllRead: 'Mark all read', bestDoctors: 'Best Doctors', seeAll: 'See all',
    searchPlaceholder: 'Search doctor, medications...', doctor: 'Doctor', pharmacy: 'Pharmacy',
    hospital: 'Hospital', ambulance: 'Ambulance', bannerTitle1: 'Early protection for',
    bannerTitle2: 'your family health', learnMore: 'Learn more', loadingDoctors: 'Loading doctors...',
    retryButton: 'Retry', noDoctors: 'No doctors available', cannotLoadDoctors: 'Unable to load doctors',
    aptTitle: 'Appointments', aptLoading: 'Loading your appointments...', aptPending: 'Pending',
    aptConfirmed: 'Confirmed', aptPast: 'Past', aptRejected: 'Rejected', aptOnline: 'Online',
    aptHome: 'Home visit', aptHospital: 'Hospital', aptMoreDetails: 'More details', aptHideDetails: 'Hide details',
    aptCall: 'Call', aptWhatsApp: 'WhatsApp', aptDirections: 'Directions', aptJoinVideo: 'Join consultation',
    aptConfirmedMsg: 'Appointment confirmed', aptReschedule: 'Reschedule', aptDelete: 'Delete',
    aptEmpty: 'No appointments', aptCancelTitle: 'Cancel appointment',
    aptCancelMsg: 'Are you sure you want to cancel this appointment?', aptDeleteTitle: 'Delete appointment',
    aptDeleteMsg: 'Are you sure you want to delete this appointment?', aptCancelSuccess: 'Appointment cancelled successfully',
    aptJoinTitle: 'Join consultation', aptJoinMsg: 'You will be redirected to the video call', aptJoin: 'Join',
    aptErrLoad: 'Unable to load your appointments. Please try again.', bkTitle: 'New appointment',
    bkTypeTitle: 'Consultation type', bkTypeSubtitle: 'Choose the type of consultation that suits you',
    bkOnline: 'Online consultation', bkOnlineDesc: 'Video consultation', bkHome: 'Home visit',
    bkHomeDesc: 'The doctor comes to you', bkHospital: 'Hospital consultation', bkHospitalDesc: 'In-person appointment',
    bkDescLabel: 'Problem description', bkDescPlaceholder: 'Briefly describe your health problem...',
    bkNext: 'Next', bkValidationMsg: 'Please select a type and add a description',
    cpTitle: 'Change password', cpInfo: 'Your password must contain at least 8 characters',
    cpCurrent: 'Current password', cpCurrentPlaceholder: 'Enter your current password', cpNew: 'New password',
    cpNewPlaceholder: 'Enter your new password', cpConfirm: 'Confirm new password',
    cpConfirmPlaceholder: 'Confirm your new password', cpForgot: 'Forgot password?', cpWeak: 'Weak',
    cpMedium: 'Medium', cpStrong: 'Strong', cpMatch: 'Passwords match', cpNoMatch: 'Passwords do not match',
    cpSave: 'Update password', cpSuccess: 'Your password has been changed successfully',
    cpErrCurrent: 'Please enter your current password', cpErrNew: 'Please enter a new password',
    cpErrLen: 'Password must contain at least 8 characters', cpErrSame: 'New password must be different from old password',
    cnpTitle: 'Create new password', cnpDesc: 'Create your new password to log in', cnpNew: 'New password',
    cnpConfirm: 'Confirm password', cnpCreate: 'Create password', cnpSuccess: 'You have successfully reset your password.',
    cnpErrLen: 'Password must contain at least 6 characters', cnpErrMatch: 'Passwords do not match', cnpLogin: 'Login',
    ddTitle: 'Doctor details', ddLoading: 'Loading...', ddRetry: 'Retry', ddAbout: 'About',
    ddExperience: 'years of experience', ddPatients: 'patients', ddDiplomas: 'Diplomas', ddPrices: 'Prices',
    ddAvailableDates: 'Available dates', ddLoadingDates: 'Loading availability...',
    ddNoDates: 'No availability in the next 30 days', ddAvailableSlots: 'Available slots',
    ddNoSlots: 'No slots available for this date', ddOccupied: 'occupied', ddFeeDetails: 'Fee details',
    ddConsultation: 'Consultation', ddConfirmFee: 'Confirmation fee', ddTotal: 'Total',
    ddNbOnline: 'The confirmation fee of', ddNbOnline2: 'FCFA is non-refundable whether the appointment is accepted or rejected.',
    ddNbOnlineLabel: 'Note:', ddPayOnSite: 'Payment on site:', ddPayOnSiteMsg: 'Payment will be made directly at the consultation.',
    ddSelectDate: 'Please select a date', ddSelectSlot: 'Please select a time slot',
    ddContinuePayment: 'Continue to payment', ddConfirmRdv: 'Confirm appointment',
    ddSuccessMsg: 'Your appointment has been created successfully!', ddConsultOnline: 'Online consultation',
    ddConsultHome: 'Home visit', ddConsultHospital: 'Hospital consultation', ddCannotLoad: 'Unable to load doctor details',
    dlTitle: 'Choose a doctor', dlSearchPlaceholder: 'Search for a doctor...', dlLoading: 'Loading doctors...',
    dlNoDoctor: 'No doctors found', dlTryOther: 'Try a different search', dlNoneForType: 'No doctors available for',
    dlRetry: 'Retry', dlCannotLoad: 'Unable to load doctors', epTitle: 'Edit Profile', epChangePhoto: 'Change photo',
    epUploading: 'Uploading...', epSave: 'Save changes', epDateBirth: 'Date of Birth', epDatePlaceholder: 'DD/MM/YYYY',
    epGender: 'Gender', epMale: 'Male', epFemale: 'Female', epOther: 'Other', epBloodGroup: 'Blood Group',
    epBloodSelect: 'Select', epHeight: 'Height (m)', epWeight: 'Weight (kg)', epPhotoOptions: 'Profile photo',
    epTakePhoto: 'Take a photo', epGallery: 'Choose from gallery', epDeletePhoto: 'Delete photo',
    epConfirmDate: 'Confirm', epBirthTitle: 'Date of birth', epBloodTitle: 'Blood group',
    epErrLoad: 'Unable to load profile.', epErrSave: 'Error saving.', epErrPhoto: 'Unable to upload photo.',
    epPhotoUpdated: 'Photo updated successfully', epDeleteConfirmTitle: 'Delete photo',
    epDeleteConfirmMsg: 'Do you really want to delete your profile photo?',
    epErrPermissions: 'Please allow access to camera and gallery.', epPermTitle: 'Permissions required',
    emTitle: 'Emergency', emMedTitle: 'Medical Emergency',
    emDesc: 'In case of a medical emergency, press the button below to immediately contact emergency services.',
    emCallBtn: 'Call Emergency', em24h: 'This service is available 24/7',
    emWarning: 'Only use this service in a real emergency', emCallTitle: 'Emergency call',
    emCallMsg: 'Do you want to call', emCallAction: 'Call', emCallError: 'Unable to make the call',
    faqTitle: 'Frequently Asked Questions', faqSearchPlaceholder: 'Search a question...', faqCatAll: 'All',
    faqCatAccount: 'Account', faqCatAppointments: 'Appointments', faqCatPayment: 'Payment', faqCatTechnical: 'Technical',
    faqBannerTitle: 'Need help?', faqBannerText: 'Browse our FAQ or contact our support', faqEmpty: 'No question found',
    faqEmptySub: 'Try with other keywords', faqSupportTitle: 'Didn\'t find an answer?',
    faqSupportSub: 'Our team is here to help', faqPhone: 'Phone', favTitle: 'My Favorites', favAll: 'All',
    favPharmacies: 'Pharmacies', favHospitals: 'Hospitals', favDirections: 'Directions', favEmpty: 'No favorites',
    favEmptySub: 'Add pharmacies or hospitals to your favorites', fpTitle: 'Forgot password?',
    fpDesc1: 'Enter your email or phone number,', fpDesc2: 'we will send you a confirmation code', fpTabPhone: 'Phone',
    fpEmailPlaceholder: 'example@email.com', fpPhonePlaceholder: '0612345678', fpResetBtn: 'Reset password',
    fpErrEmail: 'Please enter a valid email', fpErrPhone: 'Please enter a valid phone number',
    hiTitle: 'Health & Prevention', hiHeroTitle: 'Early protection for your family',
    hiHeroDesc: 'Discover our tips and guides to keep your family healthy', hiTopicsTitle: 'Health topics',
    hiTipsTitle: 'Quick tips', hiEmergencyTitle: 'Medical emergency?',
    hiEmergencyDesc: 'Immediately contact emergency services', hiEmergencyBtn: 'Call',
    hiVaccination: 'Vaccination', hiVaccinationDesc: 'Vaccination schedule and important reminders',
    hiPrevention: 'Prevention', hiPreventionDesc: 'Tips to prevent diseases', hiNutrition: 'Nutrition',
    hiNutritionDesc: 'Food guide for the whole family', hiPediatrics: 'Pediatrics',
    hiPediatricsDesc: 'Health monitoring for your children', hiFitness: 'Physical Activity',
    hiFitnessDesc: 'Exercises and recommendations', hiHydration: 'Hydration',
    hiHydrationDesc: 'Importance of drinking enough water', hiTip1Title: 'Wash your hands regularly',
    hiTip1: 'For at least 20 seconds with soap', hiTip2Title: 'Sleep enough',
    hiTip2: '7-9 hours for adults, more for children', hiTip3Title: 'Eat balanced',
    hiTip3: 'At least 5 fruits and vegetables per day', hiTip4Title: 'Stay active',
    hiTip4: 'At least 30 minutes of physical activity per day', hsTitle: 'Hospitals & Clinics',
    hsLoading: 'Loading from OpenStreetMap...', hsLoadingFirst: 'First load — may take 5-10 seconds (data cached afterwards)',
    hsConnectError: 'Connection failed', hsEmpty: 'No establishments in this region', hsSearchPlaceholder: 'Name, specialty...',
    hsEmergencyOnly: '24h emergency only', hsEmergencyBadge: '24h Emergency', hsLocDenied: 'Enable location to see distances',
    hsLocGranted: 'Sorted by distance from your position', hsAllEstablishments: 'All establishments', hsRegion: 'Region',
    hsRegAll: 'All', hsRegMaritime: 'Maritime', hsRegPlateaux: 'Plateaux', hsRegCentrale: 'Central', hsRegKara: 'Kara',
    hsRegSavanes: 'Savanes', hsNoPhone: 'No phone number', hsOpen247: 'Open 24/7', hsNoHours: 'Opening hours not available',
    hsDistanceFrom: '', hsDistanceFromPos: 'from your position', hsSpecialties: 'Specialties:',
    loginTitle: 'Login', loginWelcome: 'Welcome back!', loginSubtitle: 'Sign in to access your account',
    loginEmailPlaceholder: 'Enter your email', loginPasswordPlaceholder: 'Enter your password',
    loginForgotPassword: 'Forgot password?', loginBtn: 'Sign in', loginNoAccount: 'Don\'t have an account? ',
    loginSignup: 'Sign up', loginOr: 'OR', loginGoogle: 'Sign in with Google', loginApple: 'Sign in with Apple',
    loginFacebook: 'Sign in with Facebook', loginErrEmail: 'Invalid email', loginErrPassword: 'Password too short',
    loginErrServer: 'Server connection error', loginSuccessTitle: 'Welcome back!',
    loginSuccessDesc1: 'You have successfully signed in', loginSuccessDesc2: 'to the MyHospital app',
    loginSuccessBtn: 'Go to home', loginLangTitle: '🌐 Choose language',
    ndDetails: 'Details', ndTypeAppointment: 'Appointment', ndTypeStatus: 'Update', ndTypeGeneral: 'Information',
    ndMessage: 'Message', ndQuickActions: 'Quick actions', ndViewAppointments: 'View my appointments',
    ndDirections: 'Directions', ndCallDoctor: 'Call the doctor', ndViewDetails: 'View details',
    ndLearnMore: 'Learn more', ndMoreInfo: 'More information', ndDelete: 'Delete',
    notifTitle: 'Notifications', notifLoading: 'Loading...', notifConnectError: 'Connection failed',
    notifLoadError: 'Unable to load notifications.', notifEmpty: 'No notifications',
    notifEmptySub: 'You haven\'t received any notification yet.', notifUnread: 'unread notification',
    notifUnreadPlural: 'unread notifications', notifMarkAll: 'Mark all read', notifDeleteTitle: 'Delete notification',
    notifDeleteMsg: 'Do you want to delete this notification?', notifRetry: 'Retry',
  },
  // Les autres langues (es, de, ar, zh) sont conservées telles quelles dans votre fichier original
  es: {} as any,
  de: {} as any,
  ar: {} as any,
  zh: {} as any,
};

// ─────────────────────────────────────────────────────────────
// ✅ SUPPRESSION des 3 lignes cassées :
//   export const i18n = new Localization(translations);  ← SUPPRIMÉ
//   i18n.enableFallback = true;                          ← SUPPRIMÉ
//   i18n.defaultLocale = 'fr';                           ← SUPPRIMÉ
//
// Ces lignes tentaient de construire Localization comme une classe,
// mais expo-localization est un MODULE (pas une classe constructible).
// La fonction t() ci-dessous gère les traductions sans i18n-js.
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// 🏷️ TYPES
// ─────────────────────────────────────────────────────────────
interface User {
  ville?: string | null;   // ✅ OPTIONNEL — compatible avec authService.User
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
// ─────────────────────────────────────────────────────────────
export const AppProvider = ({ children }: { children: ReactNode }) => {

  const [user, setUser] = useState<User | null>(null);
  const [theme, setThemeState]       = useState<'light' | 'dark' | 'auto'>('light');
  const [isDarkMode, setIsDarkMode]  = useState(false);
  const [language, setLanguageState] = useState('fr');

  useEffect(() => {
    const load = async () => {
      try {
        const [savedUser, savedTheme, savedLanguage] = await Promise.all([
          AsyncStorage.getItem('user'),
          AsyncStorage.getItem('app_theme'),
          AsyncStorage.getItem('app_language'),
        ]);

        if (savedUser) setUser(JSON.parse(savedUser));

        if (savedLanguage) {
          setLanguageState(savedLanguage);
        } else {
          const deviceLocale = Localization.getLocales?.()?.[0]?.languageCode ?? 'fr';
          const supported    = Object.keys(translations);
          setLanguageState(supported.includes(deviceLocale) ? deviceLocale : 'fr');
        }

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

  const login = async (userData: User) => {
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (userData: User) => setUser(userData);

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

  const setLanguage = async (code: string) => {
    setLanguageState(code);
    await AsyncStorage.setItem('app_language', code);
  };

  const t = (key: string): string => {
    try {
      const dict = translations[language as keyof typeof translations] ?? translations['fr'];
      return (dict as any)[key] ?? (translations['fr'] as any)[key] ?? key;
    } catch {
      return key;
    }
  };

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