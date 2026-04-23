import React, { useState } from 'react';
import { Brain, Trash2, Plus, Sparkles, Database, FileText, Search, X, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMemories, MemoryType } from '../hooks/useMemories';

export default function MemoryScreen() {
  const { memories, loading, addMemory, removeMemory } = useMemories();
  const [filter, setFilter] = useState<'all' | MemoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | '7d' | '30d'>('all');
  
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<MemoryType>('fact');
  const [isAdding, setIsAdding] = useState(false);
  
  // State for delete confirmation
  const [memoryToDelete, setMemoryToDelete] = useState<string | null>(null);
  
  // Suggestions state
  const [suggestions, setSuggestions] = useState<Array<{id: string, content: string, type: MemoryType, source: string}>>([
    { id: 's1', content: "Maneer Jo prefers governing law to be Belgium for European partnerships.", type: 'preference', source: 'Recent Contract Draft' },
    { id: 's2', content: "NDA term length standard is 3 years for new tech alliances.", type: 'fact', source: 'Document Analysis' }
  ]);

  const handleAddFromSuggestion = async (id: string, content: string, type: MemoryType) => {
    try {
      await addMemory(content, type);
      setSuggestions(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error("Failed to add suggested memory:", error);
    }
  };

  const filters: { id: 'all' | MemoryType, label: string }[] = [
    { id: 'all', label: 'All Context' },
    { id: 'fact', label: 'Facts' },
    { id: 'preference', label: 'Preferences' },
    { id: 'summary', label: 'Summaries' },
  ];

  const getTypeIcon = (type: MemoryType) => {
    switch (type) {
      case 'preference': return <Sparkles size={12} className="text-[#D4AF37]" />;
      case 'fact': return <Database size={12} className="text-blue-400" />;
      case 'summary': return <FileText size={12} className="text-emerald-400" />;
    }
  };

  const getTypeStyles = (type: MemoryType) => {
    switch (type) {
      case 'preference': return {
        bg: 'bg-[#D4AF37]/5',
        border: 'border-[#D4AF37]/20 group-hover:border-[#D4AF37]/40',
        text: 'text-[#D4AF37]',
        badge: 'bg-[#D4AF37]/10 text-[#D4AF37]'
      };
      case 'fact': return {
        bg: 'bg-blue-400/5',
        border: 'border-blue-400/20 group-hover:border-blue-400/40',
        text: 'text-blue-400',
        badge: 'bg-blue-400/10 text-blue-400'
      };
      case 'summary': return {
        bg: 'bg-emerald-400/5',
        border: 'border-emerald-400/20 group-hover:border-emerald-400/40',
        text: 'text-emerald-400',
        badge: 'bg-emerald-400/10 text-emerald-400'
      };
    }
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    try {
      setIsAdding(true);
      await addMemory(newContent.trim(), newType);
      setNewContent('');
    } catch (error) {
      console.error("Failed to add memory:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const filteredMemories = memories.filter(m => {
    // Type filter
    if (filter !== 'all' && m.type !== filter) return false;
    
    // Search query filter
    if (searchQuery && !m.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - m.createdAt.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (dateFilter === '7d' && diffDays > 7) return false;
      if (dateFilter === '30d' && diffDays > 30) return false;
    }
    
    return true;
  });

  return (
    <div className="flex flex-col h-full px-4 pt-4 pb-20 gap-6 overflow-y-auto hide-scrollbar relative">
      <div className="flex items-center justify-between shrink-0">
        <h2 className="font-serif text-2xl tracking-tight text-white/90">Memory</h2>
        <span className="text-[10px] uppercase tracking-wider text-white/40 flex items-center gap-1">
          <Brain size={12} /> {memories.length} Stored
        </span>
      </div>

      <div className="flex flex-col gap-3 shrink-0">
        {/* Advanced Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={14} className="text-white/40" />
          </div>
          <input
            type="text"
            placeholder="Search memory contents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-8 text-sm font-medium text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-col gap-2">
          {/* Main Type Filters */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {filters.map((f) => (
              <button 
                key={f.id} 
                onClick={() => setFilter(f.id)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-wider border transition-colors ${filter === f.id ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10' : 'border-white/10 text-white/50 glass-panel hover:bg-white/5'}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Date Range Filters */}
          <div className="flex gap-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none opacity-50">
               <Calendar size={10} className="text-white" />
            </div>
            <div className="flex gap-2 pl-8 overflow-x-auto hide-scrollbar pb-1">
              {[
                { id: 'all', label: 'Any Time' },
                { id: '7d', label: 'Last 7 Days' },
                { id: '30d', label: 'Last 30 Days' }
              ].map((df) => (
                <button
                  key={df.id}
                  onClick={() => setDateFilter(df.id as 'all' | '7d' | '30d')}
                  className={`shrink-0 px-3 py-1 rounded-md text-[9px] uppercase tracking-wider transition-colors ${dateFilter === df.id ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/60 bg-white/5'}`}
                >
                  {df.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Memory Form */}
      <form onSubmit={handleAddMemory} className="glass-panel p-3 rounded-2xl flex flex-col gap-3 shrink-0 border border-white/10">
        <div className="flex gap-2">
          {['fact', 'preference', 'summary'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setNewType(t as MemoryType)}
              className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-widest border transition-colors ${newType === t ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10' : 'border-transparent text-white/40 hover:text-white/60 bg-white/5'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-end">
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Add new context to memory..."
            className="flex-1 bg-transparent text-sm text-white/90 placeholder-white/30 resize-none outline-none max-h-32 min-h-[40px]"
            rows={2}
          />
          <button 
            type="submit" 
            disabled={!newContent.trim() || isAdding}
            className="shrink-0 w-8 h-8 rounded-full bg-[#D4AF37] text-black flex items-center justify-center disabled:opacity-50 disabled:bg-white/10 disabled:text-white/30 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </form>

      {/* Suggestions Section */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col gap-3 shrink-0"
          >
            <div className="flex items-center gap-2 px-1">
               <Sparkles size={14} className="text-[#D4AF37]" />
               <h3 className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold">Intelligence Insights</h3>
            </div>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar py-1">
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="min-w-[260px] glass-panel-heavy rounded-2xl p-4 border border-[#D4AF37]/30 flex flex-col gap-3 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                     <Brain size={40} className="text-[#D4AF37]" />
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-[8px] uppercase tracking-wider text-white/40 bg-white/5 px-2 py-0.5 rounded-full">Source: {suggestion.source}</span>
                     <button onClick={() => setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))} className="text-white/20 hover:text-white transition-colors">
                       <X size={12} />
                     </button>
                   </div>
                   <p className="text-xs font-serif text-white/80 leading-relaxed italic border-l-2 border-[#D4AF37]/40 pl-3">
                     "{suggestion.content}"
                   </p>
                   <button 
                    onClick={() => handleAddFromSuggestion(suggestion.id, suggestion.content, suggestion.type)}
                    className="w-full py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-xl text-[9px] uppercase tracking-widest text-[#D4AF37] font-bold hover:bg-[#D4AF37] hover:text-black transition-all"
                   >
                     Commit to Memory
                   </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Memory List */}
      <div className="flex flex-col gap-4">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-white/40 text-center py-4">
              Accessing core memory...
            </motion.p>
          ) : filteredMemories.length === 0 ? (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-white/40 text-center py-8 border border-dashed border-white/10 rounded-2xl">
              No matching memories found.
            </motion.p>
          ) : (
            filteredMemories.map((memory) => {
              const styles = getTypeStyles(memory.type);
              return (
                <motion.div 
                  key={memory.id}
                  layout
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`backdrop-blur-xl rounded-2xl p-4 flex flex-col gap-3 group relative border transition-colors ${styles.bg} ${styles.border}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className={`flex items-center gap-2 px-2 py-1 rounded-md ${styles.badge}`}>
                      {getTypeIcon(memory.type)}
                      <h3 className={`text-[9px] uppercase tracking-widest font-bold ${styles.text}`}>
                        {memory.type}
                      </h3>
                    </div>
                    <button 
                      onClick={() => setMemoryToDelete(memory.id)}
                      className="opacity-0 group-hover:opacity-100 text-rose-400 hover:bg-rose-400/10 p-1.5 rounded-full transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <p className="text-sm font-serif leading-relaxed text-white/90 whitespace-pre-wrap">
                    {memory.content}
                  </p>
                  <div className="flex items-center justify-between mt-1 pt-3 border-t border-white/5">
                    <span className="text-[9px] text-white/30 uppercase tracking-wider">
                      {memory.createdAt.toLocaleDateString()} {memory.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {memoryToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#0A0A0B]/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              className="bg-[#111112] border border-white/10 rounded-2xl p-6 flex flex-col max-w-sm w-full gap-5 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-400/10 flex items-center justify-center text-rose-400 shrink-0">
                  <Trash2 size={20} />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-sm font-medium text-white/90">Delete Memory</h3>
                  <p className="text-[10px] uppercase tracking-wider text-rose-400/80">Permanent Action</p>
                </div>
              </div>
              
              <p className="text-xs text-white/60 font-light leading-relaxed mb-1">
                Are you sure you want to permanently erase this memory from Beatrice's context window?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setMemoryToDelete(null)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 transition-colors text-xs font-medium uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (memoryToDelete) {
                      removeMemory(memoryToDelete);
                      setMemoryToDelete(null);
                    }
                  }}
                  className="flex-1 py-3 rounded-xl bg-rose-400/20 text-rose-400 hover:bg-rose-400/30 transition-colors text-xs font-bold uppercase tracking-wider"
                >
                  Erase
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
