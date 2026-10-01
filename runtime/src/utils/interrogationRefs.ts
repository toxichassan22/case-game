function normalizeInterrogationSlug(input: string): string {
  return input
    .trim()
    .replace(/^char[-_]?/i, "")
    .replace(/^int[-_]?/i, "")
    .replace(/^CHAR[-_]?/i, "")
    .replace(/-01$/i, "")
    .replace(/_/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toUpperCase();
}

export function characterIdToInterrogationSourceRef(characterId: string): string {
  return `INT-${normalizeInterrogationSlug(characterId)}-01`;
}

export function interrogationSourceRefToCharacterId(sourceRef: string): string | null {
  if (!/^INT[-_]/i.test(sourceRef.trim())) {
    return null;
  }

  const slug = normalizeInterrogationSlug(sourceRef);
  return slug ? `char_${slug.toLowerCase().replace(/-/g, "_")}` : null;
}

export function characterIdToCharacterWindowToken(characterId: string): string {
  return `CHAR-${normalizeInterrogationSlug(characterId)}`;
}

export function characterWindowTokenToCharacterId(windowToken: string): string | null {
  if (!/^CHAR[-_]/i.test(windowToken.trim())) {
    return null;
  }

  const slug = normalizeInterrogationSlug(windowToken);
  return slug ? `char_${slug.toLowerCase().replace(/-/g, "_")}` : null;
}
