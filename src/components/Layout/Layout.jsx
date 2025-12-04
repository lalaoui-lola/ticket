import Sidebar from './Sidebar-Fixed'
import Header from './Header'

export default function Layout({ user, currentPage, onNavigate, children }) {
  return (
    <div className="min-h-screen bg-neutral-100 flex">
      <Sidebar
        userRole={user.role}
        currentPage={currentPage}
        onNavigate={onNavigate}
      />
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        <Header user={user} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
