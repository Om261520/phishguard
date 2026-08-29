import React, { useState } from 'react';
import { AnalystNote } from '../types';
import { notesService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FileText, Send, UserCheck, Clock } from 'lucide-react';
import { formatDateTime } from '../utils/formatters';

interface AnalystNotesCardProps {
  scanId: number;
  initialNotes: AnalystNote[];
  onNoteAdded?: (newNote: AnalystNote) => void;
}

export const AnalystNotesCard: React.FC<AnalystNotesCardProps> = ({
  scanId,
  initialNotes,
  onNoteAdded,
}) => {
  const { user, isAnalyst } = useAuth();
  const [notes, setNotes] = useState<AnalystNote[]>(initialNotes || []);
  const [noteText, setNoteText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const added = await notesService.addNote(scanId, noteText.trim());
      setNotes((prev) => [added, ...prev]);
      setNoteText('');
      if (onNoteAdded) onNoteAdded(added);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add note');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cyber-card p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Analyst Investigation Notes</h3>
            <p className="text-xs text-slate-400">Persistent SOC incident remarks and triage documentation</p>
          </div>
        </div>
        <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
          {notes.length} {notes.length === 1 ? 'Note' : 'Notes'}
        </span>
      </div>

      {/* Note input box (if analyst/admin) */}
      {isAnalyst ? (
        <form onSubmit={handleAddNote} className="space-y-2">
          <div className="relative">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Record forensic observations, mitigation steps, or domain block rationale..."
              rows={3}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/50 transition-all resize-none"
            />
          </div>

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !noteText.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-cyan-500/20"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? 'Recording...' : 'Submit Note'}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg text-xs text-slate-500 italic">
          Viewer account: You have read-only access to investigation notes. Log in as an Analyst to add notes.
        </div>
      )}

      {/* Note History List */}
      <div className="space-y-3 pt-2">
        {notes.length === 0 ? (
          <p className="text-xs text-slate-500 italic text-center py-4">
            No notes logged for this incident yet.
          </p>
        ) : (
          notes.map((n) => (
            <div
              key={n.id}
              className="p-3.5 bg-slate-900/70 border border-slate-800/80 rounded-lg space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                  {n.username}
                </span>
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDateTime(n.created_at)}
                </span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-sans">{n.note}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
