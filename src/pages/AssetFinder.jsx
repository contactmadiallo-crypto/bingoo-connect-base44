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
        {/* Lost Alert */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-orange-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-black text-orange-800">This item has been reported lost</p>
            <p className="text-xs text-orange-600">Please help return it to the owner.</p>
          </div>
        </div>

        {/* Asset Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {assetData.photo_url && (
            <img src={assetData.photo_url} alt={assetData.name} className="w-full h-48 object-cover" />
          )}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-lg font-black text-slate-900">{assetData.name}</h2>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase bg-slate-100 text-slate-600">{assetData.asset_type}</span>
            </div>
            {assetData.description && <p className="text-sm text-slate-600 mb-3">{assetData.description}</p>}

            {/* Finder Message */}
            {assetData.finder_message && (
              <div className="bg-blue-50 rounded-xl p-3 mb-3">
                <p className="text-xs font-bold text-blue-700 mb-1">Message from owner:</p>
                <p className="text-sm text-slate-700">"{assetData.finder_message}"</p>
              </div>
            )}

            {/* Recovery Instructions */}
            {assetData.recovery_instructions && (
              <div className="bg-emerald-50 rounded-xl p-3 mb-4">
                <p className="text-xs font-bold text-emerald-700 mb-1">Recovery instructions:</p>
                <p className="text-sm text-slate-700">{assetData.recovery_instructions}</p>
              </div>
            )}

            {/* Contact Owner */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase">Contact {owner.display_name}</p>
              {owner.contact.phone && (
                <a href={`tel:${owner.contact.phone}`} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 text-white font-bold text-sm">
                  <Phone className="w-4 h-4" /> Call {owner.contact.phone}
                </a>
              )}
              {owner.contact.email && (
                <a href={`mailto:${owner.contact.email}`} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm">
                  <Mail className="w-4 h-4" /> Email Owner
                </a>
              )}
              {owner.contact.whatsapp && (
                <a href={`https://wa.me/${owner.contact.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500 text-white font-bold text-sm">
                  <MessageCircle className="w-4 h-4" /> WhatsApp
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