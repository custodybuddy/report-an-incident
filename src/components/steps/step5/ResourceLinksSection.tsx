import type { ReactNode } from 'react';
import H3 from '../../ui/H3';
import { ResourceLinkCard } from '../../ui/ResourceLinks';

export interface ResourceLinksSectionItem {
  key?: string;
  title: string;
  url: string;
  description?: string;
  metadata?: ReactNode;
  linkLabel?: string;
}

interface ResourceLinksSectionProps {
  title: string;
  items: ResourceLinksSectionItem[];
  emptyMessage: string;
}

const ResourceLinksSection = ({ title, items, emptyMessage }: ResourceLinksSectionProps) => (
  <section className="space-y-4">
    <H3 className="heading-gold text-xl font-normal border-b border-[#F4E883]/30 pb-1">{title}</H3>
    {items.length > 0 ? (
      <div className="space-y-4 text-[#CFCBBF]">
        {items.map((item, index) => (
          <ResourceLinkCard
            key={item.key ?? item.url}
            index={index}
            title={item.title}
            url={item.url}
            description={item.description}
            metadata={item.metadata}
            linkLabel={item.linkLabel}
          />
        ))}
      </div>
    ) : (
      <p className="text-sm text-[#CFCBBF]/80">{emptyMessage}</p>
    )}
  </section>
);

export default ResourceLinksSection;
