import { useEffect, useState, useRef } from 'react';
import QRCode from 'react-qr-code';
import Barcode from 'react-barcode';
import { Shield, Phone, Mail, Calendar, AlertCircle, Lock, ShieldCheck } from 'lucide-react';
import { PressCardData } from '../types';
import { cn, formatDate } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface PressCardUIProps {
  card: PressCardData;
}

export default function PressCardUI({ card }: PressCardUIProps) {
  const [isBlurred, setIsBlurred] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Anti-Screenshot logic
  useEffect(() => {
    const handleBlur = () => setIsBlurred(true);
    const handleFocus = () => setIsBlurred(false);

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const isExpired = new Date(card.expiryDate) < new Date();
  const isNearExpiry = !isExpired && (new Date(card.expiryDate).getTime() - new Date().getTime()) < 30 * 24 * 60 * 60 * 1000;

  return (
    <div 
      className="relative group perspective-1000 max-w-sm mx-auto select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
        {/* Expiry Warning */}
        {(isExpired || isNearExpiry) && (
          <div className={cn(
            "mb-4 p-3 rounded-lg flex items-center gap-2 text-sm font-medium animate-pulse z-[60]",
            isExpired ? "bg-red-50 text-red-700 border border-red-200" : "bg-amber-50 text-amber-700 border border-amber-200"
          )}>
            <AlertCircle size={16} />
            <span>
              {isExpired ? "KARTU SUDAH KEDALUWARSA" : "Masa berlaku akan habis segera"}
            </span>
          </div>
        )}

        {/* Dynamic Watermark (Moving) - Now more visible for deterrent */}
        <div className="absolute inset-0 pointer-events-none z-[55] overflow-hidden rounded-2xl">
          <motion.div 
            animate={{ 
              x: [-200, 200],
              y: [-100, 300, -100],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute whitespace-nowrap text-white/10 font-mono text-[10px] font-black uppercase tracking-[0.5em] bg-red-500/10 px-2 py-1 rounded"
          >
            VALID ID • {card.nia} • {new Date().toLocaleTimeString()} • SCAN TO VERIFY
          </motion.div>
        </div>

      {/* The Physical Card Container */}
      <div 
        ref={cardRef}
        className={cn(
          "relative w-full aspect-[2/3] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl p-6 overflow-hidden border border-slate-700 transition-all duration-500 select-none",
          isBlurred && "blur-xl grayscale opacity-50 contrast-50",
          "print:hidden" // Hide on print to prevent easy copying
        )}
      >
        {/* Anti-Copy Overlay (Watermark Grid) */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.07] rotate-[-25deg] flex flex-wrap gap-x-8 gap-y-12 items-center justify-center scale-150 overflow-hidden z-20">
          {Array.from({ length: 60 }).map((_, i) => (
            <span key={i} className="text-white text-[8px] font-black whitespace-nowrap uppercase tracking-tighter">
              {card.organization} INTERNAL ONLY • DO NOT SCREENSHOT
            </span>
          ))}
        </div>

        {/* Header */}
        <div className="relative flex justify-between items-start mb-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <h2 className="text-white font-bold text-base leading-tight tracking-tighter">
                {card.organization}
              </h2>
              <div className="bg-blue-500 rounded-full p-0.5" title="Terverifikasi JMSI">
                <ShieldCheck size={10} className="text-white" />
              </div>
            </div>
            <span className="text-blue-400 text-xs font-mono tracking-widest flex items-center gap-1">
              <Shield size={10} /> DIGITAL PRESS ID
            </span>
          </div>
          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
             <Shield className="text-blue-400" />
          </div>
        </div>

        {/* Photo Section */}
        <div className="relative flex flex-col items-center mb-4">
          <div className="relative">
             <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-slate-700 shadow-inner bg-slate-800 flex items-center justify-center">
                {card.photoUrl ? (
                  <img 
                    src={card.photoUrl} 
                    alt={card.name} 
                    className={cn("w-full h-full object-cover brightness-100", isExpired && "sepia opacity-60")}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(card.name)}&background=1e293b&color=fff&size=512`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-slate-800 flex flex-col items-center justify-center text-slate-500">
                    <Shield size={32} className="mb-0.5 opacity-20" />
                    <span className="text-[9px] font-bold opacity-30">NO PHOTO</span>
                  </div>
                )}
             </div>
             {/* Security Seal */}
             <div className="absolute -bottom-2 -right-2 bg-blue-600 p-2 rounded-full border-2 border-slate-800 shadow-lg">
                <Lock size={16} className="text-white" />
             </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="flex flex-col items-center text-center mb-4">
          <h1 className="text-white font-bold text-lg mb-0.5 uppercase tracking-tight">
            {card.name}
          </h1>
          <p className="text-blue-400 font-bold text-[11px] mb-3 uppercase tracking-wider">
            {card.position}
          </p>
          
          <div className="w-full bg-white/5 rounded-xl p-3 border border-white/10 text-[10px] space-y-1.5">
            <div className="flex justify-between items-center text-slate-400">
              <span className="flex items-center gap-1.5 font-bold text-[8px] uppercase tracking-wider"><Lock size={10} className="text-blue-500" /> ID MEMBER</span>
              <span className="text-white font-mono">{card.nia}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span className="flex items-center gap-1.5 font-bold text-[8px] uppercase tracking-wider"><Shield size={10} className="text-blue-500" /> JABATAN</span>
              <span className="text-white font-medium uppercase">{card.position}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span className="flex items-center gap-1.5 font-bold text-[8px] uppercase tracking-wider"><Shield size={10} className="text-blue-500" /> WILAYAH</span>
              <span className="text-white font-medium uppercase">{card.region}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span className="flex items-center gap-1.5 font-bold text-[8px] uppercase tracking-wider"><AlertCircle size={10} className="text-blue-500" /> STATUS</span>
              <span className={cn("px-1.5 py-0.5 rounded text-[8px] font-bold uppercase", 
                String(card.status || '').toLowerCase() === 'aktif' ? "bg-green-500/20 text-green-400 border border-green-500/20" : "bg-red-500/20 text-red-400 border border-red-500/20"
              )}>
                {card.status || 'Aktif'}
              </span>
            </div>
            {card.description && (
              <div className="pt-1.5 border-t border-white/10 mt-1.5">
                <p className="text-slate-500 text-[8px] uppercase font-bold text-left mb-0.5">Keterangan:</p>
                <p className="text-white text-left leading-tight line-clamp-2">{card.description}</p>
              </div>
            )}
            <div className="pt-2 border-t border-white/10 mt-2 flex justify-center">
              <p className="text-blue-400 font-bold text-[10px] tracking-widest">https://tintainformasi.com</p>
            </div>
          </div>
        </div>

        {/* Auth Codes */}
        <div className="flex justify-between items-center mt-auto bg-white p-3 rounded-xl gap-2">
           <div className="flex flex-col items-center gap-1">
              {card.nia ? (
                <div className="bg-white p-1 rounded shadow-sm">
                  <QRCode 
                    value="https://tintainformasi.com/" 
                    size={48} 
                    style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                  />
                </div>
              ) : (
                <div className="w-[48px] h-[48px] bg-slate-100 flex items-center justify-center rounded text-[8px] text-slate-400">N/A</div>
              )}
              <span className="text-[7px] text-slate-500 font-extrabold tracking-tighter uppercase">Verify ID</span>
           </div>
           <div className="flex-1 flex flex-col items-center justify-center min-h-[48px] px-1 overflow-hidden">
              {card.nia ? (
                <div className="scale-[0.8] origin-center -my-2">
                  <Barcode 
                    value={card.nia} 
                    height={24} 
                    width={1.2} 
                    fontSize={8}
                    margin={0}
                    background="#ffffff"
                  />
                </div>
              ) : (
                <div className="text-[8px] text-slate-400 font-mono">NO NIA</div>
              )}
           </div>
        </div>

        {/* Security Overlay for "Blur" message */}
        {isBlurred && (
          <div className="absolute inset-0 flex items-center justify-center p-8 text-center bg-black/40 backdrop-blur-md">
            <div className="flex flex-col items-center gap-3">
               <Lock className="text-white animate-bounce" />
               <p className="text-white font-bold">SECURITY ACTIVE</p>
               <p className="text-white/60 text-[10px]">Back to focus to reveal ID</p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Screenshot Barrier message (Technical tip) */}
      <div className="mt-4 p-4 rounded-lg bg-slate-100 text-[11px] text-slate-600 leading-relaxed border border-slate-200">
        <p className="font-bold flex items-center gap-1 mb-1">
          <Shield size={12} /> SECURITY PROTOCOL:
        </p>
        <p>1. Kartu ini hanya untuk penggunaan internal.</p>
        <p>2. Informasi terus diupdate berkala.</p>
        <p>3. Blur otomatis akan aktif jika jendela aplikasi tidak fokus.</p>
      </div>

      <style>{`
        @media print {
          body { display: none; }
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}
