import { User } from 'lucide-react'
import NotificationBell from '../NotificationBell'

export default function Header({ user }) {
  return (
    <header className="bg-white border-b border-neutral-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-black text-primary-800">
            Bienvenue, {user?.prenom || 'Utilisateur'}
          </h2>
          <p className="text-sm text-primary-600 font-medium">
            {user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <NotificationBell user={user} />

          {/* User profile */}
          <div className="flex items-center space-x-3 px-4 py-2 bg-neutral-100 rounded-xl">
            <div className="bg-primary-600 p-2 rounded-lg">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-primary-800">
                {user?.nom} {user?.prenom}
              </p>
              <p className="text-xs text-primary-600">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
