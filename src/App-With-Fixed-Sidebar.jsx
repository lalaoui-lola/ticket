import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Login from './components/Login'
import Layout from './components/Layout/Layout'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Tickets from './pages/Tickets'
import { requestNotificationPermission } from './utils/desktopNotifications'

function App() {
  const [session, setSession] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  useEffect(() => {
    // Demander la permission des notifications dès le chargement
    const enableNotifications = async () => {
      const enabled = await requestNotificationPermission();
      setNotificationsEnabled(enabled);
      
      if (enabled) {
        console.log('Notifications de bureau activées');
      } else {
        console.log('Notifications de bureau désactivées ou non supportées');
      }
    };
    
    enableNotifications();
    
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
    <Layout 
      user={userProfile}
      currentPage={currentPage}
      onNavigate={setCurrentPage}
    >
      {!notificationsEnabled && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg text-yellow-800">
          <p className="font-medium">
            Pour recevoir des notifications sur votre bureau (près de l'horloge), veuillez activer les notifications dans votre navigateur.
            <button 
              className="ml-4 px-3 py-1 bg-yellow-500 text-white rounded-lg text-sm font-bold"
              onClick={async () => {
                const enabled = await requestNotificationPermission();
                setNotificationsEnabled(enabled);
              }}
            >
              Activer
            </button>
          </p>
        </div>
      )}
      {renderPage()}
    </Layout>
  )
}

export default App
