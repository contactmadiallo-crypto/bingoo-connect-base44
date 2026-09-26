import { useMemo, useRef, useState } from 'react';
import { X, Download, FileArchive, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductPreview } from '@/components/bingoo/designStudio/ProductPreview';
import { useI18n } from '@/lib/I18nContext';
import { t } from '@/lib/i18n';

const DIMENSIONS = {
  card: '85.60 × 53.98 mm',
  keychain: 'Manufacturer template / selected model',
  sticker: 'Manufacturer template / selected model',
  bracelet: 'Manufacturer template / selected model',
  tag: 'Manufacturer template / selected model',
  stand: 'Manufacturer template / selected model',
};

function getDesign(order) {
  const item = (order.items || []).find(i => i.customDesign) || order.items?.[0] || {};
  const manufacturing = (order.manufacturing_items || [])[0] || {};
  return { item, manufacturing, design: item.customDesign || manufacturing.design_data || {} };
}

function csvEscape(v) { return `"${String(v ?? '').replaceAll('"', '""')}"`; }

export default function ProductionProofModal({ order, onClose }) {
  const { language } = useI18n();
  const proofRef = useRef(null);
  const [exporting, setExporting] = useState('');
  const { item, manufacturing, design } = useMemo(() => getDesign(order), [order]);
  const codes = order.assigned_device_codes || manufacturing.activation_codes?.map(x => x.code).filter(Boolean) || [];
  const productType = design.productType || manufacturing.product_type || 'card';
  const previewProps = {
    productType,
    cardColor: design.cardColor || manufacturing.card_color || '#0b2149',
    accentColor: design.accentColor || manufacturing.accent_color || '#f97316',
    logoUrl: design.logoUrl || manufacturing.logo_url || '',
    nameText: design.nameText || manufacturing.company_name || '',
    holderName: design.holderName || manufacturing.holder_name || '',
    roleText: design.roleText || manufacturing.role_position || '',
    phone: design.phone || manufacturing.phone || '',
    email: design.email || manufacturing.email || '',
    website: design.website || manufacturing.website || '',
    finish: design.finish || manufacturing.finish || 'matte',
    removeBranding: Boolean(design.removeBranding ?? manufacturing.remove_branding),
    brandPattern: design.brandPattern || manufacturing.brand_pattern || null,
    isDark: false,
    activationCode: codes[0] || 'BG-######',
  };

  const capture = async () => {
    const html2canvas = (await import('html2canvas')).default;
    return html2canvas(proofRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
  };

  const downloadProof = async () => {
    setExporting('pdf');
    try {
      const canvas = await capture();
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const img = canvas.toDataURL('image/png');
      const width = 190;
      const height = canvas.height * width / canvas.width;
      let y = 10;
      let remaining = height;
      while (remaining > 0) {
        pdf.addImage(img, 'PNG', 10, y, width, height);
        remaining -= 277;
        if (remaining > 0) { pdf.addPage(); y -= 277; }
      }
      pdf.save(`${order.order_number || 'bingoo'}-production-proof.pdf`);
    } finally { setExporting(''); }
  };

  const downloadPackage = async () => {
    setExporting('zip');
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const canvas = await capture();
      const png = canvas.toDataURL('image/png').split(',')[1];
      const folder = zip.folder(order.order_number || 'bingoo-production');
      folder.file('production-proof.png', png, { base64: true });
      const snapshot = {
        order_number: order.order_number,
        customer: { name: order.customer_name, email: order.customer_email },
        product: { sku: item.product_id || manufacturing.product_sku, name: item.product_name || manufacturing.product_name, type: productType, quantity: item.quantity || manufacturing.quantity || 1 },
        specifications: { dimensions: DIMENSIONS[productType], finish: previewProps.finish, base_color: previewProps.cardColor, accent_color: previewProps.accentColor, remove_bingoo_branding: previewProps.removeBranding },
        design,
        nfc_device_codes: codes,
        generated_at: new Date().toISOString(),
      };
      folder.file('production-specifications.json', JSON.stringify(snapshot, null, 2));
      const csv = ['device_code,permanent_url,order_number,product_sku', ...codes.map(code => [code, `https://bingooconnect.com/d/${code}`, order.order_number || '', item.product_id || manufacturing.product_sku || ''].map(csvEscape).join(','))].join('\n');
      folder.file('nfc-programming.csv', csv);
      folder.file('MANUFACTURER-README.txt', `BINGOO CONNECT — MANUFACTURER PACKAGE\nOrder: ${order.order_number || ''}\nProduct: ${item.product_name || manufacturing.product_name || 'Custom NFC Device'}\nQuantity: ${item.quantity || manufacturing.quantity || 1}\nDevice type: ${productType}\nDimensions: ${DIMENSIONS[productType]}\nFinish: ${previewProps.finish}\nBase color: ${previewProps.cardColor}\nAccent color: ${previewProps.accentColor}\nBingoo branding: ${previewProps.removeBranding ? 'REMOVED by customer selection' : 'INCLUDED'}\n\nIMPORTANT: NFC chips must be programmed only with the permanent URLs in nfc-programming.csv. Do not program activation URLs.\n\nproduction-proof.png is the frozen visual proof for this order. production-specifications.json contains the frozen customer design configuration.`);
      if (previewProps.logoUrl) folder.file('original-logo-url.txt', previewProps.logoUrl);
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `${order.order_number || 'bingoo'}-manufacturer-package.zip`; a.click(); URL.revokeObjectURL(url);
    } finally { setExporting(''); }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm overflow-y-auto p-4 md:p-8">
      <div className="max-w-6xl mx-auto rounded-3xl bg-[#081b3d] border border-white/15 shadow-2xl overflow-hidden">
        <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-[#081b3d]/95 backdrop-blur border-b border-white/10">
          <div><p className="text-[10px] tracking-[.22em] font-black text-orange-400">{t("proof_header",language)}</p><h2 className="text-xl font-black text-white">{t("proof_title",language)} · {order.order_number}</h2></div>
          <div className="flex flex-wrap gap-2"><Button onClick={downloadProof} disabled={!!exporting} variant="outline" className="bg-white/5 border-white/15 text-white"><Download className="w-4 h-4 mr-2" />{exporting === "pdf" ? t("proof_generating",language) : t("proof_pdf",language)}</Button><Button onClick={downloadPackage} disabled={!!exporting} className="bg-orange-500 hover:bg-orange-600"><FileArchive className="w-4 h-4 mr-2" />{exporting === "zip" ? t("proof_packaging",language) : t("proof_package",language)}</Button><button onClick={onClose} className="p-2 text-white/60 hover:text-white"><X /></button></div>
        </div>

        <div ref={proofRef} className="bg-white text-[#0b2149] p-6 md:p-10">
          <div className="flex justify-between gap-6 border-b border-slate-200 pb-5 mb-7"><div><p className="text-xs font-black tracking-[.2em] text-orange-600">BINGOO CONNECT</p><h1 className="text-3xl font-black mt-1">{t("proof_title",language)}</h1><p className="text-sm text-slate-500 mt-1">{t("proof_reference",language)}</p></div><div className="text-right text-sm"><p className="font-mono font-black">{order.order_number}</p><p className="text-slate-500">{order.customer_name}</p><p className="text-slate-500">{t("proof_qty",language)} {item.quantity || manufacturing.quantity || 1}</p></div></div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div><p className="text-xs font-black tracking-widest text-slate-400 mb-3">{t("proof_front",language)}</p><div className="rounded-3xl bg-slate-50 border border-slate-200 min-h-[330px] flex items-center justify-center overflow-hidden"><ProductPreview {...previewProps} side="front" /></div></div>
            <div><p className="text-xs font-black tracking-widest text-slate-400 mb-3">{t("proof_back",language)}</p><div className="rounded-3xl bg-slate-50 border border-slate-200 min-h-[330px] flex items-center justify-center overflow-hidden"><ProductPreview {...previewProps} side="back" /></div></div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-8">
            {[[t("proof_product",language), item.product_name || manufacturing.product_name || `${t("proof_custom_device",language)} ${productType}`], [t("proof_dimensions",language), DIMENSIONS[productType] || t("proof_manufacturer_template",language)], [t("proof_finish",language), previewProps.finish], [t("proof_base_color",language), previewProps.cardColor], [t("proof_accent_color",language), previewProps.accentColor], [t("proof_branding",language), previewProps.removeBranding ? t("proof_removed",language) : t("proof_included",language)], [t("proof_design_name",language), previewProps.nameText || "—"], [t("proof_holder",language), previewProps.holderName || "—"], [t("proof_role",language), previewProps.roleText || "—"]].map(([label,value]) => <div key={label} className="rounded-xl border border-slate-200 p-3"><p className="text-[10px] uppercase tracking-widest font-black text-slate-400">{label}</p><p className="font-bold mt-1 break-words">{value}</p></div>)}
          </div>

          {previewProps.logoUrl && <div className="mt-6 rounded-2xl border border-slate-200 p-4 flex items-center gap-4"><img src={previewProps.logoUrl} alt={t("proof_customer_logo",language)} className="w-16 h-16 object-contain rounded-xl border border-slate-200" /><div><p className="text-[10px] tracking-widest font-black text-slate-400">{t("proof_original_logo",language)}</p><p className="text-xs text-slate-500 break-all mt-1">{previewProps.logoUrl}</p></div></div>}

          <div className="mt-7 rounded-2xl bg-[#0b2149] text-white p-5"><div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-orange-400" /><p className="font-black">{t("proof_allocated_programming",language)}</p></div><p className="text-xs text-white/60 mt-1">{t("proof_program_copy",language)}</p><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-4">{codes.length ? codes.map(code => <div key={code} className="rounded-lg bg-white/10 px-3 py-2 font-mono text-sm"><strong className="text-orange-300">{code}</strong><div className="text-[10px] text-white/55 break-all">bingooconnect.com/d/{code}</div></div>) : <p className="text-sm text-white/60">{t("proof_codes_after_payment",language)}</p>}</div></div>

          <div className="mt-5 text-[10px] text-slate-400">{t("proof_warning",language)}</div>
        </div>
      </div>
    </div>
  );
}
