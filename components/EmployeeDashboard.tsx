import React from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Briefcase, 
  Award,
  ChevronRight,
  LogOut,
  Bell,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Menu,
  X,
  LayoutDashboard,
  UserCircle,
  CalendarCheck,
  Users,
  Search,
  Save,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Employee, EmployeeAttendanceRecord, SchoolProfileData, Student, AttendanceRecord, ExpenseRecord } from '../types';

interface EmployeeDashboardProps {
  employee: Employee;
  attendance: EmployeeAttendanceRecord[];
  students: Student[];
  studentAttendance: AttendanceRecord[];
  classes: string[];
  onSaveStudentAttendance: (records: AttendanceRecord[]) => void;
  expenses: ExpenseRecord[];
  schoolProfile: SchoolProfileData;
  onLogout: () => void;
  onViewAttendance: () => void;
  onNotify: (message: string, type: 'success' | 'error' | 'info') => void;
}

type SubView = 'OVERVIEW' | 'HISTORY' | 'ATTENDANCE' | 'STUDENT_ATTENDANCE';

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ 
  employee, 
  attendance, 
  students,
  studentAttendance,
  classes,
  onSaveStudentAttendance,
  expenses,
  schoolProfile,
  onLogout,
  onViewAttendance,
  onNotify
}) => {
  const [activeSubView, setActiveSubView] = React.useState<SubView>('OVERVIEW');
  const [viewHistory, setViewHistory] = React.useState<SubView[]>(['OVERVIEW']);

  const handleSubViewChange = (view: SubView) => {
    if (view !== activeSubView) {
      setViewHistory(prev => [...prev, view]);
      setActiveSubView(view);
    }
  };

  const handleBack = () => {
    if (viewHistory.length > 1) {
      const newHistory = [...viewHistory];
      newHistory.pop(); // remove current
      const prevView = newHistory[newHistory.length - 1];
      setViewHistory(newHistory);
      setActiveSubView(prevView);
    }
  };

  const [isPanelOpen, setIsPanelOpen] = React.useState(false);
  const [selectedStudentClass, setSelectedStudentClass] = React.useState(classes[0] || '');
  const [localStudentAttendance, setLocalStudentAttendance] = React.useState<Record<string, 'Present' | 'Absent' | 'Late' | 'Leave'>>({});
  const [isAttendanceSaving, setIsAttendanceSaving] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  const [attendanceConfirm, setAttendanceConfirm] = React.useState<{ studentId: string; studentName: string; status: 'Present' | 'Absent' | 'Late' | 'Leave' } | null>(null);
  const [currentTime, setCurrentTime] = React.useState(new Date());

  // Real-time clock for Android Status Bar
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  
  const today = new Date().toISOString().split('T')[0];
  const [attendanceDate, setAttendanceDate] = React.useState(today);

  // Initialize local student attendance when class or date changes
  React.useEffect(() => {
    const dailyRecords = studentAttendance.filter(r => r.date === attendanceDate);
    const statusMap: Record<string, 'Present' | 'Absent' | 'Late' | 'Leave'> = {};
    dailyRecords.forEach(r => {
      statusMap[r.studentId] = r.status;
    });
    setLocalStudentAttendance(statusMap);
  }, [attendanceDate, studentAttendance, selectedStudentClass]);

  const todayAttendance = attendance.find(a => a.employeeId === employee.id && a.date === today);

  const stats = {
    present: attendance.filter(a => a.employeeId === employee.id && a.status === 'Present').length,
    absent: attendance.filter(a => a.employeeId === employee.id && a.status === 'Absent').length,
    late: attendance.filter(a => a.employeeId === employee.id && a.status === 'Late').length,
    leave: attendance.filter(a => a.employeeId === employee.id && a.status === 'Leave').length,
  };

  const studentStats = {
    total: students.length,
    presentToday: studentAttendance.filter(a => a.date === today && a.status === 'Present').length,
    absentToday: studentAttendance.filter(a => a.date === today && a.status === 'Absent').length,
    lateToday: studentAttendance.filter(a => a.date === today && a.status === 'Late').length,
  };

  const salaryExpenses = expenses.filter(ex => ex.employeeId === employee.id && ex.category === 'Salary');
  const totalPaidSalary = salaryExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const lastPayment = salaryExpenses.length > 0 
    ? salaryExpenses.sort((a,b) => b.date.localeCompare(a.date))[0] 
    : null;
  const paymentPercentage = lastPayment && employee.salary > 0 
    ? Math.min(Math.round((lastPayment.amount / employee.salary) * 100), 100) 
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 overflow-x-hidden relative">
      {/* Android Style Top Status Bar */}
      <div className="fixed top-0 left-0 right-0 bg-slate-900 z-[110] h-7 px-6 flex items-center justify-between text-[10px] text-white/70 font-bold font-mono tracking-tighter">
        <div className="flex items-center gap-2">
          <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            <span className="text-[8px]">5G</span>
            <span>📶</span>
          </div>
          <span>🛜</span>
          <span className="flex items-center">
            <span className="text-[9px] mr-0.5">85%</span>
            <span>🔋</span>
          </span>
        </div>
      </div>

      {/* Sliding Navigation Panel */}
      <motion.div 
        initial={false}
        animate={{ x: isPanelOpen ? 0 : -320 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 left-0 h-full w-80 bg-slate-900 z-[100] shadow-2xl p-8 flex flex-col border-r border-white/5"
      >
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <Briefcase size={20} />
            </div>
            <h2 className="text-white font-black uppercase tracking-tight">Staff Panel</h2>
          </div>
          <button onClick={() => setIsPanelOpen(false)} className="text-slate-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 ml-2">Navigation</p>
          
          <button 
            onClick={() => { handleSubViewChange('OVERVIEW'); setIsPanelOpen(false); }}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeSubView === 'OVERVIEW' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-bold text-sm uppercase tracking-widest">Dashboard</span>
          </button>

          <button 
            onClick={() => { handleSubViewChange('HISTORY'); setIsPanelOpen(false); }}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeSubView === 'HISTORY' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <UserCircle size={20} />
            <span className="font-bold text-sm uppercase tracking-widest">Profile History</span>
          </button>

          <button 
            onClick={() => { handleSubViewChange('ATTENDANCE'); setIsPanelOpen(false); }}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeSubView === 'ATTENDANCE' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <CalendarCheck size={20} />
            <span className="font-bold text-sm uppercase tracking-widest">Attendance Log</span>
          </button>

          <button 
            onClick={() => { handleSubViewChange('STUDENT_ATTENDANCE'); setIsPanelOpen(false); }}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeSubView === 'STUDENT_ATTENDANCE' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Users size={20} />
            <span className="font-bold text-sm uppercase tracking-widest">Mark Students</span>
          </button>
        </nav>

        <div className="pt-8 border-t border-white/5">
          <button 
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-rose-400 hover:bg-rose-500/10 transition-all font-bold uppercase tracking-widest text-xs"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </motion.div>

      {/* Overlay */}
      {isPanelOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setIsPanelOpen(false)}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[95]"
        />
      )}

      {/* Header Profile Section */}
      <header className="relative bg-slate-900 pt-16 pb-32 px-6 overflow-hidden">
        {/* Panel Toggle Button */}
        <button 
          onClick={() => setIsPanelOpen(true)}
          className="absolute top-6 left-6 w-12 h-12 bg-white/5 hover:bg-white/10 text-white rounded-xl flex items-center justify-center border border-white/10 transition-all z-20"
        >
          <Menu size={24} />
        </button>
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -ml-20 -mb-20"></div>
        
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col md:flex-row items-center gap-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-white p-1.5 shadow-2xl relative group"
          >
            <div className="w-full h-full rounded-[2.2rem] bg-slate-100 overflow-hidden flex items-center justify-center">
              {employee.photo ? (
                <img src={employee.photo} alt={employee.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-5xl font-black text-slate-300 uppercase">{employee.name.charAt(0)}</span>
              )}
            </div>
          </motion.div>

          <div className="text-center md:text-left flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none uppercase">{employee.name}</h1>
              <span className="px-4 py-1.5 bg-amber-500/20 text-amber-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/30 w-max mx-auto md:mx-0">
                {employee.role}
              </span>
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-[0.3em] flex items-center justify-center md:justify-start gap-2 text-xs">
              Staff ID: {employee.id} • {employee.department}
            </p>
            
            <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-3">
              <button onClick={() => setShowLogoutModal(true)} className="flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-rose-500/20 text-white hover:text-rose-400 rounded-xl font-bold uppercase text-[10px] tracking-widest border border-white/10 transition-all">
                <LogOut size={14} /> Log Out
              </button>
              <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 rounded-xl font-bold uppercase text-[10px] tracking-widest border border-indigo-500/30 transition-all">
                <Bell size={14} /> Notifications
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto -mt-16 px-6 relative z-20 space-y-8 mb-24">
        {activeSubView === 'OVERVIEW' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Quick Action / Status Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Today's Attendance Card (Employee) */}
              <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 flex items-center justify-between group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">My Status (Today)</p>
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${
                      todayAttendance?.status === 'Present' ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' :
                      todayAttendance?.status === 'Absent' ? 'bg-rose-50 text-rose-500 border border-rose-100' :
                      todayAttendance?.status === 'Late' ? 'bg-amber-50 text-amber-500 border border-amber-100' :
                      'bg-slate-100 text-slate-300 border border-slate-200'
                    }`}>
                      {todayAttendance?.status === 'Present' ? <CheckCircle2 /> : <Clock />}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 leading-none mb-1">{todayAttendance?.status || 'Unmarked'}</h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{today}</p>
                    </div>
                  </div>
                </div>
                {todayAttendance?.status === 'Present' && (
                  <div className="relative z-10 w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs">
                    ✅
                  </div>
                )}
              </div>

              {/* Student Attendance Card */}
              <div className="bg-slate-900 p-8 rounded-[3rem] shadow-xl border border-white/5 flex flex-col justify-between group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Student Attendance</p>
                    <button 
                      onClick={() => handleSubViewChange('STUDENT_ATTENDANCE')}
                      className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1"
                    >
                      Management <ChevronRight size={12} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-3xl font-black text-white leading-none mb-1">{studentStats.presentToday} <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Present</span></h3>
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest italic leading-none mt-1">out of {studentStats.total} students</p>
                    </div>
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-indigo-400 border border-white/10 shrink-0">
                      <LayoutDashboard size={18} />
                    </div>
                  </div>
                  <div className="flex gap-4 mb-6">
                     <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[8px] font-black text-rose-400 uppercase tracking-widest">Absent</p>
                          <p className="text-[8px] font-black text-white uppercase tracking-widest">{studentStats.absentToday}</p>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500 rounded-full" style={{ width: students.length > 0 ? `${(studentStats.absentToday / students.length) * 100}%` : '0%' }}></div>
                        </div>
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[8px] font-black text-amber-400 uppercase tracking-widest">Late</p>
                          <p className="text-[8px] font-black text-white uppercase tracking-widest">{studentStats.lateToday}</p>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: students.length > 0 ? `${(studentStats.lateToday / students.length) * 100}%` : '0%' }}></div>
                        </div>
                     </div>
                  </div>
                  <button 
                    onClick={() => handleSubViewChange('STUDENT_ATTENDANCE')}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all border border-white/5"
                  >
                    Open Attendance Sheet
                  </button>
                </div>
              </div>

              {/* Quick History Shortcut */}
              <div 
                onClick={() => handleSubViewChange('HISTORY')}
                className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 flex items-center gap-6 group hover:border-amber-100 transition-all cursor-pointer"
              >
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center shadow-inner border border-amber-100 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">📜</span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1 uppercase">Profile History</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">Review records ➞</p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            {/* Unified Summary Card (Financials & Service) */}
            <div className="bg-slate-900 rounded-[3.5rem] shadow-2xl border border-white/5 overflow-hidden relative group mb-12">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] -mr-40 -mt-40 group-hover:bg-indigo-500/20 transition-colors duration-1000"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[80px] -ml-32 -mb-32"></div>
              
              <div className="relative z-10 p-10 lg:p-14">
                <div className="flex flex-col xl:flex-row xl:items-stretch justify-between gap-16">
                  
                  {/* Financial Metrics */}
                  <div className="flex-1 space-y-12">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                      <div>
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-11 h-11 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400 border border-white/10">
                            <Award size={22} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Financial Portfolio</p>
                            <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">Verified Balance Sheet</p>
                          </div>
                        </div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Cumulative Life-time Earnings</p>
                        <h3 className="text-6xl font-black text-white tracking-tighter leading-none">
                          {new Intl.NumberFormat('en-IN', { style: 'currency', currency: schoolProfile.currency || 'INR', maximumFractionDigits: 0 }).format(totalPaidSalary)}
                        </h3>
                      </div>
                      
                      <div className="md:text-right">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/10 mb-4">
                           <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                           <span className="text-[9px] font-black text-white uppercase tracking-widest">Active Payroll</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Annual Scale</p>
                        <p className="text-xl font-black text-white">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: schoolProfile.currency || 'INR', maximumFractionDigits: 0 }).format(employee.salary * 12)} /yr</p>
                      </div>
                    </div>

                    <div className="space-y-6 pt-10 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Salary Status</p>
                          <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-1">Relative to monthly target</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-2xl font-black ${paymentPercentage >= 100 ? 'text-emerald-400' : 'text-indigo-400'} tracking-tighter`}>{paymentPercentage}%</span>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">disbursed</span>
                        </div>
                      </div>
                      
                      <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 p-1">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${paymentPercentage}%` }}
                          className={`h-full rounded-full ${paymentPercentage >= 100 ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.4)]'}`}
                        />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
                        <div className="bg-white/5 rounded-3xl p-5 border border-white/5 group/tile hover:bg-white/10 transition-colors">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Last Ref</p>
                          <p className="text-sm font-black text-white">{lastPayment ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: schoolProfile.currency || 'INR' }).format(lastPayment.amount) : 'N/A'}</p>
                        </div>
                        <div className="bg-white/5 rounded-3xl p-5 border border-white/10 group/tile hover:bg-white/10 transition-colors">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Ref Date</p>
                          <p className="text-sm font-black text-white uppercase">{lastPayment ? lastPayment.date : '---'}</p>
                        </div>
                        <div className="bg-white/5 rounded-3xl p-5 border border-white/5 group/tile hover:bg-white/10 transition-colors hidden sm:block">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Method</p>
                          <p className="text-sm font-black text-indigo-400 uppercase">Direct/Bank</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vertical Divider */}
                  <div className="hidden xl:block w-px bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>

                  {/* Milestone & Profile */}
                  <div className="xl:w-80 flex flex-col justify-center">
                    <div className="bg-white/5 rounded-[3rem] p-10 border border-white/10 relative overflow-hidden group/milestone hover:border-amber-500/30 transition-colors duration-500">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mt-8 -mr-8 group-hover/milestone:scale-150 transition-transform duration-700"></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-10">
                          <div className="w-11 h-11 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400 border border-amber-500/20 shadow-lg shadow-amber-500/10">
                            <Calendar size={22} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.25em]">Service Tenure</p>
                            <p className="text-[8px] font-bold text-amber-500/40 uppercase tracking-widest mt-0.5">Authorised Member</p>
                          </div>
                        </div>
                        
                        <div className="space-y-1 mb-10">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-3">Official Joining Date</p>
                          <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-tight">{employee.joiningDate}</h3>
                        </div>
                        
                        <div className="space-y-4">
                           <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Employee ID</p>
                              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">{employee.id}</p>
                           </div>
                           <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Base Payout</p>
                              <p className="text-[10px] font-black text-white uppercase tracking-tighter">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: schoolProfile.currency || 'INR' }).format(employee.salary)}</p>
                           </div>
                        </div>

                        <div className="mt-10">
                           <button className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-amber-500/20 active:scale-95">
                              Download Agreement
                           </button>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

              {/* Last Payment Card with Percentage */}
              <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 relative overflow-hidden">
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Last Salary Status</p>
                    <div className="flex items-end justify-between mb-4">
                      <h3 className="text-3xl font-black text-slate-800 tracking-tight leading-none">
                        {paymentPercentage}%
                      </h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Target: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: schoolProfile.currency || 'INR' }).format(employee.salary)}</p>
                    </div>
                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 p-0.5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${paymentPercentage}%` }}
                        className={`h-full rounded-full ${paymentPercentage >= 100 ? 'bg-emerald-500' : 'bg-indigo-500 shadow-lg shadow-indigo-500/20'}`}
                      />
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Ref Amount</p>
                      <p className="text-xs font-black text-slate-700">{lastPayment ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: schoolProfile.currency || 'INR' }).format(lastPayment.amount) : 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Payment Date</p>
                      <p className="text-xs font-black text-slate-700 uppercase tracking-tighter">{lastPayment ? lastPayment.date : '---'}</p>
                    </div>
                  </div>
                </div>
              </div>


            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-emerald-50 p-6 rounded-[2.5rem] border border-emerald-100 group hover:bg-emerald-100 transition-colors">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Present</p>
                <p className="text-4xl font-black text-emerald-700 tracking-tighter group-hover:scale-110 transition-transform">{stats.present}</p>
                <p className="text-[8px] font-bold text-emerald-600/60 uppercase tracking-widest mt-1">Direct Days</p>
              </div>
              <div className="bg-amber-50 p-6 rounded-[2.5rem] border border-amber-100 group hover:bg-amber-100 transition-colors">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">Late</p>
                <p className="text-4xl font-black text-amber-700 tracking-tighter group-hover:scale-110 transition-transform">{stats.late}</p>
                <p className="text-[8px] font-bold text-amber-600/60 uppercase tracking-widest mt-1">Pending Sync</p>
              </div>
              <div className="bg-rose-50 p-6 rounded-[2.5rem] border border-rose-100 group hover:bg-rose-100 transition-colors">
                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2">Absent</p>
                <p className="text-4xl font-black text-rose-700 tracking-tighter group-hover:scale-110 transition-transform">{stats.absent}</p>
                <p className="text-[8px] font-bold text-rose-600/60 uppercase tracking-widest mt-1">Missed Log</p>
              </div>
              <div className="bg-indigo-50 p-6 rounded-[2.5rem] border border-indigo-100 group hover:bg-indigo-100 transition-colors">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">Leave</p>
                <p className="text-4xl font-black text-indigo-700 tracking-tighter group-hover:scale-110 transition-transform">{stats.leave}</p>
                <p className="text-[8px] font-bold text-indigo-600/60 uppercase tracking-widest mt-1">Approved</p>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 p-10">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase flex items-center gap-3">
                      <span className="w-10 h-10 bg-slate-50 text-xl rounded-xl flex items-center justify-center border border-slate-100">📅</span> 
                      Recent Attendance
                    </h3>
                    <button onClick={() => handleSubViewChange('ATTENDANCE')} className="text-[10px] font-black text-amber-600 uppercase tracking-widest hover:underline">View All ➞</button>
                  </div>
                  
                  <div className="space-y-3">
                    {attendance.filter(a => a.employeeId === employee.id).sort((a,b) => b.date.localeCompare(a.date)).slice(0, 5).map(record => (
                      <div key={record.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                            record.status === 'Present' ? 'text-emerald-500 bg-emerald-100/50' : 
                            record.status === 'Absent' ? 'text-rose-500 bg-rose-100/50' : 
                            'text-amber-500 bg-amber-100/50'
                          }`}>
                            {record.status === 'Present' ? 'P' : record.status === 'Absent' ? 'A' : 'L'}
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{new Date(record.date).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{record.status}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-8">
                <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-xl overflow-hidden relative group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Service Milestones</h4>
                  <div className="space-y-6">
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 flex-shrink-0">🚀</div>
                        <p className="text-[10px] font-bold text-slate-600 tracking-tight leading-relaxed uppercase">Confirmed Staff Member</p>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 flex-shrink-0">✨</div>
                        <p className="text-[10px] font-bold text-slate-600 tracking-tight leading-relaxed uppercase">Full Access Granted</p>
                      </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeSubView === 'HISTORY' && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[3rem] shadow-xl border border-slate-100 p-10 relative overflow-hidden group min-h-[400px]"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="flex items-center justify-between mb-12">
              <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase flex items-center gap-3">
                <span className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg">📁</span> 
                Profile History & Private Records
              </h3>
              <button 
                onClick={() => handleSubViewChange('OVERVIEW')}
                className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-amber-500 transition-colors"
              >
                Back to overview
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="flex items-start gap-6 group/item">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 flex-shrink-0 group-hover/item:bg-amber-50 group-hover/item:text-amber-500 transition-all border border-slate-100"><Calendar size={24} /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Official Joining Date</p>
                    <p className="text-lg font-black text-slate-700 uppercase tracking-tight">{employee.joiningDate}</p>
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1 italic">Verified Official Record</p>
                  </div>
                </div>
                <div className="flex items-start gap-6 group/item">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 flex-shrink-0 group-hover/item:bg-amber-50 group-hover/item:text-amber-500 transition-all border border-slate-100"><MapPin size={24} /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Registered Address</p>
                    <p className="text-lg font-black text-slate-700 uppercase tracking-tight leading-tight">{employee.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-6 group/item">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 flex-shrink-0 group-hover/item:bg-amber-50 group-hover/item:text-amber-500 transition-all border border-slate-100"><Mail size={24} /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Communication Email</p>
                    <p className="text-lg font-black text-slate-700 lowercase tracking-tight">{employee.email}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-8">
                <div className="flex items-start gap-6 group/item">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 flex-shrink-0 group-hover/item:bg-amber-50 group-hover/item:text-amber-500 transition-all border border-slate-100"><Phone size={24} /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Contact Number</p>
                    <p className="text-lg font-black text-slate-700 uppercase tracking-tight">{employee.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-6 group/item">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 flex-shrink-0 group-hover/item:bg-amber-50 group-hover/item:text-amber-500 transition-all border border-slate-100"><User size={24} /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Birth Record (DOB)</p>
                    <p className="text-lg font-black text-slate-700 uppercase tracking-tight">
                      {employee.dob ? new Date(employee.dob).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not Provided'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-6 group/item">
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 flex-shrink-0 border border-emerald-100 shadow-inner">💰</div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Current Scale (Salary)</p>
                    <p className="text-2xl font-black text-emerald-600 tracking-tighter">₹ {Number(employee.salary || 0).toLocaleString()}</p>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full mt-2 relative overflow-hidden">
                      <div className="absolute top-0 left-0 h-full bg-emerald-500 w-[70%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeSubView === 'STUDENT_ATTENDANCE' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 p-8 md:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32"></div>
              
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 mb-12 relative z-10">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase flex items-center gap-3">
                    <span className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-indigo-600/20">
                      <CalendarCheck size={24} />
                    </span> 
                    Daily Attendance Sheet
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Academic Session: {schoolProfile.currentSession}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-end gap-3">
                   <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Students</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input 
                        type="text" 
                        placeholder="Search name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-300 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 min-w-[140px]">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Date</label>
                    <input 
                      type="date" 
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 min-w-[140px]">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Grade / Class</label>
                    <select
                      value={selectedStudentClass}
                      onChange={(e) => setSelectedStudentClass(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 active:scale-95 transition-all cursor-pointer"
                    >
                      {classes.map(cls => (cls !== 'Disabled' && <option key={cls} value={cls}>{cls}</option>))}
                    </select>
                  </div>

                  <button 
                    onClick={async () => {
                      setIsAttendanceSaving(true);
                      const classStudents = students.filter(s => s.grade === selectedStudentClass && !s.isDeleted);
                      const records: AttendanceRecord[] = classStudents.map(student => ({
                        id: `${student.id}-${attendanceDate}`,
                        studentId: student.id,
                        date: attendanceDate,
                        status: localStudentAttendance[student.id] || 'Present',
                        session: schoolProfile.currentSession
                      }));
                      await onSaveStudentAttendance(records);
                      setIsAttendanceSaving(false);
                      onNotify('Daily logging successful', 'success');
                    }}
                    disabled={isAttendanceSaving}
                    className="flex items-center justify-center gap-3 px-8 py-3.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-slate-200 active:scale-95"
                  >
                    {isAttendanceSaving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />} 
                    Save & Sync
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-4 mb-8 relative z-10 px-2">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">P: {Object.values(localStudentAttendance).filter(v => v === 'Present').length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">A: {Object.values(localStudentAttendance).filter(v => v === 'Absent').length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">L: {Object.values(localStudentAttendance).filter(v => v === 'Late').length}</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 overflow-x-auto custom-scrollbar pb-6">
                <div className="min-w-[850px] lg:min-w-full">
                  <div className="grid grid-cols-12 px-6 mb-4">
                    <div className="col-span-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student Details</div>
                    <div className="col-span-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status Toggle</div>
                  </div>
                  
                  <div className="space-y-3">
                    {students
                      .filter(s => s.grade === selectedStudentClass && !s.isDeleted && (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toLowerCase().includes(searchTerm.toLowerCase())))
                      .map(student => (
                        <div key={student.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                          <div className="flex items-center gap-4 mb-4 sm:mb-0">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                              {student.photo ? (
                                <img src={student.photo} alt={student.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <span className="text-xl font-black text-slate-200">{student.name.charAt(0)}</span>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-3">
                                <p className="text-base font-black text-slate-700 uppercase tracking-tight leading-none group-hover:text-indigo-600 transition-colors uppercase whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] sm:max-w-none">{student.name}</p>
                                <div className="flex items-center gap-1 shrink-0">
                                  {(['Present', 'Absent', 'Late', 'Leave'] as const).map((status) => (
                                    <button
                                      key={status}
                                      onClick={() => setAttendanceConfirm({ studentId: student.id, studentName: student.name, status })}
                                      title={status}
                                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] transition-all transform hover:scale-110 active:scale-90 ${
                                        localStudentAttendance[student.id] === status
                                          ? status === 'Present' ? 'bg-emerald-500 text-white shadow-lg' :
                                            status === 'Absent' ? 'bg-rose-500 text-white shadow-lg' :
                                            status === 'Late' ? 'bg-amber-500 text-white shadow-lg' :
                                            'bg-indigo-500 text-white shadow-lg'
                                          : 'bg-slate-100 text-slate-300 grayscale border border-slate-200 hover:grayscale-0 hover:bg-white'
                                      }`}
                                    >
                                      {status === 'Present' ? '✅' : status === 'Absent' ? '❌' : status === 'Late' ? '⏰' : '🏠'}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 opacity-60">ID: {student.id}</p>
                            </div>
                          </div>
                          
                          <div className="hidden lg:flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                             <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Selected Status:</p>
                             <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${
                               localStudentAttendance[student.id] === 'Present' ? 'text-emerald-500' :
                               localStudentAttendance[student.id] === 'Absent' ? 'text-rose-500' :
                               localStudentAttendance[student.id] === 'Late' ? 'text-amber-500' :
                               localStudentAttendance[student.id] === 'Leave' ? 'text-indigo-500' :
                               'text-slate-300'
                             }`}>
                                {localStudentAttendance[student.id] || 'Pending'}
                             </span>
                          </div>
                        </div>
                      ))}

                    {students.filter(s => s.grade === selectedStudentClass && !s.isDeleted && (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toLowerCase().includes(searchTerm.toLowerCase()))).length === 0 && (
                      <div className="py-32 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-xl border border-slate-100">
                          🔍
                        </div>
                        <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">No Matching Students</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Try adjusting your search or class filter</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeSubView === 'ATTENDANCE' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 p-10">
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase flex items-center gap-3">
                  <span className="w-12 h-12 bg-white text-2xl rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm">🗓️</span> 
                  Full Attendance Ledger
                </h3>
                 <button 
                  onClick={() => handleSubViewChange('OVERVIEW')}
                  className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-amber-500 transition-colors"
                >
                  Back to overview
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {attendance.filter(a => a.employeeId === employee.id).sort((a,b) => b.date.localeCompare(a.date)).map(record => (
                  <div key={record.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:bg-white hover:shadow-xl transition-all relative overflow-hidden">
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black border shadow-inner ${
                        record.status === 'Present' ? 'text-emerald-500 bg-emerald-50 border-emerald-100' : 
                        record.status === 'Absent' ? 'text-rose-500 bg-rose-50 border-rose-100' : 
                        'text-amber-500 bg-amber-50 border-amber-100'
                      }`}>
                        {record.status === 'Present' ? 'P' : record.status === 'Absent' ? 'A' : 'L'}
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-700 uppercase tracking-tight">{new Date(record.date).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                            record.status === 'Present' ? 'bg-emerald-100 text-emerald-600' : 
                            record.status === 'Absent' ? 'bg-rose-100 text-rose-600' : 
                            'bg-amber-100 text-amber-600'
                          }`}>
                            {record.status}
                          </span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic">• Record Logged</span>
                        </div>
                      </div>
                    </div>
                    {record.remarks && (
                      <div className="mt-4 md:mt-0 px-4 py-2 bg-white rounded-xl border border-slate-100 md:max-w-xs">
                        <p className="text-[10px] font-medium text-slate-500 italic tracking-tight leading-relaxed">"{record.remarks}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Android Style System Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-3xl border-t border-white/10 z-[150] h-14 flex items-center justify-around px-8 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <button 
          onClick={handleBack}
          className="w-14 h-14 flex items-center justify-center text-white/40 hover:text-white transition-all active:scale-75 group"
          title="Back"
        >
          <div className="w-5 h-5 border-l-[3px] border-b-[3px] border-current rotate-45 -mr-1 group-hover:scale-110 transition-transform"></div>
        </button>
        <button 
          onClick={() => handleSubViewChange('OVERVIEW')}
          className="w-14 h-14 flex items-center justify-center text-white/40 hover:text-white transition-all active:scale-75 group"
          title="Home"
        >
          <div className="w-4.5 h-4.5 bg-current rounded-full group-hover:scale-110 transition-transform"></div>
        </button>
        <button 
          onClick={() => setIsPanelOpen(true)}
          className="w-14 h-14 flex items-center justify-center text-white/40 hover:text-white transition-all active:scale-75 group"
          title="Menu / Recents"
        >
          <div className="w-4.5 h-4.5 border-[3px] border-current rounded-[4px] group-hover:scale-110 transition-transform"></div>
        </button>
      </div>

      {/* Confirmation Modals */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            onClick={() => setShowLogoutModal(false)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-10 max-w-sm w-full text-center overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-rose-500"></div>
            <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 text-3xl mx-auto mb-6 shadow-inner border border-rose-100">
              <LogOut size={32} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-2">Sign Out?</h3>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-8 leading-relaxed">
              Are you sure you want to end your session? You will need to login again to access your dashboard.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-100 active:scale-95"
              >
                No, Stay
              </button>
              <button 
                onClick={onLogout}
                className="flex-1 py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-500/20 active:scale-95"
              >
                Yes, Logout
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {attendanceConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            onClick={() => setAttendanceConfirm(null)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-10 max-w-sm w-full text-center overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-indigo-500"></div>
            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-500 text-3xl mx-auto mb-6 shadow-inner border border-indigo-100">
              <CalendarCheck size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">Change Status?</h3>
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-2 leading-relaxed">
              Set <span className="text-indigo-600">{attendanceConfirm.studentName}</span>
            </p>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-8 leading-relaxed">
              as <span className={`px-2 py-0.5 rounded ${
                attendanceConfirm.status === 'Present' ? 'bg-emerald-500 text-white' :
                attendanceConfirm.status === 'Absent' ? 'bg-rose-500 text-white' :
                attendanceConfirm.status === 'Late' ? 'bg-amber-500 text-white' :
                'bg-indigo-500 text-white'
              }`}>{attendanceConfirm.status}</span> on {new Date(attendanceDate).toLocaleDateString()}?
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setAttendanceConfirm(null)}
                className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-100 active:scale-95"
              >
                No, Cancel
              </button>
              <button 
                onClick={() => {
                  setLocalStudentAttendance(prev => ({ ...prev, [attendanceConfirm.studentId]: attendanceConfirm.status }));
                  setAttendanceConfirm(null);
                  onNotify(`${attendanceConfirm.studentName} marked as ${attendanceConfirm.status}`, 'info');
                }}
                className="flex-1 py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
              >
                Yes, Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
