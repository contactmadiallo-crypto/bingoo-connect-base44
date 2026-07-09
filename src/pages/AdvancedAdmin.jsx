import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Shield, LayoutDashboard, Users, CreditCard, Package, Factory, Palette, HeadphonesIcon, MapPin, ScrollText, KeyRound, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminOverviewTab from '@/components/admin/AdminOverviewTab';
import AdminUsersEntitlementsTab from '@/components/admin/AdminUsersEntitlementsTab';
import AdminInventoryTab from '@/components/admin/AdminInventoryTab';
import AdminTicketsTab from '@/components/admin/AdminTicketsTab';
import AdminManufacturingTab from '@/components/admin/AdminManufacturingTab';
import AdminProductsTab from '@/components/admin/AdminProductsTab';
import AdminDesignApprovalsTab from '@/components/admin/AdminDesignApprovalsTab';
import AdminLostReportsTab from '@/components/admin/AdminLostReportsTab';
import AdminAuditLogTab from '@/components/admin/AdminAuditLogTab';
import AdminEntitlementsTab from '@/components/admin/AdminEntitlementsTab';
import { InfinityMark } from '@/components/mockups/brand/InfinityMark';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, component: AdminOverviewTab },
  { id: 'users', label: 'Users & Subscriptions', icon: Users, component: AdminUsersEntitlementsTab },
  { id: 'inventory', label: 'NFC Inventory', icon: Package, component: AdminInventoryTab },
  { id: 'manufacturing', label: 'Manufacturing', icon: Factory, component: AdminManufacturingTab },
  { id: 'products', label: 'Products', icon: CreditCard, component: AdminProductsTab },
  { id: 'designs', label: 'Design Approvals', icon: Palette, component: AdminDesignApprovalsTab },
  { id: 'support', label: 'Support', icon: HeadphonesIcon, component: AdminTicketsTab },
  { id: 'lost', label: 'Lost Reports', icon: MapPin, component: AdminLostReportsTab },
  { id: 'audit', label: 'Audit Log', icon: ScrollText, component: AdminAuditLogTab },
  { id: 'entitlements', label: 'Manual Entitlements', icon: KeyRound, component: AdminEntitlementsTab },
];

export default function AdvancedAdmin() {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const isAdmin = user?.role === 'admin';
  const currentTab = TABS.find(t => t.id === activeTab) || TABS[0];
  const TabComponent = currentTab.component;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center max-w-sm">
          <Shield className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Admin Access Required</h2>
          <p className="text-sm text-slate-500 mb-4">You need admin privileges to access this dashboard.</p>
          <Link to="/bingoo" className="inline-flex items-center gap-2 text-sm font-bold text-orange-600">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <InfinityMark className="w-8 h-8" />
              <div>
                <h1 className="text-base font-black text-slate-900 tracking-tight">Bingoo Connect</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Advanced Admin</p>
              </div>
            </div>
            <Link to="/admin" className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Legacy Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="sticky top-16 z-10 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <TabComponent activeTab={activeTab} />
      </main>
    </div>
  );
}