# Parcours complet – Plateforme Mpanera (Design & Fonctionnalités)

## 🌟 Identité visuelle
- **Couleurs Mpanera** : à définir (ex: orange/vert/bleu selon charte)
- **Animations** : fluides, types “blob”, chargements progressifs
- **Accessibilité** : contrastes élevés, typographie lisible, interfaces simples

---

## 1. Côté Client – Expérience complète

### 1.1. Landing page “super landing”

**Design & animations :**
- Animation de chargement **dès l’arrivée** (spinner ou blob Mpanera qui s’agrandit)
- Fond épuré, visuels chaleureux, iconographie intuitive
- Adaptation explicite aux **classes moyennes et populaires** :
  - Pas de jargon technique
  - Mise en avant de la confiance, prix transparents, simplicité
  - Témoignages d’utilisateurs aux profils variés
  - Boutons larges, textes courts
- *(Riches non ciblés ici car ils préfèrent des spécialistes confirmés)*

### 1.2. Call to Action (CTA) → vers l’IA

- Bouton principal : *“Trouver un prestataire”* ou *“Décrire mon besoin”*
- **Animation de chargement suivante** :
  - Un **blob animé** (type Siri) aux **couleurs de Mpanera**
  - Prend **1/3 de l’écran** (centré ou flottant)
  - Mouvements doux, ondulations lumineuses
  - Texte intégré dans le blob :
    > *“Que puis-je faire pour vous aujourd’hui ? Trouvons le prestataire parfait pour votre besoin”*
- Transition smooth vers l’interface IA

### 1.3. Interface de l’IA

- **Design classique de chat / assistant** :
  - Bulles de dialogue (utilisateur à droite, IA à gauche)
  - Input texte large pour description en langage naturel
  - Suggestions d’exemples (démarrage rapide)
- **Animation smooth** :
  - Apparition progressive des éléments
  - Message d’accueil de l’IA avec le blob réduit en icône ronde (couleurs Mpanera)

### 1.4. Saisie du problème

- L’utilisateur **décrit son problème en langage naturel** (ex: *“J’ai besoin de réparer ma machine à laver, elle fuit”*)
- L’IA analyse et affiche une **animation de réflexion** (blob qui clignote)

### 1.5. Proposition de prestataires – cards

- **Affichage sous forme de cartes** :
  - Photo du prestataire (cercle ou carré arrondi)
  - Nom
  - **Note en étoiles** (avec moyenne)
  - Catégorie (ex: Plomberie, Électricité, Ménage…)
  - Petite badge “disponible” ou “proche”
- **Comportement** :
  - L’utilisateur peut **sélectionner une ou plusieurs cartes** (cases à cocher ou toggle)
  - Possibilité d’en savoir plus sur chaque prestataire (modal)

### 1.6. Validation finale client

- Bouton *“Valider ma sélection”* après choix des prestataires.
- Message récapitulatif : *“Vous allez contacter X prestataire(s). Ils recevront votre demande.”*
- Confirmation → envoi des notifications aux prestataires.

---

## 2. Côté Prestataire – Expérience détaillée

### 2.1. Notification de demande

- **Réception push / in-app** avec badge.
- En cliquant, il entre dans l’application.
- **Même type d’animation que côté client** (blob Mpanera, couleurs, transition).

### 2.2. Annonce par l’IA

- L’IA **parle** (synthèse vocale ou texte animé) :
  > *“Bonjour [Nom du prestataire], une personne aurait besoin de vous, pour [détail de la mission]”*
- Affichage simultané du problème du client (texte brut).

### 2.3. Décision du prestataire

#### ➕ Cas 1 : Il accepte

1. **Demande d’infos supplémentaires** (via l’IA) – champ texte libre.
2. **Prétention salariale** – champ numérique ou choix fourchette.
3. L’IA génère un **formulaire dynamique** pour le client :
   - Questions non posées auparavant (ex: marque de l’appareil, date souhaitée, adresse)
   - Un **textarea vide** pour précisions libres :
     - Exemple : *“information supplémentaire ou demande spé ohatra (il ne connaît pas les specs de sa télé)”*
4. Le client reçoit et remplit le formulaire.
5. Le prestataire reçoit les réponses du client.
6. **Dernière confirmation** demandée au prestataire.
7. Après confirmation → **ouverture d’une messagerie** entre les deux parties.

#### ➖ Cas 2 : Il refuse

- Notification **polie** envoyée au client :
  > *“Malheureusement, [Prénom prestataire] n’est pas disponible pour ce besoin. Nous vous invitons à sélectionner d’autres professionnels.”*
- L’interface client propose de nouveaux prestataires ou retour à la recherche.

---

## ✅ Récapitulatif des éléments de design obligatoires

| Élément | Détail |
|---------|--------|
| Animation chargement landing | spinner / blob Mpanera |
| Blob “Siri-like” | couleur Mpanera, 1/3 écran, texte appel à l’action |
| Animation smooth partout | transitions douces, fade-in |
| Cards prestataires | photo, nom, étoiles, catégorie |
| Formulaire dynamique | avec textarea libre pour précisions “spé ohatra” |
| Notifications polies | refus = message aimable |

---

> **Note** : Tous ces détails sont **indissociables** du parcours utilisateur et de l’expérience globale. Le design doit rester cohérent avec les couleurs Mpanera et les animations “blob” sur chaque écran de chargement ou de transition.