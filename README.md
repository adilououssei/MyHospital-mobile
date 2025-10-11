# MyHospital - Application Mobile de Santé

Application mobile de santé développée avec React Native et Expo.

## 🚀 Installation

### Prérequis
- Node.js (version 18 ou supérieure)
- npm ou yarn
- Expo CLI
- Expo Go app sur votre téléphone (pour tester)

### Étapes d'installation

1. **Créer le projet**
```bash
npx create-expo-app MyHospital --template blank-typescript
cd MyHospital
```

2. **Installer les dépendances**
```bash
npm install expo-linear-gradient @expo/vector-icons react-native-safe-area-context
```

3. **Créer la structure des dossiers**
```bash
mkdir -p src/screens src/components src/navigation src/types assets
```

4. **Créer les fichiers**

Créez les fichiers suivants dans votre projet :

- `App.tsx` (remplacez le contenu par celui fourni)
- `src/screens/HomeScreen.tsx`
- `src/screens/ProfileScreen.tsx`
- `src/components/BottomNavigation.tsx` (optionnel)

5. **Créer des images placeholder**

Pour l'instant, créez des fichiers vides dans le dossier `assets/` :
- `doctor1.png`
- `doctor2.png`
- `doctor3.png`

Vous pourrez les remplacer par de vraies images plus tard.

## 🎯 Lancer l'application

```bash
npx expo start
```

Ensuite :
- Scannez le QR code avec l'app Expo Go sur Android
- Ou scannez avec la caméra sur iOS (qui ouvrira Expo Go)
- Ou appuyez sur `w` pour ouvrir dans le navigateur web
- Ou appuyez sur `a` pour ouvrir sur un émulateur Android
- Ou appuyez sur `i` pour ouvrir sur un simulateur iOS


  - Rendez-vous
  - Moyen de Paiement
  - FAQs
  - Déconnexion
- ✅ Modal de confirmation de déconnexion
- ✅ Navigation fonctionnelle entre Home et Profil

## 🎨 Personnalisation

### Couleurs principales
- Primary: `#00B894` (Turquoise)
- Background: `#F5F5F5` (Gris clair)
- Text: `#000000` (Noir)
- Secondary Text: `#666666` (Gris)
- Error/Logout: `#FF6B6B` (Rouge)

### Polices
L'application utilise les polices système par défaut. Pour ajouter des polices personnalisées :

```bash
npx expo install expo-font
```

## 📂 Structure du projet

```
MyHospital/
├── src/
│   ├── components/
│   │   └── BottomNavigation.tsx
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── navigation/
│   └── types/
├── assets/
│   ├── doctor1.png
│   ├── doctor2.png
│   └── doctor3.png
├── App.tsx
└── package.json
```

## 🔄 Prochaines étapes

1. **Ajouter de vraies images**
   - Remplacer les placeholders par de vraies photos de docteurs
   - Ajouter une vraie photo de profil

2. **Créer d'autres écrans**
   - Écran de détails d'un docteur
   - Écran de recherche
   - Écran de rendez-vous
   - Écran de messages
   - Écran des favoris

3. **Intégration avec une API**
   - Connexion à un backend
   - Gestion de l'authentification
   - Récupération des données des docteurs

4. **Améliorer la navigation**
   - Implémenter React Navigation de manière complète
   - Ajouter des animations de transition

5. **Ajouter des fonctionnalités**
   - Système de réservation
   - Chat en temps réel
   - Notifications push
   - Géolocalisation

## 🐛 Résolution de problèmes

### L'application ne démarre pas
```bash
# Effacer le cache
npx expo start -c

# Ou réinstaller les dépendances
rm -rf node_modules
npm install
```

### Erreur avec les images
Si vous avez des erreurs avec `require()` pour les images, commentez temporairement ces lignes ou créez de vrais fichiers PNG dans le dossier assets.

### Problème de style
Assurez-vous que tous les styles sont bien définis dans l'objet `StyleSheet.create()`.

## 📝 Notes importantes

- L'application est entièrement en français comme demandé
- La section "Articles de santé" n'est pas incluse comme demandé
- Les images sont des placeholders pour l'instant
- La navigation utilise un state simple, vous pouvez migrer vers React Navigation plus tard

## 🤝 Contribution

Pour continuer le développement :
1. Choisissez une fonctionnalité à implémenter
2. Créez le fichier de screen correspondant
3. Ajoutez-le à la navigation
4. Testez sur mobile

## 📞 Support

Pour toute question ou problème, n'hésitez pas à demander de l'aide !