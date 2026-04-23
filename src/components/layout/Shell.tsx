import React, { ReactNode, useEffect, useRef, useState } from 'react';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import { TabKey } from '../../App';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Activity } from 'lucide-react';

interface ShellProps {
  children: ReactNode;
  currentTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

const getTaskMessage = (tab: TabKey) => {
  switch (tab) {
    case 'docs': return "Cross-referencing Drive files...";
    case 'agenda': return "Synchronizing calendar events...";
    case 'memory': return "Analyzing context patterns...";
    case 'contracts': return "Auditing legal clauses...";
    default: return "Awaiting input...";
  }
};

export default function Shell({ children, currentTab, onTabChange }: ShellProps) {
  const scrollRef = useRef<HTMLElement>(null);
  const [taskMsg, setTaskMsg] = useState('');

  // Autonomous Smooth Scrolling Logic
  useEffect(() => {
    if (currentTab === 'talk') return; // Don't auto-scroll the main talk screen
    
    let animationFrameId: number;
    let direction = 1;

    setTaskMsg(getTaskMessage(currentTab));

    const scrollLoop = () => {
      if (scrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        
        // Smoothly scroll down
        scrollRef.current.scrollTop += direction * 0.4;
        
        // Reverse slightly if hit bottom, but primary goal is scanning down
        if (scrollTop + clientHeight >= scrollHeight - 5) {
          direction = -1;
        } else if (scrollTop <= 0) {
          direction = 1;
        }
      }
      animationFrameId = requestAnimationFrame(scrollLoop);
    };

    // Reset scroll when tab changes
    if (scrollRef.current) {
       scrollRef.current.scrollTop = 0;
    }

    animationFrameId = requestAnimationFrame(scrollLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [currentTab]);

  return (
    <div className="w-full h-full flex flex-col absolute inset-0">
      <div className="absolute top-0 left-0 right-0 z-20">
        <TopBar />
      </div>
      
      {/* Simulation Working Overlay */}
      {currentTab !== 'talk' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none w-[90%]">
          <motion.div 
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-[#D4AF37]/90 backdrop-blur-md rounded-full py-1.5 px-4 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)] border border-[#D4AF37]"
          >
             <Activity size={10} className="text-black animate-pulse" />
             <span className="text-[9px] uppercase tracking-widest text-black font-bold whitespace-nowrap">
               {taskMsg}
             </span>
             <Loader2 size={10} className="text-black animate-spin" />
          </motion.div>
        </div>
      )}

      {/* Autonomous Scanner Laser */}
      {currentTab !== 'talk' && (
        <motion.div 
          className="absolute left-0 right-0 h-px bg-[#D4AF37]/50 shadow-[0_0_8px_rgba(212,175,55,0.8)] z-30 pointer-events-none"
          animate={{
            top: ["15%", "85%", "15%"]
          }}
          transition={{
            duration: 3,
            ease: "linear",
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      )}

      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto hide-scrollbar pt-[88px] pb-20 relative z-10 w-full px-6 flex flex-col"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full min-h-full pb-8 flex flex-col"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <div className="absolute bottom-0 left-0 right-0 z-20">
        <BottomNav currentTab={currentTab} onTabChange={onTabChange} />
      </div>
      
      {/* Home indicator bar (iOS flair) */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full z-30 pointer-events-none"></div>
    </div>
  );
}
