import { FleetItem, Hull } from '../types';
import { eqCI, ci } from './strings';

export const makeAetherFilename = (baseName: string) => {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `aether-${stamp}-${baseName}`;
};

export const getAvailable = (shipNames: string[], inUse: FleetItem[]) =>
  shipNames.filter((n) => !inUse.some((i) => eqCI(i.shipName, n)));

export const chooseRandom = (available: string[]) =>
  available.length ?
    available[Math.floor(Math.random() * available.length)]
  : null;

export const filteredHulls = (allHulls: Hull[], query: string) =>
  allHulls.filter((h) => ci(h.Ship).includes(ci(query)));

export const exportFleetData = (shipNames: string[], inUse: FleetItem[]) => {
  // Normalize, dedupe and sort shipNames (case-insensitive)
  const seenNames = new Map<string, string>();
  for (const n of shipNames) {
    const trimmed = n.trim();
    const key = trimmed.toLowerCase();
    if (trimmed && !seenNames.has(key)) seenNames.set(key, trimmed);
  }
  const sortedShipNames = Array.from(seenNames.values()).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' }),
  );

  // Ensure tags are normalized, deduped, and exported in alphabetical order for consistency
  const normalizeTags = (tags: string[]) => {
    const seen = new Map<string, string>();
    for (const t of tags) {
      const trimmed = t.trim();
      const key = trimmed.toLowerCase();
      if (trimmed && !seen.has(key)) seen.set(key, trimmed);
    }
    return Array.from(seen.values()).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' }),
    );
  };

  const sortedFleet = inUse.map((it) => ({
    ...it,
    tags: normalizeTags(it.tags),
  }));

  const data = {
    version: '4.0-aether',
    shipNames: sortedShipNames,
    fleet: sortedFleet,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = makeAetherFilename('fleet.json');
  a.click();
  URL.revokeObjectURL(url);
};

export const importFleetFromFile = (file: File): Promise<FleetItem[] | null> =>
  new Promise((resolve) => {
    const fr = new FileReader();
    fr.onload = () => {
      try {
        const result = fr.result;
        if (typeof result !== 'string') {
          resolve(null);
          return;
        }
        let parsed: unknown;
        try {
          parsed = JSON.parse(result);
        } catch {
          resolve(null);
          return;
        }

        let maybeFleet: unknown = undefined;
        if (Array.isArray(parsed)) {
          maybeFleet = parsed;
        } else if (parsed && typeof parsed === 'object') {
          const obj = parsed as Record<string, unknown>;
          maybeFleet = obj.fleet ?? obj;
        }

        if (!Array.isArray(maybeFleet)) {
          resolve(null);
          return;
        }

        const fleetArray = maybeFleet as unknown[];
        const normalized: FleetItem[] = [];
        for (const it of fleetArray) {
          if (!it || typeof it !== 'object') {
            resolve(null);
            return;
          }
          const o = it as Record<string, unknown>;
          const shipName = typeof o.shipName === 'string' ? o.shipName : '';
          const hull = typeof o.hull === 'string' ? o.hull : '';
          const tags =
            Array.isArray(o.tags) ?
              o.tags.filter((t): t is string => typeof t === 'string')
            : [];
          normalized.push({ shipName, hull, tags });
        }

        resolve(normalized);
      } catch {
        resolve(null);
      }
    };
    fr.onerror = () => {
      resolve(null);
    };
    fr.readAsText(file);
  });
