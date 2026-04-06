import React, { useState } from 'react';
import { Inquiry } from '../types';
import { submitToFormspree } from '../lib/formspree';

interface NewInquiryProps {
  classes: string[];
  inquiries: Inquiry[];
  onAddInquiry: (inquiry: Omit<Inquiry, 'id' | 'date' | 'status'>) => void;
  onUpdateInquiry?: (inquiry: Inquiry) => void;
  onDeleteInquiry?: (id: string) => void;
  onConvertToStudent?: (inquiry: Inquiry) => void;
  onBack: () => void;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const NewInquiry: React.FC<NewInquiryProps> = ({ classes, inquiries, onAddInquiry, onUpdateInquiry, onDeleteInquiry, onConvertToStudent, onBack, onNotify }) => {
  const [showForm, setShowForm] = useState(inquiries.length === 0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [inquiryFormData, setInquiryFormData] = useState({
    studentName: '',
    grade: '',
    parentName: '',
    phone: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        const existing = inquiries.find(i => i.id === editingId);
        if (existing && onUpdateInquiry) {
          onUpdateInquiry({ ...existing, ...inquiryFormData });
          onNotify('✅ Inquiry updated successfully!', 'success');
        }
      } else {
        // Submit to Formspree for email notification
        await submitToFormspree('New Admission Inquiry', inquiryFormData);
        // Add to local/Supabase state
        onAddInquiry(inquiryFormData);
        onNotify('✅ Inquiry submitted successfully!', 'success');
      }
      
      setInquiryFormData({
        studentName: '',
        grade: '',
        parentName: '',
        phone: '',
        email: '',
        message: ''
      });
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      onNotify('❌ Failed to save inquiry. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (inquiry: Inquiry) => {
    setInquiryFormData({
      studentName: inquiry.studentName,
      grade: inquiry.grade,
      parentName: inquiry.parentName,
      phone: inquiry.phone,
      email: inquiry.email || '',
      message: inquiry.message || ''
    });
    setEditingId(inquiry.id);
    setShowForm(true);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-bold mb-2 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">⬅️</span> Back to Students
          </button>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <span>📝</span> {editingId ? 'Edit Inquiry' : 'Admission Inquiries'}
          </h2>
          <p className="text-slate-500">Manage and track potential new student admissions.</p>
        </div>
        
        <button 
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              setEditingId(null);
              setInquiryFormData({ studentName: '', grade: '', parentName: '', phone: '', email: '', message: '' });
            } else {
              setShowForm(true);
            }
          }}
          className={`px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 flex items-center gap-2 shadow-lg ${
            showForm 
              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100'
          }`}
        >
          {showForm ? (
            <><span>📋</span> View All Inquiries</>
          ) : (
            <><span>✨</span> Add New Inquiry</>
          )}
        </button>
      </header>

      {showForm ? (
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 md:p-12 relative overflow-hidden animate-scale-in">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <form onSubmit={handleInquirySubmit} className="relative z-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h4 className="text-sm font-bold text-emerald-600 uppercase tracking-wider border-b border-emerald-100 pb-2">Student Information</h4>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Student Full Name *</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="e.g. Rahul Sharma" 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-slate-800" 
                    value={inquiryFormData.studentName} 
                    onChange={e => setInquiryFormData({...inquiryFormData, studentName: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Class Interested In *</label>
                  <select 
                    required 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-slate-800 appearance-none" 
                    value={inquiryFormData.grade} 
                    onChange={e => setInquiryFormData({...inquiryFormData, grade: e.target.value})}
                  >
                    <option value="" disabled>Select Class...</option>
                    {classes.map(c => <option key={c} value={c}>🏫 {c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-sm font-bold text-emerald-600 uppercase tracking-wider border-b border-emerald-100 pb-2">Parent/Guardian Details</h4>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Parent/Guardian Name *</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="e.g. Mr. Sharma" 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-slate-800" 
                    value={inquiryFormData.parentName} 
                    onChange={e => setInquiryFormData({...inquiryFormData, parentName: e.target.value})} 
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Phone Number *</label>
                    <input 
                      required 
                      type="tel" 
                      placeholder="Mobile Number" 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-slate-800" 
                      value={inquiryFormData.phone} 
                      onChange={e => setInquiryFormData({...inquiryFormData, phone: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="Optional" 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-slate-800" 
                      value={inquiryFormData.email} 
                      onChange={e => setInquiryFormData({...inquiryFormData, email: e.target.value})} 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-emerald-600 uppercase tracking-wider border-b border-emerald-100 pb-2 mb-6">Additional Notes</h4>
              <textarea 
                rows={4} 
                placeholder="Any specific requirements, previous school details, or questions..." 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-slate-800 resize-none" 
                value={inquiryFormData.message} 
                onChange={e => setInquiryFormData({...inquiryFormData, message: e.target.value})} 
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button 
                type="button" 
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setInquiryFormData({ studentName: '', grade: '', parentName: '', phone: '', email: '', message: '' });
                }} 
                className="flex-1 py-4 bg-slate-100 text-slate-600 font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-slate-200 transition-all active:scale-95 border border-slate-200"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-[2] py-4 bg-emerald-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    {editingId ? 'Updating...' : 'Submitting...'}
                  </>
                ) : (
                  <>
                    <span>{editingId ? '💾' : '✅'}</span> {editingId ? 'Update Inquiry' : 'Submit Admission Inquiry'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
          {inquiries.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-black text-slate-800 mb-2">No Inquiries Found</h3>
              <p className="text-slate-500 mb-6">Start by adding a new admission inquiry or wait for student applications.</p>
              <button 
                onClick={() => setShowForm(true)}
                className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
              >
                Create First Inquiry
              </button>
            </div>
          ) : (
            inquiries.map((inquiry) => (
              <div key={inquiry.id} className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 hover:shadow-2xl transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500 opacity-50"></div>
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-xl font-bold">
                    {inquiry.studentName.charAt(0)}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    inquiry.status === 'Pending' ? 'bg-amber-100 text-amber-600' :
                    inquiry.status === 'Contacted' ? 'bg-blue-100 text-blue-600' :
                    inquiry.status === 'Enrolled' ? 'bg-emerald-100 text-emerald-600' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {inquiry.status}
                  </span>
                </div>

                <div className="relative z-10">
                  <h3 className="text-lg font-black text-slate-800 mb-1">{inquiry.studentName}</h3>
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-4">
                    <span>🏫 Class:</span>
                    <span className="text-emerald-600">{inquiry.grade}</span>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">👤</span>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Parent Name</p>
                        <p className="text-xs font-bold text-slate-700">{inquiry.parentName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg">📞</span>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Phone</p>
                        <p className="text-xs font-bold text-slate-700">{inquiry.phone}</p>
                      </div>
                    </div>
                    {inquiry.email && (
                      <div className="flex items-center gap-3">
                        <span className="text-lg">📧</span>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Email</p>
                          <p className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{inquiry.email}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {inquiry.message && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-500 italic line-clamp-3">"{inquiry.message}"</p>
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-slate-50 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400">
                        📅 {new Date(inquiry.date).toLocaleDateString()}
                      </span>
                      <select 
                        className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-transparent outline-none cursor-pointer hover:underline"
                        value={inquiry.status}
                        onChange={(e) => onUpdateInquiry?.({ ...inquiry, status: e.target.value as any })}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Enrolled">Enrolled</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2">
                      <button 
                        onClick={() => onConvertToStudent?.(inquiry)}
                        className="flex-1 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center justify-center gap-1"
                        title="Move to Student Profile"
                      >
                        <span>🎓</span> Enroll
                      </button>
                      <button 
                        onClick={() => handleEdit(inquiry)}
                        className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-all"
                        title="Edit Inquiry"
                      >
                        <span>✏️</span>
                      </button>
                      <button 
                        onClick={() => onDeleteInquiry?.(inquiry.id)}
                        className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all"
                        title="Delete Inquiry"
                      >
                        <span>🗑️</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NewInquiry;
