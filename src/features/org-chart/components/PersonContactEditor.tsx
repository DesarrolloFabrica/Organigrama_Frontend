import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getAuthUser } from "../../../auth/authStorage";
import { patchPersonContact } from "../../profile/services/profileService";
import { orgQueryKeys, profileQueryKeys } from "../../../lib/react-query/queryKeys";
import type { OrgPersonFullProfile } from "../types";

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
];

const inputClassName =
  "w-full rounded-md border border-cyan-400/25 bg-slate-950/70 px-2.5 py-1.5 text-sm text-slate-100 outline-none focus:border-cyan-300/60";

type Props = {
  personId: string;
  profile: OrgPersonFullProfile;
};

export function PersonContactEditor({ personId, profile }: Props) {
  const queryClient = useQueryClient();
  const [document, setDocument] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyRelationship, setEmergencyRelationship] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setDocument(profile.document ?? "");
    setPhone(profile.phone ?? "");
    setEmail(profile.email ?? "");
    setAddress(profile.address ?? "");
    setEmergencyName(profile.emergency_contact?.name ?? "");
    setEmergencyPhone(profile.emergency_contact?.phone ?? "");
    setEmergencyRelationship(profile.emergency_contact?.relationship ?? "");
    setSaved(false);
    setError(null);
  }, [personId, profile]);

  const relationshipOptions = PARENTESCOS.includes(emergencyRelationship)
    ? PARENTESCOS
    : emergencyRelationship.trim()
      ? [emergencyRelationship.trim(), ...PARENTESCOS]
      : PARENTESCOS;

  const handleSave = async () => {
    setSaved(false);
    setError(null);
    if (!/^\d{6,}$/.test(document.trim())) {
      setError("El documento debe tener solo números y al menos 6 dígitos.");
      return;
    }
    if (!phone.trim() || !emergencyName.trim() || !emergencyPhone.trim() || !emergencyRelationship.trim()) {
      setError("Completa el teléfono y los datos del contacto de emergencia.");
      return;
    }

    setPending(true);
    try {
      await patchPersonContact(personId, {
        document: document.trim(),
        phone,
        email,
        address,
        emergency_contact_name: emergencyName,
        emergency_contact_phone: emergencyPhone,
        emergency_contact_relationship: emergencyRelationship,
      });
      await queryClient.invalidateQueries({
        queryKey: orgQueryKeys.allPersonDetails,
      });
      if (getAuthUser()?.personId === personId) {
        await queryClient.invalidateQueries({ queryKey: profileQueryKeys.profile });
      }
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      <label className="flex flex-col gap-1 text-[11px] text-slate-400">
        Documento
        <input
          className={inputClassName}
          inputMode="numeric"
          value={document}
          onChange={(event) => setDocument(event.target.value.replace(/\D/g, ""))}
        />
      </label>
      <label className="flex flex-col gap-1 text-[11px] text-slate-400">
        Teléfono
        <input
          className={inputClassName}
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-[11px] text-slate-400">
        Correo alterno
        <input
          className={inputClassName}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-[11px] text-slate-400">
        Dirección
        <input
          className={inputClassName}
          value={address}
          onChange={(event) => setAddress(event.target.value)}
        />
      </label>
      <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
        Contacto de emergencia
      </p>
      <label className="flex flex-col gap-1 text-[11px] text-slate-400">
        Nombre
        <input
          className={inputClassName}
          value={emergencyName}
          onChange={(event) => setEmergencyName(event.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-[11px] text-slate-400">
        Teléfono
        <input
          className={inputClassName}
          type="tel"
          value={emergencyPhone}
          onChange={(event) => setEmergencyPhone(event.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-[11px] text-slate-400">
        Parentesco
        <select
          className={inputClassName}
          value={emergencyRelationship}
          onChange={(event) => setEmergencyRelationship(event.target.value)}
        >
          <option value="">Selecciona parentesco</option>
          {relationshipOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      {error ? (
        <p className="text-xs text-rose-300" role="alert">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="text-xs text-emerald-300" role="status">
          Datos actualizados.
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={pending}
        className="mt-1 rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Guardar datos"}
      </button>
    </div>
  );
}
