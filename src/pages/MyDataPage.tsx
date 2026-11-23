import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useHoldRouteTransition } from "../contexts/RouteTransitionContext";
import { getAuthUser } from "../auth/authStorage";
import {
  OnboardingField,
  OnboardingFormCard,
  OnboardingProfileIntro,
  OnboardingRequiredNote,
  OnboardingVerifiedEmail,
  onboardingInputClassName,
} from "../features/profile/components/OnboardingUi";
import { usePatchProfile, useProfile } from "../lib/react-query/hooks";

const DOCUMENT_PATTERN = /^\d{6,}$/;

const PARENTESCOS = [
  "Madre",
  "Padre",
  "Hijo/a",
  "Hermano/a",
  "Cónyuge",
  "Pareja",
  "Abuelo/a",
  "Tío/a",
  "Primo/a",
  "Sobrino/a",
  "Suegro/a",
  "Cuñado/a",
  "Amigo/a",
  "Compañero/a de trabajo",
  "Vecino/a",
] as const;

export function MyDataPage() {
  const authUser = getAuthUser();
  const { data: profile, isLoading, isError, error } = useProfile();
  const patchProfile = usePatchProfile();

  const [document, setDocument] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyRelationship, setEmergencyRelationship] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const hydratedPersonIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    if (hydratedPersonIdRef.current === profile.personId) return;
    hydratedPersonIdRef.current = profile.personId;
    setDocument(profile.editable.document ?? "");
    setPhone(profile.editable.phone ?? "");
    setEmail(profile.editable.email ?? "");
    setAddress(profile.editable.address ?? "");
    setEmergencyName(profile.editable.emergencyContact.name ?? "");
    setEmergencyPhone(profile.editable.emergencyContact.phone ?? "");
    setEmergencyRelationship(profile.editable.emergencyContact.relationship ?? "");
  }, [profile]);

  useHoldRouteTransition(isLoading && !profile);

  const relationshipOptions = PARENTESCOS.includes(
    emergencyRelationship as (typeof PARENTESCOS)[number],
  )
    ? PARENTESCOS
    : emergencyRelationship.trim()
      ? [emergencyRelationship.trim(), ...PARENTESCOS]
      : PARENTESCOS;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaved(false);
    const next: Record<string, string> = {};
    if (!DOCUMENT_PATTERN.test(document.trim())) {
      next.document = "Ingresa un documento válido.";
    }
    if (!phone.trim()) {
      next.phone = "Ingresa un teléfono de contacto.";
    }
    if (!emergencyName.trim()) {
      next.emergencyName = "Completa los datos del contacto de emergencia.";
    }
    if (!emergencyPhone.trim()) {
      next.emergencyPhone = "Completa los datos del contacto de emergencia.";
    }
    if (!emergencyRelationship.trim()) {
      next.emergencyRelationship = "Completa los datos del contacto de emergencia.";
    }
    setFieldErrors(next);
    if (Object.keys(next).length > 0) return;

    try {
      await patchProfile.mutateAsync({
        document: document.trim(),
        phone,
        email,
        address,
        emergency_contact_name: emergencyName,
        emergency_contact_phone: emergencyPhone,
        emergency_contact_relationship: emergencyRelationship,
      });
      setFormError(null);
      setSaved(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo guardar");
    }
  };

  if (isLoading && !profile) {
    return null;
  }

  if (isError || !profile) {
    return (
      <main className="onboarding-sub relative flex min-h-dvh items-center justify-center px-6 text-white">
        <p className="text-sm text-rose-300">
          {error instanceof Error ? error.message : "Perfil no disponible"}
        </p>
      </main>
    );
  }

  return (
    <main className="onboarding-sub relative h-dvh overflow-y-auto overflow-x-hidden pb-8 text-white">
      <div className="onboarding-sub__bg pointer-events-none fixed inset-0 z-0" aria-hidden />
      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-8 sm:px-6 sm:py-10">
        <Link
          to="/org"
          className="self-start rounded-xl border border-cyan-300/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
        >
          Volver al organigrama
        </Link>
        <OnboardingProfileIntro profile={profile} authUser={authUser} />
        <OnboardingRequiredNote />
        <form onSubmit={(event) => void handleSubmit(event)} className="flex w-full flex-col gap-3">
          <OnboardingFormCard id="my-contact" title="Tus datos">
            <OnboardingVerifiedEmail email={profile.readonly.edu_email} />
            <div className="grid gap-3 md:grid-cols-2">
              <OnboardingField
                label="Documento / cédula"
                id="document"
                required
                error={fieldErrors.document}
                hint="Ingresa tu número de cédula sin puntos ni comas."
              >
                <input
                  id="document"
                  type="text"
                  inputMode="numeric"
                  className={onboardingInputClassName}
                  value={document}
                  onChange={(event) => setDocument(event.target.value.replace(/\D/g, ""))}
                  autoComplete="off"
                />
              </OnboardingField>
              <OnboardingField
                label="Teléfono"
                id="phone"
                required
                error={fieldErrors.phone}
                hint="Número de contacto principal."
              >
                <input
                  id="phone"
                  type="tel"
                  className={onboardingInputClassName}
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  autoComplete="tel"
                />
              </OnboardingField>
            </div>
            <OnboardingField label="Correo alterno" id="email">
              <input
                id="email"
                type="email"
                className={onboardingInputClassName}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </OnboardingField>
            <OnboardingField label="Dirección" id="address">
              <input
                id="address"
                type="text"
                className={onboardingInputClassName}
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                autoComplete="street-address"
              />
            </OnboardingField>
          </OnboardingFormCard>

          <OnboardingFormCard id="my-emergency" title="Contacto de emergencia">
            <OnboardingField
              label="Nombre del contacto"
              id="emergencyName"
              required
              error={fieldErrors.emergencyName}
            >
              <input
                id="emergencyName"
                type="text"
                className={onboardingInputClassName}
                value={emergencyName}
                onChange={(event) => setEmergencyName(event.target.value)}
                autoComplete="name"
              />
            </OnboardingField>
            <div className="grid gap-3 md:grid-cols-2">
              <OnboardingField
                label="Teléfono del contacto"
                id="emergencyPhone"
                required
                error={fieldErrors.emergencyPhone}
              >
                <input
                  id="emergencyPhone"
                  type="tel"
                  className={onboardingInputClassName}
                  value={emergencyPhone}
                  onChange={(event) => setEmergencyPhone(event.target.value)}
                  autoComplete="tel"
                />
              </OnboardingField>
              <OnboardingField
                label="Parentesco"
                id="emergencyRelationship"
                required
                error={fieldErrors.emergencyRelationship}
              >
                <select
                  id="emergencyRelationship"
                  className={`${onboardingInputClassName} cursor-pointer`}
                  value={emergencyRelationship}
                  onChange={(event) => setEmergencyRelationship(event.target.value)}
                >
                  <option value="" disabled>
                    Selecciona parentesco
                  </option>
                  {relationshipOptions.map((opcion) => (
                    <option key={opcion} value={opcion}>
                      {opcion}
                    </option>
                  ))}
                </select>
              </OnboardingField>
            </div>
          </OnboardingFormCard>

          {formError ? (
            <p
              className="rounded-lg border border-rose-300/30 bg-rose-950/40 px-4 py-2.5 text-center text-sm text-rose-200"
              role="alert"
            >
              {formError}
            </p>
          ) : null}
          {saved ? (
            <p
              className="rounded-lg border border-emerald-300/30 bg-emerald-950/40 px-4 py-2.5 text-center text-sm text-emerald-100"
              role="status"
            >
              Datos y contacto de emergencia actualizados.
            </p>
          ) : null}

          <button
            type="submit"
            disabled={patchProfile.isPending}
            className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_-8px_rgba(8,145,178,0.55)] transition hover:bg-cyan-500 disabled:opacity-60"
          >
            {patchProfile.isPending ? "Guardando…" : "Guardar datos"}
          </button>
        </form>
      </div>
    </main>
  );
}
