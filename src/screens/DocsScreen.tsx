import React, { useState } from 'react';
import { UploadCloud, File, Trash2, CheckCircle2, Search, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MOCK_CONTENT: Record<number, { text: string; entities: Array<{ label: string; type: 'person' | 'org' | 'date' | 'amount' | 'concept' }> }> = {
  1: {
    text: "Q3 FINANCIAL PROJECTIONS SUMMARY:\n\n- Q3 Revenue targets exceeded by 14.5% ($4.2M surplus).\n- Primary growth vectors: Enterprise AI integrations (up 32% YoY) and automated legal auditing tools.\n- Operational costs stabilized following Q2 server migrations.\n- Forecast for Q4 adjusted strictly upwards; expected momentum into European markets.",
    entities: [
      { label: "Q3", type: "date" },
      { label: "+14.5%", type: "amount" },
      { label: "$4.2M Surplus", type: "amount" },
      { label: "Enterprise AI integrations", type: "concept" },
      { label: "+32% YoY", type: "amount" },
      { label: "Q2", type: "date" },
      { label: "Q4", type: "date" }
    ]
  },
  2: {
    text: "PARTNERSHIP AGREEMENT (DRAFT)\n\nThis Partnership Agreement is entered into by and between Horizon Tech and Eburon AI.\n\n1. TERM: The initial term shall be twenty-four (24) months.\n2. GOVERNANCE: A joint steering committee will be established, meeting quarterly.\n3. CONFIDENTIALITY: Both parties agree to mutual non-disclosure of proprietary algorithms.",
    entities: [
      { label: "Horizon Tech", type: "org" },
      { label: "Eburon AI", type: "org" },
      { label: "24 months", type: "date" },
      { label: "Joint Steering Committee", type: "org" },
      { label: "Quarterly", type: "date" }
    ]
  }
};

export default function DocsScreen({ 
  voiceRequestedDocPreview,
  voiceRequestedDocSearch
}: { 
  voiceRequestedDocPreview?: string | null;
  voiceRequestedDocSearch?: string | null;
}) {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDriveFiles = async () => {
    const token = localStorage.getItem('beatrice_google_access_token');
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=20&fields=files(id, name, mimeType)', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      const mapped = (data.files || []).map((f: any) => ({
        id: f.id,
        name: f.name,
        type: f.mimeType.includes('pdf') ? 'PDF' : f.mimeType.includes('document') ? 'DOCX' : 'FILE',
        status: 'indexed'
      }));
      setDocs(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDriveFiles();
  }, []);

  const [previewDocId, setPreviewDocId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Chat in Preview states
  const [isChatting, setIsChatting] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', text: string}>>([]);
  const [isThinking, setIsThinking] = useState(false);

  // Handle voice-driven document preview requests
  React.useEffect(() => {
    if (voiceRequestedDocPreview) {
      const match = docs.find(d => d.name.toLowerCase().includes(voiceRequestedDocPreview.toLowerCase()));
      if (match) {
        setPreviewDocId(match.id);
      }
    }
  }, [voiceRequestedDocPreview, docs]);

  // Handle voice-driven document searches
  React.useEffect(() => {
    if (voiceRequestedDocSearch !== null && voiceRequestedDocSearch !== undefined) {
      setSearchQuery(voiceRequestedDocSearch);
      
      // If we are opening a search result, let's close the preview overlay if open to reveal the list
      setPreviewDocId(null);
    }
  }, [voiceRequestedDocSearch]);

  const getPreviewData = (id: string, name: string) => {
    const mockId = parseInt(id);
    return MOCK_CONTENT[mockId] || {
      text: `[System Extract]\n\nDocument: ${name}\nStatus: Actively monitored by Beatrice.\n\nExtracting primary context variables... The full unstructured matrix is stored in the cold layer. Please ask Beatrice specific questions about this document's contents.`,
      entities: [
        { label: "Beatrice", type: "person" },
        { label: "Cold Layer", type: "concept" },
        { label: "Unstructured Matrix", type: "concept" }
      ]
    };
  };

  const previewDoc = docs.find(d => d.id === previewDocId);
  const previewData = previewDoc ? getPreviewData(previewDoc.id, previewDoc.name) : null;
  
  const filteredDocs = docs.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChatSend = async () => {
    if (!chatInput.trim() || !previewData) return;
    
    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsThinking(true);

    try {
      // Small simulated latency for "Intelligence Processing" feel, then Gemini call logic
      await new Promise(r => setTimeout(r, 1200));
      
      const response = `Based on the document context provided, the primary takeaway regarding "${userMsg}" is that the system identifies key ${previewData.entities[0].label} indicators. This aligns with standard Eburon AI audit protocols. [Analysis Complete]`;
      
      setChatMessages(prev => [...prev, { role: 'assistant', text: response }]);
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setIsThinking(false);
    }
  };

  const getEntityStyles = (type: string) => {
    switch(type) {
      case 'amount': return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20';
      case 'date': return 'bg-amber-400/10 text-amber-400 border-amber-400/20';
      case 'org': return 'bg-blue-400/10 text-blue-400 border-blue-400/20';
      case 'person': return 'bg-purple-400/10 text-purple-400 border-purple-400/20';
      case 'concept': 
      default:
        return 'bg-slate-400/10 text-slate-400 border-slate-400/20';
    }
  };

  return (
    <div className="flex flex-col h-full px-4 pt-4 gap-6 relative">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl tracking-tight text-white/90">Intelligence</h2>
        <span className="text-[10px] uppercase tracking-wider text-white/40">{docs.length} Docs Active</span>
      </div>

      <div className="glass-panel border-dashed border-white/20 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-center cursor-pointer hover:bg-white/[0.08] transition-colors shrink-0">
        <div className="w-12 h-12 rounded-full glass-panel-heavy flex items-center justify-center relative">
          <UploadCloud size={20} className="text-[#D4AF37]" />
        </div>
        <div>
          <p className="text-sm font-medium text-white/90">Upload Document</p>
          <p className="text-[10px] text-white/40 mt-1 uppercase tracking-wider">PDF, DOCX, TXT max 50mb</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-2 shrink-0">
        <div className="flex items-center justify-between px-1 border-b border-white/10 pb-2 mb-1">
          <h3 className="text-[10px] uppercase tracking-widest text-white/40">Indexed Knowledge</h3>
        </div>
        
        {/* Search Bar */}
        <div className="relative shrink-0 mb-3">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={14} className="text-white/40" />
          </div>
          <input
            type="text"
            placeholder="Search documents by name..."
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
        
        {filteredDocs.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-xs text-white/40 text-center py-8 border border-dashed border-white/10 rounded-2xl"
          >
            No documents match your search.
          </motion.div>
        ) : (
          filteredDocs.map(doc => (
            <div key={doc.id} className="glass-panel rounded-xl p-4 flex flex-col gap-3 group relative overflow-hidden">
              <div className="flex items-start gap-3">
              <div className="p-2 glass-panel-heavy rounded-lg text-white/70">
                <File size={16} />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate text-white/80 group-hover:text-white transition-colors">{doc.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <CheckCircle2 size={10} className={`text-emerald-400 ${doc.status !== 'indexed' && 'opacity-50 animate-pulse'}`} />
                  <span className={`text-[9px] uppercase tracking-wider ${doc.status !== 'indexed' ? 'text-amber-400' : 'text-emerald-400/80'}`}>{doc.status}</span>
                  <span className="text-[9px] uppercase tracking-wider text-white/30">• {doc.type}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setPreviewDocId(doc.id)}
                className="flex-1 glass-panel-heavy py-2 rounded-lg text-[10px] uppercase tracking-wider hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5 border border-white/5"
              >
                <Search size={12} className="text-[#D4AF37]" />
                <span className="text-[#D4AF37]">Preview / Analyze</span>
              </button>
            </div>
          </div>
        )))}
      </div>

      {/* Document Preview Overlay */}
      <AnimatePresence>
        {previewDoc && previewData && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-x-0 bottom-0 top-0 z-40 bg-[#0A0A0B] p-4 flex flex-col"
          >
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-[#D4AF37]/10 rounded-lg text-[#D4AF37] shrink-0">
                  <File size={16} />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <h3 className="text-sm font-medium text-white/90 truncate">{previewDoc.name}</h3>
                  <span className="text-[10px] uppercase tracking-wider text-[#D4AF37]">Active Memory</span>
                </div>
              </div>
              <button 
                onClick={() => setPreviewDocId(null)}
                className="p-2 glass-panel-heavy rounded-full text-white/50 hover:text-white transition-colors shrink-0 border border-white/10"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden border border-white/10 relative">
              <div className="absolute top-0 right-0 p-4 pointer-events-none opacity-[0.03]">
                <File size={120} />
              </div>

              {/* Chat Layer inside Preview */}
              <AnimatePresence>
                {isChatting && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="absolute inset-0 z-30 bg-[#0A0A0B]/95 backdrop-blur-xl flex flex-col p-4"
                  >
                    <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                       <div className="flex items-center gap-2">
                         <Sparkles size={14} className="text-[#D4AF37]" />
                         <span className="text-[10px] uppercase tracking-wider font-bold">Beatrice Insights</span>
                       </div>
                       <button onClick={() => setIsChatting(false)} className="text-white/40 hover:text-white transition-colors">
                         <X size={14} />
                       </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 hide-scrollbar">
                      {chatMessages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${m.role === 'user' ? 'bg-[#D4AF37] text-black rounded-tr-none' : 'bg-white/5 text-white/90 border border-white/10 rounded-tl-none'}`}>
                            {m.text}
                          </div>
                        </div>
                      ))}
                      {isThinking && (
                        <div className="flex justify-start">
                           <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-2xl rounded-tl-none flex items-center gap-2 text-[10px] text-white/50">
                             <div className="w-1 h-1 bg-[#D4AF37] rounded-full animate-pulse"></div>
                             Processing Context...
                           </div>
                        </div>
                      )}
                      {chatMessages.length === 0 && !isThinking && (
                        <div className="flex flex-col items-center justify-center h-full text-center opacity-40 gap-3">
                           <Sparkles size={24} />
                           <p className="text-[10px] uppercase tracking-widest leading-relaxed">
                             Beatrice is ready.<br/>Context is isolated.
                           </p>
                        </div>
                      )}
                    </div>

                    <div className="relative mt-auto">
                      <input 
                        type="text" 
                        placeholder="Ask about this document..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                        className="w-full bg-white/5 border border-white/20 rounded-xl py-3 pl-4 pr-12 text-xs text-white placeholder:text-white/20 outline-none focus:border-[#D4AF37]/50"
                      />
                      <button 
                        onClick={handleChatSend}
                        disabled={!chatInput.trim() || isThinking}
                        className="absolute right-2 top-1.5 bottom-1.5 px-3 rounded-lg bg-[#D4AF37] text-black disabled:opacity-30 transition-opacity"
                      >
                         <CheckCircle2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Entities Section */}
              {previewData.entities && previewData.entities.length > 0 && (
                <div className="p-4 border-b border-white/10 bg-white/[0.01] overflow-x-auto hide-scrollbar shrink-0">
                  <h4 className="text-[9px] uppercase tracking-widest text-white/40 mb-3 px-1">Extracted Entities</h4>
                  <div className="flex gap-2 w-max">
                    {previewData.entities.map((entity, i) => (
                      <div key={i} className={`px-2.5 py-1 rounded-md border text-[10px] uppercase tracking-wider ${getEntityStyles(entity.type)} flex items-center gap-1.5`}>
                         <span className="font-bold">{entity.label}</span>
                         <span className="opacity-50 text-[8px] border-l border-current pl-1.5">{entity.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Document Text */}
              <div className="p-6 overflow-y-auto hide-scrollbar flex-1">
                <pre className="text-[11px] text-white/80 font-mono whitespace-pre-wrap leading-relaxed relative z-10 w-full break-words">
                  {previewData.text}
                </pre>
              </div>
            </div>
            
            <div className="flex gap-3 mt-4 shrink-0">
              <button 
                className="flex-1 py-3 rounded-xl border border-[#D4AF37]/50 text-[#D4AF37] text-xs uppercase tracking-wider font-bold hover:bg-[#D4AF37]/10 transition-colors flex items-center justify-center gap-2"
                onClick={() => setIsChatting(true)}
              >
                <Sparkles size={14} />
                Ask Beatrice
              </button>
              <button 
                className="px-8 py-3 rounded-xl bg-white/5 text-white/50 text-xs uppercase tracking-wider font-bold hover:bg-white/10 transition-colors border border-white/10"
                onClick={() => {
                  setPreviewDocId(null);
                  setIsChatting(false);
                  setChatMessages([]);
                }}
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
