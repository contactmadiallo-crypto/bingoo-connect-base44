import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, CalendarDays, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { MobileSelect } from "@/components/ui/mobile-select";

const DAYS = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];

const LAW_CASE_TYPES = [
  "Immigration", "Criminal Defense", "Civil Litigation", "Family Law",
  "Personal Injury", "Business Law", "Real Estate Law", "Other"
];

const RATE_LIMIT_KEY = "bingoo_appt_last_submit";
const RATE_LIMIT_MS = 60_000;

function generateSlots(start, end, duration, buffer = 0) {
  const slots = [];
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let cur = sh * 60 + sm;
  const endMin = eh * 60 + em;
  const step = duration + (buffer || 0);
  while (cur + duration <= endMin) {
    const h = Math.floor(cur / 60).toString().padStart(2, "0");
    const m = (cur % 60).toString().padStart(2, "0");
    slots.push(`${h}:${m}`);
    cur += step;
  }
  return slots;
}

function addDays(date, n) {
  const d = new Date(date); d.setDate(d.getDate() + n); return d;
}
function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function parseLocalDate(ds) { return new Date(ds + "T00:00:00"); }

// Detect profile type from plan
function getProfileType(profile) {
  const plan = profile?.plan || "free";
  if (plan === "lawfirm") return "law_firm";
  if (plan === "salon") return "salon";
  if (plan === "restaurant") return "restaurant";
  return "general";
}

