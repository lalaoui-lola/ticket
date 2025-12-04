# 🎫 Application de Gestion de Tickets IT

Application web moderne et complète de gestion de tickets informatiques avec authentification Supabase.

## 🎨 Design

- **Palette de couleurs personnalisée** :
  - Primary: `#175C64` (Teal foncé)
  - Accent: `#F7C7BB` (Rose corail)
  - Neutral: `#EEF2F2` (Gris clair)
  - Dark: `#0E3A40` (Teal très foncé)

## 🚀 Technologies utilisées

- **React 18** - Framework UI
- **Vite** - Build tool ultra-rapide
- **TailwindCSS** - Styling moderne
- **Supabase** - Backend, authentification et base de données
- **Lucide React** - Icônes modernes et élégantes

## 📦 Installation

1. Installer les dépendances :
```bash
npm install
```

2. Lancer le serveur de développement :
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3001`

## ✨ Fonctionnalités

### 🔐 Authentification
- ✅ Page de connexion moderne et responsive
- ✅ Intégration complète avec Supabase Auth
- ✅ Gestion des sessions utilisateurs
- ✅ Messages d'erreur et de succès

### 👥 Gestion des utilisateurs (Admin uniquement)
- ✅ Créer de nouveaux utilisateurs (admin ou utilisateur)
- ✅ Modifier les informations des utilisateurs
- ✅ Supprimer des utilisateurs
- ✅ Visualisation des rôles (Admin/Utilisateur)

### 🎫 Gestion des tickets
- ✅ Créer des tickets avec :
  - Titre
  - Description détaillée
  - Type de problème (Matériel/Logiciel/Connexion/Autre)
- ✅ Visualiser tous les tickets (admin) ou ses propres tickets (utilisateur)
- ✅ Filtrer par état (Ouvert/En cours/Résolu)
- ✅ Rechercher des tickets
- ✅ Système de commentaires
- ✅ Changement d'état des tickets (admin)
- ✅ Attribution automatique de l'admin au ticket

### 📊 Dashboard
- ✅ Statistiques en temps réel
- ✅ Compteurs de tickets par état
- ✅ Liste des tickets récents
- ✅ Vue adaptée selon le rôle (admin/utilisateur)

### 🎨 Interface utilisateur
- ✅ Design moderne et épuré
- ✅ Sidebar avec navigation
- ✅ Header avec informations utilisateur
- ✅ Responsive (mobile, tablette, desktop)
- ✅ Animations fluides
- ✅ Badges colorés pour les états et types

## 📁 Structure du projet

```
application tickets/
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Sidebar.jsx       # Navigation latérale
│   │   │   └── Header.jsx        # En-tête avec profil
│   │   ├── Login.jsx              # Page de connexion
│   │   ├── TicketModal.jsx        # Modal de création de ticket
│   │   └── TicketDetails.jsx      # Modal de détails/commentaires
│   ├── pages/
│   │   ├── Dashboard.jsx          # Tableau de bord
│   │   ├── Users.jsx              # Gestion des utilisateurs
│   │   └── Tickets.jsx            # Gestion des tickets
│   ├── lib/
│   │   └── supabase.js            # Configuration Supabase
│   ├── App.jsx                    # Composant principal
│   ├── main.jsx                   # Point d'entrée
│   └── index.css                  # Styles globaux
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🗄️ Base de données Supabase

### Tables créées :
1. **profiles** - Profils utilisateurs
2. **tickets** - Tickets IT
3. **commentaires** - Commentaires sur les tickets

### Politiques de sécurité (RLS) :
- Les utilisateurs voient uniquement leurs propres tickets
- Les admins ont accès à tous les tickets
- Les admins peuvent créer/modifier/supprimer des utilisateurs
- Système de commentaires avec contrôle d'accès

## 👤 Rôles utilisateurs

### Administrateur
- Créer et gérer les utilisateurs
- Voir tous les tickets
- Prendre en charge les tickets
- Changer l'état des tickets (Ouvert → En cours → Résolu)
- Ajouter des commentaires
- Accès au dashboard complet

### Utilisateur
- Créer des tickets
- Voir ses propres tickets
- Ajouter des commentaires sur ses tickets
- Suivre l'état de ses tickets

## 🎯 Workflow des tickets

1. **Création** : L'utilisateur crée un ticket (état: Ouvert)
2. **Prise en charge** : L'admin change l'état en "En cours" et est automatiquement assigné
3. **Résolution** : L'admin marque le ticket comme "Résolu"
4. **Communication** : Utilisateur et admin peuvent échanger via les commentaires

## 🔧 Configuration Supabase

L'application utilise les clés Supabase configurées dans `src/lib/supabase.js`.

**URL du projet** : `https://easocayxqfydurlbyfbk.supabase.co`

## 📱 Responsive Design

L'application est entièrement responsive :
- **Mobile** : Menu burger, layout adapté
- **Tablette** : Grilles optimisées
- **Desktop** : Sidebar fixe, layout complet

## 🎨 Personnalisation

Les couleurs sont configurées dans `tailwind.config.js` avec des palettes personnalisées :
- `primary` - Couleurs principales (teal)
- `accent` - Couleurs d'accentuation (rose corail)
- `neutral` - Couleurs neutres (gris)

## 🚀 Prochaines améliorations possibles

- Notifications en temps réel
- Export de rapports
- Pièces jointes aux tickets
- Historique des modifications
- Statistiques avancées
- Système de priorités
- Attribution manuelle des tickets
