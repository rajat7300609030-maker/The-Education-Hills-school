import React, { useState, useEffect, useMemo } from 'react';
import { AppData, AppSettings, FeeRecord, ExpenseRecord, Student } from '../types';

interface DashboardProps {
  data: AppData;
  currency: string;
  onUpdateSettings: (settings: AppSettings) => void;
  onNavigateToFees: () => void;
  onNavigateToExpenses: () => void;
  onViewStudentProfile?: (id: string) => void;
  onNavigateToSettings?: () => void;
  onDeleteFee?: (id: string) => void;
  onDeleteExpense?: (id: string) => void;
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
  onNavigateToSettings,
  onDeleteFee,
  onDeleteExpense,
  userRole = 'ADMIN', 
  currentStudentId 
}) => {
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [showAllDefaulters, setShowAllDefaulters] = useState(false);
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

  // --- Global Financial Calculations ---
  const totalRevenue = isAdmin ? activeFees.filter((f) => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0) : 0;
  const totalExpected = isAdmin ? activeStudents.reduce((sum, s) => sum + (s.totalAgreedFees || 0) + (s.backLogs || 0), 0) : 0;
  const totalDue = Math.max(0, totalExpected - totalRevenue);
  const totalExpenses = isAdmin ? activeExpenses.reduce((sum, e) => sum + e.amount, 0) : 0;
  const netProfit = totalRevenue - totalExpenses;

  // --- Audit Modal Stats (Dynamic based on auditDate) ---
  const auditCollections = useMemo(() => activeFees.filter(f => f.status === 'Paid' && f.date === auditDate), [activeFees, auditDate]);
  const auditExpenses = useMemo(() => activeExpenses.filter(e => e.date === auditDate), [activeExpenses, auditDate]);
  const auditAdmissions = useMemo(() => activeStudents.filter(s => s.enrollmentDate === auditDate), [activeStudents, auditDate]);
  
  const auditCollectionTotal = auditCollections.reduce((sum, f) => sum + f.amount, 0);
  const auditExpenseTotal = auditExpenses.reduce((sum, e) => sum + e.amount, 0);
  const auditNet = auditCollectionTotal - auditExpenseTotal;

  // Today totals for quick dashboard card
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCollectionTotal = useMemo(() => activeFees.filter(f => f.status === 'Paid' && f.date === todayStr).reduce((sum, f) => sum + f.amount, 0), [activeFees, todayStr]);
  const todayExpenseTotal = useMemo(() => activeExpenses.filter(e => e.date === todayStr).reduce((sum, e) => sum + e.amount, 0), [activeExpenses, todayStr]);

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

  const displayedDefaulters = useMemo(() => {
    return showAllDefaulters ? topDefaulters : topDefaulters.slice(0, 5);
  }, [topDefaulters, showAllDefaulters]);

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
    return { stats: stats.map(s => ({ ...s, percentage: totalCount > 0 ? Math.round((s.count / totalCount) * 100) : 0 })), gradient, total: totalCount };
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
      return { student, totalLiability, paidTotal, dueAmount, progress, history: [...paidFees].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), backLogs: student.backLogs || 0 };
  }, [isAdmin, currentStudentId, data.students, data.fees, currentSession]);

  // --- Recent Data ---
  const recentPayments = useMemo(() => isAdmin ? activeFees.filter(f => f.status === 'Paid').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5) : [], [activeFees, isAdmin]);
  const recentExpenses = useMemo(() => isAdmin ? activeExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5) : [], [activeExpenses, isAdmin]);

  // --- Slider State & Logic ---
  const [currentSlide, setCurrentSlide] = useState(0);
  const { imageSlider } = data.settings;
  useEffect(() => {
    if (imageSlider?.enabled && imageSlider.autoplay && imageSlider.images.length > 1) {
        const timer = setInterval(() => { setCurrentSlide(prev => (prev + 1) % imageSlider.images.length); }, imageSlider.interval);
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

  // Calendar collection helper
  const getCollectionOnDate = (day: number) => {
    const dStr = `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return activeFees.filter(f => f.status === 'Paid' && f.date === dStr).reduce((sum, f) => sum + f.amount, 0);
  };

  const handleDateClick = (day: number | null) => {
    if (!day || !isAdmin) return;
    const dStr = `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setAuditDate(dStr);
    setIsAuditModalOpen(true);
  };

  const handleSendReminder = (student: any) => {
    if (!student.phone) return;
    const message = `🔔 *FEE REMINDER* 🔔\n\nDear Parent,\nThis is a reminder regarding the pending fees for *${student.name}* (Class: ${student.grade}).\n\n💰 *Due Amount:* ${currency}${student.due.toLocaleString()}\n📅 *Session:* ${student.session || data.schoolProfile.currentSession}\n\nPlease clear the outstanding balance soon.\n\nRegards,\n*${data.schoolProfile.name}*`;
    const encodedMsg = encodeURIComponent(message);
    window.open(`https://wa.me/${student.phone.replace(/[^0-9]/g, '')}?text=${encodedMsg}`, '_blank');
  };

  /* Fix: Add missing getFeeIcon helper function to handle f.type icons */
  const getFeeIcon = (type: string) => {
    switch(type) {
      case 'Tuition': return '🎓';
      case 'Bus': return '🚌';
      case 'Books': return '📚';
      case 'Uniform': return '👔';
      default: return '🧾';
    }
  };

  const getExpenseIcon = (cat: string) => cat === 'Salary' ? '👔' : cat === 'Maintenance' ? '🛠️' : cat === 'Utilities' ? '💡' : cat === 'Supplies' ? '📦' : cat === 'Events' ? '🎉' : '🧾';
  const getMethodIcon = (method?: string) => method === 'Cash' ? '💵' : method === 'UPI' ? '📱' : method === 'Online' ? '🌐' : method === 'Bank Transfer' ? '🏦' : '💰';

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

      {/* --- SCHOOL PROFILE CARD --- */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden relative group transition-all duration-500 animate-scale-in">
          <div className="h-56 relative overflow-hidden group">
              {data.schoolProfile.banner ? (
                  <img src={data.schoolProfile.banner} alt="Banner" className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105" />
              ) : (
                  <div className="w-full h-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 relative">
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:30px_30px]"></div>
                  </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              <div className="absolute top-6 right-8 z-20"><div className="bg-white/10 backdrop-blur-xl border border-white/20 px-5 py-2 rounded-2xl flex flex-col items-end"><span className="text-[8px] font-black text-indigo-300 uppercase tracking-widest">Active Session</span><span className="text-sm font-black text-white">{data.schoolProfile.currentSession}</span></div></div>
          </div>
          <div className="px-8 pb-8 text-center relative">
              <div className="w-32 h-32 mx-auto -mt-16 bg-white rounded-[2rem] p-2 shadow-lg mb-4 relative rotate-3 hover:rotate-0 transition-transform duration-300 z-10 border-4 border-white">
                  <div className="w-full h-full rounded-[1.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                       <div className="w-full h-full flex items-center justify-center" style={{ transform: `scale(${(data.schoolProfile.logoSize || 100) / 100})` }}>
                        {data.schoolProfile.logo ? <img src={data.schoolProfile.logo} alt="Logo" className="w-full h-full object-contain p-2" /> : <span className="text-5xl animate-float">🏫</span>}
                      </div>
                  </div>
              </div>
              <div className="animate-slide-up space-y-1">
                  <h2 className="text-4xl font-black text-slate-800 tracking-tighter leading-none">{data.schoolProfile.name}</h2>
                  <p className="text-sm font-bold text-indigo-600/80 italic">"{data.schoolProfile.motto}"</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 mt-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 backdrop-blur-sm text-left font-black text-slate-800">
                        <div className="space-y-0.5"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Address</p><p className="text-xs truncate">{data.schoolProfile.address}</p></div>
                        <div className="space-y-0.5"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Established</p><p className="text-xs">{data.schoolProfile.establishedYear || '1996'}</p></div>
                        <div className="space-y-0.5"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Contact</p><p className="text-xs">{data.schoolProfile.contactNumber}</p></div>
                        <div className="space-y-0.5"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Students</p><p className="text-xs">{activeStudents.length} Enrolled</p></div>
                  </div>
              </div>
          </div>
      </div>

      {isAdmin && (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <FinancialCard title="Total Collection" rawValue={totalRevenue} currency={currency} icon="💰" gradient="bg-gradient-to-br from-emerald-600 to-emerald-800" delay={0} />
                <FinancialCard title="Total Due Fees" rawValue={totalDue} currency={currency} icon="⏳" gradient="bg-gradient-to-br from-rose-600 to-rose-800" delay={100} />
                <FinancialCard title="Total Expenses" rawValue={totalExpenses} currency={currency} icon="💸" gradient="bg-gradient-to-br from-orange-500 to-orange-700" delay={200} />
                <FinancialCard title={netProfit >= 0 ? "Net Profit" : "Net Loss"} rawValue={Math.abs(netProfit)} currency={currency} icon={netProfit >= 0 ? "📈" : "📉"} gradient={netProfit >= 0 ? "bg-gradient-to-br from-indigo-600 to-blue-800" : "bg-gradient-to-br from-red-800 to-red-950"} delay={300} />
            </div>

            {/* --- TODAY QUICK LEDGER --- */}
            <div onClick={() => { setAuditDate(todayStr); setIsAuditModalOpen(true); }} className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer hover:shadow-2xl hover:scale-[1.01] transition-all group">
                <div className="flex items-center gap-4 shrink-0">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-indigo-100 group-hover:rotate-12 transition-transform">📅</div>
                    <div><h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Daily Audit Log ➜</h3><p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Detailed Financial Analysis</p></div>
                </div>
                <div className="flex flex-1 gap-4 w-full">
                    <div className="flex-1 bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex flex-col items-center justify-center group-hover:bg-emerald-100 transition-all">
                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Today's Inflow</p>
                        <p className="text-3xl font-black text-emerald-700">{currency}{todayCollectionTotal.toLocaleString()}</p>
                    </div>
                    <div className="flex-1 bg-rose-50 p-4 rounded-2xl border border-rose-100 flex flex-col items-center justify-center group-hover:bg-rose-100 transition-all">
                        <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-1">Today's Outflow</p>
                        <p className="text-3xl font-black text-rose-700">{currency}{todayExpenseTotal.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* --- DUE FEES REGISTRY --- */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 animate-slide-up">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                        <span className="p-2 bg-rose-100 text-rose-600 rounded-xl text-xl shadow-sm border border-rose-50">⏳</span>
                        <span>{showAllDefaulters ? 'Top 20 Due Fees Registry' : 'Top Due Fees (Top 5)'}</span>
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase">Student</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase">Class</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase">Net Dues</th>
                                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-50">
                            {displayedDefaulters.map(s => (
                                <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 border overflow-hidden shrink-0">{s.photo ? <img src={s.photo} className="w-full h-full object-cover" /> : <span className="flex h-full w-full items-center justify-center font-black text-slate-400 uppercase">{s.name.charAt(0)}</span>}</div>
                                        <div><p className="text-sm font-black text-slate-800">{s.name}</p><p className="text-[10px] font-bold text-slate-400">{s.id}</p></div>
                                    </td>
                                    <td className="px-6 py-4"><span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">Class {s.grade}</span></td>
                                    <td className="px-6 py-4"><span className="text-sm font-black text-rose-600">{currency}{s.due.toLocaleString()}</span></td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <a href={`tel:${s.phone}`} className="w-8 h-8 bg-white border border-slate-200 text-blue-600 rounded-lg flex items-center justify-center shadow-sm">📞</a>
                                            <button onClick={() => handleSendReminder(s)} className="w-8 h-8 bg-white border border-slate-200 text-emerald-600 rounded-lg flex items-center justify-center shadow-sm">🔔</button>
                                            <button onClick={() => onViewStudentProfile?.(s.id)} className="w-8 h-8 bg-white border border-slate-200 text-indigo-600 rounded-lg flex items-center justify-center shadow-sm">👤</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {topDefaulters.length > 5 && (
                    <div className="mt-6 flex justify-center"><button onClick={() => setShowAllDefaulters(!showAllDefaulters)} className="px-8 py-2 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest">{showAllDefaulters ? '🔼 View Less' : '🔽 View More Defaulters'}</button></div>
                )}
            </div>
        </>
      )}

      {/* --- INSTITUTIONAL PORTAL (CALENDAR & QR) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Branded School Calendar */}
          <div className="lg:col-span-8 bg-white rounded-[3rem] shadow-xl border border-slate-200 p-8 md:p-10 flex flex-col group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-indigo-100 border border-indigo-400">📅</div>
                        <div><h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">{data.schoolProfile.name} Calendar</h3><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{calendarDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p></div>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-[1.25rem] border border-slate-100 shadow-inner">
                        <button onClick={() => changeMonth(-1)} className="w-10 h-10 bg-white hover:bg-indigo-600 hover:text-white rounded-xl transition-all font-black shadow-sm">◀</button>
                        <span className="font-black text-xs text-slate-600 px-4 min-w-[120px] text-center uppercase">{calendarDate.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                        <button onClick={() => changeMonth(1)} className="w-10 h-10 bg-white hover:bg-indigo-600 hover:text-white rounded-xl transition-all font-black shadow-sm">▶</button>
                    </div>
                </div>
                <div className="grid grid-cols-7 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="py-2">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 text-center gap-3 flex-1">
                    {calendarDays.map((d, i) => {
                        const isToday = d === new Date().getDate() && calendarDate.getMonth() === new Date().getMonth() && calendarDate.getFullYear() === new Date().getFullYear();
                        const dayCollection = d ? getCollectionOnDate(d) : 0;
                        return (
                            <div 
                                key={i} onClick={() => handleDateClick(d)}
                                className={`aspect-square flex flex-col items-center justify-center rounded-2xl transition-all group/day relative ${
                                    d ? isToday 
                                        ? 'bg-indigo-600 text-white shadow-2xl scale-110 ring-4 ring-indigo-100 z-10 cursor-pointer' 
                                        : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-indigo-200 cursor-pointer shadow-sm' 
                                    : 'opacity-0 pointer-events-none'
                                }`}
                            >
                                <span className="font-black text-base">{d}</span>
                                {isAdmin && d && dayCollection > 0 && (
                                    <span className="text-[8px] font-bold text-emerald-500 absolute bottom-1.5 whitespace-nowrap overflow-hidden max-w-full px-1 truncate">+{currency}{dayCollection.toLocaleString()}</span>
                                )}
                            </div>
                        )
                    })}
                </div>
                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10">
                    <span>Click any date for full month collection details 👆</span>
                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-600"></span> Current Day</span>
                </div>
          </div>
          {/* Institutional QR Card */}
          <div className="lg:col-span-4 bg-white rounded-[3rem] shadow-xl border border-slate-200 overflow-hidden flex flex-col group h-full">
              <div className="p-8 bg-slate-900 text-white relative h-32 flex flex-col justify-center"><div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div><h3 className="text-xl font-black uppercase tracking-tighter relative z-10">Institutional Portal</h3><p className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest relative z-10">Digital ID Verification</p></div>
              <div className="flex-1 p-8 flex flex-col items-center justify-center bg-slate-50/50">
                  <div className="bg-white p-4 rounded-[2.5rem] shadow-2xl border-4 border-slate-100 mb-6 relative">
                       <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`${data.schoolProfile.name}|${data.schoolProfile.address}`)}`} alt="School QR" className="w-48 h-48 rounded-xl" />
                  </div>
                  <h4 className="font-black text-slate-800 text-lg uppercase text-center">{data.schoolProfile.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase text-center mt-1">Official Institutional Profile</p>
              </div>
          </div>
      </div>

      {/* --- FLOATING LEDGER AUDIT MODAL (SIZE REDUCED TO max-w-4xl) --- */}
      {isAuditModalOpen && isAdmin && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[200] flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsAuditModalOpen(false)}>
              <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in border border-white/20" onClick={e => e.stopPropagation()}>
                  <div className="p-6 md:p-8 bg-gradient-to-r from-slate-900 to-indigo-950 text-white relative flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                      <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-2">
                              <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest">Digital Audit</span>
                              <span className="text-indigo-300 font-bold text-xs uppercase tracking-widest">{new Date(auditDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                          </div>
                          <h2 className="text-3xl font-black tracking-tighter">Performance Log</h2>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 relative z-10 w-full md:w-auto justify-center">
                            <button onClick={() => onNavigateToSettings?.()} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2">🖼️ Add Photo</button>
                            <input type="date" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 font-black text-xs text-white outline-none [color-scheme:dark]" value={auditDate} onChange={(e) => setAuditDate(e.target.value)} />
                            <button onClick={() => setIsAuditModalOpen(false)} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-xl transition-all border border-white/10 shadow-inner">✕</button>
                      </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50 space-y-8">
                      {/* STATS STRIP */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           <div className="bg-emerald-100/50 border border-emerald-100 p-4 rounded-[1.5rem] flex flex-col items-center">
                                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">Total Inflow</p>
                                <p className="text-2xl font-black text-emerald-700">{currency}{auditCollectionTotal.toLocaleString()}</p>
                           </div>
                           <div className="bg-rose-100/50 border border-rose-100 p-4 rounded-[1.5rem] flex flex-col items-center">
                                <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-0.5">Total Outflow</p>
                                <p className="text-2xl font-black text-rose-700">{currency}{auditExpenseTotal.toLocaleString()}</p>
                           </div>
                           <div className="bg-indigo-100/50 border border-indigo-100 p-4 rounded-[1.5rem] flex flex-col items-center">
                                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-0.5">Performance</p>
                                <p className={`text-2xl font-black ${auditNet >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{currency}{Math.abs(auditNet).toLocaleString()}</p>
                           </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* New Admissions */}
                          <div className="space-y-4">
                              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                  <span className="p-2 bg-blue-100 text-blue-600 rounded-xl shadow-sm border border-blue-50">🎓</span>
                                  <span>Admissions <span className="opacity-40 text-xs">({auditAdmissions.length})</span></span>
                              </h3>
                              <div className="space-y-2">
                                  {auditAdmissions.map(s => (
                                      <div key={s.id} className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group">
                                          <div className="flex items-center gap-2 min-w-0">
                                              <div className="w-8 h-8 rounded-full bg-slate-50 border overflow-hidden shrink-0">{s.photo ? <img src={s.photo} className="w-full h-full object-cover"/> : <span className="flex h-full w-full items-center justify-center font-black text-[10px] text-slate-400">{s.name.charAt(0)}</span>}</div>
                                              <div className="min-w-0"><p className="font-black text-slate-800 text-[11px] truncate uppercase tracking-tighter">{s.name}</p><p className="text-[8px] font-bold text-indigo-500 uppercase">Class {s.grade}</p></div>
                                          </div>
                                          <button onClick={() => onViewStudentProfile?.(s.id)} className="w-7 h-7 rounded-lg bg-slate-50 text-indigo-600 flex items-center justify-center border border-slate-100 hover:bg-indigo-600 hover:text-white transition-all text-xs">👤</button>
                                      </div>
                                  ))}
                                  {auditAdmissions.length === 0 && <div className="py-8 text-center text-slate-300 font-bold uppercase text-[8px] border-2 border-dashed border-slate-100 rounded-2xl">None</div>}
                              </div>
                          </div>

                          {/* Collection Detail */}
                          <div className="space-y-4">
                              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                  <span className="p-2 bg-emerald-100 text-emerald-600 rounded-xl shadow-sm border border-emerald-50">📥</span>
                                  <span>Collections <span className="opacity-40 text-xs">({auditCollections.length})</span></span>
                              </h3>
                              <div className="space-y-2">
                                  {auditCollections.map(f => (
                                      <div key={f.id} className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group">
                                          <div className="flex items-center gap-2 min-w-0">
                                              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">{getFeeIcon(f.type)}</div>
                                              <div className="min-w-0"><p className="font-black text-slate-800 text-[11px] truncate uppercase tracking-tighter">{data.students.find(s=>s.id===f.studentId)?.name || 'Archived'}</p><p className="text-[8px] font-bold text-slate-400 uppercase">{f.type}</p></div>
                                          </div>
                                          <div className="text-right flex items-center gap-2">
                                              <span className="font-black text-emerald-600 text-xs">{currency}{f.amount.toLocaleString()}</span>
                                              <button onClick={() => onDeleteFee?.(f.id)} className="w-6 h-6 rounded-lg bg-rose-50 text-rose-500 text-[8px] flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all">🗑️</button>
                                          </div>
                                      </div>
                                  ))}
                                  {auditCollections.length === 0 && <div className="py-8 text-center text-slate-300 font-bold uppercase text-[8px] border-2 border-dashed border-slate-100 rounded-2xl">None</div>}
                              </div>
                          </div>

                          {/* Expense Detail */}
                          <div className="space-y-4">
                              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                  <span className="p-2 bg-rose-100 text-rose-600 rounded-xl shadow-sm border border-rose-50">📤</span>
                                  <span>Expenses <span className="opacity-40 text-xs">({auditExpenses.length})</span></span>
                              </h3>
                              <div className="space-y-2">
                                  {auditExpenses.map(e => (
                                      <div key={e.id} className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group">
                                          <div className="flex items-center gap-2 min-w-0">
                                              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-sm">{getExpenseIcon(e.category)}</div>
                                              <div className="min-w-0"><p className="font-black text-slate-800 text-[11px] truncate uppercase tracking-tighter">{e.title}</p><p className="text-[8px] font-bold text-slate-400 uppercase">{e.category}</p></div>
                                          </div>
                                          <div className="text-right flex items-center gap-2">
                                              <span className="font-black text-rose-600 text-xs">{currency}{e.amount.toLocaleString()}</span>
                                              <button onClick={() => onDeleteExpense?.(e.id)} className="w-6 h-6 rounded-lg bg-rose-50 text-rose-500 text-[8px] flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all">🗑️</button>
                                          </div>
                                      </div>
                                  ))}
                                  {auditExpenses.length === 0 && <div className="py-8 text-center text-slate-300 font-bold uppercase text-[8px] border-2 border-dashed border-slate-100 rounded-2xl">None</div>}
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className="p-6 bg-white border-t border-slate-100 flex justify-end">
                       <button onClick={() => setIsAuditModalOpen(false)} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl">Dismiss Log</button>
                  </div>
              </div>
          </div>
      )}

      {!isAdmin && studentFinancials && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-6">
                  <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-[3rem] p-10 shadow-2xl text-white relative overflow-hidden">
                      <h3 className="text-3xl font-black mb-8">💰 Fee Summary ({currentSession})</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
                          <div className="bg-white/10 p-6 rounded-3xl border border-white/10"><p className="text-[10px] font-black text-indigo-300 uppercase mb-2">Total Liability</p><p className="text-2xl font-black"><AnimatedNumber value={studentFinancials.totalLiability} currency={currency} /></p></div>
                          <div className="bg-emerald-500/10 p-6 rounded-3xl border border-emerald-500/20"><p className="text-[10px] font-black text-emerald-300 uppercase mb-2">Paid Total</p><p className="text-2xl font-black text-emerald-400"><AnimatedNumber value={studentFinancials.paidTotal} currency={currency} /></p></div>
                          <div className="bg-rose-500/10 p-6 rounded-3xl border border-rose-500/20"><p className="text-[10px] font-black text-rose-300 uppercase mb-2">Remaining Due</p><p className="text-2xl font-black text-rose-400"><AnimatedNumber value={studentFinancials.dueAmount} currency={currency} /></p></div>
                      </div>
                      <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden shadow-inner"><div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-1000" style={{ width: `${studentFinancials.progress}%` }}></div></div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Dashboard;