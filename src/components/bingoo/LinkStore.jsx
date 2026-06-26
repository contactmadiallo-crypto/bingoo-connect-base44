import React, { useState, useCallback } from "react";
import { X, Plus, Check, Search, ChevronLeft, Globe, Phone, Mail, Instagram, Linkedin, Facebook, Youtube, Smartphone, CreditCard, ExternalLink, Link2, Briefcase, Music, ShoppingBag, MessageCircle } from "lucide-react";

// ── Link catalog ──────────────────────────────────────────────────────────────
const LINK_CATALOG = [
  // Contact
  { id: "phone",           label: "Phone",           category: "contact",  icon: Phone,       field: "phone",            placeholder: "+1 555 000 0000",       type: "field" },
  { id: "whatsapp_number", label: "WhatsApp",         category: "contact",  icon: MessageCircle, field: "whatsapp_number", placeholder: "+1 555 000 0000",       type: "field" },
  { id: "email",           label: "Email",            category: "contact",  icon: Mail,        field: "email",            placeholder: "you@example.com",        type: "field" },
  { id: "website",         label: "Website",          category: "contact",  icon: Globe,       field: "website",          placeholder: "https://yoursite.com",   type: "field" },
  // Social
  { id: "instagram_url",   label: "Instagram",        category: "social",   icon: Instagram,   field: "instagram_url",    placeholder: "https://instagram.com/you",  type: "field" },
  { id: "linkedin_url",    label: "LinkedIn",         category: "social",   icon: Linkedin,    field: "linkedin_url",     placeholder: "https://linkedin.com/in/you", type: "field" },
  { id: "facebook_url",    label: "Facebook",         category: "social",   icon: Facebook,    field: "facebook_url",     placeholder: "https://facebook.com/you",   type: "field" },
  { id: "tiktok_url",      label: "TikTok",           category: "social",   icon: Smartphone,  field: "tiktok_url",       placeholder: "https://tiktok.com/@you",    type: "field" },
  { id: "youtube_url",     label: "YouTube",          category: "social",   icon: Youtube,     field: "youtube_url",      placeholder: "https://youtube.com/@you",   type: "field" },
  // Payment
  { id: "payment_link",    label: "PayPal / Pay Link", category: "payment",  icon: CreditCard, field: "payment_link",     placeholder: "https://paypal.me/...",    type: "field" },
  { id: "cashapp_link",    label: "Cash App",         category: "payment",  icon: CreditCard, field: "cashapp_link",     placeholder: "https://cash.app/$...",    type: "field" },
  { id: "zelle_link",      label: "Zelle",            category: "payment",  icon: CreditCard, field: "zelle_link",       placeholder: "https://enroll.zellepay.com/...", type: "field" },
  { id: "wave_link",       label: "Wave",             category: "payment",  icon: CreditCard, field: "wave_link",        placeholder: "https://wave.com/...",     type: "field" },
  { id: "orangemoney_link",label: "Orange Money",     category: "payment",  icon: CreditCard, field: "orangemoney_link", placeholder: "https://...",              type: "field" },
  // Business
  { id: "booking",         label: "Booking Link",     category: "business", icon: Briefcase,  field: "website",          placeholder: "https://calendly.com/...", type: "field" },
  // Content
  { id: "music_link",      label: "Music / Spotify",  category: "content",  icon: Music,      field: null,               placeholder: "https://open.spotify.com/...", type: "custom" },
  { id: "shop_link",       label: "Online Shop",      category: "content",  icon: ShoppingBag,field: null,               placeholder: "https://yourshop.com/...", type: "custom" },
  { id: "portfolio_link",  label: "Portfolio Site",   category: "content",  icon: ExternalLink,field: null,              placeholder: "https://yourportfolio.com/...", type: "custom" },
];

const CATEGORIES = [
  { id: "all",     label: "All" },
  { id: "popular", label: "Popular" },
  { id: "contact", label: "Contact" },
  { id: "social",  label: "Social" },
  { id: "business",label: "Business" },
  { id: "content", label: "Content" },
  { id: "payment", label: "Payment" },
];

const POPULAR_IDS = new Set(["phone", "whatsapp_number", "instagram_url", "linkedin_url", "website", "payment_link"]);

