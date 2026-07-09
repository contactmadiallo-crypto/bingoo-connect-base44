import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ScrollText, Search } from 'lucide-react';

export default function AdminAuditLogTab() {
  const [search, setSearch] = useState('');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: () => base44.entities.AdminAuditLog.list('-created_date', 200),
  });

  const filtered = logs.filter(l => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return l.action?.toLowerCase().includes(q)
      || l.target_type?.toLowerCase().includes(q)
      || l.target_name?.toLowerCase().includes(q)
      || l.performed_by_email?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2"><ScrollText className="w-5 h-5" /> Audit Log</h2>
        <p className="text-xs text-slate-500">{logs.length} admin actions recorded</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Search by action, target, or admin email..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-slate-200 outline-none focus:border-slate-400" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <ScrollText className="w-12 h-12 mx-auto mb-2 text-slate-200" />
          <p className="text-sm font-semibold">{search ? 'No matching logs' : 'No audit logs yet'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(log => (
            <div key={log.id} className="bg-white rounded-xl border border-slate-200 p-3 flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <ScrollText className="w-4 h-4 text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-slate-900">{log.action}</span>
                  <span className="text-[10px] text-slate-400">{new Date(log.created_date).toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  {log.performed_by_name || log.performed_by_email || 'Admin'} → 
                  <span className="font-semibold"> {log.target_type || 'unknown'}</span>
                  {log.target_name && `: ${log.target_name}`}
                </p>
                {log.old_value && log.new_value && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    <span className="line-through">{log.old_value}</span> → <span className="font-bold text-slate-600">{log.new_value}</span>
                  </p>
                )}
                {log.notes && <p className="text-[10px] text-slate-400 italic mt-1">{log.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}