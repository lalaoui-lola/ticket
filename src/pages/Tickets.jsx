import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, MessageSquare, Edit2, Filter, Search } from 'lucide-react'
import TicketModal from '../components/TicketModal'
import TicketDetails from '../components/TicketDetails'

export default function Tickets({ user }) {
  const [tickets, setTickets] = useState([])
  const [filteredTickets, setFilteredTickets] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [filterEtat, setFilterEtat] = useState('tous')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadTickets()
  }, [user])

  useEffect(() => {
    filterTickets()
  }, [tickets, filterEtat, searchTerm])

  const loadTickets = async () => {
    try {
      let query = supabase
        .from('tickets')
        .select(`
          *,
          utilisateur:profiles!tickets_utilisateur_id_fkey(nom, prenom, email),
          admin:profiles!tickets_admin_id_fkey(nom, prenom, email)
        `)
        .order('created_at', { ascending: false })

      if (user.role !== 'admin') {
        query = query.eq('utilisateur_id', user.id)
      }

      const { data } = await query
      setTickets(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des tickets:', error)
    }
  }

  const filterTickets = () => {
    let filtered = tickets

    if (filterEtat !== 'tous') {
      filtered = filtered.filter(t => t.etat === filterEtat)
    }

    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredTickets(filtered)
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

  const handleQuickStateChange = async (ticketId, newState) => {
    try {
      const updateData = { etat: newState }
      
      // Si admin et passage en "en_cours", s'assigner automatiquement
      if (user.role === 'admin' && newState === 'en_cours') {
        updateData.admin_id = user.id
      }

      const { error } = await supabase
        .from('tickets')
        .update(updateData)
        .eq('id', ticketId)

      if (error) throw error
      
      loadTickets() // Recharger les tickets
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors du changement d\'état')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-primary-800">Mes Tickets</h2>
          <p className="text-primary-600 font-medium mt-1">
            {filteredTickets.length} ticket(s) trouvé(s)
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="h-5 w-5" />
          <span>Nouveau ticket</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Rechercher un ticket..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-primary-900 font-medium"
            />
          </div>

          {/* Filter by state */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <select
              value={filterEtat}
              onChange={(e) => setFilterEtat(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-primary-900 font-medium appearance-none"
            >
              <option value="tous">Tous les états</option>
              <option value="ouvert">Ouvert</option>
              <option value="en_cours">En cours</option>
              <option value="resolu">Résolu</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTickets.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-12 text-center">
            <MessageSquare className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500 font-medium text-lg">Aucun ticket trouvé</p>
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-2xl shadow-lg border-2 border-neutral-200 p-6 hover:shadow-2xl hover:border-primary-300 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {getEtatBadge(ticket.etat)}
                    {getTypeBadge(ticket.type_probleme)}
                  </div>
                  <h3 
                    className="text-xl font-bold text-primary-800 mb-2 cursor-pointer hover:text-primary-600 transition-colors"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    {ticket.titre}
                  </h3>
                  <p className="text-sm text-primary-600 mb-3 line-clamp-2">
                    {ticket.description}
                  </p>
                </div>
              </div>

              {/* Boutons de changement d'état rapide (Admin uniquement) */}
              {user.role === 'admin' && (
                <div className="mb-4 pb-4 border-b border-neutral-200">
                  <p className="text-xs font-semibold text-primary-700 mb-2">Changer l'état :</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleQuickStateChange(ticket.id, 'ouvert')}
                      disabled={ticket.etat === 'ouvert'}
                      className={`flex-1 px-3 py-2 rounded-lg font-bold text-xs transition-all ${
                        ticket.etat === 'ouvert'
                          ? 'bg-red-500 text-white cursor-not-allowed'
                          : 'bg-red-100 text-red-700 hover:bg-red-200 border-2 border-red-300'
                      }`}
                    >
                      🔴 Ouvert
                    </button>
                    <button
                      onClick={() => handleQuickStateChange(ticket.id, 'en_cours')}
                      disabled={ticket.etat === 'en_cours'}
                      className={`flex-1 px-3 py-2 rounded-lg font-bold text-xs transition-all ${
                        ticket.etat === 'en_cours'
                          ? 'bg-yellow-500 text-white cursor-not-allowed'
                          : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-2 border-yellow-300'
                      }`}
                    >
                      ⚡ En cours
                    </button>
                    <button
                      onClick={() => handleQuickStateChange(ticket.id, 'resolu')}
                      disabled={ticket.etat === 'resolu'}
                      className={`flex-1 px-3 py-2 rounded-lg font-bold text-xs transition-all ${
                        ticket.etat === 'resolu'
                          ? 'bg-green-500 text-white cursor-not-allowed'
                          : 'bg-green-100 text-green-700 hover:bg-green-200 border-2 border-green-300'
                      }`}
                    >
                      ✅ Résolu
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-primary-600">
                <div className="flex items-center space-x-4">
                  <span className="font-medium bg-neutral-100 px-3 py-1 rounded-lg border border-neutral-200">
                    👤 Créé par: {ticket.utilisateur?.prenom} {ticket.utilisateur?.nom}
                  </span>
                  {ticket.admin ? (
                    <span className="font-bold bg-gradient-to-r from-primary-500 to-primary-600 text-white px-3 py-1 rounded-lg shadow-md animate-pulse">
                      👨‍💼 Pris en charge par: {ticket.admin?.prenom} {ticket.admin?.nom}
                    </span>
                  ) : (
                    <span className="font-medium bg-red-100 text-red-700 px-3 py-1 rounded-lg border border-red-300">
                      ⚠️ Non assigné
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-neutral-500">
                    📅 {new Date(ticket.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                  <button
                    onClick={() => setSelectedTicket(ticket)}
                    className="px-3 py-1 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center gap-1"
                  >
                    <Edit2 className="h-3 w-3" />
                    Détails
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Ticket Modal */}
      {showModal && (
        <TicketModal
          user={user}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            loadTickets()
          }}
        />
      )}

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <TicketDetails
          ticket={selectedTicket}
          user={user}
          onClose={() => setSelectedTicket(null)}
          onUpdate={() => {
            setSelectedTicket(null)
            loadTickets()
          }}
        />
      )}
    </div>
  )
}
