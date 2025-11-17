import React from 'react';
import H1 from '../ui/H1';

interface Step1DateTimeProps {
  date: string;
  time: string;
  onChange: (field: 'date' | 'time', value: string) => void;
}

const Step1DateTime: React.FC<Step1DateTimeProps> = ({ date, time, onChange }) => {

  return (
    <div className="space-y-8 animate-[fade-in_0.6s_cubic-bezier(0.25,0.46,0.45,0.94)_forwards]">
      <div className="text-center mb-8">
        <img
          src="https://custodybuddy.com/incident-report/img/WhenIcon.png"
          alt="Clock and calendar icon"
          className="w-36 h-24 mx-auto mb-6 object-contain"
          aria-hidden="true"
        />
        <H1 className="text-3xl sm:text-4xl font-bold text-[#FFD700] mb-2">
          When did this incident occur?
        </H1>
        <p className="text-slate-400 max-w-md mx-auto">
          Capture a quick timestamp so the rest of the pages have context. These form controls keep
          the styling but purposely avoid any backend logic.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <div>
          <label htmlFor="date-input" className="block text-sm font-semibold text-slate-300 mb-2">
            Incident Date <span className="text-amber-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
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
                className="w-5 h-5 text-amber-400"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <input
              type="date"
              id="date-input"
              value={date}
              onChange={event => onChange('date', event.target.value)}
              className="[color-scheme:dark] w-full p-3 pl-10 bg-slate-800/50 border-2 rounded-xl transition-all duration-300 shadow-sm text-slate-200 focus:outline-none focus:ring-4 border-slate-600 focus:border-amber-400 focus:ring-amber-400/30 hover:border-amber-500"
            />
          </div>
        </div>
        <div>
          <label htmlFor="time-input" className="block text-sm font-semibold text-slate-300 mb-2">
            Incident Time <span className="text-amber-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
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
                className="w-5 h-5 text-amber-400"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <input
              type="time"
              id="time-input"
              value={time}
              onChange={event => onChange('time', event.target.value)}
              className="[color-scheme:dark] w-full p-3 pl-10 bg-slate-800/50 border-2 rounded-xl transition-all duration-300 shadow-sm text-slate-200 focus:outline-none focus:ring-4 border-slate-600 focus:border-amber-400 focus:ring-amber-400/30 hover:border-amber-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1DateTime;
