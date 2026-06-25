import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft, Eye, QrCode, Copy, Check, Download, Info, Link2,
  Palette, Share2, Settings, ExternalLink, MapPin, Phone, Mail,
  Globe, Plus, Trash2, GripVertical, ToggleLeft, ToggleRight, Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DesignTab from "@/components/bingoo/DesignTab";
import LivePreviewPanel from "@/components/bingoo/LivePreviewPanel";
import LayoutPicker from "@/components/bingoo/LayoutPicker";
import { usePlan } from "@/hooks/usePlan";
import { useBingooTheme } from "@/hooks/useBingooTheme";
import { useToast } from "@/components/ui/use-toast";

const INNER_TABS = [
  { id: "info",     label: "Info",     icon: Info },
  { id: "links",    label: "Links",    icon: Link2 },
  { id: "design",   label: "Design",   icon: Palette },
  { id: "share",    label: "Share",    icon: Share2 },
  { id: "settings", label: "Settings", icon: Settings },
];

const COVER_COLORS = ["#2563eb","#0B2E6B","#1a4a9e","#7c3aed","#db2777","#059669","#d97706","#dc2626","#0891b2","#1e293b","#374151","#FF7A00"];

export default function ProfileWorkspace({ profileId, user, onBack, isDark, isLawFirm, isSalon }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { canAccess, plan: userPlan } = usePlan();
  const [innerTab, setInnerTab] = useState("info");
  const [liveForm, setLiveForm] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile-ws", profileId],
    queryFn: () => base44.entities.Profile.get(profileId),
    enabled: !!profileId,
  });

  // Sync form when profile loads
  useEffect(() => {
    if (profile) setLiveForm({ ...profile });
  }, [profile?.id]);

  const profileUrl = profile ? `${window.location.origin}/p/${profile.username}` : null;
  const profileQrUrl = profileUrl ? `${profileUrl}?source=qr` : null;

  const copyUrl = () => {
    if (!profileUrl) return;
    navigator.clipboard.writeText(profileUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const downloadQR = async () => {
    if (!profileQrUrl) return;
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(profileQrUrl)}&color=1e293b&bgcolor=ffffff`;
    const img = new Image(); img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 400; canvas.height = 460;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, 400, 460);
      ctx.drawImage(img, 0, 0, 400, 400);
      ctx.fillStyle = "#0B2E6B"; ctx.fillRect(0, 400, 400, 60);
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 16px system-ui,sans-serif";
      ctx.textAlign = "center"; ctx.fillText("bingooconnect.com", 200, 433);
      ctx.fillStyle = "#FF7A00"; ctx.font = "bold 13px system-ui,sans-serif";
      ctx.fillText("Scan to connect", 200, 452);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `bingoo-qr-${profile?.username}.png`;
      a.click();
    };
    img.src = qrSrc;
  };

  const saveInfo = useMutation({
    mutationFn: () => base44.entities.Profile.update(profileId, liveForm),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile-ws", profileId] });
      qc.invalidateQueries({ queryKey: ["my-profile"] });
      toast({ title: "Saved", description: "Profile updated successfully." });
    },
    onError: () => toast({ title: "Error", description: "Failed to save.", variant: "destructive" }),
  });

  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/40" : "text-slate-400";
  const subText = isDark ? "text-white/60" : "text-slate-600";
  const panelBg = isDark ? "bg-[#13162a]" : "bg-white";
  const panelBorder = isDark ? "border-white/8" : "border-slate-200";
  const inputCls = `border-slate-200 ${isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/30" : ""}`;

  if (isLoading || !liveForm) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const set = (k) => (e) => setLiveForm(f => ({ ...f, [k]: e.target.value }));
  const setVal = (k, v) => setLiveForm(f => ({ ...f, [k]: v }));

  // ── Inner panels ──

  const InfoPanel = () => (
    <div className="space-y-5">
      <div className={`rounded-2xl border ${panelBorder} ${panelBg} overflow-hidden`}>
        {/* Cover preview + upload */}
        <div className="h-28 relative cursor-pointer group"
          style={{
            backgroundColor: liveForm.cover_color || "#2563eb",
            backgroundImage: liveForm.cover_photo ? `url(${liveForm.cover_photo})` : undefined,
            backgroundSize: "cover", backgroundPosition: "center"
          }}>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
            <label className="cursor-pointer opacity-0 group-hover:opacity-100 transition-all bg-white/90 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg">
              Change Cover
              <input type="file" accept="image/*" className="hidden" onChange={async e => {
                const file = e.target.files[0]; if (!file) return;
                const { file_url } = await base44.integrations.Core.UploadFile({ file });
                setVal("cover_photo", file_url);
              }} />
            </label>
          </div>
          <div className="absolute top-3 right-3 flex gap-1.5">
            {COVER_COLORS.map(c => (
              <button key={c} onClick={() => setVal("cover_color", c)}
                className={`w-4 h-4 rounded-full border-2 transition-transform hover:scale-125 ${liveForm.cover_color === c ? "border-white scale-125" : "border-white/40"}`}
                style={{ background: c }} />
            ))}
          </div>
        </div>

        <div className="px-5 pb-5 pt-2">
          {/* Avatar */}
          <div className="flex items-end gap-4 -mt-10 mb-5">
            <div className="relative flex-shrink-0">
              {liveForm.profile_photo
                ? <img src={liveForm.profile_photo} className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg object-cover" alt="" />
                : <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center text-2xl font-black text-white"
                    style={{ background: liveForm.cover_color || "#2563eb" }}>{liveForm.display_name?.charAt(0) || "?"}</div>
              }
              <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer shadow-md">
                <Plus className="w-3.5 h-3.5 text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={async e => {
                  const file = e.target.files[0]; if (!file) return;
                  const { file_url } = await base44.integrations.Core.UploadFile({ file });
                  setVal("profile_photo", file_url);
                }} />
              </label>
            </div>
            <div className="pb-1">
              <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide bg-blue-50 text-blue-700">
                {profile.plan || "Free"}
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className={`text-xs font-semibold ${mutedText}`}>Display Name *</Label>
              <Input className={`mt-1 ${inputCls}`} value={liveForm.display_name || ""} onChange={set("display_name")} placeholder="Your Name" />
            </div>
            <div>
              <Label className={`text-xs font-semibold ${mutedText}`}>Job Title</Label>
              <Input className={`mt-1 ${inputCls}`} value={liveForm.job_title || ""} onChange={set("job_title")} placeholder="CEO / Consultant" />
            </div>
            <div>
              <Label className={`text-xs font-semibold ${mutedText}`}>Company</Label>
              <Input className={`mt-1 ${inputCls}`} value={liveForm.company_name || ""} onChange={set("company_name")} placeholder="Company Name" />
            </div>
            <div>
              <Label className={`text-xs font-semibold ${mutedText}`}>Location</Label>
              <Input className={`mt-1 ${inputCls}`} value={liveForm.location || ""} onChange={set("location")} placeholder="City, State" />
            </div>
            <div>
              <Label className={`text-xs font-semibold ${mutedText}`}>Phone</Label>
              <Input className={`mt-1 ${inputCls}`} value={liveForm.phone || ""} onChange={set("phone")} placeholder="+1 555 000 0000" />
            </div>
            <div>
              <Label className={`text-xs font-semibold ${mutedText}`}>WhatsApp</Label>
              <Input className={`mt-1 ${inputCls}`} value={liveForm.whatsapp_number || ""} onChange={set("whatsapp_number")} placeholder="+1 555 000 0000" />
            </div>
            <div>
              <Label className={`text-xs font-semibold ${mutedText}`}>Email</Label>
              <Input type="email" className={`mt-1 ${inputCls}`} value={liveForm.email || ""} onChange={set("email")} placeholder="you@example.com" />
            </div>
            <div>
              <Label className={`text-xs font-semibold ${mutedText}`}>Website</Label>
              <Input className={`mt-1 ${inputCls}`} value={liveForm.website || ""} onChange={set("website")} placeholder="https://yoursite.com" />
            </div>
            <div className="sm:col-span-2">
              <Label className={`text-xs font-semibold ${mutedText}`}>Bio</Label>
              <Textarea className={`mt-1 ${inputCls}`} rows={3} value={liveForm.bio || ""} onChange={set("bio")} placeholder="A short description about you or your business..." />
            </div>
            {/* Social links */}
            <div>
              <Label className={`text-xs font-semibold ${mutedText}`}>Instagram</Label>
              <Input className={`mt-1 ${inputCls}`} value={liveForm.instagram_url || ""} onChange={set("instagram_url")} placeholder="https://instagram.com/..." />
            </div>
            <div>
              <Label className={`text-xs font-semibold ${mutedText}`}>LinkedIn</Label>
              <Input className={`mt-1 ${inputCls}`} value={liveForm.linkedin_url || ""} onChange={set("linkedin_url")} placeholder="https://linkedin.com/in/..." />
            </div>
            <div>
              <Label className={`text-xs font-semibold ${mutedText}`}>Facebook</Label>
              <Input className={`mt-1 ${inputCls}`} value={liveForm.facebook_url || ""} onChange={set("facebook_url")} placeholder="https://facebook.com/..." />
            </div>
            <div>
              <Label className={`text-xs font-semibold ${mutedText}`}>TikTok</Label>
              <Input className={`mt-1 ${inputCls}`} value={liveForm.tiktok_url || ""} onChange={set("tiktok_url")} placeholder="https://tiktok.com/@..." />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={() => saveInfo.mutate()} disabled={saveInfo.isPending}
          className="rounded-xl font-bold text-white px-8"
          style={{ background: "#FF7A00" }}>
          {saveInfo.isPending ? "Saving…" : <><Save className="w-4 h-4 mr-1.5" /> Save Info</>}
        </Button>
        <Button variant="outline" onClick={() => setLiveForm({ ...profile })}
          className={`rounded-xl font-bold ${isDark ? "border-white/15 text-white/60 hover:bg-white/8" : ""}`}>
          Cancel
        </Button>
      </div>
    </div>
  );

  const LinksPanel = () => {
    const [newLink, setNewLink] = useState({ label: "", url: "", enabled: true });
    const links = liveForm.custom_links || [];

    const addLink = () => {
      if (!newLink.label || !newLink.url) return;
      setVal("custom_links", [...links, { ...newLink, id: Date.now().toString() }]);
      setNewLink({ label: "", url: "", enabled: true });
    };

    const toggleLink = (idx) => {
      const updated = links.map((l, i) => i === idx ? { ...l, enabled: !l.enabled } : l);
      setVal("custom_links", updated);
    };

    const removeLink = (idx) => {
      setVal("custom_links", links.filter((_, i) => i !== idx));
    };

    return (
      <div className="space-y-4">
        {/* Lead Capture toggle */}
        <div className={`flex items-center justify-between p-4 rounded-2xl border ${panelBorder} ${panelBg}`}>
          <div>
            <p className={`font-bold text-sm ${headText}`}>Lead Capture Mode</p>
            <p className={`text-xs mt-0.5 ${mutedText}`}>Show a contact form on your profile to capture visitor info</p>
          </div>
          <button onClick={() => setVal("booking_enabled", !liveForm.booking_enabled)}
            className={`w-11 h-6 rounded-full relative transition-colors flex-shrink-0 ${liveForm.booking_enabled ? "bg-orange-500" : "bg-slate-300"}`}>
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${liveForm.booking_enabled ? "left-5" : "left-0.5"}`} />
          </button>
        </div>

        {/* Add link */}
        <div className={`p-4 rounded-2xl border ${panelBorder} ${panelBg} space-y-3`}>
          <p className={`font-bold text-sm ${headText}`}>Add Link</p>
          <div className="flex gap-2">
            <Input className={`flex-1 ${inputCls}`} placeholder="Label (e.g. Portfolio)" value={newLink.label}
              onChange={e => setNewLink(l => ({ ...l, label: e.target.value }))} />
            <Input className={`flex-1 ${inputCls}`} placeholder="https://..." value={newLink.url}
              onChange={e => setNewLink(l => ({ ...l, url: e.target.value }))} />
            <button onClick={addLink}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all"
              style={{ background: "#0B2E6B" }}>
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>

        {/* Links list */}
        <div className={`rounded-2xl border ${panelBorder} ${panelBg} overflow-hidden`}>
          {links.length === 0 ? (
            <div className={`py-10 text-center ${mutedText} text-sm`}>No links yet — add one above.</div>
          ) : (
            <div className="divide-y" style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9" }}>
              {links.map((link, idx) => (
                <div key={idx} className={`flex items-center gap-3 px-4 py-3 ${!link.enabled ? "opacity-50" : ""}`}>
                  <GripVertical className={`w-4 h-4 flex-shrink-0 ${mutedText}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${headText}`}>{link.label}</p>
                    <p className={`text-xs truncate ${mutedText}`}>{link.url}</p>
                  </div>
                  <button onClick={() => toggleLink(idx)}
                    className={`w-9 h-5 rounded-full relative transition-colors flex-shrink-0 ${link.enabled ? "bg-orange-500" : "bg-slate-300"}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${link.enabled ? "left-4" : "left-0.5"}`} />
                  </button>
                  <button onClick={() => removeLink(idx)} className="text-red-400 hover:text-red-600 p-1 flex-shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button onClick={() => saveInfo.mutate()} disabled={saveInfo.isPending}
          className="rounded-xl font-bold text-white px-8" style={{ background: "#FF7A00" }}>
          {saveInfo.isPending ? "Saving…" : <><Save className="w-4 h-4 mr-1.5" /> Save Links</>}
        </Button>
      </div>
    );
  };

  const DesignPanel = () => (
    <div className="space-y-5">
      <div className={`rounded-2xl border ${panelBorder} ${panelBg} p-5 space-y-5`}>
        <div>
          <Label className={`text-xs font-semibold ${mutedText} mb-2 block`}>Accent Color</Label>
          <div className="flex gap-2 flex-wrap">
            {COVER_COLORS.map(c => (
              <button key={c} onClick={() => setVal("cover_color", c)}
                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${liveForm.cover_color === c ? "border-slate-900 scale-110" : "border-transparent"}`}
                style={{ background: c }} />
            ))}
          </div>
        </div>

        <div>
          <Label className={`text-xs font-semibold ${mutedText} mb-2 block`}>Background Style</Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { v: "clean",    label: "Clean White",   desc: "Simple & neutral" },
              { v: "gradient", label: "Soft Gradient",  desc: "Colour wash" },
              { v: "mesh",     label: "Mesh",           desc: "Dual tone blend" },
              { v: "night",    label: "Night",          desc: "Dark atmosphere" },
            ].map(o => (
              <button key={o.v} onClick={() => setVal("bg_style", o.v)}
                className={`flex flex-col p-3 rounded-xl border-2 text-left transition-all ${liveForm.bg_style === o.v ? "border-orange-400 bg-orange-50" : `border-slate-100 ${isDark ? "hover:border-white/20" : "hover:border-slate-300"}`}`}>
                <p className={`text-xs font-bold ${liveForm.bg_style === o.v ? "text-orange-600" : headText}`}>{o.label}</p>
                <p className={`text-[11px] ${mutedText}`}>{o.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className={`text-xs font-semibold ${mutedText} mb-2 block`}>Button Style</Label>
          <div className="flex gap-2">
            {[{ v: "pill", label: "Pill" }, { v: "rounded", label: "Rounded" }, { v: "sharp", label: "Sharp" }].map(o => (
              <button key={o.v} onClick={() => setVal("button_style", o.v)}
                className={`flex-1 py-2 text-xs font-bold border-2 transition-all ${liveForm.button_style === o.v ? "border-orange-400 bg-orange-50 text-orange-600" : "border-slate-100 text-slate-500 hover:border-slate-300"}`}
                style={{ borderRadius: o.v === "pill" ? 999 : o.v === "sharp" ? 6 : 12 }}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className={`text-xs font-semibold ${mutedText} mb-2 block`}>Profile Layout</Label>
          <LayoutPicker value={liveForm.layout || "classic"} onChange={v => setVal("layout", v)}
            color={liveForm.cover_color} plan={userPlan || profile?.plan || "free"}
            isAdmin={user?.role === "admin"} />
        </div>
      </div>

      <Button onClick={() => saveInfo.mutate()} disabled={saveInfo.isPending}
        className="rounded-xl font-bold text-white px-8" style={{ background: "#FF7A00" }}>
        {saveInfo.isPending ? "Saving…" : <><Save className="w-4 h-4 mr-1.5" /> Save Design</>}
      </Button>
    </div>
  );

  const SharePanel = () => {
    const qrPreviewUrl = profileQrUrl
      ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(profileQrUrl)}&color=${isDark ? "ffffff" : "1e293b"}&bgcolor=${isDark ? "1e293b" : "f8fafc"}`
      : null;

    return (
      <div className="space-y-4">
        <div className={`rounded-2xl border ${panelBorder} ${panelBg} p-5`}>
          <p className={`font-bold text-sm ${headText} mb-3`}>Profile Link</p>
          <div className="flex gap-2">
            <input readOnly value={profileUrl || ""}
              className={`flex-1 px-3 py-2 rounded-xl border text-xs font-mono ${isDark ? "bg-white/5 border-white/10 text-white/70" : "bg-slate-50 border-slate-200 text-slate-600"}`} />
            <button onClick={copyUrl}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all"
              style={{ background: copiedUrl ? "#059669" : "#0B2E6B" }}>
              {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedUrl ? "Copied!" : "Copy"}
            </button>
            {profileUrl && (
              <a href={profileUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-xl border transition-all"
                style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#eff6ff", borderColor: isDark ? "rgba(255,255,255,0.1)" : "#bfdbfe", color: "#2563eb" }}>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        <div className={`rounded-2xl border ${panelBorder} ${panelBg} p-5 text-center`}>
          <p className={`font-bold text-sm ${headText} mb-4`}>QR Code</p>
          {qrPreviewUrl ? (
            <>
              <div className={`inline-block p-4 rounded-2xl mb-3 ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
                <img src={qrPreviewUrl} alt="QR Code" className="w-36 h-36 rounded-xl mx-auto" />
              </div>
              <p className={`text-xs mb-3 ${mutedText}`}>Scan to open your profile</p>
              <Button onClick={downloadQR}
                className="rounded-xl font-bold gap-2 text-white"
                style={{ background: "#0B2E6B" }}>
                <Download className="w-4 h-4" /> Download QR
              </Button>
            </>
          ) : (
            <p className={`text-sm ${mutedText}`}>Set a username to generate a QR code.</p>
          )}
        </div>
      </div>
    );
  };

  const SettingsPanel = () => (
    <div className="space-y-4">
      <div className={`rounded-2xl border ${panelBorder} ${panelBg} p-5 space-y-4`}>
        <p className={`font-bold text-sm ${headText}`}>Profile URL</p>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-3 py-2 rounded-xl ${isDark ? "bg-white/8 text-white/40" : "bg-slate-100 text-slate-500"}`}>/p/</span>
          <Input className={`${inputCls}`} value={liveForm.username || ""} onChange={e => setVal("username", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
            placeholder="yourusername" />
        </div>
      </div>

      <div className={`rounded-2xl border ${panelBorder} ${panelBg} p-5 space-y-4`}>
        <p className={`font-bold text-sm ${headText}`}>Profile Visibility</p>
        {[
          { key: "is_active", label: "Profile is Live", desc: "Your profile is publicly accessible" },
          { key: "show_location", label: "Show Location", desc: "Display your address on the profile" },
        ].map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold ${headText}`}>{label}</p>
              <p className={`text-xs ${mutedText}`}>{desc}</p>
            </div>
            <button onClick={() => setVal(key, !liveForm[key])}
              className={`w-11 h-6 rounded-full relative transition-colors flex-shrink-0 ${liveForm[key] ? "bg-orange-500" : "bg-slate-300"}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${liveForm[key] ? "left-5" : "left-0.5"}`} />
            </button>
          </div>
        ))}
      </div>

      <div className={`rounded-2xl border ${panelBorder} ${panelBg} p-5 space-y-3`}>
        <p className={`font-bold text-sm ${headText}`}>Payment Links</p>
        {[
          { key: "payment_link", label: "Payment Link", placeholder: "https://paypal.me/..." },
          { key: "zelle_link", label: "Zelle", placeholder: "https://enroll.zellepay.com/..." },
          { key: "cashapp_link", label: "Cash App", placeholder: "https://cash.app/$..." },
          { key: "wave_link", label: "Wave", placeholder: "https://wave.com/..." },
        ].map(({ key, label, placeholder }) => (
          <div key={key}>
            <Label className={`text-xs font-semibold ${mutedText}`}>{label}</Label>
            <Input className={`mt-1 ${inputCls}`} value={liveForm[key] || ""} onChange={set(key)} placeholder={placeholder} />
          </div>
        ))}
      </div>

      <Button onClick={() => saveInfo.mutate()} disabled={saveInfo.isPending}
        className="rounded-xl font-bold text-white px-8" style={{ background: "#FF7A00" }}>
        {saveInfo.isPending ? "Saving…" : <><Save className="w-4 h-4 mr-1.5" /> Save Settings</>}
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* ── Workspace top bar ── */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <button onClick={onBack}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all ${isDark ? "border-white/10 text-white/50 hover:bg-white/8 hover:text-white" : "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}>
          <ChevronLeft className="w-4 h-4" /> Profiles
        </button>

        {/* Profile chip */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {profile.profile_photo
            ? <img src={profile.profile_photo} className="w-9 h-9 rounded-xl object-cover shadow flex-shrink-0" alt="" />
            : <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-sm flex-shrink-0 shadow"
                style={{ background: profile.cover_color || "#2563eb" }}>{profile.display_name?.charAt(0)}</div>
          }
          <div className="min-w-0">
            <p className={`font-bold text-sm truncate ${headText}`}>{profile.display_name}</p>
            <p className={`text-[11px] ${mutedText} truncate`}>/p/{profile.username}</p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide bg-blue-100 text-blue-700 flex-shrink-0">
            {profile.plan || "free"}
          </span>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <a href={profileUrl} target="_blank" rel="noopener noreferrer"
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-all ${isDark ? "border-white/10 text-white/60 hover:bg-white/8" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            <Eye className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Preview</span>
          </a>
          <button onClick={copyUrl}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-all ${isDark ? "border-white/10 text-white/60 hover:bg-white/8" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            {copiedUrl ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedUrl ? "Copied" : "Copy Link"}</span>
          </button>
          <button onClick={() => setInnerTab("share")}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl text-white transition-all hover:opacity-90"
            style={{ background: "#FF7A00" }}>
            <QrCode className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* ── Main workspace layout: inner nav + panel + preview ── */}
      <div className="flex gap-4 flex-1">

        {/* Inner vertical nav */}
        <div className={`hidden md:flex flex-col gap-1 w-36 flex-shrink-0`}>
          {INNER_TABS.map(t => (
            <button key={t.id} onClick={() => setInnerTab(t.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                innerTab === t.id
                  ? (isDark ? "bg-white/10 text-white" : "bg-blue-50 text-blue-700")
                  : (isDark ? "text-white/50 hover:bg-white/5 hover:text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800")
              }`}
              style={innerTab === t.id ? { borderLeft: "3px solid #FF7A00", borderRadius: "0 12px 12px 0" } : {}}>
              <t.icon className="w-4 h-4 flex-shrink-0" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Mobile inner nav (horizontal scrollable pills) */}
        <div className="md:hidden flex gap-2 mb-4 overflow-x-auto scrollbar-hide flex-shrink-0 w-full">
          {INNER_TABS.map(t => (
            <button key={t.id} onClick={() => setInnerTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                innerTab === t.id ? "text-white" : (isDark ? "bg-white/5 text-white/50" : "bg-slate-100 text-slate-500")
              }`}
              style={innerTab === t.id ? { background: "#0B2E6B" } : {}}>
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Panel + preview wrapper */}
        <div className="flex gap-4 flex-1 min-w-0">
          {/* Editing panel */}
          <div className="flex-1 min-w-0 overflow-y-auto max-h-[calc(100vh-220px)]">
            {innerTab === "info"     && <InfoPanel />}
            {innerTab === "links"    && <LinksPanel />}
            {innerTab === "design"   && <DesignPanel />}
            {innerTab === "share"    && <SharePanel />}
            {innerTab === "settings" && <SettingsPanel />}
          </div>

          {/* Live preview — desktop only */}
          <div className="hidden xl:block w-72 flex-shrink-0">
            <div className="sticky top-0">
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${mutedText}`}>Live Preview</p>
              <div className="rounded-2xl overflow-hidden shadow-xl" style={{ border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}` }}>
                <LivePreviewPanel
                  key={profileId}
                  profile={profile}
                  pendingProfile={{ ...profile, ...liveForm }}
                  hasChanges={true}
                  isDark={isDark}
                  previewMode="profile"
                  isLawFirm={isLawFirm}
                  compact={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}