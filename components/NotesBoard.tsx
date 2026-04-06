import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pin, Trash2, Plus, StickyNote, X } from 'lucide-react';
import { Note } from '../types';

interface NotesBoardProps {
  notes: Note[];
  onAddNote: (content: string, color: string) => void;
  onDeleteNote: (id: string) => void;
  onTogglePinNote: (id: string) => void;
}

const COLORS = [
  'bg-amber-100 border-amber-200 text-amber-900',
  'bg-blue-100 border-blue-200 text-blue-900',
  'bg-emerald-100 border-emerald-200 text-emerald-900',
  'bg-rose-100 border-rose-200 text-rose-900',
  'bg-purple-100 border-purple-200 text-purple-900',
  'bg-indigo-100 border-indigo-200 text-indigo-900',
];

const NotesBoard: React.FC<NotesBoardProps> = ({ notes, onAddNote, onDeleteNote, onTogglePinNote }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newContent.trim()) {
      onAddNote(newContent.trim(), selectedColor);
      setNewContent('');
      setIsAdding(false);
    }
  };

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 p-8 flex flex-col group overflow-hidden relative hover:shadow-2xl transition-all duration-500 h-full">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50/50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center text-2xl shadow-xl shadow-amber-100 border border-amber-400 group-hover:rotate-3 transition-transform">
            📝
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase leading-none">Notes Board</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Live Institutional Updates</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-amber-600 transition-all shadow-xl active:scale-90"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 relative z-10 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-50 p-6 rounded-[2rem] border-2 border-dashed border-slate-200"
            >
              <form onSubmit={handleSubmit}>
                <textarea
                  autoFocus
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Write a quick note..."
                  className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-700 placeholder:text-slate-400 resize-none h-24"
                />
                <div className="flex items-center justify-between mt-4">
                  <div className="flex gap-2">
                    {COLORS.map((color, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${color.split(' ')[0]} ${selectedColor === color ? 'border-slate-900 scale-110' : 'border-transparent hover:scale-105'}`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X size={20} />
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-600 transition-all"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}

          {sortedNotes.length > 0 ? (
            sortedNotes.map((note) => (
              <motion.div
                layout
                key={note.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`${note.color} p-6 rounded-[2rem] border shadow-sm hover:shadow-md transition-all relative group/note`}
              >
                <div className="flex justify-between items-start gap-4">
                  <p className="text-sm font-bold leading-relaxed flex-1">{note.content}</p>
                  <div className="flex flex-col gap-2 opacity-0 group-hover/note:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onTogglePinNote(note.id)}
                      className={`p-1.5 rounded-lg transition-all ${note.isPinned ? 'bg-slate-900 text-white' : 'hover:bg-black/5'}`}
                    >
                      <Pin size={14} className={note.isPinned ? 'fill-current' : ''} />
                    </button>
                    <button 
                      onClick={() => onDeleteNote(note.id)}
                      className="p-1.5 hover:bg-rose-500 hover:text-white rounded-lg transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[8px] font-black uppercase tracking-widest opacity-40">
                    {new Date(note.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                  </span>
                  {note.isPinned && (
                    <span className="text-[8px] font-black uppercase tracking-widest bg-black/5 px-2 py-0.5 rounded-full">
                      Pinned
                    </span>
                  )}
                </div>
              </motion.div>
            ))
          ) : !isAdding && (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 py-12">
              <StickyNote size={48} strokeWidth={1} className="mb-4 opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">No notes yet</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default NotesBoard;
