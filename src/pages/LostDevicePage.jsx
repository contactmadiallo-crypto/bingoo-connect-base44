import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Phone, Mail, MapPin, Send, CheckCircle2, Loader2 } from "lucide-react";
import PublicFooter from "@/components/bingoo/PublicFooter";

export default function LostDevicePage({ deviceCodeProp, deviceProp, profileProp } = {}) {
  const params = useParams();
  const rawCode = deviceCodeProp || params.deviceCode;
  const normalizedCode = rawCode?.toUpperCase();

  const [form, setForm] = useState({ name: "", phone: "", email: "", location: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [geoLocation, setGeoLocation] = useState(null);

  // Try to get approximate GPS location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setGeoLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  // Use props if provided (from NFCRedirect), otherwise fetch
  const { data: deviceData, isLoading } = useQuery({
    queryKey: ["lost-device", normalizedCode],
    queryFn: () => base44.functions.invoke("getDeviceByCode", { device_code: normalizedCode }),
    enabled: !!normalizedCode && !deviceProp,
  });

  const device = deviceProp || deviceData?.data?.device;
  // getDeviceByCode now returns profile directly in its response
  const profile = profileProp || deviceData?.data?.profile;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Save finder report
      await base44.entities.LostItemReport.create({
        device_code: normalizedCode,
        device_id: device?.id,
        owner_profile_id: device?.profile_id,
        finder_name: form.name,
        finder_phone: form.phone,
        finder_email: form.email,
        finder_location: form.location,
        finder_message: form.message,
        latitude: geoLocation?.lat || null,
        longitude: geoLocation?.lng || null,
        scan_time: new Date().toISOString(),
        status: "new",
      });

      // Notify owner by email
      if (profile?.email || profile?.created_by_email) {
        await base44.functions.invoke("notifyLostDeviceFound", {
          owner_email: profile.email,
          owner_name: profile.display_name,
          device_code: normalizedCode,
          finder_name: form.name,
          finder_phone: form.phone,
          finder_email: form.email,
          finder_location: form.location,
          finder_message: form.message,
        });
      }

      setSubmitted(true);
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Show privacy-controlled info
  const showPhone = device?.lost_show_phone && profile?.phone;
  const ownerPhone = showPhone ? profile.phone : null;

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-slate-100 px-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
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
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-slate-100 px-4 py-8">
      <div className="max-w-sm mx-auto space-y-4">

        {/* Lost Header */}
        <div className="bg-gradient-to-br from-amber-500 to-red-500 rounded-3xl p-6 text-white text-center shadow-xl shadow-amber-200">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-xl font-black mb-1">Lost Item Found?</h1>
          <p className="text-white/85 text-sm">This item has been reported lost.</p>
          <p className="text-white/70 text-xs mt-1">If you found this item, please help return it.</p>
          <div className="bg-white/15 rounded-xl px-3 py-1.5 inline-block mt-3">
            <span className="text-xs font-mono font-bold">{normalizedCode}</span>
          </div>
        </div>

        {/* Call Owner Button */}
        {ownerPhone && (
          <a href={`tel:${ownerPhone}`} className="block">
            <div className="bg-green-600 hover:bg-green-500 transition-colors rounded-2xl p-4 flex items-center gap-3 text-white cursor-pointer shadow-md shadow-green-200">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm">Call Owner</p>
                <p className="text-white/70 text-xs">Tap to call directly</p>
              </div>
            </div>
          </a>
        )}

        {/* Finder Form */}
        <div className="bg-white rounded-3xl shadow-md p-6">
          <h2 className="font-black text-slate-900 text-base mb-1">Report Found Item</h2>
          <p className="text-slate-400 text-xs mb-4">Fill in your details to help the owner find their item.</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Your Name</label>
              <Input
                placeholder="Enter your name"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="+1 (555) 000-0000"
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  className="pl-9 rounded-xl"
                  type="tel"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="pl-9 rounded-xl"
                  type="email"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Where Did You Find It?</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="e.g. Central Park, NYC"
                  value={form.location}
                  onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                  className="pl-9 rounded-xl"
                />
              </div>
              {geoLocation && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> GPS location captured automatically
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Message to Owner (optional)</label>
              <Textarea
                placeholder="e.g. I found your card at the coffee shop. I'll hold it for you."
                value={form.message}
                onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                className="rounded-xl resize-none"
                rows={3}
              />
            </div>

            <Button
              type="submit"
              disabled={submitting || (!form.name && !form.phone && !form.email)}
              className="w-full rounded-xl bg-gradient-to-r from-[#0b2149] to-[#13284f] text-white font-bold gap-2 h-12"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {submitting ? "Sending..." : "Send Recovery Message"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 pb-2">Powered by Bingoo Connect</p>
        <PublicFooter />
      </div>
    </div>
  );
}