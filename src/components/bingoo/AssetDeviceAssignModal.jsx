import React, { useState, useEffect } from 'react';
import { Link2, X, AlertTriangle, Check, Smartphone, Search, Wifi } from 'lucide-react';
import { getDeviceShortLabel } from '@/lib/deviceTypes';

export default function AssetDeviceAssignModal({
  open, onClose, devices, assets, currentAssetId, onAssign, isDark
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open) {
      setSelectedId(null);
      setSearch('');
    }
  }, [open]);

  if (!open) return null;

  const panelBg = isDark ? 'bg-[#13284f]' : 'bg-white';
  const panelBorder = isDark ? 'border-white/10' : 'border-slate-200';
  const headText = isDark ? 'text-white' : 'text-slate-900';
  const mutedText = isDark ? 'text-white/60' : 'text-slate-500';
  const inputBg = isDark ? 'bg-white/5' : 'bg-slate-50';
  const itemBg = isDark ? 'bg-white/5' : 'bg-slate-50';

  const filtered = (devices || []).filter(d =>
    !search || d.device_code?.toLowerCase().includes(search.toLowerCase())
  );

  const deviceAssetMap = {};
  (assets || []).forEach(a => {
    if (a.nfc_device_id && a.id !== currentAssetId) {
      deviceAssetMap[a.nfc_device_id] = a;
    }
  });

  const selectedDevice = (devices || []).find(d => d.id === selectedId);
  const hasProfileWarning = !!selectedDevice?.profile_id;
  const conflictingAsset = selectedId ? deviceAssetMap[selectedId] : null;
  const showWarning = hasProfileWarning || conflictingAsset;

  const handleConfirm = () => {
    if (!selectedId) return;
    onAssign(selectedId);
  };

  const handleClose = () => {
    setSelectedId(null);
    setSearch('');
    onClose();
  };

  const statusStyle = (status) => {
    const map = {
      active: isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-600',
      assigned: isDark ? 'bg-blue-500/15 text-blue-400' : 'bg-blue-50 text-blue-600',
      available: isDark ? 'bg-white/10 text-white/50' : 'bg-slate-100 text-slate-500',
      lost: isDark ? 'bg-red-500/15 text-red-400' : 'bg-red-50 text-red-600',
      disabled: isDark ? 'bg-orange-500/15 text-orange-400' : 'bg-orange-50 text-orange-600',
      replaced: isDark ? 'bg-purple-500/15 text-purple-400' : 'bg-purple-50 text-purple-600',
    };
    return map[status] || map.available;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={handleClose}>
      <div className={`w-full max-w-md max-h-[80vh] rounded-2xl border ${panelBorder} ${panelBg} flex flex-col`} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${panelBorder}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Link2 className="w-4 h-4 text-orange-500" />
            </div>
            <h3 className={`text-sm font-black ${headText}`}>Select NFC Device</h3>
          </div>
          <button onClick={handleClose}><X className={`w-4 h-4 ${mutedText}`} /></button>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedText}`} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search device code…"
              className={`w-full pl-9 pr-3 py-2 rounded-lg border ${panelBorder} ${inputBg} text-sm ${headText}`} />
          </div>
        </div>

        {/* Device List */}
        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2 min-h-[200px]">
          {filtered.length === 0 ? (
            <div className={`text-center py-8 ${mutedText}`}>
              <Smartphone className="w-6 h-6 mx-auto mb-2 opacity-40" />
              <p className="text-xs">No devices found. Activate an NFC device first.</p>
            </div>
          ) : filtered.map(d => {
            const isSelected = selectedId === d.id;
            const linkedAsset = deviceAssetMap[d.id];

            return (
              <button key={d.id} onClick={() => setSelectedId(d.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${isSelected ? (isDark ? 'bg-orange-500/15 border-orange-500/40' : 'bg-orange-50 border-orange-300') : `${panelBorder} ${itemBg}`}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-orange-500/20' : (isDark ? 'bg-white/5' : 'bg-slate-100')}`}>
                    <Wifi className={`w-4 h-4 ${isSelected ? 'text-orange-500' : mutedText}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-sm font-bold font-mono ${headText}`}>{d.device_code}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${statusStyle(d.status)}`}>{d.status}</span>
                    </div>
                    <p className={`text-xs ${mutedText}`}>{getDeviceShortLabel(d.device_type)}</p>
                    {d.profile_id && (
                      <p className={`text-[11px] mt-0.5 flex items-center gap-1 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                        <AlertTriangle className="w-3 h-3" /> Linked to a profile
                      </p>
                    )}
                    {linkedAsset && (
                      <p className={`text-[11px] mt-0.5 flex items-center gap-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                        <Link2 className="w-3 h-3" /> Used by: {linkedAsset.name}
                      </p>
                    )}
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Warning + Actions */}
        {selectedId && (
          <div className={`p-3 border-t ${panelBorder} space-y-3`}>
            {showWarning && (
              <div className={`rounded-xl p-3 space-y-1.5 ${isDark ? 'bg-amber-500/10 border border-amber-500/25' : 'bg-amber-50 border border-amber-200'}`}>
                {hasProfileWarning && (
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className={`text-xs ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                      This device is linked to a profile. Its NFC tag points to the profile page — linking it to an asset won't change that. The asset finder page is at <code>/asset/{selectedDevice?.device_code}</code>.
                    </p>
                  </div>
                )}
                {conflictingAsset && (
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className={`text-xs ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                      This device is currently linked to asset "<strong>{conflictingAsset.name}</strong>". Assigning it here will unlink it from that asset.
                    </p>
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={handleConfirm}
                className="flex-1 px-4 py-2.5 rounded-lg text-white text-xs font-bold"
                style={{ background: '#f97316' }}>
                {showWarning ? 'Confirm & Assign' : 'Assign Device'}
              </button>
              <button onClick={handleClose}
                className={`px-4 py-2.5 rounded-lg border ${panelBorder} text-xs font-bold ${headText}`}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}