export default function AppointmentBooking({ profile, onClose, prefilledService, prefilledStylist }) {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const profileType = getProfileType(profile);
  const color = profile.cover_color || "#2563eb";

  // Load salon team members for stylist picker
  const { data: teamMembers = [] } = useQuery({
    queryKey: ["public-salon-team-booking", profile.id],
    queryFn: () => base44.entities.TeamMember.filter({ profile_id: profile.id, status: "active" }, "order", 50),
    enabled: profileType === "salon",
  });
  const hours = profile.business_hours || {};
  const duration = profile.booking_slot_duration || 30;
  const restricted = profile.booking_restricted_emails || [];

  let buffer = 0;
  let holidays = [];
  try {
    const meta = JSON.parse(profile.description || "{}");
    buffer = meta.buffer || 0;
    holidays = meta.holidays || [];
  } catch {}
  const holidaySet = new Set(holidays);

  // Form state — unified for all profile types
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    service_name: prefilledService?.name || "",
    stylist_name: prefilledStylist || "",
    guest_count: 2,
    case_type: "Immigration", a_number: "", case_number: "",
    notes: "",
  });

  // Sync prefilled stylist/service if they change after mount (e.g. opened from stylist card)
  useEffect(() => {
    if (prefilledStylist) setForm(f => ({ ...f, stylist_name: prefilledStylist }));
  }, [prefilledStylist]);
  useEffect(() => {
    if (prefilledService?.name) setForm(f => ({ ...f, service_name: prefilledService.name }));
  }, [prefilledService]);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const today = new Date(); today.setHours(0,0,0,0);
  const weekStart = addDays(today, weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const dayConfig = d => hours[DAYS[d.getDay()]] || {};

  const slots = selectedDate ? (() => {
    const d = parseLocalDate(selectedDate);
    const cfg = hours[DAYS[d.getDay()]];
    if (!cfg || !cfg.enabled || !cfg.start || !cfg.end) return [];
    return generateSlots(cfg.start, cfg.end, duration, buffer);
  })() : [];

  const handleBook = async () => {
    if (!form.name || !form.email) { setError("Name and email are required."); return; }
    const last = localStorage.getItem(RATE_LIMIT_KEY);
    if (last && Date.now() - parseInt(last) < RATE_LIMIT_MS) {
      const rem = Math.ceil((RATE_LIMIT_MS - (Date.now() - parseInt(last))) / 1000);
      setError(`Please wait ${rem}s before submitting another booking.`);
      return;
    }
    localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
    setSaving(true); setError("");

    const payload = {
      profile_id: profile.id,
      visitor_name: form.name,
      visitor_email: form.email,
      visitor_phone: form.phone,
      date: selectedDate,
      time_slot: selectedSlot,
      notes: form.notes,
      restricted_emails: restricted,
      duration,
      source: "profile",
    };

    // Industry-specific fields
    if (profileType === "salon") {
      payload.service_name = form.service_name;
      payload.stylist_name = form.stylist_name;
    } else if (profileType === "restaurant") {
      payload.guest_count = parseInt(form.guest_count) || 2;
    } else if (profileType === "law_firm") {
      payload.service_name = form.case_type;
      payload.case_type = form.case_type;
      payload.a_number = form.a_number;
      payload.case_number = form.case_number;
    } else if (form.service_name) {
      payload.service_name = form.service_name;
    }

    const res = await base44.functions.invoke("createPublicAppointment", payload);
    setSaving(false);
    if (res.data?.error) { setError(res.data.error); return; }

    base44.entities.Analytics.create({
      profile_id: profile.id,
      event_type: "appointment_booked",
      visitor_device: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
      created_at: new Date().toISOString(),
    }).catch(() => {});
    setStep(3);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-2 pb-0">
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color + "20" }}>
              <CalendarDays className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <h2 className="font-black text-slate-900 dark:text-white">
                {profileType === "restaurant" ? "Make a Reservation" : "Book an Appointment"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">with {profile.display_name}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="p-6">
          {/* STEP 1 — Pick date & time */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between mb-2">
                <button onClick={() => setWeekOffset(w => Math.max(0, w - 1))} disabled={weekOffset === 0}
                  className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {weekStart.toLocaleDateString("en", { month: "short", day: "numeric" })} – {addDays(weekStart, 6).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                </p>
                <button onClick={() => setWeekOffset(w => w + 1)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map(d => {
                  const cfg = dayConfig(d);
                  const available = cfg.enabled && cfg.start && cfg.end && !holidaySet.has(formatDate(d));
                  const isPast = formatDate(d) < formatDate(today);
                  const ds = formatDate(d);
                  const selected = selectedDate === ds;
                  return (
                    <button key={ds} disabled={!available || isPast}
                      onClick={() => { setSelectedDate(ds); setSelectedSlot(null); }}
                      className={`flex flex-col items-center py-2 rounded-xl text-xs font-semibold transition-all ${selected ? "text-white shadow-md" : available && !isPast ? "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200" : "bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed"}`}
                      style={selected ? { background: color } : {}}>
                      <span className="text-xs font-bold uppercase opacity-60">{d.toLocaleDateString("en", { weekday: "short" })}</span>
                      <span>{d.getDate()}</span>
                    </button>
                  );
                })}
              </div>

              {selectedDate && (
                <div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />Available slots
                  </p>
                  {slots.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-4">No slots available this day.</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {slots.map(s => (
                        <button key={s} onClick={() => setSelectedSlot(s)}
                          className={`py-2 rounded-xl text-sm font-semibold transition-all border ${selectedSlot === s ? "text-white border-transparent shadow" : "border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-blue-300 bg-white dark:bg-slate-800"}`}
                          style={selectedSlot === s ? { background: color, borderColor: color } : {}}>
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <Button disabled={!selectedDate || !selectedSlot} onClick={() => setStep(2)}
                className="w-full h-12 text-base font-bold mt-2" style={{ background: color, borderColor: color }}>
                Continue →
              </Button>
            </div>
          )}

          {/* STEP 2 — Info form (industry-specific) */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-sm flex items-center gap-3 mb-2">
                <CalendarDays className="w-4 h-4 flex-shrink-0" style={{ color }} />
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {parseLocalDate(selectedDate).toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })} at {selectedSlot}
                </span>
              </div>

              {/* Common fields */}
              <div>
                <Label>Your Name *</Label>
                <Input className="mt-1" placeholder="Full name" value={form.name} onChange={set("name")} />
              </div>
              <div>
                <Label>Email *</Label>
                <Input className="mt-1" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} />
              </div>
              <div>
                <Label>Phone (optional)</Label>
                <Input className="mt-1" placeholder="+1 234 567 8900" value={form.phone} onChange={set("phone")} />
              </div>

              {/* Salon-specific */}
              {profileType === "salon" && (
                <>
                  <div>
                    <Label>Service *</Label>
                    <Input className="mt-1" placeholder="e.g. Haircut, Color, Nails…" value={form.service_name} onChange={set("service_name")} />
                  </div>
                  <div>
                    <Label>Preferred Stylist (optional)</Label>
                    {teamMembers.length > 0 ? (
                      <MobileSelect
                        value={form.stylist_name || "none"}
                        onValueChange={(v) => setForm(f => ({ ...f, stylist_name: v === "none" ? "" : v }))}
                        options={[
                          { value: "none", label: "No preference" },
                          ...teamMembers.map(m => ({ value: m.name, label: m.role ? `${m.name} — ${m.role}` : m.name }))
                        ]}
                        placeholder="No preference"
                        ariaLabel="Preferred stylist"
                        className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                      />
                    ) : (
                      <Input className="mt-1" placeholder="Stylist name or 'No preference'" value={form.stylist_name} onChange={set("stylist_name")} />
                    )}
                  </div>
                </>
              )}

              {/* Restaurant-specific */}
              {profileType === "restaurant" && (
                <div>
                  <Label>Number of Guests *</Label>
                  <MobileSelect
                    value={String(form.guest_count)}
                    onValueChange={(v) => setForm(f => ({ ...f, guest_count: parseInt(v) }))}
                    options={[1,2,3,4,5,6,7,8,10,12,15,20].map(n => ({ value: String(n), label: `${n} ${n === 1 ? "guest" : "guests"}` }))}
                    ariaLabel="Number of guests"
                    className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                  />
                </div>
              )}

              {/* Law firm-specific */}
              {profileType === "law_firm" && (
                <>
                  <div>
                    <Label>Case Type *</Label>
                    <MobileSelect
                      value={form.case_type}
                      onValueChange={(v) => setForm(f => ({ ...f, case_type: v }))}
                      options={LAW_CASE_TYPES.map(t => ({ value: t, label: t }))}
                      ariaLabel="Case type"
                      className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                    />
                  </div>
                  {form.case_type === "Immigration" && (
                    <div>
                      <Label>A-Number (if applicable)</Label>
                      <Input className="mt-1" placeholder="A-000-000-000" value={form.a_number} onChange={set("a_number")} />
                    </div>
                  )}
                  <div>
                    <Label>Case / Reference Number (optional)</Label>
                    <Input className="mt-1" placeholder="Case number" value={form.case_number} onChange={set("case_number")} />
                  </div>
                </>
              )}

              {/* General service */}
              {profileType === "general" && (
                <div>
                  <Label>Service / Reason (optional)</Label>
                  <Input className="mt-1" placeholder="What would you like to discuss?" value={form.service_name} onChange={set("service_name")} />
                </div>
              )}

              <div>
                <Label>Notes (optional)</Label>
                <Textarea className="mt-1" placeholder="Any additional information…" value={form.notes} onChange={set("notes")} rows={3} />
              </div>

              {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">{error}</p>}

              <div className="flex gap-3 pt-1">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">← Back</Button>
                <Button disabled={saving} onClick={handleBook} className="flex-1 font-bold" style={{ background: color }}>
                  {saving ? "Booking..." : profileType === "restaurant" ? "Reserve Table" : "Confirm Booking"}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3 — Success */}
          {step === 3 && (
            <div className="text-center py-6">
              <div className="text-5xl mb-4">{profileType === "restaurant" ? "🍽️" : "🎉"}</div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                {profileType === "restaurant" ? "Reservation Requested!" : "Appointment Requested!"}
              </h3>
              <p className="text-slate-500 dark:text-slate-300 text-sm mb-1">
                {parseLocalDate(selectedDate).toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })} at {selectedSlot}
                {form.guest_count && profileType === "restaurant" ? ` · ${form.guest_count} guests` : ""}
              </p>
              <p className="text-slate-400 text-sm mb-6">You'll be notified once confirmed.</p>
              <Button onClick={onClose} className="font-bold px-8" style={{ background: color }}>Done</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}