# PROJET DE RÉSERVATION DE VOYAGES

# Contexte

Une startup souhaite lancer une plateforme de réservation de voyages nommée **Reservia**.
L’objectif est de proposer une application moderne permettant aux utilisateurs de :
- explorer des destinations,
- consulter des offres de voyages,
- réserver un séjour,
- gérer leurs réservations,
- et pour les administrateurs, gérer les offres disponibles.
Vous êtes chargé de concevoir et développer cette application avec **Next.js**.

# Objectifs pédagogiques

Ce projet vise à évaluer votre capacité à :
- concevoir une application complète avec Next.js,
- utiliser **SSR, SSG et ISR de manière pertinente** ,
- créer et consommer des **API routes** ,
- gérer une base de données,
- mettre en place une **authentification sécurisée** ,
- structurer un projet professionnel,
- optimiser les performances (images, chargement...),
- produire une UI/UX cohérente.

# Fonctionnalités attendues

## 1. Page d’accueil

La homepage doit être immersive et attractive.

### Contenu attendu :

- un hero section (image ou vidéo de voyage),
- une barre de recherche (destination, date),
- une mise en avant de destinations populaires,
- une navigation claire (Accueil, Destinations, Mes réservations, Connexion).

### Contraintes techniques :

- Utilisation de Next Image pour optimiser les images,
- Contenu partiellement statique ( SSG ou ISR recommandé ).

## 2. Liste des destinations

Page affichant toutes les destinations disponibles.

### Chaque destination doit afficher :

- nom,
- pays,
- image,
- prix de base,
- courte description,
- bouton "Voir plus".

### Fonctionnalités :

- recherche par destination,
- filtrage par prix ou pays,
- pagination ou scroll infini.

### Contraintes :

👉 Utiliser **ISR** (revalidation des données).

## 3. Page détail d’une destination

Page dynamique /destinations/[id].

### Contenu :

- galerie d’images,
- description complète,
- prix,
- dates disponibles,
- bouton "Réserver".

### Contraintes :

👉 Utiliser **SSR ou ISR** (à justifier).

## 4. Système de réservation

Un utilisateur connecté doit pouvoir :
- choisir une date,
- choisir un nombre de personnes,
- confirmer une réservation.

### Données à stocker :

- utilisateur,
- destination,
- date,
- nombre de personnes,
- prix total.

## 5. Authentification

Mettre en place un système d’authentification :
- inscription,
- connexion,
- déconnexion.

### Contraintes :

- sécurisation des routes (pages protégées),
- gestion de session (ex : JWT ou NextAuth).

## 6. Espace utilisateur

Page "Mon compte" permettant de :
- voir ses informations,
- consulter ses réservations,
- annuler une réservation.

## 7. Interface administrateur

Accessible uniquement aux admins.

### Fonctionnalités :

- ajouter une destination,
- modifier une destination,
- supprimer une destination,
- voir toutes les réservations.

## 8. API Routes (Backend)

Créer des routes API dans Next.js pour :
- gestion des utilisateurs,
- gestion des destinations,
- gestion des réservations.

## 9. Base de données

Vous devez utiliser une base de données (au choix) :
- MySQL,
- PostgreSQL,
- MongoDB.

### Attendus :

- schéma clair,
- relations cohérentes,
- utilisation via ORM possible (ex : Prisma).

## 10. Optimisation et bonnes pratiques

Le projet devra inclure :
- optimisation des images (Next/Image),
- code structuré (components, services, hooks),
- gestion des erreurs,
- loading states,
- responsive design.


# Barème de notation (/20)

- Pages principales complètes : 2 pts
- Réservation fonctionnelle : 2 pts
- Authentification : 2 pts
- Interface admin : 2 pts
- Utilisation SSR / SSG / ISR : 2 pts
- API routes bien structurées : 2 pts
- Optimisation (images, performances) : 1 pt
- Base de données bien conçue : 2 pts
- Intégration propre (ORM, requêtes) : 1 pt
- Design clair et moderne : 1 pt
- Responsive et ergonomie : 1 pt
- Présentation orale : 2pts

# Livrables attendus

- Code source complet (GitHub),
- README avec :
  - installation,
  - explication des choix techniques,
  - justification SSR / SSG / ISR,
- schéma de la base de données,
- captures d’écran.

