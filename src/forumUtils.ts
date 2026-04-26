import type { Case, CaseComment } from "./api/client";

export function formatCaseTitle(c: Case) {
  const series = c.series ? ` (${c.series})` : "";
  const code = c.error_code ? ` · ${c.error_code}` : "";
  return `ID ${c.id} · ${c.brand} ${c.model}${series}${code}`;
}

export function getCreatorName(c: Case) {
  const name = (c.creator_public_name ?? c.public_name)?.trim();
  if (name && name.length > 0) return name;
  return "Usuario";
}

export function getAuthorName(comment: CaseComment) {
  const name = comment.author_public_name?.trim();
  if (name && name.length > 0) return name;
  return "Usuario";
}
