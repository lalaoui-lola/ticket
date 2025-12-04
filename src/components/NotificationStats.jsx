import { useState, useEffect } from 'react'
import { Bell, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase'

/**
 * Composant pour afficher les statistiques des notifications
 * Utilisé dans le Dashboard des administrateurs
 */
export default function NotificationStats({ user }) {
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    today: 0,
    byType: {}
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && user.id) {
      loadNotificationStats()
    }
  }, [user])

  const loadNotificationStats = async () => {
    try {
      setLoading(true)
      
      // 1. Total des notifications pour l'utilisateur
      const { count: totalCount, error: totalError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
      
      if (totalError) throw totalError

      // 2. Notifications non lues
      const { count: unreadCount, error: unreadError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false)
      
      if (unreadError) throw unreadError

      // 3. Notifications d'aujourd'hui
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const { count: todayCount, error: todayError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .gte('created_at', today.toISOString())
      
      if (todayError) throw todayError

      // 4. Statistiques par type
      const { data: typeData, error: typeError } = await supabase
        .from('notifications')
        .select('type')
        .eq('recipient_id', user.id)
      
      if (typeError) throw typeError

      const typeStats = {}
      if (typeData) {
        typeData.forEach(notif => {
          typeStats[notif.type] = (typeStats[notif.type] || 0) + 1
        })
      }

      // Mettre à jour les stats
      setStats({
        total: totalCount || 0,
        unread: unreadCount || 0,
        today: todayCount || 0,
        byType: typeStats
      })

    } catch (error) {
      console.error('Erreur lors du chargement des statistiques de notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeLabel = (type) => {
    const labels = {
      new_ticket: 'Nouveaux tickets',
      admin_assigned: 'Assignations',
      ticket_update: 'Mises à jour',
      comment: 'Commentaires'
    }
    return labels[type] || type
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'new_ticket':
        return <Bell className="h-4 w-4" />
      case 'admin_assigned':
        return <CheckCircle className="h-4 w-4" />
      case 'ticket_update':
        return <AlertCircle className="h-4 w-4" />
      case 'comment':
        return <Clock className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getTypeColor = (type) => {
    const colors = {
      new_ticket: 'text-accent-600',
      admin_assigned: 'text-blue-600',
      ticket_update: 'text-green-600',
      comment: 'text-purple-600'
    }
    return colors[type] || 'text-primary-600'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-neutral-200">
        <h3 className="text-lg font-black text-primary-800 mb-4">Statistiques des notifications</h3>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-neutral-200">
      <h3 className="text-lg font-black text-primary-800 mb-4">Statistiques des notifications</h3>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
          <p className="text-xs text-neutral-500 mb-1">Total</p>
          <p className="text-xl font-bold text-primary-800">{stats.total}</p>
        </div>
        <div className="bg-accent-50 p-4 rounded-xl border border-accent-200">
          <p className="text-xs text-accent-600 mb-1">Non lues</p>
          <p className="text-xl font-bold text-accent-700">{stats.unread}</p>
        </div>
        <div className="bg-primary-50 p-4 rounded-xl border border-primary-200">
          <p className="text-xs text-primary-600 mb-1">Aujourd'hui</p>
          <p className="text-xl font-bold text-primary-800">{stats.today}</p>
        </div>
      </div>
      
      <h4 className="text-sm font-semibold text-primary-700 mb-3">Par type</h4>
      <div className="space-y-3">
        {Object.keys(stats.byType).length === 0 ? (
          <p className="text-sm text-neutral-500">Aucune donnée disponible</p>
        ) : (
          Object.entries(stats.byType).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={getTypeColor(type)}>
                  {getTypeIcon(type)}
                </span>
                <span className="text-sm text-primary-700">{getTypeLabel(type)}</span>
              </div>
              <span className="text-sm font-bold text-primary-800">{count}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
