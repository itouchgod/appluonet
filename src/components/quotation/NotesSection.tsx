import { QuotationData } from '@/types/quotation';
import { useEffect, useRef } from 'react';

interface NotesSectionProps {
  data: QuotationData;
  onChange: (data: QuotationData) => void;
}

export function NotesSection({ data, onChange }: NotesSectionProps) {
  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

  const adjustHeight = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = '0';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  useEffect(() => {
    textareaRefs.current.forEach(textarea => {
      if (textarea) {
        adjustHeight(textarea);
      }
    });
  }, [data.notes]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Notes:</h3>
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
            active:bg-[#007AFF]/[0.18] dark:active:bg-[#0A84FF]/[0.18]
            text-[#007AFF] dark:text-[#0A84FF]
            text-[13px] font-medium
            flex items-center gap-1.5
            transition-all duration-200"
        >
          <span className="text-lg leading-none translate-y-[-1px]">+</span>
          <span>Add Note</span>
        </button>
      </div>

      <div className="space-y-3">
        {data.notes.map((note, index) => (
          <div key={index} className="flex items-start gap-3 group">
            <div 
              className="mt-[11px] text-[13px] font-medium text-[#86868B] dark:text-[#98989D] w-5 flex-shrink-0 text-center
                group-hover:text-[#007AFF] dark:group-hover:text-[#0A84FF]
                cursor-default select-none transition-colors duration-200"
            >
              {index + 1}.
            </div>
            <div className="flex-1 relative group">
              <textarea
                ref={(el: HTMLTextAreaElement | null) => { textareaRefs.current[index] = el; }}
                value={note}
                onChange={(e) => {
                  const newNotes = [...data.notes];
                  newNotes[index] = e.target.value;
                  onChange({
                    ...data,
                    notes: newNotes
                  });
                  adjustHeight(e.target);
                }}
                className="w-full px-4 py-2.5 rounded-xl
                  bg-transparent
                  border border-transparent
                  focus:outline-none focus:ring-[3px] focus:ring-[#007AFF]/20 dark:focus:ring-[#0A84FF]/20
                  text-[15px] leading-[1.4] tracking-[-0.01em]
                  text-[#1D1D1F] dark:text-[#F5F5F7]
                  placeholder:text-[#86868B] dark:placeholder:text-[#98989D]
                  transition-all duration-200
                  hover:bg-[#F5F5F7]/50 dark:hover:bg-[#2C2C2E]/50
                  resize-none whitespace-pre-wrap break-words"
                rows={1}
                style={{
                  height: 'auto',
                  minHeight: '41px',
                  overflow: 'hidden',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word'
                }}
                onInput={(e) => {
                  adjustHeight(e.target as HTMLTextAreaElement);
                }}
              />
              <div 
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-all duration-200
                  cursor-pointer p-1.5 rounded-lg 
                  hover:bg-[#FF3B30]/10 dark:hover:bg-[#FF453A]/10
                  active:bg-[#FF3B30]/20 dark:active:bg-[#FF453A]/20"
                onClick={() => {
                  const newNotes = [...data.notes];
                  newNotes.splice(index, 1);
                  onChange({
                    ...data,
                    notes: newNotes
                  });
                }}
                title="Delete note"
              >
                <svg className="w-4 h-4 text-[#FF3B30] dark:text-[#FF453A]" 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 