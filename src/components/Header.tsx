import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-black/40 backdrop-blur-md shadow-2xl border-b border-white/10 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative w-12 h-12 bg-slate-800/50 border border-amber-400/30 rounded-xl flex items-center justify-center shadow-2xl transform hover:rotate-6 transition-transform duration-500">
              <img
                src="https://custodybuddy.com/incident-report/img/ReportIncidentIcon.png"
                alt="Incident Report Icon"
                className="w-7 h-7 object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-black text-amber-400 tracking-tight">
                Report An Incident: <span className="text-white">Catch Them&nbsp;Red-Handed.</span>
              </h1>
              <p className="text-xs text-slate-300 mt-1 font-medium hidden sm:block">
                Transform toxic behavior into court-ready evidence with guided documentation.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <a href="https://custodybuddy.com/" className="text-white hover:text-amber-400 transition font-medium">Home</a>
            <a href="https://custodybuddy.com/contact/" className="text-white hover:text-amber-400 transition font-medium">Contact</a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
