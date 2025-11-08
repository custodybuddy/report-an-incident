import React from 'react';
import H3 from '../../ui/H3';
import OutlineCard from './OutlineCard';

const SessionSecurityCard: React.FC = () => (
  <OutlineCard>
    <H3 className="heading-gold text-xl font-normal">Session Security</H3>
    <p className="text-sm text-[#CFCBBF]/90">
      This workspace encrypts data locally and purges it when you reset the incident or close the tab.
    </p>
    <ul className="list-disc space-y-2 pl-5 text-sm text-[#CFCBBF]/85">
      <li>Keep exported files on encrypted or access-controlled drives.</li>
      <li>Only share reports with counsel or professionals bound by confidentiality.</li>
      <li>Delete temporary downloads after you deliver them.</li>
    </ul>
  </OutlineCard>
);

export default SessionSecurityCard;
