import React, { useState } from 'react';
import { makeAetherFilename } from '../utils/fleet';
import { TagCategory } from '../types';

interface Props {
  tagCategories: TagCategory[];
  addCategory: (c: TagCategory) => void;
  removeCategory: (category: string) => void;
  onImportCategories?: (cats: TagCategory[]) => void;
  onClear?: () => void;
  onRestoreDefaults?: () => void;
  close: () => void;
}

const TagRegistry: React.FC<Props> = ({
  tagCategories,
  addCategory,
  removeCategory,
  onImportCategories,
  onClear,
  onRestoreDefaults,
  close,
}) => {
  const [newCategory, setNewCategory] = useState('');
  const [newTags, setNewTags] = useState('');

  return (
    <div
      className='modal-overlay'
      onClick={close}
    >
      <div
        className='modal-content modal-large'
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
        }}
      >
        <div className='modal-header'>
          <div>TAG REGISTRY</div>
          <button
            onClick={close}
            className='close-btn'
          >
            ×
          </button>
        </div>

        <div className='modal-body'>
          <div className='add-row'>
            <button
              className='btn-export'
              onClick={() => {
                try {
                  const blob = new Blob(
                    [JSON.stringify(tagCategories, null, 2)],
                    { type: 'application/json' },
                  );
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = makeAetherFilename('tags.json');
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(url);
                } catch {}
              }}
            >
              Export
            </button>

            <label className='btn-import'>
              Import
              <input
                type='file'
                accept='application/json'
                className='hidden-file-input'
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const fr = new FileReader();
                  fr.onload = () => {
                    try {
                      const result = fr.result;
                      if (typeof result !== 'string') return;
                      let parsed: unknown;
                      try {
                        parsed = JSON.parse(result);
                      } catch {
                        return;
                      }
                      if (
                        Array.isArray(parsed) &&
                        parsed.every(
                          (p) =>
                            p &&
                            typeof p === 'object' &&
                            'category' in (p as Record<string, unknown>),
                        )
                      ) {
                        onImportCategories?.(parsed as TagCategory[]);
                      }
                    } catch {}
                  };
                  fr.readAsText(f);
                  e.currentTarget.value = '';
                }}
              />
            </label>

            <button
              className='btn-defaults'
              onClick={() => {
                if (
                  !confirm(
                    'Restore default tag categories? This will overwrite the current tags registry.',
                  )
                )
                  return;
                onRestoreDefaults?.();
              }}
            >
              Defaults
            </button>
            <button
              className='btn-clear'
              onClick={() => onClear?.()}
            >
              Clear All
            </button>
          </div>

          <div className='add-row'>
            <input
              value={newCategory}
              onChange={(e) => {
                setNewCategory(e.target.value);
              }}
              placeholder='Category name'
              className='registry-input flex-1'
            />
            <input
              value={newTags}
              onChange={(e) => {
                setNewTags(e.target.value);
              }}
              placeholder='Comma-separated tags'
              className='registry-input'
            />
            <button
              onClick={() => {
                const category = newCategory.trim();
                if (!category) return;
                const tags = newTags
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean);
                addCategory({ category, tags });
                setNewCategory('');
                setNewTags('');
              }}
              className='registry-add-btn'
            >
              ADD
            </button>
          </div>

          <div className='manage-list'>
            {tagCategories.map((c) => (
              <div
                key={c.category}
                className='manage-row'
              >
                <div>
                  <strong>{c.category}</strong>
                  <div className='small-icon muted-text'>
                    {c.tags.join(', ')}
                  </div>
                </div>
                <div className='flex-gap-8'>
                  <button
                    onClick={() => {
                      removeCategory(c.category);
                    }}
                    className='small-btn remove-small'
                  >
                    REMOVE
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagRegistry;
