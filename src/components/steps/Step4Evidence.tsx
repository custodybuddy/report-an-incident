import React from 'react';
import H2 from '../ui/H2';
import type { EvidenceItem } from '../../types';

const JURISDICTIONS = [
  'Alabama',
  'Alaska',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'District of Columbia',
  'Florida',
  'Georgia',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Pennsylvania',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming',
  'Alberta',
  'British Columbia',
  'Manitoba',
  'New Brunswick',
  'Newfoundland and Labrador',
  'Northwest Territories',
  'Nova Scotia',
  'Nunavut',
  'Ontario',
  'Prince Edward Island',
  'Quebec',
  'Saskatchewan',
  'Yukon',
];

const EVIDENCE_CATEGORIES = ['Screenshot', 'Document', 'Audio', 'Video', 'Other'];

interface Step4EvidenceProps {
  jurisdiction: string;
  caseNumber: string;
  evidence: EvidenceItem[];
  onJurisdictionChange: (value: string) => void;
  onCaseNumberChange: (value: string) => void;
  onEvidenceChange: (items: EvidenceItem[]) => void;
}

const Step4Evidence: React.FC<Step4EvidenceProps> = ({
  jurisdiction,
  caseNumber,
  evidence,
  onJurisdictionChange,
  onCaseNumberChange,
  onEvidenceChange,
}) => {
  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = event => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      return;
    }

    onEvidenceChange([
      ...evidence,
      ...files.map((file, index) => ({
        id: `${file.name}-${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
        category: EVIDENCE_CATEGORIES[0],
        description: '',
      })),
    ]);
    event.target.value = '';
  };

  const updateEvidenceItem = (id: string, key: 'category' | 'description', value: string) => {
    onEvidenceChange(evidence.map(item => (item.id === id ? { ...item, [key]: value } : item)));
  };

  const removeEvidenceItem = (id: string) => {
    onEvidenceChange(evidence.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-8 animate-[fade-in_0.6s_cubic-bezier(0.25,0.46,0.45,0.94)_forwards]">
      <div className="text-center mb-8">
        <H2 className="text-3xl font-bold text-[#FFD700] mb-2">Jurisdiction &amp; Evidence</H2>
        <p className="text-slate-400 max-w-lg mx-auto">
          This screen mirrors the production styling but drops the AI + storage wiring. Uploading
          files here only updates local state.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <label
            htmlFor="jurisdiction-select"
            className="block text-sm font-semibold text-slate-300 mb-2"
          >
            Legal Jurisdiction <span className="text-amber-400">*</span>
          </label>
          <div className="relative">
            <select
              id="jurisdiction-select"
              value={jurisdiction}
              onChange={event => onJurisdictionChange(event.target.value)}
              className="w-full appearance-none bg-slate-800/50 border-2 border-slate-600 rounded-xl px-4 py-3 text-slate-200 transition-all duration-300 focus:ring-4 focus:ring-amber-400/30 focus:border-amber-400 hover:border-amber-500"
            >
              <option value="">Select a jurisdiction...</option>
              {JURISDICTIONS.map(name => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="case-number-input" className="block text-sm font-semibold text-slate-300 mb-2">
            Case Number (Optional)
          </label>
          <div className="relative">
            <input
              type="text"
              id="case-number-input"
              value={caseNumber}
              onChange={event => onCaseNumberChange(event.target.value)}
              placeholder="e.g., F-12345-67"
              className="w-full p-3 bg-slate-800/50 border-2 rounded-xl transition-all duration-300 shadow-sm text-slate-200 border-slate-600 focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-400/30 hover:border-amber-500"
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-100 mb-4">Evidence Locker</h3>
          <div className="bg-black/20 rounded-xl p-6 border border-slate-700">
            <div className="space-y-4">
              {evidence.length === 0 && (
                <p className="text-center text-slate-500 py-4">
                  No evidence uploaded yet. Drop files here to see the styling.
                </p>
              )}
              {evidence.map(file => (
                <div key={file.id} className="bg-black/50 p-4 rounded-lg border border-slate-600 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-slate-200 break-all">{file.name}</p>
                      <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                    <button
                      onClick={() => removeEvidenceItem(file.id)}
                      aria-label={`Remove ${file.name}`}
                      className="text-slate-400 hover:text-red-400 transition-colors p-1 flex-shrink-0"
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
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      value={file.category}
                      onChange={event => updateEvidenceItem(file.id, 'category', event.target.value)}
                      className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-md text-slate-300 text-sm focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
                    >
                      {EVIDENCE_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Brief description of this file..."
                      value={file.description}
                      onChange={event => updateEvidenceItem(file.id, 'description', event.target.value)}
                      className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-md text-slate-300 text-sm focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    This information is temporary and resets if you refresh the page.
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700/50">
              <label
                htmlFor="file-upload"
                className="w-full p-6 border-2 border-dashed border-amber-500/50 text-amber-300 bg-amber-900/10 rounded-xl hover:bg-amber-900/20 transition-all duration-200 flex flex-col items-center justify-center font-semibold cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-8 h-8 mb-2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>Click to Upload or Drag &amp; Drop</span>
                <span className="text-xs text-slate-400 font-normal mt-1">
                  Images, PDFs, Audio, or Video (demo only)
                </span>
              </label>
              <input
                id="file-upload"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
                accept="image/*,application/pdf,audio/*,video/*"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step4Evidence;
