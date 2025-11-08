import React from 'react';

interface OutlineCardProps {
  children: React.ReactNode;
  className?: string;
  borderClassName?: string;
  backgroundClassName?: string;
}

const OutlineCard: React.FC<OutlineCardProps> = ({
  children,
  className = '',
  borderClassName = 'border-[#F4E883]',
  backgroundClassName = 'bg-[#01192C]',
}) => (
  <div
    className={`rounded-3xl border ${borderClassName} ${backgroundClassName} p-6 shadow-[0_20px_45px_rgba(0,0,0,0.45)] ${className}`}
  >
    {children}
  </div>
);

export default OutlineCard;
