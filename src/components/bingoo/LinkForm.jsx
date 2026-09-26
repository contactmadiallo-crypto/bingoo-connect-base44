import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MobileSelect } from "@/components/ui/mobile-select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useI18n } from '@/lib/I18nContext';

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
  const { language } = useI18n();
  const tr = (en, fr) => language === 'fr' ? fr : en;
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
          <DialogTitle>{initial ? tr('Edit Link', 'Modifier le lien') : tr('Add Link', 'Ajouter un lien')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>{tr('Type', 'Type')}</Label>
            <MobileSelect
              value={form.type}
              onValueChange={v => setForm({ ...form, type: v })}
              options={linkTypes.map(t => ({ value: t.value, label: t.icon + ' ' + t.label }))}
              ariaLabel="Link type"
              className="mt-1"
            />
          </div>
          <div>
            <Label>{tr('Title', 'Titre')}</Label>
            <Input className="mt-1" placeholder={tr('e.g. My Instagram', 'ex. : Mon Instagram')} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <Label>URL</Label>
            <Input className="mt-1" placeholder="https://..." value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
          </div>
          <div>
            <Label>{tr('Custom Emoji (optional)', 'Emoji personnalisé (facultatif)')}</Label>
            <Input className="mt-1" placeholder="🔥" maxLength={2} value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{tr('Cancel', 'Annuler')}</Button>
          <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">{tr('Save Link', 'Enregistrer le lien')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}