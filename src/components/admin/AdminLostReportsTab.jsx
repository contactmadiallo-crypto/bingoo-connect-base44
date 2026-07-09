import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { MapPin, Phone, Mail, MessageSquare } from 'lucide-react';

const STATUS_LABELS = {
  new: { label: 'New', color: 'bg-red-100 text-red-700' },
  contacted: { label: 'Contacted', color: 'bg-amber-100 text-amber-700' },
  recovered: { label: 'Recovered', color: 'bg-green-100 text-green-700' },
};

export default function AdminLostReportsTab() {
  const qc = useQueryClient();

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['admin-lost-reports'],
    queryFn: () => base44.entities.LostItemReport.list('-created_date', 100),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, status }) => base44.entities.LostItemReport.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-lost-reports'] }),
  });

  const newCount = reports.filter(r => r.status === 'new').length;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2"><MapPin className="w-5 h-5" /> Lost Device Reports</h2>
        <p className="text-xs text-slate-500">{reports.length} total reports · {newCount} new</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" /></div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <MapPin className="w-12 h-12 mx-auto mb-2 text-slate-200" />
          <p className="text-sm font-semibold">No lost device reports</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {reports.map(r => (
            <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-sm text-slate-900">Device: {r.device_code}</p>
                  <p className="text-xs text-slate-500">{new Date(r.scan_time || r.created_date).toLocaleString()}</p>
                </div>
                <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${STATUS_LABELS[r.status]?.color}`}>{STATUS_LABELS[r.status]?.label}</span>
              </div>
              {r.finder_name && <p className="text-sm font-semibold text-slate-700">{r.finder_name}</p>}
              {r.finder_phone && <p className="text-xs text-slate-600 flex items-center gap-1"><Phone className="w-3 h-3" /> {r.finder_phone}</p>}
              {r.finder_email && <p className="text-xs text-slate-600 flex items-center gap-1"><Mail className="w-3 h-3" /> {r.finder_email}</p>}
              {r.finder_location && <p className="text-xs text-slate-600">{r.finder_location}</p>}
              {r.finder_message && <p className="text-xs text-slate-500 italic flex items-start gap-1"><MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" /> "{r.finder_message}"</p>}
              {r.latitude && r.longitude && (
                <a href={`https://maps.google.com/?q=${r.latitude},${r.longitude}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 font-semibold">View location on map →</a>
              )}
              <div className="flex gap-2 pt-1">
                <select value={r.status} onChange={e => updateMut.mutate({ id: r.id, status: e.target.value })}
                  className="text-xs font-bold rounded-lg px-2 py-1.5 border border-slate-200 outline-none">
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="recovered">Recovered</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}