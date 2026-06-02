import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useHoldRouteTransition } from '../contexts/RouteTransitionContext'
import { useProfile } from '../lib/react-query/hooks'
import { isAuthenticated } from './authStorage'
import { setProfileCompleted } from './profileGateStorage'

type Props = {
  children: React.ReactNode
}

export function RequireProfileIncomplete({ children }: Props) {
  const { data: profile, isLoading, isError } = useProfile({
    enabled: isAuthenticated(),
  })

  useEffect(() => {
    if (profile) {
      setProfileCompleted(profile.profileCompleted)
    }
  }, [profile])

  useHoldRouteTransition(isLoading && !profile)

  if (!isAuthenticated()) {
    return <Navigate to="/" replace />
  }

  if (isLoading && !profile) {
    return null
  }

  if (isError) {
    return children
  }

  if (profile?.profileCompleted) {
    return <Navigate to="/loading" replace />
  }

  return children
}
