import React, { useState, useEffect, useMemo } from 'react';
import { AppData, AppSettings, FeeRecord, ExpenseRecord, Student, ViewState } from '../types';

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

const AnimatedNumber = ({ value, currency, duration = 2000 }: { value: number; currency: string; duration?: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(easeProgress * value));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <>{currency}{displayValue.toLocaleString()}</>;
};

const FinancialCard = ({ title, rawValue, currency, icon, gradient, delay }: any) => (
  <div className={`relative overflow-hidden rounded-3xl p-6 shadow-lg border border-white/20 text-white animate-slide-up ${gradient}`} style={{ animationDelay: `${delay}ms`, animationFillMode: 'backwards' }}>
      <div className="absolute -right-4 -top-4 text-8xl opacity-10 pointer-events-none">{icon}</div>
      <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="animate-float">{icon}</span>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{title}</p>
          </div>
          <h3 className="text-3xl font-black tracking-tight">
            <AnimatedNumber value={rawValue} currency={currency} />
          </h3>
      </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ 
  data, 
  currency, 
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
  const [auditDate, setAuditDate] = useState(new Date().toISOString().split('T')[0]);
  
  const currentSession = data.schoolProfile.currentSession;
  const isAdmin = userRole === 'ADMIN';

  const activeStudents = useMemo(() => data.students.filter((s) => !s.isDeleted && (!s.session || s.session === currentSession)), [data.students, currentSession]);
  const activeFees = useMemo(() => data.fees.filter((f) => !f.isDeleted && f.session === currentSession), [data.fees, currentSession]);
  const activeExpenses = useMemo(() => data.expenses ? data.expenses.filter(e => !e.isDeleted && e.session === currentSession) : [], [data.expenses, currentSession]);

  const totalRevenue = isAdmin ? activeFees.filter((f) => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0) : 0;
  const totalExpected = isAdmin ? activeStudents.reduce((sum, s) => sum + (s.totalAgreedFees || 0) + (s.backLogs || 0), 0) : 0;
  const totalDue = Math.max(0, totalExpected - totalRevenue);
  const totalExpenses = isAdmin ? activeExpenses.reduce((sum, e) => sum + e.amount, 0) : 0;
  const netProfit = totalRevenue - totalExpenses;

  // Audit Calculations
  const auditCollections = useMemo(() => activeFees.filter(f => f.status === 'Paid' && f.date === auditDate), [activeFees, auditDate]);
  const auditExpenses = useMemo(() => activeExpenses.filter(e => e.date === auditDate), [activeExpenses, auditDate]);
  const auditAdmissions = useMemo(() => activeStudents.filter(s => s.enrollmentDate === auditDate), [activeStudents, auditDate]);
  
  const auditInflow = auditCollections.reduce((sum, f) => sum + f.amount, 0);
  const auditOutflow = auditExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Defaulters
  const topDefaulters = useMemo(() => {
    if (!isAdmin) return [];
    return activeStudents.map(student => {
        const studentFees = activeFees.filter(f => f.studentId === student.id);
        const paid = studentFees.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);
        const due = ((student.totalAgreedFees || 0) + (student.backLogs || 0)) - paid;
        return { ...student, due };
    })
    .filter(s => s.due > 0)
    .sort((a, b) => b.due - a.due)
    .slice(0, 20);
  }, [activeStudents, activeFees, isAdmin]);

  const displayedDefaulters = showAllDefaulters ? topDefaulters : topDefaulters.slice(0, 5);

  // Calendar
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

  const handleDateClick = (day: number | null) => {
    if (!day || !isAdmin) return;
    const dStr = `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setAuditDate(dStr);
    setIsAuditModalOpen(true);
  };

  const getFeeIcon = (type: string) => {
    switch(type) {
      case 'Tuition': return '🎓';
      case 'Bus': return '🚌';
      case 'Books': return '📚';
      default: return '🧾';
    }
  };

  const getExpenseIcon = (cat: string) => cat === 'Salary' ? '👔' : cat === 'Utilities' ? '💡' : '📦';

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Dashboard 📊</h2>
          <p className="text-slate-500 font-medium">System status for {isAdmin ? 'Admin' : 'Student'} portal.</p>
        </div>
      </header>

      {/* --- STATS GRID --- */}
      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FinancialCard title="Collections" rawValue={totalRevenue} currency={currency} icon="💰" gradient="bg-gradient-to-br from-emerald-600 to-emerald-800" delay={0} />
            <FinancialCard title="Outstanding" rawValue={totalDue} currency={currency} icon="⏳" gradient="bg-gradient-to-br from-rose-600 to-rose-800" delay={100} />
            <FinancialCard title="Expenses" rawValue={totalExpenses} currency={currency} icon="💸" gradient="bg-gradient-to-br from-orange-500 to-orange-700" delay={200} />
            <FinancialCard title="Net Profit" rawValue={netProfit} currency={currency} icon="📈" gradient="bg-gradient-to-br from-indigo-600 to-blue-800" delay={300} />
        </div>
      )}

      {/* --- DEFAULTERS REGISTRY --- */}
      {isAdmin && (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                    <span className="p-2 bg-rose-100 text-rose-600 rounded-xl text-xl">⏳</span>
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
                            <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase">Profile</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-50">
                        {displayedDefaulters.map(s => (
                            <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 border overflow-hidden">
                                        {s.photo ? <img src={s.photo} className="w-full h-full object-cover" /> : <span className="flex h-full w-full items-center justify-center font-bold text-slate-400">{s.name.charAt(0)}</span>}
                                    </div>
                                    <span className="text-sm font-black text-slate-800">{s.name}</span>
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-indigo-600">Class {s.grade}</td>
                                <td className="px-6 py-4 text-sm font-black text-rose-600">{currency}{s.due.toLocaleString()}</td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => onViewStudentProfile?.(s.id)} className="w-8 h-8 bg-white border border-slate-200 text-indigo-600 rounded-lg flex items-center justify-center shadow-sm hover:bg-indigo-600 hover:text-white transition-all">👤</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {topDefaulters.length > 5 && (
                <div className="mt-6 flex justify-center">
                    <button 
                        onClick={() => setShowAllDefaulters(!showAllDefaulters)} 
                        className="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-slate-800 active:scale-95 transition-all"
                    >
                        {showAllDefaulters ? '🔼 View Less' : '🔽 View More Defaulters'}
                    </button>
                </div>
            )}
        </div>
      )}

      {/* --- CALENDAR SECTION --- */}
      <div className="bg-white rounded-[3rem] shadow-xl border border-slate-200 p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-indigo-100 border border-indigo-400">📅</div>
                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">{calendarDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h3>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                    <button onClick={() => changeMonth(-1)} className="w-10 h-10 bg-white hover:bg-indigo-600 hover:text-white rounded-xl transition-all font-black">◀</button>
                    <button onClick={() => changeMonth(1)} className="w-10 h-10 bg-white hover:bg-indigo-600 hover:text-white rounded-xl transition-all font-black">▶</button>
                </div>
            </div>
            <div className="grid grid-cols-7 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-3">
                {calendarDays.map((d, i) => {
                    const isToday = d === new Date().getDate() && calendarDate.getMonth() === new Date().getMonth() && calendarDate.getFullYear() === new Date().getFullYear();
                    return (
                        <div 
                            key={i} onClick={() => handleDateClick(d)}
                            className={`aspect-square flex flex-col items-center justify-center rounded-2xl transition-all cursor-pointer relative shadow-sm border ${
                                d ? isToday 
                                    ? 'bg-indigo-600 text-white shadow-indigo-200 ring-4 ring-indigo-50 border-indigo-600' 
                                    : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50' 
                                : 'opacity-0 pointer-events-none'
                            }`}
                        >
                            <span className="font-black text-base">{d}</span>
                        </div>
                    )
                })}
            </div>
            <div className="mt-8 pt-6 border-t border-slate-50 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Click any date to see collections, admissions & expenses 👆</p>
            </div>
      </div>

      {/* --- AUDIT MODAL (Optimized max-w-3xl) --- */}
      {isAuditModalOpen && isAdmin && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[200] flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsAuditModalOpen(false)}>
              <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col animate-scale-in border border-white/20" onClick={e => e.stopPropagation()}>
                  <div className="p-6 md:p-8 bg-gradient-to-r from-slate-900 to-indigo-950 text-white relative flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                      <div className="relative z-10 text-center md:text-left">
                          <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest">Day Audit Log</span>
                          <h2 className="text-2xl font-black tracking-tighter mt-1">{new Date(auditDate).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}</h2>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 relative z-10 justify-center">
                            <button onClick={() => onNavigateToSettings?.()} className="px-5 py-2 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 font-black text-[10px] uppercase tracking-widest transition-all">🖼️ Add Photo</button>
                            <button onClick={() => setIsAuditModalOpen(false)} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xl hover:bg-white/20 transition-all">✕</button>
                      </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/50 scrollbar-hide">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="bg-emerald-100/50 border border-emerald-100 p-5 rounded-3xl flex flex-col items-center">
                                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Inflow</p>
                                <p className="text-2xl font-black text-emerald-700">{currency}{auditInflow.toLocaleString()}</p>
                           </div>
                           <div className="bg-rose-100/50 border border-rose-100 p-5 rounded-3xl flex flex-col items-center">
                                <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-1">Total Outflow</p>
                                <p className="text-2xl font-black text-rose-700">{currency}{auditOutflow.toLocaleString()}</p>
                           </div>
                      </div>

                      <div className="space-y-6">
                          <div className="bg-white p-6 rounded-[2rem] border border-slate-200">
                               <h4 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-4 flex items-center gap-2">🎓 New Admissions ({auditAdmissions.length})</h4>
                               <div className="space-y-2">
                                   {auditAdmissions.map(s => (
                                       <div key={s.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                                            <span className="text-xs font-black text-slate-700 uppercase">{s.name}</span>
                                            <span className="text-[10px] font-bold text-indigo-600 bg-white px-2 py-0.5 rounded border">Class {s.grade}</span>
                                       </div>
                                   ))}
                                   {auditAdmissions.length === 0 && <p className="text-center text-xs text-slate-400 py-4 italic">No admissions on this date.</p>}
                               </div>
                          </div>

                          <div className="bg-white p-6 rounded-[2rem] border border-slate-200">
                               <h4 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-4 flex items-center gap-2">📥 Collections</h4>
                               <div className="space-y-2">
                                   {auditCollections.map(f => (
                                       <div key={f.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg">{getFeeIcon(f.type)}</span>
                                                <span className="text-xs font-black text-slate-700 uppercase">{data.students.find(s=>s.id===f.studentId)?.name || 'Archived'}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-black text-emerald-600">{currency}{f.amount.toLocaleString()}</span>
                                                <button onClick={() => onDeleteFee?.(f.id)} className="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">🗑️</button>
                                            </div>
                                       </div>
                                   ))}
                               </div>
                          </div>

                          <div className="bg-white p-6 rounded-[2rem] border border-slate-200">
                               <h4 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-4 flex items-center gap-2">📤 Expenses</h4>
                               <div className="space-y-2">
                                   {auditExpenses.map(e => (
                                       <div key={e.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg">{getExpenseIcon(e.category)}</span>
                                                <span className="text-xs font-black text-slate-700 uppercase">{e.title}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-black text-rose-600">{currency}{e.amount.toLocaleString()}</span>
                                                <button onClick={() => onDeleteExpense?.(e.id)} className="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">🗑️</button>
                                            </div>
                                       </div>
                                   ))}
                               </div>
                          </div>
                      </div>
                  </div>
                  <div className="p-6 bg-white border-t border-slate-100 flex justify-end">
                       <button onClick={() => setIsAuditModalOpen(false)} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all">Dismiss Log</button>
                  </div>
              </div>
          </div>
      )}

      {/* --- STUDENT SUMMARY (NON-ADMIN) --- */}
      {!isAdmin && (
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 rounded-[3rem] p-10 shadow-2xl text-white">
              <h3 className="text-2xl font-black mb-6">💰 My Fee Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div className="bg-white/10 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
                        <p className="text-[10px] font-black text-indigo-300 uppercase mb-2">Remaining Due</p>
                        <p className="text-3xl font-black">{currency}{totalDue.toLocaleString()}</p>
                   </div>
                   <div className="bg-emerald-500/10 p-6 rounded-3xl border border-emerald-500/20 backdrop-blur-md">
                        <p className="text-[10px] font-black text-emerald-300 uppercase mb-2">Total Paid</p>
                        <p className="text-3xl font-black">{currency}{totalRevenue.toLocaleString()}</p>
                   </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Dashboard;