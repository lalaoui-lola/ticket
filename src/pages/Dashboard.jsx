import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Ticket, Users, CheckCircle, Clock, AlertCircle } from 'lucide-react'

export default function Dashboard({ user }) {
  const [stats, setStats] = useState({
    total: 0,
    ouvert: 0,
    en_cours: 0,
    resolu: 0,
    users: 0
  })
  const [recentTickets, setRecentTickets] = useState([])

  useEffect(() => {
    loadStats()
    loadRecentTickets()
  }, [user])

  const loadStats = async () => {
    try {
      // Compter les tickets selon le rôle
      let ticketsQuery = supabase.from('tickets').select('*', { count: 'exact' })
      
      if (user.role !== 'admin') {
        ticketsQuery = ticketsQuery.eq('utilisateur_id', user.id)
      }

      const { data: tickets } = await ticketsQuery

      const statsData = {
        total: tickets?.length || 0,
        ouvert: tickets?.filter(t => t.etat === 'ouvert').length || 0,
        en_cours: tickets?.filter(t => t.etat === 'en_cours').length || 0,
        resolu: tickets?.filter(t => t.etat === 'resolu').length || 0,
        users: 0
      }

      // Compter les utilisateurs (admin seulement)
      if (user.role === 'admin') {
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
        statsData.users = count || 0
      }

      setStats(statsData)
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error)
    }
  }

  const loadRecentTickets = async () => {
    try {
      let query = supabase
        .from('tickets')
        .select(`
          *,
          utilisateur:profiles!tickets_utilisateur_id_fkey(nom, prenom),
          admin:profiles!tickets_admin_id_fkey(nom, prenom)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      if (user.role !== 'admin') {
        query = query.eq('utilisateur_id', user.id)
      }

      const { data } = await query
      setRecentTickets(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des tickets:', error)
    }
  }

  const statCards = [
    {
      title: 'Total Tickets',
      value: stats.total,
      icon: Ticket,
      color: 'primary',
      bgColor: 'bg-primary-100',
      textColor: 'text-primary-600'
    },
    {
      title: 'Ouverts',
      value: stats.ouvert,
      icon: AlertCircle,
      color: 'accent',
      bgColor: 'bg-accent-100',
      textColor: 'text-accent-600'
    },
    {
      title: 'En cours',
      value: stats.en_cours,
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Résolus',
      value: stats.resolu,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    }
  ]

  if (user.role === 'admin') {
    statCards.push({
      title: 'Utilisateurs',
      value: stats.users,
      icon: Users,
      color: 'primary',
      bgColor: 'bg-primary-100',
      textColor: 'text-primary-600'
    })
  }

  const getEtatBadge = (etat) => {
    const badges = {
      ouvert: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-200',
      en_cours: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-200',
      resolu: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-200'
    }
    const icons = {
      ouvert: '🔴',
      en_cours: '⚡',
      resolu: '✅'
    }
    const labels = {
      ouvert: 'OUVERT',
      en_cours: 'EN COURS',
      resolu: 'RÉSOLU'
    }
    return (
      <span className={`px-4 py-2 rounded-xl text-sm font-black ${badges[etat]} transform hover:scale-105 transition-transform`}>
        {icons[etat]} {labels[etat]}
      </span>
    )
  }

  const getTypeBadge = (type) => {
    const badges = {
      materiel: 'bg-blue-100 text-blue-800 border-2 border-blue-300',
      logiciel: 'bg-purple-100 text-purple-800 border-2 border-purple-300',
      connexion: 'bg-cyan-100 text-cyan-800 border-2 border-cyan-300',
      autre: 'bg-gray-100 text-gray-800 border-2 border-gray-300'
    }
    const icons = {
      materiel: '🖥️',
      logiciel: '💻',
      connexion: '🌐',
      autre: '📋'
    }
    const labels = {
      materiel: 'Matériel',
      logiciel: 'Logiciel',
      connexion: 'Connexion',
      autre: 'Autre'
    }
    return (
      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${badges[type]}`}>
        {icons[type]} {labels[type]}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6 border border-neutral-200 hover:shadow-xl transition-shadow duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-primary-700 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-black text-primary-800">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-xl`}>
                  <Icon className={`h-8 w-8 ${stat.textColor}`} strokeWidth={2.5} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Tickets */}
      <div className="bg-white rounded-2xl shadow-lg border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <h3 className="text-xl font-black text-primary-800">Tickets récents</h3>
        </div>
        <div className="divide-y divide-neutral-200">
          {recentTickets.length === 0 ? (
            <div className="p-8 text-center">
              <Ticket className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500 font-medium">Aucun ticket pour le moment</p>
            </div>
          ) : (
            recentTickets.map((ticket) => (
              <div key={ticket.id} className="p-6 hover:bg-neutral-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-primary-800 mb-2">
                      {ticket.titre}
                    </h4>
                    <p className="text-sm text-primary-600 mb-3">
                      {ticket.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {getTypeBadge(ticket.type_probleme)}
                      {getEtatBadge(ticket.etat)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-primary-600 flex-wrap gap-2">
                  <span className="font-medium bg-neutral-100 px-3 py-1 rounded-lg border border-neutral-200">
                    👤 {ticket.utilisateur?.prenom} {ticket.utilisateur?.nom}
                  </span>
                  {ticket.admin ? (
                    <span className="font-bold bg-gradient-to-r from-primary-500 to-primary-600 text-white px-3 py-1 rounded-lg shadow-md">
                      👨‍💼 {ticket.admin?.prenom} {ticket.admin?.nom}
                    </span>
                  ) : (
                    <span className="font-medium bg-red-100 text-red-700 px-3 py-1 rounded-lg border border-red-300">
                      ⚠️ Non assigné
                    </span>
                  )}
                  <span className="text-neutral-500">
                    📅 {new Date(ticket.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
