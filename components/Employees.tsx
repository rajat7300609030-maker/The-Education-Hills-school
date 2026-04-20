import React, { useState, useMemo } from 'react';
import { Employee, EmployeeAttendanceRecord } from '../types';
import { compressImage } from '../utils/imageUtils';

interface EmployeesProps {
  employees: Employee[];
  attendance: EmployeeAttendanceRecord[];
  currency: string;
  onAddEmployee: (employee: Omit<Employee, 'id' | 'isDeleted'>) => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (id: string) => void;
  onViewProfile: (id: string) => void;
  onRecordPayment: (id: string) => void;
  onSaveAttendance: (records: EmployeeAttendanceRecord[]) => void;
  onNotify?: (message: string, type: 'success' | 'error' | 'info') => void;
  syncStatus?: 'synced' | 'syncing' | 'error';
  onManualSync?: () => Promise<void>;
  session?: string;
}

const Employees: React.FC<EmployeesProps> = ({ 
  employees, 
  attendance,
  currency, 
  onAddEmployee, 
  onEditEmployee, 
  onDeleteEmployee, 
  onViewProfile,
  onRecordPayment,
  onSaveAttendance,
  onNotify,
  syncStatus = 'synced',
  onManualSync,
  session: initialSession = '2024-25'
}) => {
  const [session, setSession] = useState(initialSession);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<Omit<Employee, 'id' | 'isDeleted'>>({
    name: '',
    role: 'Teacher',
    salary: 0,
    phone: '',
    email: '',
    joiningDate: new Date().toISOString().split('T')[0],
    dob: '',
    status: 'Active',
    photo: ''
  });

  const activeEmployees = useMemo(() => {
    return employees.filter(e => !e.isDeleted && e.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [employees, searchTerm]);

  const attendanceStats = useMemo(() => {
    const dailyRecords = attendance.filter(a => a.date === selectedDate);
    return {
      present: dailyRecords.filter(r => r.status === 'Present').length,
      absent: dailyRecords.filter(r => r.status === 'Absent').length,
      late: dailyRecords.filter(r => r.status === 'Late').length,
      leave: dailyRecords.filter(r => r.status === 'Leave').length,
    };
  }, [attendance, selectedDate]);

  const handleMarkAttendance = (employeeId: string, status: 'Present' | 'Absent' | 'Late' | 'Leave') => {
    const newRecord: EmployeeAttendanceRecord = {
      id: `EMP-ATT-${Date.now()}-${employeeId}`,
      employeeId,
      date: selectedDate,
      status,
      session
    };
    onSaveAttendance([newRecord]);
    onNotify?.(`Marked ${status} for today`, 'info');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onEditEmployee({ ...formData, id: editingId, isDeleted: false });
      onNotify?.(`Updated ${formData.name}`, 'success');
    } else {
      onAddEmployee(formData);
      onNotify?.(`Added ${formData.name}`, 'success');
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: 'Teacher',
      salary: 0,
      phone: '',
      email: '',
      joiningDate: new Date().toISOString().split('T')[0],
      dob: '',
      status: 'Active',
      photo: ''
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (employee: Employee) => {
    setEditingId(employee.id);
    setFormData({
      name: employee.name,
      role: employee.role,
      salary: employee.salary,
      phone: employee.phone,
      email: employee.email,
      joiningDate: employee.joiningDate,
      dob: employee.dob || '',
      status: employee.status,
      photo: employee.photo || ''
    });
    setIsFormOpen(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string, 400, 400, 0.7);
        setFormData(prev => ({ ...prev, photo: compressed }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <span>Employees 👔</span>
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
          <p className="text-slate-500 font-medium">Manage staff, faculty, and payroll profiles.</p>
        </div>
        <button 
          onClick={() => isFormOpen && !editingId ? resetForm() : setIsFormOpen(true)}
          className={`px-6 py-3 rounded-2xl font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2 ${
            isFormOpen && !editingId 
            ? 'bg-slate-800 text-white shadow-slate-200' 
            : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700'
          }`}
        >
          {isFormOpen && !editingId ? (
            <><span>✖️</span> Close Form</>
          ) : (
            <><span>➕</span> Add New Employee</>
          )}
        </button>
      </header>

      {/* FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 w-full max-w-2xl animate-scale-in border border-slate-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
             
             <div className="flex justify-between items-center mb-8 relative z-10">
                <h3 className="text-2xl font-black text-slate-800">{editingId ? '✏️ Edit Profile' : '✨ New Staff Registry'}</h3>
                <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 text-2xl transition-colors">✕</button>
             </div>

             <form onSubmit={handleSubmit} className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 flex items-center gap-6 mb-2">
                    <div className="w-24 h-24 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 relative overflow-hidden group">
                        {formData.photo ? (
                            <img src={formData.photo} className="w-full h-full object-cover" alt="Preview" />
                        ) : (
                            <>
                                <span className="text-3xl">📷</span>
                                <span className="text-[9px] font-black uppercase mt-1">Upload</span>
                            </>
                        )}
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handlePhotoUpload} />
                    </div>
                    <div>
                        <p className="font-black text-slate-800 uppercase text-xs tracking-widest mb-1">Employee Photo</p>
                        <p className="text-[10px] text-slate-400 font-medium italic">High resolution JPG/PNG recommended</p>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. John Smith" />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Designation</label>
                    <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                        {['Teacher', 'Principal', 'Admin Staff', 'Librarian', 'Technician', 'Security', 'Maintenance', 'Other'].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Salary ({currency})</label>
                    <input required type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.salary || ''} onChange={e => setFormData({...formData, salary: parseFloat(e.target.value)})} placeholder="0.00" />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Joining Date</label>
                    <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.joiningDate} onChange={e => setFormData({...formData, joiningDate: e.target.value})} />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                    <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Number</label>
                    <input required type="tel" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91 ..." />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input type="email" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="staff@school.com" />
                </div>

                <div className="md:col-span-2 flex gap-4 pt-4">
                    <button type="button" onClick={resetForm} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-slate-200 transition-all">Cancel</button>
                    <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
                        {editingId ? 'Update Profile' : 'Add to Records'}
                    </button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* SEARCH AND LIST */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
            <span className="text-xl">🔍</span>
            <input 
              type="text" className="flex-1 bg-transparent font-bold outline-none text-slate-700" 
              placeholder="Search employees by name..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 min-w-[200px]">
            <span className="text-xl">📅</span>
            <input 
              type="date" className="flex-1 bg-transparent font-bold outline-none text-slate-700 text-sm" 
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
        </div>
      </div>

      {/* ATTENDANCE SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Present</p>
                  <h4 className="text-xl font-black text-emerald-600 leading-none">{attendanceStats.present}</h4>
              </div>
              <span className="text-2xl opacity-40">✅</span>
          </div>
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Absent</p>
                  <h4 className="text-xl font-black text-rose-600 leading-none">{attendanceStats.absent}</h4>
              </div>
              <span className="text-2xl opacity-40">❌</span>
          </div>
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Late</p>
                  <h4 className="text-xl font-black text-amber-600 leading-none">{attendanceStats.late}</h4>
              </div>
              <span className="text-2xl opacity-40">⏰</span>
          </div>
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Leave</p>
                  <h4 className="text-xl font-black text-blue-600 leading-none">{attendanceStats.leave}</h4>
              </div>
              <span className="text-2xl opacity-40">📝</span>
          </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activeEmployees.map((emp, idx) => {
              const isActive = activeCardId === emp.id;
              const todayAttendance = attendance.find(a => a.employeeId === emp.id && a.date === selectedDate);
              
              return (
                <div 
                    key={emp.id} 
                    onClick={() => setActiveCardId(isActive ? null : emp.id)}
                    className={`stagger-item group bg-white rounded-[2rem] p-6 border-2 transition-all duration-500 overflow-hidden relative flex flex-col cursor-pointer ${
                        isActive ? 'border-indigo-500 shadow-2xl ring-4 ring-indigo-500/10 scale-[1.02] z-50' : 'border-slate-50 hover:border-indigo-100 shadow-lg hover:shadow-2xl'
                    }`} 
                    style={{ animationDelay: `${idx * 50}ms`, minHeight: isActive ? '320px' : 'auto' }}
                >
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -translate-y-6 translate-x-6 transition-transform ${isActive ? 'scale-150 opacity-20' : 'group-hover:scale-110'}`}></div>
                    
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-start gap-4 mb-6">
                             <div className={`w-16 h-16 rounded-[1.25rem] bg-slate-100 border-2 border-white shadow-md overflow-hidden flex items-center justify-center text-3xl shrink-0 transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                 {emp.photo ? <img src={emp.photo} className="w-full h-full object-cover" /> : emp.name.charAt(0)}
                             </div>
                             <div className="min-w-0 pr-4">
                                 <h4 className="font-black text-slate-800 text-lg leading-tight truncate">{emp.name}</h4>
                                 <div className="flex items-center gap-2 mt-1">
                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{emp.role}</p>
                                    {todayAttendance && (
                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                            todayAttendance.status === 'Present' ? 'bg-emerald-100 text-emerald-600' :
                                            todayAttendance.status === 'Absent' ? 'bg-rose-100 text-rose-600' :
                                            todayAttendance.status === 'Late' ? 'bg-amber-100 text-amber-600' :
                                            'bg-blue-100 text-blue-600'
                                        }`}>
                                            {todayAttendance.status}
                                        </span>
                                    )}
                                 </div>
                             </div>
                        </div>

                        {!isActive ? (
                            <div className="space-y-3 mb-6 flex-1 animate-fade-in">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                    <span className="text-lg">📞</span> {emp.phone}
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 truncate">
                                    <span className="text-lg">📧</span> {emp.email || 'No Email'}
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 truncate">
                                    <span className="text-lg">🎂</span> {emp.dob ? new Date(emp.dob).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : 'N/A'}
                                </div>
                                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center justify-between mt-4">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Salary</span>
                                    <span className="font-black text-slate-800">{currency}{emp.salary.toLocaleString()}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col justify-center gap-3 py-4 animate-scale-in">
                                {/* ATTENDANCE SECTION */}
                                <div className="space-y-2 mb-4">
                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Mark Attendance</p>
                                     <div className="grid grid-cols-4 gap-2">
                                         {[
                                             { label: 'Present', emoji: '✅', color: 'emerald', status: 'Present', 
                                               activeBg: 'bg-emerald-600 border-emerald-600 text-white', 
                                               inactiveBg: 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100' },
                                             { label: 'Absent', emoji: '❌', color: 'rose', status: 'Absent',
                                               activeBg: 'bg-rose-600 border-rose-600 text-white', 
                                               inactiveBg: 'bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100' },
                                             { label: 'Late', emoji: '⏰', color: 'amber', status: 'Late',
                                               activeBg: 'bg-amber-600 border-amber-600 text-white', 
                                               inactiveBg: 'bg-amber-50 border-amber-100 text-amber-600 hover:bg-amber-100' },
                                             { label: 'Leave', emoji: '📝', color: 'blue', status: 'Leave',
                                               activeBg: 'bg-blue-600 border-blue-600 text-white', 
                                               inactiveBg: 'bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100' }
                                         ].map(btn => (
                                             <button
                                                 key={btn.status}
                                                 onClick={(e) => { 
                                                     e.stopPropagation(); 
                                                     handleMarkAttendance(emp.id, btn.status as any); 
                                                 }}
                                                 className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-2xl border transition-all active:scale-95 ${
                                                     todayAttendance?.status === btn.status 
                                                     ? `${btn.activeBg} shadow-lg shadow-indigo-100` 
                                                     : `${btn.inactiveBg}`
                                                 }`}
                                             >
                                                 <span className="text-sm">{btn.emoji}</span>
                                                 <span className="text-[7px] font-black uppercase tracking-widest">{btn.label}</span>
                                             </button>
                                         ))}
                                     </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onViewProfile(emp.id); }}
                                        className="flex flex-col items-center justify-center gap-2 p-4 bg-indigo-50 text-indigo-600 rounded-2xl font-black uppercase text-[9px] tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                    >
                                        <span className="text-xl">👤</span>
                                        View Profile
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onRecordPayment(emp.id); }}
                                        className="flex flex-col items-center justify-center gap-2 p-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black uppercase text-[9px] tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                    >
                                        <span className="text-xl">💸</span>
                                        Payment
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleEdit(emp); }}
                                        className="flex flex-col items-center justify-center gap-2 p-4 bg-amber-50 text-amber-600 rounded-2xl font-black uppercase text-[9px] tracking-widest hover:bg-amber-600 hover:text-white transition-all shadow-sm"
                                    >
                                        <span className="text-xl">✏️</span>
                                        Edit
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setEmployeeToDelete(emp); }}
                                        className="flex flex-col items-center justify-center gap-2 p-4 bg-rose-50 text-rose-600 rounded-2xl font-black uppercase text-[9px] tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                    >
                                        <span className="text-xl">🗑️</span>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )}

                        {!isActive && (
                            <div className="pt-4 border-t border-slate-50 flex justify-center">
                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest animate-pulse">Click to view options</p>
                            </div>
                        )}
                    </div>
                </div>
              );
          })}
          {activeEmployees.length === 0 && (
              <div className="col-span-full py-32 bg-slate-50 border-4 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-slate-400">
                  <span className="text-6xl mb-4">👥</span>
                  <p className="font-black text-xl uppercase tracking-widest">No Staff Found</p>
                  <p className="text-sm font-bold opacity-60 mt-2 mb-6">Start by adding your first employee.</p>
                  <button 
                    onClick={() => setIsFormOpen(true)}
                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2"
                  >
                    <span>✨</span> Register New Employee
                  </button>
              </div>
          )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {employeeToDelete && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[150] flex items-center justify-center p-4 animate-fade-in" onClick={() => setEmployeeToDelete(null)}>
              <div className="bg-white rounded-[3rem] p-10 w-full max-w-sm text-center shadow-2xl border border-white/20 animate-scale-in" onClick={e => e.stopPropagation()}>
                  <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-xl shadow-rose-100/50">⚠️</div>
                  <h3 className="text-2xl font-black text-slate-800 mb-3 leading-tight">Delete Employee?</h3>
                  <p className="text-sm text-slate-500 mb-10 font-medium leading-relaxed px-4">
                      Are you sure you want to delete <strong>{employeeToDelete.name}</strong>? This record will be moved to the Recycle Bin.
                  </p>
                  <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => {
                            onDeleteEmployee(employeeToDelete.id);
                            setEmployeeToDelete(null);
                            setActiveCardId(null);
                        }} 
                        className="w-full py-5 bg-rose-600 text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl shadow-2xl shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95"
                      >
                          Yes, Delete
                      </button>
                      <button 
                        onClick={() => setEmployeeToDelete(null)} 
                        className="w-full py-5 bg-slate-50 text-slate-500 font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-slate-100 transition-all active:scale-95"
                      >
                          No, Keep Record
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Employees;