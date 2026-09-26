import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useI18n } from '@/lib/I18nContext';

const RELATIONSHIP_TYPES = [
  { value: 'client', label: 'Client' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'colleague', label: 'Colleague' },
  { value: 'business_networking', label: 'Business Networking' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'friend', label: 'Friend' },
  { value: 'partner', label: 'Partner' },
  { value: 'other', label: 'Other' },
];

const SOURCES = [
  { value: 'profile', label: 'Public Profile' },
  { value: 'nfc', label: 'NFC Tap' },
  { value: 'qr', label: 'QR Scan' },
  { value: 'referral', label: 'Referral' },
  { value: 'direct', label: 'Direct' },
  { value: 'manual', label: 'Manual' },
  { value: 'imported', label: 'Imported' },
];

export default function ConnectionEditModal({ lead, isDark, onClose }) {
  const { language } = useI18n();
  const tr = (en, fr) => language === 'fr' ? fr : en;
  const qc = useQueryClient();
  const [form, setForm] = useState({});

  useEffect(() => {
    if (lead) {
      setForm({
        name: lead.name || '',
        phone: lead.phone || '',
        email: lead.email || '',
        where_first_met: lead.where_first_met || '',
        when_first_met: lead.when_first_met || '',
        event_name: lead.event_name || '',
        meeting_context: lead.meeting_context || '',
        relationship_type: lead.relationship_type || 'prospect',
        category_tags: (lead.category_tags || []).join(', '),
        follow_up_date: lead.follow_up_date || '',
        latest_interaction: lead.latest_interaction || '',
        description: lead.description || '',
        source: lead.source || 'profile',
      });
    }
  }, [lead]);

  const saveMut = useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        category_tags: data.category_tags ? data.category_tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      return base44.entities.Lead.update(lead.id, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['my-leads'] });
      onClose();
    },
  });

  if (!lead) return null;

  const t = {
    bg: isDark ? 'bg-[#13284f]' : 'bg-white',
    text: isDark ? 'text-white' : 'text-slate-900',
    sub: isDark ? 'text-white/50' : 'text-slate-500',
    input: isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800',
    label: isDark ? 'text-white/70' : 'text-slate-600',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className={`${t.bg} rounded-t-3xl sm:rounded-2xl shadow-2xl sm:max-w-lg w-full max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto overscroll-contain`} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/10 bg-inherit rounded-t-2xl">
          <div>
            <h3 className={`font-black text-base ${t.text}`}>{tr('Edit Connection', 'Modifier la connexion')}</h3>
            <p className={`text-xs ${t.sub}`}>{lead.name || lead.email || 'Connection details'}</p>
          </div>
          <button onClick={onClose} aria-label={tr("Close","Fermer")} className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-white/10">
            <X className={`w-4 h-4 ${t.sub}`} />
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-3">
          {/* Basic info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><Label className={`text-xs ${t.label}`}>{tr('Name', 'Nom')}</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={t.input} /></div>
            <div><Label className={`text-xs ${t.label}`}>{tr('Phone', 'Téléphone')}</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={t.input} /></div>
            <div className="sm:col-span-2"><Label className={`text-xs ${t.label}`}>{tr('Email', 'E-mail')}</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={t.input} /></div>
          </div>

          {/* Connection context */}
          <div className={`pt-2 border-t ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
            <p className={`text-[10px] font-black uppercase tracking-wider mb-2 ${t.sub}`}>{tr('Connection Context', 'Contexte de la connexion')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><Label className={`text-xs ${t.label}`}>{tr('Where First Met', 'Lieu de la première rencontre')}</Label><Input value={form.where_first_met} onChange={e => setForm({ ...form, where_first_met: e.target.value })} placeholder={tr('Conference, cafe...', 'Conférence, café…')} className={t.input} /></div>
              <div><Label className={`text-xs ${t.label}`}>{tr('When First Met', 'Date de la première rencontre')}</Label><Input type="date" value={form.when_first_met} onChange={e => setForm({ ...form, when_first_met: e.target.value })} className={t.input} /></div>
              <div><Label className={`text-xs ${t.label}`}>{tr('Event Name', 'Nom de l’événement')}</Label><Input value={form.event_name} onChange={e => setForm({ ...form, event_name: e.target.value })} placeholder={tr('Event or context', 'Événement ou contexte')} className={t.input} /></div>
              <div>
                <Label className={`text-xs ${t.label}`}>{tr('Relationship Type', 'Type de relation')}</Label>
                <select value={form.relationship_type} onChange={e => setForm({ ...form, relationship_type: e.target.value })}
                  className={`w-full h-9 rounded-md border text-sm ${t.input}`}>
                  {RELATIONSHIP_TYPES.map(r => <option key={r.value} value={r.value}>{language === "fr" ? ({ client:"Client", prospect:"Prospect", colleague:"Collègue", business_networking:"Réseautage professionnel", vendor:"Fournisseur", friend:"Ami", partner:"Partenaire", other:"Autre" }[r.value] || r.label) : r.label}</option>)}
                </select>
              </div>
              <div>
                <Label className={`text-xs ${t.label}`}>{tr('Source', 'Source')}</Label>
                <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}
                  className={`w-full h-9 rounded-md border text-sm ${t.input}`}>
                  {SOURCES.map(s => <option key={s.value} value={s.value}>{language === "fr" ? ({ profile:"Profil public", nfc:"Contact NFC", qr:"Scan QR", referral:"Recommandation", direct:"Direct", manual:"Manuel", imported:"Importé" }[s.value] || s.label) : s.label}</option>)}
                </select>
              </div>
              <div><Label className={`text-xs ${t.label}`}>{tr('Follow-up Date', 'Date de suivi')}</Label><Input type="date" value={form.follow_up_date} onChange={e => setForm({ ...form, follow_up_date: e.target.value })} className={t.input} /></div>
            </div>
            <div className="mt-3">
              <Label className={`text-xs ${t.label}`}>{tr('Category Tags (comma-separated)', 'Étiquettes de catégorie (séparées par des virgules)')}</Label>
              <Input value={form.category_tags} onChange={e => setForm({ ...form, category_tags: e.target.value })} placeholder={tr('VIP, hot-lead, follow-up...', 'VIP, prospect prioritaire, suivi…')} className={t.input} />
            </div>
            <div className="mt-3">
              <Label className={`text-xs ${t.label}`}>{tr('Meeting Context', 'Contexte de la rencontre')}</Label>
              <Textarea value={form.meeting_context} onChange={e => setForm({ ...form, meeting_context: e.target.value })} placeholder={tr('What was the meeting about?', 'Quel était l’objet de la rencontre ?')} className={t.input} rows={2} />
            </div>
            <div className="mt-3">
              <Label className={`text-xs ${t.label}`}>{tr('Latest Interaction', 'Dernière interaction')}</Label>
              <Textarea value={form.latest_interaction} onChange={e => setForm({ ...form, latest_interaction: e.target.value })} placeholder={tr('Summary of last contact', 'Résumé du dernier contact')} className={t.input} rows={2} />
            </div>
            <div className="mt-3">
              <Label className={`text-xs ${t.label}`}>{tr('Internal CRM Notes', 'Notes CRM internes')}</Label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder={tr('Private notes...', 'Notes privées…')} className={t.input} rows={3} />
            </div>
          </div>

          {/* Timeline preview */}
          {lead.timeline_entries && lead.timeline_entries.length > 0 && (
            <div className={`pt-2 border-t ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
              <p className={`text-[10px] font-black uppercase tracking-wider mb-2 ${t.sub}`}>{tr("Timeline","Historique")} ({lead.timeline_entries.length})</p>
              <div className="space-y-1.5">
                {lead.timeline_entries.slice(-5).map((entry, i) => (
                  <div key={i} className={`text-xs p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <span className={`font-bold ${t.text}`}>{entry.type || 'note'}</span>
                    <span className={`ml-2 ${t.sub}`}>{entry.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save */}
          <Button className="w-full mt-2 min-h-[44px]" style={{ background: '#0b2149' }} onClick={() => saveMut.mutate(form)} disabled={saveMut.isPending}>
            <Save className="w-4 h-4" /> {tr("Save Connection","Enregistrer la connexion")}
          </Button>
        </div>
      </div>
    </div>
  );
}