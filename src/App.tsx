import { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, AlertTriangle, Users, Calendar, ArrowRight, Home, Shield, X, ShieldCheck } from 'lucide-react';
import { PressCardData, SortField, SortOrder } from './types';
import { fetchPressCards } from './services/dataService';
import PressCardUI from './components/PressCardUI';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

export default function App() {
  const [cards, setCards] = useState<PressCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  const itemsPerPage = 5;

  useEffect(() => {
    loadData();
    
    // Security Focus Protection
    const handleBlur = () => setIsWindowFocused(false);
    const handleFocus = () => setIsWindowFocused(true);
    const handleVisibilityChange = () => {
      if (document.hidden) setIsWindowFocused(false);
      else setIsWindowFocused(true);
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    setCurrentPage(1);
    try {
      const data = await fetchPressCards();
      setCards(data);
    } catch (err) {
      setError('Gagal memuat data kartu pers.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCards = cards
    .filter(card => {
      const searchLower = search.toLowerCase();
      return String(card.name || '').toLowerCase().includes(searchLower);
    })
    .sort((a, b) => {
      let comparison = 0;
      const valA = a[sortField] || '';
      const valB = b[sortField] || '';

      if (sortField === 'expiryDate') {
        comparison = new Date(a.expiryDate || 0).getTime() - new Date(b.expiryDate || 0).getTime();
      } else {
        comparison = String(valA).localeCompare(String(valB));
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const totalPages = Math.ceil(filteredCards.length / itemsPerPage);
  const pagedCards = filteredCards.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const selectedCard = cards.find(c => c.id === selectedCardId);

  const stats = {
    total: cards.length,
    active: cards.filter(c => String(c.status || '').toLowerCase() === 'aktif').length,
    inactive: cards.filter(c => String(c.status || '').toLowerCase() !== 'aktif').length,
  };

  return (
    <div className="min-h-screen bg-slate-200 font-sans text-slate-800 overflow-x-hidden transition-colors duration-300">
      {/* Header */}
      <header className="bg-slate-200/90 sticky top-0 z-40 backdrop-blur-md border-b border-white/20 shadow-[0_4px_12px_rgba(148,163,184,0.15)]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-slate-200 p-2.5 rounded-xl flex items-center justify-center shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] border border-white/30">
              <ShieldCheck className="text-blue-600 animate-pulse" size={22} />
            </div>
            <div className="flex flex-col">
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight leading-none text-slate-800">Digital Press ID</h1>
              <p className="text-[9px] text-blue-600 font-extrabold uppercase tracking-tighter mt-1">Verified by JMSI</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
              onClick={() => {
                const searchInput = document.querySelector('input[placeholder*="Cari"]') as HTMLInputElement;
                if (searchInput) {
                  searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  searchInput.focus();
                }
              }} 
              className="p-2.5 rounded-full text-slate-600 shadow-[3px_3px_6px_#c8d0da,-3px_-3px_6px_#ffffff] hover:shadow-[1px_1px_3px_#c8d0da,-1px_-1px_3px_#ffffff] transition-all bg-slate-200 active:shadow-[inset_2px_2px_4px_#c8d0da,inset_-2px_-2px_4px_#ffffff]"
              title="Cari Anggota"
             >
               <Search size={16} />
             </button>
             <button 
              onClick={loadData} 
              className="p-2.5 rounded-full text-slate-600 shadow-[3px_3px_6px_#c8d0da,-3px_-3px_6px_#ffffff] hover:shadow-[1px_1px_3px_#c8d0da,-1px_-1px_3px_#ffffff] transition-all bg-slate-200 active:shadow-[inset_2px_2px_4px_#c8d0da,inset_-2px_-2px_4px_#ffffff]"
              title="Refresh Data"
             >
               <RefreshCw size={16} className={cn(loading && "animate-spin text-blue-600")} />
             </button>
             <div className="h-6 w-px bg-slate-300" />
             <div className="text-right hidden xs:block">
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Internal Use Only</p>
                <p className="text-xs font-semibold text-slate-600">v1.1.0 Stable</p>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: 'Total Member', value: stats.total, icon: Users, color: 'blue' },
              { label: 'Status Aktif', value: stats.active, icon: Shield, color: 'green' },
              { label: 'Tidak Aktif', value: stats.inactive, icon: AlertTriangle, color: 'red' },
            ].map((s, i) => (
              <div key={i} className="neu-flat p-5 rounded-2xl flex items-center gap-4 transition-all duration-300 hover:scale-[1.01]">
                 <div className={cn("p-3.5 rounded-xl shadow-[inset_2px_2px_5px_#c8d0da,inset_-2px_-2px_5px_#ffffff] border border-white/20", {
                   'text-blue-600 bg-blue-50/10': s.color === 'blue',
                   'text-green-600 bg-green-50/10': s.color === 'green',
                   'text-red-600 bg-red-50/10': s.color === 'red',
                 })}>
                    <s.icon size={22} />
                 </div>
                 <div>
                    <p className="text-2xl font-black text-slate-800 leading-none mb-1">{s.value}</p>
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">{s.label}</p>
                 </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Directory Section */}
            <div className="md:col-span-12 space-y-6">
              {/* Search */}
              <div className="neu-flat p-4 rounded-2xl">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="text" 
                    placeholder="Cari nama anggota..." 
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-200 rounded-xl focus:outline-none transition-all text-sm font-semibold text-slate-700 shadow-[inset_4px_4px_8px_#c8d0da,inset_-4px_-4px_8px_#ffffff] border border-white/20 placeholder-slate-400 focus:ring-2 focus:ring-blue-400/50"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Member List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-24 neu-flat animate-pulse rounded-2xl" />
                  ))
                ) : pagedCards.length === 0 ? (
                  <div className="col-span-full text-center py-12 bg-slate-200 rounded-2xl shadow-[inset_4px_4px_8px_#c8d0da,inset_-4px_-4px_8px_#ffffff] border border-slate-300/20">
                    <p className="text-slate-400 font-semibold">Tidak ada data yang ditemukan.</p>
                  </div>
                ) : (
                  pagedCards.map((card) => (
                    <motion.div 
                      layout
                      key={card.id}
                      onClick={() => setSelectedCardId(card.id)}
                      className={cn(
                        "group relative p-4 rounded-2xl transition-all cursor-pointer flex items-center gap-4 border border-white/20",
                        selectedCardId === card.id 
                          ? "neu-inset scale-[0.98] text-slate-800" 
                          : "neu-flat hover:scale-[1.01] hover:shadow-[8px_8px_16px_#c8d0da,-8px_-8px_16px_#ffffff]"
                      )}
                    >
                      <div className="relative shrink-0 shadow-[4px_4px_8px_#c8d0da,-4px_-4px_8px_#ffffff] rounded-full p-0.5 bg-slate-200">
                        <img 
                          src={card.photoUrl || null} 
                          alt={card.name} 
                          className="w-12 h-12 rounded-full object-cover border border-slate-300"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-extrabold text-sm text-slate-800 truncate">{card.name}</h3>
                        <div className="mt-1.5">
                          <span className={cn(
                            "text-[9px] px-2.5 py-0.5 rounded font-extrabold uppercase tracking-wider shadow-sm",
                            String(card.status || '').toLowerCase() === 'aktif'
                              ? "bg-green-500/10 text-green-700 border border-green-500/20"
                              : "bg-red-500/10 text-red-700 border border-red-500/20"
                          )}>
                            {card.status || 'Aktif'}
                          </span>
                        </div>
                      </div>
                      <div className={cn(
                        "p-2.5 rounded-full transition-all shrink-0",
                        selectedCardId === card.id 
                          ? "bg-slate-300/40 text-blue-600 shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff]" 
                          : "text-slate-400 shadow-[3px_3px_6px_#c8d0da,-3px_-3px_6px_#ffffff] group-hover:shadow-[1px_1px_3px_#c8d0da,-1px_-1px_3px_#ffffff] group-hover:text-slate-600 bg-slate-200"
                      )}>
                        <ArrowRight size={14} className={cn("transition-transform duration-300", selectedCardId === card.id && "rotate-90")} />
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Pagination Controls */}
              {!loading && totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-8">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={cn(
                      "p-3 rounded-xl text-slate-600 transition-all bg-slate-200",
                      currentPage === 1 
                        ? "opacity-40 cursor-not-allowed shadow-[inset_2px_2px_4px_#c8d0da,inset_-2px_-2px_4px_#ffffff]" 
                        : "neu-btn"
                    )}
                  >
                    <ArrowRight className="rotate-180" size={16} />
                  </button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                      let pageNum = currentPage;
                      if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;

                      if (pageNum < 1 || pageNum > totalPages) return null;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={cn(
                            "w-10 h-10 rounded-xl text-xs font-bold transition-all bg-slate-200",
                            currentPage === pageNum 
                              ? "text-blue-600 shadow-[inset_3px_3px_6px_#c8d0da,inset_-3px_-3px_6px_#ffffff] bg-slate-300/20" 
                              : "neu-btn text-slate-600"
                          )}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={cn(
                      "p-3 rounded-xl text-slate-600 transition-all bg-slate-200",
                      currentPage === totalPages 
                        ? "opacity-40 cursor-not-allowed shadow-[inset_2px_2px_4px_#c8d0da,inset_-2px_-2px_4px_#ffffff]" 
                        : "neu-btn"
                    )}
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {/* Legal Disclaimer Section */}
              <div className="mt-12 space-y-6">
                <div className="neu-amber-inset p-5 sm:p-8 rounded-2xl text-center">
                  <div className="flex flex-col items-center justify-center gap-1.5 mb-4 text-amber-800">
                    <AlertTriangle size={18} />
                    <h3 className="font-extrabold uppercase tracking-wider text-xs">Informasi Penting & Etika Jurnalistik</h3>
                  </div>
                  <div className="space-y-4 text-[10px] text-amber-900/80 leading-relaxed text-center max-w-2xl mx-auto">
                    <p>
                      Wartawan Tinta Informasi dilarang menerima imbalan dari narasumber dan wajib membawa Kartu Pers (KTA) serta Surat Tugas yang masih berlaku saat bertugas. Pihak yang mengatasnamakan TintaInformasi.com tanpa identitas resmi dan tidak tercantum dalam boks redaksi dapat dilaporkan kepada pihak berwenang. Segala pelanggaran kode etik maupun hukum menjadi tanggung jawab pribadi pelaku, sedangkan isi pemberitaan menjadi tanggung jawab wartawan yang bersangkutan. Kartu Pers yang sah hanya yang diterbitkan oleh Redaksi TintaInformasi.
                    </p>
                    <p className="font-extrabold text-amber-900 italic">
                      KARTU PERS (KTA) YANG BERLAKU HANYA YANG DIKELUARKAN OLEH REDAKSI MEDIA TINTA INFORMASI.
                    </p>
                    <p className="pt-3 border-t border-amber-300/30 mt-3 flex justify-center">
                      <a href="https://tintainformasi.com/redaksi/" target="_blank" rel="noopener noreferrer" className="text-blue-700 font-extrabold hover:underline inline-flex flex-col items-center gap-1 text-[10px]">
                        <span>INFO BOKS REDAKSI</span>
                        <span className="font-mono text-[9px] mt-0.5">https://tintainformasi.com/redaksi/</span>
                      </a>
                    </p>
                    <div className="mt-4 p-3 bg-amber-50 rounded-xl text-center max-w-md mx-auto shadow-[inset_1px_1px_3px_rgba(180,140,80,0.2)] border border-amber-200/50">
                      <p className="text-[9px] text-amber-800 font-extrabold uppercase mb-1">Status Verifikasi Organisasi</p>
                      <p className="text-[10px] text-slate-700 font-bold">Tinta Informasi telah diverifikasi oleh JMSI (Jaringan Media Siber Indonesia)</p>
                      <p className="text-[10px] text-blue-700 font-extrabold">Sertifikat Nomor 10.109/JMSI/2024</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Card Preview Overlay */}
      <AnimatePresence>
        {selectedCard && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCardId(null)}
              className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md z-10 my-auto"
            >
              <div className="bg-slate-200 rounded-3xl p-5 sm:p-6 relative overflow-hidden shadow-[12px_12px_24px_#beccd9,-12px_-12px_24px_#ffffff] border border-white/40">
                <div className="flex items-center justify-between mb-4 sm:mb-6 px-1">
                  <div className="flex items-center gap-2">
                    <Shield className="text-slate-700" size={18} />
                    <h2 className="font-extrabold text-slate-700 text-[11px] sm:text-xs uppercase tracking-[0.12em]">Member Card Preview</h2>
                  </div>
                  <button 
                    onClick={() => setSelectedCardId(null)}
                    className="p-2.5 rounded-full text-slate-500 bg-slate-200 shadow-[3px_3px_6px_#c8d0da,-3px_-3px_6px_#ffffff] hover:shadow-[inset_2px_2px_4px_#c8d0da,inset_-2px_-2px_4px_#ffffff] hover:text-red-500 transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="flex justify-center overflow-visible py-2 relative">
                  {/* Security Blur Overlay */}
                  <AnimatePresence>
                    {!isWindowFocused && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 backdrop-blur-xl bg-slate-900/40 flex items-center justify-center rounded-2xl"
                      >
                        <div className="text-white text-center p-6">
                          <ShieldCheck size={48} className="mx-auto mb-2 text-blue-400 opacity-50" />
                          <p className="font-bold text-sm tracking-widest uppercase">Security Mode Active</p>
                          <p className="text-[10px] opacity-60">Content hidden for protection</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className={cn(
                    "scale-[0.75] xs:scale-[0.85] sm:scale-100 origin-top transition-all duration-500",
                    !isWindowFocused && "blur-2xl scale-95 opacity-20 pointer-events-none"
                  )}>
                    <PressCardUI card={selectedCard} />
                  </div>
                </div>
                
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-5 border-t border-slate-300/40 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status Keanggotaan</p>
                  <p className="text-[10px] sm:text-xs text-slate-500 px-4">Verifikasi digital ID diterbitkan secara internal oleh Redaksi</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer Info */}
      <footer className="bg-slate-900 text-slate-500 py-12 mt-20">
         <div className="max-w-6xl mx-auto px-4 text-center space-y-4">
            <div className="flex flex-col items-center justify-center gap-2 mb-2">
               <div className="flex items-center gap-2">
                 <ShieldCheck className="text-blue-500" size={24} />
                 <span className="text-white font-bold text-lg tracking-tighter">Digital Press ID System</span>
               </div>
               <div className="flex items-center gap-2">
                 <span className="text-[12px] font-bold">TINTA INFORMASI</span>
               </div>
               <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                 <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Verified by JMSI</span>
                 <div className="w-1 h-1 rounded-full bg-slate-700" />
                 <span className="text-[10px] text-slate-400 font-medium">No: 10.109/JMSI/2024</span>
               </div>
            </div>
            <p className="text-xs max-w-lg mx-auto leading-relaxed">
              Sistem identifikasi digital terintegrasi untuk wartawan dan staf media. 
              Data disinkronkan secara real-time dari pusat data internal. 
              Dokumen ini adalah properti perusahaan dan dilarang untuk diduplikasi.
            </p>
            <div className="flex items-center justify-center gap-6 pt-4">
               <div className="text-left">
                  <p className="text-[10px] uppercase font-bold text-slate-600">Database Source</p>
                  <p className={cn("text-xs font-medium", cards.length > 0 && cards[0].id === '1' ? "text-amber-500" : "text-green-500")}>
                    {cards.length > 0 && cards[0].id === '1' ? "Using Fallback Data" : "Live Google Sheets Sync"}
                  </p>
               </div>
               <div className="w-px h-8 bg-slate-800" />
               <div className="text-left">
                  <p className="text-[10px] uppercase font-bold text-slate-600">Security Port</p>
                  <p className="text-xs text-slate-400">AES-256 Cloud Encrypted</p>
               </div>
            </div>
            <p className="pt-8 text-[10px] text-slate-700">© 2026 Digital Press Indonesia All Rights Reserved.</p>
            <p className="pb-4 text-[8px] font-black tracking-[0.25em] uppercase animate-text-gradient select-none">Developed by Neverhide™</p>
         </div>
      </footer>
    </div>
  );
}
