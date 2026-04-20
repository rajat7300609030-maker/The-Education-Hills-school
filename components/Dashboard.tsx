import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { AppData, AppSettings, FeeRecord, ExpenseRecord, Student, ViewState } from '../types';
import AdSenseUnit from './AdSenseUnit';
import NotesBoard from './NotesBoard';
import { 
  CheckCircle2, 
  Receipt, 
  Calendar, 
  User, 
  GraduationCap, 
  TrendingUp, 
  Clock, 
  ArrowUpRight,
  Search,
  Filter,
  ChevronRight,
  RefreshCw,
  TrendingDown,
  Share2,
  ArrowDownRight,
  Download,
  FileText,
  History,
  CheckCircle,
  AlertCircle,
  Hash,
  Plus,
  StickyNote,
  Trash2,
  Pin,
  CalendarCheck,
  MoreHorizontal,
  Edit,
  CreditCard,
  Ban,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardProps {
  data: AppData;
  currency: string;
  onUpdateSettings: (settings: AppSettings) => void;
  onNavigateToFees: () => void;
  onNavigateToExpenses: () => void;
  onNavigateToEmployees: () => void;
  onViewStudentProfile?: (id: string) => void;
  onNavigateToSettings?: () => void;
  onDeleteFee?: (id: string) => void;
  onDeleteExpense?: (id: string) => void;
  onEditStudent?: (id: string) => void;
  onSoftDeleteStudent?: (id: string) => void;
  onRestoreStudent?: (id: string) => void;
  onPayFees?: (id: string) => void;
  onAddNote: (content: string, color: string) => void;
  onDeleteNote: (id: string) => void;
  onTogglePinNote: (id: string) => void;
  onLogoutPortal?: () => void;
  userRole?: 'ADMIN' | 'STUDENT' | 'EMPLOYEE';
  currentStudentId?: string;
  syncStatus?: 'synced' | 'syncing' | 'error';
  onManualSync?: () => Promise<void>;
}

// Reusable component for "0 to X" counting animation with smooth easing
const AnimatedNumber = ({ value, currency, duration = 2000 }: { value: number; currency: string; duration?: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let frameId: number;
    
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(easeProgress * value));
      if (progress < 1) {
        frameId = window.requestAnimationFrame(step);
      }
    };
    
    frameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frameId);
  }, [value, duration]);

  return <>{currency}{displayValue.toLocaleString()}</>;
};

