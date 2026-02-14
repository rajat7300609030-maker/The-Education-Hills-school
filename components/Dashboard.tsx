import React, { useState, useEffect, useMemo } from 'react';
import { AppData, AppSettings, FeeRecord, ExpenseRecord } from '../types';

interface DashboardProps {
  data: AppData;
  currency: string;
  onUpdateSettings: (settings: AppSettings) => void;
  onNavigateToFees: () => void;
  onNavigateToExpenses: () => void;
  onViewStudentProfile?: (id: string) => void;
  userRole?: 'ADMIN' | 'STUDENT';
  currentStudentId?: string;
}

// Reusable component for "0 to X" counting animation
const AnimatedNumber = ({ value, currency, duration = 2000 }: { value: number; currency: string; duration?: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = 0;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Cubic ease-out for a smooth finish
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.floor(easeProgress * (value - startValue) + startValue);
      setDisplayValue(currentVal);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <>{currency}{displayValue.toLocaleString()}</>;
};

const FinancialCard = ({ title, rawValue, currency, icon, gradient, delay, subValue }: any) => (
  <div className={`relative overflow-hidden rounded-3xl p-6 shadow-lg border border-white/20 text-white animate-slide-up ${gradient}`} style={{ animationDelay: `${delay}ms`, animationFillMode: 'backwards' }}>
      <div className="absolute -right-4 -top-4 text-8xl opacity-10 pointer-events-none select-none group-hover:scale-125 transition-transform duration-700">{icon}</div>
      <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="animate-float" style={{ animationDelay: `${delay}ms` }}>{icon}</span>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{title}</p>
          </div>
          <h3 className="text-3xl font-black tracking-tight mb-1">
            <AnimatedNumber value={rawValue} currency={currency} />
          </h3>
          {subValue && <p className="text-[10px] font-bold opacity-70 italic">{subValue}</p>}
      </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ 
  data, 
  currency, 
  onUpdateSettings,
  onNavigateToFees, 
  onNavigateToExpenses, 
  onViewStudentProfile,
  userRole = 'ADMIN', 
  currentStudentId 
}) => {
  const [isTodayLedgerOpen, setIsTodayLedgerOpen] = useState(false);
  // Default audit date is today (YYYY-MM-DD)
  const [auditDate, setAuditDate] = useState(new Date().toISOString().split('T')[0]);
  
  const currentSession = data.schoolProfile.currentSession;
  
  // Isolated data based on session
  const activeStudents = useMemo(() => 
    data.students.filter((s) => !s.isDeleted && (!s.session || s.session === currentSession)), 
  [data.students, currentSession]);

  const activeFees = useMemo(() => data.fees.filter((f) => !f.isDeleted && f.session === currentSession), [data.fees, currentSession]);
  const activeExpenses = useMemo(() => data.expenses ? data.expenses.filter(e => !e.isDeleted && e.session === currentSession) : [], [data.expenses, currentSession]);
  
  const isAdmin = userRole === 'ADMIN';

  // --- Global Financial Calculations (Session Specific) ---
  const totalRevenue = isAdmin ? activeFees
    .filter((f) => f.status === 'Paid')
    .reduce((sum, f) => sum + f.amount, 0) : 0;

  const totalExpected = isAdmin ? activeStudents.reduce((sum, s) => 
    sum + (s.totalAgreedFees || 0) + (s.backLogs || 0), 0
  ) : 0;
  
  const totalDue = Math.max(0, totalExpected - totalRevenue);
  const totalExpenses = isAdmin ? activeExpenses.reduce((sum, e) => sum + e.amount, 0) : 0;
  const netProfit = totalRevenue - totalExpenses;

  // --- Today's Stats (For the Dashboard Card) ---
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysCollections = useMemo(() => activeFees.filter(f => f.status === 'Paid' && f.date === todayStr), [activeFees, todayStr]);
  const todaysExpenses = useMemo(() => activeExpenses.filter(e => e.date === todayStr), [activeExpenses, todayStr]);
  const todayCollectionTotal = todaysCollections.reduce((sum, f) => sum + f.amount, 0);
  const todayExpenseTotal = todaysExpenses.reduce((sum, e) => sum + e.amount, 0);

  // --- Audit Modal Stats (Dynamic based on auditDate) ---
  const auditCollections = useMemo(() => 
    activeFees.filter(f => f.status === 'Paid' && f.date === auditDate),
  [activeFees, auditDate]);

  const auditExpenses = useMemo(() => 
    activeExpenses.filter(e => e.date === auditDate),
  [activeExpenses, auditDate]);

  const auditCollectionTotal = auditCollections.reduce((sum, f) => sum + f.amount, 0);
  const auditExpenseTotal = auditExpenses.reduce((sum, e) => sum + e.amount, 0);
  const auditNet = auditCollectionTotal - auditExpenseTotal;

  // --- Defaulters List (Top 20) ---
  const topDefaulters = useMemo(() => {
    if (!isAdmin) return [];
    return activeStudents.map(student => {
        const studentFees = activeFees.filter(f => f.studentId === student.id);
        const paid = studentFees.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);
        const totalLiability = (student.totalAgreedFees || 0) + (student.backLogs || 0);
        const due = totalLiability - paid;
        return { ...student, due };
    })
    .filter(s => s.due > 0)
    .sort((a, b) => b.due - a.due)
    .slice(0, 20);
  }, [activeStudents, activeFees, isAdmin]);

  // --- Class Distribution Calculation ---
  const classStats = useMemo(() => {
    if (!isAdmin || activeStudents.length === 0) return { stats: [], gradient: 'transparent', total: 0 };
    
    const totalCount = activeStudents.length;
    const stats = data.classes.map((cls, idx) => {
      const count = activeStudents.filter(s => s.grade === cls).length;
      return {
        name: cls,
        count,
        color: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'][idx % 8]
      };
    }).filter(s => s.count > 0);

    let cumulative = 0;
    const gradientParts = stats.map(s => {
      const start = cumulative;
      const share = (s.count / totalCount) * 100;
      cumulative += share;
      return `${s.color} ${start}% ${cumulative}%`;
    });

    const gradient = stats.length > 0 ? `conic-gradient(${gradientParts.join(', ')})` : 'transparent';
    const finalStats = stats.map(s => ({
        ...s,
        percentage: totalCount > 0 ? Math.round((s.count / totalCount) * 100) : 0
    }));

    return { stats: finalStats, gradient, total: totalCount };
  }, [activeStudents, data.classes, isAdmin]);

  // --- Student Specific Financials ---
  const studentFinancials = useMemo(() => {
      if (isAdmin || !currentStudentId) return null;
      const student = data.students.find(s => s.id === currentStudentId && (!s.session || s.session === currentSession));
      if (!student) return null;
      const myFees = data.fees.filter(f => f.studentId === currentStudentId && !f.isDeleted && f.session === currentSession);
      const paidFees = myFees.filter(f => f.status === 'Paid');
      const totalLiability = (student.totalAgreedFees || 0) + (student.backLogs || 0);
      const paidTotal = paidFees.reduce((sum, f) => sum + f.amount, 0);
      const dueAmount = totalLiability - paidTotal;
      const progress = totalLiability > 0 ? Math.round((paidTotal / totalLiability) * 100) : 0;
      const history = [...paidFees].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return { student, totalLiability, paidTotal, dueAmount, progress, history, backLogs: student.backLogs || 0 };
  }, [isAdmin, currentStudentId, data.students, data.fees, currentSession]);

  // --- Recent Data ---
  const recentPayments = useMemo(() => isAdmin ? activeFees.filter(f => f.status === 'Paid').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5) : [], [activeFees, isAdmin]);
  const recentExpenses = useMemo(() => isAdmin ? activeExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5) : [], [activeExpenses, isAdmin]);

  const getExpenseIcon = (category: string) => {
    switch(category) {
        case 'Salary': return '👔';
        case 'Maintenance': return '🛠️';
        case 'Utilities': return '💡';
        case 'Supplies': return '📦';
        case 'Events': return '🎉';
        default: return '🧾';
    }
  };

  const getMethodIcon = (method?: string) => {
    switch(method) {
        case 'Cash': return '💵';
        case 'UPI': return '📱';
        case 'Online': return '🌐';
        case 'Bank Transfer': return '🏦';
        case 'Cheque': return '🎫';
        default: return '💰';
    }
  };

  // --- Slider State & Logic ---
  const [currentSlide, setCurrentSlide] = useState(0);
  const { imageSlider } = data.settings;

  useEffect(() => {
    if (imageSlider?.enabled && imageSlider.autoplay && imageSlider.images.length > 1) {
        const timer = setInterval(() => { 
            setCurrentSlide(prev => (prev + 1) % imageSlider.images.length); 
        }, imageSlider.interval);
        return () => clearInterval(timer);
    }
  }, [imageSlider]);

  // --- Calendar State ---
  const [calendarDate, setCalendarDate] = useState(new Date());
  const changeMonth = (offset: number) => {
    const newDate = new Date(calendarDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCalendarDate(newDate);
  };
  const calendarDays = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [calendarDate]);

  // --- Visual Effects Helper ---
  const getBannerEffectClass = (effect?: string) => {
    switch(effect) {
        case 'Blur': return 'blur-md scale-110 brightness-75';
        case 'Sepia': return 'sepia brightness-90';
        case 'Grayscale': return 'grayscale brightness-90';
        case 'Dark': return 'brightness-[0.35]';
        case 'Standard':
        default: return 'brightness-100';
    }
  };

  const handleSendReminder = (student: any) => {
    if (!student.phone) return;
    const message = `🔔 *FEE REMINDER* 🔔\n\nDear Parent,\nThis is a reminder regarding the pending fees for *${student.name}* (Class: ${student.grade}).\n\n💰 *Due Amount:* ${currency}${student.due.toLocaleString()}\n📅 *Session:* ${student.session || data.schoolProfile.currentSession}\n\nPlease clear the outstanding balance soon.\n\nRegards,\n*${data.schoolProfile.name}*`;
    const encodedMsg = encodeURIComponent(message);
    window.open(`https://wa.me/${student.phone.replace(/[^0-9]/g, '')}?text=${encodedMsg}`, '_blank');
  };

  return (
    <div className="space-y-8 pb-12 overflow-x-hidden">
      <header className="flex items-center justify-between animate-fade-in">
        <div className="animate-slide-up">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Dashboard <span className="text-indigo-600">Overview</span> 📊</h2>
          <p className="text-slate-500 font-medium">Hello, {isAdmin ? data.userProfile.name : studentFinancials?.student.name}. Have a great day!</p>
        </div>
        <div className="hidden md:flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 animate-scale-in">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Online</span>
        </div>
      </header>

      {/* --- PREMIUM SCHOOL PROFILE CARD --- */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden relative group transition-all duration-500 animate-scale-in" style={{ animationDelay: '100ms', animationFillMode: 'backwards' }}>
          <div className="h-56 relative overflow-hidden group">
              {data.schoolProfile.banner ? (
                  <img 
                    src={data.schoolProfile.banner} 
                    alt="Banner" 
                    className={`w-full h-full object-cover transition-all duration-1000 group-hover:scale-105 ${getBannerEffectClass(data.schoolProfile.bannerEffect)}`} 
                  />
              ) : (
                  <div className="w-full h-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 relative">
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:30px_30px]"></div>
                  </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              
              <div className="absolute top-6 right-8 z-20 animate-slide-up" style={{ animationDelay: '400ms', animationFillMode: 'backwards' }}>
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-5 py-2 rounded-2xl shadow-2xl flex flex-col items-end">
                      <span className="text-[8px] font-black text-indigo-300 uppercase tracking-widest">Active Session</span>
                      <span className="text-sm font-black text-white">{data.schoolProfile.currentSession}</span>
                  </div>
              </div>
          </div>
          
          <div className="px-8 pb-8 text-center relative">
              <div className="w-32 h-32 mx-auto -mt-16 bg-white rounded-[2rem] p-2 shadow-lg mb-4 relative group/logo rotate-3 hover:rotate-0 transition-transform duration-300 z-10 border-4 border-white animate-scale-in" style={{ animationDelay: '300ms', animationFillMode: 'backwards' }}>
                  <div className="w-full h-full rounded-[1.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden relative shadow-inner">
                       <div 
                        className="w-full h-full flex items-center justify-center transition-transform duration-500"
                        style={{ transform: `scale(${(data.schoolProfile.logoSize || 100) / 100})` }}
                       >
                        {data.schoolProfile.logo ? (
                            <img src={data.schoolProfile.logo} alt="Logo" className="w-full h-full object-contain p-2" />
                        ) : (
                            <span className="text-5xl animate-float">🏫</span>
                        )}
                      </div>
                  </div>
              </div>

              <div className="animate-slide-up space-y-1" style={{ animationDelay: '400ms', animationFillMode: 'backwards' }}>
                  <h2 className="text-4xl font-black text-slate-800 tracking-tighter leading-none">{data.schoolProfile.name || 'School Name'}</h2>
                  <p className="text-sm font-bold text-indigo-600/80 italic">"{data.schoolProfile.motto || 'Education for Future'}"</p>
                  
                  <div className="pt-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <span className="animate-pulse">🆔</span> {data.schoolProfile.affiliationNumber || 'N/A'}
                      </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 mt-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 backdrop-blur-sm shadow-inner text-left">
                        <div className="space-y-0.5 animate-fade-in" style={{ animationDelay: '500ms', animationFillMode: 'backwards' }}>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Address
                            </p>
                            <p className="text-xs font-black text-slate-800 truncate" title={data.schoolProfile.address}>{data.schoolProfile.address || 'Not Provided'}</p>
                        </div>
                        <div className="space-y-0.5 animate-fade-in" style={{ animationDelay: '600ms', animationFillMode: 'backwards' }}>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Established
                            </p>
                            <p className="text-xs font-black text-slate-800">{data.schoolProfile.establishedYear || '1996'}</p>
                        </div>
                        <div className="space-y-0.5 animate-fade-in" style={{ animationDelay: '700ms', animationFillMode: 'backwards' }}>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Contact
                            </p>
                            <p className="text-xs font-black text-slate-800 truncate">{data.schoolProfile.contactNumber || 'No Contact'}</p>
                        </div>
                        <div className="space-y-0.5 animate-fade-in" style={{ animationDelay: '800ms', animationFillMode: 'backwards' }}>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Strength
                            </p>
                            <p className="text-xs font-black text-slate-800">{activeStudents.length} Active</p>
                        </div>
                  </div>
              </div>
          </div>
      </div>

      {imageSlider?.enabled && imageSlider.images.length > 0 && (
        <div className="relative w-full h-[350px] md:h-[450px] rounded-[3rem] overflow-hidden shadow-2xl group border border-slate-200 bg-slate-900 animate-fade-in" style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}>
            {imageSlider.images.map((slide, index) => (
                <div key={slide.id} className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-110 z-0'}`}>
                    <img src={slide.url} alt={slide.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                </div>
            ))}
            <div className="absolute bottom-0 left-0 p-10 text-white w-full z-20 animate-slide-up" key={currentSlide}>
                <div className="bg-indigo-600/20 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full inline-block mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest">Gallery Spotlight</span>
                </div>
                <h3 className="text-4xl font-black mb-3 leading-tight tracking-tighter">{imageSlider.images[currentSlide]?.title}</h3>
                <p className="text-lg opacity-80 font-medium text-slate-200 max-w-2xl line-clamp-2">{imageSlider.images[currentSlide]?.description}</p>
            </div>
            <div className="absolute bottom-10 right-10 z-30 flex gap-2">
                {imageSlider.images.map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentSlide(idx)} className={`h-2 rounded-full transition-all duration-500 ${idx === currentSlide ? 'w-8 bg-indigo-500' : 'w-2 bg-white/40'}`}/>
                ))}
            </div>
        </div>
      )}

      {isAdmin && (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <FinancialCard title="Total Collection" rawValue={totalRevenue} currency={currency} icon="💰" gradient="bg-gradient-to-br from-emerald-600 to-emerald-800" delay={0} subValue="Actual Cash Received" />
                <FinancialCard title="Total Due Fees" rawValue={totalDue} currency={currency} icon="⏳" gradient="bg-gradient-to-br from-rose-600 to-rose-800" delay={100} subValue="Outstanding Balance" />
                <FinancialCard title="Total Expenses" rawValue={totalExpenses} currency={currency} icon="💸" gradient="bg-gradient-to-br from-orange-50 to-orange-700" delay={200} subValue="Operational Costs" />
                <FinancialCard title={netProfit >= 0 ? "Net Profit" : "Net Loss"} rawValue={Math.abs(netProfit)} currency={currency} icon={netProfit >= 0 ? "📈" : "📉"} gradient={netProfit >= 0 ? "bg-gradient-to-br from-indigo-600 to-blue-800" : "bg-gradient-to-br from-red-800 to-red-950"} delay={300} subValue={netProfit >= 0 ? "Healthy Cashflow" : "Negative Margin"} />
            </div>

            {/* --- TODAY HISTORY CARD - CLICK TO OPEN AUDIT MODAL --- */}
            <div 
                onClick={() => { setAuditDate(new Date().toISOString().split('T')[0]); setIsTodayLedgerOpen(true); }}
                className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 animate-slide-up cursor-pointer hover:shadow-2xl hover:scale-[1.01] transition-all group" 
                style={{ animationDelay: '350ms' }}
            >
                <div className="flex items-center gap-4 shrink-0">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-indigo-100 group-hover:rotate-12 transition-transform">📅</div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                            Audit Ledger 
                            <span className="text-indigo-400 group-hover:translate-x-1 transition-transform">➜</span>
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                            Detailed Daily Financial Analysis
                        </p>
                    </div>
                </div>
                <div className="flex flex-1 gap-4 w-full">
                    <div className="flex-1 bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex flex-col items-center justify-center group-hover:bg-emerald-100 transition-all duration-300">
                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.1em] mb-1">Today's Collections</p>
                        <p className="text-3xl font-black text-emerald-700 tracking-tighter">
                            {currency}{todayCollectionTotal.toLocaleString()}
                        </p>
                    </div>
                    <div className="flex-1 bg-rose-50 p-4 rounded-2xl border border-rose-100 flex flex-col items-center justify-center group-hover:bg-rose-100 transition-all duration-300">
                        <p className="text-[9px] font-black text-rose-600 uppercase tracking-[0.1em] mb-1">Today's Expenses</p>
                        <p className="text-3xl font-black text-rose-700 tracking-tighter">
                            {currency}{todayExpenseTotal.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* --- TOP 20 DUE FEES REGISTRY --- */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 animate-slide-up" style={{ animationDelay: '380ms', animationFillMode: 'backwards' }}>
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                        <span className="p-2 bg-rose-100 text-rose-600 rounded-xl text-xl shadow-sm border border-rose-50">⏳</span>
                        <span>Top 20 Due Fees Registry</span>
                    </h3>
                    <div className="px-4 py-1.5 bg-rose-50 border border-rose-100 rounded-full text-[10px] font-black text-rose-600 uppercase tracking-widest">Immediate Attention</div>
                </div>

                <div className="overflow-x-auto -mx-4 md:mx-0">
                    <div className="inline-block min-w-full align-middle md:px-0">
                        <div className="overflow-hidden border border-slate-100 rounded-2xl">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                                        <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Class</th>
                                        <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Dues</th>
                                        <th scope="col" className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Action Center</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-50">
                                    {topDefaulters.length > 0 ? topDefaulters.map((s, idx) => (
                                        <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                                                        {s.photo ? <img src={s.photo} className="w-full h-full object-cover" /> : s.name.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-black text-slate-800 truncate">{s.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase">{s.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">Class {s.grade}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-black text-rose-600">{currency}{s.due.toLocaleString()}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <a 
                                                        href={`tel:${s.phone}`}
                                                        className="w-9 h-9 bg-white border border-slate-200 text-blue-600 rounded-xl flex items-center justify-center shadow-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all active:scale-90"
                                                        title="Call Guardian"
                                                    >
                                                        📞
                                                    </a>
                                                    <button 
                                                        onClick={() => handleSendReminder(s)}
                                                        className="w-9 h-9 bg-white border border-slate-200 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all active:scale-90"
                                                        title="WhatsApp Reminder"
                                                    >
                                                        🔔
                                                    </button>
                                                    <button 
                                                        onClick={() => onViewStudentProfile?.(s.id)}
                                                        className="w-9 h-9 bg-white border border-slate-200 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all active:scale-90"
                                                        title="View Profile"
                                                    >
                                                        👤
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-4xl mb-2">🎉</span>
                                                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No Outstanding Dues Found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- DISTRIBUTION SECTION --- */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 animate-slide-up" style={{ animationDelay: '400ms', animationFillMode: 'backwards' }}>
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                        <span className="p-2 bg-indigo-100 text-indigo-600 rounded-xl text-xl shadow-sm border border-indigo-50 animate-float">📊</span>
                        <span>Student Distribution</span>
                    </h3>
                    <div className="px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Session</div>
                </div>

                <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
                    <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center shrink-0">
                         <div className="absolute inset-0 rounded-full blur-2xl opacity-10 animate-pulse-subtle" style={{ background: classStats.gradient }}></div>
                         <div 
                            className="w-full h-full rounded-full shadow-2xl relative transition-transform duration-700 hover:scale-105 border-8 border-white animate-scale-in"
                            style={{ background: classStats.gradient, animationDelay: '600ms', animationFillMode: 'backwards' }}
                         >
                            <div className="absolute inset-0 m-auto w-[65%] h-[65%] bg-white rounded-full flex flex-col items-center justify-center shadow-inner border border-slate-50">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrolled</span>
                                <span className="text-4xl font-black text-slate-800">{classStats.total}</span>
                                <span className="text-[9px] font-bold text-indigo-500 uppercase mt-1 tracking-tighter">Students</span>
                            </div>
                         </div>
                    </div>

                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
                        {classStats.stats.map((s, idx) => (
                            <div key={s.name} className="stagger-item flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:border-indigo-100 transition-all cursor-default group" style={{ animationDelay: `${700 + (idx * 50)}ms` }}>
                                <div className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ background: s.color }}></div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1 truncate">{s.name}</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-base font-black text-slate-800 leading-none">{s.count}</span>
                                        <span className="text-[10px] font-bold text-slate-400">({s.percentage}%)</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- RECENT ACTIVITY GRID --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden animate-slide-up" style={{ animationDelay: '500ms', animationFillMode: 'backwards' }}>
                    <div className="p-6 pb-2 flex justify-between items-center">
                        <h3 className="text-lg font-black flex items-center gap-3 text-slate-800"><span className="p-2 bg-emerald-100 text-emerald-600 rounded-xl text-xl shadow-sm animate-float">🧾</span> <span>Recent Payments</span></h3>
                        <button onClick={onNavigateToFees} className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline">History</button>
                    </div>
                    <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[350px] scrollbar-hide">
                        {recentPayments.length > 0 ? recentPayments.map((fee, idx) => (
                            <div key={fee.id} className="stagger-item group flex items-center justify-between p-4 bg-slate-50/50 hover:bg-white border border-slate-100 rounded-2xl transition-all hover:shadow-md cursor-default" style={{ animationDelay: `${600 + (idx * 50)}ms` }}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm bg-white border border-slate-100 text-emerald-600 group-hover:scale-110 transition-transform">🎓</div>
                                    <div>
                                        <p className="font-black text-slate-800 text-sm leading-tight">{data.students.find(s => s.id === fee.studentId)?.name || 'Unknown'}</p>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1 font-bold uppercase"><span className="text-emerald-600">{fee.type}</span><span>•</span><span>{new Date(fee.date).toLocaleDateString()}</span></div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="font-black text-lg text-emerald-600">{currency}{fee.amount.toLocaleString()}</span>
                                </div>
                            </div>
                        )) : <div className="text-center py-12 text-slate-400 font-bold uppercase tracking-widest text-[10px]">No records for this session</div>}
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden animate-slide-up" style={{ animationDelay: '600ms', animationFillMode: 'backwards' }}>
                    <div className="p-6 pb-2 flex justify-between items-center">
                        <h3 className="text-lg font-black flex items-center gap-3 text-slate-800"><span className="p-2 bg-rose-100 text-rose-600 rounded-xl text-xl shadow-sm animate-float">💸</span> <span>Outflow</span></h3>
                        <button onClick={onNavigateToExpenses} className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline">History</button>
                    </div>
                    <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[350px] scrollbar-hide">
                        {recentExpenses.length > 0 ? recentExpenses.map((expense, idx) => (
                            <div key={expense.id} className="stagger-item group flex items-center justify-between p-4 bg-slate-50/50 hover:bg-white border border-slate-100 rounded-2xl transition-all hover:shadow-md cursor-default" style={{ animationDelay: `${700 + (idx * 50)}ms` }}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm bg-white border border-slate-100 text-rose-600 group-hover:scale-110 transition-transform">
                                        {getExpenseIcon(expense.category)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-black text-slate-800 text-sm leading-tight truncate">{expense.title}</p>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1 font-bold uppercase"><span className="text-rose-600">{expense.category}</span><span>•</span><span>{new Date(expense.date).toLocaleDateString()}</span></div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="font-black text-lg text-rose-600">{currency}{expense.amount.toLocaleString()}</span>
                                </div>
                            </div>
                        )) : <div className="text-center py-12 text-slate-400 font-bold uppercase tracking-widest text-[10px]">No records for this session</div>}
                    </div>
                </div>
            </div>
        </>
      )}

      {/* --- INSTITUTIONAL PORTAL (CALENDAR & QR) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-slide-up" style={{ animationDelay: '700ms', animationFillMode: 'backwards' }}>
          {/* Branded School Calendar */}
          <div className="lg:col-span-8 bg-white rounded-[3rem] shadow-xl border border-slate-200 p-8 md:p-10 flex flex-col h-full relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 tobacco-none pointer-events-none transition-all duration-700 group-hover:scale-150"></div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-indigo-100 border border-indigo-400 animate-float">📅</div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">{data.schoolProfile.name} Calendar</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{calendarDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-[1.25rem] border border-slate-100 shadow-inner">
                        <button onClick={() => changeMonth(-1)} className="w-10 h-10 bg-white hover:bg-indigo-600 hover:text-white rounded-xl transition-all text-indigo-600 font-black shadow-sm border border-slate-100 flex items-center justify-center">◀</button>
                        <span className="font-black text-xs text-slate-600 px-4 min-w-[120px] text-center uppercase tracking-widest">{calendarDate.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                        <button onClick={() => changeMonth(1)} className="w-10 h-10 bg-white hover:bg-indigo-600 hover:text-white rounded-xl transition-all text-indigo-600 font-black shadow-sm border border-slate-100 flex items-center justify-center">▶</button>
                    </div>
                </div>

                <div className="grid grid-cols-7 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-6 relative z-10">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="py-2">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 text-center gap-3 flex-1 relative z-10">
                    {calendarDays.map((d, i) => {
                        const isToday = d === new Date().getDate() && calendarDate.getMonth() === new Date().getMonth() && calendarDate.getFullYear() === new Date().getFullYear();
                        return (
                            <div 
                                key={i} 
                                className={`aspect-square flex items-center justify-center rounded-2xl text-base font-black transition-all group/day ${
                                    d 
                                    ? isToday 
                                        ? 'bg-indigo-600 text-white shadow-2xl scale-110 ring-4 ring-indigo-100 animate-pulse-subtle z-10' 
                                        : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-indigo-200 hover:scale-105 cursor-pointer shadow-sm' 
                                    : 'opacity-0 pointer-events-none'
                                }`}
                            >
                                {d}
                            </div>
                        )
                    })}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10">
                    <span>Public Holidays: Nil</span>
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-600"></span> Current Day
                    </span>
                </div>
          </div>

          {/* Institutional QR Card */}
          <div className="lg:col-span-4 bg-white rounded-[3rem] shadow-xl border border-slate-200 overflow-hidden flex flex-col group h-full transition-all duration-500 hover:shadow-2xl">
              <div className="p-8 bg-slate-900 text-white relative h-32 flex flex-col justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                  <div className="relative z-10">
                      <h3 className="text-xl font-black uppercase tracking-tighter mb-1">Institutional Portal</h3>
                      <p className="text-[9px] font-bold text-indigo-300 uppercase tracking-[0.2em] opacity-80">Scan for Official Profile</p>
                  </div>
              </div>
              <div className="flex-1 p-8 flex flex-col items-center justify-center bg-slate-50/50">
                  <div className="bg-white p-4 rounded-[2.5rem] shadow-2xl border-4 border-slate-100 group-hover:scale-105 transition-transform duration-700 relative mb-6">
                       <div className="absolute inset-0 rounded-[2rem] border-2 border-indigo-600/20 animate-ping opacity-30 tobacco-none pointer-events-none"></div>
                       <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`${data.schoolProfile.name}|${data.schoolProfile.address}|${data.schoolProfile.contactNumber}`)}`} 
                          alt="School QR" 
                          className="w-48 h-48 rounded-xl"
                       />
                  </div>
                  <div className="text-center space-y-2">
                      <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight">{data.schoolProfile.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed px-4">
                        Instant Digital Identity Verification for stakeholders and visitors.
                      </p>
                  </div>
              </div>
              <div className="p-6 bg-white border-t border-slate-100 flex flex-col gap-3">
                  <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3">
                      <span>📤</span> Export Institution Info
                  </button>
                  <p className="text-[8px] text-center text-slate-300 font-bold uppercase tracking-[0.3em]">Institutional Verification core v2.0</p>
              </div>
          </div>
      </div>

      {/* --- FLOATING LEDGER AUDIT MODAL WITH DATE FILTER --- */}
      {isTodayLedgerOpen && isAdmin && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[200] flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsTodayLedgerOpen(false)}>
              <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col animate-scale-in border border-white/20" onClick={e => e.stopPropagation()}>
                  
                  {/* Modal Header */}
                  <div className="p-8 bg-gradient-to-r from-slate-900 to-indigo-950 text-white relative">
                      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                          <div>
                              <div className="flex items-center gap-3 mb-2">
                                  <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg">Ledger Filter</span>
                                  <span className="text-indigo-300 font-bold text-xs uppercase tracking-[0.2em]">{new Date(auditDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                              </div>
                              <h2 className="text-4xl font-black tracking-tighter">Daily Audit Log</h2>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                               {/* --- DATE FILTER INPUT --- */}
                               <div className="relative group bg-white/5 p-2 rounded-2xl border border-white/10 flex items-center gap-3 hover:bg-white/10 transition-all">
                                   <div className="pl-2 flex flex-col">
                                       <span className="text-[8px] font-black text-indigo-300 uppercase tracking-widest">Select Audit Day</span>
                                       <input 
                                          type="date" 
                                          className="bg-transparent border-none text-white font-black outline-none cursor-pointer text-sm [color-scheme:dark]"
                                          value={auditDate}
                                          onChange={(e) => setAuditDate(e.target.value)}
                                       />
                                   </div>
                                   <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-xl shadow-lg">📅</div>
                               </div>

                               <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 flex flex-col items-end min-w-[150px]">
                                   <span className="text-[8px] font-black text-indigo-300 uppercase tracking-widest">Audit Day Profit</span>
                                   <span className={`text-2xl font-black ${auditNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                       {currency}{Math.abs(auditNet).toLocaleString()}
                                   </span>
                               </div>
                               <button 
                                  onClick={() => setIsTodayLedgerOpen(false)}
                                  className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-2xl transition-all border border-white/10 shadow-inner"
                               >
                                   ✕
                               </button>
                          </div>
                      </div>
                  </div>

                  {/* Modal Content Scrollable */}
                  <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          
                          {/* Collections Audit */}
                          <div className="space-y-6">
                              <div className="flex items-center justify-between">
                                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                                      <span className="p-2.5 bg-emerald-100 text-emerald-600 rounded-2xl shadow-sm border border-emerald-50">📥</span>
                                      <span>Collections <span className="opacity-40 ml-1 text-base">{new Date(auditDate).toLocaleDateString()}</span></span>
                                  </h3>
                                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{auditCollections.length} Entries</span>
                              </div>
                              
                              <div className="space-y-3">
                                  {auditCollections.length > 0 ? auditCollections.map(fee => {
                                      const student = data.students.find(s => s.id === fee.studentId);
                                      return (
                                          <div key={fee.id} className="p-4 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl hover:scale-[1.02] transition-all animate-slide-up">
                                              <div className="flex items-center gap-4">
                                                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl shadow-inner border border-slate-100 group-hover:rotate-6 transition-transform">
                                                      {getMethodIcon(fee.paymentMethod)}
                                                  </div>
                                                  <div>
                                                      <p className="font-black text-slate-800 leading-tight truncate max-w-[150px]">{student?.name || 'Archived User'}</p>
                                                      <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-1">{fee.type} • {fee.paymentMethod}</p>
                                                  </div>
                                              </div>
                                              <div className="text-right">
                                                  <p className="text-lg font-black text-emerald-600">{currency}{fee.amount.toLocaleString()}</p>
                                                  <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">Verified Entry</p>
                                              </div>
                                          </div>
                                      );
                                  }) : (
                                      <div className="py-20 text-center border-4 border-dashed border-slate-100 rounded-[3rem] bg-white/50">
                                          <span className="text-5xl block mb-4">🏜️</span>
                                          <p className="text-slate-400 font-black uppercase tracking-widest">No Collections on this day</p>
                                      </div>
                                  )}
                              </div>
                          </div>

                          {/* Expenses Audit */}
                          <div className="space-y-6">
                              <div className="flex items-center justify-between">
                                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                                      <span className="p-2.5 bg-rose-100 text-rose-600 rounded-2xl shadow-sm border border-rose-50">📤</span>
                                      <span>Expenses <span className="opacity-40 ml-1 text-base">{new Date(auditDate).toLocaleDateString()}</span></span>
                                  </h3>
                                  <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{auditExpenses.length} Entries</span>
                              </div>

                              <div className="space-y-3">
                                  {auditExpenses.length > 0 ? auditExpenses.map(expense => (
                                      <div key={expense.id} className="p-4 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl hover:scale-[1.02] transition-all animate-slide-up">
                                          <div className="flex items-center gap-4">
                                              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl shadow-inner border border-slate-100 group-hover:rotate-6 transition-transform">
                                                  {getExpenseIcon(expense.category)}
                                              </div>
                                              <div>
                                                  <p className="font-black text-slate-800 leading-tight truncate max-w-[150px] uppercase tracking-tight">{expense.title}</p>
                                                  <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mt-1">{expense.category} • {expense.paymentMethod}</p>
                                              </div>
                                          </div>
                                          <div className="text-right">
                                              <p className="text-lg font-black text-rose-600">{currency}{expense.amount.toLocaleString()}</p>
                                              <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">Voucher Verified</p>
                                          </div>
                                      </div>
                                  )) : (
                                      <div className="py-20 text-center border-4 border-dashed border-slate-100 rounded-[3rem] bg-white/50">
                                          <span className="text-5xl block mb-4">🍃</span>
                                          <p className="text-slate-400 font-black uppercase tracking-widest">No Expenses on this day</p>
                                      </div>
                                  )}
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Modal Footer Summary */}
                  <div className="p-8 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                          <div className="flex flex-col">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Audit Day Total Inflow</span>
                              <span className="text-2xl font-black text-emerald-600">{currency}{auditCollectionTotal.toLocaleString()}</span>
                          </div>
                          <div className="w-px h-10 bg-slate-100 hidden sm:block"></div>
                          <div className="flex flex-col">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Audit Day Total Outflow</span>
                              <span className="text-2xl font-black text-rose-600">{currency}{auditExpenseTotal.toLocaleString()}</span>
                          </div>
                      </div>
                      <div className="flex gap-4">
                           <button 
                                onClick={() => setAuditDate(new Date().toISOString().split('T')[0])}
                                className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all"
                            >
                                Back to Today
                            </button>
                           <button 
                             onClick={() => setIsTodayLedgerOpen(false)}
                             className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95"
                          >
                              Close Daily Audit
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {!isAdmin && studentFinancials && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-6">
                  <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-[3rem] p-10 shadow-2xl text-white relative overflow-hidden animate-slide-up">
                      <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 tobacco-none pointer-events-none"></div>
                      <h3 className="text-3xl font-black mb-8 relative z-10 flex items-center gap-3">
                        <span className="animate-float">💰</span> Fee Summary ({currentSession})
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10 relative z-10">
                          <div className="stagger-item bg-white/10 p-6 rounded-3xl border border-white/10 backdrop-blur-md" style={{ animationDelay: '200ms' }}>
                              <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2">Total Liability</p>
                              <p className="text-2xl font-black">
                                <AnimatedNumber value={studentFinancials.totalLiability} currency={currency} />
                              </p>
                          </div>
                          <div className="stagger-item bg-amber-500/10 p-6 rounded-3xl border border-amber-500/20 backdrop-blur-md" style={{ animationDelay: '300ms' }}>
                              <p className="text-[10px] font-black text-amber-300 uppercase tracking-widest mb-2">Back Fees</p>
                              <p className="text-2xl font-black text-amber-400">
                                <AnimatedNumber value={studentFinancials.backLogs} currency={currency} />
                              </p>
                          </div>
                          <div className="stagger-item bg-emerald-500/10 p-6 rounded-3xl border border-emerald-500/20 backdrop-blur-md" style={{ animationDelay: '400ms' }}>
                              <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest mb-2">Paid Total</p>
                              <p className="text-2xl font-black text-emerald-400">
                                <AnimatedNumber value={studentFinancials.paidTotal} currency={currency} />
                              </p>
                          </div>
                          <div className="stagger-item bg-rose-500/10 p-6 rounded-3xl border border-rose-500/20 backdrop-blur-md" style={{ animationDelay: '500ms' }}>
                              <p className="text-[10px] font-black text-rose-300 uppercase tracking-widest mb-2">Remaining Due</p>
                              <p className="text-2xl font-black text-rose-400">
                                <AnimatedNumber value={studentFinancials.dueAmount} currency={currency} />
                              </p>
                          </div>
                          <div className="stagger-item bg-white/5 p-6 rounded-3xl border border-white/5 backdrop-blur-md" style={{ animationDelay: '600ms' }}>
                              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Progress</p>
                              <p className="text-2xl font-black">{studentFinancials.progress}%</p>
                          </div>
                      </div>
                      <div className="relative z-10 w-full h-4 bg-white/10 rounded-full overflow-hidden shadow-inner">
                          <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-1000 shadow-lg animate-bar-glow" style={{ width: `${studentFinancials.progress}%` }}></div>
                      </div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-10 animate-slide-up" style={{ animationDelay: '400ms', animationFillMode: 'backwards' }}>
                      <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                        <span className="animate-float">🧾</span> Session Payments
                      </h3>
                      <div className="space-y-4">
                          {studentFinancials.history.slice(0, 3).map((fee, idx) => (
                              <div key={fee.id} className="stagger-item flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:scale-105 transition-transform" style={{ animationDelay: `${500 + (idx * 100)}ms` }}>
                                  <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-2xl shadow-sm">{fee.type === 'Tuition' ? '🎓' : '🧾'}</div>
                                      <div><p className="text-sm font-black text-slate-800">{fee.type}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{new Date(fee.date).toLocaleDateString()}</p></div>
                                  </div>
                                  <div className="text-right"><p className="text-lg font-black text-emerald-600">{currency}{fee.amount.toLocaleString()}</p></div>
                              </div>
                          ))}
                          {studentFinancials.history.length === 0 && <p className="text-center text-slate-400 italic">No payments recorded in this session</p>}
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Dashboard;