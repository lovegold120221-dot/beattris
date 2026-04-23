import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Users, ArrowRight, MessageCircle, Plus, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AgendaScreen({ 
  voiceRequestedCalendarEvent 
}: { 
  voiceRequestedCalendarEvent?: { title?: string, startTimeIso?: string, endTimeIso?: string, attendees?: string } | null;
}) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const fetchCalendarEvents = async () => {
    const token = localStorage.getItem('beatrice_google_access_token');
    if (!token) {
      setLoading(false);
      setError('Please connect your Google account to sync your agenda.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch events from now until the end of the day
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now.toISOString()}&timeMax=${endOfDay.toISOString()}&singleEvents=true&orderBy=startTime`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Your session has expired. Please sign in again.');
        }
        throw new Error('Failed to fetch calendar events.');
      }

      const data = await response.json();
      const mappedEvents = (data.items || []).map((item: any) => ({
        id: item.id,
        title: item.summary,
        timeDisplay: item.start.dateTime 
          ? new Date(item.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'All Day',
        startTime: item.start.dateTime ? new Date(item.start.dateTime) : null,
        attendees: item.attendees ? item.attendees.map((a: any) => a.displayName || a.email).join(', ') : 'No attendees',
        raw: item
      }));
      setEvents(mappedEvents);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarEvents();
  }, []);

  useEffect(() => {
    if (voiceRequestedCalendarEvent && voiceRequestedCalendarEvent.title) {
      setSyncing(true);
      
      const token = localStorage.getItem('beatrice_google_access_token');
      if (token && voiceRequestedCalendarEvent.startTimeIso && voiceRequestedCalendarEvent.endTimeIso) {
        fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            summary: voiceRequestedCalendarEvent.title,
            start: { dateTime: voiceRequestedCalendarEvent.startTimeIso },
            end: { dateTime: voiceRequestedCalendarEvent.endTimeIso },
            attendees: voiceRequestedCalendarEvent.attendees ? voiceRequestedCalendarEvent.attendees.split(',').map(email => ({ email: email.trim() })) : []
          })
        }).then(res => res.json())
          .then(() => {
            // Refetch after a small delay to allow for propagation
            setTimeout(fetchCalendarEvents, 1000);
          })
          .catch(err => console.error('Failed to sync to GC', err))
          .finally(() => setSyncing(false));
      } else {
        // Fallback: still show locally even if sync fails
        const newEvent = {
          id: Math.random().toString(36).substr(2, 9),
          title: voiceRequestedCalendarEvent.title,
          timeDisplay: voiceRequestedCalendarEvent.startTimeIso 
            ? new Date(voiceRequestedCalendarEvent.startTimeIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            : 'Pending Time',
          attendees: voiceRequestedCalendarEvent.attendees || 'No attendees specified',
          isNew: true
        };
        setEvents(prev => [newEvent, ...prev]);
        setSyncing(false);
      }
    }
  }, [voiceRequestedCalendarEvent]);

  const upNext = events.length > 0 ? events[0] : null;
  const remainingEvents = events.length > 1 ? events.slice(1) : (events.length === 1 ? [] : []);

  return (
    <div className="flex flex-col h-full px-4 pt-4 gap-6 overflow-y-auto hide-scrollbar pb-20">
      <div className="flex items-center justify-between shrink-0">
        <h2 className="font-serif text-2xl tracking-tight text-white/90">Agenda</h2>
        <div className="flex items-center gap-2">
          {syncing && <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><Clock size={12} className="text-[#D4AF37]" /></motion.span>}
          <span className="text-[10px] uppercase tracking-wider text-[#D4AF37]">
            {new Date().toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
            <Clock size={32} />
          </motion.div>
          <span className="text-xs uppercase tracking-widest">Accessing records...</span>
        </div>
      ) : error ? (
        <div className="glass-panel rounded-3xl p-8 text-center border-white/5">
          <p className="text-sm text-white/60 mb-6">{error}</p>
          <button 
            onClick={fetchCalendarEvents}
            className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold border border-[#D4AF37]/30 px-6 py-2 rounded-full hover:bg-[#D4AF37]/10 transition-colors"
          >
            Retry Sync
          </button>
        </div>
      ) : events.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border-white/5 flex flex-col items-center opacity-40">
           <CalendarIcon size={48} className="mb-4 text-white/20" />
           <p className="text-sm font-light">No events scheduled for the remainder of today.</p>
        </div>
      ) : (
        <>
          {/* Up Next Card */}
          {upNext && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel-heavy rounded-3xl p-6 relative overflow-hidden border-[#D4AF37]/20 shrink-0"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <CalendarIcon size={100} />
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
                <span className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-medium">Up Next</span>
              </div>
              
              <h3 className="font-serif text-2xl leading-tight mb-2">{upNext.title}</h3>
              
              <div className="flex flex-col gap-2 mb-6">
                <div className="flex items-center gap-2 text-white/60">
                  <Clock size={12} />
                  <span className="text-xs font-light tracking-wide">{upNext.timeDisplay}</span>
                </div>
                {upNext.attendees && upNext.attendees !== 'No attendees' && (
                  <div className="flex items-center gap-2 text-white/60">
                    <Users size={12} />
                    <span className="text-xs font-light tracking-wide truncate max-w-[200px]">{upNext.attendees}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-white/50 leading-relaxed font-light mb-4">
                  Beatrice notes: I've cross-referenced your recent notes. You might want to review the previous minutes before joining.
                </p>
                <button className="w-full glass-panel py-3 rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-white/10 transition-colors border-white/5 text-[#D4AF37]">
                  <MessageCircle size={14} />
                  <span>"Prepare me for this meeting"</span>
                </button>
              </div>
            </motion.div>
          )}

          {remainingEvents.length > 0 && (
            <>
              <div className="flex items-center justify-between mt-2 px-1 border-b border-white/10 pb-2 mb-1 shrink-0">
                <h3 className="text-[10px] uppercase tracking-widest text-white/40">Upcoming</h3>
              </div>

              {/* Timeline */}
              <div className="flex flex-col gap-0 relative shrink-0">
                <div className="absolute left-[15px] top-4 bottom-4 w-px bg-white/10" />
                
                <AnimatePresence mode="popLayout">
                  {remainingEvents.map((evt, idx) => (
                    <motion.div 
                      key={evt.id}
                      layout
                      initial={{ opacity: 0, x: -20, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-4 relative py-3"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
                        evt.isNew ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'glass-panel text-white/50 border-white/20'
                      }`}>
                        {evt.isNew ? <CheckCircle2 size={12} /> : <span className="text-[9px]">{evt.timeDisplay.split(':')[0]}h</span>}
                      </div>
                      <div className={`flex-1 rounded-xl p-4 transition-colors ${
                        evt.isNew ? 'glass-panel-heavy border-[#D4AF37]/50 border' : 'glass-panel'
                      }`}>
                        <h4 className="text-sm font-medium mb-1">{evt.title}</h4>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-white/40 font-light truncate flex-1 pr-2">{evt.attendees}</span>
                          <span className="text-[10px] text-white/30 uppercase tracking-widest shrink-0">{evt.timeDisplay}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
