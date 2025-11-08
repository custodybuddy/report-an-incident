import React from 'react';

type MetadataBadgeVariant = 'outline' | 'subtle';

interface MetadataBadgeProps {
  children: React.ReactNode;
  variant?: MetadataBadgeVariant;
  className?: string;
}

const variantStyles: Record<MetadataBadgeVariant, string> = {
  outline:
    'rounded-full border border-[#F4E883] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#F4E883]',
  subtle:
    'rounded-full bg-white/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-[#FFD700]',
};

const MetadataBadge: React.FC<MetadataBadgeProps> = ({
  children,
  variant = 'outline',
  className = '',
}) => (
  <span className={`${variantStyles[variant]} ${className}`}>{children}</span>
);

export default MetadataBadge;
