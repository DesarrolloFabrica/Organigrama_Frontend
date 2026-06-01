export type ProfileCatalogRef = {
  id: string
  name: string | null
} | null

export type ProfileEmergencyContact = {
  name: string | null
  phone: string | null
  relationship: string | null
}

export type ProfilePhoto = {
  source: string | null
  photoUrl: string | null
}

export type ProfileMe = {
  personId: string
  profileCompleted: boolean
  missingFields: string[]
  profileUpdatedByUserAt: string | null
  profileCompletedAt: string | null
  photo: ProfilePhoto
  editable: {
    document: string
    phone: string | null
    email: string | null
    address: string | null
    emergencyContact: ProfileEmergencyContact
  }
  readonly: {
    type_document: string | null
    full_name: string
    edu_email: string | null
    role: ProfileCatalogRef
    hierarchy: ProfileCatalogRef
    area: ProfileCatalogRef
    school: ProfileCatalogRef
    program: ProfileCatalogRef
  }
}

export type UpdateProfilePayload = {
  document?: string
  phone?: string
  email?: string
  address?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relationship?: string
  markCompleted?: boolean
}
