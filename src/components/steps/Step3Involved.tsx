import React, { useState } from 'react';
import CustomCheckbox from '../ui/CustomCheckbox';
import Button from '../ui/Button';
import H1 from '../ui/H1';
import {
  cardBase,
  cardPadding,
  cardStack,
  inlineFieldGap,
  listStack,
} from '../ui/layoutTokens';

const PREDEFINED_PARTIES = [
  'Co-Parent',
  'Grandparent',
  'Law Enforcement',
  'Teacher/School',
  'Other Family Member',
];

const PREDEFINED_CHILDREN = [
  'Oldest Child',
  'Middle Child',
  'Youngest Child',
  'Stepchild',
  'Family Friend',
];

interface InvolvementSectionProps {
  title: string;
  items: string[];
  selectedItems: string[];
  onSelectionChange: (items: string[]) => void;
  customInputPlaceholder: string;
}

const InvolvementSection: React.FC<InvolvementSectionProps> = ({
  title,
  items,
  selectedItems,
  onSelectionChange,
  customInputPlaceholder,
}) => {
  const [customItem, setCustomItem] = useState('');

  const handleCheckboxChange = (item: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedItems, item]);
      return;
    }
    onSelectionChange(selectedItems.filter(value => value !== item));
  };

  const handleAddCustomItem = () => {
    if (!customItem.trim()) {
      return;
    }
    if (!selectedItems.includes(customItem.trim())) {
      onSelectionChange([...selectedItems, customItem.trim()]);
    }
    setCustomItem('');
  };

  return (
    <div className={`${cardBase} ${cardPadding} ${cardStack}`}>
      <h3 className="text-lg font-bold text-amber-400 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 mr-2 text-amber-400"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        {title}
      </h3>
      <div className={listStack}>
        {items.map(item => (
          <CustomCheckbox
            key={item}
            label={item}
            isChecked={selectedItems.includes(item)}
            onChange={checked => handleCheckboxChange(item, checked)}
          />
        ))}
        {selectedItems
          .filter(item => !items.includes(item))
          .map(item => (
            <CustomCheckbox
              key={item}
              label={item}
              isChecked
            onChange={checked => handleCheckboxChange(item, checked)}
          />
        ))}
      </div>
      <div className={`flex ${inlineFieldGap} pt-4 border-t border-slate-700`}>
        <input
          type="text"
          value={customItem}
          onChange={event => setCustomItem(event.target.value)}
          onKeyDown={event => event.key === 'Enter' && handleAddCustomItem()}
          placeholder={customInputPlaceholder}
          className="flex-1 p-3 bg-slate-800 border-2 border-slate-600 text-slate-200 rounded-lg focus:ring-4 focus:ring-amber-400/30 focus:border-amber-400 hover:border-amber-500 transition-all duration-300 focus:outline-none"
        />
        <Button
          onClick={handleAddCustomItem}
          size="sm"
          className="px-3 hover:scale-[1.03] active:scale-[0.98]"
          aria-label="Add custom item"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <line x1="12" x2="12" y1="5" y2="19"></line>
            <line x1="5" x2="19" y1="12" y2="12"></line>
          </svg>
        </Button>
      </div>
    </div>
  );
};

interface Step3InvolvedProps {
  parties: string[];
  children: string[];
  onPartiesChange: (items: string[]) => void;
  onChildrenChange: (items: string[]) => void;
}

const Step3Involved: React.FC<Step3InvolvedProps> = ({
  parties,
  children,
  onPartiesChange,
  onChildrenChange,
}) => {
  return (
    <div className="space-y-8 animate-[fade-in_0.6s_cubic-bezier(0.25,0.46,0.45,0.94)_forwards]">
      <div className="text-center mb-8">
        <H1 className="text-3xl sm:text-4xl font-bold text-[#FFD700] mb-2">
          Who was present or affected?
        </H1>
        <p className="text-slate-400 max-w-md mx-auto">
          Keep track of the same options as the fully-featured product without any database wiring.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <InvolvementSection
          title="Other Parties Involved"
          items={PREDEFINED_PARTIES}
          selectedItems={parties}
          onSelectionChange={onPartiesChange}
          customInputPlaceholder="Add another party..."
        />
        <InvolvementSection
          title="Children Present/Affected"
          items={PREDEFINED_CHILDREN}
          selectedItems={children}
          onSelectionChange={onChildrenChange}
          customInputPlaceholder="Add another child..."
        />
      </div>
    </div>
  );
};

export default Step3Involved;
