import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { X, Send, Edit2, Save } from 'lucide-react'

export default function TicketDetails({ ticket, user, onClose, onUpdate }) {
  const [commentaires, setCommentaires] = useState([])
  const [newComment, setNewComment] = useState('')
  const [etat, setEtat] = useState(ticket.etat)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    loadCommentaires()
  }, [ticket.id])

  const loadCommentaires = async () => {
    try {
      const { data } = await supabase
        .from('commentaires')
        .select(`
          *,
          auteur:profiles(nom, prenom, role)
        `)
        .eq('ticket_id', ticket.id)
        .order('created_at', { ascending: true })

      setCommentaires(data || [])
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      const { error } = await supabase
        .from('commentaires')
        .insert([
          {
            ticket_id: ticket.id,
            auteur_id: user.id,
            contenu: newComment
          }
        ])

      if (error) throw error

      setNewComment('')
      loadCommentaires()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de l\'ajout du commentaire')
    }
  }

  const handleUpdateEtat = async () => {
    try {
      const updateData = { etat }
      
      // Si l'admin prend en charge le ticket pour la première fois
      if (user.role === 'admin' && !ticket.admin_id && etat === 'en_cours') {
        updateData.admin_id = user.id
      }

      const { error } = await supabase
        .from('tickets')
        .update(updateData)
        .eq('id', ticket.id)

      if (error) throw error

      alert('Ticket mis à jour avec succès !')
      setIsEditing(false)
      onUpdate()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la mise à jour')
    }
  }

  const getEtatBadge = (etat) => {
    const badges = {
      ouvert: 'bg-accent-100 text-accent-700 border-accent-200',
      en_cours: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      resolu: 'bg-green-100 text-green-700 border-green-200'
    }
    const labels = {
      ouvert: 'Ouvert',
      en_cours: 'En cours',
      resolu: 'Résolu'
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badges[etat]}`}>
        {labels[etat]}
      </span>
    )
  }

  const getTypeBadge = (type) => {
    const labels = {
      materiel: 'Matériel',
      logiciel: 'Logiciel',
      connexion: 'Connexion',
      autre: 'Autre'
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-primary-700 border border-neutral-200">
        {labels[type]}
      </span>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-2xl font-black text-primary-800 mb-2">
                {ticket.titre}
              </h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {getTypeBadge(ticket.type_probleme)}
                {getEtatBadge(ticket.etat)}
              </div>
              <p className="text-sm text-primary-600">
                {ticket.description}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-neutral-600" />
            </button>
          </div>

          {/* Ticket Info */}
          <div className="mt-4 pt-4 border-t border-neutral-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-neutral-500 font-medium mb-1">Créé par</p>
              <p className="text-primary-800 font-bold">
                {ticket.utilisateur?.prenom} {ticket.utilisateur?.nom}
              </p>
            </div>
            {ticket.admin && (
              <div>
                <p className="text-neutral-500 font-medium mb-1">Pris en charge par</p>
                <p className="text-primary-800 font-bold">
                  {ticket.admin?.prenom} {ticket.admin?.nom}
                </p>
              </div>
            )}
            <div>
              <p className="text-neutral-500 font-medium mb-1">Date de création</p>
              <p className="text-primary-800 font-bold">
                {new Date(ticket.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

          {/* Admin Controls */}
          {user.role === 'admin' && (
            <div className="mt-4 pt-4 border-t border-neutral-200">
              {isEditing ? (
                <div className="flex items-center space-x-3">
                  <select
                    value={etat}
                    onChange={(e) => setEtat(e.target.value)}
                    className="flex-1 px-4 py-2 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-primary-900 font-medium"
                  >
                    <option value="ouvert">Ouvert</option>
                    <option value="en_cours">En cours</option>
                    <option value="resolu">Résolu</option>
                  </select>
                  <button
                    onClick={handleUpdateEtat}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>Enregistrer</span>
                  </button>
                  <button
                    onClick={() => {
                      setEtat(ticket.etat)
                      setIsEditing(false)
                    }}
                    className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl font-bold hover:bg-neutral-200 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-xl font-bold hover:bg-primary-200 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Modifier l'état du ticket</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <h4 className="text-lg font-black text-primary-800 mb-4">
            Commentaires ({commentaires.length})
          </h4>

          {commentaires.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutral-500 font-medium">Aucun commentaire pour le moment</p>
            </div>
          ) : (
            commentaires.map((comment) => (
              <div
                key={comment.id}
                className={`p-4 rounded-2xl ${
                  comment.auteur.role === 'admin'
                    ? 'bg-primary-50 border border-primary-200'
                    : 'bg-neutral-50 border border-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-primary-800">
                      {comment.auteur.prenom} {comment.auteur.nom}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      comment.auteur.role === 'admin'
                        ? 'bg-primary-600 text-white'
                        : 'bg-neutral-200 text-neutral-700'
                    }`}>
                      {comment.auteur.role === 'admin' ? 'Admin' : 'Utilisateur'}
                    </span>
                  </div>
                  <span className="text-xs text-neutral-500">
                    {new Date(comment.created_at).toLocaleString('fr-FR')}
                  </span>
                </div>
                <p className="text-primary-700">{comment.contenu}</p>
              </div>
            ))
          )}
        </div>

        {/* Add Comment Form */}
        <div className="p-6 border-t border-neutral-200">
          <form onSubmit={handleAddComment} className="flex space-x-3">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Ajouter un commentaire..."
              className="flex-1 px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-primary-900 font-medium"
            />
            <button
              type="submit"
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Send className="h-5 w-5" />
              <span>Envoyer</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
