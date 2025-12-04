import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { UserPlus, Edit2, Trash2, X, Save, Shield, User as UserIcon } from 'lucide-react'

export default function Users() {
  const [users, setUsers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    email: '',
    nom: '',
    prenom: '',
    password: '',
    role: 'utilisateur'
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      setUsers(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingUser) {
        // Mise à jour
        const { error } = await supabase
          .from('profiles')
          .update({
            nom: formData.nom,
            prenom: formData.prenom,
            role: formData.role
          })
          .eq('id', editingUser.id)

        if (error) throw error
        alert('Utilisateur modifié avec succès !')
      } else {
        // Création d'un nouvel utilisateur
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              nom: formData.nom,
              prenom: formData.prenom,
              role: formData.role
            }
          }
        })

        if (authError) throw authError
        alert('Utilisateur créé avec succès !')
      }

      setShowModal(false)
      setEditingUser(null)
      setFormData({ email: '', nom: '', prenom: '', password: '', role: 'utilisateur' })
      loadUsers()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur: ' + error.message)
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      password: '',
      role: user.role
    })
    setShowModal(true)
  }

  const handleDelete = async (userId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (error) throw error
      alert('Utilisateur supprimé avec succès !')
      loadUsers()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur: ' + error.message)
    }
  }

  const openCreateModal = () => {
    setEditingUser(null)
    setFormData({ email: '', nom: '', prenom: '', password: '', role: 'utilisateur' })
    setShowModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-primary-800">Gestion des utilisateurs</h2>
          <p className="text-primary-600 font-medium mt-1">Créer et gérer les utilisateurs</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          <UserPlus className="h-5 w-5" />
          <span>Nouvel utilisateur</span>
        </button>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-6 hover:shadow-xl transition-shadow duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-xl ${user.role === 'admin' ? 'bg-primary-100' : 'bg-neutral-100'}`}>
                  {user.role === 'admin' ? (
                    <Shield className="h-6 w-6 text-primary-600" strokeWidth={2.5} />
                  ) : (
                    <UserIcon className="h-6 w-6 text-neutral-600" strokeWidth={2.5} />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-primary-800">
                    {user.prenom} {user.nom}
                  </h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 ${
                    user.role === 'admin' 
                      ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                      : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                  }`}>
                    {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-sm text-primary-600 font-medium">
                📧 {user.email}
              </p>
              <p className="text-xs text-neutral-500">
                Créé le {new Date(user.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(user)}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-semibold hover:bg-primary-200 transition-colors"
              >
                <Edit2 className="h-4 w-4" />
                <span>Modifier</span>
              </button>
              <button
                onClick={() => handleDelete(user.id)}
                className="flex items-center justify-center px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-primary-800">
                {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-neutral-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-primary-800 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  disabled={editingUser !== null}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-primary-900 font-medium disabled:opacity-50"
                  placeholder="email@exemple.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-primary-800 mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-primary-900 font-medium"
                    placeholder="Prénom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary-800 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-primary-900 font-medium"
                    placeholder="Nom"
                  />
                </div>
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-semibold text-primary-800 mb-2">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-primary-900 font-medium"
                    placeholder="••••••••"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-primary-800 mb-2">
                  Rôle
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-primary-900 font-medium"
                >
                  <option value="utilisateur">Utilisateur</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Save className="h-5 w-5" />
                <span>{editingUser ? 'Modifier' : 'Créer'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
