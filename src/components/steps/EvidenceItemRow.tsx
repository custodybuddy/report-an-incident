import React, { memo } from 'react';
import Button from '../ui/Button';
import type { EvidenceItem } from '../../types';
import type { EvidenceUpdateKey } from '../../hooks/useEvidenceList';

interface EvidenceItemRowProps {
  item: EvidenceItem;
  categories: string[];
  onRemove: (id: string) => void;
  onUpdate: (id: string, key: EvidenceUpdateKey, value: string) => void;
}

const EvidenceItemRow: React.FC<EvidenceItemRowProps> = ({ item, categories, onRemove, onUpdate }) => (
  <article
    className="bg-black/50 p-5 rounded-2xl border border-slate-600 space-y-4 shadow-lg shadow-amber-500/10 transition-transform duration-300 ease-out hover:scale-105 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-amber-300"
  >
    <div className="flex justify-between items-start gap-4">
      <div>
        <p className="font-semibold text-slate-200 break-all">{item.name}</p>
        <p className="text-xs text-slate-400">{(item.size / 1024).toFixed(2)} KB</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.name}`}
        className="flex-shrink-0 text-slate-300 hover:text-red-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      </Button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1">
        <span className="text-xs text-slate-400">Category</span>
        <select
          value={item.category}
          onChange={event => onUpdate(item.id, 'category', event.target.value)}
          className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-md text-slate-300 text-sm focus-visible:ring-2 focus-visible:ring-amber-300/70 focus-visible:border-amber-300"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <span className="text-xs text-slate-400">Description</span>
        <input
          type="text"
          placeholder="Brief description of this file..."
          value={item.description}
          onChange={event => onUpdate(item.id, 'description', event.target.value)}
          className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-md text-slate-300 text-sm focus-visible:ring-2 focus-visible:ring-amber-300/70 focus-visible:border-amber-300"
        />
      </div>
    </div>
    <p className="text-xs text-slate-400">
      This information is temporary and resets if you refresh the page.
    </p>
  </article>
);

export default memo(EvidenceItemRow);
