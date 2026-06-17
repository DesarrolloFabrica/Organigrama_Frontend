import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHoldRouteTransition } from "../contexts/RouteTransitionContext";
import { performAppLogout } from "../auth/appLogout";
import { getAuthUser } from "../auth/authStorage";
import { setProfileCompleted } from "../auth/profileGateStorage";
import {
  OnboardingField,
  OnboardingFormCard,
  OnboardingProfileIntro,
  OnboardingRequiredNote,
  OnboardingStepProgress,
  OnboardingVerifiedEmail,
  onboardingInputClassName,
} from "../features/profile/components/OnboardingUi";
import {
  useOnboardingStatus,
  usePatchProfile,
  usePostPhotoFromGoogle,
} from "../lib/react-query/hooks";

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

export function OnboardingPage() {
  const navigate = useNavigate();
  const authUser = getAuthUser();
  const {
    profile,
    profileLoading,
    profileError,
    status,
    setCurrentStep,
  } = useOnboardingStatus();
  const patchProfile = usePatchProfile();
  const postPhotoFromGoogle = usePostPhotoFromGoogle();

  const [document, setDocument] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyRelationship, setEmergencyRelationship] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const hydratedPersonIdRef = useRef<string | null>(null);

  const step = status?.currentStep === 1 ? "emergency" : "contact";
  const activeProgressStep = step === "contact" ? 1 : 2;

  useEffect(() => {
    if (!profile) return;
    if (profile.profileCompleted) {
      navigate("/loading", { replace: true });
      return;
    }

    if (hydratedPersonIdRef.current !== profile.personId) {
      hydratedPersonIdRef.current = profile.personId;
      setDocument(profile.editable.document ?? "");
      setPhone(profile.editable.phone ?? "");
      setEmail(profile.editable.email ?? "");
      setAddress(profile.editable.address ?? "");
      setEmergencyName(profile.editable.emergencyContact.name ?? "");
      setEmergencyPhone(profile.editable.emergencyContact.phone ?? "");
      setEmergencyRelationship(
        profile.editable.emergencyContact.relationship ?? "",
      );
    }

    if (profile.photo.photoUrl || !authUser?.pictureUrl) return;
    void postPhotoFromGoogle.mutateAsync().catch((err) => {
      console.warn("No se pudo guardar la foto de Google automáticamente", err);
    });
  }, [profile, navigate, authUser?.pictureUrl, postPhotoFromGoogle]);

  useHoldRouteTransition(profileLoading);

  const handleLogout = () => {
    performAppLogout();
    navigate("/");
  };

  const validateContactStep = (): boolean => {
    const next: Record<string, string> = {};
    if (!DOCUMENT_PATTERN.test(document.trim())) {
      next.document = "Ingresa un documento válido.";
    }
    if (!phone.trim()) {
      next.phone = "Ingresa un teléfono de contacto.";
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateEmergencyStep = (): boolean => {
    const next: Record<string, string> = {};
    const missingEmergency =
      !emergencyName.trim() ||
      !emergencyPhone.trim() ||
      !emergencyRelationship.trim();

    if (missingEmergency) {
      if (!emergencyName.trim()) {
        next.emergencyName = "Completa los datos del contacto de emergencia.";
      }
      if (!emergencyPhone.trim()) {
        next.emergencyPhone = "Completa los datos del contacto de emergencia.";
      }
      if (!emergencyRelationship.trim()) {
        next.emergencyRelationship =
          "Completa los datos del contacto de emergencia.";
      }
    }

    setFieldErrors(next);
    return !missingEmergency;
  };

  const handleContinue = () => {
    setError(null);
    if (validateContactStep()) {
      setCurrentStep(1);
    }
  };

  const handleBack = () => {
    setError(null);
    setFieldErrors({});
    setCurrentStep(0);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!validateEmergencyStep()) return;

    try {
      const updated = await patchProfile.mutateAsync({
        document: document.trim(),
        phone,
        email,
        address,
        emergency_contact_name: emergencyName,
        emergency_contact_phone: emergencyPhone,
        emergency_contact_relationship: emergencyRelationship,
        markCompleted: true,
      });
      setProfileCompleted(true);
      if (updated.profileCompleted) {
        navigate("/loading");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
    }
  };

  if (profileLoading) {
    return null;
  }

  if (!profile) {
    return (
      <main className="onboarding-sub relative flex min-h-dvh flex-col items-center justify-center gap-4 overflow-hidden px-6 text-center text-white">
        <div
          className="onboarding-sub__bg pointer-events-none fixed inset-0 z-0"
          aria-hidden
        />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <p className="text-sm text-rose-300">
            {profileError instanceof Error
              ? profileError.message
              : (error ?? "Perfil no disponible")}
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-500/40 px-4 py-2 text-sm text-slate-200"
          >
            Cerrar sesión
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="onboarding-sub relative h-dvh overflow-y-auto overflow-x-hidden pb-8 text-white">
      <div
        className="onboarding-sub__bg pointer-events-none fixed inset-0 z-0"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-8 sm:px-6 sm:py-10">
        <OnboardingProfileIntro profile={profile} authUser={authUser} />

        <OnboardingStepProgress activeStep={activeProgressStep} />

        <OnboardingRequiredNote />

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="flex w-full flex-col gap-3"
        >
          {step === "contact" ? (
            <OnboardingFormCard id="ob-contact" title="Datos de contacto">
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
                    pattern="[0-9]*"
                    className={onboardingInputClassName}
                    value={document}
                    onChange={(e) =>
                      setDocument(e.target.value.replace(/\D/g, ""))
                    }
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
                    onChange={(e) => setPhone(e.target.value)}
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
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </OnboardingField>

              <OnboardingField label="Dirección" id="address">
                <input
                  id="address"
                  type="text"
                  className={onboardingInputClassName}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  autoComplete="street-address"
                />
              </OnboardingField>
            </OnboardingFormCard>
          ) : (
            <OnboardingFormCard id="ob-emergency" title="Contacto de emergencia">
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
                  onChange={(e) => setEmergencyName(e.target.value)}
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
                    onChange={(e) => setEmergencyPhone(e.target.value)}
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
                    onChange={(e) => setEmergencyRelationship(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Selecciona parentesco
                    </option>
                    {PARENTESCOS.map((opcion) => (
                      <option key={opcion} value={opcion}>
                        {opcion}
                      </option>
                    ))}
                  </select>
                </OnboardingField>
              </div>
            </OnboardingFormCard>
          )}

          {error ? (
            <p
              className="rounded-lg border border-rose-300/30 bg-rose-950/40 px-4 py-2.5 text-center text-sm text-rose-200"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          {step === "contact" ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-cyan-300/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-cyan-200/40 hover:bg-white/15"
              >
                Cerrar sesión
              </button>
              <button
                type="button"
                onClick={handleContinue}
                className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_-8px_rgba(8,145,178,0.55)] transition hover:bg-cyan-500"
              >
                Continuar
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="rounded-xl border border-cyan-300/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-cyan-200/40 hover:bg-white/15"
              >
                Volver
              </button>
              <button
                type="submit"
                disabled={patchProfile.isPending}
                className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_-8px_rgba(8,145,178,0.55)] transition hover:bg-cyan-500 disabled:opacity-60"
              >
                {patchProfile.isPending ? "Guardando…" : "Guardar y continuar"}
              </button>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
