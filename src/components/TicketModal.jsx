import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { X, Save } from 'lucide-react'

export default function TicketModal({ user, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    type_probleme: 'logiciel'
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const { error } = await supabase
        .from('tickets')
        .insert([
          {
            ...formData,
            utilisateur_id: user.id,
            etat: 'ouvert'
          }
        ])

      if (error) throw error

      alert('Ticket créé avec succès !')
      onSuccess()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la création du ticket: ' + error.message)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black text-primary-800">
            Créer un nouveau ticket
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-neutral-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-primary-800 mb-2">
              Titre du problème
            </label>
            <input
              type="text"
              required
              value={formData.titre}
              onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-primary-900 font-medium"
              placeholder="Ex: Problème d'imprimante"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-primary-800 mb-2">
              Type de problème
            </label>
            <select
              value={formData.type_probleme}
              onChange={(e) => setFormData({ ...formData, type_probleme: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-primary-900 font-medium"
            >
              <option value="materiel">Matériel</option>
              <option value="logiciel">Logiciel</option>
              <option value="connexion">Connexion</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-primary-800 mb-2">
              Description détaillée
            </label>
            <textarea
              required
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-primary-900 font-medium resize-none"
              placeholder="Décrivez votre problème en détail..."
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-neutral-100 text-neutral-700 rounded-xl font-bold hover:bg-neutral-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Save className="h-5 w-5" />
              <span>Créer le ticket</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
