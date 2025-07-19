# HBTRACK - Système de Gestion des Tâches de Chantier

![HBTRACK Logo](https://img.shields.io/badge/HBTRACK-Construction%20Management-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15.0.4-black?style=flat-square&logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-22.12.0-green?style=flat-square&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue?style=flat-square&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb)

## 📋 Description

**HBTRACK** est une application web moderne conçue pour faciliter la communication et le suivi des tâches sur chantier entre l'équipe d'encadrement (ingénieurs travaux, chefs de chantier, conducteurs de travaux) et l'équipe de réalisation (sous-traitants, ouvriers).

Cette application permet d'**attribuer**, de **suivre** et de **mettre à jour** les tâches en temps réel tout en assurant une **traçabilité complète** des activités journalières sur le chantier.

### 🎯 Fonctionnalités Principales

- **Authentification sécurisée** avec gestion des rôles utilisateurs
- **Gestion des tâches** avec attribution par lot et date
- **Tableau de bord** avec vue d'ensemble des activités
- **Gestion des utilisateurs** (réservée aux équipes d'encadrement)
- **Upload de photos** pour documenter les tâches
- **Gestion des lots** de construction
- **Interface responsive** adaptée aux mobiles et tablettes

### 🏗️ Architecture Technique

- **Frontend**: Next.js 15 avec TypeScript
- **Backend**: API Routes Next.js
- **Base de données**: MongoDB Atlas
- **Authentification**: NextAuth.js
- **Interface**: Tailwind CSS + Radix UI
- **Upload de fichiers**: Cloudinary
- **Validation**: Zod + React Hook Form

## 🚀 Installation et Configuration

### Prérequis

- **Node.js**: 22.12.0 ou supérieur
- **npm** ou **yarn**
- **MongoDB Atlas** (ou instance MongoDB locale)
- **Compte Cloudinary** (pour upload d'images)

### 1. Cloner le Projet

```bash
git clone https://github.com/Abdelkarim17B/HB-track-nextjs.git
cd HB-track-nextjs
```

### 2. Installer les Dépendances

```bash
npm install
# ou
yarn install
```

### 3. Configuration des Variables d'Environnement

Créer un fichier `.env.local` à la racine du projet :

```env
# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=super-secret-key-here

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hbtrack?retryWrites=true&w=majority

# Cloudinary (optionnel pour upload d'images)
CLOUDINARY_CLOUD_NAME=cloud-name
CLOUDINARY_API_KEY=api-key
CLOUDINARY_API_SECRET=api-secret
```

### 4. Initialisation de la Base de Données

```bash
npm run seed
```

### 5. Lancer l'Application

```bash
# Mode développement
npm run dev

# Mode production
npm run build
npm run start
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🐳 Docker

### Construction de l'Image Docker

```bash
npm run docker:build
```

### Lancement avec Docker

```bash
npm run docker:run
```

### Développement avec Docker Compose

```bash
npm run docker:dev
```

### 🧪 Tests

#### Tests Unitaires

```bash
# Lancer tous les tests
npm run test

# Mode watch
npm run test:watch
```

#### Tests End-to-End (Playwright)

```bash
# Lancer les tests E2E
npm run test:e2e

# Interface graphique
npm run test:e2e:ui
```

#### Tests Selenium

```bash
# Tests Selenium avec Firefox
npm run test:selenium

# Tests Selenium en mode headless
npm run test:selenium:headless
```

#### Script de Tests Complet

```bash
# Lancer tous les types de tests
./scripts/run-tests.sh

# Ignorer le build
SKIP_BUILD=true ./scripts/run-tests.sh

# Tests sur un serveur distant
TEST_URL=https://staging.hbtrack.com ./scripts/run-tests.sh
```

## 👥 Gestion des Utilisateurs

### Rôles Utilisateurs

1. **Équipe d'Encadrement**
   - `ingenieur` - Ingénieur travaux
   - `chef_chantier` - Chef de chantier  
   - `conducteur` - Conducteur de travaux

2. **Équipe de Réalisation**
   - `ouvrier` - Ouvrier
   - `sous_traitant` - Sous-traitant

### Permissions

- **Équipe d'Encadrement**: Accès complet (création/édition utilisateurs, tâches, lots)
- **Équipe de Réalisation**: Consultation et mise à jour des tâches assignées

## 📁 Structure du Projet

```
HB-track-nextjs/
├── app/                        # App Router Next.js 15
│   ├── (auth)/                # Pages d'authentification
│   │   ├── signin/
│   │   └── register/
│   ├── (dashboard)/           # Pages du tableau de bord
│   │   ├── dashboard/
│   │   ├── tasks/
│   │   ├── users/
│   │   └── settings/
│   ├── api/                   # API Routes
│   │   ├── auth/
│   │   ├── tasks/
│   │   ├── users/
│   │   └── lots/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/                # Composants réutilisables
│   ├── ui/                   # Composants UI (Radix)
│   ├── layout/
│   └── auth-provider.tsx
├── lib/                      # Utilitaires et configuration
│   ├── models/
│   ├── auth.ts
│   ├── mongodb.ts
│   └── utils.ts
├── scripts/                  # Scripts utilitaires
├── tests/                    # Tests
│   ├── __tests__/           # Tests unitaires
│   └── e2e/                 # Tests E2E
├── docker/                   # Configuration Docker
├── .github/                  # CI/CD GitHub Actions
└── docs/                     # Documentation
```

## 🚀 CI/CD Pipeline

Le projet inclut une pipeline CI/CD complète avec GitHub Actions :

- **Tests automatisés** (unitaires + E2E)
- **Build et validation** du code
- **Construction d'images Docker**
- **Déploiement automatique**
- **Analyse de qualité** avec SonarQube
- **Scan de sécurité**

### Workflows Disponibles

- `ci.yml` - Intégration continue
- `cd.yml` - Déploiement continu
- `security.yml` - Analyse de sécurité
- `docker.yml` - Build et push d'images Docker

## 📊 API Documentation

### Endpoints Principaux

#### Authentification
- `POST /api/auth/signin` - Connexion
- `POST /api/auth/signout` - Déconnexion

#### Utilisateurs
- `GET /api/users` - Liste des utilisateurs
- `POST /api/users` - Créer un utilisateur

#### Tâches
- `GET /api/tasks` - Liste des tâches
- `POST /api/tasks` - Créer une tâche
- `PUT /api/tasks/[id]` - Mettre à jour une tâche
- `DELETE /api/tasks/[id]` - Supprimer une tâche

#### Lots
- `GET /api/lots` - Liste des lots
- `POST /api/lots` - Créer un lot

## 🔧 Configuration Avancée

### Middleware de Sécurité

Le projet inclut un middleware pour :
- Protection des routes authentifiées
- Redirection automatique selon le statut de connexion
- Gestion des permissions par rôle

### Optimisations

- **SSR/SSG** avec Next.js 15
- **Image optimization** automatique
- **Code splitting** et lazy loading
- **Cache strategies** pour l'API

## 🤝 Contribution

### Workflow de Contribution

1. **Fork** le projet
2. Créer une **branche feature** (`git checkout -b feature/nouvelle-fonctionnalite`)
3. **Commit** les changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. **Push** vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une **Pull Request**

### Standards de Code

- **TypeScript strict mode**
- **ESLint** + **Prettier** pour le formatage
- **Tests** obligatoires pour les nouvelles fonctionnalités
- **Documentation** des fonctions complexes

## 📄 Licence

Ce projet a été développé dans le cadre d'un projet freelance pour un client en France. Tous droits réservés.

## 👨‍💻 Développeur

**Abdelkarim Bengherbia**
- GitHub: [@Abdelkarim17B](https://github.com/Abdelkarim17B)
- LinkedIn: [Abdelkarim Bengherbia](https://linkedin.com/in/abdelkarim-bengherbia)

---

## 🆘 Support

Pour toute question ou problème :

1. Consulter la [documentation](./docs/)
2. Vérifier les [issues existantes](https://github.com/Abdelkarim17B/HB-track-nextjs/issues)
3. Créer une nouvelle issue si nécessaire

---

**HBTRACK** - Révolutionnez la gestion de vos chantiers ! 🏗️✨
