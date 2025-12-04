# 🔧 Guide de dépannage

## Problème : Erreur 500 lors du chargement du profil

### Symptômes
- Message "Connexion réussie" s'affiche
- L'application ne charge pas les pages
- Erreur dans la console : `Failed to load resource: the server responded with a status of 500`

### Solutions

#### Solution 1 : Exécuter le script de correction SQL

1. Allez dans votre projet Supabase
2. Cliquez sur **SQL Editor** dans le menu de gauche
3. Créez une nouvelle requête
4. Copiez-collez le contenu du fichier `supabase-fix.sql`
5. Cliquez sur **Run**

Ce script va :
- Vérifier et créer la table `profiles` si nécessaire
- Corriger les politiques RLS
- Créer les profils manquants pour les utilisateurs existants
- Configurer le trigger automatique

#### Solution 2 : Créer manuellement le profil de l'utilisateur admin

Si vous avez déjà un utilisateur admin dans Supabase Auth :

1. Allez dans **SQL Editor**
2. Exécutez cette requête (remplacez les valeurs) :

```sql
-- Récupérer l'ID de votre utilisateur
SELECT id, email FROM auth.users;

-- Créer le profil (remplacez USER_ID et EMAIL par vos valeurs)
INSERT INTO profiles (id, email, nom, prenom, role)
VALUES (
  'USER_ID',  -- Remplacez par l'ID de votre utilisateur
  'EMAIL',    -- Remplacez par votre email
  'Admin',    -- Nom
  'Système',  -- Prénom
  'admin'     -- Rôle
)
ON CONFLICT (id) DO UPDATE SET
  nom = EXCLUDED.nom,
  prenom = EXCLUDED.prenom,
  role = EXCLUDED.role;
```

#### Solution 3 : Vérifier les politiques RLS

1. Allez dans **Database** > **Tables** > **profiles**
2. Cliquez sur **Policies**
3. Vérifiez que vous avez ces politiques :
   - ✅ SELECT : Tous les utilisateurs authentifiés
   - ✅ INSERT : Les utilisateurs peuvent créer leur propre profil
   - ✅ UPDATE : Les utilisateurs peuvent modifier leur propre profil
   - ✅ ALL : Les admins peuvent tout faire

#### Solution 4 : Désactiver temporairement RLS (pour tester uniquement)

⚠️ **ATTENTION** : Ne faites cela que temporairement pour tester !

```sql
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

Puis réactivez-le après avoir créé les profils :

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

## Problème : L'utilisateur ne peut pas se connecter

### Vérifications

1. **Email confirmé** : Allez dans Supabase > Authentication > Users
   - Vérifiez que l'email est confirmé
   - Si non, cliquez sur les 3 points > "Confirm email"

2. **Mot de passe correct** : Réinitialisez le mot de passe si nécessaire

3. **Profil existe** : Vérifiez dans SQL Editor :
```sql
SELECT * FROM profiles WHERE email = 'votre@email.com';
```

## Problème : Les tickets ne s'affichent pas

### Vérifications

1. **Table tickets existe** :
```sql
SELECT * FROM tickets LIMIT 5;
```

2. **Politiques RLS correctes** :
```sql
-- Vérifier les politiques
SELECT * FROM pg_policies WHERE tablename = 'tickets';
```

## Problème : Impossible de créer des utilisateurs (admin)

### Solution

Vérifiez que votre utilisateur a bien le rôle 'admin' :

```sql
SELECT id, email, role FROM profiles WHERE email = 'votre@email.com';
```

Si le rôle n'est pas 'admin', mettez-le à jour :

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'votre@email.com';
```

## Commandes utiles

### Voir tous les utilisateurs et leurs profils
```sql
SELECT 
  au.id,
  au.email,
  au.created_at as auth_created,
  p.nom,
  p.prenom,
  p.role,
  p.created_at as profile_created
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
ORDER BY au.created_at DESC;
```

### Supprimer un utilisateur et son profil
```sql
-- D'abord supprimer le profil
DELETE FROM profiles WHERE email = 'email@exemple.com';

-- Puis supprimer l'utilisateur dans l'interface Supabase
-- Authentication > Users > ... > Delete user
```

### Réinitialiser toutes les données (⚠️ DANGER)
```sql
-- Supprimer tous les commentaires
DELETE FROM commentaires;

-- Supprimer tous les tickets
DELETE FROM tickets;

-- Supprimer tous les profils (sauf les admins)
DELETE FROM profiles WHERE role != 'admin';
```

## Support

Si le problème persiste :

1. Vérifiez les logs dans Supabase : **Logs** > **Postgres Logs**
2. Vérifiez la console du navigateur (F12)
3. Vérifiez que toutes les tables sont créées correctement
4. Assurez-vous que les politiques RLS sont bien configurées
