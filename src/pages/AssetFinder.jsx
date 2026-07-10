import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Package, Phone, Mail, MessageCircle, ArrowLeft, MapPin, AlertTriangle } from 'lucide-react';
import { InfinityMark } from '@/components/mockups/brand/InfinityMark';

export default function AssetFinder() {
  const { nfcDeviceCode } = useParams();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAsset() {
      try {
        const res = await base44.functions.invoke('getAssetByNfcCode', { device_code: nfcDeviceCode });
        setAsset(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Asset not found');
      } finally {
        setLoading(false);
      }
    }
    if (nfcDeviceCode) fetchAsset();
  }, [nfcDeviceCode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center max-w-sm">
          <Package className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <h1 className="text-xl font-bold text-slate-800 mb-2">No Lost Asset Found</h1>
          <p className="text-sm text-slate-500 mb-4">{error || 'This device is not linked to a lost asset.'}</p>
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-orange-600">
            <ArrowLeft className="w-4 h-4" /> Go Home
          </Link>
        </div>
      </div>
    );
  }

  const { asset: assetData, owner, device } = asset;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <InfinityMark className="w-7 h-7" />
          <div>
            <h1 className="text-sm font-black text-slate-900">Bingoo Connect</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Asset Found</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-md mx-auto px-4 py-6 space-y-4">
        {/* Lost Alert — dynamic asset name */}
        {assetData.lost_mode_enabled ? (
          <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "#FFF5EB", border: "1px solid #FDBA74" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(249,115,22,0.15)" }}>
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black leading-tight" style={{ color: "#854D0E" }}>{assetData.name} has been reported lost</p>
              <p className="text-xs font-semibold mt-0.5" style={{ color: "#C2410C" }}>Please help return {assetData.name} to the owner.</p>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-100">
              <Package className="w-5 h-5 text-blue-500" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-blue-800 leading-tight">{assetData.name} identified</p>
              <p className="text-xs text-blue-600 mt-0.5">This NFC tag is linked to a registered Bingoo asset.</p>
            </div>
          </div>
        )}

        {/* Asset Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
          {/* Image with gradient overlay + name/badge */}
          {assetData.photo_url ? (
            <div className="relative h-52">
              <img src={assetData.photo_url} alt={assetData.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              {assetData.lost_mode_enabled && (
                <span className="absolute top-3 right-3 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide text-white flex items-center gap-1" style={{ background: "rgba(249,115,22,0.95)" }}>
                  <AlertTriangle className="w-3 h-3" /> Lost
                </span>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between gap-2">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-none">{assetData.name}</h2>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase bg-white/90 text-slate-700 backdrop-blur-sm flex-shrink-0">{assetData.asset_type}</span>
              </div>
            </div>
          ) : (
            <div className="p-5 pb-0">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{assetData.name}</h2>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase bg-slate-100 text-slate-600">{assetData.asset_type}</span>
              </div>
            </div>
          )}

          <div className="p-5 space-y-4">
            {assetData.description && (
              <p className="text-sm text-slate-600 leading-relaxed">{assetData.description}</p>
            )}

            {/* Finder Message */}
            {assetData.finder_message && (
              <div className="rounded-xl p-4" style={{ background: "#EFF6FF", border: "1px solid #DBEAFE" }}>
                <p className="text-[10px] font-black uppercase tracking-wide text-blue-700 mb-1">Message from owner</p>
                <p className="text-sm text-slate-700 italic leading-relaxed">"{assetData.finder_message}"</p>
              </div>
            )}

            {/* Recovery Instructions */}
            {assetData.recovery_instructions && (
              <div className="rounded-xl p-4" style={{ background: "#ECFDF5", border: "1px solid #D1FAE5" }}>
                <p className="text-[10px] font-black uppercase tracking-wide text-emerald-700 mb-1">Recovery instructions</p>
                <p className="text-sm text-slate-700 leading-relaxed">{assetData.recovery_instructions}</p>
              </div>
            )}

            {/* Contact Owner */}
            <div className="space-y-2.5 pt-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact {owner.display_name}</p>
              {owner.contact.phone && (
                <a href={`tel:${owner.contact.phone}`} className="flex items-center gap-3 p-3.5 rounded-2xl text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ background: "#0b2149" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(249,115,22,0.25)" }}>
                    <Phone className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-white/50">Call</p>
                    <p className="truncate">{owner.contact.phone}</p>
                  </div>
                </a>
              )}
              {owner.contact.email && (
                <a href={`mailto:${owner.contact.email}`} className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 text-slate-700 font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] hover:border-slate-300">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-100">
                    <Mail className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Email</p>
                    <p>Send a message</p>
                  </div>
                </a>
              )}
              {owner.contact.whatsapp && (
                <a href={`https://wa.me/${owner.contact.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3.5 rounded-2xl text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ background: "#22C55E" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/20">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-white/60">WhatsApp</p>
                    <p>Chat instantly</p>
                  </div>
                </a>
              )}
              {!owner.contact.phone && !owner.contact.email && !owner.contact.whatsapp && (
                <p className="text-xs text-slate-400 text-center py-2">No contact method available. Please bring this item to a local authority.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-slate-400">Device: {device.device_code} ({device.device_type})</p>
          <p className="text-xs text-slate-400 mt-1">Powered by Bingoo Connect</p>
        </div>
      </main>
    </div>
  );
}