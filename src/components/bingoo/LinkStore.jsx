import React, { useState, useCallback } from "react";
import { X, Plus, Check, Search, ChevronLeft } from "lucide-react";
import {
  PhoneIcon, WhatsAppIcon, EmailIcon, WebsiteIcon,
  InstagramIcon, LinkedInIcon, FacebookIcon, TikTokIcon,
  YouTubeIcon, TwitterXIcon, SnapchatIcon, PinterestIcon,
  DiscordIcon, TwitchIcon, ThreadsIcon,
  PayPalIcon, CashAppIcon, ZelleIcon, WaveIcon, OrangeMoneyIcon,
  CalendarIcon, SpotifyIcon, ShopIcon, PortfolioIcon, LocationIcon,
} from "@/components/bingoo/BrandIcons";

// ── Link catalog with real brand icons ───────────────────────────────────────
const LINK_CATALOG = [
  // Contact
  { id: "phone",           label: "Phone",           category: "contact",  Icon: PhoneIcon,       field: "phone",            placeholder: "+1 555 000 0000",            type: "field" },
  { id: "whatsapp_number", label: "WhatsApp",         category: "contact",  Icon: WhatsAppIcon,    field: "whatsapp_number",  placeholder: "+1 555 000 0000",            type: "field" },
  { id: "email",           label: "Email",            category: "contact",  Icon: EmailIcon,       field: "email",            placeholder: "you@example.com",            type: "field" },
  { id: "website",         label: "Website",          category: "contact",  Icon: WebsiteIcon,     field: "website",          placeholder: "https://yoursite.com",       type: "field" },
  { id: "location",        label: "Location",         category: "contact",  Icon: LocationIcon,    field: "location",         placeholder: "City, Country",              type: "field" },
  // Social
  { id: "instagram_url",   label: "Instagram",        category: "social",   Icon: InstagramIcon,   field: "instagram_url",    placeholder: "https://instagram.com/you",  type: "field" },
  { id: "linkedin_url",    label: "LinkedIn",         category: "social",   Icon: LinkedInIcon,    field: "linkedin_url",     placeholder: "https://linkedin.com/in/you",type: "field" },
  { id: "facebook_url",    label: "Facebook",         category: "social",   Icon: FacebookIcon,    field: "facebook_url",     placeholder: "https://facebook.com/you",   type: "field" },
  { id: "tiktok_url",      label: "TikTok",           category: "social",   Icon: TikTokIcon,      field: "tiktok_url",       placeholder: "https://tiktok.com/@you",    type: "field" },
  { id: "youtube_url",     label: "YouTube",          category: "social",   Icon: YouTubeIcon,     field: "youtube_url",      placeholder: "https://youtube.com/@you",   type: "field" },
  { id: "twitter_url",     label: "X / Twitter",      category: "social",   Icon: TwitterXIcon,    field: null,               placeholder: "https://x.com/you",          type: "custom" },
  { id: "snapchat_url",    label: "Snapchat",         category: "social",   Icon: SnapchatIcon,    field: null,               placeholder: "https://snapchat.com/add/you",type: "custom" },
  { id: "pinterest_url",   label: "Pinterest",        category: "social",   Icon: PinterestIcon,   field: null,               placeholder: "https://pinterest.com/you",  type: "custom" },
  { id: "discord_url",     label: "Discord",          category: "social",   Icon: DiscordIcon,     field: null,               placeholder: "https://discord.gg/...",     type: "custom" },
  { id: "twitch_url",      label: "Twitch",           category: "social",   Icon: TwitchIcon,      field: null,               placeholder: "https://twitch.tv/you",      type: "custom" },
  { id: "threads_url",     label: "Threads",          category: "social",   Icon: ThreadsIcon,     field: null,               placeholder: "https://threads.net/@you",   type: "custom" },
  // Payment
  { id: "payment_link",    label: "PayPal",           category: "payment",  Icon: PayPalIcon,      field: "payment_link",     placeholder: "https://paypal.me/...",      type: "field" },
  { id: "cashapp_link",    label: "Cash App",         category: "payment",  Icon: CashAppIcon,     field: "cashapp_link",     placeholder: "https://cash.app/$...",      type: "field" },
  { id: "zelle_link",      label: "Zelle",            category: "payment",  Icon: ZelleIcon,       field: "zelle_link",       placeholder: "https://enroll.zellepay.com/",type: "field" },
  { id: "wave_link",       label: "Wave",             category: "payment",  Icon: WaveIcon,        field: "wave_link",        placeholder: "https://wave.com/...",       type: "field" },
  { id: "orangemoney_link",label: "Orange Money",     category: "payment",  Icon: OrangeMoneyIcon, field: "orangemoney_link", placeholder: "https://...",                type: "field" },
  // Business
  { id: "booking",         label: "Booking / Calendly",category:"business", Icon: CalendarIcon,    field: null,               placeholder: "https://calendly.com/...",   type: "custom" },
  // Content
  { id: "music_link",      label: "Music / Spotify",  category: "content",  Icon: SpotifyIcon,     field: null,               placeholder: "https://open.spotify.com/...",type: "custom" },
  { id: "shop_link",       label: "Online Shop",      category: "content",  Icon: ShopIcon,        field: null,               placeholder: "https://yourshop.com/...",   type: "custom" },
  { id: "portfolio_link",  label: "Portfolio Site",   category: "content",  Icon: PortfolioIcon,   field: null,               placeholder: "https://yourportfolio.com/...",type: "custom" },
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

const POPULAR_IDS = new Set(["phone", "whatsapp_number", "instagram_url", "linkedin_url", "website", "payment_link", "email", "facebook_url"]);

// Group catalog by category for sectioned display
const CATEGORY_LABELS = {
  contact: "Contact Info",
  social: "Social Media",
  payment: "Payment",
  business: "Business",
  content: "Content",
};

// ── Focused form for editing a single link item ──────────────────────────────
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
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className={`p-2 rounded-xl transition-colors ${isDark ? "hover:bg-white/8 text-white/60" : "hover:bg-slate-100 text-slate-500"}`}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3">
          <item.Icon size={16} />
          <span className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>{item.label}</span>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        <div>
          <label className={`block text-xs font-bold mb-1.5 ${isDark ? "text-white/50" : "text-slate-500"}`}>Label</label>
          <input
            type="text" className={inputCls}
            value={label} onChange={e => setLabel(e.target.value)}
            placeholder={item.label} autoComplete="off"
          />
        </div>
        <div>
          <label className={`block text-xs font-bold mb-1.5 ${isDark ? "text-white/50" : "text-slate-500"}`}>
            {item.id === "phone" || item.id === "whatsapp_number" ? "Phone Number" : item.id === "email" ? "Email Address" : "URL / Link"}
          </label>
          <input
            type="text" className={inputCls}
            value={val} onChange={e => setVal(e.target.value)}
            placeholder={item.placeholder} autoComplete="off" autoFocus
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

// ── Catalog row (single item) ─────────────────────────────────────────────────
function CatalogRow({ item, added, valuePreview, onEdit, isDark }) {
  const headText = isDark ? "text-white" : "text-slate-900";
  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl border transition-all ${
      added
        ? isDark ? "border-emerald-500/25 bg-emerald-500/5" : "border-emerald-200 bg-emerald-50/60"
        : isDark ? "border-white/6 bg-white/[0.025] hover:bg-white/[0.05]" : "border-slate-100 bg-white hover:bg-slate-50"
    }`}>
      <item.Icon size={16} />
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm ${headText}`}>{item.label}</p>
        {added && valuePreview && (
          <p className={`text-xs truncate ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>{valuePreview}</p>
        )}
      </div>
      <button
        onClick={onEdit}
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
}

// ── Main LinkStore sheet ──────────────────────────────────────────────────────
export default function LinkStore({ liveForm, setVal, set, onSave, isPending, isDark, lang, onClose }) {
  const [cat, setCat]           = useState("all");
  const [search, setSearch]     = useState("");
  const [editing, setEditing]   = useState(null);
  const [webOpen, setWebOpen]   = useState(false);
  const [webLabel, setWebLabel] = useState("");
  const [webUrl, setWebUrl]     = useState("https://");

  const headText  = isDark ? "text-white"    : "text-slate-900";
  const mutedText = isDark ? "text-white/40" : "text-slate-400";
  const borderCls = isDark ? "border-white/8" : "border-slate-200";
  const inputCls  = `w-full px-3 py-2 rounded-xl text-sm border outline-none ${isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/20" : "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400"}`;

  const getFieldValue = useCallback((item) => {
    if (item.type === "field" && item.field) return liveForm[item.field] || "";
    const cl = (liveForm.custom_links || []).find(l => l._catalog_id === item.id);
    return cl?.url || "";
  }, [liveForm]);

  const isAdded = (item) => !!getFieldValue(item);

  const filtered = LINK_CATALOG.filter(item => {
    const matchCat = cat === "all" || (cat === "popular" ? POPULAR_IDS.has(item.id) : item.category === cat);
    const matchSearch = !search || item.label.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Build grouped view for "all" category
  const grouped = {};
  if (cat === "all" && !search) {
    // Popular first
    const popularItems = filtered.filter(i => POPULAR_IDS.has(i.id));
    if (popularItems.length) grouped["Popular"] = popularItems;
    for (const [key, label] of Object.entries(CATEGORY_LABELS)) {
      const items = filtered.filter(i => i.category === key);
      if (items.length) grouped[label] = items;
    }
  }

  const handleSaveItem = (item, val, label) => {
    if (item.type === "field" && item.field) {
      setVal(item.field, val);
    } else {
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

  const handleAddWebLink = () => {
    if (!webLabel || !webUrl || webUrl === "https://") return;
    const current = liveForm.custom_links || [];
    setVal("custom_links", [...current, { id: Date.now().toString(), label: webLabel, url: webUrl, enabled: true }]);
    setWebLabel(""); setWebUrl("https://"); setWebOpen(false);
    onSave("links");
  };

  const addedCount = LINK_CATALOG.filter(i => isAdded(i)).length + (liveForm.custom_links?.filter(l => !l._catalog_id).length || 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`flex items-center justify-between px-4 pt-4 pb-3 border-b ${borderCls} flex-shrink-0`}>
        <div>
          <h2 className={`font-black text-base ${headText}`}>Add Link</h2>
          {addedCount > 0 && <p className={`text-xs ${mutedText}`}>{addedCount} added</p>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWebOpen(v => !v)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold text-white transition-all hover:opacity-90"
            style={{ background: "#0B2E6B" }}>
            <Plus className="w-3.5 h-3.5" /> Web Link
          </button>
          <button onClick={onClose} className={`p-2 rounded-xl transition-colors ${isDark ? "hover:bg-white/8 text-white/50" : "hover:bg-slate-100 text-slate-500"}`}>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Web Link quick-add */}
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
          {/* Category pills + Search */}
          <div className={`px-4 pt-3 pb-2 border-b ${borderCls} flex-shrink-0 space-y-2`}>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
              {CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setCat(c.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                    cat === c.id ? "text-white" : isDark ? "bg-white/5 text-white/50 hover:bg-white/10" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                  style={cat === c.id ? { background: "#0B2E6B" } : {}}>
                  {c.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input type="text" className={inputCls + " pl-8"} placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          {/* Catalog */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {filtered.length === 0 && (
              <p className={`text-center py-8 text-sm ${mutedText}`}>No links found</p>
            )}

            {/* Grouped view (all + no search) */}
            {cat === "all" && !search && Object.keys(grouped).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(grouped).map(([groupLabel, items]) => (
                  <div key={groupLabel}>
                    <p className={`text-[11px] font-bold uppercase tracking-widest mb-2 ${mutedText}`}>{groupLabel}</p>
                    <div className="space-y-2">
                      {items.map(item => (
                        <CatalogRow key={item.id} item={item} added={isAdded(item)}
                          valuePreview={getFieldValue(item)} onEdit={() => setEditing(item)} isDark={isDark} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Flat view
              <div className="space-y-2">
                {filtered.map(item => (
                  <CatalogRow key={item.id} item={item} added={isAdded(item)}
                    valuePreview={getFieldValue(item)} onEdit={() => setEditing(item)} isDark={isDark} />
                ))}
              </div>
            )}
          </div>

          {/* Done button */}
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