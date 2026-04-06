import React, { useMemo, useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { motion, AnimatePresence } from 'motion/react';
import { Student, FeeRecord, SchoolProfileData, AppSettings } from '../types';

interface ParentProfileProps {
  parentName: string;
  parentPhone?: string;
  parentAddress?: string;
  students: Student[];
  fees: FeeRecord[];
  currency: string;
  schoolProfile: SchoolProfileData;
  settings: AppSettings;
  onBack: () => void;
  onNavigateToStudent: (studentId: string) => void;
  onNavigateToFees: (studentId?: string) => void;
  userRole?: 'ADMIN' | 'STUDENT';
}

const ParentProfile: React.FC<ParentProfileProps> = ({ 
  parentName,
  parentPhone,
  parentAddress,
  students,
  fees,
  currency,
  schoolProfile,
  settings,
  onBack,
  onNavigateToStudent,
  onNavigateToFees,
  userRole = 'ADMIN'
}) => {
  const isAdmin = userRole === 'ADMIN';
  const [viewFamilyReceipt, setViewFamilyReceipt] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  // Pattern fix constant
  const SVG_TEXTURE = "data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.08' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3C/g%3E%3C/svg%3E";

  const myChildren = useMemo(() => 
    students.filter(s => 
        (s.parentName || '').trim() === (parentName || '').trim() && 
        (s.phone || '').trim() === (parentPhone || '').trim() && 
        (s.address || '').trim() === (parentAddress || '').trim() &&
        !s.isDeleted
    ), 
  [students, parentName, parentPhone, parentAddress]);

  const familyStats = useMemo(() => {
    let totalLiability = 0;
    let totalPaid = 0;
    let totalBacklogs = 0;

    myChildren.forEach(child => {
       const childFees = fees.filter(f => f.studentId === child.id && !f.isDeleted);
       const paid = childFees.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);
       
       const liability = (child.totalAgreedFees || 0) + (child.backLogs || 0);
       
       totalLiability += liability;
       totalPaid += paid;
       totalBacklogs += (child.backLogs || 0);
    });

    const totalDue = totalLiability - totalPaid;
    const progress = totalLiability > 0 ? Math.round((totalPaid / totalLiability) * 100) : 0;

    return { totalLiability, totalPaid, totalDue, totalBacklogs, progress };
  }, [myChildren, fees]);

  const familyTransactions = useMemo(() => {
     const childIds = myChildren.map(c => c.id);
     return fees
        .filter(f => childIds.includes(f.studentId) && !f.isDeleted)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [myChildren, fees]);

  const lastPayment = familyTransactions.length > 0 ? familyTransactions[0] : null;

  const handleDownloadFamilyReceipt = async () => {
    if (!receiptRef.current) return;
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          // Ensure the cloned element is visible for rendering
          const el = clonedDoc.querySelector('.receipt-container') as HTMLElement;
          if (el) el.style.display = 'block';
        }
      });
      const link = document.createElement('a');
      link.download = `Family_Receipt_${parentName.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleShareFamilyReceipt = async () => {
    if (!receiptRef.current) return;
    setIsSharing(true);
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Blob creation failed');

      const file = new File([blob], `Family_Receipt_${parentName.replace(/\s+/g, '_')}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Family Payment Receipt',
          text: `Payment receipt for ${parentName}'s family.`
        });
      } else {
        const url = canvas.toDataURL('image/png');
        const win = window.open();
        if (win) {
          win.document.write(`<img src="${url}" style="max-width: 100%;" />`);
        } else {
          handleDownloadFamilyReceipt();
        }
      }
    } catch (err: any) {
      // Ignore user cancellation
      if (err.name === 'AbortError') {
        console.log('Share canceled by user');
      } else {
        console.error('Share error:', err);
        handleDownloadFamilyReceipt();
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handlePrintFamilyReceipt = () => {
    if (!receiptRef.current) return;
    const content = receiptRef.current.innerHTML;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Family Payment Receipt</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              @media print {
                body { padding: 0; margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body class="p-10">
            ${content}
            <script>
              window.onload = () => {
                window.print();
                window.onafterprint = () => window.close();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const contactInfo = {
      phone: parentPhone || 'N/A',
      email: myChildren.length > 0 ? myChildren[0].email : 'N/A',
      address: parentAddress || 'N/A'
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

  return (
    <div className="animate-fade-in pb-12 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <button 
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
        >
            <span>⬅️</span> Back
        </button>
        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 text-xs font-bold uppercase tracking-wider">
            <span>👨‍👩‍👧‍👦</span> Family Profile
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden relative">
          <div className="h-32 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("${SVG_TEXTURE}")` }}></div>
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
          </div>
          
          <div className="px-8 pb-8 relative">
              <div className="flex flex-col md:flex-row gap-6 items-start -mt-12">
                  <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-lg shrink-0 rotate-3">
                      <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center text-4xl border border-slate-200">
                          👨‍👩‍👧‍👦
                      </div>
                  </div>
                  
                  <div className="flex-1 pt-2 md:pt-14">
                      <h1 className="text-3xl font-black text-slate-800">{parentName}</h1>
                      <div className="flex flex-wrap gap-4 mt-3 text-sm font-medium text-slate-600">
                          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                              <span className="text-lg">📞</span> {contactInfo.phone}
                          </div>
                          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                              <span className="text-lg">🏠</span> {contactInfo.address}
                          </div>
                      </div>
                  </div>

                  {isAdmin && (
                      <div className="pt-0 md:pt-14">
                          <a 
                            href={`tel:${contactInfo.phone}`}
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-transform active:scale-95"
                          >
                              <span>📞</span> Call Parent
                          </a>
                      </div>
                  )}
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
              <button 
                onClick={() => setViewFamilyReceipt(true)}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white rounded-[1.5rem] border border-indigo-100 shadow-sm text-indigo-600 font-black text-sm hover:bg-indigo-50 transition-all active:scale-95 group"
              >
                  <span className="text-xl group-hover:rotate-12 transition-transform">🧾</span>
                  Family Payment Receipt
                  <span className="ml-auto text-indigo-300 group-hover:translate-x-1 transition-transform">→</span>
              </button>

              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] p-6 text-white shadow-xl border border-indigo-200 ring-1 ring-indigo-500/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                  
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-6 relative z-10">
                      <span>💰</span> Family Financials
                  </h3>

                  <div className="space-y-4 relative z-10">
                      <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl border border-white/5 backdrop-blur-sm">
                          <div>
                              <p className="text-[10px] font-bold text-blue-300 uppercase">Total Fees</p>
                              <p className="text-xl font-bold text-blue-200">{currency}{familyStats.totalLiability.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                              <p className="text-[10px] font-bold text-emerald-400 uppercase">Paid</p>
                              <p className="text-xl font-bold text-emerald-400">{currency}{familyStats.totalPaid.toLocaleString()}</p>
                          </div>
                      </div>

                      <div className="p-4 bg-rose-500/20 rounded-xl border border-rose-500/30 backdrop-blur-sm">
                          <div className="flex justify-between items-end mb-1">
                              <p className="text-xs font-bold text-rose-300 uppercase">Total Due Amount</p>
                              <p className="text-2xl font-black text-red-400">{currency}{familyStats.totalDue.toLocaleString()}</p>
                          </div>
                          {familyStats.totalBacklogs > 0 && (
                              <p className="text-[10px] text-rose-300 font-bold mt-1 opacity-75">
                                  Includes arrears
                              </p>
                          )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                          <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 backdrop-blur-sm">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Last Pay</p>
                              <p className="text-sm font-bold text-emerald-300 truncate">
                                  {lastPayment ? `${currency}${lastPayment.amount.toLocaleString()}` : 'N/A'}
                              </p>
                              {lastPayment && <p className="text-[8px] text-slate-500 mt-0.5">{new Date(lastPayment.date).toLocaleDateString()}</p>}
                          </div>
                          <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 backdrop-blur-sm">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Total Txns</p>
                              <p className="text-sm font-bold text-white">{familyTransactions.length}</p>
                          </div>
                          <div className="col-span-2 p-2.5 bg-white/5 rounded-xl border border-white/5 backdrop-blur-sm flex justify-between items-center">
                               <p className="text-[9px] font-bold text-amber-400/80 uppercase tracking-wide">Back Fees (Arrears)</p>
                               <p className="text-sm font-bold text-amber-300">{currency}{familyStats.totalBacklogs.toLocaleString()}</p>
                          </div>
                      </div>

                      <div>
                          <div className="flex justify-between text-[10px] font-bold uppercase mb-1.5 opacity-80">
                              <span>Payment Progress</span>
                              <span>{familyStats.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ${familyStats.progress === 100 ? 'bg-emerald-50' : 'bg-blue-500'}`}
                                style={{ width: `${familyStats.progress}%` }}
                              ></div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <span>🎓</span> Wards <span className="text-sm font-bold bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">{myChildren.length}</span>
                  </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {myChildren.map(child => {
                      const childTotal = (child.totalAgreedFees || 0) + (child.backLogs || 0);
                      const childPaid = fees.filter(f => f.studentId === child.id && f.status === 'Paid' && !f.isDeleted).reduce((sum, f) => sum + f.amount, 0);
                      const childDue = childTotal - childPaid;
                      const childProgress = childTotal > 0 ? Math.round((childPaid / childTotal) * 100) : 0;

                      return (
                          <div key={child.id} className="bg-white rounded-2xl p-5 border border-indigo-200 ring-1 ring-indigo-500/10 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                              <div className={`absolute top-0 left-0 w-1.5 h-full ${childDue <= 0 ? 'bg-emerald-500' : 'bg-indigo-500'}`}></div>
                              
                              <div className="flex items-start gap-4 mb-4 pl-2">
                                  <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-2xl shrink-0">
                                      {child.photo ? <img src={child.photo} className="w-full h-full object-cover" /> : child.name.charAt(0)}
                                  </div>
                                  <div className="min-w-0">
                                      <h4 className="font-bold text-slate-800 text-lg leading-tight truncate">{child.name}</h4>
                                      <p className="text-xs font-bold text-slate-500 uppercase mt-1">Class {child.grade}</p>
                                      <div className="flex gap-2 mt-2">
                                          <button 
                                            onClick={() => onNavigateToStudent(child.id)}
                                            className="text-[10px] font-bold bg-slate-50 border border-slate-200 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                                          >
                                              Profile
                                          </button>
                                          <button 
                                            onClick={() => onNavigateToFees(child.id)}
                                            className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded hover:bg-indigo-100 transition-colors"
                                          >
                                              {isAdmin ? 'Record Fees' : 'Fee History'}
                                          </button>
                                      </div>
                                  </div>
                              </div>

                              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                  <div className="flex justify-between items-center mb-3">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase">Fee Status</span>
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${childDue <= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                          {childDue <= 0 ? 'Cleared' : 'Due'}
                                      </span>
                                  </div>
                                  
                                  <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                                      <div className="bg-white p-1.5 rounded border border-slate-100 shadow-sm flex flex-col justify-center">
                                          <p className="text-[8px] font-bold text-slate-400 uppercase">Total</p>
                                          <p className="text-xs font-bold text-blue-700">{currency}{childTotal.toLocaleString()}</p>
                                      </div>
                                      <div className="bg-white p-1.5 rounded border border-slate-100 shadow-sm flex flex-col justify-center">
                                          <p className="text-[8px] font-bold text-slate-400 uppercase">Paid</p>
                                          <p className="text-xs font-bold text-emerald-600">{currency}{childPaid.toLocaleString()}</p>
                                      </div>
                                      <div className="bg-white p-1.5 rounded border border-slate-100 shadow-sm flex flex-col justify-center">
                                          <p className="text-[8px] font-bold text-slate-400 uppercase">Due</p>
                                          <p className={`text-xs font-bold ${childDue > 0 ? 'text-red-600' : 'text-slate-400'}`}>{currency}{childDue.toLocaleString()}</p>
                                      </div>
                                  </div>

                                  <div className="flex justify-between items-end mb-1">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase">Progress</p>
                                      <p className="text-xs font-bold text-indigo-600">{childProgress}%</p>
                                  </div>
                                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full ${childDue <= 0 ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                                        style={{width: `${childProgress}%`}}
                                      ></div>
                                  </div>
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-indigo-200 ring-1 ring-indigo-500/10 p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <span>🧾</span> Recent Family Transactions
              </h3>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{familyTransactions.length} Total</span>
          </div>

          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                 <thead>
                     <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                         <th className="py-3 pl-2">Date</th>
                         <th className="py-3">Student</th>
                         <th className="py-3">Type</th>
                         <th className="py-3">Method</th>
                         <th className="py-3 text-right pr-2">Amount</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 text-sm">
                     {familyTransactions.length > 0 ? (
                         familyTransactions.map(fee => {
                             const student = students.find(s => s.id === fee.studentId);
                             return (
                                 <tr key={fee.id} className="group hover:bg-slate-50 transition-colors">
                                     <td className="py-3 pl-2 font-bold text-slate-500 text-xs whitespace-nowrap">
                                         {new Date(fee.date).toLocaleDateString()}
                                     </td>
                                     <td className="py-3 font-bold text-slate-800">
                                         <div className="flex items-center gap-2">
                                             <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs border border-slate-200 overflow-hidden">
                                                 {student?.photo ? <img src={student.photo} className="w-full h-full object-cover"/> : '👤'}
                                             </div>
                                             {student?.name || 'Unknown'}
                                         </div>
                                     </td>
                                     <td className="py-3">
                                         <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600">
                                             <span>{getFeeIcon(fee.type)}</span> {fee.type}
                                         </span>
                                     </td>
                                     <td className="py-3 text-xs font-medium text-slate-500">
                                         {fee.paymentMethod || 'Cash'}
                                     </td>
                                     <td className="py-3 pr-2 text-right">
                                         <span className="font-bold text-emerald-600">
                                             {currency}{fee.amount.toLocaleString()}
                                         </span>
                                     </td>
                                 </tr>
                             );
                         })
                     ) : (
                         <tr>
                             <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                                 No recent transactions found for this family.
                             </td>
                         </tr>
                     )}
                 </tbody>
             </table>
          </div>
      </div>

      <AnimatePresence>
        {viewFamilyReceipt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden my-auto flex flex-col relative"
              >
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/80 sticky top-0 z-20 backdrop-blur-xl">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                              <span className="text-xl">🧾</span>
                          </div>
                          <div>
                              <h3 className="text-lg font-black text-slate-800 leading-tight">Family Payment Receipt</h3>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Official Document</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-2">
                          <button 
                            onClick={handlePrintFamilyReceipt}
                            className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200"
                            title="Print Receipt"
                          >
                            🖨️
                          </button>
                          <button 
                            onClick={handleShareFamilyReceipt}
                            disabled={isSharing}
                            className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors disabled:opacity-50 border border-indigo-100"
                            title="Share Receipt"
                          >
                            {isSharing ? '⌛' : '🔗'}
                          </button>
                          <button 
                            onClick={handleDownloadFamilyReceipt}
                            className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors border border-emerald-100"
                            title="Download PNG"
                          >
                            📥
                          </button>
                          <div className="w-px h-6 bg-slate-200 mx-1"></div>
                          <button 
                              onClick={() => setViewFamilyReceipt(false)}
                              className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all hover:rotate-90"
                          >
                              ✕
                          </button>
                      </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-100/30">
                      <div ref={receiptRef} className="bg-white p-6 md:p-10 border border-slate-200 shadow-xl rounded-[2rem] relative overflow-hidden receipt-container">
                          <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
                          
                          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
                              <div className="flex items-center gap-5">
                                  <div className="w-20 h-20 rounded-2xl bg-slate-50 p-2.5 border border-slate-100 flex items-center justify-center overflow-hidden shadow-sm">
                                      {schoolProfile.logo ? <img src={schoolProfile.logo} className="w-full h-full object-contain" /> : '🏫'}
                                  </div>
                                  <div>
                                      <h4 className="text-2xl font-black text-slate-800 leading-tight">{schoolProfile.name}</h4>
                                      <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5">{schoolProfile.motto}</p>
                                      <p className="text-[10px] text-slate-500 mt-1">{schoolProfile.address}</p>
                                  </div>
                              </div>
                              <div className="text-right w-full md:w-auto">
                                  <div className="inline-block px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200">
                                      Official Family Receipt
                                  </div>
                                  <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-tighter">
                                      {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                                  </p>
                                  <p className="text-[10px] font-bold text-slate-400">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                              </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Parent/Guardian</p>
                                  <p className="text-lg font-black text-slate-800">{parentName}</p>
                                  <p className="text-xs font-bold text-slate-500 mt-1 flex items-center gap-1.5">
                                      <span>📞</span> {parentPhone || 'N/A'}
                                  </p>
                              </div>
                              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Financial Summary</p>
                                  <div className="flex justify-between items-end">
                                      <div>
                                          <p className="text-[10px] font-bold text-emerald-600 uppercase">Total Paid</p>
                                          <p className="text-xl font-black text-emerald-600">{currency}{familyStats.totalPaid.toLocaleString()}</p>
                                      </div>
                                      <div className="text-right">
                                          <p className="text-[10px] font-bold text-rose-500 uppercase">Total Due</p>
                                          <p className="text-xl font-black text-rose-500">{currency}{familyStats.totalDue.toLocaleString()}</p>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          <div className="space-y-8 mb-10">
                              <div>
                                  <h5 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] border-b-2 border-slate-100 pb-3 mb-4 flex items-center gap-2">
                                      <span>🎓</span> Children Details
                                  </h5>
                                  <div className="overflow-x-auto">
                                      <table className="w-full text-left">
                                          <thead>
                                              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                  <th className="pb-3">Student Name</th>
                                                  <th className="pb-3">ID</th>
                                                  <th className="pb-3 text-right">Total</th>
                                                  <th className="pb-3 text-right">Paid</th>
                                                  <th className="pb-3 text-right">Due</th>
                                              </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-50">
                                              {myChildren.map(child => {
                                                  const childTotal = (child.totalAgreedFees || 0) + (child.backLogs || 0);
                                                  const childPaid = fees.filter(f => f.studentId === child.id && f.status === 'Paid' && !f.isDeleted).reduce((sum, f) => sum + f.amount, 0);
                                                  const childDue = childTotal - childPaid;
                                                  return (
                                                      <tr key={child.id} className="text-xs">
                                                          <td className="py-3">
                                                              <div className="font-black text-slate-800">{child.name}</div>
                                                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">Class {child.grade}</div>
                                                          </td>
                                                          <td className="py-3 font-mono text-slate-400">{child.id}</td>
                                                          <td className="py-3 text-right font-bold text-slate-700">{currency}{childTotal.toLocaleString()}</td>
                                                          <td className="py-3 text-right font-bold text-emerald-600">{currency}{childPaid.toLocaleString()}</td>
                                                          <td className="py-3 text-right font-black text-rose-500">{currency}{childDue.toLocaleString()}</td>
                                                      </tr>
                                                  );
                                              })}
                                          </tbody>
                                      </table>
                                  </div>
                              </div>

                              <div>
                                  <h5 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] border-b-2 border-slate-100 pb-3 mb-4 flex items-center gap-2">
                                      <span>🧾</span> Transaction History
                                  </h5>
                                  <div className="space-y-3">
                                      {familyTransactions.map((fee) => {
                                          const student = students.find(s => s.id === fee.studentId);
                                          return (
                                              <div key={fee.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50/50 border border-slate-100 group hover:bg-white hover:shadow-md transition-all">
                                                  <div className="flex items-center gap-3">
                                                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-sm shadow-sm">
                                                          {getFeeIcon(fee.type)}
                                                      </div>
                                                      <div>
                                                          <p className="text-xs font-black text-slate-800">{student?.name || 'Unknown'}</p>
                                                          <p className="text-[9px] font-bold text-indigo-600/70 uppercase tracking-tighter">Class {student?.grade}</p>
                                                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                              {fee.type} • {new Date(fee.date).toLocaleDateString('en-GB')} • {fee.paymentMethod || 'Cash'}
                                                          </p>
                                                      </div>
                                                  </div>
                                                  <div className="text-right">
                                                      <p className="text-sm font-black text-emerald-600">+{currency}{fee.amount.toLocaleString()}</p>
                                                      <p className="text-[9px] font-bold text-slate-300 uppercase">Confirmed</p>
                                                  </div>
                                              </div>
                                          );
                                      })}
                                      {familyTransactions.length === 0 && (
                                          <p className="text-center py-6 text-slate-400 text-xs italic font-medium">No transactions recorded yet.</p>
                                      )}
                                  </div>
                              </div>
                          </div>

                          <div className="flex flex-col md:flex-row justify-end items-center gap-8 pt-8 border-t-2 border-dashed border-slate-100">
                              <div className="text-center md:text-right flex-1">
                                  <div className="mb-4">
                                      {schoolProfile.authorizedSignature && (
                                          <img src={schoolProfile.authorizedSignature} alt="Signature" className="h-12 w-auto object-contain ml-auto mb-2 mix-blend-multiply" />
                                      )}
                                      <div className="h-px w-40 bg-slate-300 ml-auto mb-1"></div>
                                      <p className="text-[9px] font-black text-slate-800 uppercase tracking-widest">Authorized Signature</p>
                                  </div>
                                  <p className="text-[8px] font-bold text-slate-400 leading-relaxed">
                                      This is a computer-generated receipt and does not require a physical stamp.<br/>
                                      For any discrepancies, please contact the school administration.
                                  </p>
                              </div>
                          </div>
                      </div>
                  </div>
                  
                  <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center gap-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Generated by {schoolProfile.name} Management System</p>
                  </div>
              </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ParentProfile;