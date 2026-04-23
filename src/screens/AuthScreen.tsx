import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export default function AuthScreen() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        localStorage.setItem('beatrice_google_access_token', credential.accessToken);
      }
      
      if (result.user) {
        setDisplayName(result.user.displayName || '');
        setPhotoURL(result.user.photoURL || '');
        setAuthSuccess(true);
      }
      
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('auth/unauthorized-domain')) {
         setError('ACTION REQUIRED: Add this domain to Firebase Authorized Domains in your console.');
      } else {
         setError(err.message || 'Failed to authenticate');
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black relative items-center justify-center p-6 text-[#f5f5f7] overflow-hidden font-sans">
      {/* Ambient Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-[#48319D]/10 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#0A84FF]/10 rounded-full blur-[100px]"></div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[320px] bg-[#1E1E20]/65 backdrop-blur-[25px] rounded-[24px] p-10 border border-white/10 shadow-[0_24px_48px_rgba(0,0,0,0.4)] relative z-10 text-center"
      >
        <AnimatePresence mode="wait">
          {!authSuccess ? (
            <motion.div
              key="auth-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="mb-6 opacity-90">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              
              <h1 className="text-2xl font-semibold tracking-tight mb-2">Workspace Sync</h1>
              <p className="text-[14px] text-[#86868b] leading-relaxed mb-8 px-2">
                Connect your account to enable Mail, Drive, Calendar, and YouTube sync.
              </p>

              <div className="flex flex-col w-full gap-4">
                <button 
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="w-full bg-white/5 border border-white/10 text-[#f5f5f7] rounded-full py-3.5 text-[15px] font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-sm active:scale-95"
                >
                  {!loading ? (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Sign in with Google
                    </>
                  ) : (
                    <Loader2 size={18} className="animate-spin text-white/40" />
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-6 text-red-400 text-[10px] text-center leading-relaxed bg-red-500/10 p-3 rounded-lg border border-red-500/10">
                  {error}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="auth-success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              <img 
                src={photoURL} 
                alt="Profile" 
                className="w-16 h-16 rounded-full mb-6 border-2 border-white/20 shadow-xl"
                onError={(e) => { (e.target as any).style.display = 'none'; }}
              />
              <h1 className="text-xl font-semibold mb-1">Welcome, {displayName.split(' ')[0]}</h1>
              <p className="text-[#32d74b] text-[14px] font-medium">Workspace synced successfully.</p>
              <p className="mt-2 text-[12px] text-[#86868b]">All requested permissions granted.</p>
              
              <div className="mt-8 w-12 h-12 rounded-full border-2 border-white/5 border-t-[#D4AF37] animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
