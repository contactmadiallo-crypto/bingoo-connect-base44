import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Package, Phone, Mail, MessageCircle, ArrowLeft, MapPin, AlertTriangle,
  Send, CheckCircle2, Loader2, MapPinned, Gift, HeartPulse, ShieldCheck, PawPrint, Luggage,
} from 'lucide-react';
import { InfinityMark } from '@/components/bingoo/ui/BingooBrand';
import { useLostScanLogger } from '@/hooks/useLostScanLogger';
import { getDeviceDisplayName } from '@/lib/deviceTypes';
import { useI18n } from '@/lib/I18nContext';

const PET_TYPES = ['pet'];
const ITEM_TYPES = ['luggage', 'bag', 'keys', 'equipment', 'vehicle', 'other'];

export default function AssetFinder() {
  const { language } = useI18n();
  const tr = (en, fr) => language === 'fr' ? fr : en;
  const { nfcDeviceCode, assetId } = useParams();
  const normalizedCode = nfcDeviceCode?.toUpperCase().trim();
  const byAssetId = !!assetId;

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', location: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    async function fetchAsset() {
      try {
        const res = byAssetId
          ? await base44.functions.invoke('getPublicAsset', { asset_id: assetId })
          : await base44.functions.invoke('getAssetByNfcCode', { device_code: normalizedCode });
        setAsset(res.data);
      } catch (err) {
        setError(err.response?.data?.error || tr('Asset not found', 'Objet introuvable'));
      } finally {
        setLoading(false);
      }
    }
    if (byAssetId || normalizedCode) fetchAsset();
  }, [normalizedCode, assetId, byAssetId]);

  const isLost = !!asset?.asset?.lost_mode_enabled;
  const { reportId, locationStatus, preciseLocation, requestLocation } = useLostScanLogger({
    deviceCode: byAssetId ? null : normalizedCode,
    assetId: byAssetId ? assetId : null,
    enabled: !loading && isLost,
    scanSource: byAssetId ? 'qr' : 'nfc',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await base44.functions.invoke('notifyLostDeviceFound', {
        device_code: byAssetId ? null : normalizedCode,
        asset_id: byAssetId ? assetId : null,
        report_id: reportId || null,
        finder_name: form.name,
        finder_phone: form.phone,
        finder_email: form.email,
        finder_location: form.location,
        finder_message: form.message,
        latitude: preciseLocation?.lat ?? null,
        longitude: preciseLocation?.lng ?? null,
        scan_source: byAssetId ? 'qr' : 'nfc',
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #071A3D 0%, #0b2149 60%, #13284f 100%)' }}>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-4"><span className="text-white font-black text-4xl tracking-[-0.055em]">Bing</span><InfinityMark size={48} color="#f97316" strokeWidth={3.8} glow /></div>
          <p className="text-white/60 font-semibold text-sm">{tr('Checking device…', 'Vérification de l’appareil…')}</p>
        </div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(160deg, #071A3D 0%, #0b2149 60%, #13284f 100%)' }}>
        <div className="text-center max-w-sm bg-white rounded-3xl shadow-2xl p-8">
          <Package className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <h1 className="text-xl font-black text-slate-900 mb-2">{tr('No Asset Found', 'Aucun objet trouvé')}</h1>
          <p className="text-sm text-slate-500 mb-4">{error || tr('This device is not linked to a registered Bingoo asset.', 'Cet appareil n’est lié à aucun objet Bingoo enregistré.')}</p>
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-white px-4 py-2 rounded-xl" style={{ background: '#f97316' }}>
            <ArrowLeft className="w-4 h-4" /> {tr('Go Home', 'Accueil')}
          </Link>
        </div>
      </div>
    );
  }

  const { asset: assetData, owner, device } = asset;
  const isPet = PET_TYPES.includes(assetData.asset_type);
  const isItem = ITEM_TYPES.includes(assetData.asset_type);
  const productLabel = getDeviceDisplayName(device);
  const TypeIcon = isPet ? PawPrint : Luggage;

  const hasContact = owner.contact.phone || owner.contact.email || owner.contact.whatsapp;

  const footerSignals = (() => {
    if (isLost) {
      return [
        { Icon: AlertTriangle, title: tr('Reported Lost', 'Signalé perdu'), subtitle: isPet ? tr('Help reunite this pet', 'Aidez à retrouver cet animal') : tr('Help return this asset', 'Aidez à rendre cet objet') },
        { Icon: isPet ? PawPrint : ShieldCheck, title: isPet ? tr('Help Reunite', 'Aider à retrouver') : tr('Return Ready', 'Prêt à rendre'), subtitle: assetData.recovery_instructions ? tr('Return instructions available', 'Instructions de retour disponibles') : tr('Safe recovery flow active', 'Récupération sécurisée active') },
        { Icon: hasContact ? Phone : Send, title: hasContact ? tr('Contact Owner', 'Contacter le propriétaire') : tr('Finder Report', 'Signalement'), subtitle: hasContact ? tr('Reach the registered owner', 'Joindre le propriétaire enregistré') : tr('Send a safe recovery report', 'Envoyer un signalement sécurisé') },
      ];
    }

    if (isPet) {
      return [
        { Icon: ShieldCheck, title: tr('Protected Pet', 'Animal protégé'), subtitle: tr('Registered Bingoo identity', 'Identité Bingoo enregistrée') },
        { Icon: device ? InfinityMark : PawPrint, title: device ? tr('NFC Connected', 'NFC connecté') : tr('Registered', 'Enregistré'), subtitle: device ? tr('One tap to identify', 'Une touche pour identifier') : tr('QR identity active', 'Identité QR active'), infinity: !!device },
        { Icon: hasContact ? Phone : HeartPulse, title: hasContact ? tr('Owner Reachable', 'Propriétaire joignable') : tr('Care Details', 'Informations de soins'), subtitle: hasContact ? tr('Contact options available', 'Moyens de contact disponibles') : (assetData.public_medical_notes ? tr('Public care notes available', 'Notes de soins publiques disponibles') : tr('Owner-managed asset', 'Objet géré par le propriétaire')) },
      ];
    }

    return [
      { Icon: ShieldCheck, title: tr('Registered', 'Enregistré'), subtitle: tr('Verified Bingoo asset', 'Objet Bingoo vérifié') },
      { Icon: device ? InfinityMark : Package, title: device ? tr('NFC Connected', 'NFC connecté') : tr('QR Connected', 'QR connecté'), subtitle: device ? tr('One tap to identify', 'Une touche pour identifier') : tr('Scan to identify', 'Scannez pour identifier'), infinity: !!device },
      { Icon: hasContact ? Phone : MapPin, title: hasContact ? tr('Return Ready', 'Prêt à rendre') : tr('Asset Details', 'Détails de l’objet'), subtitle: hasContact ? tr('Owner contact available', 'Contact du propriétaire disponible') : (assetData.public_last_known_context ? tr('Context available', 'Contexte disponible') : tr('Recovery profile active', 'Profil de récupération actif')) },
    ];
  })();

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(160deg, #071A3D 0%, #0b2149 60%, #13284f 100%)' }}>
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">{tr('Thank You! 🙏', 'Merci ! 🙏')}</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            {tr(`Your report has been sent to the owner of ${assetData.name}. They will contact you soon.`, `Votre signalement a été envoyé au propriétaire de ${assetData.name}. Il pourra vous contacter prochainement.`)}
          </p>
          <p className="text-xs text-slate-400 mt-4">{tr('Powered by Bingoo Connect', 'Propulsé par Bingoo Connect')}</p>
        </div>
      </div>
    );
  }

  if (!isLost) {
    return (
      <div className="min-h-screen relative overflow-hidden pb-10" style={{ background: 'radial-gradient(circle at 78% 18%, rgba(37,99,235,.18), transparent 26%), radial-gradient(circle at 10% 76%, rgba(249,115,22,.10), transparent 23%), linear-gradient(155deg,#020d1f 0%,#051a3c 54%,#062b62 100%)' }}>
        <div className="pointer-events-none absolute -right-40 -top-16 opacity-[0.09]"><InfinityMark size={520} color="#3b82f6" strokeWidth={1.25} /></div>
        <div className="pointer-events-none absolute -left-48 bottom-[-190px] opacity-[0.07]"><InfinityMark size={560} color="#f97316" strokeWidth={1.2} /></div>

        <main className="relative z-10 mx-auto w-full max-w-md px-4 pt-7">
          <header className="mb-7 flex flex-col items-center">
            <div className="flex items-center gap-1 leading-none">
              <span className="text-white font-black text-[46px] tracking-[-0.06em]">Bing</span>
              <InfinityMark size={61} color="#f97316" strokeWidth={4} glow />
            </div>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-[.36em] text-white/65">{tr('Connect What Matters', 'Connectez ce qui compte')}</p>
          </header>

          <section className="mb-4 flex items-center gap-3 rounded-[26px] px-5 py-4 backdrop-blur-xl" style={{ background: 'rgba(8,30,66,.76)', border: '1px solid rgba(96,165,250,.34)', boxShadow: '0 18px 50px rgba(0,0,0,.20)' }}>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ background: 'rgba(249,115,22,.18)' }}>
              <Package className="h-6 w-6 text-orange-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-black text-white">{tr('Asset Identified', 'Objet identifié')}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-white/58">{tr('This', 'Ce')} {device ? tr('NFC tag', 'tag NFC') : tr('QR code', 'code QR')} {tr('is linked to a registered Bingoo asset.', 'est lié à un objet Bingoo enregistré.')}</p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-black text-emerald-300" style={{ background: 'rgba(16,185,129,.10)', border: '1px solid rgba(52,211,153,.42)' }}>
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> Active
            </span>
          </section>

          <section className="overflow-hidden rounded-[30px]" style={{ background: 'linear-gradient(160deg,rgba(7,31,68,.96),rgba(3,18,42,.98))', border: '1px solid rgba(96,165,250,.27)', boxShadow: '0 30px 75px rgba(0,0,0,.34)' }}>
            {assetData.photo_url ? (
              <div className="relative h-[300px] overflow-hidden sm:h-[330px]">
                <img src={assetData.photo_url} alt={assetData.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#04142e] via-black/5 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <h1 className="truncate text-[34px] font-black uppercase leading-none tracking-[-0.04em] text-white">{assetData.name}</h1>
                      {assetData.description && <p className="mt-2 line-clamp-1 text-[10px] font-bold uppercase tracking-[.22em] text-white/70">{assetData.description}</p>}
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/90 px-3 py-2 text-[11px] font-black uppercase text-slate-700 backdrop-blur-sm">
                      <TypeIcon className="h-3.5 w-3.5" /> {assetData.asset_type}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-6 pb-5 pt-7">
                <h1 className="text-[34px] font-black uppercase tracking-[-0.04em] text-white">{assetData.name}</h1>
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-[11px] font-black uppercase text-white/70"><TypeIcon className="h-3.5 w-3.5" /> {assetData.asset_type}</span>
              </div>
            )}

            <div className="space-y-3 p-4 sm:p-5">
              {device && (
                <div className="flex items-center gap-3 rounded-[22px] px-4 py-4" style={{ background: 'rgba(12,42,86,.78)', border: '1px solid rgba(96,165,250,.25)' }}>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ background: 'rgba(249,115,22,.16)' }}><Package className="h-5 w-5 text-orange-400" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black uppercase tracking-[.18em] text-blue-200/60">{tr('Linked NFC Device', 'Appareil NFC lié')}</p>
                    <p className="mt-0.5 truncate text-base font-black text-white">{productLabel}</p>
                  </div>
                  <button type="button" onClick={() => normalizedCode && navigator.clipboard?.writeText(normalizedCode)} className="shrink-0 rounded-xl px-2 py-1.5 font-mono text-xs font-bold text-white/60 hover:bg-white/5" aria-label={tr('Copy device code', 'Copier le code appareil')}>{normalizedCode}</button>
                </div>
              )}

              <div className="overflow-hidden rounded-[22px]" style={{ background: 'rgba(8,31,67,.72)', border: '1px solid rgba(96,165,250,.18)' }}>
                <div className="flex items-center gap-3 border-b border-white/[.06] px-4 py-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[.06]"><ShieldCheck className="h-5 w-5 text-blue-200/70" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[.18em] text-white/40">{tr('Registered By', 'Enregistré par')}</p>
                    <p className="truncate text-sm font-black text-white">{owner.display_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[.06]"><MapPin className="h-5 w-5 text-blue-200/70" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[.18em] text-white/40">{tr('Asset Information', 'Informations sur l’objet')}</p>
                    <p className="truncate text-sm font-semibold capitalize text-white/75">{assetData.public_last_known_context || `${assetData.asset_type} · ${tr('Registered Bingoo asset', 'Objet Bingoo enregistré')}`}</p>
                  </div>
                </div>
              </div>

              {isPet && assetData.public_medical_notes && (
                <div className="rounded-[20px] p-4" style={{ background: 'rgba(239,68,68,.09)', border: '1px solid rgba(248,113,113,.28)' }}>
                  <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[.16em] text-red-300"><HeartPulse className="h-3.5 w-3.5" /> {tr('Medical / Allergy Notes', 'Notes médicales / allergies')}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/75">{assetData.public_medical_notes}</p>
                </div>
              )}

              {owner.contact.phone && (
                <a href={`tel:${owner.contact.phone}`} className="flex min-h-[76px] items-center gap-3 rounded-[22px] px-4 text-white transition-transform active:scale-[.99]" style={{ background: 'linear-gradient(100deg,#ff9b18 0%,#ff6b13 56%,#ff4a21 100%)', boxShadow: '0 14px 34px rgba(249,115,22,.18)' }}>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15"><Phone className="h-5 w-5" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[.18em] text-white/70">{tr('Call Owner', 'Appeler le propriétaire')}</p>
                    <p className="truncate text-lg font-black">{owner.contact.phone}</p>
                  </div>
                  <span className="text-2xl font-light text-white/75">›</span>
                </a>
              )}

              {(owner.contact.email || owner.contact.whatsapp) && (
                <a href={owner.contact.email ? `mailto:${owner.contact.email}` : `https://wa.me/${owner.contact.whatsapp.replace(/[^0-9]/g, '')}`} target={owner.contact.email ? undefined : '_blank'} rel={owner.contact.email ? undefined : 'noopener noreferrer'} className="flex min-h-[64px] items-center gap-3 rounded-[22px] px-4 text-white transition-colors hover:bg-white/[.04]" style={{ border: '1px solid rgba(249,115,22,.82)' }}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[.05]">{owner.contact.email ? <Mail className="h-5 w-5 text-white/70" /> : <MessageCircle className="h-5 w-5 text-white/70" />}</div>
                  <span className="flex-1 text-sm font-black">{tr('Send a Message', 'Envoyer un message')}</span>
                  <span className="text-2xl font-light text-white/60">›</span>
                </a>
              )}

              <div className="grid grid-cols-3 gap-1 border-t border-white/[.06] pt-5">
                {footerSignals.map(({ Icon, title, subtitle, infinity }, index) => (
                  <div key={`${title}-${index}`} className={`${index === 1 ? 'border-x border-white/[.06]' : ''} px-1 text-center`}>
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-blue-300/20 bg-white/[.04]">
                      {infinity ? <InfinityMark size={21} color="#fff" strokeWidth={2.2} /> : <Icon className="h-4.5 w-4.5 text-white/80" />}
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-wide text-white/70">{title}</p>
                    <p className="mt-1 text-[9px] leading-tight text-white/35">{subtitle}</p>
                  </div>
                ))}
              </div>

              <div className="pb-1 pt-3 text-center">
                <div className="flex items-center justify-center gap-1 opacity-80"><span className="text-white font-black text-lg tracking-[-0.04em]">Bing</span><InfinityMark size={25} color="#f97316" strokeWidth={3.4} /></div>
                <p className="mt-1 text-[8px] font-bold uppercase tracking-[.32em] text-white/30">{tr('Assets That Stay Closer', 'Des objets qui restent proches')}</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10 relative overflow-hidden" style={{ background: 'radial-gradient(circle at 80% 18%, rgba(59,130,246,.15), transparent 25%), linear-gradient(160deg, #031226 0%, #071d42 55%, #062b62 100%)' }}>
      <div className="pointer-events-none absolute -right-36 -top-20 opacity-[0.08]"><InfinityMark size={430} color="#3b82f6" strokeWidth={1.3} /></div>
      <div className="pointer-events-none absolute -left-40 bottom-[-170px] opacity-[0.07]"><InfinityMark size={500} color="#f97316" strokeWidth={1.3} /></div>
      <div className="relative z-10 max-w-md mx-auto px-4 pt-6 space-y-4">

        {/* New Bingoo infinity brand */}
        <div className="flex flex-col items-center py-2">
          <div className="flex items-center gap-1 leading-none">
            <span className="text-white font-black text-[42px] tracking-[-0.055em]">Bing</span>
            <InfinityMark size={55} color="#f97316" strokeWidth={3.9} glow />
          </div>
          <span className="mt-1 text-[9px] font-bold uppercase tracking-[.34em] text-white/65">Connect What Matters</span>
        </div>

        {/* Lost banner */}
        {isLost ? (
          <div className="rounded-3xl p-6 text-center shadow-xl" style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-xl font-black text-white mb-1">{assetData.name} has been reported lost</h1>
            <p className="text-white/85 text-sm">Please help return {assetData.name} to the owner.</p>
            {normalizedCode && (
            <div className="inline-flex items-center gap-2 bg-white/15 rounded-xl px-3 py-1.5 mt-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">Code</span>
              <span className="text-xs font-mono font-black text-white">{normalizedCode}</span>
            </div>
            )}
          </div>
        ) : (
          <div className="rounded-3xl p-5 flex items-center gap-3 shadow-lg backdrop-blur-xl" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(96,165,250,0.30)' }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(249,115,22,0.25)' }}>
              <Package className="w-5 h-5 text-orange-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-white leading-tight">{assetData.name} identified</p>
              <p className="text-xs text-white/60 mt-0.5">{device ? 'This NFC tag is linked to a registered Bingoo asset.' : 'This QR code is linked to a registered Bingoo asset.'}</p>
            </div>
          </div>
        )}

        {/* Asset card */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          {assetData.photo_url ? (
            <div className="relative h-52">
              <img src={assetData.photo_url} alt={assetData.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              {isLost && (
                <span className="absolute top-3 right-3 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide text-white flex items-center gap-1" style={{ background: 'rgba(249,115,22,0.95)' }}>
                  <AlertTriangle className="w-3 h-3" /> Lost
                </span>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between gap-2">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-none">{assetData.name}</h2>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase bg-white/90 text-slate-700 backdrop-blur-sm flex-shrink-0 flex items-center gap-1">
                  <TypeIcon className="w-3 h-3" /> {assetData.asset_type}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-5 pb-0 flex items-center gap-2">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{assetData.name}</h2>
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase bg-slate-100 text-slate-600 flex items-center gap-1">
                <TypeIcon className="w-3 h-3" /> {assetData.asset_type}
              </span>
            </div>
          )}

          <div className="p-5 space-y-4">
            {assetData.description && (
              <p className="text-sm text-slate-600 leading-relaxed">{assetData.description}</p>
            )}

            {/* Linked NFC device (only when the asset has one) */}
            {device && (
            <div className="flex items-center gap-3 rounded-xl p-3 bg-slate-50">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#FFF5EB' }}>
                <Package className="w-4 h-4" style={{ color: '#f97316' }} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Linked NFC Device</p>
                <p className="text-xs font-black text-slate-900 mt-0.5 truncate">{productLabel}</p>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-500 ml-auto">{normalizedCode}</span>
            </div>
            )}

            {/* Pet medical/allergy notes (only if owner enabled) */}
            {isPet && assetData.public_medical_notes && (
              <div className="rounded-xl p-4" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                <p className="text-[10px] font-black uppercase tracking-wide text-red-700 mb-1 flex items-center gap-1"><HeartPulse className="w-3 h-3" /> Medical / Allergy Notes</p>
                <p className="text-sm text-slate-700 leading-relaxed">{assetData.public_medical_notes}</p>
              </div>
            )}

            {/* Luggage/item last known context (only if owner enabled) */}
            {isItem && assetData.public_last_known_context && (
              <div className="rounded-xl p-4" style={{ background: '#EFF6FF', border: '1px solid #DBEAFE' }}>
                <p className="text-[10px] font-black uppercase tracking-wide text-blue-700 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Last Known Context</p>
                <p className="text-sm text-slate-700 leading-relaxed">{assetData.public_last_known_context}</p>
              </div>
            )}

            {/* Reward */}
            {assetData.reward_offered && (
              <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: '#FFFbeb', border: '1px solid #fde68a' }}>
                <Gift className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wide text-amber-700">Reward Offered</p>
                  <p className="text-sm text-slate-700 font-semibold mt-0.5">{assetData.reward_offered}</p>
                </div>
              </div>
            )}

            {/* Finder message from owner */}
            {assetData.finder_message && (
              <div className="rounded-xl p-4" style={{ background: '#EFF6FF', border: '1px solid #DBEAFE' }}>
                <p className="text-[10px] font-black uppercase tracking-wide text-blue-700 mb-1">Message from owner</p>
                <p className="text-sm text-slate-700 italic leading-relaxed">"{assetData.finder_message}"</p>
              </div>
            )}

            {/* Safe return / handoff instructions */}
            {assetData.recovery_instructions && (
              <div className="rounded-xl p-4" style={{ background: '#ECFDF5', border: '1px solid #D1FAE5' }}>
                <p className="text-[10px] font-black uppercase tracking-wide text-emerald-700 mb-1 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Safe Return Instructions</p>
                <p className="text-sm text-slate-700 leading-relaxed">{assetData.recovery_instructions}</p>
              </div>
            )}

            {/* Contact owner */}
            {hasContact && (
              <div className="space-y-2.5 pt-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact {owner.display_name}</p>
                {owner.contact.phone && (
                  <a href={`tel:${owner.contact.phone}`} className="flex items-center gap-3 p-3.5 rounded-2xl text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ background: '#f97316' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/20 shrink-0"><Phone className="w-4 h-4" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-white/60">Call</p>
                      <p className="truncate">{owner.contact.phone}</p>
                    </div>
                  </a>
                )}
                {owner.contact.whatsapp && (
                  <a href={`https://wa.me/${owner.contact.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3.5 rounded-2xl text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ background: '#22C55E' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/20 shrink-0"><MessageCircle className="w-4 h-4" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-white/60">WhatsApp</p>
                      <p>Chat instantly</p>
                    </div>
                  </a>
                )}
                {owner.contact.email && (
                  <a href={`mailto:${owner.contact.email}`} className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 text-slate-700 font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] hover:border-slate-300">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 shrink-0"><Mail className="w-4 h-4 text-slate-600" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Email</p>
                      <p>Send a message</p>
                    </div>
                  </a>
                )}
              </div>
            )}
            {!hasContact && (
              <p className="text-xs text-slate-400 text-center py-2">No direct contact method available — please use the report form below.</p>
            )}
          </div>
        </div>

        {/* Location permission prompt (lost only) */}
        {isLost && locationStatus === 'idle' && (
          <div className="bg-white rounded-3xl shadow-lg p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#FFF5EB' }}>
                <MapPinned className="w-5 h-5" style={{ color: '#f97316' }} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-slate-900">Share your location?</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Help the owner recover {assetData.name} by sharing your current location. Your browser will ask for permission — nothing is shared without your approval.</p>
              </div>
            </div>
            <button onClick={requestLocation} className="w-full rounded-xl font-bold h-11 text-white flex items-center justify-center gap-2 text-sm" style={{ background: '#0b2149' }}>
              <MapPin className="w-4 h-4" /> Share my location
            </button>
          </div>
        )}
        {isLost && locationStatus === 'prompted' && (
          <div className="bg-white rounded-2xl shadow-lg p-4 flex items-center gap-3">
            <Loader2 className="w-4 h-4 animate-spin text-orange-500 shrink-0" />
            <p className="text-xs font-semibold text-slate-600">Waiting for browser permission…</p>
          </div>
        )}
        {isLost && locationStatus === 'granted' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-emerald-800">Location shared — thank you!</p>
              <p className="text-xs text-emerald-600 mt-0.5">Your approximate location will be sent to the owner with your report.</p>
            </div>
          </div>
        )}
        {isLost && (locationStatus === 'denied' || locationStatus === 'unsupported') && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
            <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
            <p className="text-xs text-slate-500">No problem — you can still submit a report without sharing location.</p>
          </div>
        )}

        {/* Found report form (lost only) */}
        {isLost && (
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <h2 className="font-black text-slate-900 text-base mb-1">{isPet ? 'I Found This Pet' : 'I Found This Item'}</h2>
            <p className="text-slate-400 text-xs mb-4">Leave your details so the owner can contact you to arrange the return.</p>
            <form onSubmit={handleSubmit} className="space-y-3 text-slate-900">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Your Name</label>
                <Input placeholder="Enter your name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="rounded-xl bg-white text-slate-900 placeholder:text-slate-400 border-slate-200 caret-slate-900 focus-visible:ring-orange-500/30 focus-visible:border-orange-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input placeholder="+1 (555) 000-0000" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="pl-9 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 border-slate-200 caret-slate-900 focus-visible:ring-orange-500/30 focus-visible:border-orange-400" type="tel" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input placeholder="your@email.com" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="pl-9 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 border-slate-200 caret-slate-900 focus-visible:ring-orange-500/30 focus-visible:border-orange-400" type="email" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Where did you find it?</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input placeholder="e.g. Outside Starbucks on 5th Ave" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} className="pl-9 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 border-slate-200 caret-slate-900 focus-visible:ring-orange-500/30 focus-visible:border-orange-400" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Message to owner (optional)</label>
                <Textarea placeholder="e.g. I found your pet near the park. They're safe with me." value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} className="rounded-xl resize-none bg-white text-slate-900 placeholder:text-slate-400 border-slate-200 caret-slate-900 focus-visible:ring-orange-500/30 focus-visible:border-orange-400" rows={3} />
              </div>
              <Button type="submit" disabled={submitting || (!form.name && !form.phone && !form.email)} className="w-full rounded-xl font-bold gap-2 h-12" style={{ background: '#f97316' }}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting ? 'Sending…' : 'Send Report'}
              </Button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-3 gap-1 border-t border-white/[.08] pt-5">
          {footerSignals.map(({ Icon, title, subtitle, infinity }, index) => (
            <div key={`lost-${title}-${index}`} className={`${index === 1 ? 'border-x border-white/[.08]' : ''} px-1 text-center`}>
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-blue-300/20 bg-white/[.04]">
                {infinity ? <InfinityMark size={21} color="#fff" strokeWidth={2.2} /> : <Icon className="h-4.5 w-4.5 text-white/80" />}
              </div>
              <p className="text-[9px] font-black uppercase tracking-wide text-white/70">{title}</p>
              <p className="mt-1 text-[9px] leading-tight text-white/35">{subtitle}</p>
            </div>
          ))}
        </div>
        <div className="pt-5 pb-3 text-center">
          <div className="flex items-center justify-center gap-1 opacity-80"><span className="text-white font-black text-lg tracking-[-0.04em]">Bing</span><InfinityMark size={25} color="#f97316" strokeWidth={3.4} /></div>
          <p className="mt-1 text-[9px] font-bold uppercase tracking-[.28em] text-white/35">Assets That Stay Closer</p>
        </div>
      </div>
    </div>
  );
}