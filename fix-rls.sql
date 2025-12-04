-- SCRIPT DE CORRECTION DES POLITIQUES RLS
-- Exécutez ce script dans le SQL Editor de Supabase

-- 1. Désactiver temporairement RLS pour déboguer
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Vérifier et afficher tous les utilisateurs
SELECT 
  au.id as auth_id,
  au.email,
  p.id as profile_id,
  p.nom,
  p.prenom,
  p.role
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id;

-- 3. Supprimer toutes les anciennes politiques
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir tous les profils" ON profiles;
DROP POLICY IF EXISTS "Les admins peuvent tout faire sur les profils" ON profiles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leur propre profil" ON profiles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leur propre profil" ON profiles;

-- 4. Réactiver RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Créer des politiques SIMPLES et PERMISSIVES

-- Politique SELECT : Tout le monde peut voir tous les profils
CREATE POLICY "Tout le monde peut voir les profils"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Politique INSERT : Tout le monde peut créer un profil avec son propre ID
CREATE POLICY "Créer son propre profil"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Politique UPDATE : Tout le monde peut modifier son propre profil OU être admin
CREATE POLICY "Modifier son profil ou être admin"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id 
    OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Politique DELETE : Seuls les admins peuvent supprimer
CREATE POLICY "Seuls les admins peuvent supprimer"
  ON profiles FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 6. Créer les profils manquants
INSERT INTO public.profiles (id, email, nom, prenom, role)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'nom', 'Utilisateur'),
  COALESCE(au.raw_user_meta_data->>'prenom', 'Nouveau'),
  COALESCE(au.raw_user_meta_data->>'role', 'admin')
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = au.id
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role;

-- 7. Afficher le résultat final
SELECT 
  p.id,
  p.email,
  p.nom,
  p.prenom,
  p.role,
  p.created_at
FROM profiles p
ORDER BY p.created_at DESC;
