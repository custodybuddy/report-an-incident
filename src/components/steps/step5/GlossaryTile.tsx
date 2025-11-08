export interface GlossaryEntry {
  title: string;
  description: string;
}

const GlossaryTile = ({ title, description }: GlossaryEntry) => (
  <div className="rounded-2xl border border-[#F4E883]/40 bg-[#021223] p-3 shadow-inner shadow-black/20">
    <strong className="heading-gold block text-base font-normal">{title}</strong>
    <p className="text-sm text-[#CFCBBF]/90">{description}</p>
  </div>
);

export default GlossaryTile;
