import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, AttendanceRecord } from '../types';
import { Search, Filter, CheckCircle2, XCircle, Clock, UserMinus, Plus, ChevronRight, LayoutGrid, List as ListIcon, Calendar as CalendarIcon, Save, ArrowLeft, MoreHorizontal } from 'lucide-react';

interface AttendanceProps {
  students: Student[];
  classes: string[];
  attendance: AttendanceRecord[];
  onSaveAttendance: (records: AttendanceRecord[]) => void;
  onBack: () => void;
}

const Attendance: React.FC<AttendanceProps> = ({ students, classes, attendance, onSaveAttendance, onBack }) => {
  const [selectedClass, setSelectedClass] = useState(classes[0] || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Present' | 'Absent' | 'Late' | 'Unmarked'>('All');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [localAttendance, setLocalAttendance] = useState<Record<string, 'Present' | 'Absent' | 'Late' | 'Leave'>>({});
  const [localRemarks, setLocalRemarks] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

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

  const handleStatusChange = (studentId: string, status: 'Present' | 'Absent' | 'Late' | 'Leave') => {
    setLocalAttendance(prev => {
      if (prev[studentId] === status) {
        const next = { ...prev };
        delete next[studentId];
        return next;
      }
      return { ...prev, [studentId]: status };
    });
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

  const handleMarkAll = (status: 'Present' | 'Absent' | 'Late' | 'Leave') => {
      const newMap = { ...localAttendance };
      classStudents.forEach(s => {
          newMap[s.id] = status;
      });
      setLocalAttendance(newMap);
  };

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
        <div className="xl:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
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
              className={`bg-white p-5 rounded-[2rem] border-b-4 ${
                stat.color === 'indigo' ? 'border-indigo-500' : 
                stat.color === 'emerald' ? 'border-emerald-500' : 
                stat.color === 'rose' ? 'border-rose-500' : 'border-slate-500'
              } shadow-xl shadow-slate-200/50 flex flex-col items-center text-center relative overflow-hidden group hover:-translate-y-1 transition-all cursor-default border border-slate-100`}
            >
              <div className={`w-12 h-12 rounded-2xl ${
                stat.color === 'indigo' ? 'bg-indigo-50' : 
                stat.color === 'emerald' ? 'bg-emerald-50' : 
                stat.color === 'rose' ? 'bg-rose-50' : 'bg-slate-50'
              } flex items-center justify-center text-xl mb-3 group-hover:scale-125 transition-transform duration-500`}>
                {stat.icon}
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h4>
              <p className={`text-[9px] font-bold mt-2 px-2 py-0.5 rounded-full ${
                stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' : 
                stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 
                stat.color === 'rose' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600'
              } uppercase tracking-tighter`}>{stat.sub}</p>
            </motion.div>
          ))}
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

            <div className="flex gap-2 mt-6 relative z-10">
              <button 
                onClick={() => handleMarkAll('Present')}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white rounded-2xl p-4 font-black text-[10px] uppercase tracking-widest border border-white/5 transition-all active:scale-95 flex items-center justify-center gap-2 group"
              >
                <CheckCircle2 size={16} className="text-emerald-400 group-hover:scale-125 transition-transform" />
                All Present
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className={`flex-[1.5] bg-white text-slate-900 rounded-2xl p-4 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-white/5 disabled:opacity-50 disabled:active:scale-100 group`}
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={16} className="text-indigo-600 group-hover:rotate-12 transition-transform" /> 
                    Confirm Sync
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="bg-white/50 backdrop-blur-xl sticky top-[72px] z-30 py-4 -mx-4 px-4 border-y border-slate-200/60 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search students by name or unique ID..."
            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>
        
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-full md:w-auto overflow-x-auto no-scrollbar">
          {(['All', 'Present', 'Absent', 'Late', 'Unmarked'] as const).map(f => (
            <button 
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${statusFilter === f ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {f}
            </button>
          ))}
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
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-0">
                <thead>
                  <tr className="bg-slate-50/80 backdrop-blur-md sticky top-0 z-10 transition-colors uppercase">
                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 tracking-[0.2em] border-b border-slate-100">Identity</th>
                    <th className="px-8 py-6 text-center text-[10px] font-black text-slate-400 tracking-[0.2em] border-b border-slate-100">Status Control</th>
                    <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 tracking-[0.2em] border-b border-slate-100">Observations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {classStudents.map((student) => (
                     <motion.tr 
                       layout
                       key={student.id} 
                       className="group hover:bg-indigo-50/30 transition-all duration-300"
                     >
                       <td className="px-8 py-5">
                          <div className="flex items-center gap-5">
                             <div className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-100 shadow-sm flex items-center justify-center text-2xl font-black text-slate-300 overflow-hidden relative group-hover:scale-105 group-hover:border-indigo-200 group-hover:shadow-indigo-100 transition-all duration-500">
                                {student.photo ? (
                                  <img src={student.photo} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="" />
                                ) : (
                                  <span className="bg-gradient-to-br from-slate-50 to-slate-100 w-full h-full flex items-center justify-center">{student.name.charAt(0)}</span>
                                )}
                             </div>
                             <div>
                                <p className="font-black text-slate-900 text-lg tracking-tight group-hover:text-indigo-600 transition-colors">{student.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200"># {student.id}</span>
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
                        <td colSpan={3} className="px-8 py-24 text-center">
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6"
          >
            {classStudents.map((student) => {
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
                      <div className="w-20 h-20 rounded-3xl bg-white border-4 border-white shadow-xl overflow-hidden relative group-hover:scale-105 transition-transform duration-500">
                        {student.photo ? (
                          <img src={student.photo} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="" />
                        ) : (
                          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-2xl font-black text-slate-400">{student.name.charAt(0)}</div>
                        )}
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
                    
                    <h5 className="font-black text-slate-900 text-xl tracking-tight mb-4 group-hover:text-indigo-600 transition-colors truncate">{student.name}</h5>
                    
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Attendance;
