export const ci = (s?: string) => (s ?? '').toLowerCase().trim();

export const eqCI = (a?: string, b?: string) => ci(a) === ci(b);

export const includesCI = (arr: string[] | Set<string>, v?: string) => {
  if (!v) return false;
  const key = ci(v);
  if (Array.isArray(arr)) return arr.some((x) => ci(x) === key);
  return Array.from(arr).some((x) => ci(x) === key);
};

export const indexOfCI = (arr: string[], v?: string) => {
  if (!v) return -1;
  const key = ci(v);
  return arr.findIndex((x) => ci(x) === key);
};

export const sortStringsCI = (arr: string[]) =>
  [...arr].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' }),
  );

export const uniqueSortStringsCI = (arr: string[]) => {
  const map = new Map<string, string>();
  for (const s of arr) {
    const k = ci(s);
    if (k && !map.has(k)) map.set(k, s.trim());
  }
  return Array.from(map.values()).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' }),
  );
};

export const normalizeTags = (tags: string[]) =>
  uniqueSortStringsCI(tags.map((t) => t.trim()));
