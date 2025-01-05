import type { QuotationData } from '@/types/quotation';

interface NotesSectionProps {
  data: QuotationData;
  onChange: (data: QuotationData) => void;
}

const inputClassName = `w-full px-3 py-1.5 rounded-lg
  bg-white/60 dark:bg-[#1c1c1e]/60
  border border-transparent
  focus:outline-none focus:ring-1 focus:ring-[#007AFF]/30 dark:focus:ring-[#0A84FF]/30
  text-sm text-gray-700 dark:text-gray-300
  placeholder:text-gray-400/70 dark:placeholder:text-gray-500/70
  transition-all duration-200`;

export function NotesSection({ data, onChange }: NotesSectionProps) {
  const updateNote = (index: number, value: string) => {
    const newNotes = [...data.notes];
    newNotes[index] = value;
    onChange({ ...data, notes: newNotes });
  };

  const removeNote = (index: number) => {
    onChange({
      ...data,
      notes: data.notes.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-2.5 
      bg-gray-50/50 dark:bg-[#1c1c1e]/50
      rounded-xl p-4 
      border border-gray-200/30 dark:border-[#2c2c2e]/50">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[15px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Notes:</div>
        <button
          type="button"
          onClick={() => {
            const newNotes = [...data.notes];
            newNotes.push('');
            onChange({ ...data, notes: newNotes });
          }}
          className="px-3 h-7 rounded-lg
            bg-[#007AFF]/[0.08] dark:bg-[#0A84FF]/[0.08]
            hover:bg-[#007AFF]/[0.12] dark:hover:bg-[#0A84FF]/[0.12]
            text-[#007AFF] dark:text-[#0A84FF]
            text-[13px] font-medium
            flex items-center gap-1
            transition-all duration-200"
        >
          <span className="text-lg leading-none translate-y-[-1px]">+</span>
          <span>Add Note</span>
        </button>
      </div>
      <div className="space-y-2">
        {data.notes.map((note, index) => (
          <div key={index} className="flex items-center gap-2">
            <span 
              className="flex items-center justify-center w-6 h-6 rounded-full 
                text-xs text-gray-400
                hover:bg-red-100 hover:text-red-600 
                cursor-pointer transition-colors"
              onClick={() => removeNote(index)}
              title="Click to delete"
            >
              {index + 1}
            </span>
            <input
              type="text"
              value={note}
              onChange={e => updateNote(index, e.target.value)}
              className={inputClassName}
            />
          </div>
        ))}
      </div>
    </div>
  );
} 