// ── Focused form for editing a single link item ───────────────────────────────
function LinkEditForm({ item, currentValue, currentLabel, onSave, onBack, isDark }) {
  const [val, setVal]     = useState(currentValue || "");
  const [label, setLabel] = useState(currentLabel || item.label);

  const inputCls = `w-full px-3 py-2.5 rounded-xl text-sm border outline-none transition-all ${
    isDark
      ? "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-orange-400/60"
      : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-300 focus:border-orange-400"
  }`;

  return (
    <div className="flex flex-col h-full">
      {/* back header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className={`p-2 rounded-xl transition-colors ${isDark ? "hover:bg-white/8 text-white/60" : "hover:bg-slate-100 text-slate-500"}`}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? "bg-white/8" : "bg-slate-100"}`}>
            <item.icon className="w-4 h-4 text-orange-500" />
          </div>
          <span className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>{item.label}</span>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        <div>
          <label className={`block text-xs font-bold mb-1.5 ${isDark ? "text-white/50" : "text-slate-500"}`}>Label</label>
          <input
            type="text"
            className={inputCls}
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder={item.label}
            autoComplete="off"
          />
        </div>
        <div>
          <label className={`block text-xs font-bold mb-1.5 ${isDark ? "text-white/50" : "text-slate-500"}`}>
            {item.type === "field" ? "Value / URL" : "URL"}
          </label>
          <input
            type="text"
            className={inputCls}
            value={val}
            onChange={e => setVal(e.target.value)}
            placeholder={item.placeholder}
            autoComplete="off"
            autoFocus
          />
        </div>
      </div>

      <button
        onClick={() => onSave(val, label)}
        className="mt-5 w-full py-3 rounded-2xl text-sm font-black text-white transition-all hover:opacity-90 active:scale-95"
        style={{ background: "linear-gradient(135deg, #FF7A00, #FDBA21)" }}>
        Save
      </button>
    </div>
  );
}

// ── Main LinkStore sheet ──────────────────────────────────────────────────────
export default function LinkStore({ liveForm, setVal, set, onSave, isPending, isDark, lang, onClose }) {
  const [cat, setCat]           = useState("all");
  const [search, setSearch]     = useState("");
  const [editing, setEditing]   = useState(null); // catalog item being edited
  const [webOpen, setWebOpen]   = useState(false);
  const [webLabel, setWebLabel] = useState("");
  const [webUrl, setWebUrl]     = useState("https://");

  const headText  = isDark ? "text-white"    : "text-slate-900";
  const mutedText = isDark ? "text-white/40" : "text-slate-400";
  const bg        = isDark ? "bg-[#0e1223]"  : "bg-white";
  const borderCls = isDark ? "border-white/8" : "border-slate-200";
  const inputCls  = `w-full px-3 py-2 rounded-xl text-sm border outline-none ${isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/20" : "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400"}`;

  // Check if a catalog item already has a value
  const getFieldValue = useCallback((item) => {
    if (item.type === "field" && item.field) return liveForm[item.field] || "";
    // for custom links, check custom_links array
    const cl = (liveForm.custom_links || []).find(l => l._catalog_id === item.id);
    return cl?.url || "";
  }, [liveForm]);

  const isAdded = (item) => !!getFieldValue(item);

  // Filter catalog
  const filtered = LINK_CATALOG.filter(item => {
    const matchCat = cat === "all" || (cat === "popular" ? POPULAR_IDS.has(item.id) : item.category === cat);
    const matchSearch = !search || item.label.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Save from edit form
  const handleSaveItem = (item, val, label) => {
    if (item.type === "field" && item.field) {
      setVal(item.field, val);
    } else {
      // custom link
      const current = liveForm.custom_links || [];
      const existing = current.findIndex(l => l._catalog_id === item.id);
      if (existing >= 0) {
        const updated = [...current];
        updated[existing] = { ...updated[existing], label, url: val };
        setVal("custom_links", updated);
      } else {
        setVal("custom_links", [...current, { id: Date.now().toString(), _catalog_id: item.id, label, url: val, enabled: true }]);
      }
    }
    setEditing(null);
    onSave("links");
  };

  // Add raw web link
  const handleAddWebLink = () => {
    if (!webLabel || !webUrl || webUrl === "https://") return;
    const current = liveForm.custom_links || [];
    setVal("custom_links", [...current, { id: Date.now().toString(), label: webLabel, url: webUrl, enabled: true }]);
    setWebLabel(""); setWebUrl("https://"); setWebOpen(false);
    onSave("links");
  };

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className={`flex items-center justify-between px-4 pt-4 pb-3 border-b ${borderCls} flex-shrink-0`}>
        <div>
          <h2 className={`font-black text-base ${headText}`}>Link Store</h2>
          <p className={`text-xs ${mutedText}`}>Add links to your profile</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWebOpen(v => !v)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
            style={{ background: "#0B2E6B" }}>
            <Plus className="w-3.5 h-3.5" /> Web Link
          </button>
          <button onClick={onClose} className={`p-2 rounded-xl transition-colors ${isDark ? "hover:bg-white/8 text-white/50" : "hover:bg-slate-100 text-slate-500"}`}>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Web Link quick-add ── */}
      {webOpen && (
        <div className={`px-4 py-3 border-b ${borderCls} space-y-2 flex-shrink-0 ${isDark ? "bg-white/[0.03]" : "bg-slate-50"}`}>
          <div className="flex gap-2">
            <input type="text" className={inputCls + " flex-1"} placeholder="Label (e.g. Book Now)" value={webLabel} onChange={e => setWebLabel(e.target.value)} />
            <input type="text" className={inputCls + " flex-1"} placeholder="https://..." value={webUrl} onChange={e => setWebUrl(e.target.value)} />
            <button onClick={handleAddWebLink} className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-white flex-shrink-0" style={{ background: "#FF7A00" }}>
              <Plus className="w-3.5 h-3.5" />Add
            </button>
          </div>
        </div>
      )}

      {/* ── If editing a specific item ── */}
      {editing ? (
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <LinkEditForm
            item={editing}
            currentValue={getFieldValue(editing)}
            currentLabel={editing.label}
            onSave={(val, label) => handleSaveItem(editing, val, label)}
            onBack={() => setEditing(null)}
            isDark={isDark}
          />
        </div>
      ) : (
        <>
          {/* ── Search ── */}
          <div className={`px-4 py-3 border-b ${borderCls} flex-shrink-0`}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input type="text" className={inputCls + " pl-8"} placeholder="Search links…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          {/* ── Category pills ── */}
          <div className={`px-4 py-2.5 border-b ${borderCls} flex gap-1.5 overflow-x-auto scrollbar-hide flex-shrink-0`}>
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setCat(c.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                  cat === c.id
                    ? "text-white"
                    : isDark ? "bg-white/5 text-white/50 hover:bg-white/10" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
                style={cat === c.id ? { background: "#0B2E6B" } : {}}>
                {c.label}
              </button>
            ))}
          </div>

          {/* ── Catalog list ── */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {filtered.length === 0 && (
              <p className={`text-center py-8 text-sm ${mutedText}`}>No links found</p>
            )}
            {filtered.map(item => {
              const added = isAdded(item);
              return (
                <div key={item.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
                    added
                      ? isDark ? "border-emerald-500/25 bg-emerald-500/5" : "border-emerald-200 bg-emerald-50/60"
                      : isDark ? "border-white/8 bg-white/[0.03] hover:bg-white/[0.06]" : "border-slate-100 bg-white hover:bg-slate-50"
                  }`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? "bg-white/8" : "bg-slate-100"}`}>
                    <item.icon className="w-4 h-4" style={{ color: added ? "#10b981" : "#FF7A00" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm ${headText}`}>{item.label}</p>
                    {added && (
                      <p className={`text-xs truncate ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                        {getFieldValue(item)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setEditing(item)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 transition-all ${
                      added
                        ? isDark ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25" : "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100"
                        : "text-white hover:opacity-90"
                    }`}
                    style={!added ? { background: "#FF7A00" } : {}}>
                    {added ? <><Check className="w-3 h-3" />Edit</> : <><Plus className="w-3 h-3" />Add</>}
                  </button>
                </div>
              );
            })}
          </div>

          {/* ── Done button ── */}
          <div className={`flex-shrink-0 px-4 py-3 border-t ${borderCls}`}
            style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl text-sm font-black text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background: "linear-gradient(135deg, #0B2E6B, #1a4a9e)" }}>
              Done
            </button>
          </div>
        </>
      )}
    </div>
  );
}