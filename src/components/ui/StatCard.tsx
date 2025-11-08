import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  accentClassName?: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  accentClassName = 'text-[#FFD700]',
  className = '',
}) => (
  <div
    className={`rounded-2xl border border-[#F4E883]/60 bg-[#01192C] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.45)] ${className}`}
  >
    <p className={`heading-gold text-xs font-normal uppercase tracking-[0.3em] ${accentClassName}`}>
      {label}
    </p>
    <p className="mt-2 text-lg text-[#CFCBBF]">{value}</p>
  </div>
);

export default StatCard;
