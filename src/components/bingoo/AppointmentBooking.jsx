import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, CalendarDays, Clock, ChevronLeft, ChevronRight } from "lucide-react";

const DAYS = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];

function generateSlots(start, end, duration) {
  const slots = [];
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let cur = sh * 60 + sm;
  const endMin = eh * 60 + em;
  while (cur + duration <= endMin) {
    const h = Math.floor(cur / 60).toString().padStart(2, "0");
    const m = (cur % 60).toString().padStart(2, "0");
    slots.push(`${h}:${m}`);
    cur += duration;
  }
  return slots;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

export default function AppointmentBooking({ profile, onClose }) {
  const [step, setStep] = useState(1); // 1=pick date+slot, 2=enter info, 3=done
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [weekOffset, setWeekOffset] = useState(0);

  const color = profile.cover_color || "#2563eb";
  const hours = profile.business_hours || {};
  const duration = profile.booking_slot_duration || 30;
  const restricted = profile.booking_restricted_emails || [];

  // Build 7-day window starting from today + weekOffset*7
  const today = new Date();
  today.setHours(0,0,0,0);
  const weekStart = addDays(today, weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const dayConfig = (d) => {
    const name = DAYS[d.getDay()];
    return hours[name] || {};
  };

  const slots = selectedDate ? (() => {
    const d = new Date(selectedDate);
    const name = DAYS[d.getDay()];
    const cfg = hours[name];
    if (!cfg || !cfg.enabled || !cfg.start || !cfg.end) return [];
    return generateSlots(cfg.start, cfg.end, duration);
  })() : [];

  const handleBook = async () => {
    if (!form.name || !form.email) { setError("Name and email are required."); return; }
    setSaving(true);
    setError("");
    const res = await base44.functions.invoke("createPublicAppointment", {
      profile_id: profile.id,
      visitor_name: form.name,
      visitor_email: form.email,
      visitor_phone: form.phone,
      date: selectedDate,
      time_slot: selectedSlot,
      notes: form.notes,
      restricted_emails: restricted,
    });
    setSaving(false);
    if (res.data?.error) {
      setError(res.data.error);
      return;
    }
    setStep(3);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color + "20" }}>
              <CalendarDays className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <h2 className="font-black text-slate-900">Book an Appointment</h2>
              <p className="text-xs text-slate-500">with {profile.display_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-5">
              {/* Week navigation */}
              <div className="flex items-center justify-between mb-2">
                <button onClick={() => setWeekOffset(w => Math.max(0, w - 1))} disabled={weekOffset === 0} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <p className="text-sm font-semibold text-slate-700">
                  {weekStart.toLocaleDateString("en", { month: "short", day: "numeric" })} – {addDays(weekStart, 6).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                </p>
                <button onClick={() => setWeekOffset(w => w + 1)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Day pills */}
              <div className="grid grid-cols-7 gap-1">
                {days.map(d => {
                  const cfg = dayConfig(d);
                  const available = cfg.enabled && cfg.start && cfg.end;
                  const isPast = d < today;
                  const ds = formatDate(d);
                  const selected = selectedDate === ds;
                  return (
                    <button key={ds} disabled={!available || isPast}
                      onClick={() => { setSelectedDate(ds); setSelectedSlot(null); }}
                      className={`flex flex-col items-center py-2 rounded-xl text-xs font-semibold transition-all ${selected ? "text-white shadow-md" : available && !isPast ? "bg-slate-50 hover:bg-slate-100 text-slate-700" : "bg-slate-50 text-slate-300 cursor-not-allowed"}`}
                      style={selected ? { background: color } : {}}>
                      <span className="text-[10px] font-bold uppercase opacity-60">{d.toLocaleDateString("en", { weekday: "short" })}</span>
                      <span>{d.getDate()}</span>
                    </button>
                  );
                })}
              </div>

              {/* Time slots */}
              {selectedDate && (
                <div>
                  <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Clock className="w-4 h-4" />Available slots</p>
                  {slots.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-4">No slots available this day.</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {slots.map(s => (
                        <button key={s} onClick={() => setSelectedSlot(s)}
                          className={`py-2 rounded-xl text-sm font-semibold transition-all border ${selectedSlot === s ? "text-white border-transparent shadow" : "border-slate-200 text-slate-700 hover:border-blue-300 bg-white"}`}
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

          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-2xl p-4 text-sm flex items-center gap-3 mb-2">
                <CalendarDays className="w-4 h-4 flex-shrink-0" style={{ color }} />
                <span className="font-semibold text-slate-700">
                  {new Date(selectedDate).toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })} at {selectedSlot}
                </span>
              </div>
              <div>
                <Label>Your Name *</Label>
                <Input className="mt-1" placeholder="Full name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
              </div>
              <div>
                <Label>Email *</Label>
                <Input className="mt-1" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
                {restricted.length > 0 && <p className="text-xs text-amber-600 mt-1">⚠️ Booking is restricted to approved emails only.</p>}
              </div>
              <div>
                <Label>Phone (optional)</Label>
                <Input className="mt-1" placeholder="+1 234 567 8900" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} />
              </div>
              <div>
                <Label>Notes (optional)</Label>
                <Textarea className="mt-1" placeholder="What would you like to discuss?" value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} rows={3} />
              </div>
              {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">{error}</p>}
              <div className="flex gap-3 pt-1">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">← Back</Button>
                <Button disabled={saving} onClick={handleBook} className="flex-1 font-bold" style={{ background: color }}>
                  {saving ? "Booking..." : "Confirm Booking"}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-6">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Appointment Requested!</h3>
              <p className="text-slate-500 text-sm mb-1">
                {new Date(selectedDate).toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })} at {selectedSlot}
              </p>
              <p className="text-slate-400 text-sm mb-6">You'll be notified once your appointment is confirmed.</p>
              <Button onClick={onClose} className="font-bold px-8" style={{ background: color }}>Done</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}