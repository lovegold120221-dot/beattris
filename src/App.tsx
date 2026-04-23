import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Shell from './components/layout/Shell';
import TalkScreen from './screens/TalkScreen';
import DocsScreen from './screens/DocsScreen';
import AgendaScreen from './screens/AgendaScreen';
import MemoryScreen from './screens/MemoryScreen';
import ContractsScreen from './screens/ContractsScreen';
import AuthScreen from './screens/AuthScreen';
import { AuthProvider, useAuth } from './components/AuthProvider';

export type TabKey = 'talk' | 'docs' | 'agenda' | 'memory' | 'contracts';

function AppInner() {
  const [currentTab, setCurrentTab] = useState<TabKey>('talk');
  const { user } = useAuth();
  const [voiceRequestedTab, setVoiceRequestedTab] = useState<TabKey | null>(null);
  const [voiceRequestedDocPreview, setVoiceRequestedDocPreview] = useState<string | null>(null);
  const [voiceRequestedDocSearch, setVoiceRequestedDocSearch] = useState<string | null>(null);
  const [voiceRequestedContractParams, setVoiceRequestedContractParams] = useState<{partyNames?: string, governingLaw?: string, termLength?: string} | null>(null);
  const [voiceRequestedCalendarEvent, setVoiceRequestedCalendarEvent] = useState<{title?: string, startTimeIso?: string, endTimeIso?: string, attendees?: string} | null>(null);
  
  // Voice state for global UI overlay
  const [isVoiceConnected, setIsVoiceConnected] = useState(false);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState(false);

  // When voice agent requests a tab via function call
  useEffect(() => {
    if (voiceRequestedTab && voiceRequestedTab !== currentTab) {
      setCurrentTab(voiceRequestedTab);
    }
  }, [voiceRequestedTab, currentTab]);

  if (!user) {
    return <AuthScreen />;
  }

  const renderScreen = () => {
    switch (currentTab) {
      case 'docs': return <DocsScreen voiceRequestedDocPreview={voiceRequestedDocPreview} voiceRequestedDocSearch={voiceRequestedDocSearch} />;
      case 'agenda': return <AgendaScreen voiceRequestedCalendarEvent={voiceRequestedCalendarEvent} />;
      case 'memory': return <MemoryScreen />;
      case 'contracts': return <ContractsScreen voiceRequestedContractParams={voiceRequestedContractParams} />;
      default: return null;
    }
  };

  return (
    <>
      <Shell currentTab={currentTab} onTabChange={setCurrentTab}>
        <div className={`${currentTab === 'talk' ? 'relative z-10 block' : 'absolute inset-0 opacity-0 pointer-events-none z-0'} h-full w-full transition-opacity duration-300`}>
          <TalkScreen 
            setVoiceRequestedTab={setVoiceRequestedTab} 
            setVoiceRequestedDocPreview={setVoiceRequestedDocPreview}
            setVoiceRequestedDocSearch={setVoiceRequestedDocSearch}
            setVoiceRequestedContractParams={setVoiceRequestedContractParams}
            setVoiceRequestedCalendarEvent={setVoiceRequestedCalendarEvent}
            onConnectionChange={setIsVoiceConnected}
            onSpeakingChange={setIsVoiceSpeaking}
          />
        </div>
        {currentTab !== 'talk' && (
          <div className="relative z-10 h-full w-full bg-[#0A0A0B]">
            {renderScreen()}
          </div>
        )}
      </Shell>
      
      {/* Floating Global Orb when connected and not on Talk screen */}
      <AnimatePresence>
        {isVoiceConnected && currentTab !== 'talk' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-24 right-4 z-50 pointer-events-none"
          >
            <div 
              onClick={() => setCurrentTab('talk')}
              className="relative flex items-center justify-center p-2 cursor-pointer pointer-events-auto group"
            >
              <div className="absolute w-16 h-16 bg-[#D4AF37]/20 rounded-full blur-xl group-hover:bg-[#D4AF37]/30 transition-colors"></div>
              <div className="w-12 h-12 rounded-full border border-[#D4AF37]/50 bg-black/80 backdrop-blur flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                <div className="w-full h-full rounded-full flex items-center justify-center relative overflow-hidden">
                   <motion.div 
                     animate={{ 
                       rotate: isVoiceSpeaking ? -360 : 360,
                       scale: isVoiceSpeaking ? [1, 1.2, 1, 1.1, 1] : [1, 1.05, 1]
                     }}
                     transition={{ repeat: Infinity, duration: isVoiceSpeaking ? 1.5 : 4, ease: "easeInOut" }}
                     className="w-10 h-10 rounded-full border border-[#D4AF37] border-t-transparent opacity-80"
                   />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <div className="min-h-screen w-full bg-[#0A0A0B] flex items-center justify-center font-sans text-white">
      <div className="w-[375px] h-[667px] max-h-screen bg-[#000000] md:rounded-[50px] md:border-[8px] border-[#1C1C1E] relative overflow-hidden md:shadow-2xl flex flex-col mx-auto">
        <AuthProvider>
          <AppInner />
        </AuthProvider>
      </div>
    </div>
  );
}
