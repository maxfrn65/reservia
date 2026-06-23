# Reservia

Plateforme de réservation de voyages développée avec Next.js 16 (App Router) dans le cadre d'un projet pédagogique Ynov.

Les utilisateurs peuvent explorer des destinations, consulter des offres, réserver un séjour et gérer leurs réservations. Les administrateurs disposent d'une interface dédiée pour gérer le catalogue et suivre les réservations.

## Sommaire

- [Stack technique](#stack-technique)
- [Installation](#installation)
- [Scripts disponibles](#scripts-disponibles)
- [Comptes de test](#comptes-de-test)
- [Structure du projet](#structure-du-projet)
- [Choix techniques](#choix-techniques)
- [Stratégie de rendu (SSR / SSG / ISR)](#stratégie-de-rendu-ssr--ssg--isr)
- [Schéma de la base de données](#schéma-de-la-base-de-données)
- [Routes API](#routes-api)

## Stack technique

- **Next.js 16** (App Router, Server Components, Server Actions)
- **React 19**
- **TypeScript** strict
- **Prisma 7** + **MySQL 8** (via l'adapter `@prisma/adapter-mariadb`)
- **Tailwind CSS 4** + **shadcn/ui** (Base UI)
- **Zod** pour la validation des entrées (API + Server Actions)
- **jose** (JWT HS256) pour la session
- **bcryptjs** pour le hash des mots de passe
- **Docker Compose** pour la base MySQL locale

## Installation

### Prérequis

- Node.js 20+
- Docker (pour la base MySQL locale)

### Étapes

```bash
# 1. Cloner le dépôt et installer les dépendances
npm install

# 2. Copier les variables d'environnement
cp .env.example .env

# Générer un AUTH_SECRET solide et le coller dans .env :
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"

# 3. Démarrer la base de données
docker compose up -d

# 4. Appliquer les migrations Prisma
npx prisma migrate deploy

# 5. Générer le client Prisma
npx prisma generate

# 6. Seeder les données (admin, utilisateur de test, 6 destinations)
npx prisma db seed

# 7. Lancer le serveur de développement
npm run dev
```

Application disponible sur [http://localhost:3000](http://localhost:3000).

### Variables d'environnement

| Variable       | Description                              |
| -------------- | ---------------------------------------- |
| `DATABASE_URL` | URL de connexion MySQL (Prisma)          |
| `AUTH_SECRET`  | Clé secrète pour signer les JWT (48 oct) |

## Scripts disponibles

```bash
npm run dev      # serveur de développement (Turbopack)
npm run build    # build de production
npm run start    # serveur de production
npm run lint     # ESLint
```

Commandes Prisma utiles :

```bash
npx prisma migrate dev    # nouvelle migration en dev
npx prisma migrate deploy # appliquer les migrations
npx prisma db seed        # exécuter le seed
npx prisma studio         # explorateur de la base
```

## Comptes de test

Après seed :

| Rôle  | Email                 | Mot de passe |
| ----- | --------------------- | ------------ |
| Admin | `admin@reservia.test` | `admin1234`  |
| User  | `user@reservia.test`  | `user1234`   |

## Structure du projet

```
app/
  (auth)/            # login + register (route group, layout dédié)
  account/           # espace utilisateur (réservations, annulation)
  admin/             # interface admin (destinations + réservations)
  api/               # routes API (auth, destinations, reservations, me, upload)
  destinations/      # liste + détail des destinations
  layout.tsx         # layout racine + Nav
  page.tsx           # homepage (hero + destinations populaires)
components/          # composants partagés (Nav, DestinationCard, ui/...)
lib/
  api.ts             # helpers de réponse + gestion d'erreurs
  auth.ts            # session, hash, requireUser, requireAdmin
  prisma.ts          # client Prisma singleton
  queries/           # accès BDD (destinations, reservations, admin)
  schemas.ts         # schémas Zod partagés
  session.ts         # signature / vérification JWT
prisma/
  schema.prisma      # modèle de données
  seed.ts            # données initiales
proxy.ts             # middleware de protection des routes
```

## Choix techniques

### Authentification : JWT maison via `jose`

Plutôt que NextAuth, j'ai mis en place une session JWT signée en HS256 avec `jose`, stockée dans un cookie HTTP-only `reservia_session` (7 jours). C'est suffisant pour les besoins du projet, ne nécessite aucune dépendance lourde et reste compatible avec l'Edge Runtime utilisé par le middleware.

Le hash des mots de passe est réalisé avec `bcryptjs`.

### Protection des routes

Le fichier `proxy.ts` (le middleware s'appelle désormais `proxy` dans Next 16) intercepte les routes `/account/*` et `/admin/*` :

- redirection vers `/login?next=...` si la session est absente ou invalide,
- redirection vers `/` si l'utilisateur connecté n'est pas admin sur une route admin.

Les Server Actions et Routes API utilisent en complément `requireUser()` / `requireAdmin()` (défense en profondeur — un middleware ne suffit pas).

### Validation

Toutes les entrées (formulaires via Server Actions + routes API) sont validées avec **Zod**. Les schémas vivent dans `lib/schemas.ts` et sont réutilisés côté client (formulaires) et serveur (API).

### Réservation atomique

La création d'une réservation est exécutée dans une **transaction Prisma** qui :

1. lit l'`Availability` ciblée,
2. vérifie le nombre de places restantes,
3. décrémente `spotsLeft`,
4. crée la `Reservation` avec un `totalPrice` calculé côté serveur.

Cela évite les sur-réservations en cas d'accès concurrents.

### Images

`next/image` est utilisé partout. `next.config.ts` autorise `images.unsplash.com` (les destinations seedées pointent vers Unsplash). Le hero est marqué `priority` pour le LCP.

### UI

- **Tailwind CSS 4** (config zéro via `@tailwindcss/postcss`)
- **shadcn/ui** sur **Base UI** pour les primitives accessibles (dialog, select, etc.)
- Design responsive, mobile-first

## Stratégie de rendu (SSR / SSG / ISR)

| Page                       | Stratégie                              | Justification                                                                                                                                                                                          |
| -------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/` (homepage)             | **ISR** — `revalidate = 3600`          | Le hero et les destinations populaires changent peu. Une régénération horaire suffit. Le rendu est ultra-rapide et le SEO optimal.                                                                     |
| `/destinations`            | **ISR** — `revalidate = 3600`          | Le catalogue évolue rarement. ISR permet de servir une page pré-rendue tout en restant à jour quand un admin modifie une destination (via `revalidateTag("destinations")` déclenché par les mutations). |
| `/destinations/[id]`       | **SSR** — `dynamic = "force-dynamic"`  | La page affiche les places restantes en temps réel et un état dépendant de l'utilisateur (CTA "Réserver" si connecté). Une donnée potentiellement périmée serait gênante au moment de réserver.        |
| `/account`, `/admin`       | **SSR** (Server Components)            | Contenu strictement personnel, dépendant de la session. Aucun bénéfice à pré-rendre.                                                                                                                   |
| `/login`, `/register`      | **Statique**                           | Formulaires purs, aucun fetch côté serveur.                                                                                                                                                            |

Les mutations admin (création / édition / suppression de destination) appellent `revalidateTag("destinations", "max")` pour invalider le cache ISR du catalogue immédiatement.

## Schéma de la base de données

```
┌────────────┐         ┌──────────────────┐         ┌──────────────────┐
│   User     │         │   Reservation    │         │   Destination    │
├────────────┤         ├──────────────────┤         ├──────────────────┤
│ id (PK)    │◄────────│ userId (FK)      │         │ id (PK)          │
│ email      │  1:N    │ destinationId(FK)│────────►│ name             │
│ password   │         │ availabilityId(FK)│   N:1  │ country          │
│ name       │         │ numberOfPeople   │         │ basePrice        │
│ role       │         │ totalPrice       │         │ shortDescription │
│ createdAt  │         │ status           │         │ description      │
└────────────┘         │ createdAt        │         │ createdAt        │
                       └──────────────────┘         └──────────────────┘
                                ▲                          ▲
                                │ N:1                      │ 1:N
                                │                          │
                       ┌──────────────────┐         ┌──────────────┐
                       │  Availability    │         │    Image     │
                       ├──────────────────┤         ├──────────────┤
                       │ id (PK)          │         │ id (PK)      │
                       │ destinationId(FK)│◄────────│ destinationId│
                       │ startDate        │  1:N    │ url          │
                       │ endDate          │         │ alt          │
                       │ spotsLeft        │         │ order        │
                       └──────────────────┘         └──────────────┘
```

### Relations

- `User` 1 — N `Reservation`
- `Destination` 1 — N `Image`
- `Destination` 1 — N `Availability`
- `Destination` 1 — N `Reservation`
- `Availability` 1 — N `Reservation`

### Énumérations

- `Role` : `USER` | `ADMIN`
- `ReservationStatus` : `CONFIRMED` | `CANCELLED`

Le détail complet est dans [`prisma/schema.prisma`](./prisma/schema.prisma).

## Routes API

Toutes les routes répondent en JSON et utilisent les schémas Zod pour valider l'entrée. Les erreurs sont normalisées via `lib/api.ts`.

### Auth

| Méthode | Route                | Description                              |
| ------- | -------------------- | ---------------------------------------- |
| POST    | `/api/auth/register` | Inscription (email, password, name)      |
| POST    | `/api/auth/login`    | Connexion → pose le cookie de session    |
| POST    | `/api/auth/logout`   | Déconnexion → supprime le cookie         |
| GET     | `/api/me`            | Profil de l'utilisateur connecté         |

### Destinations

| Méthode | Route                    | Auth  | Description                                         |
| ------- | ------------------------ | ----- | --------------------------------------------------- |
| GET     | `/api/destinations`      | —     | Liste paginée + filtres (`q`, `country`, `min/max`) |
| POST    | `/api/destinations`      | ADMIN | Créer une destination                               |
| GET     | `/api/destinations/[id]` | —     | Détail d'une destination                            |
| PATCH   | `/api/destinations/[id]` | ADMIN | Modifier une destination                            |
| DELETE  | `/api/destinations/[id]` | ADMIN | Supprimer une destination                           |

### Réservations

| Méthode | Route                    | Auth         | Description                                                |
| ------- | ------------------------ | ------------ | ---------------------------------------------------------- |
| GET     | `/api/reservations`      | USER / ADMIN | Liste : ses réservations (USER) ou toutes (ADMIN)          |
| POST    | `/api/reservations`      | USER         | Créer une réservation (transactionnelle, décrémente spots) |
| DELETE  | `/api/reservations/[id]` | USER / ADMIN | Annuler une réservation (statut `CANCELLED`)               |

### Admin

| Méthode | Route                | Auth  | Description                          |
| ------- | -------------------- | ----- | ------------------------------------ |
| POST    | `/api/admin/upload`  | ADMIN | Upload d'image vers `public/uploads` |
