import React, { useMemo } from 'react';
import { Employee, ExpenseRecord, SchoolProfileData } from '../types';

interface EmployeeProfileProps {
  employee: Employee;
  expenses: ExpenseRecord[];
  schoolData: SchoolProfileData;
  currency: string;
  onBack: () => void;
  onNavigateToEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onRecordPayment: (id: string) => void;
  onNotify?: (message: string, type: 'success' | 'error' | 'info') => void;
}

const EmployeeProfile: React.FC<EmployeeProfileProps> = ({
  employee,
  expenses,
  schoolData,
  currency,
  onBack,
  onNavigateToEdit,
  onDelete,
  onRecordPayment,
  onNotify
}) => {
  const salaryPayments = useMemo(() => {
    return expenses.filter(ex => ex.employeeId === employee.id && !ex.isDeleted && ex.category === 'Salary');
  }, [expenses, employee.id]);

  const totalPaid = useMemo(() => {
    return salaryPayments.reduce((sum, p) => sum + p.amount, 0);
  }, [salaryPayments]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="animate-fade-in pb-12 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
        >
          <span>⬅️</span> Back
        </button>
        <div className="flex gap-2">
          <button 
            onClick={() => onNavigateToEdit(employee.id)}
            className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition-colors"
          >
            ✏️ Edit
          </button>
          <button 
            onClick={() => { if(confirm('Delete this employee profile?')) onDelete(employee.id); }}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Profile Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className="h-32 bg-gradient-to-br from-indigo-600 to-purple-700 relative">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            </div>
            <div className="px-8 pb-8 relative">
              <div className="flex justify-center -mt-16 mb-6">
                <div className="w-32 h-32 rounded-[2.5rem] bg-white p-1.5 shadow-2xl border-4 border-white overflow-hidden">
                  <div className="w-full h-full rounded-[2rem] bg-slate-100 flex items-center justify-center text-5xl">
                    {employee.photo ? (
                      <img src={employee.photo} alt={employee.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{employee.name.charAt(0)}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">{employee.name}</h2>
                <p className="text-indigo-600 font-black uppercase text-[10px] tracking-[0.2em] mt-1">{employee.role}</p>
                <div className="mt-4 flex justify-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${employee.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                    {employee.status}
                  </span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                    ID: {employee.id}
                  </span>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-2xl">📞</span>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</p>
                    <p className="font-bold text-slate-700">{employee.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-2xl">📧</span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</p>
                    <p className="font-bold text-slate-700 truncate">{employee.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-2xl">📅</span>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Joining Date</p>
                    <p className="font-bold text-slate-700">{formatDate(employee.joiningDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-2xl">🎂</span>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date of Birth</p>
                    <p className="font-bold text-slate-700">{employee.dob ? formatDate(employee.dob) : 'Not Provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Financials & History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
                  <span className="p-2 bg-white/10 rounded-xl">💰</span> Payroll Overview
                </h3>
                <button 
                  onClick={() => onRecordPayment(employee.id)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-900/20 hover:bg-indigo-700 transition-all active:scale-95"
                >
                  Pay Salary
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
                  <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2">Monthly Salary</p>
                  <p className="text-3xl font-black">{currency}{employee.salary.toLocaleString()}</p>
                </div>
                <div className="bg-emerald-500/10 rounded-3xl p-6 border border-emerald-500/10">
                  <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest mb-2">Total Paid (Session)</p>
                  <p className="text-3xl font-black text-emerald-400">{currency}{totalPaid.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-3">
              <span className="p-2 bg-slate-50 rounded-xl">📜</span> Payment History
            </h3>
            
            <div className="space-y-4">
              {salaryPayments.length > 0 ? (
                salaryPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(payment => (
                  <div key={payment.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:border-indigo-100 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">💸</div>
                      <div>
                        <p className="font-black text-slate-800">{payment.title}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatDate(payment.date)} • {payment.paymentMethod}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-emerald-600 text-lg">{currency}{payment.amount.toLocaleString()}</p>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Salary Paid</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                  <span className="text-4xl mb-2 block">📭</span>
                  <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No payments recorded yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
