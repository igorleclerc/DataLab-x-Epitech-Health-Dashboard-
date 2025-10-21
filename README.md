# Tableau de Bord Vaccination et Grippe

Projet développé dans le cadre du hackathon Élysée DataLab 2025 pour la visualisation des données de vaccination et de surveillance de la grippe en France.

## 🎯 Objectifs du Projet

- **Visualisation des données** : Créer des graphiques interactifs pour analyser les données de vaccination et de surveillance grippe
- **Prédictions IA** : Implémenter des prédictions basées sur des modèles de langage (fonctionnalité optionnelle)
- **Interface française** : Application entièrement en français avec formatage des dates et nombres selon les standards français

## 📊 Données Utilisées

### Vaccination

- `campagne-2024.csv` : Données de campagne de vaccination
- `couverture-2024.csv` : Couverture vaccinale par région
- `doses-actes-2024.csv` : Doses administrées et actes de vaccination

### Surveillance Grippe

- `grippe-passages-aux-urgences-et-actes-sos-medecins-france.csv` : Données nationales
- `grippe-passages-aux-urgences-et-actes-sos-medecins-departement.csv` : Données départementales

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+
- pnpm (recommandé)

### Installation

```bash
# Cloner le projet
git clone [url-du-repo]
cd dahsboard

# Installer les dépendances
pnpm install

# Lancer le serveur de développement
pnpm dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🛠️ Technologies Utilisées

- **Framework** : Next.js 15 avec App Router
- **Langage** : TypeScript
- **Styling** : Tailwind CSS 4
- **Graphiques** : Recharts
- **Parsing CSV** : Papa Parse
- **Icônes** : Lucide React

## 🎨 Palette de Couleurs

- **Primaire** : #10162F (Bleu marine)
- **Arrière-plan** : #FFFFFF (Blanc)
- **Accent** : #B01E09 (Rouge)

## 📁 Structure du Projet

```
├── app/                    # Pages Next.js (App Router)
├── lib/
│   ├── types/             # Interfaces TypeScript
│   ├── constants/         # Constantes et textes
│   └── utils/             # Utilitaires (formatage, etc.)
├── data/                  # Fichiers CSV
└── public/                # Assets statiques
```

## 🔧 Développement

### Scripts Disponibles

```bash
pnpm dev          # Serveur de développement
pnpm build        # Build de production
pnpm start        # Serveur de production
```

### Fonctionnalités Implémentées

- ✅ Configuration du projet et dépendances
- ✅ Types TypeScript pour les données
- ✅ Interface utilisateur en français
- ✅ Palette de couleurs personnalisée
- 🚧 Parseurs CSV (en cours)
- ⏳ Composants de visualisation
- ⏳ Interface utilisateur complète

## 📝 Spécifications

Le projet suit une approche de développement dirigée par les spécifications :

- `requirements.md` : Exigences fonctionnelles
- `design.md` : Architecture et conception
- `tasks.md` : Plan d'implémentation

## 🏆 Hackathon Élysée DataLab

Ce projet est développé dans le cadre du hackathon organisé par l'Élysée DataLab, l'équipe d'ingénierie de la République française, avec pour objectif de créer des outils de visualisation et d'analyse des données de santé publique.

## 📄 Licence

Projet développé dans le cadre éducatif - Hackathon Élysée DataLab 2025
