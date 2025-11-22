import React, { memo } from 'react';
import { SITE_LINKS } from '../config/links';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const links = [
    { name: 'Privacy Policy', url: SITE_LINKS.privacy },
    { name: 'Terms of Service', url: SITE_LINKS.terms },
    { name: 'Legal Disclaimer', url: SITE_LINKS.disclaimer },
    { name: 'Contact Us', url: SITE_LINKS.contact }
  ];

  return (
    <footer className="mt-16 py-8 border-t border-slate-800/50">
      <div className="max-w-5xl mx-auto px-6 text-center text-slate-500">
        <nav className="flex justify-center flex-wrap gap-x-6 gap-y-2 mb-4">
          {links.map((link) => (
            <a 
              key={link.name} 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm hover:text-amber-400 transition-colors duration-200"
            >
              {link.name}
            </a>
          ))}
        </nav>
        <p className="text-xs">
          © {currentYear} CustodyBuddy. All Rights Reserved. This tool is for informational purposes and does not constitute legal advice.
        </p>
      </div>
    </footer>
  );
};

export default memo(Footer);
