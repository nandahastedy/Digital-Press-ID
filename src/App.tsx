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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md bg-white/80">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-1.5 rounded-lg flex items-center justify-center">
              <ShieldCheck className="text-white" size={20} />
            </div>
            <div className="flex flex-col">
              <h1 className="font-bold text-lg tracking-tight leading-none">Digital Press ID</h1>
              <p className="text-[9px] text-blue-600 font-bold uppercase tracking-tighter mt-0.5">Verified by JMSI</p>
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
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
              title="Cari Anggota"
             >
               <Search size={18} />
             </button>
             <button 
              onClick={loadData} 
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
              title="Refresh Data"
             >
               <RefreshCw size={18} className={cn(loading && "animate-spin")} />
             </button>
             <div className="h-6 w-px bg-slate-200" />
             <div className="text-right hidden xs:block">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Internal Use Only</p>
                <p className="text-xs font-medium text-slate-600">v1.1.0 Stable</p>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Member', value: stats.total, icon: Users, color: 'blue' },
              { label: 'Status Aktif', value: stats.active, icon: Shield, color: 'green' },
              { label: 'Tidak Aktif', value: stats.inactive, icon: AlertTriangle, color: 'red' },
            ].map((s, i) => (
              <div key={i} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center gap-4">
                 <div className={cn("p-3 rounded-xl", {
                   'bg-blue-50 text-blue-600': s.color === 'blue',
                   'bg-green-50 text-green-600': s.color === 'green',
                   'bg-red-50 text-red-600': s.color === 'red',
                 })}>
                    <s.icon size={20} />
                 </div>
                 <div>
                    <p className="text-2xl font-bold leading-none mb-1">{s.value}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{s.label}</p>
                 </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Directory Section */}
            <div className="md:col-span-12 space-y-6">
              {/* Search */}
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Cari nama anggota..." 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Member List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-2xl" />
                  ))
                ) : pagedCards.length === 0 ? (
                  <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium">Tidak ada data yang ditemukan.</p>
                  </div>
                ) : (
                  pagedCards.map((card) => (
                    <motion.div 
                      layout
                      key={card.id}
                      onClick={() => setSelectedCardId(card.id)}
                      className={cn(
                        "group relative p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4",
                        selectedCardId === card.id 
                          ? "bg-white border-slate-900 shadow-xl shadow-slate-200" 
                          : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                      )}
                    >
                      <div className="relative shrink-0">
                        <img 
                          src={card.photoUrl || null} 
                          alt={card.name} 
                          className="w-12 h-12 rounded-full object-cover border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 truncate">{card.name}</h3>
                        <div className="mt-1">
                          <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border",
                            String(card.status || '').toLowerCase() === 'aktif'
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          )}>
                            {card.status || 'Aktif'}
                          </span>
                        </div>
                      </div>
                      <div className={cn(
                        "p-2 rounded-full transition-colors shrink-0",
                        selectedCardId === card.id ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100"
                      )}>
                        <ArrowRight size={14} />
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Pagination Controls */}
              {!loading && totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white transition-colors"
                  >
                    <ArrowRight className="rotate-180" size={16} />
                  </button>
                  <div className="flex items-center gap-1">
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
                            "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                            currentPage === pageNum 
                              ? "bg-slate-900 text-white" 
                              : "text-slate-500 hover:bg-slate-100"
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
                    className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white transition-colors"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {/* Legal Disclaimer Section */}
              <div className="mt-12 space-y-6">
                <div className="bg-amber-50 border border-amber-100 p-5 sm:p-8 rounded-2xl text-center">
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
                    <p className="pt-3 border-t border-amber-200/50 mt-3 flex justify-center">
                      <a href="https://tintainformasi.com/redaksi/" target="_blank" rel="noopener noreferrer" className="text-blue-700 font-extrabold hover:underline inline-flex flex-col items-center gap-1 text-[10px]">
                        <span>INFO BOKS REDAKSI</span>
                        <span className="font-mono text-[9px] mt-0.5">https://tintainformasi.com/redaksi/</span>
                      </a>
                    </p>
                    <div className="mt-4 p-3 bg-white/60 border border-amber-200 rounded-xl text-center max-w-md mx-auto">
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
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md z-10 my-auto"
            >
              <div className="bg-white rounded-3xl shadow-2xl p-3 sm:p-6 relative overflow-hidden">
                <div className="flex items-center justify-between mb-4 sm:mb-6 px-2 sm:px-0">
                  <div className="flex items-center gap-2">
                    <Shield className="text-slate-900" size={20} />
                    <h2 className="font-bold text-slate-900 text-[10px] sm:text-sm uppercase tracking-[0.1em]">Member Card Preview</h2>
                  </div>
                  <button 
                    onClick={() => setSelectedCardId(null)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                  >
                    <X size={20} />
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
                
                <div className="mt-4 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-100 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status Keanggotaan</p>
                  <p className="text-[10px] sm:text-xs text-slate-600 px-4">Verifikasi digital ID diterbitkan secara internal oleh Redaksi</p>
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
