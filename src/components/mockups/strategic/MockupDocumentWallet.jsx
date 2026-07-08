import React from 'react';
import { PhoneFrame, Badge, SectionLabel } from '@/components/mockups/MockupFrame';
import { InfinityMark, BingooAppIcon } from '@/components/mockups/brand/InfinityMark';
import { Icon } from '@/components/mockups/BingooIcons';

const NAVY = '#0b2149', NAVY_DEEP = '#071A3D', ORANGE = '#f97316', BG = '#F7F9FC', BORDER = '#E5EAF2', INK = '#0F172A', MUTED = '#64748B', GREEN = '#22C55E', RED = '#EF4444', AMBER = '#f59e0b';

// ── Document Wallet Screen ──
// Owner-controlled identity & business document organization.
// MOCKUP ONLY — no real document upload, storage, encryption, or backend.
export function MockupDocumentWallet() {
  const stats = [
    { icon: 'layers', value: '12', label: 'Total Docs', color: NAVY },
    { icon: 'checkCircle', value: '8', label: 'Verified', color: GREEN },
    { icon: 'alert', value: '2', label: 'Expiring', color: AMBER },
    { icon: 'lock', value: '2', label: 'Expired', color: RED },
  ];

  const categories = [
    {
      name: 'Identity', icon: 'users', docs: [
        { name: 'Passport', type: 'Senegal Passport', status: 'verified', updated: '2 weeks ago' },
        { name: "Driver's License", type: 'NY State Class D', status: 'verified', updated: '1 month ago' },
        { name: 'National ID', type: 'CNI Senegal', status: 'expiring', updated: '3 months ago' },
      ]
    },
    {
      name: 'Business', icon: 'briefcase', docs: [
        { name: 'Business License', type: 'NY Dept of State', status: 'verified', updated: '5 days ago' },
        { name: 'Tax Registration', type: 'EIN Certificate', status: 'verified', updated: '1 week ago' },
        { name: 'Insurance Certificate', type: 'General Liability', status: 'expired', updated: '6 months ago' },
      ]
    },
    {
      name: 'Legal', icon: 'shield', docs: [
        { name: 'Partnership Agreement', type: 'Signed 2024', status: 'verified', updated: '2 months ago' },
        { name: 'Bar Certification', type: 'NY Bar Assoc.', status: 'verified', updated: '3 weeks ago' },
      ]
    },
    {
      name: 'Financial', icon: 'wallet', docs: [
        { name: 'Bank Statement', type: 'Chase Business', status: 'verified', updated: '4 days ago' },
        { name: 'Tax Return 2025', type: 'IRS Filing', status: 'expiring', updated: '1 month ago' },
      ]
    },
  ];

  const statusMap = {
    verified: { label: 'VERIFIED', color: GREEN },
    expiring: { label: 'EXPIRING', color: AMBER },
    expired: { label: 'EXPIRED', color: RED },
  };

  return (
    <PhoneFrame label="55 · Document Wallet">
      <div className="relative min-h-full pb-24 bg-[#F7F9FC]">
        {/* Header */}
        <div className="px-5 pt-10 pb-6 relative overflow-hidden" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-15" style={{ background: ORANGE, filter: 'blur(50px)' }} />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <BingooAppIcon size={32} glow={true} />
              <div>
                <p className="text-white/40 text-[9px] font-medium">Bingoo Connect</p>
                <p className="text-white font-black text-base">Document Wallet</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full" style={{ background: 'rgba(34,197,94,0.15)' }}>
              <Icon name="lock" size={12} color={GREEN} />
              <span className="text-[9px] font-bold text-green-300">OWNER-CONTROLLED</span>
            </div>
          </div>
          <p className="text-white/50 text-[10px] leading-relaxed relative z-10">Organize identity, business, legal & financial documents. Only you can access these — Bingoo Connect does not store copies.</p>
        </div>

        {/* Stats */}
        <div className="px-5 -mt-4 relative z-20 mb-5">
          <div className="grid grid-cols-4 gap-2">
            {stats.map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-[#E5EAF2] p-2.5 text-center" style={{ boxShadow: '0 2px 8px rgba(11,33,73,0.06)' }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-1" style={{ background: `${s.color}12` }}>
                  <Icon name={s.icon} size={14} color={s.color} />
                </div>
                <p className="text-base font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[8px] text-[#64748B] font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="px-5 space-y-5">
          {categories.map((cat) => (
            <div key={cat.name}>
              <SectionLabel>{cat.name}</SectionLabel>
              <div className="space-y-2">
                {cat.docs.map((doc) => {
                  const st = statusMap[doc.status];
                  return (
                    <div key={doc.name} className="bg-white rounded-xl border border-[#E5EAF2] p-3 flex items-center gap-3" style={{ boxShadow: '0 1px 4px rgba(11,33,73,0.04)' }}>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})`, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)' }}>
                        <div className="absolute top-0 right-0 w-4 h-4 rounded-full opacity-20" style={{ background: ORANGE, filter: 'blur(6px)' }} />
                        <Icon name={cat.icon} size={15} color={ORANGE} className="relative z-10" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[11px] text-[#0F172A] truncate">{doc.name}</p>
                        <p className="text-[9px] text-[#64748B] truncate">{doc.type}</p>
                        <p className="text-[8px] text-[#94A3B8] mt-0.5">Updated {doc.updated}</p>
                      </div>
                      <Badge color={st.color}>{st.label}</Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Add Button */}
        <div className="px-5 mt-5">
          <button className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-white font-bold text-xs" style={{ background: `linear-gradient(135deg, ${ORANGE}, #fb923c)`, boxShadow: `0 4px 12px ${ORANGE}33` }}>
            <Icon name="plus" size={16} color="#FFFFFF" />
            Add Document
          </button>
        </div>

        {/* Privacy Note */}
        <div className="px-5 mt-4">
          <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: `${NAVY}08`, border: `1px solid ${NAVY}15` }}>
            <Icon name="shield" size={14} color={NAVY} className="mt-0.5 shrink-0" />
            <p className="text-[9px] text-[#64748B] leading-relaxed">Mockup only. Document upload, encryption, and secure storage are not yet implemented. No real documents are processed or stored.</p>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── My Assets Screen ──
// Protected physical items connected to Bingoo devices, QR patches, NFC tags, and profiles.
// Includes pets, luggage, bags, keys, equipment, and future asset categories.
export function MockupMyAssets() {
  const stats = [
    { icon: 'package', value: '8', label: 'Total Assets', color: NAVY },
    { icon: 'shield', value: '6', label: 'Protected', color: GREEN },
    { icon: 'nfc', value: '5', label: 'Active Tags', color: ORANGE },
    { icon: 'alert', value: '1', label: 'Lost', color: RED },
  ];

  const categories = [
    {
      name: 'Pets', icon: 'star', items: [
        { name: 'Max — Golden Retriever', type: 'NFC Collar Tag', device: 'BG-000012', status: 'protected', lastSeen: 'Home — 2h ago', protection: 'Full' },
        { name: 'Luna — Persian Cat', type: 'NFC Collar Tag', device: 'BG-000018', status: 'protected', lastSeen: 'Home — 1h ago', protection: 'Full' },
      ]
    },
    {
      name: 'Travel', icon: 'package', items: [
        { name: 'Samsonite Suitcase', type: 'QR Luggage Tag', device: 'QR-0024', status: 'protected', lastSeen: 'JFK Airport — 3d ago', protection: 'Standard' },
        { name: 'Tumi Backpack', type: 'QR Patch', device: 'QR-0031', status: 'active', lastSeen: 'Office — 1d ago', protection: 'Standard' },
      ]
    },
    {
      name: 'Everyday', icon: 'briefcase', items: [
        { name: 'House Keys', type: 'NFC Keychain', device: 'BG-000003', status: 'protected', lastSeen: 'Home — 30m ago', protection: 'Basic' },
        { name: 'Leather Wallet', type: 'NFC Sticker', device: 'BG-000025', status: 'lost', lastSeen: 'Restaurant — 5h ago', protection: 'Lost Mode Active' },
      ]
    },
    {
      name: 'Equipment', icon: 'factory', items: [
        { name: 'Canon EOS R5', type: 'NFC Tag', device: 'BG-000033', status: 'protected', lastSeen: 'Studio — 2d ago', protection: 'Full' },
        { name: 'Trek Bicycle', type: 'NFC Frame Tag', device: 'BG-000040', status: 'active', lastSeen: 'Bike Rack — 4h ago', protection: 'Standard' },
      ]
    },
  ];

  const statusMap = {
    protected: { label: 'PROTECTED', color: GREEN },
    active: { label: 'ACTIVE', color: ORANGE },
    lost: { label: 'LOST', color: RED },
  };

  const futureCategories = ['Vehicles', 'Musical Instruments', 'Sports Gear', 'Electronics', 'Medical Devices', 'Tools'];

  return (
    <PhoneFrame label="56 · My Assets">
      <div className="relative min-h-full pb-24 bg-[#F7F9FC]">
        {/* Header */}
        <div className="px-5 pt-10 pb-6 relative overflow-hidden" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-15" style={{ background: ORANGE, filter: 'blur(50px)' }} />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <BingooAppIcon size={32} glow={true} />
              <div>
                <p className="text-white/40 text-[9px] font-medium">Bingoo Connect</p>
                <p className="text-white font-black text-base">My Assets</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full" style={{ background: 'rgba(249,115,22,0.15)' }}>
              <Icon name="shield" size={12} color={ORANGE} />
              <span className="text-[9px] font-bold text-orange-300">ASSET PROTECTION</span>
            </div>
          </div>
          <p className="text-white/50 text-[10px] leading-relaxed relative z-10">Track and protect physical items connected to Bingoo NFC devices, QR patches, and tags. If lost, finders can scan to contact you securely.</p>
        </div>

        {/* Stats */}
        <div className="px-5 -mt-4 relative z-20 mb-5">
          <div className="grid grid-cols-4 gap-2">
            {stats.map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-[#E5EAF2] p-2.5 text-center" style={{ boxShadow: '0 2px 8px rgba(11,33,73,0.06)' }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-1" style={{ background: `${s.color}12` }}>
                  <Icon name={s.icon} size={14} color={s.color} />
                </div>
                <p className="text-base font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[8px] text-[#64748B] font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Asset Categories */}
        <div className="px-5 space-y-5">
          {categories.map((cat) => (
            <div key={cat.name}>
              <SectionLabel>{cat.name}</SectionLabel>
              <div className="space-y-2">
                {cat.items.map((item) => {
                  const st = statusMap[item.status];
                  return (
                    <div key={item.name} className="bg-white rounded-xl border border-[#E5EAF2] p-3" style={{ boxShadow: '0 1px 4px rgba(11,33,73,0.04)' }}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})`, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)' }}>
                          <div className="absolute top-0 right-0 w-4 h-4 rounded-full opacity-20" style={{ background: ORANGE, filter: 'blur(6px)' }} />
                          <Icon name={cat.icon} size={15} color={ORANGE} className="relative z-10" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[11px] text-[#0F172A] truncate">{item.name}</p>
                          <p className="text-[9px] text-[#64748B]">{item.type} · {item.device}</p>
                        </div>
                        <Badge color={st.color}>{st.label}</Badge>
                      </div>
                      <div className="flex items-center justify-between pl-12">
                        <div className="flex items-center gap-1">
                          <Icon name="mapPin" size={10} color={MUTED} />
                          <span className="text-[8px] text-[#64748B]">{item.lastSeen}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Icon name="shield" size={10} color={item.protection === 'Full' ? GREEN : item.protection.includes('Lost') ? RED : ORANGE} />
                          <span className="text-[8px] font-bold" style={{ color: item.protection === 'Full' ? GREEN : item.protection.includes('Lost') ? RED : ORANGE }}>{item.protection}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Future Categories */}
          <div>
            <SectionLabel>Future Categories</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {futureCategories.map((fc) => (
                <div key={fc} className="px-3 py-1.5 rounded-lg flex items-center gap-1.5" style={{ background: `${NAVY}08`, border: `1px dashed ${NAVY}25` }}>
                  <Icon name="plus" size={10} color={NAVY} />
                  <span className="text-[9px] font-medium text-[#64748B]">{fc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Add Button */}
        <div className="px-5 mt-5">
          <button className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-white font-bold text-xs" style={{ background: `linear-gradient(135deg, ${ORANGE}, #fb923c)`, boxShadow: `0 4px 12px ${ORANGE}33` }}>
            <Icon name="plus" size={16} color="#FFFFFF" />
            Add Asset
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── Combined Showcase (for concept section) ──
export function DocumentWalletShowcase() {
  return (
    <div className="flex flex-wrap justify-center gap-8 py-4">
      <MockupDocumentWallet />
      <MockupMyAssets />
    </div>
  );
}

export default MockupDocumentWallet;