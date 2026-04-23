import React, { useState, useEffect } from 'react';
import { PenTool, Mic, Edit3, Download, Play, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function ContractsScreen({ 
  voiceRequestedContractParams 
}: { 
  voiceRequestedContractParams?: { partyNames?: string, governingLaw?: string, termLength?: string } | null;
}) {
  const [drafting, setDrafting] = useState(false);
  const [contractGenerated, setContractGenerated] = useState(false); 

  // Derived params for the display
  const [draftPrompt, setDraftPrompt] = useState(
    '"Draft a simple Non-Disclosure Agreement under Belgian Law with Horizon Tech. Duration is 2 years. Mutual confidentiality."'
  );

  const [dynamicLaw, setDynamicLaw] = useState('Belgique');
  const [dynamicDuration, setDynamicDuration] = useState('deux (2) ans');
  const [dynamicParty, setDynamicParty] = useState('Horizon Tech');

  useEffect(() => {
    if (voiceRequestedContractParams) {
      const { partyNames, governingLaw, termLength } = voiceRequestedContractParams;
      
      const newPrompt = `"Draft a Non-Disclosure Agreement. Parties: ${partyNames || 'Horizon Tech'}. Governing Law: ${governingLaw || 'Belgian'}. Term: ${termLength || '2 years'}."`;
      setDraftPrompt(newPrompt);
      
      if (partyNames) setDynamicParty(partyNames);
      if (governingLaw) setDynamicLaw(governingLaw);
      if (termLength) setDynamicDuration(termLength);

      setDrafting(true);
      setContractGenerated(false);
      setTimeout(() => {
        setDrafting(false);
        setContractGenerated(true);
      }, 4000);
    }
  }, [voiceRequestedContractParams]);

  const handleGenerate = () => {
    setDrafting(true);
    setTimeout(() => {
      setDrafting(false);
      setContractGenerated(true);
    }, 4000);
  };

  return (
    <div className="flex flex-col h-full px-4 pt-4 gap-6">
      <div className="flex items-center justify-between shrink-0">
        <h2 className="font-serif text-2xl tracking-tight text-white/90">Contracts</h2>
        <span className="text-[10px] uppercase tracking-wider text-rose-400/80 bg-rose-400/10 px-2 py-0.5 rounded-full border border-rose-400/20">Alpha Engine</span>
      </div>

      {!contractGenerated ? (
        <div className="flex flex-col gap-4 shrink-0">
          <div className="glass-panel rounded-2xl p-4 flex flex-col gap-4">
             <div className="flex items-center justify-between border-b border-white/10 pb-3">
               <h3 className="text-xs uppercase tracking-widest text-white/60">Dictate Terms</h3>
               <button className="w-8 h-8 rounded-full glass-panel-heavy flex items-center justify-center text-[#D4AF37] border-[#D4AF37]/30">
                 <Mic size={14} />
               </button>
             </div>
             
             <div className="flex flex-col gap-3">
               <div className="glass-panel-heavy rounded-lg p-3 text-sm text-white/80 font-light border-l-2 border-l-[#D4AF37]">
                 {draftPrompt}
               </div>
             </div>

             <button 
                onClick={handleGenerate}
                disabled={drafting}
                className="w-full mt-2 py-3 rounded-xl bg-[#D4AF37] text-black font-medium text-xs tracking-wide uppercase hover:bg-[#D4AF37]/90 transition-colors flex items-center justify-center gap-2"
              >
                {drafting ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                    <PenTool size={14} />
                  </motion.div>
                ) : (
                  <Play size={14} />
                )}
                <span>{drafting ? 'Drafting Clause by Clause...' : 'Generate Draft'}</span>
             </button>
          </div>
          
          <p className="text-[9px] text-white/40 text-center leading-relaxed px-4 uppercase tracking-widest shrink-0">
            Beatrice is a drafting assistant. Human legal review is recommended before execution.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 h-full shrink-0">
          <div className="flex items-center gap-2 shrink-0">
            <CheckCircle2 size={16} className="text-emerald-400 animate-pulse" />
            <span className="text-xs text-[#D4AF37] uppercase tracking-widest">Active Audit</span>
          </div>

          <div className="flex-1 glass-panel rounded-2xl p-5 border-[#D4AF37]/50 relative shrink-0 overflow-visible mb-6">
            <div className="font-serif text-white/90 leading-relaxed">
              <h1 className="text-xl mb-6 text-center">ACCORD DE CONFIDENTIALITÉ (NDA)</h1>
              
              <div className="text-xs space-y-4 font-light text-white/70">
                <p><strong>ENTRE LES SOUSSIGNÉS :</strong></p>
                <p>1. [Votre Société], inscrite à la BCE sous le numéro [Numéro], dont le siège social est situé à [Adresse]</p>
                <p>2. <strong>{dynamicParty}</strong>, inscrite à la BCE sous le numéro 849.204.192, dont le siège social est situé à Bruxelles.</p>
                
                <h2 className="text-sm font-medium mt-6 text-white/90">ARTICLE 1 : OBJET</h2>
                <p>Le présent Accord vise à protéger la confidentialité des informations échangées entre les Parties dans le cadre de leurs discussions relatives au projet Alpha.</p>
                
                <h2 className="text-sm font-medium mt-6 text-white/90">ARTICLE 2 : DURÉE</h2>
                <p>Les obligations de confidentialité prévues au présent Accord produiront leurs effets pendant une durée de <strong>{dynamicDuration}</strong> à compter de la date de signature effective par les deux parties prenantes.</p>
                
                <h2 className="text-sm font-medium mt-6 text-[#D4AF37]">ARTICLE 3 : DROIT APPLICABLE ({dynamicLaw})</h2>
                <p className="border-l-2 border-[#D4AF37] pl-3">Le présent Accord est exclusivement régi par le droit {dynamicLaw}. Tout litige relèvera de la compétence des tribunaux compétents.</p>

                <h2 className="text-sm font-medium mt-6 text-white/90">ARTICLE 4 : OBLIGATIONS</h2>
                <p>Chacune des parties s'engage expressément à faire respecter ces règles par ses employés et ses prestataires externes.</p>

                <h2 className="text-sm font-medium mt-6 text-white/90">ARTICLE 5 : RESTITUTION</h2>
                <p>En cas de rupture des négociations, les documents devront être détruits dans un délai de 30 jours calendaires.</p>

                <h2 className="text-sm font-medium mt-6 text-white/90">SIGNATURES</h2>
                <p className="mt-8 pt-8 border-t border-white/10">Fait en deux exemplaires originaux.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
