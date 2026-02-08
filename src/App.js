import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";



import { 
  Menu, Search, User, MessageCircle, Trophy, ChevronRight, Lock, 
  Zap, Phone, Gift, TrendingUp, History, Eye, EyeOff, X, Home, 
  Star, Clock, ArrowRight, Plus, Minus, ChevronDown
} from 'lucide-react';



// --- CONFIGURATION ---
const WHATSAPP_NUMBER = "919458470780"; 
const APP_NAME = "MUSKAN CRICKET";

// --- CONNECTION: EXCEL / CLOUD SHEET ---
// 1. Create a Google Sheet with columns: id, pass, balance
// 2. Use SheetDB.io or a similar service to get an API URL
// 3. Paste that URL here. 
const USER_API_URL = ""; // Leave empty to use the 'VALID_USERS' backup below

const BACKUP_USERS = [
  { id: "admin123", pass: "muskan786", balance: 5000 },
  { id: "demo", pass: "demo", balance: 0 }
];

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [validUsers, setValidUsers] = useState(BACKUP_USERS);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showBetSlip, setShowBetSlip] = useState(false);
  const [authTrigger, setAuthTrigger] = useState("");
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [stake, setStake] = useState(100);
  const [searchQuery, setSearchQuery] = useState("");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  
  useEffect(() => {
  const unsub = onSnapshot(collection(db, "users"), snap => {
    setValidUsers(snap.docs.map(d => d.data()));
  });

  return () => unsub();
}, []);



  // --- FETCH USERS FROM CLOUD SHEET ---
  useEffect(() => {
    const fetchUsers = async () => {
      if (!USER_API_URL) return;
      setIsLoadingUsers(true);
      try {
        const response = await fetch(USER_API_URL);
        const data = await response.json();
        // SheetDB usually returns an array of objects
        if (Array.isArray(data)) {
          setValidUsers(data);
        }
      } catch (error) {
        console.error("Failed to connect to spreadsheet:", error);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const matches = [
    { id: 1, name: "INDIA vs ENGLAND", series: "Test Match", time: "LIVE", back: "1.92", lay: "1.94", score: "342/5 (88.2)" },
    { id: 2, name: "AUSTRALIA vs WEST INDIES", series: "ODI World Cup", time: "Today 14:30", back: "1.45", lay: "1.47" },
    { id: 3, name: "IPL 2024: MI vs CSK", series: "T20 Match", time: "22 March, 20:00", back: "1.80", lay: "1.82" },
    { id: 4, name: "RCB vs KKR", series: "T20 Match", time: "23 March, 20:00", back: "1.90", lay: "1.92" },
    { id: 5, name: "RSA vs NEW ZEALAND", series: "T20 International", time: "Tomorrow 19:00", back: "2.10", lay: "2.15" }
  ];

  const getWAUrl = (type, details = {}) => {
    let msg = "";
    if (type === 'get_id') msg = "Hi Admin, I want a new User ID and Password for Muskan Cricket. Please share details.";
    else if (type === 'deposit') msg = `Hi Admin, I want to DEPOSIT funds. My ID: ${user?.id || 'New User'}. Claiming 2X BONUS on 500+.`;
    else if (type === 'withdraw') msg = `Hi Admin, I want to WITHDRAW my winnings. My ID: ${user?.id}`;
    else if (type === 'bet') {
      msg = `🔥 *BET PLACED ON ${APP_NAME}* 🔥\n\n🏆 Match: ${details.match}\n📈 Rate: ${details.rate} (${details.type})\n💰 Stake: ₹${details.stake}\n✅ Return: ₹${details.win}\n👤 ID: ${user?.id || 'Guest'}`;
    }
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  };

  const calculateWin = () => (stake * parseFloat(selectedMatch?.rate || 0)).toFixed(2);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError("");

    // Look for user in the list fetched from Excel/Cloud
    const foundUser = validUsers.find(u => 
      String(u.id).toLowerCase() === String(loginId).toLowerCase() && 
      String(u.pass) === String(password)
    );

    if (foundUser) {
      setUser({
        ...foundUser,
        balance: parseFloat(foundUser.balance) || 0
      });
      setShowLoginModal(false);
      if (authTrigger) {
        window.open(getWAUrl(authTrigger));
        setAuthTrigger("");
      }
    } else {
      setLoginError("Invalid ID or Password. WhatsApp admin for new ID.");
    }
  };

  const filteredMatches = matches.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#f1f3f6] text-[#001e39] font-sans overflow-x-hidden">
      <header className="bg-[#001e39] text-white sticky top-0 z-[100] shadow-md">
        <div className="flex justify-between items-center px-4 py-2 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Menu className="w-6 h-6 text-yellow-500 cursor-pointer" onClick={() => setIsMenuOpen(true)} />
            <h1 className="text-xl font-black italic text-yellow-500 uppercase tracking-tighter">{APP_NAME}</h1>
          </div>
          <div className="flex items-center gap-2">
            {!user ? (
              <button onClick={() => setShowLoginModal(true)} className="bg-yellow-500 text-[#001e39] px-4 py-1 rounded font-bold text-[11px] uppercase active:scale-95 transition-transform">
                {isLoadingUsers ? "..." : "Login"}
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-[#1a2b41] px-3 py-1 rounded border border-white/10">
                <span className="text-yellow-500 font-bold text-sm">₹{user.balance.toLocaleString()}</span>
                <User className="w-4 h-4 text-slate-400" />
              </div>
            )}
          </div>
        </div>
        <div className="bg-[#ffb400] text-[#001e39] py-1.5 px-4 overflow-hidden relative border-y border-black/5">
          <div className="whitespace-nowrap inline-block animate-ticker font-black text-[10px] uppercase">
             WELCOME TO {APP_NAME} | DEPOSIT ABOVE ₹500 AND GET 2X TOTAL BALANCE INSTANTLY | FAST WITHDRAWAL 24/7 | WHATSAPP: 9458470780
          </div>
        </div>
        <div className="px-3 py-2 bg-[#001e39]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input type="text" placeholder="Search Cricket..." className="w-full bg-[#1a2b41] border border-white/5 rounded py-2 pl-10 pr-4 text-xs outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto pb-24 px-3">
        <div className="mt-3 bg-gradient-to-r from-[#001e39] to-[#1a2b41] rounded-xl p-5 border border-yellow-500/20 shadow-xl relative overflow-hidden">
           <h2 className="text-3xl font-black text-white italic leading-none">GET <span className="text-yellow-500">2X</span> BONUS</h2>
           <p className="text-slate-400 text-[11px] mt-1 font-bold uppercase tracking-widest">On deposits above ₹500</p>
           <button onClick={() => { setAuthTrigger('deposit'); setShowLoginModal(true); }} className="mt-4 bg-yellow-500 text-black px-5 py-2 rounded-lg font-black text-xs uppercase shadow-lg">Deposit Now</button>
           <Zap className="absolute right-[-10px] bottom-[-10px] w-24 h-24 text-white/5" />
        </div>

        <div className="mt-4 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
          <div className="bg-[#001e39] text-white p-3 flex justify-between items-center font-black text-[10px] uppercase">
             <span>Live Cricket Markets</span>
             <div className="flex gap-12 pr-12 text-slate-400"><span>Back</span><span>Lay</span></div>
          </div>
          {filteredMatches.map(match => (
            <div key={match.id} className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex-1 mb-3 sm:mb-0">
                <div className="flex items-center gap-2 mb-1">
                  {match.time === "LIVE" ? <span className="bg-red-100 text-red-600 text-[9px] px-1.5 py-0.5 rounded font-black flex items-center gap-1 uppercase animate-pulse">LIVE</span> : <span className="text-slate-400 text-[9px] font-bold uppercase tracking-tighter">{match.time}</span>}
                  <span className="text-slate-300 text-[9px] font-medium border-l pl-2 uppercase">{match.series}</span>
                </div>
                <h3 className="text-[#001e39] font-black text-[14px] uppercase truncate">{match.name}</h3>
                {match.score && <p className="text-blue-600 font-bold text-[11px] mt-0.5">{match.score}</p>}
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => { setSelectedMatch({ match: match.name, rate: match.back, type: 'Back' }); setShowBetSlip(true); }} className="w-14 h-11 bg-[#72bbef] rounded font-black text-[#001e39] active:scale-90 transition-transform shadow-sm">{match.back}</button>
                <button onClick={() => { setSelectedMatch({ match: match.name, rate: match.lay, type: 'Lay' }); setShowBetSlip(true); }} className="w-14 h-11 bg-[#faa9ba] rounded font-black text-[#001e39] active:scale-90 transition-transform shadow-sm">{match.lay}</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Calculator Slip */}
      {showBetSlip && selectedMatch && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-end sm:items-center justify-center backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl animate-slide-up">
            <div className={`p-4 text-white flex justify-between items-center ${selectedMatch.type === 'Back' ? 'bg-[#72bbef]' : 'bg-[#faa9ba]'}`}>
               <h4 className="text-[10px] font-black uppercase text-black/40">Place Bet ({selectedMatch.type})</h4>
               <X className="w-5 h-5 text-black cursor-pointer" onClick={() => setShowBetSlip(false)} />
            </div>
            <div className="p-6 space-y-6">
               <div className="flex justify-between items-center">
                  <div><span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Rate</span><p className="text-3xl font-black text-[#001e39]">{selectedMatch.rate}</p></div>
                  <div className="text-right"><span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Team</span><p className="text-xs font-black text-blue-600 uppercase">{selectedMatch.match}</p></div>
               </div>
               <div className="bg-slate-50 border rounded-2xl p-3 flex items-center justify-between">
                  <button onClick={() => setStake(Math.max(1, stake - 50))} className="bg-white w-10 h-10 rounded-xl border flex items-center justify-center text-blue-600 active:scale-90 transition-transform shadow-sm"><Minus size={18} /></button>
                  <div className="text-center flex-1">
                     <span className="text-[9px] font-black text-slate-400 block mb-1 uppercase tracking-widest">Stake (₹)</span>
                     <input type="number" value={stake} onChange={(e) => setStake(parseInt(e.target.value) || 0)} className="bg-transparent text-2xl font-black text-[#001e39] text-center w-full outline-none" />
                  </div>
                  <button onClick={() => setStake(stake + 50)} className="bg-white w-10 h-10 rounded-xl border flex items-center justify-center text-blue-600 active:scale-90 transition-transform shadow-sm"><Plus size={18} /></button>
               </div>
               <div className="bg-[#001e39] rounded-2xl p-5 border-l-4 border-yellow-500 shadow-inner">
                  <p className="text-[10px] text-slate-400 font-black uppercase mb-1 tracking-widest">Aapko Milenge (Return)</p>
                  <div className="flex justify-between items-end">
                    <h3 className="text-4xl font-black text-yellow-500 italic">₹{calculateWin()}</h3>
                    <div className="text-right"><p className="text-[9px] text-green-400 font-black uppercase">Net Profit</p><p className="text-lg font-black text-green-400">+₹{(calculateWin() - stake).toFixed(2)}</p></div>
                  </div>
               </div>
               <button onClick={() => { window.open(getWAUrl('bet', { match: selectedMatch.match, rate: selectedMatch.rate, type: selectedMatch.type, stake: stake, win: calculateWin() })); setShowBetSlip(false); }} className="w-full bg-yellow-500 text-black font-black py-4 rounded-xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg">PLACE BET ON WHATSAPP <ArrowRight className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-[#001e39]/95 z-[300] flex items-center justify-center p-5 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative">
            <button onClick={() => { setShowLoginModal(false); setAuthTrigger(""); }} className="absolute right-5 top-5 text-slate-300"><X /></button>
            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-yellow-500 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-12 shadow-xl shadow-yellow-500/30"><Lock className="w-8 h-8 text-[#001e39] -rotate-12" /></div>
              <h2 className="text-xl font-black text-[#001e39] uppercase italic mb-8 tracking-wider">Secure Login</h2>
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
                 <input type="text" placeholder="Enter ID" className="w-full bg-slate-100 p-4 rounded-xl font-bold border outline-none focus:border-yellow-500 transition-colors" value={loginId} onChange={(e) => setLoginId(e.target.value)} required />
                 <div className="relative">
                    <input type={showPassword ? "text" : "password"} placeholder="Password" className="w-full bg-slate-100 p-4 rounded-xl font-bold border outline-none focus:border-yellow-500 transition-colors" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                 </div>
                 {loginError && <p className="text-red-500 text-[10px] font-black uppercase text-center">{loginError}</p>}
                 <button type="submit" className="w-full bg-[#001e39] text-yellow-500 font-black py-4 rounded-xl shadow-lg uppercase tracking-wider active:scale-95 transition-transform mt-2">LOGIN NOW</button>
              </form>
              <div className="mt-8 pt-8 border-t">
                 <a href={getWAUrl('get_id')} className="flex items-center justify-center gap-2 text-green-600 font-black text-sm border-2 border-green-600/10 py-3 rounded-xl"><MessageCircle className="w-5 h-5" /> GET ID ON WHATSAPP</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Side Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[500] flex">
          <div className="bg-[#001e39] w-72 h-full shadow-2xl relative p-6 border-r border-white/5 animate-slide-in">
             <div className="flex justify-between items-center mb-10"><h2 className="text-yellow-500 font-black italic text-xl uppercase">{APP_NAME}</h2><X className="w-6 h-6 text-white cursor-pointer" onClick={() => setIsMenuOpen(false)} /></div>
             <div className="space-y-4">
                {['Home', 'In-Play', 'Cricket', 'Results'].map(item => (
                  <div key={item} className={`flex justify-between items-center p-3.5 rounded-xl font-black text-xs uppercase ${item === 'Cricket' ? 'bg-yellow-500 text-black' : 'text-slate-400 hover:text-white'}`}><span>{item}</span><ChevronRight size={14} /></div>
                ))}
             </div>
          </div>
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#001e39] border-t border-white/5 flex justify-around items-center py-4 px-4 z-[150] shadow-2xl sm:hidden">
        <div className="flex flex-col items-center gap-1 text-yellow-500 cursor-pointer"><Home size={20} /><span className="text-[9px] font-black uppercase">Home</span></div>
        <div onClick={() => window.open(getWAUrl('deposit'))} className="flex flex-col items-center gap-1 text-slate-500 cursor-pointer"><Zap size={20} className="text-yellow-500" /><span className="text-[9px] font-black uppercase">Deposit</span></div>
        <div onClick={() => user ? setUser(null) : setShowLoginModal(true)} className="flex flex-col items-center gap-1 text-slate-500 cursor-pointer"><User size={20} /><span className="text-[9px] font-black uppercase">{user ? 'Logout' : 'Login'}</span></div>
      </nav>

      <style>{`
        @keyframes ticker { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        .animate-ticker { animation: ticker 20s linear infinite; }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
      `}</style>
      <a href={getWAUrl('support')} className="fixed right-6 bottom-24 bg-green-600 p-4 rounded-full shadow-2xl z-[140] animate-bounce"><MessageCircle size={28} className="text-white" /></a>
    </div>
  );
};

export default App;