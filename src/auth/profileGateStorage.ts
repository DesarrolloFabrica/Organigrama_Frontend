const KEY = 'organigrama.profileCompleted'

export function setProfileCompleted(value: boolean): void {
  sessionStorage.setItem(KEY, value ? '1' : '0')
}

export function getProfileCompletedCached(): boolean | null {
  const raw = sessionStorage.getItem(KEY)
  if (raw === '1') return true
  if (raw === '0') return false
  return null
}

export function clearProfileCompletedCache(): void {
  sessionStorage.removeItem(KEY)
}
