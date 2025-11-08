import React, { type ChangeEventHandler, type RefObject } from 'react';
import OutlineCard from '../../../ui/OutlineCard';
import H3 from '../../../ui/H3';

interface PersonalNotesSectionProps {
  notesRef: RefObject<HTMLTextAreaElement>;
  value: string;
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
  minHeight: number;
}

const PersonalNotesSection: React.FC<PersonalNotesSectionProps> = ({
  notesRef,
  value,
  onChange,
  minHeight,
}) => (
  <OutlineCard>
    <H3 className="heading-gold text-xl font-normal">Personal Notes (Private)</H3>
    <p className="mt-1 text-xs text-[#CFCBBF]/70">
      These notes remain local to this browser session and are never exported.
    </p>
    <textarea
      ref={notesRef}
      id="personal-notes"
      value={value}
      onChange={onChange}
      placeholder="Capture follow-up actions, reminders, or attorney questions…"
      className="mt-4 w-full resize-none rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-[#CFCBBF] outline-none transition focus:border-[#F4E883] focus:ring-4 focus:ring-[#F4E883]/30 placeholder:text-[#CFCBBF]/40"
      style={{ minHeight }}
    />
  </OutlineCard>
);

export default PersonalNotesSection;
