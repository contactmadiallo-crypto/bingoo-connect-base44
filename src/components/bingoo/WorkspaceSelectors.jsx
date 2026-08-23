import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { usePlan } from "@/hooks/usePlan";
import ProfileTypeSelector from "@/components/bingoo/ProfileTypeSelector";
import {
  Check,
  ChevronDown,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Smartphone,
  UserRound,
} from "lucide-react";

const STATUS_STYLES = {
  Live: "bg-emerald-100 text-emerald-700",
  Hidden: "bg-slate-100 text-slate-600",
  Inactive: "bg-amber-100 text-amber-700",
  Locked: "bg-rose-100 text-rose-700",
  Archived: "bg-slate-200 text-slate-600",
};

function initials(value) {
  return String(value || "Profile")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function ProfileAvatar({ profile, size = 36 }) {
  const style = {
    width: size,
    height: size,
    background: profile?.cover_color || "#f97316",
  };

  if (profile?.profile_photo) {
    return (
      <img
        src={profile.profile_photo}
        alt=""
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      className="rounded-full flex items-center justify-center text-white font-black flex-shrink-0"
      style={{ ...style, fontSize: Math.max(11, Math.round(size * 0.34)) }}
      aria-hidden="true"
    >
      {initials(profile?.display_name)}
    </span>
  );
}

export function ProfileSelectorDropdown({
  profiles,
  selectedProfile,
  onSelectProfile,
  isDark = false,
  compact = false,
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [typeOpen, setTypeOpen] = useState(false);
  const [typeSaving, setTypeSaving] = useState(false);
  const [typeError, setTypeError] = useState("");
  const [localProfile, setLocalProfile] = useState(selectedProfile || null);
  const rootRef = useRef(null);
  const menuId = useId();
  const qc = useQueryClient();
  const { plan: userPlan } = usePlan();

  useEffect(() => {
    setLocalProfile(selectedProfile || null);
    setTypeOpen(false);
    setTypeError("");
  }, [selectedProfile?.id, selectedProfile?.profile_category, selectedProfile?.profile_type]);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const selectedIndex = profiles.findIndex((profile) => profile.id === selectedProfile?.id);
    setActiveIndex(Math.max(0, selectedIndex));
  }, [open, profiles, selectedProfile?.id]);

  const choose = (profile) => {
    if (!profile || profile.id === selectedProfile?.id) {
      setOpen(false);
      return;
    }
    onSelectProfile(profile.id);
    setOpen(false);
  };

  const saveProfileType = async (category) => {
    if (!selectedProfile?.id || !category || typeSaving) return;
    setTypeSaving(true);
    setTypeError("");
    try {
      const response = await base44.functions.invoke("updateProfileGated", {
        profile_id: selectedProfile.id,
        data: {
          profile_category: category.id,
          profile_type: category.profileType,
        },
      });
      const fresh = response?.data?.profile || {
        ...localProfile,
        profile_category: category.id,
        profile_type: category.profileType,
      };
      setLocalProfile(fresh);
      qc.setQueryData(["profile-ws", selectedProfile.id], (current) => ({
        ...(current || selectedProfile),
        ...fresh,
      }));
      qc.invalidateQueries({ queryKey: ["my-profile"] });
      qc.invalidateQueries({ queryKey: ["my-profiles"] });
    } catch (error) {
      setTypeError(error?.message || "Could not save profile type.");
    } finally {
      setTypeSaving(false);
    }
  };

  const onKeyDown = (event) => {
    if (!open && ["ArrowDown", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      setOpen(true);
      return;
    }
    if (!open || typeOpen) return;
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % profiles.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + profiles.length) % profiles.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      choose(profiles[activeIndex]);
    }
  };

  if (!selectedProfile) return null;

  const displayProfile = localProfile || selectedProfile;
  const panel = isDark
    ? "bg-[#111827] border-white/10 text-white"
    : "bg-white border-slate-200 text-slate-900";
  const secondary = isDark ? "text-white/45" : "text-slate-500";

  return (
    <div ref={rootRef} className="relative min-w-0" onKeyDown={onKeyDown}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className={`min-h-[44px] flex items-center gap-2 rounded-2xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${compact ? "px-2.5" : "px-3"} ${isDark ? "border-white/10 bg-white/8 hover:bg-white/12 text-white" : "border-slate-200 bg-white hover:border-slate-300 text-slate-900 shadow-sm"}`}
      >
        <ProfileAvatar profile={displayProfile} size={32} />
        <span className="min-w-0 text-left hidden sm:block">
          <span className="block text-xs font-black truncate max-w-[130px]">
            {displayProfile.display_name || "Profile"}
          </span>
          <span className={`block text-[10px] font-semibold truncate max-w-[130px] ${secondary}`}>
            @{displayProfile.username || "profile"}
          </span>
        </span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""} ${secondary}`} />
      </button>

      {open && (
        <div
          id={menuId}
          role="listbox"
          aria-label="Select profile workspace"
          className={`absolute right-0 mt-2 w-[min(420px,calc(100vw-24px))] max-h-[78vh] overflow-y-auto rounded-2xl border shadow-2xl p-2 z-50 ${panel}`}
        >
          <div className="px-3 pt-2 pb-2">
            <p className="text-xs font-black">Profile workspace</p>
            <p className={`text-[11px] mt-0.5 ${secondary}`}>Account identity stays signed in while you switch.</p>
          </div>

          {!typeOpen && profiles.map((profile, index) => {
            const selected = profile.id === selectedProfile.id;
            const status = profile.profile_status || "Live";
            return (
              <button
                type="button"
                role="option"
                aria-selected={selected}
                key={profile.id}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(profile)}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${index === activeIndex ? (isDark ? "bg-white/10" : "bg-slate-50") : ""}`}
              >
                <ProfileAvatar profile={profile} size={40} />
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-black truncate">{profile.display_name || "Untitled profile"}</span>
                    {profile.is_primary && (
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase">Primary</span>
                    )}
                    {profile.access_role && profile.access_role !== "owner" && (
                      <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[9px] font-black uppercase">{profile.access_role}</span>
                    )}
                  </span>
                  <span className={`block text-xs truncate ${secondary}`}>@{profile.username || "profile"}</span>
                </span>
                <span className={`px-2 py-1 rounded-full text-[10px] font-black ${STATUS_STYLES[status] || STATUS_STYLES.Live}`}>
                  {status}
                </span>
                {selected && <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
              </button>
            );
          })}

          <div className="mt-2 pt-2 border-t border-current/10">
            {!typeOpen ? (
              <button
                type="button"
                onClick={() => setTypeOpen(true)}
                className={`w-full flex items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition-colors ${isDark ? "hover:bg-white/10" : "hover:bg-slate-50"}`}
              >
                <span>
                  <span className="block text-sm font-black">Profile Type</span>
                  <span className={`block text-xs mt-0.5 ${secondary}`}>Choose the role and public action for this profile.</span>
                </span>
                <ChevronDown className="w-4 h-4 -rotate-90 flex-shrink-0" />
              </button>
            ) : (
              <div className="p-2">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setTypeOpen(false)}
                    className={`text-xs font-black px-2.5 py-1.5 rounded-lg ${isDark ? "bg-white/8 text-white/70" : "bg-slate-100 text-slate-600"}`}
                  >
                    ← Profiles
                  </button>
                  {typeSaving && <span className={`text-[11px] font-semibold ${secondary}`}>Saving…</span>}
                </div>
                <ProfileTypeSelector
                  profile={displayProfile}
                  plan={userPlan || "free"}
                  isDark={isDark}
                  onChange={saveProfileType}
                />
                {typeError && <p className="text-xs font-semibold text-red-500 mt-3">{typeError}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function AccountDropdown({ user, plan = "free", logout, isDark = false }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const menuId = useId();
  const name = user?.full_name || user?.name || user?.email?.split("@")[0] || "Account";
  const planLabel = String(plan || "free").replace(/[-_]/g, " ");

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  const panel = isDark
    ? "bg-[#111827] border-white/10 text-white"
    : "bg-white border-slate-200 text-slate-900";
  const secondary = isDark ? "text-white/45" : "text-slate-500";
  const item = `min-h-[44px] w-full flex items-center gap-3 px-3 rounded-xl text-sm font-bold transition-colors ${isDark ? "hover:bg-white/10 text-white/75" : "hover:bg-slate-50 text-slate-700"}`;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className={`min-h-[44px] flex items-center gap-2 rounded-full border pl-1.5 pr-3 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${isDark ? "bg-white/8 border-white/10 text-white hover:bg-white/12" : "bg-white border-slate-200 text-slate-900 shadow-sm hover:border-slate-300"}`}
      >
        {user?.avatar_url ? (
          <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white bg-gradient-to-br from-orange-500 to-amber-400">
            {initials(name)}
          </span>
        )}
        <span className="hidden sm:block max-w-[110px] truncate text-xs font-black">{name.split(" ")[0]}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""} ${secondary}`} />
      </button>

      {open && (
        <div id={menuId} role="menu" className={`absolute right-0 mt-2 w-[min(310px,calc(100vw-24px))] rounded-2xl border shadow-2xl p-2 z-50 ${panel}`}>
          <div className="px-3 py-3 border-b border-current/10">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-black text-white bg-gradient-to-br from-orange-500 to-amber-400">
                {initials(name)}
              </span>
              <div className="min-w-0">
                <p className="font-black truncate">{name}</p>
                <p className={`text-xs truncate ${secondary}`}>{user?.email}</p>
                <span className="inline-flex mt-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-black uppercase">{planLabel}</span>
              </div>
            </div>
          </div>

          <div className="py-2">
            <Link role="menuitem" to="/bingoo?view=home" onClick={() => setOpen(false)} className={item}>
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
            <Link role="menuitem" to="/bingoo?view=qrwallet" onClick={() => setOpen(false)} className={item}>
              <Smartphone className="w-4 h-4" /> My NFC & QR
            </Link>
            <Link role="menuitem" to="/account-settings" onClick={() => setOpen(false)} className={item}>
              <Settings className="w-4 h-4" /> Account Settings
            </Link>
            <Link role="menuitem" to="/billing" onClick={() => setOpen(false)} className={item}>
              <CreditCard className="w-4 h-4" /> Plan & Billing
            </Link>
          </div>

          <div className="pt-2 border-t border-current/10">
            <div className={`px-3 py-2 flex items-center gap-2 text-[11px] ${secondary}`}>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Signed in as this account</span>
            </div>
            <button
              type="button"
              role="menuitem"
              onClick={() => logout()}
              className={`${item} text-rose-500 ${isDark ? "hover:bg-rose-500/10" : "hover:bg-rose-50"}`}
            >
              <LogOut className="w-4 h-4" /> Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function UnsavedProfileSwitchModal({ profile, onCancel, onConfirm, isDark = false }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="unsaved-profile-title">
      <div className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 ${isDark ? "bg-[#111827] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
          <UserRound className="w-6 h-6" />
        </div>
        <h2 id="unsaved-profile-title" className="text-xl font-black">Switch profile?</h2>
        <p className={`mt-2 text-sm leading-relaxed ${isDark ? "text-white/55" : "text-slate-600"}`}>
          Your unsaved changes will be discarded before opening {profile?.display_name || "the selected profile"}.
          Your signed-in account, email, plan, settings, and logout identity will not change.
        </p>
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button type="button" onClick={onCancel} className={`min-h-[44px] px-4 rounded-xl font-bold ${isDark ? "bg-white/8 text-white" : "bg-slate-100 text-slate-700"}`}>Cancel</button>
          <button type="button" onClick={onConfirm} className="min-h-[44px] px-4 rounded-xl font-black text-white bg-orange-500 hover:bg-orange-600">Switch Profile</button>
        </div>
      </div>
    </div>
  );
}