const FinancialCard = ({ title, rawValue, currency, icon, gradient, delay, subValue }: any) => (
  <div className={`relative overflow-hidden rounded-[2rem] p-6 shadow-xl border border-white/20 text-white animate-slide-up hover:-translate-y-1 hover:shadow-2xl transition-all duration-500 cursor-default ${gradient}`} style={{ animationDelay: `${delay}ms`, animationFillMode: 'backwards' }}>
      <div className="absolute -right-4 -top-4 text-7xl opacity-10 pointer-events-none select-none group-hover:scale-110 transition-transform duration-700">{icon}</div>
      <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner border border-white/30 animate-float" style={{ animationDelay: `${delay}ms` }}>
                {icon}
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.25em] opacity-80">{title}</p>
          </div>
          <h3 className="text-2xl font-black tracking-tighter mb-1">
            <AnimatedNumber value={rawValue} currency={currency} />
          </h3>
          {subValue && (
            <div className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-white/40 animate-pulse"></span>
                <p className="text-[9px] font-bold opacity-70 tracking-wide">{subValue}</p>
            </div>
          )}
      </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ 
  data, 
  currency, 
  onNavigateToFees, 
  onNavigateToExpenses,
  onNavigateToEmployees,
  onViewStudentProfile,
  onNavigateToSettings,
  onDeleteFee,
  onDeleteExpense,
  onEditStudent,
  onSoftDeleteStudent,
  onRestoreStudent,
  onPayFees,
  onAddNote,
  onDeleteNote,
  onTogglePinNote,
  onLogoutPortal,
  userRole = 'ADMIN', 
  currentStudentId,
  syncStatus = 'synced',
  onManualSync
}) => {
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [showAllDefaulters, setShowAllDefaulters] = useState(false);
  const [auditDate, setAuditDate] = useState(new Date().toISOString().split('T')[0]);
  const [collectionsSearch, setCollectionsSearch] = useState('');
  const [collectionTypeFilter, setCollectionTypeFilter] = useState<'ALL' | string>('ALL');
  const [collectionsSortBy, setCollectionsSortBy] = useState<'date' | 'amount' | 'name'>('date');
  const [collectionsSortOrder, setCollectionsSortOrder] = useState<'asc' | 'desc'>('desc');
  const [collectionsStatusFilter, setCollectionsStatusFilter] = useState<'ALL' | 'Verified' | 'Pending'>('ALL');
  
  const currentSession = data.schoolProfile?.currentSession || '2024-25';
  const isAdmin = userRole === 'ADMIN';

  const activeStudents = useMemo(() => 
    data.students.filter((s) => !s.isDeleted && (!s.session || s.session === currentSession)), 
  [data.students, currentSession]);

  const activeFees = useMemo(() => data.fees.filter((f) => !f.isDeleted && f.session === currentSession), [data.fees, currentSession]);
  const activeExpenses = useMemo(() => data.expenses ? data.expenses.filter(e => !e.isDeleted && e.session === currentSession) : [], [data.expenses, currentSession]);

  // Global Financials
  const totalRevenue = useMemo(() => {
    if (isAdmin) {
      return activeFees.filter((f) => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);
    } else if (currentStudentId) {
      return activeFees.filter((f) => f.studentId === currentStudentId && f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);
    }
    return 0;
  }, [activeFees, isAdmin, currentStudentId]);

  const totalExpected = useMemo(() => {
    if (isAdmin) {
      return activeStudents.reduce((sum, s) => sum + (s.totalAgreedFees || 0) + (s.backLogs || 0), 0);
    } else if (currentStudentId) {
      const s = activeStudents.find(std => std.id === currentStudentId);
      return s ? (s.totalAgreedFees || 0) + (s.backLogs || 0) : 0;
    }
    return 0;
  }, [activeStudents, isAdmin, currentStudentId]);

  const totalDue = Math.max(0, totalExpected - totalRevenue);
  const totalExpenses = isAdmin ? activeExpenses.reduce((sum, e) => sum + e.amount, 0) : 0;
  const netProfit = totalRevenue - totalExpenses;

  // Session Progress
  const sessionProgress = totalExpected > 0 ? Math.round((totalRevenue / totalExpected) * 100) : 0;

  // Recent Data Memos
  const recentPayments = useMemo(() => {
    let filtered = activeFees
      .filter(f => f.status === 'Paid')
      .filter(f => {
        const s = data.students.find(std => std.id === f.studentId);
        const matchesSearch = s?.name.toLowerCase().includes(collectionsSearch.toLowerCase()) || !collectionsSearch;
        const matchesType = collectionTypeFilter === 'ALL' || f.type === collectionTypeFilter;
        // Mocking status for UI/UX demonstration since FeeRecord doesn't have a status field beyond 'Paid'
        // In a real app, we'd have a verification status. Let's assume all are verified for now or mock it.
        const matchesStatus = collectionsStatusFilter === 'ALL' || (collectionsStatusFilter === 'Verified'); 
        return matchesSearch && matchesType && matchesStatus;
      });

    return filtered.sort((a, b) => {
      let comparison = 0;
      if (collectionsSortBy === 'date') {
        comparison = new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (collectionsSortBy === 'amount') {
        comparison = b.amount - a.amount;
      } else if (collectionsSortBy === 'name') {
        const nameA = data.students.find(s => s.id === a.studentId)?.name || '';
        const nameB = data.students.find(s => s.id === b.studentId)?.name || '';
        comparison = nameA.localeCompare(nameB);
      }
      return collectionsSortOrder === 'desc' ? comparison : -comparison;
    });
  }, [activeFees, collectionsSearch, collectionTypeFilter, collectionsSortBy, collectionsSortOrder, collectionsStatusFilter, data.students]);

  const recentExpenses = useMemo(() => 
    activeExpenses
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5), 
  [activeExpenses]);

  // Premium Distribution Colors
  const distributionColors = [
    '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#f472b6', 
    '#06b6d4', '#8b5cf6', '#ec4899', '#fb923c', '#2dd4bf', 
    '#a855f7', '#64748b'
  ];

  // Student Distribution calculation with percentage and color assignment
  const studentDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    activeStudents.forEach(s => {
      counts[s.grade] = (counts[s.grade] || 0) + 1;
    });
    const total = activeStudents.length;
    return Object.entries(counts)
      // Sort classes in natural ascending order (e.g., Nursery -> LKG -> 1st -> 2nd)
      .sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true, sensitivity: 'base' }))
      .map(([grade, count], index) => ({
        grade,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        color: distributionColors[index % distributionColors.length]
      }));
  }, [activeStudents]);

  // SVG Doughnut Logic
  const chartSegments = useMemo(() => {
    let currentOffset = 0;
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    
    return studentDistribution.map(item => {
      const dash = (item.percentage / 100) * circumference;
      const offset = currentOffset;
      currentOffset -= dash;
      return { ...item, dash, offset, circumference };
    });
  }, [studentDistribution]);

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

  const displayedDefaulters = showAllDefaulters ? topDefaulters : topDefaulters.slice(0, 5);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayCollectionTotal = useMemo(() => activeFees.filter(f => f.status === 'Paid' && f.date === todayStr).reduce((sum, f) => sum + f.amount, 0), [activeFees, todayStr]);
  const todayExpenseTotal = useMemo(() => activeExpenses.filter(e => e.date === todayStr).reduce((sum, e) => sum + e.amount, 0), [activeExpenses, todayStr]);

  const auditCollections = useMemo(() => activeFees.filter(f => f.status === 'Paid' && f.date === auditDate), [activeFees, auditDate]);
  const auditExpenses = useMemo(() => activeExpenses.filter(e => e.date === auditDate), [activeExpenses, auditDate]);
  const auditAdmissions = useMemo(() => activeStudents.filter(s => s.enrollmentDate === auditDate), [activeStudents, auditDate]);
  const auditInflow = auditCollections.reduce((sum, f) => sum + f.amount, 0);
  const auditOutflow = auditExpenses.reduce((sum, e) => sum + e.amount, 0);
  const auditNet = auditInflow - auditOutflow;

  // Calculate trends vs previous day
  const performanceTrends = useMemo(() => {
    const prevDate = new Date(auditDate);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevDateStr = prevDate.toISOString().split('T')[0];
    
    const prevCollections = activeFees.filter(f => f.status === 'Paid' && f.date === prevDateStr);
    const prevExpenses = activeExpenses.filter(e => e.date === prevDateStr);
    
    const prevInflow = prevCollections.reduce((sum, f) => sum + f.amount, 0);
    const prevOutflow = prevExpenses.reduce((sum, e) => sum + e.amount, 0);
    const prevNet = prevInflow - prevOutflow;
    
    const calcTrend = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };
    
    return {
      inflow: calcTrend(auditInflow, prevInflow),
      outflow: calcTrend(auditOutflow, prevOutflow),
      net: calcTrend(auditNet, prevNet)
    };
  }, [auditDate, activeFees, activeExpenses, auditInflow, auditOutflow, auditNet]);

  const [calendarDate, setCalendarDate] = useState(new Date());
  
  // Today's Attendance Card States
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceClass, setAttendanceClass] = useState<string>('');
  const [activeMenuStudent, setActiveMenuStudent] = useState<string | null>(null);
  const [showDisabledModal, setShowDisabledModal] = useState(false);

  const disabledStudents = useMemo(() => 
    data.students.filter(s => s.isDeleted && (!s.session || s.session === currentSession)),
  [data.students, currentSession]);

  const filteredAttendanceList = useMemo(() => {
    if (!attendanceClass) return [];

    const dailyRecords = data.attendance.filter(r => r.date === attendanceDate);
    return activeStudents
      .filter(s => s.grade === attendanceClass)
      .map(s => {
        const record = dailyRecords.find(r => r.studentId === s.id);
        return {
          ...s,
          attendanceStatus: record?.status || 'Unmarked',
          remarks: record?.remarks || ''
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [activeStudents, data.attendance, attendanceDate, attendanceClass]);

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

  const getAttendanceForDate = useCallback((day: number) => {
    if (!currentStudentId || userRole !== 'STUDENT') return null;
    const dateStr = `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return data.attendance.find(a => a.studentId === currentStudentId && a.date === dateStr);
  }, [calendarDate, currentStudentId, userRole, data.attendance]);

  const handleSendReminder = (student: any) => {
    if (!student.phone) return;
    const message = `🔔 *FEE REMINDER* 🔔\n\nDear Parent,\nThis is a reminder regarding the pending fees for *${student.name}* (Class: ${student.grade}).\n\n💰 *Due Amount:* ${currency}${student.due.toLocaleString()}\n📅 *Session:* ${student.session || data.schoolProfile.currentSession}\n\nPlease clear the outstanding balance soon.\n\nRegards,\n*${data.schoolProfile.name}*`;
    const encodedMsg = encodeURIComponent(message);
    window.open(`https://wa.me/${(student.phone || '').replace(/[^0-9]/g, '')}?text=${encodedMsg}`, '_blank');
  };

  const getFeeIcon = (type: string) => {
    switch(type) {
      case 'Tuition': return '🎓';
      case 'Bus': return '🚌';
      case 'Books': return '📚';
      case 'Uniform': return '👔';
      default: return '🧾';
    }
  };

  const getExpenseIcon = (cat: string) => cat === 'Salary' ? '👔' : cat === 'Maintenance' ? '🛠️' : cat === 'Utilities' ? '💡' : cat === 'Supplies' ? '📦' : '🧾';

  const adsense = data.settings.adsense;

  return (
    <div className="space-y-8 pb-12 animate-fade-in overflow-x-hidden">
      <header className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <span>Overview <span className="text-indigo-600">Dashboard</span></span>
              <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 tracking-widest">
                {currentSession}
              </span>
              <span>📊</span>
            </h2>
            {syncStatus === 'syncing' && (
              <span className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full animate-pulse border border-blue-100">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                Syncing...
              </span>
            )}
            {syncStatus === 'synced' && (
              <span className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full border border-emerald-100">
                ✅
              </span>
            )}
            {syncStatus === 'error' && (
              <button 
                onClick={() => onManualSync?.()}
                className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded-full border border-red-100 hover:bg-red-100 transition-colors"
              >
                <span className="text-[10px]">⚠️</span>
                Sync Error - Retry
              </button>
            )}
          </div>
          <p className="text-slate-500 font-medium tracking-tight">Hello, {data.userProfile.name}. Have a productive day!</p>
        </div>
        <div className="hidden md:flex items-center gap-3 bg-white p-2.5 rounded-2xl shadow-sm border border-slate-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System ✅</span>
        </div>
      </header>

      {/* --- ADSENSE TOP BANNER --- */}
      {adsense?.enabled && adsense.clientId && adsense.units?.find(u => u.placement === 'dashboard_top') && (
        <div className="animate-fade-in">
          {(() => {
            const unit = adsense.units.find(u => u.placement === 'dashboard_top')!;
            return (
              <AdSenseUnit 
                clientId={adsense.clientId} 
                unitId={unit.unitId} 
                format={unit.format} 
                testMode={adsense.testMode}
                className="w-full"
              />
            );
          })()}
        </div>
      )}

      {/* --- 1ST POSITION: SCHOOL PROFILE CARD --- */}

      {isAdmin && (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <FinancialCard title="Total Collection" rawValue={totalRevenue} currency={currency} icon="💰" gradient="bg-gradient-to-br from-emerald-600 to-emerald-800" delay={0} subValue="Gross session inflow" />
                <FinancialCard title="Total Outstanding" rawValue={totalDue} currency={currency} icon="⏳" gradient="bg-gradient-to-br from-rose-600 to-rose-800" delay={100} subValue="Estimated net dues" />
                <FinancialCard title="Total Expenses" rawValue={totalExpenses} currency={currency} icon="💸" gradient="bg-gradient-to-br from-orange-500 to-orange-700" delay={200} subValue="Session maintenance costs" />
                <FinancialCard title="Net Balance" rawValue={netProfit} currency={currency} icon="📈" gradient="bg-gradient-to-br from-indigo-600 to-blue-800" delay={300} subValue="Current profit index" />
            </div>

            {/* --- TODAY'S ATTENDANCE CARD --- */}
            <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden relative group hover:shadow-2xl transition-all duration-500 mb-8 mt-8">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50/20 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none"></div>
                
                <div className="p-8 md:p-10 relative z-10">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center text-3xl shadow-xl shadow-indigo-100 border border-indigo-500 group-hover:scale-110 transition-transform">
                                <CalendarCheck className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Daily Attendance</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Real-time status tracking</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative group/input">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500">
                                    <Calendar size={14} />
                                </div>
                                <input 
                                    type="date"
                                    value={attendanceDate}
                                    onChange={(e) => setAttendanceDate(e.target.value)}
                                    className="pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-black uppercase text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all w-full sm:w-40"
                                />
                            </div>
                            <div className="relative group/input">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500">
                                    <Filter size={14} />
                                </div>
                                <select 
                                    value={attendanceClass}
                                    onChange={(e) => setAttendanceClass(e.target.value)}
                                    className="pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-black uppercase text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all appearance-none w-full sm:w-40"
                                >
                                    <option value="">Select Class</option>
                                    {data.classes.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto -mx-10 px-10">
                        <table className="w-full border-separate border-spacing-0">
                            <thead>
                                <tr className="uppercase">
                                    <th className="text-left text-[10px] font-black text-slate-400 tracking-[0.2em] pb-6 border-b border-slate-50 px-6">Student Identity</th>
                                    <th className="text-center text-[10px] font-black text-slate-400 tracking-[0.2em] pb-6 border-b border-slate-50 px-6">Current Status</th>
                                    <th className="text-right text-[10px] font-black text-slate-400 tracking-[0.2em] pb-6 border-b border-slate-50 px-6">Quick Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredAttendanceList.length > 0 ? (
                                    filteredAttendanceList.map((s, idx) => (
                                        <tr key={s.id} className="group/row hover:bg-slate-50/50 transition-colors">
                                            <td className="py-5 px-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl border border-slate-100 shadow-sm flex-shrink-0 overflow-hidden bg-white">
                                                        {s.photo ? (
                                                            <img src={s.photo} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xl font-black text-slate-200 bg-slate-50 uppercase">{s.name.charAt(0)}</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 tracking-tight leading-none mb-1.5">{s.name}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.grade} • ID: {s.id.slice(-6)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6 text-center">
                                                <div className="inline-flex items-center justify-center">
                                                    {s.attendanceStatus === 'Present' && (
                                                        <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                                            Present
                                                        </span>
                                                    )}
                                                    {s.attendanceStatus === 'Absent' && (
                                                        <span className="px-4 py-1.5 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-100 flex items-center gap-2">
                                                            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></span>
                                                            Absent
                                                        </span>
                                                    )}
                                                    {s.attendanceStatus === 'Late' && (
                                                        <span className="px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100 flex items-center gap-2">
                                                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                                                            Late
                                                        </span>
                                                    )}
                                                    {s.attendanceStatus === 'Leave' && (
                                                        <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 flex items-center gap-2">
                                                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                                                            Leave
                                                        </span>
                                                    )}
                                                    {s.attendanceStatus === 'Unmarked' && (
                                                        <span className="px-4 py-1.5 bg-slate-100 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200">
                                                            Unmarked
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-5 px-6 text-right relative">
                                                <div className="flex items-center justify-end">
                                                    <button 
                                                        onClick={() => setActiveMenuStudent(activeMenuStudent === s.id ? null : s.id)}
                                                        className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50 transition-all flex items-center justify-center"
                                                    >
                                                        <MoreHorizontal size={18} />
                                                    </button>

                                                    <AnimatePresence>
                                                        {activeMenuStudent === s.id && (
                                                            <>
                                                                <div 
                                                                    className="fixed inset-0 z-40" 
                                                                    onClick={() => setActiveMenuStudent(null)}
                                                                />
                                                                <motion.div 
                                                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                                    className="absolute right-6 top-16 w-56 bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 py-3 z-50 overflow-hidden ring-1 ring-slate-900/5"
                                                                >
                                                                    <div className="px-5 py-2 border-b border-slate-50 mb-2">
                                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Quick Options</p>
                                                                        <p className="text-xs font-bold text-slate-900 truncate tracking-tight">{s.name}</p>
                                                                    </div>

                                                                    <button 
                                                                        onClick={() => { setActiveMenuStudent(null); onViewStudentProfile?.(s.id); }}
                                                                        className="w-full px-5 py-2.5 text-left flex items-center gap-3 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors group/btn"
                                                                    >
                                                                        <User size={16} className="text-indigo-500 group-hover/btn:scale-110 transition-transform" />
                                                                        <span className="text-[10px] font-black uppercase tracking-widest">Profile View</span>
                                                                    </button>

                                                                    <button 
                                                                        onClick={() => { setActiveMenuStudent(null); onEditStudent?.(s.id); }}
                                                                        className="w-full px-5 py-2.5 text-left flex items-center gap-3 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors group/btn"
                                                                    >
                                                                        <Edit size={16} className="text-blue-500 group-hover/btn:scale-110 transition-transform" />
                                                                        <span className="text-[10px] font-black uppercase tracking-widest">Edit Records</span>
                                                                    </button>

                                                                    <button 
                                                                        onClick={() => { setActiveMenuStudent(null); onPayFees?.(s.id); }}
                                                                        className="w-full px-5 py-2.5 text-left flex items-center gap-3 text-slate-600 hover:bg-amber-50 hover:text-amber-600 transition-colors group/btn"
                                                                    >
                                                                        <CreditCard size={16} className="text-amber-500 group-hover/btn:scale-110 transition-transform" />
                                                                        <span className="text-[10px] font-black uppercase tracking-widest">Fee Ledger</span>
                                                                    </button>

                                                                    </motion.div>
                                                            </>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="py-24 text-center">
                                            <div className="flex flex-col items-center gap-6 max-w-sm mx-auto opacity-40">
                                                <div className="w-24 h-24 rounded-3xl bg-slate-50 flex items-center justify-center text-5xl grayscale border-4 border-dashed border-slate-200">
                                                    {!attendanceClass ? '☝️' : '🔍'}
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="text-lg font-black text-slate-800 tracking-tight uppercase">
                                                        {!attendanceClass ? 'Please select a class' : 'No records matching filters'}
                                                    </h4>
                                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest italic">
                                                        {!attendanceClass ? 'Choose a class from the dropdown above to view students' : 'Try changing the date or class filter'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {filteredAttendanceList.length > 0 && (
                        <div className="mt-10 pt-10 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-8">
                                <div className="flex flex-col">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Present Students</p>
                                    <p className="text-xl font-black text-emerald-600 leading-none">{filteredAttendanceList.filter(s => s.attendanceStatus === 'Present').length}</p>
                                </div>
                                <div className="w-px h-8 bg-slate-100 hidden sm:block"></div>
                                <div className="flex flex-col">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Absent Students</p>
                                    <p className="text-xl font-black text-rose-600 leading-none">{filteredAttendanceList.filter(s => s.attendanceStatus === 'Absent').length}</p>
                                </div>
                                <div className="w-px h-8 bg-slate-100 hidden sm:block"></div>
                                <div className="flex flex-col">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Unmarked Yet</p>
                                    <p className="text-xl font-black text-slate-400 leading-none">{filteredAttendanceList.filter(s => s.attendanceStatus === 'Unmarked').length}</p>
                                </div>
                            </div>
                            <button className="px-6 py-3 bg-slate-900 text-white rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:shadow-2xl hover:shadow-slate-200 transition-all active:scale-95 shadow-xl shadow-slate-100">
                                Download Full Report <Download size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* --- EMPLOYEES & STAFF ACCESS PORTAL CARD --- */}
            <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden relative group hover:shadow-2xl transition-all duration-500 mb-8 mt-8">
                <div className="absolute top-0 left-0 w-64 h-64 bg-amber-50/30 rounded-full blur-3xl pointer-events-none -ml-20 -mt-20"></div>
                <div className="p-8 md:p-10 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-amber-600 text-white rounded-[2rem] flex items-center justify-center text-4xl shadow-xl shadow-amber-100 border-4 border-white group-hover:rotate-6 transition-transform">
                            👔
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Employees & Staff</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Management & Access Portal</p>
                            <div className="flex items-center gap-3 mt-4">
                                <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black border border-amber-100">
                                    {data.employees.length} Active Staff
                                </div>
                                <div className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-black border border-slate-100">
                                    {data.employeeAttendance.filter(a => a.date === new Date().toISOString().split('T')[0]).length} Present Today
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={onNavigateToEmployees} 
                            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all active:scale-95"
                        >
                            Manage Staff ➞
                        </button>
                        <button 
                            onClick={() => onLogoutPortal?.()} 
                            className="px-8 py-4 bg-amber-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-amber-100 hover:bg-amber-700 transition-all active:scale-95"
                        >
                            Access Portal 🔒
                        </button>
                    </div>
                </div>
            </div>

            {/* Disabled Students Modal */}
            <AnimatePresence>
                {showDisabledModal && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDisabledModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="relative bg-white w-full max-w-2xl rounded-[3rem] p-8 md:p-10 shadow-2xl border border-slate-100 overflow-hidden"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-rose-100">
                                        <Ban size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Disabled Students</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Archive Management</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowDisabledModal(false)}
                                    className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all active:scale-95 border border-slate-100"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                                {disabledStudents.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                                        <div className="text-6xl mb-4">🍃</div>
                                        <p className="font-black text-slate-500 uppercase tracking-widest text-xs">No disabled students found</p>
                                    </div>
                                ) : (
                                    disabledStudents.map(student => (
                                        <div 
                                            key={student.id}
                                            className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-xl hover:shadow-slate-200 transition-all"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center overflow-hidden grayscale">
                                                    {student.photo ? (
                                                        <img src={student.photo} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                                                    ) : (
                                                        <span className="text-xl font-black text-slate-300">{student.name.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-slate-900 uppercase tracking-tight">{student.name}</h4>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Class {student.grade} • ID: {student.id}</p>
                                                </div>
                                            </div>
                                            
                                            <button 
                                                onClick={() => {
                                                    if (window.confirm(`Restore ${student.name}?`)) {
                                                        onRestoreStudent?.(student.id);
                                                    }
                                                }}
                                                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2"
                                            >
                                                <RefreshCw size={14} />
                                                Available
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* --- ADSENSE MIDDLE BANNER --- */}
            {adsense?.enabled && adsense.clientId && adsense.units?.find(u => u.placement === 'dashboard_middle') && (
              <div className="animate-fade-in">
                {(() => {
                  const unit = adsense.units.find(u => u.placement === 'dashboard_middle')!;
                  return (
                    <AdSenseUnit 
                      clientId={adsense.clientId} 
                      unitId={unit.unitId} 
                      format={unit.format} 
                      testMode={adsense.testMode}
                      className="w-full"
                    />
                  );
                })()}
              </div>
            )}

            {/* --- SESSION STATUS & STUDENT DISTRIBUTION & OUTFLOW --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- COLUMN 1: SESSION STATUS & PERFORMANCE LOG --- */}
                <div className="space-y-8">
                    {/* Session Status Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 flex flex-col justify-between group overflow-hidden relative hover:shadow-indigo-100/50 transition-all duration-700">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50/50 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20 group-hover:bg-indigo-100/50 transition-colors duration-700"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl shadow-inner border border-indigo-100 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                        📈
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Session Status</h3>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Real-time Progress</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-100 shadow-sm">{currentSession}</span>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="flex justify-between items-end mb-2">
                                    <div className="flex flex-col">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Fee Collection Progress</p>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Active Tracking</p>
                                        </div>
                                    </div>
                                    <p className="text-2xl font-black text-indigo-600 tracking-tighter">{sessionProgress}%</p>
                                </div>
                                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                                    <div className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600 rounded-full transition-all duration-1000 shadow-lg relative overflow-hidden" style={{ width: `${sessionProgress}%` }}>
                                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-stripe"></div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-8">
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white hover:shadow-lg hover:border-indigo-100 transition-all duration-500 group/sub">
                                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5 text-center group-hover/sub:text-indigo-400 transition-colors">Expected Revenue</p>
                                        <p className="text-lg font-black text-slate-800 text-center tracking-tighter">{currency}{totalExpected.toLocaleString()}</p>
                                    </div>
                                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 hover:bg-white hover:shadow-lg hover:border-emerald-200 transition-all duration-500 group/sub">
                                        <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1 text-center group-hover/sub:text-emerald-400 transition-colors">Total Realized</p>
                                        <p className="text-lg font-black text-emerald-700 text-center tracking-tighter">{currency}{totalRevenue.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Performance Log Card with Date Filter */}
                    <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl border border-slate-100 flex flex-col items-center justify-between gap-6 hover:shadow-indigo-100/50 transition-all duration-500 group overflow-hidden relative">
                        {/* Decorative background elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/40 rounded-full blur-[60px] pointer-events-none -mr-10 -mt-10 group-hover:bg-indigo-100/40 transition-colors duration-700"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-50/30 rounded-full blur-[40px] pointer-events-none -ml-5 -mb-5 group-hover:bg-emerald-100/30 transition-colors duration-700"></div>
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full relative z-10 gap-4">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-2xl flex items-center justify-center text-xl shadow-xl shadow-indigo-100 border border-indigo-500 group-hover:rotate-6 transition-transform duration-500 shrink-0">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight truncate leading-none">Performance Log</h3>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] truncate">Audit Intelligence</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-slate-50/80 backdrop-blur-sm p-3 rounded-xl border border-slate-100 shadow-inner w-full sm:w-auto justify-between sm:justify-start">
                                <div className="flex items-center gap-2">
                                    <button 
                                        className="p-2 bg-white text-slate-400 rounded-lg border border-slate-100 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm active:scale-90 group/btn"
                                        title="Download Report"
                                    >
                                        <Download className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                    </button>
                                    <button 
                                        onClick={() => setAuditDate(new Date().toISOString().split('T')[0])}
                                        className="p-2 bg-white text-slate-400 rounded-lg border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm active:scale-90 group/btn"
                                        title="Reset to Today"
                                    >
                                        <RefreshCw className="w-4 h-4 group-hover/btn:rotate-180 transition-transform duration-500" />
                                    </button>
                                </div>
                                <div className="h-8 w-px bg-slate-200 mx-0.5 hidden sm:block"></div>
                                <div className="relative group/date">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-indigo-500 pointer-events-none z-10" />
                                    <input 
                                        type="date" 
                                        value={auditDate}
                                        onChange={(e) => setAuditDate(e.target.value)}
                                        className="text-[11px] font-black text-indigo-700 bg-white pl-9 pr-4 py-2 rounded-lg border border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 transition-all cursor-pointer shadow-sm appearance-none relative z-0"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 w-full relative z-10">
                            {/* Inflow Metric */}
                            <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 flex items-center justify-between hover:bg-white hover:shadow-xl hover:border-emerald-200 transition-all duration-500 cursor-pointer group/metric shadow-sm" onClick={() => setIsAuditModalOpen(true)}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shadow-inner border border-emerald-100 group-hover/metric:scale-110 group-hover/metric:rotate-3 transition-all duration-500">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Total Collection</p>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-2xl font-black text-slate-800 leading-none tracking-tighter">{currency}{auditInflow.toLocaleString()}</p>
                                            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black ${performanceTrends.inflow >= 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                                {performanceTrends.inflow >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                                {Math.abs(performanceTrends.inflow).toFixed(0)}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover/metric:bg-emerald-600 group-hover/metric:text-white transition-all duration-500 shadow-sm">
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>

                            {/* Outflow Metric */}
                            <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 flex items-center justify-between hover:bg-white hover:shadow-xl hover:border-rose-200 transition-all duration-500 cursor-pointer group/metric shadow-sm" onClick={() => setIsAuditModalOpen(true)}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 shadow-inner border border-rose-100 group-hover/metric:scale-110 group-hover/metric:-rotate-3 transition-all duration-500">
                                        <TrendingDown className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Total Expenses</p>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-2xl font-black text-slate-800 leading-none tracking-tighter">{currency}{auditOutflow.toLocaleString()}</p>
                                            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black ${performanceTrends.outflow <= 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                                {performanceTrends.outflow <= 0 ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                                                {Math.abs(performanceTrends.outflow).toFixed(0)}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover/metric:bg-rose-600 group-hover/metric:text-white transition-all duration-500 shadow-sm">
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>

                            {/* Net Performance */}
                            <div className={`p-6 rounded-2xl border flex items-center justify-between hover:shadow-xl transition-all duration-500 cursor-pointer group/metric relative overflow-hidden ${auditNet >= 0 ? 'bg-gradient-to-br from-indigo-600 to-violet-800 border-indigo-400 text-white shadow-indigo-100' : 'bg-gradient-to-br from-amber-500 to-rose-700 border-amber-400 text-white shadow-amber-100'}`} onClick={() => setIsAuditModalOpen(true)}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] -mr-5 -mt-5 group-hover:scale-125 transition-transform duration-700"></div>
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white shadow-inner border border-white/30 group-hover/metric:scale-110 group-hover/metric:rotate-12 transition-all duration-500">
                                        <History className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-white/80 uppercase tracking-[0.3em] mb-1">Net Performance</p>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-3xl font-black leading-none tracking-tighter">{currency}{auditNet.toLocaleString()}</p>
                                            <div className="flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-[9px] font-black border border-white/20 shadow-lg">
                                                {performanceTrends.net >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                                {Math.abs(performanceTrends.net).toFixed(0)}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2 relative z-10">
                                    <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-white/20 shadow-inner group-hover/metric:bg-white/30 transition-colors">
                                        {auditNet >= 0 ? 'Surplus' : 'Deficit'}
                                    </div>
                                    <p className="text-[8px] font-bold text-white/60 uppercase tracking-[0.2em]">vs Yesterday</p>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => setIsAuditModalOpen(true)}
                            className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.3em] border border-slate-800 hover:bg-indigo-600 hover:border-indigo-500 transition-all duration-500 active:scale-95 shadow-xl shadow-indigo-50 flex items-center justify-center gap-3 group/btn relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                            Explore Audit <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* --- COLUMN 2: STUDENT DISTRIBUTION --- */}
                <div className="bg-white rounded-[2rem] p-6 shadow-2xl border border-slate-100 flex flex-col group overflow-hidden relative hover:shadow-indigo-100/50 transition-all duration-700">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/40 rounded-full blur-[100px] pointer-events-none opacity-60 -mr-20 -mt-20 group-hover:bg-indigo-100/40 transition-colors duration-700"></div>
                    
                    <div className="relative z-10 flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-2xl flex items-center justify-center text-2xl shadow-2xl shadow-indigo-200 border border-indigo-500 group-hover:rotate-6 transition-transform duration-500">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-800 tracking-tight leading-tight uppercase">
                                    Student<br/><span className="text-indigo-600">Distribution</span>
                                </h3>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Class Analytics</p>
                            </div>
                        </div>
                        <div className="bg-slate-50/80 backdrop-blur-sm px-3 py-2 rounded-xl border border-slate-100 shadow-inner">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block text-center mb-0.5">ACTIVE</span>
                            <span className="text-xs font-black text-indigo-600 block text-center">{studentDistribution.length} CLASSES</span>
                        </div>
                    </div>

                    {/* Chart Container */}
                    <div className="relative flex justify-center items-center mb-10 group/chart">
                        <div className="absolute inset-0 bg-indigo-50/40 rounded-full blur-[100px] animate-pulse-subtle group-hover/chart:scale-110 transition-transform duration-1000"></div>
                        <svg className="w-48 h-48 drop-shadow-3xl relative z-10" viewBox="0 0 160 160">
                            {chartSegments.map((segment, idx) => (
                                <circle
                                    key={idx}
                                    cx="80" cy="80" r="70"
                                    fill="transparent"
                                    stroke={segment.color}
                                    strokeWidth="18"
                                    strokeDasharray={`${segment.dash - 2} ${segment.circumference - (segment.dash - 2)}`}
                                    strokeDashoffset={segment.offset}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000 ease-out hover:stroke-[22px] cursor-pointer"
                                />
                            ))}
                            {/* Inner hole */}
                            <circle cx="80" cy="80" r="52" fill="white" className="shadow-inner" />
                        </svg>
                        
                        {/* Center Text */}
                        <div className="absolute flex flex-col items-center justify-center text-center z-20">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-0.5">TOTAL</p>
                            <p className="text-3xl font-black text-slate-800 tracking-tighter leading-none">{activeStudents.length}</p>
                            <p className="text-[8px] font-black text-indigo-600 uppercase tracking-widest mt-1.5 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 shadow-sm">STUDENTS</p>
                        </div>
                    </div>

                    {/* Grid List */}
                    <div className="grid grid-cols-2 gap-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                        {studentDistribution.map((item) => (
                            <div key={item.grade} className="bg-slate-50/50 rounded-2xl p-3.5 border border-slate-100 flex flex-col justify-center gap-2 hover:bg-white hover:shadow-2xl hover:border-indigo-100 transition-all group/item cursor-default shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full shadow-md animate-pulse" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate max-w-[70px]">{item.grade}</span>
                                    </div>
                                    <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">{item.percentage}%</span>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-base font-black text-slate-800">{item.count}</span>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Students</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {studentDistribution.length === 0 && (
                        <div className="py-12 text-center text-slate-300 italic text-xs uppercase font-black tracking-[0.3em] opacity-50">No active enrollments.</div>
                    )}
                </div>

                {/* --- COLUMN 3: OUTFLOW ANALYSIS --- */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 flex flex-col group overflow-hidden relative hover:shadow-2xl transition-all duration-500">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-rose-50/30 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-rose-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-rose-100 border border-rose-500 group-hover:rotate-6 transition-transform">
                                    📉
                                </div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight">
                                    Outflow<br/><span className="text-rose-600">Analysis</span>
                                </h3>
                            </div>
                            <button onClick={onNavigateToExpenses} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100">View All ➜</button>
                        </div>
                        <div className="space-y-4">
                            {recentExpenses.length > 0 ? recentExpenses.map((exp) => (
                                <div key={exp.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-xl hover:border-rose-100 transition-all group/item cursor-default">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="text-xl bg-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-md shrink-0 border border-slate-50 group-hover/item:scale-110 transition-transform">
                                            {getExpenseIcon(exp.category)}
                                        </div>
                                        <div className="min-w-0">
                                            <span className="text-xs font-black text-slate-700 uppercase tracking-tight block truncate pr-2">{exp.title}</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(exp.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">{exp.category}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-base font-black text-rose-600 whitespace-nowrap pl-2">{currency}{exp.amount.toLocaleString()}</span>
                                </div>
                            )) : (
                                <div className="py-12 text-center text-slate-300 italic text-xs uppercase font-bold tracking-[0.3em] opacity-50">No expenses recorded.</div>
                            )}
                        </div>
                        {recentExpenses.length > 0 && (
                            <div className="mt-8 flex flex-col gap-4">
                                <button 
                                    onClick={onNavigateToExpenses}
                                    className="w-full py-4 bg-slate-50 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] border border-slate-100 hover:bg-rose-600 hover:text-white hover:border-rose-500 transition-all active:scale-95 shadow-sm"
                                >
                                    🔽 Explore Full Expenditure
                                </button>
                                <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Session Total</p>
                                        <p className="text-2xl font-black text-rose-600 leading-none">{currency}{totalExpenses.toLocaleString()}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100 animate-pulse">💸</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- RECENT PAYMENTS (FEE COLLECTIONS) --- */}
            <div className="relative group/main">
                {/* High Glossy Border Wrapper */}
                <div className="absolute -inset-[1px] bg-gradient-to-br from-white via-slate-200/50 to-white/80 rounded-[2rem] blur-[1px] opacity-70 group-hover/main:opacity-100 transition-opacity duration-1000"></div>
                
                <div className="bg-white/90 backdrop-blur-3xl rounded-3xl shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] border border-white/60 p-6 md:p-8 hover:shadow-indigo-500/20 transition-all duration-1000 group overflow-hidden relative">
                    {/* Glossy Shine Reflection */}
                    <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/40 to-transparent rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-[2000ms] pointer-events-none z-20"></div>
                    
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-amber-500 opacity-40"></div>
                    <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-emerald-50/40 rounded-full blur-[120px] pointer-events-none -ml-32 -mt-32 opacity-70"></div>
                    
                    <div className="relative z-10 flex flex-col mb-6 gap-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-950 text-white rounded-xl flex items-center justify-center text-xl shadow-2xl shadow-slate-200 border border-slate-800 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-700">
                                <Receipt className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tighter leading-none uppercase">Recent Collections</h3>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Live Institutional Ledger</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative flex-1 min-w-[240px] group/search">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within/search:text-indigo-500 transition-colors" />
                                <input 
                                    type="text"
                                    placeholder="Search student name or ID..."
                                    value={collectionsSearch}
                                    onChange={(e) => setCollectionsSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white/50 backdrop-blur-md border border-white/80 ring-1 ring-slate-200/30 rounded-xl text-[10px] font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-300 transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]"
                                />
                            </div>

                            {/* Filtered Total - Integrated into Header */}
                            <div className="flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-md rounded-xl border border-white/80 shadow-[0_4px_12px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.8)]">
                                <div className="text-right">
                                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.25em] mb-0.5">FILTERED TOTAL</p>
                                    <p className="text-base font-black text-emerald-600 tracking-tighter font-mono">
                                        {currency}{recentPayments
                                            .reduce((sum, f) => sum + f.amount, 0)
                                            .toLocaleString()}
                                    </p>
                                </div>
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-inner">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="relative z-10 max-h-[800px] overflow-y-auto pr-4 custom-scrollbar space-y-3">
                    {recentPayments.length > 0 ? (
                        recentPayments.map((f, idx) => {
                            const s = data.students.find(std => std.id === f.studentId);
                            
                            // Calculate student progress to determine color (matching StudentProfile logic)
                            const studentProgress = s ? (() => {
                                const totalAgreed = s.totalAgreedFees || 0;
                                const backLogs = s.backLogs || 0;
                                const totalLiability = totalAgreed + backLogs;
                                const studentPaidTotal = data.fees
                                    .filter(fee => fee.studentId === s.id && fee.status === 'Paid' && !fee.isDeleted)
                                    .reduce((sum, fee) => sum + fee.amount, 0);
                                return totalLiability > 0 ? Math.round((studentPaidTotal / totalLiability) * 100) : 0;
                            })() : 0;
                            
                            const isCompleted = studentProgress >= 100;
                            const colorClass = isCompleted ? 'emerald' : 'indigo';
                            const gradientClass = isCompleted 
                                ? 'bg-gradient-to-br from-emerald-500 to-teal-400' 
                                : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-700';

                            return (
                                <div key={f.id} className={`group/item relative bg-white rounded-3xl border border-slate-200 hover:border-${colorClass}-400 hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden`}
                                    onClick={() => s && onViewStudentProfile?.(s.id)}
                                    style={{ animationDelay: `${idx * 30}ms` }}
                                >
                                    {/* Top Accent Gradient - Matching Profile Header */}
                                    <div className={`absolute top-0 left-0 w-full h-1 ${gradientClass} opacity-80 group-hover:h-1.5 transition-all duration-500`}></div>

                                    <div className="flex flex-col lg:flex-row items-center p-3.5 gap-4">
                                        {/* Student Profile - Circular Avatar like Profile Card */}
                                        <div className="flex items-center gap-3 flex-1 min-w-0 w-full lg:w-auto">
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-full border-2 border-white bg-slate-100 shadow-md overflow-hidden group-hover:scale-105 transition-all duration-500">
                                                    {s?.photo ? (
                                                        <img src={s.photo} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-xl bg-slate-50 text-slate-300">👤</div>
                                                    )}
                                                </div>
                                                <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 ${gradientClass} rounded-full border-2 border-white flex items-center justify-center text-white shadow-lg`}>
                                                    <CheckCircle className="w-2.5 h-2.5" />
                                                </div>
                                            </div>
                                            
                                            <div className="min-w-0">
                                                <h4 className={`text-base font-black text-slate-800 truncate group-hover:text-${colorClass}-600 transition-colors tracking-tight`}>
                                                    {s?.name || 'Archived Student'}
                                                </h4>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[8px] font-black uppercase tracking-widest rounded-md border border-slate-200">Class {s?.grade || 'N/A'}</span>
                                                    <span className={`px-1.5 py-0.5 bg-${colorClass}-50 text-${colorClass}-600 text-[8px] font-black uppercase tracking-widest rounded-md border border-${colorClass}-100`}>#{s?.id.slice(-6).toUpperCase() || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Transaction Details - High Contrast Bento Style */}
                                        <div className="flex flex-col lg:items-end gap-0.5 px-4 lg:border-l border-slate-100 w-full lg:w-auto">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount Received</span>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xl font-black text-slate-900 font-mono tracking-tighter group-hover:text-${colorClass}-500 transition-colors`}>
                                                    {currency}{f.amount.toLocaleString()}
                                                </span>
                                                <div className={`px-2 py-0.5 ${gradientClass} text-white rounded-md text-[8px] font-black uppercase tracking-widest shadow-sm`}>
                                                    {f.type}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Date & Actions */}
                                        <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
                                            <div className="text-left lg:text-right">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Date</p>
                                                <p className="text-[10px] font-bold text-slate-600 italic">
                                                    {new Date(f.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                    }}
                                                    className={`w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg hover:bg-${colorClass}-600 hover:-translate-y-1 transition-all active:scale-95 group/btn`}
                                                    title="Download Receipt"
                                                >
                                                    <Download className="w-4 h-4 group-hover/btn:animate-bounce" />
                                                </button>
                                                <div className={`w-10 h-10 rounded-xl bg-slate-50 text-slate-300 flex items-center justify-center border border-slate-100 group-hover:bg-${colorClass}-50 group-hover:text-${colorClass}-600 transition-all shadow-inner`}>
                                                    <ChevronRight className="w-6 h-6" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-24 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 border-2 border-dashed border-slate-200 group-hover:border-indigo-200 transition-colors">
                                <Search className="w-8 h-8 text-slate-300 group-hover:text-indigo-300 transition-colors" />
                            </div>
                            <h4 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-2">No results found</h4>
                            <p className="text-[11px] text-slate-400 max-w-[220px] leading-relaxed">We couldn't find any collections matching your current search or filters.</p>
                            <button 
                                onClick={() => {
                                    setCollectionsSearch('');
                                    setCollectionTypeFilter('ALL');
                                    setCollectionsStatusFilter('ALL');
                                }}
                                className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
                            >
                                Reset All Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
        <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 p-10 hover:shadow-2xl transition-all duration-500 group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50/30 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
                <div className="relative z-10 flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-rose-600 text-white rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-rose-100 border border-rose-500 group-hover:scale-110 transition-transform">
                            ⏳
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase leading-none">
                                {showAllDefaulters ? 'Top 20 Due Fees Registry' : 'Top Due Fees (Top 5)'}
                            </h3>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Outstanding Balances</p>
                        </div>
                    </div>
                    <div className="bg-rose-50 px-4 py-2 rounded-2xl border border-rose-100 shadow-sm">
                        <span className="text-[8px] font-black text-rose-600 uppercase tracking-widest block text-center mb-0.5">ACTION</span>
                        <span className="text-xs font-black text-rose-700 block text-center">REQUIRED</span>
                    </div>
                </div>
                <div className="overflow-x-auto relative z-10">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student Profile</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Class / Grade</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Net Dues</th>
                                <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Quick Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {displayedDefaulters.map(s => (
                                <tr key={s.id} className="group/row hover:bg-rose-50/30 transition-all">
                                    <td className="px-6 py-6 whitespace-nowrap">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 border-2 border-white shadow-md overflow-hidden shrink-0 group-hover/row:scale-110 transition-transform">
                                                {s.photo ? <img src={s.photo} className="w-full h-full object-cover" /> : <div className="flex h-full w-full items-center justify-center font-black text-slate-400 text-xl">{s.name.charAt(0)}</div>}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-black text-slate-800 uppercase tracking-tight truncate">{s.name}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ID: {s.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className="inline-flex items-center px-4 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-[10px] font-black border border-indigo-100 uppercase tracking-wider shadow-sm">
                                            Class {s.grade}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-base font-black text-rose-600 tracking-tight">{currency}{s.due.toLocaleString()}</span>
                                            <span className="text-[7px] font-black text-rose-500/50 uppercase tracking-widest">Pending</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <div className="flex justify-center gap-3">
                                            <a href={`tel:${s.phone}`} className="w-11 h-11 bg-white border border-slate-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-md hover:bg-blue-600 hover:text-white transition-all group-hover/row:scale-105" title="Call Parent">📞</a>
                                            <button onClick={() => handleSendReminder(s)} className="w-11 h-11 bg-white border border-slate-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-md hover:bg-emerald-600 hover:text-white transition-all group-hover/row:scale-105" title="WhatsApp Reminder">🔔</button>
                                            <button onClick={() => onViewStudentProfile?.(s.id)} className="w-11 h-11 bg-white border border-slate-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-md hover:bg-indigo-600 hover:text-white transition-all group-hover/row:scale-105" title="View Profile">👤</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {topDefaulters.length > 5 && (
                    <div className="mt-8 flex justify-center">
                        <button 
                            onClick={() => setShowAllDefaulters(!showAllDefaulters)} 
                            className="px-10 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-slate-800 active:scale-95 transition-all"
                        >
                            {showAllDefaulters ? '🔼 View Less' : '🔽 View More Defaulters'}
                        </button>
                    </div>
                )}
            </div>
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-white rounded-[3rem] shadow-xl border border-slate-100 p-10 flex flex-col group overflow-hidden relative hover:shadow-2xl transition-all duration-500">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 relative z-10">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center text-3xl shadow-xl shadow-indigo-100 border border-indigo-400 group-hover:rotate-3 transition-transform">
                            📅
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase leading-none">
                                {calendarDate.toLocaleDateString(undefined, { month: 'long' })}
                                <span className="block text-indigo-600 text-sm mt-1">{calendarDate.getFullYear()}</span>
                            </h3>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Academic Schedule</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-[1.5rem] border border-slate-100 shadow-inner">
                        <button onClick={() => changeMonth(-1)} className="w-11 h-11 bg-white hover:bg-indigo-600 hover:text-white rounded-xl transition-all font-black shadow-md flex items-center justify-center text-lg active:scale-90">◀</button>
                        <span className="font-black text-[11px] text-slate-600 px-6 min-w-[140px] text-center uppercase tracking-[0.2em]">{calendarDate.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                        <button onClick={() => changeMonth(1)} className="w-11 h-11 bg-white hover:bg-indigo-600 hover:text-white rounded-xl transition-all font-black shadow-md flex items-center justify-center text-lg active:scale-90">▶</button>
                    </div>
                </div>
                <div className="grid grid-cols-7 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="py-2">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 text-center gap-4 flex-1">
                    {calendarDays.map((d, i) => {
                        const isToday = d === new Date().getDate() && calendarDate.getMonth() === new Date().getMonth() && calendarDate.getFullYear() === new Date().getFullYear();
                        const attendance = d ? getAttendanceForDate(d) : null;
                        const isPresent = attendance?.status === 'Present';
                        const isAbsent = attendance?.status === 'Absent';
                        const isLeave = attendance?.status === 'Leave' || attendance?.status === 'Late';

                        let dayBgClass = 'bg-white border-slate-100 text-slate-600 hover:bg-indigo-50 hover:border-indigo-200';
                        let dayTextClass = 'text-slate-600';
                        
                        if (d) {
                          if (isToday) {
                            dayBgClass = 'bg-indigo-600 text-white shadow-2xl scale-110 ring-8 ring-indigo-50 z-10';
                            dayTextClass = 'text-white';
                          } else if (isPresent) {
                            dayBgClass = 'bg-blue-500 text-white shadow-lg border-blue-400 scale-105';
                            dayTextClass = 'text-white';
                          } else if (isAbsent) {
                            dayBgClass = 'bg-rose-500 text-white shadow-lg border-rose-400 scale-105';
                            dayTextClass = 'text-white';
                          } else if (isLeave) {
                            dayBgClass = 'bg-amber-500 text-white shadow-lg border-amber-400 scale-105';
                            dayTextClass = 'text-white';
                          }
                        }

                        return (
                            <div 
                                key={i} onClick={() => handleDateClick(d)}
                                className={`aspect-square flex flex-col items-center justify-center rounded-[1.25rem] transition-all group/day relative ${
                                    d ? `${dayBgClass} cursor-pointer shadow-sm hover:scale-110` 
                                    : 'opacity-0 pointer-events-none'
                                }`}
                            >
                                <span className={`font-black text-lg ${dayTextClass}`}>{d}</span>
                                {d && isToday && <span className="absolute bottom-2 w-1.5 h-1.5 bg-white rounded-full"></span>}
                                {d && !isToday && attendance && (
                                  <span className="absolute bottom-2 w-1 h-1 bg-white/50 rounded-full"></span>
                                )}
                            </div>
                        )
                    })}
                </div>
                <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] relative z-10">
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
                        Click any date for audit log 👆
                    </span>
                    <span className="flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-xl text-indigo-600 border border-indigo-100">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
                        Today: {new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                    </span>
                </div>
          </div>
          <div className="lg:col-span-4 flex flex-col gap-8">
                <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 p-8 h-full">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-xl">
                                📌
                            </div>
                            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Notice Board</h3>
                        </div>
                    </div>
                    <div className="h-[500px]">
                        <NotesBoard 
                          notes={data.notes || []} 
                          onAddNote={onAddNote} 
                          onDeleteNote={onDeleteNote} 
                          onTogglePinNote={onTogglePinNote} 
                          isAdmin={isAdmin}
                        />
                    </div>
                </div>
          </div>
      </div>

      {isAuditModalOpen && isAdmin && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[200] flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsAuditModalOpen(false)}>
              <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col animate-scale-in border border-white/20" onClick={e => e.stopPropagation()}>
                  <div className="p-6 md:p-8 bg-gradient-to-r from-slate-900 to-indigo-950 text-white relative flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                      <div className="relative z-10 text-center md:text-left">
                          <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest">Performance Audit Log</span>
                          <h2 className="text-2xl font-black tracking-tighter mt-1">{new Date(auditDate).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}</h2>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 relative z-10 justify-center">
                            <button onClick={() => onNavigateToSettings?.()} className="px-5 py-2 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 font-black text-[10px] uppercase tracking-widest transition-all">🖼️ Add Photo</button>
                            <button onClick={() => setIsAuditModalOpen(false)} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xl hover:bg-white/20 transition-all shadow-inner">✕</button>
                      </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/50">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           <div className="bg-emerald-100/50 border border-emerald-100 p-5 rounded-[2rem] flex flex-col items-center">
                                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Inflow</p>
                                <p className="text-2xl font-black text-emerald-700">{currency}{auditInflow.toLocaleString()}</p>
                           </div>
                           <div className="bg-rose-100/50 border border-rose-100 p-5 rounded-[2rem] flex flex-col items-center">
                                <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-1">Total Outflow</p>
                                <p className="text-2xl font-black text-rose-700">{currency}{auditOutflow.toLocaleString()}</p>
                           </div>
                           <div className="bg-indigo-100/50 border border-indigo-100 p-5 rounded-[2rem] flex flex-col items-center">
                                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">Performance</p>
                                <p className={`text-2xl font-black ${auditNet >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{currency}{Math.abs(auditNet).toLocaleString()}</p>
                           </div>
                      </div>

                      <div className="space-y-6">
                          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                               <h4 className="font-black text-slate-800 text-[10px] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">🎓 New Admissions ({auditAdmissions.length})</h4>
                               <div className="space-y-2">
                                   {auditAdmissions.map(s => (
                                       <div key={s.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-white border overflow-hidden shrink-0">{s.photo ? <img src={s.photo} className="w-full h-full object-cover"/> : <span className="flex h-full w-full items-center justify-center font-bold text-xs text-slate-300">{s.name.charAt(0)}</span>}</div>
                                                <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{s.name}</span>
                                            </div>
                                            <span className="text-[9px] font-black text-indigo-600 bg-white px-2.5 py-1 rounded border border-indigo-50 shadow-sm uppercase">Class {s.grade}</span>
                                       </div>
                                   ))}
                                   {auditAdmissions.length === 0 && <p className="text-center text-[10px] font-bold text-slate-300 py-6 uppercase tracking-widest">No admissions recorded</p>}
                               </div>
                          </div>

                          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                               <h4 className="font-black text-slate-800 text-[10px] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">📥 Collections Log</h4>
                               <div className="space-y-2">
                                   {auditCollections.map(f => (
                                       <div key={f.id} className="p-3 bg-emerald-50/50 rounded-xl flex items-center justify-between group border border-emerald-100">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">{getFeeIcon(f.type)}</span>
                                                <div className="min-w-0">
                                                    <span className="text-[11px] font-black text-slate-700 uppercase block truncate">{data.students.find(s=>s.id===f.studentId)?.name || 'Archived'}</span>
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{f.type}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-black text-emerald-600">{currency}{f.amount.toLocaleString()}</span>
                                                <button onClick={() => onDeleteFee?.(f.id)} className="text-rose-400 hover:text-rose-600 transition-colors">🗑️</button>
                                            </div>
                                       </div>
                                   ))}
                                   {auditCollections.length === 0 && <p className="text-center text-[10px] font-bold text-slate-300 py-6 uppercase tracking-widest">No inflow recorded</p>}
                               </div>
                          </div>

                          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                               <h4 className="font-black text-slate-800 text-[10px] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">📤 Expenses Ledger</h4>
                               <div className="space-y-2">
                                   {auditExpenses.map(e => (
                                       <div key={e.id} className="p-3 bg-rose-50/50 rounded-xl flex items-center justify-between group border border-rose-100">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">{getExpenseIcon(e.category)}</span>
                                                <div className="min-w-0">
                                                    <span className="text-[11px] font-black text-slate-700 uppercase block truncate">{e.title}</span>
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{e.category}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-black text-rose-600">{currency}{e.amount.toLocaleString()}</span>
                                                <button onClick={() => onDeleteExpense?.(e.id)} className="text-rose-400 hover:text-rose-600 transition-colors">🗑️</button>
                                            </div>
                                       </div>
                                   ))}
                                   {auditExpenses.length === 0 && <p className="text-center text-[10px] font-bold text-slate-300 py-6 uppercase tracking-widest">No outflow recorded</p>}
                               </div>
                          </div>
                      </div>
                  </div>
                  <div className="p-6 bg-white border-t border-slate-100 flex justify-end">
                       <button onClick={() => setIsAuditModalOpen(false)} className="px-10 py-3.5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl active:scale-95 transition-all">Dismiss Audit Log</button>
                  </div>
              </div>
          </div>
      )}

      {!isAdmin && (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 rounded-[3rem] p-10 shadow-2xl text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-indigo-500/20 transition-colors duration-1000"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                    <div>
                        <h3 className="text-3xl font-black mb-2 flex items-center gap-3">
                            <span className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl border border-white/10 shadow-inner">💰</span> 
                            My Fee Summary
                        </h3>
                        <p className="text-indigo-300/60 text-[10px] font-black uppercase tracking-[0.3em] ml-1">Session {currentSession} • Financial Overview</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 shadow-xl">
                        <div className="text-right">
                            <p className="text-[8px] font-black text-indigo-300 uppercase tracking-widest mb-0.5">Payment Progress</p>
                            <p className="text-xl font-black text-white tracking-tighter">{sessionProgress}%</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                            <TrendingUp className="w-6 h-6 text-indigo-400" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10 mb-10">
                     <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-md shadow-inner hover:bg-white/10 transition-all duration-500 group/card">
                          <div className="flex items-center gap-3 mb-4">
                              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-300 border border-indigo-500/20 group-hover/card:scale-110 transition-transform">🎓</div>
                              <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Total Fees</p>
                          </div>
                          <p className="text-4xl font-black tracking-tight group-hover/card:translate-x-1 transition-transform"><AnimatedNumber value={totalExpected} currency={currency} /></p>
                          <p className="text-[8px] font-bold text-indigo-300/40 uppercase tracking-widest mt-2">Agreed + Backlogs</p>
                     </div>
                     <div className="bg-emerald-500/5 p-8 rounded-[2.5rem] border border-emerald-500/10 backdrop-blur-md shadow-inner hover:bg-emerald-500/10 transition-all duration-500 group/card">
                          <div className="flex items-center gap-3 mb-4">
                              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-300 border border-emerald-500/20 group-hover/card:scale-110 transition-transform">✅</div>
                              <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">Successfully Paid</p>
                          </div>
                          <p className="text-4xl font-black tracking-tight group-hover/card:translate-x-1 transition-transform text-emerald-400"><AnimatedNumber value={totalRevenue} currency={currency} /></p>
                          <p className="text-[8px] font-bold text-emerald-300/40 uppercase tracking-widest mt-2">Verified Collections</p>
                     </div>
                     <div className="bg-rose-500/5 p-8 rounded-[2.5rem] border border-rose-500/10 backdrop-blur-md shadow-inner hover:bg-rose-500/10 transition-all duration-500 group/card">
                          <div className="flex items-center gap-3 mb-4">
                              <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-300 border border-rose-500/20 group-hover/card:scale-110 transition-transform">⏳</div>
                              <p className="text-[10px] font-black text-rose-300 uppercase tracking-widest">Remaining Balance</p>
                          </div>
                          <p className="text-4xl font-black tracking-tight group-hover/card:translate-x-1 transition-transform text-rose-400"><AnimatedNumber value={totalDue} currency={currency} /></p>
                          <p className="text-[8px] font-bold text-rose-300/40 uppercase tracking-widest mt-2">Outstanding Dues</p>
                     </div>
                </div>

                <div className="relative h-3 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
                    <div 
                        className="h-full bg-gradient-to-r from-indigo-500 via-emerald-500 to-indigo-400 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(99,102,241,0.4)] relative" 
                        style={{ width: `${sessionProgress}%` }}
                    >
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-stripe"></div>
                    </div>
                </div>
            </div>

            {/* My Recent Payments List */}
            <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 p-10 group overflow-hidden relative hover:shadow-2xl transition-all duration-500">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/30 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
                <div className="relative z-10 flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-slate-200 border border-slate-800 group-hover:rotate-3 transition-transform">
                            🧾
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase leading-none">My Recent Payments</h3>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Transaction History</p>
                        </div>
                    </div>
                    <button onClick={onNavigateToFees} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 shadow-sm">View Ledger ➜</button>
                </div>

                <div className="space-y-4 relative z-10">
                    {activeFees.filter(f => f.studentId === currentStudentId && f.status === 'Paid').length > 0 ? (
                        activeFees
                            .filter(f => f.studentId === currentStudentId && f.status === 'Paid')
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .slice(0, 5)
                            .map((f) => (
                                <div key={f.id} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-xl hover:border-indigo-100 transition-all group/item cursor-default">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-md border border-slate-50 group-hover/item:scale-110 transition-transform">
                                            {getFeeIcon(f.type)}
                                        </div>
                                        <div>
                                            <span className="text-sm font-black text-slate-800 uppercase tracking-tight block">{f.type} Fee</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(f.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Verified</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-black text-slate-900 block tracking-tighter">{currency}{f.amount.toLocaleString()}</span>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{f.paymentMethod || 'Cash'}</span>
                                    </div>
                                </div>
                            ))
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 border-2 border-dashed border-slate-200">
                                <Receipt className="w-8 h-8 text-slate-200" />
                            </div>
                            <h4 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-2">No payments found</h4>
                            <p className="text-[11px] text-slate-400 max-w-[220px] leading-relaxed">You haven't made any fee payments in the current session yet.</p>
                        </div>
                    )}
                </div>
            </div>
          </div>
      )}

      {/* --- ADSENSE BOTTOM BANNER --- */}
      {adsense?.enabled && adsense.clientId && adsense.units?.find(u => u.placement === 'dashboard_bottom') && (
        <div className="animate-fade-in mt-12">
          {(() => {
            const unit = adsense.units.find(u => u.placement === 'dashboard_bottom')!;
            return (
              <AdSenseUnit 
                clientId={adsense.clientId} 
                unitId={unit.unitId} 
                format={unit.format} 
                testMode={adsense.testMode}
                className="w-full"
              />
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default Dashboard;