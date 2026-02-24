// app/assets/pharmacyImages.ts
// ─────────────────────────────────────────────────────────────────────────────
// Ajoutez vos images ici en associant le slug ou l'ID de la pharmacie
// à une image locale (require) ou une URL distante (string)
//
// Comment trouver le slug ? C'est dans les données API : pharmacie.slug
// Exemples : "pharmacie-du-centre", "pharmacie-du-boulevard", etc.
// ─────────────────────────────────────────────────────────────────────────────

// Images locales (à placer dans app/assets/images/pharmacies/)
// Exemple : import imgDuCentre from './images/pharmacies/pharmacie-du-centre.jpg';

type PharmacyImageSource = { uri: string } | number; // number = require('../...')

const pharmacyImages: Record<string, PharmacyImageSource> = {
  // ── Ajoutez vos images ici ──────────────────────────────────────────────
  //
  // Format slug (depuis l'API) :
  // 'pharmacie-du-centre':    require('./images/pharmacies/du-centre.jpg'),
  // 'pharmacie-du-boulevard': require('./images/pharmacies/du-boulevard.jpg'),
  //
  // Format URL distante :
  // 'pharmacie-du-centre': { uri: 'https://votre-serveur.com/images/du-centre.jpg' },
  //
  // ────────────────────────────────────────────────────────────────────────
};

/**
 * Retourne l'image d'une pharmacie par son slug, ou null si pas d'image définie.
 * Utilisé dans PharmacyScreen pour afficher une vraie photo si disponible.
 */
export function getPharmacyImage(slug: string): PharmacyImageSource | null {
  return pharmacyImages[slug] ?? null;
}

export default pharmacyImages;