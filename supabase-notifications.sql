-- CRÉATION DU SYSTÈME DE NOTIFICATION DANS SUPABASE
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Création de la table des notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipient_id UUID NOT NULL REFERENCES auth.users(id),
  sender_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL CHECK (type IN ('new_ticket', 'ticket_update', 'admin_assigned', 'comment')),
  content JSONB NOT NULL,
  is_read BOOLEAN DEFAULT false,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Index pour optimiser la recherche
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- 3. Activer Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 4. Politiques de sécurité
-- Lecture: Utilisateurs peuvent voir uniquement leurs propres notifications
CREATE POLICY "Utilisateurs peuvent voir leurs propres notifications" 
  ON notifications 
  FOR SELECT 
  USING (auth.uid() = recipient_id);

-- Insertion: Permettre l'insertion via trigger/function
CREATE POLICY "System can insert notifications" 
  ON notifications 
  FOR INSERT 
  WITH CHECK (TRUE);

-- Update: Utilisateurs peuvent mettre à jour uniquement leurs propres notifications (pour marquer comme lu)
CREATE POLICY "Utilisateurs peuvent mettre à jour leurs propres notifications" 
  ON notifications 
  FOR UPDATE 
  USING (auth.uid() = recipient_id);

-- Delete: Utilisateurs peuvent supprimer uniquement leurs propres notifications
CREATE POLICY "Utilisateurs peuvent supprimer leurs propres notifications" 
  ON notifications 
  FOR DELETE 
  USING (auth.uid() = recipient_id);

-- 5. Fonctions pour générer des notifications automatiques

-- 5.1. Fonction pour notifier les admins d'un nouveau ticket
CREATE OR REPLACE FUNCTION notify_admins_of_new_ticket()
RETURNS TRIGGER AS $$
DECLARE
  admin_user RECORD;
  ticket_creator_name TEXT;
BEGIN
  -- Récupérer le nom du créateur du ticket
  SELECT CONCAT(prenom, ' ', nom) INTO ticket_creator_name
  FROM profiles
  WHERE id = NEW.utilisateur_id;

  -- Notifier tous les admins
  FOR admin_user IN 
    SELECT id 
    FROM profiles 
    WHERE role = 'admin'
  LOOP
    INSERT INTO notifications (
      recipient_id, 
      sender_id, 
      type, 
      content, 
      ticket_id
    ) 
    VALUES (
      admin_user.id,
      NEW.utilisateur_id,
      'new_ticket',
      json_build_object(
        'ticket_title', NEW.titre,
        'ticket_type', NEW.type_probleme,
        'creator_name', ticket_creator_name
      ),
      NEW.id
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.2. Fonction pour notifier l'utilisateur quand son ticket est pris en charge
CREATE OR REPLACE FUNCTION notify_user_of_ticket_status_change()
RETURNS TRIGGER AS $$
DECLARE
  admin_name TEXT;
BEGIN
  -- Seulement si l'état a changé ou un admin vient d'être assigné
  IF (NEW.etat <> OLD.etat) OR (NEW.admin_id IS NOT NULL AND OLD.admin_id IS NULL) THEN
    
    -- Si un admin vient d'être assigné
    IF (NEW.admin_id IS NOT NULL AND OLD.admin_id IS NULL) THEN
      SELECT CONCAT(prenom, ' ', nom) INTO admin_name
      FROM profiles
      WHERE id = NEW.admin_id;
      
      -- Notifier l'utilisateur
      INSERT INTO notifications (
        recipient_id, 
        sender_id, 
        type, 
        content, 
        ticket_id
      ) 
      VALUES (
        NEW.utilisateur_id,
        NEW.admin_id,
        'admin_assigned',
        json_build_object(
          'ticket_title', NEW.titre,
          'admin_name', admin_name
        ),
        NEW.id
      );
    END IF;
    
    -- Si l'état a changé
    IF (NEW.etat <> OLD.etat) THEN
      -- Notifier l'utilisateur du changement d'état
      INSERT INTO notifications (
        recipient_id, 
        sender_id, 
        type, 
        content, 
        ticket_id
      ) 
      VALUES (
        NEW.utilisateur_id,
        NEW.admin_id,
        'ticket_update',
        json_build_object(
          'ticket_title', NEW.titre,
          'old_state', OLD.etat,
          'new_state', NEW.etat
        ),
        NEW.id
      );
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.3. Fonction pour notifier les parties concernées d'un nouveau commentaire
CREATE OR REPLACE FUNCTION notify_of_new_comment()
RETURNS TRIGGER AS $$
DECLARE
  ticket_record RECORD;
  comment_author_name TEXT;
BEGIN
  -- Récupérer les infos du ticket
  SELECT * INTO ticket_record
  FROM tickets
  WHERE id = NEW.ticket_id;
  
  -- Récupérer le nom de l'auteur du commentaire
  SELECT CONCAT(prenom, ' ', nom) INTO comment_author_name
  FROM profiles
  WHERE id = NEW.auteur_id;
  
  -- Notifier l'utilisateur si le commentaire vient de l'admin
  IF NEW.auteur_id <> ticket_record.utilisateur_id THEN
    INSERT INTO notifications (
      recipient_id, 
      sender_id, 
      type, 
      content, 
      ticket_id
    ) 
    VALUES (
      ticket_record.utilisateur_id,
      NEW.auteur_id,
      'comment',
      json_build_object(
        'ticket_title', ticket_record.titre,
        'comment_preview', substring(NEW.contenu from 1 for 50),
        'author_name', comment_author_name
      ),
      NEW.ticket_id
    );
  END IF;
  
  -- Notifier l'admin si le commentaire vient de l'utilisateur
  IF ticket_record.admin_id IS NOT NULL AND NEW.auteur_id <> ticket_record.admin_id THEN
    INSERT INTO notifications (
      recipient_id, 
      sender_id, 
      type, 
      content, 
      ticket_id
    ) 
    VALUES (
      ticket_record.admin_id,
      NEW.auteur_id,
      'comment',
      json_build_object(
        'ticket_title', ticket_record.titre,
        'comment_preview', substring(NEW.contenu from 1 for 50),
        'author_name', comment_author_name
      ),
      NEW.ticket_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Créer les triggers

-- 6.1. Trigger pour les nouveaux tickets
DROP TRIGGER IF EXISTS after_ticket_created ON tickets;
CREATE TRIGGER after_ticket_created
  AFTER INSERT ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION notify_admins_of_new_ticket();

-- 6.2. Trigger pour les mises à jour de tickets
DROP TRIGGER IF EXISTS after_ticket_updated ON tickets;
CREATE TRIGGER after_ticket_updated
  AFTER UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION notify_user_of_ticket_status_change();

-- 6.3. Trigger pour les nouveaux commentaires
DROP TRIGGER IF EXISTS after_comment_created ON commentaires;
CREATE TRIGGER after_comment_created
  AFTER INSERT ON commentaires
  FOR EACH ROW
  EXECUTE FUNCTION notify_of_new_comment();

-- 7. Données de test (optionnel)
-- INSERT INTO notifications (recipient_id, type, content, is_read)
-- SELECT 
--   id, 
--   'test_notification',
--   json_build_object('message', 'Ceci est une notification de test'),
--   false
-- FROM profiles 
-- WHERE role = 'admin'
-- LIMIT 1;
