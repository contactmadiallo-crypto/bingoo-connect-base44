import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { HeadphonesIcon, MapPin, ScrollText, Mail, Phone, MessageSquare, Send } from 'lucide-react';

function PriorityBadge({ priority }) {
  const colors = { low: 'bg-slate-100 text-slate-600', medium: 'bg-blue-100 text-blue-700', high: 'bg-orange-100 text-orange-700', urgent: 'bg-red-100 text-red-700' };
  return <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${colors[priority] || colors.medium}`}>{priority}</span>;
}

function StatusBadge({ status }) {
  const colors = { open: 'bg-blue-100 text-blue-700', in_progress: 'bg-orange-100 text-orange-700', resolved: 'bg-emerald-100 text-emerald-700', closed: 'bg-slate-100 text-slate-500', new: 'bg-blue-100 text-blue-700', contacted: 'bg-orange-100 text-orange-700', recovered: 'bg-emerald-100 text-emerald-700' };
  return <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${colors[status] || 'bg-slate-100 text-slate-500'}`}>{status?.replace(/_/g, ' ')}</span>;
}

export default function AdminTicketsTab({ activeTab }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [responseText, setResponseText] = useState({});

  // Support tickets
  const { data: tickets, isLoading: tixLoading } = useQuery({
    queryKey: ['admin-tickets-list'],
    queryFn: () => base44.entities.SupportTicket.list('-created_date', 100),
    enabled: activeTab === 'support',
  });

  // Lost reports
  const { data: lostReports, isLoading: lostLoading } = useQuery({
    queryKey: ['admin-lost-reports'],
    queryFn: () => base44.entities.LostItemReport.list('-created_date', 100),
    enabled: activeTab === 'lost',
  });

  // Audit logs
  const { data: auditLogs, isLoading: auditLoading } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: () => base44.entities.AdminAuditLog.list('-created_date', 100),
    enabled: activeTab === 'audit',
  });

  const handleTicketResponse = async (ticketId) => {
    if (!responseText[ticketId]) return;
    try {
      const ticket = (tickets || []).find(t => t.id === ticketId);
      await base44.entities.SupportTicket.update(ticketId, {
        response: responseText[ticketId],
        status: 'resolved',
      });
      await base44.entities.AdminAuditLog.create({
        action: 'support_responded',
        performed_by: (await base44.auth.me()).id,
        performed_by_name: (await base44.auth.me()).full_name,
        target_type: 'SupportTicket',
        target_id: ticketId,
        target_name: ticket?.subject,
        notes: `Response sent: ${responseText[ticketId].substring(0, 100)}`,
      });
      toast({ title: 'Response sent', description: 'Ticket marked as resolved' });
      setResponseText({ ...responseText, [ticketId]: '' });
      queryClient.invalidateQueries({ queryKey: ['admin-tickets-list'] });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleUpdateReportStatus = async (reportId, status) => {
    try {
      await base44.entities.LostItemReport.update(reportId, { status });
      toast({ title: `Report marked as ${status}` });
      queryClient.invalidateQueries({ queryKey: ['admin-lost-reports'] });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  if (tixLoading || lostLoading || auditLoading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" /></div>;
  }

  // ── SUPPORT ──
  if (activeTab === 'support') {
    return (
      <div className="space-y-3">
        {(tickets || []).length === 0 && (
          <div className="text-center py-16 text-sm text-slate-400">
            <HeadphonesIcon className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            No support tickets.
          </div>
        )}
        {(tickets || []).map(t => (
          <div key={t.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-slate-800 text-sm">{t.subject}</p>
                  <PriorityBadge priority={t.priority} />
                  <StatusBadge status={t.status} />
                </div>
                <p className="text-xs text-slate-500">{t.user_name} • {t.user_email}</p>
              </div>
              <span className="text-xs text-slate-400">{new Date(t.created_date).toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-slate-600 mb-3">{t.message}</p>
            {t.response && (
              <div className="bg-emerald-50 rounded-lg p-3 mb-3">
                <p className="text-xs font-bold text-emerald-700 mb-1">Admin Response:</p>
                <p className="text-sm text-slate-700">{t.response}</p>
              </div>
            )}
            {t.status !== 'resolved' && t.status !== 'closed' && (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a response…"
                  value={responseText[t.id] || ''}
                  onChange={e => setResponseText({ ...responseText, [t.id]: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                />
                <button
                  onClick={() => handleTicketResponse(t.id)}
                  disabled={!responseText[t.id]}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" /> Send
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // ── LOST REPORTS ──
  if (activeTab === 'lost') {
    return (
      <div className="space-y-3">
        {(lostReports || []).length === 0 && (
          <div className="text-center py-16 text-sm text-slate-400">
            <MapPin className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            No lost device reports.
          </div>
        )}
        {(lostReports || []).map(r => (
          <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-bold text-slate-800 text-sm">Device: {r.device_code}</p>
                <p className="text-xs text-slate-500">{r.finder_name} • {r.finder_phone || r.finder_email}</p>
              </div>
              <StatusBadge status={r.status} />
            </div>
            {r.finder_message && <p className="text-sm text-slate-600 mb-2">"{r.finder_message}"</p>}
            {r.finder_location && <p className="text-xs text-slate-400 mb-2">📍 {r.finder_location}</p>}
            <div className="flex gap-2 mt-2">
              <button onClick={() => handleUpdateReportStatus(r.id, 'contacted')} className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-bold">Mark Contacted</button>
              <button onClick={() => handleUpdateReportStatus(r.id, 'recovered')} className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold">Mark Recovered</button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── AUDIT LOG ──
  if (activeTab === 'audit') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase">Date</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase">Admin</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase">Action</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase">Target</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(auditLogs || []).map(log => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-xs text-slate-400">{new Date(log.created_date).toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-700 font-semibold text-xs">{log.performed_by_name}</td>
                  <td className="px-4 py-3"><span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{log.action?.replace(/_/g, ' ')}</span></td>
                  <td className="px-4 py-3 text-xs text-slate-600">{log.target_name || log.target_id}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 max-w-xs truncate">{log.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(!auditLogs || auditLogs.length === 0) && (
          <div className="text-center py-12 text-sm text-slate-400">
            <ScrollText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            No audit log entries yet.
          </div>
        )}
      </div>
    );
  }

  return null;
}