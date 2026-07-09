import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { FileText, Upload, Trash2, Download, Calendar, Lock, Plus, AlertCircle } from 'lucide-react';

const DOC_TYPES = [
  { value: 'id', label: 'ID Document' },
  { value: 'certification', label: 'Certification' },
  { value: 'license', label: 'License' },
  { value: 'business_document', label: 'Business Document' },
  { value: 'contract', label: 'Contract' },
  { value: 'other', label: 'Other' },
];

function DocTypeBadge({ type }) {
  const colors = {
    id: 'bg-blue-100 text-blue-700',
    certification: 'bg-emerald-100 text-emerald-700',
    license: 'bg-purple-100 text-purple-700',
    business_document: 'bg-orange-100 text-orange-700',
    contract: 'bg-slate-100 text-slate-700',
    other: 'bg-slate-100 text-slate-500',
  };
  const label = DOC_TYPES.find(t => t.value === type)?.label || type;
  return <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${colors[type] || colors.other}`}>{label}</span>;
}

export default function DocumentWalletPanel({ profile, isDark }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ file_url: '', file_name: '', document_type: 'other', notes: '', expiration_date: '' });

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  const { data: documents, isLoading } = useQuery({
    queryKey: ['doc-wallet', user?.id],
    queryFn: () => base44.entities.DocumentWalletItem.filter({ owner_user_id: user.id }, '-created_date', 100),
    enabled: !!user?.id,
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, file_url, file_name: file.name }));
      toast({ title: 'File uploaded' });
    } catch (err) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.file_url || !formData.file_name) {
      toast({ title: 'Please upload a file first', variant: 'destructive' });
      return;
    }
    try {
      await base44.entities.DocumentWalletItem.create({
        owner_user_id: user.id,
        profile_id: profile?.id,
        file_url: formData.file_url,
        file_name: formData.file_name,
        document_type: formData.document_type,
        notes: formData.notes,
        expiration_date: formData.expiration_date || undefined,
        visibility: 'private',
      });
      toast({ title: 'Document saved', description: 'Stored privately in your wallet' });
      setFormData({ file_url: '', file_name: '', document_type: 'other', notes: '', expiration_date: '' });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['doc-wallet', user?.id] });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (docId) => {
    try {
      await base44.entities.DocumentWalletItem.delete(docId);
      toast({ title: 'Document deleted' });
      queryClient.invalidateQueries({ queryKey: ['doc-wallet', user?.id] });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleDownload = async (fileUrl, fileName) => {
    window.open(fileUrl, '_blank');
  };

  const panelBg = isDark ? 'bg-white/5' : 'bg-white';
  const panelBorder = isDark ? 'border-white/10' : 'border-slate-200';
  const headText = isDark ? 'text-white' : 'text-slate-900';
  const mutedText = isDark ? 'text-white/60' : 'text-slate-500';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h2 className={`text-base font-black ${headText}`}>Document Wallet</h2>
            <p className={`text-xs ${mutedText}`}>Secure private document storage</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white"
          style={{ background: '#f97316' }}
        >
          <Plus className="w-4 h-4" /> Add Document
        </button>
      </div>

      {/* Privacy Notice */}
      <div className={`flex items-center gap-2 rounded-xl p-3 ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
        <Lock className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-blue-300' : 'text-blue-600'}`} />
        <p className={`text-xs ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
          Documents are <span className="font-bold">private by default</span>. Only you can view, download, or delete them. They are never shown on public profiles.
        </p>
      </div>

      {/* Upload Form */}
      {showForm && (
        <div className={`rounded-2xl border ${panelBorder} ${panelBg} p-5 space-y-3`}>
          <div>
            <label className={`text-xs font-bold ${headText} mb-1.5 block`}>Document File</label>
            {!formData.file_url ? (
              <label className={`flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${isDark ? 'border-white/20 hover:border-white/40' : 'border-slate-300 hover:border-slate-400'}`}>
                {uploading ? (
                  <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                ) : (
                  <Upload className={`w-6 h-6 ${mutedText}`} />
                )}
                <span className={`text-xs ${mutedText}`}>{uploading ? 'Uploading…' : 'Click to upload (PDF, JPG, PNG)'}</span>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} className="hidden" />
              </label>
            ) : (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                <FileText className="w-4 h-4 text-orange-500" />
                <span className={`text-sm ${headText} flex-1 truncate`}>{formData.file_name}</span>
                <button onClick={() => setFormData({ ...formData, file_url: '', file_name: '' })} className="text-xs text-red-500 font-bold">Remove</button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`text-xs font-bold ${headText} mb-1.5 block`}>Document Type</label>
              <select
                value={formData.document_type}
                onChange={e => setFormData({ ...formData, document_type: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${panelBorder} ${panelBg} text-sm ${headText}`}
              >
                {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className={`text-xs font-bold ${headText} mb-1.5 block`}>Expiration Date</label>
              <input
                type="date"
                value={formData.expiration_date}
                onChange={e => setFormData({ ...formData, expiration_date: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${panelBorder} ${panelBg} text-sm ${headText}`}
              />
            </div>
          </div>
          <div>
            <label className={`text-xs font-bold ${headText} mb-1.5 block`}>Notes</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Optional notes about this document…"
              rows={2}
              className={`w-full px-3 py-2 rounded-lg border ${panelBorder} ${panelBg} text-sm ${headText} resize-none`}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="px-4 py-2 rounded-lg text-white text-xs font-bold" style={{ background: '#f97316' }}>Save Document</button>
            <button onClick={() => setShowForm(false)} className={`px-4 py-2 rounded-lg border ${panelBorder} text-xs font-bold ${headText}`}>Cancel</button>
          </div>
        </div>
      )}

      {/* Document List */}
      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" /></div>
      ) : (documents || []).length === 0 ? (
        <div className={`text-center py-12 rounded-2xl border ${panelBorder} ${panelBg}`}>
          <FileText className={`w-8 h-8 mx-auto mb-2 ${mutedText}`} />
          <p className={`text-sm font-bold ${headText}`}>No documents yet</p>
          <p className={`text-xs ${mutedText} mt-1`}>Upload your first document to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {documents.map(doc => {
            const isExpired = doc.expiration_date && new Date(doc.expiration_date) < new Date();
            const isExpiringSoon = doc.expiration_date && !isExpired && new Date(doc.expiration_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            return (
              <div key={doc.id} className={`rounded-xl border ${panelBorder} ${panelBg} p-4`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <div>
                      <p className={`text-sm font-bold ${headText} truncate max-w-[180px]`}>{doc.file_name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <DocTypeBadge type={doc.document_type} />
                        <Lock className={`w-3 h-3 ${mutedText}`} />
                      </div>
                    </div>
                  </div>
                </div>
                {doc.notes && <p className={`text-xs ${mutedText} mb-2`}>{doc.notes}</p>}
                {doc.expiration_date && (
                  <div className={`flex items-center gap-1.5 text-xs mb-2 ${isExpired ? 'text-red-500 font-bold' : isExpiringSoon ? 'text-orange-500 font-bold' : mutedText}`}>
                    {isExpired || isExpiringSoon ? <AlertCircle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                    Expires: {new Date(doc.expiration_date).toLocaleDateString()}
                    {isExpired && ' (Expired)'}
                    {isExpiringSoon && ' (Soon)'}
                  </div>
                )}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleDownload(doc.file_url, doc.file_name)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                    style={{ background: '#0b2149' }}
                  >
                    <Download className="w-3.5 h-3.5" /> View
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 border border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}