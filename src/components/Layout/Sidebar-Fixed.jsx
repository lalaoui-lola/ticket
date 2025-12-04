import { Home, Users, Ticket, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Sidebar({ userRole, currentPage, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Home, roles: ['admin', 'utilisateur'] },
    { id: 'tickets', label: 'Tickets', icon: Ticket, roles: ['admin', 'utilisateur'] },
    { id: 'users', label: 'Utilisateurs', icon: Users, roles: ['admin'] },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole))

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary-600 text-white rounded-lg shadow-lg"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - Now with sticky positioning */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-neutral-200 overflow-y-auto transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="sticky top-0 z-10 bg-white p-6 border-b border-neutral-200">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-primary-500 to-primary-800 p-2 rounded-lg">
                <Ticket className="h-6 w-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-lg font-black text-primary-800">Ticket IT</h1>
                <p className="text-xs text-primary-600 font-medium">Gestion</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'text-primary-700 hover:bg-neutral-100'
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={2.5} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Logout button - Sticky at bottom */}
          <div className="sticky bottom-0 bg-white p-4 border-t border-neutral-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold text-accent-600 hover:bg-accent-50 transition-all duration-200"
            >
              <LogOut className="h-5 w-5" strokeWidth={2.5} />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
