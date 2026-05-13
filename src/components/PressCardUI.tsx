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
    <div className="relative group perspective-1000 max-w-sm mx-auto">
      {/* Expiry Warning */}
      {(isExpired || isNearExpiry) && (
        <div className={cn(
          "mb-4 p-3 rounded-lg flex items-center gap-2 text-sm font-medium animate-pulse",
          isExpired ? "bg-red-50 text-red-700 border border-red-200" : "bg-amber-50 text-amber-700 border border-amber-200"
        )}>
          <AlertCircle size={16} />
          <span>
            {isExpired ? "KARTU SUDAH KEDALUWARSA" : "Masa berlaku akan habis segera"}
          </span>
        </div>
      )}

      {/* The Physical Card Container */}
      <div 
        ref={cardRef}
        className={cn(
          "relative w-full aspect-[2/3] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl p-6 overflow-hidden border border-slate-700 transition-all duration-500 select-none",
          isBlurred && "blur-xl grayscale opacity-50 contrast-50",
          "print:hidden" // Hide on print to prevent easy copying
        )}
      >
        {/* Anti-Copy Overlay (Watermark) */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] rotate-[-45deg] flex flex-wrap gap-12 items-center justify-center scale-150 overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <span key={i} className="text-white text-xl font-bold whitespace-nowrap">
              {card.organization} INTERNAL USE ONLY
            </span>
          ))}
        </div>

        {/* Dynamic Watermark (Moving) */}
        <motion.div 
          animate={{ x: [0, 200, 0], y: [0, 400, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 pointer-events-none opacity-[0.05] text-white font-mono text-xs font-bold whitespace-nowrap"
        >
          {card.nia} - {new Date().toISOString()}
        </motion.div>

        {/* Header */}
        <div className="relative flex justify-between items-start mb-8">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <h2 className="text-white font-bold text-lg leading-tight tracking-tighter">
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
        <div className="relative flex flex-col items-center mb-6">
          <div className="relative">
             <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-700 shadow-inner">
                <img 
                  src={card.photoUrl || null} 
                  alt={card.name} 
                  className={cn("w-full h-full object-cover brightness-100", isExpired && "sepia opacity-60")}
                  referrerPolicy="no-referrer"
                />
             </div>
             {/* Security Seal */}
             <div className="absolute -bottom-2 -right-2 bg-blue-600 p-2 rounded-full border-2 border-slate-800 shadow-lg">
                <Lock size={16} className="text-white" />
             </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="flex flex-col items-center text-center mb-8">
          <h1 className="text-white font-bold text-xl mb-1 uppercase tracking-tight">
            {card.name}
          </h1>
          <p className="text-blue-400 font-bold text-sm mb-4 uppercase tracking-wider">
            {card.position}
          </p>
          
          <div className="w-full bg-white/5 rounded-xl p-4 border border-white/10 text-xs space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span className="flex items-center gap-2 font-bold text-[9px] uppercase tracking-wider"><Lock size={12} className="text-blue-500" /> ID MEMBER</span>
              <span className="text-white font-mono">{card.nia}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span className="flex items-center gap-2 font-bold text-[9px] uppercase tracking-wider"><Shield size={12} className="text-blue-500" /> JABATAN</span>
              <span className="text-white font-medium uppercase">{card.position}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span className="flex items-center gap-2 font-bold text-[9px] uppercase tracking-wider"><Shield size={12} className="text-blue-500" /> WILAYAH</span>
              <span className="text-white font-medium uppercase">{card.region}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span className="flex items-center gap-2 font-bold text-[9px] uppercase tracking-wider"><AlertCircle size={12} className="text-blue-500" /> STATUS</span>
              <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase", 
                String(card.status || '').toLowerCase() === 'aktif' ? "bg-green-500/20 text-green-400 border border-green-500/20" : "bg-red-500/20 text-red-400 border border-red-500/20"
              )}>
                {card.status || 'Aktif'}
              </span>
            </div>
            {card.description && (
              <div className="pt-2 border-t border-white/10 mt-2">
                <p className="text-slate-500 text-[10px] uppercase font-bold text-left mb-1">Keterangan:</p>
                <p className="text-white text-left leading-relaxed">{card.description}</p>
              </div>
            )}
            <div className="pt-2 border-t border-white/10 mt-2 flex justify-center">
              <p className="text-blue-400 font-bold text-[10px] tracking-widest">https://tintainformasi.com</p>
            </div>
          </div>
        </div>

        {/* Auth Codes */}
        <div className="flex justify-between items-end mt-auto bg-white p-4 rounded-xl">
           <div className="flex flex-col items-center gap-1">
              {card.nia ? (
                <QRCode value={JSON.stringify({ id: card.id, nia: card.nia, ts: Date.now() })} size={60} />
              ) : (
                <div className="w-[60px] h-[60px] bg-slate-100 flex items-center justify-center rounded text-[10px] text-slate-400">N/A</div>
              )}
              <span className="text-[8px] text-slate-500 font-bold">VERIFY QR</span>
           </div>
           <div className="flex-1 flex flex-col items-center overflow-hidden h-[60px] justify-center scale-[0.8] origin-bottom px-2">
              {card.nia ? (
                <Barcode 
                  value={card.nia} 
                  height={30} 
                  width={1} 
                  fontSize={10}
                  margin={0}
                  background="#ffffff"
                />
              ) : (
                <div className="text-[10px] text-slate-400 font-mono">NOMOR NIA TIDAK TERSEDIA</div>
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
        <p>2. Dilarang melakukan tangkapan layar (screenshot) atau membagikan ke pihak luar.</p>
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
