import React, { useState } from 'react';
import { FleetItem, Hull } from '../types';
import { TagCategory } from '../types';

interface Props {
  item?: FleetItem;
  editingIndex: number | null;
  selectedHull: string;
  setSelectedHull: (s: string) => void;
  selectedTags: string[];
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
  saveEdit: () => void;
  destroyShip: (i: number) => void;
  allHulls: Hull[];
  hullSearch: string;
  setHullSearch: (s: string) => void;
  tagCategories: TagCategory[];
  close: () => void;
}

const EditModal: React.FC<Props> = ({
  item,
  editingIndex,
  selectedHull,
  setSelectedHull,
  selectedTags,
  setSelectedTags,
  saveEdit,
  destroyShip,
  allHulls,
  hullSearch,
  setHullSearch,
  tagCategories,
  close,
}) => {
  const filtered = allHulls.filter((h) =>
    h.Ship.toLowerCase().includes(hullSearch.toLowerCase()),
  );

  const [step, setStep] = useState<'hull' | 'tags'>('hull');
  const [tagSearch] = useState<string>('');

  const filteredTagCategories: { category: string; tags: string[] }[] =
    tagCategories
      .map((cat) => ({
        category: cat.category,
        tags: cat.tags.filter((t) =>
          t.toLowerCase().includes(tagSearch.toLowerCase()),
        ),
      }))
      .filter((c) => c.tags.length > 0);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev: string[]) => {
      const has = prev.includes(tag);
      if (has) return prev.filter((t) => t !== tag);
      return [...prev, tag];
    });
  };

  return (
    <div
      className='modal-overlay'
      onClick={close}
    >
      <div
        className='modal-content'
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
        }}
      >
        <div className='modal-header'>
          <div className='modal-title-row'>
            {step === 'tags' ?
              <button
                onClick={() => {
                  setStep('hull');
                }}
                className='btn-secondary btn-back'
              >
                ◀ Back
              </button>
            : null}
            <div>{item?.shipName}</div>
          </div>
          <button
            onClick={close}
            className='close-btn'
          >
            ×
          </button>
        </div>

        <div className='modal-body'>
          {step === 'hull' && (
            <div>
              <div className='form-group'>
                <div className='form-heading'>SELECT HULL</div>
                <input
                  type='text'
                  placeholder='Search hulls...'
                  value={hullSearch}
                  onChange={(e) => {
                    setHullSearch(e.target.value);
                  }}
                  className='modal-search-input'
                />
              </div>

              <div className='hull-list'>
                {filtered.map((hull) => (
                  <div
                    key={hull.Ship}
                    onClick={() => {
                      setSelectedHull(hull.Ship);
                      setStep('tags');
                    }}
                    className={`hull-row ${selectedHull === hull.Ship ? 'selected' : ''}`}
                  >
                    <div>
                      <strong>{hull.Ship}</strong>
                      <div className='muted-small'>
                        {hull.Type} • {hull.Tech} • {hull.Faction}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'tags' && (
            <div>
              <div className='section-header mb-1'>
                <div className='form-heading'>ROLES & TAGS</div>
              </div>

              <div>
                {filteredTagCategories.map((cat) => (
                  <div
                    key={cat.category}
                    className='category-row'
                  >
                    <div className='tag-category-name'>{cat.category}</div>
                    <div className='tag-grid'>
                      {cat.tags.map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <div
                            key={tag}
                            onClick={() => {
                              toggleTag(tag);
                            }}
                            className={`tag-option ${isSelected ? 'selected' : ''}`}
                          >
                            {tag}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className='modal-footer'>
          {step === 'hull' ?
            <>
              <button
                onClick={() => {
                  if (editingIndex != null) {
                    destroyShip(editingIndex);
                    close();
                  }
                }}
                className='btn-danger'
              >
                DESTROY
              </button>
              <button
                onClick={() => {
                  setStep('tags');
                }}
                className='btn-primary'
                disabled={!selectedHull}
              >
                NEXT
              </button>
            </>
          : <>
              <button
                onClick={() => {
                  if (editingIndex != null) {
                    destroyShip(editingIndex);
                    close();
                  }
                }}
                className='btn-danger'
              >
                DESTROY
              </button>
              <button
                onClick={() => {
                  saveEdit();
                }}
                className='btn-primary'
              >
                SAVE ASSIGNMENT
              </button>
            </>
          }
        </div>
      </div>
    </div>
  );
};

export default EditModal;
