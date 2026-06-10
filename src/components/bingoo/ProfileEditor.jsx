import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Camera, Trash2, Eye, Image, QrCode, Plus, X } from "lucide-react";
import LayoutPicker from "./LayoutPicker";
import BusinessHoursEditor from "./BusinessHoursEditor";
import LivePreviewPanel from "./LivePreviewPanel";

const COVER_COLORS = ["#2563eb","#7c3aed","#db2777","#d97706","#16a34a","#0891b2","#dc2626","#1e293b"];

const isValidUrl = (v) => { try { new URL(v); return true; } catch { return false; } };
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function ProfileEditor({ user, onSaved, editProfileId, prefillData }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [zelleQrUploading, setZelleQrUploading] = useState(false);
  const [cashappQrUploading, setCashappQrUploading] = useState(false);
  const [orangemoneyQrUploading, setOrangemoneyQrUploading] = useState(false);
  const [waveQrUploading, setWaveQrUploading] = useState(false);
  const [customQrUploading, setCustomQrUploading] = useState({});
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    username: "", display_name: "", job_title: "", company_name: "", bio: "",
    cover_color: "#2563eb", profile_photo: "", cover_photo: "", company_logo: "", layout: "classic",
    phone: "", whatsapp_number: "", email: "", website: "", location: "",
    facebook_url: "", instagram_url: "", tiktok_url: "", linkedin_url: "",
    youtube_url: "", payment_link: "", zelle_link: "", zelle_qr: "",
    cashapp_link: "", cashapp_qr: "",
    orangemoney_link: "", orangemoney_qr: "",
    wave_link: "", wave_qr: "",
    custom_payments: [],
    google_review_url: "",
    whatsapp_booking_message: "",
    booking_enabled: false,
    booking_slot_duration: 30,
    booking_restricted_emails: [],
    business_hours: {},
    show_location: true,
    bg_style: "clean",
    button_style: "pill",
  });

  // editProfileId: undefined = use first profile, null = create new, string = load specific
  const isCreatingNew = editProfileId === null;
  const { data: profiles = [] } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: () => base44.entities.Profile.filter({ created_by_id: user.id }),
    enabled: !!user?.id && editProfileId === undefined,
  });
  const { data: specificProfile } = useQuery({
    queryKey: ["profile-detail", editProfileId],
    queryFn: () => base44.entities.Profile.get(editProfileId),
    enabled: typeof editProfileId === "string",
  });
  const profile = isCreatingNew ? null : typeof editProfileId === "string" ? specificProfile : profiles[0];

  useEffect(() => {
    if (profile) {
      setForm({
        username: profile.username || "",
        display_name: profile.display_name || "",
        job_title: profile.job_title || "",
        company_name: profile.company_name || "",
        bio: profile.bio || "",
        cover_color: profile.cover_color || "#2563eb",
        profile_photo: profile.profile_photo || "",
        cover_photo: profile.cover_photo || "",
        company_logo: profile.company_logo || "",
        layout: profile.layout || "classic",
        phone: profile.phone || "",
        whatsapp_number: profile.whatsapp_number || "",
        email: profile.email || user?.email || "",
        website: profile.website || "",
        location: profile.location || "",
        facebook_url: profile.facebook_url || "",
        instagram_url: profile.instagram_url || "",
        tiktok_url: profile.tiktok_url || "",
        linkedin_url: profile.linkedin_url || "",
        youtube_url: profile.youtube_url || "",
        payment_link: profile.payment_link || "",
        zelle_link: profile.zelle_link || "",
        zelle_qr: profile.zelle_qr || "",
        cashapp_link: profile.cashapp_link || "",
        cashapp_qr: profile.cashapp_qr || "",
        orangemoney_link: profile.orangemoney_link || "",
        orangemoney_qr: profile.orangemoney_qr || "",
        wave_link: profile.wave_link || "",
        wave_qr: profile.wave_qr || "",
        custom_payments: profile.custom_payments || [],
        google_review_url: profile.google_review_url || "",
        whatsapp_booking_message: profile.whatsapp_booking_message || "",
        booking_enabled: profile.booking_enabled || false,
        booking_slot_duration: profile.booking_slot_duration || 30,
        booking_restricted_emails: profile.booking_restricted_emails || [],
        business_hours: profile.business_hours || {},
        show_location: profile.show_location !== false,
        bg_style: profile.bg_style || "clean",
        button_style: profile.button_style || "pill",
      });
    } else if (prefillData && !profile) {
      // AI-generated data — map suggested_username → username
      const slug = (prefillData.suggested_username || "")
        .toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
      setForm(f => ({
        ...f,
        display_name: prefillData.display_name || user?.full_name || "",
        job_title: prefillData.job_title || "",
        company_name: prefillData.company_name || "",
        bio: prefillData.bio || "",
        email: prefillData.email || user?.email || "",
        phone: prefillData.phone || "",
        location: prefillData.location || "",
        website: prefillData.website || "",
        instagram_url: prefillData.instagram_url || "",
        facebook_url: prefillData.facebook_url || "",
        linkedin_url: prefillData.linkedin_url || "",
        tiktok_url: prefillData.tiktok_url || "",
        youtube_url: prefillData.youtube_url || "",
        booking_enabled: prefillData.booking_enabled || false,
        username: slug,
      }));
    } else if (user) {
      setForm(f => ({ ...f, display_name: user.full_name || "", email: user.email || "" }));
    }
  }, [profile?.id, user?.id, prefillData]);

  const validate = () => {
    const e = {};
    if (!form.username) e.username = "Required";
    if (!form.display_name) e.display_name = "Required";
    if (form.email && !isValidEmail(form.email)) e.email = "Invalid email";
    const urlFields = ["website","facebook_url","instagram_url","tiktok_url","linkedin_url","youtube_url","payment_link","zelle_link","cashapp_link","orangemoney_link","wave_link","google_review_url"];
    urlFields.forEach(k => { if (form[k] && !isValidUrl(form[k])) e[k] = "Invalid URL"; });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveProfile = useMutation({
    mutationFn: async () => {
      if (!validate()) throw new Error("Validation failed");
      let savedProfile;
      if (profile) {
        savedProfile = await base44.entities.Profile.update(profile.id, { ...form, is_active: true });
      } else {
        savedProfile = await base44.entities.Profile.create({ ...form, is_active: true, plan: "free" });
      }
      // Ensure owned_profile_ids is set on the user so RLS works for appointments/leads
      if (savedProfile?.id) {
        const me = await base44.auth.me();
        const existing = me?.owned_profile_ids || [];
        if (!existing.includes(savedProfile.id)) {
          await base44.auth.updateMe({ owned_profile_ids: [...existing, savedProfile.id] });
        }
      }
      return savedProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      toast.success("Profile saved successfully!");
      onSaved?.();
      // Auto-navigate back after save
      setTimeout(() => {
        navigate(-1);
      }, 500);
    },
    onError: (err) => { if (err.message !== "Validation failed") toast.error("Failed to save."); },
  });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, profile_photo: file_url }));
    setUploading(false);
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setCoverUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, cover_photo: file_url }));
    setCoverUploading(false);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setLogoUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, company_logo: file_url }));
    setLogoUploading(false);
  };

  const handleZelleQrUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setZelleQrUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, zelle_qr: file_url }));
    setZelleQrUploading(false);
  };

  const handleCashappQrUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setCashappQrUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, cashapp_qr: file_url }));
    setCashappQrUploading(false);
  };

  const handleOrangemoneyQrUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setOrangemoneyQrUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, orangemoney_qr: file_url }));
    setOrangemoneyQrUploading(false);
  };

  const handleWaveQrUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setWaveQrUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, wave_qr: file_url }));
    setWaveQrUploading(false);
  };

  const handleCustomQrUpload = async (idx, e) => {
    const file = e.target.files[0]; if (!file) return;
    setCustomQrUploading(u => ({ ...u, [idx]: true }));
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => {
      const cp = [...(f.custom_payments || [])];
      cp[idx] = { ...cp[idx], qr: file_url };
      return { ...f, custom_payments: cp };
    });
    setCustomQrUploading(u => ({ ...u, [idx]: false }));
  };

  const updateCustomPayment = (idx, key, value) => {
    setForm(f => {
      const cp = [...(f.custom_payments || [])];
      cp[idx] = { ...cp[idx], [key]: value };
      return { ...f, custom_payments: cp };
    });
  };

  const removeCustomPayment = (idx) => {
    setForm(f => ({ ...f, custom_payments: (f.custom_payments || []).filter((_, i) => i !== idx) }));
  };

  const addCustomPayment = () => {
    setForm(f => ({ ...f, custom_payments: [...(f.custom_payments || []), { label: "", emoji: "💵", link: "", qr: "" }] }));
  };

  const set = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target.value })); setErrors(er => ({ ...er, [k]: undefined })); };
  const field = (k, label, placeholder, type = "text") => (
    <div>
      <Label>{label}</Label>
      <Input type={type} className={`mt-1 border-slate-200 ${errors[k] ? "border-red-400" : ""}`} placeholder={placeholder} value={form[k]} onChange={set(k)} />
      {errors[k] && <p className="text-red-500 text-xs mt-1">{errors[k]}</p>}
    </div>
  );

  return (
    <div className="relative">
      <LivePreviewPanel form={form} profile={profile} />
      {/* Form */}
      <div className="space-y-6">

        {/* Photos */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {/* Cover — live preview updates instantly */}
          <div className="relative h-40 group" style={{
            backgroundColor: !form.cover_photo ? form.cover_color : undefined,
            backgroundImage: form.cover_photo ? `url(${form.cover_photo})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transition: "background-color 0.3s ease"
          }}>
            <label className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/0 group-hover:bg-black/30 transition-all">
              <span className={`flex items-center gap-2 bg-white/90 text-slate-800 px-3 py-1.5 rounded-lg text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all ${coverUploading ? "opacity-100" : ""}`}>
                {coverUploading ? <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> : <Image className="w-4 h-4" />}
                {coverUploading ? "Uploading..." : "Change Cover"}
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={coverUploading} />
            </label>
            {form.cover_photo && (
              <button onClick={() => setForm(f => ({ ...f, cover_photo: "" }))} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
          {/* Avatar */}
          <div className="px-6 pb-5">
            <div className="flex items-end gap-4 -mt-10 mb-4">
              <div className="relative flex-shrink-0">
                {form.profile_photo
                  ? <img src={form.profile_photo} className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg object-cover" alt="" />
                  : <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center text-3xl font-black text-white" style={{ background: form.cover_color }}>{form.display_name?.charAt(0) || "?"}</div>
                }
                <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#E8671A] hover:bg-[#d45c14] rounded-full flex items-center justify-center cursor-pointer shadow">
                  {uploading ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Camera className="w-3.5 h-3.5 text-white" />}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                </label>
              </div>
              <div className="flex gap-2 pb-1">
                <label className="cursor-pointer text-xs font-semibold text-[#E8671A] hover:text-[#d45c14] bg-orange-50 px-3 py-1.5 rounded-lg">
                  {uploading ? "Uploading..." : "Change Photo"}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                </label>
                {form.profile_photo && (
                  <button onClick={() => setForm(f => ({ ...f, profile_photo: "" }))} className="text-xs font-semibold text-red-500 hover:text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">Remove</button>
                )}
              </div>
            </div>

            {/* Company Logo */}
          <div className="mt-4">
            <Label className="font-semibold">Company / Business Logo</Label>
            <div className="flex items-center gap-4 mt-2">
              {form.company_logo
                ? <img src={form.company_logo} className="w-16 h-16 rounded-xl border border-slate-200 object-contain bg-white shadow-sm" alt="Logo" />
                : <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-2xl bg-slate-50">🏢</div>
              }
              <div className="flex flex-col gap-2">
                <label className="cursor-pointer text-xs font-semibold text-[#E8671A] hover:text-[#d45c14] bg-orange-50 px-3 py-1.5 rounded-lg inline-flex items-center gap-2">
                  {logoUploading ? <><div className="w-3.5 h-3.5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />Uploading...</> : <><Image className="w-3.5 h-3.5" />{form.company_logo ? "Change Logo" : "Upload Logo"}</>}
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={logoUploading} />
                </label>
                {form.company_logo && (
                  <button onClick={() => setForm(f => ({ ...f, company_logo: "" }))} className="text-xs font-semibold text-red-500 hover:text-red-600 bg-red-50 px-3 py-1.5 rounded-lg text-left">Remove</button>
                )}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Username <span className="text-red-500">*</span></Label>
                <div className="flex mt-1">
                  <span className="inline-flex items-center px-3 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-slate-500 text-sm">/p/</span>
                  <Input className={`rounded-l-none border-slate-200 ${errors.username ? "border-red-400" : ""}`} placeholder="yourusername" value={form.username} onChange={e => { setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })); setErrors(er => ({ ...er, username: undefined })); }} />
                </div>
                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
              </div>
              {field("display_name", "Full Name *", "Your Name")}
              {field("job_title", "Job Title", "CEO / Real Estate Agent")}
              {field("company_name", "Company Name", "Your Company")}
            </div>
            <div className="mt-4">
              <Label>Bio</Label>
              <Textarea className="mt-1 border-slate-200" placeholder="A short description about you or your business..." value={form.bio} onChange={set("bio")} rows={3} />
            </div>
          </div>
        </div>

        {/* Cover Color + Layout */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
          <div>
            <Label className="font-semibold">Accent Color</Label>
            <div className="flex gap-2 mt-2 flex-wrap">
              {COVER_COLORS.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, cover_color: c }))} className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${form.cover_color === c ? "border-slate-900 scale-110" : "border-transparent"}`} style={{ background: c }} />
              ))}
            </div>
          </div>

          <div>
            <Label className="font-semibold block mb-3">Profile Layout</Label>
            <LayoutPicker value={form.layout || "classic"} onChange={v => setForm(f => ({ ...f, layout: v }))} color={form.cover_color} plan={profile?.plan || "free"} />
          </div>

          <div>
            <Label className="font-semibold block mb-2">Page Background</Label>
            <div className="grid grid-cols-2 gap-2">
              {[{v:"clean",label:"Clean White",desc:"Simple & neutral"},{v:"gradient",label:"Soft Gradient",desc:"Colour wash"},{v:"mesh",label:"Mesh",desc:"Dual tone blend"},{v:"night",label:"Night",desc:"Dark atmosphere"}].map(o => (
                <button key={o.v} onClick={() => setForm(f => ({ ...f, bg_style: o.v }))}
                  className={`flex items-start gap-2 p-3 rounded-xl border-2 text-left transition-all ${form.bg_style === o.v ? "border-[#E8671A] bg-orange-50" : "border-slate-100 hover:border-slate-300"}`}>
                  <div>
                    <p className={`text-xs font-bold ${form.bg_style === o.v ? "text-[#E8671A]" : "text-slate-700"}`}>{o.label}</p>
                    <p className="text-[11px] text-slate-400">{o.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="font-semibold block mb-2">Button Style</Label>
            <div className="flex gap-2">
              {[{v:"pill",label:"Pill"},{v:"rounded",label:"Rounded"},{v:"sharp",label:"Sharp"}].map(o => (
                <button key={o.v} onClick={() => setForm(f => ({ ...f, button_style: o.v }))}
                  className={`flex-1 py-2.5 text-xs font-bold border-2 transition-all ${form.button_style === o.v ? "border-[#E8671A] bg-orange-50 text-[#E8671A]" : "border-slate-100 text-slate-500 hover:border-slate-300"}`}
                  style={{ borderRadius: o.v === "pill" ? 999 : o.v === "sharp" ? 6 : 12 }}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-bold text-[#0B2E6B] mb-4">Contact Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {field("phone", "Phone", "+221 77 000 0000")}
            {field("whatsapp_number", "WhatsApp", "+221 77 000 0000")}
            {field("email", "Email", "you@example.com", "email")}
            {field("website", "Website", "https://yourwebsite.com")}
            <div>
              <Label>Business Address</Label>
              <div className="flex gap-2 mt-1">
                <Input className={`flex-1 border-slate-200 ${errors.location ? 'border-red-400' : ''}`} placeholder="123 Avenue, City" value={form.location} onChange={set("location")} />
                <button type="button" title={form.show_location ? "Hide on profile" : "Show on profile"}
                  onClick={() => setForm(f => ({ ...f, show_location: !f.show_location }))}
                  className={`px-3 rounded-xl border text-sm font-semibold transition-colors ${form.show_location ? "border-orange-200 bg-orange-50 text-[#E8671A]" : "border-slate-200 bg-slate-100 text-slate-400"}`}>
                  {form.show_location ? "👁 Visible" : "🙈 Hidden"}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">{form.show_location ? "Address is visible on your public profile" : "Address is hidden from visitors"}</p>
            </div>
            {field("payment_link", "Payment Link", "https://paypal.me/...")}
            </div>
            <h3 className="font-bold text-[#0B2E6B] mt-4 mb-3">Money Transfer Links</h3>
            <div className="grid md:grid-cols-2 gap-4">
            {/* Zelle: QR upload + optional link */}
            <div className="md:col-span-2 bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-purple-600" />
                <Label className="font-semibold text-slate-800">💳 Zelle</Label>
              </div>
              <p className="text-xs text-slate-500">Upload your Zelle QR code image (JPG or PNG) — this is the downloadable QR image from your bank app. Visitors will see a button to scan it.</p>
              {/* QR upload */}
              <div className="flex items-center gap-4">
                {form.zelle_qr
                  ? <img src={form.zelle_qr} alt="Zelle QR" className="w-20 h-20 rounded-xl border border-slate-200 object-contain bg-white shadow-sm" />
                  : <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-2xl bg-white">🔲</div>
                }
                <div className="flex flex-col gap-2">
                  <label className="cursor-pointer text-xs font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg inline-flex items-center gap-2">
                    {zelleQrUploading ? <><div className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />Uploading...</> : <><QrCode className="w-3.5 h-3.5" />{form.zelle_qr ? "Change QR Code" : "Upload QR Code"}</>}
                    <input type="file" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" className="hidden" onChange={handleZelleQrUpload} disabled={zelleQrUploading} />
                  </label>
                  {form.zelle_qr && (
                    <button onClick={() => setForm(f => ({ ...f, zelle_qr: "" }))} className="text-xs font-semibold text-red-500 hover:text-red-600 bg-red-50 px-3 py-1.5 rounded-lg text-left">Remove QR</button>
                  )}
                </div>
              </div>
              {/* Optional link */}
              <div>
                <Label className="text-xs text-slate-500 mb-1">Zelle Link (optional)</Label>
                <Input className={`border-slate-200 text-sm ${errors.zelle_link ? "border-red-400" : ""}`} placeholder="https://enroll.zellepay.com/..." value={form.zelle_link} onChange={set("zelle_link")} />
                {errors.zelle_link && <p className="text-red-500 text-xs mt-1">{errors.zelle_link}</p>}
              </div>
            </div>
            {/* Cash App: QR upload + link */}
            <div className="md:col-span-2 bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-green-600" />
                <Label className="font-semibold text-slate-800">💰 Cash App</Label>
              </div>
              <p className="text-xs text-slate-500">Upload your Cash App QR code — visitors can scan it to send you money instantly.</p>
              <div className="flex items-center gap-4">
                {form.cashapp_qr
                  ? <img src={form.cashapp_qr} alt="Cash App QR" className="w-20 h-20 rounded-xl border border-slate-200 object-contain bg-white shadow-sm" />
                  : <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-2xl bg-white">🔲</div>
                }
                <div className="flex flex-col gap-2">
                  <label className="cursor-pointer text-xs font-semibold text-green-600 hover:text-green-700 bg-green-50 px-3 py-1.5 rounded-lg inline-flex items-center gap-2">
                    {cashappQrUploading ? <><div className="w-3.5 h-3.5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />Uploading...</> : <><QrCode className="w-3.5 h-3.5" />{form.cashapp_qr ? "Change QR Code" : "Upload QR Code"}</>}
                    <input type="file" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" className="hidden" onChange={handleCashappQrUpload} disabled={cashappQrUploading} />
                  </label>
                  {form.cashapp_qr && (
                    <button onClick={() => setForm(f => ({ ...f, cashapp_qr: "" }))} className="text-xs font-semibold text-red-500 hover:text-red-600 bg-red-50 px-3 py-1.5 rounded-lg text-left">Remove QR</button>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-xs text-slate-500 mb-1">Cash App Link (optional)</Label>
                <Input className={`border-slate-200 text-sm ${errors.cashapp_link ? "border-red-400" : ""}`} placeholder="https://cash.app/$..." value={form.cashapp_link} onChange={set("cashapp_link")} />
                {errors.cashapp_link && <p className="text-red-500 text-xs mt-1">{errors.cashapp_link}</p>}
              </div>
            </div>

            {/* Orange Money: QR upload + link */}
            <div className="md:col-span-2 bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-orange-500" />
                <Label className="font-semibold text-slate-800">🟠 Orange Money</Label>
              </div>
              <p className="text-xs text-slate-500">Upload your Orange Money QR code for easy mobile money transfers.</p>
              <div className="flex items-center gap-4">
                {form.orangemoney_qr
                  ? <img src={form.orangemoney_qr} alt="Orange Money QR" className="w-20 h-20 rounded-xl border border-slate-200 object-contain bg-white shadow-sm" />
                  : <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-2xl bg-white">🔲</div>
                }
                <div className="flex flex-col gap-2">
                  <label className="cursor-pointer text-xs font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-lg inline-flex items-center gap-2">
                    {orangemoneyQrUploading ? <><div className="w-3.5 h-3.5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />Uploading...</> : <><QrCode className="w-3.5 h-3.5" />{form.orangemoney_qr ? "Change QR Code" : "Upload QR Code"}</>}
                    <input type="file" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" className="hidden" onChange={handleOrangemoneyQrUpload} disabled={orangemoneyQrUploading} />
                  </label>
                  {form.orangemoney_qr && (
                    <button onClick={() => setForm(f => ({ ...f, orangemoney_qr: "" }))} className="text-xs font-semibold text-red-500 hover:text-red-600 bg-red-50 px-3 py-1.5 rounded-lg text-left">Remove QR</button>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-xs text-slate-500 mb-1">Orange Money Link (optional)</Label>
                <Input className={`border-slate-200 text-sm ${errors.orangemoney_link ? "border-red-400" : ""}`} placeholder="https://orangemoney...." value={form.orangemoney_link} onChange={set("orangemoney_link")} />
                {errors.orangemoney_link && <p className="text-red-500 text-xs mt-1">{errors.orangemoney_link}</p>}
              </div>
            </div>
            {/* Wave: QR upload + optional link */}
            <div className="md:col-span-2 bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-blue-500" />
                <Label className="font-semibold text-slate-800">📲 Wave</Label>
              </div>
              <p className="text-xs text-slate-500">Upload your Wave QR code image (JPG or PNG) — the downloadable QR image from your Wave app.</p>
              <div className="flex items-center gap-4">
                {form.wave_qr
                  ? <img src={form.wave_qr} alt="Wave QR" className="w-20 h-20 rounded-xl border border-slate-200 object-contain bg-white shadow-sm" />
                  : <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-2xl bg-white">🔲</div>
                }
                <div className="flex flex-col gap-2">
                  <label className="cursor-pointer text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg inline-flex items-center gap-2">
                    {waveQrUploading ? <><div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />Uploading...</> : <><QrCode className="w-3.5 h-3.5" />{form.wave_qr ? "Change QR Code" : "Upload QR Code"}</>}
                    <input type="file" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" className="hidden" onChange={handleWaveQrUpload} disabled={waveQrUploading} />
                  </label>
                  {form.wave_qr && (
                    <button onClick={() => setForm(f => ({ ...f, wave_qr: "" }))} className="text-xs font-semibold text-red-500 hover:text-red-600 bg-red-50 px-3 py-1.5 rounded-lg text-left">Remove QR</button>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-xs text-slate-500 mb-1">Wave Link (optional)</Label>
                <Input className={`border-slate-200 text-sm ${errors.wave_link ? "border-red-400" : ""}`} placeholder="https://wave.com/..." value={form.wave_link} onChange={set("wave_link")} />
                {errors.wave_link && <p className="text-red-500 text-xs mt-1">{errors.wave_link}</p>}
              </div>
            </div>
            </div>

            {/* Custom Payment Methods */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-[#0B2E6B]">Other Payment Methods</h3>
                <button type="button" onClick={addCustomPayment} className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add Method
                </button>
              </div>
              {(form.custom_payments || []).length === 0 && (
                <p className="text-xs text-slate-400 italic">No custom methods yet. Add PayPal, Venmo, CinetPay, etc.</p>
              )}
              <div className="space-y-3">
                {(form.custom_payments || []).map((cp, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <Input className="w-14 border-slate-200 text-center text-lg" placeholder="💵" value={cp.emoji || ""} onChange={e => updateCustomPayment(idx, "emoji", e.target.value)} />
                        <Input className="flex-1 border-slate-200" placeholder="Label (e.g. PayPal, Venmo)" value={cp.label || ""} onChange={e => updateCustomPayment(idx, "label", e.target.value)} />
                      </div>
                      <button type="button" onClick={() => removeCustomPayment(idx)} className="ml-2 text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <Input className="border-slate-200 text-sm" placeholder="Link (optional, e.g. https://paypal.me/...)" value={cp.link || ""} onChange={e => updateCustomPayment(idx, "link", e.target.value)} />
                    <div className="flex items-center gap-4">
                      {cp.qr
                        ? <img src={cp.qr} alt="QR" className="w-16 h-16 rounded-lg border border-slate-200 object-contain bg-white" />
                        : <div className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 bg-white text-xl">🔲</div>
                      }
                      <div className="flex flex-col gap-1.5">
                        <label className="cursor-pointer text-xs font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5">
                          {customQrUploading[idx] ? <><div className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />Uploading...</> : <><QrCode className="w-3.5 h-3.5" />{cp.qr ? "Change QR" : "Upload QR"}</>}
                          <input type="file" accept="image/*" className="hidden" onChange={e => handleCustomQrUpload(idx, e)} disabled={!!customQrUploading[idx]} />
                        </label>
                        {cp.qr && <button type="button" onClick={() => updateCustomPayment(idx, "qr", "")} className="text-xs font-semibold text-red-500 bg-red-50 px-3 py-1 rounded-lg text-left">Remove QR</button>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            </div>

        {/* Booking Settings */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#0B2E6B]">Appointment Booking</h3>
              <p className="text-xs text-slate-400 mt-0.5">Let visitors book time with you directly from your profile</p>
            </div>
            <button type="button" onClick={() => setForm(f => ({ ...f, booking_enabled: !f.booking_enabled }))}
              className={`w-12 h-7 rounded-full transition-colors relative flex-shrink-0 ${form.booking_enabled ? "bg-[#E8671A]" : "bg-slate-200"}`}>
              <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${form.booking_enabled ? "left-6" : "left-1"}`} />
            </button>
          </div>
          {form.booking_enabled && (
            <div className="space-y-5 border-t border-slate-100 pt-5">
              <div>
                <Label className="font-semibold">Slot Duration</Label>
                <select value={form.booking_slot_duration} onChange={e => setForm(f => ({ ...f, booking_slot_duration: Number(e.target.value) }))}
                  className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white">
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>
              <div>
                <Label className="font-semibold block mb-2">Business Hours</Label>
                <BusinessHoursEditor value={form.business_hours} onChange={v => setForm(f => ({ ...f, business_hours: v }))} />
              </div>
              <div>
                <Label className="font-semibold">Restrict booking to specific emails</Label>
                <p className="text-xs text-slate-400 mt-0.5 mb-2">Leave blank to allow anyone to book. Add emails (one per line) to restrict access.</p>
                <textarea
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white resize-none"
                  rows={3}
                  placeholder="alice@example.com&#10;bob@example.com"
                  value={(form.booking_restricted_emails || []).join("\n")}
                  onChange={e => setForm(f => ({ ...f, booking_restricted_emails: e.target.value.split("\n").map(s => s.trim()).filter(Boolean) }))}
                />
              </div>
            </div>
          )}
        </div>

        {/* Salon / Restaurant extras */}
        {["salon", "restaurant"].includes(profile?.plan) && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{profile?.plan === "salon" ? "✂️" : "🍽️"}</span>
              <h3 className="font-bold text-slate-900">{profile?.plan === "salon" ? "Salon" : "Restaurant"} Extras</h3>
            </div>
            {field("google_review_url", "⭐ Google Review Link", "https://g.page/r/...")}
            <p className="text-xs text-slate-400 -mt-2">Paste your Google Maps review link — visitors will see a "Leave a Review" button on your profile.</p>
            <div>
              <Label>💬 WhatsApp Booking Message</Label>
              <Input className="mt-1 border-slate-200" placeholder={`Hi, I'd like to book an appointment at your ${profile?.plan === "salon" ? "salon" : "restaurant"}...`} value={form.whatsapp_booking_message} onChange={set("whatsapp_booking_message")} />
              <p className="text-xs text-slate-400 mt-1">Pre-filled message when visitors tap the WhatsApp booking button.</p>
            </div>
          </div>
        )}

        {/* Social */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-bold text-[#0B2E6B] mb-4">Social Media</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {field("instagram_url", "📸 Instagram", "https://instagram.com/...")}
            {field("facebook_url", "👤 Facebook", "https://facebook.com/...")}
            {field("tiktok_url", "🎵 TikTok", "https://tiktok.com/@...")}
            {field("linkedin_url", "💼 LinkedIn", "https://linkedin.com/in/...")}
            {field("youtube_url", "▶️ YouTube", "https://youtube.com/@...")}
          </div>
        </div>

        <div className="pb-6 flex items-center gap-4 flex-wrap">
          <Button onClick={() => saveProfile.mutate()} disabled={saveProfile.isPending} className="bg-[#E8671A] hover:bg-[#d45c14] text-white px-10 h-12 text-base font-bold shadow-lg shadow-orange-200 rounded-xl">
            {saveProfile.isPending ? "Saving..." : "💾 Save Profile"}
          </Button>
          {profile && (
            <a href={`/p/${profile.username}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0B2E6B] hover:text-[#E8671A] transition-colors">
              <Eye className="w-4 h-4" /> View Live Profile
            </a>
          )}
        </div>
      </div>
    </div>
  );
}