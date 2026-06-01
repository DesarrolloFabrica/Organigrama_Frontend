import { getAccessToken } from '../../../auth/authStorage'
import type { ProfileMe, UpdateProfilePayload } from '../types'

const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'
).replace(/\/$/, '')

function authHeaders(): HeadersInit {
  const token = getAccessToken()
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function parseError(res: Response): Promise<string> {
  const bodyText = await res.text().catch(() => '')
  try {
    const parsed = JSON.parse(bodyText) as {
      message?: string | string[]
      missingFields?: string[]
    }
    const raw = parsed.message
    const base = Array.isArray(raw) ? raw.join('. ') : raw
    if (parsed.missingFields?.length) {
      return `${base ?? 'Error'} (${parsed.missingFields.join(', ')})`
    }
    return base || `HTTP ${res.status}`
  } catch {
    return bodyText.slice(0, 240) || `HTTP ${res.status}`
  }
}

export async function fetchProfileMe(): Promise<ProfileMe> {
  const res = await fetch(`${BASE_URL}/api/profile/me`, {
    headers: authHeaders(),
  })

  if (!res.ok) {
    throw new Error(await parseError(res))
  }

  return res.json() as Promise<ProfileMe>
}

export async function patchProfileMe(
  payload: UpdateProfilePayload,
): Promise<ProfileMe> {
  const res = await fetch(`${BASE_URL}/api/profile/me`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error(await parseError(res))
  }

  return res.json() as Promise<ProfileMe>
}

export async function postPhotoFromGoogle(): Promise<ProfileMe> {
  const res = await fetch(`${BASE_URL}/api/profile/me/photo-from-google`, {
    method: 'POST',
    headers: authHeaders(),
  })

  if (!res.ok) {
    throw new Error(await parseError(res))
  }

  return res.json() as Promise<ProfileMe>
}
