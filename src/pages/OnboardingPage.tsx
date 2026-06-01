import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthSession, getAuthUser } from "../auth/authStorage";
import { withPhotoAccessToken } from "../auth/photoUrl";
import { setProfileCompleted } from "../auth/profileGateStorage";
import { clearOrgChartRootCache } from "../features/org-chart/services/orgChartRootCache";
import {
  ProfileEntityShell,
  ProfileField,
  ProfileHudSection,
  ProfileReadonlyRow,
  profileInputClassName,
} from "../features/profile/components/ProfileHud";
import {
  fetchProfileMe,
  patchProfileMe,
  postPhotoFromGoogle,
} from "../features/profile/services/profileService";
import type { ProfileMe } from "../features/profile/types";

function formatCatalog(ref: { name: string | null } | null): string {
  return ref?.name?.trim() || "—";
}

const DOCUMENT_PATTERN = /^\d{6,}$/;

export function OnboardingPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileMe | null>(null);
  const [document, setDocument] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyRelationship, setEmergencyRelationship] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [photoSaving, setPhotoSaving] = useState(false);
  const [photoMessage, setPhotoMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchProfileMe()
      .then((data) => {
        if (cancelled) return;
        setProfile(data);
        setDocument(data.editable.document ?? "");
        setPhone(data.editable.phone ?? "");
        setEmail(data.editable.email ?? "");
        setAddress(data.editable.address ?? "");
        setEmergencyName(data.editable.emergencyContact.name ?? "");
        setEmergencyPhone(data.editable.emergencyContact.phone ?? "");
        setEmergencyRelationship(
          data.editable.emergencyContact.relationship ?? "",
        );
        if (data.profileCompleted) {
          navigate("/loading", { replace: true });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se pudo cargar el perfil");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/");
  };

  const handleUseGooglePhoto = async () => {
    setPhotoSaving(true);
    setPhotoMessage(null);
    setError(null);

    try {
      const updated = await postPhotoFromGoogle();
      setProfile(updated);
      clearOrgChartRootCache();
      setPhotoMessage(
        "Foto guardada. Será visible en el organigrama para usuarios autenticados.",
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo guardar la foto de Google",
      );
    } finally {
      setPhotoSaving(false);
    }
  };

  const validateForm = (): boolean => {
    const next: Record<string, string> = {};

    if (!DOCUMENT_PATTERN.test(document.trim())) {
      next.document =
        "Ingresa solo números, mínimo 6 dígitos (documento / cédula)";
    }

    if (!phone.trim()) {
      next.phone = "El teléfono es obligatorio";
    }

    if (!emergencyName.trim()) {
      next.emergencyName = "El nombre del contacto de emergencia es obligatorio";
    }

    if (!emergencyPhone.trim()) {
      next.emergencyPhone =
        "El teléfono del contacto de emergencia es obligatorio";
    }

    if (!emergencyRelationship.trim()) {
      next.emergencyRelationship = "El parentesco es obligatorio";
    }

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const updated = await patchProfileMe({
        document: document.trim(),
        phone,
        email,
        address,
        emergency_contact_name: emergencyName,
        emergency_contact_phone: emergencyPhone,
        emergency_contact_relationship: emergencyRelationship,
        markCompleted: true,
      });
      setProfile(updated);
      setProfileCompleted(true);
      navigate("/loading");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] text-sm text-cyan-200/90">
        Cargando datos de perfil…
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#020617] px-6 text-center">
        <p className="text-sm text-rose-300">{error ?? "Perfil no disponible"}</p>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-slate-500/40 px-4 py-2 text-sm text-slate-200"
        >
          Cerrar sesión
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-y-auto bg-[#020617] pb-12">
      <ProfileEntityShell
        title="Completa tu perfil"
        subtitle="Actualiza tus datos de contacto y contacto de emergencia para continuar al organigrama. Los campos organizacionales son de solo lectura."
      >
        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
          <ProfileHudSection id="ob-contact" title="Datos de contacto" icon="contact">
            <ProfileReadonlyRow
              label="Correo educativo"
              value={profile.readonly.edu_email}
            />
            <ProfileField
              label="Documento / cédula"
              id="document"
              required
              error={fieldErrors.document}
            >
              <input
                id="document"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className={profileInputClassName}
                value={document}
                onChange={(e) =>
                  setDocument(e.target.value.replace(/\D/g, ""))
                }
                autoComplete="off"
              />
            </ProfileField>
            <ProfileField label="Teléfono" id="phone" required error={fieldErrors.phone}>
              <input
                id="phone"
                type="tel"
                className={profileInputClassName}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
            </ProfileField>
            <ProfileField label="Correo alterno" id="email">
              <input
                id="email"
                type="email"
                className={profileInputClassName}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </ProfileField>
            <ProfileField label="Dirección" id="address">
              <input
                id="address"
                type="text"
                className={profileInputClassName}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                autoComplete="street-address"
              />
            </ProfileField>
          </ProfileHudSection>

          <ProfileHudSection
            id="ob-emergency"
            title="Contacto de emergencia"
            icon="contact"
          >
            <ProfileField
              label="Nombre"
              id="emergencyName"
              required
              error={fieldErrors.emergencyName}
            >
              <input
                id="emergencyName"
                type="text"
                className={profileInputClassName}
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                autoComplete="name"
              />
            </ProfileField>
            <ProfileField
              label="Teléfono"
              id="emergencyPhone"
              required
              error={fieldErrors.emergencyPhone}
            >
              <input
                id="emergencyPhone"
                type="tel"
                className={profileInputClassName}
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                autoComplete="tel"
              />
            </ProfileField>
            <ProfileField
              label="Parentesco"
              id="emergencyRelationship"
              required
              error={fieldErrors.emergencyRelationship}
            >
              <input
                id="emergencyRelationship"
                type="text"
                className={profileInputClassName}
                value={emergencyRelationship}
                onChange={(e) => setEmergencyRelationship(e.target.value)}
              />
            </ProfileField>
          </ProfileHudSection>

          <ProfileHudSection id="ob-photo" title="Foto de perfil" icon="contact">
            <p className="text-sm leading-relaxed text-slate-600">
              Opcional. Puedes usar la foto de tu cuenta Google para mostrarla en
              el organigrama. No es necesaria para continuar.
            </p>
            {(() => {
              const previewUrl = withPhotoAccessToken(
                profile.photo.photoUrl ?? getAuthUser()?.pictureUrl ?? null,
              );
              if (!previewUrl) {
                return (
                  <p className="text-sm text-slate-500">
                    Inicia sesión con Google para ver una vista previa.
                  </p>
                );
              }
              return (
                <div className="flex items-center gap-4">
                  <img
                    src={previewUrl}
                    alt=""
                    className="size-16 rounded-full border border-cyan-500/25 object-cover shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                  <p className="text-xs text-slate-500">
                    {profile.photo.photoUrl
                      ? "Foto guardada en el organigrama."
                      : "Vista previa de la sesión actual."}
                  </p>
                </div>
              );
            })()}
            <button
              type="button"
              disabled={photoSaving || Boolean(profile.photo.photoUrl)}
              onClick={() => void handleUseGooglePhoto()}
              className="rounded-xl border border-cyan-600/40 bg-cyan-50/80 px-4 py-2.5 text-sm font-semibold text-cyan-900 transition hover:bg-cyan-100/90 disabled:cursor-not-allowed disabled:opacity-55"
            >
              {photoSaving
                ? "Guardando foto…"
                : profile.photo.photoUrl
                  ? "Foto de Google guardada"
                  : "Usar foto de Google"}
            </button>
            {photoMessage ? (
              <p className="text-sm text-cyan-800/90">{photoMessage}</p>
            ) : null}
          </ProfileHudSection>

          <ProfileHudSection id="ob-org" title="Organización" icon="org">
            <ProfileReadonlyRow
              label="Nombre"
              value={profile.readonly.full_name}
            />
            <ProfileReadonlyRow
              label="Jerarquía"
              value={formatCatalog(profile.readonly.hierarchy)}
            />
            <ProfileReadonlyRow
              label="Área"
              value={formatCatalog(profile.readonly.area)}
            />
            <ProfileReadonlyRow
              label="Escuela"
              value={formatCatalog(profile.readonly.school)}
            />
            <ProfileReadonlyRow
              label="Programa"
              value={formatCatalog(profile.readonly.program)}
            />
          </ProfileHudSection>

          {error ? (
            <p className="rounded-lg border border-rose-200/80 bg-rose-50/90 px-4 py-3 text-sm text-rose-800">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-slate-300/80 bg-white/90 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cerrar sesión
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white shadow-[0_8px_24px_-8px_rgba(8,145,178,0.55)] transition hover:bg-cyan-500 disabled:opacity-60"
            >
              {saving ? "Guardando…" : "Guardar y continuar"}
            </button>
          </div>
        </form>
      </ProfileEntityShell>
    </main>
  );
}
