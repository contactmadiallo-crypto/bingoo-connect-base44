import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { Package, Plus, Trash2, Edit2, AlertTriangle, Link2, MapPin, X, Search as SearchIcon, Wifi, Unlink, RefreshCw } from 'lucide-react';
import AssetDeviceAssignModal from '@/components/bingoo/AssetDeviceAssignModal';
import ReplaceDeviceDialog from '@/components/bingoo/ReplaceDeviceDialog';

const ASSET_TYPES = [
  { value: 'pet', label: 'Pet', icon: '🐾' },
  { value: 'luggage', label: 'Luggage', icon: '🧳' },
  { value: 'bag', label: 'Bag', icon: '👜' },
  { value: 'keys', label: 'Keys', icon: '🔑' },
  { value: 'equipment', label: 'Equipment', icon: '📷' },
  { value: 'vehicle', label: 'Vehicle', icon: '🚗' },
  { value: 'other', label: 'Other', icon: '📦' },
];

function AssetTypeBadge({ type }) {
  const item = ASSET_TYPES.find(t => t.value === type);
  return (
    <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase bg-slate-100 text-slate-600">
      {item?.icon} {item?.label || type}
    </span>
  );
}

export default function MyAssetsPanel({ profile, isDark, nfcDevices = [] }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [formData, setFormData] = useState({
    asset_type: 'other', name: '', photo_url: '', description: '',
    nfc_device_id: '', lost_mode_enabled: false, finder_message: '',
    recovery_instructions: '', safe_contact_preference: 'phone',
  });
  const [uploading, setUploading] = useState(false);
  const [assignModalAsset, setAssignModalAsset] = useState(null);
  const [replaceAsset, setReplaceAsset] = useState(null);

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  const { data: assets, isLoading } = useQuery({
    queryKey: ['my-assets', user?.id],
    queryFn: () => base44.entities.AssetItem.filter({ owner_user_id: user.id }, '-created_date', 100),
    enabled: !!user?.id,
  });

  const { data: myDevices = [] } = useQuery({
    queryKey: ['my-nfc-devices-for-assets', user?.id],
    queryFn: async () => {
      const res = await base44.functions.invoke('getMyNfcDevices', {});
      return res?.data?.devices || [];
    },
    enabled: !!user?.id,
  });

  const deviceMap = {};
  (myDevices || []).forEach(d => { deviceMap[d.id] = d; });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, photo_url: file_url }));
      toast({ title: 'Photo uploaded' });
    } catch (err) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      asset_type: 'other', name: '', photo_url: '', description: '',
      nfc_device_id: '', lost_mode_enabled: false, finder_message: '',
      recovery_instructions: '', safe_contact_preference: 'phone',
    });
    setEditingAsset(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast({ title: 'Please enter an asset name', variant: 'destructive' });
      return;
    }
    try {
      const payload = {
        ...formData,
        owner_user_id: user.id,
        profile_id: profile?.id,
      };
      if (editingAsset) {
        await base44.entities.AssetItem.update(editingAsset.id, payload);
        toast({ title: 'Asset updated' });
      } else {
        await base44.entities.AssetItem.create(payload);
        toast({ title: 'Asset created' });
      }
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['my-assets', user?.id] });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setFormData({
      asset_type: asset.asset_type || 'other',
      name: asset.name || '',
      photo_url: asset.photo_url || '',
      description: asset.description || '',
      nfc_device_id: asset.nfc_device_id || '',
      lost_mode_enabled: asset.lost_mode_enabled || false,
      finder_message: asset.finder_message || '',
      recovery_instructions: asset.recovery_instructions || '',
      safe_contact_preference: asset.safe_contact_preference || 'phone',
    });
    setShowForm(true);
  };

  const handleDelete = async (assetId) => {
    try {
      await base44.entities.AssetItem.delete(assetId);
      toast({ title: 'Asset deleted' });
      queryClient.invalidateQueries({ queryKey: ['my-assets', user?.id] });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleToggleLostMode = async (asset) => {
    try {
      await base44.entities.AssetItem.update(asset.id, { lost_mode_enabled: !asset.lost_mode_enabled });
      toast({ title: asset.lost_mode_enabled ? 'Lost mode disabled' : 'Lost mode enabled' });
      queryClient.invalidateQueries({ queryKey: ['my-assets', user?.id] });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleAssignDevice = async (assetId, deviceId) => {
    try {
      await base44.entities.AssetItem.update(assetId, { nfc_device_id: deviceId });
      toast({ title: 'NFC device assigned to asset' });
      setAssignModalAsset(null);
      queryClient.invalidateQueries({ queryKey: ['my-assets', user?.id] });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleUnlinkDevice = async (assetId) => {
    try {
      await base44.entities.AssetItem.update(assetId, { nfc_device_id: '' });
      toast({ title: 'NFC device unlinked' });
      queryClient.invalidateQueries({ queryKey: ['my-assets', user?.id] });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const panelBg = isDark ? 'bg-white/5' : 'bg-white';
  const panelBorder = isDark ? 'border-white/10' : 'border-slate-200';
  const headText = isDark ? 'text-white' : 'text-slate-900';
  const mutedText = isDark ? 'text-white/60' : 'text-slate-500';
  const inputBg = isDark ? 'bg-white/5' : 'bg-white';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <Package className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h2 className={`text-base font-black ${headText}`}>My Assets</h2>
            <p className={`text-xs ${mutedText}`}>Protect and track your valuable items</p>
          </div>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white"
          style={{ background: '#f97316' }}
        >
          <Plus className="w-4 h-4" /> Add Asset
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className={`rounded-2xl border ${panelBorder} ${panelBg} p-5 space-y-3`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-black ${headText}`}>{editingAsset ? 'Edit Asset' : 'New Asset'}</h3>
            <button onClick={resetForm}><X className={`w-4 h-4 ${mutedText}`} /></button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`text-xs font-bold ${headText} mb-1.5 block`}>Asset Type</label>
              <select value={formData.asset_type} onChange={e => setFormData({ ...formData, asset_type: e.target.value })} className={`w-full px-3 py-2 rounded-lg border ${panelBorder} ${inputBg} text-sm ${headText}`}>
                {ASSET_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
              </select>
            </div>
            <div>
              <label className={`text-xs font-bold ${headText} mb-1.5 block`}>Asset Name</label>
              <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. MacBook Pro" className={`w-full px-3 py-2 rounded-lg border ${panelBorder} ${inputBg} text-sm ${headText}`} />
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className={`text-xs font-bold ${headText} mb-1.5 block`}>Photo</label>
            {formData.photo_url ? (
              <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200">
                <img src={formData.photo_url} alt="Asset" className="w-full h-full object-cover" />
                <button onClick={() => setFormData({ ...formData, photo_url: '' })} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center"><X className="w-3 h-3" /></button>
              </div>
            ) : (
              <label className={`flex flex-col items-center justify-center gap-1 p-4 rounded-xl border-2 border-dashed cursor-pointer ${isDark ? 'border-white/20' : 'border-slate-300'}`}>
                {uploading ? <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" /> : <Plus className={`w-5 h-5 ${mutedText}`} />}
                <span className={`text-xs ${mutedText}`}>Upload photo</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            )}
          </div>

          <div>
            <label className={`text-xs font-bold ${headText} mb-1.5 block`}>Description</label>
            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Identifying details…" rows={2} className={`w-full px-3 py-2 rounded-lg border ${panelBorder} ${inputBg} text-sm ${headText} resize-none`} />
          </div>

          {/* NFC device is assigned from the asset card after saving */}

          {/* Lost Mode */}
          <div className={`rounded-xl p-3 ${isDark ? 'bg-orange-500/10' : 'bg-orange-50'}`}>
            <label className="flex items-center gap-2 mb-2">
              <input type="checkbox" checked={formData.lost_mode_enabled} onChange={e => setFormData({ ...formData, lost_mode_enabled: e.target.checked })} className="w-4 h-4 accent-orange-500" />
              <span className={`text-sm font-bold ${headText} flex items-center gap-1`}><AlertTriangle className="w-4 h-4 text-orange-500" /> Enable Lost Mode</span>
            </label>
            {formData.lost_mode_enabled && (
              <div className="space-y-2">
                <div>
                  <label className={`text-xs font-bold ${headText} mb-1 block`}>Finder Message</label>
                  <input value={formData.finder_message} onChange={e => setFormData({ ...formData, finder_message: e.target.value })} placeholder="Thank you for finding my item!" className={`w-full px-3 py-2 rounded-lg border ${panelBorder} ${inputBg} text-sm ${headText}`} />
                </div>
                <div>
                  <label className={`text-xs font-bold ${headText} mb-1 block`}>Recovery Instructions</label>
                  <textarea value={formData.recovery_instructions} onChange={e => setFormData({ ...formData, recovery_instructions: e.target.value })} placeholder="How to return this item…" rows={2} className={`w-full px-3 py-2 rounded-lg border ${panelBorder} ${inputBg} text-sm ${headText} resize-none`} />
                </div>
                <div>
                  <label className={`text-xs font-bold ${headText} mb-1 block`}>Safe Contact Preference</label>
                  <select value={formData.safe_contact_preference} onChange={e => setFormData({ ...formData, safe_contact_preference: e.target.value })} className={`w-full px-3 py-2 rounded-lg border ${panelBorder} ${inputBg} text-sm ${headText}`}>
                    <option value="phone">Phone</option>
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="none">None</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button onClick={handleSave} className="px-4 py-2 rounded-lg text-white text-xs font-bold" style={{ background: '#f97316' }}>{editingAsset ? 'Update' : 'Create'} Asset</button>
            <button onClick={resetForm} className={`px-4 py-2 rounded-lg border ${panelBorder} text-xs font-bold ${headText}`}>Cancel</button>
          </div>
        </div>
      )}

      {/* Asset Cards */}
      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" /></div>
      ) : (assets || []).length === 0 ? (
        <div className={`text-center py-12 rounded-2xl border ${panelBorder} ${panelBg}`}>
          <Package className={`w-8 h-8 mx-auto mb-2 ${mutedText}`} />
          <p className={`text-sm font-bold ${headText}`}>No assets yet</p>
          <p className={`text-xs ${mutedText} mt-1`}>Add your first asset to protect it with NFC.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {assets.map(asset => {
            const linkedDevice = asset.nfc_device_id ? deviceMap[asset.nfc_device_id] : null;
            return (
            <div key={asset.id} className={`rounded-xl border ${panelBorder} ${panelBg} p-4 ${asset.lost_mode_enabled ? 'ring-2 ring-orange-500' : ''}`}>
              <div className="flex items-start gap-3 mb-3">
                {asset.photo_url ? (
                  <img src={asset.photo_url} alt={asset.name} className="w-16 h-16 rounded-xl object-cover" />
                ) : (
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                    <Package className={`w-6 h-6 ${mutedText}`} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`text-sm font-bold ${headText} truncate`}>{asset.name}</p>
                    <AssetTypeBadge type={asset.asset_type} />
                  </div>
                  {asset.description && <p className={`text-xs ${mutedText} line-clamp-2`}>{asset.description}</p>}
                  {/* NFC Device Link Status */}
                  {linkedDevice ? (
                    <div className={`flex items-center gap-2 mt-2 rounded-lg p-2 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                      <Wifi className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                      <span className={`text-xs font-mono font-bold ${headText}`}>{linkedDevice.device_code}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                        linkedDevice.status === 'lost' ? (isDark ? 'bg-red-500/15 text-red-400' : 'bg-red-50 text-red-600')
                        : linkedDevice.status === 'active' ? (isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-600')
                        : (isDark ? 'bg-white/10 text-white/50' : 'bg-slate-100 text-slate-500')
                      }`}>{linkedDevice.status}</span>
                    </div>
                  ) : asset.nfc_device_id ? (
                    <div className="flex items-center gap-1 mt-2">
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                      <span className="text-xs text-amber-500">Linked device not found</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 mt-2">
                      <Link2 className={`w-3 h-3 ${mutedText}`} />
                      <span className={`text-xs ${mutedText}`}>No NFC device linked</span>
                    </div>
                  )}
                </div>
              </div>
              {asset.lost_mode_enabled && (
                <div className="flex items-center gap-1.5 rounded-lg bg-orange-500/10 p-2 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-xs font-bold text-orange-600">Lost mode active</span>
                </div>
              )}
              <div className="flex gap-2 flex-wrap">
                {linkedDevice ? (
                  <>
                    <button onClick={() => setAssignModalAsset(asset)} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold ${isDark ? 'bg-white/5 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Link2 className="w-3 h-3" /> Change
                    </button>
                    <button onClick={() => setReplaceAsset(asset)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: '#06b6d4' }}>
                      <RefreshCw className="w-3 h-3" /> Replace
                    </button>
                    <button onClick={() => handleUnlinkDevice(asset.id)} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border ${isDark ? 'border-white/10 text-white/60' : 'border-slate-200 text-slate-500'}`}>
                      <Unlink className="w-3 h-3" /> Unlink
                    </button>
                  </>
                ) : (
                  <button onClick={() => setAssignModalAsset(asset)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: '#f97316' }}>
                    <Wifi className="w-3 h-3" /> Assign NFC
                  </button>
                )}
                <button onClick={() => handleEdit(asset)} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold ${isDark ? 'bg-white/5 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button
                  onClick={() => handleToggleLostMode(asset)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold ${asset.lost_mode_enabled ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'}`}
                >
                  <AlertTriangle className="w-3 h-3" /> {asset.lost_mode_enabled ? 'Found' : 'Lost'}
                </button>
                <button onClick={() => handleDelete(asset.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-500 border border-red-200">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}

      <AssetDeviceAssignModal
        open={!!assignModalAsset}
        onClose={() => setAssignModalAsset(null)}
        devices={myDevices}
        assets={assets}
        currentAssetId={assignModalAsset?.id}
        onAssign={(deviceId) => handleAssignDevice(assignModalAsset?.id, deviceId)}
        isDark={isDark}
      />

      <ReplaceDeviceDialog
        open={!!replaceAsset}
        onClose={() => setReplaceAsset(null)}
        device={replaceAsset?.nfc_device_id ? deviceMap[replaceAsset.nfc_device_id] : null}
        profile={profile}
        user={user}
        isDark={isDark}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['my-nfc-devices-for-assets', user?.id] });
          queryClient.invalidateQueries({ queryKey: ['my-assets', user?.id] });
        }}
      />
    </div>
  );
}