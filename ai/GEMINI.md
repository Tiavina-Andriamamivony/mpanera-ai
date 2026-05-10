# Contexte Projet : Mpanera AI

## 🎯 Objectif
Mpanera est une IA d'assistance au dépannage pour le marché malgache (mpanera.mg). Elle guide l'utilisateur à travers un diagnostic technique et le met en relation avec des prestataires locaux qualifiés.

## 🏗 Architecture Technique
- **Langage :** TypeScript (Node.js).
- **IA :** Modèle `moonshotai/kimi-k2.6` via NVIDIA API.
- **Backend :** API REST (`https://ton-api.mpanera.mg`) pour les catégories, les prestataires et le stockage des conversations.
- **Mode de fonctionnement :** CLI Stateless. La session complète est passée en argument à chaque appel pour maintenir l'historique.

## 🔄 Flux de Conversation (Le "3-Turn Loop")
La conversation est strictement limitée à 3 échanges pour garantir une conversion rapide :

1.  **Tour 1 (Diagnostic & DIY) :**
    - L'IA identifie la panne.
    - Elle propose des solutions "Do It Yourself" (DIY).
    - Elle doit obligatoirement émettre un `MPANERA_META` (JSON caché) contenant la `categorie` identifiée.
    - Le code utilise ce Meta pour pré-charger les prestataires.

2.  **Tour 2 (Approfondissement) :**
    - L'IA demande si les tests ont fonctionné.
    - Elle prépare psychologiquement l'utilisateur à l'intervention d'un pro.

3.  **Tour 3 (Recommandation Pro) :**
    - L'IA affiche la liste des prestataires (fournie dans le prompt via `session.prestataires`).
    - Elle donne les coordonnées (Nom, Tel) et conclut la session.

## 🇲🇬 Contexte Madagascar (Crucial pour l'IA)
L'IA doit agir comme un expert local avec les contraintes suivantes :
- **Énergie :** Délestages fréquents et surtensions (causes majeures de pannes).
- **Climat :** Saison des pluies (humidité, infiltrations).
- **Monnaie :** Toujours parler en Ariary (Ar).
- **Géographie :** Recommander des prestataires par quartier (le transport est difficile).
- **Langue :** Français simple, accessible, ton bienveillant et rassurant.

## 🛠 Protocole de Communication
- **MPANERA_META :** Utilisé par l'IA pour envoyer des données structurées au code au Tour 1.
- **MPANERA_SESSION :** JSON sérialisé renvoyé par le script, contenant l'historique et l'état de la session (turn, prestataires, etc.).

## 📁 Endpoints API Backend
- `GET /categories` : Liste des domaines (TV, Plomberie...).
- `GET /prestataires?categorie=X&quartier=Y` : Liste des pros.
- `POST /conversation` : Sauvegarde de l'historique pour analyse.
