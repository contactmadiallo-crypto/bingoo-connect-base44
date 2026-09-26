import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { addToCart } from '@/lib/cartStore';
import { getDesignStudioProduct } from '@/lib/designStudioCatalog';
import { saveDraft } from '@/lib/draftStore';
import StudioHeader from '@/components/bingoo/designStudio/StudioHeader';
import DevicePicker from '@/components/bingoo/designStudio/DevicePicker';
import TemplatePicker from '@/components/bingoo/designStudio/TemplatePicker';
import CustomizePanel from '@/components/bingoo/designStudio/CustomizePanel';
import LivePreviewSection from '@/components/bingoo/designStudio/LivePreviewSection';
import TemplateLogoPreview from '@/components/bingoo/designStudio/TemplateLogoPreview';
import SummarySidebar from '@/components/bingoo/designStudio/SummarySidebar';
import { UNIT_PRICE, SETUP_FEE, REMOVE_BRANDING_FEE, SHIPPING, DEFAULT_PATTERN } from '@/components/bingoo/designStudio/studioConstants';
import { validateUpload } from '@/lib/nativePlatform';
import { useI18n } from '@/lib/I18nContext';
import { t } from '@/lib/i18n';

export default function DesignStudio({ _isDark }) {
  const { language } = useI18n();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [productType, setProductType] = useState('card');
  const [previewView, setPreviewView] = useState('front');
  const [customizeTab, setCustomizeTab] = useState('content');

  const [logoUrl, setLogoUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [cardColor, setCardColor] = useState('#F1F5F9');
  const [accentColor, setAccentColor] = useState('#D4A017');
  const [nameText, setNameText] = useState('');
  const [holderName, setHolderName] = useState('');
  const [roleText, setRoleText] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [tagline, setTagline] = useState('');
  const [showPhone, setShowPhone] = useState(true);
  const [showEmail, setShowEmail] = useState(true);
  const [showWebsite, setShowWebsite] = useState(true);

  const [finish, setFinish] = useState('Frosted');
  const [quantity, setQuantity] = useState(1);
  const [removeBranding, setRemoveBranding] = useState(false);
  const [brandPattern, setBrandPattern] = useState({ ...DEFAULT_PATTERN });
  const [activeTemplate, setActiveTemplate] = useState('modern');

  const [ordered, setOrdered] = useState(false);
  const [saved, setSaved] = useState(false);

  const productKeys = { card: 'ds_device_card', keychain: 'ds_device_key_fob', sticker: 'ds_device_sticker', bracelet: 'ds_device_bracelet', tag: 'ds_device_tag', stand: 'ds_device_table_stand', metal_card: 'ds_device_metal_card', wood_card: 'ds_device_wood_card' };
  const productLabel = t(productKeys[productType] || 'ds_device_card', language);
  const subtotal = UNIT_PRICE * quantity + SETUP_FEE + (removeBranding ? REMOVE_BRANDING_FEE : 0);
  const total = subtotal + SHIPPING;

  const previewProps = {
    productType, cardColor, accentColor, logoUrl, nameText, holderName, roleText,
    phone: showPhone ? phone : '', email: showEmail ? email : '', website: showWebsite ? website : '',
    tagline, removeBranding, finish, isDark: false, brandPattern, templateId: activeTemplate,
  };

  const handleUpload = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const uploadError = validateUpload(file, { imagesOnly: true, maxBytes: 10 * 1024 * 1024 });
    if (uploadError) { window.alert(uploadError); e.target.value = ''; return; }
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setLogoUrl(file_url);
    } catch (error) {
      console.error('Design Studio logo upload failed:', error);
      window.alert(error?.message || t('profile_upload_failed', language));
    } finally { setUploading(false); if (e.target) e.target.value = ''; }
  };

  const handleRemoveLogo = () => setLogoUrl(null);

  const handleSelectTemplate = (t) => {
    setActiveTemplate(t.id);
    setCardColor(t.cardColor);
    setAccentColor(t.accentColor);
    setFinish(t.finish);
    setBrandPattern(t.pattern || { ...DEFAULT_PATTERN });
  };

  const handleSave = () => {
    saveDraft({
      productType, cardColor, accentColor, nameText, holderName, roleText, phone, email, website, tagline,
      showPhone, showEmail, showWebsite, finish, quantity, logoUrl, removeBranding, brandPattern,
      activeTemplate,
      name: `${nameText || t("ds_untitled", language)} — ${productLabel}`,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1400);
  };

  const handleAdd = () => {
    const p = getDesignStudioProduct(productType, 'business');
    addToCart({ ...p }, quantity, {
      productType, cardColor, accentColor, nameText, holderName, roleText, phone, email, website, tagline,
      showPhone, showEmail, showWebsite, finish, quantity, logoUrl, removeBranding, brandPattern,
      activeTemplate,
      designMode: 'business', designStore: true,
    });
    setOrdered(true);
    setTimeout(() => navigate('/cart'), 800);
  };

  return (
    <div className="bg-[#f7f9fc] text-slate-900 rounded-2xl overflow-hidden border border-slate-200">
      <StudioHeader />
      <div className="grid 2xl:grid-cols-[370px_minmax(0,1fr)_310px] xl:grid-cols-[340px_minmax(0,1fr)_300px] gap-3 p-3 items-start">
        <div className="space-y-3 min-w-0">
          <DevicePicker productType={productType} setProductType={setProductType} />
          <TemplatePicker activeTemplate={activeTemplate} onSelect={handleSelectTemplate} previewProps={previewProps} />
          <CustomizePanel
            tab={customizeTab} setTab={setCustomizeTab}
            holderName={holderName} setHolderName={setHolderName}
            roleText={roleText} setRoleText={setRoleText}
            nameText={nameText} setNameText={setNameText}
            phone={phone} setPhone={setPhone} email={email} setEmail={setEmail}
            website={website} setWebsite={setWebsite} tagline={tagline} setTagline={setTagline}
            showPhone={showPhone} setShowPhone={setShowPhone}
            showEmail={showEmail} setShowEmail={setShowEmail}
            showWebsite={showWebsite} setShowWebsite={setShowWebsite}
            logoUrl={logoUrl} uploading={uploading} onUpload={handleUpload} fileInputRef={fileInputRef}
            onRemoveLogo={handleRemoveLogo}
            cardColor={cardColor} setCardColor={setCardColor}
            accentColor={accentColor} setAccentColor={setAccentColor}
            finish={finish} setFinish={setFinish}
            removeBranding={removeBranding} setRemoveBranding={setRemoveBranding}
          />
        </div>
        <div className="space-y-3 min-w-0">
          <LivePreviewSection
            previewProps={previewProps}
            previewView={previewView} setPreviewView={setPreviewView}
          />
          <TemplateLogoPreview
            previewProps={previewProps}
            activeTemplate={activeTemplate}
            onSelect={handleSelectTemplate}
          />
        </div>
        <SummarySidebar
          previewProps={previewProps} productLabel={productLabel}
          finish={finish} setFinish={setFinish} cardColor={cardColor} accentColor={accentColor}
          quantity={quantity} setQuantity={setQuantity} removeBranding={removeBranding}
          subtotal={subtotal} total={total} onAdd={handleAdd} onSave={handleSave}
          ordered={ordered} saved={saved}
        />
      </div>
    </div>
  );
}