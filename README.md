# 🏥 Dashboard Vaccination & Grippe

> **Plateforme de visualisation interactive des données de santé publique française**

Développé pour le **Hackathon Élysée DataLab 2025**, ce dashboard offre une visualisation cartographique interactive des données de vaccination et de surveillance de la grippe en France (2021-2024).

![Dashboard Preview](public/logo.png)

## ✨ Fonctionnalités Principales

### 🗺️ Carte Interactive
- **Visualisation départementale** : Carte de France avec données colorées par département
- **Interaction intuitive** : Survol et clic pour explorer les détails
- **Basculement de données** : Vaccination ↔ Surveillance grippe en un clic

### 📊 Analyses Statistiques
- **Métriques clés** : Couverture vaccinale, taux d'urgences, consultations SOS Médecins
- **Répartition démographique** : Analyses par tranches d'âge avec visualisations
- **Évolution temporelle** : Tendances et comparaisons multi-années

### 🎛️ Interface Adaptative
- **Design responsive** : Optimisé desktop, tablette et mobile
- **Navigation simple** : Interface épurée sans filtres complexes
- **Accessibilité** : Conforme aux standards d'accessibilité web

## 🚀 Démarrage Rapide

### Prérequis
- **Node.js** 18+ 
- **pnpm** (gestionnaire de paquets recommandé)

### Installation

```bash
# Cloner le repository
git clone [url-du-repo]
cd dahsboard

# Installer les dépendances
pnpm install

# Lancer en mode développement
pnpm dev
```

🌐 **Accès** : [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture Technique

### Stack Technologique
| Composant | Technologie | Version |
|-----------|-------------|---------|
| **Framework** | Next.js | 15.5.6 |
| **Langage** | TypeScript | 5+ |
| **Styling** | Tailwind CSS | 4 |
| **Cartes** | React Simple Maps | 3.0.0 |
| **Graphiques** | Recharts | 3.3.0 |
| **Données** | Papa Parse | 5.5.3 |
| **Géospatial** | D3.js | 3.1.1+ |

### Structure du Projet

```
📦 dahsboard/
├── 🎨 app/                     # Pages & Layout (App Router)
│   ├── fonts/                  # Polices Marianne (République Française)
│   ├── globals.css             # Styles globaux
│   ├── layout.tsx              # Layout principal
│   └── page.tsx                # Page d'accueil (Dashboard)
├── 📚 lib/                     # Logique métier
│   ├── components/             # Composants React réutilisables
│   │   ├── InteractiveMap.tsx  # Carte interactive principale
│   │   ├── StatisticsPanel.tsx # Panneau de statistiques
│   │   ├── AnalyticsPanel.tsx  # Analyses avancées
│   │   └── ...                 # Autres composants UI
│   ├── services/               # Services de données
│   │   ├── dashboard-data-service.ts  # Service principal
│   │   ├── parseur-vaccination.ts     # Parser données vaccination
│   │   └── parseur-grippe.ts          # Parser données grippe
│   ├── types/                  # Définitions TypeScript
│   └── utils/                  # Utilitaires (formatage, etc.)
├── 📊 public/data/             # Datasets CSV
│   ├── campagne-*.csv          # Données campagnes vaccination
│   ├── couverture-*.csv        # Couverture vaccinale
│   ├── doses-actes-*.csv       # Doses administrées
│   └── grippe-*.csv            # Surveillance grippe
└── 🔧 Configuration            # Config Next.js, TypeScript, etc.
```

## 📊 Sources de Données

### 💉 Vaccination (2021-2024)
- **Campagnes** : Données de campagnes de vaccination par année
- **Couverture** : Taux de couverture vaccinale par département/région
- **Doses** : Nombre de doses administrées et actes de vaccination

### 🤒 Surveillance Grippe
- **Urgences** : Passages aux urgences liés à la grippe
- **SOS Médecins** : Consultations et actes médicaux
- **Géolocalisation** : Données nationales, régionales et départementales

## 🎨 Design System

### Palette Gouvernementale
```css
/* Couleurs officielles République Française */
--bleu-france: #000091      /* Primaire */
--rouge-marianne: #E1000F   /* Accent */
--gris-france: #929292      /* Secondaire */
--blanc: #FFFFFF            /* Arrière-plan */
```

### Typographie
- **Police** : Marianne (police officielle de l'État français)
- **Hiérarchie** : Système typographique cohérent
- **Lisibilité** : Optimisée pour l'accessibilité

## 🔧 Scripts de Développement

```bash
# Développement avec Turbopack (ultra-rapide)
pnpm dev

# Build de production optimisé
pnpm build

# Serveur de production
pnpm start
```

## 📋 Roadmap & Statut

### ✅ Fonctionnalités Implémentées
- [x] Architecture Next.js 15 + TypeScript
- [x] Carte interactive des départements français
- [x] Parseurs CSV pour données vaccination/grippe
- [x] Interface responsive et accessible
- [x] Panneau statistiques avec métriques clés
- [x] Basculement vaccination ↔ grippe
- [x] Sélection d'années (2021-2024)

### 🚧 En Développement
- [ ] Analyses prédictives IA (optionnel)
- [ ] Export de données/graphiques
- [ ] Mode comparaison multi-départements

## 🏆 Contexte Hackathon

**Élysée DataLab 2025** - Équipe d'ingénierie de la République française

**Objectif** : Créer des outils de visualisation innovants pour les données de santé publique, facilitant la prise de décision et la communication vers les citoyens.

**Approche** : Développement dirigé par les spécifications avec méthodologie agile.

## 📝 Documentation Technique

Le projet suit une approche **Spec-Driven Development** :

- 📋 **[Requirements](/.kiro/specs/vaccination-flu-dashboard/requirements.md)** : Exigences fonctionnelles détaillées
- 🏗️ **[Design](/.kiro/specs/vaccination-flu-dashboard/design.md)** : Architecture et conception technique  
- ✅ **[Tasks](/.kiro/specs/vaccination-flu-dashboard/tasks.md)** : Plan d'implémentation et suivi

## 🤝 Contribution

Ce projet étant développé dans le cadre d'un hackathon, les contributions externes ne sont pas acceptées durant la période de compétition.

## 📄 Licence

**Projet éducatif** - Hackathon Élysée DataLab 2025  
Développé dans le cadre de l'innovation publique française.

---

<div align="center">

**🇫🇷 Fait avec ❤️ pour la République Française**

*Élysée DataLab - Innovation au service du citoyen*

</div>
