import React from 'react';
import Button from '../../ui/Button';
import H3 from '../../ui/H3';
import OutlineCard from './OutlineCard';

interface ShareActionsCardProps {
  onExport: () => void;
  onPrint: () => void;
}

const ShareActionsCard: React.FC<ShareActionsCardProps> = ({ onExport, onPrint }) => (
  <OutlineCard backgroundClassName="bg-[#021223]" className="space-y-4">
    <div>
      <H3 className="heading-gold text-xl font-normal">Share &amp; Store</H3>
      <p className="text-sm text-[#CFCBBF]/85">
        Export a printable package or open the browser print dialog to save a PDF copy.
      </p>
    </div>
    <div className="flex flex-col gap-3">
      <Button onClick={onExport} className="justify-center">
        Export HTML Report
      </Button>
      <Button variant="secondary" onClick={onPrint} className="justify-center">
        Print / Save PDF
      </Button>
    </div>
    <p className="text-xs text-[#CFCBBF]/70">
      Files remain local to this device until you export or print. Always secure sensitive data before sharing.
    </p>
  </OutlineCard>
);

export default ShareActionsCard;
