import { useState, useEffect } from 'react'
import { Bell, X, Ticket, CheckCircle, UserCheck, MessageCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { playNotificationSound } from '../utils/sound'

export default function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([])
  const [showPanel, setShowPanel] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user && user.id) {
      loadNotificationsFromSupabase()
      
      // S'abonner aux nouvelles notifications en temps réel
      const channel = supabase
        .channel('notifications-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_id=eq.${user.id}`
          },
          (payload) => {
            handleNewNotification(payload.new)
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [user])

  const loadNotificationsFromSupabase = async () => {
    try {
      setLoading(true)
      
      // Récupérer les notifications de l'utilisateur depuis Supabase
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          sender:sender_id(prenom, nom, role)
        `)
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30)
      
      if (error) throw error
      
      if (data) {
        setNotifications(data)
        setUnreadCount(data.filter(n => !n.is_read).length)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error)
      // Fallback au localStorage si Supabase échoue
      loadNotificationsFromLocalStorage()
    } finally {
      setLoading(false)
    }
  }

  const loadNotificationsFromLocalStorage = () => {
    // Charger les notifications depuis le localStorage comme fallback
    const stored = localStorage.getItem(`notifications_${user.id}`)
    if (stored) {
      const notifs = JSON.parse(stored)
      setNotifications(notifs)
      setUnreadCount(notifs.filter(n => !n.is_read || !n.read).length)
    }
  }

  const handleNewNotification = (notification) => {
    // Transformer la notification Supabase en notification lisible
    const content = notification.content || {}
    
    // Créer un objet notification formaté
    const formattedNotification = {
      ...notification,
      read: notification.is_read,
      message: getNotificationMessage(notification.type, content),
    }
    
    // Ajouter à l'état local
    setNotifications(prev => [formattedNotification, ...prev].slice(0, 30))
    setUnreadCount(prev => prev + 1)
    
    // Jouer le son de notification
    playNotificationSound()
    
    // Afficher une notification navigateur
    if (Notification.permission === 'granted') {
      new Notification('🎫 Gestion Ticket IT', {
        body: formattedNotification.message,
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: 'ticket-notification',
        requireInteraction: false
      })
    }
  }

  const getNotificationMessage = (type, content) => {
    switch (type) {
      case 'new_ticket':
        return `🆕 Nouveau ticket de ${content.creator_name || 'Utilisateur'}: ${content.ticket_title || 'Sans titre'}`
      case 'admin_assigned':
        return `👨‍💼 ${content.admin_name || 'Un administrateur'} a pris en charge le ticket "${content.ticket_title || 'Sans titre'}"`
      case 'ticket_update':
        return `📋 Le ticket "${content.ticket_title || 'Sans titre'}" est maintenant: ${getEtatLabel(content.new_state)}`
      case 'comment':
        return `💬 ${content.author_name || 'Quelqu\'un'} a commenté sur "${content.ticket_title}": ${content.comment_preview || ''}...`
      default:
        return content.message || 'Nouvelle notification'
    }
  }

  const markAsRead = async (notifId) => {
    try {
      // Marquer comme lu dans Supabase
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notifId)
      
      if (error) throw error
      
      // Mise à jour locale
      const updated = notifications.map(n => 
        n.id === notifId ? { ...n, is_read: true, read: true } : n
      )
      setNotifications(updated)
      setUnreadCount(updated.filter(n => !n.is_read && !n.read).length)
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      // Marquer toutes comme lues dans Supabase
      const unreadIds = notifications
        .filter(n => !n.is_read || !n.read)
        .map(n => n.id)
      
      if (unreadIds.length === 0) return
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', unreadIds)
      
      if (error) throw error
      
      // Mise à jour locale
      const updated = notifications.map(n => ({ ...n, is_read: true, read: true }))
      setNotifications(updated)
      setUnreadCount(0)
    } catch (error) {
      console.error('Erreur lors du marquage de toutes comme lues:', error)
    }
  }

  const clearAll = async () => {
    try {
      // Supprimer de Supabase
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('recipient_id', user.id)
      
      if (error) throw error
      
      // Mise à jour locale
      setNotifications([])
      setUnreadCount(0)
    } catch (error) {
      console.error('Erreur lors de la suppression des notifications:', error)
    }
  }

  const getEtatLabel = (etat) => {
    const labels = {
      ouvert: 'Ouvert',
      en_cours: 'En cours',
      resolu: 'Résolu'
    }
    return labels[etat] || etat
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_ticket':
        return <Ticket className="h-5 w-5 text-accent-600" />
      case 'admin_assigned':
        return <UserCheck className="h-5 w-5 text-blue-600" />
      case 'comment':
        return <MessageCircle className="h-5 w-5 text-purple-600" />
      case 'ticket_update':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      default:
        return <Bell className="h-5 w-5 text-primary-600" />
    }
  }

  const getNotificationBackground = (type) => {
    switch (type) {
      case 'new_ticket':
        return 'bg-accent-100'
      case 'admin_assigned':
        return 'bg-blue-100'
      case 'comment':
        return 'bg-purple-100'
      case 'ticket_update':
        return 'bg-green-100'
      default:
        return 'bg-neutral-100'
    }
  }

  // Demander la permission pour les notifications
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 text-primary-600 hover:bg-neutral-100 rounded-lg transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-5 w-5 bg-accent-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {showPanel && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPanel(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-neutral-200 z-50 max-h-[500px] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-primary-50">
              <div>
                <h3 className="text-lg font-black text-primary-800">Notifications</h3>
                <p className="text-xs text-primary-600">{unreadCount} non lue(s)</p>
              </div>
              <div className="flex space-x-2">
                {notifications.length > 0 && (
                  <>
                    <button
                      onClick={markAllAsRead}
                      className="text-xs px-3 py-1 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                    >
                      Tout lire
                    </button>
                    <button
                      onClick={clearAll}
                      className="text-xs px-3 py-1 bg-neutral-200 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-300 transition-colors"
                    >
                      Effacer
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-primary-600 mx-auto mb-3"></div>
                  <p className="text-neutral-500">Chargement...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                  <p className="text-neutral-500 font-medium">Aucune notification</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`p-4 border-b border-neutral-200 hover:bg-neutral-50 cursor-pointer transition-colors ${
                      !notif.is_read && !notif.read ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${getNotificationBackground(notif.type)}`}>
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${(!notif.is_read && !notif.read) ? 'font-bold text-primary-800' : 'text-primary-700'}`}>
                          {notif.message || getNotificationMessage(notif.type, notif.content)}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          {new Date(notif.created_at).toLocaleString('fr-FR')}
                        </p>
                      </div>
                      {(!notif.is_read && !notif.read) && (
                        <div className="h-2 w-2 bg-accent-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}