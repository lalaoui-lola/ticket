-- Script de correction pour Supabase
-- Exécutez ce script dans le SQL Editor de Supabase si vous avez des problèmes

-- 1. Vérifier que la table profiles existe
-- Si elle n'existe pas, la créer
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL DEFAULT '',
  prenom TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'utilisateur' CHECK (role IN ('admin', 'utilisateur')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir tous les profils" ON profiles;
DROP POLICY IF EXISTS "Les admins peuvent tout faire sur les profils" ON profiles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leur propre profil" ON profiles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leur propre profil" ON profiles;

-- 3. Activer RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Créer les nouvelles politiques
-- Permettre à tout utilisateur authentifié de voir tous les profils
CREATE POLICY "Les utilisateurs peuvent voir tous les profils"
  ON profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Permettre aux utilisateurs de créer leur propre profil
CREATE POLICY "Les utilisateurs peuvent créer leur propre profil"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Permettre aux utilisateurs de modifier leur propre profil
CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Permettre aux admins de tout faire
CREATE POLICY "Les admins peuvent tout faire sur les profils"
  ON profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 5. Créer ou remplacer la fonction de trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nom, prenom, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nom', ''),
    COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'utilisateur')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Supprimer l'ancien trigger s'il existe et en créer un nouveau
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Créer les profils manquants pour les utilisateurs existants
INSERT INTO public.profiles (id, email, nom, prenom, role)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'nom', ''),
  COALESCE(au.raw_user_meta_data->>'prenom', ''),
  COALESCE(au.raw_user_meta_data->>'role', 'utilisateur')
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- 8. Afficher les profils créés
SELECT * FROM profiles;
