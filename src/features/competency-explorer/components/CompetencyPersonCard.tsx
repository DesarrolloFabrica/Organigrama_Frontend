import { withPhotoAccessToken } from "../../../auth/photoUrl";
import type { CompetencyPeopleSearchPerson } from "../types/competencyPeopleSearch.types";
import {
  competencyDomainRoleLabel,
  competencyPersonInitials,
  competencyPersonMatchReason,
} from "../utils/competencyPeopleSearchPresentation";

export function CompetencyPersonCard({
  person,
  onOpen,
}: {
  person: CompetencyPeopleSearchPerson;
  onOpen: (personId: string) => void;
}) {
  const photoUrl = withPhotoAccessToken(person.photoUrl);
  const initials = competencyPersonInitials(person.displayName);

  return (
    <article className="rounded-xl border border-cyan-400/12 bg-[#06111f]/70 p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-cyan-400/25 bg-cyan-950/50 text-sm font-semibold text-cyan-100">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt=""
              className="size-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span aria-hidden>{initials}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-medium text-slate-50">
                {person.displayName}
              </h3>
              <p className="mt-0.5 text-[12px] text-slate-400">
                {person.jobTitle ?? "Cargo no disponible"}
              </p>
            </div>
            <span
              className={`rounded-full border px-2 py-1 text-[10px] font-medium uppercase tracking-wide ${
                person.domainMatchRole === "PRIMARY"
                  ? "border-cyan-400/30 bg-cyan-950/40 text-cyan-100"
                  : "border-slate-500/40 bg-slate-900/50 text-slate-300"
              }`}
            >
              {competencyDomainRoleLabel(person.domainMatchRole)}
            </span>
          </div>

          <p className="mt-3 text-[12px] leading-relaxed text-slate-300">
            {competencyPersonMatchReason(person)}
          </p>

          {person.matchedSkills.length > 0 ? (
            <ul
              className="mt-3 flex flex-wrap gap-1.5"
              aria-label="Skills coincidentes"
            >
              {person.matchedSkills.map((skill) => (
                <li
                  key={skill.code}
                  className="rounded-md border border-cyan-400/25 bg-cyan-950/30 px-2 py-0.5 text-[11px] text-cyan-50"
                >
                  {skill.label}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-4 border-t border-slate-700/50 pt-3 text-right">
            <button
              type="button"
              onClick={() => onOpen(person.personId)}
              className="rounded-lg border border-cyan-400/30 bg-cyan-950/30 px-3 py-1.5 text-[12px] text-cyan-50 outline-none transition hover:border-cyan-300/45 hover:bg-cyan-950/50 focus-visible:ring-2 focus-visible:ring-cyan-300/45"
            >
              Ver perfil
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
