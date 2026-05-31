import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, MessageSquarePlus, CheckCircle } from "lucide-react";

export default function RequestInfoModal({ profileId, onClose }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!form.name && !form.phone && !form.email) return;
    setLoading(true);
    await base44.entities.Lead.create({ profile_id: profileId, ...form });
    setLoading(false);
    setDone(true);
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <MessageSquarePlus className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-black text-slate-900">Request Info</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {done ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-900">Message Sent!</h3>
            <p className="text-slate-500 mt-2">We'll get back to you as soon as possible.</p>
            <Button onClick={onClose} className="mt-6 bg-blue-600 hover:bg-blue-700 px-8">Close</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Your Name</Label>
              <Input className="mt-1 border-slate-200" placeholder="Amadou Diallo" value={form.name} onChange={set("name")} />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input className="mt-1 border-slate-200" placeholder="+221 77 000 0000" value={form.phone} onChange={set("phone")} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" className="mt-1 border-slate-200" placeholder="you@email.com" value={form.email} onChange={set("email")} />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea className="mt-1 border-slate-200" placeholder="What would you like to know?" value={form.message} onChange={set("message")} rows={3} />
            </div>
            <Button onClick={handleSubmit} disabled={loading || (!form.name && !form.phone && !form.email)} className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base">
              {loading ? "Sending..." : "Send Request"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}