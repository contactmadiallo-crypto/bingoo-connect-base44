import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Trash2, Save, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { CURRENCY_CONFIG, SUPPORTED_CURRENCIES } from '@/hooks/useCurrency';

const PLANS = ['professional', 'salon', 'restaurant', 'lawfirm', 'corporate'];
const PLAN_LABELS = { professional: 'Professional', salon: 'Salon', restaurant: 'Restaurant', lawfirm: 'Law Firm', corporate: 'Corporate' };

const orange = '#FF7A00';
const gold = '#FDBA21';

const EMPTY_FORM = { plan_name: 'professional', currency: 'USD', amount: '', stripe_price_id: '', country_codes: '', active: true };

export default function AdminPricingTab() {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState(EMPTY_FORM);
  const queryClient = useQueryClient();

  const { data: configs = [], isLoading } = useQuery({
    queryKey: ['admin-pricing-configs'],
    queryFn: () => base44.entities.PricingConfig.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PricingConfig.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pricing-configs'] });
      setShowNew(false);
      setNewForm(EMPTY_FORM);
      toast.success('Pricing config created');
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PricingConfig.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pricing-configs'] });
      setEditingId(null);
      toast.success('Pricing config updated');
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PricingConfig.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pricing-configs'] });
      toast.success('Deleted');
    },
    onError: (e) => toast.error(e.message),
  });

  const startEdit = (cfg) => {
    setEditingId(cfg.id);
    setEditForm({ ...cfg });
  };

  const inputStyle = { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' };
  const selectStyle = { ...inputStyle, padding: '8px 12px', borderRadius: '10px', fontSize: '13px', width: '100%' };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-black text-lg">Pricing by Currency</h2>
          <p className="text-white/40 text-xs mt-0.5">Manage localized pricing per plan and currency. Stripe Price IDs override dynamic pricing.</p>
        </div>
        <Button
          onClick={() => setShowNew(true)}
          className="gap-2 text-sm font-bold"
          style={{ background: orange, color: '#fff', border: 'none' }}
        >
          <Plus className="w-4 h-4" /> Add Config
        </Button>
      </div>

      {/* Currency coverage overview */}
      <div className="grid grid-cols-5 gap-2">
        {SUPPORTED_CURRENCIES.map(c => {
          const cfg = CURRENCY_CONFIG[c];
          const count = configs.filter(x => x.currency === c && x.active).length;
          return (
            <div key={c} className="rounded-xl p-3 border text-center"
              style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
              <div className="text-xl mb-1">{cfg.flag}</div>
              <p className="text-white font-black text-sm">{c}</p>
              <p className="text-white/40 text-xs">{count} plan{count !== 1 ? 's' : ''}</p>
            </div>
          );
        })}
      </div>

      {/* New config form */}
      {showNew && (
        <div className="rounded-2xl border p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,122,0,0.3)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold">New Pricing Config</h3>
            <button onClick={() => setShowNew(false)}><X className="w-5 h-5 text-white/40 hover:text-white" /></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="text-white/50 text-xs mb-1 block">Plan</label>
              <select style={selectStyle} value={newForm.plan_name} onChange={e => setNewForm(f => ({ ...f, plan_name: e.target.value }))}>
                {PLANS.map(p => <option key={p} value={p}>{PLAN_LABELS[p]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/50 text-xs mb-1 block">Currency</label>
              <select style={selectStyle} value={newForm.currency} onChange={e => setNewForm(f => ({ ...f, currency: e.target.value }))}>
                {SUPPORTED_CURRENCIES.map(c => <option key={c} value={c}>{CURRENCY_CONFIG[c].flag} {c} — {CURRENCY_CONFIG[c].name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/50 text-xs mb-1 block">Amount</label>
              <Input style={inputStyle} type="number" placeholder="e.g. 4.99" value={newForm.amount} onChange={e => setNewForm(f => ({ ...f, amount: parseFloat(e.target.value) || '' }))} />
            </div>
            <div>
              <label className="text-white/50 text-xs mb-1 block">Stripe Price ID <span className="text-white/25">(optional)</span></label>
              <Input style={inputStyle} placeholder="price_xxxxx" value={newForm.stripe_price_id} onChange={e => setNewForm(f => ({ ...f, stripe_price_id: e.target.value }))} />
            </div>
            <div>
              <label className="text-white/50 text-xs mb-1 block">Country Codes <span className="text-white/25">(comma-separated)</span></label>
              <Input style={inputStyle} placeholder="FR,BE,SN" value={newForm.country_codes} onChange={e => setNewForm(f => ({ ...f, country_codes: e.target.value.toUpperCase() }))} />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={newForm.active} onChange={e => setNewForm(f => ({ ...f, active: e.target.checked }))} />
                <span className="text-white/70 text-sm">Active</span>
              </label>
            </div>
          </div>
          <Button
            onClick={() => createMutation.mutate(newForm)}
            disabled={createMutation.isPending || !newForm.amount}
            style={{ background: orange, color: '#fff', border: 'none' }}
          >
            {createMutation.isPending ? 'Saving...' : 'Save Config'}
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl overflow-hidden border" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
        {isLoading ? (
          <div className="p-12 text-center text-white/30">Loading...</div>
        ) : configs.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-white/30 text-sm">No pricing configs yet. Add one above to override default USD pricing.</p>
            <p className="text-white/20 text-xs mt-1">Without configs, all plans use USD pricing and Stripe dynamic price_data.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['Plan', 'Currency', 'Amount', 'Stripe Price ID', 'Countries', 'Active', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {configs.map(cfg => {
                  const isEditing = editingId === cfg.id;
                  const currCfg = CURRENCY_CONFIG[cfg.currency];
                  return (
                    <tr key={cfg.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <select style={{ ...selectStyle, width: 'auto' }} value={editForm.plan_name} onChange={e => setEditForm(f => ({ ...f, plan_name: e.target.value }))}>
                            {PLANS.map(p => <option key={p} value={p}>{PLAN_LABELS[p]}</option>)}
                          </select>
                        ) : (
                          <span className="text-white font-bold text-sm">{PLAN_LABELS[cfg.plan_name] || cfg.plan_name}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <select style={{ ...selectStyle, width: 'auto' }} value={editForm.currency} onChange={e => setEditForm(f => ({ ...f, currency: e.target.value }))}>
                            {SUPPORTED_CURRENCIES.map(c => <option key={c} value={c}>{CURRENCY_CONFIG[c].flag} {c}</option>)}
                          </select>
                        ) : (
                          <span className="font-bold text-sm" style={{ color: gold }}>{currCfg?.flag} {cfg.currency}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <Input style={{ ...inputStyle, width: '100px' }} type="number" value={editForm.amount} onChange={e => setEditForm(f => ({ ...f, amount: parseFloat(e.target.value) || '' }))} />
                        ) : (
                          <span className="text-white font-bold">{currCfg?.symbol}{cfg.amount}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <Input style={{ ...inputStyle, width: '160px', fontSize: '11px' }} placeholder="price_xxx" value={editForm.stripe_price_id || ''} onChange={e => setEditForm(f => ({ ...f, stripe_price_id: e.target.value }))} />
                        ) : (
                          <span className="font-mono text-xs" style={{ color: cfg.stripe_price_id ? '#22c55e' : 'rgba(255,255,255,0.2)' }}>
                            {cfg.stripe_price_id ? cfg.stripe_price_id.slice(0, 18) + '…' : 'dynamic'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <Input style={{ ...inputStyle, width: '120px', fontSize: '12px' }} placeholder="FR,BE" value={editForm.country_codes || ''} onChange={e => setEditForm(f => ({ ...f, country_codes: e.target.value.toUpperCase() }))} />
                        ) : (
                          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{cfg.country_codes || '—'}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input type="checkbox" checked={editForm.active} onChange={e => setEditForm(f => ({ ...f, active: e.target.checked }))} />
                        ) : (
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center inline-flex`}
                            style={{ background: cfg.active ? '#22c55e20' : '#ef444420' }}>
                            {cfg.active
                              ? <Check className="w-3 h-3" style={{ color: '#22c55e' }} />
                              : <X className="w-3 h-3" style={{ color: '#ef4444' }} />}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <div className="flex gap-2">
                            <Button size="sm" className="h-7 text-xs gap-1" style={{ background: '#22c55e20', color: '#22c55e', border: '1px solid #22c55e40' }}
                              onClick={() => updateMutation.mutate({ id: cfg.id, data: editForm })} disabled={updateMutation.isPending}>
                              <Save className="w-3 h-3" /> Save
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-white/40" onClick={() => setEditingId(null)}>
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button onClick={() => startEdit(cfg)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                              <Edit2 className="w-3.5 h-3.5" style={{ color: orange }} />
                            </button>
                            <button onClick={() => deleteMutation.mutate(cfg.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-xl p-4 border text-xs" style={{ background: 'rgba(253,186,33,0.06)', borderColor: 'rgba(253,186,33,0.2)', color: 'rgba(255,255,255,0.5)' }}>
        <strong className="text-yellow-400">ℹ️ How it works:</strong> When a user is detected in France, EUR pricing is used. If a Stripe Price ID is provided, it's used directly. Otherwise, Stripe <code>price_data</code> is used dynamically. XOF/CFA has no native Stripe support — those users see CFA pricing but are billed in USD at checkout.
      </div>
    </div>
  );
}