import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const linkTypes = [
  { value: "website", label: "Website", icon: "🌐" },
  { value: "whatsapp", label: "WhatsApp", icon: "💬" },
  { value: "instagram", label: "Instagram", icon: "📸" },
  { value: "tiktok", label: "TikTok", icon: "🎵" },
  { value: "youtube", label: "YouTube", icon: "▶️" },
  { value: "twitter", label: "Twitter / X", icon: "🐦" },
  { value: "linkedin", label: "LinkedIn", icon: "💼" },
  { value: "email", label: "Email", icon: "📧" },
  { value: "phone", label: "Phone", icon: "📞" },
  { value: "other", label: "Other", icon: "🔗" },
];

export default function LinkForm({ open, onOpenChange, onSave, initial }) {
  const [form, setForm] = useState(initial || { title: "", url: "", type: "website", icon: "", order: 0 });

  const handleSave = () => {
    if (!form.title || !form.url) return;
    const selectedType = linkTypes.find(t => t.value === form.type);
    onSave({ ...form, icon: form.icon || selectedType?.icon });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Link" : "Add Link"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Type</Label>
            <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {linkTypes.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.icon} {t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Title</Label>
            <Input className="mt-1" placeholder="e.g. My Instagram" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <Label>URL</Label>
            <Input className="mt-1" placeholder="https://..." value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
          </div>
          <div>
            <Label>Custom Emoji (optional)</Label>
            <Input className="mt-1" placeholder="🔥" maxLength={2} value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">Save Link</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}