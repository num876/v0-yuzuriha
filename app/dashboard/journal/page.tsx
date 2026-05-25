'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useState } from 'react';

export default function JournalPage() {
  const [notes, setNotes] = useState([
    {
      id: 1,
      pair: 'BTC/USDT',
      date: '2024-01-05',
      content: 'Strong breakout above $45k resistance with good volume confirmation. Entry was clean at support. Exit at first target with 7.3% profit.',
    },
    {
      id: 2,
      pair: 'ETH/USDT',
      date: '2024-01-04',
      content: 'Countertrend trade against the main trend. Should have waited for confirmation. Lesson: stick to primary trend only.',
    },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState({ pair: '', content: '' });

  const handleAddNote = () => {
    if (newNote.pair && newNote.content) {
      setNotes([
        {
          id: notes.length + 1,
          pair: newNote.pair,
          date: new Date().toISOString().split('T')[0],
          content: newNote.content,
        },
        ...notes,
      ]);
      setNewNote({ pair: '', content: '' });
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Journal</h1>
          <p className="text-sm text-muted-foreground">Trade notes and analysis</p>
        </div>
        <Button
          onClick={() => setIsAdding(!isAdding)}
          className="btn-glow text-white border-0 gap-2"
        >
          <Plus className="h-4 w-4" />
          Add note
        </Button>
      </div>

      {/* Add Note Form */}
      {isAdding && (
        <div className="glass-card">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">Pair</label>
              <Input
                placeholder="BTC/USDT"
                value={newNote.pair}
                onChange={(e) => setNewNote({ ...newNote, pair: e.target.value })}
                className="w-full rounded-xl border border-[#1e1e3a]/50 bg-[#111128]/80 px-3 py-2.5 text-sm focus:border-[#8b5cf6]/50 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Note</label>
            <Textarea
              placeholder="Write your analysis and lessons learned..."
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              rows={4}
              className="w-full rounded-xl border border-[#1e1e3a]/50 bg-[#111128]/80 px-3 py-2.5 text-sm focus:border-[#8b5cf6]/50 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddNote} className="btn-glow text-white border-0">Save</Button>
            <Button variant="outline" onClick={() => setIsAdding(false)} className="border-[#1e1e3a] hover:bg-[#8b5cf6]/10 text-white">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className="space-y-3">
        {notes.map((note) => (
          <div key={note.id} className="glass-card card-hover-lift">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-mono font-bold text-lg">{note.pair}</h3>
                <p className="text-xs text-muted-foreground">{note.date}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setNotes(notes.filter(n => n.id !== note.id))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-foreground">{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
