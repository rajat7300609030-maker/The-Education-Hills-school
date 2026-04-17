import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, AttendanceRecord } from '../types';
import { 
  Search, Filter, CheckCircle2, XCircle, Clock, 
  UserMinus, Plus, ChevronRight, LayoutGrid, 
  List as ListIcon, Calendar as CalendarIcon, 
  Save, ArrowLeft, MoreHorizontal, Download, 
  ListChecks, Trash2, ChevronLeft, 
  ChevronRight as ChevronRightIcon,
  FileText, User, CreditCard, Ban, Edit, X
} from 'lucide-react';

interface AttendanceProps {
  students: Student[];
  classes: string[];
  attendance: AttendanceRecord[];
  onSaveAttendance: (records: AttendanceRecord[]) => void;
  onBack: () => void;
  onEditStudent?: (studentId: string) => void;
  onViewProfile?: (studentId: string) => void;
  onPayFees?: (studentId: string) => void;
  onSoftDeleteStudent?: (studentId: string) => void;
}

const Attendance: React.FC<AttendanceProps> = ({ 
  students, classes, attendance, onSaveAttendance, onBack,
  onEditStudent, onViewProfile, onPayFees, onSoftDeleteStudent
}) => {
  const [selectedClass, setSelectedClass] = useState(classes[0] || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeMenuStudent, setActiveMenuStudent] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Present' | 'Absent' | 'Late' | 'Unmarked'>('All');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [localAttendance, setLocalAttendance] = useState<Record<string, 'Present' | 'Absent' | 'Late' | 'Leave'>>({});
  const [localRemarks, setLocalRemarks] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<{ studentId: string; status: 'Present' | 'Absent' | 'Late' | 'Leave' } | null>(null);

  // Calendar Modal State
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<string | null>(null);
  const [calendarViewMonth, setCalendarViewMonth] = useState(new Date());
  const [modalClass, setModalClass] = useState(classes[0] || '');
  const [modalStudentId, setModalStudentId] = useState('');

  // Initialize local attendance from existing records for selected class and date
  useEffect(() => {
    const dailyRecords = attendance.filter(r => r.date === selectedDate);
    const initialStatusMap: Record<string, 'Present' | 'Absent' | 'Late' | 'Leave'> = {};
    const initialRemarksMap: Record<string, string> = {};
    
    dailyRecords.forEach(r => {
      initialStatusMap[r.studentId] = r.status;
      initialRemarksMap[r.studentId] = r.remarks || '';
    });
    
    setLocalAttendance(initialStatusMap);
    setLocalRemarks(initialRemarksMap);
  }, [selectedDate, attendance]);

  const allClassStudents = useMemo(() => {
    return students.filter(s => s.grade === selectedClass && !s.isDeleted);
  }, [students, selectedClass]);

  const classStudents = useMemo(() => {
    let filtered = [...allClassStudents];
    
    // Search filtering
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(lowerSearch) || 
        s.id.toLowerCase().includes(lowerSearch)
      );
    }

    // Status filtering
    if (statusFilter !== 'All') {
      filtered = filtered.filter(s => {
        const studentStatus = localAttendance[s.id];
        if (statusFilter === 'Unmarked') return !studentStatus;
        return studentStatus === statusFilter;
      });
    }

    return filtered;
  }, [allClassStudents, searchTerm, statusFilter, localAttendance]);

  const stats = useMemo(() => {
    const total = allClassStudents.length;
    let present = 0;
    let absent = 0;
    let late = 0;
    let leave = 0;
    let unmarked = 0;

    allClassStudents.forEach(s => {
      const status = localAttendance[s.id];
      if (!status) unmarked++;
      else if (status === 'Present') present++;
      else if (status === 'Absent') absent++;
      else if (status === 'Late') late++;
      else if (status === 'Leave') leave++;
    });

    const attendancePercentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
    const progressPercentage = total > 0 ? Math.round(((total - unmarked) / total) * 100) : 0;

    return { total, present, absent, late, leave, unmarked, percentage: attendancePercentage, progress: progressPercentage };
  }, [allClassStudents, localAttendance]);

  // Calculate Historical Attendance for each student
  const historicalStats = useMemo(() => {
    const statsMap: Record<string, { total: number; present: number; percentage: number }> = {};
    
    students.forEach(s => {
      const studentHistory = attendance.filter(r => r.studentId === s.id);
      const totalDays = studentHistory.length;
      const presentDays = studentHistory.filter(r => r.status === 'Present' || r.status === 'Late').length;
      statsMap[s.id] = {
        total: totalDays,
        present: presentDays,
        percentage: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100
      };
    });
    
    return statsMap;
  }, [students, attendance]);

  const handleStatusChange = async (studentId: string, status: 'Present' | 'Absent' | 'Late' | 'Leave') => {
    // If student already has a status and it's different from the new one, show confirmation
    if (localAttendance[studentId] && localAttendance[studentId] !== status) {
      setPendingUpdate({ studentId, status });
      setShowConfirmModal(true);
      return;
    }

    // Toggle logic: If clicking the same status, remove it
    if (localAttendance[studentId] === status) {
      const newAttendance = { ...localAttendance };
      delete newAttendance[studentId];
      setLocalAttendance(newAttendance);
      // We don't auto-sync deletions for individual records easily without a delete API, 
      // but we can send an empty or default status. Let's stick to update logic for now.
      return;
    }

    // Direct update
    executeStatusUpdate(studentId, status);
  };

  const executeStatusUpdate = async (studentId: string, status: 'Present' | 'Absent' | 'Late' | 'Leave') => {
    const newAttendance = { ...localAttendance, [studentId]: status };
    setLocalAttendance(newAttendance);

    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const record: AttendanceRecord = {
      id: `ATT-${student.id}-${selectedDate}`,
      studentId: student.id,
      date: selectedDate,
      status: status,
      remarks: localRemarks[student.id] || '',
      session: student.session
    };

    setIsSaving(true);
    await onSaveAttendance([record]);
    setIsSaving(false);
    setShowConfirmModal(false);
    setPendingUpdate(null);
  };

  const confirmReEdit = () => {
    if (pendingUpdate) {
      executeStatusUpdate(pendingUpdate.studentId, pendingUpdate.status);
    }
  };

  const handleRemarkChange = (studentId: string, remark: string) => {
    setLocalRemarks(prev => ({ ...prev, [studentId]: remark }));
  }

  const handleSave = async () => {
    setIsSaving(true);
    const recordsToSave: AttendanceRecord[] = classStudents.map(s => ({
      id: `ATT-${s.id}-${selectedDate}`,
      studentId: s.id,
      date: selectedDate,
      status: localAttendance[s.id] || 'Present', // Default to Present if not specifically marked
      remarks: localRemarks[s.id] || '',
      session: s.session
    }));
    
    // Simulate slight delay for feedback
    await new Promise(resolve => setTimeout(resolve, 600));
    onSaveAttendance(recordsToSave);
    setIsSaving(false);
  };

  const handleMarkAll = async (status: 'Present' | 'Absent' | 'Late' | 'Leave') => {
      const newMap = { ...localAttendance };
      const recordsToSave: AttendanceRecord[] = [];

      classStudents.forEach(s => {
          newMap[s.id] = status;
          recordsToSave.push({
            id: `ATT-${s.id}-${selectedDate}`,
            studentId: s.id,
            date: selectedDate,
            status: status,
            remarks: localRemarks[s.id] || '',
            session: s.session
          });
      });

      setLocalAttendance(newMap);
      setIsSaving(true);
      await onSaveAttendance(recordsToSave);
      setIsSaving(false);
  };

  const clearAllMarks = () => {
    const newMap = { ...localAttendance };
    classStudents.forEach(s => {
      delete newMap[s.id];
    });
    setLocalAttendance(newMap);
  };

  const exportToCSV = () => {
    const headers = ['Student ID', 'Name', 'Status', 'Remarks', 'Date'];
    const rows = classStudents.map(s => [
      s.id,
      s.name,
      localAttendance[s.id] || 'Unmarked',
      localRemarks[s.id] || '',
      selectedDate
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Attendance_${selectedClass}_${selectedDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calendar Logic
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const year = calendarViewMonth.getFullYear();
    const month = calendarViewMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    // Previous month padding
    for (let i = 0; i < firstDay; i++) days.push(null);
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ day: i, dateStr });
    }
    return days;
  }, [calendarViewMonth]);

  const modalStudents = useMemo(() => {
    return students.filter(s => s.grade === modalClass && !s.isDeleted);
  }, [students, modalClass]);

  const selectedStudentAttendance = useMemo(() => {
    if (!calendarSelectedDate || !modalStudentId) return null;
    return attendance.find(r => r.studentId === modalStudentId && r.date === calendarSelectedDate);
  }, [attendance, modalStudentId, calendarSelectedDate]);

  useEffect(() => {
     if (modalClass) {
        const firstStudent = students.find(s => s.grade === modalClass && !s.isDeleted);
        if (firstStudent) setModalStudentId(firstStudent.id);
        else setModalStudentId('');
     }
  }, [modalClass, students]);

  return (
    <div className="space-y-8 animate-fade-in pb-20 max-w-[1600px] mx-auto">
      {/* Dynamic Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-6"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="p-2.5 rounded-xl bg-white text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-slate-200 lg:hidden"
            >
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-200">
                <CalendarIcon size={24} />
              </div>
              Attendance Manager
            </h2>
          </div>
          <p className="text-slate-500 font-bold text-sm tracking-wide ml-16 lg:ml-0 uppercase opacity-60">
            {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-3 ml-16 lg:ml-0">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm group"
          >
            <Download size={16} className="text-indigo-600 group-hover:-translate-y-0.5 transition-transform" />
            Export
          </button>
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button 
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <ListIcon size={18} />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
          <button 
            onClick={onBack} 
            className="hidden lg:flex px-6 py-3 bg-white text-slate-600 border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 items-center gap-2 shadow-sm"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </motion.header>

      {/* Progress & Summary Dashboard */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Main Stats Rail */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          <div className="flex overflow-x-auto no-scrollbar gap-3 pb-1 md:grid md:grid-cols-4">
            {[
              { label: 'Enrolled', value: stats.total, icon: '🎓', color: 'indigo', sub: 'Total' },
              { label: 'Present', value: stats.present, icon: '✅', color: 'emerald', sub: `${stats.percentage}% rate` },
              { label: 'Absent', value: stats.absent, icon: '🚨', color: 'rose', sub: 'Action needed' },
              { label: 'Unmarked', value: stats.unmarked, icon: '⏳', color: 'slate', sub: `${stats.progress}% done` },
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`min-w-[130px] md:min-w-0 bg-white p-3.5 rounded-[1.75rem] border-b-4 ${
                  stat.color === 'indigo' ? 'border-indigo-500' : 
                  stat.color === 'emerald' ? 'border-emerald-500' : 
                  stat.color === 'rose' ? 'border-rose-500' : 'border-slate-500'
                } shadow-lg shadow-slate-200/50 flex flex-col items-center text-center relative overflow-hidden group hover:-translate-y-1 transition-all cursor-default border border-slate-100 flex-shrink-0 md:flex-shrink`}
              >
                <div className={`w-10 h-10 rounded-xl ${
                  stat.color === 'indigo' ? 'bg-indigo-50' : 
                  stat.color === 'emerald' ? 'bg-emerald-50' : 
                  stat.color === 'rose' ? 'bg-rose-50' : 'bg-slate-50'
                } flex items-center justify-center text-lg mb-2 group-hover:scale-125 transition-transform duration-500`}>
                  {stat.icon}
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
                <h4 className="text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</h4>
                <p className={`text-[8px] font-bold mt-1.5 px-2 py-0.5 rounded-full ${
                  stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' : 
                  stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 
                  stat.color === 'rose' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600'
                } uppercase tracking-tighter`}>{stat.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Action Center Card */}
        <div className="xl:col-span-4 h-full">
          <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden h-full flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-xl tracking-tight text-white/90">Action Center</h3>
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/5">
                  <div className={`w-2 h-2 rounded-full ${stats.progress === 100 ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{stats.progress}% Complete</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-widest pl-1">Class</label>
                  <select 
                    value={selectedClass} 
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 p-3 rounded-2xl text-xs font-black outline-none focus:ring-2 focus:ring-white/20 transition-all cursor-pointer appearance-none"
                  >
                    {classes.map(c => <option key={c} value={c} className="bg-slate-900">Class {c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-widest pl-1">Date</label>
                  <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 p-3 rounded-2xl text-xs font-black outline-none focus:ring-2 focus:ring-white/20 transition-all [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>

            </div>
          </div>
        </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {viewMode === 'table' ? (
          <motion.div 
            key="table"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
          >
            {/* Integrated Controls Bar */}
            <div className="bg-white/95 backdrop-blur-xl py-5 px-8 border-b border-slate-100 flex flex-col md:flex-row items-center gap-4 transition-all">
              <div className="relative flex-1 w-full group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none">
                  <Search size={18} />
                </div>
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search student..."
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all text-sm"
                />
              </div>
              
              <div className="w-full md:w-auto flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50 overflow-x-auto no-scrollbar scroll-smooth">
                {(['All', 'Present', 'Absent', 'Late', 'Unmarked'] as const).map(f => (
                  <button 
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap min-w-fit ${statusFilter === f ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-0">
                <thead>
                  <tr className="bg-slate-50/80 backdrop-blur-md sticky top-0 z-10 transition-colors uppercase">
                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 tracking-[0.2em] border-b border-slate-100">Identity</th>
                    <th className="px-8 py-6 text-center text-[10px] font-black text-slate-400 tracking-[0.2em] border-b border-slate-100">Status Control</th>
                    <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 tracking-[0.2em] border-b border-slate-100">Observations</th>
                    <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 tracking-[0.2em] border-b border-slate-100">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {classStudents.map((student, idx) => (
                     <motion.tr 
                       layout
                       key={student.id} 
                       className="group hover:bg-indigo-50/30 transition-all duration-300"
                     >
                       <td className="px-8 py-5">
                          <div className="flex items-center gap-6">
                             <div className="flex flex-col items-center gap-2 flex-shrink-0">
                                <div className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-100 shadow-sm flex items-center justify-center text-2xl font-black text-slate-300 overflow-hidden relative group-hover:scale-105 group-hover:border-indigo-200 group-hover:shadow-indigo-100 transition-all duration-500">
                                   {student.photo ? (
                                     <img src={student.photo} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="" />
                                   ) : (
                                     <span className="bg-gradient-to-br from-slate-50 to-slate-100 w-full h-full flex items-center justify-center">{student.name.charAt(0)}</span>
                                   )}
                                </div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200 shadow-sm">
                                  S.R. {idx + 1}
                                </span>
                             </div>
                             <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-black text-slate-900 text-lg tracking-tight group-hover:text-indigo-600 transition-colors">{student.name}</p>
                                  {historicalStats[student.id] && (
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                                      historicalStats[student.id].percentage >= 90 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                      historicalStats[student.id].percentage >= 75 ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                      'bg-rose-50 text-rose-600 border-rose-100'
                                    }`}>
                                      {historicalStats[student.id].percentage}% Hist.
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  {localAttendance[student.id] && (
                                    <div className={`w-1.5 h-1.5 rounded-full ${
                                      localAttendance[student.id] === 'Present' ? 'bg-emerald-500' :
                                      localAttendance[student.id] === 'Absent' ? 'bg-rose-500' :
                                      localAttendance[student.id] === 'Late' ? 'bg-amber-500' : 'bg-indigo-500'
                                    }`} />
                                  )}
                                </div>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-5">
                          <div className="flex justify-center items-center gap-3">
                            {(['Present', 'Absent', 'Late', 'Leave'] as const).map(status => {
                               const isSelected = localAttendance[student.id] === status;
                               const colors = {
                                 Present: isSelected ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 ring-4 ring-emerald-50' : 'text-emerald-500 bg-emerald-50 hover:bg-emerald-100 border-emerald-100',
                                 Absent: isSelected ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 ring-4 ring-rose-50' : 'text-rose-500 bg-rose-50 hover:bg-rose-100 border-rose-100',
                                 Late: isSelected ? 'bg-amber-500 text-white shadow-lg shadow-amber-200 ring-4 ring-amber-50' : 'text-amber-500 bg-amber-50 hover:bg-amber-100 border-amber-100',
                                 Leave: isSelected ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-200 ring-4 ring-indigo-50' : 'text-indigo-500 bg-indigo-50 hover:bg-indigo-100 border-indigo-100',
                               };
                               
                               const icons = {
                                 Present: <CheckCircle2 size={14} />,
                                 Absent: <XCircle size={14} />,
                                 Late: <Clock size={14} />,
                                 Leave: <UserMinus size={14} />,
                               };

                               return (
                                 <button
                                   key={status}
                                   onClick={() => handleStatusChange(student.id, status)}
                                   className={`flex flex-col items-center justify-center p-2.5 min-w-[64px] rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${colors[status]} ${!isSelected ? 'opacity-40 hover:opacity-100' : 'scale-105'}`}
                                 >
                                   <div className="mb-1">{icons[status]}</div>
                                   {status}
                                 </button>
                               );
                            })}
                          </div>
                       </td>
                       <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-3 group/remark">
                            <input 
                              type="text" 
                              value={localRemarks[student.id] || ''}
                              onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                              placeholder="Add observation..."
                              className="text-xs font-bold p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 w-56 lg:w-72 transition-all hover:bg-white placeholder:text-slate-400"
                            />
                            <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors lg:opacity-0 lg:group-hover/remark:opacity-100">
                              <MoreHorizontal size={18} />
                            </button>
                          </div>
                       </td>
                     </motion.tr>
                   ))}
                   {classStudents.length === 0 && (
                     <tr>
                        <td colSpan={4} className="px-8 py-24 text-center">
                           <div className="flex flex-col items-center gap-6 max-w-sm mx-auto">
                              <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center text-5xl grayscale opacity-50 border-4 border-dashed border-slate-200">🏜️</div>
                              <div className="space-y-2">
                                <h4 className="text-xl font-black text-slate-800 tracking-tight">No results found</h4>
                                <p className="text-sm font-bold text-slate-400">Try adjusting your filters or search term to locate the records you need.</p>
                              </div>
                              <button 
                                onClick={() => setSearchTerm('')}
                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase"
                              >
                                Clear Search
                              </button>
                           </div>
                        </td>
                     </tr>
                   )}
                   {classStudents.length > 0 && (
                     <tr className="bg-slate-50/50">
                       <td colSpan={4} className="px-8 py-12">
                         <div className="flex flex-row items-center justify-start gap-8 pl-12">
                            <div className="dropdown relative group/bulk-table w-auto">
                              <button 
                                title="Interactive Bulk Mark"
                                className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] font-black text-2xl flex items-center justify-center transition-all active:scale-95 shadow-xl shadow-slate-200 border-2 border-slate-800 hover:bg-slate-800"
                              >
                                📝
                              </button>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-72 mb-4 bg-white border border-slate-100 rounded-[2.5rem] p-3 shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover/bulk-table:opacity-100 group-hover/bulk-table:translate-y-0 group-hover/bulk-table:pointer-events-auto transition-all z-50">
                                 <p className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 border-b border-slate-50">Bulk Actions</p>
                                 {[
                                   { label: 'All Present', status: 'Present', icon: <CheckCircle2 size={18} className="text-emerald-500" /> },
                                   { label: 'All Absent', status: 'Absent', icon: <XCircle size={18} className="text-rose-500" /> },
                                   { label: 'All Late', status: 'Late', icon: <Clock size={16} className="text-amber-500" /> },
                                 ].map((item) => (
                                   <button 
                                     key={item.label}
                                     onClick={() => handleMarkAll(item.status as any)}
                                     className="w-full text-left p-4 hover:bg-slate-50 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-4 transition-colors"
                                   >
                                      {item.icon}
                                      {item.label}
                                   </button>
                                 ))}
                                 <div className="h-px bg-slate-100 my-2" />
                                 <button 
                                    onClick={clearAllMarks}
                                    className="w-full text-left p-4 hover:bg-rose-50 text-rose-500 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-4 transition-colors"
                                 >
                                    <Trash2 size={18} />
                                    Clear Selection
                                 </button>
                              </div>
                            </div>

                            <button 
                              onClick={handleSave}
                              disabled={isSaving}
                              title="Confirm Sync"
                              className="w-20 h-20 bg-indigo-600 text-white rounded-[2rem] font-black text-3xl transition-all active:scale-95 flex items-center justify-center shadow-2xl shadow-indigo-200 disabled:opacity-50 group hover:bg-indigo-700"
                            >
                              {isSaving ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <span>☁️</span>
                              )}
                            </button>
                          </div></td>
                     </tr>
                   )}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="grid"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            {/* Integrated Controls Bar for Grid */}
            <div className="bg-white/80 backdrop-blur-xl py-4 px-6 rounded-[2rem] border border-slate-200 mb-6 flex flex-col md:flex-row items-center gap-4 transition-all">
              <div className="relative flex-1 w-full group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none">
                  <Search size={18} />
                </div>
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search student..."
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all text-sm"
                />
              </div>
              
              <div className="w-full md:w-auto flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50 overflow-x-auto no-scrollbar scroll-smooth">
                {(['All', 'Present', 'Absent', 'Late', 'Unmarked'] as const).map(f => (
                  <button 
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap min-w-fit ${statusFilter === f ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
              {classStudents.map((student, idx) => {
                const currentStatus = localAttendance[student.id];
                const statusGradients = {
                  Present: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/30',
                  Absent: 'from-rose-500/10 to-rose-500/5 border-rose-500/30',
                  Late: 'from-amber-500/10 to-amber-500/5 border-amber-500/30',
                  Leave: 'from-indigo-500/10 to-indigo-500/5 border-indigo-500/30',
                  unmarked: 'from-white to-white border-slate-200 shadow-sm'
                };

                return (
                  <div 
                    key={student.id} 
                    className={`bg-white rounded-[2.5rem] p-6 border transition-all duration-300 group hover:shadow-2xl hover:shadow-indigo-100 flex flex-col justify-between ${currentStatus ? statusGradients[currentStatus] : statusGradients.unmarked}`}
                  >
                    <div>
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-20 h-20 rounded-3xl bg-white border-4 border-white shadow-xl overflow-hidden relative group-hover:scale-105 transition-transform duration-500">
                            {student.photo ? (
                              <img src={student.photo} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="" />
                            ) : (
                              <div className="w-full h-full bg-slate-100 flex items-center justify-center text-2xl font-black text-slate-400">{student.name.charAt(0)}</div>
                            )}
                          </div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-200 shadow-sm transition-colors group-hover:border-slate-300 group-hover:bg-white group-hover:text-slate-600">
                            S.R. {idx + 1}
                          </span>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          !currentStatus ? 'bg-slate-100 text-slate-400' :
                          currentStatus === 'Present' ? 'bg-emerald-500 text-white' :
                          currentStatus === 'Absent' ? 'bg-rose-500 text-white' :
                          currentStatus === 'Late' ? 'bg-amber-500 text-white' : 'bg-indigo-500 text-white'
                        }`}>
                          {currentStatus || 'Unmarked'}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <h5 className="font-black text-slate-900 text-xl tracking-tight group-hover:text-indigo-600 transition-colors truncate flex-1">{student.name}</h5>
                        {historicalStats[student.id] && (
                          <div className={`p-1 box-content rounded-lg border flex flex-col items-center justify-center min-w-[32px] ${
                            historicalStats[student.id].percentage >= 90 ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                            historicalStats[student.id].percentage >= 75 ? 'bg-amber-50 border-amber-100 text-amber-600' :
                            'bg-rose-50 border-rose-100 text-rose-600'
                          }`}>
                            <span className="text-[8px] font-black leading-none">{historicalStats[student.id].percentage}%</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2 mb-6">
                        {(['Present', 'Absent', 'Late', 'Leave'] as const).map(status => (
                          <button
                            key={status}
                            title={status}
                            onClick={() => handleStatusChange(student.id, status)}
                            className={`flex items-center justify-center p-3 rounded-2xl border transition-all ${
                              localAttendance[student.id] === status 
                              ? 'bg-slate-900 border-slate-900 text-white scale-110 shadow-lg' 
                              : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-300'
                            }`}
                          >
                            {status === 'Present' && <CheckCircle2 size={16} />}
                            {status === 'Absent' && <XCircle size={16} />}
                            {status === 'Late' && <Clock size={16} />}
                            {status === 'Leave' && <UserMinus size={16} />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <input 
                      type="text"
                      value={localRemarks[student.id] || ''}
                      onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                      placeholder="Remarks..."
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-3 text-xs font-black outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                    />
                  </div>
                );
              })}
            </div>
            
            {classStudents.length > 0 && (
              <div className="sm:col-span-2 lg:col-span-3 2xl:col-span-4 mt-8 bg-white/50 backdrop-blur-sm p-8 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-row items-center justify-start gap-8 pl-12">
                <div className="dropdown relative group/bulk-grid w-auto">
                  <button 
                    title="Interactive Bulk Mark"
                    className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] font-black text-2xl flex items-center justify-center transition-all active:scale-95 shadow-xl shadow-slate-200"
                  >
                    📝
                  </button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-72 mb-4 bg-white border border-slate-100 rounded-[2.5rem] p-3 shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover/bulk-grid:opacity-100 group-hover/bulk-grid:translate-y-0 group-hover/bulk-grid:pointer-events-auto transition-all z-50">
                     <p className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 border-b border-slate-50">Bulk Actions</p>
                     {[
                       { label: 'All Present', status: 'Present', icon: <CheckCircle2 size={18} className="text-emerald-500" /> },
                       { label: 'All Absent', status: 'Absent', icon: <XCircle size={18} className="text-rose-500" /> },
                       { label: 'All Late', status: 'Late', icon: <Clock size={16} className="text-amber-500" /> },
                     ].map((item) => (
                       <button 
                         key={item.label}
                         onClick={() => handleMarkAll(item.status as any)}
                         className="w-full text-left p-4 hover:bg-slate-50 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-4 transition-colors"
                       >
                          {item.icon}
                          {item.label}
                       </button>
                     ))}
                     <div className="h-px bg-slate-100 my-2" />
                     <button 
                        onClick={clearAllMarks}
                        className="w-full text-left p-4 hover:bg-rose-50 text-rose-500 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-4 transition-colors"
                     >
                        <Trash2 size={18} />
                        Clear Selection
                     </button>
                  </div>
                </div>

                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  title="Confirm Sync"
                  className="w-20 h-20 bg-indigo-600 text-white rounded-[2rem] font-black text-3xl transition-all active:scale-95 flex items-center justify-center shadow-2xl shadow-indigo-200 disabled:opacity-50 group hover:bg-indigo-700"
                >
                  {isSaving ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>☁️</span>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Integrated Calendar Section - Placed below student list */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-2xl shadow-slate-200/50"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <CalendarIcon size={20} />
              </div>
              Attendance History Calendar
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-14">Click a date to view quick records</p>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-200">
            <button 
              onClick={() => setCalendarViewMonth(new Date(calendarViewMonth.setMonth(calendarViewMonth.getMonth() - 1)))}
              className="w-10 h-10 flex items-center justify-center hover:bg-white hover:text-indigo-600 rounded-xl transition-all shadow-sm group active:scale-95"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-700 min-w-[160px] text-center">
              {calendarViewMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button 
              onClick={() => setCalendarViewMonth(new Date(calendarViewMonth.setMonth(calendarViewMonth.getMonth() + 1)))}
              className="w-10 h-10 flex items-center justify-center hover:bg-white hover:text-indigo-600 rounded-xl transition-all shadow-sm group active:scale-95"
            >
              <ChevronRightIcon size={18} />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              {day}
            </div>
          ))}
          {calendarDays.map((date, idx) => (
            <motion.div 
              key={idx}
              whileHover={date ? { scale: 1.02, y: -2 } : {}}
              onClick={() => {
                if (date) {
                  setCalendarSelectedDate(date.dateStr);
                  setShowCalendarModal(true);
                }
              }}
              className={`aspect-square sm:aspect-auto sm:h-20 p-4 rounded-3xl transition-all cursor-pointer relative flex flex-col items-center justify-center border ${
                !date ? 'opacity-0 pointer-events-none' : 
                date.dateStr === new Date().toISOString().split('T')[0] ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 border-indigo-500 z-10' :
                'bg-white hover:bg-slate-50 text-slate-600 border-slate-100 hover:border-slate-300'
              }`}
            >
              <span className={`text-sm font-black ${date?.dateStr === new Date().toISOString().split('T')[0] ? 'text-white' : 'text-slate-700'}`}>
                {date?.day}
              </span>
              
              {date && attendance.some(r => r.date === date.dateStr) && (
                <div className="flex gap-1 mt-2">
                   {/* Summary dots for the day */}
                   <div className={`w-1.5 h-1.5 rounded-full ${date.dateStr === new Date().toISOString().split('T')[0] ? 'bg-indigo-200' : 'bg-indigo-400 animate-pulse'}`} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Re-edit Confirmation Floating Window */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-slate-100"
            >
              <div className="flex flex-col items-center text-center gap-6">
                <div className="w-20 h-20 rounded-3xl bg-amber-50 flex items-center justify-center text-3xl animate-bounce-subtle">
                  ⚠️
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Confirm Status Change</h3>
                  <p className="text-slate-500 font-bold leading-relaxed px-4">
                    Attendance for this student has already been recorded. Are you sure you want to update it to <span className="text-indigo-600 font-black">{pendingUpdate?.status}</span>?
                  </p>
                </div>
                
                <div className="flex gap-3 w-full mt-2">
                  <button 
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmReEdit}
                    className="flex-[1.5] px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    Confirm & Sync
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Calendar Quick View Modal */}
      <AnimatePresence>
        {showCalendarModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCalendarModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative bg-white w-full max-w-lg rounded-[3rem] p-8 shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
              
              <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Quick Check</h3>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Records for {new Date(calendarSelectedDate!).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <button 
                     onClick={() => setShowCalendarModal(false)}
                     className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all active:scale-90"
                  >
                    <ArrowLeft size={18} className="rotate-90" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Target Class</label>
                    <select 
                      value={modalClass}
                      onChange={(e) => setModalClass(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs font-black outline-none focus:ring-4 focus:ring-indigo-50 transition-all appearance-none cursor-pointer"
                    >
                      {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Target Student</label>
                    <select 
                      value={modalStudentId}
                      onChange={(e) => setModalStudentId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs font-black outline-none focus:ring-4 focus:ring-indigo-50 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select Student</option>
                      {modalStudents.map(s => <option key={s.id} value={s.id}>{s.name} (#{s.id})</option>)}
                    </select>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-[2rem] p-10 flex flex-col items-center text-center justify-center border-2 border-dashed border-slate-200">
                  {selectedStudentAttendance ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-4"
                    >
                      <div className={`w-24 h-24 rounded-[2rem] mx-auto flex items-center justify-center text-4xl shadow-2xl ${
                        selectedStudentAttendance.status === 'Present' ? 'bg-emerald-500 text-white shadow-emerald-200' :
                        selectedStudentAttendance.status === 'Absent' ? 'bg-rose-500 text-white shadow-rose-200' :
                        selectedStudentAttendance.status === 'Late' ? 'bg-amber-500 text-white shadow-amber-200' : 'bg-indigo-500 text-white shadow-indigo-200'
                      }`}>
                        {selectedStudentAttendance.status === 'Present' && <CheckCircle2 size={40} />}
                        {selectedStudentAttendance.status === 'Absent' && <XCircle size={40} />}
                        {selectedStudentAttendance.status === 'Late' && <Clock size={40} />}
                        {selectedStudentAttendance.status === 'Leave' && <UserMinus size={40} />}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Recorded</p>
                        <h4 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{selectedStudentAttendance.status}</h4>
                        {selectedStudentAttendance.remarks && (
                           <div className="mt-4 p-4 bg-white border border-slate-100 rounded-2xl text-xs font-bold text-slate-500 italic">
                             "{selectedStudentAttendance.remarks}"
                           </div>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-3 opacity-40">
                      <div className="w-20 h-20 rounded-full bg-slate-200 mx-auto flex items-center justify-center text-3xl">🗓️</div>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-500">No Record Found</p>
                      <p className="text-[10px] font-bold text-slate-400">Attendance hasn't been synced for this combination yet.</p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => {
                    setSelectedDate(calendarSelectedDate!);
                    setSelectedClass(modalClass);
                    setShowCalendarModal(false);
                  }}
                  className="w-full bg-slate-900 text-white rounded-2xl p-5 font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200"
                >
                  Manage This Date
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Attendance;
