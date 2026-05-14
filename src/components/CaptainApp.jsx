import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  LogOut, 
  ChevronRight, 
  Clock, 
  Star, 
  TrendingUp, 
  Plus, 
  Minus, 
  Send, 
  CheckCircle2, 
  CreditCard, 
  Banknote, 
  Smartphone,
  Search,
  ArrowLeft
} from 'lucide-react';

const C = {
  primary: "#E53935",
  primaryLight: "#FFEBEE",
  primaryMid: "#EF9A9A",
  white: "#FFFFFF",
  text: "#1A1A1A",
  muted: "#6B6B6B",
  success: "#2E7D32",
  warning: "#F57F17",
  border: "#FFCDD2",
  sidebar: "#B71C1C",
  page: "#FFF5F5",
};

export default function CaptainApp({ 
  captains, 
  menuData, 
  onOrderComplete, 
  onKOTSend,
  onLogout 
}) {
  const [currentCaptain, setCurrentCaptain] = useState(null);
  const [view, setView] = useState('login'); // login, dashboard, order, payment
  const [activeTable, setActiveTable] = useState(null);
  const [cart, setCart] = useState([]);
  const [kotStatus, setKotStatus] = useState(null); // sending, delivered, accepted
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const handleLogin = (captain) => {
    setCurrentCaptain(captain);
    setView('dashboard');
  };

  const handleStartOrder = (tableId) => {
    setActiveTable(tableId);
    setCart([]);
    setView('order');
  };

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(x => x.n === item.n);
      if (existing) return prev.map(x => x.n === item.n ? { ...x, q: x.q + 1 } : x);
      return [...prev, { ...item, q: 1 }];
    });
  };

  const updateQty = (name, delta) => {
    setCart(prev => prev.map(x => {
      if (x.n === name) {
        const newQty = Math.max(0, x.q + delta);
        return { ...x, q: newQty };
      }
      return x;
    }).filter(x => x.q > 0));
  };

  const filteredMenu = useMemo(() => {
    let filtered = menuData;
    if (category !== "All") filtered = filtered.filter(x => x.c === category);
    if (search) filtered = filtered.filter(x => x.n.toLowerCase().includes(search.toLowerCase()));
    return filtered;
  }, [menuData, category, search]);

  const subtotal = cart.reduce((acc, x) => acc + (x.p * x.q), 0);
  const gst = subtotal * 0.05;
  const total = subtotal + gst;

  const handleSendKOT = () => {
    if (cart.length === 0) return;
    setKotStatus('sending');
    onKOTSend(currentCaptain.name, activeTable);
    
    setTimeout(() => {
      setKotStatus('delivered');
      setTimeout(() => {
        setKotStatus('accepted');
        setTimeout(() => setKotStatus(null), 2000);
      }, 1500);
    }, 1500);
  };

  const handleFinishPayment = (mode) => {
    onOrderComplete(currentCaptain.id, total, cart.length, mode, cart);
    setView('dashboard');
    setActiveTable(null);
    setCart([]);
    alert(`Order completed for Table ${activeTable}. Payment: ${mode}`);
  };

  if (view === 'login') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FFF5F5] p-6">
        <div className="mb-8 text-center">
          <div className="text-3xl font-black text-[#1A1A1A]">softshape<span className="text-[#E53935]">.ai</span></div>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-[#6B6B6B]">Captain Operations</p>
        </div>
        
        <div className="w-full max-w-sm space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {captains.map(c => (
              <button 
                key={c.id} 
                onClick={() => handleLogin(c)}
                className="flex items-center gap-4 rounded-2xl border border-[#FFCDD2] bg-white p-4 shadow-sm transition-all hover:border-[#E53935] active:scale-95"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFEBEE] text-2xl shadow-inner">
                  {c.img}
                </div>
                <div className="flex-grow text-left">
                  <p className="font-bold text-[#1A1A1A]">{c.name}</p>
                  <p className="text-[10px] font-bold uppercase text-[#6B6B6B]">{c.shift} Shift • ID: {c.id}</p>
                </div>
                <ChevronRight size={20} className="text-[#FFCDD2]" />
              </button>
            ))}
          </div>
          
          <div className="pt-6 text-center">
            <button onClick={onLogout} className="text-xs font-bold text-[#B71C1C] hover:underline">Exit to Admin Portal</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FFF5F5] font-sans text-[#1A1A1A]">
      {/* App Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#FFCDD2] bg-white px-4 shadow-sm">
        <div className="flex items-center gap-3">
          {view !== 'dashboard' && (
            <button onClick={() => setView('dashboard')} className="rounded-full p-1 text-[#E53935] hover:bg-[#FFEBEE]">
              <ArrowLeft size={24} />
            </button>
          )}
          <div className="text-xl font-black">softshape<span className="text-[#E53935]">.ai</span></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold">{currentCaptain.name}</p>
            <p className="text-[9px] font-black uppercase text-[#B71C1C] tracking-tighter">Ranking #2</p>
          </div>
          <div className="h-10 w-10 rounded-full border-2 border-[#E53935] bg-[#FFEBEE] flex items-center justify-center text-xl shadow-sm">
            {currentCaptain.img}
          </div>
        </div>
      </header>

      <main className="flex-grow overflow-y-auto pb-24">
        {view === 'dashboard' && (
          <div className="p-4 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Revenue', val: `₹${(currentCaptain.sales / 1000).toFixed(1)}k`, icon: TrendingUp, color: 'text-green-600' },
                { label: 'Orders', val: currentCaptain.orders, icon: ShoppingCart, color: 'text-blue-600' },
                { label: 'Tips', val: '₹1,240', icon: Star, color: 'text-amber-500' },
              ].map(s => (
                <div key={s.label} className="rounded-2xl border border-[#FFCDD2] bg-white p-3 text-center shadow-sm">
                  <div className={`mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF5F5] ${s.color}`}>
                    <s.icon size={16} />
                  </div>
                  <p className="text-sm font-black">{s.val}</p>
                  <p className="text-[9px] font-bold uppercase text-[#6B6B6B]">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Tables Section */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest text-[#B71C1C]">Your Assigned Tables</h3>
                <span className="rounded-full bg-[#FFEBEE] px-2 py-0.5 text-[10px] font-bold text-[#E53935]">4 Active</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {currentCaptain.tables.map(t => (
                  <button 
                    key={t}
                    onClick={() => handleStartOrder(t)}
                    className="flex flex-col items-center justify-center rounded-3xl border-2 border-[#FFCDD2] bg-white py-8 shadow-sm transition-all hover:border-[#E53935] active:scale-95"
                  >
                    <span className="text-[10px] font-black uppercase text-[#6B6B6B]">Table</span>
                    <span className="text-4xl font-black text-[#1A1A1A]">{t}</span>
                    <div className="mt-2 flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[9px] font-bold text-green-700">
                      <Clock size={10} /> Available
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Performance Card */}
            <div className="rounded-3xl bg-[#B71C1C] p-5 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Shift Efficiency</p>
                  <p className="mt-1 text-2xl font-black">94.2%</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Star size={24} className="fill-white" />
                </div>
              </div>
              <div className="mt-4 h-1.5 w-full rounded-full bg-white/20">
                <div className="h-full w-[94%] rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]"></div>
              </div>
              <p className="mt-3 text-[10px] font-medium opacity-80 italic">"Keep it up, {currentCaptain.name.split(' ')[0]}! You're in the top 3 today."</p>
            </div>
          </div>
        )}

        {view === 'order' && (
          <div className="flex flex-col min-h-full">
            <div className="p-4 border-b border-[#FFCDD2] bg-white sticky top-16 z-20 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-[#1A1A1A]">Table {activeTable}</h2>
                <button onClick={() => setView('payment')} className="rounded-full bg-[#2E7D32] px-6 py-2.5 text-[12px] font-black text-white shadow-lg shadow-green-100 active:scale-95 transition-transform">
                  Finish & Bill
                </button>
              </div>
              <div className="relative">
                <input 
                  className="w-full rounded-2xl border border-[#FFCDD2] bg-[#FFF5F5] py-3.5 pl-11 pr-4 text-sm font-medium outline-none focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935]/20 transition-all"
                  placeholder="Search menu items..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B71C1C]" size={20} />
              </div>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {["All", "Biryani", "Starters", "Chinese", "Tandoori", "Curries"].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`whitespace-nowrap rounded-full px-5 py-2.5 text-[11px] font-black uppercase tracking-wider transition-all border ${category === cat ? "bg-[#E53935] text-white border-[#E53935] shadow-md shadow-red-100" : "bg-white text-[#6B6B6B] border-[#FFCDD2] hover:bg-[#FFEBEE]"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 grid grid-cols-2 gap-4 pb-48">
              {filteredMenu.map(item => (
                <div key={item.n} className="flex flex-col justify-between rounded-[32px] border border-[#FFCDD2] bg-white p-4 shadow-sm active:bg-[#FFF5F5] active:scale-95 transition-all relative overflow-hidden group" onClick={() => addToCart(item)}>
                  <div className="flex justify-between items-start mb-2">
                    <div className={`h-4 w-4 rounded-md border-2 flex items-center justify-center ${item.t === "veg" ? "border-green-600" : "border-red-600"}`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${item.t === "veg" ? "bg-green-600" : "bg-red-600"}`} />
                    </div>
                    <p className="text-[11px] font-black text-[#E53935] bg-[#FFEBEE] px-2 py-0.5 rounded-lg">₹{item.p}</p>
                  </div>
                  <p className="text-sm font-black text-[#1A1A1A] leading-tight line-clamp-2 min-h-[40px] mb-2">{item.n}</p>
                  <div className="flex items-center justify-end">
                    <div className="rounded-full bg-[#E53935] p-2 text-white shadow-md shadow-red-100 group-active:scale-110 transition-transform">
                      <Plus size={16} strokeWidth={4} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'payment' && (
          <div className="p-4 space-y-6">
            <div className="rounded-3xl border border-[#FFCDD2] bg-white p-6 shadow-sm">
              <h2 className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-[#6B6B6B] mb-1">Final Summary</h2>
              <p className="text-center text-3xl font-black text-[#1A1A1A]">₹{total.toLocaleString()}</p>
              
              <div className="mt-6 space-y-3 border-t border-[#FFCDD2] pt-4">
                <div className="flex justify-between text-xs text-[#6B6B6B]"><span>Subtotal</span><span className="font-bold">₹{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-xs text-[#6B6B6B]"><span>GST (5%)</span><span className="font-bold">₹{gst.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm font-black pt-1 border-t border-[#FFCDD2]"><span>Grand Total</span><span>₹{total.toLocaleString()}</span></div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-black uppercase tracking-widest text-[#B71C1C] ml-2">Select Payment Method</p>
              <button onClick={() => handleFinishPayment('Cash')} className="flex w-full items-center justify-between rounded-2xl border border-[#FFCDD2] bg-white p-5 shadow-sm active:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-green-100 p-3 text-green-600"><Banknote size={24} /></div>
                  <span className="font-bold">Cash Payment</span>
                </div>
                <ChevronRight size={20} className="text-[#FFCDD2]" />
              </button>
              <button onClick={() => handleFinishPayment('UPI')} className="flex w-full items-center justify-between rounded-2xl border border-[#E53935] bg-[#FFEBEE] p-5 shadow-sm active:bg-red-100">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-[#E53935] p-3 text-white shadow-md"><Smartphone size={24} /></div>
                  <span className="font-black text-[#B71C1C]">UPI / Digital</span>
                </div>
                <ChevronRight size={20} className="text-[#B71C1C]" />
              </button>
              <button onClick={() => handleFinishPayment('Card')} className="flex w-full items-center justify-between rounded-2xl border border-[#FFCDD2] bg-white p-5 shadow-sm active:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-blue-100 p-3 text-blue-600"><CreditCard size={24} /></div>
                  <span className="font-bold">Card Payment</span>
                </div>
                <ChevronRight size={20} className="text-[#FFCDD2]" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Cart for Order View */}
      {view === 'order' && cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4 animate-slide-up">
          <div className="mx-auto max-w-lg rounded-3xl bg-white p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] border-t border-[#FFCDD2]">
            <div className="max-h-[200px] overflow-y-auto mb-4 space-y-2 px-1">
              {cart.map(item => (
                <div key={item.n} className="flex items-center justify-between">
                  <div className="min-w-0 flex-grow">
                    <p className="text-xs font-black truncate">{item.n}</p>
                    <p className="text-[10px] text-[#6B6B6B]">₹{item.p} x {item.q}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-full bg-[#FFF5F5] p-1 border border-[#FFCDD2]">
                      <button onClick={() => updateQty(item.n, -1)} className="p-1 text-[#E53935]"><Minus size={14} strokeWidth={3} /></button>
                      <span className="px-2 text-xs font-black w-6 text-center">{item.q}</span>
                      <button onClick={() => updateQty(item.n, 1)} className="p-1 text-[#E53935]"><Plus size={14} strokeWidth={3} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={handleSendKOT}
              disabled={!!kotStatus}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-black transition-all ${
                kotStatus === 'sending' ? 'bg-amber-500 text-white' : 
                kotStatus === 'delivered' ? 'bg-blue-600 text-white' : 
                kotStatus === 'accepted' ? 'bg-green-600 text-white' : 
                'bg-[#E53935] text-white shadow-xl shadow-red-200 active:scale-95'
              }`}
            >
              {kotStatus === 'sending' && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
              {kotStatus === 'delivered' && <CheckCircle2 size={20} />}
              {kotStatus === 'accepted' && <CheckCircle2 size={20} />}
              {!kotStatus && <Send size={18} />}
              {kotStatus === 'sending' ? 'Sending KOT...' : 
               kotStatus === 'delivered' ? 'Delivered to Kitchen' : 
               kotStatus === 'accepted' ? 'Accepted by Chef' : 
               `Send KOT (₹${total.toFixed(0)})`}
            </button>
          </div>
        </div>
      )}

      {/* Bottom Nav for Dashboard */}
      {view === 'dashboard' && (
        <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-20 items-center justify-around border-t border-[#FFCDD2] bg-white px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <button className="flex flex-col items-center gap-1 text-[#E53935]">
            <LayoutDashboard size={20} strokeWidth={3} />
            <span className="text-[9px] font-black uppercase tracking-widest">Dash</span>
          </button>
          <button className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E53935] text-white shadow-lg shadow-red-200 -mt-8 border-4 border-white transition-transform active:scale-90">
            <Plus size={28} strokeWidth={3} />
          </button>
          <button onClick={() => setView('login')} className="flex flex-col items-center gap-1 text-[#6B6B6B] hover:text-[#B71C1C]">
            <LogOut size={20} strokeWidth={2} />
            <span className="text-[9px] font-black uppercase tracking-widest">Logout</span>
          </button>
        </nav>
      )}
    </div>
  );
}
