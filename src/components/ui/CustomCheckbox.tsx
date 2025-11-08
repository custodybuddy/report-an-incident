import React, { useId } from 'react';

interface CustomCheckboxProps {
  label: React.ReactNode;
  isChecked: boolean;
  onChange: (checked: boolean) => void;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ label, isChecked, onChange }) => {
  const id = useId();
  const checkmarkClasses = isChecked 
    ? 'opacity-100 transform scale-100' 
    : 'opacity-0 transform scale-50';

  return (
    <div>
      <input 
        type="checkbox" 
        id={id} 
        checked={isChecked}
        onChange={(e) => onChange(e.target.checked)}
        className="hidden"
      />
      <label 
        htmlFor={id} 
        className={`flex items-center p-3 rounded-xl transition-all duration-300 cursor-pointer border-2 bg-black/30 hover:bg-slate-700/50 shadow-md ${isChecked ? 'bg-amber-300/10 border-amber-400' : 'border-slate-700'}`}
      >
        <div className="w-5 h-5 rounded border-slate-500 bg-slate-800 flex-shrink-0 flex items-center justify-center border-2 transition-all duration-300">
          <svg className={`w-3 h-3 text-amber-400 transition-all duration-300 ${checkmarkClasses}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <span className="ml-3 text-slate-300 font-medium">{label}</span>
      </label>
    </div>
  );
};

export default CustomCheckbox;
