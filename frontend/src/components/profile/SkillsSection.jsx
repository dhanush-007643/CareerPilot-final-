// SkillsSection — tag-based skill manager (Enter or comma to add, × to remove)
import React, { useState } from 'react';
import { Zap, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const POPULAR = ['React', 'Node.js', 'Python', 'MongoDB', 'TypeScript', 'Java', 'SQL', 'AWS', 'Docker'];

export default function SkillsSection({ skills = [], onSave, saving }) {
  const [tags,  setTags]  = useState(skills);
  const [input, setInput] = useState('');
  const [dirty, setDirty] = useState(false);

  const addTag = (val) => {
    const tag = val.trim();
    if (!tag) return;
    if (tags.includes(tag)) { toast.error('Skill already added'); return; }
    setTags(prev => [...prev, tag]);
    setInput('');
    setDirty(true);
  };

  const removeTag = (tag) => {
    setTags(prev => prev.filter(t => t !== tag));
    setDirty(true);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(input); }
  };

  const handleSave = async () => {
    await onSave({ skills: tags });
    setDirty(false);
    toast.success('Skills saved!');
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-black text-white flex items-center gap-2">
          <Zap size={16} className="text-yellow-400" /> Skills
          <span className="text-xs font-normal text-slate-500">({tags.length})</span>
        </h3>
        {dirty && (
          <button onClick={handleSave} disabled={saving}
            className="text-xs font-bold bg-blue-500 hover:bg-blue-400 text-white px-3 py-1.5 rounded-lg transition-all disabled:opacity-60 flex items-center gap-1">
            Save Changes
          </button>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 mb-4">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a skill and press Enter…"
          className="cp-input flex-1 text-sm"
        />
        <button onClick={() => addTag(input)}
          className="px-3 py-2 bg-blue-500/15 border border-blue-500/30 rounded-xl text-blue-400 hover:bg-blue-500/25 transition-all">
          <Plus size={16} />
        </button>
      </div>

      {/* Popular suggestions */}
      <div className="flex flex-wrap gap-2 mb-4">
        {POPULAR.filter(s => !tags.includes(s)).slice(0, 6).map(s => (
          <button key={s} onClick={() => addTag(s)}
            className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:border-blue-500/40 hover:text-blue-400 transition-all">
            + {s}
          </button>
        ))}
      </div>

      {/* Tag cloud */}
      {tags.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-slate-600">
          <Zap size={32} className="mb-2 opacity-30" />
          <p className="text-sm">No skills added yet</p>
          <p className="text-xs mt-1">Type above or pick from suggestions</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {tags.map(tag => (
              <motion.span key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/12 border border-blue-500/25 rounded-lg text-blue-300 text-xs font-bold">
                {tag}
                <button onClick={() => removeTag(tag)} className="text-blue-400/60 hover:text-red-400 transition-colors">
                  <X size={11} />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
