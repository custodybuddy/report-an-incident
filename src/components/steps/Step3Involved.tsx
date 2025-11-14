import React, { useState } from 'react';
import { type IncidentData, type IncidentDataUpdater } from '@/types';
import { PREDEFINED_PARTIES, PREDEFINED_CHILDREN } from '@/constants';
import CustomCheckbox from '../ui/CustomCheckbox';
import Button from '../ui/Button';
import H1 from '../ui/H1';

interface Step3Props {
  data: Pick<IncidentData, 'parties' | 'children'>;
  updateData: IncidentDataUpdater;
  errors: { parties?: string };
}

interface InvolvementSectionProps {
    title: string;
    items: string[];
    selectedItems: string[];
    onSelectionChange: (newSelection: string[]) => void;
    customInputPlaceholder: string;
    error?: string;
}

const InvolvementSection: React.FC<InvolvementSectionProps> = ({ title, items, selectedItems, onSelectionChange, customInputPlaceholder, error }) => {
    const [customItem, setCustomItem] = useState('');

    const hasAsterisk = title.includes('*');
    const cleanTitle = title.replace('*', '').trim();

    const handleCheckboxChange = (item: string, checked: boolean) => {
        let newSelection;
        if (checked) {
            newSelection = [...selectedItems, item];
        } else {
            newSelection = selectedItems.filter(i => i !== item);
        }
        onSelectionChange(newSelection);
    };
    
    const handleAddCustomItem = () => {
        if (customItem && !selectedItems.includes(customItem)) {
            onSelectionChange([...selectedItems, customItem]);
            setCustomItem('');
        }
    };
    
    return (
        <div className={`bg-black/20 rounded-xl p-6 border shadow-lg transition-all duration-300 ${error ? 'border-red-500' : 'border-slate-700'}`}>
            <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2 text-amber-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                {cleanTitle}
                {hasAsterisk && <span className="text-amber-400 ml-1">*</span>}
            </h3>
            <div className="space-y-2">
                {items.map(item => (
                    <CustomCheckbox key={item} label={item} isChecked={selectedItems.includes(item)} onChange={(checked) => handleCheckboxChange(item, checked)} />
                ))}
                {selectedItems.filter(item => !items.includes(item)).map(item => (
                     <CustomCheckbox key={item} label={item} isChecked={true} onChange={(checked) => handleCheckboxChange(item, checked)} />
                ))}
            </div>
             {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
            <div className="mt-6 flex gap-2 pt-4 border-t border-slate-700">
                <input 
                    type="text" 
                    value={customItem}
                    onChange={e => setCustomItem(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddCustomItem()}
                    placeholder={customInputPlaceholder}
                    className="flex-1 p-3 bg-slate-800 border-2 border-slate-600 text-slate-200 rounded-lg focus:ring-4 focus:ring-amber-400/30 focus:border-amber-400 hover:border-amber-500 transition-all duration-300 focus:outline-none"
                />
                <Button
                    onClick={handleAddCustomItem}
                    size="sm"
                    className="px-3 hover:scale-[1.03] active:scale-[0.98]"
                    aria-label="Add custom item"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="12" x2="12" y1="5" y2="19"></line><line x1="5" x2="19" y1="12" y2="12"></line></svg>
                </Button>
            </div>
        </div>
    );
};

const Step3Involved: React.FC<Step3Props> = ({ data, updateData, errors }) => {
  return (
    <div className="space-y-8 animate-[fade-in_0.6s_cubic-bezier(0.25,0.46,0.45,0.94)_forwards]">
        <div className="text-center mb-8">
            <H1 className="text-3xl sm:text-4xl font-bold text-[#FFD700] mb-2">Who was present or affected?</H1>
            <p className="text-slate-400 max-w-md mx-auto">Identify all parties involved and the children who were present or impacted by the event.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <InvolvementSection
                title="Other Parties Involved *"
                items={PREDEFINED_PARTIES}
                selectedItems={data.parties}
                onSelectionChange={(newSelection) => updateData('parties', newSelection)}
                customInputPlaceholder="Add another party..."
                error={errors.parties}
            />
            <InvolvementSection
                title="Children Present/Affected"
                items={PREDEFINED_CHILDREN}
                selectedItems={data.children}
                onSelectionChange={(newSelection) => updateData('children', newSelection)}
                customInputPlaceholder="Add another child..."
            />
        </div>
    </div>
  );
};

export default Step3Involved;
