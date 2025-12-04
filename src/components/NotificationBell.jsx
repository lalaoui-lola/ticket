import { useState, useEffect } from 'react'
import { Bell, X, Ticket, CheckCircle, UserCheck } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { playNotificationSound } from '../utils/sound'

export default function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([])
  const [showPanel, setShowPanel] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadNotifications()
    
    // S'abonner aux nouveaux tickets en temps réel
    const channel = supabase
      .channel('tickets-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tickets'
        },
        async (payload) => {
          // Si c'est un admin, notifier pour tous les nouveaux tickets
          if (user.role === 'admin') {
            // Récupérer les infos de l'utilisateur qui a créé le ticket
            const { data: userData } = await supabase
              .from('profiles')
              .select('nom, prenom')
              .eq('id', payload.new.utilisateur_id)
              .single()

            addNotification({
              id: payload.new.id,
              type: 'new_ticket',
              message: `🆕 Nouveau ticket de ${userData?.prenom} ${userData?.nom} : ${payload.new.titre}`,
              ticket_id: payload.new.id,
              created_at: new Date().toISOString()
            })
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tickets',
          filter: `utilisateur_id=eq.${user.id}`
        },
        async (payload) => {
          // Notifier l'utilisateur quand son ticket change d'état ou est pris en charge
          if (user.role !== 'admin') {
            let message = ''
            let type = 'ticket_update'
            
            // Si un admin vient d'être assigné
            if (payload.new.admin_id && !payload.old.admin_id) {
              const { data: adminData } = await supabase
                .from('profiles')
                .select('nom, prenom')
                .eq('id', payload.new.admin_id)
                .single()
              
              message = `👨‍💼 ${adminData?.prenom} ${adminData?.nom} a pris en charge votre ticket "${payload.new.titre}"`
              type = 'admin_assigned'
            } 
            // Si l'état a changé
            else if (payload.new.etat !== payload.old.etat) {
              message = `📋 Votre ticket "${payload.new.titre}" est maintenant : ${getEtatLabel(payload.new.etat)}`
            }
            
            if (message) {
              addNotification({
                id: payload.new.id + Date.now(),
                type: type,
                message: message,
                ticket_id: payload.new.id,
                created_at: new Date().toISOString()
              })
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const loadNotifications = () => {
    // Charger les notifications depuis le localStorage
    const stored = localStorage.getItem(`notifications_${user.id}`)
    if (stored) {
      const notifs = JSON.parse(stored)
      setNotifications(notifs)
      setUnreadCount(notifs.filter(n => !n.read).length)
    }
  }

  const addNotification = (notification) => {
    const newNotif = { ...notification, read: false }
    const updated = [newNotif, ...notifications].slice(0, 20) // Garder max 20 notifications
    setNotifications(updated)
    setUnreadCount(updated.filter(n => !n.read).length)
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated))
    
    // Jouer le son de notification
    playNotificationSound()
    
    // Afficher une notification navigateur
    if (Notification.permission === 'granted') {
      new Notification('🎫 Gestion Ticket IT', {
        body: notification.message,
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: 'ticket-notification',
        requireInteraction: false
      })
    }
  }

  const markAsRead = (notifId) => {
    const updated = notifications.map(n => 
      n.id === notifId ? { ...n, read: true } : n
    )
    setNotifications(updated)
    setUnreadCount(updated.filter(n => !n.read).length)
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated))
  }

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }))
    setNotifications(updated)
    setUnreadCount(0)
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated))
  }

  const clearAll = () => {
    setNotifications([])
    setUnreadCount(0)
    localStorage.removeItem(`notifications_${user.id}`)
  }

  const getEtatLabel = (etat) => {
    const labels = {
      ouvert: 'Ouvert',
      en_cours: 'En cours',
      resolu: 'Résolu'
    }
    return labels[etat] || etat
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
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                  <p className="text-neutral-500 font-medium">Aucune notification</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id + notif.created_at}
                    onClick={() => markAsRead(notif.id)}
                    className={`p-4 border-b border-neutral-200 hover:bg-neutral-50 cursor-pointer transition-colors ${
                      !notif.read ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        notif.type === 'new_ticket' 
                          ? 'bg-accent-100' 
                          : notif.type === 'admin_assigned'
                          ? 'bg-blue-100'
                          : 'bg-green-100'
                      }`}>
                        {notif.type === 'new_ticket' ? (
                          <Ticket className="h-5 w-5 text-accent-600" />
                        ) : notif.type === 'admin_assigned' ? (
                          <UserCheck className="h-5 w-5 text-blue-600" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${!notif.read ? 'font-bold text-primary-800' : 'text-primary-700'}`}>
                          {notif.message}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          {new Date(notif.created_at).toLocaleString('fr-FR')}
                        </p>
                      </div>
                      {!notif.read && (
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
