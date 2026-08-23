import React, { useState, useCallback, useRef, useEffect } from "react";
import { X, Plus, Check, Search, ChevronLeft } from "lucide-react";
import {
  PhoneIcon, WhatsAppIcon, EmailIcon, WebsiteIcon, LocationIcon,
  InstagramIcon, LinkedInIcon, FacebookIcon, TikTokIcon,
  YouTubeIcon, TwitterXIcon, SnapchatIcon,
  PinterestIcon, DiscordIcon, TwitchIcon, ThreadsIcon,
  PayPalIcon, VenmoIcon, CalendarIcon, SpotifyIcon, ShopIcon, PortfolioIcon,
  WaveIcon, OrangeMoneyIcon, ZelleIcon, CashAppIcon,
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
  { id: "venmo_url",       label: "Venmo",            category: "payment",  Icon: VenmoIcon,       field: null,               placeholder: "https://venmo.com/u/...",    type: "custom" },
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
// Returns [formEl, saveCallback] so parent can render a sticky Save button
function LinkEditForm({ item, currentValue, currentLabel, onSave, onBack, isDark, saveRef }) {
  const [val, setVal]     = useState(currentValue || "");
  const [label, setLabel] = useState(currentLabel || item.label);

  // Expose save fn to parent via ref — update on every render so val/label are always fresh
  useEffect(() => {
    if (saveRef) saveRef.current = () => onSave(val, label);
  });

  const inputCls = `w-full px-3 py-2.5 rounded-xl text-sm border outline-none transition-all ${
    isDark
      ? "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-orange-400/60"
      : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-300 focus:border-orange-400"
  }`;

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className={`p-2 rounded-xl transition-colors ${isDark ? "hover:bg-white/8 text-white/60" : "hover:bg-slate-100 text-slate-500"}`}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3">
          <item.Icon size={16} />
          <span className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>{item.label}</span>
        </div>
      </div>

      <div className="space-y-4">
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
        style={!added ? { background: "#f97316" } : {}}>
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
  const editSaveRef             = useRef(null);
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

  // Robust active detection: checks field value, _catalog_id, URL domain, and label
  const isCatalogItemActive = useCallback((item) => {
    // 1. Direct field value (phone, email, instagram_url, etc.)
    if (item.type === "field" && item.field && liveForm[item.field]) return true;
    // 2. custom_links match by _catalog_id
    const byId = (liveForm.custom_links || []).find(l => l._catalog_id === item.id);
    if (byId) return true;
    // 3. custom_links match by URL domain (for platforms like snapchat that have no field)
    const domainMap = {
      twitter_url:    ["x.com", "twitter.com"],
      snapchat_url:   ["snapchat.com"],
      pinterest_url:  ["pinterest.com"],
      discord_url:    ["discord.gg", "discord.com"],
      twitch_url:     ["twitch.tv"],
      threads_url:    ["threads.net"],
      venmo_url:      ["venmo.com"],
      booking:        ["calendly.com", "cal.com"],
      music_link:     ["spotify.com", "open.spotify"],
      shop_link:      ["shopify.com", "etsy.com", "gumroad.com"],
      portfolio_link: ["portfolio", "behance.net", "dribbble.com"],
    };
    const domains = domainMap[item.id];
    if (domains) {
      const match = (liveForm.custom_links || []).find(l => {
        const url = (l.url || "").toLowerCase();
        return domains.some(d => url.includes(d));
      });
      if (match) return true;
    }
    // 4. custom_links match by normalized label
    const normalizedLabel = item.label.toLowerCase().replace(/[^a-z]/g, "");
    const byLabel = (liveForm.custom_links || []).find(l =>
      (l.label || "").toLowerCase().replace(/[^a-z]/g, "") === normalizedLabel
    );
    if (byLabel) return true;
    return false;
  }, [liveForm]);

  const getValuePreview = useCallback((item) => {
    if (item.type === "field" && item.field) return liveForm[item.field] || "";
    const cl = (liveForm.custom_links || []).find(l =>
      l._catalog_id === item.id ||
      (l.label || "").toLowerCase().replace(/[^a-z]/g, "") === item.label.toLowerCase().replace(/[^a-z]/g, "")
    );
    return cl?.url || "";
  }, [liveForm]);

  const isAdded = (item) => isCatalogItemActive(item);

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
      // For direct profile fields (phone, email, etc.) — save immediately
      setVal(item.field, val);
      setEditing(null);
      // Defer save to next tick so React state flush completes
      setTimeout(() => onSave("links"), 0);
    } else {
      // For custom_links — build the new array first, then set + save atomically
      const current = liveForm.custom_links || [];
      const existing = current.findIndex(l => l._catalog_id === item.id);
      let updated;
      if (existing >= 0) {
        updated = [...current];
        updated[existing] = { ...updated[existing], label, url: val };
      } else {
        updated = [...current, { id: Date.now().toString(), _catalog_id: item.id, category: item.category, label, url: val, enabled: true }];
      }
      setVal("custom_links", updated);
      setEditing(null);
      // Defer save so React flushes the state update before reading liveForm in the mutation
      setTimeout(() => onSave("links"), 0);
    }
  };

  const handleAddWebLink = () => {
    if (!webLabel || !webUrl || webUrl === "https://") return;
    const current = liveForm.custom_links || [];
    const updated = [...current, { id: Date.now().toString(), label: webLabel, url: webUrl, enabled: true }];
    setVal("custom_links", updated);
    setWebLabel(""); setWebUrl("https://"); setWebOpen(false);
    setTimeout(() => onSave("links"), 0);
  };

  const addedCount = LINK_CATALOG.filter(i => isCatalogItemActive(i)).length + (liveForm.custom_links?.filter(l => !l._catalog_id).length || 0);

  return (
    <div className="flex flex-col h-full safe-top">
      {/* Header — exact Figma hierarchy */}
      <div className={`flex items-center justify-between px-[22px] py-[18px] border-b ${borderCls} flex-shrink-0`}>
        <h2 className={`font-black text-[17px] ${headText}`}>Add Link</h2>
        <button onClick={onClose} className={`w-[30px] h-[30px] rounded-full border flex items-center justify-center transition-colors ${isDark ? "bg-white/5 border-white/10 text-white/50" : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"}`}>
          <X className="w-[14px] h-[14px]" />
        </button>
      </div>

      {/* Web Link quick-add */}
      {webOpen && (
        <div className={`px-4 py-3 border-b ${borderCls} space-y-2 flex-shrink-0 ${isDark ? "bg-white/[0.03]" : "bg-slate-50"} max-h-24 overflow-y-auto`}>
          <div className="flex gap-2">
            <input type="text" className={inputCls + " flex-1"} placeholder="Label (e.g. Book Now)" value={webLabel} onChange={e => setWebLabel(e.target.value)} />
            <input type="text" className={inputCls + " flex-1"} placeholder="https://..." value={webUrl} onChange={e => setWebUrl(e.target.value)} />
            <button onClick={handleAddWebLink} className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-white flex-shrink-0" style={{ background: "#f97316" }}>
              <Plus className="w-3.5 h-3.5" />Add
            </button>
          </div>
        </div>
      )}

      {!editing && !webOpen && (
        <div className="px-[22px] pt-3 pb-2 flex gap-[9px] items-center flex-shrink-0">
          <button
            onClick={() => setWebOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white transition-all hover:opacity-90 flex-shrink-0"
            style={{ background: "#3b82f6" }}>
            <Plus className="w-3 h-3" /> Web Link
          </button>
          <div className="relative flex-1">
            <Search className={`w-[13px] h-[13px] absolute left-[10px] top-1/2 -translate-y-1/2 ${mutedText}`} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
              className={`w-full h-9 pl-[30px] pr-3 rounded-[10px] border text-xs outline-none ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`} />
          </div>
        </div>
      )}

      {editing ? (
        <>
          {/* Scrollable form content with bottom padding to clear sticky button */}
          <div className="flex-1 overflow-y-auto px-4 py-4"
            style={{ paddingBottom: "calc(120px + env(safe-area-inset-bottom))" }}>
            <LinkEditForm
              item={editing}
              currentValue={getFieldValue(editing)}
              currentLabel={editing.label}
              onSave={(val, label) => handleSaveItem(editing, val, label)}
              onBack={() => setEditing(null)}
              isDark={isDark}
              saveRef={editSaveRef}
            />
          </div>
          {/* Sticky Save — fixed above bottom nav, always visible on iOS Safari + Android */}
          <div style={{
            position: "fixed",
            bottom: "calc(84px + env(safe-area-inset-bottom))",
            left: "50%",
            transform: "translateX(-50%)",
            width: "calc(100% - 32px)",
            maxWidth: 520,
            zIndex: 100,
          }}>
            <button
              onClick={() => editSaveRef.current?.()}
              className="w-full py-3.5 rounded-2xl text-sm font-black text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background: "linear-gradient(135deg, #f97316, #FDBA21)", boxShadow: "0 4px 20px rgba(249,115,22,0.4)" }}>
              Save
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Category pills — Figma has search in the toolbar above */}
          <div className="px-[22px] pb-[10px] flex-shrink-0">
            <div className="flex gap-1.5 min-w-0 overflow-x-auto scrollbar-hide">
              {CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setCat(c.id)}
                  className={`px-[13px] py-[5px] rounded-full border text-[11px] font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                    cat === c.id ? "text-white border-blue-500 bg-blue-500" : isDark ? "border-white/10 bg-transparent text-white/60" : "border-slate-200 bg-white text-slate-800"
                  }`}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog */}
          <div className="flex-1 overflow-y-auto px-[22px] pb-[22px]">
            {filtered.length === 0 && (
              <p className={`text-center py-8 text-sm ${mutedText}`}>No links found</p>
            )}

            {/* Grouped view (all + no search) */}
            {cat === "all" && !search && Object.keys(grouped).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(grouped).map(([groupLabel, items]) => (
                  <div key={groupLabel}>
                    <p className={`text-[11px] font-bold uppercase tracking-widest mb-2 ${mutedText}`}>{groupLabel}</p>
                    {groupLabel === "Payment" && (
                      <p className={`text-[10px] leading-relaxed mb-2 ${mutedText}`}>
                        Links open external payment services (PayPal, Cash App, Zelle, etc.). Bingoo does not process or hold payments.
                      </p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {items.map(item => (
                        <CatalogRow key={item.id} item={item} added={isAdded(item)}
                          valuePreview={getValuePreview(item)} onEdit={() => setEditing(item)} isDark={isDark} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Flat view
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {cat === "payment" && (
                  <p className={`text-[10px] leading-relaxed pb-1 ${mutedText}`}>
                    Links open external payment services (PayPal, Cash App, Zelle, etc.). Bingoo does not process or hold payments.
                  </p>
                )}
                {filtered.map(item => (
                  <CatalogRow key={item.id} item={item} added={isAdded(item)}
                    valuePreview={getValuePreview(item)} onEdit={() => setEditing(item)} isDark={isDark} />
                ))}
              </div>
            )}
          </div>


        </>
      )}
    </div>
  );
}