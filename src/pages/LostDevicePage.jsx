import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle, Phone, Mail, MapPin, Send, CheckCircle2, Loader2,
  MessageCircle, ShieldCheck, MapPinned,
} from "lucide-react";
import BingooLogo from "@/components/bingoo/BingooLogo";
import PublicFooter from "@/components/bingoo/PublicFooter";
import { useLostScanLogger } from "@/hooks/useLostScanLogger";
import { getDeviceDisplayName } from "@/lib/deviceTypes";

export default function LostDevicePage({ deviceCodeProp, deviceProp, profileProp } = {}) {
  const params = useParams();
  const rawCode = deviceCodeProp || params.deviceCode;
  const normalizedCode = rawCode?.toUpperCase().trim();

  const [form, setForm] = useState({ name: "", phone: "", email: "", location: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { data: deviceData, isLoading } = useQuery({
    queryKey: ["lost-device", normalizedCode],
    queryFn: () => base44.functions.invoke("getDeviceByCode", { device_code: normalizedCode }),
    enabled: !!normalizedCode && !deviceProp,
  });

  const device = deviceProp || deviceData?.data?.device;
  const profile = profileProp || deviceData?.data?.profile;

  // Automatic scan-event report + owner notification (only for lost devices).
  const { reportId, locationStatus, preciseLocation, requestLocation } = useLostScanLogger({
    deviceCode: normalizedCode,
    enabled: !isLoading && !!device && device.status === "lost",
    scanSource: "nfc",
  });

  const showPhone = device?.lost_show_phone && profile?.phone;
  const showWhatsapp = !!profile?.whatsapp_number;
  const showEmail = !!profile?.email;
  const hasContact = showPhone || showWhatsapp || showEmail;
  const productLabel = device ? getDeviceDisplayName(device) : "Bingoo Device";
  const assignedName = profile?.display_name || profile?.company_name || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await base44.functions.invoke("notifyLostDeviceFound", {
        device_code: normalizedCode,
        report_id: reportId || null,
        finder_name: form.name,
        finder_phone: form.phone,
        finder_email: form.email,
        finder_location: form.location,
        finder_message: form.message,
        latitude: preciseLocation?.lat ?? null,
        longitude: preciseLocation?.lng ?? null,
        scan_source: "nfc",
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(160deg, #071A3D 0%, #0b2149 60%, #13284f 100%)" }}>
        <div className="text-center">
          <BingooLogo className="w-14 h-14 mx-auto mb-4" animated />
          <p className="text-white/60 font-semibold text-sm">Checking device…</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(160deg, #071A3D 0%, #0b2149 60%, #13284f 100%)" }}>
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Thank You! 🙏</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Your report has been sent to the owner. They will contact you soon. You're doing a great thing by helping return this item!
          </p>
          <p className="text-xs text-slate-400 mt-4">Powered by Bingoo Connect</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10" style={{ background: "linear-gradient(160deg, #071A3D 0%, #0b2149 55%, #13284f 100%)" }}>
      <div className="max-w-md mx-auto px-4 pt-6 space-y-4">

        {/* Brand header */}
        <div className="flex items-center gap-2.5">
          <BingooLogo className="w-9 h-9" animated={false} />
          <div>
            <p className="text-white font-black text-sm leading-none">Bingoo Connect</p>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mt-0.5">Lost Item Recovery</p>
          </div>
        </div>

        {/* Lost banner */}
        <div className="rounded-3xl p-6 text-center shadow-xl" style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" }}>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-xl font-black text-white mb-1">This item has been reported lost</h1>
          <p className="text-white/85 text-sm">If you found this item, please help return it to its owner.</p>
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-xl px-3 py-1.5 mt-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">Code</span>
            <span className="text-xs font-mono font-black text-white">{normalizedCode}</span>
          </div>
        </div>

        {/* Device info card */}
        <div className="bg-white rounded-3xl shadow-lg p-5 space-y-3">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#FFF5EB" }}>
              <ShieldCheck className="w-5 h-5" style={{ color: "#f97316" }} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Device</p>
              <p className="text-sm font-black text-slate-900 truncate">{productLabel}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Device Code</p>
              <p className="text-xs font-mono font-black text-slate-900 mt-0.5">{normalizedCode}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned To</p>
              <p className="text-xs font-black text-slate-900 mt-0.5 truncate">{assignedName || "—"}</p>
            </div>
          </div>
        </div>

        {/* Owner contact options */}
        {hasContact && (
          <div className="bg-white rounded-3xl shadow-lg p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Contact the owner</p>
            <div className="space-y-2.5">
              {showPhone && (
                <a href={`tel:${profile.phone}`} className="flex items-center gap-3 p-3.5 rounded-2xl text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ background: "#f97316" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/20 shrink-0"><Phone className="w-4 h-4" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-white/60">Call</p>
                    <p className="truncate">{profile.phone}</p>
                  </div>
                </a>
              )}
              {showWhatsapp && (
                <a href={`https://wa.me/${profile.whatsapp_number.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3.5 rounded-2xl text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ background: "#22C55E" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/20 shrink-0"><MessageCircle className="w-4 h-4" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-white/60">WhatsApp</p>
                    <p className="truncate">Chat instantly</p>
                  </div>
                </a>
              )}
              {showEmail && (
                <a href={`mailto:${profile.email}`} className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 text-slate-700 font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] hover:border-slate-300">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 shrink-0"><Mail className="w-4 h-4 text-slate-600" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Email</p>
                    <p className="truncate">{profile.email}</p>
                  </div>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Safe instructions */}
        <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
            <p className="text-white/75 text-xs leading-relaxed">
              You're helping return a lost item. Contact the owner using the options above, or leave a message below. Your details are shared only with the owner.
            </p>
          </div>
        </div>

        {/* Location permission prompt */}
        {locationStatus === "idle" && (
          <div className="bg-white rounded-3xl shadow-lg p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#FFF5EB" }}>
                <MapPinned className="w-5 h-5" style={{ color: "#f97316" }} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-slate-900">Share your location?</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Help the owner recover this item by sharing your current location. We'll ask your browser for permission — nothing is shared without your approval.</p>
              </div>
            </div>
            <Button onClick={requestLocation} className="w-full rounded-xl font-bold h-11" style={{ background: "#0b2149" }}>
              <MapPin className="w-4 h-4" /> Share my location
            </Button>
          </div>
        )}
        {locationStatus === "prompted" && (
          <div className="bg-white rounded-2xl shadow-lg p-4 flex items-center gap-3">
            <Loader2 className="w-4 h-4 animate-spin text-orange-500 shrink-0" />
            <p className="text-xs font-semibold text-slate-600">Waiting for browser permission…</p>
          </div>
        )}
        {locationStatus === "granted" && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-emerald-800">Location shared — thank you!</p>
              <p className="text-xs text-emerald-600 mt-0.5">Your approximate location will be sent to the owner with your report.</p>
            </div>
          </div>
        )}
        {locationStatus === "denied" && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
            <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
            <p className="text-xs text-slate-500">No problem — you can still submit a report without sharing location.</p>
          </div>
        )}
        {locationStatus === "unsupported" && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
            <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
            <p className="text-xs text-slate-500">Location sharing isn't available on this device. You can still submit a report.</p>
          </div>
        )}

        {/* Finder report form */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h2 className="font-black text-slate-900 text-base mb-1">Report Found Item</h2>
          <p className="text-slate-400 text-xs mb-4">Fill in your details to help the owner find their item.</p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Your Name</label>
              <Input placeholder="Enter your name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="+1 (555) 000-0000" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="pl-9 rounded-xl" type="tel" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="your@email.com" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="pl-9 rounded-xl" type="email" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Where did you find it?</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="e.g. Central Park, NYC" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} className="pl-9 rounded-xl" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Message to owner (optional)</label>
              <Textarea placeholder="e.g. I found your card at the coffee shop. I'll hold it for you." value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} className="rounded-xl resize-none" rows={3} />
            </div>
            <Button type="submit" disabled={submitting || (!form.name && !form.phone && !form.email)} className="w-full rounded-xl font-bold gap-2 h-12" style={{ background: "#f97316" }}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {submitting ? "Sending…" : "Send Recovery Message"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-white/40 pb-2">Powered by Bingoo Connect</p>
        <PublicFooter />
      </div>
    </div>
  );
}