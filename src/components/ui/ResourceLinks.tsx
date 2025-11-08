import React from 'react';

export interface ResourceLinkItem {
  title: string;
  url: string;
  description?: string;
  metadata?: React.ReactNode;
  index?: number;
  linkLabel?: string;
}

interface ResourceLinkListItem {
  title: string;
  url: string;
  description?: string;
}

interface ResourceLinkListProps {
  items: ResourceLinkListItem[];
  emptyMessage?: string;
}

export const ResourceLinkCard: React.FC<ResourceLinkItem> = ({
  title,
  url,
  description,
  metadata,
  index,
  linkLabel = 'Source URL',
}) => (
  <div className="rounded-2xl border border-[#F4E883]/40 bg-[#021223] p-4 shadow-lg shadow-black/30">
    <strong className="heading-gold block text-base font-normal">
      {typeof index === 'number' ? `${index + 1}. ` : ''}
      {title}
    </strong>
    {metadata ? <p className="text-xs text-[#CFCBBF]/70">{metadata}</p> : null}
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs text-[#FFD700] hover:text-[#F4E883] focus-visible:outline-[#F4E883] focus-visible:outline-offset-2"
    >
      {linkLabel}: {url}
    </a>
    {description ? <p className="text-sm mt-2 text-[#CFCBBF]/90">{description}</p> : null}
  </div>
);

export const ResourceLinkList: React.FC<ResourceLinkListProps> = ({ items, emptyMessage }) => {
  if (items.length === 0) {
    return emptyMessage ? (
      <p className="text-sm text-[#CFCBBF]/80">{emptyMessage}</p>
    ) : null;
  }

  return (
    <ul className="list-disc space-y-3 pl-5 text-sm text-[#CFCBBF]">
      {items.map(item => (
        <li key={item.url} className="space-y-1">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#FFD700] hover:text-[#F4E883] focus-visible:outline-[#F4E883] focus-visible:outline-offset-2"
          >
            {item.title}
          </a>
          {item.description ? (
            <p className="text-xs text-[#CFCBBF]/70 italic">{item.description}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
};
