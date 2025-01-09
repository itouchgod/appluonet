import { QuotationData } from '@/types/quotation';

interface NotesSectionProps {
  data: QuotationData;
  onChange: (data: QuotationData) => void;
}

export function NotesSection({ data, onChange }: NotesSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Notes:</h3>
        <button
          type="button"
          onClick={() => {
            onChange({
              ...data,
              notes: [...data.notes, '']
            });
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
          <div key={index} className="flex items-start gap-2">
            <div 
              className="mt-2 text-sm text-gray-400 dark:text-gray-500 w-6 flex-shrink-0 text-center
                hover:text-red-500 dark:hover:text-red-400 cursor-pointer transition-colors"
              onClick={() => {
                const newNotes = [...data.notes];
                newNotes.splice(index, 1);
                onChange({
                  ...data,
                  notes: newNotes
                });
              }}
              title="Click to delete"
            >
              {index + 1}.
            </div>
            <div className="flex-1">
              <textarea
                value={note}
                onChange={(e) => {
                  const newNotes = [...data.notes];
                  newNotes[index] = e.target.value;
                  onChange({
                    ...data,
                    notes: newNotes
                  });
                }}
                className="w-full px-3 py-2 rounded-xl
                  bg-transparent backdrop-blur-sm
                  border border-transparent
                  focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 dark:focus:ring-[#0A84FF]/20
                  text-[14px] leading-relaxed text-gray-800 dark:text-gray-100
                  placeholder:text-gray-400/60 dark:placeholder:text-gray-500/60
                  transition-all duration-300 ease-out
                  hover:bg-[#007AFF]/5 dark:hover:bg-[#0A84FF]/5
                  resize-none overflow-hidden"
                rows={1}
                style={{
                  height: 'auto',
                  minHeight: '32px'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = target.scrollHeight + 'px';
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 