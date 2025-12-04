import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Mail, Lock, LogIn, AlertCircle, Ticket, Sparkles } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      setSuccess(true)
      console.log('Connexion réussie:', data)
    } catch (error) {
      setError(error.message)
      console.error('Erreur de connexion:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-neutral-100 px-4 sm:px-6 lg:px-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-primary-500 to-primary-800 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-300 hover:rotate-3 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-700 rounded-3xl blur opacity-50"></div>
            <Ticket className="h-10 w-10 text-white relative z-10" strokeWidth={2.5} />
          </div>
          <h1 className="mt-8 text-4xl font-black text-primary-800 tracking-tight">
            Gestion Ticket IT
          </h1>
          <div className="flex items-center justify-center mt-3 space-x-2">
            <Sparkles className="h-4 w-4 text-primary-600" />
            <p className="text-sm text-primary-700 font-medium">
              Connectez-vous à votre espace
            </p>
            <Sparkles className="h-4 w-4 text-primary-600" />
          </div>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6 border border-neutral-200">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-start space-x-3 animate-in slide-in-from-top duration-300">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800">
                    Erreur de connexion
                  </p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-primary-50 border border-primary-300 p-4 rounded-2xl animate-in slide-in-from-top duration-300">
                <p className="text-base font-bold text-primary-800 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 mr-2 text-primary-600" />
                  Connexion réussie !
                </p>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-primary-800 mb-2">
                Adresse e-mail
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-neutral-500 group-focus-within:text-primary-600 transition-colors" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all duration-200 text-primary-900 placeholder-neutral-400 font-medium"
                  placeholder="vous@exemple.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-primary-800 mb-2">
                Mot de passe
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-500 group-focus-within:text-primary-600 transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all duration-200 text-primary-900 placeholder-neutral-400 font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-primary-600 to-primary-800 hover:from-primary-700 hover:to-primary-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-2xl"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connexion en cours...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  Se connecter
                </>
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-primary-700">
              Vous n'avez pas de compte ?{' '}
              <a href="#" className="font-bold text-accent-600 hover:text-accent-700 transition-colors duration-200 underline decoration-accent-400 underline-offset-4">
                Créer un compte
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
