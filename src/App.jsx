import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Login from './components/Login'
import Sidebar from './components/Layout/Sidebar'
import Header from './components/Layout/Header'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Tickets from './pages/Tickets'

function App() {
  const [session, setSession] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        loadUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        loadUserProfile(session.user.id)
      } else {
        setUserProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId) => {
    try {
      // Essayer de récupérer le profil
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      // Si le profil n'existe pas, le créer
      if (error && error.code === 'PGRST116') {
        console.log('Profil non trouvé, création en cours...')
        
        // Récupérer les infos de l'utilisateur
        const { data: { user } } = await supabase.auth.getUser()
        
        // Créer le profil
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              id: userId,
              email: user.email,
              nom: user.user_metadata?.nom || '',
              prenom: user.user_metadata?.prenom || '',
              role: user.user_metadata?.role || 'utilisateur'
            }
          ])
          .select()
          .single()

        if (insertError) {
          console.error('Erreur lors de la création du profil:', insertError)
          throw insertError
        }
        
        data = newProfile
      } else if (error) {
        throw error
      }

      setUserProfile(data)
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error)
      alert('Erreur: Impossible de charger votre profil. Veuillez contacter l\'administrateur.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-primary-700 font-bold">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!session || !userProfile) {
    return <Login />
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard user={userProfile} />
      case 'tickets':
        return <Tickets user={userProfile} />
      case 'users':
        return userProfile.role === 'admin' ? <Users /> : <Dashboard user={userProfile} />
      default:
        return <Dashboard user={userProfile} />
    }
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex">
      <Sidebar
        userRole={userProfile.role}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        <Header user={userProfile} />
        <main className="flex-1 p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}

export default App
