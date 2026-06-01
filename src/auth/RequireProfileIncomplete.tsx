import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { fetchProfileMe } from '../features/profile/services/profileService'
import { isAuthenticated } from './authStorage'
import { setProfileCompleted } from './profileGateStorage'

type Props = {
  children: React.ReactNode
}

export function RequireProfileIncomplete({ children }: Props) {
  const [status, setStatus] = useState<
    'loading' | 'incomplete' | 'complete'
  >('loading')

  useEffect(() => {
    if (!isAuthenticated()) {
      return
    }

    let cancelled = false

    fetchProfileMe()
      .then((profile) => {
        if (cancelled) return
        setProfileCompleted(profile.profileCompleted)
        setStatus(profile.profileCompleted ? 'complete' : 'incomplete')
      })
      .catch(() => {
        if (cancelled) return
        setStatus('incomplete')
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (!isAuthenticated()) {
    return <Navigate to="/" replace />
  }

  if (status === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] text-sm text-cyan-200/90">
        Cargando perfil…
      </main>
    )
  }

  if (status === 'complete') {
    return <Navigate to="/loading" replace />
  }

  return children
}
