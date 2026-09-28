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
      <DialogContent className="w-[calc(100vw-20px)] max-w-md max-h-[calc(100dvh-88px)] sm:max-h-[85vh] !p-0 !gap-0 overflow-hidden !flex !flex-col">
        <DialogHeader className="px-4 py-3 flex-shrink-0 border-b border-slate-100 sticky top-0 z-20 bg-white">
          <div className="flex items-center justify-between gap-3 pr-7">
            <DialogTitle className="text-left">{initial ? tr('Edit Link', 'Modifier le lien') : tr('Add Link', 'Ajouter un lien')}</DialogTitle>
            <Button onClick={handleSave} disabled={!form.title || !form.url} className="sm:hidden min-h-[40px] px-4 rounded-xl font-black text-white disabled:opacity-40 flex-shrink-0" style={{ background: "#f97316" }}>
              {tr('Save', 'Enregistrer')}
            </Button>
          </div>
        </DialogHeader>
        <div className="space-y-4 px-4 py-4 overflow-y-auto flex-1 min-h-0 overscroll-contain" style={{ WebkitOverflowScrolling: "touch" }}>
          <div>
            <Label>{tr('Type', 'Type')}</Label>
            <MobileSelect
              value={form.type}
              onValueChange={v => setForm({ ...form, type: v })}
              options={linkTypes.map(item => ({ value: item.value, label: item.icon + ' ' + (language === 'fr' ? ({ website:'Site web', whatsapp:'WhatsApp', instagram:'Instagram', tiktok:'TikTok', youtube:'YouTube', twitter:'Twitter / X', linkedin:'LinkedIn', email:'E-mail', phone:'Téléphone', other:'Autre' }[item.value] || item.label) : item.label) }))}
              ariaLabel={tr('Link type', 'Type de lien')}
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
        <DialogFooter className="hidden sm:flex flex-shrink-0 px-3 py-3 border-t border-slate-200 bg-white/95 backdrop-blur-xl sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="min-h-[42px] rounded-xl font-bold">{tr('Cancel', 'Annuler')}</Button>
          <Button onClick={handleSave} disabled={!form.title || !form.url} className="min-h-[42px] rounded-xl font-black text-white disabled:opacity-40" style={{ background: "#f97316" }}>{tr('Save Link', 'Enregistrer le lien')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}