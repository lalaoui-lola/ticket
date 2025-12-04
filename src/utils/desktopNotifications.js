/**
 * Système de notifications de bureau avancé
 * Permet d'afficher des notifications dans le système d'exploitation (près de l'horloge)
 */

// Vérifie si les notifications sont supportées
const isNotificationSupported = () => {
  return 'Notification' in window;
};

// Demande la permission d'afficher des notifications
export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) {
    console.warn('Les notifications ne sont pas supportées par ce navigateur');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

/**
 * Affiche une notification de bureau
 * @param {Object} options - Options de notification
 * @param {string} options.title - Titre de la notification
 * @param {string} options.message - Message de la notification
 * @param {string} options.icon - URL de l'icône (optional)
 * @param {string} options.image - URL d'une grande image (optional)
 * @param {string} options.tag - Tag pour grouper les notifications (optional)
 * @param {number} options.timeout - Durée avant auto-fermeture en ms (optional)
 * @param {Function} options.onClick - Callback quand on clique sur la notification (optional)
 */
export const showDesktopNotification = async ({
  title = 'Gestion Ticket IT',
  message,
  icon = '/vite.svg',
  image,
  tag = 'ticket-notification',
  timeout = 5000,
  onClick = null
}) => {
  // Vérifier si les notifications sont supportées et autorisées
  const permission = await requestNotificationPermission();
  if (!permission) {
    console.warn('Permission de notification non accordée');
    return false;
  }

  try {
    // Options de la notification
    const options = {
      body: message,
      icon: icon,
      badge: icon,
      tag: tag,
      requireInteraction: timeout === 0, // Si timeout est 0, garde la notification jusqu'à interaction
      silent: false, // Utilise le son du système
    };

    // Ajouter une image si fournie
    if (image) {
      options.image = image;
    }

    // Créer la notification
    const notification = new Notification(title, options);

    // Gérer le clic sur la notification
    if (onClick) {
      notification.onclick = () => {
        window.focus(); // Focus sur la fenêtre de l'application
        onClick(notification);
        notification.close();
      };
    } else {
      notification.onclick = () => {
        window.focus(); // Focus sur la fenêtre de l'application
        notification.close();
      };
    }

    // Fermer automatiquement après le délai spécifié
    if (timeout > 0) {
      setTimeout(() => {
        notification.close();
      }, timeout);
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de l\'affichage de la notification:', error);
    return false;
  }
};

/**
 * Notifications spécifiques pour le système de tickets
 */

// Notification de nouveau ticket
export const notifyNewTicket = (creator, title) => {
  return showDesktopNotification({
    title: '🆕 Nouveau ticket',
    message: `${creator} a créé un nouveau ticket : "${title}"`,
    tag: 'new-ticket',
    timeout: 8000
  });
};

// Notification d'assignation admin
export const notifyAdminAssigned = (admin, ticketTitle) => {
  return showDesktopNotification({
    title: '👨‍💼 Ticket pris en charge',
    message: `${admin} a pris en charge votre ticket "${ticketTitle}"`,
    tag: 'admin-assigned',
    timeout: 8000
  });
};

// Notification de changement d'état
export const notifyStatusChanged = (ticketTitle, newStatus) => {
  const statusEmojis = {
    ouvert: '🔴',
    en_cours: '⚡',
    resolu: '✅'
  };
  
  return showDesktopNotification({
    title: `${statusEmojis[newStatus] || '📋'} Ticket mis à jour`,
    message: `Le ticket "${ticketTitle}" est maintenant ${newStatus}`,
    tag: 'ticket-status',
    timeout: 6000
  });
};

// Notification de nouveau commentaire
export const notifyNewComment = (author, ticketTitle, commentPreview) => {
  return showDesktopNotification({
    title: '💬 Nouveau commentaire',
    message: `${author} a commenté sur "${ticketTitle}": ${commentPreview}...`,
    tag: 'new-comment',
    timeout: 7000
  });
};
