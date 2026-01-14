import React, { useEffect, useRef } from 'react';
import H3 from '../../ui/H3';
import OutlineCard from './OutlineCard';
import { NOTES_MIN_HEIGHT } from './constants';

interface PersonalNotesSectionProps {
  notes: string;
  onNotesChange: (value: string) => void;
}

const PersonalNotesSection: React.FC<PersonalNotesSectionProps> = ({ notes, onNotesChange }) => {
  const notesRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = notesRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.max(textarea.scrollHeight, NOTES_MIN_HEIGHT)}px`;
  }, [notes]);

  return (
    <OutlineCard>
      <H3 className="heading-gold text-xl font-normal">Personal Notes (Private)</H3>
      <p className="mt-1 text-xs text-[#CFCBBF]/70">
        These notes remain local to this browser session and are never exported.
      </p>
      <textarea
        ref={notesRef}
        id="personal-notes"
        value={notes}
        onChange={event => onNotesChange(event.target.value)}
        placeholder="Capture follow-up actions, reminders, or attorney questions…"
        className="mt-4 w-full resize-none rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-[#CFCBBF] outline-none transition focus:border-[#F4E883] focus:ring-4 focus:ring-[#F4E883]/30 placeholder:text-[#CFCBBF]/40"
        style={{ minHeight: NOTES_MIN_HEIGHT }}
      />
    </OutlineCard>
  );
};

export default PersonalNotesSection;
