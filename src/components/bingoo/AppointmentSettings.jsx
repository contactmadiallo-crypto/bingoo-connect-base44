import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, Save, CheckCircle, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const DAYS = [
  { key: "monday",    label: "Mon" },
  { key: "tuesday",   label: "Tue" },
  { key: "wednesday", label: "Wed" },
  { key: "thursday",  label: "Thu" },
  { key: "friday",    label: "Fri" },
  { key: "saturday",  label: "Sat" },
  { key: "sunday",    label: "Sun" },
];

const DURATIONS = [15, 30, 45, 60];

const APPT_TYPES = [
  { value: "in_person",   label: "In-Person",    emoji: "🤝" },
  { value: "phone_call",  label: "Phone Call",   emoji: "📞" },
  { value: "whatsapp",    label: "WhatsApp Call", emoji: "💬" },
  { value: "video_call",  label: "Video Call",   emoji: "📹" },
];

const DEFAULT_HOURS = {
  monday:    { enabled: true,  start: "09:00", end: "17:00" },
  tuesday:   { enabled: true,  start: "09:00", end: "17:00" },
  wednesday: { enabled: true,  start: "09:00", end: "17:00" },
  thursday:  { enabled: true,  start: "09:00", end: "17:00" },
  friday:    { enabled: true,  start: "09:00", end: "17:00" },
  saturday:  { enabled: false, start: "10:00", end: "14:00" },
  sunday:    { enabled: false, start: "10:00", end: "14:00" },
};

export default function AppointmentSettings({ profileId }) {
  const qc = useQueryClient();
  const [hours, setHours] = useState(DEFAULT_HOURS);
  const [duration, setDuration] = useState(30);
  const [bookingEnabled, setBookingEnabled] = useState(false);
  const [apptType, setApptType] = useState("in_person");
  const [holidayInput, setHolidayInput] = useState("");
  const [holidays, setHolidays] = useState([]);
  const [saved, setSaved] = useState(false);

  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles-appt-settings", profileId],
    queryFn: () => base44.entities.Profile.filter({ id: profileId }),
    enabled: !!profileId,
  });
  const profile = profiles[0];

  useEffect(() => {
    if (!profile) return;
    if (profile.business_hours && Object.keys(profile.business_hours).length > 0) {
      setHours({ ...DEFAULT_HOURS, ...profile.business_hours });
    }
    setDuration(profile.booking_slot_duration || 30);
    setBookingEnabled(profile.booking_enabled || false);
    if (profile.description) {
      try {
        const meta = JSON.parse(profile.description);
        if (meta.appt_type) setApptType(meta.appt_type);
        if (meta.holidays) setHolidays(meta.holidays);
      } catch {}
    }
  }, [profile]);

  const save = useMutation({
    mutationFn: () => {
      const meta = JSON.stringify({ appt_type: apptType, holidays });
      return base44.entities.Profile.update(profileId, {
        business_hours: hours,
        booking_slot_duration: duration,
        booking_enabled: bookingEnabled,
        description: meta,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profiles-appt-settings", profileId] });
      setSaved(true);
      toast.success("Appointment settings saved!");
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const toggleDay = (day) => {
    setHours(h => ({ ...h, [day]: { ...h[day], enabled: !h[day].enabled } }));
  };

  const setDayTime = (day, field, val) => {
    setHours(h => ({ ...h, [day]: { ...h[day], [field]: val } }));
  };

  const addHoliday = () => {
    if (!holidayInput) return;
    setHolidays(hs => [...new Set([...hs, holidayInput])]);
    setHolidayInput("");
  };

  const removeHoliday = (d) => setHolidays(hs => hs.filter(h => h !== d));

  if (!profileId) return <div className="text-slate-400 text-center py-8">Select a profile first.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-900">Appointment Settings</h2>
        <Button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className={`gap-2 font-bold ${saved ? "bg-green-600 hover:bg-green-600" : "bg-blue-600 hover:bg-blue-500"}`}
        >
          {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" />{save.isPending ? "Saving…" : "Save Settings"}</>}
        </Button>
      </div>

      {/* Enable Toggle */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="font-bold text-slate-900">Enable Appointment Booking</p>
          <p className="text-sm text-slate-500 mt-0.5">Allow visitors to book time with you from your public profile</p>
        </div>
        <button
          onClick={() => setBookingEnabled(v => !v)}
          className={`relative w-12 h-6 rounded-full transition-colors ${bookingEnabled ? "bg-blue-600" : "bg-slate-200"}`}
        >
          <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${bookingEnabled ? "translate-x-6" : ""}`} />
        </button>
      </div>

      {bookingEnabled && (
        <>
          {/* Appointment Type */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5">
            <p className="font-bold text-slate-900 mb-3 flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-500" /> Appointment Type</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {APPT_TYPES.map(t => (
                <button key={t.value} onClick={() => setApptType(t.value)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-bold transition-all ${apptType === t.value ? "border-blue-500 bg-blue-50 text-blue-700 shadow" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                  <span className="text-xl">{t.emoji}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Slot Duration */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5">
            <p className="font-bold text-slate-900 mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /> Slot Duration</p>
            <div className="flex gap-2 flex-wrap">
              {DURATIONS.map(d => (
                <button key={d} onClick={() => setDuration(d)}
                  className={`px-5 py-2.5 rounded-xl border text-sm font-bold transition-all ${duration === d ? "border-blue-500 bg-blue-600 text-white shadow" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                  {d} min
                </button>
              ))}
            </div>
          </div>

          {/* Weekly Availability */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5">
            <p className="font-bold text-slate-900 mb-4">Weekly Availability</p>
            <div className="space-y-3">
              {DAYS.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <button onClick={() => toggleDay(key)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black border transition-all flex-shrink-0 ${hours[key]?.enabled ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 text-slate-400 border-slate-200"}`}>
                    {label}
                  </button>
                  {hours[key]?.enabled ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input type="time" value={hours[key]?.start || "09:00"}
                        onChange={e => setDayTime(key, "start", e.target.value)}
                        className="border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-blue-400" />
                      <span className="text-slate-400 text-sm font-medium">to</span>
                      <input type="time" value={hours[key]?.end || "17:00"}
                        onChange={e => setDayTime(key, "end", e.target.value)}
                        className="border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-blue-400" />
                    </div>
                  ) : (
                    <span className="text-slate-400 text-sm">Closed</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Holidays / Closed Days */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5">
            <p className="font-bold text-slate-900 mb-3">Holiday / Closed Days</p>
            <div className="flex gap-2 mb-3">
              <input type="date" value={holidayInput} onChange={e => setHolidayInput(e.target.value)}
                className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400" />
              <Button onClick={addHoliday} disabled={!holidayInput} size="sm" className="bg-blue-600 hover:bg-blue-500 gap-1">
                <Plus className="w-4 h-4" /> Add
              </Button>
            </div>
            {holidays.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {holidays.map(d => (
                  <div key={d} className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-1.5 text-xs font-semibold">
                    {new Date(d + "T00:00:00").toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                    <button onClick={() => removeHoliday(d)} className="hover:text-red-900 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {holidays.length === 0 && <p className="text-slate-400 text-sm">No closed days added.</p>}
          </div>
        </>
      )}
    </div>
  );
}