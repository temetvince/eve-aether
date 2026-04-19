import React, { useState, useEffect } from 'react';
import './App.css';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LaunchBay from './components/LaunchBay';
import FleetGrid from './components/FleetGrid';
import EditModal from './components/EditModal';
import NameRegistry from './components/NameRegistry';

import defaultNames from './data/names';
import { allHulls } from './data/hulls';
import { tagCategories } from './data/tags';
import { getAvailable, chooseRandom, exportFleetData } from './utils/fleet';
import {
  eqCI,
  includesCI,
  sortStringsCI,
  uniqueSortStringsCI,
  indexOfCI,
  ci,
} from './utils/strings';
import { FleetItem, Hull, TagCategory } from './types';
import HullRegistry from './components/HullRegistry';
import TagRegistry from './components/TagRegistry';

const App: React.FC = () => {
  // sidebar open state; visibility on small screens is controlled by CSS
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [shipNames, setShipNames] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('aetherShipNames');
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (
          Array.isArray(parsed) &&
          parsed.every((p) => typeof p === 'string')
        ) {
          return sortStringsCI(parsed);
        }
      }
    } catch {
      // ignore parse errors
    }
    return sortStringsCI([...defaultNames]);
  });

  const [inUse, setInUse] = useState<FleetItem[]>(() => {
    try {
      const raw = localStorage.getItem('aetherFleet');
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (
          Array.isArray(parsed) &&
          parsed.every(
            (p) => typeof p === 'object' && p !== null && 'shipName' in p,
          )
        ) {
          return (parsed as unknown[])
            .map((p) => {
              if (typeof p === 'object' && p !== null) {
                const obj = p as Record<string, unknown>;
                const shipName =
                  typeof obj.shipName === 'string' ? obj.shipName : '';
                const hull = typeof obj.hull === 'string' ? obj.hull : '';
                const tags =
                  Array.isArray(obj.tags) ?
                    obj.tags.filter((t): t is string => typeof t === 'string')
                  : [];
                return { shipName, hull, tags } as FleetItem;
              }
              return { shipName: '', hull: '', tags: [] } as FleetItem;
            })
            .sort((a, b) =>
              a.shipName.localeCompare(b.shipName, undefined, {
                sensitivity: 'base',
              }),
            );
        }
      }
    } catch {
      // ignore
    }
    return [];
  });
  const [currentRandom, setCurrentRandom] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedHull, setSelectedHull] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [view, setView] = useState<'dashboard' | 'registry'>('dashboard');
  const [hullSearch, setHullSearch] = useState('');
  const [modal, setModal] = useState<
    'edit' | 'manage' | 'manage-hulls' | 'manage-tags' | null
  >(null);
  const [hulls, setHulls] = useState<Hull[]>(() => {
    try {
      const raw = localStorage.getItem('aetherHulls');
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const parsedHulls = parsed as Hull[];
          return [...parsedHulls].sort((a, b) => a.Ship.localeCompare(b.Ship));
        }
      }
    } catch {}
    return [...allHulls].sort((a, b) => a.Ship.localeCompare(b.Ship));
  });

  const [tagsState, setTagsState] = useState<TagCategory[]>(() => {
    try {
      const raw = localStorage.getItem('aetherTags');
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const parsedTags = parsed as TagCategory[];
          return parsedTags
            .map((c) => ({
              category: c.category,
              tags: sortStringsCI([...c.tags]),
            }))
            .sort((a, b) =>
              a.category.localeCompare(b.category, undefined, {
                sensitivity: 'base',
              }),
            );
        }
      }
    } catch {}
    return tagCategories
      .map((c) => ({
        category: c.category,
        tags: sortStringsCI([...c.tags]),
      }))
      .sort((a, b) =>
        a.category.localeCompare(b.category, undefined, {
          sensitivity: 'base',
        }),
      );
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('aetherShipNames', JSON.stringify(shipNames));
  }, [shipNames]);

  useEffect(() => {
    localStorage.setItem('aetherFleet', JSON.stringify(inUse));
  }, [inUse]);

  useEffect(() => {
    localStorage.setItem('aetherHulls', JSON.stringify(hulls));
  }, [hulls]);

  useEffect(() => {
    localStorage.setItem('aetherTags', JSON.stringify(tagsState));
  }, [tagsState]);

  const pickRandom = () => {
    const available = getAvailable(shipNames, inUse);
    setCurrentRandom(chooseRandom(available));
  };

  useEffect(() => {
    pickRandom();
  }, [inUse, shipNames]);

  const deployRandom = () => {
    if (!currentRandom) return;
    setInUse((prev) => {
      const next = [...prev, { shipName: currentRandom, hull: '', tags: [] }];
      const sorted = next.sort((a, b) =>
        a.shipName.localeCompare(b.shipName, undefined, {
          sensitivity: 'base',
        }),
      );
      const newIndex = indexOfCI(
        sorted.map((s) => s.shipName),
        currentRandom,
      );
      setEditingIndex(newIndex);
      setSelectedHull('');
      setSelectedTags([]);
      setHullSearch('');
      setModal('edit');
      const available = getAvailable(shipNames, sorted);
      setCurrentRandom(chooseRandom(available));
      return sorted;
    });
  };

  const deployNamed = (name: string) => {
    // ensure name is in registry, then deploy
    setShipNames((prev) => {
      if (includesCI(prev, name)) return prev;
      const next = uniqueSortStringsCI([...prev, name]);
      return next;
    });

    setInUse((prev) => {
      const next = [...prev, { shipName: name, hull: '', tags: [] }];
      const sorted = next.sort((a, b) =>
        a.shipName.localeCompare(b.shipName, undefined, {
          sensitivity: 'base',
        }),
      );
      const newIndex = indexOfCI(
        sorted.map((s) => s.shipName),
        name,
      );
      setEditingIndex(newIndex);
      setSelectedHull('');
      setSelectedTags([]);
      setHullSearch('');
      setModal('edit');
      const available = getAvailable(shipNames, sorted);
      setCurrentRandom(chooseRandom(available));
      return sorted;
    });
  };

  const destroyShip = (index: number) => {
    if (index === -1) {
      setInUse([]);
      return;
    }
    setInUse((prev) =>
      prev
        .filter((_, i) => i !== index)
        .sort((a, b) =>
          a.shipName.localeCompare(b.shipName, undefined, {
            sensitivity: 'base',
          }),
        ),
    );
  };

  const importNames = (names: string[]) => {
    // merge unique names and sort
    setShipNames((prev) => uniqueSortStringsCI([...prev, ...names]));
  };

  const clearAllNames = () => {
    setShipNames([]);
  };

  const openEdit = (index: number) => {
    const item = inUse[index];
    setEditingIndex(index);
    setSelectedHull(item.hull || '');
    setSelectedTags(item.tags);
    setHullSearch(item.hull || '');
    setModal('edit');
  };

  // Hull registry handlers
  const addHull = (h: Hull) => {
    setHulls((prev) => {
      if (prev.some((p) => eqCI(p.Ship, h.Ship))) return prev;
      const next = [...prev, h];
      return next.sort((a, b) =>
        a.Ship.localeCompare(b.Ship, undefined, { sensitivity: 'base' }),
      );
    });
  };
  const removeHull = (ship: string) => {
    if (!confirm(`Permanently remove hull "${ship}"?`)) return;
    // Remove hull from registry only. Do not modify deployed ships' hull assignments.
    setHulls((prev) => prev.filter((p) => !eqCI(p.Ship, ship)));
  };
  const importHulls = (h: Hull[]) => {
    setHulls((prev) => {
      const map = new Map<string, Hull>();
      for (const p of prev) map.set(ci(p.Ship), p);
      for (const x of h) map.set(ci(x.Ship), x);
      const merged = Array.from(map.values());
      return merged.sort((a, b) =>
        a.Ship.localeCompare(b.Ship, undefined, { sensitivity: 'base' }),
      );
    });
  };
  const clearHulls = () => {
    if (!confirm('Clear all hulls?')) return;
    // Clear the hull registry but preserve hull assignments on deployed ships.
    setHulls([]);
  };

  // Tag registry handlers
  const addTagCategory = (cat: TagCategory) => {
    setTagsState((prev) => {
      if (prev.some((p) => eqCI(p.category, cat.category))) return prev;
      const next = [
        ...prev,
        {
          category: cat.category,
          tags: sortStringsCI([...cat.tags]),
        },
      ];
      return next.sort((a, b) =>
        a.category.localeCompare(b.category, undefined, {
          sensitivity: 'base',
        }),
      );
    });
  };
  const removeTagCategory = (category: string) => {
    if (!confirm(`Permanently remove category "${category}"?`)) return;
    // Remove the category from the registry only. Do not modify deployed ships' tags.
    setTagsState((prev) => prev.filter((p) => !eqCI(p.category, category)));
  };
  const importTagCategories = (cats: TagCategory[]) => {
    setTagsState((prev) => {
      const map = new Map<string, TagCategory>();
      for (const p of prev) map.set(ci(p.category), p);
      cats.forEach((c) =>
        map.set(ci(c.category), {
          category: c.category,
          tags: sortStringsCI([...c.tags]),
        }),
      );
      const merged = Array.from(map.values());
      return merged.sort((a, b) =>
        a.category.localeCompare(b.category, undefined, {
          sensitivity: 'base',
        }),
      );
    });
  };
  const clearTagCategories = () => {
    if (!confirm('Clear all tag categories?')) return;
    // Clear the tag registry but preserve tags on deployed ships.
    setTagsState([]);
  };

  // Restore defaults handlers
  const restoreDefaultNames = () => {
    setShipNames(() => sortStringsCI([...defaultNames]));
  };

  const restoreDefaultHulls = () => {
    setHulls(() =>
      [...allHulls].sort((a, b) =>
        a.Ship.localeCompare(b.Ship, undefined, { sensitivity: 'base' }),
      ),
    );
    setInUse((prev) =>
      prev.map((it) => ({
        ...it,
        hull: allHulls.some((h) => eqCI(h.Ship, it.hull)) ? it.hull : '',
      })),
    );
  };

  const restoreDefaultTags = () => {
    const sortedInit = tagCategories
      .map((c) => ({
        category: c.category,
        tags: sortStringsCI([...c.tags]),
      }))
      .sort((a, b) =>
        a.category.localeCompare(b.category, undefined, {
          sensitivity: 'base',
        }),
      );
    setTagsState(sortedInit);
    const allTagSet = new Set(
      sortedInit.flatMap((c) => c.tags.map((t) => ci(t))),
    );
    setInUse((prev) =>
      prev.map((it) => ({
        ...it,
        tags: it.tags.filter((t) => allTagSet.has(ci(t))),
      })),
    );
  };

  const saveEdit = () => {
    if (editingIndex === null) return;
    setInUse((prev) => {
      const updated = [...prev];
      updated[editingIndex] = {
        ...updated[editingIndex],
        hull: selectedHull,
        tags: selectedTags,
      };
      return updated;
    });
    setModal(null);
    setEditingIndex(null);
  };

  const addNewName = (name: string) => {
    if (!name || includesCI(shipNames, name)) return;
    setShipNames((prev) => uniqueSortStringsCI([...prev, name]));
  };

  const removeName = (name: string) => {
    if (!confirm(`Permanently remove "${name}" from the registry?`)) return;
    // Remove the name from the registry only. Do not delete deployed ships that use this name.
    setShipNames((prev) => prev.filter((n) => !eqCI(n, name)));
  };

  const exportFleet = () => {
    exportFleetData(inUse);
  };

  const importFleet = (fleet: FleetItem[]) => {
    // normalize incoming objects and set fleet
    const normalized = fleet
      .map((p) => {
        const shipName = typeof p.shipName === 'string' ? p.shipName : '';
        const hull = typeof p.hull === 'string' ? p.hull : '';
        const tags =
          Array.isArray(p.tags) ?
            p.tags.filter((t): t is string => typeof t === 'string')
          : [];
        return { shipName, hull, tags } as FleetItem;
      })
      .sort((a, b) =>
        a.shipName.localeCompare(b.shipName, undefined, {
          sensitivity: 'base',
        }),
      );

    setInUse(normalized);
  };

  return (
    <>
      {/* Starfield */}
      <div className='stars' />

      <div className='app'>
        <Header
          registryCount={shipNames.length}
          deployedCount={inUse.length}
          standbyCount={getAvailable(shipNames, inUse).length}
          onToggleSidebar={() => {
            setSidebarOpen((s) => !s);
          }}
        />

        <main>
          <Sidebar
            view={view}
            setView={setView}
            onExport={exportFleet}
            onImport={importFleet}
            openHullRegistry={() => {
              setModal('manage-hulls');
            }}
            openTagRegistry={() => {
              setModal('manage-tags');
            }}
            openManage={() => {
              setModal('manage');
            }}
            open={sidebarOpen}
          />

          {/* MAIN CONTENT AREA */}
          {
            <div className='content'>
              <LaunchBay
                currentRandom={currentRandom}
                onNewCandidate={pickRandom}
                onDeploy={deployRandom}
                onDeployName={deployNamed}
              />
              <FleetGrid
                inUse={inUse}
                openEdit={openEdit}
                destroyShip={destroyShip}
              />
            </div>
          }
        </main>
      </div>

      {/* EDIT MODAL */}
      {modal === 'edit' && editingIndex !== null && (
        <EditModal
          item={inUse[editingIndex]}
          editingIndex={editingIndex}
          selectedHull={selectedHull}
          setSelectedHull={setSelectedHull}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          saveEdit={saveEdit}
          destroyShip={destroyShip}
          allHulls={allHulls}
          hullSearch={hullSearch}
          setHullSearch={setHullSearch}
          tagCategories={tagCategories}
          close={() => {
            setModal(null);
          }}
        />
      )}

      {/* NAME REGISTRY */}
      {modal === 'manage' && (
        <NameRegistry
          shipNames={shipNames}
          addNewName={addNewName}
          removeName={removeName}
          onImportNames={importNames}
          onClearAll={clearAllNames}
          onRestoreDefaults={restoreDefaultNames}
          close={() => {
            setModal(null);
          }}
        />
      )}

      {modal === 'manage-hulls' && (
        <HullRegistry
          hulls={hulls}
          addHull={addHull}
          removeHull={removeHull}
          onImportHulls={importHulls}
          onClear={clearHulls}
          onRestoreDefaults={restoreDefaultHulls}
          close={() => {
            setModal(null);
          }}
        />
      )}

      {modal === 'manage-tags' && (
        <TagRegistry
          tagCategories={tagsState}
          addCategory={addTagCategory}
          removeCategory={removeTagCategory}
          onImportCategories={importTagCategories}
          onClear={clearTagCategories}
          onRestoreDefaults={restoreDefaultTags}
          close={() => {
            setModal(null);
          }}
        />
      )}
    </>
  );
};

export default App;
