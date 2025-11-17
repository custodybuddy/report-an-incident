import React from 'react';
import H1 from './ui/H1';
import { SITE_LINKS } from '../config/links';

interface HeaderProps {
  onCreateNewReport: () => void;
}

const navLinks = [
  { href: SITE_LINKS.home, label: 'Home' },
  { href: SITE_LINKS.contact, label: 'Contact' },
];

const Header: React.FC<HeaderProps> = ({ onCreateNewReport }) => {
  return (
    <header className="bg-black/40 backdrop-blur-md shadow-2xl border-b border-white/10 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="relative w-12 h-12 bg-slate-800/50 border border-amber-400/30 rounded-xl flex items-center justify-center shadow-2xl transform hover:rotate-6 transition-transform duration-500">
              <img
                src="https://custodybuddy.com/incident-report/img/ReportIncidentIcon.png"
                alt="Incident Report Icon"
                className="w-7 h-7 object-contain"
              />
            </div>
            <div>
              <H1 className="!text-left text-lg sm:text-xl font-black tracking-tight text-[#FFD700]">
                Report An Incident:{' '}
                <span className="text-white font-raleway font-medium">Catch Them&nbsp;Red-Handed.</span>
              </H1>
              <p className="text-xs text-slate-300 mt-1 font-medium hidden sm:block">
                Transform toxic behavior into court-ready evidence with guided documentation.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3 md:gap-4">
            <nav aria-label="Primary" className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 text-sm font-semibold">
              {navLinks.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="relative inline-flex items-center rounded-lg px-3 py-1.5 text-slate-100/90 transition-colors duration-200 hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  {label}
                </a>
              ))}
            </nav>
            <button
              type="button"
              onClick={onCreateNewReport}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-400/60 bg-amber-400 px-4 py-2 text-sm font-semibold tracking-wide text-black shadow-lg transition-transform duration-200 hover:-translate-y-0.5 hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
            >
              Create New Report
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
